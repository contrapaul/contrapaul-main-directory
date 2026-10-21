# DEI training page: build plan

Rewritten 2026-10-21. Implements `brief.md`. The earlier Qwen plan (presenter mode, arrow key screens, four screens per scenario, invented components) is withdrawn and its code removed.

## 1. Files

```
dei/
  index.html          header (brand, two tabs, rewards, 中文, theme), two tab panels, footer
  css/tokens.css      colours (both themes, speaker bubble colours), type, spacing, motion
  css/base.css        header, tabs, reading column, footer, placeholder tag
  css/scenarios.css   jump links, scenario, player, chat, placeholder layouts, rewards
  js/theme.js         theme resolve + toggle
  js/i18n.js          EN/中文 apply + toggle; fires 'dei:lang' so rendered text redraws
  js/progress.js      scenario completion and the three rewards
  js/scenarios.js     renders each tab: jump links, scenarios, player, chat, layouts
  js/tabs.js          #/pyp and #/mshs routes, deep links (#/pyp#sc3)
  data/scenarios.js   the nine scenarios, committee text verbatim, plus the layouts
  scenarios.md        source of truth for the scenario text
  test/               node --test: verbatim check, rewards, tabs, i18n, theme
```

Plain scripts, no modules, no fetch: the page runs from `file://`.

## 2. A scenario on the page

Top to bottom, nothing else:

1. **Title**: the real title only, one line.
2. **Context** sentence (no "Context :" label).
3. **Harm note** where the committee wrote one (scenarios 5, 6, 9).
4. **The player** (section 3).
5. **A placeholder layout** in five scenarios (section 4).
6. **Debrief**, shown openly, with the committee's own "Debrief note:" label in bold. Scenario 3 shows the placeholder.

Above the scenarios, one row of jump links (the titles; a tick once a scenario is complete). Below, the footer.

## 3. The conversation player

- **Play** runs the conversation on a timer. The button becomes **Pause**, then **Resume**; after the last line it becomes **Replay**. Only one conversation plays at a time, and switching tabs pauses it.
- **Each line is a card**: the line's image, with the words in a bubble across its bottom. The bubble shows the speaker label as written, stage directions in muted italics, then the spoken words.
- **Sides**: TEACHER and STUDENT #2 slide in from the left; STUDENT #1, STUDENT (scenario 7) and G (scenario 8) from the right. A card leaves the way it came as the next one arrives.
- **Colours**, one per speaker, same in every scenario: teacher teal, student 2 amber, student 1 and "student" violet, group rose. All AA in both themes, and side, image and label back them up.
- **Pace**: each line shows for `900ms + 40ms per character` of its English text, between 1.6s and 9s. Tune it in one place (`PACE` at the top of `js/scenarios.js`) or per line with `ms` in `data/scenarios.js`.
- **After the first full play**: back and forward buttons with a line count step through the cards by hand, and the whole conversation appears below as a **group chat**: same colours, same sides, the speaker's name shown when the speaker changes. The line on stage is outlined in the chat.
- **Images**: one per line. Until art exists, each card shows a labelled placeholder named for its file, `sc1-01` to `sc9-16`. Add `img: 'img/sc1-01.webp'` to a line in `data/scenarios.js` to use real art (local files only, 3:2 works best).
- **Returning visitors**: a scenario finished on an earlier visit opens ready to step through, with the chat showing.
- **Reduced motion**: cards swap without sliding. **Screen readers**: each new line is announced.

## 4. Placeholder layouts (for Paul to choose from)

Each is tagged "placeholder layout A" to "E". Suggestions inside them are committee lines; the questions, prompts and feedback lines are placeholder wording. They do not count toward the rewards.

| Layout | Where | What it does |
|--------|-------|--------------|
| A, swipe flip cards | Scenario 2 | A row of question cards; swipe across, tap to flip to a suggested teacher line |
| B, flip deck | Scenario 4 | One card at a time with back and forward; the teacher's question flips to the students' answers |
| C, pick the stronger line | Scenario 1 | Two say-backs from the script; tap one, then see the teacher line that got there |
| D, match | Scenario 5 | Tap a student line, then the teacher reply that answers it; matched pairs get a number |
| E, write then compare | Scenario 9 | Type your own reply (not saved), then reveal what the teacher said |

When Paul picks, the chosen layouts get real content and spread to the scenarios he names; the rest are removed.

## 5. Rewards

- A scenario is **complete** when its conversation has played to the last line. Opening a tab, scrolling, or using a placeholder layout earns nothing.
- **PYP** 🌱 (scenarios 1 to 4), **MS/HS** 🧭 (5 to 9), **Conflict Resolution** 🤝 (all nine). Each emoji appears in the header once earned, with a small pop the first time. No reset.
- Stored on the device under `dei-progress`.

## 6. Verbatim check

`test/parse-scenarios.mjs` reads `scenarios.md` with the display rules listed at the top of that file. `test/verbatim.test.mjs` fails if any English text in `data/scenarios.js` differs from it, and also checks that the parser drops no committee text.

## 7. Status and next steps

1. Strip the Qwen presentation layer. **Done 2026-10-21.**
2. Re-transcribe the data verbatim with the verbatim test. **Done 2026-10-21.**
3. Scenario layout and jump links. **Done 2026-10-21.**
4. Conversation player and group chat. **Done 2026-10-21.**
5. Rewards. **Done 2026-10-21.**
6. Placeholder layouts A to E. **Done 2026-10-21.** Paul picks.
7. Expand the chosen layouts with real content.
8. Line art, timing tweaks.
9. Chinese: preliminary after tonight's review, final after the English locks.

## 8. Phone checklist

- [x] No horizontal scroll at 360px wide (both tabs)
- [x] One title per scenario; no kickers, tags or extra headings
- [x] Play visible right under the context
- [x] Bubble text 17px; speakers distinct by side, colour and label
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
- Player as in section 3: plays on its own, step back and forward after, group chat after. No image per scenario; one per line.
- Speakers: teacher and student 2 left; student 1, "STUDENT" and group right.
- Debrief shown openly; scenario 3's is a placeholder for the team.
- Rewards: PYP, MS/HS, Conflict Resolution, small emoji in the header, no reset.
- Committee text is unedited AI output; staff review it tonight. Chinese after the review.
- Work on `main`, no branches. Domain `contrapaul.com/dei/`. Accent deep teal (2026-10-14).
