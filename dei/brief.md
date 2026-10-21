# DEI training page: intra-student conflict

Project brief, from Paul. Rewritten 2026-10-21. It replaces every earlier version (the survey, the introduction tab, the six scenario tabs, presenter mode and arrow key screens are all gone). The build plan lives in `plans.md`; the scenario text lives in `scenarios.md`.

## What it is

A single web page for staff DEI training on intra-student conflict (conflict between students). Teachers open it, mostly on their phones, read the scenarios written by the committee, and discuss them. It is not a slide deck, not a course and not a game.

## The two tabs

- **PYP**: scenarios 1 to 4.
- **MS/HS**: scenarios 5 to 9.

Each tab is one scrolling page. At the top, a short row of jump links goes to each scenario in that tab. Each scenario shows its title, context and script, and its debrief note, all exactly as the committee wrote them in `scenarios.md`.

## Hard requirements

1. **Looks great on a phone.** This is the top priority. Clean, readable, comfortable to scroll with one thumb. Checked at 390x844 and 360x740 first, desktop second.
2. **Scenario text as written.** The committee text appears word for word. Nothing is rewritten and nothing is added inside a scenario.
3. **Nothing fetched from another host.** No CDN fonts, no external scripts. The page runs from a file system or any static host with zero network.
4. **Light and dark themes**, chosen before first paint, no flash.
5. **English / 中文 toggle** (Simplified Chinese) on the whole page. The Chinese text arrives after the English is locked.

## Out of scope

- Presenter mode, slides, arrow key navigation, screen by screen stepping.
- Interactive activities (flip cards, quizzes, choices, scales, rewards).
- The survey (covered elsewhere).
- Accounts, logins, tracking.
- Student facing use.

## Audience and tone

- Staff, with mixed experience of DEI material. Some will be engaged, some defensive. The page should feel like a calm, well set case file, not a lecture.
- Page chrome is plain and quiet. The scenarios speak for themselves.

## Footer

Exactly, without capitalization: `a project by mr. k, more at contrapaul.com`, with `contrapaul.com` linked, plus its 中文 pair.

## Where it lives

`contrapaul.com/dei/`, the `dei/` folder of `contrapaul-main-directory`, deployed by Cloudflare Pages from `main` straight from source, no build step.
