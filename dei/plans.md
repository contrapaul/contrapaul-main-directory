# DEI training page: build plan

Rewritten 2026-10-21. Implements `brief.md`. The earlier Qwen plan (presenter mode, arrow key screens, four screens per scenario, invented components) is withdrawn and its code removed.

## 1. Files

```
dei/
  index.html          header (brand, two tabs, trophy, 中文, theme), two tab panels, footer
  css/tokens.css      colours (both themes, speaker bubble colours), type, spacing, motion
  css/base.css        header, tabs, reading column, footer, placeholder tag
  css/scenarios.css   jump links, scenario, phone chat, placeholder layouts, trophy
  js/theme.js         theme resolve + toggle
  js/i18n.js          EN/中文 apply + toggle; fires 'dei:lang' so rendered text redraws
  js/progress.js      scenario completion, the trophy and the three awards
  js/scenarios.js     renders each tab: jump links, scenarios, phone chat, layouts
  js/tabs.js          #/pyp and #/mshs routes, deep links (#/pyp#sc3)
  data/scenarios.js   the nine scenarios, committee text verbatim (split into messages), plus the layouts
  scenarios.md        source of truth for the scenario text
  test/               node --test: verbatim check, rewards, tabs, i18n, theme
```

Plain scripts, no modules, no fetch: the page runs from `file://`.

## 2. A scenario on the page

Top to bottom, nothing else:

1. **Title**: the real title only, one line.
2. **Context** sentence (no "Context :" label).
3. **Harm note** where the committee wrote one (scenarios 5, 6, 9).
4. **The conversation**, a phone chat (section 3).
5. **The Debrief box**, the same under every conversation (staff request, 2026-10-28): a "Debrief" heading, the committee's note as written (without its own "Debrief note:" label), then the three group questions as a deck of cards, one at a time with back and forward and a "1 of 3" count. The deck is the design Paul picked from the old layout B. Unwritten questions and scenario 3's note are labelled PLACEHOLDER.
6. **A placeholder layout** in four scenarios (section 4).

At the top of the page, on both tabs, the instructions: "Read through the scenarios with your group, then discuss the scenario and the debrief questions." Then one row of jump links (the titles; a tick once a scenario is complete). Below, the footer.

## 3. The conversation: a phone chat

Settled 2026-10-21: every conversation looks like a phone conversation. Pure text, no images.

- **Play** starts it; the button becomes **Pause**, then **Resume**, and **Replay** at the end. Only one conversation plays at a time; switching tabs pauses it.
- **A chat window** of fixed height (about two thirds of a phone screen). Messages arrive at the bottom and push older ones up, as on a phone. It follows new messages unless the reader scrolls up to look back; scrolling back to the bottom resumes following.
- **Messages.** Each `say` part in `data/scenarios.js` is one message. Long turns were split into several messages at sentence breaks, each up to about 100 characters (a turn up to 110 stays whole). Paul will review and adjust the splits: split or join `say` parts freely, keeping the words and order (the verbatim test joins them back up).
- **Sides and colours**: TEACHER and STUDENT #2 send from the left; STUDENT #1, STUDENT (scenario 7) and G (scenario 8) from the right. Teacher teal, student 2 amber, student 1 and "student" violet, group rose. The speaker's name (as written) shows on the first message of a run.
- **Stage directions** ("(to student #1, individually)", "(Later, Student #1 is at a 6.)") show as written, as small centred notes between messages, the way a phone shows notices in a group chat.
- **Pace.** A message stays alone for `700ms + 45ms per character` of its English text, between 1s and 14s, so "Yeah." moves on in a second and a long teacher message gets several. In the last part of that wait (35%, between 0.4s and 0.9s) the next speaker's typing dots show. Tune it at the top of `js/scenarios.js` (`PACE`, `TYPING`), or give one message its own `ms` in `data/scenarios.js`.

  | Message length | Stays for |
  |---|---|
  | 5 characters ("Yeah.") | 1.0s |
  | 30 | 2.1s |
  | 70 | 3.9s |
  | 110 | 5.7s |
  | 180 | 8.8s |

- **After it plays**, the whole chat stays in the window to scroll and read. A scenario finished on an earlier visit opens with the chat already there.
- **Reduced motion**: messages appear without the rise, the window jumps instead of gliding. **Screen readers**: each new message is announced.

## 4. Placeholder layouts (for Paul to choose from)

