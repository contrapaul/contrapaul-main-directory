# HANDOFF.md

## 2026-11-23: 3D galaxy demo at /galaxy/ (branch `galaxy-demo`, local, not pushed)

### Asked

Paul: demo first in its own folder, real 3D with three.js, try an Inkling swarm first, add smooth navigation and a pull-up conventional map, placeholders for media. Paul decides whether it replaces the landing page.

### Built

- `galaxy/`: `index.html` (canvas, label layer, panel, site map `<dialog>`, no-JS list), `galaxy.css`, `vendor/three-0.186.1/` (minified from the npm package, with its licence, loaded through an import map).
- Lead (Claude): `js/cosmos.js` (stars on log-spiral arms, planets and moons on inclined Kepler orbits, `positionsAt(t)`), `js/view.js` (camera fit, flights, lit-side azimuth), `js/atlas.js` (site map tree, label relations), `js/main.js` (renderer, flights, labels, routing, panel, site map). Kept from draft 1: `sites.js`, `network.js`, `route.js`, `panel.js`, `random.js`.
- Swarm (Inkling 2 Mini on the Spark, `low` thinking, own worktrees): `js/three/galaxy.js` (50k disk points, core glow, sky), `js/three/star.js` (granulated, limb-darkened body and halo), `js/three/planet.js` (six surface types, lit from the star, atmosphere rim, ringed gas giants). Each finished its card in 2 to 5 minutes with one commit and tests; the briefs gave exact formulas. Runner and briefs: `tools/swarm/`; rules: `AGENTS.md`.
- 33 Node tests (`npm test`; `three` is a dev dependency so Node can import it).

### Decided (lead)

- Smooth navigation: a flight eases distance in log space, keeps the target's angle from the screen centre shrinking when zooming in, and rises between far systems. After landing, the camera follows the live, orbiting target. At a planet or moon the camera swings to the lit side. Hovering or focusing a label slows time.
- No bloom pass and no log depth buffer: glow quads instead, and `near`/`far` follow the camera distance.
- Additive glow shaders skip the sRGB conversion. With it, faint tails were lifted into a flat grey halo and a washed-out disk (my error in the first spec; fixed by the lead after merging).
- Galaxy arms thinned (`0.12 + 0.12 r / 1000`) so they read at the galaxy view.

### Verified

- `npm test`: 33 pass.
- Headless Chromium (playwright, GPU) at 1280x800 and 375x812: galaxy, system, hub, moon views; Escape, Back, a far jump through the site map; the site map sheet. 60 fps at the cap, at most 46 draw calls, 50k points desktop and 20k phone. Only `localhost` requested; the only console error is a missing favicon (404).

### Still open

- Not seen on a real phone, in Safari or Firefox, or by Paul.
- Labels overlap on the phone galaxy view and in busy systems (edu/tools). Playwright reports labels as never "stable" because they orbit; real clicks work, but moving targets may be hard to tap on a phone.
- The galaxy is small on a portrait phone (it fits the width).
- Pink star-forming knots look saturated up close. Tune by eye.
- Node list, descriptions and media are still the draft-1 placeholders.
- Rolling into the main page: move `galaxy/` contents to the root, drop `noindex`, and switch `style.css` users as PLAN.md describes.

## 2026-11-23: next step, a real 3D galaxy (for a local session)

### What Paul asked for

