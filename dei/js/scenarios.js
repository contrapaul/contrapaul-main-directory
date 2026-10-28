/* ============================================================
   DEI training page: scenario renderer
   ------------------------------------------------------------
   Fills each tab panel from data/scenarios.js:

     jump links  one per scenario, a tick once complete
     scenario    title, context, harm note, the conversation, the
                 Debrief box, a placeholder layout (some scenarios)

   The conversation (plans.md section 3) plays as a phone chat.
   Play starts it; messages arrive at the bottom of the chat
   window and push older ones up. Teacher and student 2 send from
   the left, everyone else from the right, each in their own
   colour. Stage directions show as small centred notes. Each
   message stays alone for as long as it takes to read, so short
   replies come quickly and long ones get time, and the next
   speaker's typing dots show just before their message lands.
   Once played, the whole chat stays there to scroll and read.

   Placeholder layouts A, C, D and E are for Paul to choose from
   (layout B's deck became the Debrief box). They do not count
   toward the rewards.

   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  var dei = window.dei || {};
  var data = dei.scenarios || [];

  /* Pace. A message stays alone for base + perChar for each
     character of its English text, between min and max. In the
     last part of that wait (share of it, between min and max) the
     next speaker's typing dots show. Paul will tune these; a say
     part can set its own ms in data/scenarios.js. */
  var PACE = { base: 700, perChar: 45, min: 1000, max: 14000 };
  var TYPING = { share: 0.35, min: 400, max: 900 };

  var SIDE = { t: 'left', s2: 'left', s1: 'right', s: 'right', g: 'right' };

  /* Page chrome. Kept to controls the reader needs. */
  var UI = {
    play:      { en: 'Play',   zh: '播放' },
    pause:     { en: 'Pause',  zh: '暂停' },
    resume:    { en: 'Resume', zh: '继续' },
    replay:    { en: 'Replay', zh: '重播' },
    prevQ:     { en: 'Previous question', zh: '上一个问题' },
    nextQ:     { en: 'Next question', zh: '下一个问题' },
    debrief:   { en: 'Debrief', zh: '复盘' },
    jump:      { en: 'Scenarios', zh: '情境' },
    chat:      { en: 'Conversation', zh: '对话' },
    typing:    { en: 'typing', zh: '正在输入' },
    phLayout:  { en: 'placeholder layout', zh: '占位版式' },
    tapFlip:   { en: 'Tap for a suggestion', zh: '点击查看建议' },
    tapBack:   { en: 'Tap for the question', zh: '点击返回问题' },
    of:        { en: 'of', zh: '/' },
    best:      { en: 'This is where the conversation lands. To get there, the teacher said:', zh: '' },
    first:     { en: 'This is the first try. The teacher pushed for more:', zh: '' },
    matched:   { en: 'All matched.', zh: '' },
    student:   { en: 'Student', zh: '学生' },
    teacher:   { en: 'Teacher', zh: '老师' },
    compare:   { en: 'Compare', zh: '对比' },
    yours:     { en: 'Type what you would say (not saved)', zh: '' },
    suggested: { en: 'What the teacher said:', zh: '' }
  };

  function tr(pair) {
    if (!pair) return '';
    if (dei.i18n) return dei.i18n.t(pair);
    return pair.en || '';
  }

  /* Every element whose text comes from a pair registers a
     painter; a language switch re-runs them all. */
  var painters = [];
  function paint(fn) { painters.push(fn); fn(); }
  function text(el, pair) { paint(function () { el.textContent = tr(pair); }); return el; }
  /* Chat messages are rebuilt on a language switch, so they set
     their text once instead of registering painters. */
  function once(el, pair) { el.textContent = tr(pair); return el; }

  function h(tag, cls, attrs) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function reduced() {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* The script as a flat list of chat items: a message per say
     part, a note per stage direction. The speaker's name shows on
     the first message of a run, as in a group chat. */
  function flatten(sc) {
    var items = [];
    var prev = null;
    sc.lines.forEach(function (line) {
      line.parts.forEach(function (part) {
        if (part.dir) {
          items.push({ kind: 'note', pair: part.dir });
          prev = null;
        } else {
          items.push({ kind: 'msg', who: line.who, label: line.label, pair: part.say,
                       ms: part.ms, showName: prev !== line.who });
          prev = line.who;
        }
      });
    });
    return items;
  }

  function readMs(item) {
    if (item.ms) return item.ms;
    return clamp(PACE.base + PACE.perChar * item.pair.en.length, PACE.min, PACE.max);
  }

  /* ---------- The conversation player ---------- */

  var players = {};

  function buildPlayer(sc) {
    var root = h('div', 'player');
    var phone = h('div', 'phone');
    var chat = h('ol', 'chat');
    paint(function () { chat.setAttribute('aria-label', tr(UI.chat)); });
    phone.appendChild(chat);
    var live = h('div', 'sr-only', { 'aria-live': 'polite' });
    var controls = h('div', 'controls');
    var main = h('button', 'btn-play', { type: 'button' });
    var mainIcon = h('span', 'icon', { 'aria-hidden': 'true' });
    var mainLabel = h('span');
    main.appendChild(mainIcon);
    main.appendChild(mainLabel);
    controls.appendChild(main);
    root.appendChild(phone);
    root.appendChild(live);
    root.appendChild(controls);

    var items = flatten(sc);
    var p = { id: sc.id, total: items.length, i: -1, mode: 'idle', timers: [], typing: null,
              follow: true, touched: 0 };
    players[sc.id] = p;

    /* The chat follows new messages down until the reader scrolls
       it themselves; scrolling back to the bottom resumes it. Only
       the reader's own scrolling counts, never ours. */
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (type) {
      phone.addEventListener(type, function () { p.touched = Date.now(); }, { passive: true });
    });
    phone.addEventListener('scroll', function () {
      if (Date.now() - p.touched < 1200) p.follow = nearBottom();
    }, { passive: true });

    function itemEl(k) {
      var it = items[k];
      if (it.kind === 'note') return once(h('li', 'note'), it.pair);
      var li = h('li', 'msg side-' + SIDE[it.who]);
      var b = h('div', 'bubble sp-' + it.who);
      if (it.showName) b.appendChild(once(h('span', 'who'), it.label));
      b.appendChild(once(h('span', 'say'), it.pair));
      li.appendChild(b);
      return li;
    }

    function nearBottom() {
      return phone.scrollHeight - phone.scrollTop - phone.clientHeight < 80;
    }

    function toBottom() {
      var top = phone.scrollHeight;
      if (phone.scrollTo) phone.scrollTo({ top: top, behavior: reduced() ? 'auto' : 'smooth' });
      else phone.scrollTop = top;
    }

    function clearTyping() {
      if (p.typing && p.typing.parentNode) p.typing.parentNode.removeChild(p.typing);
      p.typing = null;
    }

    function showTyping(k) {
      var it = items[k];
      var li = h('li', 'msg is-typing side-' + SIDE[it.who]);
      var b = h('div', 'bubble sp-' + it.who);
      b.innerHTML = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
      li.appendChild(b);
      chat.appendChild(li);
      p.typing = li;
      if (p.follow) toBottom();
    }

    // A message arrives. Follow it down unless the reader has
    // scrolled up to look back.
    function append(k) {
      clearTyping();
      var li = itemEl(k);
      if (!reduced()) li.classList.add('is-new');
      chat.appendChild(li);
      p.i = k;
      if (p.follow) toBottom();
      var it = items[k];
      live.textContent = (it.kind === 'msg' ? tr(it.label) + ': ' : '') + tr(it.pair);
    }

    function later(fn, ms) { p.timers.push(setTimeout(fn, ms)); }

    function stop() {
      p.timers.forEach(clearTimeout);
      p.timers = [];
      clearTyping();
    }

    // With item p.i showing, wait for it to be read, then the next.
    function schedule() {
      if (p.i >= p.total - 1) { finish(); return; }
      var wait = readMs(items[p.i]);
      if (items[p.i + 1].kind === 'msg') {
        var dots = clamp(wait * TYPING.share, TYPING.min, TYPING.max);
        later(function () { showTyping(p.i + 1); }, Math.max(0, wait - dots));
      }
      later(function () { append(p.i + 1); schedule(); }, wait);
    }

    function finish() {
      p.timers = [];
      p.mode = 'done';
      if (dei.progress) dei.progress.complete(sc.id);
      sync();
    }

    function play() {
      Object.keys(players).forEach(function (k) { if (k !== sc.id) players[k].pause(); });
      if (p.mode === 'paused') { p.mode = 'playing'; sync(); schedule(); return; }
      stop();
      chat.innerHTML = '';
      phone.scrollTop = 0;
      p.follow = true;
      p.i = -1;
      p.mode = 'playing';
      sync();
      if (items[0].kind === 'msg') {
        showTyping(0);
        later(function () { append(0); schedule(); }, TYPING.max);
      } else {
        append(0);
        schedule();
      }
    }

    p.pause = function () {
      if (p.mode !== 'playing') return;
      stop();
      p.mode = 'paused';
      sync();
    };

    main.addEventListener('click', function () {
      if (p.mode === 'playing') p.pause(); else play();
    });

    function renderUpTo(last) {
      chat.innerHTML = '';
      for (var k = 0; k <= last; k++) chat.appendChild(itemEl(k));
    }

    // Language switch: redraw the messages so far.
    p.refresh = function () {
      var typing = p.typing;
      renderUpTo(p.i);
      if (typing) chat.appendChild(typing);
      if (p.follow && p.mode !== 'done') phone.scrollTop = phone.scrollHeight;
    };

    function sync() {
      var icon = { idle: '\u25b6', playing: '\u275a\u275a', paused: '\u25b6', done: '\u21bb' }[p.mode];
      var label = { idle: UI.play, playing: UI.pause, paused: UI.resume, done: UI.replay }[p.mode];
      mainIcon.textContent = icon;
      mainLabel.textContent = tr(label);
      root.setAttribute('data-mode', p.mode);
    }
    paint(sync);

    // Finished on an earlier visit: the whole chat is there to read.
    if (dei.progress && dei.progress.isComplete(sc.id)) {
      p.mode = 'done';
      p.i = p.total - 1;
      renderUpTo(p.i);
      sync();
    }

    return root;
  }

  /* ---------- Placeholder layouts (A, C, D, E) ---------- */

  function pieceShell(sc) {
    var box = h('div', 'piece piece-' + sc.piece.type);
    var tag = h('span', 'ph-tag');
    paint(function () { tag.textContent = tr(UI.phLayout) + ' ' + sc.piece.layout; });
    box.appendChild(tag);
    if (sc.piece.prompt) box.appendChild(text(h('p', 'piece-prompt'), sc.piece.prompt));
    return box;
  }

  function flipCard(qPair, backFill) {
    var b = h('button', 'flip', { type: 'button', 'aria-pressed': 'false' });
    var inner = h('span', 'flip-inner');
    var front = h('span', 'flip-face flip-front');
    front.appendChild(text(h('span', 'flip-q'), qPair));
    front.appendChild(text(h('span', 'flip-hint'), UI.tapFlip));
    var back = h('span', 'flip-face flip-back');
    backFill(back);
    back.appendChild(text(h('span', 'flip-hint'), UI.tapBack));
    inner.appendChild(front);
    inner.appendChild(back);
    b.appendChild(inner);
    b.addEventListener('click', function () {
      var on = !b.classList.contains('is-flipped');
      b.classList.toggle('is-flipped', on);
      b.setAttribute('aria-pressed', String(on));
    });
    return b;
  }

  function quote(pair, who) {
    var q = h('span', 'quote sp-' + (who || 't'));
    return text(q, pair);
  }

  /* A: a swipeable row of question cards that flip to a suggestion. */
  function layoutFlips(sc) {
    var box = pieceShell(sc);
    var row = h('div', 'flip-row');
    sc.piece.cards.forEach(function (c) {
      row.appendChild(flipCard(c.q, function (back) { back.appendChild(quote(c.a)); }));
    });
    box.appendChild(row);
    return box;
  }

  /* C: pick the stronger of two committee lines, then see the
     teacher's line that got there. */
  function layoutPick(sc) {
    var box = pieceShell(sc);
    var list = h('div', 'pick');
    var result = h('div', 'pick-result');
    result.hidden = true;
    var verdict = h('p', 'pick-verdict');
    var verdictPair = UI.first;
    paint(function () { verdict.textContent = tr(verdictPair); });
    result.appendChild(verdict);
    result.appendChild(quote(sc.piece.follow));
    var buttons = sc.piece.options.map(function (opt, k) {
      var b = h('button', 'pick-opt', { type: 'button', 'aria-pressed': 'false' });
      b.appendChild(text(h('span'), opt));
      b.addEventListener('click', function () {
        buttons.forEach(function (x, j) {
          x.setAttribute('aria-pressed', String(j === k));
          x.classList.toggle('is-picked', j === k);
          x.classList.toggle('is-best', j === sc.piece.best);
        });
        var good = k === sc.piece.best;
        verdictPair = good ? UI.best : UI.first;
        verdict.textContent = tr(verdictPair);
        verdict.setAttribute('data-mark', good ? '✓' : '→');
        result.hidden = false;
      });
      list.appendChild(b);
      return b;
    });
    box.appendChild(list);
    box.appendChild(result);
    return box;
  }

  /* D: tap a student line, then the teacher reply that answers it. */
  function layoutMatch(sc) {
    var box = pieceShell(sc);
    var pairs = sc.piece.pairs;
    var order = pairs.map(function (_, k) { return k; });
    order.push(order.shift());               // replies out of step with the lines
    var left = h('div', 'match-col');
    var right = h('div', 'match-col');
    left.appendChild(text(h('span', 'match-head'), UI.student));
    right.appendChild(text(h('span', 'match-head'), UI.teacher));
    var picked = null, matched = 0, n = 0;
    var done = h('p', 'match-done');
    done.hidden = true;
    text(done, UI.matched);

    var lines = pairs.map(function (pair, k) {
      var b = h('button', 'match-item quote sp-s2', { type: 'button', 'aria-pressed': 'false' });
      text(b, pair[0]);
      b.addEventListener('click', function () {
        if (b.classList.contains('is-matched')) return;
        lines.forEach(function (x) { x.classList.remove('is-picked'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('is-picked');
        b.setAttribute('aria-pressed', 'true');
        picked = k;
      });
      left.appendChild(b);
      return b;
    });
    order.forEach(function (k) {
      var b = h('button', 'match-item quote sp-t', { type: 'button' });
      text(b, pairs[k][1]);
      b.addEventListener('click', function () {
        if (picked === null || b.classList.contains('is-matched')) return;
        if (picked === k) {
          n += 1;
          [lines[k], b].forEach(function (x) {
            x.classList.remove('is-picked');
            x.classList.add('is-matched');
            x.setAttribute('data-n', String(n));
          });
          matched += 1;
          if (matched === pairs.length) done.hidden = false;
        } else {
          b.classList.remove('is-wrong');
          void b.offsetWidth;
          b.classList.add('is-wrong');
        }
        lines.forEach(function (x) { x.classList.remove('is-picked'); x.setAttribute('aria-pressed', 'false'); });
        picked = null;
      });
      right.appendChild(b);
    });
    var grid = h('div', 'match');
    grid.appendChild(left);
    grid.appendChild(right);
    box.appendChild(grid);
    box.appendChild(done);
    return box;
  }

  /* E: write your own reply, then compare with the teacher's. */
  function layoutWrite(sc) {
    var box = pieceShell(sc);
    var id = sc.id + '-write';
    box.querySelector('.piece-prompt').setAttribute('id', id + '-label');
    var area = h('textarea', 'write-area', { rows: '3', 'aria-labelledby': id + '-label' });
    paint(function () { area.setAttribute('placeholder', tr(UI.yours)); });
    var btn = h('button', 'btn-soft', { type: 'button' });
    text(btn, UI.compare);
    var reveal = h('div', 'write-reveal');
    reveal.hidden = true;
    reveal.appendChild(text(h('p', 'write-label'), UI.suggested));
    reveal.appendChild(quote(sc.piece.answer));
    btn.addEventListener('click', function () { reveal.hidden = false; });
    box.appendChild(area);
    box.appendChild(btn);
    box.appendChild(reveal);
    return box;
  }

  var LAYOUTS = { flips: layoutFlips, pick: layoutPick, match: layoutMatch, write: layoutWrite };

  /* ---------- Scenario section ---------- */

  /* The Debrief box, the same under every conversation (staff
     request, 2026-10-28): the committee's note, then the three
     group questions as a deck, one card at a time with back and
     forward. The deck design is the one Paul picked from the old
     layout B. */
  function debriefBox(sc) {
    var box = h('div', 'debrief');
    box.appendChild(text(h('h3', 'debrief-head'), UI.debrief));
    var note = text(h('p', 'debrief-note'), sc.debrief);
    if (/PLACEHOLDER/.test(sc.debrief.en)) note.classList.add('is-placeholder');
    box.appendChild(note);

    var qs = sc.questions || [];
    if (!qs.length) return box;
    var cards = qs.map(function (q) {
      var c = h('div', 'q-card');
      if (/PLACEHOLDER/.test(q.en)) c.classList.add('is-placeholder');
      return text(c, q);
    });
    var deck = h('div', 'deck', { 'aria-live': 'polite' });
    var nav = h('div', 'deck-nav');
    var prev = h('button', 'btn-step', { type: 'button' });
    prev.innerHTML = '<span aria-hidden="true">\u2039</span>';
    var count = h('span', 'count');
    var next = h('button', 'btn-step', { type: 'button' });
    next.innerHTML = '<span aria-hidden="true">\u203a</span>';
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next);
    var at = 0;
    function go(i) {
      at = i;
      deck.innerHTML = '';
      deck.appendChild(cards[at]);
      prev.disabled = at === 0;
      next.disabled = at === cards.length - 1;
      count.textContent = (at + 1) + ' ' + tr(UI.of) + ' ' + cards.length;
    }
    paint(function () {
      prev.setAttribute('aria-label', tr(UI.prevQ));
      next.setAttribute('aria-label', tr(UI.nextQ));
      count.textContent = (at + 1) + ' ' + tr(UI.of) + ' ' + cards.length;
    });
    prev.addEventListener('click', function () { if (at > 0) go(at - 1); });
    next.addEventListener('click', function () { if (at < cards.length - 1) go(at + 1); });
    go(0);
    box.appendChild(deck);
    box.appendChild(nav);
    return box;
  }

  function section(sc) {
    var s = h('section', 'scenario', { id: sc.id, 'aria-labelledby': sc.id + '-title' });
    s.appendChild(text(h('h2', 'sc-title', { id: sc.id + '-title' }), sc.title));
    s.appendChild(text(h('p', 'sc-context'), sc.context));
    if (sc.note) s.appendChild(text(h('p', 'sc-note'), sc.note));
    s.appendChild(buildPlayer(sc));
    s.appendChild(debriefBox(sc));
    if (sc.piece && LAYOUTS[sc.piece.type]) s.appendChild(LAYOUTS[sc.piece.type](sc));
    return s;
  }

  var chips = {};

  function jump(tab, list) {
    var nav = h('nav', 'jump');
    paint(function () { nav.setAttribute('aria-label', tr(UI.jump)); });
    list.forEach(function (sc) {
      var a = h('a', 'jump-link', { href: '#/' + tab + '#' + sc.id });
      var mark = h('span', 'jump-mark', { 'aria-hidden': 'true' });
      mark.textContent = '✓';
      a.appendChild(text(h('span'), sc.title));
      a.appendChild(mark);
      chips[sc.id] = a;
      nav.appendChild(a);
    });
    return nav;
  }

  function paintChips() {
    Object.keys(chips).forEach(function (id) {
      chips[id].classList.toggle('is-done', !!(dei.progress && dei.progress.isComplete(id)));
    });
  }

  function render() {
    document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
      var tab = panel.getAttribute('data-tab-panel');
      var list = data.filter(function (sc) { return sc.tab === tab; });
      panel.appendChild(jump(tab, list));
      list.forEach(function (sc) { panel.appendChild(section(sc)); });
    });
    paintChips();
  }

  render();

  document.addEventListener('dei:lang', function () {
    painters.forEach(function (fn) { fn(); });
    Object.keys(players).forEach(function (k) { players[k].refresh(); });
  });
  document.addEventListener('dei:progress', paintChips);
  // Leaving a tab stops its conversation.
  window.addEventListener('hashchange', function () {
    Object.keys(players).forEach(function (k) { players[k].pause(); });
  });

  dei.ui = { players: players, pace: PACE };
})();
