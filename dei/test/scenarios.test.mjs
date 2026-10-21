import test from 'node:test';
import assert from 'node:assert/strict';
import { makeEnv, run, runIn } from './shim.mjs';

const ZH = '示例：待翻译';

function setup(opts = {}) {
  const made = makeEnv({ panels: ['pyp', 'mshs'], tabLinks: ['pyp', 'mshs'], ...opts });
  const ctx = run('data/scenarios.js', made.env);
  /* Load order matches index.html: scenarios renders first,
     progress syncs over the rendered chips. */
  runIn(ctx, 'js/i18n.js');
  runIn(ctx, 'js/scenarios.js');
  runIn(ctx, 'js/progress.js');
  const { env, ...rest } = made;
  return { ctx, env: Object.assign({}, env, rest) };
}

function section(ctx, id) { return ctx.dei.ui.sections[id]; }
function inner(ctx, id, n) { return section(ctx, id).children[n - 1].children[0]; }

function completeScenario(ctx, id) {
  const sc = ctx.dei.scenarios.find((s) => s.id === id);
  const ui = ctx.dei.ui;
  sc.elements.forEach((el) => {
    if (el === 'player') {
      const total = ui.players[id].total;
      for (let i = 0; i < total; i++) ui.nextLine(id);
    } else if (el === 'debrief') ui.tapDebrief(id);
    else if (el === 'note') ui.tapNote(id);
    else if (el === 'ready') ui.setReadiness(id, 2);
    else if (el === 'boundary') ui.revealBoundary(id);
    else if (el === 'choice') ui.choose(id, 0);
    else if (el === 'fact') ui.answerFact(id, 0);
    else if (el.startsWith('q')) ui.addQuality(id, Number(el.slice(1)));
    else if (el.startsWith('f')) ui.flipQuality(id, Number(el.slice(1)));
    else if (el.startsWith('d')) ui.judgeDare(id, Number(el.slice(1)), 'keep');
    else if (el.startsWith('rb')) ui.flip(id, Number(el.slice(2)));
  });
}

test('renders one long page per tab: jump strip plus four screens per scenario', () => {
  const { ctx, env } = setup();
  const pyp = env.panelEls.find((p) => p.attrs['data-tab-panel'] === 'pyp');
  const mshs = env.panelEls.find((p) => p.attrs['data-tab-panel'] === 'mshs');
  assert.equal(pyp.children.length, 1 + 4);
  assert.equal(mshs.children.length, 1 + 5);
  assert.equal(pyp.children[0].children.length, 4);
  assert.equal(mshs.children[0].children.length, 5);
  ctx.dei.scenarios.forEach((sc) => {
    const sec = ctx.dei.ui.sections[sc.id];
    assert.equal(sec.children.length, 4);
    sec.children.forEach((s) => assert.equal(s.attrs['data-screen'], ''));
  });
});

test('the dialogue player reveals line by line and earns at the last line', () => {
  const { ctx } = setup();
  const ui = ctx.dei.ui;
  assert.equal(ui.players.sc1.total, 20);
  assert.equal(ui.state.sc1.shown, 0);
  const b = inner(ctx, 'sc1', 2);
  const player = b.children[b.children.length - 1];
  const lines = player.children[0].children;
  assert.equal(lines.length, 20);
  assert.ok(lines[0].classes.has('is-hidden'));
  ui.nextLine('sc1');
  assert.equal(ui.state.sc1.shown, 1);
  assert.ok(!lines[0].classes.has('is-hidden'));
  assert.ok(lines[1].classes.has('is-hidden'));
  for (let i = 0; i < 19; i++) ui.nextLine('sc1');
  assert.ok(ctx.dei.progress.isDone('sc1', 'player'));
});

