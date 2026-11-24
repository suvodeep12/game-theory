export const VERSION = '1';
export const IDS = ['cooperate', 'defect', 'titfortat', 'grim', 'generous', 'wsls'] as const;
export type Strategy = typeof IDS[number];
export type Action = 0 | 1;
export type Mode = 'none' | 'action' | 'observation' | 'both';
export const MODES: Mode[] = ['none', 'action', 'observation', 'both'];
export const NAMES = ['Always Cooperate', 'Always Defect', 'Tit for Tat', 'Grim Trigger', 'Generous Tit for Tat', 'Win-Stay, Lose-Shift'];
export const RULES = ['Cooperate every round.', 'Defect every round.', 'Cooperate first, then copy the last observed action.', 'Cooperate until an observed defection, then always defect.', 'Copy the opponent, with a chance to forgive a defection.', 'Repeat the last actual action after 3 or 5 points; otherwise switch.'];
export const PAIRS: [number, number][] = IDS.flatMap((_, a) => IDS.slice(a).map((_, offset) => [a, a + offset] as [number, number]));
export const EQUAL = [1, 1, 1, 1, 1, 1];
export interface Condition { label: string; mode: Mode; forgiveness: number; weights: number[] }
export interface Round { round: number; intended: [Action, Action]; actual: [Action, Action]; observed: [Action, Action]; points: [number, number] }
export interface Encounter { pair: number; repetition: number; rounds: number; rates: [number, number]; totals: [number, number]; cooperation: [number, number] }
export interface Repetition { scores: number[]; collective: number; cooperation: number; gap: number }
export interface Result { condition: Condition; encounters: Encounter[]; repetitions: Repetition[]; scores: number[]; collective: number; cooperation: number; gap: number }

