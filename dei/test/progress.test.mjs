import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run, runIn } from './shim.mjs';

const KEY = 'dei-progress';

function setup(opts = {}) {
  const made = makeEnv({ panels: ['pyp', 'mshs'], tabLinks: ['pyp', 'mshs'], ...opts });
  const ctx = run('data/scenarios.js', made.env);
  /* Load order matches index.html: scenarios renders first,
     progress syncs over the rendered chips. */
  runIn(ctx, 'js/i18n.js');
  runIn(ctx, 'js/scenarios.js');
  runIn(ctx, 'js/progress.js');
  const { env, ...rest } = made;
  return { ctx, env: Object.assign({}, env, rest) };
}

/* Build the full store (every element of every scenario done)
   from the scenario data. */
function fullStore(ctx) {
  const store = {};
  ctx.dei.scenarios.forEach((sc) => {
    store[sc.id] = {};
    sc.elements.forEach((el) => { store[sc.id][el] = 1; });
  });
  return JSON.stringify(store);
}

test('markDone persists to localStorage as JSON', () => {
  const { ctx, env } = setup();
  ctx.dei.progress.markDone('sc1', 'debrief');
  const parsed = JSON.parse(env.stored[KEY]);
  assert.deepEqual(parsed, { sc1: { debrief: 1 } });
  assert.ok(ctx.dei.progress.isDone('sc1', 'debrief'));
});

test('scenarioDone requires every element of the scenario', () => {
  const { ctx } = setup();
  ctx.dei.progress.markDone('sc1', 'debrief');
  assert.ok(!ctx.dei.progress.scenarioDone('sc1'));
  ctx.dei.progress.markDone('sc1', 'rb0');
  assert.ok(!ctx.dei.progress.scenarioDone('sc1'));
  ctx.dei.progress.markDone('sc1', 'player');
  assert.ok(ctx.dei.progress.scenarioDone('sc1'));
  assert.ok(!ctx.dei.progress.allDone());
});

test('progress survives a reload', () => {
  const { ctx } = setup();
  const store = {};
  ctx.dei.progress.markDone('sc1', 'player');
  store.sc1 = { player: 1 };
  const second = setup({ stored: { [KEY]: JSON.stringify(store) } });
  assert.ok(second.ctx.dei.progress.isDone('sc1', 'player'));
  assert.equal(second.ctx.dei.progress.scenarioDone('sc1'), false);
});

test('work finished in an earlier visit shows the badge without celebrating', () => {
  const { ctx } = setup();
  const pre = fullStore(ctx);
  const second = setup({ stored: { [KEY]: pre } });
  assert.ok(second.ctx.dei.progress.allDone());
  assert.equal(second.env.badgeEl.attrs['hidden'], 'false');
  const bursts = second.env.document.body.children.filter((c) => c.classes.has('celebrate'));
  assert.equal(bursts.length, 0);
  // The jump chips and tab links carry their marks on load.
  assert.ok(second.ctx.dei.ui.chips.sc9.el.classes.has('is-done'));
  second.env.linkEls.forEach((l) => assert.ok(l.classes.has('is-done')));
});

test('the presenter strip reset button clears everything', () => {
  const { ctx, env } = setup();
  ctx.dei.scenarios.forEach((sc) => {
    sc.elements.forEach((el) => ctx.dei.progress.markDone(sc.id, el));
  });
  assert.ok(ctx.dei.progress.allDone());
  env.resetBtn.fire('click');
  assert.equal(env.stored[KEY], '{}');
  assert.ok(!ctx.dei.progress.allDone());
  assert.equal(env.badgeEl.attrs['hidden'], 'true');
});

test('corrupt stored progress loads as empty, not as a crash', () => {
  const { ctx } = setup({ stored: { [KEY]: '{not json' } });
  assert.ok(!ctx.dei.progress.allDone());
  ctx.dei.progress.markDone('sc1', 'debrief');
  assert.ok(ctx.dei.progress.isDone('sc1', 'debrief'));
});
