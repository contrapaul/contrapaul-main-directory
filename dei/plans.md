# DEI training page: build plan

Written 2026-10-14. Implements `brief.md`. Proposes options where Paul should decide. The "cloned from" column points at real files in sibling repos; anything not listed is new code.

## 0. Retarget 2026-10-15 (Paul reviewed the live page)

Paul went through the built page and issued a retarget. These five notes are now the top of the list and override anything below that conflicts with them. They are recorded here and in `HANDOFF.md` (Paul's prompt is quoted verbatim in the handoff as a check on future progress). **No code has been changed yet** — a fresh session picks this up. Steps 5 and 6 (polish, deploy) do not start until this retarget is done.

1. **Too much dead space; content must be far more compact.** On a phone a viewer can end up looking at almost nothing but background. The per-scenario four-`data-screen` split (header / player / pieces / closing) is one cause: it spreads thin content across full-viewport screens. Re-tighten so a phone screen is filled with content, not background. This changes the screen-splitting discipline in §1 ("content is split, not shrunk") — compactness now wins over the one-viewport-per-screen rule.
2. **The tap-to-advance "next line" dialogue player is the wrong implementation.** The conversation should print in / reveal automatically when the scenario starts, not require 18+ taps/clicks to read. Redesign the dialogue player to auto-reveal (a readable auto-scroll or timed reveal of the whole script), not a per-line tap gate. This affects component 1 in §2 and its "reaches its last line" reward criterion in the explorer table.
3. **MS/HS (tab two) does not work at all — nothing loads.** This is a blocking bug, not polish. The tab, its jump strip, and scenarios 5 to 9 render nothing. Investigate and fix before anything else ships. (Unit tests pass 55/55, so this is a runtime/browser path the node suite does not cover — the browser verification pass in §6 was never run, and this is what it would have caught.)
4. **The scenarios are meant to be *shown* to staff, not reworked into discussions or activities.** The build drifted: several components rework the committee scripts into interactive exercises that do not actually carry the content. **PYP scenario 4 is the strong example of drifting far from the intended outcome** (the qualities board + four flips + boundary card replaces the script the committee wrote). Retarget the components to present the actual script/content to staff; drop or drastically simplify the interactive reworkings that bury the content. This hits §2's component list (especially the bespoke pieces: s4 board, s6 three-way choice, s7 fact/stereotype, s8 dare filter) and the "debrief card" framing.
5. **This is no longer presentation-first; presenter mode and its features are dropped.** Remove `js/mode.js`, the presenter mode toggle, the presenter strip, presenter stills, presenter 1.25x scale, and any feature built around being a presentation. The page is a read-on-your-phone reference for staff, not a projector deck. This removes presenter mode from §1 (screen grid, rail, controls), §2 (component stills), §3 (type scale, motion), §4 (the `edu/ai/js/mode.js` clone row), and the reward mechanics in §2 (the reset-from-presenter-strip control).

**What still stands after the retarget:** the two-tab (PYP / MS/HS) nine-scenario structure, EN/中文 parity, the deep-teal accent, `file://`-safe plain scripts, AA contrast, reduced-motion stills, and the explorer reward (its mechanics survive; its "reaches last line" criterion for the player may change with note 2, and the reset control moves or is dropped with presenter mode per note 5). The zh `示例` placeholders still await the real translation.

## 1. Architecture

```
dei/
  index.html            the whole page: two tabs holding nine scenarios
  css/tokens.css        design tokens, both themes            (pattern: make/localai/css/tokens.css)
  css/base.css          layout, screens, tab strip, effects   (pattern: make/localai/css/base.css + tabs.css)
  css/scenarios.css     scenario interaction components
  js/theme.js           theme resolve + toggle                (clone: make/localai/js/theme.js, adapted)
  js/i18n.js            EN/中文 apply + toggle
  js/tabs.js            #/pyp and #/mshs hash routes
  js/screens.js         screen grid, arrow key nav, reveals
  js/mode.js            presenter mode
  js/scenarios.js       renders the nine scenarios and their components
  js/progress.js        explorer reward completion tracking
  data/scenarios.js     committee scenario content, one object per scenario, en/zh pairs
  CLAUDE.md             house rules for this repo
  HANDOFF.md            kept current per the site-wide rule
```

One page, two tabs, two languages, nine scenarios (changed 2026-10-15 from six tabs, one per scenario: the committee delivered nine scenarios in two groups). Tab one is PYP (scenarios 1 to 4), tab two is MS/HS (scenarios 5 to 9). Each tab is a long page; a sticky jump strip of scenario chips sits under the header and scrolls to any scenario. Tabs are a hash route (`#/pyp`, `#/mshs`), the same mechanism as `make/localai` (its `css/tabs.css` plus the `data-tab-link` markup in `index.html` is the reference). The hash survives refresh and deep links, which is what the "navigation links that take visitors to specific locations" need: a link is `#/pyp#sc3` or a JS call that switches tab then scrolls to the target id. Mobile is the primary platform (most staff open it on phones): single column under 720px, 44px touch targets, the dialogue player's next line button is a large fixed thumb control.

### English / 中文 (`js/i18n.js`)

The toggle is built from day one and built 100% (brief extras item 1): it is a real, complete EN/中文 switch, not a stub. Since all content is placeholder at this stage, every string ships with a genuine Simplified Chinese placeholder sentence (e.g. `示例：场景标题`) beside its English one, so the zh path is exercised end to end now and only the wording is replaced when the real translation arrives.

- Every user facing string exists in both languages. Content strings (scenario copy, prompts, takeaways) live in data objects as `{"en": "...", "zh": "..."}` pairs. UI strings (buttons, kickers, method tags, aria labels, the footer) live in the HTML as `data-en`/`data-zh` attributes on each element.
- **Why attributes instead of a fetched `data/i18n.json`:** brief rule 5 requires the page to run from `file://`, where `fetch()` fails (and ES modules do too). So this repo uses plain scripts throughout, and all data lives in HTML attributes or plain `.js` data files. The pair shape and every other rule below are unchanged. (Settled 2026-10-14 during the scaffold.)
- `js/i18n.js` applies the active language by swapping `textContent` from the pair, stores the choice in `localStorage` (`dei-lang`, default `en`), and resolves before first paint with the same bootstrap script as the theme so a returning Chinese reader never sees an English flash. A missing pair never blanks the page: the visible text is left as-is.
- Later steps resolve content pairs through `window.dei.i18n.t(pair)` so the "no string without a pair" rule has one enforcement point.
- The toggle sits in the header next to the theme toggle, showing the language you would switch to (`中文` in English mode, `EN` in Chinese mode).
- Layout must survive both languages: Chinese is compact, so screens gain whitespace rather than breaking. Any layout that depends on English line length gets a check at `zh`. A rule in `CLAUDE.md`: no string is added to any file without its pair, English or Chinese.
- When the real Chinese translation arrives, only the `zh` halves of the pairs change. Nothing structural moves.

### The screen grid and arrow key navigation (`js/screens.js`)

This is the highest risk requirement, so it is designed first.

- Every full viewport section in every tab carries `data-screen`. That attribute is the grid. Nothing else counts.
- Screens are laid out with `min-height: 100vh` (or `100svh` on mobile) and `scroll-snap-align: start` on the scroll container, with `scroll-snap-type: y proximity` (not `mandatory`: mandatory snap fights free scrolling and the brief says normal scrolling must work).
- Arrow key handler: on ArrowDown/ArrowUp (and PageDown/PageUp, and Space when not in an input), find the current screen (the one whose top is closest to, but not more than half a viewport below, the viewport top), then scroll the next/previous `data-screen` into view with `scrollIntoView({behavior:'smooth'})`.
- **No straddling, guaranteed by construction:** because screens are at least one viewport tall and aligned to the top, landing on a screen always shows its full top. The only way to straddle is content taller than the viewport. Rule for authors: a screen's content must fit one viewport at 1280x720 (the projector case). Anything that cannot fit (a long scenario) is split into multiple screens (`data-screen` on each part, with a "continued" kicker, exactly the way `curriculum/presentation.js` splits content across slides). A build check script verifies this: it measures each `data-screen`'s offsetHeight against the viewport in a headless pass and reports offenders.
- **Typing safety:** the handler early-returns when `document.activeElement` is an `input`, `textarea`, `select`, `contenteditable`, or inside any `[data-keys-live]` element (the interactive scenarios opt in). This is the same guard trivia uses for keyboard input.
- A thin progress rail on the left (pattern: `edu/ai/js/rail.js`, one dot per screen, fills as you pass, dots are clickable) shows position and doubles as the in-page navigation link list. The rail hides in presenter mode.
- Presenter controls: on screen, in a small corner strip, "prev / next" buttons plus the current screen title. Presenter mode toggle (top right) enlarges type to the teacher-mode scale from `edu/ai/js/mode.js` and switches all animations to their still versions.

### Reveal choreography ("elements loading in")

- Inside each screen, elements carry `data-reveal` with an implicit order (DOM order). `js/screens.js` watches the active screen (IntersectionObserver, threshold 0.6) and plays the sequence: each element fades and rises 12px, 60ms stagger, 350ms ease. Only the active screen plays reveals; when the presenter moves on, the next screen plays on arrival.
- This is the same "elements load in as the reader scrolls" pattern as `edu/ai` (see `edu/ai/showcase-plan.md` and the `after-typed` class sequencing in `edu/ai/index.html`), minus GSAP: the page is small enough that CSS transitions plus one IntersectionObserver are the right tool. No vendored GSAP in this repo. (Decision: keep dependencies at zero. `edu/ai` uses GSAP because it has canvas rain and scrubbed timelines; nothing here needs it. If a later effect genuinely needs it, vendor it in `js/vendor/` like `edu/ai/js/vendor/`.)
- Reduced motion and presenter mode: reveals become instant, everything visible immediately.

## 2. Scenarios

The committee content arrived 2026-10-15 as nine scenarios in two groups (PYP, MS/HS). Provenance, per Paul: the committee used unedited AI output; staff review it in their meeting that same night. The Chinese translation follows the same order: a preliminary translation before the meeting, the final one after the text is locked. Until then every zh pair in `data/scenarios.js` is a `示例` placeholder, so the 中文 switch is exercised end to end with stand-in text.

Each scenario is a section of its tab page (deep link `#/pyp#sc3`), built as four `data-screen` screens: a header screen (kicker "scenario N of 9", method tag, harm banner or tone tag, context, **placeholder image** in a fixed 16:9 frame labelled "placeholder image"), a second screen with the dialogue player or the method piece, a third with the method pieces that need room, and a closing screen with the rule stamp and the debrief. A sticky jump strip of scenario chips tops each tab, with a completion mark per scenario. `data/scenarios.js` holds all copy as en/zh pairs (plain script, per the i18n note); the HTML shells are thin, so the staff review edits are data swaps, not code changes.

### Scenario components (settled 2026-10-15 from the committee content)

The six proposed methods from the scaffold (flip, match, sequence, perspectives, branching, poll) are retired; the content decided the shape. What the nine scenarios use:

1. **Dialogue player** (the core; every scenario except s4): the committee script, line by line, speaker chips (Teacher / Student 1 / Student 2 / Group), tap or space for the next line, a progress count, and a reset so the presenter can replay. `aria-live` announces each line. The player area carries `data-keys-live` so the arrow keys never hijack it. Reduced motion: the full script shows at once and one tap ("I have read the script") earns the player element, so the reward is still earned, never given.
2. **Readiness check, three shapes**: a static chip with the script's number (s1: 6, s2: 5, s9: 5); an interactive 1 to 10 scale with banded guidance (s3: 1 to 3 "give it time", 4 to 5 "a little time", 6 and up "talk now", and the script's own path 4 then 6 is shown, because the wait is the lesson); a branch of three choices (s5: wait / go slow together / mediate now, where "go slow together" matches the script and reveals its resume line).
3. **Repeat back card**: the flat repeat ("That she doesn't like that name.") flips to the full repeat ("You feel disrespected because you asked me to stop and I didn't."). Used in s1, s2 (twice), s3, s5, s9.
4. **Harm banner** (s5 to s7, s9): a static banner that names the harm before the script starts ("no Japanese students in the room. That's the point."). s8 carries a tone tag instead ("light, not alarmed").
5. **Rule stamp**: the going forward rule, stamped at the end of the scenario (all except s6 and s7, which close on a different beat).
6. **Debrief card**: the committee's discussion note, revealed on tap (the discussion element the brief requires). s3 has no committee note, so its card is a labelled placeholder until staff write one.
7. **Bespoke pieces**: a qualities board with chips plus four flip cards and a boundary card (s4, the guided discussion); the three way choice where only one option is right (s6, the only scenario in the set with a right answer); the fact or stereotype card plus the forward move task card (s7); the dare filter, four cards each judged keep or cut against the script's verdict (s8).

