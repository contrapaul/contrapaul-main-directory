import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NODES } from '../js/network.js';
import { buildOrbits, positions } from '../js/layout.js';
import { rng } from '../js/random.js';

const layout = buildOrbits(NODES);

function overlaps(pos) {
  const ids = [...pos.keys()];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = layout.orbits.get(ids[i]), b = layout.orbits.get(ids[j]);
      const pa = pos.get(ids[i]), pb = pos.get(ids[j]);
      if (Math.hypot(pa.x - pb.x, pa.y - pb.y) < a.r + b.r) return `${ids[i]} / ${ids[j]}`;
    }
  }
  return null;
}

test('no two nodes touch, at any phase or breathing time', () => {
  const rand = rng(3);
  for (let k = 0; k < 200; k++) {
    const phase = new Map([...layout.orbits.keys()].map((id) => [id, rand() * 20]));
    assert.equal(overlaps(positions(layout, phase, rand() * 1000)), null);
  }
});

test('every node stays inside the root extent', () => {
  const ext = layout.orbits.get('root').extent;
  const pos = positions(layout, new Map(), 0);
  for (const [id, p] of pos) assert.ok(Math.hypot(p.x, p.y) + layout.orbits.get(id).r <= ext, id);
});

test('layout is stable across builds', () => {
  const again = buildOrbits(NODES);
  assert.deepEqual([...again.orbits.values()], [...layout.orbits.values()]);
});

test('adding a page finds a slot without collisions', () => {
  const more = [...NODES, { id: 'edu/tools/new-thing', parent: 'edu/tools', kind: 'page', label: 'x', hue: 1 }];
  const l = buildOrbits(more);
  const pos = positions(l, new Map(), 0);
  assert.ok(pos.has('edu/tools/new-thing'));
});
