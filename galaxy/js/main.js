// DOM and three.js wiring: routing, the render loop, labels, panel, list and input.
import * as THREE from 'three';
import { NODES, indexNodes } from './network.js';
import { buildCosmos, positionsAt, orbitPoint } from './cosmos.js';
import { FOV, viewFor, startFlight, flightAt, cameraPosition } from './view.js';
import { panelHTML } from './panel.js';
import { atlasHTML, relation, showsLabel } from './atlas.js';
import { idFromHash, hashFor } from './route.js';
import { createGalaxy } from './three/galaxy.js';
import { createStar } from './three/star.js';
import { createPlanet } from './three/planet.js';

const index = indexNodes(NODES);
const { byId, children, ancestors } = index;
const bodies = buildCosmos(NODES, children);

const canvas = document.getElementById('sky');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch {
  renderer = null; // no WebGL: the static list stays
}
if (renderer) boot();

function boot() {
  const phone = Math.min(innerWidth, innerHeight) < 600;
  const quality = phone ? 'low' : 'high';
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 1000);

  // ---------- bodies ----------
  const galaxy = createGalaxy({ quality });
  scene.add(galaxy.object);
  const visuals = new Map(); // id -> { object, update, kind }
  for (const b of bodies.values()) {
    let v = null;
    if (b.kind === 'star') v = createStar({ color: b.color, radius: b.radius, seed: b.seed, quality });
    else if (b.kind === 'planet' || b.kind === 'moon') {
      v = createPlanet({ type: b.type, radius: b.radius, seed: b.seed, hue: byId.get(b.id).hue, quality });
    }
    if (v) { scene.add(v.object); visuals.set(b.id, v); }
  }

  // Faint orbit lines, shown only around the active system.
  const orbits = new Map(); // body id -> line (placed at its parent each frame)
  for (const b of bodies.values()) {
    if (!b.orbit) continue;
    const pts = [];
    for (let i = 0; i < 128; i++) pts.push(new THREE.Vector3(...orbitPoint(b.orbit, (i / 128) * Math.PI * 2)));
    const line = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: new THREE.Color(`hsl(${byId.get(b.id).hue}, 50%, 70%)`), transparent: true, opacity: 0.22, depthWrite: false }),
    );
    line.visible = false;
    scene.add(line);
    orbits.set(b.id, line);
  }

  // ---------- labels ----------
  const layer = document.getElementById('labels');
  const tags = new Map();
  for (const n of NODES) {
    const a = document.createElement('a');
    a.href = hashFor(n.id);
    a.className = `tag tag--${bodies.get(n.id).kind}`;
    a.style.setProperty('--hue', n.hue);
    a.innerHTML = '<i class="tag-dot"></i><span class="tag-text"></span>';
    a.querySelector('.tag-text').textContent = n.label;
    a.setAttribute('aria-label', n.label);
    layer.append(a);
    tags.set(n.id, { a, dot: a.querySelector('.tag-dot'), shown: false });
  }

  const panel = document.getElementById('panel');
  const panelBody = panel.querySelector('.panel-body');
  const atlas = document.getElementById('atlas');
  atlas.querySelector('.atlas-body').innerHTML = atlasHTML(index);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let active = 'root', rel = new Map();
  let clock = 0, calm = 1, calmTarget = 1, azim = 0.6, last = 0, pendingFocus = null;
  let flight = null, cam = null;
  const offset = { x: 0, y: 0 };
  const pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
  let pos = positionsAt(bodies, 0);
  const tmp = new THREE.Vector3();

  const urlFor = (id) => (id === 'root' ? location.pathname + location.search : hashFor(id));

  // The free part of the screen next to the panel, as fractions, and the view offset in px.
  function freeArea() {
    const W = innerWidth, H = innerHeight;
    if (active === 'root') return { w: 1, h: 0.9, ox: 0, oy: 0 };
    if (W < 760) { const sheet = H * 0.56; return { w: 1, h: (H - sheet - 70) / H, ox: 0, oy: sheet / 2 - 20 }; }
    const side = Math.min(400, W * 0.45) + 16;
    return { w: (W - side) / W * 0.94, h: 0.86, ox: side / 2, oy: 0 };
  }

  function applyRoute(id, { snap = false, focusPanel = false, focusNode = null } = {}) {
    if (!byId.has(id)) { id = 'root'; history.replaceState(null, '', urlFor(id)); }
    active = id;
    for (const n of NODES) rel.set(n.id, relation(n.id, active, index));
    for (const [nid, t] of tags) {
      const r = rel.get(nid);
      t.want = showsLabel(r, nid, active, index);
      t.a.className = `tag tag--${bodies.get(nid).kind} is-${r}`;
      if (r === 'active') t.a.setAttribute('aria-current', 'page'); else t.a.removeAttribute('aria-current');
    }
    for (const [bid, line] of orbits) {
      const p = bodies.get(bid).parent;
      line.visible = p === active || rel.get(p) === 'path';
    }

    const atRoot = id === 'root';
    document.body.classList.toggle('at-root', atRoot);
    panel.inert = atRoot;
    panel.classList.toggle('is-open', !atRoot);
    if (!atRoot) { panelBody.innerHTML = panelHTML(id, index); panelBody.scrollTop = 0; }
    document.title = atRoot ? 'contrapaul' : `${byId.get(id).label} | contrapaul`;

    const view = viewFor(bodies.get(id), innerWidth / innerHeight, freeArea());
    const live = pos.get(id);
    if (snap || !cam) cam = { focus: [...live], dist: view.dist, elev: view.elev };
    flight = startFlight(cam, view, live, snap || reduce.matches);
    if (focusPanel && !atRoot) panel.querySelector('.panel-title').focus({ preventScroll: true });
    if (focusNode && tags.has(focusNode)) tags.get(focusNode).a.focus({ preventScroll: true });
  }

  function navigate(id) {
    if (!byId.has(id)) return;
    if (id === active) { if (id !== 'root') panel.querySelector('.panel-title').focus({ preventScroll: true }); return; }
    history.pushState({ prev: active }, '', urlFor(id));
    applyRoute(id, { focusPanel: true });
  }

  function zoomOut() {
    if (active === 'root') return;
    const parent = byId.get(active).parent;
    if (history.state && history.state.prev === parent) { pendingFocus = active; history.back(); }
    else { const from = active; history.replaceState(null, '', urlFor(parent)); applyRoute(parent, { focusNode: from }); }
  }

  function resize() {
    const W = innerWidth, H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    if (flight) flight.to = viewFor(bodies.get(active), W / H, freeArea());
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden) { last = 0; return; }
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    const motion = !reduce.matches;
    const k = (rate) => 1 - Math.exp(-rate * dt);

    if (motion) {
      calm += (calmTarget - calm) * k(5);
      clock += dt * calm;
      azim += dt * 0.012 * calm;
      pointer.x += (pointerTarget.x - pointer.x) * k(3);
      pointer.y += (pointerTarget.y - pointer.y) * k(3);
    }
    pos = positionsAt(bodies, clock);

    // Camera: fly, then keep following the live target.
    flight.t += dt;
    const s = flight.dur ? Math.min(1, flight.t / flight.dur) : 1;
    cam = flightAt(flight, s, pos.get(active));
    const a = freeArea();
    offset.x += (a.ox - offset.x) * (motion ? k(4) : 1);
    offset.y += (a.oy - offset.y) * (motion ? k(4) : 1);
    const p = cameraPosition({ ...cam, elev: cam.elev - pointer.y * 0.05 }, azim + pointer.x * 0.1);
    camera.position.set(...p);
    camera.up.set(0, 1, 0);
    camera.lookAt(...cam.focus);
    camera.near = Math.max(0.005, cam.dist * 0.01);
    camera.far = cam.dist * 4 + 4000;
    camera.setViewOffset(innerWidth, innerHeight, offset.x, offset.y, innerWidth, innerHeight);
    camera.updateProjectionMatrix();

    galaxy.update(clock, camera);
    for (const [id, v] of visuals) {
      const b = bodies.get(id);
      v.object.position.set(...pos.get(id));
      if (b.kind === 'star') v.update(clock, camera);
      else { const sp = pos.get(b.kind === 'moon' ? bodies.get(b.parent).parent : b.parent); v.update(clock, tmp.set(...sp)); }
    }
    for (const [id, line] of orbits) if (line.visible) line.position.set(...pos.get(bodies.get(id).parent));

    renderer.render(scene, camera);
    placeLabels();
  }

  // Project each shown label onto the screen. Hidden ones leave the tab order.
  function placeLabels() {
    const W = innerWidth, H = innerHeight;
    const pxPerUnit = H / 2 / Math.tan((FOV * Math.PI) / 360);
    for (const [id, t] of tags) {
      let show = t.want;
      if (show) {
        tmp.set(...pos.get(id));
        const depth = tmp.distanceTo(camera.position);
        tmp.project(camera);
        show = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
        if (show) {
          const x = (tmp.x + 1) / 2 * W, y = (1 - tmp.y) / 2 * H;
          const r = Math.max(5, Math.min(60, (bodies.get(id).radius * pxPerUnit) / depth));
          t.a.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
          t.a.style.setProperty('--r', `${r.toFixed(1)}px`);
        }
      }
      if (show !== t.shown) {
        t.shown = show;
        t.a.classList.toggle('is-shown', show);
        t.a.tabIndex = show ? 0 : -1;
        if (show) t.a.removeAttribute('aria-hidden'); else t.a.setAttribute('aria-hidden', 'true');
      }
    }
  }

  // ---------- input ----------
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      e.preventDefault();
      if (atlas.open) atlas.close();
      if (a.hasAttribute('data-zoom-out')) zoomOut();
      else navigate(idFromHash(a.getAttribute('href')));
      return;
    }
    if (e.target === canvas) zoomOut();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !atlas.open) zoomOut(); });
  addEventListener('popstate', () => { applyRoute(idFromHash(location.hash), { focusNode: pendingFocus }); pendingFocus = null; });
  addEventListener('hashchange', () => { const id = idFromHash(location.hash); if (id !== active) applyRoute(id); });

  // Time slows almost to a stop while you aim at a label.
  layer.addEventListener('pointerover', (e) => { if (e.target.closest('.tag')) calmTarget = 0.06; });
  layer.addEventListener('pointerout', (e) => { if (e.target.closest('.tag')) calmTarget = 1; });
  layer.addEventListener('focusin', () => { calmTarget = 0.06; });
  layer.addEventListener('focusout', () => { calmTarget = 1; });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointerTarget.x = (e.clientX / innerWidth) * 2 - 1;
    pointerTarget.y = (e.clientY / innerHeight) * 2 - 1;
  });

  for (const b of document.querySelectorAll('[data-open-atlas]')) b.addEventListener('click', () => atlas.showModal());
  atlas.querySelector('[data-close-atlas]').addEventListener('click', () => atlas.close());
  atlas.addEventListener('click', (e) => { if (e.target === atlas) atlas.close(); });
  addEventListener('resize', resize);

  window.galaxyDebug = { renderer, scene, camera, get active() { return active; }, get flight() { return flight; } };
  document.documentElement.classList.add('map-ready');
  resize();
  applyRoute(idFromHash(location.hash), { snap: true });
  requestAnimationFrame(frame);
}
