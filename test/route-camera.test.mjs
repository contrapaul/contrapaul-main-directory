import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idFromHash, hashFor, parentHash } from '../js/route.js';
import { viewFor, approach, settled } from '../js/camera.js';
import { NODES } from '../js/network.js';

test('idFromHash handles root, site, hub, page and junk', () => {
  assert.equal(idFromHash(''), 'root');
  assert.equal(idFromHash('#'), 'root');
  assert.equal(idFromHash('#map'), 'root');
  assert.equal(idFromHash('#edu'), 'edu');
  assert.equal(idFromHash('#edu/tools/'), 'edu/tools');
  assert.equal(idFromHash('#EDU/Tools/Macropad'), 'edu/tools/macropad');
  assert.equal(idFromHash('#%E0%A4%A'), null);
});

test('parentHash matches the parent field for every node', () => {
  for (const n of NODES) {
    if (!n.parent) continue;
    assert.equal(parentHash(hashFor(n.id)), hashFor(n.parent), n.id);
  }
  assert.equal(parentHash('#map'), '#map');
});

test('viewFor keeps the circle inside the focus area', () => {
  const focus = { x: 0, y: 0.1, w: 0.6, h: 0.8 };
  for (const aspect of [16 / 9, 375 / 812]) {
    const v = viewFor(100, -50, 40, aspect, focus);
    assert.ok(Math.abs(v.h - v.w / aspect) < 1e-9);
    const left = v.x + focus.x * v.w, right = left + focus.w * v.w;
    const top = v.y + focus.y * v.h, bottom = top + focus.h * v.h;
    assert.ok(left <= 60 + 1e-9 && right >= 140 - 1e-9 && top <= -90 + 1e-9 && bottom >= -10 - 1e-9);
  }
});

test('approach converges on the target', () => {
  let cam = { x: 0, y: 0, w: 1000, h: 500 };
  const target = { x: 300, y: 40, w: 50, h: 25 };
  for (let i = 0; i < 400; i++) cam = approach(cam, target, 1 / 60);
  assert.ok(settled(cam, target));
});
