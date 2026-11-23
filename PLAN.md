# PLAN.md: contrapaul.com landing page overhaul

Asked 2026-11-17: replace the card grid with an interactive star map of the growing site network. Visitors should explore pages, sections and subdomains by zooming, without loading the actual pages unless they choose to visit them.

Revised 2026-11-23 after review. Items marked **[confirm]** are suggested defaults Paul has not yet signed off.

## Direction change 2026-11-23: a dynamic galaxy

Paul: `make/map` is a great start but feels like "things locked in place"; the landing page should feel like a "dynamic galaxy of links". Draft 1 was written fresh (without the make repo) and replaces these parts of the plan below:

- **Orbits, not fixed positions.** Every node with children carries a ring; its children ride it, and each ring turns as a whole at its own speed, alternating direction by depth. Children are staggered in and out of the ring and breathe slightly. Rings that carry the active node ease to a stop, so the thing you are looking at holds still while its own moons keep turning.
- **Calm under the pointer.** Hovering or keyboard-focusing a node slows the whole galaxy almost to a stop, so moving targets stay easy to click.
- **One layout for every screen.** Orbits are circles, so there are no separate landscape and portrait worlds; the camera fits the view to the screen shape.
- **Camera follows, no fixed tween.** The camera glides after the active node's live position (centre linear, zoom in log space) instead of an 800 ms `fitRect`/`mixBox`/`easeInOut` animation. `camera.js` has `viewFor`, `approach` and `settled`.
- **Screen-capped node size.** Zooming in spreads nodes apart instead of inflating them; each kind has a maximum on-screen radius.
- **Parallax on stars only.** Three seeded star layers move with the pointer and drift and scale with the camera, so zooming feels like travel. Links stay attached to their nodes; moving them separately broke the picture.
- **Separate stylesheet.** Map and sites page styles live in a new `map.css` (short cache), so the `immutable` cache on `style.css` cannot serve stale map styles. `style.css` is now used by `about.html` only.
- **Site nodes derived from `SITES`.** `network.js` builds the site nodes from `js/sites.js`, so a new subdomain is one entry there (plus the two static lists, which tests check).

See `HANDOFF.md` for what draft 1 contains and what is still open.

## Assumptions

- The node inventory is a curated copy of `plan.contrapaul.com/plan.json`, read on 2026-11-10. The file is a reference, not a node list.
- Not every page is shown. `plan`, `send`, `aseprite` and `make/bloodbowl` are excluded from both the map and the sitemap.
- Every child page under an included hub is grouped under that hub and shown in its panel. Loose pages outside included hubs are not shown.
- The landing page becomes the map. The old card grid is removed.
- `about.html` is updated and becomes a special leaf node directly under the centre node. It has no child nodes.
- The visitor sitemap is a separate static page, `sites.html`, not a hash view. It lists one entry per subdomain only. **[confirm]** the name `sites.html` (chosen over `sitemap.html` to avoid confusion with `sitemap.xml` and the `Sitemap:` line in `robots.txt`).
- Media will be local files in `assets/`. Until Paul supplies them, use `[Paul]` placeholders and code-drawn animations. The data model takes real media later without code changes.
- The hash URL is the source of truth for the view, the same pattern as `make.contrapaul.com/map`.
- The `make/map` code lives in the make.contrapaul.com repo, which is not part of this repo. Either attach that repo before step 2, or write `camera.js` and `layout.js` fresh, modelled on it.

## Prerequisite: full node list

`plan.json` is not in this repo, and the hierarchy below is only examples. Before step 1, write the complete list of included page nodes into this plan (the "Full node list" section below), copied from `plan.json`. Step 1 does not start until that list is filled in.

## Inventory for the sitemap

One entry per visitor-facing site:

- `contrapaul.com` - main landing page and personal hub. `contrapaul.com/dei` is a page node, not a separate subdomain.
- `blog.contrapaul.com` - portfolio, about page and blog posts.
- `edu.contrapaul.com` - IB DP Design Technology curriculum, tools and assessment.
- `make.contrapaul.com` - maker and creator portfolio for fans, collaborators and sponsors.
- `build.contrapaul.com` - a talk and a guide on building learning websites with AI. Four tabs: Talk, Start guide, Projects, Glossary.
- `bloodbowl.contrapaul.com` - rebuilt phone-first Blood Bowl table companion.
- `blurt.contrapaul.com` - realtime party game, 2 to 24 players, no sign-up.
- `cloud.contrapaul.com` - live collaborative word cloud for a room of phones.
- `games.contrapaul.com` - school arcade of browser games, no ads or accounts.
- `time.contrapaul.com` - timetable tool that knows what day it is, with no institution baked in.
- `flashstone.contrapaul.com` - flashcard app grown into a card game.
- `tome.contrapaul.com` - Tome of Secrets, a monster game with contributed art and audio.
- `duoshan.contrapaul.com` - DuoShan 躲闪, a browser physics team dodgeball game.
- `output.contrapaul.com` - an automation game for students.
- `dart.contrapaul.com` - browser first-person shooter.
- `trivia.contrapaul.com` - live trivia night in the browser.

`about` and `dei` are nodes on the map but not subdomains, so they are not in `SITES` and not on the sitemap.

`make.contrapaul.com/tools/languages` and `make.contrapaul.com/fun/students` are paths on `make`, not subdomains.

## Node hierarchy

The tree is:

- root hub: `contrapaul.com`
- site roots: each subdomain
- special nodes directly under the root: `about` and `dei`
- section hubs: `edu/curriculum`, `edu/tools`, `make/tools`, `make/fun`, and similar indexes
- page nodes: the individual projects under those hubs

Examples:

- `edu` -> `edu/curriculum` -> `edu/curriculum/dp`, `edu/curriculum/myp`
- `edu/ai` is its own section under `edu`
- `edu/tools` -> each tool page (`macropad`, `breadboard`, `taskanalysis`, ...; full list in "Full node list")
- `make` -> `make/tools`, `make/fun`
- `games` is a site whose children are the games themselves: `games/castle-assault`, `games/recess-dodgeball`, `games/recess-rivals`, `games/runestone-expedition`, `games/void-pirates`, `games/mortis`. There is no separate `games` hub.
- `bloodbowl` is a leaf site. There is no duplicate `bloodbowl` page under it, and `make/bloodbowl` is not a node.
- Leaf sites (no children), such as `blurt`, `cloud`, `trivia`, `dart`, `bloodbowl`, use the page panel. **[confirm]**

A node with children shows a brief description and all its connected pages. It does not show the real page content. A node without children shows its description, optional image/video/animation, and an explicit "Open page" link.

### Full node list

To be filled in from `plan.json` before step 1.

## Data model

All JS is ES modules. Add a root `package.json` containing `{"type": "module"}` so `node --test` can import `js/*.js`.

`js/sites.js` holds the sitemap entries:

```js
export const SITES = [
  { id: 'edu', name: 'edu.contrapaul.com', url: 'https://edu.contrapaul.com', description: '...' },
  // one entry per subdomain
];
```

`js/network.js` holds the full tree:

```js
// id, label, site, parent, kind, description, media, url
// kind: 'root' | 'site' | 'hub' | 'page' | 'special'
// parent is the only hierarchy field; children are derived from it
```

Each node gets:

- `id`: hash-safe, lowercase, no spaces, e.g. `edu/tools/macropad`. Rule: `id === parent + '/' + slug` for every node below a site, and site and special ids are a single segment. A test enforces this, so the hash path and the `parent` field can never disagree.
- `label`: short name shown on the map
- `site`: which subdomain it belongs to
- `parent`: one level up
- `kind`: one of `root`, `site`, `hub`, `page`, `special`. `about` and `dei` are `special`.
- `description`: one or two sentences
- `media`: optional local image, video or animation
- `url`: the real page URL

Panel layout depends on whether a node has children, not on `kind`.

Descriptions are copied from `plan.json`, not fetched at runtime. When `plan.json` changes, update `js/network.js` and `js/sites.js` in the same commit.

## Roadmap for adding future entries

