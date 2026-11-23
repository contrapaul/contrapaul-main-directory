// STUB owned by the `planet` builder. Contract: see specs/galaxy-demo.md.
// createPlanet({ type, radius, seed, hue, quality }) -> { object, update(t, starPos) }
import * as THREE from 'three';

const COLORS = { rocky: 0x8a7a66, ocean: 0x2f5f8a, desert: 0xc8a06a, ice: 0xcfe3ee, gas: 0xc9a27a, moon: 0x888888 };

export function createPlanet({ type, radius }) {
  const object = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), new THREE.MeshBasicMaterial({ color: COLORS[type] }));
  return { object, update() {} };
}
