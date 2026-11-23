# PLAN.md: contrapaul.com landing page overhaul

Asked 2026-11-17: replace the card grid with an interactive star map of the growing site network. Visitors should explore pages, sections and subdomains by zooming, without loading the actual pages unless they choose to visit them.

## Assumptions

- The node inventory is a curated copy of `plan.contrapaul.com/plan.json`, read on 2026-11-10. The file is a reference, not a node list.
- Not every page is shown. `plan` is excluded, and `send` and `aseprite` are API/reference entries only.
- All child pages under each included hub are grouped under that hub and shown in its panel.
- The landing page becomes the map. The old card grid is removed.
- `about.html` is updated and becomes a special leaf node directly under the centre node. It has no child nodes.
- This plan is a draft. Paul will edit it before implementation.
- The sitemap is a separate `sitemap.html` page, not a hash view. It lists one entry per subdomain only.
- Media will be local files in `assets/`. Until Paul supplies them, use `[Paul]` placeholders and code-drawn animations.
- The hash URL is the source of truth for the view, the same pattern as `make.contrapaul.com/map`.

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
- `about` - special node under the centre, not a subdomain. It is not listed on the sitemap.

Exclude `plan.contrapaul.com` (mission control, not shown), `send.contrapaul.com` (API endpoint only) and `aseprite` (reference, not a project). `make.contrapaul.com/tools/languages` and `make.contrapaul.com/fun/students` are paths on `make`, not subdomains.

## Node hierarchy

The tree is:

- root hub: `contrapaul.com`
- site roots: each subdomain, with `dei` and `about` as special/page nodes directly under the root
- `about` is a special leaf with no children; its panel links out to external sites
- section hubs: `edu/curriculum`, `edu/tools`, `make/tools`, `make/fun`, `games`, and similar indexes
- page/tool nodes: the individual projects under those hubs

Examples:

- `edu` -> `edu/curriculum` -> `edu/curriculum/dp`, `edu/curriculum/myp`
- `edu/ai` is its own section under `edu`
- `edu/tools` -> each tool page (`macropad`, `breadboard`, `taskanalysis`, and so on)
- `make` -> `make/tools`, `make/fun`
- `bloodbowl` standalone -> `bloodbowl` page. The standalone directory is the canonical entry; `make/bloodbowl` is not a node.
- `games` -> `castle-assault`, `recess-dodgeball`, `recess-rivals`, `runestone-expedition`, `void-pirates`, `mortis`

A hub node shows a brief description and all its connected pages. It does not show the real page content. A leaf node shows its description, optional image/video/animation, and an explicit "Open page" link.

## Data model

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

- `id`: hash-safe, lowercase, no spaces, e.g. `edu/tools/macropad`
- `label`: short name shown on the map
- `site`: which subdomain it belongs to
- `parent`: one level up
- `kind`: root, site, hub or page
- `description`: one or two sentences
- `media`: optional local image, video or animation
- `url`: the real page URL
- `status`: optional, copied from `plan.json`

Descriptions are copied from `plan.json`, not fetched at runtime. When `plan.json` changes, update `js/network.js` and `js/sites.js` in the same commit.

## Roadmap for adding future entries

- New subdomain: add one `SITES` entry with name, URL and description; add a site root to `NODES` with `parent: 'root'` and `kind: 'site'`; add section hubs and page nodes as wanted. The sitemap page and tests pick it up from `SITES`.
- New page under an existing hub: add a `NODES` entry with `parent`, `kind: 'page'`, description, media and URL. The hub panel lists it automatically.
- New section worth its own hub: add `kind: 'hub'`, set its parent, and add child page nodes.
- Removed or renamed entry: delete from `NODES` and `SITES`; update tests and descriptions.
- Keep `plan.json` as a reference. Update local data in the same commit when the reference changes.
- Exclusions stay out of `SITES` and `NODES`: `plan`, `send`, `aseprite`, and `make/bloodbowl`.

