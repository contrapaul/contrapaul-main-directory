/* ============================================================
   DEI training page: scenario renderer + components
   ------------------------------------------------------------
   Renders the nine scenarios from data/scenarios.js into the
   two tab panels: one long page per group, a sticky jump strip
   on top, about four data-screens per scenario. The arrow key
   engine (js/screens.js) then steps screen to screen.

   Components (plans.md section 2): dialogue player, readiness
   chip / scale / branch, repeat back flip card, harm banner,
   rule stamp, debrief card, plus the method specific pieces
   (qualities board, three way choice, fact or stereotype,
   dare filter).

   Every user facing string is a {en, zh} pair. bind() sets the
   data-en/data-zh attributes so js/i18n.js re-applies them on
   language switch, and registers a painter so the stateful
   components (buttons, verdicts, revealed bodies) repaint with
   the right pair. zh is 示例 placeholder until the preliminary
   translation lands (decisions, scenarios.md, 2026-10-15).

   The explorer reward (plans.md) is earned here: each
   interaction calls progress.markDone. Scrolling earns nothing.
   ============================================================ */
(function () {
  'use strict';

  var data = (window.dei && window.dei.scenarios) || [];
  var i18n = window.dei.i18n;
  var REDUCED = (function () {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  })();
  var ZH = '示例：待翻译';

  var SPEAKER = {
    t: { en: 'Teacher', zh: ZH },
    s1: { en: 'Student 1', zh: ZH },
    s2: { en: 'Student 2', zh: ZH },
    g: { en: 'Group', zh: ZH }
  };

  var STR = {
    jumpLabel: { en: 'Scenarios in this tab', zh: ZH },
    ph: { en: 'placeholder', zh: '占位内容' },
    phImage: { en: 'placeholder image, 16:9. A photo or illustration replaces this.', zh: ZH },
    nextLine: { en: 'Next line', zh: ZH },
    done: { en: 'Done', zh: ZH },
    markRead: { en: 'I have read the script', zh: ZH },
    reset: { en: 'Reset', zh: ZH },
    readyChip: { en: 'Readiness', zh: ZH },
    flatKicker: { en: 'the flat repeat back', zh: ZH },
    fullKicker: { en: 'the full one', zh: ZH },
    pauseKicker: { en: 'pause note', zh: ZH },
    tapReveal: { en: 'Tap to reveal', zh: ZH },
    boundaryKicker: { en: 'the boundary', zh: ZH },
    debriefKicker: { en: 'debrief', zh: ZH },
    debriefPrompt: { en: 'Tap to open the discussion prompt', zh: ZH },
    ruleKicker: { en: 'the rule going forward', zh: ZH },
    harmKicker: { en: 'name the harm first', zh: ZH },
    toneKicker: { en: 'the tone', zh: ZH },
    methodNoteKicker: { en: 'facilitation note', zh: ZH },
    weightKicker: { en: 'why it carries weight', zh: ZH },
    tossKicker: { en: 'a word tossed around a lot', zh: ZH },
    forwardKicker: { en: 'the forward move', zh: ZH },
    contrastKicker: { en: 'worth calling out', zh: ZH },
    solutionsKicker: { en: 'the student solutions', zh: ZH },
    rightMove: { en: 'the right move', zh: ZH },
    scriptPath: { en: 'the script\'s path', zh: ZH },
    agree: { en: 'the script agrees', zh: ZH },
    differ: { en: 'the script says', zh: ZH },
    flipHint: { en: 'Tap each card to flip it. The back is the same on every card.', zh: ZH },
    kTalk: { en: 'the talk', zh: ZH },
    kMoment: { en: 'the moment', zh: ZH },
    kFirstBeat: { en: 'the first beat', zh: ZH },
    kReadiness: { en: 'the readiness check', zh: ZH },
    kBoard: { en: 'guided discussion, not mediation', zh: ZH },
    kTurn: { en: 'the turn', zh: ZH },
    kTeaching: { en: 'the teaching', zh: ZH },
    kRedirect: { en: 'the redirect', zh: ZH },
    kClass: { en: 'in the moment', zh: ZH },
    kForward: { en: 'going forward', zh: ZH },
    kDebrief: { en: 'the debrief', zh: ZH },
    kRepeat: { en: 'the repeat back', zh: ZH },
    tScript: { en: 'The script', zh: ZH },
    tMove: { en: 'The signature move', zh: ZH },
    tTwoMoves: { en: 'Two repeat backs', zh: ZH },
    tReady: { en: 'How ready are they?', zh: ZH },
    tBoard: { en: 'The qualities board', zh: ZH },
    tFlip: { en: 'Flip every card', zh: ZH },
    tBranch: { en: 'The readiness branch', zh: ZH },
    tThree: { en: 'Three ways to respond', zh: ZH },
    tFact: { en: 'Fact or stereotype', zh: ZH },
    tDares: { en: 'The dare filter', zh: ZH },
    tClassLine: { en: 'The class line', zh: ZH },
    tRule: { en: 'The rule', zh: ZH },
    tSolutions: { en: 'Solutions and debrief', zh: ZH },
    tDiscussion: { en: 'The discussion', zh: ZH }
  };

  /* ---------- state and registry ------------------------------ */

  function freshState(sc) {
    return {
      shown: REDUCED && sc.lines ? sc.lines.length : 0,
      read: false,
      ready: 0,
      note: false,
      board: [false, false, false, false],
      flips: [false, false, false, false],
      boundary: false,
      choice: -1,
      fact: -1,
      dares: [null, null, null, null],
      debrief: false
    };
  }

  var state = {};
  data.forEach(function (sc) { state[sc.id] = freshState(sc); });

  var ui = {
    state: state,
    sections: {},
    chips: {},
    players: {},
    painters: []
  };
  window.dei = window.dei || {};
  window.dei.ui = ui;

  /* ---------- tiny helpers (shim safe) ------------------------
     Only createElement / appendChild / setAttribute / classList /
     textContent / addEventListener. The node test shim models
     exactly this surface. */

  function h(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function setPair(el, pair) {
    el.setAttribute('data-en', pair.en);
    el.setAttribute('data-zh', pair.zh);
    el.textContent = i18n.t(pair);
  }

  /* Static pair text: set now, repaint on language switch. */
  function bind(el, pair) {
    setPair(el, pair);
    ui.painters.push(function () { setPair(el, pair); });
    return el;
  }

  function mark(scId, elName) {
    if (window.dei.progress) window.dei.progress.markDone(scId, elName);
  }

  function pair(en) { return { en: en, zh: ZH }; }

  function paintAll() {
    ui.painters.forEach(function (fn) { fn(); });
  }

  /* ---------- dialogue player ---------------------------------
     Line by line, tap "next line" to reveal. Keeps its place,
     resets, announces new lines (aria-live), and under reduced
     motion the whole script is shown at once with a single
     "I have read the script" tap that earns the reward. */

  function buildPlayer(sc) {
    var st = state[sc.id];
    var lines = sc.lines || [];
    var total = lines.length;

    var wrap = h('div', 'player');
    wrap.setAttribute('aria-live', 'polite');
    var listEl = h('div', 'player-lines');
    var lineEls = lines.map(function (ln) {
      var row = h('div', 'player-line');
      if (ln.dir && ln.dir.en) {
        row.appendChild(bind(h('p', 'player-dir'), ln.dir));
      }
      if (ln.who) {
        row.appendChild(bind(h('span', 'player-speaker'), SPEAKER[ln.who]));
      }
      if (ln.text && ln.text.en) {
        row.appendChild(bind(h('p', 'player-text'), ln.text));
      }
      if (ln.fix) {
        var tag = h('span', 'ph-tag');
        tag.textContent = i18n.t(STR.ph);
        row.appendChild(tag);
      }
      if (st.shown === 0) row.classList.add('is-hidden');
      listEl.appendChild(row);
      return row;
    });

    /* The pause note (scenario 2) hangs off its line and appears
       once that line has been revealed. */
    var noteEl = null;
    if (sc.note) {
      var noteBtn = h('button', 'note-card');
      noteBtn.type = 'button';
      noteBtn.setAttribute('aria-expanded', 'false');
      noteBtn.appendChild(bind(h('span', 'card-kicker'), STR.pauseKicker));
      var noteBody = h('p', 'note-body');
      noteBtn.appendChild(noteBody);
      var paintNote = (function (body) {
        return function () {
          setPair(body, st.note ? sc.note.text : STR.tapReveal);
        };
      }(noteBody));
      paintNote();
      ui.painters.push(paintNote);
      noteBtn.addEventListener('click', function () {
        st.note = true;
        noteBtn.classList.add('is-open');
        noteBtn.setAttribute('aria-expanded', 'true');
        paintNote();
        mark(sc.id, 'note');
      });
      if (st.shown <= sc.note.after) noteBtn.classList.add('is-hidden');
      listEl.appendChild(noteBtn);
      noteEl = noteBtn;
    }

    var bar = h('div', 'player-bar');
    var btn = h('button', 'player-next');
    btn.type = 'button';
    var count = h('span', 'player-count');
    var resetBtn = h('button', 'player-reset');
    resetBtn.type = 'button';
    bar.appendChild(btn);
    bar.appendChild(count);
    if (!REDUCED) {
      bind(resetBtn, STR.reset);
      bar.appendChild(resetBtn);
    }
    wrap.appendChild(listEl);
    wrap.appendChild(bar);

    function paint() {
      lineEls.forEach(function (row, i) {
        row.classList.toggle('is-hidden', i >= st.shown);
      });
      if (noteEl) noteEl.classList.toggle('is-hidden', st.shown <= sc.note.after);
      count.textContent = st.shown + ' / ' + total;
      var finished = st.shown >= total;
      if (finished) {
        setPair(btn, REDUCED ? (st.read ? STR.done : STR.markRead) : STR.done);
        btn.classList.toggle('is-done', !REDUCED || st.read);
      } else {
        setPair(btn, STR.nextLine);
        btn.classList.remove('is-done');
      }
    }
    ui.painters.push(paint);

    btn.addEventListener('click', function () {
      if (st.shown < total) {
        st.shown += 1;
        if (st.shown === total) mark(sc.id, 'player');
      } else if (REDUCED && !st.read) {
        st.read = true;
        mark(sc.id, 'player');
      }
      paint();
      try {
        var last = lineEls[st.shown - 1] || lineEls[total - 1];
        if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' });
      } catch (e) { /* test shim: scroll is a no-op */ }
    });

    if (!REDUCED) {
      resetBtn.addEventListener('click', function () {
        st.shown = 0;
        paint();
      });
    }

    paint();
    ui.players[sc.id] = { total: total };
    return wrap;
  }

  /* ---------- repeat back flip card --------------------------- */

  function buildFlip(sc, i) {
    var st = state[sc.id];
    var rb = sc.repeatBacks[i];
    var btn = h('button', 'flip-card');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');

    var front = h('div', 'flip-face flip-front');
    front.appendChild(bind(h('span', 'card-kicker'),
      pair(SPEAKER[rb.who].en + ' · ' + STR.flatKicker.en)));
    front.appendChild(bind(h('p', 'flip-text'), rb.flat));

    var back = h('div', 'flip-face flip-back');
    back.appendChild(bind(h('span', 'card-kicker'),
      pair(SPEAKER[rb.who].en + ' · ' + STR.fullKicker.en)));
    back.appendChild(bind(h('p', 'flip-text'), rb.full));

    btn.appendChild(front);
    btn.appendChild(back);

    function paint() {
      btn.classList.toggle('is-flipped', st.flips[i]);
      btn.setAttribute('aria-pressed', st.flips[i] ? 'true' : 'false');
    }
    ui.painters.push(paint);

    btn.addEventListener('click', function () {
      st.flips[i] = true;
      paint();
      mark(sc.id, 'rb' + i);
    });

    paint();
    return btn;
  }

  /* ---------- readiness chip (static) ------------------------- */

  function buildChip(sc) {
    var el = h('span', 'ready-chip');
    bind(el, pair(STR.readyChip.en + ' ' + sc.readinessChip));
    return el;
  }

  /* ---------- interactive readiness scale (scenario 3) -------- */

  function buildScale(sc) {
    var st = state[sc.id];
    var wrap = h('div', 'ready-scale');
    wrap.appendChild(bind(h('p', 'ready-prompt'), sc.readyScale.prompt));
    var nums = h('div', 'ready-nums');
    var band = h('p', 'ready-band');
    band.setAttribute('aria-live', 'polite');

    function bandText(n) {
      for (var i = 0; i < sc.readyScale.bands.length; i++) {
        if (n <= sc.readyScale.bands[i].max) return sc.readyScale.bands[i].text;
      }
      return sc.readyScale.bands[sc.readyScale.bands.length - 1].text;
    }
    function paintBand() {
      if (st.ready) setPair(band, bandText(st.ready));
      else { band.textContent = ''; }
    }
    ui.painters.push(paintBand);

    for (var n = 1; n <= 10; n++) {
      (function (n) {
        var b = h('button', 'ready-num');
        b.type = 'button';
        b.textContent = String(n);
        b.addEventListener('click', function () {
          st.ready = n;
          nums.children.forEach(function (c, i) {
            c.classList.toggle('is-picked', i + 1 === n);
          });
          paintBand();
          mark(sc.id, 'ready');
        });
        nums.appendChild(b);
      })(n);
    }
    wrap.appendChild(nums);
    wrap.appendChild(band);
    wrap.appendChild(bind(h('p', 'ready-path'), sc.readyScale.path));
    return wrap;
  }

  /* ---------- qualities board (scenario 4) -------------------- */

  function buildBoard(sc) {
    var st = state[sc.id];
    var wrap = h('div', 'board');
    wrap.appendChild(bind(h('p', 'board-prompt'), sc.board.prompt));
    var chips = h('div', 'board-chips');
    sc.board.items.forEach(function (item, i) {
      (function (i) {
        var b = h('button', 'board-chip');
        b.type = 'button';
        b.appendChild(bind(h('span', 'chip-word'), item));
        b.addEventListener('click', function () {
          st.board[i] = true;
          b.classList.add('is-added');
          mark(sc.id, 'q' + i);
        });
        if (st.board[i]) b.classList.add('is-added');
        chips.appendChild(b);
      })(i);
    });
    wrap.appendChild(chips);
    return wrap;
  }

  function buildTurn(sc) {
    var st = state[sc.id];
    var wrap = h('div', 'turn');
    wrap.appendChild(bind(h('p', 'turn-q'), sc.board.turn));
    wrap.appendChild(bind(h('p', 'turn-a'), sc.board.answer));
    wrap.appendChild(bind(h('p', 'turn-hint'), STR.flipHint));
    var cards = h('div', 'quality-cards');
    sc.board.items.forEach(function (item, i) {
      (function (i) {
        var b = h('button', 'flip-card quality-flip');
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        var front = h('div', 'flip-face flip-front');
        front.appendChild(bind(h('span', 'flip-text'), item));
        var back = h('div', 'flip-face flip-back');
        back.appendChild(bind(h('span', 'flip-text'), sc.board.flipBack));
        b.appendChild(front);
        b.appendChild(back);
        b.addEventListener('click', function () {
          st.flips[i] = true;
          b.classList.add('is-flipped');
          b.setAttribute('aria-pressed', 'true');
          mark(sc.id, 'f' + i);
        });
        if (st.flips[i]) {
          b.classList.add('is-flipped');
          b.setAttribute('aria-pressed', 'true');
        }
        cards.appendChild(b);
      })(i);
    });
    wrap.appendChild(cards);

    /* Boundary card: reveals on tap. */
    var bb = h('button', 'reveal-card');
    bb.type = 'button';
    bb.setAttribute('aria-expanded', 'false');
    bb.appendChild(bind(h('span', 'card-kicker'), STR.boundaryKicker));
    var body = h('p', 'reveal-body');
    bb.appendChild(body);
    (function () {
      function paint() {
        setPair(body, st.boundary ? sc.boundary : STR.tapReveal);
        bb.classList.toggle('is-open', st.boundary);
        bb.setAttribute('aria-expanded', st.boundary ? 'true' : 'false');
      }
      ui.painters.push(paint);
      bb.addEventListener('click', function () {
        st.boundary = true;
        paint();
        mark(sc.id, 'boundary');
      });
      paint();
    }());
    wrap.appendChild(bb);
    return wrap;
  }

  /* ---------- choice: s5 readiness branch, s6 three way ------- */

  function buildChoice(sc, host) {
    var st = state[sc.id];
    var spec = sc.beat ? sc.beat : sc.choice;
    var wrap = h('div', 'choice');
    /* The branch (scenario 5) carries the teacher's prompt as a
       dialogue line, not a prompt paragraph. */
    if (sc.beat && sc.beat.choice) {
      wrap.appendChild(staticLine({ who: 't', text: sc.beat.choice }));
    }
    if (spec.prompt) wrap.appendChild(bind(h('p', 'choice-prompt'), spec.prompt));

    var goodIndex = -1;
    spec.options.forEach(function (o, i) { if (o.good) goodIndex = i; });

    var opts = h('div', 'choice-opts');
    spec.options.forEach(function (o, i) {
      (function (i) {
        var b = h('button', 'choice-opt');
        b.type = 'button';
        var lab = h('span', 'opt-label');
        bind(lab, o.label);
        b.appendChild(lab);
        if (o.good) {
          var tag = h('span', 'opt-tag');
          bind(tag, sc.beat ? STR.scriptPath : STR.rightMove);
          b.appendChild(tag);
        }
        var res = h('p', 'opt-result');
        bind(res, o.result);
        b.appendChild(res);
        b.addEventListener('click', function () {
          st.choice = i;
          paint();
          mark(sc.id, 'choice');
        });
        opts.appendChild(b);
      })(i);
    });
    wrap.appendChild(opts);

    /* The branch (scenario 5) resumes the script with the
       student's answer once the matching path is picked. */
    var resumeEl = null;
    if (sc.beat && sc.beat.resume) {
      resumeEl = h('div', 'choice-resume player-line');
      resumeEl.appendChild(bind(h('span', 'player-speaker'), SPEAKER[sc.beat.resume.who]));
      resumeEl.appendChild(bind(h('p', 'player-text'), sc.beat.resume.text));
      wrap.appendChild(resumeEl);
    }

    function paint() {
      opts.children.forEach(function (b, i) {
        b.classList.toggle('is-picked', st.choice === i);
      });
      if (resumeEl) resumeEl.classList.toggle('is-hidden', st.choice !== goodIndex);
    }
    ui.painters.push(paint);
    paint();

    if (host) host.appendChild(wrap);
    return wrap;
  }

  /* ---------- fact or stereotype (scenario 7) ----------------- */

  function buildFact(sc) {
    var st = state[sc.id];
    var wrap = h('div', 'fact');
    wrap.appendChild(bind(h('p', 'fact-claim'), sc.fact.claim));
    var opts = h('div', 'choice-opts');
    sc.fact.options.forEach(function (o, i) {
      (function (i) {
        var b = h('button', 'choice-opt fact-opt');
        b.type = 'button';
        b.appendChild(bind(h('span', 'opt-label'), o));
        b.addEventListener('click', function () {
          st.fact = i;
          paint();
          mark(sc.id, 'fact');
        });
        opts.appendChild(b);
      })(i);
    });
    wrap.appendChild(opts);
    var reveal = h('p', 'fact-reveal');
    wrap.appendChild(reveal);

    function paint() {
      opts.children.forEach(function (b, i) {
        var picked = st.fact === i;
        b.classList.toggle('is-picked', picked);
        b.classList.toggle('is-good', picked && i === sc.fact.goodIndex);
        b.classList.toggle('is-warn', picked && i !== sc.fact.goodIndex);
      });
      reveal.classList.toggle('is-hidden', st.fact === -1);
      if (st.fact !== -1) setPair(reveal, sc.fact.reveal);
    }
    ui.painters.push(paint);
    paint();
    return wrap;
  }

  /* ---------- dare filter (scenario 8) ------------------------ */

  function buildDares(sc) {
    var st = state[sc.id];
    var wrap = h('div', 'dares');
    sc.dares.forEach(function (dare, i) {
      (function (i) {
        var card = h('div', 'dare-card');
        var text = h('p', 'dare-text');
        bind(text, dare.text);
        card.appendChild(text);
        if (dare.phName) {
          var tag = h('span', 'ph-tag');
          tag.textContent = i18n.t(STR.ph);
          card.appendChild(tag);
        }
        var keep = h('button', 'dare-keep');
        keep.type = 'button';
        bind(keep, { en: 'Keep', zh: ZH });
        var cut = h('button', 'dare-cut');
        cut.type = 'button';
        bind(cut, { en: 'Cut', zh: ZH });
        var verdict = h('p', 'dare-verdict');
        var reason = h('p', 'dare-reason');
        bind(reason, dare.reason);
        card.appendChild(keep);
        card.appendChild(cut);
        card.appendChild(verdict);
        card.appendChild(reason);

        function verdictPair(v) {
          var word = v === 'keep' ? 'Keep' : 'Cut';
          if (v === dare.verdict) return pair(word + ' · ' + STR.agree.en);
          return pair(STR.differ.en + ' ' + dare.verdict);
        }
        function paint() {
          var v = st.dares[i];
          card.classList.toggle('is-keep', v === 'keep');
          card.classList.toggle('is-cut', v === 'cut');
          verdict.classList.toggle('is-hidden', !v);
          reason.classList.toggle('is-hidden', !v);
          if (v) setPair(verdict, verdictPair(v));
        }
        ui.painters.push(paint);

        keep.addEventListener('click', function () {
          st.dares[i] = 'keep';
          paint();
          mark(sc.id, 'd' + i);
        });
        cut.addEventListener('click', function () {
          st.dares[i] = 'cut';
          paint();
          mark(sc.id, 'd' + i);
        });

        paint();
        wrap.appendChild(card);
      })(i);
    });
    return wrap;
  }

  /* ---------- rule stamp + debrief + static cards ------------- */

  function ruleStamp(sc) {
    var wrap = h('div', 'rule-stamp');
    wrap.appendChild(bind(h('span', 'card-kicker'), STR.ruleKicker));
    wrap.appendChild(bind(h('p', 'rule-text'), sc.rule));
    return wrap;
  }

  function debriefCard(sc) {
    var st = state[sc.id];
    var bb = h('button', 'debrief-card reveal-card');
    bb.type = 'button';
    bb.setAttribute('aria-expanded', 'false');
    bb.appendChild(bind(h('span', 'card-kicker'), STR.debriefKicker));
    if (sc.debriefPh) {
      var tag = h('span', 'ph-tag');
      tag.textContent = i18n.t(STR.ph);
      bb.appendChild(tag);
    }
    var body = h('p', 'reveal-body');
    bb.appendChild(body);
    (function () {
      function paint() {
        setPair(body, st.debrief ? sc.debrief : STR.debriefPrompt);
        bb.classList.toggle('is-open', st.debrief);
        bb.setAttribute('aria-expanded', st.debrief ? 'true' : 'false');
      }
      ui.painters.push(paint);
      bb.addEventListener('click', function () {
        st.debrief = true;
        paint();
        mark(sc.id, 'debrief');
      });
      paint();
    }());
    return bb;
  }

  function noteCard(kind, kicker, pairText) {
    var wrap = h('div', 'static-note ' + kind);
    wrap.appendChild(bind(h('span', 'card-kicker'), kicker));
    wrap.appendChild(bind(h('p', 'note-text'), pairText));
    return wrap;
  }

  function staticLine(ln) {
    var row = h('div', 'player-line static-line');
    if (ln.dir && ln.dir.en) row.appendChild(bind(h('p', 'player-dir'), ln.dir));
    if (ln.who) row.appendChild(bind(h('span', 'player-speaker'), SPEAKER[ln.who]));
    row.appendChild(bind(h('p', 'player-text'), ln.text));
    return row;
  }

  /* ---------- header screen shared pieces --------------------- */

  function imageFrame() {
    var fig = h('figure', 'ph-frame');
    var box = h('div', 'ph-img');
    var tag = h('span', 'ph-tag');
    tag.textContent = i18n.t(STR.ph);
    box.appendChild(tag);
    box.appendChild(bind(h('span', 'ph-cap'), STR.phImage));
    fig.appendChild(box);
    return fig;
  }

  function banner(kind, pairText) {
    var b = h('div', kind === 'harm' ? 'harm-banner' : 'tone-tag');
    b.appendChild(bind(h('span', 'card-kicker'), kind === 'harm' ? STR.harmKicker : STR.toneKicker));
    b.appendChild(bind(h('p', 'banner-text'), pairText));
    return b;
  }

  /* ---------- screens ------------------------------------------ */

  function makeScreen(sc, num, kicker, title) {
    var s = h('div', 'screen scenario-screen');
    s.setAttribute('data-screen', '');
    s.setAttribute('id', sc.id + '-' + num);
    var inner = h('div', 'screen-inner');
    inner.appendChild(bind(h('p', 'screen-kicker'), kicker));
    inner.appendChild(bind(h('h2', 'screen-title'), title));
    s.appendChild(inner);
    return { el: s, inner: inner };
  }

  function headerScreen(sc) {
    var kicker = pair('scenario ' + sc.n + ' of ' + sc.total + ' · ' + sc.method.en);
    var s = makeScreen(sc, 1, kicker, sc.title);
    if (sc.phName) {
      var tag = h('span', 'ph-tag');
      tag.textContent = i18n.t(STR.ph);
      s.inner.appendChild(tag);
    }
    if (sc.harm) s.inner.appendChild(banner('harm', sc.harm));
    if (sc.tone) s.inner.appendChild(banner('tone', sc.tone));
    s.inner.appendChild(bind(h('p', 'screen-lede'), sc.context));
    s.inner.appendChild(imageFrame());
    return s.el;
  }

  function screenB(sc) {
    var s;
    if (sc.id === 'sc3') {
      s = makeScreen(sc, 2, STR.kReadiness, STR.tReady);
      s.inner.appendChild(buildScale(sc));
      return s.el;
    }
    if (sc.id === 'sc4') {
      s = makeScreen(sc, 2, STR.kBoard, STR.tBoard);
      s.inner.appendChild(buildBoard(sc));
      return s.el;
    }
    if (sc.id === 'sc5') {
      s = makeScreen(sc, 2, STR.kFirstBeat, STR.tBranch);
      var beat = h('div', 'beat');
      sc.beat.lines.forEach(function (ln) { beat.appendChild(staticLine(ln)); });
      beat.appendChild(buildChoice(sc, null));
      s.inner.appendChild(beat);
      return s.el;
    }
    if (sc.id === 'sc9') {
      s = makeScreen(sc, 2, STR.kClass, STR.tClassLine);
      s.inner.appendChild(staticLine(sc.classLine));
      s.inner.appendChild(buildChip(sc));
      s.inner.appendChild(noteCard('moment-note', STR.toneKicker, sc.momentNote));
      return s.el;
    }
    /* Standard: the talk, with a readiness chip where the
       student gives one, and the facilitation note (sc2). */
    s = makeScreen(sc, 2, STR.kTalk, STR.tScript);
    if (sc.readinessChip) s.inner.appendChild(buildChip(sc));
    s.inner.appendChild(buildPlayer(sc));
    if (sc.facilitation) {
      s.inner.appendChild(noteCard('method-note', STR.methodNoteKicker, sc.facilitation));
    }
    return s.el;
  }

  function screenC(sc) {
    var s;
    if (sc.id === 'sc1') {
      s = makeScreen(sc, 3, STR.kRepeat, STR.tMove);
      s.inner.appendChild(buildFlip(sc, 0));
      return s.el;
    }
    if (sc.id === 'sc2') {
      s = makeScreen(sc, 3, STR.kRepeat, STR.tTwoMoves);
      s.inner.appendChild(buildFlip(sc, 0));
      s.inner.appendChild(buildFlip(sc, 1));
      return s.el;
    }
    if (sc.id === 'sc3') {
      s = makeScreen(sc, 3, STR.kTalk, STR.tScript);
      s.inner.appendChild(buildPlayer(sc));
      return s.el;
    }
    if (sc.id === 'sc4') {
      s = makeScreen(sc, 3, STR.kTurn, STR.tFlip);
      s.inner.appendChild(buildTurn(sc));
      return s.el;
    }
    if (sc.id === 'sc5') {
      s = makeScreen(sc, 3, STR.kTalk, STR.tScript);
      s.inner.appendChild(buildPlayer(sc));
      s.inner.appendChild(buildFlip(sc, 0));
      return s.el;
    }
    if (sc.id === 'sc6') {
      s = makeScreen(sc, 3, STR.kTeaching, STR.tThree);
      s.inner.appendChild(buildChoice(sc, null));
      return s.el;
    }
    if (sc.id === 'sc7') {
      s = makeScreen(sc, 3, STR.kTeaching, STR.tFact);
      s.inner.appendChild(buildFact(sc));
      s.inner.appendChild(noteCard('forward-card', STR.forwardKicker, sc.forward));
      return s.el;
    }
    if (sc.id === 'sc8') {
      s = makeScreen(sc, 3, STR.kRedirect, STR.tDares);
      s.inner.appendChild(buildDares(sc));
      return s.el;
    }
    /* sc9 */
    s = makeScreen(sc, 3, STR.kTalk, STR.tScript);
    s.inner.appendChild(buildPlayer(sc));
    s.inner.appendChild(buildFlip(sc, 0));
    return s.el;
  }

  function screenD(sc) {
    var s;
    if (sc.id === 'sc4') {
      s = makeScreen(sc, 4, STR.kForward, STR.tSolutions);
      s.inner.appendChild(noteCard('contrast-note', STR.contrastKicker, sc.contrast));
      var list = h('div', 'solutions');
      s.inner.appendChild(bind(h('span', 'card-kicker'), STR.solutionsKicker));
      sc.solutions.forEach(function (sol) {
        list.appendChild(bind(h('p', 'solution-item'), sol));
      });
      s.inner.appendChild(list);
      s.inner.appendChild(debriefCard(sc));
      return s.el;
    }
    if (sc.id === 'sc6') {
      s = makeScreen(sc, 4, STR.kDebrief, STR.tDiscussion);
      s.inner.appendChild(debriefCard(sc));
      return s.el;
    }
    if (sc.id === 'sc7') {
      s = makeScreen(sc, 4, STR.kDebrief, STR.tDiscussion);
      s.inner.appendChild(debriefCard(sc));
      return s.el;
    }
    /* Standard: repeat back (sc3), rule stamp, extra note,
       debrief. */
    s = makeScreen(sc, 4, STR.kForward, STR.tRule);
    if (sc.id === 'sc3') s.inner.appendChild(buildFlip(sc, 0));
    if (sc.rule) s.inner.appendChild(ruleStamp(sc));
    if (sc.id === 'sc5') s.inner.appendChild(noteCard('weight-note', STR.weightKicker, sc.note2));
    if (sc.id === 'sc9') s.inner.appendChild(noteCard('toss-note', STR.tossKicker, sc.note2));
    s.inner.appendChild(debriefCard(sc));
    return s.el;
  }

  /* ---------- jump strip + panels ------------------------------ */

  function buildJumpStrip(tab, panel) {
    var strip = h('nav', 'jump-strip');
    strip.setAttribute('role', 'navigation');
    strip.setAttribute('aria-label', STR.jumpLabel.en);
    ui.painters.push(function () {
      strip.setAttribute('aria-label', i18n.t(STR.jumpLabel));
    });
    data.forEach(function (sc) {
      if (sc.tab !== tab) return;
      var chip = h('button', 'jump-chip');
      chip.type = 'button';
      var num = h('span', 'jump-num');
      num.textContent = sc.n + '. ';
      var label = h('span', 'jump-label');
      bind(label, sc.title);
      var done = h('span', 'jump-done');
      chip.appendChild(num);
      chip.appendChild(label);
      chip.appendChild(done);
      chip.addEventListener('click', function () {
        var section = ui.sections[sc.id];
        if (section && section.scrollIntoView) {
          try { section.scrollIntoView({ block: 'start' }); }
          catch (e) { section.scrollIntoView(); }
        }
      });
      ui.chips[sc.id] = { el: chip, doneEl: done };
      strip.appendChild(chip);
    });
    panel.appendChild(strip);
  }

  function render() {
    var panels = document.querySelectorAll('[data-tab-panel]');
    var tabs = [];
    panels.forEach(function (p) { tabs.push(p); });
    tabs.forEach(function (panel) {
      var tab = panel.getAttribute('data-tab-panel');
      buildJumpStrip(tab, panel);
      data.forEach(function (sc) {
        if (sc.tab !== tab) return;
        var section = h('section', 'scenario');
        section.setAttribute('id', sc.id);
        section.setAttribute('data-scenario', sc.id);
        section.appendChild(headerScreen(sc));
        section.appendChild(screenB(sc));
        section.appendChild(screenC(sc));
        section.appendChild(screenD(sc));
        panel.appendChild(section);
        ui.sections[sc.id] = section;
      });
    });
  }

  /* ---------- public api (tests drive this) -------------------- */

  ui.nextLine = function (id) {
    var pl = ui.players[id];
    if (!pl) return;
    /* Fire the player button's listener so state, marks and
       paint all go through the real path. */
    var st = state[id];
    if (st.shown < pl.total) {
      st.shown += 1;
      if (st.shown === pl.total) mark(id, 'player');
    } else if (REDUCED && !st.read) {
      st.read = true;
      mark(id, 'player');
    }
    paintAll();
  };

  ui.resetPlayer = function (id) {
    var st = state[id];
    if (!st || REDUCED) return;
    st.shown = 0;
    paintAll();
  };

  ui.flip = function (id, i) {
    var st = state[id];
    if (!st) return;
    st.flips[i] = true;
    mark(id, 'rb' + i);
    paintAll();
  };

  ui.tapNote = function (id) {
    var st = state[id];
    if (!st) return;
    st.note = true;
    mark(id, 'note');
    paintAll();
  };

  ui.setReadiness = function (id, n) {
    var st = state[id];
    if (!st) return;
    st.ready = n;
    paintAll();
    /* The band paint registers a painter that reads st.ready;
       the mark happens here so the reward does not depend on
       the paint. */
    mark(id, 'ready');
  };

  ui.addQuality = function (id, i) {
    var st = state[id];
    if (!st) return;
    st.board[i] = true;
    mark(id, 'q' + i);
  };

  ui.flipQuality = function (id, i) {
    var st = state[id];
    if (!st) return;
    st.flips[i] = true;
    mark(id, 'f' + i);
    paintAll();
  };

  ui.revealBoundary = function (id) {
    var st = state[id];
    if (!st) return;
    st.boundary = true;
    mark(id, 'boundary');
    paintAll();
  };

  ui.choose = function (id, i) {
    var st = state[id];
    if (!st) return;
    st.choice = i;
    mark(id, 'choice');
    paintAll();
  };

  ui.answerFact = function (id, i) {
    var st = state[id];
    if (!st) return;
    st.fact = i;
    mark(id, 'fact');
    paintAll();
  };

  ui.judgeDare = function (id, i, v) {
    var st = state[id];
    if (!st) return;
    st.dares[i] = v;
    mark(id, 'd' + i);
    paintAll();
  };

  ui.tapDebrief = function (id) {
    var st = state[id];
    if (!st) return;
    st.debrief = true;
    mark(id, 'debrief');
    paintAll();
  };

  ui.jump = function (id) {
    var section = ui.sections[id];
    if (section && section.scrollIntoView) {
      try { section.scrollIntoView({ block: 'start' }); }
      catch (e) { section.scrollIntoView(); }
    }
  };

  ui.paint = paintAll;

  ui.resetAll = function () {
    data.forEach(function (sc) {
      state[sc.id] = freshState(sc);
    });
    paintAll();
  };

  /* Repaint on language switch. Registered after js/i18n.js's
     own listener, so stateful text wins. */
  var langBtn = document.querySelector('[data-lang-toggle]');
  if (langBtn) langBtn.addEventListener('click', paintAll);

  render();
})();
