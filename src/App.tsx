import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { IDS, NAMES, RULES, play } from './engine.ts';
import { SIZE, SCENARIOS, census, neighbours, payoffs, scenario, scores, step, toughest } from './evolution.ts';
import type { Scenario, World } from './evolution.ts';
import { Avatar } from './Avatar.tsx';

const COLORS = ['#ffc58a', '#e0173f', '#3d8fff', '#b383f7', '#ffd23a', '#ff6f86'];
const M = payoffs('curiosity');
const CELLS = SIZE * SIZE, LIMIT = 1000, GLOW = 700, STORM: [number, number] = [.05, .05];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
type Tool = number | 'storm' | 'calm' | 'inspect';
interface Ghost { from: number; counts: number[][] }
const pct = (n: number) => `${Math.round(n / CELLS * 100)}%`;
const Icon = ({ children }: { children: ReactNode }) => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">{children}</svg>;

function drawWorld(ctx: CanvasRenderingContext2D, px: number, w: World, prev: World | undefined, score: Float64Array, glow: number, t: number, focus: number | null) {
  const c = px / SIZE, g = Math.max(.5, c * .07), side = c - 2 * g;
  ctx.clearRect(0, 0, px, px);
  for (let i = 0; i < CELLS; i++) {
    const s = w.cells[i], x = (i % SIZE) * c + g, y = Math.floor(i / SIZE) * c + g;
    ctx.globalAlpha = .3 + .7 * Math.min(1, score[i] / 3); // dim = struggling, full = thriving
    ctx.fillStyle = COLORS[s];
    ctx.beginPath();
    if (s === 1) ctx.rect(x, y, side, side); else ctx.roundRect(x, y, side, side, c * .4);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (c / devicePixelRatio >= 6.5) {
    const e = Math.max(1, c * .11), eyes = new Path2D();
    for (let i = 0; i < CELLS; i++) {
      const x = (i % SIZE) * c, y = Math.floor(i / SIZE) * c + c * .38;
      eyes.rect(x + c * .32 - e / 2, y, e, e * 1.4); eyes.rect(x + c * .68 - e / 2, y, e, e * 1.4);
    }
    ctx.fillStyle = '#10251a'; ctx.fill(eyes);
  }
  const rain = new Path2D(), edge = new Path2D();
  const calmAt = (x: number, y: number) => x >= 0 && y >= 0 && x < SIZE && y < SIZE && !w.storm[y * SIZE + x];
  ctx.fillStyle = 'rgba(170, 205, 255, .12)';
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
  ctx.strokeStyle = 'rgba(225, 238, 255, .8)'; ctx.lineWidth = Math.max(1, c * .1); ctx.stroke(rain);
  ctx.strokeStyle = '#dbe8ff'; ctx.lineWidth = Math.max(1.5, c * .14); ctx.setLineDash([c * .5, c * .3]); ctx.stroke(edge); ctx.setLineDash([]);
  if (glow > 0 && prev) {
    const ring = new Path2D();
    for (let i = 0; i < CELLS; i++) if (prev.cells[i] !== w.cells[i]) ring.roundRect((i % SIZE) * c + g, Math.floor(i / SIZE) * c + g, side, side, c * .4);
    ctx.strokeStyle = `rgba(255, 250, 225, ${glow * .9})`; ctx.lineWidth = Math.max(1, c * .14); ctx.stroke(ring);
  }
  if (focus !== null) {
    const x = (focus % SIZE) * c, y = Math.floor(focus / SIZE) * c;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, c * .14); ctx.strokeRect(x, y, c, c);
    ctx.setLineDash([c * .3, c * .2]); ctx.lineWidth = Math.max(1, c * .07); ctx.strokeRect(x - c, y - c, 3 * c, 3 * c); ctx.setLineDash([]);
  }
}

function drawRiver(ctx: CanvasRenderingContext2D, w: number, h: number, counts: number[][], ghost: Ghost | null, gen: number) {
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
  if (ghost) layers(ghost.counts, ghost.from, .22);
  layers(counts, 0, .95);
  ctx.fillStyle = '#f7f8ed'; ctx.fillRect(Math.min(X(gen), w - 2), 0, 2, h);
}

