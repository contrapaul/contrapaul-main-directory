import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NODES, indexNodes } from '../js/network.js';
import { buildOrbits } from '../js/layout.js';
import { buildScene, esc } from '../js/scene.js';
import { buildStars } from '../js/stars.js';
import { panelHTML } from '../js/panel.js';

const index = indexNodes(NODES);

test('scene: every node is a hash link, text is escaped, no external assets', () => {
  const evil = [...NODES, { id: 'edu/x', parent: 'edu', kind: 'page', label: '<b>&"', hue: 1 }];
  const svg = buildScene(evil, buildOrbits(evil));
  for (const n of NODES) assert.ok(svg.includes(`data-id="${n.id}"`), n.id);
  assert.ok(svg.includes('&lt;b&gt;&amp;&quot;'));
  assert.ok(!svg.includes('<b>'));
  assert.ok(!/https?:/.test(svg));
  assert.equal((svg.match(/<a href="#/g) || []).length, evil.length);
});

test('stars are deterministic', () => {
  assert.equal(buildStars(7), buildStars(7));
  assert.notEqual(buildStars(7), buildStars(8));
});

test('panel lists every child of a node with children', () => {
  for (const n of NODES) {
    const kids = index.children.get(n.id);
    if (!kids.length || n.id === 'root') continue;
    const html = panelHTML(n.id, index);
    for (const k of kids) assert.ok(html.includes(`href="#${k}"`), `${n.id} -> ${k}`);
    assert.ok(!html.includes('Open page'));
  }
});

test('panel for a leaf has an Open page link to the real url', () => {
  for (const n of NODES) {
    if (index.children.get(n.id).length) continue;
    const html = panelHTML(n.id, index);
    assert.ok(html.includes(`href="${esc(n.url)}"`) && html.includes('Open page'), n.id);
    assert.ok(html.includes(`href="#${n.parent === 'root' ? 'map' : n.parent}"`), `${n.id} zoom out`);
  }
});

test('about panel shows its external links', () => {
  const html = panelHTML('about', index);
  for (const l of index.byId.get('about').links) assert.ok(html.includes(l.url));
});