test('repeat back flip and debrief earn their marks', () => {
  const { ctx } = setup();
  const ui = ctx.dei.ui;
  const flip = inner(ctx, 'sc1', 3).children[2];
  assert.ok(!flip.classes.has('is-flipped'));
  ui.flip('sc1', 0);
  assert.ok(flip.classes.has('is-flipped'));
  assert.equal(flip.attrs['aria-pressed'], 'true');
  assert.ok(ctx.dei.progress.isDone('sc1', 'rb0'));
  ui.tapDebrief('sc1');
  assert.ok(ctx.dei.progress.isDone('sc1', 'debrief'));
});

test('scenario 2 pause note earns its mark on tap', () => {
  const { ctx } = setup();
  ctx.dei.ui.tapNote('sc2');
  assert.ok(ctx.dei.progress.isDone('sc2', 'note'));
});

test('scenario 3 readiness scale shows the band and earns on tap', () => {
  const { ctx } = setup();
  const scale = inner(ctx, 'sc3', 2).children[2];
  assert.equal(scale.children.length, 4); // prompt, nums, band, path
  assert.equal(scale.children[1].children.length, 10);
  const band = scale.children[2];
  ctx.dei.ui.setReadiness('sc3', 2);
  assert.equal(band.textContent, 'Give it time. Check back later.');
  assert.ok(ctx.dei.progress.isDone('sc3', 'ready'));
  ctx.dei.ui.setReadiness('sc3', 7);
  assert.equal(band.textContent, "Let's talk now.");
});

test('scenario 4 board, quality flips and boundary all earn', () => {
  const { ctx } = setup();
  const ui = ctx.dei.ui;
  ui.addQuality('sc4', 0);
  ui.flipQuality('sc4', 3);
  ui.revealBoundary('sc4');
  assert.ok(ctx.dei.progress.isDone('sc4', 'q0'));
  assert.ok(ctx.dei.progress.isDone('sc4', 'f3'));
  assert.ok(ctx.dei.progress.isDone('sc4', 'boundary'));
  const turn = inner(ctx, 'sc4', 3).children[2];
  const bb = turn.children[4];
  assert.equal(bb.attrs['aria-expanded'], 'true');
  assert.equal(bb.children[1].textContent,
    "Leadership is about skills and qualities, not gender. That part's not up for debate.");
});

test('scenario 5 branch: the slow path resumes the script, others hide it', () => {
  const { ctx } = setup();
  const ui = ctx.dei.ui;
  const beat = inner(ctx, 'sc5', 2).children[2];
  const choice = beat.children[beat.children.length - 1];
  const resume = choice.children[choice.children.length - 1];
  assert.ok(resume.classes.has('is-hidden'));
  ui.choose('sc5', 1);
  assert.ok(!resume.classes.has('is-hidden'));
  assert.ok(ctx.dei.progress.isDone('sc5', 'choice'));
  ui.choose('sc5', 0);
  assert.ok(resume.classes.has('is-hidden'));
});

test('scenario 6 three way choice marks the picked option', () => {
  const { ctx } = setup();
  const choice = inner(ctx, 'sc6', 3).children[2];
  const opts = choice.children[1];
  assert.equal(opts.children.length, 3);
  ctx.dei.ui.choose('sc6', 2);
  assert.ok(opts.children[2].classes.has('is-picked'));
  assert.ok(!opts.children[0].classes.has('is-picked'));
  assert.ok(opts.children[2].children[1].classes.has('opt-tag'));
  assert.ok(ctx.dei.progress.isDone('sc6', 'choice'));
});

test('scenario 7 fact card: the stereotype answer is the good one', () => {
  const { ctx } = setup();
  const fact = inner(ctx, 'sc7', 3).children[2];
  const opts = fact.children[1];
  const reveal = fact.children[2];
  assert.ok(reveal.classes.has('is-hidden'));
  ctx.dei.ui.answerFact('sc7', 1);
  assert.ok(opts.children[1].classes.has('is-picked'));
  assert.ok(opts.children[1].classes.has('is-good'));
  assert.ok(!reveal.classes.has('is-hidden'));
  assert.ok(ctx.dei.progress.isDone('sc7', 'fact'));
  ctx.dei.ui.answerFact('sc7', 0);
  assert.ok(opts.children[0].classes.has('is-warn'));
});

