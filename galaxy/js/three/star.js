// STUB owned by the `star` builder. Contract: see specs/galaxy-demo.md.
// createStar({ color, radius, seed, quality }) -> { object, update(t, camera) }
import * as THREE from 'three';

export function createStar({ color, radius }) {
  const object = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), new THREE.MeshBasicMaterial({ color }));
  return { object, update() {} };
}