Each is tagged "placeholder layout" with its letter. Suggestions inside them are committee lines; the questions, prompts and feedback lines are placeholder wording. They do not count toward the rewards.

| Layout | Where | What it does |
|--------|-------|--------------|
| A, swipe flip cards | Scenario 2 | A row of question cards; swipe across, tap to flip to a suggested teacher line |
| B, flip deck | (none) | Became the Debrief box's question deck, 2026-10-28 |
| C, pick the stronger line | Scenario 1 | Two say-backs from the script; tap one, then see the teacher line that got there |
| D, match | Scenario 5 | Tap a student line, then the teacher reply that answers it; matched pairs get a number |
| E, write then compare | Scenario 9 | Type your own reply (not saved), then reveal what the teacher said |

When Paul picks, the chosen layouts get real content and spread to the scenarios he names; the rest are removed.

## 5. Rewards

- A scenario is **complete** when its conversation has played to the last message. Opening a tab, scrolling, or using a placeholder layout earns nothing.
- **PYP** 🌱 (scenarios 1 to 4), **MS/HS** 🧭 (5 to 9), **Conflict Resolution** 🤝 (all nine).
- One **trophy** 🏆 button in the header, with the number earned beside it once there is one. Tapping it opens the list: each award's emoji (greyed until earned), its name, and "✓ Earned" or "2 of 4 played". It pops when a new award is earned. Tap outside or press Escape to close. No reset.
- Stored on the device under `dei-progress`.

## 6. Verbatim check

`test/parse-scenarios.mjs` reads `scenarios.md` with the display rules listed at the top of that file. `test/verbatim.test.mjs` fails if any English text in `data/scenarios.js` differs from it, and also checks that the parser drops no committee text.

## 7. Status and next steps

1. Strip the Qwen presentation layer. **Done 2026-10-21.**
2. Re-transcribe the data verbatim with the verbatim test. **Done 2026-10-21.**
3. Scenario layout and jump links. **Done 2026-10-21.**
4. Conversations as phone chats, split into messages, paced by length. **Done 2026-10-21.**
5. Trophy and awards. **Done 2026-10-21.**
6. Placeholder layouts A to E. **Done 2026-10-21;** Paul returns to them after the chats. B became the Debrief deck (2026-10-28).
7a. Debrief box with three group questions per scenario, and the instructions at the top. **Done 2026-10-28;** questions are placeholders for Paul.
7. Paul reviews the message splits and the pace.
8. Expand the chosen layouts with real content.
9. Chinese: preliminary after tonight's review, final after the English locks.

## 8. Phone checklist

- [x] No horizontal scroll at 360px wide (both tabs)
- [x] Above 680px nothing scrolls sideways or reaches past the column (jump links and layout A wrap); checked at 681, 700, 1280 and 1920px
- [x] One title per scenario; no kickers, tags or extra headings
- [x] Play visible right under the context; the chat follows new messages
- [x] Message text 17px; speakers distinct by side, colour and name
- [x] Buttons and links at least 44px
- [x] Jump links and deep links land with the title in view under the header
- [x] Light and dark; 中文 chrome swaps, scenario text falls back to English
- [x] No network requests after load; no console errors
- [x] Scenario text matches `scenarios.md` (verbatim test)
- [ ] On a real phone (checked so far in Chromium at 360x740 and 390x844 only)
- [ ] Contrast measured with a tool (speaker colours chosen for AA, not yet measured)

## 9. Settled (2026-10-21 unless marked)

- Two tabs, PYP (1 to 4) and MS/HS (5 to 9), jump links at the top. Mobile first.
- Scenario text as written; display rules at the top of `scenarios.md`. One real title per scenario.
- No presenter mode or presentation features.
- Every conversation is a phone chat (section 3): plays on its own, paced by message length, pure text, no images.
- Speakers: teacher and student 2 left; student 1, "STUDENT" and group right.
- Debrief box under every conversation: the note, then three group questions as a card deck (2026-10-28). Scenario 3's note and all questions are placeholders for now.
- Instructions at the top of both tabs (2026-10-28).
- Awards: PYP, MS/HS, Conflict Resolution, behind one trophy button in the header, no reset.
- Committee text is unedited AI output; staff review it tonight. Chinese after the review.
- Work on `main`, no branches. Domain `contrapaul.com/dei/`. Accent deep teal (2026-10-14).
