# DEI training page: build plan

Written 2026-10-14. Implements `brief.md`. Proposes options where Paul should decide. The "cloned from" column points at real files in sibling repos; anything not listed is new code.

## 1. Architecture

```
dei/
  index.html            the whole page, six scenario tabs
  css/tokens.css        design tokens, both themes            (pattern: make/localai/css/tokens.css)
  css/base.css          layout, screens, tab strip, effects   (pattern: make/localai/css/base.css + tabs.css)
  css/scenarios.css     scenario interaction components
  js/theme.js           theme resolve + toggle                (clone: make/localai/js/theme.js, adapted)
  js/i18n.js            EN/中文 apply + toggle
  js/tabs.js            #/s1 ... #/s6 hash routes
  js/screens.js         screen grid, arrow key nav, reveals
  js/mode.js            presenter mode
  js/scenarios.js       the six scenario components (flip, match, ...)
  js/progress.js        explorer reward completion tracking
  data/scenarios.js     placeholder scenario content, one object per scenario, method tagged
  CLAUDE.md             house rules for this repo
  HANDOFF.md            kept current per the site-wide rule
```

One page, six tabs, two languages. One tab per scenario (pivot 2026-10-14: the survey element and the introduction tab are out; the survey is covered elsewhere). Tabs are a hash route (`#/s1` to `#/s6`), the same mechanism as `make/localai` (its `css/tabs.css` plus the `data-tab-link` markup in `index.html` is the reference). The hash survives refresh and deep links, which is what the "navigation links that take visitors to specific locations" need: a link is `#/s3#step-2` or a JS call that switches tab then scrolls to the target id.

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

Pivot 2026-10-14: the survey element and the introduction tab are out of scope; the survey is covered elsewhere. The page is the six scenarios, one tab each.

Six scenarios ship as placeholders, one per method, so the range is demonstrable (brief open question 3: 6 scenarios, each with an image and a discussion element).

Each scenario is a tab (`[data-tab-panel="s1"]`, hash route `#/s1`) containing one or more `data-screen` sections. Every screen has a consistent header (kicker "Scenario 1 of 6", title, a method tag like "flip cards" so the range is visible), a **placeholder image** in a fixed 16:9 frame (labelled "placeholder image", a neutral SVG scene so it is obvious it will be swapped; the frame keeps the layout stable when the real photo arrives), and a body that uses one of the methods below. `data/scenarios.js` holds all copy as en/zh pairs (plain script, per the i18n note); the HTML shells are thin.

### Proposed scenario methods (the range Paul chooses from)

| Method | How it works in the room | Pattern cloned from |
|--------|--------------------------|---------------------|
| **1. Flip cards** | 3 to 5 cards, face down showing a staff response option ("You call both to the office."). Click (or arrow key, when the scenario has focus) flips the card to reveal what that move does to the relationship, with a one line note. Presenter walks the room through which to pick first. | Card styles from `edu/tools/cards.html` (the card style catalogue: copy the CSS block for the chosen style, it is written to be lifted). Flip mechanics are new but simple: 3D rotateY, 200ms, `aria-pressed`, keyboard accessible, still version shows both faces stacked. |
| **2. Match the move to the outcome** | Left column: 4 staff moves. Right column (shuffled): 4 outcomes. Tap or click a pair; correct pairs lock in green with a soft stamp-slam (the stamp effect from the `edu/ai` scorecard, see `edu/ai/js/compare.js` and `showcase-plan.md` screen 3), wrong pairs shake and release. | Pairing logic is new (tap/click only, settled 2026-10-14 for phones); the stamp-slam and shake are adapted from `edu/ai`. |
| **3. Sequence the incident** | The incident is given as 6 out-of-order fragments (chat bubbles / timeline chips). The room orders them by tapping "move up/down". When ordered, a "why this order matters" panel reveals under each boundary. | Mechanics are new, tap/click only (settled 2026-10-14). The dp pages' sorting activities (`edu/curriculum/drag-sort.js`, used on 10 pages incl. DP A3.3) are the reference for what a good ordering interaction feels like. |
| **4. Three perspectives** | The same incident told from three seats: student A, student B, a bystander. Three tabs or stacked cards; each perspective ends with the feeling the person is holding. After all three are read, a "what was actually in dispute" card reveals. | Tab micro-pattern from `make/localai/css/tabs.css` (small scale), perspective stacking from the `edu/ai` compare component (`edu/ai/js/compare.js`) which runs two parallel narratives. |
| **5. Branching decision** | "It's Friday, 2:55pm. What do you do?" Two or three large choice buttons. Each choice reveals a 3-step consequence chain (immediate / that day / next week) as a vertical chain, then all branches are visible side by side for comparison. No right answer stated; a facilitator prompt reveals last. | Branch structure from `edu/tools/cyoa` (choose your own adventure) as reference; rendering is new. |
| **6. Poll the room** | A 5-option show-of-hands poll with on-screen tallies the presenter clicks up; when done, the results render as a human dot strip (one dot per person, a small local render function in `js/scenarios.js`), making the room's own split the discussion. | Tally-click pattern from `trivia` (presenter enters scores from their own device, scoreboard updates); the dot strip is new. |

