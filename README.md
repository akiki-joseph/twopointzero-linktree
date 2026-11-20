# TwoPointZero link tree

Link tree for TwoPointZero basketball court & academy (Jdeideh, Lebanon), hosted on Cloudflare Workers (static assets + a small Worker for tracking).

- `public/` — the page (`index.html`), the stats page (`stats.html`) and the logo
- `functions/api/track.js` — saves page visits and link clicks
- `functions/api/stats.js` — numbers for the stats page
- `src/index.js` — the Worker: routes `/api/*` to the functions above, everything else to `public/`
- `wrangler.jsonc` — Worker config (assets folder and the D1 database `twopointzero-db`, bound as `DB`)
- The `events` table is created automatically on first use.

Pushing to `main` redeploys automatically through Cloudflare's GitHub integration.

## Adding a link
Add a button inside `<nav class="links">` in `public/index.html` with `data-track="name"`, add `name` to `LINKS` in `functions/api/track.js`, and add it to `stats.html`.
