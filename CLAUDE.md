# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for **The Brandle** (a design studio), deployed on Vercel with serverless functions in `api/`. Two kinds of page:

- **Generated static pages**, built by Node scripts in `scripts/` from parts carved out of the Framer export (stylesheet, text presets, nav, footer): the homepage `/`, `/services/*`, `/team/`, `/faq/`, `/projects/` and the static project pages, `/tools/ai-visibility/` and the blog posts.
- **The Framer export**, served by the `vercel.json` catch-all: `/about`, `/contact`, the four CMS case studies and the `/blog` listing.

## Development Commands

```bash
# Start local dev server (port 8080)
node server.js

# Install dependencies
npm install
```

No build step on Vercel. Generated pages are built locally and committed:

```bash
node scripts/gen-homepage.js          # / (copy lives in scripts/home-data.js)
node scripts/gen-service-pages-v2.js  # services, team, faq, projects, tools, sitemap block, llms.txt
node scripts/gen-blog.js              # blog posts
node scripts/gen-framer-routes.js     # per-route copies of the Framer catch-all
```

## Architecture

### Tech Stack
- **Frontend:** Framer-exported static HTML/JS (React 18, Framer Motion)
- **Backend:** Single Vercel serverless function (`/api/contact.js`)
- **Email:** Resend SDK v3 (`resend` npm package)
- **Deployment:** Vercel

### Key Files
- `api/contact.js` — The only hand-written backend code. Handles contact form POST requests, parses multipart/form-data manually (Vercel bodyParser is disabled), and sends email via Resend to `thebrandleteam@gmail.com`.
- `vercel.json` — Routes `/api/contact` to the serverless function; all other routes fall back to `thebrandle.framer.website/index.html` (SPA mode).
- `server.js` — Local dev HTTP server with SPA fallback routing and MIME type handling.
- `framerusercontent.com/` — Cached Framer assets. The contact form component is at `framerusercontent.com/modules/Gz8UZExgZmW0RQsPoz4M/5ciLQSyL2h33NZUb0Z1c/McSGfJuih.js` (source) and `framerusercontent.com/sites/5kj0S8gDMWYNPEPmYNuaP6/b_3HJXBJXkH4NhQLN8uHkdztFurbOyNb16_2W58e0bI.BmirNhYZ.mjs` (bundled production build).
- `thebrandle.framer.website/index.html` — 2.7MB HTML entry point exported from Framer (the catch-all).
- `index.html` (root) — the homepage, **generated** by `scripts/gen-homepage.js`. Not a Framer export since 2026-10-05.
- `scripts/site-shell.js` — shared nav, footer, menu script, text presets and glue CSS used by every generator.
- `_snapshot/components/` — carved Framer parts the generators read (committed). `home-framer.css` is the homepage's trimmed Framer stylesheet, produced by `scripts/trim-home-css.mjs`.

### Contact Form Flow
The homepage form (and its footer newsletter) post JSON `{name, email, phone, plan, message}` to `/api/contact`; the Framer form on `/contact` posts `multipart/form-data`. The handler accepts both.

1. Framer form submits as `multipart/form-data` POST to `/api/contact`
2. `api/contact.js` manually parses the multipart body (bodyParser is disabled in Vercel)
3. Fields are normalized from Framer's Title Case names (`Name`, `E-mail`, `Phone`, `Message`, `Plan`) to camelCase
4. Email sent via Resend SDK v3 — uses the `{data, error}` return pattern (does not throw)

### Environment Variables
- `RESEND_API_KEY` — Required on Vercel. Not committed to the repo.

### What NOT to Edit
- The `framerusercontent.com/` and `framer.com/` directories contain Framer-generated/cached assets. Most files should not be manually edited. The exception is the bundled form component (`.mjs` file) which has been patched in prior commits.
- `thebrandle.framer.website/index.html` is a Framer export — re-exporting from Framer will overwrite manual edits.
- Root `index.html` is generated. Edit `scripts/home-data.js` (copy) or `scripts/gen-homepage.js` (layout) and regenerate. **Never copy the catch-all over it** — the old "keep both index.html files in sync" rule is retired; doing so would put the Framer homepage back.

### Homepage

```bash
node scripts/gen-homepage.js                                   # writes index.html
HOME_OUT=home-preview/index.html node scripts/gen-homepage.js  # noindex preview copy
node scripts/trim-home-css.mjs && node scripts/gen-homepage.js # after changing site-shell.js, presets or section classes
```

`trim-home-css.mjs` needs `node server.js` running and the Playwright install in `~/.dev-browser`. Geometry and motion were measured from the Framer homepage in headless Chrome (tooling in `_snapshot/measure/`, gitignored).

### Routing patch — re-apply after any Framer re-export

`thebrandle.framer.website/index.html` has its `data-framer-hydrate-v2` attribute
renamed to `data-framer-hydrate-v2-disabled-see-CLAUDE-md`.

**Why:** Framer's bootstrap reads the routeId from that attribute and ignores the
URL entirely (`script_main.*.mjs`: `if (hydrateAttr) routeId = attr.routeId; else
routeId = resolveFromURL(...)`). The export baked in the homepage routeId
(`augiA20Il`), and Vercel serves this one file for every non-static path — so
`/about`, `/projects`, `/contact`, `/blog`, all case studies and all Framer blog
posts rendered **homepage content** while showing the correct `<title>`. Ten
sitemap URLs were duplicates of the homepage. Removing the attribute forces the
URL-resolution branch.

The root `index.html` is no longer a Framer file (see Homepage above), so this
patch only concerns the catch-all and the route copies `gen-framer-routes.js`
writes from it.

Two more head patches in the catch-all to re-apply after a re-export:
- **Home links.** Framer's client router would render its own copy of the old
  homepage when someone clicks Home or the logo on a Framer page. A
  capture-phase click handler sends any same-site link to `/` through a full
  page load instead (look for `is a static page now` in the head).
- **Analytics.** The Vercel Web Analytics snippet (`/_vercel/insights/script.js`),
  also emitted by every generator.

Then run `node scripts/gen-framer-routes.js` to refresh the route copies.

Cost: non-homepage routes client-render instead of hydrating (slightly slower
first paint). The proper fix is a Framer export that emits one HTML file per
route; this patch is the workaround that needs no Framer access.
