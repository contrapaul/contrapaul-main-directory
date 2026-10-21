# HANDOFF

Working notes for the next session. Newest entry first. Paul's standing requests go at the bottom.

## Status at a glance

- **Pivot carried (2026-10-14):** the survey element is out of scope (covered elsewhere) and the introduction tab goes with it. The page is now six tabs, one scenario each. All docs and code updated to match.
- **Steps 1 and 2 of 6 done.** Scaffold (now six scenario tabs, theme, EN/中文, footer) and the screen engine (arrow key stepping, rail, reveals, presenter strip, presenter mode, height audit). 35/35 tests passing, all colour pairs AA-verified.
- Steps 3 to 6 not started: scenarios one at a time, explorer reward, polish, deploy.
- Decisions settled 2026-10-14 (plans.md section 7): accent is deep teal; methods 2 and 3 are tap/click only (no drag, for phones).
- Still open: whether scenarios carry a revealed "recommended move" or stay open facilitation. Paul revisits once the finalized content is in place.

## Entries

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
