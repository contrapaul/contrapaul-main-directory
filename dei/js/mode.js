/* ============================================================
   DEI training page: presenter mode
   ------------------------------------------------------------
   Enlarges type (tokens.css data-mode scale), zeroes the motion
   budget, hides the rail, and makes reveals instant. Persists
   to localStorage("dei-mode"); the pre-paint snippet in
   index.html applies it before first paint.

   The button shows what it will do next: "Presenter" when off,
   "Exit presenter" when on, in both languages.

   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'dei-mode';
  // Pairs, so the "no string without a pair" rule holds here too.
  var LABELS = {
    on: { en: 'Exit presenter', zh: '\u9000\u51fa\u6f14\u793a\u6a21\u5f0f' },
    off: { en: 'Presenter', zh: '\u6f14\u793a\u6a21\u5f0f' }
  };

  function root() { return document.documentElement; }

  function isOn() { return root().getAttribute('data-mode') === 'presenter'; }

  function lang() {
    return (window.dei && window.dei.i18n) ? window.dei.i18n.current : 'en';
  }

  function sync() {
    var on = isOn();
    var btn = document.querySelector('[data-mode-toggle]');
    if (!btn) return;
    var l = on ? LABELS.on : LABELS.off;
    // Update the pair attributes so a later language switch keeps
    // the correct label, not the static markup one.
    btn.setAttribute('data-en', l.en);
    btn.setAttribute('data-zh', l.zh);
    btn.setAttribute('aria-pressed', String(on));
    var label = btn.querySelector('[data-mode-label]');
    if (label) {
      // The pair lives on the label span, so a language switch
      // re-applies the correct text without touching the button.
      label.setAttribute('data-en', l.en);
      label.setAttribute('data-zh', l.zh);
      label.textContent = l[lang()];
    }
  }

  function set(on) {
    if (on) root().setAttribute('data-mode', 'presenter');
    else root().removeAttribute('data-mode');
    try {
      if (on) localStorage.setItem(KEY, 'presenter');
      else localStorage.removeItem(KEY);
    } catch (e) { /* private mode */ }
    sync();
    // Reveals become instant: replay the current screen so the
    // presenter immediately sees the settled state.
    if (window.dei && window.dei.screens && window.dei.screens.replay) {
      window.dei.screens.replay();
    }
  }

  var btn = document.querySelector('[data-mode-toggle]');
  if (btn) btn.addEventListener('click', function () { set(!isOn()); });
  sync();

  window.dei = window.dei || {};
  window.dei.mode = { get on() { return isOn(); }, set: set };
})();
