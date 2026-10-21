# HANDOFF

Working notes for the next session. Newest entry first. Paul's standing requests are at the bottom; read them before starting.

## Status at a glance

- **Direction reset 2026-10-21.** The page is a two tab reading and discussion page (PYP, MS/HS) for teachers, mobile first. The nine committee scenarios appear exactly as written in `scenarios.md`. No presenter mode, no presentation features, no invented interactivity.
- **Docs are current; code is not.** `brief.md`, `plans.md`, `CLAUDE.md` and `scenarios.md` describe the new direction. The code still implements the withdrawn plan (presenter mode, arrow key screens, interactive components, explorer reward, rewritten scenario text). 55/55 tests pass on that old code.
- **Waiting on Paul**: answers to the open questions in the 2026-10-21 entry, then a go-ahead to start `plans.md` section 5, step 1.

## Entries

### 2026-10-21 (direction reset: docs and rules rewritten)

**Asked:** Paul said the earlier plans and builds (done by a local Qwen agent) drifted far from what he wanted. The scenarios in `scenarios.md` are to appear on the draft site as written. The page is two tabs, PYP and MS/HS, each with scenarios for teachers to read and discuss. Presenter mode goes. Looking great on mobile is the top priority. Purge the outdated material from the rules and project docs, push to `main` (no branches), then report the goals and content so Paul can decide whether the vision is clear.

**Changed** (docs only, no code):

- `scenarios.md`: removed the "Presentation plan" section and the nine "Presentation (proposal)" blocks (dialogue players, flip cards, scales, invented rule stamps, invented dares and so on). Added a short header saying the text is the source of truth and is shown as written, listing Paul's three edits. The committee text itself is unchanged from the original commit except those edits (scenario 6 "(Fix text)" marking, scenario 9 speaker fix).
- `CLAUDE.md`: rewritten. Removed presentation surface, back of room legibility, arrow key, `data-screen`, presenter mode, still version and explorer reward rules. Added: mobile first with concrete checks, no presentation features, no invented interactivity, scenario text verbatim with no added copy, writing rules apply only to our own words (so the committee's dashes stay), work on `main`.
- `brief.md`: rewritten to the current page. The survey, introduction tab, six tab and presenter material is gone.
- `plans.md`: rewritten. Section 1 audits the existing code (keep theme, i18n, tabs; remove presenter mode, screen engine, explorer reward; replace the renderer; re-transcribe the data). New build order: strip, re-transcribe with a verbatim test, plain reader, phone pass, desktop pass, Chinese, deploy.
- `HANDOFF.md`: this entry, a new status section, the earlier entries condensed into the history below, standing requests rewritten.

**Verified:** `node --test test/*.test.mjs` passes 55/55 (old code, unchanged). The scenario text diff against the original commit shows only Paul's edits.

**Open questions for Paul:**

1. **Explorer reward.** You asked for it earlier, but with nothing to tap there is nothing to earn. The plan removes it. Confirm?
2. **Images.** You said earlier each scenario could have an image. Keep an image slot per scenario (empty for now), or no images?
3. **Debrief notes.** The plan shows them openly under each script. Or would you rather they stay hidden until tapped, so groups discuss first?
4. **Titles.** The plan shows titles as written, including the group prefix ("Scenario 1: PYP - Unkind Nickname") even though the tab already says PYP. Keep as written?
5. **Scenario 3** has no debrief note in the committee text. Leave it without one?
6. **"presentation.md"** does not exist in the repo. I took it to mean the "Presentation plan" section that was at the top of `scenarios.md` and purged that. Was there another file?
7. **"Late additions to the handoff."** I found nothing newer than the 2026-10-15 entries and the standing requests. If you meant something else, point me to it.

**Next:** Paul answers the questions above and decides whether the vision is clear. Then `plans.md` section 5, step 1.

### History before 2026-10-21 (superseded)

Kept short on purpose. These sessions built to plans that are now withdrawn; do not follow them.

- 2026-10-14: scaffold (theme, EN/中文, tabs, footer), then the screen engine and presenter mode, then a pivot from a survey plus scenarios layout to six scenario tabs.
- 2026-10-15: moved from its own folder into `contrapaul-main-directory/dei/` to serve at `contrapaul.com/dei/`. The committee's nine scenarios arrived; the agent proposed and then built a component set (dialogue player, flips, readiness scale and branch, harm banners, rule stamps, qualities board, three way choice, fact card, dare filter) and the explorer reward, and rewrote the scenario text during transcription. Paul's answers that still stand: tabs are PYP and MS/HS; scenario 6 line marked "(Fix text)"; scenario 9 speaker fixed to student 2; scenario 5 line kept; Chinese comes after the English is locked.

## Paul's standing requests

- Scenario text appears exactly as written in `scenarios.md`. Nothing reworded, nothing added inside a scenario.
- Two tabs: PYP and MS/HS. Teachers read and discuss; no presenter mode.
- Mobile first. It must look great on a phone.
- Work on `main`. Do not branch.
- If something is unclear, ask. Do not fill gaps with your own ideas.
