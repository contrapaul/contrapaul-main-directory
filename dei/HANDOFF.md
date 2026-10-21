# HANDOFF

Working notes for the next session. Newest entry first. Paul's standing requests go at the bottom.

## Status at a glance

- **RETARGET 2026-10-15 — read this first.** Paul went through the live page and issued five critical notes (dead space / compactness, the tap-to-advance player is wrong, **MS/HS does not load at all**, scenarios must be shown not reworked into activities, and **presenter mode is dropped**). See `plans.md` section 0 and the top entry below (Paul's prompt is quoted verbatim there). **No code has been changed since his review** — a fresh session picks this up. Steps 5 and 6 (polish, deploy) are blocked until the retarget is done.
- **The page is two tabs (PYP, MS/HS) holding nine scenarios** (2026-10-15, from the committee content). Routes are `#/pyp` and `#/mshs`; deep links like `#/pyp#sc3` work. Mobile is the primary platform.
- **Steps 1 and 2 of 6 done** (scaffold, screen engine). **Steps 3 and 4 written and unit tested 2026-10-15:** all nine scenarios render with their components (dialogue player, readiness chip/scale/branch, repeat back cards, harm banners, rule stamps, debrief cards, the s4 board, s5 branch, s6 three way choice, s7 fact card, s8 dare filter), plus the explorer reward (`js/progress.js`, badge, one-time celebration, reset in the presenter strip). 55/55 node tests passing. **The browser verification pass for the new screens is not yet run** (checklist in `plans.md` section 6, list in the entry below).
- The committee text is unedited AI output; staff review it 2026-10-15. All copy lives in `data/scenarios.js`, so review edits are data swaps. Every zh pair is a `示例` placeholder: preliminary translation before the meeting, final after the text locks.
- Decisions settled 2026-10-14 and 2026-10-15 (plans.md section 7): accent is deep teal; two tabs PYP and MS/HS; the six proposed methods are retired in favour of the content-driven components; the "recommended move" question is answered by the data (marked options in s5, s6, s7).
- Still open: **the §0 retarget first** (see top entry), then the browser verification of the reworked screens, then steps 5 and 6 (polish pass, deploy). Note for the next session: if the session's working directory is the pre-move path (`GitHub/dei`), the bash tool dies and tests must run via a delegate or a new session from `GitHub/contrapaul-main-directory/dei`.

## Entries

### 2026-10-15 (Paul reviewed the live page: retarget, no code changes yet)

**Asked:** Paul went through the built page, gave five critical notes, and asked that the plan and handoff be updated to record them, with his prompt quoted verbatim here as a check on future progress. **No changes to the page** — a fresh session starts the retarget. The full prompt, verbatim:

> I've been through the page. A few critical notes to add to the plan, and fix/add now. 1. There is a HUGE amount of dead/empty space. On a phone it's possible to end up looking at almost nothing but background. The content in each scenario needs to be far more compact. 2. The 'next line' in script is not at all the implementation I want. The conversation should print in/be revealed automatically when started, not require 18+ taps/clicks to view. 3. MS/HS doesn't work at all- nothing loads. 4. I should have more closely reviewed your notes. The scripts and scenarios are intended to be shown to staff, not reworked into discussions or activities that don't actually include the content. PYP scenario 4 is a strong example where you created something far, far from the intended outcome. 5. This is no longer a presentation first, and we don't need presentation mode or any features built around being a presentation. Update the project plan and handoff, but do not make changes. Include my prompt here verbatim in the handoff as a check on future progress. Do NOT make changes to the page. I will have another session start fresh.

**Changed (docs only, per the request):**

- `plans.md`: new **section 0. Retarget 2026-10-15** at the top carrying all five notes, what each implies, and what still stands after the retarget; **build order** gains a new **step 0 (Retarget, active)** that gates steps 5 and 6.
- `HANDOFF.md`: this entry; **Status at a glance** now leads with the retarget and marks steps 5/6 blocked on it.

**Not changed (per "do not make changes to the page"):** every file in `css/`, `js/`, `data/`, `index.html`, and `test/` is untouched. Tests still pass 55/55 but that is stale against the retarget — the node suite does not cover the MS/HS load bug (note 3) or the compactness/player/rework issues (notes 1, 2, 4).

**Next (fresh session, in this order):** (1) fix the **MS/HS load bug** — nothing renders on tab two, blocking; (2) **compact the per-scenario layout** so a phone screen is content not background (reconsider the four-`data-screen`-per-scenario split); (3) **redesign the dialogue player to auto-reveal** the script instead of per-line taps; (4) **rework components to present the actual script** to staff rather than bury it in activities — s4 (qualities board + flips + boundary card) is the flagged example; (5) **strip presenter mode** (`js/mode.js`, the toggle, the strip, stills, 1.25x scale, and the reset-from-presenter-strip control). Then the browser verification pass, then steps 5 and 6. Keep the zh `示例` placeholders until the real translation lands.

### 2026-10-15 (build: two tabs, nine scenarios, components, explorer reward)

**Asked:** Paul answered the five open questions (tab label is MS/HS; scenario 9's speaker fixed to student 2; scenario 6's garbled line keeps its words with asterisks and a "(Fix text)" note; scenario 5's "I just stopped being hungry." stays; the committee used unedited AI output, staff review tonight, Chinese goes preliminary before the meeting and final after the text locks) and said: update `plans.md` and `CLAUDE.md`, then proceed to the build revisions.

**Changed** (all paths under `contrapaul-main-directory/dei/`):

- `scenarios.md`: decisions section recorded, scenario 9 speaker fixed, scenario 6 line marked, translation sequence noted, tab label MS/HS.
- `CLAUDE.md`: the presentation surface rule now says two tabs, nine scenarios, mobile first; the explorer reward rule now says all nine scenarios.
- `plans.md`: retargeted end to end (two tab architecture with jump strips and `#/pyp` / `#/mshs` routes, the component list replacing the retired six method table, the reward table retabulated for nine, build order steps 3 and 4 marked written, section 7 settled items for 2026-10-15, the open "recommended move" question answered by the data).
- **New `data/scenarios.js`:** all nine scenarios as data objects, en/zh pairs (zh is a `示例` placeholder until the translation lands). Committee transcription rules applied: em dashes become commas and full stops, the scenario 6 garbled line is kept verbatim with asterisks and the "(Fix text)" note, scenario 5's line stays as written.
- **New `js/scenarios.js`:** renders each tab as a sticky jump strip plus four `data-screen` screens per scenario, and builds the components: dialogue player (line by line, speaker chips, tap or space, reset, aria-live, reduced motion shows the full script with an "I have read the script" tap so the reward is still earned), readiness chip (1, 2, 9), interactive readiness scale with banded guidance (3), readiness branch (5), repeat back cards (1, 2 twice, 3, 5, 9), harm banners (5 to 7, 9) and tone tag (8), rule stamps, debrief cards (scenario 3's is a labelled placeholder, the committee wrote no note), the qualities board plus flips plus boundary card (4), the three way choice (6), the fact or stereotype card plus forward move card (7), the dare filter (8). Exposes `window.dei.ui` for the tests.
- **New `js/progress.js`:** the explorer reward. `dei-progress` in localStorage, per element marks, jump chip marks, tab marks, the header badge "All nine scenarios", a one-time 12 spark celebration (skipped under reduced motion, skipped for work done in earlier visits), reset from the presenter strip button and from the console.
- **New `css/scenarios.css`:** jump strips, player, flip cards with reduced motion and presenter stills, readiness scale, board, choice, fact, dares, rule stamp, banners, celebration, 44px touch targets, single column under 720px.
- `index.html`: two tab panels (pyp, mshs) with noscript notes, two tab links, the badge slot in the header, the reset button in the presenter strip, the new stylesheet, and the new scripts in order (`data/scenarios.js`, `js/scenarios.js`, `js/progress.js` before `js/tabs.js`).
- `js/tabs.js`: routes are `pyp` and `mshs`, default `pyp`.
- Tests: `test/tabs.test.mjs` rewritten for the two tabs; new `test/scenarios.test.mjs` and `test/progress.test.mjs`; `test/shim.mjs` gained the badge and reset button elements.

**Verified:** `node --test test/*.test.mjs` passes 55/55 (run via a delegate subagent; this session's bash tool is dead because its working directory is the pre-move path).

**Unverified (needs a browser, checklist in `plans.md` section 6):** every new screen at 1280x720 and 1920x1080 (the four screens per scenario have not had the height audit re run since the real content renders), the 390x844 phone pass (jump strip scroll, player thumb button, sticky offsets against the real header height), the zh layout pass with the placeholder text, the reduced motion and presenter stills as they look, the celebration burst, and a `file://` load with the network tab empty.

**Next:** staff review 2026-10-15 edits the text; those are data swaps in `data/scenarios.js`. The preliminary Chinese translation lands before the meeting and replaces the `示例` placeholders. Then the browser verification pass above, then polish and deploy (steps 5 and 6).

### 2026-10-15 (committee scenarios arrived, presentation plan proposed)

**Asked:** review the committee's scenarios in `scenarios.md` (now nine: four PYP, five MS/HS; was six) and expand/annotate to propose how they will be presented. The page drops to two tabs, one per group, each with jump links at the top to a specific scenario. Mobile is the primary device and must load beautifully.

**Changed:**

- `dei/scenarios.md`: a presentation plan section added at the top (two tab structure, sticky jump chips, mobile first rules, seven shared components, the explorer reward retabulated for nine scenarios, four questions for Paul, build notes) plus one annotation block per scenario (four screens each, the interactive elements, the completion elements, facilitation notes).

**Key proposals (awaiting Paul's sign-off):**

- The **dialogue player** is the core component: line by line reveal, speaker chips, tap or space to advance, keeps place per scenario, reset, aria-live readout, reduced motion still shows the full script. It carries all nine scenarios.
- The method's signature move gets its own component: the **repeat back card** (flat to full, tap to flip) in scenarios 1 to 3, 5, and 9.
- **Harm banners** (static, not behind a tap) for the four that name the harm first: 5, 6, 7, 9.
- One bespoke interactive where the content earns it: the tappable **readiness scale** (3), the **qualities board** plus flips (4), the **three way choice** (6, the only scenario with a right answer), **fact or stereotype** (7), the **dare filter** (8).
- The original six method menu in `plans.md` section 2 was designed for placeholder content. The real content keeps the flip idea (4) and the branching idea (6), and retires matching, sequencing, perspectives, and the poll.
- **Mobile first:** single column below 720px, 44px targets, the dialogue player's next line button is a large fixed thumb button, jump strip scrolls horizontally, checkpoints at 390x844 (primary) and 1920x1080.

**Content issues flagged for Paul or the committee:** scenario 9 mislabeled line (student 1 where student 2 should be), scenario 6 garbled line ("Not knowing why we teach it."), scenario 5 "I just stopped being hungry" kept as written pending confirm, scenario 8 "G:" reads as the group, em dashes throughout the committee text (converted at transcription), and the tab label MS/HS vs MYP/DP.

**Not yet changed (wait for sign-off):** `plans.md` (methods table, build order, reward table), `CLAUDE.md` (the six scenario lines), the tab strip in `index.html`, and `js/progress.js` reward mechanics.

**Verified:** docs only; tests unaffected (34/34, unchanged).

**Next:** Paul signs off or amends the presentation plan and answers the four questions in `scenarios.md`, then `plans.md` and `CLAUDE.md` update and the build order restarts: two tab shell plus jump chips, the dialogue player, then the scenarios one at a time.

### 2026-10-15 (move: dei becomes a path on the main site)

**Asked:** the page should live at `contrapaul.com/dei/` instead of `dei.contrapaul.com`; move the directory into `contrapaul-main-directory`.

**Changed:**

- Moved the whole `dei/` directory (it had no git of its own, entirely local) from `GitHub/dei` to `GitHub/contrapaul-main-directory/dei`. It will deploy as part of the contrapaul site, straight from source, no build step.
- `plans.md`: deploy step and the settled domain line now say `contrapaul.com/dei/`, with the change dated.
- `brief.md`: the settled open-question answer carries a 2026-10-15 update note.
- **No code changes needed:** every asset path in `index.html` is relative (`css/...`, `js/...`) and routing is hash-only (`#/s1` to `#/s6`), so the page is path-agnostic. The footer link to `https://contrapaul.com` now points at the parent site, which reads naturally.
- Side effect to note: the page now shares the main site's origin and localStorage. All keys are `dei-`-prefixed (`dei-lang`, `dei-theme`, `dei-mode`, and later `dei-progress`), so nothing collides.

**Verified:** 34/34 tests pass from the new location.

**Unverified:** nothing new. Note for the record: earlier entries say "35/35"; the suite currently reports 34 (no failures, the count drifted when a test was merged).

**Next:** unchanged. Step 3, scenarios one at a time, starting with flip cards (tab s1), still gated on Paul's scenario content and the recommended-move vs open-facilitation decision.

### 2026-10-14 (pivot: survey out, six scenario tabs)

**Asked:** the survey is covered elsewhere, so remove it; the page becomes six tabs, one per scenario.

**Changed:**

- `index.html`: the introduction panel and its two screens are gone; the tab strip is now six scenario tabs (Scenario 1 to 6, 情境一到六) and each panel holds one placeholder `data-screen` carrying the scenario's method tag (flip cards, matching, sequencing, perspectives, branching, room poll).
- `js/tabs.js`: routes are `#/s1` to `#/s6`, default `s1`. **Bug found by the tests and fixed:** `tabFromHash()` split on `/` and `?` but deep links carry their target after a `#` (`#/s4#step-2`), so any deep link fell back to the first tab. It now splits on `#` too.
- `css/base.css`: the tab strip scrolls horizontally on narrow screens (six tabs do not fit a phone header), tab links no longer shrink.
- `test/shim.mjs` + `test/tabs.test.mjs`: environment default is the first active panel; the tabs tests now cover six tabs, the deep link switch + scroll, and the unknown-route fallback.
- `plans.md`: the Tab 1 and survey sections are removed (methods 1 to 9 and the effects showcase go with them), the page is described as six scenario tabs, the build order is six steps, and the pivot is recorded in the decisions section.
- `brief.md`: a Pivots section records the change; the superseded open question is marked, the rest of the brief stands.
- `CLAUDE.md`: the reward and audience lines now say all six scenarios.

**Verified:** 35/35 tests pass after the restructure.

**Unverified (needs a browser):** the six-tab strip at 390x844 (scroll behaviour, active tab visibility) and 1920x1080.

**Next:** step 3, scenarios one at a time, starting with flip cards (tab s1): `data/scenarios.js` placeholder content, `js/scenarios.js` components, `css/scenarios.css`, each with keyboard path, aria, reset, reduced motion still, discussion element, placeholder image frame, 390px pass.

### 2026-10-14 (step 2: screen engine)

**Asked:** proceed to step 2 after Paul settled the open decisions in plans.md (deep teal, tap/click only, all nine survey methods into tab 1, workshop screen out of scope).

**Built:**

- `js/screens.js`: the screen engine. `data-screen` sections are the grid; ArrowUp/ArrowDown, PageUp/PageDown and Space step between them and land on the screen top (nothing straddles). Typing guards for inputs, contenteditable, `[data-keys-live]`, plus a Space-only guard for focused buttons and links. Reveal choreography: `[data-reveal]` elements fade and rise in DOM order, 60ms stagger, replayed on re-entry, instant under reduced motion and presenter mode. Progress rail: one dot per screen of the active tab, passed/current states, 44px hit areas, rebuilt on tab change. Presenter strip: prev / next and the live screen title. `dei.screens.audit()` reports screens taller than the viewport.
- `js/mode.js`: presenter mode. Enlarges type (tokens), zeroes the motion budget, hides the rail, replays the current screen instantly. Persists `dei-mode`, applied before first paint by the pre-paint snippet.
- `index.html`: presenter toggle in the header, the strip, `data-reveal` on the placeholder screens, `<noscript>` reveal fallback, the `js` class and mode in the pre-paint snippet.
- `css/base.css`: rail dots, strip, reveal choreography, presenter mode hiding the rail.
- `test/shim.mjs` extended (layout stubs, active element, listeners); `test/screens.test.mjs` (14 tests) and `test/mode.test.mjs` (5 tests) added.

**Verified:** 35/35 tests pass. Covers: current screen rule, reveal play/reset, stepping forward and back including both ends, all four typing guards, rail build and dot clicks, strip buttons, audit offenders and clean page, mode on/off/persistence and bilingual labels.

**Bugs found by the tests, fixed:** `Array.prototype.push()` with no arguments records nothing (the shim's scroll counter silently never incremented, masking broken navigation); the mode label pair was on the `<button>` where i18n's apply would have wiped the inner label span (moved to the span); `goTo` did not reset the previous screen's reveals (unified through `switchCurrent`).

**Unverified (needs a browser):** smooth scroll feel and snap behaviour, the strip and rail at 390x844 and 1920x1080, reveal timing by eye, and `dei.screens.audit()` against the real 720p viewport.

**Next:** step 3, the survey. `data/survey.js` placeholder data, all nine methods as one screen each in tab 1, count-ups, still versions. Checkpoint: swap the data to a different shape and every method still renders.

### 2026-10-14 (scaffold)

**Asked:** build step 1 of plans.md, the scaffold, after Paul settled the brief's open questions.

**Built:**

- `index.html`: header (brand, two hash-routed tabs, language and theme toggles), rail shell, tab 1 with two placeholder `data-screen` sections, tab 2 with one, the exact footer from the brief in both languages.
- `css/tokens.css`: spacing/type/motion/shape tokens, light and dark themes (all colour in one file), the two accent candidates with teal as working default behind a one-line flip, a `data-mode="presenter"` scale hook for step 2.
- `css/base.css`: reset-lite, header, tab strip, `.screen` grid (100svh, `scroll-snap-align: start`, `scroll-snap-type: y proximity` on `main`), `.ph-tag`/`.ph-box` placeholder discipline, rail shell (hidden below 720px), footer, `prefers-reduced-motion` stills, 44px touch targets.
- `js/theme.js`: light/dark with stored choice over OS scheme, follows the OS until a manual toggle, exposes `window.dei.theme`.
- `js/i18n.js`: applies `data-en`/`data-zh` pairs, persists `dei-lang`, toggle shows the language you would switch to, exposes `window.dei.i18n` with a `t(pair)` helper for later steps.
- `js/tabs.js`: `#/intro` and `#/scenarios` routes, `hashchange` handling, deep link target scroll (`#/scenarios#id`), `window.dei.tabs.go(tab, targetId)`.
- `CLAUDE.md`: house rules for the repo, each with its why.
- `package.json` + `test/`: `node --test` suite (16 tests, all passing) with a small DOM shim (`test/shim.mjs`) that runs the plain browser scripts in a sandbox, following the `node --test` pattern from `edu/ai` and `make/localai`. Covers i18n apply/toggle/persistence/missing-pair safety, tab routing and deep links, and theme resolution/toggle/OS-following.

**Decided and why:**

- **Plain scripts, no ES modules; strings in `data-en`/`data-zh` attributes instead of `data/i18n.json`.** Both the module form and `fetch()` fail on `file://`, and brief rule 5 requires the page to run from a file system. This deviates from plans.md section 1's file tree; the pair shape and the "no string without a pair" rule are unchanged, and content data for later steps should follow the same pattern (plain `.js` data files or attributes, not fetched JSON).
- **Teal is the working accent.** The decision is still open (plans.md section 9); `tokens.css` keeps both candidates and the switch is one line.
- **`scroll-snap-type: y proximity` set in the scaffold** rather than waiting for step 2, because the `.screen` grid is the scaffold's job and snap is part of the grid. The arrow key engine itself is step 2.

**Verified:**

- Logic: 16/16 tests pass (`node --test`), covering i18n, tabs and theme behaviour listed above.
- AA contrast: all 17 text/background pairs in both themes measured, every one at or above 4.5:1 (weakest is 4.97).

**Unverified (needs a browser):**

- No flash on theme or language for a *returning* visitor with stored values (pre-paint snippet read, not observed).
- Layout at 390x844 and 1920x1080 not eyeballed yet.
- `file://` behaviour asserted from spec (modules/fetch fail there), not run.

**Next:** step 2, the screen engine (`js/screens.js`): arrow key stepping, current-screen detection, progress rail dots, reveal choreography, presenter mode, and the height check script. Its checkpoint gates everything else.

## Paul's standing requests

- Fill placeholder content later; keep `.ph-tag` labels and content apart from machinery.
- The explorer reward is earned by engaging every interactive element of tab 2, never by scrolling.
- Accent (deep teal) and tap/click interactions are settled. Facilitation style (revealed "recommended move" vs open) waits for the finalized content.