## Experience

### World view

The root view is a dark star map. Site nodes and the About node sit around a central hub on constellation lines. The map has a fixed star background, soft glow around nodes, and site labels. Mouse movement shifts the star layer, the link layer and the node layer by different amounts, so the map has parallax depth without making click targets unstable.

### Zoom levels

The camera is an SVG `viewBox`, like `make/map/js/camera.js`. Each click changes the hash and zooms to the active node:

- `#` or `#map`: root view
- `#edu`: site view
- `#edu/tools`: hub view
- `#edu/tools/macropad`: page view

`Escape`, the "Zoom out" link, the browser Back button, or a click on the background moves one level up. `parentHash` removes the last segment.

A zoom is animated with `fitRect`, `mixBox` and `easeInOut`, about 800 ms. Reduced motion jumps straight to the new view.

### Hub behaviour

At a hub view, the panel shows:

- breadcrumbs: Map -> site -> hub
- a short description
- a list of every connected page, each with a one-line description and a link into its node
- a "Visit the hub page" link if the hub is a real page

The hub page itself is not rendered inside the panel. The list is the expansion.

### Page behaviour

At a page view, the panel shows:

- breadcrumbs
- the page name
- description
- media: local image, local video or inline animation
- "Open page" link to the real URL
- "Zoom out" link

Media is lazy-loaded only for the active node. Videos use controls and no autoplay. Animations pause when `prefers-reduced-motion` is set.

### About node

The About node is a special leaf connected directly to the centre root. Clicking it zooms to the About panel. The panel shows the description, media and external links. It has no child nodes, so there are no further zooms from About. `about.html` is updated and remains the local destination.

## Visual rules

- Keep JetBrains Mono from `WEB/css/jetbrains-mono.css`; no CDN fonts.
- Use CSS tokens for colours, including dark and light themes. Do not scatter literal colours in the landing styles.
- Site nodes use a small colour token per subdomain. Hub nodes use a neutral/accent token.
- Star background is generated by a seeded pseudo-random function, not `Math.random`, so it is stable and testable.
- Links are curved SVG paths with rounded corners, like the `make/map` rail lines.
- Hover and focus lift the node; the active node glows. Hover is not required for anything important.

## Accessibility and keyboard

- Every node is a button with an accessible label.
- Enter and Space activate a node.
- Focus moves to the panel when a node opens, and back to the node when zooming out.
- The panel is `inert` when closed.
- Hash changes update the title and `aria-current`.
- Phone first. The layout switches between landscape and portrait worlds, like `make/map/js/layout.js`.
- Keyboard navigation never depends on hover.

## Performance

- Cap visible nodes per view. At root, show site roots and the About node only. At a site, show sections. At a hub, show its children. At a page, show the page plus faint ancestors.
- Do not load all media at once.
- Parallax uses one `requestAnimationFrame` loop with damping; it stops when the pointer stops.
- No external network requests except when the visitor clicks a real page link.

## Files

- `index.html`: new map page, SVG scene, panel, header, footer
- `style.css`: map styles and tokens; keep the about-page styles
- `sitemap.html`: new standalone page listing subdomains only
- `js/sites.js`: subdomain list for the sitemap and site roots
- `js/network.js`: full node tree
- `js/layout.js`: node positions for landscape and portrait worlds
- `js/camera.js`: `fitRect`, `scaleBox`, `mixBox`, `easeInOut`
- `js/route.js`: `parseRoute`, `parentHash`
- `js/scene.js`: SVG string builder, pure and testable
- `js/panel.js`: panel HTML, pure and testable
- `js/parallax.js`: pointer normalization and damping
- `js/main.js`: DOM wiring
- `test/*.mjs`: Node tests for data, layout, camera, route, scene and sitemap rules
- `assets/`: local media files
- `PLAN.md`: this plan
- `about.html`: updated about page and About node destination
- `HANDOFF.md`: written only when work is underway; the current plan outlines what it must contain

