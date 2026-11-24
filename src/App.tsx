import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { IDS, NAMES, play } from './engine.ts';
import type { Custom, Player } from './engine.ts';
import { SCENARIOS, census, kaleidoscope, moments, neighbours, payoffs, scenario, scores, share, step, toughest, withCustom } from './evolution.ts';
import type { Payoffs, Scenario, World } from './evolution.ts';
import { COLORS, PLAIN, Piece, YOURS, describe, isNice, twin } from './Pieces.tsx';
import { Opening, Rules } from './Story.tsx';
import type { Example } from './Story.tsx';
import { sound } from './sound.ts';

const BASE = payoffs('curiosity');
const LIMIT = 1000, GLOW = 700, STORM: [number, number] = [.05, .05];
const INK = '#10173a', YELLOW = '#ffd23a';
const ALL = [...NAMES, YOURS], KINDS = ALL.map((_, s) => s);
// Kaleidoscope colours after Nowak & May: still cooperating, still defecting, just turned D, just turned C.
const KALEIDO = ['#17b0a3', '#e5383b', '#ffc23d', '#8ccf4d'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
type Tool = number | 'storm' | 'calm' | 'inspect';
type View = 'opening' | 'rules' | 'board';
interface Ghost { from: number; counts: number[][] }
const viewOf = (): View => location.hash === '#rules' ? 'rules' : location.hash === '#board' ? 'board' : 'opening';
// Returning visitors skip the story on this device; private browsing just shows it again.
const seen = {
  get: () => { try { return localStorage.getItem('gt-seen-rules') === '1'; } catch { return false; } },
  set: () => { try { localStorage.setItem('gt-seen-rules', '1'); } catch { /* storage blocked */ } },
};

const PATHS = {
  play: 'M7 4l13 8-13 8z', pause: 'M6 4h4v16H6zM14 4h4v16h-4z', step: 'M5 4l11 8-11 8zM17 4h3v16h-3z',
  reset: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5', rules: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  storm: 'M7 15a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1 0 7zM9 18l-1 3M13 18l-1 3M17 18l-1 3',
  calm: 'M12 7a5 5 0 1 1 0 10a5 5 0 1 1 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  inspect: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13zM15.5 15.5L20 20', brush: 'M12 5a7 7 0 1 1 0 14a7 7 0 1 1 0-14z', close: 'M5 5l14 14M19 5L5 19',
  soundOn: 'M4 9h4l5-4v14l-5-4H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11', soundOff: 'M4 9h4l5-4v14l-5-4H4zM16 9.5l5 5M21 9.5l-5 5',
};
const FILLED = new Set(['play', 'pause', 'step']);
const Icon = ({ name }: { name: keyof typeof PATHS }) => <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
  {...(FILLED.has(name) ? { fill: 'currentColor' } : { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })}><path d={PATHS[name]} /></svg>;

// square[s]: kinds that defect first draw as squares. kaleido: which kinds cooperate in the one-shot game, or null on the standard board.
function drawWorld(ctx: CanvasRenderingContext2D, px: number, w: World, prev: World | undefined, score: Float64Array, glow: number, t: number, focus: number | null, square: boolean[], kaleido: ((s: number) => boolean) | null) {
  const cells = w.cells.length, n = Math.sqrt(cells), c = px / n, g = Math.max(.5, c * .11), side = c - 2 * g;
  const shape = (p: Path2D | CanvasRenderingContext2D, i: number, k = 1) => {
    const s = side * k, x = (i % n) * c + (c - s) / 2, y = Math.floor(i / n) * c + (c - s) / 2;
    if (square[w.cells[i]]) p.roundRect(x, y, s, s, c * .1); else { p.moveTo(x + s, y + s / 2); p.arc(x + s / 2, y + s / 2, s / 2, 0, 2 * Math.PI); }
  };
  ctx.clearRect(0, 0, px, px);
  for (let i = 0; i < cells; i++) {
    const changed = !!prev && prev.cells[i] !== w.cells[i];
    if (kaleido) {
      const now = kaleido(w.cells[i]), was = prev ? kaleido(prev.cells[i]) : now;
      ctx.globalAlpha = 1; ctx.fillStyle = KALEIDO[now ? (was ? 0 : 3) : (was ? 2 : 1)];
    } else {
      ctx.globalAlpha = .3 + .7 * Math.min(1, score[i] / 3); // dim = struggling, full = thriving
      ctx.fillStyle = COLORS[w.cells[i]];
    }
    ctx.beginPath(); shape(ctx, i, changed && glow > 0 ? 1 + .4 * glow : 1); ctx.fill(); // converts pop as they land
  }
  ctx.globalAlpha = 1;
  if (c / devicePixelRatio >= 7) {
    const e = Math.max(1, c * .1), eyes = new Path2D();
    for (let i = 0; i < cells; i++) {
      const x = (i % n) * c, y = Math.floor(i / n) * c + c * .38;
      eyes.rect(x + c * .35 - e / 2, y, e, e * 1.3); eyes.rect(x + c * .65 - e / 2, y, e, e * 1.3);
    }
    ctx.fillStyle = INK; ctx.fill(eyes);
  }
  const rain = new Path2D(), edge = new Path2D();
  const calmAt = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n && !w.storm[y * n + x];
  ctx.fillStyle = 'rgba(35, 64, 196, .1)';
  for (let i = 0; i < cells; i++) if (w.storm[i]) {
    const cx = i % n, cy = Math.floor(i / n), x = cx * c, y = cy * c, p = ((reduced ? 0 : t / 650) + i * .618) % 1;
    ctx.fillRect(x, y, c, c);
    rain.moveTo(x + c * (.85 - p * .3), y + c * p * .6); rain.lineTo(x + c * (.72 - p * .3), y + c * (p * .6 + .4));
    // Outline storm areas where they meet calm cells (screen edges only, no wrap), so the weather has a visible border.
    if (calmAt(cx - 1, cy)) { edge.moveTo(x, y); edge.lineTo(x, y + c); }
    if (calmAt(cx + 1, cy)) { edge.moveTo(x + c, y); edge.lineTo(x + c, y + c); }
    if (calmAt(cx, cy - 1)) { edge.moveTo(x, y); edge.lineTo(x + c, y); }
    if (calmAt(cx, cy + 1)) { edge.moveTo(x, y + c); edge.lineTo(x + c, y + c); }
  }
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(35, 64, 196, .6)'; ctx.lineWidth = Math.max(1, c * .09); ctx.stroke(rain);
  ctx.strokeStyle = INK; ctx.lineWidth = Math.max(1.5, c * .12); ctx.setLineDash([c * .5, c * .3]); ctx.stroke(edge); ctx.setLineDash([]);
  if (glow > 0 && prev && !kaleido) {
    const ring = new Path2D();
    for (let i = 0; i < cells; i++) if (prev.cells[i] !== w.cells[i]) shape(ring, i, 1 + .4 * glow);
    ctx.strokeStyle = `rgba(35, 64, 196, ${glow * .9})`; ctx.lineWidth = Math.max(1, c * .14); ctx.stroke(ring);
  }
  if (focus !== null) {
    const x = (focus % n) * c, y = Math.floor(focus / n) * c;
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, c * .16); ctx.strokeRect(x, y, c, c);
    ctx.setLineDash([c * .3, c * .2]); ctx.lineWidth = Math.max(1, c * .08); ctx.strokeRect(x - c, y - c, 3 * c, 3 * c); ctx.setLineDash([]);
  }
}

