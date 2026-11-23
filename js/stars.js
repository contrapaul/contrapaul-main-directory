// Seeded star field in three depth layers. Screen space, not map space.
import { rng } from './random.js';

export const STAR_LAYERS = [
  { depth: 0.2, count: 260, size: [0.6, 1.3] },
  { depth: 0.5, count: 110, size: [0.9, 1.9] },
  { depth: 1, count: 40, size: [1.4, 2.6] },
];

export function buildStars(seed = 7, w = 1600, h = 1000) {
  const rand = rng(seed);
  return STAR_LAYERS.map((layer, li) => {
    let s = '';
    for (let i = 0; i < layer.count; i++) {
      const x = (rand() * w).toFixed(1), y = (rand() * h).toFixed(1);
      const r = (layer.size[0] + rand() * (layer.size[1] - layer.size[0])).toFixed(2);
      const twinkle = rand() < 0.18 ? ` class="tw" style="animation-delay:${(rand() * 6).toFixed(2)}s"` : '';
      s += `<circle cx="${x}" cy="${y}" r="${r}"${twinkle}/>`;
    }
    return `<g class="star-layer" data-layer="${li}">${s}</g>`;
  }).join('');
}
