# dei: house rules

Rules for working in this folder. Each rule says why. If a rule and a request conflict, surface the conflict; do not silently break the rule. Rewritten 2026-10-21: earlier versions described a presentation tool with presenter mode, arrow key screens and interactive components. All of that is out.

## The page

- **A reading and discussion page for teachers, built for phones first.** Two tabs, PYP and MS/HS. Each tab lists that group's scenarios. Teachers read a scenario and discuss it. That is the whole job of the page.
- **Mobile is the top priority.** Every change is checked at 390x844 and 360x740 before anything else. No horizontal scrolling, body text at least 17px, comfortable line height, touch targets at least 44px. Desktop only needs to look tidy (a centred reading column).
- **No presentation features.** No presenter mode, no presenter strip, no arrow key screen stepping, no `data-screen` grid, no progress rail, no reveal animations, no scroll snap. If a request seems to need one of these, ask Paul first.
- **No invented interactivity.** No dialogue players, flip cards, quizzes, choices, scales, filters, stamps, badges or rewards unless Paul asks for that exact thing. A scenario is read, not played.
- **Normal scrolling, normal links.** Tabs are `#/pyp` and `#/mshs`. Jump links at the top of each tab go to each scenario (`#/pyp#sc3`).

## The scenarios

- **`scenarios.md` is the source of truth, and its text is shown as written.** Same words, same order, same punctuation, same speaker labels, same titles. Do not rewrite, retitle, shorten, merge, or correct it, and do not "clean up" its dashes or quote marks.
- **Never add copy to a scenario.** No made up rules, notes, prompts, examples, answers, summaries or headings inside a scenario. Page chrome (tab names, jump link labels, the footer) is ours; scenario content is the committee's.
- **Layout may serve the phone; wording may not change.** Showing each speaker label on its own line, setting stage directions like "(to student #1, individually)" in a muted style, or setting off the debrief note is fine. Changing a word is not.
- **Wording changes come only from Paul or the committee.** Change `scenarios.md` first, then `data/scenarios.js`. A test checks that the page data matches `scenarios.md`.

## Zero network

- **Nothing is fetched from another host.** No CDN fonts, no external scripts, no analytics. The page runs from `file://` and from any static host.
- **So: no ES modules and no `fetch()`.** They break on `file://`. Plain scripts; data lives in plain `.js` data files.

## Language

- **The EN/中文 toggle stays.** Page chrome carries `data-en` / `data-zh` pairs; scenario data carries `{en, zh}` pairs. A missing pair never blanks the page.
- Chinese is Simplified only. The zh text of a scenario is a translation of the committee text as written, nothing added. Until it arrives, zh shows a labelled placeholder.
- **Our own strings** (chrome, labels, notes in docs) use plain grade 8 to 10 English.

## Writing (our own words only)

These apply to text we write: page chrome, code comments, docs. They never apply to the committee's scenario text.

- No em dashes. Full stop, colon, comma or brackets instead.
- No double titling, no AI tells (no "not just X but Y", no punchy fragment reveals, no triads, no closing restatement).
- Not preachy, not cute.

## Look and access

- Light and dark themes, chosen before first paint, stored in `localStorage` (`dei-theme`).
- WCAG AA contrast in both themes. Focus visible. No meaning carried by colour alone.
- Respect `prefers-reduced-motion`; there should be almost no motion to begin with.

## Process

- **Work on `main`. Do not create branches.** (Paul, 2026-10-21.) Cloudflare Pages deploys `main` to `contrapaul.com/dei/`.
- **After every change that works, add a dated entry to the top of HANDOFF.md**: what was asked, what changed, what is still unverified. Update the status section. Do this before saying the work is finished.
- **`brief.md` says what the page is; `plans.md` says how it is built.** If a request conflicts with them, say so and update them. Do not drift, and do not fill gaps with your own ideas: ask.
- **Verify before claiming.** Tests pass (`node --test`), and the phone check is done in a real browser at 390x844, before saying a change is done.
