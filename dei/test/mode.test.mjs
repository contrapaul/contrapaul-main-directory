import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run, runIn } from './shim.mjs';

test('off by default: label offers Presenter, aria-pressed false', () => {
  const { env, modeBtn, modeLabel } = makeEnv({});
  const ctx = run('js/mode.js', env);
  assert.equal(ctx.document.documentElement.getAttribute('data-mode'), null);
  assert.equal(modeBtn.getAttribute('aria-pressed'), 'false');
  assert.equal(modeLabel.textContent, 'Presenter');
});

test('click turns presenter mode on, persists it, relabels the button', () => {
  const { env, modeBtn, modeLabel, stored } = makeEnv({});
  const ctx = run('js/mode.js', env);
  modeBtn.fire('click');
  assert.equal(ctx.document.documentElement.getAttribute('data-mode'), 'presenter');
  assert.equal(stored['dei-mode'], 'presenter');
  assert.equal(modeBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(modeLabel.textContent, 'Exit presenter');
});

test('click again turns it off and clears the stored choice', () => {
  const { env, modeBtn, stored } = makeEnv({});
  const ctx = run('js/mode.js', env);
  modeBtn.fire('click');
  modeBtn.fire('click');
  assert.equal(ctx.document.documentElement.getAttribute('data-mode'), null);
  assert.equal('dei-mode' in stored, false);
});

test('a stored choice is reflected in the button state', () => {
  const { env, modeBtn, modeLabel } = makeEnv({ stored: { 'dei-mode': 'presenter' } });
  env.document.documentElement.setAttribute('data-mode', 'presenter'); // pre-paint would have done this
  run('js/mode.js', env);
  assert.equal(modeBtn.getAttribute('aria-pressed'), 'true');
  assert.equal(modeLabel.textContent, 'Exit presenter');
});

test('labels follow the active language', () => {
  const e = makeEnv({ pairs: [{ en: 'x', zh: 'y' }] });
  const ctx = run('js/i18n.js', e.env);       // en active
  runIn(ctx, 'js/mode.js');
  ctx.dei.mode.set(true);
  assert.equal(e.modeLabel.textContent, 'Exit presenter');
  ctx.dei.i18n.toggle();                        // to zh
  assert.equal(e.modeLabel.textContent, '\u9000\u51fa\u6f14\u793a\u6a21\u5f0f');
  ctx.dei.mode.set(false);
  assert.equal(e.modeLabel.textContent, '\u6f14\u793a\u6a21\u5f0f');
});
