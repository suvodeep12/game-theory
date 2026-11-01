import { EQUAL, MODES, VERSION, normalized } from './engine.ts';
import type { Condition, Mode } from './engine.ts';
export const TOPICS = ['intro', 'opponents', 'length', 'mistakes', 'incentives', 'forgiveness'] as const;
export type Topic = typeof TOPICS[number];
export interface Config { version: string; topic: Topic; seed: string; mode: Mode; forgiveness: number; weights: number[]; view?: { condition: number; pair: number; repetition: number; round: number } }
export const DEFAULT: Config = { version: VERSION, topic: 'intro', seed: 'curiosity', mode: 'both', forgiveness: .1, weights: [...EQUAL] };
export const COPY: Record<Exclude<Topic, 'intro'>, { tab: string; question: string; description: string; application: string; limit: string }> = {
  opponents: { tab: 'Who you meet', question: 'Does who you meet change what works?', description: 'Compare the same rules in different mixes of opponents.', application: 'The behaviours you repeatedly encounter may change which responses are productive.', limit: 'These rules cannot choose partners, leave relationships, negotiate, or learn. A population mix is an encounter frequency, not evolution.' },
  length: { tab: 'How long you play', question: 'What changes over a longer encounter?', description: 'Explore naturally sampled encounter lengths, with the same fixed bounds.', application: 'Repeated contact can accumulate the consequences of a response.', limit: 'This is an observational comparison within 200 to 500 rounds. Error rates also vary. It does not establish a causal effect of duration; none of these rules anticipates the ending.' },
  mistakes: { tab: 'Mistakes & misunderstandings', question: 'Can a small mistake change everything?', description: 'Explore what happens when an action goes wrong, or an action is misread.', application: 'A mistaken action and a mistaken observation can call for different responses. In life, clarification may help interrupt a cycle.', limit: 'Players cannot clarify intentions here. Random flips do not model emotion or all human mistakes. Win-Stay, Lose-Shift sees its true payoff, so a mistaken observation may not mislead it.' },
  incentives: { tab: 'The incentives', question: 'Why is cooperation a dilemma?', description: 'An immediate advantage can conflict with a better shared outcome.', application: 'Notice when an immediate reward and a shared long-term benefit point in different directions.', limit: 'Payoffs stay fixed. These runs cannot establish what would happen with different incentives or how people would respond to them.' },
  forgiveness: { tab: 'Forgiveness', question: 'When does forgiveness help?', description: 'Change one rule’s willingness to cooperate after an observed defection.', application: 'A response that permits recovery may preserve mutual benefit, while repeated concessions can be exploited.', limit: 'Random forgiveness is not trust repair, accountability, or remorse. These results never imply an obligation to remain in a harmful relationship.' }
};
export function validateConfig(value: unknown): Config {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This experiment link has no valid settings.');
  const c = value as Record<string, unknown>;
  if (Object.keys(c).some(key => !['version', 'topic', 'seed', 'mode', 'forgiveness', 'weights', 'view'].includes(key))) throw new Error('This link attempts to change unsupported settings.');
  if (c.version !== VERSION) throw new Error('This link uses an unsupported rules version.');
  if (!TOPICS.includes(c.topic as Topic) || !MODES.includes(c.mode as Mode)) throw new Error('Choose a supported topic and error mode.');
  if (typeof c.seed !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(c.seed)) throw new Error('A seed must contain 1 to 64 letters, digits, underscores, or hyphens.');
  if (typeof c.forgiveness !== 'number' || !Number.isFinite(c.forgiveness) || c.forgiveness < 0 || c.forgiveness > 1) throw new Error('Forgiveness must be between 0 and 100%.');
  if (!Array.isArray(c.weights) || c.weights.some(x => typeof x !== 'number')) throw new Error('Opponent weights must be numbers.');
  normalized(c.weights as number[]);
  if (c.view !== undefined) {
    if (!c.view || typeof c.view !== 'object' || Array.isArray(c.view)) throw new Error('Invalid encounter selection.');
    const v = c.view as Record<string, unknown>;
    if (Object.keys(v).some(k => !['condition', 'pair', 'repetition', 'round'].includes(k))) throw new Error('Unsupported encounter selection.');
    const limits = { condition: c.topic === 'mistakes' ? 3 : c.topic === 'opponents' || c.topic === 'forgiveness' ? 1 : 0, pair: 20, repetition: 99, round: 499 };
    for (const [key, maximum] of Object.entries(limits)) if (typeof v[key] !== 'number' || !Number.isInteger(v[key]) || (v[key] as number) < 0 || (v[key] as number) > maximum) throw new Error('Encounter selection is outside this experiment.');
  }
  return structuredClone(c) as unknown as Config;
}
export function conditions(c: Config): Condition[] {
  const base: Condition = { label: 'Selected settings', mode: c.mode, forgiveness: c.forgiveness, weights: c.weights };
  if (c.topic === 'mistakes') return MODES.map(mode => ({ ...base, mode, label: ({ none: 'No errors', action: 'Action errors', observation: 'Observation errors', both: 'Both error types' })[mode] }));
  if (c.topic === 'opponents') return [{ ...base, label: 'Equal mix', weights: [...EQUAL] }, { ...base, label: 'Your opponent mix' }];
  if (c.topic === 'forgiveness') return [{ ...base, label: '10% forgiveness', forgiveness: .1 }, { ...base, label: `${Math.round(c.forgiveness * 100)}% forgiveness` }];
  return [base];
}
export function shareURL(c: Config, base: string) {
  const url = new URL(base); url.hash = `run=${encodeURIComponent(JSON.stringify(validateConfig(c)))}`; return url.href;
}
export function readLink(hash: string): Config {
  if (!hash.startsWith('#run=') || hash.length > 24581) throw new Error('This is not a supported experiment link.');
  try {
    const decoded = decodeURIComponent(hash.slice(5));
    if (new TextEncoder().encode(decoded).length > 8192) throw new Error();
    return validateConfig(JSON.parse(decoded));
  } catch (error) {
    if (error instanceof Error && !['URIError', 'SyntaxError'].includes(error.name) && error.message) throw error;
    throw new Error('The experiment link is damaged or too large.');
  }
}
