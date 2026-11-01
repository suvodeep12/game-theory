import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const { default: puppeteer } = await import(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true });
try {
  const page = await browser.newPage(), requests = [], errors = [];
  page.on('request', r => requests.push(r.url())); page.on('pageerror', e => errors.push(e.message));
  const config = { version: '1', topic: 'mistakes', seed: 'curiosity', mode: 'both', forgiveness: .1, weights: [1, 1, 1, 1, 1, 1] };
  await page.goto('http://127.0.0.1:4173/#run=' + encodeURIComponent(JSON.stringify(config)));
  await page.waitForSelector('.player-score');
  const reference = JSON.parse(readFileSync('docs/verification/avatar-scores-browser.json', 'utf8')).reference;
  assert.deepEqual(await page.$$eval('.player-points strong', es => es.map(e => Number(e.textContent.replaceAll(',', '')))), reference.sums);
  assert.deepEqual(await page.$$eval('.outcome-comparison dd', es => es.map(e => e.firstChild.textContent.trim())), ['73.9%', '46.4%', '47.9%', '44.5%']);
  await page.evaluate(async () => { const im = new Image(); im.src = '/avatars/strategies-v2.png'; await im.decode(); });
  await page.click('.score-details>summary');
  for (const s of await page.$$('.score-details summary')) if ((await s.evaluate(e => e.textContent)).includes('all 100')) await s.click();
  assert.equal(await page.$$eval('.table-scroll.tall tbody tr', es => es.length), 100);
  await page.setViewport({ width: 360, height: 900 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  assert.ok(requests.every(u => u.startsWith('http://127.0.0.1:4173/') || u.startsWith('blob:http://127.0.0.1:4173/')));
  const report = { browser: await browser.version(), fixture: config, rawScoresMatch: true, fourCooperationValuesMatch: true, avatarLoads: true, repetitionRows: 100, mobileOverflow: false, externalRequests: [], pageErrors: errors };
  writeFileSync('docs/verification/production-browser.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
