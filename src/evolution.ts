import { IDS, PAIRS, EQUAL, VERSION, encounter, pairMatrix, play, randomStream, boundedInteger } from './engine.ts';
import type { Custom, Mode, Player } from './engine.ts';

export const SIZE = 48;
export type Matrix = number[][];
export interface Payoffs { calm: Matrix; storm: Matrix }
export interface World { cells: Uint8Array; storm: Uint8Array }
const EPS = 1e-9;

// Mean per-round points of row vs column over seeded v1 encounters: calm has no mistakes, storm has both kinds.
export function payoffs(seed: string, repetitions = 20): Payoffs {
  const average = (mode: Mode) => {
    const sum = IDS.map(() => Array<number>(6).fill(0));
    for (let r = 0; r < repetitions; r++) {
      const { matrix } = pairMatrix(PAIRS.map((_, pair) => encounter(seed, r, pair, { label: mode, mode, forgiveness: .1, weights: EQUAL }).summary));
      matrix.forEach((row, i) => row.forEach((x, j) => { sum[i][j] += x / repetitions; }));
    }
    return sum;
  };
  return { calm: average('none'), storm: average('both') };
}

// Eight wrap-around neighbours per cell, cached per grid size.
const tables = new Map<number, Int32Array>();
export function neighbours(size: number) {
  let table = tables.get(size);
  if (!table) {
    table = new Int32Array(size * size * 8);
    for (let i = 0, k = 0; i < size * size; i++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (dx || dy) table[k++] = ((Math.floor(i / size) + dy + size) % size) * size + (i % size + dx + size) % size;
    }
    tables.set(size, table);
  }
  return table;
}

// self: the piece also plays itself (Kaleidoscope, after Nowak & May); the standard grid never does.
export function scores(world: World, m: Payoffs, self = false) {
  const n = world.cells.length, near = neighbours(Math.sqrt(n)), out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = self ? (world.storm[i] ? m.storm : m.calm)[world.cells[i]][world.cells[i]] : 0;
    for (let k = i * 8; k < i * 8 + 8; k++) {
      const j = near[k];
      sum += (world.storm[i] || world.storm[j] ? m.storm : m.calm)[world.cells[i]][world.cells[j]];
    }
    out[i] = sum / (self ? 9 : 8);
  }
  return out;
}

// The neighbour cell i earns least against in the averaged tables (not a searched trace); ties go to the higher scorer.
export function toughest(world: World, m: Payoffs, score: Float64Array, i: number) {
  const near = neighbours(Math.sqrt(world.cells.length));
  const earn = (j: number) => (world.storm[i] || world.storm[j] ? m.storm : m.calm)[world.cells[i]][world.cells[j]];
  let pick = near[i * 8];
  for (let k = i * 8 + 1; k < i * 8 + 8; k++) {
    const j = near[k], d = earn(j) - earn(pick);
    if (d < -EPS || (d < EPS && score[j] > score[pick] + EPS)) pick = j;
  }
  return pick;
}

// Every cell copies the best scorer among itself and its neighbours (itself wins ties), then may mutate.
export function step(world: World, m: Payoffs, mutation: number, key: string, self = false): World {
  const n = world.cells.length, near = neighbours(Math.sqrt(n)), score = scores(world, m, self), next = randomStream(key), cells = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let best = score[i], pick = world.cells[i], count = 0;
    for (let k = i * 8; k < i * 8 + 8; k++) {
      const j = near[k], d = score[j] - best;
      if (d > EPS) { best = score[j]; pick = world.cells[j]; count = 1; }
      else if (count && d > -EPS && boundedInteger(next, 0, count++) === 0) pick = world.cells[j];
    }
    if (mutation && next() / 4294967296 < mutation) pick = boundedInteger(next, 0, 5);
    cells[i] = pick;
  }
  return { cells, storm: world.storm };
}

// Seven kinds: the six strategies plus the designed piece (index 6). Mutation only ever produces the six.
export const census = (cells: Uint8Array) => cells.reduce((c, s) => (c[s]++, c), [0, 0, 0, 0, 0, 0, 0]);

// The designed piece meets the six and itself with the v1 encounter recipe (durations, error rates, 10% forgiveness), under its own key.
export function withCustom(base: Payoffs, custom: Custom, seed: string, repetitions = 20): Payoffs {
  const label = `custom-${custom.first}${custom.afterC}${custom.afterD}${custom.forgives ? 'f' : ''}`, players: Player[] = [...IDS, custom];
  const extend = (m: Matrix, mode: Mode): Matrix => {
    const mine = Array<number>(7).fill(0), theirs = Array<number>(7).fill(0);
    for (let r = 0; r < repetitions; r++) for (let j = 0; j < 7; j++) {
      const key = `${VERSION}|${seed}|${r}|${label}|${j < 6 ? IDS[j] : label}`, rate = (k: string) => randomStream(`${key}|${k}`)() / 4294967296 * .1;
      const rounds = boundedInteger(randomStream(`${key}|length`), 200, 500);
      const { totals } = play(custom, players[j], rounds, key, mode === 'both' ? [rate('action-rate'), rate('observation-rate')] : [0, 0], .1);
      mine[j] += totals[0] / rounds / repetitions; theirs[j] += totals[1] / rounds / repetitions;
    }
    mine[6] = (mine[6] + theirs[6]) / 2; // self-play averages both seats, as pairMatrix does
    return [...m.map((row, i) => [...row, theirs[i]]), mine];
  };
  return { calm: extend(base.calm, 'none'), storm: extend(base.storm, 'both') };
}

