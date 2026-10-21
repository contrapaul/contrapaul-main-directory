/* ============================================================
   DEI training page: scenario renderer
   ------------------------------------------------------------
   Fills each tab panel from data/scenarios.js:

     jump links  one per scenario, a tick once complete
     scenario    title, context, harm note, the conversation
                 player, a placeholder layout (some scenarios),
                 the debrief

   The conversation player (plans.md section 3): Play runs the
   lines on a timer. Each line is a card, an image with the words
   in a bubble across its bottom, sliding in from the speaker's
   side (teacher and student 2 left, everyone else right). After
   the first full play, back and forward buttons step through the
   lines and the whole conversation shows below as a group chat.

   Placeholder layouts A to E are for Paul to choose from. They do
   not count toward the rewards.

   Plain script, not a module: the page must run from file://.
   ============================================================ */
(function () {
  'use strict';

  var dei = window.dei || {};
  var data = dei.scenarios || [];

  /* How long a line stays up while playing, from its English
     length. Paul will tune this; a line can set its own ms in
     data/scenarios.js. */
  var PACE = { base: 900, perChar: 40, min: 1600, max: 9000 };
  var SLIDE_MS = 380;

  var SIDE = { t: 'left', s2: 'left', s1: 'right', s: 'right', g: 'right' };

  /* Page chrome. Kept to controls the reader needs. */
  var UI = {
    play:      { en: 'Play',   zh: '播放' },
    pause:     { en: 'Pause',  zh: '暂停' },
    resume:    { en: 'Resume', zh: '继续' },
    replay:    { en: 'Replay', zh: '重播' },
    prev:      { en: 'Previous line', zh: '上一句' },
    next:      { en: 'Next line', zh: '下一句' },
    jump:      { en: 'Scenarios', zh: '情境' },
    chat:      { en: 'Conversation', zh: '对话' },
    phImage:   { en: 'placeholder image', zh: '占位图片' },
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
  /* Cards and chat bubbles are rebuilt on a language switch, so
     they set their text once instead of registering painters. */
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

  function lineEn(line) {
    return line.parts.map(function (p) { return (p.say || p.dir).en; }).join(' ');
  }

  function lineMs(line) {
    if (line.ms) return line.ms;
    var ms = PACE.base + PACE.perChar * lineEn(line).length;
    return Math.max(PACE.min, Math.min(PACE.max, ms));
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  /* ---------- One line: parts and the bubble ---------- */

  function partsInto(el, line) {
    line.parts.forEach(function (p) {
      var row = h('span', p.dir ? 'part dir' : 'part say');
      once(row, p.dir || p.say);
      el.appendChild(row);
    });
  }

  function bubble(line, cls) {
    var b = h('div', 'bubble sp-' + line.who + (cls ? ' ' + cls : ''));
    var who = h('span', 'who');
    once(who, line.label);
    b.appendChild(who);
    partsInto(b, line);
    return b;
  }

  /* A card: the line's image (or its labelled placeholder) with
     the bubble across the bottom. */
  function card(sc, line, i) {
    var c = h('div', 'card side-' + SIDE[line.who] + ' sp-' + line.who);
    var frame = h('div', 'card-img');
    if (line.img) {
      var img = h('img', null, { src: line.img, alt: '', loading: 'lazy' });
      frame.appendChild(img);
    } else {
      frame.classList.add('is-placeholder');
      frame.innerHTML =
        '<svg viewBox="0 0 120 90" aria-hidden="true"><circle cx="60" cy="34" r="16"/>' +
        '<path d="M28 90c0-20 14-32 32-32s32 12 32 32z"/></svg>';
      var tag = h('span', 'ph-tag');
      tag.textContent = tr(UI.phImage) + ' · ' + sc.id + '-' + pad2(i + 1);
      frame.appendChild(tag);
    }
    c.appendChild(frame);
    c.appendChild(bubble(line));
    return c;
  }

  /* ---------- The conversation player ---------- */

  var players = {};

  function buildPlayer(sc) {
    var root = h('div', 'player');
    var stage = h('div', 'stage');
    var live = h('div', 'sr-only', { 'aria-live': 'polite' });
    var controls = h('div', 'controls');
    var main = h('button', 'btn-play', { type: 'button' });
    var mainIcon = h('span', 'icon', { 'aria-hidden': 'true' });
    var mainLabel = h('span');
    main.appendChild(mainIcon);
    main.appendChild(mainLabel);
    var prev = h('button', 'btn-step', { type: 'button' });
    prev.innerHTML = '<span aria-hidden="true">‹</span>';
    var count = h('span', 'count');
    var next = h('button', 'btn-step', { type: 'button' });
    next.innerHTML = '<span aria-hidden="true">›</span>';
    paint(function () {
      prev.setAttribute('aria-label', tr(UI.prev));
      next.setAttribute('aria-label', tr(UI.next));
    });
    controls.appendChild(main);
    controls.appendChild(prev);
    controls.appendChild(count);
    controls.appendChild(next);

    var chat = h('ol', 'chat');
    paint(function () { chat.setAttribute('aria-label', tr(UI.chat)); });

    root.appendChild(stage);
    root.appendChild(live);
    root.appendChild(controls);
    root.appendChild(chat);

    var total = sc.lines.length;
    var p = {
      id: sc.id, total: total, i: -1,
      mode: 'idle',              // idle | playing | paused | done
      everDone: false, timer: null, current: null, tallest: 0, chatItems: []
    };
    players[sc.id] = p;

    function show(i) {
      p.i = i;
      var old = p.current;
      var c = card(sc, sc.lines[i], i);
      var still = reduced();
      if (!still) c.classList.add('is-entering');
      stage.appendChild(c);
      p.current = c;
      if (!still) {
        void c.offsetWidth;      // commit the start position
        c.classList.remove('is-entering');
      }
      if (old) {
        old.classList.add('is-leaving');
        setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, still ? 0 : SLIDE_MS);
      }
      // While playing, grow and never shrink, so the page below
      // does not jump. Stepping by hand lets the stage fit the card.
      if (p.mode === 'playing') {
        var hgt = c.offsetHeight || 0;
        if (hgt > p.tallest) { p.tallest = hgt; stage.style.minHeight = hgt + 'px'; }
      } else {
        p.tallest = 0;
        stage.style.minHeight = '';
      }
      live.textContent = tr(sc.lines[i].label) + ': ' +
        sc.lines[i].parts.map(function (x) { return tr(x.say || x.dir); }).join(' ');
      p.chatItems.forEach(function (li, k) { li.classList.toggle('is-current', k === i); });
      sync();
    }

    function tick() {
      p.timer = setTimeout(function () {
        if (p.i + 1 < total) { show(p.i + 1); tick(); }
        else finish();
      }, lineMs(sc.lines[p.i]));
    }

    function finish() {
      p.timer = null;
      p.mode = 'done';
      p.everDone = true;
      p.tallest = 0;
      stage.style.minHeight = '';
      if (dei.progress) dei.progress.complete(sc.id);
      sync();
    }

    function stop() {
      if (p.timer) { clearTimeout(p.timer); p.timer = null; }
    }

    function play() {
      Object.keys(players).forEach(function (k) { if (k !== sc.id) players[k].pause(); });
      if (p.mode === 'paused') { p.mode = 'playing'; tick(); sync(); return; }
      stop();
      p.mode = 'playing';
      show(0);
      tick();
    }

    p.pause = function () {
      if (p.mode !== 'playing') return;
      stop();
      p.mode = 'paused';
      sync();
    };

    function step(d) {
      var j = p.i + d;
      if (j < 0 || j >= total) return;
      stop();
      if (p.mode === 'playing') p.mode = 'paused';
      show(j);
    }

    main.addEventListener('click', function () {
      if (p.mode === 'playing') p.pause(); else play();
    });
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });

    function buildChat() {
      chat.innerHTML = '';
      p.chatItems = sc.lines.map(function (line, k) {
        var li = h('li', 'msg side-' + SIDE[line.who]);
        var b = bubble(line);
        // Group chat style: the name shows when the speaker changes.
        if (k > 0 && sc.lines[k - 1].who === line.who) b.classList.add('same-speaker');
        li.appendChild(b);
        chat.appendChild(li);
        return li;
      });
    }

    // Language switch: redraw the current card in place and the chat.
    p.refresh = function () {
      if (p.current) {
        var c = card(sc, sc.lines[p.i], p.i);
        stage.replaceChild(c, p.current);
        p.current = c;
      }
      if (chat.childNodes.length) buildChat();
      p.chatItems.forEach(function (li, k) { li.classList.toggle('is-current', k === p.i); });
    };

    function sync() {
      var icon = { idle: '▶', playing: '❚❚', paused: '▶', done: '↻' }[p.mode];
      var label = { idle: UI.play, playing: UI.pause, paused: UI.resume, done: UI.replay }[p.mode];
      mainIcon.textContent = icon;
      mainLabel.textContent = tr(label);
      root.setAttribute('data-mode', p.mode);
      var stepping = p.everDone && p.mode !== 'playing';
      prev.hidden = next.hidden = !stepping;
      prev.disabled = p.i <= 0;
      next.disabled = p.i >= total - 1;
      count.hidden = p.i < 0;
      count.textContent = (p.i + 1) + ' ' + tr(UI.of) + ' ' + total;
      if (p.everDone && !chat.childNodes.length) buildChat();
      chat.hidden = !p.everDone;
    }
    paint(sync);

    // Finished on an earlier visit: open ready to step and read.
    if (dei.progress && dei.progress.isComplete(sc.id)) {
      p.everDone = true;
      p.mode = 'done';
      show(0);
    }

    return root;
  }

  /* ---------- Placeholder layouts (A to E) ---------- */

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

  /* B: a deck, one card at a time, flip then move on. */
  function layoutDeck(sc) {
    var box = pieceShell(sc);
    var cards = sc.piece.cards.map(function (c) {
      return flipCard(c.q, function (back) {
        c.a.forEach(function (a) { back.appendChild(quote(a, 's1')); });
      });
    });
    var deck = h('div', 'deck');
    var nav = h('div', 'deck-nav');
    var prev = h('button', 'btn-step', { type: 'button' });
    prev.innerHTML = '<span aria-hidden="true">‹</span>';
    var count = h('span', 'count');
    var next = h('button', 'btn-step', { type: 'button' });
    next.innerHTML = '<span aria-hidden="true">›</span>';
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
      prev.setAttribute('aria-label', tr(UI.prev));
      next.setAttribute('aria-label', tr(UI.next));
      count.textContent = (at + 1) + ' ' + tr(UI.of) + ' ' + cards.length;
    });
    prev.addEventListener('click', function () { if (at > 0) go(at - 1); });
    next.addEventListener('click', function () { if (at < cards.length - 1) go(at + 1); });
    go(0);
    box.appendChild(deck);
    box.appendChild(nav);
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

  var LAYOUTS = { flips: layoutFlips, deck: layoutDeck, pick: layoutPick, match: layoutMatch, write: layoutWrite };

  /* ---------- Scenario section ---------- */

  function debrief(sc) {
    var p = h('p', 'sc-debrief');
    if (/PLACEHOLDER/.test(sc.debrief.en)) p.classList.add('is-placeholder');
    var label = h('strong');
    var rest = h('span');
    p.appendChild(label);
    p.appendChild(rest);
    paint(function () {
      var m = tr(sc.debrief).match(/^([^:：]+[:：])\s*([\s\S]*)$/);
      label.textContent = m ? m[1] + ' ' : '';
      rest.textContent = m ? m[2] : tr(sc.debrief);
    });
    return p;
  }

  function section(sc) {
    var s = h('section', 'scenario', { id: sc.id, 'aria-labelledby': sc.id + '-title' });
    s.appendChild(text(h('h2', 'sc-title', { id: sc.id + '-title' }), sc.title));
    s.appendChild(text(h('p', 'sc-context'), sc.context));
    if (sc.note) s.appendChild(text(h('p', 'sc-note'), sc.note));
    s.appendChild(buildPlayer(sc));
    if (sc.piece && LAYOUTS[sc.piece.type]) s.appendChild(LAYOUTS[sc.piece.type](sc));
    s.appendChild(debrief(sc));
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
