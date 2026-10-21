/* Reads scenarios.md (the committee text, the source of truth)
   into the shape data/scenarios.js must match. The verbatim test
   uses it; nothing on the page does (the page cannot fetch).

   Display rules applied here, all settled by Paul (2026-10-21):
   - the title drops its "Scenario N: GROUP - " prefix,
   - the context drops its "Context :" label,
   - a harm note drops its leading "*",
   - the debrief drops its outer brackets,
   - each script line splits into its speaker label (as written,
     without the colon), bracketed stage directions (as written,
     brackets kept) and spoken words (outer quote marks dropped,
     because the bubble already says it is speech).
   Words are never changed. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SOURCE = path.resolve(here, '..', 'scenarios.md');

const OPEN = '"“';
const CLOSE = '"”';
const LABEL = /^(TEACHER|Teacher|STUDENT ?#\d|STUDENT|G)(?=[\s:"“(])\s*:?\s*/;

/* Speaker label as written -> speaker key. */
export function speakerKey(label) {
  const k = label.toUpperCase().replace(/\s+/g, '');
  return { TEACHER: 't', 'STUDENT#1': 's1', 'STUDENT#2': 's2', STUDENT: 's', G: 'g' }[k];
}

/* Split the part of a line after the label into stage directions
   (brackets outside speech) and spoken words. */
export function segments(rest) {
  const out = [];
  let i = 0;
  while (i < rest.length) {
    const c = rest[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(') {
      let depth = 0, j = i;
      for (; j < rest.length; j++) {
        if (rest[j] === '(') depth++;
        else if (rest[j] === ')' && --depth === 0) break;
      }
      out.push({ dir: rest.slice(i, j + 1) });
      i = j + 1;
    } else if (OPEN.includes(c)) {
      let j = i + 1;
      while (j < rest.length && !CLOSE.includes(rest[j])) j++;
      out.push({ say: rest.slice(i + 1, j).trim() });
      i = j + 1;
    } else {
      // Unquoted speech (one committee line lost its opening quote).
      let j = i;
      while (j < rest.length && rest[j] !== '(') j++;
      out.push({ say: rest.slice(i, j).trim().replace(/["”]$/, '').trim() });
      i = j;
    }
  }
  return out;
}

export function parse(text = readFileSync(SOURCE, 'utf8')) {
  const blocks = text.split(/^(?=## Scenario )/m).slice(1);
  return blocks.map((block) => {
    const rows = block.split('\n');
    const head = rows[0].match(/^## Scenario (\d+):\s*(PYP|MS\/HS)\s*-\s*(.+?)\s*$/);
    if (!head) throw new Error('bad scenario heading: ' + rows[0]);
    const sc = {
      n: Number(head[1]),
      tab: head[2] === 'PYP' ? 'pyp' : 'mshs',
      title: head[3],
      context: null,
      note: null,
      debrief: null,
      lines: [],
      raw: [],
    };
    rows.slice(1).forEach((row) => {
      const r = row.trim();
      if (!r) return;
      if (/^Context\s*:/.test(r)) sc.context = r.replace(/^Context\s*:\s*/, '');
      else if (r.startsWith('*')) sc.note = r.slice(1);
      else if (r.startsWith('(Debrief')) sc.debrief = r.replace(/^\(/, '').replace(/\)$/, '').trim();
      else {
        const m = r.match(LABEL);
        if (!m) throw new Error('unreadable script line in scenario ' + sc.n + ': ' + r);
        sc.lines.push({ who: speakerKey(m[1]), label: m[1], parts: segments(r.slice(m[0].length)) });
        sc.raw.push(r);
      }
    });
    return sc;
  });
}
