/* ============================================================
   DEI training page: rewards
   ------------------------------------------------------------
   A scenario is complete when its conversation has been played
   to the last line (js/scenarios.js calls complete()). Opening a
   tab or scrolling earns nothing. Three rewards, each a small
   emoji in the header, shown once earned:

     PYP                  scenarios 1 to 4 complete
     MS/HS                scenarios 5 to 9 complete
     Conflict Resolution  all nine complete

   Stored on this device only, under 'dei-progress'. No reset
   (Paul, 2026-10-21).

   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'dei-progress';
  var scenarios = (window.dei && window.dei.scenarios) || [];

  var REWARDS = [
    { id: 'pyp', emoji: '🌱', name: { en: 'PYP reward', zh: 'PYP 奖励' },
      ids: ids('pyp') },
    { id: 'mshs', emoji: '🧭', name: { en: 'MS/HS reward', zh: 'MS/HS 奖励' },
      ids: ids('mshs') },
    { id: 'all', emoji: '🤝', name: { en: 'Conflict Resolution', zh: '冲突解决' },
      ids: ids() }
  ];

  function ids(tab) {
    return scenarios
      .filter(function (sc) { return !tab || sc.tab === tab; })
      .map(function (sc) { return sc.id; });
  }

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      // Older builds stored a different shape; start fresh then.
      return (v && v.done && typeof v.done === 'object') ? v.done : {};
    } catch (e) { return {}; }
  }

  var done = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ done: done })); }
    catch (e) { /* private mode: progress lasts this visit only */ }
  }

  function isComplete(id) { return done[id] === 1; }

  function hasReward(r) {
    return r.ids.length > 0 && r.ids.every(isComplete);
  }

  function earned() {
    return REWARDS.filter(hasReward).map(function (r) { return r.id; });
  }

  function lang() {
    return (window.dei.i18n && window.dei.i18n.current) || 'en';
  }

  function paint(fresh) {
    var slot = document.querySelector('[data-rewards]');
    if (!slot) return;
    slot.innerHTML = '';
    REWARDS.forEach(function (r) {
      if (!hasReward(r)) return;
      var el = document.createElement('span');
      el.className = 'reward' + (fresh && fresh.indexOf(r.id) !== -1 ? ' is-new' : '');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', r.name[lang()]);
      el.setAttribute('title', r.name[lang()]);
      el.textContent = r.emoji;
      slot.appendChild(el);
    });
  }

  function complete(id) {
    if (isComplete(id)) return;
    var before = earned();
    done[id] = 1;
    save();
    var fresh = earned().filter(function (r) { return before.indexOf(r) === -1; });
    paint(fresh);
    if (typeof document.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('dei:progress', { detail: { id: id } }));
    }
  }

  paint();
  if (typeof document.addEventListener === 'function') {
    document.addEventListener('dei:lang', function () { paint(); });
  }

  window.dei = window.dei || {};
  window.dei.progress = {
    complete: complete,
    isComplete: isComplete,
    earned: earned,
    rewards: REWARDS
  };
})();
