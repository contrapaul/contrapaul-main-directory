# DEI training page: build plan

Rewritten 2026-10-21. Implements `brief.md`. The earlier plan (presenter mode, arrow key screens, four screens per scenario, nine invented components, a single explorer reward) is withdrawn; this file replaces it in full.

## 1. Where the code stands

The code in this folder was built today to the withdrawn plan. It runs (55/55 node tests pass) but it is the wrong page: cluttered with kickers, tags and headings, built around presentation, and its scenario text was rewritten during transcription.

| Part | Files | Verdict |
|------|-------|---------|
| Theme (light/dark, no flash) | `js/theme.js`, pre-paint script in `index.html`, `css/tokens.css` | Keep |
| EN/中文 toggle | `js/i18n.js` | Keep |
| Two tab routing, deep links | `js/tabs.js` | Keep (`#/pyp`, `#/mshs`) |
| Header, tabs, footer, base layout | `index.html`, `css/base.css` | Keep, strip the presentation parts |
| Presenter mode | `js/mode.js`, header toggle, `data-mode` in pre-paint script | Remove |
| Screen engine (arrow keys, `data-screen`, rail, reveals, presenter strip, scroll snap) | `js/screens.js`, rail and strip markup, related CSS | Remove |
| Four screens per scenario with kickers, method tags, banners, image frames | `js/scenarios.js` (`makeScreen`, `headerScreen`, `screenB` to `screenD`, `banner`, `noteCard`, `imageFrame`) | Remove |
| Invented pieces: rule stamps, readiness scale and branch, qualities board, three way choice, fact card, dare filter (made up dares) | `js/scenarios.js`, `css/scenarios.css`, `data/scenarios.js` | Remove (their text is not the committee's) |
| Dialogue player (line list with speaker chips) | `js/scenarios.js` `buildPlayer` | Rebuild to the design in section 3 |
| Flip card | `js/scenarios.js` `buildFlip` | Park; reuse if Paul picks flip pieces (section 4) |
| Explorer reward (one badge, celebration) | `js/progress.js` | Adapt to three rewards (section 5) |
| Jump strip | `js/scenarios.js` `buildJumpStrip` | Keep the idea, simplify |
| Scenario data | `data/scenarios.js` | Re-transcribe verbatim (section 6) |
| Tests | `test/*.test.mjs` | Remove tests for removed parts; rewrite the rest with the code |

Why the data must be redone: titles were rewritten ("Unkind Nickname" became "The unkind nickname"), "1–10" became "1 to 10", every dash was replaced, stage directions were reworded and moved, a full stop was added in scenario 9, and invented copy was added (rule stamps, a pause note, reveal text, dares for scenario 8).

## 2. A scenario on the page

Top to bottom, with nothing else:

1. **Title**: the real title only, for example `Unkind Nickname`. One line.
2. **Context**: the committee's context sentence, as written. The "Context :" label is not shown; position makes its role clear. *(Proposed; Paul to confirm.)*
3. **Harm note** where the committee wrote one (scenarios 5, 6, 9), as written.
4. **Play button**, which opens the conversation player (section 3).
5. **Interactive pieces**, only where Paul has chosen them (section 4).
6. **Debrief space**: the committee's debrief note as written. Scenario 3 shows the labelled placeholder "to be added by the team". Whether it shows openly or on tap is open.

Above the scenarios, each tab has one row of jump links (the scenario titles). Below the last scenario, the footer.

## 3. The conversation player

Paul's design (2026-10-21):

- **Play** starts the conversation from its first line.
- **One line at a time.** Each line is a card: the speaker's image, with the line in a speech bubble across the bottom of the image.
- **Sides.** TEACHER and STUDENT #2 enter from the left. STUDENT #1 enters from the right. The card slides in from its side; when the next line comes, it exits back the way it came (or the next card replaces it), and the responder's card enters from their side.
- **Colour coded bubbles**, one colour per speaker, consistent across all nine scenarios. Every colour meets AA contrast in both themes. A small speaker label from the script ("TEACHER", "STUDENT #1") stays in the bubble so colour is never the only cue.
- **Stage directions** ("(to student #1, individually)") show as written, in a muted style inside the bubble of the line they belong to.
- **An image per line.** Each line in `data/scenarios.js` has its own image slot. Until the art exists, a labelled placeholder image stands in. Images are local files.
- **Advancing**: tap Next, or tap the card. Replay starts again from line one.
- **Reduced motion**: cards swap in place, no sliding.
- **Keyboard and screen readers**: Next is a real button; each new line is announced (`aria-live`).
- **Phone fit**: the card fills the column width at 360px with the bubble text at least 17px, and Next sits within thumb reach.

## 4. Flip, match and other pieces

Wanted, but not yet chosen. For each one Paul decides: which scenario, what kind (flip, match, other), and what text goes in it. The text comes from the committee or from Paul, never from the agent. Nothing is built until Paul picks. The parked flip card code can be reused.

## 5. Rewards

- A scenario counts as **complete** when its conversation has been played to the last line and every interactive piece in it is done. Opening or scrolling earns nothing.
- **PYP**: scenarios 1 to 4 complete. **MS/HS**: scenarios 5 to 9 complete. **Conflict Resolution**: all nine complete.
- Progress lives on the device (`localStorage`, key `dei-progress`). No accounts.
- How a reward looks, where it appears, and whether there is a reset: open. It must not clutter the page.

## 6. Data and the verbatim check

- `data/scenarios.js` is a plain script (no modules, no fetch) that sets `window.dei.scenarios`. Each scenario has `id`, `tab`, title, context, harm note, debrief, and `lines`. Each line has the speaker label as written, the stage direction as written, the words as written, its side, and its image slot. Text fields are `{en, zh}` pairs.
- **A test enforces "as written"**: it reads `scenarios.md` and checks that the English in `data/scenarios.js` matches it word for word (whitespace aside, and the title prefix that Paul removed). If anyone rewords a line, the test fails.

## 7. Build order

Each step ends with tests passing and a HANDOFF entry. All work goes straight to `main`.

1. **Strip** presenter mode, the screen engine, the four screen layout, kickers, tags, banners and the invented pieces, with their tests and CSS. Check: tests pass, no console errors.
2. **Re-transcribe the data verbatim**, with sides and image slots, and add the verbatim test. Check: the test passes.
3. **Scenario layout** from section 2, plus jump links. Check: nine scenarios in the right tabs, one title each, deep links work.
4. **Conversation player** from section 3, with placeholder images. Check: in a browser at 390x844, lines enter from the correct sides, colours pass AA, reduced motion works.
5. **Rewards** from section 5. Check: tests prove that opening and scrolling earn nothing and that each reward fires once at the right moment.
6. **Flip and match pieces** as Paul picks them.
7. **Phone pass** (390x844, 360x740, both themes, both languages) and a desktop pass (1280x800). Screenshots go to Paul.
8. **Chinese**: preliminary after tonight's review, final after the English locks.
9. **Deploy**: push to `main`; Cloudflare Pages serves `contrapaul.com/dei/`.

## 8. Phone checklist

- [ ] No horizontal scroll at 360px wide
- [ ] One title per scenario; no kickers, tags or extra headings anywhere
- [ ] The Play button is visible without scrolling past extra text
- [ ] Bubble text at least 17px; speakers are easy to tell apart by side, colour and label
- [ ] Next button and jump links at least 44px and easy to hit with a thumb
- [ ] A jump link lands with the scenario title in view
- [ ] Both themes pass AA contrast, bubbles included
- [ ] 中文 toggle swaps all chrome; layout holds in Chinese
- [ ] No network requests after load
- [ ] Scenario text matches `scenarios.md` (verbatim test passes)

## 9. Settled (all 2026-10-21 unless marked)

- Two tabs, PYP (scenarios 1 to 4) and MS/HS (5 to 9), with jump links at the top of each.
- Mobile is the top priority.
- Scenario text as written; Paul's edits and display exceptions are listed at the top of `scenarios.md`.
- One title per scenario, the real title only; no extra titles or text.
- No presenter mode or presentation features.
- Conversation player as in section 3. No per-scenario image; an image per dialogue line instead.
- Rewards: PYP, MS/HS, Conflict Resolution.
- Scenario 3 gets a debrief space with a placeholder until the team writes it.
- Committee text is unedited AI output; staff review it tonight. Chinese: preliminary after the review, final after the English locks.
- Work on `main`, no branches. Domain `contrapaul.com/dei/`. Accent colour deep teal (2026-10-14).

## 10. Open questions

Listed in the latest HANDOFF entry so the next session sees them first.
