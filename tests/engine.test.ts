import { test } from 'node:test';
import assert from 'node:assert/strict';
import { payoff, play, PAIRS, encounter, tournament, aggregate, normalized, boundedInteger } from '../src/engine.ts';
import type { Condition, Encounter } from '../src/engine.ts';
const base: Condition = { label: 'Test', mode: 'none', forgiveness: .1, weights: [1, 0, 0, 0, 0, 0] };
test('payoffs are correct from both perspectives', () => {
  assert.deepEqual(payoff(0, 0), [3, 3]); assert.deepEqual(payoff(0, 1), [0, 5]);
  assert.deepEqual(payoff(1, 0), [5, 0]); assert.deepEqual(payoff(1, 1), [1, 1]);
});
test('constant rules and reactive opening match hand-derived scores', () => {
  assert.deepEqual(play('cooperate', 'cooperate', 5, 'a', [0, 0], .1).totals, [15, 15]);
  assert.deepEqual(play('defect', 'defect', 5, 'a', [0, 0], .1).totals, [5, 5]);
  assert.deepEqual(play('cooperate', 'defect', 5, 'a', [0, 0], .1).totals, [0, 25]);
  const tft = play('titfortat', 'defect', 5, 'a', [0, 0], .1, true);
  assert.deepEqual(tft.totals, [4, 9]);
  assert.deepEqual(tft.trace.map(r => r.actual), [[0, 1], [1, 1], [1, 1], [1, 1], [1, 1]]);
  assert.deepEqual(play('wsls', 'defect', 5, 'a', [0, 0], .1, true).trace.map(r => r.actual[0]), [0, 1, 0, 1, 0]);
});
test('observation mistakes trigger Grim independently of actual actions, then reset', () => {
  const trace = play('grim', 'cooperate', 5, 'a', [0, 1], .1, true).trace;
  assert.deepEqual(trace.map(r => r.actual[0]), [0, 1, 1, 1, 1]);
  assert.deepEqual(trace[0].observed, [1, 1]);
  assert.deepEqual(play('grim', 'cooperate', 5, 'a', [0, 0], .1).totals, [15, 15]);
});
test('forgiveness endpoints and actual-action payoff feedback', () => {
  assert.deepEqual(play('generous', 'defect', 5, 'a', [0, 0], 0).totals, [4, 9]);
  assert.deepEqual(play('generous', 'defect', 5, 'a', [0, 0], 1).totals, [0, 25]);
  assert.deepEqual(play('wsls', 'defect', 5, 'a', [0, 1], .1).totals, play('wsls', 'defect', 5, 'a', [0, 0], .1).totals);
  assert.deepEqual(play('cooperate', 'cooperate', 5, 'a', [1, 0], .1).totals, [5, 5]);
});
test('schedule and self-play roles are independent', () => {
  assert.equal(PAIRS.length, 21); assert.equal(new Set(PAIRS.map(String)).size, 21);
  assert.equal(PAIRS.filter(([a, b]) => a === b).length, 6);
  const trace = play('cooperate', 'cooperate', 500, 'self', [.5, 0], .1, true).trace;
  assert.ok(trace.some(r => r.actual[0] !== r.actual[1]));
});
test('uniform integer mapping includes both bounds and rejects the biased tail', () => {
  const draws = [4294967295, 0, 300];
  assert.equal(boundedInteger(() => draws.shift()!, 200, 500), 200);
  assert.equal(boundedInteger(() => draws.shift()!, 200, 500), 500);
});
test('replay is exact and matched streams survive changed behaviour', () => {
  const pair = PAIRS.findIndex(([a, b]) => a === 4 && b === 4);
  const first = encounter('sample', 8, pair, { ...base, mode: 'both' }, true);
  assert.deepEqual(first, encounter('sample', 8, pair, { ...base, mode: 'both' }, true));
  const changed = encounter('sample', 8, pair, { ...base, mode: 'both', forgiveness: 1 }, true);
  assert.equal(first.summary.rounds, changed.summary.rounds);
  assert.deepEqual(first.summary.rates, changed.summary.rates);
  assert.deepEqual(first.trace.map(r => r.actual.map((x, i) => x ^ r.intended[i])), changed.trace.map(r => r.actual.map((x, i) => x ^ r.intended[i])));
});
test('self-play is averaged once and variable durations do not weight scores by length', () => {
  const batch: Encounter[] = PAIRS.map((_, pair) => ({ pair, repetition: 0, rounds: 10 + pair, rates: [0, 0], totals: [(10 + pair) * 2, (10 + pair) * 4], cooperation: [10 + pair, 0] }));
  const onlyCoop = aggregate(batch, [1, 0, 0, 0, 0, 0]);
  assert.equal(onlyCoop.scores[0], 3); assert.equal(onlyCoop.scores[1], 4);
  assert.equal(onlyCoop.collective, 3); assert.equal(onlyCoop.cooperation, .5);
  const equal = aggregate(batch, [1, 1, 1, 1, 1, 1]);
  assert.ok(Math.abs(equal.scores[0] - 13 / 6) < 1e-12);
  assert.throws(() => normalized([0, 0, 0, 0, 0, 0]));
});
test('full seeded tournament has 2100 bounded encounters, correct population and reproducible replay', () => {
  const result = tournament('reference', base);
  assert.equal(result.encounters.length, 2100); assert.equal(result.repetitions.length, 100);
  assert.deepEqual(result.scores, [3, 5, 3, 3, 3, 3]);
  assert.equal(result.collective, 3); assert.equal(result.cooperation, 1);
  for (const e of result.encounters) assert.ok(Number.isInteger(e.rounds) && e.rounds >= 200 && e.rounds <= 500);
  assert.deepEqual(encounter('reference', 99, 20, base, true).summary, result.encounters.at(-1));
});
