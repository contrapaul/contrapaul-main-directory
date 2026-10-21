/* Shared DOM shim for running dei's plain browser scripts under
   node --test. The page must stay module-free (file:// rule), so
   tests execute the raw script text in a sandbox with just enough
   DOM to drive the logic.
   Add to this shim as tests need more; keep it small. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

export function script(name) {
  return readFileSync(path.join(root, name), 'utf8');
}

export function makeEl(attrs = {}) {
  const el = {
    attrs: { ...attrs },
    textContent: attrs.text || '',
    classes: new Set(),
    listeners: {},
    children: [],
    _innerHTML: '',
    // Layout stubs, settable per element for tests.
    rect: { top: 0, height: 0 },
    scrollCalls: [],
    isContentEditable: false,
    closest() { return null; },
    getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; },
    setAttribute(k, v) { this.attrs[k] = String(v); },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
    fire(type, ev) { (this.listeners[type] || []).forEach((fn) => fn(ev || {})); },
    classList: {
      toggle(cls, on) { on ? el.classes.add(cls) : el.classes.delete(cls); },
      add(cls) { el.classes.add(cls); },
      remove(cls) { el.classes.delete(cls); },
      contains(cls) { return el.classes.has(cls); },
    },
    get className() { return [...el.classes].join(' '); },
    set className(v) { el.classes.clear(); String(v).split(/\s+/).filter(Boolean).forEach((c) => el.classes.add(c)); },
    getBoundingClientRect() { return { top: this.rect.top, height: this.rect.height, bottom: this.rect.top + this.rect.height }; },
    scrollIntoView(opts) { this.scrollCalls.push(opts || true); },
    querySelector(sel) { return el.children.find((c) => c.sel === sel) || null; },
    querySelectorAll(sel) {
      if (sel === '[data-screen]') return el.screenEls || [];
      if (sel === '[data-reveal]') return el.revealEls || [];
      return [];
    },
    appendChild(c) { el.children.push(c); },
    get innerHTML() { return el._innerHTML; },
    set innerHTML(v) { el._innerHTML = v; if (v === '') el.children.length = 0; },
  };
  return el;
}

/**
 * Build a sandbox with the globals dei's scripts touch.
 * opts:
 *   pairs:      array of {en, zh, missing?: true} → [data-en][data-zh] elements
 *   panels:     array of panel names → [data-tab-panel] elements
 *   tabLinks:   array of tab names → [data-tab] elements
 *   hash:       location.hash
 *   stored:     { 'dei-theme': ..., 'dei-lang': ... }
 *   systemDark: prefers-color-scheme
 */