function drawTrack(ctx: CanvasRenderingContext2D, w: number, h: number, counts: number[][], ghost: Ghost | null, gen: number, total: number) {
  const n = Math.max(100, counts.length, ghost ? ghost.from + ghost.counts.length : 0);
  const X = (k: number) => k / (n - 1) * w, Y = (v: number) => h - v / total * h;
  const layers = (rows: number[][], from: number, alpha: number) => {
    ctx.globalAlpha = alpha;
    for (let s = 0; s < KINDS.length; s++) {
      const area = new Path2D();
      rows.forEach((row, k) => { const top = row.slice(0, s + 1).reduce((a, b) => a + b, 0); if (k) area.lineTo(X(from + k), Y(top)); else area.moveTo(X(from), Y(top)); });
      for (let k = rows.length - 1; k >= 0; k--) area.lineTo(X(from + k), Y(rows[k].slice(0, s).reduce((a, b) => a + b, 0)));
      ctx.fillStyle = COLORS[s]; ctx.fill(area);
    }
    ctx.globalAlpha = 1;
  };
  ctx.clearRect(0, 0, w, h);
  if (ghost) layers(ghost.counts, ghost.from, .25);
  layers(counts, 0, 1);
  const d = devicePixelRatio, r = 10 * d, x = Math.min(w - r - 2 * d, Math.max(r + 2 * d, X(gen)));
  ctx.fillStyle = INK; ctx.fillRect(Math.min(w - 2 * d, X(gen)), 0, 2 * d, h);
  ctx.beginPath(); ctx.arc(x, h / 2, r, 0, 2 * Math.PI); ctx.fillStyle = YELLOW; ctx.fill();
  ctx.lineWidth = 3 * d; ctx.strokeStyle = INK; ctx.stroke();
}