- New subdomain: add one `SITES` entry with name, URL and description; add a site root to `NODES` with `parent: 'root'` and `kind: 'site'`; add section hubs and page nodes as wanted; add a row to `sites.html` and the static list in `index.html`. Tests fail if the static lists and `SITES` disagree.
- New page under an existing hub: add a `NODES` entry with `parent`, `kind: 'page'`, description, media and URL. The layout places it automatically and the hub panel lists it.
- New section worth its own hub: add `kind: 'hub'`, set its parent, and add child page nodes.
- Removed or renamed entry: delete from `NODES` and `SITES` and the static lists; update tests and descriptions.
- Keep `plan.json` as a reference. Update local data in the same commit when the reference changes.
- Exclusions stay out of `SITES` and `NODES`: `plan`, `send`, `aseprite`, and `make/bloodbowl`.

## Experience

### World view

The root view is a dark star map. Site nodes and the special nodes sit around a central hub on constellation lines. The map has a fixed star background, soft glow around nodes, and site labels. Mouse movement shifts the star layer, the link layer and the node layer by different amounts, so the map has parallax depth without making click targets unstable.

The map is always dark, in both colour schemes. **[confirm]** The header, footer and panel follow the light/dark tokens.

### Layout

Positions are computed, not placed by hand, so new entries appear without editing `layout.js`. Each node's children sit on a ring (or arc) around it, spaced evenly, with ring radius shrinking per level. Landscape and portrait worlds use the same rule with different aspect ratios.

### Zoom levels

The camera is an SVG `viewBox`, modelled on `make/map/js/camera.js`. Each click changes the hash and zooms to the active node:

- `#` or `#map`: root view
- `#edu`: site view
- `#edu/tools`: hub view
- `#edu/tools/macropad`: page view

`Escape`, the "Zoom out" link, the browser Back button, or a click on the background moves one level up, using `parentHash`.

History rule **[confirm]**: zooming in pushes a history entry. Zooming out (Escape, "Zoom out", background click) calls `history.back()` when the previous entry is the parent view, and otherwise replaces the current entry with the parent hash. Back and zoom out then never fight each other.

Loading a deep link such as `#edu/tools/macropad` jumps straight to that view with no animation. An unknown hash falls back to the root view and replaces the bad hash.

A zoom is animated with `fitRect`, `mixBox` and `easeInOut`, about 800 ms. Reduced motion jumps straight to the new view.

Free panning and pinch zoom are out of scope. Navigation is by clicking nodes.

### Hub behaviour

At a view of a node with children, the panel shows:

- breadcrumbs: Map -> site -> hub
- a short description
- a list of every connected page, each with a one-line description and a link into its node
- a "Visit the hub page" link if the hub is a real page

The hub page itself is not rendered inside the panel. The list is the expansion.

### Page behaviour

At a view of a node without children, the panel shows:

- breadcrumbs
- the page name
- description
- media: local image, local video or inline animation
- "Open page" link to the real URL
- "Zoom out" link

Media is lazy-loaded only for the active node. Videos use controls and no autoplay. Animations pause when `prefers-reduced-motion` is set.

### About node

The About node is a special leaf connected directly to the centre root. Clicking it zooms to the About panel. The panel shows the description, media and external links. It has no child nodes, so there are no further zooms from About. `about.html` is updated and remains the local destination.

The external links from the old card grid move to the About panel **[confirm]**:

- Makerworld: `https://makerworld.com/en/@Contrapaul/upload`
- Instagram: `https://www.instagram.com/contrapaul`
- YouTube: `https://www.youtube.com/@PaulKwiatkowski`

The blog posts linked from the old cards (`posts/iste2526`, `posts/2025-2026-goals`) become page nodes under `blog` if they are in `plan.json`, and are otherwise dropped. **[confirm]**

### No-JavaScript fallback

`index.html` contains a static `<nav>` list of every site in `SITES` (name, description, link) plus About. The map script hides it once the map renders. Without JavaScript, and for search crawlers, the page is still a working list of sites. A test checks the list matches `SITES`.

## Visual rules

