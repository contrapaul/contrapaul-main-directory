import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run } from './shim.mjs';

test('follows the OS scheme when nothing is stored', () => {
  const { env } = makeEnv({ systemDark: true });
  const ctx = run('js/theme.js', env);
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'dark');
});

test('a stored choice wins over the OS', () => {
  const { env } = makeEnv({ systemDark: true, stored: { 'dei-theme': 'light' } });
  const ctx = run('js/theme.js', env);
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'light');
});

test('toggle flips the theme, persists it, and syncs the button', () => {
  const { env, themeBtn, themeLabel, stored } = makeEnv({ systemDark: false });
  const ctx = run('js/theme.js', env);
  assert.equal(themeBtn.getAttribute('aria-pressed'), 'false');
  ctx.dei.theme.toggle();
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(stored['dei-theme'], 'dark');
  assert.equal(themeBtn.getAttribute('aria-pressed'), 'true');
});

test('without an explicit choice, OS scheme changes are tracked', () => {
  const { env, darkMq } = makeEnv({ systemDark: false });
  const ctx = run('js/theme.js', env);
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'light');
  (darkMq.listeners['change'] || []).forEach((fn) => fn({ matches: true }));
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'dark');
});

test('with an explicit choice, OS scheme changes are ignored', () => {
  const { env, darkMq } = makeEnv({ stored: { 'dei-theme': 'light' } });
  const ctx = run('js/theme.js', env);
  (darkMq.listeners['change'] || []).forEach((fn) => fn({ matches: true }));
  assert.equal(ctx.document.documentElement.getAttribute('data-theme'), 'light');
});
