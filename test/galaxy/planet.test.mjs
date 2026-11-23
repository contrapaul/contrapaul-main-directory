import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPlanet, paletteFor } from '../../galaxy/js/three/planet.js';

const TYPES = ['rocky', 'ocean', 'desert', 'ice', 'gas', 'moon'];

test('every type builds with a body', () => {
  for (const type of TYPES) {
    const p = createPlanet({ type, radius: 0.4, seed: 11, hue: 200, quality: 'high' });
    assert.ok(p.object instanceof THREE.Group);
    assert.ok(p.object.children.length >= 1, type);
  }
});

test('paletteFor is deterministic and returns valid hex', () => {
  for (const t of TYPES) {
    const p1 = paletteFor(t, 200, 42); const p2 = paletteFor(t, 200, 42);
    assert.deepEqual(p1, p2, t);
    for (const key of ['a', 'b', 'atmo']) assert.match(p1[key], /^#[0-9a-f]{6}$/, `${t}.${key}`);
    assert.ok(typeof p1.strength === 'number' && p1.strength >= 0, t);
    if (p1.c) assert.match(p1.c, /^#[0-9a-f]{6}$/, `${t}.c`);
  }
});

test('update copies the star position vector', () => {
  const p = createPlanet({ type: 'rocky', radius: 0.4, seed: 1, hue: 0, quality: 'high' });
  const v = new THREE.Vector3(10, 20, 30);
  p.update(0, v);
  const before = p.uniforms.uStarPos.value.clone();
  v.set(999, 0, 0);
  assert.deepEqual(p.uniforms.uStarPos.value.toArray(), before.toArray());
});

test('ring only on odd-seed gas giants and inside radius * 2.2', () => {
  const withRing = createPlanet({ type: 'gas', radius: 0.5, seed: 3, hue: 100, quality: 'high' });
  assert.ok(withRing.ring, 'odd seed gas giant gets ring');
  const ringGeo = withRing.ring.geometry;
  const pos = ringGeo.attributes.position;
  let maxR = 0;
  for (let i = 0; i < pos.count; i++) maxR = Math.max(maxR, Math.hypot(pos.getX(i), pos.getY(i)));
  assert.ok(maxR <= 0.5 * 2.2 + 1e-9, `ring outer ${maxR}`);

  const noRing = createPlanet({ type: 'gas', radius: 0.5, seed: 4, hue: 100, quality: 'high' });
  assert.equal(noRing.ring, null);

  const nonGas = createPlanet({ type: 'rocky', radius: 0.5, seed: 3, hue: 0, quality: 'high' });
  assert.equal(nonGas.ring, null);
});
