// The camera is an SVG viewBox that glides after a moving target.
// focus: the part of the screen left for the map, as fractions {x, y, w, h}.
export function viewFor(cx, cy, radius, aspect, focus = { x: 0, y: 0, w: 1, h: 1 }) {
  const w = Math.max((2 * radius) / focus.w, (2 * radius * aspect) / focus.h);
  const h = w / aspect;
  return { x: cx - (focus.x + focus.w / 2) * w, y: cy - (focus.y + focus.h / 2) * h, w, h };
}

// Ease toward the target: centre linearly, size in log space so zooms feel even.
export function approach(cam, target, dt, rate = 4) {
  const k = 1 - Math.exp(-rate * dt);
  const cx = cam.x + cam.w / 2, cy = cam.y + cam.h / 2;
  const tx = target.x + target.w / 2, ty = target.y + target.h / 2;
  const w = Math.exp(Math.log(cam.w) + (Math.log(target.w) - Math.log(cam.w)) * k);
  const h = w * (target.h / target.w);
  const nx = cx + (tx - cx) * k, ny = cy + (ty - cy) * k;
  return { x: nx - w / 2, y: ny - h / 2, w, h };
}

export function settled(cam, target) {
  return Math.abs(Math.log(cam.w / target.w)) < 0.002
    && Math.hypot(cam.x - target.x, cam.y - target.y) < target.w * 0.0005;
}
