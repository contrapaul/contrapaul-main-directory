# HANDOFF

Working notes for the next session. Newest entry first. Paul's standing requests are at the bottom; read them before starting. Use today's real date on every entry (an earlier session stamped today's work 2026-10-15 by mistake; it has been corrected to 2026-10-21 throughout).

## Status at a glance

- **Direction set 2026-10-21.** Two tabs (PYP, MS/HS) of committee scenarios for teachers, mobile first. Each scenario: one title, the context and harm note as written, a Play button for the conversation player (speaker images, colour coded bubbles, teacher and student 2 from the left, student 1 from the right), flip and match pieces where Paul chooses, and a debrief space. Three rewards: PYP, MS/HS, Conflict Resolution. No presenter mode.
- **Docs are current; code is not.** `brief.md`, `plans.md`, `CLAUDE.md`, `scenarios.md` describe the direction above. The code still implements the withdrawn plan (presenter mode, screen engine, cluttered four screen layout, invented components, rewritten text). 55/55 tests pass on that old code.
- **Staff review the scenario text tonight.** Edits that come out of it go into `scenarios.md` first.
- **Waiting on Paul**: the open questions in the newest entry, then a go-ahead for `plans.md` section 7, step 1.

## Entries

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

**Next:** Paul answers, then `plans.md` section 7, step 1 (strip).

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

What does not stand: the Qwen presentation plan and build (presenter mode and screen engine, four screens per scenario with kickers and method tags, the line list player, readiness scale and branch, rule stamps, qualities board, three way choice, fact card, dare filter with made up dares, a single explorer badge, and the reworded scenario text). That code is still in the folder until `plans.md` section 7, step 1 removes it.

### History before 2026-10-21 (superseded)

- 2026-10-14: scaffold (theme, EN/中文, tabs, footer), the screen engine and presenter mode, then a pivot from a survey plus scenarios layout to six scenario tabs. Only the theme, EN/中文 and tab routing survive into the current plan.

## Paul's standing requests

- Scenario text appears exactly as written in `scenarios.md`. Nothing reworded, nothing added inside a scenario.
- One title per scenario, the real title only. No extra titles, kickers, tags or filler text.
- Two tabs: PYP and MS/HS, jump links at the top. No presenter mode.
- Mobile first. It must look great on a phone.
- Conversations play line by line with speaker images and colour coded bubbles (teacher and student 2 left, student 1 right).
- Rewards are earned by tapping through: PYP, MS/HS, Conflict Resolution.
- Work on `main`. Do not branch.
- If something is unclear, ask. Do not fill gaps with your own ideas.
