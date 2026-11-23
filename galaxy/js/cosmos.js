// Pure layout of the galaxy: where every node lives and how it moves.
// Units: the galaxy disk has radius 1000 and lies in the x-z plane, y is up.
// Sites and specials are stars; their children are planets; grandchildren are moons.
import { rng } from './random.js';

export const GALAXY = {
  radius: 1000,
  arms: 2,
  r0: 100,         // the arms start at this radius
  b: 0.4,          // log spiral: r = r0 * exp(b * theta)
  turn: 1800,      // seconds for one turn of the whole disk
  seed: 20261123,
};

// The angle of an arm at radius r (shared with the galaxy renderer so stars sit on the arms).
export function armAngle(r, arm) {
  return Math.log(Math.max(r, GALAXY.r0) / GALAXY.r0) / GALAXY.b + arm * (2 * Math.PI / GALAXY.arms);
}

// Real star colours, hot to cool (linear-ish sRGB hex).
export const SPECTRAL = ['#9db4ff', '#cad8ff', '#f4f3ff', '#fff1df', '#ffd9a8', '#ffbd7a'];

export const PLANET_TYPES = ['rocky', 'ocean', 'desert', 'ice'];

const TAU = Math.PI * 2;

// Build every body from the node index. Deterministic for a given node list.
export function buildCosmos(nodes, children) {
  const rand = rng(GALAXY.seed);
  const bodies = new Map();
  bodies.set('root', { id: 'root', kind: 'core', parent: null, radius: 6, extent: GALAXY.radius });

  const stars = nodes.filter((n) => n.parent === 'root');
  const sites = stars.filter((n) => n.kind === 'site');
  const specials = stars.filter((n) => n.kind !== 'site');

  sites.forEach((n, i) => {
    const t = sites.length > 1 ? i / (sites.length - 1) : 0;
    const r = 280 + t * 620 + (rand() - 0.5) * 50;
    const arm = i % GALAXY.arms;
    const theta = armAngle(r, arm) + (rand() - 0.5) * 0.12;
    addStar(n, r, theta, (rand() - 0.5) * 14);
  });
  specials.forEach((n, i) => {
    const r = 130 + i * 40;
    addStar(n, r, 0.6 + i * 2.9, (rand() - 0.5) * 6);
  });

  function addStar(n, r, theta, y) {
    const kids = children.get(n.id);
    const star = {
      id: n.id, kind: 'star', parent: 'root',
      home: { r, theta, y },
      radius: n.kind === 'site' ? (kids.length ? 1 : 0.8) : 0.6,
      color: SPECTRAL[Math.floor(rand() * SPECTRAL.length)],
      seed: Math.floor(rand() * 1e9),
    };
    bodies.set(n.id, star);
    let a = star.radius * 3.2;
    let prevReach = 0;
    kids.forEach((k, j) => {
      const moons = children.get(k);
      const radius = moons.length ? 0.5 : 0.28 + rand() * 0.12;
      const moonReach = moons.length ? radius * 2.6 + (moons.length - 1) * 0.55 + 0.3 : radius * 2;
      a += (j ? 1.6 : 0) + prevReach + moonReach;
      prevReach = moonReach;
      const planet = {
        id: k, kind: 'planet', parent: n.id, radius,
        type: moons.length ? 'gas' : PLANET_TYPES[Math.floor(rand() * PLANET_TYPES.length)],
        seed: Math.floor(rand() * 1e9),
        orbit: orbit(a, 0.12, 40 * (a / 4) ** 1.5),
      };
      bodies.set(k, planet);
      let ma = radius * 2.6;
      moons.forEach((m, mi) => {
        if (mi) ma += 0.55;
        bodies.set(m, {
          id: m, kind: 'moon', parent: k, radius: 0.1 + rand() * 0.04, type: 'moon',
          seed: Math.floor(rand() * 1e9),
          orbit: orbit(ma, 0.3, 9 * (ma / 1.3) ** 1.5),
        });
      });
      planet.extent = moons.length ? ma + 0.3 : radius * 3;
    });
    star.extent = kids.length ? a + prevReach : star.radius * 3;
  }

  function orbit(a, maxInc, period) {
    return { a, inc: (rand() - 0.5) * 2 * maxInc, node: rand() * TAU, phase: rand() * TAU, period };
  }

  for (const b of bodies.values()) if (b.kind === 'moon') b.extent = b.radius * 3;
  return bodies;
}

// A point on an orbit at angle phi, relative to the body it circles.
// The orbit lies in the x-z plane, tilted by inc about x, then turned by node about y.
export function orbitPoint(o, phi) {
  const x = o.a * Math.cos(phi), z0 = o.a * Math.sin(phi);
  const y = -z0 * Math.sin(o.inc), z = z0 * Math.cos(o.inc);
  const c = Math.cos(o.node), s = Math.sin(o.node);
  return [x * c + z * s, y, -x * s + z * c];
}

export function orbitAngle(o, t) {
  return o.phase + (TAU * t) / o.period;
}

// Where every body is at time t (seconds). Returns Map id -> [x, y, z].
export function positionsAt(bodies, t) {
  const out = new Map();
  const g = (TAU * t) / GALAXY.turn;
  const place = (id) => {
    if (out.has(id)) return out.get(id);
    const b = bodies.get(id);
    let p;
    if (b.kind === 'core') p = [0, 0, 0];
    else if (b.kind === 'star') {
      const a = b.home.theta + g;
      p = [b.home.r * Math.cos(a), b.home.y, b.home.r * Math.sin(a)];
    } else {
      const c = place(b.parent);
      const o = orbitPoint(b.orbit, orbitAngle(b.orbit, t));
      p = [c[0] + o[0], c[1] + o[1], c[2] + o[2]];
    }
    out.set(id, p);
    return p;
  };
  for (const id of bodies.keys()) place(id);
  return out;
}