- Keep JetBrains Mono from `WEB/css/jetbrains-mono.css`; no CDN fonts. `about.html` also loads it.
- Use CSS tokens for colours, including dark and light themes. Do not scatter literal colours in the landing styles.
- Site nodes use a small colour token per subdomain. Hub nodes use a neutral/accent token.
- Star background is generated by a seeded pseudo-random function, not `Math.random`, so it is stable and testable.
- Links are curved SVG paths with rounded corners, like the `make/map` rail lines.
- Hover and focus lift the node; the active node glows. Hover is not required for anything important.

## Accessibility and keyboard

- Every node is an SVG `<a href="#id">` link with an accessible label, not a button. This gives Enter activation, middle-click and "copy link" for free.
- Focus moves to the panel when a node opens, and back to the node when zooming out.
- The panel is `inert` when closed.
- Hash changes update the title and `aria-current`.
- Phone first. The layout switches between landscape and portrait worlds.
- Keyboard navigation never depends on hover.

## Performance

- Cap visible nodes per view. At root, show site roots and special nodes only. At a site, show sections. At a hub, show its children. At a page, show the page plus faint ancestors.
- Do not load all media at once.
- Parallax uses one `requestAnimationFrame` loop with damping; it stops when the pointer stops.
- No external network requests except when the visitor clicks a real page link.

## Caching

`_headers` currently marks `/style.css` as `immutable` for a year. Returning visitors would keep the old CSS and see a broken map. Fix in the same change:

- Reference `style.css?v=2` (and bump the version on each release), or remove `immutable` and use a short `max-age`.
- Add a rule for `/js/*` with a short `max-age`, since module files keep the same names.
- Fix the `/assets/*` typo: `max-age=3153600` (36 days) is meant to be `31536000`.

## Files

- `package.json`: `{"type": "module"}` only, so Node treats `js/*.js` as ES modules
- `index.html`: new map page, SVG scene, panel, header, footer, static no-JS site list
- `style.css`: map styles and tokens; keep the about-page styles
- `sites.html`: new static page listing subdomains only
- `js/sites.js`: subdomain list for the sitemap and site roots
- `js/network.js`: full node tree
- `js/layout.js`: computed node positions for landscape and portrait worlds
- `js/camera.js`: `fitRect`, `scaleBox`, `mixBox`, `easeInOut`
- `js/route.js`: `parseRoute`, `parentHash`
- `js/scene.js`: SVG string builder, pure and testable
- `js/panel.js`: panel HTML, pure and testable
- `js/parallax.js`: pointer normalization and damping (phase 2)
- `js/main.js`: DOM wiring
- `test/*.mjs`: Node tests for data, layout, camera, route, scene, panel and static-list rules
- `assets/`: local media files
- `_headers`: caching fixes above
- `sitemap.xml`: add `/sites.html`
- `PLAN.md`: this plan
- `about.html`: updated about page and About node destination
- `README.md`: updated structure
- `HANDOFF.md`: written once work is underway (see step 9)

## Sites page

`sites.html` is static HTML: one row per subdomain with the site name, a brief description and a link. It needs no JavaScript, so there is no `<noscript>` copy to drift. A test parses `sites.html` and checks its rows match `SITES` exactly (same ids, URLs and descriptions, same order).

Also update `sitemap.xml` to include `/` and `/sites.html`. Do not confuse the search sitemap with the visitor sites page.

## Phases

- Phase 1 (steps 1 to 7): data, layout, camera, route, scene, panel, DOM wiring, landing page, sites page, caching fixes. The map works, with plain node styling and placeholder media.
- Phase 2 (step 8): seeded star field, parallax, glow and real media. Each piece is optional and can ship separately.

## Build steps and verification

1. Inventory and data
   - Fill in "Full node list" from `plan.json`.
   - Write `package.json`, `js/sites.js` and `js/network.js`.
   - Include `about` and `dei` as special nodes and exclude `plan`, `send`, `aseprite` and `make/bloodbowl`.
   - Verify: unique ids; every parent exists; `id === parent + '/' + slug` below site level; every site has a description and URL; every hub has children; `about` has no children; no excluded id appears.