## Sitemap page

`sitemap.html` lists only subdomains. Each row has the site name, a brief description and a link. It uses the same `SITES` data as the map. It excludes `plan.contrapaul.com` and API-only `send`. If JavaScript is off, a `<noscript>` fallback lists the same entries.

Also update `sitemap.xml` to include `/` and `/sitemap.html`. Do not confuse the search sitemap with the visitor sitemap page.

## Build steps and verification

1. Inventory and data
   - Write `js/sites.js` and `js/network.js` from the curated inventory.
   - Include `about` as a special leaf and exclude `plan`, `send`, `aseprite` and `make/bloodbowl`.
   - Verify: unique ids, every parent exists, every site has a description and URL, every hub has children, `about` has no children.

2. Pure layout and camera
   - Write `layout.js`, `camera.js`, `route.js`.
   - Verify: no overlapping nodes in each world; every node fits inside its world; `parentHash` returns one level up; `parseRoute` handles root, site, hub and page.

3. Scene and panel
   - Build the SVG string in `scene.js`; build panel HTML in `panel.js`.
   - Verify: text is escaped; hub panels list all children; page panels include a visit link; no external asset URLs.

4. DOM wiring
   - Wire `main.js`: hash routing, click and keyboard handling, panel, focus, Escape, resize, reduced motion, parallax.
   - Verify in a browser: click a site, zoom in; click a hub, see the child list; click a page, see media and "Open page"; Escape and Back zoom out.

5. Landing page
   - Replace the card grid in `index.html` with the map.
   - Verify: the header links to `sitemap.html` and `about.html`; no old card markup remains; the page renders at desktop and phone sizes.

6. Sitemap page
   - Write `sitemap.html` from `SITES`.
   - Verify: one row per subdomain, no paths, brief descriptions, working links.

7. Preflight
   - `node --test test/*.mjs`
   - `python3 -m http.server 8000`, then open `http://localhost:8000`
   - Check desktop and 375x812 phone sizes
   - Check keyboard, Escape, Back, reduced motion and parallax
   - Confirm no external host requests in the browser network panel
   - `grep -rn $'\xe2\x80\x94' index.html style.css sitemap.html js test` prints nothing for touched files

8. Record
   - Update `README.md` structure.
   - When work is underway, write a dated `HANDOFF.md` entry with what was built, what was decided and what is still unverified. The current plan only outlines what it must contain.

## Acceptance criteria

- The sitemap page lists only subdomains, with one brief description per site. `plan` is excluded.
- The map has root, site, hub, page and special zoom levels.
- `about` is directly under the centre root, has no children, and its links are external.
- `trivia.contrapaul.com` is included. `bloodbowl.contrapaul.com` is the canonical Blood Bowl entry.
- The map is curated: not every page from `plan.json` is shown.
- A hub such as `edu/tools` shows a description and all connected tool pages, not the real tool page.
- Every child page under an included hub is grouped and shown in the hub panel.
- A page node shows description, media and a working "Open page" link.
- Clicking a node zooms in; Escape, Back, "Zoom out" or a background click zooms out one level.
- Mouse parallax moves background and links more than nodes, and stops with reduced motion.
- All nodes are keyboard reachable and focusable.
- No assets, fonts or data are fetched from another host.
- `node --test` passes.
- The page works at desktop and phone sizes.
- No em dash characters in touched files.

## Decisions still to confirm

- Every child page under an included hub is grouped and shown. The overall map still excludes loose pages, `plan`, `send`, `aseprite` and `make/bloodbowl`. This is fixed for the initial plan.
- Is `sitemap.html` the right filename, or should it be `sites.html` to avoid confusion with `sitemap.xml`?
- Real media for each node, or placeholders until Paul supplies screenshots, drawings and recordings?
