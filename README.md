  # contrapaul.com
Main landing page and personal hub for contrapaul.com.
## Structure
```
/
├── index.html      — Main landing page
├── style.css       — Stylesheet (no external dependencies)
├── robots.txt      — Search crawler rules
├── sitemap.xml     — Search sitemap
├── _headers        — Cloudflare Pages HTTP headers
├── _redirects      — Cloudflare Pages redirects
└── assets/         — Images, icons (add as needed)
```
## Deployment
Deployed via Cloudflare Pages. Push to `main` branch triggers automatic deployment.
- No build step required
- Build command: (blank)
- Build output directory: (blank / root)
## Subdomains (future)
- `edu.contrapaul.com` — IB DP Design education resources
- `make.contrapaul.com` — Maker & creator portfolio
