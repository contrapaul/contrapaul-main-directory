import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run } from './shim.mjs';

test('applies English by default and swaps every paired element', () => {
  const { env, pairEls } = makeEnv({
    pairs: [{ en: 'Introduction', zh: '\u4ecb\u7ecd' }],
  });
  const ctx = run('js/i18n.js', env);
  assert.equal(pairEls[0].textContent, 'Introduction');
  assert.equal(ctx.document.documentElement.getAttribute('data-lang'), 'en');
  assert.equal(ctx.document.documentElement.lang, 'en');
});

test('toggle switches to Simplified Chinese, persists, and updates the toggle label', () => {
  const { env, pairEls, langLabel, stored } = makeEnv({
    pairs: [{ en: 'Introduction', zh: '\u4ecb\u7ecd' }],
  });
  const ctx = run('js/i18n.js', env);
  ctx.dei.i18n.toggle();
  assert.equal(pairEls[0].textContent, '\u4ecb\u7ecd');
  assert.equal(stored['dei-lang'], 'zh');
  assert.equal(ctx.document.documentElement.lang, 'zh-Hans');
  assert.equal(langLabel.textContent, 'EN'); // shows the language you would switch to
  ctx.dei.i18n.toggle();
  assert.equal(pairEls[0].textContent, 'Introduction');
  assert.equal(langLabel.textContent, '\u4e2d\u6587');
});

test('a stored choice wins over the default', () => {
  const { env, pairEls } = makeEnv({
    pairs: [{ en: 'Introduction', zh: '\u4ecb\u7ecd' }],
    stored: { 'dei-lang': 'zh' },
  });
  run('js/i18n.js', env);
  assert.equal(pairEls[0].textContent, '\u4ecb\u7ecd');
});

test('a missing pair never blanks the page', () => {
  const { env, pairEls } = makeEnv({
    pairs: [{ en: 'Has English only', start: 'Has English only' }],
  });
  const ctx = run('js/i18n.js', env);
  ctx.dei.i18n.toggle(); // to zh, where the pair is missing
  assert.equal(pairEls[0].textContent, 'Has English only');
});

test('t() resolves content pairs through the active language', () => {
  const { env } = makeEnv({});
  const ctx = run('js/i18n.js', env);
  const pair = { en: 'flip cards', zh: '\u7ffb\u724c' };
  assert.equal(ctx.dei.i18n.t(pair), 'flip cards');
  ctx.dei.i18n.toggle();
  assert.equal(ctx.dei.i18n.t(pair), '\u7ffb\u724c');
  assert.equal(ctx.dei.i18n.t('plain string'), 'plain string');
});