Every component has: a keyboard path, an `aria` story, a still version for reduced motion and presenter mode, and no state that depends on colour alone. Where the script calls out a facilitation note (s2 "one or two of the group, not a crowd", s5 the weight of body comments, s9 the tossed around word), it ships as a static note card beside the piece it belongs to.

### The explorer reward, earned not given

The reward exists only for genuine completion of all nine scenarios (Paul's rule, 2026-10-14; retabulated 2026-10-15 when the content arrived): scrolling a tab or opening it earns nothing. Every interactive element must be engaged:

| Scenario | Element counts as done when |
|----------|------------------------------|
| 1 unkind nickname | the player reaches its last line, the repeat back card is flipped, the debrief is opened |
| 2 excluded at recess | the player reaches its last line (the pause note hangs in the script), both repeat back cards are flipped, the debrief is opened |
| 3 "don't go play with [name]" | the readiness scale is tapped, the player reaches its last line, the repeat back card is flipped, the debrief is opened |
| 4 "a boy should lead" | all four qualities are added to the board, all four quality flips are turned, the boundary card is revealed, the debrief is opened |
| 5 body shaming | the readiness branch is chosen, the player reaches its last line, the repeat back card is flipped, the debrief is opened |
| 6 Hitler salute | the player reaches its last line, the three way choice is made, the debrief is opened |
| 7 racist remarks | the player reaches its last line, the fact or stereotype card is answered, the debrief is opened |
| 8 truth or dare | the player reaches its last line, all four dares are judged keep or cut, the debrief is opened |
| 9 "you're so gay" | the player reaches its last line, the repeat back card is flipped, the debrief is opened |

Mechanics:

- `js/progress.js` exposes `markDone(scenarioId, elementId)`. Each component calls it the moment its element is engaged (not when the scenario ends). Each jump chip shows a completion mark when all of its scenario's elements are done; each tab link gains a mark when every scenario in that tab is done; the jump strip doubles as the completion scoreboard (the progress rail still tracks the screens within the active tab).
- State persists in `localStorage` (`dei-progress`), so a staff member who works the scenarios on their phone over the week still earns it, and a presenter can reset room progress from the reset button in the presenter strip to replay a session with a new group.
- When the last outstanding element is marked, the celebration plays once (a 12 spark burst, the adapted idea from `make/localai`), the badge appears in the header reading "All nine scenarios", and it stays on for that browser until reset. Reduced motion version: the badge appears, no burst. Work completed in earlier visits shows the badge without replaying the celebration.
- Nothing about it is announced as a prize in the page copy. The marks quietly fill; the reward is a small pleasure for the thorough, not a goal the room chases.

## 3. Styling and polish

- **Tokens first.** `css/tokens.css` defines the palette, type scale, spacing, radii, motion durations. Two themes via `data-theme` on `<html>` (light is default, dark is the projector option). The pre-paint bootstrap script from `make/localai/index.html` (first `<script>` in head, resolves theme from hash then `localStorage` then `prefers-color-scheme`) is cloned so there is no flash.
- **Palette direction:** quiet. Warm neutral background, one confident accent (deep teal, settled 2026-10-14), a second accent for the "reveal" moments (green for locked/correct, amber for caution, red reserved for the one genuinely bad move in a scenario). No gradients on text, no glassmorphism. The ambient mesh blobs from `make/localai` (`css/base.css`, four blobs, 60s drift) are available as an optional background texture; they default to off in presenter mode and under reduced motion.
- **Type:** system stack (brief rule: nothing from another host). Large scale: screen titles 44 to 56px, body 18px minimum, presenter mode multiplies by 1.25. Line length capped at 65ch. The system stack covers CJK gracefully (PingFang SC on Apple, Microsoft YaHei on Windows falls out of the generic sans-serif slot); `data-lang="zh"` may nudge line-height up 0.05 for CJK comfort, nothing more.
- **Two platforms, one page** (brief extras item 3): every scenario tab is worked on the phone and presented in the staff room. Concretely: scenario components are single column and thumb reachable below 720px wide, touch targets at least 44px, no hover-only reveals (every hover state has a tap equivalent), and the arrow key engine simply coexists with touch scrolling on phones. Checkpoint at 390x844 and at 1920x1080 for every scenario.
- **Footer** (brief extras item 2), both languages, exactly: `a project by mr. k, more at contrapaul.com` with `contrapaul.com` linked, and the 中文 pair as a `data-zh` attribute beside it. No capitalization, no tagline.

- **Motion budget:** 200 to 400ms for state changes (flips, locks), 350ms staggered for reveals, 800ms for data growth. Everything else still. Easing is one curve (`cubic-bezier(0.22, 1, 0.36, 1)`), defined once in tokens.
- **Legibility rule** (from `trivia/CLAUDE.md`, adopted into this repo's `CLAUDE.md`): every screen must be legible from the back of the room. Check at 1280x720 and at presenter-mode scale.
- **Writing rules** adopted verbatim: no em dashes, no double titling, no AI tells, grade 8 to 10 vocabulary (sources: `make/localai/style-guide.md` sections 2 and 3, `edu/ai/style.md` writing rules).
- **Accessibility:** WCAG AA contrast in both themes, full keyboard path through every scenario, focus visible (2px accent outline, offset), screen reader announcements for state changes, `prefers-reduced-motion` still versions, no content that depends only on colour (every state change also changes an icon or a word).

## 4. What is cloned, what is adapted, what is new

| Item | Source | Treatment |
|------|--------|-----------|
| Pre-paint theme bootstrap | `make/localai/index.html` (head script) | Cloned, storage key changed to `dei-theme` |
| Tab strip markup + CSS | `make/localai/index.html` (`.tabs`, `data-tab-link`) and `make/localai/css/tabs.css` | Adapted to two tabs (PYP, MS/HS), horizontally scrollable on phones |
| Theme toggle button (sun/moon SVG) | `make/localai/index.html` header | Cloned |
| Explorer badge + particle burst | `make/localai/index.html` (`.badge-explorer`, `.celebrate`) | Adapted: "All scenarios explored" reward |
| Card styles (flip card face, locked state) | `edu/tools/cards.html` | Chosen style's CSS block copied in (the catalogue is written for this) |
| Stamp-slam + shake feedback | `edu/ai/js/compare.js` + `edu/ai/showcase-plan.md` screen 3 | Adapted, smaller |
| Progress rail | `edu/ai/js/rail.js` + `edu/ai/css/site.css` | Adapted: one dot per `data-screen` |
| Teacher/presenter mode | `edu/ai/js/mode.js` + `.mode-banner` in `edu/ai/index.html` | Adapted to "presenter mode" |
| Reveal sequencing pattern | `edu/ai/index.html` (`after-typed` classes), `edu/ai/showcase-plan.md` | Re-implemented without GSAP (CSS + IntersectionObserver) |
| Screen-splitting discipline ("content is split, not shrunk"; "continued" kickers) | `edu/curriculum/presentation.js` + `dp/presentmode.md` | Adopted as authoring rule + the height check script |
| Sorting interaction feel (methods 2/3 are tap/click, no drag) | `edu/curriculum/drag-sort.js` (dp pages) | Reference for feel only; mechanics are new |
| Presenter-entered tallies (method 6) | `trivia` (score entry from the presenter's device) | Pattern only; implementation is new and simpler |
| Arrow key input guards | `trivia` keyboard handling | Pattern adopted into `js/screens.js` |
| Style/writing rules | `make/localai/style-guide.md`, `edu/ai/style.md`, `trivia/CLAUDE.md` | Adopted into `dei/CLAUDE.md` |

New code (no clone source): `js/screens.js` (screen grid + arrow nav), `js/mode.js` (presenter mode), the scenario renderer and its components in `js/scenarios.js`, `js/progress.js` (explorer reward), the jump strips.

## 5. Build order

0. **Retarget (active, 2026-10-15).** Resolve §0: fix the MS/HS load bug (note 3), compact the per-scenario layout (note 1), redesign the dialogue player to auto-reveal (note 2), rework components to present the actual script rather than bury it in activities (note 4, s4 first), and strip presenter mode and its features (note 5). This gates steps 5 and 6.
1. **Scaffold.** `index.html` (six scenario tabs, header, rail shell, footer), `css/tokens.css`, `css/base.css`, `js/theme.js`, `js/i18n.js`, `js/tabs.js`, `CLAUDE.md`, `HANDOFF.md`. Checkpoint: tabs switch, theme toggles with no flash, EN/中文 toggle swaps every UI string with no reload and no flash, both themes AA in both languages. **Done 2026-10-14; see HANDOFF.md for the unverified items.**
2. **Screen engine.** `data-screen` on 3 test screens, arrow key nav, snap, progress rail, reveals, presenter mode, height check script. Checkpoint: arrow keys never land mid-screen on a 720p and a 1080p viewport; typing in a test input is unharmed. **This checkpoint gates everything else.** **Done 2026-10-14: `js/screens.js` + `js/mode.js`, 35/35 tests; browser-verified items listed in HANDOFF.md.**
3. **Scenarios and components.** `data/scenarios.js` (all nine, en/zh pairs), `js/scenarios.js` (renderer plus the components in §2), `css/scenarios.css`, the two tab panels with jump strips in `index.html`, `js/tabs.js` retargeted to `#/pyp` and `#/mshs`. **In progress 2026-10-15:** code and unit tests are written (55 node tests, all passing); the browser checklist for each scenario (keyboard path, aria, still versions, 390px phone pass, 1280x720 screen fit) is not yet run and is listed in HANDOFF.md.
4. **Explorer reward.** `js/progress.js`, per-element completion, jump chip and tab marks, persistence, reset control in the presenter strip, one-time celebration. **Written 2026-10-15,** unit tested; the checkpoint (opening the tabs and scrolling earns nothing; every element in any order earns it exactly once; reset clears it) is verified in the node tests, the browser pass is not yet run.
5. **Polish pass.** Motion budget audit, contrast audit at both scales, phone pass (390x844, primary), widescreen pass (1920x1080), zh layout pass, final reduced-motion pass.
6. **Deploy.** Lives at `contrapaul.com/dei/` inside the contrapaul site (this repo is now a subdirectory of `contrapaul-main-directory`), straight from source, no build step. Changed 2026-10-15 from `dei.contrapaul.com` at Paul's request.

## 6. Verification checklist (per scenario and per screen)

- [ ] Arrow key from the previous screen lands with the full top of this screen visible at 1280x720 and 1920x1080
- [ ] Content fits one viewport at 1280x720 (height check script passes)
- [ ] Reveal order reads as a sequence, not a flood (60ms stagger visible)
- [ ] Full keyboard path, no mouse needed
- [ ] `aria-live` announces state changes; flip cards announce face shown
- [ ] Reduced motion: everything visible, nothing moves, nothing hidden behind an interaction that animated away
- [ ] Presenter mode: type 1.25x, effects still, legible from 5 metres at 720p
- [ ] No network request after load (DevTools network tab empty on refresh)
- [ ] Fully usable at 390x844 with touch: every interaction tappable, no hover-only state, 44px targets
- [ ] Every visible string has a zh pair; toggle swaps without reload; layout holds in both languages
- [ ] No em dashes anywhere in the file

## 7. Decisions waiting on Paul

Pivot (2026-10-14, Paul): the survey element is out of scope because it is covered elsewhere; the introduction tab goes with it. The page is the six scenarios, one tab each. The effects showcase screen is out with them; the celebration burst still fires for the explorer reward. The earlier settled item "all nine survey methods into tab 1" is void.

Settled from the brief (2026-10-14): domain is `contrapaul.com/dei/` (was `dei.contrapaul.com`, changed 2026-10-15); the scenarios each carry a placeholder image and a discussion element (the count moved to nine on 2026-10-15); presenter uses a keyboard (or an assistant); the explorer reward stays but is earned by engaging every interactive element of all nine scenarios, never by scrolling (§2, The explorer reward).

Settled (2026-10-15, from Paul): the tab pair is **PYP and MS/HS** (not MYP/DP); the nine committee scenarios are unedited AI output and staff review them the same night, so the build keeps all copy in `data/scenarios.js` to make the review edits data swaps; the Chinese translation runs preliminary (before the meeting) then final (after the text locks), and every zh pair is a `示例` placeholder until then; scenario 6's garbled line keeps its existing words with asterisks and a "(Fix text)" note; scenario 5's "I just stopped being hungry." stays as written; the explorer reward is retabulated for nine (§2).

Settled (2026-10-14, from Paul's answers written in this file):

1. **Accent colour: deep teal.** Already the working default in `css/tokens.css`; the terracotta candidate stays in tokens as a one-line flip in case of regret.
2. **Methods 2 and 3: tap/click only**, no drag, for phones. `drag-sort.js` is a feel reference, not a clone.

Answered by the content (2026-10-15, question 3): the committee scripts carry their own recommended moves in the data. The s5 branch and the s6 three way choice mark the option the script follows, and the s7 fact card names the correct answer. If the staff review decides a scenario should be purely open facilitation, the mark is a data change, not a code change. 