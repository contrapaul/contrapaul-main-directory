# dei: house rules

Rules for working in this repo. Each rule says why. If a rule and a request conflict, surface the conflict; do not silently break the rule.

## The page

- **This is a presentation surface, not a course, and it is a mobile surface first.** The page is two tabs (PYP, MS/HS) holding nine scenarios. A presenter drives the tabs from the front of a staff room; staff work the same tabs, most of them on phones. Write for the phone first; the staff room is the second seat.
- **Legible from the back of the room.** Check every screen at 1280x720 and at presenter-mode scale. If a line needs squinting, it is too small.
- **Normal scrolling always works.** Arrow keys are an addition that steps by screen. Nothing may capture the wheel, hijack the scrollbar, or make free scrolling feel wrong.
- **Arrow keys must never land mid-screen.** Screens are `data-screen` sections of at least one viewport. If content cannot fit one viewport at 1280x720, split it into two screens with a "continued" kicker. Never shrink it, never let it straddle.

## Zero network

- **Nothing is fetched from another host, ever.** No CDN fonts, no external scripts, no analytics. The page runs from `file://` and from any static host. A school network, a blocked CDN, a dead DNS: none of these may be able to stop the page in front of a room.
- **Consequence: no ES modules and no `fetch()` in this repo.** They break on `file://`. Plain scripts, and data lives in the HTML or in plain `.js` data files, not in fetched JSON.

## Language

- **Every user facing string carries both languages, always.** Elements use `data-en` and `data-zh` attributes; content data objects use `{"en": ..., "zh": ...}` pairs. No string is added to any file without its pair, English or Chinese. The page must never go blank on a missing pair: `js/i18n.js` leaves the visible text as-is rather than clearing it.
- Chinese is Simplified only.
- **Write plain, grade 8 to 10 English.** Short common words, one idea per sentence where possible, no idioms that do not survive translation. The 中文 column is a real translation, not a decoration.

## Writing

- **No em dashes anywhere**, in any file: HTML, JS, comments, markdown. Full stop, colon, comma or brackets instead.
- **No double titling.** A screen gets one title. A small uppercase kicker is for metadata (a code, a count, a status tag), never a second saying of the title.
- **No AI tells.** No "not just X but Y", no short punchy fragment used as a reveal, no closing clause that restates the point, no triads, no colon splitting a catchy half from an explanatory half. Prefer the longer complete sentence that says the mechanism.
- **Not preachy, not cute.** This is a case file the room works through, not a lecture and not a reward show.

## Interaction

- **No hover-only reveals.** Every hover state has a tap equivalent. Touch targets at least 44px.
- **Arrow keys must not hijack typing.** Any handler that reads arrow keys early-returns when focus is in an input, textarea, select, contenteditable, or an element marked `data-keys-live`.
- **Every interactive element has a keyboard path, an aria story, a reset, and a still version** for `prefers-reduced-motion` and presenter mode.
- **No content that depends on colour alone.** Every state change also changes an icon, a shape or a word.
- **The explorer reward is earned, never given.** It requires engaging every interactive element of all nine scenarios (plans.md, "The explorer reward"). Scrolling a tab or opening it earns nothing. If a change would let the reward be collected without full engagement, the change is wrong.

## Placeholders

- **Every placeholder is labelled.** It carries a `.ph-tag` ("placeholder" / "占位内容") and its copy says what will replace it. Paul fills content later; the labels are his find-in-editor markers.
- **Replaceable content lives apart from the machinery.** Copy in `data-en`/`data-zh` and data objects; behaviour in `js/`. Swapping content must never require touching a handler.

## Process

- **After every change that works, add a dated entry to the top of HANDOFF.md**: what was asked, what was built, what was decided and why, and what is still unverified. Update the status section if it changed. Do this before saying the work is finished.
- **Brief and plan are the contract.** `brief.md` says what the page is; `plans.md` says how it is built and what was settled and why. If a request conflicts with them, say so and update the documents, do not drift.
- **Verify before claiming.** A change is done when its checkpoint in `plans.md` passes, not when the file saves.
