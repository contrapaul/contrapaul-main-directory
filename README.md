# contrapaul.com
Main landing page and personal hub for contrapaul.com. The landing page is a star map of every contrapaul site and the pages inside them.
## Structure
```
/
├── index.html      - Star map landing page (plus a no-JS list of sites)
├── sites.html      - Visitor list of every subdomain
├── about.html      - About page (uses style.css)
├── map.css         - Map and sites page styles
├── style.css       - About page styles
├── js/
│   ├── sites.js    - One entry per subdomain
│   ├── network.js  - Full map tree (site nodes come from sites.js)
│   ├── layout.js   - Computed orbits and positions
│   ├── camera.js   - viewBox camera that follows a moving target
│   ├── route.js    - Hash routing helpers
│   ├── scene.js    - SVG markup builder
│   ├── panel.js    - Panel markup builder
│   ├── stars.js    - Seeded star field
│   ├── random.js   - Seeded random numbers
│   └── main.js     - DOM wiring and animation loop
├── test/           - Node tests: npm test
├── dei/            - DEI staff training page (own tests)
├── robots.txt      - Search crawler rules
├── sitemap.xml     - Search sitemap
├── _headers        - Cloudflare Pages HTTP headers
├── _redirects      - Cloudflare Pages redirects
└── assets/         - Images, icons (add as needed)
```
## Adding a site or page
- New subdomain: add an entry to `js/sites.js`, then add the same row to `sites.html` and the fallback list in `index.html`. `npm test` fails until all three match.
- New page or hub: add a node to `js/network.js`. Its id is its parent's id plus one segment. The layout finds it a slot.
## Local preview
```
python3 -m http.server 8000
npm test
```
## Deployment
Deployed via Cloudflare Pages. Push to `main` branch triggers automatic deployment.
- No build step required
- Build command: (blank)
- Build output directory: (blank / root)
