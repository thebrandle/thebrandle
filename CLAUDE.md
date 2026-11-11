# CLAUDE.md

The live website of **The Brandle**, a design and development studio in Dubai. This repository IS the live site:
every push to `main` deploys to production on Vercel (project `thebrandle.final`) in about a minute. Work carefully,
a mistake goes live.

## How the site is made (since 2026-11-11)

A static site built by `python3 build.py` (Python 3, no packages) from `src/`:

- `src/layout.html`, `src/partials/`, `src/pages/` - the page shell, shared parts and hand-written pages.
- `src/ext/*.py` - pages made from data: `blog.py` (/blog/ and every post), `services.py` (/services/, the service
  and city pages, /locations/), `projects.py` (/projects/ and project pages), `brands.py`, `site.py` (sitemap,
  llms.txt, robots, rss, vercel.json redirects).
- `src/data/` - the data: `blog/` (one `<slug>.json` + `<slug>.html` per post, `index.json`, `cards.json`),
  `services/` (one JSON per page, `_shared.json` for the hub), `projects/`, `redirects.json`, `content-plan.json`.
- Output is written next to `src/`: `index.html`, `blog/`, `services/`, `css/`, `js/`, `sitemap.xml`, `vercel.json` ...
  Never edit output files by hand: change `src/` and rebuild. Commit the rebuilt output with the source.
- `api/` - Vercel functions, separate from the build: `contact.js` (the forms, sends with Resend; takes JSON
  `{name, email, phone, plan, message}`), `cal-slots.js`, `opinly-webhook.js`, `visibility-check.js`.
- `tools/ai-visibility/` - a standalone tool page, not made by the build. `framerusercontent.com/` holds its assets.
- The design work happens on the studio Mac in `~/friday/projects/brandle-two26` (same `src/`, plus drafts and
  heavy media that never ship); `python3 src/export.py ~/thebrandlewebsite` copies it here.

The build stops on a broken house rule (a dash, a banned word, a title or description of the wrong length, a link to
a page that does not exist, a redirect chain). Fix the cause, never the check.

## House rules for copy

- Plain hyphens only: never an en dash or em dash.
- British spelling. "We" for the studio. Short paragraphs. Direct, practical, a little funny, never hype.
- Nothing invented: no statistics, percentages, client names, results, testimonials or quotes that are not already
  published on this site. Prices only from `src/pages/pricing.html` (Build $1,299 / $2,499 / $4,999, Grow $1,599 /
  $3,199 / $6,499). Timelines only from the FAQ and the service pages. No promises about rankings.
- Never call our work "own product" or "client work". Templates are "Our Framer template" / "Our Webflow template".
- No disparaging competitors, no keyword stuffing.

## Blog routine

A cloud routine runs Tuesday, Wednesday and Friday at 09:00 Dubai and does ONE item from `src/data/content-plan.json`:
the first item with `status: "todo"` whose `due` is on or before today (`TZ=Asia/Dubai date +%F`). Nothing due:
change nothing and say so.
The blog covers every service the studio sells (websites, ecommerce, branding, apps and UX, video and motion,
marketing and SEO), never only websites. A post's `group` is the service it is about.

1. Research from this repo only. Read three existing posts (`src/data/blog/<slug>.html`) for voice, the item's
   brief and keywords, and list `blog/`, `services/` and `projects/` so every link you add exists.
2. **new-post** or **expand-post**: write two files:
   - `src/data/blog/drafts/<slug>.json` - the fields listed at the top of `src/new_post.py` (title without the brand,
     h1, description 140 to 160 characters, blurb, group, category, 3 or 4 FAQs, 2 or 3 related services, card art).
     Use the item's slug, title and h1 exactly (drop any " | TheBrandle" suffix from the title).
   - `src/data/blog/drafts/<slug>.html` - the article: an opening paragraph with the main keyword, then 6 to 8 `<h2>`
     sections covering every point of the brief, 1,100 to 1,600 words. Links as `<a href="/path/">words</a>`, each
     URL in the item's `linkTo` once, plus one or two links to related posts or services where they fit.
   - For expand-post, start from the published `src/data/blog/<slug>.html`: keep what is right, add what the brief
     asks, keep the slug.
   Then run `python3 src/new_post.py <slug>` (it checks the rules and writes the data files), then draw the art:
   `npm i --no-save playwright && npx playwright install --with-deps chromium && node src/og/blog-card.mjs <slug>`
   (it writes `assets/blog/<slug>*.jpg` and `assets/blog/covers/<slug>*.jpg`). If the art cannot be drawn, stop and
   publish nothing.
3. **money-page** (a new service page): copy the closest page in `src/data/services/` to `<slug>.json` and rewrite
   every field for the brief; title ends " | The Brandle" (50 to 60 characters), description 140 to 160. Add the slug
   to the right group in `src/data/services/_shared.json` and raise the service count written there ("Twenty", "20")
   by one. **service-pages**: edit only the named pages, copy only, keep every existing fact.
4. `python3 build.py` must finish with "built N pages". Then `git status` must show only what the item should touch:
   for a post, its data files, its art, the new `blog/<slug>/index.html`, `blog/index.html`, the other posts whose
   "related" cards changed, `sitemap.xml`, `rss.xml`, `llms.txt` and `content-plan.json`. Revert anything else.
5. Set the item's `status` to "done" and `published` to today in `content-plan.json`, rebuild, and make one commit:
   `feat(blog): "<h1>" (content plan item <n>)` (or `feat(services): ...`) with a two-line body. Push with
   `git push origin HEAD:main`; if rejected, push to `claude/content-plan-<n>` and open a pull request.
6. About 90 seconds after the push, run `python3 src/indexnow.py /blog/<slug>/ /blog/` (or the service path) so Bing
   recrawls it now, then `curl` the live page (https://www.thebrandle.com/blog/<slug>/ or /services/<slug>/):
   it must return 200 and its `<title>` must contain the new title. Report if not.
7. Final message (all Muteeb reads): item number and title, live URL, word count, keywords covered, anything unsure.

Never touch `api/`, `tools/`, `vercel.json` by hand (the build writes it), `HANDOFF.md`, or other posts' text.
