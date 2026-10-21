/* ============================================================
   DEI training page: rewards
   ------------------------------------------------------------
   A scenario is complete when its conversation has been played
   to the last line (js/scenarios.js calls complete()). Opening a
   tab or scrolling earns nothing. A trophy button in the header
   opens the list of the three awards, each with its emoji and
   either "earned" or how many conversations are played so far:

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

  var UI = {
    trophy:  { en: 'Awards', zh: '奖励' },
    earned:  { en: '\u2713 Earned', zh: '\u2713 已获得' },
    played:  { en: '{n} of {m} played', zh: '已播放 {n} / {m}' }
  };

  function say(pair) { return pair[lang()] || pair.en; }

  var btn = null, count = null, pop = null, rows = [];

  /* The trophy button and its awards list, built once. */
  function build(slot) {
    btn = document.createElement('button');
    btn.className = 'tool-btn trophy';
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-expanded', 'false');
    var icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\uD83C\uDFC6';
    count = document.createElement('span');
    count.className = 'trophy-count';
    btn.appendChild(icon);
    btn.appendChild(count);

    pop = document.createElement('div');
    pop.className = 'awards';
    pop.setAttribute('hidden', '');
    var list = document.createElement('ul');
    rows = REWARDS.map(function (r) {
      var li = document.createElement('li');
      var emoji = document.createElement('span');
      emoji.className = 'award-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = r.emoji;
      var name = document.createElement('span');
      name.className = 'award-name';
      var status = document.createElement('span');
      status.className = 'award-status';
      li.appendChild(emoji);
      li.appendChild(name);
      li.appendChild(status);
      list.appendChild(li);
      return { li: li, name: name, status: status };
    });
    pop.appendChild(list);
    slot.appendChild(btn);
    slot.appendChild(pop);

    btn.addEventListener('click', function (e) {
      if (e && e.stopPropagation) e.stopPropagation();
      setOpen(pop.hasAttribute('hidden'));
    });
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('click', function (e) {
        if (!pop.hasAttribute('hidden') && !(e.target && pop.contains && pop.contains(e.target))) setOpen(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !pop.hasAttribute('hidden')) { setOpen(false); btn.focus(); }
      });
    }
  }

  function setOpen(on) {
    if (on) pop.removeAttribute('hidden'); else pop.setAttribute('hidden', '');
    btn.setAttribute('aria-expanded', String(on));
  }

  function paint(fresh) {
    if (!btn) {
      var slot = document.querySelector('[data-rewards]');
      if (!slot) return;
      build(slot);
    }
    var got = earned();
    count.textContent = got.length ? String(got.length) : '';
    btn.setAttribute('aria-label', say(UI.trophy) + ': ' + got.length + ' / ' + REWARDS.length);
    btn.setAttribute('title', say(UI.trophy));
    if (fresh && fresh.length) {
      btn.classList.remove('is-new');
      void btn.offsetWidth;
      btn.classList.add('is-new');
    }
    REWARDS.forEach(function (r, k) {
      var n = r.ids.filter(isComplete).length;
      var on = hasReward(r);
      rows[k].li.classList.toggle('is-earned', on);
      rows[k].name.textContent = say(r.name);
      rows[k].status.textContent = on ? say(UI.earned)
        : say(UI.played).replace('{n}', n).replace('{m}', r.ids.length);
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
