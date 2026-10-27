# HANDOFF

Working notes for the next session. Newest entry first. Paul's standing requests are at the bottom; read them before starting. Use today's real date on every entry (an earlier session stamped today's work 2026-10-15 by mistake; it has been corrected to 2026-10-21 throughout).

## Status at a glance

- **Phone chat build 2026-10-21.** Two tabs (PYP, MS/HS), nine committee scenarios word for word. Every conversation plays as a phone chat: pure text, messages arrive at the bottom and push older ones up, paced by length, typing dots between. One trophy button in the header opens the three awards. Five placeholder layouts (A to E) wait for Paul's later pass.
- **Tests:** `npm test` passes 33/33, including the verbatim check (split messages are joined back before comparing). Browser checked in Chromium at 360x740 and 390x844, light and dark. Not yet seen on a real phone.
- **Staff review the scenario text tonight.** Edits go into `scenarios.md` first, then `data/scenarios.js`.
- **Waiting on Paul**: his review of the message splits and the pace, then the layouts.

## Entries

### 2026-10-27 (desktop: nothing scrolls under the column edges)

**Asked:** on a desktop browser the scenario jump links scrolled sideways under the frames at the sides of the page. Paul will shorten the titles; he asked that nothing scroll horizontally under the frames.

**Changed:** `css/scenarios.css`: above 680px (wider than the reading column) the jump links and layout A's flip cards wrap inside the column instead of swiping, and cards sharing a row share its height. Phones keep the edge to edge swipe. `CLAUDE.md` gained the rule; `plans.md` checklist updated.

**Verified:** an audit script found no sideways scrolling element and nothing past the column edges on either tab at 681, 700, 1280 and 1920px; at 390px only the jump links swipe and the page itself never scrolls sideways. 33/33 tests.


### 2026-10-21 (fourth pass: conversations become phone chats)

**Asked:** Paul liked the chat view enough to lock it in: every conversation looks like a phone conversation, pure text, no photos, messages moving up as new ones are received. Replace the three header emoji with one trophy that opens the awards. Vary the timing: a longer message stays longer before the reply, short ones come quickly so it feels conversational. Break the scripts into chat messages as a logical start; Paul reviews the code and the splits afterwards. Drop images entirely. Layouts wait until after this.

**Changed:**

- `js/scenarios.js`: the card player and its back/forward stepping are gone. The conversation now plays inside a fixed height chat window: messages arrive at the bottom, the window follows them unless the reader scrolls up, stage directions are small centred notes, typing dots show before each message, and the speaker's name shows on the first message of a run. Pace is `PACE` and `TYPING` at the top of the file.
- `data/scenarios.js`: regenerated with long turns split into several `say` parts (messages) at sentence breaks, about 100 characters each; turns up to 110 characters stay whole. 170 messages in all. No image fields.
- `test/verbatim.test.mjs`: joins neighbouring `say` parts back into the committee line before comparing, so splitting can never change words or order. Checked that dropping a word still fails it.
- `js/progress.js`: the three emoji became one trophy button (count of awards earned beside it) that opens a small awards list: emoji (grey until earned), name, "✓ Earned" or "N of M played". Closes on outside tap or Escape. `test/progress.test.mjs` updated, plus a test for opening and closing.
- `css/scenarios.css`: card and image styles removed; phone window, message arrival, notes, typing dots, trophy and awards list added.
- Docs: `brief.md`, `plans.md` (section 3 rewritten with a pace table), `CLAUDE.md`, `scenarios.md` display rules.

**Verified:** 33/33 tests. In Chromium at 390x844 and 360x740: the chat plays and follows new messages; scrolling up stops the following and scrolling back down resumes it; all five MS/HS chats play to the end and the trophy count updates; the awards list opens and closes; no horizontal scroll; no console errors; no network requests.

**Unverified:** a real phone (iOS Safari: smooth scrolling inside the chat window, `:has()`, backdrop blur); how the pace feels at full length (the pace table is arithmetic, not a reading test).

**For Paul to review:**

1. **Message splits** in `data/scenarios.js`: each `{ say: ... }` is one message. Split or join them freely; the test only checks the words and their order.
2. **Pace**: the table in `plans.md` section 3. One number speeds up or slows down everything.
3. Back/forward stepping is gone, because the finished chat can be scrolled. Say if you still want stepping.

### 2026-10-21 (third pass: the draft build)

**Asked:** Paul answered the open questions: debrief shown openly; tapping for each line is awful, so the conversation plays on its own (relatively quickly, Paul tunes timing later) and back/forward stepping comes after it has played; "STUDENT" and "G" come from the right; build a few placeholder layouts for flip cards that ask questions then offer suggestions, and other ways to engage with suggested language, to choose from; drop the "Context :" label; after the last line show the whole conversation as a group chat with the same colours and sides; rewards are very minor, an emoji each, in or near the header, no reset. (Paul mentioned a handoff comment about tapping; it was not in any committed version of `HANDOFF.md`.)

**Changed:**

- Removed `js/screens.js`, `js/mode.js`, their tests, the old `test/scenarios.test.mjs`, and every presenter, rail, strip and reveal hook in `index.html`, CSS and the test shim.
- `data/scenarios.js`: regenerated from `scenarios.md`, word for word. Each line carries its speaker label, stage directions and spoken words as written. Five scenarios carry a placeholder layout.
- New `test/parse-scenarios.mjs` and `test/verbatim.test.mjs`: the data must match `scenarios.md`. Checked that rewording one line fails it.
- New `js/scenarios.js` and `css/scenarios.css`: jump links, scenario sections, the player, the group chat, layouts A to E. `js/progress.js` rewritten for the three rewards; `test/progress.test.mjs` rewritten.
- `css/base.css` rewritten phone first (one compact sticky header row, brand only on wider screens). `css/tokens.css`: speaker colours, presenter tokens removed. `js/i18n.js`: fires `dei:lang`; a pair with no zh falls back to English.
- Docs: `brief.md`, `plans.md`, `CLAUDE.md`, `scenarios.md` (display rules) updated to match.

**Verified:** 32/32 tests. In Chromium: no horizontal scroll at 360px on either tab; all nine conversations play to the end; the three rewards appear at the right moments; stepping and the chat highlight work; a language switch mid-play keeps playing; returning visits open finished scenarios ready to step; deep links land under the header; reduced motion swaps cards without sliding; no console errors; no network requests.

**Unverified:** a real phone (iOS Safari especially: backdrop blur, `:has()` selectors, safe areas); measured contrast for the speaker colours; how the pace feels to a reader.

**Open questions for Paul:**

1. **Layouts:** which of A to E to keep, and in which scenarios? (Table in `plans.md` section 4.)
2. **Pace:** try a few conversations; faster or slower? One number changes all of it.
3. **Emoji:** 🌱 PYP, 🧭 MS/HS, 🤝 Conflict Resolution. Keep or swap?
4. **Line images:** 3:2 cards with file names `sc1-01` to `sc9-16` shown on each placeholder. Does that shape and naming suit how the art will be made?

**Next:** Paul's picks, then expand the chosen layouts, then art and Chinese.

### 2026-10-21 (second pass: Paul's answers folded in)

**Asked:** Paul corrected the first pass. The page is not a plain reading page: it keeps interactive elements (flip, match) and gets a Play button per conversation. Proposed player: each line shows an image of the speaker sliding in, with the line over the bottom of the image; teacher and student 2 come from the left, student 1 from the right; bubbles colour coded. Rewards: PYP, MS/HS and a third "Conflict Resolution" reward. No image per scenario; plan an image per dialogue line instead. Far too many titles and extra text: one real title per scenario, remove every unnecessary title. Scenario 3 gets a debrief space with a placeholder note for the team. `brief.md` was the deprecated file meant by "presentation.md". The entries dated 2026-10-15 were written today; align them with these answers.

**Changed** (docs only, no code):

- `scenarios.md`: header now records provenance (unedited AI output, staff review tonight), Paul's edits dated 2026-10-21, the display rule (real title only, no "Scenario N: PYP - " prefix), and a placeholder debrief added to scenario 3.
- `CLAUDE.md`: interaction rules back in (settled player, flip and match pieces are Paul's call with no invented content, three earned rewards, still versions, never colour alone); a strict one title, no extra text rule; placeholder labelling for line images, the scenario 3 debrief and zh.
- `brief.md`: rewritten again to match: scenario anatomy, player, rewards, no clutter.
- `plans.md`: code audit updated (player rebuilt, flip card parked, `js/progress.js` adapted to three rewards); new sections for scenario layout, the player spec, flip and match pieces, rewards, data with per-line sides and image slots; build order and checklist updated.
- `HANDOFF.md`: dates corrected, today's earlier notes restored below and aligned, this entry.

**Verified:** docs only. The committee text in `scenarios.md` still matches the original apart from Paul's listed edits.

**Open questions for Paul:**

1. **Debrief**: shown openly under each scenario, or hidden until tapped so groups discuss first?
2. **Player pace**: tap for each line (the current plan), or play on its own with a pause button?
3. **Sides and colours for the other speakers**: scenario 7's speaker is "STUDENT" (no number) and scenario 8 has "G" (the group) and "STUDENT #2". Which side does each come from?
4. **Flip and match pieces**: which scenarios, and what goes on them? One candidate that uses only committee lines: in scenarios 1, 2, 3, 5 and 9 the teacher asks "What did you hear?", the student's first answer misses the point, and the teacher has them say it back properly. A flip card could show the first answer on the front and the corrected say-back on the back. Accept, reject or replace.
5. **"Context :" label**: the plan shows the context sentence without the label, to cut clutter. OK?
6. **After the last line**: should the whole conversation then show as a list, so a group can look back at it while discussing?
7. **Rewards**: how should each look, where should it appear, and should there be a reset?

**Next:** superseded by the third pass above.

### 2026-10-21 (first pass: direction reset)

**Asked:** the earlier plans and builds (by a local Qwen agent) drifted from what Paul wanted. Scenarios go on the draft site as written. Two tabs, PYP and MS/HS. Remove presenter mode. Mobile is the top priority. Purge outdated docs, push to `main` without branching, report back.

**Changed:** removed the "Presentation plan" and per-scenario "Presentation (proposal)" blocks from `scenarios.md`; rewrote `CLAUDE.md`, `brief.md`, `plans.md`, `HANDOFF.md`. Parts of this pass (no interactivity, no rewards, titles with their prefixes) were corrected by the second pass above.

### 2026-10-21 (earlier today: Paul's notes, recorded by the Qwen sessions)

These were stamped 2026-10-15 by mistake. What still stands, aligned with the second pass:

- **The page lives at `contrapaul.com/dei/`**, moved from its own folder into `contrapaul-main-directory`. Asset paths are relative and routing is hash only, so the page works at any path. All `localStorage` keys are `dei-` prefixed, so nothing collides with the main site.
- **Nine committee scenarios, two groups.** Four PYP, five MS/HS. Tabs are PYP and MS/HS (Paul chose MS/HS over MYP/DP). Each tab has jump links at the top to each scenario. Mobile is the primary device and the page must load beautifully.
- **Paul's decisions on the text**: scenario 9's mislabeled line fixed to student 2; scenario 6's garbled line kept with asterisks and "(Fix text)" (Paul does not know what the committee meant); scenario 5's "I just stopped being hungry." kept as written.
- **Provenance**: the committee used unedited AI output. Staff review it tonight before it locks.
- **Chinese**: preliminary translation after the review, final after the English locks; placeholders until then.

What does not stand: the Qwen presentation plan and build (presenter mode and screen engine, four screens per scenario with kickers and method tags, the line list player, readiness scale and branch, rule stamps, qualities board, three way choice, fact card, dare filter with made up dares, a single explorer badge, and the reworded scenario text). That code was removed in the third pass.

### History before 2026-10-21 (superseded)

- 2026-10-14: scaffold (theme, EN/中文, tabs, footer), the screen engine and presenter mode, then a pivot from a survey plus scenarios layout to six scenario tabs. Only the theme, EN/中文 and tab routing survive into the current plan.

## Paul's standing requests

- Scenario text appears exactly as written in `scenarios.md`. Nothing reworded, nothing added inside a scenario.
- One title per scenario, the real title only. No extra titles, kickers, tags or filler text.
- Two tabs: PYP and MS/HS, jump links at the top. No presenter mode.
- Mobile first. It must look great on a phone.
- Every conversation is a phone chat: pure text, no images, messages arrive at the bottom and push older ones up, paced by length (teacher and student 2 left; student 1, "STUDENT" and the group right). Never tap per message.
- Awards are earned by playing through: PYP, MS/HS, Conflict Resolution, behind one trophy button in the header. No reset.
- Work on `main`. Do not branch.
- If something is unclear, ask. Do not fill gaps with your own ideas.
