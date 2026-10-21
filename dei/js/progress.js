/* ============================================================
   DEI training page: explorer progress
   ------------------------------------------------------------
   The explorer reward (plans.md, "The explorer reward"): a badge
   when every interactive element of all nine scenarios has been
   engaged. Scrolling a tab or opening it earns nothing; only the
   interactions in js/scenarios.js mark progress.

   Stored in localStorage under 'dei-progress' as
   { "sc1": { "player": 1, "debrief": 1 }, ... }. Survives reload,
   resettable from the presenter strip (the bilingual reset
   button) and from the console via dei.progress.reset().
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'dei-progress';
  var scenarios = (window.dei && window.dei.scenarios) || [];
  var i18n = window.dei.i18n;

  var DONE = { en: '(done)', zh: '示例：待翻译' };
  var store = load();
  var wasAll = allDone(); /* no celebration for work done in earlier visits */

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store)); }
    catch (e) { /* file:// or private mode: progress just does not persist */ }
  }

  function elements(scId) {
    for (var i = 0; i < scenarios.length; i++) {
      if (scenarios[i].id === scId) return scenarios[i].elements || [];
    }
    return [];
  }

  function isDone(scId, elName) {
    return !!(store[scId] && store[scId][elName]);
  }

  function scenarioDone(scId) {
    var els = elements(scId);
    if (!els.length) return false;
    for (var i = 0; i < els.length; i++) {
      if (!isDone(scId, els[i])) return false;
    }
    return true;
  }

  function allDone() {
    for (var i = 0; i < scenarios.length; i++) {
      if (!scenarioDone(scenarios[i].id)) return false;
    }
    return scenarios.length > 0;
  }

  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  /* ---------- marks: jump chips, tab links, header badge ------ */

  function paintMarks() {
    var ui = window.dei.ui;
    if (ui && ui.chips) {
      scenarios.forEach(function (sc) {
        var chip = ui.chips[sc.id];
        if (!chip) return;
        var done = scenarioDone(sc.id);
        chip.el.classList.toggle('is-done', done);
        chip.doneEl.textContent = done ? i18n.t(DONE) : '';
      });
    }
    var links = document.querySelectorAll('[data-tab]');
    links.forEach(function (link) {
      var tab = link.getAttribute('data-tab');
      var all = true;
      var any = false;
      scenarios.forEach(function (sc) {
        if (sc.tab !== tab) return;
        any = true;
        if (!scenarioDone(sc.id)) all = false;
      });
      link.classList.toggle('is-done', any && all);
    });
    var badge = document.querySelector('[data-badge]');
    if (badge) badge.setAttribute('hidden', allDone() ? 'false' : 'true');
  }

  function celebrate() {
    if (reduced()) return; /* the badge alone is the still version */
    var burst = document.createElement('div');
    burst.className = 'celebrate';
    burst.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 12; i++) {
      burst.appendChild(document.createElement('span'));
    }
    document.body.appendChild(burst);
    if (typeof setTimeout === 'function') {
      setTimeout(function () {
        if (burst.parentNode) burst.parentNode.removeChild(burst);
      }, 1600);
    }
  }

  function reset() {
    store = {};
    save();
    wasAll = allDone();
    paintMarks();
    var ui = window.dei.ui;
    if (ui && ui.resetAll) ui.resetAll();
  }

  window.dei = window.dei || {};
  window.dei.progress = {
    markDone: function (scId, elName) {
      if (!store[scId] || !store[scId][elName]) {
        store[scId] = store[scId] || {};
        store[scId][elName] = 1;
        save();
      }
      paintMarks();
      if (!wasAll && allDone()) {
        wasAll = true;
        celebrate();
      }
    },
    isDone: isDone,
    scenarioDone: scenarioDone,
    allDone: allDone,
    reset: reset
  };

  var resetBtn = document.querySelector('[data-reset-progress]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () { reset(); });
  }

  /* Re-apply the (done) marks on language switch so the pair is
     right. Registered after js/i18n.js's listener. */
  var langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) langBtn.addEventListener('click', paintMarks);

  paintMarks();
})();
