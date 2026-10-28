# dei: house rules

Rules for working in this folder. Each rule says why. If a rule and a request conflict, surface the conflict; do not silently break the rule. Rewritten 2026-10-21. Earlier versions described a presenter driven slide tool; that is out.

## The page

- **A discussion page for teachers, built for phones first.** Two tabs, PYP and MS/HS. Each tab holds its group's scenarios with jump links at the top. Teachers play each conversation, work its interactive pieces, and discuss.
- **Mobile is the top priority.** Every change is checked at 390x844 and 360x740 before anything else. No horizontal scrolling, body text at least 17px, touch targets at least 44px. Desktop only needs to look tidy.
- **One title per scenario, and nothing extra.** The scenario's real title only ("Unkind Nickname"). No kicker or number above it ("PYP SCENARIO 3"), no subtitle, no method tag, no section headings inside a scenario, no label that repeats what the tab or the layout already says. Extra text pushes the conversation down the screen. If text is neither committee content nor a control the reader needs, cut it.
- **Nothing scrolls sideways under the column edges.** On screens wider than the reading column (681px and up) every row stays inside the column and wraps. A row may swipe sideways only on a phone, where it runs to the screen edge. Check new rows at 1280x800 as well as on the phone.
- **No hover effects anywhere.** Nothing changes colour, border or shape on hover (Paul, 2026-10-28).
- **No presentation features.** No presenter mode, no presenter strip, no arrow key screen stepping, no `data-screen` grid, no progress rail, no scroll snap. Ask Paul before adding anything like them.
- **Normal scrolling, normal links.** Tabs are `#/pyp` and `#/mshs`; jump links go to each scenario (`#/pyp#sc3`).

## Interaction

- **Every conversation is a phone chat** (plans.md section 3). Pure text, no images. Play starts it; messages arrive at the bottom of a chat window and push older ones up. Teacher and student 2 send from the left; student 1, "STUDENT" and the group from the right, each in their own colour. Stage directions are small centred notes. Each message stays alone for as long as it takes to read (short replies quick, long ones longer), with typing dots just before the next one. Once played, the whole chat stays to scroll. Never make the reader tap for each message.
- **The Debrief box is the same under every conversation** (plans.md section 2): the "Debrief" heading, then three group questions as a card deck, nothing between them. The committee's debrief note stays in the data but is not shown. Group questions come only from Paul or staff; they live in `scenarios.md` under "Group questions:", and unwritten ones stay labelled PLACEHOLDER.
- **Placeholder layouts A, C, D and E are for Paul to choose from** (plans.md section 4). Do not add new kinds or move them between scenarios unless Paul asks. Their suggestions are committee lines; their questions and feedback are labelled placeholder wording until Paul replaces them.
- **Rewards are earned, never given.** A scenario counts when its conversation has played to the last message. One trophy button in the header opens the three awards (PYP, MS/HS, Conflict Resolution). No reset (plans.md section 5).
- **No hover-only states.** Every interaction works by tap and by keyboard, has an aria story, and has a still version for `prefers-reduced-motion`.
- **Never colour alone.** Bubble colour is backed by side and a speaker label.

## The scenarios

- **`scenarios.md` is the source of truth, and its text is shown as written.** Same words, order, punctuation and speaker labels. Do not rewrite, shorten, merge or correct it, and do not "clean up" its dashes or quote marks.
- **Display exceptions are Paul's only**, listed at the top of `scenarios.md` (for example, the title drops its "Scenario N: PYP - " prefix). Do not add more on your own.
- **Never add copy to a scenario.** No made up rules, notes, prompts, examples, answers or summaries.
- **Wording changes come only from Paul or the committee.** Change `scenarios.md` first, then `data/scenarios.js`. A test checks that the page data matches `scenarios.md`.

## Zero network

- **Nothing is fetched from another host.** No CDN fonts, no external scripts, no analytics. The page runs from `file://` and from any static host.
- **So: no ES modules and no `fetch()`.** They break on `file://`. Plain scripts; data lives in plain `.js` data files.

## Language

- **The EN/中文 toggle stays.** Page chrome carries `data-en` / `data-zh` pairs; scenario data carries `{en, zh}` pairs. A missing pair never blanks the page.
- Chinese is Simplified only. A preliminary translation comes after tonight's staff review, the final one after the English locks. The zh text translates the committee text as written, nothing added. Until then scenario text falls back to English in 中文 mode; page chrome is already translated.

## Writing (our own words only)

These apply to text we write: page chrome, code comments, docs. They never apply to the committee's scenario text.

- Plain grade 8 to 10 English. No em dashes. No AI tells. Not preachy, not cute.
- Keep chrome to the minimum: tab names, jump links, the player buttons, the footer.

## Placeholders

- Every placeholder is labelled ("placeholder" / "占位内容") so Paul can find it: the layouts, the scenario 3 debrief, unwritten group questions.

## Look and access

- Light and dark themes, chosen before first paint, stored in `localStorage` (`dei-theme`).
- WCAG AA contrast in both themes, including every bubble colour. Focus visible.

## Process

- **Work on `main`. Do not create branches.** (Paul, 2026-10-21.) Cloudflare Pages deploys `main` to `contrapaul.com/dei/`.
- **After every change that works, add a dated entry to the top of HANDOFF.md**: what was asked, what changed, what is still unverified. Use today's real date. Update the status section. Do this before saying the work is finished.
- **`brief.md` says what the page is; `plans.md` says how it is built.** If a request conflicts with them, say so and update them. Do not fill gaps with your own ideas: ask.
- **Verify before claiming.** Tests pass (`npm test`), and the phone check is done in a real browser at 390x844 and 360x740 (Playwright with the preinstalled Chromium works), before saying a change is done.
