# Opinly blog integration

Fetches published content from the Opinly SDK API and renders it as static
pages inside TheBrandle's own carved brand components (same pipeline as
`/services/*` and the hand-written blog posts).

## Why static rather than ISR

This site has no framework and no server runtime for pages - it is
pre-rendered HTML served by Vercel. So there is no `revalidatePath()` to call.
The equivalent is: generate at build time, and let the webhook trigger a
redeploy.

## Files

| File | Role |
|---|---|
| `scripts/opinly-lib.js` | API client, cursor pagination, image URLs, ProseMirror -> HTML renderer |
| `scripts/gen-opinly-blog.js` | Generates post pages, index, RSS, sitemap entries |
| `api/opinly-webhook.js` | Svix-verified webhook -> triggers Vercel redeploy |

## Environment variables

| Var | Where | Required | Purpose |
|---|---|---|---|
| `OPINLY_API_KEY` | build + local | yes | Bearer token for `sdk.opinly.ai` |
| `SVIX_WEBHOOK_SECRET` | Vercel env | yes (for webhook) | Verifies webhook signatures |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel env | yes (for webhook) | Deploy Hook the webhook POSTs to |
| `OPINLY_CDN_BASE` | build | no | Overrides the image CDN namespace. Only needed if the Opinly project is re-created and the namespace changes. |

Set these in **Vercel -> Project -> Settings -> Environment Variables**. None
are committed. `OPINLY_API_KEY` is only ever read server-side / at build time,
so it never reaches the browser bundle.

## Running it

```
OPINLY_API_KEY=xxx npm run opinly:build
```

Writes:

- `blog/<slug>/index.html` - one page per Opinly post
- `blog/all/index.html` - article index
- `rss.xml` - feed
- Opinly URLs merged into `thebrandle.framer.website/sitemap.xml` inside an
  idempotent `<!-- opinly:start -->` / `<!-- opinly:end -->` block

Then commit the generated files and push, exactly like the other content.

**Fail-soft:** with no `OPINLY_API_KEY`, or if the API errors, it logs and
exits 0 without touching any files. Safe to run in CI.

## Safety rails already in place

- **Reserved slugs are skipped.** The 3 original Framer posts and the 4
  hand-written posts can never be overwritten (`RESERVED` in the generator).
- **`/blog` is never touched.** The index is written to `/blog/all/` because
  `/blog` is the Framer SPA's own listing. To publish the index at `/blog/`
  instead, set `INDEX_DIR = ''` - note this replaces the SPA listing.
- **Output is escaped.** All API text is HTML-escaped; em dashes are converted
  to hyphens to match site copy convention.
- **Headings are demoted** (h1 -> h2 etc.) so each page keeps a single h1.

## Enabling automatic rebuilds (opt-in - do this deliberately)

The build step is intentionally NOT wired into Vercel. This site has no build
step today, and adding one can change Vercel's output-directory detection and
break the deployment. To enable it when ready:

1. Create a Deploy Hook: **Vercel -> Settings -> Git -> Deploy Hooks**. Copy
   the URL into `VERCEL_DEPLOY_HOOK_URL`.
2. Register `https://www.thebrandle.com/api/opinly-webhook` in the Opinly
   dashboard portal. Copy its signing secret into `SVIX_WEBHOOK_SECRET`.
3. Only then, add a build command in `vercel.json`:
   ```json
   "buildCommand": "npm run opinly:build",
   "outputDirectory": "."
   ```
   `outputDirectory` is the important part - without it Vercel may look for a
   `dist`/`public` folder and serve nothing.
4. Deploy once and verify: `/`, `/services/`, `/blog/website-cost-dubai/` and
   `/sitemap.xml` all still return 200 before trusting it.

Until step 3, run the generator locally and commit the output. That is the
zero-risk path and works fine for content that changes a few times a week.

## Webhook behaviour

Payload: `{ "type": "content.paths-invalidated", "data": { "paths": [...] } }`

- Verifies the Svix signature against `SVIX_WEBHOOK_SECRET`
- **400** on invalid signature, **500** if the secret is unset (fails closed -
  never accepts unverified webhooks)
- **200** on success, triggering the Deploy Hook so pages regenerate
- Returns 200 even if the deploy hook itself fails, so Svix does not retry an
  event that was already accepted (the failure is logged)

## Not built

- Category and author pages (`/content/categories`, `/content/authors`) - the
  endpoints are wired in `opinly-lib.js` (`fetchCategories`, `fetchAuthors`,
  `fetchAuthor`) but no page templates exist yet. Say the word and they follow
  the same pattern.
- Client-side pagination on the index: all posts are rendered at build time, so
  `next_cursor` is consumed during generation rather than in the browser. If the
  catalogue grows past a few hundred posts, paginate the index into
  `/blog/all/page/2/` etc.
