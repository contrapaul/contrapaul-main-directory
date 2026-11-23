import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NODES, indexNodes } from '../../galaxy/js/network.js';
import { buildCosmos, positionsAt, GALAXY } from '../../galaxy/js/cosmos.js';
import { fitDistance, viewFor, startFlight, flightAt, easeInOut, cameraPosition, FOV } from '../../galaxy/js/view.js';

const index = indexNodes(NODES);
const bodies = buildCosmos(NODES, index.children);
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const depth = (id) => index.ancestors(id).length;

test('every node is a body of the right kind, and it is deterministic', () => {
  const kinds = ['core', 'star', 'planet', 'moon'];
  for (const n of NODES) assert.equal(bodies.get(n.id).kind, kinds[depth(n.id)], n.id);
  assert.deepEqual([...buildCosmos(NODES, index.children)], [...bodies]);
});

test('About is the central star; the others sit inside the disk, apart from each other', () => {
  const p = positionsAt(bodies, 0);
  assert.deepEqual(p.get('about'), [0, 0, 0]);
  const stars = [...bodies.values()].filter((b) => b.kind === 'star');
  for (const s of stars) if (s.id !== 'about') assert.ok(s.home.r < GALAXY.radius * 0.95 && s.home.r > 100, s.id);
  for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) {
    assert.ok(d(p.get(stars[i].id), p.get(stars[j].id)) > 50, `${stars[i].id} ${stars[j].id}`);
  }
});

test('bodies never collide over many times', () => {
  for (let k = 0; k < 300; k++) {
    const p = positionsAt(bodies, k * 7.3);
    for (const a of bodies.values()) {
      if (a.kind !== 'planet' && a.kind !== 'moon') continue;
      const parent = bodies.get(a.parent);
      assert.ok(d(p.get(a.id), p.get(a.parent)) > (a.radius + parent.radius) * 1.5, a.id);
      for (const b of bodies.values()) {
        if (b === a || b.parent !== a.parent || a.id > b.id) continue;
        const reach = (x) => (x.kind === 'planet' ? x.extent : x.radius);
        const gap = a.kind === 'planet' ? reach(a) + reach(b) : a.radius + b.radius;
        assert.ok(d(p.get(a.id), p.get(b.id)) > gap, `${a.id} ${b.id} at ${k}`);
      }
    }
  }
});

test('planets follow Kepler: period grows as a^1.5', () => {
  const ps = [...bodies.values()].filter((b) => b.kind === 'planet');
  for (const p of ps) assert.ok(Math.abs(p.orbit.period / p.orbit.a ** 1.5 - ps[0].orbit.period / ps[0].orbit.a ** 1.5) < 1e-9);
});

test('fitDistance keeps a sphere inside both fields of view', () => {
  for (const aspect of [16 / 9, 375 / 812]) {
    const dist = fitDistance(10, aspect);
    const v = (FOV * Math.PI) / 360, h = Math.atan(Math.tan(v) * aspect);
    assert.ok(Math.asin(10 / dist) <= Math.min(v, h) + 1e-9);
  }
});

test('a flight ends exactly on the live target', () => {
  const cam = { focus: [0, 0, 0], dist: 2000, elev: 0.9 };
  const live = [500, 3, -400];
  const f = startFlight(cam, viewFor(bodies.get('edu'), 1.6), live);
  const end = flightAt(f, 1, live);
  assert.deepEqual(end.focus, live);
  assert.equal(end.dist, f.to.dist);
  assert.equal(easeInOut(0), 0);
  assert.equal(easeInOut(1), 1);
  assert.equal(startFlight(cam, f.to, live, true).dur, 0);
});

test('zooming in: the target only moves toward the screen centre', () => {
  const cam = { focus: [0, 0, 0], dist: 2000, elev: 0.9 };
  const live = [600, 0, 300];
  const f = startFlight(cam, { dist: 40, elev: 0.4 }, live);
  let last = Infinity;
  for (let s = 0; s <= 1.0001; s += 0.02) {
    const v = flightAt(f, s, live);
    const off = d(v.focus, live) / v.dist;
    assert.ok(off <= last + 1e-9, `s=${s.toFixed(2)}`);
    last = off;
  }
});

test('a jump between far systems rises, then lands', () => {
  const cam = { focus: [800, 0, 0], dist: 40, elev: 0.4 };
  const live = [-700, 0, 200];
  const f = startFlight(cam, { dist: 40, elev: 0.4 }, live);
  assert.ok(f.hump > 1);
  assert.ok(flightAt(f, 0.5, live).dist > 500);
  const pos = cameraPosition(flightAt(f, 1, live), 0);
  assert.ok(Math.abs(d(pos, live) - 40) < 1e-6);
});

test('lit side: the camera sits between the body and its star, turning the short way', async () => {
  const { litAzimuth, turnToward } = await import('../../galaxy/js/view.js');
  const body = [10, 0, 0], star = [0, 0, 0];
  const cam = cameraPosition({ focus: body, dist: 5, elev: 0 }, litAzimuth(body, star, 0));
  assert.ok(d(cam, star) < d(body, star));
  assert.ok(Math.abs(turnToward(3.0, -3.0, 1) - (2 * Math.PI - 3.0)) < 1e-9);
});
