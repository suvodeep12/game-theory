import { test } from 'node:test';
import assert from 'node:assert/strict';
import { census, kaleidoscope, moments, neighbours, payoffs, scenario, scores, share, step, toughest, withCustom } from '../src/evolution.ts';
import { play } from '../src/engine.ts';
import type { Payoffs, World } from '../src/evolution.ts';

const m = payoffs('curiosity', 5);
const world = (size: number, fill: number, extra: [number, number][] = []): World => {
  const cells = new Uint8Array(size * size).fill(fill);
  for (const [i, s] of extra) cells[i] = s;
  return { cells, storm: new Uint8Array(size * size) };
};

test('payoff tables come from v1 encounters: calm is exact, storm makes mutual Tit for Tat worse', () => {
  assert.equal(m.calm[0][1], 0); assert.equal(m.calm[1][0], 5); assert.equal(m.calm[2][2], 3);
  assert.ok(m.storm[2][2] < 2.9 && m.storm[5][5] > m.storm[2][2]);
});
test('neighbours wrap around the edges', () => {
  assert.deepEqual([...neighbours(4).subarray(0, 8)].sort((a, b) => a - b), [1, 3, 4, 5, 7, 12, 13, 15]);
});
test('scores average the eight neighbours, using the storm table if either side is stormy', () => {
  const w = world(5, 0, [[12, 1]]);
  assert.equal(scores(w, m)[12], 5); assert.equal(scores(w, m)[6], 7 * 3 / 8);
  w.storm[6] = 1;
  const s = scores(w, m);
  assert.ok(Math.abs(s[6] - (7 * m.storm[0][0] + m.storm[0][1]) / 8) < 1e-12);
  assert.ok(Math.abs(s[12] - (7 * 5 + m.storm[1][0]) / 8) < 1e-12);
});
test('a defector among cooperators spreads one ring per generation; ties keep their own strategy', () => {
  const next = step(world(7, 0, [[24, 1]]), m, 0, 'k');
  assert.equal(census(next.cells)[1], 9);
  const calm = world(6, 2, [[0, 0], [7, 3], [14, 5]]);
  assert.deepEqual(step(calm, m, 0, 'k').cells, calm.cells);
});
test('a small Tit for Tat team invades a world of defectors', () => {
  let w = scenario('stand', 'x', 16);
  for (let g = 0; g < 12; g++) w = step(w, m, 0, `x|${g}`);
  assert.equal(census(w.cells)[2], 256);
});
test('steps are reproducible from the same key, and mutation only acts when enabled', () => {
  const start = scenario('mix', 's', 12);
  assert.deepEqual(step(start, m, .5, 'a').cells, step(start, m, .5, 'a').cells);
  assert.notDeepEqual(step(start, m, .5, 'a').cells, step(start, m, 0, 'a').cells);
});
test('inspector duel: toughest neighbour is the one a cell earns least against, ties go to the higher scorer', () => {
  const w = world(4, 0, [[1, 1]]);
  assert.equal(toughest(w, m, scores(w, m), 0), 1); // cooperator next to a defector duels the defector
  const v = world(4, 0, [[10, 1]]), s = scores(v, m);
  assert.equal(s[toughest(v, m, s, 0)], 3); // all-cooperator neighbours tie, so it picks one untouched by the defector
});
test('share labels never hide a present kind or claim a whole board that is not whole', () => {
  assert.deepEqual([0, 1, 11, 12, 1152, 2292, 2303, 2304].map(n => share(n, 2304)), ['0%', '<1%', '<1%', '1%', '50%', '99%', '>99%', '100%']);
});
test('a designed piece that copies Tit for Tat plays exactly like it, and joins the tables as kind 6', () => {
  const clone = { first: 0, afterC: 0, afterD: 1, forgives: false } as const;
  for (const rival of ['defect', 'grim', 'wsls'] as const) assert.deepEqual(play(clone, rival, 300, 'k', [.05, .05], .1), play('titfortat', rival, 300, 'k', [.05, .05], .1));
  const t = withCustom(m, clone, 'curiosity', 5);
  assert.equal(t.calm.length, 7); assert.ok(t.calm.every(row => row.length === 7));
  assert.equal(t.calm[6][6], 3); assert.equal(t.calm[6][0], 3);
  assert.ok(t.calm[1][6] > 1 && t.calm[1][6] < 1.03); // a defector gets 5 once, then 1s, over 200-500 rounds
});
test('Kaleidoscope: one defector in a sea of cooperators grows a pattern with four-fold symmetry', () => {
  const n = 21, k = kaleidoscope(1.85, s => s !== 1);
  let w = scenario('kaleido', 'z', n);
  for (let g = 0; g < 9; g++) w = step(w, k, 0, `z|${g}`, true);
  const at = (x: number, y: number) => w.cells[y * n + x];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { assert.equal(at(x, y), at(y, x)); assert.equal(at(x, y), at(n - 1 - x, y)); }
  assert.ok(census(w.cells)[1] > 1 && census(w.cells)[0] > 1);
});
test('moments: lead changes that hold, extinctions, peaks since lost, whole-board takeovers', () => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'], row = (a: number, b: number, c: number) => [a, b, c, 0, 0, 0, 0];
  const counts = [row(9, 1, 0), row(6, 4, 0), row(3, 6, 1), row(1, 6, 3), row(0, 4, 6), row(0, 2, 8), row(0, 0, 10)];
  assert.deepEqual(moments(counts, names).map(x => `${x.turn} ${x.text}`), ['2 B peaks at 60%', '4 A dies out', '4 C takes the lead', '6 C holds every square', '6 B dies out']); // B led for only two turns, so its lead is not a moment
  assert.equal(moments([row(5, 5, 0), row(4, 6, 0), row(4, 6, 0), row(4, 6, 0)], names)[0].text, 'B takes the lead');
});
