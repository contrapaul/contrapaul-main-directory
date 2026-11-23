import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SITES } from '../js/sites.js';

const rows = (file) => [...readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  .matchAll(/<li><a href="([^"]+)">([^<]+)<\/a><span>([^<]+)<\/span><\/li>/g)]
  .map((m) => ({ url: m[1], name: m[2], description: m[3] }));

const expected = SITES.map(({ url, name, description }) => ({ url, name, description }));

test('sites.html lists exactly the SITES, in order', () => {
  assert.deepEqual(rows('sites.html'), expected);
});

test('index.html no-JS list matches SITES, plus About', () => {
  const r = rows('index.html');
  assert.deepEqual(r.slice(0, -1), expected);
  assert.equal(r.at(-1).url, 'about.html');
});