2. Pure layout, camera and route
   - Write `layout.js`, `camera.js`, `route.js`.
   - Verify: no overlapping nodes in each world; every node fits inside its world; adding a dummy child moves no other site; `parentHash` returns one level up and matches `parent`; `parseRoute` handles root, site, hub, page, special and unknown hashes.

3. Scene and panel
   - Build the SVG string in `scene.js`; build panel HTML in `panel.js`.
   - Verify: text is escaped; nodes are `<a href="#id">`; nodes with children list all children; nodes without children include an "Open page" link; no external asset URLs.

4. DOM wiring
   - Wire `main.js`: hash routing with the history rule, deep links, unknown-hash fallback, click and keyboard handling, panel, focus, Escape, resize, reduced motion.
   - Verify in a browser: click a site, zoom in; click a hub, see the child list; click a page, see media and "Open page"; Escape and Back zoom out without fighting; a deep link loads directly; a bad hash goes to root.

5. Landing page
   - Replace the card grid in `index.html` with the map and the static no-JS site list.
   - Verify: the header links to `sites.html` and `about.html`; no old card markup remains; the page renders at desktop and phone sizes; with JS disabled the site list shows and works.

6. Sites page
   - Write `sites.html` as static HTML.
   - Verify: one row per subdomain, no paths, brief descriptions, working links; the match test against `SITES` passes.

7. Caching and preflight
   - Apply the `_headers` changes and the `style.css?v=2` reference.
   - `node --test test/*.mjs`
   - `python3 -m http.server 8000`, then open `http://localhost:8000`
   - Check desktop and 375x812 phone sizes
   - Check keyboard, Escape, Back, deep links and reduced motion
   - Confirm no external host requests in the browser network panel
   - `grep -rn $'\xe2\x80\x94'` over every touched file (including `about.html`, `README.md`, `style.css`, `_headers`, `sitemap.xml`) prints nothing

8. Phase 2 polish
   - Seeded star field, parallax, glow, real media as Paul supplies it.
   - Verify: star field is identical across reloads; parallax moves background and links more than nodes and stops with reduced motion; click targets do not move under the pointer.

9. Record
   - Update `README.md` structure.
   - Write a dated `HANDOFF.md` entry containing: what was built, which **[confirm]** items were decided and how, what is still placeholder media, and what is still unverified.

## Acceptance criteria

- The sites page lists only subdomains, with one brief description per site, and matches `SITES`. `plan` and `send` are excluded.
- The map has root, site, hub, page and special zoom levels.
- `about` is directly under the centre root, has no children, and its links are external.
- `trivia.contrapaul.com` is included. `bloodbowl.contrapaul.com` is the canonical Blood Bowl entry and is a leaf site.
- The map is curated: not every page from `plan.json` is shown.
- A hub such as `edu/tools` shows a description and all connected tool pages, not the real tool page.
- Every child page under an included hub is grouped and shown in the hub panel.
- A node without children shows description, media and a working "Open page" link.
- Clicking a node zooms in; Escape, Back, "Zoom out" or a background click zooms out one level, and Back never re-zooms into the view just left.
- Deep links load directly; unknown hashes go to root.
- With JavaScript off, `index.html` shows a working list of sites.
- Returning visitors get the new CSS (no stale `immutable` cache).
- Mouse parallax moves background and links more than nodes, and stops with reduced motion (phase 2).
- All nodes are keyboard reachable and focusable.
- No assets, fonts or data are fetched from another host.
- `node --test` passes.
- The page works at desktop and phone sizes.
- No em dash characters in touched files.

## Decisions still to confirm

Each has a suggested default above, marked **[confirm]**:

- Visitor sitemap filename: `sites.html`.
- Leaf sites use the page panel.
- History rule for zooming out.
- The map is always dark.
- Old card links: Makerworld, Instagram and YouTube go to the About panel; the two blog posts become `blog` page nodes or are dropped.
- Whether to attach the make.contrapaul.com repo for `make/map` code, or write fresh.
