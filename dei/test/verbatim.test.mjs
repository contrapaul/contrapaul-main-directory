/* "As written" guard: the English in data/scenarios.js must match
   the committee text in scenarios.md word for word. If a line is
   reworded in one file and not the other, this fails. */
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { script } from './shim.mjs';
import { parse } from './parse-scenarios.mjs';

function loadData() {
  const ctx = vm.createContext({});
  ctx.window = ctx;
  vm.runInContext(script('data/scenarios.js'), ctx);
  // Copy out of the sandbox so deepEqual sees plain arrays.
  return JSON.parse(JSON.stringify(ctx.dei.scenarios));
}

const source = parse();
const data = loadData();
const en = (pair) => (pair ? pair.en : null);

/* A turn may be split into several chat messages (say parts).
   Join neighbouring says back into the committee's line before
   comparing, so splitting never changes the words or their order. */
function joined(parts) {
  const out = [];
  parts.forEach((p) => {
    const last = out[out.length - 1];
    if (p.say && last && last.say !== undefined) last.say += ' ' + en(p.say);
    else out.push(p.dir ? { dir: en(p.dir) } : { say: en(p.say) });
  });
  return out.map((p) => (p.say !== undefined ? { say: p.say.replace(/\s+/g, ' ') } : p));
}
const flat = (parts) => parts.map((p) => (p.say !== undefined ? { say: p.say.replace(/\s+/g, ' ') } : p));

test('eight scenarios: 1 to 4 in PYP, 5, 6, 7 and 9 in MS/HS', () => {
  assert.equal(data.length, 8);
  assert.deepEqual(data.map((s) => s.tab), source.map((s) => s.tab));
  assert.deepEqual(data.map((s) => s.id), source.map((s) => 'sc' + s.n));
});

source.forEach((src, i) => {
  test(`scenario ${src.n} matches scenarios.md word for word`, () => {
    const sc = data[i];
    assert.equal(en(sc.title), src.title, 'title');
    assert.equal(en(sc.context), src.context, 'context');
    assert.equal(en(sc.note), src.note, 'harm note');
    assert.equal(en(sc.debrief), src.debrief, 'debrief');
    assert.equal(src.questions.length, 3, 'scenarios.md has three group questions');
    assert.deepEqual((sc.questions || []).map(en), src.questions, 'group questions');
    assert.equal(sc.lines.length, src.lines.length, 'line count');
    sc.lines.forEach((line, j) => {
      const want = src.lines[j];
      assert.equal(line.who, want.who, `line ${j + 1} speaker`);
      assert.equal(en(line.label), want.label, `line ${j + 1} label`);
      assert.deepEqual(joined(line.parts), flat(want.parts), `line ${j + 1} words`);
    });
  });
});

test('the parser loses no committee text', () => {
  const norm = (x) => x.replace(/[\s"“”:]/g, '');
  source.forEach((sc) => sc.lines.forEach((l, j) => {
    const rebuilt = l.label + l.parts.map((p) => p.dir || p.say).join('');
    assert.equal(norm(rebuilt), norm(sc.raw[j]), `scenario ${sc.n} line ${j + 1}`);
  }));
});