// A real neighbourhood whose centre changes next turn, for the live rules cards.
function findExample(w: World, score: Float64Array, m: Payoffs, turn: number): Example | null {
  const near = neighbours(Math.sqrt(w.cells.length));
  for (let i = 0; i < w.cells.length; i++) {
    const hood = Array.from(near.subarray(i * 8, i * 8 + 8)), best = hood.reduce((a, b) => (score[b] > score[a] ? b : a));
    if (score[best] <= score[i] + 1e-9 || w.cells[best] === w.cells[i]) continue;
    const ids = [...hood.slice(0, 4), i, ...hood.slice(4)], earn = (j: number) => (w.storm[i] || w.storm[j] ? m.storm : m.calm)[w.cells[i]][w.cells[j]];
    return { turn, kinds: ids.map(j => w.cells[j]), scores: ids.map(j => score[j]), earn: ids.map(earn), best: ids.indexOf(best) };
  }
  return null;
}

function PieceCard({ i, w, score, m, custom, temptation, kaleido, onClose }: { i: number; w: World; score: Float64Array; m: Payoffs; custom: Custom; temptation: number; kaleido: boolean; onClose: () => void }) {
  const near = Array.from(neighbours(Math.sqrt(w.cells.length)).subarray(i * 8, i * 8 + 8));
  const rival = near.reduce((a, b) => (score[b] > score[a] ? b : a));
  const foe = toughest(w, m, score, i);
  const s = w.cells[i], o = w.cells[rival], f = w.cells[foe], stormy = !!(w.storm[i] || w.storm[foe]);
  const next = score[rival] > score[i] + 1e-9 ? o : s;
  const player = (k: number): Player => (k === 6 ? custom : IDS[k]);
  const trace = kaleido ? [] : play(player(s), player(f), 12, `look|${i}|${foe}`, stormy ? STORM : [0, 0], .1, true).trace;
  const slipped = (p: 0 | 1, k: number) => trace[k].actual[p] !== trace[k].intended[p];
  const anySlip = trace.some((_, k) => slipped(0, k) || slipped(1, k));
  const row = (p: 0 | 1) => trace.map((r, k) => <i key={k} className={`${r.actual[p] ? 'd' : 'c'}${slipped(p, k) ? ' slip' : ''}`}>{r.actual[p] ? 'D' : 'C'}</i>);
  const said = (p: 0 | 1) => trace.map((r, k) => `${r.actual[p] ? 'D' : 'C'}${slipped(p, k) ? ' (slip)' : ''}`).join(', ');
  return <section className="piece-card" aria-labelledby="pc-name">
    <header>
      <Piece s={s} size={56} />
      <div><h2 id="pc-name">{ALL[s]}</h2><p>{s === 6 ? describe(custom) : PLAIN[s]}</p></div>
      <button className="close" onClick={onClose} aria-label="Close piece card"><Icon name="close" /></button>
    </header>
    <div className="stats">
      <p><b className="num">{score[i].toFixed(2)}</b><span>{kaleido ? 'points this turn' : `points a round · ${w.storm[i] ? 'in the storm' : 'calm'}`}</span></p>
      <p><b className="num">{score[rival].toFixed(2)}</b><span>best nearby: {ALL[o]}</span></p>
    </div>
    {kaleido ? <p className="hint">Kaleidoscope is a one-shot game: a cooperator earns 1 for each cooperating neighbour, itself included; a defector earns {temptation.toFixed(2)}. Here only the first move counts.</p> : <>
      <p className="duel-title">First 12 rounds against its toughest neighbour, {ALL[f]}</p>
      <div className="duel" role="img" aria-label={`This one: ${said(0)}. Neighbour: ${said(1)}.`}>
        <span>This one</span>{row(0)}<span>Neighbour</span>{row(1)}
      </div>
      {anySlip && <p className="hint">Dashed squares are slips: it meant the other move.</p>}
      {!stormy && trace.every(r => !r.actual[0] && !r.actual[1]) && <p className="hint">Neither ever defects first, so in calm weather they cooperate every round.</p>}
    </>}
    <p className="next" style={{ background: next === s ? undefined : `color-mix(in srgb, ${COLORS[next]} 30%, #f5f7ff)` }}>Next turn: {next === s ? `stays ${ALL[s]}` : `becomes ${ALL[next]}`}</p>
  </section>;
}

