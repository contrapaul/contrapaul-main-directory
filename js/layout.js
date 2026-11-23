// Orbit layout. Every node with children carries a ring its children ride on.
// Rings turn as rigid wholes, so spacing worked out here holds at any phase.
// Positions are computed, never hand placed: add a node and it finds a slot.
import { indexNodes } from './network.js';
import { rng } from './random.js';

export const NODE_R = { root: 64, site: 26, special: 20, hub: 15, page: 9 };
// Largest on-screen radius per kind, in px: zooming in spreads nodes apart
// instead of inflating them.
export const SCREEN_R = { root: 30, site: 14, special: 12, hub: 11, page: 8 };
const LABEL_ROOM = 2.3; // a leaf claims this many radii, so labels have space
export const WOBBLE = 0.03; // radial breathing, as a fraction of the ring radius
const CLEAR = 1.15; // minimum gap between neighbouring systems, as a factor

export function buildOrbits(nodes, seed = 11) {
  const { byId, children } = indexNodes(nodes);
  const rand = rng(seed);
  const orbits = new Map();
  const order = [];

  const visit = (id, depth) => {
    const n = byId.get(id);
    const o = { id, parent: n.parent, depth, kind: n.kind, r: NODE_R[n.kind], ring: 0,
      extent: NODE_R[n.kind] * LABEL_ROOM,
      angle0: 0, lift: 1, omega: 0, seed: rand() * Math.PI * 2 };
    orbits.set(id, o);
    order.push(id);
    const kids = children.get(id).map((k) => visit(k, depth + 1));
    if (!kids.length) return o;

    // Angle share grows with each child's size, so big systems get room.
    const total = kids.reduce((s, c) => s + c.extent, 0);
    const base = rand() * Math.PI * 2;
    let a = base;
    kids.forEach((c, i) => {
      const next = kids[(i + 1) % kids.length];
      c.angle0 = a;
      a += kids.length === 1 ? 0 : (Math.PI * (c.extent + next.extent)) / total;
      // Stagger children in and out of the ring a little, so it reads as a swarm.
      c.lift = kids.length > 2 ? 1 + (i % 2 ? 0.18 : 0) + rand() * 0.08 : 1;
    });

    o.ring = fitRing(o.r, kids);
    o.extent = o.ring * Math.max(...kids.map((c) => c.lift)) * (1 + WOBBLE)
      + Math.max(...kids.map((c) => c.extent));
    // What the camera frames: the children and their labels, not every outer moon.
    o.fit = o.ring * Math.max(...kids.map((c) => c.lift)) * (1 + WOBBLE)
      + Math.max(...kids.map((c) => c.r)) * LABEL_ROOM * 1.4;
    const period = 80 + 0.12 * o.ring; // seconds per turn; big rings turn slower
    o.omega = ((depth % 2 ? -1 : 1) * Math.PI * 2) / period;
    return o;
  };

  visit('root', 0);
  return { orbits, order };
}

// Smallest ring where no two children (at worst-case wobble) or the parent body collide.
function fitRing(parentR, kids) {
  let ring = parentR + Math.max(...kids.map((c) => c.extent)) * 0.5;
  for (;;) {
    if (ringFits(ring, parentR, kids)) return ring;
    ring *= 1.03;
  }
}

function ringFits(ring, parentR, kids) {
  for (const c of kids) {
    if (ring * c.lift * (1 - WOBBLE) - c.extent < parentR * 1.5) return false;
  }
  for (let i = 0; i < kids.length; i++) {
    for (let j = i + 1; j < kids.length; j++) {
      const a = kids[i], b = kids[j];
      const ra = ring * a.lift, rb = ring * b.lift;
      const d = Math.hypot(ra * Math.cos(a.angle0) - rb * Math.cos(b.angle0),
        ra * Math.sin(a.angle0) - rb * Math.sin(b.angle0));
      if (d - ring * WOBBLE * (a.lift + b.lift) < (a.extent + b.extent) * CLEAR) return false;
    }
  }
  return true;
}

// phase: Map of ring id -> extra angle; clock: seconds, drives the breathing.
export function positions({ orbits, order }, phase, clock) {
  const pos = new Map();
  for (const id of order) {
    const o = orbits.get(id);
    if (!o.parent) { pos.set(id, { x: 0, y: 0 }); continue; }
    const p = orbits.get(o.parent);
    const pp = pos.get(o.parent);
    const a = o.angle0 + (phase.get(o.parent) || 0);
    const rad = p.ring * o.lift * (1 + WOBBLE * Math.sin(clock * 0.4 + o.seed));
    pos.set(id, { x: pp.x + rad * Math.cos(a), y: pp.y + rad * Math.sin(a) });
  }
  return pos;
}
