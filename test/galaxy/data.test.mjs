import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SITES } from '../../galaxy/js/sites.js';
import { NODES, indexNodes } from '../../galaxy/js/network.js';

const { byId, children } = indexNodes(NODES);

test('ids are unique and parents exist', () => {
  assert.equal(byId.size, NODES.length);
  for (const n of NODES) if (n.parent) assert.ok(byId.has(n.parent), `${n.id} parent ${n.parent}`);
});

test('id is parent id plus one segment', () => {
  for (const n of NODES) {
    if (!n.parent) continue;
    if (n.parent === 'root') assert.match(n.id, /^[a-z0-9-]+$/, n.id);
    else assert.match(n.id, new RegExp(`^${n.parent}/[a-z0-9-]+$`), n.id);
  }
});

test('every site has a description, url and node', () => {
  for (const s of SITES) {
    assert.ok(s.description && s.url.startsWith('https://'), s.id);
    assert.ok(byId.has(s.id), s.id);
  }
});

test('hubs have children; about has none', () => {
  for (const n of NODES) if (n.kind === 'hub') assert.ok(children.get(n.id).length, n.id);
  assert.equal(children.get('about').length, 0);
  assert.equal(byId.get('about').parent, 'root');
  for (const l of byId.get('about').links) assert.match(l.url, /^https:\/\//);
});

test('exclusions stay out', () => {
  for (const id of ['plan', 'send', 'aseprite', 'make/bloodbowl', 'bloodbowl/bloodbowl']) {
    assert.ok(!byId.has(id), id);
    assert.ok(!SITES.some((s) => s.id === id), id);
  }
  assert.ok(byId.has('trivia'));
  assert.equal(children.get('bloodbowl').length, 0);
});
