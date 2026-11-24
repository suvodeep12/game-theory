import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { IDS, NAMES, play } from './engine.ts';
import { SIZE, SCENARIOS, census, neighbours, payoffs, scenario, scores, share, step, toughest } from './evolution.ts';
import type { Scenario, World } from './evolution.ts';
import { COLORS, PLAIN, Piece } from './Pieces.tsx';
import { Opening, Rules } from './Story.tsx';

const M = payoffs('curiosity');
const CELLS = SIZE * SIZE, LIMIT = 1000, GLOW = 700, STORM: [number, number] = [.05, .05];
const INK = '#10173a', YELLOW = '#ffd23a';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
type Tool = number | 'storm' | 'calm' | 'inspect';
type View = 'opening' | 'rules' | 'board';
interface Ghost { from: number; counts: number[][] }
const pct = (n: number) => share(n, CELLS);
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
};
const FILLED = new Set(['play', 'pause', 'step']);
const Icon = ({ name }: { name: keyof typeof PATHS }) => <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"
  {...(FILLED.has(name) ? { fill: 'currentColor' } : { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const })}><path d={PATHS[name]} /></svg>;

function drawWorld(ctx: CanvasRenderingContext2D, px: number, w: World, prev: World | undefined, score: Float64Array, glow: number, t: number, focus: number | null) {
  const c = px / SIZE, g = Math.max(.5, c * .11), side = c - 2 * g;
  const shape = (p: Path2D | CanvasRenderingContext2D, i: number) => {
    const x = (i % SIZE) * c + g, y = Math.floor(i / SIZE) * c + g;
    if (w.cells[i] === 1) p.roundRect(x, y, side, side, c * .1); else { p.moveTo(x + side, y + side / 2); p.arc(x + side / 2, y + side / 2, side / 2, 0, 2 * Math.PI); }
  };
  ctx.clearRect(0, 0, px, px);
  for (let i = 0; i < CELLS; i++) {
    ctx.globalAlpha = .3 + .7 * Math.min(1, score[i] / 3); // dim = struggling, full = thriving
    ctx.fillStyle = COLORS[w.cells[i]];
    ctx.beginPath(); shape(ctx, i); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (c / devicePixelRatio >= 7) {
    const e = Math.max(1, c * .1), eyes = new Path2D();
    for (let i = 0; i < CELLS; i++) {
      const x = (i % SIZE) * c, y = Math.floor(i / SIZE) * c + c * .38;
      eyes.rect(x + c * .35 - e / 2, y, e, e * 1.3); eyes.rect(x + c * .65 - e / 2, y, e, e * 1.3);
    }
    ctx.fillStyle = INK; ctx.fill(eyes);
  }
  const rain = new Path2D(), edge = new Path2D();
  const calmAt = (x: number, y: number) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && !w.storm[y * SIZE + x];
  ctx.fillStyle = 'rgba(35, 64, 196, .1)';
  for (let i = 0; i < CELLS; i++) if (w.storm[i]) {
    const cx = i % SIZE, cy = Math.floor(i / SIZE), x = cx * c, y = cy * c, p = ((reduced ? 0 : t / 650) + i * .618) % 1;
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
  if (glow > 0 && prev) {
    const ring = new Path2D();
    for (let i = 0; i < CELLS; i++) if (prev.cells[i] !== w.cells[i]) shape(ring, i);
    ctx.strokeStyle = `rgba(35, 64, 196, ${glow * .9})`; ctx.lineWidth = Math.max(1, c * .14); ctx.stroke(ring);
  }
  if (focus !== null) {
    const x = (focus % SIZE) * c, y = Math.floor(focus / SIZE) * c;
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(2, c * .16); ctx.strokeRect(x, y, c, c);
    ctx.setLineDash([c * .3, c * .2]); ctx.lineWidth = Math.max(1, c * .08); ctx.strokeRect(x - c, y - c, 3 * c, 3 * c); ctx.setLineDash([]);
  }
}

function drawTrack(ctx: CanvasRenderingContext2D, w: number, h: number, counts: number[][], ghost: Ghost | null, gen: number) {
  const n = Math.max(100, counts.length, ghost ? ghost.from + ghost.counts.length : 0);
  const X = (k: number) => k / (n - 1) * w, Y = (v: number) => h - v / CELLS * h;
  const layers = (rows: number[][], from: number, alpha: number) => {
    ctx.globalAlpha = alpha;
    for (let s = 0; s < 6; s++) {
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

function PieceCard({ i, w, score, onClose }: { i: number; w: World; score: Float64Array; onClose: () => void }) {
  const near = Array.from(neighbours(SIZE).subarray(i * 8, i * 8 + 8));
  const rival = near.reduce((a, b) => (score[b] > score[a] ? b : a));
  const foe = toughest(w, M, score, i);
  const s = w.cells[i], o = w.cells[rival], f = w.cells[foe], stormy = !!(w.storm[i] || w.storm[foe]);
  const next = score[rival] > score[i] + 1e-9 ? o : s;
  const trace = play(IDS[s], IDS[f], 12, `look|${i}|${foe}`, stormy ? STORM : [0, 0], .1, true).trace;
  const slipped = (p: 0 | 1, k: number) => trace[k].actual[p] !== trace[k].intended[p];
  const anySlip = trace.some((_, k) => slipped(0, k) || slipped(1, k));
  const row = (p: 0 | 1) => trace.map((r, k) => <i key={k} className={`${r.actual[p] ? 'd' : 'c'}${slipped(p, k) ? ' slip' : ''}`}>{r.actual[p] ? 'D' : 'C'}</i>);
  const said = (p: 0 | 1) => trace.map((r, k) => `${r.actual[p] ? 'D' : 'C'}${slipped(p, k) ? ' (slip)' : ''}`).join(', ');
  return <section className="piece-card" aria-labelledby="pc-name">
    <header>
      <Piece s={s} size={56} />
      <div><h2 id="pc-name">{NAMES[s]}</h2><p>{PLAIN[s]}</p></div>
      <button className="close" onClick={onClose} aria-label="Close piece card"><Icon name="close" /></button>
    </header>
    <div className="stats">
      <p><b className="num">{score[i].toFixed(2)}</b><span>points a round · {w.storm[i] ? 'in the storm' : 'calm'}</span></p>
      <p><b className="num">{score[rival].toFixed(2)}</b><span>best nearby: {NAMES[o]}</span></p>
    </div>
    <p className="duel-title">First 12 rounds against its toughest neighbour, {NAMES[f]}</p>
    <div className="duel" role="img" aria-label={`This one: ${said(0)}. Neighbour: ${said(1)}.`}>
      <span>This one</span>{row(0)}<span>Neighbour</span>{row(1)}
    </div>
    {anySlip && <p className="hint">Dashed squares are slips: it meant the other move.</p>}
    {!stormy && trace.every(r => !r.actual[0] && !r.actual[1]) && <p className="hint">Neither ever defects first, so in calm weather they cooperate every round.</p>}
    <p className="next" style={{ background: next === s ? undefined : `color-mix(in srgb, ${COLORS[next]} 30%, #f5f7ff)` }}>Next turn: {next === s ? `stays ${NAMES[s]}` : `becomes ${NAMES[next]}`}</p>
  </section>;
}

export default function App() {
  const sim = useRef({ hist: [] as World[], counts: [] as number[][], gen: 0, ghost: null as Ghost | null, focus: null as number | null, seed: 0, changedAt: 0, dirty: true, touched: false }).current;
  if (!sim.hist.length) { const w = scenario('apple', '0'); sim.hist.push(w); sim.counts.push(census(w.cells)); }
  const [, render] = useReducer((x: number) => x + 1, 0);
  const [view, setView] = useState<View>(() => { if (!location.hash && seen.get()) history.replaceState(null, '', '#board'); return viewOf(); });
  const [kind, setKind] = useState<Scenario>('apple');
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(6);
  const [mutation, setMutation] = useState(.001);
  const [tool, setTool] = useState<Tool>(1);
  const [wide, setWide] = useState(false);
  const worldRef = useRef<HTMLCanvasElement>(null), trackRef = useRef<HTMLCanvasElement>(null), viewRef = useRef<HTMLDivElement>(null);
  const tap = useRef<[number, number] | null>(null); // touch paints on tap so swipes still scroll the page
  const scoreCache = useRef<{ w?: World; s: Float64Array }>({ s: new Float64Array(CELLS) }).current;
  const scoreOf = (w: World) => { if (scoreCache.w !== w) { scoreCache.w = w; scoreCache.s = scores(w, M); } return scoreCache.s; };

  const go = useCallback((g: number) => { sim.gen = g; sim.changedAt = performance.now(); sim.dirty = true; render(); }, [sim]);
  const advance = useCallback(() => {
    const g = sim.gen, h = sim.hist;
    if (g === h.length - 1) {
      if (h.length > LIMIT) return setPlaying(false);
      h.push(step(h[g], M, mutation, `${sim.seed}|${g}`)); sim.counts.push(census(h[g + 1].cells));
    }
    go(g + 1);
  }, [sim, mutation, go]);
  const reset = (k: Scenario) => {
    const w = scenario(k, `${++sim.seed}`);
    Object.assign(sim, { hist: [w], counts: [census(w.cells)], ghost: null, focus: null, touched: false });
    setKind(k); setPlaying(!reduced); go(0);
  };
  const closeCard = () => { sim.focus = null; sim.dirty = true; render(); };
  const home = (e: MouseEvent) => { e.preventDefault(); history.pushState(null, '', location.pathname + location.search); setView('opening'); };

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
      const stormy = !reduced && w.storm.includes(1);
      for (const canvas of [worldRef.current, trackRef.current]) if (canvas) {
        const width = Math.round(canvas.clientWidth * devicePixelRatio), height = Math.round(canvas.clientHeight * devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; sim.dirty = true; }
      }
      if (worldRef.current && (sim.dirty || glow > 0 || stormy)) drawWorld(worldRef.current.getContext('2d')!, worldRef.current.width, w, sim.hist[sim.gen - 1], scoreOf(w), glow, t, sim.focus);
      if (trackRef.current && sim.dirty) drawTrack(trackRef.current.getContext('2d')!, trackRef.current.width, trackRef.current.height, sim.counts, sim.ghost, sim.gen);
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

  const paint = (e: PointerEvent<HTMLCanvasElement>, first: boolean) => {
    const r = e.currentTarget.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * SIZE), y = Math.floor((e.clientY - r.top) / r.height * SIZE);
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    if (tool === 'inspect') { sim.focus = y * SIZE + x; sim.dirty = true; return render(); }
    const h = sim.hist, g = sim.gen;
    if (first) {
      // Painting the past rewrites history: keep the erased future as a ghost, copy before editing shared arrays.
      if (g < h.length - 1) { sim.ghost = { from: g, counts: sim.counts.slice(g) }; h.length = sim.counts.length = g + 1; }
      h[g] = { cells: h[g].cells.slice(), storm: h[g].storm.slice() };
    }
    const w = h[g], rad = wide ? 2 : 0;
    for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) if (dx * dx + dy * dy <= rad * rad + 1) {
      const j = ((y + dy + SIZE) % SIZE) * SIZE + (x + dx + SIZE) % SIZE;
      if (typeof tool === 'number') w.cells[j] = tool; else w.storm[j] = tool === 'storm' ? 1 : 0;
    }
    sim.counts[g] = census(w.cells); sim.touched = true; sim.dirty = true; render();
  };

  const fresh = sim.counts.length === 1 && !sim.touched;
  let page;
  if (view === 'opening') page = <Opening />;
  else if (view === 'rules') page = <Rules onHome={home} start={fresh ? `Start with ${SCENARIOS[kind].name}` : null} />;
  else {
    const w = sim.hist[sim.gen], counts = sim.counts[sim.gen], last = sim.counts.length - 1;
    const n = Math.max(100, sim.counts.length, sim.ghost ? sim.ghost.from + sim.ghost.counts.length : 0);
    const full = sim.hist.length > LIMIT && sim.gen === last, holder = counts.indexOf(CELLS), stormy = w.storm.includes(1);
    const top = Math.max(...counts), lead = counts.filter(c => c === top).length === 1 ? counts.indexOf(top) : -1;
    const other = holder === 1 ? 2 : 1, alt: Scenario = kind === 'storm' ? 'mix' : 'storm';
    const mode = tool === 'inspect' ? 'Inspect: tap a piece to open its card' : tool === 'storm' ? 'Storm: paint weather where moves slip' : tool === 'calm' ? 'Calm: paint to clear storms'
      : <>Painting: <i className="chip" style={{ background: COLORS[tool] }} />{NAMES[tool]}</>;
    const trackNote = sim.gen < last ? `Rewound to turn ${sim.gen} of ${last}: paint to rewrite history.${sim.ghost ? ' Faded: the future you erased.' : ''}`
      : sim.ghost ? 'Faded: the future you erased.' : 'Drag back to rewind. Paint the past to rewrite it.';
    page = <main className="lid board-view">
      <header className="bar">
        <a className="wordmark" href="./" onClick={home}>Who inherits the world?</a>
        <a className="btn ghost icon-narrow" href="#rules" aria-label="Rules"><Icon name="rules" /><span className="hide-narrow">Rules</span></a>
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
              <canvas ref={worldRef} role="img" aria-label={`Turn ${sim.gen}: ${IDS.map((_, s) => `${NAMES[s]} ${pct(counts[s])}`).join(', ')}`}
                onPointerDown={e => { if (e.pointerType === 'touch') { tap.current = [e.clientX, e.clientY]; return; } e.currentTarget.setPointerCapture(e.pointerId); paint(e, true); }}
                onPointerMove={e => { if (e.pointerType !== 'touch' && e.buttons && tool !== 'inspect') paint(e, false); }}
                onPointerUp={e => { if (tap.current && Math.hypot(e.clientX - tap.current[0], e.clientY - tap.current[1]) < 10) paint(e, true); tap.current = null; }} />
              {full ? <div className="banner" role="status"><strong>The score track is full.</strong><span>Drag it back to explore, or start a fresh game.</span>
                <div className="banner-actions"><button className="btn yellow" onClick={() => reset(kind)}>Reset</button></div></div>
                : holder >= 0 ? <div className="banner" role="status"><strong>{NAMES[holder]} holds every square.</strong><span>Nothing changes until something new arrives.</span>
                  <div className="banner-actions"><button className="btn yellow" onClick={() => setTool(other)}>Paint some {other === 1 ? 'defectors' : NAMES[other]}</button>
                    <button className="btn light" onClick={() => reset(alt)}>Try {SCENARIOS[alt].name}</button></div></div>
                : !playing && sim.gen === 0 && fresh ? <div className="banner" role="status"><strong>Press Play when you’re ready.</strong></div> : null}
            </div>
            <div className="legend" aria-hidden="true">
              <span><i className="dot" />Bright: thriving</span><span><i className="dot dim" />Dim: struggling</span><span><i className="sq" />Square: defects first</span>
            </div>
            {stormy && <p className="storm-key"><i className="storm-swatch" />Inside the dashed line it’s stormy: moves slip and get misread, so retaliation can spiral.</p>}
          </section>
          <section className="card track" aria-labelledby="track-h">
            <div className="card-head"><h2 id="track-h">Score track</h2><span className="note">{trackNote}</span></div>
            <div className="river">
              <canvas ref={trackRef} aria-hidden="true" />
              {last > 0 && <input className="scrub" type="range" min={0} max={last} value={sim.gen} aria-label="Rewind to turn" aria-valuetext={`Turn ${sim.gen} of ${last}`}
                style={{ width: `${last / (n - 1) * 100}%` }} onChange={e => { setPlaying(false); go(+e.target.value); }} />}
            </div>
            <div className="axis num" aria-hidden="true"><span>Turn 0</span><span>{Math.round((n - 1) / 2)}</span><span>{n - 1}</span></div>
          </section>
        </div>
        <aside className="side">
          {sim.focus !== null && <><div className="backdrop" onClick={closeCard} /><PieceCard i={sim.focus} w={w} score={scoreOf(w)} onClose={closeCard} /></>}
          <section className="card tray" aria-labelledby="tray-h">
            <div className="card-head"><h2 id="tray-h">Your tray</h2><span className="note">Share of the board</span></div>
            <div className="pieces">
              {IDS.map((_, s) => <button key={s} className="tray-piece" aria-pressed={tool === s} onClick={() => setTool(s)}>
                <Piece s={s} size={40} />
                <span className="tp-text"><span className="tp-name">{NAMES[s]}{s === lead && <b className="badge">Leading</b>}</span>
                  <span className="bar-track"><span style={{ width: `${counts[s] / CELLS * 100}%`, background: COLORS[s] }} /></span></span>
                <span className="tp-share num">{pct(counts[s])}</span>
              </button>)}
            </div>
            <div className="tools" role="group" aria-label="Tools">
              {(['storm', 'calm', 'inspect'] as const).map(t => <button key={t} className="tool" aria-pressed={tool === t} onClick={() => setTool(t)}><Icon name={t} />{t[0].toUpperCase() + t.slice(1)}</button>)}
              <button className="tool" aria-pressed={wide} onClick={() => setWide(x => !x)}><Icon name="brush" />Big brush</button>
            </div>
          </section>
          <section className="setups" aria-labelledby="setup-h">
            <h2 id="setup-h">Setup cards</h2>
            {(Object.keys(SCENARIOS) as Scenario[]).map(k => <button key={k} className="setup" aria-pressed={kind === k} onClick={() => reset(k)}>
              <span className="setup-top"><strong>{SCENARIOS[k].name}</strong>{kind === k && <b className="badge">On the board</b>}</span><span>{SCENARIOS[k].hook}</span>
            </button>)}
          </section>
          <label className="mutation"><span className="mutation-top"><span>Mutation</span><span className="num">{(mutation * 100).toFixed(1)}% a turn</span></span>
            <input type="range" min={0} max={.02} step={.001} value={mutation} onChange={e => setMutation(+e.target.value)} />
            <span className="note">Random pieces turn into any of the six each turn.</span></label>
        </aside>
      </div>
    </main>;
  }
  return <div ref={viewRef} tabIndex={-1} className="view">{page}</div>;
}
