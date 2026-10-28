import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run, runIn } from './shim.mjs';

const KEY = 'dei-progress';
const PYP = ['sc1', 'sc2', 'sc3', 'sc4'];
const MSHS = ['sc5', 'sc6', 'sc7', 'sc9'];

function setup(opts = {}) {
  const made = makeEnv(opts);
  const ctx = run('data/scenarios.js', made.env);
  runIn(ctx, 'js/i18n.js');
  runIn(ctx, 'js/progress.js');
  return { ctx, ...made };
}

// Copy out of the sandbox so deepEqual sees a plain array.
const earned = (ctx) => Array.from(ctx.dei.progress.earned());
/* The header slot holds the trophy button and the awards list. */
const trophy = (env) => env.rewardsEl.children[0];
const count = (env) => trophy(env).children[1].textContent;
const status = (env) => env.rewardsEl.children[1].children[0].children.map((li) => li.children[2].textContent);

test('the trophy opens and closes the awards list', () => {
  const env = setup();
  const pop = env.rewardsEl.children[1];
  assert.ok(pop.hasAttribute('hidden'));
  trophy(env).fire('click');
  assert.ok(!pop.hasAttribute('hidden'));
  assert.equal(trophy(env).attrs['aria-expanded'], 'true');
  trophy(env).fire('click');
  assert.ok(pop.hasAttribute('hidden'));
});

test('nothing is earned on load', () => {
  const { ctx, rewardsEl } = setup();
  assert.deepEqual(earned(ctx), []);
  const env = { rewardsEl };
  assert.equal(count(env), '');
  assert.deepEqual(status(env), ['0 of 4 played', '0 of 4 played', '0 of 8 played']);
});

test('PYP reward needs all four PYP scenarios, and only those', () => {
  const env = setup();
  PYP.slice(0, 3).forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), []);
  env.ctx.dei.progress.complete('sc4');
  assert.deepEqual(earned(env.ctx), ['pyp']);
  assert.equal(count(env), '1');
  assert.deepEqual(status(env), ['\u2713 Earned', '0 of 4 played', '4 of 8 played']);
  assert.ok(trophy(env).classes.has('is-new'));
});

test('all eight earn MS/HS and Conflict Resolution too', () => {
  const env = setup();
  MSHS.forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), ['mshs']);
  PYP.forEach((id) => env.ctx.dei.progress.complete(id));
  assert.deepEqual(earned(env.ctx), ['pyp', 'mshs', 'all']);
  assert.equal(count(env), '3');
  assert.equal(trophy(env).attrs['aria-label'], 'Awards: 3 / 3');
});

test('progress survives a reload; earlier rewards show without the pop', () => {
  const first = setup();
  PYP.forEach((id) => first.ctx.dei.progress.complete(id));
  const second = setup({ stored: { [KEY]: first.stored[KEY] } });
  assert.deepEqual(earned(second.ctx), ['pyp']);
  assert.ok(!trophy(second).classes.has('is-new'));
  assert.equal(count(second), '1');
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