export function makeEnv(opts = {}) {
  const stored = { ...(opts.stored || {}) };
  const pairEls = (opts.pairs || []).map((p) => {
    const el = makeEl();
    if (p.en !== undefined) el.attrs['data-en'] = p.en;
    if (p.zh !== undefined) el.attrs['data-zh'] = p.zh;
    el.textContent = p.start || p.en || '';
    return el;
  });

  const panelEls = (opts.panels || []).map((name, i) => {
    const el = makeEl({ 'data-tab-panel': name });
    // The first panel is the no-JS default (the markup marks it
    // .is-active), so the test environment does the same.
    if (i === 0) el.classes.add('is-active');
    return el;
  });

  const linkEls = (opts.tabLinks || []).map((name) => makeEl({ 'data-tab': name }));

  const langBtn = makeEl();
  const langLabel = makeEl();
  langLabel.sel = '[data-lang-label]';
  langLabel.textContent = '\u4e2d\u6587';
  langBtn.children.push(langLabel);

  const themeBtn = makeEl();
  const themeLabel = makeEl();
  themeLabel.sel = '[data-theme-label]';
  themeLabel.textContent = 'Dark';
  themeBtn.children.push(themeLabel);

  const modeBtn = makeEl();
  const modeLabel = makeEl();
  modeLabel.sel = '[data-mode-label]';
  modeLabel.textContent = 'Presenter';
  modeBtn.children.push(modeLabel);
  // Once js/mode.js has synced the pair onto the label span, i18n's
  // apply() must pick it up like any other translatable element.
  pairEls.push(modeLabel);

  /* Screen elements for the engine. opts.screens: array of
     { id, title, top, height, reveals: n } */
  const screenEls = (opts.screens || []).map((s) => {
    const el = makeEl();
    el.id = s.id || '';
    el.rect = { top: s.top ?? 0, height: s.height ?? 100 };
    const title = makeEl();
    title.sel = 'h1, h2, .screen-title';
    title.textContent = s.title || (s.id || 'screen');
    el.children.push(title);
    el.revealEls = Array.from({ length: s.reveals ?? 0 }, () => makeEl());
    return el;
  });
  panelEls.forEach((p) => { p.screenEls = screenEls; });

  const rail = makeEl();
  const stripTitle = makeEl();
  const stripPrev = makeEl();
  const stripNext = makeEl();

  /* Explorer progress (js/progress.js). */
  const badgeEl = makeEl({ hidden: 'true' });
  badgeEl.attrs['data-badge'] = '';
  const resetBtn = makeEl();

  const darkMq = { matches: Boolean(opts.systemDark), listeners: {}, addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); } };

  const document = {
    documentElement: makeEl(),
    body: makeEl(),
    activeElement: opts.activeElement || null,
    createElement() { return makeEl(); },
    querySelectorAll(sel) {
      if (sel === '[data-en][data-zh]') return pairEls;
      if (sel === '[data-tab-panel]') return panelEls;
      if (sel === '[data-tab]') return linkEls;
      if (sel === '[data-theme-toggle]') return [themeBtn];
      if (sel === '[data-strip-prev]') return [stripPrev];
      if (sel === '[data-strip-next]') return [stripNext];
      return [];
    },
    querySelector(sel) {
      if (sel === '[data-lang-toggle]') return langBtn;
      if (sel === '[data-theme-toggle]') return themeBtn;
      if (sel === '[data-mode-toggle]') return modeBtn;
      if (sel === '.tab-panel.is-active') return panelEls.find((p) => p.classes.has('is-active')) || null;
      if (sel === '.tab-panel') return panelEls[0] || null;
      if (sel === '[data-rail]') return rail;
      if (sel === '[data-strip-title]') return stripTitle;
      if (sel === '[data-badge]') return badgeEl;
      if (sel === '[data-reset-progress]') return resetBtn;
      return null;
    },
    getElementById() { return null; },
  };

  const env = {
    document,
    window: { scrollTo() {}, addEventListener() {} },
    location: { hash: opts.hash || '' },
    history: { replaceState() {} },
    localStorage: {
      getItem(k) { return Object.prototype.hasOwnProperty.call(stored, k) ? stored[k] : null; },
      setItem(k, v) { stored[k] = String(v); },
      removeItem(k) { delete stored[k]; },
    },
    matchMedia(q) {
      if (q === '(prefers-color-scheme: dark)') return darkMq;
      if (q === '(prefers-reduced-motion: reduce)') return { matches: Boolean(opts.reduced) };
      return { matches: false, addEventListener() {} };
    },
    innerHeight: opts.vh ?? 800,
    requestAnimationFrame(fn) { fn(); return 0; },
    console,
  };
  env.window.localStorage = env.localStorage;
  return { env, pairEls, panelEls, linkEls, langBtn, langLabel, themeBtn, themeLabel, modeBtn, modeLabel, screenEls, rail, stripTitle, stripPrev, stripNext, badgeEl, resetBtn, stored, darkMq };
}

export function run(scriptName, env) {
  const sandbox = { ...env, window: env.window, globalThis: undefined };
  // window must be the sandbox itself for `window.dei = ...` to land
  // where tests can read it.
  const ctx = vm.createContext({
    document: env.document,
    location: env.location,
    history: env.history,
    localStorage: env.localStorage,
    matchMedia: env.matchMedia,
    innerHeight: env.innerHeight,
    requestAnimationFrame: env.requestAnimationFrame,
    console,
  });
  // Scripts assign window.dei and call window.addEventListener;
  // give them a window that IS the context so the assignments
  // land where the test can read them.
  ctx.window = ctx;
  ctx.scrollTo = () => {};
  ctx.__listeners = {};
  ctx.addEventListener = (type, fn) => { (ctx.__listeners[type] ||= []).push(fn); };
  ctx.fire = (type, ev) => (ctx.__listeners[type] || []).forEach((fn) => fn(ev));
  vm.runInContext(script(scriptName), ctx, { filename: scriptName });
  return ctx;
}

/** Run a further script inside an existing context (e.g. i18n
 *  before mode, so mode sees dei.i18n). */
export function runIn(ctx, scriptName) {
  vm.runInContext(script(scriptName), ctx, { filename: scriptName });
  return ctx;
}