export default function App() {
  const sim = useRef({ hist: [] as World[], counts: [] as number[][], gen: 0, ghost: null as Ghost | null, focus: null as number | null, seed: 0, changedAt: 0, dirty: true, touched: false }).current;
  if (!sim.hist.length) { const w = scenario('apple', '0'); sim.hist.push(w); sim.counts.push(census(w.cells)); }
  const [, render] = useReducer((x: number) => x + 1, 0);
  const [view, setView] = useState<View>(() => { if (!location.hash && seen.get()) history.replaceState(null, '', '#board'); return viewOf(); });
  const [kind, setKind] = useState<Scenario>('apple');
  const [size, setSize] = useState(48);
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(6);
  const [mutation, setMutation] = useState(.001);
  const [tool, setTool] = useState<Tool>(1);
  const [wide, setWide] = useState(false);
  const [custom, setCustom] = useState<Custom>({ first: 1, afterC: 0, afterD: 1, forgives: false });
  const [temptation, setTemptation] = useState(1.85);
  const [soundOn, setSoundOn] = useState(sound.on);
  const kaleido = kind === 'kaleido';
  const cooperates = useCallback((s: number) => (s === 6 ? custom.first === 0 : s !== 1), [custom]);
  const tables = useMemo(() => kaleido ? kaleidoscope(temptation, cooperates) : withCustom(BASE, custom, 'curiosity'), [kaleido, temptation, cooperates, custom]);
  const square = useMemo(() => KINDS.map(s => (s === 6 ? !isNice(custom) : s === 1)), [custom]);
  const worldRef = useRef<HTMLCanvasElement>(null), trackRef = useRef<HTMLCanvasElement>(null), viewRef = useRef<HTMLDivElement>(null);
  const tap = useRef<[number, number] | null>(null); // touch paints on tap so swipes still scroll the page
  const live = useRef({ tables, square, kaleido, cooperates }); live.current = { tables, square, kaleido, cooperates };
  const scoreCache = useRef<{ w?: World; t?: Payoffs; s: Float64Array }>({ s: new Float64Array(0) }).current;
  const scoreOf = (w: World) => {
    const { tables: t, kaleido: k } = live.current;
    if (scoreCache.w !== w || scoreCache.t !== t) { scoreCache.w = w; scoreCache.t = t; scoreCache.s = scores(w, t, k); }
    return scoreCache.s;
  };

  const go = useCallback((g: number) => { sim.gen = g; sim.changedAt = performance.now(); sim.dirty = true; render(); }, [sim]);
  const advance = useCallback(() => {
    const g = sim.gen, h = sim.hist;
    if (g === h.length - 1) {
      if (h.length > LIMIT) return setPlaying(false);
      const { tables: t, kaleido: k } = live.current;
      h.push(step(h[g], t, k ? 0 : mutation, `${sim.seed}|${g}`, k)); sim.counts.push(census(h[g + 1].cells));
    }
    go(g + 1);
  }, [sim, mutation, go]);
  const reset = (k: Scenario, n = size) => {
    const w = scenario(k, `${++sim.seed}`, n);
    Object.assign(sim, { hist: [w], counts: [census(w.cells)], ghost: null, focus: null, touched: false });
    setKind(k); setSize(n); setPlaying(!reduced); go(0);
  };
  const closeCard = () => { sim.focus = null; sim.dirty = true; render(); };
  const home = (e: MouseEvent) => { e.preventDefault(); history.pushState(null, '', location.pathname + location.search); setView('opening'); };
  useEffect(() => { sim.dirty = true; }, [tables, square, sim]);

  useEffect(() => {
    const sync = () => setView(viewOf());
    addEventListener('popstate', sync); addEventListener('hashchange', sync);
    return () => { removeEventListener('popstate', sync); removeEventListener('hashchange', sync); };
  }, []);
  const firstView = useRef(true);
  useEffect(() => {
    document.title = view === 'opening' ? 'Who inherits the world?' : `${view === 'rules' ? 'The rules' : 'The board'} · Who inherits the world?`;
    if (view === 'board') { seen.set(); sim.dirty = true; }
    if (firstView.current) { firstView.current = false; return; }
    scrollTo(0, 0); viewRef.current?.focus({ preventScroll: true });
  }, [view, sim]);

  useEffect(() => {
    if (!playing || view !== 'board') return;
    let last = performance.now(), due = 0, id = 0;
    const tick = (now: number) => { due = Math.min(3, due + (now - last) * speed / 1000); last = now; for (; due >= 1; due--) advance(); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, speed, advance, view]);

  useEffect(() => {
    let id = 0;
    const frame = (t: number) => {
      const w = sim.hist[sim.gen], glow = reduced ? 0 : Math.max(0, 1 - (t - sim.changedAt) / GLOW);
      const stormy = !reduced && w.storm.includes(1), { square: sq, kaleido: k, cooperates: co } = live.current;
      for (const canvas of [worldRef.current, trackRef.current]) if (canvas) {
        const width = Math.round(canvas.clientWidth * devicePixelRatio), height = Math.round(canvas.clientHeight * devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; sim.dirty = true; }
      }
      if (worldRef.current && (sim.dirty || glow > 0 || stormy)) drawWorld(worldRef.current.getContext('2d')!, worldRef.current.width, w, sim.hist[sim.gen - 1], scoreOf(w), glow, t, sim.focus, sq, k ? co : null);
      if (trackRef.current && sim.dirty) drawTrack(trackRef.current.getContext('2d')!, trackRef.current.width, trackRef.current.height, sim.counts, sim.ghost, sim.gen, w.cells.length);
      sim.dirty = false;
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [sim]);

  useEffect(() => {
    if (view !== 'board') return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sim.focus !== null) { sim.focus = null; sim.dirty = true; render(); return; }
      if (e.altKey || e.ctrlKey || e.metaKey || (e.target as HTMLElement).closest('input, button, a, select, textarea')) return;
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setPlaying(false); advance(); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [view, advance, sim]);

  const w = sim.hist[sim.gen], total = w.cells.length, stormy = w.storm.includes(1);
  useEffect(() => { sound.rain(soundOn && view === 'board' && playing && stormy); }, [soundOn, view, playing, stormy]);
  useEffect(() => () => sound.rain(false), []);

  const marks = moments(sim.counts, ALL); // cheap; painting can change history without changing its length
  const heard = useRef(new Set<string>());
  useEffect(() => {
    const keys = marks.map(m => `${sim.seed}|${m.turn}|${m.text}`), fresh = keys.filter(k => !heard.current.has(k));
    keys.forEach(k => heard.current.add(k));
    if (fresh.length && playing) sound.chime();
  }, [marks, playing, sim]);

  const paint = (e: PointerEvent<HTMLCanvasElement>, first: boolean) => {
    const n = Math.sqrt(sim.hist[sim.gen].cells.length), r = e.currentTarget.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * n), y = Math.floor((e.clientY - r.top) / r.height * n);
    if (x < 0 || y < 0 || x >= n || y >= n) return;
    if (tool === 'inspect') { sim.focus = y * n + x; sim.dirty = true; sound.tick(); return render(); }
    const h = sim.hist, g = sim.gen;
    if (first) {
      // Painting the past rewrites history: keep the erased future as a ghost, copy before editing shared arrays.
      if (g < h.length - 1) { sim.ghost = { from: g, counts: sim.counts.slice(g) }; h.length = sim.counts.length = g + 1; }
      h[g] = { cells: h[g].cells.slice(), storm: h[g].storm.slice() };
    }
    const cur = h[g], rad = wide ? 2 : 0;
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) if (dx * dx + dy * dy <= rad * rad + 1) {
      const j = ((y + dy + n) % n) * n + (x + dx + n) % n;
      if (typeof tool === 'number') cur.cells[j] = tool; else cur.storm[j] = tool === 'storm' ? 1 : 0;
    }
    sim.counts[g] = census(cur.cells); sim.touched = true; sim.dirty = true; sound.clack(); render();
  };
  const pick = (t: Tool) => { setTool(t); sound.tick(); };
  const toggleSound = () => { sound.set(!soundOn); setSoundOn(!soundOn); };

  const fresh = sim.counts.length === 1 && !sim.touched;
  let page;
  if (view === 'opening') page = <Opening />;
  else if (view === 'rules') page = <Rules onHome={home} start={fresh ? `Start with ${SCENARIOS[kind].name}` : null} example={kaleido ? null : findExample(w, scoreOf(w), tables, sim.gen)} names={ALL} />;
  else {
    const counts = sim.counts[sim.gen], last = sim.counts.length - 1, pct = (c: number) => share(c, total);
    const n = Math.max(100, sim.counts.length, sim.ghost ? sim.ghost.from + sim.ghost.counts.length : 0);
    const full = sim.hist.length > LIMIT && sim.gen === last, holder = counts.indexOf(total);
    const top = Math.max(...counts), lead = counts.filter(c => c === top).length === 1 ? counts.indexOf(top) : -1;
    const other = holder === 1 ? 2 : 1, alt: Scenario = kind === 'storm' ? 'mix' : 'storm', match = twin(custom);
    const mode = tool === 'inspect' ? 'Inspect: tap a piece to open its card' : tool === 'storm' ? 'Storm: paint weather where moves slip' : tool === 'calm' ? 'Calm: paint to clear storms'
      : <>Painting: <i className="chip" style={{ background: COLORS[tool], borderRadius: square[tool] ? 4 : '50%' }} />{ALL[tool]}</>;
    const trackNote = sim.gen < last ? `Rewound to turn ${sim.gen} of ${last}: paint to rewrite history.${sim.ghost ? ' Faded: the future you erased.' : ''}`
      : sim.ghost ? 'Faded: the future you erased.' : 'Drag back to rewind. Paint the past to rewrite it.';
    const jump = (t: number) => { setPlaying(false); go(t); sound.tick(); };
    page = <main className="lid board-view">
      <header className="bar">
        <a className="wordmark" href="./" onClick={home}>Who inherits the world?</a>
        <span className="bar-actions">
          <button className="btn ghost icon-only" onClick={toggleSound} aria-pressed={soundOn} aria-label="Sound" title={soundOn ? 'Sound on' : 'Sound off'}><Icon name={soundOn ? 'soundOn' : 'soundOff'} /></button>
          <a className="btn ghost icon-narrow" href="#rules" aria-label="Rules"><Icon name="rules" /><span className="hide-narrow">Rules</span></a>
        </span>
      </header>
      <h1 className="visually-hidden">The board</h1>
      <div className="layout">
        <div className="transport" role="group" aria-label="Playback">
          <button className="btn yellow big play" onClick={() => setPlaying(p => !p)} disabled={full} aria-keyshortcuts="Space">
            {playing && !full ? <><Icon name="pause" />Pause</> : <><Icon name="play" />Play</>}
          </button>
          <button className="btn ghost big" onClick={() => { setPlaying(false); advance(); }} disabled={full} aria-keyshortcuts="ArrowRight"><Icon name="step" /><span className="label">Next turn</span></button>
          <button className="btn ghost big" onClick={() => reset(kind)}><Icon name="reset" /><span className="label">Reset</span></button>
          <span className="turn num">Turn {sim.gen.toLocaleString('en')}</span>
          <label className="speed"><span>Speed</span><input type="range" min={1} max={20} value={speed} onChange={e => setSpeed(+e.target.value)} /><span className="num">{speed} turns/s</span></label>
        </div>
        <div className="main-col">
          <section className="card board-card" aria-label="Board">
            <div className="board-head"><span className="mode">{mode}{wide && tool !== 'inspect' ? ' · big brush' : ''}</span><span className="keys">Space plays or pauses · → steps</span></div>
            <div className="world" data-tool={tool === 'inspect' ? 'inspect' : 'paint'}>
              <canvas ref={worldRef} role="img" aria-label={`Turn ${sim.gen}: ${KINDS.filter(s => counts[s]).map(s => `${ALL[s]} ${pct(counts[s])}`).join(', ')}`}
                onPointerDown={e => { if (e.pointerType === 'touch') { tap.current = [e.clientX, e.clientY]; return; } e.currentTarget.setPointerCapture(e.pointerId); paint(e, true); }}
                onPointerMove={e => { if (e.pointerType !== 'touch' && e.buttons && tool !== 'inspect') paint(e, false); }}
                onPointerUp={e => { if (tap.current && Math.hypot(e.clientX - tap.current[0], e.clientY - tap.current[1]) < 10) paint(e, true); tap.current = null; }} />
              {full ? <div className="banner" role="status"><strong>The score track is full.</strong><span>Drag it back to explore, or start a fresh game.</span>
                <div className="banner-actions"><button className="btn yellow" onClick={() => reset(kind)}>Reset</button></div></div>
                : holder >= 0 ? <div className="banner" role="status"><strong>{ALL[holder]} holds every square.</strong><span>Nothing changes until something new arrives.</span>
                  <div className="banner-actions"><button className="btn yellow" onClick={() => pick(other)}>Paint some {other === 1 ? 'defectors' : NAMES[other]}</button>
                    <button className="btn light" onClick={() => reset(alt)}>Try {SCENARIOS[alt].name}</button></div></div>
                : !playing && sim.gen === 0 && fresh ? <div className="banner" role="status"><strong>Press Play when you’re ready.</strong></div> : null}
            </div>
            {kaleido ? <div className="legend" aria-label="Colours in Kaleidoscope">
              <span><i style={{ background: KALEIDO[0] }} />Still cooperating</span><span><i className="sq" style={{ background: KALEIDO[1] }} />Still defecting</span>
              <span><i className="sq" style={{ background: KALEIDO[2] }} />Just turned D</span><span><i style={{ background: KALEIDO[3] }} />Just turned C</span>
            </div> : <div className="legend" aria-hidden="true">
              <span><i className="dot" />Bright: thriving</span><span><i className="dot dim" />Dim: struggling</span><span><i className="sq" />Square: defects first</span>
            </div>}
            {stormy && !kaleido && <p className="storm-key"><i className="storm-swatch" />Inside the dashed line it’s stormy: moves slip and get misread, so retaliation can spiral.</p>}
          </section>
          <section className="card track" aria-labelledby="track-h">
            <div className="card-head"><h2 id="track-h">Score track</h2><span className="note">{trackNote}</span></div>
            <div className="river">
              <canvas ref={trackRef} aria-hidden="true" />
              {last > 0 && <input className="scrub" type="range" min={0} max={last} value={sim.gen} aria-label="Rewind to turn" aria-valuetext={`Turn ${sim.gen} of ${last}`}
                style={{ width: `${last / (n - 1) * 100}%` }} onChange={e => { setPlaying(false); go(+e.target.value); }} />}
              {marks.map(m => <button key={`${m.turn}${m.text}`} className="pin" style={{ left: `${m.turn / (n - 1) * 100}%`, background: COLORS[m.kind] }} onClick={() => jump(m.turn)} aria-label={`Turn ${m.turn}: ${m.text}`} title={`Turn ${m.turn}: ${m.text}`} />)}
            </div>
            <div className="axis num" aria-hidden="true"><span>Turn 0</span><span>{Math.round((n - 1) / 2)}</span><span>{n - 1}</span></div>
            {marks.length > 0 && <ol className="moments" aria-label="Moments so far">
              {marks.map(m => <li key={`${m.turn}${m.text}`}><button onClick={() => jump(m.turn)} aria-current={m.turn === sim.gen ? 'true' : undefined}>
                <i style={{ background: COLORS[m.kind], borderRadius: square[m.kind] ? 3 : '50%' }} /><span className="num">Turn {m.turn}</span>{m.text}</button></li>)}
            </ol>}
          </section>
        </div>
        <aside className="side">
          {sim.focus !== null && sim.focus < total && <><div className="backdrop" onClick={closeCard} />
            <PieceCard i={sim.focus} w={w} score={scoreOf(w)} m={tables} custom={custom} temptation={temptation} kaleido={kaleido} onClose={closeCard} /></>}
          <section className="card tray" aria-labelledby="tray-h">
            <div className="card-head"><h2 id="tray-h">Your tray</h2><span className="note">Share of the board</span></div>
            <div className="pieces">
              {KINDS.map(s => <button key={s} className="tray-piece" aria-pressed={tool === s} onClick={() => pick(s)}>
                <Piece s={s} size={40} />
                <span className="tp-text"><span className="tp-name">{ALL[s]}{s === lead && <b className="badge">Leading</b>}{s === 6 && tool !== 6 && <b className="badge soft">Design</b>}</span>
                  <span className="bar-track"><span style={{ width: `${counts[s] / total * 100}%`, background: COLORS[s] }} /></span></span>
                <span className="tp-share num">{pct(counts[s])}</span>
              </button>)}
            </div>
            {tool === 6 && <div className="builder" role="group" aria-labelledby="builder-h">
              <h3 id="builder-h">Design your piece</h3>
              {([['first', 'First move'], ['afterC', 'If they play C'], ['afterD', 'If they play D']] as const).map(([k, label]) => <div className="choice" key={k}>
                <span>{label}</span>
                <span className="seg">{([0, 1] as const).map(a => <button key={a} aria-pressed={custom[k] === a} aria-label={`${label}: ${a ? 'defect' : 'cooperate'}`} onClick={() => { setCustom(c => ({ ...c, [k]: a })); sound.tick(); }}>{a ? 'D' : 'C'}</button>)}</span>
              </div>)}
              <label className="check"><input type="checkbox" checked={custom.forgives && custom.afterD === 1} disabled={custom.afterD === 0} onChange={e => setCustom(c => ({ ...c, forgives: e.target.checked }))} />Sometimes forgives a D</label>
              <p className="note">{describe(custom)} {match >= 0 ? `It plays exactly like ${NAMES[match]}.` : isNice(custom) ? 'It never defects first.' : 'It can defect first, so it shows as a square.'} Pieces already on the board follow the new rule.</p>
            </div>}
            <div className="tools" role="group" aria-label="Tools">
              {(['storm', 'calm', 'inspect'] as const).map(t => <button key={t} className="tool" aria-pressed={tool === t} onClick={() => pick(t)} disabled={kaleido && t !== 'inspect'} title={kaleido && t !== 'inspect' ? 'No weather in Kaleidoscope' : undefined}><Icon name={t} />{t[0].toUpperCase() + t.slice(1)}</button>)}
              <button className="tool" aria-pressed={wide} onClick={() => { setWide(x => !x); sound.tick(); }}><Icon name="brush" />Big brush</button>
            </div>
          </section>
          <section className="setups" aria-labelledby="setup-h">
            <div className="setups-head"><h2 id="setup-h">Setup cards</h2>
              <span className="size" role="group" aria-label="Board size">{[48, 96].map(s => <button key={s} aria-pressed={size === s} onClick={() => reset(kind, s)}>{s} × {s}</button>)}</span></div>
            {(Object.keys(SCENARIOS) as Scenario[]).map(k => <button key={k} className="setup" aria-pressed={kind === k} onClick={() => reset(k)}>
              <span className="setup-top"><strong>{SCENARIOS[k].name}</strong>{kind === k && <b className="badge">On the board</b>}</span><span>{SCENARIOS[k].hook}</span>
            </button>)}
          </section>
          {kaleido ? <label className="mutation"><span className="mutation-top"><span>Temptation</span><span className="num">{temptation.toFixed(2)}</span></span>
            <input type="range" min={1.05} max={2.5} step={.05} value={temptation} onChange={e => setTemptation(+e.target.value)} />
            <span className="note">A defector earns this much per cooperating neighbour; a cooperator earns 1. Patterns bloom between about 1.8 and 2. Mutation is off here.</span></label>
            : <label className="mutation"><span className="mutation-top"><span>Mutation</span><span className="num">{(mutation * 100).toFixed(1)}% a turn</span></span>
              <input type="range" min={0} max={.02} step={.001} value={mutation} onChange={e => setMutation(+e.target.value)} />
              <span className="note">Random pieces turn into any of the six each turn.</span></label>}
        </aside>
      </div>
    </main>;
  }
  return <div ref={viewRef} tabIndex={-1} className="view">{page}</div>;
}
