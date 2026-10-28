# DEI training page: intra-student conflict

Project brief, from Paul. Rewritten 2026-10-21; it replaces every earlier version (the survey, the introduction tab, six scenario tabs, presenter mode and arrow key screens are all gone). The build plan is `plans.md`; the scenario text is `scenarios.md`.

## What it is

A single web page for staff DEI training on intra-student conflict (conflict between students). Teachers open it, mostly on their phones, play through the committee's scenarios, interact with them, and discuss them. It should be engaging to tap through, and it should never bury the conversations under extra text.

## The two tabs

- **PYP**: scenarios 1 to 4.
- **MS/HS**: scenarios 5 to 9.

Each tab is one scrolling page with jump links at the top, one per scenario. Each scenario shows:

1. its title (the real title only, one line),
2. the context, and any harm note, as written,
3. a **Play** button. The conversation plays on its own as a phone chat, pure text: messages arrive at the bottom and push older ones up, in a colour per speaker. Teacher and student 2 send from the left; student 1, "STUDENT" and the group from the right. Longer messages stay alone longer, short replies come quickly, like a real conversation. Once played, the whole chat stays to scroll and read,
4. a **Discussion Questions** box, the same under every conversation: the heading, then three group questions to discuss as a deck of cards.

Nothing else is interactive: the old flip, pick, match and write layouts are gone.

The page opens with the instructions visible: "Read through the scenarios with your group, then discuss the scenario and the debrief questions."

## Rewards

Earned by playing the conversations through, never given. A trophy button in the header opens the list: each award with its emoji and either "earned" or how many conversations are played. No reset.

- **PYP** for completing scenarios 1 to 4,
- **MS/HS** for completing scenarios 5 to 9,
- **Conflict Resolution** for completing all nine.

## Hard requirements

1. **Looks great on a phone.** The top priority. Checked at 390x844 and 360x740 first, desktop second.
2. **Scenario text as written.** Word for word; nothing invented inside a scenario.
3. **No clutter.** One title per scenario, no kickers, tags or extra headings.
4. **Nothing fetched from another host.** No CDN fonts, no external scripts. Runs from a file system or any static host.
5. **Light and dark themes**, chosen before first paint, no flash.
6. **English / 中文 toggle** (Simplified Chinese). Preliminary translation after tonight's staff review, final after the English locks.

## Out of scope

- Presenter mode, slides, arrow key navigation, screen by screen stepping.
- The survey (covered elsewhere).
- Accounts, logins, tracking beyond the reward progress kept on the device.
- Student facing use.

## Audience and tone

Staff, with mixed experience of DEI material; some engaged, some defensive. The page should feel calm and well made. The scenarios speak for themselves.

## Footer

Exactly, without capitalization: `a project by mr. k, more at contrapaul.com`, with `contrapaul.com` linked, plus its 中文 pair.

## Where it lives

`contrapaul.com/dei/`, the `dei/` folder of `contrapaul-main-directory` (moved there 2026-10-21 from its own folder and the planned `dei.contrapaul.com`). Cloudflare Pages deploys `main` straight from source, no build step.
