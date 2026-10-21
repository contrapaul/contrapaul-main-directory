import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run, runIn } from './shim.mjs';

const KEY = 'dei-progress';
const PYP = ['sc1', 'sc2', 'sc3', 'sc4'];
const MSHS = ['sc5', 'sc6', 'sc7', 'sc8', 'sc9'];

function setup(opts = {}) {
  const made = makeEnv(opts);
  const ctx = run('data/scenarios.js', made.env);
  runIn(ctx, 'js/i18n.js');
  runIn(ctx, 'js/progress.js');
  return { ctx, ...made };
}

// Copy out of the sandbox so deepEqual sees a plain array.
const earned = (ctx) => Array.from(ctx.dei.progress.earned());
const shown = (env) => env.rewardsEl.children.map((c) => c.textContent);

test('nothing is earned on load', () => {
  const { ctx, rewardsEl } = setup();
  assert.deepEqual(earned(ctx), []);
  assert.equal(rewardsEl.children.length, 0);
});

test('PYP reward needs all four PYP scenarios, and only those', () => {
  const env = setup();
  PYP.slice(0, 3).forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), []);
  env.ctx.dei.progress.complete('sc4');
  assert.deepEqual(earned(env.ctx), ['pyp']);
  assert.equal(shown(env).length, 1);
  assert.ok(env.rewardsEl.children[0].classes.has('is-new'));
});

test('all nine earn MS/HS and Conflict Resolution too', () => {
  const env = setup();
  MSHS.forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), ['mshs']);
  PYP.forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), ['pyp', 'mshs', 'all']);
  assert.equal(env.rewardsEl.children[2].attrs['aria-label'], 'Conflict Resolution');
});

test('progress survives a reload; earlier rewards show without the pop', () => {
  const first = setup();
  PYP.forEach((id) => first.ctx.dei.progress.complete(id));
  const second = setup({ stored: { [KEY]: first.stored[KEY] } });
  assert.deepEqual(earned(second.ctx), ['pyp']);
  assert.ok(!second.rewardsEl.children[0].classes.has('is-new'));
});

test('completing twice changes nothing', () => {
  const env = setup();
  env.ctx.dei.progress.complete('sc1');
  const before = env.stored[KEY];
  env.ctx.dei.progress.complete('sc1');
  assert.equal(env.stored[KEY], before);
});

test('corrupt or old-format progress loads as empty, not as a crash', () => {
  for (const bad of ['{not json', JSON.stringify({ sc1: { player: 1 } })]) {
    const { ctx } = setup({ stored: { [KEY]: bad } });
    assert.ok(!ctx.dei.progress.isComplete('sc1'));
    ctx.dei.progress.complete('sc1');
    assert.ok(ctx.dei.progress.isComplete('sc1'));
  }
});