Each method has: a keyboard path, an `aria` story (live region announcing state changes), a still version for reduced motion, a "reset" control so the presenter can replay a scenario, and a **discussion element** (the brief requires one per scenario): either a facilitator prompt card that reveals on tap ("Ask the room: whose job was it to notice first, and why?") or a two-column steelman of the two sides before the suggestions appear.

### The explorer reward, earned not given

The reward exists only for genuine completion of all six scenarios (Paul's rule, 2026-10-14): scrolling a tab or opening it earns nothing. Every interactive element must be engaged:

| Scenario | Element counts as done when |
|----------|------------------------------|
| 1 flip cards | every card has been flipped to its back face at least once |
| 2 matching | all four pairs locked |
| 3 sequencing | all fragments ordered and the confirm control pressed |
| 4 perspectives | all three perspectives opened and the "what was actually in dispute" card tapped |
| 5 branching | at least two of the branches chosen and their consequence chains revealed |
| 6 poll | the presenter has tallied at least three of the five options and the results shown |

Mechanics:

- `js/progress.js` exposes `markDone(scenarioId, elementId)`. Each component calls it the moment its element is engaged (not when the scenario ends). A scenario's tab on the strip shows a small completion mark only when all of its elements are done; the tab strip doubles as the completion scoreboard (the progress rail still tracks the screens within the active tab).
- State persists in `localStorage` (`dei-progress`), so a staff member who works the scenarios on their phone over the week still earns it, and a presenter can "reset room progress" from the presenter strip to replay a session with a new group.
- When the last outstanding element is marked, the celebration plays once (the adapted burst from `make/localai`), the badge appears in the header reading "All scenarios, every card", and it stays on for that browser until reset. Reduced motion version: the badge appears, no particles.
- Nothing about it is announced as a prize in the page copy. The rail quietly fills; the reward is a small pleasure for the thorough, not a goal the room chases.

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
| Tab strip markup + CSS | `make/localai/index.html` (`.tabs`, `data-tab-link`) and `make/localai/css/tabs.css` | Adapted to 6 tabs (one per scenario), horizontally scrollable on phones |
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

New code (no clone source): `js/screens.js` (screen grid + arrow nav), `js/mode.js` (presenter mode), the six scenario components in `js/scenarios.js`, `js/progress.js` (explorer reward), the branching method (method 5).

## 5. Build order

1. **Scaffold.** `index.html` (six scenario tabs, header, rail shell, footer), `css/tokens.css`, `css/base.css`, `js/theme.js`, `js/i18n.js`, `js/tabs.js`, `CLAUDE.md`, `HANDOFF.md`. Checkpoint: tabs switch, theme toggles with no flash, EN/中文 toggle swaps every UI string with no reload and no flash, both themes AA in both languages. **Done 2026-10-14; see HANDOFF.md for the unverified items.**
2. **Screen engine.** `data-screen` on 3 test screens, arrow key nav, snap, progress rail, reveals, presenter mode, height check script. Checkpoint: arrow keys never land mid-screen on a 720p and a 1080p viewport; typing in a test input is unharmed. **This checkpoint gates everything else.** **Done 2026-10-14: `js/screens.js` + `js/mode.js`, 35/35 tests; browser-verified items listed in HANDOFF.md.**
3. **Scenarios, one at a time**, each with its own checkpoint (keyboard path, aria, reset, reduced motion, discussion element, placeholder image frame, 390px phone pass): flip cards, matching, sequencing, perspectives, branching, poll. The survey step and the showcase screen are out of scope (pivot 2026-10-14).
4. **Explorer reward.** `js/progress.js`, per-element completion, tab strip scoreboard, persistence, reset control, celebration. Checkpoint: opening the tabs and scrolling to the bottom of any of them earns nothing; doing every element in any order earns it exactly once; reset clears it.
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

Settled from the brief (2026-10-14): domain is `contrapaul.com/dei/` (was `dei.contrapaul.com`, changed 2026-10-15); 6 scenarios each with an image and a discussion element; presenter uses a keyboard (or an assistant); the explorer reward stays but is earned by engaging every interactive element of all six scenarios, never by scrolling (§2, The explorer reward).

Settled (2026-10-14, from Paul's answers written in this file):

1. **Accent colour: deep teal.** Already the working default in `css/tokens.css`; the terracotta candidate stays in tokens as a one-line flip in case of regret.
2. **Methods 2 and 3: tap/click only**, no drag, for phones. `drag-sort.js` is a feel reference, not a clone.

Still open:

3. Do scenarios have a "recommended move" the presenter reveals, or purely open facilitation? Paul will revisit once the finalized content is in place. Affects the reveal card copy structure. 