function Inspector({ i, w, score, onClose }: { i: number; w: World; score: Float64Array; onClose: () => void }) {
  const near = Array.from(neighbours(SIZE).subarray(i * 8, i * 8 + 8));
  const rival = near.reduce((a, b) => (score[b] > score[a] ? b : a));
  const foe = toughest(w, M, score, i);
  const s = w.cells[i], o = w.cells[rival], f = w.cells[foe], stormy = !!(w.storm[i] || w.storm[foe]);
  const next = score[rival] > score[i] + 1e-9 ? o : s;
  const trace = play(IDS[s], IDS[f], 12, `look|${i}|${foe}`, stormy ? STORM : [0, 0], .1, true).trace;
  const row = (p: 0 | 1) => trace.map((r, k) => <i key={k} className={`${r.actual[p] ? 'd' : ''}${r.actual[p] !== r.intended[p] ? ' slip' : ''}`}>{r.actual[p] ? 'D' : 'C'}</i>);
  return <section className="inspector" aria-live="polite">
    <header><Avatar strategy={s} /><div><h2>{NAMES[s]}</h2><p>{RULES[s]}</p></div><button className="close" onClick={onClose} aria-label="Close inspector">×</button></header>
    <p><strong className="num">{score[i].toFixed(2)}</strong> points a round, {stormy ? 'in the storm' : 'in calm weather'}. Best neighbour: {NAMES[o]} at <span className="num">{score[rival].toFixed(2)}</span>.</p>
    <p>First 12 rounds against its toughest neighbour (the one it earns least from): {NAMES[f]}.</p>
    <div className="duel" aria-label={`First 12 rounds: ${NAMES[s]} against ${NAMES[f]}`}><span>This one</span>{row(0)}<span>Neighbour</span>{row(1)}</div>
    {stormy && <p className="hint">Dashed squares are slips: it meant the other move.</p>}
    {!stormy && trace.every(r => !r.actual[0] && !r.actual[1]) && <p className="hint">Neither ever defects first, so in calm weather they cooperate every round.</p>}
    <p className="next">Next generation: {next === s ? `stays ${NAMES[s]}` : `becomes ${NAMES[next]}`}</p>
  </section>;
}