test('scenario 8 dare filter: agreement and disagreement both show', () => {
  const { ctx } = setup();
  const dares = inner(ctx, 'sc8', 3).children[2];
  assert.equal(dares.children.length, 4);
  const cardCut = dares.children[2]; // would you kiss [name]
  const cardKeep = dares.children[0]; // backflip
  ctx.dei.ui.judgeDare('sc8', 2, 'cut');
  assert.ok(cardCut.classes.has('is-cut'));
  assert.equal(cardCut.children[4].textContent, 'Cut · the script agrees');
  ctx.dei.ui.judgeDare('sc8', 0, 'cut');
  assert.equal(cardKeep.children[3].textContent, 'the script says keep');
  assert.ok(ctx.dei.progress.isDone('sc8', 'd0'));
  assert.ok(ctx.dei.progress.isDone('sc8', 'd2'));
});

test('finishing a scenario marks its jump chip', () => {
  const { ctx } = setup();
  completeScenario(ctx, 'sc1');
  assert.ok(ctx.dei.progress.scenarioDone('sc1'));
  const chip = ctx.dei.ui.chips.sc1;
  assert.ok(chip.el.classes.has('is-done'));
  assert.equal(chip.doneEl.textContent, '(done)');
});

test('all nine done: badge, one celebration, tab marks', () => {
  const { ctx, env } = setup();
  ctx.dei.scenarios.forEach((sc) => completeScenario(ctx, sc.id));
  assert.ok(ctx.dei.progress.allDone());
  assert.equal(env.badgeEl.attrs['hidden'], 'false');
  const bursts = env.document.body.children.filter((c) => c.classes.has('celebrate'));
  assert.equal(bursts.length, 1);
  env.linkEls.forEach((l) => assert.ok(l.classes.has('is-done')));
  // An idempotent re-tap must not fire a second celebration.
  ctx.dei.ui.tapDebrief('sc1');
  assert.equal(env.document.body.children.filter((c) => c.classes.has('celebrate')).length, 1);
});

test('language switch repaints rendered strings with the zh pairs', () => {
  const { ctx, env } = setup();
  env.langBtn.fire('click');
  const pyp = env.panelEls.find((p) => p.attrs['data-tab-panel'] === 'pyp');
  const chip = pyp.children[0].children[0];
  assert.equal(chip.children[1].textContent, ZH);
  const b = inner(ctx, 'sc1', 2);
  const player = b.children[b.children.length - 1];
  const btn = player.children[1].children[0];
  assert.equal(btn.textContent, ZH);
});

test('reset clears progress, marks and component state', () => {
  const { ctx, env } = setup();
  completeScenario(ctx, 'sc1');
  ctx.dei.ui.nextLine('sc2');
  ctx.dei.progress.reset();
  assert.equal(env.stored['dei-progress'], '{}');
  assert.equal(ctx.dei.ui.state.sc1.shown, 0);
  assert.equal(env.badgeEl.attrs['hidden'], 'true');
  assert.ok(!ctx.dei.ui.chips.sc1.el.classes.has('is-done'));
});

test('under reduced motion the script shows at once and one tap earns it', () => {
  const { ctx } = setup({ reduced: true });
  const ui = ctx.dei.ui;
  assert.equal(ui.state.sc1.shown, ui.players.sc1.total);
  const b = inner(ctx, 'sc1', 2);
  const player = b.children[b.children.length - 1];
  assert.ok(!player.children[0].children[0].classes.has('is-hidden'));
  ui.nextLine('sc1'); // the "I have read the script" tap
  assert.ok(ctx.dei.progress.isDone('sc1', 'player'));
});
