import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idFromHash, hashFor, parentHash } from '../../galaxy/js/route.js';
import { NODES, indexNodes } from '../../galaxy/js/network.js';
import { panelHTML, esc } from '../../galaxy/js/panel.js';
import { atlasHTML, relation, showsLabel } from '../../galaxy/js/atlas.js';

const index = indexNodes(NODES);

test('idFromHash handles root, site, hub, page and junk', () => {
  assert.equal(idFromHash(''), 'root');
  assert.equal(idFromHash('#map'), 'root');
  assert.equal(idFromHash('#edu/tools/'), 'edu/tools');
  assert.equal(idFromHash('#EDU/Tools/Macropad'), 'edu/tools/macropad');
  assert.equal(idFromHash('#%E0%A4%A'), null);
});

test('parentHash matches the parent field for every node', () => {
  for (const n of NODES) if (n.parent) assert.equal(parentHash(hashFor(n.id)), hashFor(n.parent), n.id);
});

test('panel lists every child, leaves get Open page', () => {
  for (const n of NODES) {
    if (n.id === 'root') continue;
    const kids = index.children.get(n.id);
    const html = panelHTML(n.id, index);
    if (kids.length) for (const k of kids) assert.ok(html.includes(`href="#${k}"`), `${n.id} -> ${k}`);
    else assert.ok(html.includes(`href="${esc(n.url)}"`) && html.includes('Open page'), n.id);
  }
});

test('atlas lists every node once, escaped, with a fly link and a visit link', () => {
  const html = atlasHTML(index);
  for (const n of NODES) {
    if (n.id === 'root') continue;
    assert.equal(html.split(`class="atlas-fly" href="${hashFor(n.id)}"`).length, 2, n.id);
    assert.ok(html.includes(`href="${esc(n.url)}"`), n.id);
  }
  const evil = indexNodes([...NODES, { id: 'edu/x', parent: 'edu', kind: 'page', label: '<b>', url: '/x', hue: 1 }]);
  assert.ok(atlasHTML(evil).includes('&lt;b&gt;') && !atlasHTML(evil).includes('<b>'));
});

test('relations and labels', () => {
  assert.equal(relation('edu', 'root', index), 'child');
  assert.equal(relation('edu/tools', 'root', index), 'moon');
  assert.equal(relation('edu', 'edu/tools', index), 'path');
  assert.equal(relation('edu/ai', 'edu/tools', index), 'sibling');
  assert.equal(relation('make', 'edu', index), 'sibling');
  assert.ok(!showsLabel('sibling', 'make', 'edu', index), 'other stars hide inside a system');
  assert.ok(showsLabel('sibling', 'edu/ai', 'edu/tools', index));
  assert.ok(!showsLabel('path', 'root', 'edu', index));
});
