import { IDS, PAIRS, encounter } from './engine.ts';
import type { Result, Round } from './engine.ts';

export function roundTotals(trace: Round[], rounds: number): [number, number] {
  if (!Number.isInteger(rounds) || rounds < 0 || rounds > trace.length) throw new Error('Round is outside this encounter.');
  return trace.slice(0, rounds).reduce<[number, number]>((sum, row) => [sum[0] + row.points[0], sum[1] + row.points[1]], [0, 0]);
}

export function tournamentScores(result: Result, seed: string, rounds: number) {
  const totalRounds = result.encounters.reduce((sum, e) => sum + e.rounds, 0);
  if (!Number.isInteger(rounds) || rounds < 0 || rounds > totalRounds) throw new Error('Round is outside this tournament.');
  const points = IDS.map(() => 0), played = IDS.map(() => 0);
  let remaining = rounds;
  // Encounter summaries cover completed games; only the boundary game needs an exact replay.
  for (const e of result.encounters) {
    if (!remaining) break;
    const count = Math.min(remaining, e.rounds), [a, b] = PAIRS[e.pair];
    const earned = count === e.rounds ? e.totals : roundTotals(encounter(seed, e.repetition, e.pair, result.condition, true).trace, count);
    points[a] += earned[0]; points[b] += earned[1];
    played[a] += count; played[b] += count;
    remaining -= count;
  }
  return { points, played, totalRounds };
}
