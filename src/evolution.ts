import { IDS, PAIRS, EQUAL, encounter, pairMatrix, randomStream, boundedInteger } from './engine.ts';
import type { Mode } from './engine.ts';

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

export function scores(world: World, m: Payoffs) {
  const n = world.cells.length, near = neighbours(Math.sqrt(n)), out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = i * 8; k < i * 8 + 8; k++) {
      const j = near[k];
      sum += (world.storm[i] || world.storm[j] ? m.storm : m.calm)[world.cells[i]][world.cells[j]];
    }
    out[i] = sum / 8;
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
export function step(world: World, m: Payoffs, mutation: number, key: string): World {
  const n = world.cells.length, near = neighbours(Math.sqrt(n)), score = scores(world, m), next = randomStream(key), cells = new Uint8Array(n);
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

export const census = (cells: Uint8Array) => cells.reduce((c, s) => (c[s]++, c), [0, 0, 0, 0, 0, 0]);

export const SCENARIOS = {
  mix: { name: 'Even mix', hook: 'All six, scattered at random.' },
  apple: { name: 'One bad apple', hook: 'A trusting world, one defector, a few copycats.' },
  stand: { name: 'Last stand', hook: 'Four Tit for Tats in a world of defectors.' },
  storm: { name: 'Storm front', hook: 'Four nice strategies in stripes. Calm west, stormy east: who survives mistakes?' },
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
  return { cells, storm };
}
