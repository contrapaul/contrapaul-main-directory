/* ============================================================
   DEI training page: tab router
   ------------------------------------------------------------
   Six tabs, one per scenario, hash routes #/s1 to #/s6.
   The hash survives refresh and deep links, which is what the
   "navigation links to specific locations" requirement rests
   on. A deep link is #/s3 or #/s3#screen-id (tab switch plus
   scroll to the target).

   Plain script, not a module: the page must run from file://.

   No-JS behaviour: the s1 panel carries .is-active in the
   markup, so the page reads without scripts.
   ============================================================ */
(function () {
  'use strict';

  var TABS = ['s1', 's2', 's3', 's4', 's5', 's6'];

  function tabFromHash() {
    // The route is #/sN, optionally followed by a deep link target:
    // #/s4#step-2. The tab is the first segment after #/; a target
    // arrives after a further #, so # is part of the split too.
    var h = location.hash.replace(/^#\//, '').split(/[?#]/)[0];
    return TABS.indexOf(h) !== -1 ? h : 's1';
  }

  function activate(tab, pushHash) {
    var panels = document.querySelectorAll('[data-tab-panel]');
    panels.forEach(function (panel) {
      var on = panel.getAttribute('data-tab-panel') === tab;
      panel.classList.toggle('is-active', on);
    });

    var links = document.querySelectorAll('[data-tab]');
    links.forEach(function (link) {
      var on = link.getAttribute('data-tab') === tab;
      link.classList.toggle('is-active', on);
      link.setAttribute('aria-current', on ? 'page' : 'false');
    });

    // Return to the top of the document on tab change, unless a
    // deep link carries a target id (then step 2 scrolls there).
    var target = null;
    if (location.hash.indexOf('#') !== -1) {
      var id = location.hash.slice(location.hash.lastIndexOf('#') + 1);
      if (id && document.getElementById(id)) target = document.getElementById(id);
    }
    if (target) {
      target.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }

    if (pushHash) {
      // Only write the hash when it differs, to avoid history spam.
      var wanted = '#/' + tab;
      if (location.hash !== wanted) {
        try { history.replaceState(null, '', wanted); }
        catch (e) { location.hash = wanted; }
      }
    }
  }

  window.addEventListener('hashchange', function () {
    activate(tabFromHash(), false);
  });

  // Initial activation without touching the hash (replaceState on
  // first load would still be fine, but keep it minimal).
  activate(tabFromHash(), true);

  window.dei = window.dei || {};
  window.dei.tabs = {
    get current() { return tabFromHash(); },
    go: function (tab, targetId) {
      if (TABS.indexOf(tab) === -1) return;
      location.hash = targetId ? ('#/' + tab + '#' + targetId) : ('#/' + tab);
      if (tabFromHash() === tab && targetId) {
        // Already on the tab: the hashchange event above handles
        // the scroll. If the hash did not change (same target),
        // scroll ourselves.
        var el = document.getElementById(targetId);
        if (el) el.scrollIntoView();
      }
    }
  };
})();
