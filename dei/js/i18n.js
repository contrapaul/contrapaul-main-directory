/* ============================================================
   DEI training page: language module (EN / 中文, Simplified)
   ------------------------------------------------------------
   Every user facing element carries data-en and data-zh.
   This module swaps textContent from the active language and
   persists the choice. Content data (scenarios) uses
   the same {"en": ..., "zh": ...} pair shape, so this module
   also exposes dei.i18n.t(pair).

   Plain script, not a module: the page must run from file://.

   The pre-paint snippet in index.html <head> sets
   [data-lang] and <html lang> before first paint. Keep in
   sync with resolveInitialLang() below.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'dei-lang';
  var LANGS = ['en', 'zh'];

  function isLang(v) { return LANGS.indexOf(v) !== -1; }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeStored(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  function resolveInitialLang() {
    var stored = readStored();
    return isLang(stored) ? stored : 'en';
  }

  var lang = resolveInitialLang();

  function apply() {
    var root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.lang = (lang === 'zh') ? 'zh-Hans' : 'en';

    // Every translatable element carries both attributes.
    // A missing pair is an authoring bug: leave the visible
    // text as-is so the page never goes blank.
    var nodes = document.querySelectorAll('[data-en][data-zh]');
    nodes.forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text !== null) el.textContent = text;
    });

    // The toggle button shows the language you would switch TO.
    var btn = document.querySelector('[data-lang-toggle]');
    if (btn) {
      var label = btn.querySelector('[data-lang-label]');
      var next = (lang === 'en') ? 'zh' : 'en';
      if (label) label.textContent = (next === 'zh') ? '\u4e2d\u6587' : 'EN';
      btn.setAttribute('aria-label', lang === 'en'
        ? 'Switch to Simplified Chinese'
        : 'Switch to English');
    }

    // Scripts that render text from data pairs re-render on this.
    if (typeof document.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('dei:lang', { detail: { lang: lang } }));
    }
  }

  function toggle() {
    lang = (lang === 'en') ? 'zh' : 'en';
    writeStored(lang);
    apply();
  }

  var btn = document.querySelector('[data-lang-toggle]');
  if (btn) btn.addEventListener('click', toggle);
  apply();

  // Scenario and reward text resolves its pairs through this
  // helper. A pair without zh yet falls back to English.
  window.dei = window.dei || {};
  window.dei.i18n = {
    get current() { return lang; },
    toggle: toggle,
    t: function (pair) {
      if (!pair) return '';
      if (typeof pair === 'string') return pair;   // plain string, not a pair
      return pair[lang] ? pair[lang] : pair.en;
    }
  };
})();