// Nowak & May's one-shot game: a cooperator earns 1 per cooperating partner, a defector earns b; nothing else pays.
export function kaleidoscope(b: number, cooperates: (kind: number) => boolean): Payoffs {
  const m = Array.from({ length: 7 }, (_, s) => Array.from({ length: 7 }, (_, o) => cooperates(o) ? (cooperates(s) ? 1 : b) : 0));
  return { calm: m, storm: m };
}

export interface Moment { turn: number; kind: number; text: string }
// Notable turns read from the population history: whole-board takeovers, extinctions, stable lead changes, and peaks since lost.
export function moments(counts: number[][], names: string[]): Moment[] {
  const total = counts[0].reduce((a, b) => a + b, 0), out: (Moment & { rank: number })[] = [], gone = new Set<number>();
  const lead = (row: number[]) => { const top = Math.max(...row); return row.filter(x => x === top).length === 1 ? row.indexOf(top) : -1; };
  let leader = lead(counts[0]);
  for (let t = 1; t < counts.length; t++) {
    const row = counts[t], prev = counts[t - 1];
    row.forEach((n, s) => {
      if (n === total && prev[s] < total) out.push({ turn: t, kind: s, rank: 0, text: `${names[s]} holds every square` });
      if (!n && prev[s] && !gone.has(s) && counts.slice(0, t).some(r => r[s] >= total / 100)) { gone.add(s); out.push({ turn: t, kind: s, rank: 1, text: `${names[s]} dies out` }); }
    });
    const l = lead(row);
    if (l >= 0 && l !== leader && counts.slice(t, t + 3).every(r => lead(r) === l)) { leader = l; out.push({ turn: t, kind: l, rank: 2, text: `${names[l]} takes the lead` }); }
  }
  counts[0].forEach((_, s) => {
    let best = 0;
    counts.forEach((r, t) => { if (r[s] > counts[best][s]) best = t; });
    const peak = counts[best][s];
    if (best > 0 && peak >= total / 10 && counts[counts.length - 1][s] <= peak - total / 10) out.push({ turn: best, kind: s, rank: 3, text: `${names[s]} peaks at ${Math.round(peak / total * 100)}%` });
  });
  return out.sort((a, b) => a.rank - b.rank || a.turn - b.turn).slice(0, 8).sort((a, b) => a.turn - b.turn).map(({ turn, kind, text }) => ({ turn, kind, text }));
}
// A kind that is present never reads 0%, and one that is not alone never reads 100%.
export const share = (n: number, total: number) =>
  n === 0 ? '0%' : n === total ? '100%' : n / total < .005 ? '<1%' : n / total > .995 ? '>99%' : `${Math.round(n / total * 100)}%`;

export const SCENARIOS = {
  mix: { name: 'Even mix', hook: 'All six, scattered at random.' },
  apple: { name: 'One bad apple', hook: 'A trusting world, one defector, a few copycats.' },
  stand: { name: 'Last stand', hook: 'Four Tit for Tats in a world of defectors.' },
  storm: { name: 'Storm front', hook: 'Four nice strategies in stripes. Calm west, stormy east: who survives mistakes?' },
  kaleido: { name: 'Kaleidoscope', hook: 'One defector, a sea of cooperators, a one-shot game. Watch the pattern.' },
} as const;
export type Scenario = keyof typeof SCENARIOS;

export function scenario(name: Scenario, seed: string, size = SIZE): World {
  const n = size * size, cells = new Uint8Array(n), storm = new Uint8Array(n), next = randomStream(`${seed}|scenario|${name}`);
  const block = (x: number, y: number, w: number, s: number) => { for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) cells[(y + dy) * size + x + dx] = s; };
  const c = size >> 1;
  if (name === 'mix') for (let i = 0; i < n; i++) cells[i] = boundedInteger(next, 0, 5);
  // Identical stripes on both halves, so weather is the only difference between west and east.
  if (name === 'storm') for (let i = 0; i < n; i++) { cells[i] = 2 + Math.floor(Math.floor(i / size) * 4 / size); storm[i] = i % size >= c ? 1 : 0; }
  if (name === 'apple') { block(c, c, 1, 1); block(size >> 3, size >> 3, 3, 2); }
  if (name === 'stand') { cells.fill(1); block(c - 1, c - 1, 2, 2); }
  if (name === 'kaleido') block(c, c, 1, 1);
  return { cells, storm };
}
