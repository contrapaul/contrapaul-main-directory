# HANDOFF.md

## 2026-11-23: landing page draft 1 (dynamic galaxy)

### Built

- `index.html`: the star map, an intro shown at the root view, the side panel (bottom sheet on phones) and a static no-JS list of sites.
- `sites.html`: static list of every subdomain, one line each.
- `map.css`: map, panel and sites page styles. The map is always dark; the panel and sites page follow light/dark.
- `js/`: `sites.js`, `network.js`, `layout.js`, `camera.js`, `route.js`, `scene.js`, `panel.js`, `stars.js`, `random.js`, `main.js`.
- `test/`: 20 Node tests (`npm test`): data rules, no collisions at 200 random orbit phases, layout stability, routing, camera fit and convergence, escaping, panel contents, and the static lists matching `SITES`.
- `package.json` (`"type": "module"` only), `_headers` (short cache for `map.css` and `js/*`, `/assets/*` max-age typo fixed), `sitemap.xml` (adds `/sites.html`), `README.md`.

### Decided (see "Direction change" in PLAN.md)

- Orbiting rings instead of fixed positions; the active node's carrier rings stop; hover/focus calms everything.
- Camera follows the live node; node size is capped on screen; parallax is on the star layers only.
- All **[confirm]** defaults in PLAN.md were used as written: `sites.html`, leaf sites use the page panel, the history rule, always-dark map, old card links in the About panel and the two blog posts as `blog` pages.

### Verified (headless Chromium, 1280x800 and 375x812)

- Click site, hub, page: zooms in, panel shows children or "Open page".
- Escape from a page goes back one level through history; Back goes one more; a bad hash lands on the root.
- Tab reaches map nodes after the header; Enter zooms and focuses the panel title; Escape returns focus to the node.
- Reduced motion: nodes hold still. No JavaScript: intro plus a working list of sites.
- No requests to other hosts. No console errors.

### Still open

- **Node list is partial.** `plan.json` could not be fetched from this environment. Nodes beyond the sites come from PLAN.md and the old cards. Descriptions marked `[Paul]` are placeholders, and URLs for pages not linked from the old cards (breadboard, taskanalysis, MYP, edu/ai, make hubs, each game) are guesses following the site's URL pattern.
- **No real media.** Leaf panels show a placeholder.
- **`about.html` not updated yet**, and the old card CSS in `style.css` is now unused. Remove it once the map is accepted.
- Not checked on a real phone or in Safari/Firefox; touch-only behaviour (no hover calm) is untested by hand.
- Labels can still touch at the phone root view when two small sites sit close.
