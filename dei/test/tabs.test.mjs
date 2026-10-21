import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run } from './shim.mjs';

const tabs = ['pyp', 'mshs'];

function setup(opts = {}) {
  const made = makeEnv({ panels: tabs, tabLinks: tabs, ...opts });
  const ctx = run('js/tabs.js', made.env);
  const { env, ...rest } = made;
  return { ctx, env: Object.assign({}, env, rest) };
}

test('no hash: the pyp panel is active (the no-JS default)', () => {
  const { ctx, env } = setup();
  const active = env.panelEls.find((p) => p.classes.has('is-active'));
  assert.equal(active.attrs['data-tab-panel'], 'pyp');
});

test('#/mshs activates the MS/HS panel and its tab link', () => {
  const { ctx, env } = setup({ hash: '#/mshs' });
  const active = env.panelEls.find((p) => p.classes.has('is-active'));
  assert.equal(active.attrs['data-tab-panel'], 'mshs');
  const link = env.linkEls.find((l) => l.classes.has('is-active'));
  assert.equal(link.attrs['data-tab'], 'mshs');
  assert.equal(link.attrs['aria-current'], 'page');
});

test('an unknown tab (#/s1 from the old six tab routes) falls back to pyp', () => {
  const { env } = setup({ hash: '#/s1' });
  const active = env.panelEls.find((p) => p.classes.has('is-active'));
  assert.equal(active.attrs['data-tab-panel'], 'pyp');
});

test('go() deep links to a scenario section inside the target tab', () => {
  const { ctx, env } = setup();
  const target = { scrollCalls: [], scrollIntoView(o) { this.scrollCalls.push(o); } };
  env.document.getElementById = (id) => (id === 'sc7' ? target : null);
  ctx.dei.tabs.go('mshs', 'sc7');
  ctx.fire('hashchange');
  const active = env.panelEls.find((p) => p.classes.has('is-active'));
  assert.equal(active.attrs['data-tab-panel'], 'mshs');
  assert.ok(target.scrollCalls.length >= 1);
});

test('go() to an unknown tab is a no-op', () => {
  const { ctx, env } = setup();
  env.window.scrollToCalls = [];
  const before = env.panelEls.find((p) => p.classes.has('is-active'));
  ctx.dei.tabs.go('s9');
  ctx.fire('hashchange');
  const after = env.panelEls.find((p) => p.classes.has('is-active'));
  assert.equal(before, after);
  assert.equal(after.attrs['data-tab-panel'], 'pyp');
});
