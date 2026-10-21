/* ============================================================
   DEI training page: theme module
   ------------------------------------------------------------
   Adapted from make/localai/js/theme.js (plain script, not an
   ES module: the page must run from file://, where modules
   fail, brief hard requirement 5).

   - Light + dark via [data-theme] on <html>.
   - Precedence: stored choice > OS scheme.
   - Until the user toggles manually, follow the OS.
   - The inline pre-paint snippet in index.html <head> mirrors
     this resolution. Keep the two in sync.
   ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'dei-theme';

  function isTheme(v) { return v === 'light' || v === 'dark'; }

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeStored(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  function systemScheme() {
    try {
      return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) { return 'light'; }
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  var stored = readStored();
  var theme = isTheme(stored) ? stored : systemScheme();
  apply(theme);

  var buttons = Array.prototype.slice.call(
    document.querySelectorAll('[data-theme-toggle]')
  );

  function syncButtons() {
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      var label = btn.querySelector('[data-theme-label]');
      if (label) label.textContent = theme === 'dark'
        ? (btn.getAttribute('data-label-dark') || 'Light')
        : (btn.getAttribute('data-label-light') || 'Dark');
    });
  }

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    writeStored(theme);
    syncButtons();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', toggle);
  });
  syncButtons();

  // Follow the OS until the user makes an explicit choice.
  if (!isTheme(stored)) {
    try {
      matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', function (e) { apply(e.matches ? 'dark' : 'light'); });
    } catch (e) { /* no live updates, fine */ }
  }

  // Exposed for tests and the presenter strip (step 2).
  window.dei = window.dei || {};
  window.dei.theme = { get current() { return theme; }, toggle: toggle };
})();
