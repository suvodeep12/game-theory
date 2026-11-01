import { tournament } from './engine.ts';
import { validateConfig, conditions } from './experiments.ts';
import type { Config } from './experiments.ts';
import type { Result } from './engine.ts';
export type WorkerReply = { type: 'progress'; done: number; total: number } | { type: 'complete'; results: Result[]; milliseconds: number } | { type: 'error'; message: string };
self.onmessage = (event: MessageEvent<Config>) => {
  try {
    const config = validateConfig(event.data), list = conditions(config), started = performance.now();
    const results = list.map((condition, index) => tournament(config.seed, condition, repetition => {
      if (repetition % 5 === 0) self.postMessage({ type: 'progress', done: index * 100 + repetition, total: list.length * 100 } satisfies WorkerReply);
    }));
    self.postMessage({ type: 'complete', results, milliseconds: performance.now() - started } satisfies WorkerReply);
  } catch (error) { self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'The experiment could not finish.' } satisfies WorkerReply); }
};
