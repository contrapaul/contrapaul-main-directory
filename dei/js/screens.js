/* ============================================================
   DEI training page: screen engine
   ------------------------------------------------------------
   - data-screen sections form an explicit grid. Arrow keys,
     PageUp/PageDown and Space step between them. Landing is
     always the top of a screen, so nothing straddles the fold.
   - Normal scrolling is untouched: snap is proximity, and the
     engine only acts on explicit keys or rail clicks.
   - Arrow keys never fire while typing or inside an interaction
     (inputs, contenteditable, [data-keys-live]). Space is
     additionally guarded while a button or link has focus, so
     activating a focused control still works.
   - Reveal choreography: [data-reveal] elements in the active
     screen fade and rise in DOM order, 60ms stagger. Replayed
     when the screen is re-entered. Instant under reduced motion
     and presenter mode.
   - Progress rail: one dot per screen of the active tab,
     fills as you pass, clickable, rebuilt on tab change.
   - Presenter strip: prev / next and the current screen title.
   - audit(): reports screens taller than the viewport, so the
     "content fits one viewport" rule can be checked.

   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  var STAGGER = 60;

  function reducedMotion() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function presenterMode() {
    return document.documentElement.getAttribute('data-mode') === 'presenter';
  }

  function activePanel() {
    return document.querySelector('.tab-panel.is-active') || document.querySelector('.tab-panel');
  }

  function screens() {
    var p = activePanel();
    if (!p || typeof p.querySelectorAll !== 'function') return [];
    return Array.prototype.slice.call(p.querySelectorAll('[data-screen]'));
  }

  /* ---------- Current screen --------------------------------
     The grid is DOM order. A screen counts as current while its
     top is above mid-viewport. This is the same rule the
     presenter sees in the rail. */
  function currentScreen() {
    var list = screens();
    if (!list.length) return null;
    var limit = ((window.innerHeight || 800) * 0.5);
    var best = list[0];
    for (var i = 0; i < list.length; i++) {
      if (list[i].getBoundingClientRect().top <= limit) best = list[i];
      else break;
    }
    return best;
  }

  /* ---------- Reveals ---------------------------------------- */
  function revealEls(screen) {
    if (!screen || typeof screen.querySelectorAll !== 'function') return [];
    return Array.prototype.slice.call(screen.querySelectorAll('[data-reveal]'));
  }

  function playReveals(screen) {
    var els = revealEls(screen);
    var instant = reducedMotion() || presenterMode();
    els.forEach(function (el, i) {
      if (instant) { el.classList.add('is-in'); return; }
      setTimeout(function () { el.classList.add('is-in'); }, i * STAGGER);
    });
  }

  function resetReveals(screen) {
    revealEls(screen).forEach(function (el) { el.classList.remove('is-in'); });
  }

  function replayCurrent() {
    if (!current) return;
    resetReveals(current);
    playReveals(current);
  }

  /* ---------- Navigation -------------------------------------- */
  var current = null;

  function switchCurrent(c) {
    if (c === current) return;
    if (current) resetReveals(current);
    current = c;
    if (c) {
      playReveals(c);
      updateStrip();
    }
    updateRail();
  }

  function goTo(el) {
    if (!el) return;
    try { el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' }); }
    catch (e) { el.scrollIntoView(); }
    switchCurrent(el);
  }

  function next() {
    var list = screens();
    if (!list.length) return;
    var i = current ? list.indexOf(current) : list.indexOf(currentScreen());
    goTo(list[Math.min(i + 1, list.length - 1)]);
  }

  function prev() {
    var list = screens();
    if (!list.length) return;
    var i = current ? list.indexOf(current) : list.indexOf(currentScreen());
    goTo(list[Math.max(i - 1, 0)]);
  }

  /* ---------- Typing guards ----------------------------------- */
  function isTypingTarget(el, guardControls) {
    if (!el || !el.tagName) return false;
    var tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (typeof el.closest === 'function' && el.closest('[data-keys-live]')) return true;
    if (guardControls && (tag === 'BUTTON' || tag === 'A')) return true;
    return false;
  }

  function onKeyDown(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var key = e.key;
    var isSpace = (key === ' ' || key === 'Spacebar');
    // Space keeps its native job on focused controls and inputs.
    if (isSpace && isTypingTarget(document.activeElement, true)) return;
    // Arrows keep their native job while typing anywhere.
    if (!isSpace && isTypingTarget(document.activeElement, false)) return;

    if (key === 'ArrowDown' || key === 'PageDown' || isSpace) {
      e.preventDefault();
      next();
    } else if (key === 'ArrowUp' || key === 'PageUp') {
      e.preventDefault();
      prev();
    }
  }

  /* ---------- Rail ---------------------------------------------
     One dot per data-screen of the active tab. Dots are anchors
     (deep linkable) with a 44px hit area (CSS ::before). */
  function buildRail() {
    var rail = document.querySelector('[data-rail]');
    if (!rail) return;
    rail.innerHTML = '';
    screens().forEach(function (s) {
      var a = document.createElement('a');
      a.className = 'rail-dot';
      a.href = '#' + (s.id || '');
      var h = (typeof s.querySelector === 'function') ? s.querySelector('h1, h2, .screen-title') : null;
      a.setAttribute('aria-label', (h ? h.textContent : (s.id || 'screen')));
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        goTo(s);
      });
      rail.appendChild(a);
    });
    updateRail();
  }

  function railDots() {
    var rail = document.querySelector('[data-rail]');
    if (!rail || !rail.children) return [];
    return Array.prototype.slice.call(rail.children);
  }

  function updateRail() {
    var dots = railDots();
    var list = screens();
    var ci = current ? list.indexOf(current) : -1;
    dots.forEach(function (d, i) {
      d.classList.toggle('is-current', i === ci);
      d.classList.toggle('is-passed', ci !== -1 && i < ci);
    });
  }

  /* ---------- Presenter strip ---------------------------------- */
  function updateStrip() {
    var t = document.querySelector('[data-strip-title]');
    if (t && current) {
      var h = (typeof current.querySelector === 'function')
        ? current.querySelector('h1, h2, .screen-title') : null;
      t.textContent = h ? h.textContent : (current.id || '');
    }
  }

  /* ---------- Scroll tracking ---------------------------------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      switchCurrent(currentScreen());
    });
  }

  /* ---------- Height audit --------------------------------------
     The authoring rule: a screen fits one viewport at 1280x720.
     Run from the console: dei.screens.audit() */
  function audit() {
    var vh = window.innerHeight || 800;
    var out = [];
    screens().forEach(function (s) {
      var h = s.getBoundingClientRect().height;
      if (h > vh + 1) out.push({ id: s.id, height: h, viewport: vh, over: h - vh });
    });
    return out;
  }

  /* ---------- Init ---------------------------------------------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('hashchange', function () {
    buildRail();
    current = null;
    onScroll();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-strip-prev]'), function (b) {
    b.addEventListener('click', prev);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-strip-next]'), function (b) {
    b.addEventListener('click', next);
  });

  buildRail();
  onScroll();

  window.dei = window.dei || {};
  window.dei.screens = {
    // The engine's tracked screen (where it last landed), not a live
    // recomputation: that is what the rail and strip show.
    current: function () { return current; },
    next: next,
    prev: prev,
    go: goTo,
    audit: audit,
    rebuild: buildRail,
    replay: replayCurrent
  };
})();
