import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT, readLink, shareURL, validateConfig, conditions } from '../src/experiments.ts';
test('all allowed settings and encounter selection survive sharing', () => {
  const config = { ...DEFAULT, topic: 'mistakes' as const, weights: [5, 50, 5, 20, 10, 10], view: { condition: 2, pair: 7, repetition: 54, round: 100 } };
  const url = shareURL(config, 'https://example.com/tool/');
  assert.deepEqual(readLink(new URL(url).hash), config);
  assert.equal(new URL(url).pathname, '/tool/');
});
test('reject damaged, huge, incompatible and rule-overriding links', () => {
  for (const hash of ['#bad', '#run=%xx', '#run=[]', '#run='+ 'a'.repeat(25000)]) assert.throws(() => readLink(hash));
  for (const update of [{ version: '2' }, { rounds: 10 }, { mode: 'random' }, { seed: '<script>' }, { forgiveness: NaN }, { forgiveness: 1.1 }, { weights: [0, 0, 0, 0, 0, 0] }, { weights: ['1', 1, 1, 1, 1, 1] }, { view: { condition: 4, pair: 0, repetition: 0, round: 0 } }]) assert.throws(() => validateConfig({ ...DEFAULT, ...update }));
});
test('guided comparisons change only the named setting', () => {
  assert.equal(conditions({ ...DEFAULT, topic: 'mistakes' }).length, 4);
  const forgiveness = conditions({ ...DEFAULT, topic: 'forgiveness', forgiveness: .9 });
  assert.deepEqual(forgiveness.map(c => c.forgiveness), [.1, .9]);
  const mix = conditions({ ...DEFAULT, topic: 'opponents', weights: [10, 50, 10, 10, 10, 10] });
  assert.deepEqual(mix[0].weights, [1, 1, 1, 1, 1, 1]);
  assert.deepEqual(mix[1].weights, [10, 50, 10, 10, 10, 10]);
});
