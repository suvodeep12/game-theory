import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const files = ['README.md', 'PRODUCT.md', 'DESIGN.md', 'AGENTS.md'];
function walk(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const next = `${path}/${entry.name}`;
    if (entry.isDirectory()) walk(next);
    else if (next.endsWith('.md')) files.push(next);
  }
}
walk('docs');
const broken = [];
for (const file of files) for (const match of readFileSync(file, 'utf8').matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
  const link = match[1].replace(/^<|>$/g, '').split('#')[0];
  if (!link || /^[a-z][a-z0-9+.-]*:/i.test(link)) continue;
  if (!existsSync(resolve(dirname(file), decodeURIComponent(link)))) broken.push({ file, link });
}
console.log(JSON.stringify({ checkedMarkdown: files.length, brokenLocalTargets: broken }, null, 2));
if (broken.length) process.exitCode = 1;
