import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EQUAL, PAIRS, encounter } from '../src/engine.ts';
import type { Result } from '../src/engine.ts';
import { roundTotals, tournamentScores } from '../src/scores.ts';

test('cumulative tournament points count actual games, both self-play roles, and an exact partial game', () => {
  const condition = { label: 'Test', mode: 'none' as const, forgiveness: .1, weights: EQUAL };
  const self = encounter('score-test', 0, 0, condition, true);
  const other = encounter('score-test', 0, PAIRS.findIndex(([a, b]) => a === 0 && b === 1), condition, true);
  const result: Result = { condition, encounters: [self.summary, other.summary], repetitions: [], scores: [], collective: 0, cooperation: 0, gap: 0 };
  assert.deepEqual(tournamentScores(result, 'score-test', 0).points, [0, 0, 0, 0, 0, 0]);
  assert.deepEqual(tournamentScores(result, 'score-test', 1).points, [6, 0, 0, 0, 0, 0]);
  const partial = tournamentScores(result, 'score-test', self.summary.rounds + 2);
  assert.deepEqual(partial.points, [self.summary.rounds * 6, 10, 0, 0, 0, 0]);
  assert.deepEqual(partial.played, [self.summary.rounds * 2 + 2, 2, 0, 0, 0, 0]);
  assert.equal(partial.played.reduce((a, b) => a + b, 0), 2 * (self.summary.rounds + 2));
  const full = tournamentScores(result, 'score-test', partial.totalRounds);
  assert.deepEqual(full.points, [self.summary.rounds * 6, other.summary.rounds * 5, 0, 0, 0, 0]);
  assert.deepEqual(roundTotals(other.trace, 2), [0, 10]);
  for (const rounds of [-1, .5, NaN, partial.totalRounds + 1]) assert.throws(() => tournamentScores(result, 'score-test', rounds));
  assert.throws(() => roundTotals(other.trace, other.trace.length + 1));
});
