import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createGalaxy } from '../../galaxy/js/three/galaxy.js';
import { GALAXY, armAngle } from '../../galaxy/js/cosmos.js';

const props = (g) => {
  const disk = g.object.children[0];
  return {
    pos: disk.geometry.getAttribute('position').array,
    col: disk.geometry.getAttribute('color').array,
    size: disk.geometry.getAttribute('size').array,
    count: disk.geometry.getAttribute('position').count,
    sky: g.object.children[2],
    core: g.object.children[1],
  };
};

test('disk point counts per quality', () => {
  assert.equal(props(createGalaxy({ quality: 'high' })).count, 50000);
  assert.equal(props(createGalaxy({ quality: 'low' })).count, 20000);
});

test('no NaN in any attribute', () => {
  for (const q of ['high', 'low']) {
    const p = props(createGalaxy({ quality: q }));
    for (let i = 0; i < p.pos.length; i++) assert.ok(Number.isFinite(p.pos[i]));
    for (let i = 0; i < p.col.length; i++) assert.ok(Number.isFinite(p.col[i]));
    for (let i = 0; i < p.size.length; i++) assert.ok(Number.isFinite(p.size[i]));
    const sky = p.sky.geometry.getAttribute('position').array;
    for (let i = 0; i < sky.length; i++) assert.ok(Number.isFinite(sky[i]));
  }
});

test('at least 60% of arm points within 0.6 rad of armAngle', () => {
  const p = props(createGalaxy({ quality: 'high' }));
  // identify arm points: radius 100..1000 and not a bulge (r<abs gauss*110 could overlap);
  // recompute: arms have r in [100,1000] and y band; use classification by size/brightness is unreliable,
  // so check: points with 100 <= r <= 1000 and |y| < 16 count as arm candidates
  let armPoints = 0, close = 0;
  for (let i = 0; i < p.count; i++) {
    const x = p.pos[i * 3], y = p.pos[i * 3 + 1], z = p.pos[i * 3 + 2];
    const r = Math.hypot(x, z);
    const theta = Math.atan2(z, x);
    if (r < 100 || r > 1000) continue;
    if (y > 16 || y < -16) continue;
    // bulge points have r < ~330 mostly but arms start at 100; classify arms by |y| <= 16 is weak.
    // Use size/brightness: arms size 1.5-3, bulge size 1.5-3 too. Instead count all and accept.
    armPoints++;
    const arm = i % 2;
    let d = Math.abs(theta - armAngle(r, arm)) % (2 * Math.PI);
    if (d > Math.PI) d = 2 * Math.PI - d;
    if (d < 0.6) close++;
  }
  assert.ok(armPoints > 0);
  assert.ok(close / armPoints >= 0.6, `${close}/${armPoints}`);
});

test('deterministic: two calls give identical output', () => {
  const a = props(createGalaxy({ quality: 'low' }));
  const b = props(createGalaxy({ quality: 'low' }));
  assert.deepEqual([...a.pos], [...b.pos]);
  assert.deepEqual([...a.col], [...b.col]);
  assert.deepEqual([...a.size], [...b.size]);
});

test('update turns the disk, core faces camera, sky follows camera', () => {
  const g = createGalaxy({ quality: 'low' });
  const disk = g.object.children[0];
  const core = g.object.children[1];
  const sky = g.object.children[2];
  const cam = new THREE.PerspectiveCamera();
  cam.position.set(1, 2, 3);
  cam.quaternion.setFromEuler(new THREE.Euler(0.1, 0.2, 0.3));
  cam.updateMatrixWorld();
  g.update(10, cam);
  assert.ok(Math.abs(disk.rotation.y - (2 * Math.PI * 10 / GALAXY.turn)) < 1e-9);
  assert.deepEqual([core.quaternion.x, core.quaternion.y, core.quaternion.z, core.quaternion.w], [cam.quaternion.x, cam.quaternion.y, cam.quaternion.z, cam.quaternion.w]);
  assert.deepEqual([sky.position.x, sky.position.y, sky.position.z], [1, 2, 3]);
  assert.equal(sky.rotation.x, 0);
});
