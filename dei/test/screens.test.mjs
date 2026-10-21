import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, makeEl, run } from './shim.mjs';

function threeScreens() {
  return makeEnv({
    panels: ['s1', 's2'],
    tabLinks: ['s1', 's2'],
    reduced: true, // instant reveals, deterministic
    vh: 800,
    screens: [
      { id: 's1-1', title: 'Scenario one', top: -500, height: 800, reveals: 2 },
      { id: 's1-2', title: 'How this page works', top: 100, height: 800, reveals: 2 },
      { id: 's1-3', title: 'Discussion', top: 900, height: 1200, reveals: 1 },
    ],
  });
}

function key(k, active) {
  return {
    key: k,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    metaKey: false, ctrlKey: false, altKey: false,
  };
}

test('current screen is the one whose top is above mid-viewport', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  assert.equal(ctx.dei.screens.current(), screenEls[1]);
});

test('the current screen\'s reveals are in; the strip shows its title', () => {
  const { env, screenEls, stripTitle } = threeScreens();
  run('js/screens.js', env);
  screenEls[1].revealEls.forEach((el) => assert.ok(el.classes.has('is-in')));
  screenEls[2].revealEls.forEach((el) => assert.ok(!el.classes.has('is-in')));
  assert.equal(stripTitle.textContent, 'How this page works');
});

test('ArrowDown steps to the next screen and lands on its top', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  const ev = key('ArrowDown');
  ctx.fire('keydown', ev);
  assert.ok(ev.defaultPrevented);
  assert.equal(screenEls[2].scrollCalls.length, 1);
  assert.equal(ctx.dei.screens.current(), screenEls[2]);
  // Leaving a screen clears its reveals so they replay on return.
  screenEls[1].revealEls.forEach((el) => assert.ok(!el.classes.has('is-in')));
  screenEls[2].revealEls.forEach((el) => assert.ok(el.classes.has('is-in')));
});

test('ArrowDown at the last screen stays put', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  ctx.dei.screens.next();
  const before = screenEls[2].scrollCalls.length;
  ctx.fire('keydown', key('ArrowDown'));
  assert.equal(screenEls[2].scrollCalls.length, before + 1); // same screen, no crash
  assert.equal(ctx.dei.screens.current(), screenEls[2]);
});

test('ArrowUp steps back and never indexes before the first screen', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  ctx.dei.screens.prev(); // to first
  assert.equal(ctx.dei.screens.current(), screenEls[0]);
  ctx.fire('keydown', key('ArrowUp'));
  assert.equal(ctx.dei.screens.current(), screenEls[0]); // still first
});

test('arrows do nothing while typing in a control', () => {
  const { env, screenEls } = threeScreens();
  const box = makeEl();
  box.tagName = 'TEXTAREA';
  env.document.activeElement = box;
  const ctx = run('js/screens.js', env);
  const ev = key('ArrowDown');
  ctx.fire('keydown', ev);
  assert.ok(!ev.defaultPrevented);
  screenEls.forEach((s) => assert.equal(s.scrollCalls.length, 0));
});

test('arrows do nothing inside a [data-keys-live] interaction', () => {
  const { env, screenEls } = threeScreens();
  const el = makeEl();
  el.tagName = 'DIV';
  el.closest = (sel) => (sel === '[data-keys-live]' ? 'live' : null);
  env.document.activeElement = el;
  const ctx = run('js/screens.js', env);
  ctx.fire('keydown', key('ArrowDown'));
  screenEls.forEach((s) => assert.equal(s.scrollCalls.length, 0));
});

test('Space advances, unless a button or link has focus', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  const ev = key(' ');
  ctx.fire('keydown', ev);
  assert.ok(ev.defaultPrevented);

  const btn = makeEl();
  btn.tagName = 'BUTTON';
  env.document.activeElement = btn;
  const calls = screenEls.reduce((n, s) => n + s.scrollCalls.length, 0);
  const ev2 = key(' ');
  ctx.fire('keydown', ev2);
  assert.ok(!ev2.defaultPrevented);
  assert.equal(screenEls.reduce((n, s) => n + s.scrollCalls.length, 0), calls);
});

test('modifier combinations are left alone', () => {
  const { env, screenEls } = threeScreens();
  const ctx = run('js/screens.js', env);
  const ev = { ...key('ArrowDown'), metaKey: true };
  ctx.fire('keydown', ev);
  assert.ok(!ev.defaultPrevented);
  screenEls.forEach((s) => assert.equal(s.scrollCalls.length, 0));
});

test('the rail gets one dot per screen with the current marked', () => {
  const { env, rail } = threeScreens();
  run('js/screens.js', env);
  assert.equal(rail.children.length, 3);
  rail.children.forEach((d, i) => {
    assert.ok(d.classes.has('rail-dot'));
    assert.equal(d.classes.has('is-current'), i === 1);
    assert.equal(d.classes.has('is-passed'), i === 0);
  });
});

test('a rail dot click jumps to its screen', () => {
  const { env, rail, screenEls } = threeScreens();
  run('js/screens.js', env);
  rail.children[2].fire('click', { preventDefault() {} });
  assert.equal(screenEls[2].scrollCalls.length, 1);
  assert.equal(rail.children[2].classes.has('is-current'), true);
});

test('strip buttons drive prev and next', () => {
  const { env, stripPrev, stripNext, screenEls } = threeScreens();
  run('js/screens.js', env);
  stripNext.fire('click');
  assert.equal(screenEls[2].scrollCalls.length, 1);
  stripPrev.fire('click');
  assert.equal(screenEls[1].scrollCalls.length, 1);
});

test('audit reports screens taller than the viewport, nothing else', () => {
  const { env } = threeScreens();
  const ctx = run('js/screens.js', env);
  const offenders = ctx.dei.screens.audit();
  assert.equal(offenders.length, 1);
  assert.equal(offenders[0].id, 's1-3');
  assert.equal(offenders[0].over, 400);
});

test('a clean page audits empty', () => {
  const e = makeEnv({
    panels: ['s1'], tabLinks: ['s1'], reduced: true, vh: 800,
    screens: [
      { id: 'a', top: 0, height: 800 },
      { id: 'b', top: 800, height: 700 },
    ],
  });
  const ctx = run('js/screens.js', e.env);
  assert.equal(ctx.dei.screens.audit().length, 0); // cross-realm array: compare length
});
