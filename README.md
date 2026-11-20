# TwoPointZero link tree

Link tree for TwoPointZero basketball court & academy (Jdeideh, Lebanon), hosted on Cloudflare Pages.

- `public/` — the page (`index.html`), the stats page (`stats.html`) and the logo
- `functions/api/track.js` — saves page visits and link clicks
- `functions/api/stats.js` — numbers for the stats page
- Database: Cloudflare D1, bound to the project as `DB`. The `events` table is created automatically on first use.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (leave empty)
- Build output directory: `public`
- Bindings → D1 database → Variable name `DB`

## Adding a link
Add a button inside `<nav class="links">` in `public/index.html` with `data-track="name"`, add `name` to `LINKS` in `functions/api/track.js`, and add it to `stats.html`.
