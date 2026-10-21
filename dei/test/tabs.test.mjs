import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run } from './shim.mjs';

const six = ['s1', 's2', 's3', 's4', 's5', 's6'];

function activePanel(env) {
  return env.document.querySelector('.tab-panel.is-active');
}

test('default route shows the s1 panel and marks its link active', () => {
  const { env, linkEls } = makeEnv({ panels: six, tabLinks: six });
  const ctx = run('js/tabs.js', env);

  assert.equal(activePanel(env).attrs['data-tab-panel'], 's1');
  const link = linkEls.find((l) => l.attrs['data-tab'] === 's1');
  assert.equal(link.classes.has('is-active'), true);
  assert.equal(link.attrs['aria-current'], 'page');
  assert.equal(ctx.dei.tabs.current, 's1');
});

test('a #/s3 hash activates the s3 panel', () => {
  const { env } = makeEnv({ panels: six, tabLinks: six, hash: '#/s3' });
  const ctx = run('js/tabs.js', env);

  assert.equal(activePanel(env).attrs['data-tab-panel'], 's3');
  assert.equal(ctx.dei.tabs.current, 's3');
  const s1 = env.document.querySelectorAll('[data-tab-panel]').find((p) => p.attrs['data-tab-panel'] === 's1');
  assert.equal(s1.classes.has('is-active'), false);
});

test('an unknown hash falls back to s1', () => {
  const { env } = makeEnv({ panels: six, tabLinks: six, hash: '#/nope' });
  run('js/tabs.js', env);

  assert.equal(activePanel(env).attrs['data-tab-panel'], 's1');
});

test('go() switches tab and deep links to a target screen', () => {
  const { env } = makeEnv({ panels: six, tabLinks: six });
  const target = { scrollCalls: [] };
  target.scrollIntoView = (o) => target.scrollCalls.push(o || true);
  env.document.getElementById = (id) => (id === 'step-2' ? target : null);

  const ctx = run('js/tabs.js', env);
  ctx.dei.tabs.go('s4', 'step-2');
  assert.equal(env.location.hash, '#/s4#step-2');
  // In the browser the hashchange event does the switch + scroll;
  // the shim fires it by hand.
  ctx.fire('hashchange');
  assert.equal(activePanel(env).attrs['data-tab-panel'], 's4');
  // go() scrolls itself and the hashchange handler does too;
  // both are idempotent, so require at least one, not exactly one.
  assert.ok(target.scrollCalls.length >= 1);
});

test('go() to an unknown tab is a no-op', () => {
  const { env } = makeEnv({ panels: six, tabLinks: six });
  const ctx = run('js/tabs.js', env);
  const before = env.location.hash;
  ctx.dei.tabs.go('intro', null);
  assert.equal(env.location.hash, before);
});
