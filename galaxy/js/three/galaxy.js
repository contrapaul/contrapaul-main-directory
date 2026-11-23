// STUB owned by the `galaxy` builder. Contract: see specs/galaxy-demo.md.
// createGalaxy({ quality }) -> { object, update(t, camera) }
import * as THREE from 'three';
import { GALAXY, armAngle } from '../cosmos.js';
import { rng } from '../random.js';

export function createGalaxy({ quality = 'high' } = {}) {
  const rand = rng(7);
  const n = quality === 'low' ? 4000 : 8000;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = GALAXY.r0 + rand() * (GALAXY.radius - GALAXY.r0);
    const a = armAngle(r, i % GALAXY.arms) + (rand() - 0.5) * 0.5;
    pos.set([r * Math.cos(a), (rand() - 0.5) * 20, r * Math.sin(a)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const object = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8899cc, size: 2, sizeAttenuation: true }));
  return {
    object,
    update(t) { object.rotation.y = -(2 * Math.PI * t) / GALAXY.turn; },
  };
}