- A much more realistic, **real 3D** galaxy built with **three.js**. "Nothing fake": no 2D projection tricks.
- Star systems with orbiting planets, some with moons.
- Use the Inkling swarm on the Spark, per `INKLING.md` (Paul's `~/Documents/INKLING.md`).

### Why this is a handoff

The cloud session that built draft 1 could not reach the Spark: `spark-053e.taila01541.ts.net` does not resolve there, and `ssh` and `pi` are not installed. Paul will run the next step as a local session. Nothing for the 3D version has been written yet.

### Where things stand

- Branch `claude/eager-sagan-7c5vz1` holds draft 1, a 2D SVG orbit map (entry below). `npm test` passes 20 tests.
- **Keep:** `js/sites.js`, `js/network.js` (node tree and id rule), `js/route.js`, `js/panel.js`, `js/random.js`, `sites.html`, the no-JS list in `index.html`, the panel and header styles in `map.css`, the history rule and keyboard and focus behaviour in `main.js`, and the tests for all of these.
- **Replace:** `js/layout.js`, `js/scene.js`, `js/camera.js`, `js/stars.js`, the SVG stage in `index.html` and the animation loop in `main.js`, together with their tests (`layout.test.mjs`, the camera half of `route-camera.test.mjs`, the scene and stars half of `scene-panel.test.mjs`).
- PLAN.md's "Direction change 2026-11-23" section describes the 2D draft. Update it once the 3D decisions below are confirmed.
- With `plan.json` reachable locally, fill in the full node list and replace the `[Paul]` placeholders and guessed URLs in `js/network.js`. This needs no 3D work and can happen first.

### Suggested design (for the lead to confirm or change)

Mapping from the site tree to astronomy:

| Tree | Galaxy |
|---|---|
| root `contrapaul` | galactic core (bright bulge, no sphere) |
| site, and special (`about`, `dei`) | star system: a star, placed along a spiral arm; specials sit close to the core |
| page directly under a site (`edu/ai`, `games/*`, blog posts) | planet orbiting the star |
| hub (`edu/tools`, `edu/curriculum`, `make/tools`, `make/fun`) | planet with moons |
| page under a hub | moon |
| leaf site (`blurt`, `trivia`, ...) | a lone star |

Technical choices:

- **three.js, vendored and pinned.** Copy `three.module.min.js` and the bloom addons (`EffectComposer`, `RenderPass`, `UnrealBloomPass`, `OutputPass` and their dependencies) into `vendor/three-<version>/`, loaded through an import map. There is no CDN (the plan's no-external-hosts rule), and the versioned folder can be cached as `immutable` in `_headers`.
- **Scale.** Galaxy radius about 1000 units, systems about 10 to 30 units across, a logarithmic depth buffer. At the galaxy view a system is just its star; zooming in reveals planets.
- **Motion.** The galaxy disk turns slowly. Planets follow Kepler's law (period proportional to r^1.5) on slightly inclined orbits; moons orbit their planets. Faint orbit lines are shown only for the active system.
- **Rendering.** Galaxy: about 30k to 60k additive points (log-spiral arms, warm bulge, blue-white arms, sparse pink star-forming regions) plus a distant star sphere. Stars: an emissive shader with a few spectral colours, granulation, limb darkening and a glow sprite, plus bloom. Planets: one shader for rocky, gas and ice types, with day and night set by a uniform holding that planet's star position (no point lights) and an atmosphere rim. Moons: the rocky type, grey.
- **Labels and clicks.** HTML `<a href="#id">` labels projected over the canvas each frame. This keeps the current accessibility, focus and history behaviour, and gives large click targets. The canvas is `aria-hidden`. Show labels using the same relation rules as draft 1 (active, path, children, siblings).
- **Camera.** A perspective camera following the active node's live position, in spherical coordinates (distance, azimuth, elevation). Distance eases in log space and the camera drifts slowly around the target. Mouse movement nudges azimuth and elevation, which gives true 3D parallax. Use `camera.setViewOffset` to keep the target clear of the panel (right side on desktop, bottom sheet on phones). Hovering a label slows time, as in draft 1.
- **Fallbacks.** No WebGL: keep the static list (do not add `map-ready`). Reduced motion: no orbit or drift, camera snaps. Cap pixel ratio at 2 (1.5 on phones), and pause when the tab is hidden.

### Suggested swarm split (per INKLING.md sections 4 to 6)

The project is small, so planners are optional; at most one art-direction planner (`high`).

**Lead (Claude, local) does first.** INKLING.md notes that 3D maths stalls Inkling, so all orientation and vector maths stays with the lead:

1. Vendor three.js and add the import map.
2. Write the contract: a pure, Node-tested `js/cosmos.js` (system placement on arms, orbit radii, inclinations, periods, phases, `positionsAt(t)`) and a pure `js/view.js` (camera spherical maths, easing, view per node kind).
3. Build a runnable skeleton: renderer, bloom, plain spheres for star, planet and moon, labels, camera, routing, panel. It must already work end to end.
4. Write `AGENTS.md` (ownership, no remote assets, `npm test`, "you cannot open a browser") and copy `tools/swarm/` from the starfighters repo.

**Builders (Inkling, `low` thinking, own worktrees, disjoint files).** Each brief gives exact formulas, the uniforms it receives and target values such as "core glow at most X". Open-ended visual briefs did badly in the starfighters run.

| Role | Owns | Brief essentials |
|---|---|---|
| `galaxy` | `js/three/galaxy.js` | Arm formula, counts, colour ramp, point size attenuation, seeded via `js/random.js` |
| `star` | `js/three/star.js` | Shader uniforms (colour, time), limb darkening, granulation, glow sprite size relative to radius |
| `planet` | `js/three/planet.js` | Planet types, `uStarPos` lighting, atmosphere rim, band and noise parameters; moons reuse the rocky type |
| `data` | `js/network.js`, `js/sites.js` (descriptions only) | Full node list from `plan.json`; id rule; tests stay green |

**Lead after merging:** a headless and a visible browser pass at 1280x800 and 375x812. Check for whiteout from stacked additive effects and bloom (a starfighters bug), labels at every zoom level, fps and draw calls, and focus and Escape and Back. Then send short, specific bug lists to fixers.

### Acceptance additions for the 3D version

- Real 3D scene in three.js; all assets local; `npm test` green.
- Every site is a star system; hubs are planets with moons; pages are planets or moons.
- Zooming in flies the camera; Escape, Back and "Zoom out" fly back out one level.
- Labels are keyboard-focusable links; the no-WebGL and no-JS fallback is the site list.
- Smooth on a mid-range phone at 375x812 (a frame-time budget to be set by the lead).

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