export default function App() {
  const sim = useRef({ hist: [] as World[], counts: [] as number[][], gen: 0, ghost: null as Ghost | null, focus: null as number | null, seed: 0, changedAt: 0, dirty: true }).current;
  if (!sim.hist.length) { const w = scenario('apple', '0'); sim.hist.push(w); sim.counts.push(census(w.cells)); }
  const [, render] = useReducer((x: number) => x + 1, 0);
  const [kind, setKind] = useState<Scenario>('apple');
  const [playing, setPlaying] = useState(!reduced);
  const [speed, setSpeed] = useState(6);
  const [mutation, setMutation] = useState(.001);
  const [tool, setTool] = useState<Tool>(1);
  const [wide, setWide] = useState(false);
  const worldRef = useRef<HTMLCanvasElement>(null), riverRef = useRef<HTMLCanvasElement>(null);
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
    Object.assign(sim, { hist: [w], counts: [census(w.cells)], ghost: null, focus: null });
    setKind(k); setPlaying(!reduced); go(0);
  };

  useEffect(() => {
    if (!playing) return;
    let last = performance.now(), due = 0, id = 0;
    const tick = (now: number) => { due = Math.min(3, due + (now - last) * speed / 1000); last = now; for (; due >= 1; due--) advance(); id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing, speed, advance]);

  useEffect(() => {
    let id = 0;
    const frame = (t: number) => {
      const w = sim.hist[sim.gen], glow = reduced ? 0 : Math.max(0, 1 - (t - sim.changedAt) / GLOW);
      const stormy = !reduced && w.storm.includes(1);
      for (const canvas of [worldRef.current, riverRef.current]) if (canvas) {
        const width = Math.round(canvas.clientWidth * devicePixelRatio), height = Math.round(canvas.clientHeight * devicePixelRatio);
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; sim.dirty = true; }
      }
      if (worldRef.current && (sim.dirty || glow > 0 || stormy)) drawWorld(worldRef.current.getContext('2d')!, worldRef.current.width, w, sim.hist[sim.gen - 1], scoreOf(w), glow, t, sim.focus);
      if (riverRef.current && sim.dirty) drawRiver(riverRef.current.getContext('2d')!, riverRef.current.width, riverRef.current.height, sim.counts, sim.ghost, sim.gen);
      sim.dirty = false;
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [sim]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, button, summary, a')) return;
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === 'ArrowRight') { setPlaying(false); advance(); }
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [advance]);

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
    sim.counts[g] = census(w.cells); sim.dirty = true; render();
  };

  const w = sim.hist[sim.gen], counts = sim.counts[sim.gen], last = sim.counts.length - 1;
  const n = Math.max(100, sim.counts.length, sim.ghost ? sim.ghost.from + sim.ghost.counts.length : 0);
  return <main className="app">
    <header className="intro">
      <h1>Who inherits the world?</h1>
      <p className="lead">Six strategies share one world. Every generation, each creature plays the prisoner’s dilemma with its eight neighbours, then copies whoever nearby scored best. Paint, rewind, and see who takes over.</p>
      <details>
        <summary>How it works</summary>
        <ul>
          <li>Each meeting is a few hundred rounds. Both cooperate: 3 points each. Both defect: 1 each. A defector facing a cooperator takes 5 and leaves 0.</li>
          <li>A creature’s score is its average per round against its neighbours. Bright creatures are thriving; dim ones are struggling.</li>
          <li>In a storm, moves slip and get misread, up to 10% of the time.</li>
          <li>Mutation turns a few random creatures into a random strategy each generation.</li>
        </ul>
      </details>
    </header>
    <div className="lab">
      <section className="board" aria-label="World">
        <div className="transport">
          <button className="play" onClick={() => setPlaying(p => !p)} title="Space">
            {playing ? <><Icon><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></Icon>Pause</> : <><Icon><path d="M7 4l13 8-13 8z" /></Icon>Play</>}
          </button>
          <button className="secondary" onClick={() => { setPlaying(false); advance(); }} title="Right arrow"><Icon><path d="M5 4l11 8-11 8zM17 4h3v16h-3z" /></Icon>Step</button>
          <button className="secondary" onClick={() => reset(kind)}><Icon><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></Icon>Restart</button>
          <span className="gen num" aria-live="off">Gen {sim.gen}</span>
          <label className="speed">Speed <span className="num">{speed}/s</span><input type="range" min={1} max={20} value={speed} onChange={e => setSpeed(+e.target.value)} /></label>
        </div>
        <div className="world" data-tool={tool === 'inspect' ? 'inspect' : 'paint'}>
          <canvas ref={worldRef} role="img" aria-label={`Generation ${sim.gen}: ${IDS.map((_, s) => `${NAMES[s]} ${pct(counts[s])}`).join(', ')}`}
            onPointerDown={e => { if (e.pointerType === 'touch') { tap.current = [e.clientX, e.clientY]; return; } e.currentTarget.setPointerCapture(e.pointerId); paint(e, true); }}
            onPointerMove={e => { if (e.pointerType !== 'touch' && e.buttons && tool !== 'inspect') paint(e, false); }}
            onPointerUp={e => { if (tap.current && Math.hypot(e.clientX - tap.current[0], e.clientY - tap.current[1]) < 10) paint(e, true); tap.current = null; }} />
        </div>
        <div className="river">
          <canvas ref={riverRef} aria-hidden="true" />
          {last > 0 && <input className="scrub" type="range" min={0} max={last} value={sim.gen} aria-label="Rewind to generation" style={{ width: `${last / (n - 1) * 100}%` }}
            onChange={e => { setPlaying(false); go(+e.target.value); }} />}
        </div>
        {w.storm.includes(1) && <p className="storm-key"><span className="swatch storm" />Inside the dashed line it’s stormy: moves slip and get misread, so retaliation can spiral.</p>}
        <p className="when">{sim.gen < last ? 'Rewound: paint to rewrite history. ' : 'Drag the timeline to rewind. '}{sim.ghost && 'Faded: the future you erased.'}</p>
      </section>
      <aside className="panel">
        {sim.focus !== null && <Inspector i={sim.focus} w={w} score={scoreOf(w)} onClose={() => { sim.focus = null; sim.dirty = true; render(); }} />}
        <fieldset>
          <legend>Paint with</legend>
          <div className="list">
            {IDS.map((_, s) => <button key={s} className="tool" aria-pressed={tool === s} onClick={() => setTool(s)} style={{ '--c': COLORS[s], '--share': pct(counts[s]) } as CSSProperties}>
              <Avatar strategy={s} /><span className="name">{NAMES[s]}</span><span className="share num">{pct(counts[s])}</span>
            </button>)}
          </div>
          <div className="extras">
            <button className="tool" aria-pressed={tool === 'storm'} onClick={() => setTool('storm')}><span className="swatch storm" />Storm</button>
            <button className="tool" aria-pressed={tool === 'calm'} onClick={() => setTool('calm')}><span className="swatch calm" />Calm</button>
            <button className="tool" aria-pressed={tool === 'inspect'} onClick={() => setTool('inspect')}><span className="swatch lens" />Inspect</button>
            <button className="tool" aria-pressed={wide} onClick={() => setWide(x => !x)}><span className="swatch wide" />Wide brush</button>
          </div>
        </fieldset>
        <fieldset>
          <legend>Start a world</legend>
          <div className="scenarios">
            {(Object.keys(SCENARIOS) as Scenario[]).map(k => <button key={k} className="scenario" aria-pressed={kind === k} onClick={() => reset(k)}>
              <strong>{SCENARIOS[k].name}</strong><span>{SCENARIOS[k].hook}</span>
            </button>)}
          </div>
        </fieldset>
        <label className="mutation">Mutation <span className="num">{(mutation * 100).toFixed(1)}% a generation</span>
          <input type="range" min={0} max={.02} step={.001} value={mutation} onChange={e => setMutation(+e.target.value)} /></label>
      </aside>
    </div>
  </main>;
}
