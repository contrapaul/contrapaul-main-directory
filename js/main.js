// DOM wiring: routing, the animation loop, panel, focus and input.
import { NODES, indexNodes } from './network.js';
import { buildOrbits, positions, SCREEN_R } from './layout.js';
import { buildScene, linkPath } from './scene.js';
import { buildStars, STAR_LAYERS } from './stars.js';
import { panelHTML } from './panel.js';
import { idFromHash, hashFor } from './route.js';
import { viewFor, approach, settled } from './camera.js';

const index = indexNodes(NODES);
const { byId, children, ancestors } = index;
const layout = buildOrbits(NODES);
const rootExtent = layout.orbits.get('root').extent;

const svg = document.getElementById('map');
svg.querySelector('.world').innerHTML = buildScene(NODES, layout);
document.getElementById('stars').innerHTML = buildStars();
const layers = [...document.querySelectorAll('#stars .star-layer')];
const panel = document.getElementById('panel');
const panelBody = panel.querySelector('.panel-body');

const els = new Map();
for (const n of NODES) {
  const g = svg.querySelector(`.node[data-id="${CSS.escape(n.id)}"]`);
  els.set(n.id, {
    g, a: g.querySelector('a'), text: g.querySelector('.label'), hit: g.querySelector('.hit'),
    body: g.querySelector('.body'), halo: g.querySelector('.halo'),
    link: svg.querySelector(`.link[data-id="${CSS.escape(n.id)}"]`),
    ring: svg.querySelector(`.ring[data-id="${CSS.escape(n.id)}"]`),
  });
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const phase = new Map();
const spin = new Map(); // ring id -> current speed factor, eased toward 0 or 1
let active = null, path = new Set();
let clock = 0, calm = 1, calmTarget = 1;
let cam = null, last = 0, running = false, pendingFocus = null;
const pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
let pos = positions(layout, phase, 0);

const urlFor = (id) => (id === 'root' ? location.pathname + location.search : hashFor(id));

function relation(id) {
  const n = byId.get(id);
  if (id === active) return 'active';
  if (path.has(id)) return 'path';
  if (n.parent === active) return 'child';
  if (n.parent && n.parent === byId.get(active).parent) return 'sibling';
  if (n.parent && byId.get(n.parent).parent === active) return 'moon';
  return 'far';
}

function applyRoute(id, { snap = false, focusPanel = false, focusNode = null } = {}) {
  if (!byId.has(id)) {
    id = 'root';
    history.replaceState(null, '', urlFor(id));
  }
  active = id;
  path = new Set(ancestors(id));
  for (const [nid, e] of els) {
    const rel = relation(nid);
    const live = rel !== 'far' && rel !== 'moon';
    e.g.setAttribute('class', `node node--${byId.get(nid).kind} is-${rel}`);
    e.a.setAttribute('tabindex', live ? '0' : '-1');
    if (live) e.a.removeAttribute('aria-hidden'); else e.a.setAttribute('aria-hidden', 'true');
    if (rel === 'active') e.a.setAttribute('aria-current', 'page'); else e.a.removeAttribute('aria-current');
    if (e.link) e.link.setAttribute('class', `link is-${rel}`);
    if (e.ring) e.ring.setAttribute('class', `ring is-${rel}`);
  }

  const atRoot = id === 'root';
  document.body.classList.toggle('at-root', atRoot);
  panel.inert = atRoot;
  panel.classList.toggle('is-open', !atRoot);
  if (!atRoot) {
    panelBody.innerHTML = panelHTML(id, index);
    panelBody.scrollTop = 0;
  }
  document.title = atRoot ? 'contrapaul' : `${byId.get(id).label} | contrapaul`;

  if (snap || !cam) cam = targetView();
  if (focusPanel && !atRoot) panel.querySelector('.panel-title').focus({ preventScroll: true });
  if (focusNode && els.has(focusNode)) els.get(focusNode).a.focus({ preventScroll: true });
  kick();
}

function focusArea() {
  const W = innerWidth, H = innerHeight, phone = W < 760;
  const top = 64 / H;
  if (active === 'root') return phone ? { x: 0.01, y: top, w: 0.98, h: 0.76 - top } : { x: 0.02, y: top, w: 0.96, h: 0.96 - top };
  if (phone) return { x: 0.03, y: top, w: 0.94, h: 0.44 - top };
  const side = Math.min(420, W * 0.45) / W;
  return { x: 0.02, y: top, w: 0.96 - side, h: 0.96 - top };
}

function targetView() {
  const o = layout.orbits.get(active);
  const p = pos.get(active);
  const radius = o.ring ? o.fit : o.r * 6;
  return viewFor(p.x, p.y, radius, svg.clientWidth / svg.clientHeight, focusArea());
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
  if (history.state && history.state.prev === parent) {
    pendingFocus = active;
    history.back();
  } else {
    const from = active;
    history.replaceState(null, '', urlFor(parent));
    applyRoute(parent, { focusNode: from });
  }
}

function frame(t) {
  const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
  last = t;
  const motion = !reduce.matches;

  if (motion) {
    calm += (calmTarget - calm) * (1 - Math.exp(-5 * dt));
    clock += dt * calm;
    for (const [id, o] of layout.orbits) {
      if (!o.omega) continue;
      const target = path.has(id) ? 0 : 1; // rings carrying the active node hold still
      const s = (spin.get(id) ?? 1) + (target - (spin.get(id) ?? 1)) * (1 - Math.exp(-2.5 * dt));
      spin.set(id, s);
      phase.set(id, (phase.get(id) || 0) + o.omega * dt * calm * s);
    }
    pos = positions(layout, phase, clock);
  }

  const target = targetView();
  cam = motion ? approach(cam, target, dt, 3) : target;
  svg.setAttribute('viewBox', `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
  const u = cam.w / svg.clientWidth;
  svg.style.setProperty('--u', u);

  for (const [id, e] of els) {
    const p = pos.get(id), o = layout.orbits.get(id);
    e.g.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    const r = Math.max(2 * u, Math.min(o.r, SCREEN_R[o.kind] * u));
    e.body.setAttribute('r', r.toFixed(2));
    e.halo.setAttribute('r', (r * 2.4).toFixed(2));
    e.text.setAttribute('y', (r + 15 * u).toFixed(2));
    e.hit.setAttribute('r', Math.max(r, 22 * u).toFixed(2));
    if (e.link) e.link.setAttribute('d', linkPath(pos.get(o.parent), p));
    if (e.ring) e.ring.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
  }

  // Stars: pointer parallax plus a drift that follows the camera, so zooming feels like travel.
  if (motion) {
    pointer.x += (pointerTarget.x - pointer.x) * (1 - Math.exp(-3 * dt));
    pointer.y += (pointerTarget.y - pointer.y) * (1 - Math.exp(-3 * dt));
  }
  const cx = (cam.x + cam.w / 2) / rootExtent, cy = (cam.y + cam.h / 2) / rootExtent;
  const zoom = Math.max(0, Math.log2((rootExtent * 2) / cam.w));
  layers.forEach((l, i) => {
    const d = STAR_LAYERS[i].depth;
    const x = -pointer.x * d * 28 - cx * d * 90, y = -pointer.y * d * 28 - cy * d * 90;
    l.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) translate(800 500) scale(${(1 + d * 0.07 * zoom).toFixed(3)}) translate(-800 -500)`);
  });

  const pointerMoving = Math.hypot(pointerTarget.x - pointer.x, pointerTarget.y - pointer.y) > 0.001;
  if (!document.hidden && (motion || !settled(cam, target) || pointerMoving)) requestAnimationFrame(frame);
  else { running = false; last = 0; }
}

