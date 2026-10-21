# DEI training page: intra-student conflict

Project brief. Written from Paul's notes, lightly expanded. The build plan lives in `plans.md`.

## Pivots

- **2026-10-14: the survey element is out.** It is covered elsewhere. The introduction tab (tab 1) goes with it. The page is now the six scenarios, one tab each: a 6-tab page. Everything below that mentions the survey, the introduction tab, or "two tabs" is superseded by this; the rest of the brief (hard requirements, tone, footer, EN/中文, phone + widescreen) still applies.

## What it is

A single web page with two tabs, used by a presenter to run staff DEI training on intra-student conflict (conflict between students). It is a presentation surface, not a course: the presenter drives it, the staff in the room respond to it.

## The two tabs

### Tab 1: Introduction and instructions

- Sets up the session: what the training covers, why, and how the room will work with the scenarios.
- Presenter controlled. The page is divided into "screens" (full viewport sections). The presenter moves from one screen to the next with the arrow keys, and each screen's elements load in in a considered order (title first, then supporting points, then any data).
- Contains the survey data from the staff/student survey, shown in an engaging way (animated counts, dot grids, bar reveals, not a spreadsheet). The data is placeholder for now; Paul will supply the real figures and the JSON will be swapped in.
- Contains navigation links that jump the page to specific screens.

### Tab 2: Scenarios

- A sequence of conflict scenarios. Each scenario is a self contained section with its own layout and interaction. Teachers discuss and interact with them in the room.
- Content is placeholder throughout, but the placeholders must demonstrate a range of presentation methods: card flips, matching, sequencing, perspective switching, and at least two more. Each method should be visibly different so Paul can choose which to keep when writing the real content.
- Contains navigation links that jump to specific scenarios.

## Hard requirements

1. **Normal scrolling works at all times.** The page is a scrolling document first.
2. **Arrow keys move by screen, not by pixel.** Up and down arrow step between screens. A screen is a section that occupies roughly one viewport. Arrow navigation must never land with a screen half above and half below the fold. The grid of screens is explicit in the markup (a `data-screen` attribute), so "where the arrow keys land" is defined by the author, not by whatever happens to fit.
3. **Arrow keys must not hijack typing.** Anywhere focus is in an input, textarea, or an active interaction on tab 2, arrow keys do their normal job.
4. **Presenter friendly.** Everything must be legible from the back of a staff room. A "presenter mode" that enlarges type and simplifies motion is desired (see `edu/ai` teacher mode as the reference).
5. **Nothing fetched from another host.** No CDN fonts, no external scripts. Everything local. The page must open and run from a file system or any static host with zero network.
6. **Light and dark themes**, chosen before first paint (no flash of wrong theme), stored in `localStorage`.
7. **Reduced motion.** Every effect has a still version for `prefers-reduced-motion` and for presenter mode.
8. **Placeholder discipline.** Placeholders must be obviously placeholders (labelled as such) and must be easy to find and replace. All replaceable content lives in one place (JSON or clearly marked HTML blocks) so Paul can fill it in without touching the machinery.

## Out of scope

- Accounts, login, recording of who did what. Nothing tracked. Not needed at all.
- Multi language. The writing targets a grade 8 to 10 reading level in plain English so it can be translated later.
- Student facing use. This is for staff. (If it later serves students, that is a new brief.)

## Audience and tone

- Staff, mixed experience with DEI material. Some will be engaged, some will be defensive. The page must not read as a lecture; it must read as a case file the room works through together. 
- Not preachy, not cute. Concrete situations, named feelings, specific staff moves. The same standard as the DP pages: a good textbook, plain and unhurried, but aimed at adults.
- Writing rules from the existing projects apply: no em dashes, no double titling, no AI tells (see `make/localai/style-guide.md` and `edu/ai/style.md`).

## Where it lives

- New repo `GitHub/dei/`, served as a static site straight from source (Cloudflare Pages, no build step), the same way `make/localai` and `edu/ai` are served.
- Single `index.html` with the two tabs, plus `css/` and `js/`. Small enough that a new contributor can hold the whole page in their head.

## Open questions for Paul

1. Which domain will it live on? (`dei.contrapaul.com`? a path under an existing site?) - Correct, it will live at dei.contrapaul.com (updated 2026-10-15: a path under the main site instead, `contrapaul.com/dei/`)
2. What does the survey actually measure, and how many questions will the real data have? The placeholder data model should match the real shape. - the survey is staff engagement and belonging data, and results will be shared in a colorful variety of styles- effectively 'nice' graphs, charts, etc. We want to build placeholders for a wide range of options, even if we drop a lot of them. Everything gets added to the 'future projects' toolkit in my head. **(Superseded by the 2026-10-14 pivot: the survey is out of scope, covered elsewhere.)**
3. How many scenarios, and do any have fixed answers the staff should reach, or are they open discussions with a facilitator prompt? Let's build 6. They include disussion elements and we can use an image for each, along with different methods to show suggestions, reveal information, etc. 
4. Does the presenter use the presenter's own keyboard, or a remote (phone) control? Arrow keys assume the presenter's machine. A presenter will use a keyboard (or have an assistant)

## Extras/details I missed

1. The entire page should have an English/Chinese toggle- using simplified Chinese. We'll build 100%, but having the toggle from the start will make life a lot easier when we translate the finalized material.
2. Footer will state, without capitalization: 'a project by mr. k, more at contrapaul.com'. 
3. The site will be presented (tab 1) on a widescreen display in the auditorium, but many staff will engage with the scenarios entirely on phones. All content must work on both platforms. 