// Pinned cyrb128 seed expansion and sfc32 stream; changing either requires a rules-version change.
export function randomStream(key: string) {
  let a = 1779033703, b = 3144134277, c = 1013904242, d = 2773480762;
  for (let i = 0; i < key.length; i++) {
    const k = key.charCodeAt(i);
    a = b ^ Math.imul(a ^ k, 597399067); b = c ^ Math.imul(b ^ k, 2869860233);
    c = d ^ Math.imul(c ^ k, 951274213); d = a ^ Math.imul(d ^ k, 2716044179);
  }
  a = Math.imul(c ^ (a >>> 18), 597399067); b = Math.imul(d ^ (b >>> 22), 2869860233);
  c = Math.imul(a ^ (c >>> 17), 951274213); d = Math.imul(b ^ (d >>> 19), 2716044179);
  const x = (a ^ b ^ c ^ d) >>> 0, y = (b ^ a) >>> 0, z = (c ^ a) >>> 0, w = (d ^ a) >>> 0;
  a = x; b = y; c = z; d = w;
  return () => {
    a |= 0; b |= 0; c |= 0; d |= 0;
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0;
    c = ((c << 21) | (c >>> 11)); c = (c + t) | 0;
    return t >>> 0;
  };
}
export function boundedInteger(next: () => number, minimum: number, maximum: number) {
  const span = maximum - minimum + 1, limit = Math.floor(4294967296 / span) * span;
  let value: number;
  do { value = next(); } while (value >= limit);
  return minimum + value % span;
}
export function normalized(weights: number[]) {
  if (weights.length !== 6 || weights.some(x => !Number.isFinite(x) || x < 0 || x > 100)) throw new Error('Use six weights between 0 and 100.');
  const total = weights.reduce((s, x) => s + x, 0);
  if (!total) throw new Error('Give at least one strategy a positive weight.');
  return weights.map(x => x / total);
}
export function payoff(a: Action, b: Action): [number, number] {
  return a === b ? (a === 0 ? [3, 3] : [1, 1]) : (a === 0 ? [0, 5] : [5, 0]);
}
// A piece designed on the board: a reactive rule. The six v1 strategies and their encounters are unchanged.
export interface Custom { first: Action; afterC: Action; afterD: Action; forgives: boolean }
export type Player = Strategy | Custom;
interface State { own: Action; seen: Action; points: number; triggered: boolean }
function intention(id: Player, state: State, round: number, forgiveness: number, draw: number): Action {
  if (typeof id === 'object') return round === 0 ? id.first : state.seen === 0 ? id.afterC : id.forgives && draw < forgiveness ? 0 : id.afterD;
  if (id === 'cooperate') return 0;
  if (id === 'defect') return 1;
  if (round === 0) return 0;
  if (id === 'grim') return state.triggered ? 1 : 0;
  if (id === 'wsls') return state.points === 3 || state.points === 5 ? state.own : (1 - state.own) as Action;
  if (id === 'generous' && state.seen === 1 && draw < forgiveness) return 0;
  return state.seen;
}
const valid = (p: Player) => typeof p === 'object' ? [p.first, p.afterC, p.afterD].every(x => x === 0 || x === 1) : IDS.includes(p);
export function play(a: Player, b: Player, rounds: number, key: string, rates: [number, number], forgiveness: number, capture = false) {
  if (!valid(a) || !valid(b) || !Number.isInteger(rounds) || rounds < 1 || rounds > 500 || rates.some(x => !Number.isFinite(x) || x < 0 || x > 1) || !Number.isFinite(forgiveness) || forgiveness < 0 || forgiveness > 1) throw new Error('Invalid encounter settings.');
  const streams = ['action-0', 'action-1', 'observation-0', 'observation-1', 'forgive-0', 'forgive-1'].map(event => randomStream(`${key}|${event}`));
  const states: State[] = [0, 1].map(() => ({ own: 0, seen: 0, points: 3, triggered: false }));
  const totals: [number, number] = [0, 0], cooperation: [number, number] = [0, 0], trace: Round[] = [];
  for (let round = 0; round < rounds; round++) {
    const draws = streams.map(next => next() / 4294967296);
    const intended: [Action, Action] = [intention(a, states[0], round, forgiveness, draws[4]), intention(b, states[1], round, forgiveness, draws[5])];
    const actual = intended.map((x, player) => (draws[player] < rates[0] ? 1 - x : x)) as [Action, Action];
    const observed = [actual[1], actual[0]].map((x, player) => (draws[player + 2] < rates[1] ? 1 - x : x)) as [Action, Action];
    const points = payoff(...actual);
    for (let player = 0; player < 2; player++) {
      totals[player] += points[player]; cooperation[player] += actual[player] === 0 ? 1 : 0;
      states[player] = { own: actual[player], seen: observed[player], points: points[player], triggered: states[player].triggered || observed[player] === 1 };
    }
    if (capture) trace.push({ round: round + 1, intended, actual, observed, points });
  }
  return { totals, cooperation, trace };
}
export function encounter(seed: string, repetition: number, pair: number, condition: Condition, capture = false) {
  const [a, b] = PAIRS[pair];
  const key = `${VERSION}|${seed}|${repetition}|${IDS[a]}|${IDS[b]}`;
  const rounds = boundedInteger(randomStream(`${key}|length`), 200, 500);
  const action = randomStream(`${key}|action-rate`)() / 4294967296 * 0.1;
  const observation = randomStream(`${key}|observation-rate`)() / 4294967296 * 0.1;
  const rates: [number, number] = [condition.mode === 'action' || condition.mode === 'both' ? action : 0, condition.mode === 'observation' || condition.mode === 'both' ? observation : 0];
  const played = play(IDS[a], IDS[b], rounds, key, rates, condition.forgiveness, capture);
  const summary: Encounter = { pair, repetition, rounds, rates, totals: played.totals, cooperation: played.cooperation };
  return { summary, trace: played.trace };
}
export const mean = (values: number[]) => values.reduce((sum, x) => sum + x, 0) / values.length;
// Per-round points and cooperation of row strategy against column strategy, from one repetition's 21 encounters.
export function pairMatrix(encounters: Encounter[]) {
  const matrix = IDS.map(() => Array<number>(6).fill(0)), cooperation = IDS.map(() => Array<number>(6).fill(0));
  for (const e of encounters) {
    const [a, b] = PAIRS[e.pair];
    if (a === b) {
      matrix[a][a] = (e.totals[0] + e.totals[1]) / (2 * e.rounds);
      cooperation[a][a] = (e.cooperation[0] + e.cooperation[1]) / (2 * e.rounds);
    } else {
      matrix[a][b] = e.totals[0] / e.rounds; matrix[b][a] = e.totals[1] / e.rounds;
      cooperation[a][b] = e.cooperation[0] / e.rounds; cooperation[b][a] = e.cooperation[1] / e.rounds;
    }
  }
  return { matrix, cooperation };
}
export function aggregate(encounters: Encounter[], weights: number[]): Repetition {
  const w = normalized(weights), { matrix, cooperation } = pairMatrix(encounters);
  const scores = matrix.map(row => row.reduce((sum, x, j) => sum + x * w[j], 0));
  return { scores, collective: scores.reduce((sum, x, i) => sum + x * w[i], 0), cooperation: cooperation.reduce((sum, row, i) => sum + w[i] * row.reduce((s, x, j) => s + x * w[j], 0), 0), gap: Math.max(...scores) - Math.min(...scores) };
}
export function tournament(seed: string, condition: Condition, progress?: (repetition: number) => void): Result {
  const encounters: Encounter[] = [], repetitions: Repetition[] = [];
  for (let repetition = 0; repetition < 100; repetition++) {
    const batch = PAIRS.map((_, pair) => encounter(seed, repetition, pair, condition).summary);
    encounters.push(...batch); repetitions.push(aggregate(batch, condition.weights)); progress?.(repetition + 1);
  }
  const scores = IDS.map((_, i) => mean(repetitions.map(r => r.scores[i])));
  return { condition, encounters, repetitions, scores, collective: mean(repetitions.map(r => r.collective)), cooperation: mean(repetitions.map(r => r.cooperation)), gap: Math.max(...scores) - Math.min(...scores) };
}