function kick() {
  if (running || document.hidden) return;
  running = true;
  last = 0;
  requestAnimationFrame(frame);
}

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    e.preventDefault();
    if (a.hasAttribute('data-zoom-out')) zoomOut();
    else navigate(idFromHash(a.getAttribute('href')));
    return;
  }
  if (e.target.closest('#map') && !e.target.closest('.node')) zoomOut();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') zoomOut();
});

addEventListener('popstate', () => {
  applyRoute(idFromHash(location.hash), { focusNode: pendingFocus });
  pendingFocus = null;
});
addEventListener('hashchange', () => {
  const id = idFromHash(location.hash);
  if (id !== active) applyRoute(id);
});

// Things slow almost to a stop while you aim at them.
svg.addEventListener('pointerover', (e) => { if (e.target.closest('.node')) calmTarget = 0.08; });
svg.addEventListener('pointerout', (e) => { if (e.target.closest('.node')) calmTarget = 1; });
svg.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) calmTarget = 0.08; });
svg.addEventListener('focusout', () => { calmTarget = 1; });

addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  pointerTarget.x = (e.clientX / innerWidth) * 2 - 1;
  pointerTarget.y = (e.clientY / innerHeight) * 2 - 1;
  kick();
});
addEventListener('resize', kick);
document.addEventListener('visibilitychange', kick);
reduce.addEventListener('change', kick);

document.documentElement.classList.add('map-ready');
applyRoute(idFromHash(location.hash), { snap: true });
