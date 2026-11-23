// Pure camera maths. The camera circles a focus point in spherical coordinates
// (dist, elev, azim). A flight eases from the current view to a node's live position.
export const FOV = 45; // vertical, degrees

const ELEV = { core: 0.95, star: 0.42, planet: 0.32, moon: 0.28 };

// Distance that fits a sphere of radius `extent` on screen for this aspect.
// `area` is the free part of the screen as fractions {w, h} (the panel covers the rest).
export function fitDistance(extent, aspect, area = { w: 1, h: 1 }, fovDeg = FOV) {
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const v = Math.atan(t * area.h);
  const h = Math.atan(t * aspect * area.w);
  return extent / Math.sin(Math.min(v, h));
}

// The resting view for a body.
export function viewFor(body, aspect, area) {
  const extent = body.kind === 'core' ? body.extent * 0.92 : body.extent * 1.1;
  return { dist: fitDistance(extent, aspect, area), elev: ELEV[body.kind] };
}

export function easeInOut(s) {
  return s <= 0 ? 0 : s >= 1 ? 1 : s < 0.5 ? 4 * s * s * s : 1 - (-2 * s + 2) ** 3 / 2;
}

const lerp = (a, b, t) => a + (b - a) * t;
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Start a flight from the current camera state to a resting view of a target at `targetPos`.
export function startFlight(cam, view, targetPos, reduced = false) {
  const d0 = cam.dist, d1 = view.dist;
  const travel = dist3(cam.focus, targetPos);
  // Rise between far apart targets so both stay in sight on the way.
  const hump = Math.max(0, Math.log((travel * 0.9) / Math.max(d0, d1)));
  const dur = reduced ? 0 : Math.min(3.2, 0.9 + 0.22 * Math.abs(Math.log(d1 / d0)) + 0.45 * hump);
  return { from: { focus: [...cam.focus], dist: d0, elev: cam.elev }, to: view, hump, dur, t: 0 };
}

// The camera state at progress s (0 to 1) of a flight, given the target's live position.
// The focus moves so the target's angle from the screen centre only ever shrinks.
export function flightAt(f, s, live) {
  if (s >= 1) return { focus: [...live], dist: f.to.dist, elev: f.to.elev };
  const e = easeInOut(s);
  const { from, to } = f;
  const dist = Math.exp(lerp(Math.log(from.dist), Math.log(to.dist), e) + f.hump * Math.sin(Math.PI * Math.min(1, s)));
  let u;
  if (s >= 1) u = 1;
  else if (f.hump > 0.05) u = e;
  else if (to.dist < from.dist) u = 1 - (dist / from.dist) * (1 - e);
  else u = (dist / to.dist) * e;
  u = Math.min(1, Math.max(0, u));
  return {
    focus: [lerp(from.focus[0], live[0], u), lerp(from.focus[1], live[1], u), lerp(from.focus[2], live[2], u)],
    dist,
    elev: lerp(from.elev, to.elev, e),
  };
}

// Camera position for a spherical state.
export function cameraPosition({ focus, dist, elev }, azim) {
  const c = Math.cos(elev);
  return [focus[0] + dist * c * Math.sin(azim), focus[1] + dist * Math.sin(elev), focus[2] + dist * c * Math.cos(azim)];
}
