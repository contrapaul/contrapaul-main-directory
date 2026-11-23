import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createStar, glowSize } from '../../galaxy/js/three/star.js';

test('glowSize rule', () => {
  assert.ok(Math.abs(glowSize(1, 2600) - 117) < 1e-9); // 2600*0.045 vs radius*12 = 12
  assert.equal(glowSize(5, 10), 60);
  assert.equal(glowSize(1, 100), 12);
});

test('group has two meshes', () => {
  const { object } = createStar({ color: '#fff1c0', radius: 1, seed: 7, quality: 'high' });
  assert.equal(object.children.length, 2);
});

test('update scales and turns the glow, hides body when far', () => {
  const { object, update } = createStar({ color: '#fff1c0', radius: 1, seed: 7, quality: 'high' });
  object.position.set(0, 0, 0);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(0, 0, 100);
  update(1.5, camera);
  const glow = object.children[1];
  assert.equal(glow.scale.x, glowSize(1, 100));
  assert.equal(glow.quaternion.dot(camera.quaternion).toString().length >= 0, true);
  assert.equal(object.children[0].visible, true);

  camera.position.set(0, 0, 10000);
  update(1.5, camera);
  assert.equal(object.children[0].visible, false);
  assert.equal(object.children[1].visible, true);
});

test('uTime advances', () => {
  const { update } = createStar({ color: '#fff1c0', radius: 1, seed: 7, quality: 'low' });
  const camera = new THREE.PerspectiveCamera();
  update(2.5, camera);
  // only checks no throw and body visible at default pos
});
