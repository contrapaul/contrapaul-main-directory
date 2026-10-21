# DEI training page: build plan

Rewritten 2026-10-21. Implements `brief.md`. The earlier plan (presenter mode, arrow key screens, nine interactive components, the explorer reward) is withdrawn; this file replaces it in full.

## 1. Where the code stands

The code in this folder was built to the withdrawn plan. It works (55/55 node tests pass) but it is the wrong page. It keeps the parts Paul asked for and adds a lot he did not.

| Part | Files | Verdict |
|------|-------|---------|
| Theme (light/dark, no flash) | `js/theme.js`, pre-paint script in `index.html`, `css/tokens.css` | Keep |
| EN/中文 toggle | `js/i18n.js` | Keep |
| Two tab routing, deep links | `js/tabs.js` | Keep (routes `#/pyp`, `#/mshs` are right) |
| Header, tabs, footer, base layout | `index.html`, `css/base.css` | Keep, strip the presentation parts |
| Presenter mode | `js/mode.js`, header toggle, `data-mode` in pre-paint script | Remove |
| Screen engine (arrow keys, `data-screen`, rail, reveals, presenter strip, scroll snap) | `js/screens.js`, rail and strip markup, related CSS | Remove |
| Explorer reward (badge, celebration, reset) | `js/progress.js`, header badge, reset button | Remove |
| Scenario renderer with players, flips, scales, branches, stamps, board, choice, fact card, dare filter | `js/scenarios.js`, `css/scenarios.css` | Replace with a plain reader (section 3) |
| Scenario data | `data/scenarios.js` | Re-transcribe verbatim (section 4) |
| Tests for removed parts | `test/screens.test.mjs`, `test/mode.test.mjs`, `test/progress.test.mjs`, most of `test/scenarios.test.mjs` | Remove or rewrite with the code |

Why the data must be redone: the current `data/scenarios.js` changed the committee text. Titles were rewritten ("Unkind Nickname" became "The unkind nickname"), "1–10" became "1 to 10", every dash was replaced, stage directions were reworded and moved, a full stop was added in scenario 9, and invented copy was added (rule stamps, a pause note, reveal text, a set of made up dares for scenario 8).

## 2. Files after the rebuild

```
dei/
  index.html          header (brand, two tabs, 中文, theme), two tab panels, footer
  css/tokens.css      colours, type, spacing, both themes
  css/base.css        header, tabs, reading column, footer
  css/scenarios.css   jump links and scenario layout
  js/theme.js         theme resolve + toggle
  js/i18n.js          EN/中文 apply + toggle
  js/tabs.js          #/pyp and #/mshs routes, deep links
  js/scenarios.js     renders each tab: jump links + scenario sections
  data/scenarios.js   the nine scenarios, committee text verbatim, en/zh pairs
  scenarios.md        source of truth for the scenario text
  test/               node --test suite
```

## 3. The page on a phone

Top to bottom:

1. **Header**: brand, the two tabs (PYP, MS/HS), the 中文 toggle, the theme toggle. Compact so it does not eat the screen. Whether it stays fixed while scrolling is decided in the phone pass.
2. **Jump links**: one link per scenario in the tab, using the committee titles. They wrap or scroll sideways at narrow widths, never overflow the page.
3. **Scenarios**, one after another, each a plain section with an id (`sc1` to `sc9`):
   - the title as written (for example "Scenario 1: PYP - Unkind Nickname"),
   - the context line as written,
   - any "*Name the harm first ..." note as written,
   - the script, one line per speaker turn: the speaker label as written ("TEACHER:", "STUDENT #1:", "G:"), the stage direction in brackets in a muted style, then the spoken words,
   - the debrief note as written, set off from the script so it is easy to find for discussion.
4. **Footer**: `a project by mr. k, more at contrapaul.com`.

Reading comfort: a single column, body text 17 to 18px, line height about 1.6, side padding about 16 to 20px, clear space between scenarios. On desktop the same column, centred, capped near 70 characters wide.

Every scenario is fully visible on load. Nothing is hidden behind a tap.

## 4. Data and the verbatim check

- `data/scenarios.js` is a plain script (no modules, no fetch) that sets `window.dei.scenarios`. Each scenario holds `id`, `tab`, and its parts (title, context, harm note, lines, debrief) as `{en, zh}` pairs. Each line keeps the speaker label and the stage direction exactly as written.
- **A test enforces "as written"**: it reads `scenarios.md`, pulls out each scenario's text, and checks that the English in `data/scenarios.js` matches it word for word (whitespace aside). If anyone rewords a line, the test fails.
- zh halves are labelled placeholders until the translation of the locked English arrives.

## 5. Build order

Each step ends with tests passing and a HANDOFF entry. All work goes straight to `main`.

1. **Strip the presentation layer.** Remove presenter mode, the screen engine, the rail, the strip, the explorer reward, and their tests and CSS. Check: tests pass, the page loads with no console errors.
2. **Re-transcribe the data verbatim** and add the verbatim test. Check: the test passes against `scenarios.md`.
3. **Replace the renderer** with the plain reader from section 3, and rewrite the scenario tests for it. Check: all nine scenarios render in the right tabs, jump links reach each scenario, deep links work.
4. **Phone pass** in a real browser at 390x844 and 360x740, both themes, both languages. Check: the list in section 6. Screenshots go to Paul.
5. **Desktop pass** at 1280x800: tidy centred column, nothing stretched.
6. **Chinese**: drop in the translation when the English is locked.
7. **Deploy**: push to `main`; Cloudflare Pages serves `contrapaul.com/dei/`.

## 6. Phone checklist

- [ ] No horizontal scroll at 360px wide
- [ ] Body text at least 17px; nothing needs zooming
- [ ] Tabs and jump links at least 44px tall and easy to hit with a thumb
- [ ] Speaker labels, stage directions and spoken words are easy to tell apart at a glance
- [ ] Debrief note is easy to find
- [ ] A jump link lands with the scenario title in view, not under the header
- [ ] Both themes pass AA contrast
- [ ] 中文 toggle swaps all chrome; layout holds in Chinese
- [ ] No network requests after load
- [ ] Scenario text matches `scenarios.md` (verbatim test passes)

## 7. Settled

- Two tabs, PYP and MS/HS (2026-10-15). PYP holds scenarios 1 to 4, MS/HS holds 5 to 9.
- Scenario text is shown as written; Paul's three notes in `scenarios.md` are the only changes (2026-10-21, 2026-10-15).
- No presenter mode, no presentation features, no invented interactivity (2026-10-21).
- Mobile is the top priority (2026-10-21).
- Work on `main`, no branches (2026-10-21).
- Domain `contrapaul.com/dei/` (2026-10-15). Accent colour deep teal (2026-10-14).

## 8. Open questions for Paul

See the latest HANDOFF entry. They are repeated there so the next session sees them first.
