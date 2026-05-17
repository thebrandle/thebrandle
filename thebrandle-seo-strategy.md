# TheBrandle — SEO Strategy
**Updated:** 2026-05-18 | **Domain:** https://www.thebrandle.com

---

## TL;DR

TheBrandle's site is a Framer-exported static SPA. We **do not have Framer source access** — only the deployed export. This is a hard constraint that rules out the "build dedicated service pages" approach from earlier strategy drafts.

**The realistic SEO play is homepage-first:** maximise on-page signals, schema markup, technical SEO, and off-site authority on the one URL that actually exists. Project case study pages and a /services page can be added later **only if** routing is fixed (see issue below) and either Framer access is restored or pages are pre-rendered.

---

## Critical Finding — Routing is Broken

Tested 2026-05-18: only `/` returns HTTP 200. **Every other URL on the site returns 404**, including routes the Framer SPA is supposed to handle internally:

| URL | Status |
|---|---|
| `/` | ✅ 200 |
| `/projects` | ❌ 404 |
| `/about` | ❌ 404 |
| `/contact` | ❌ 404 |
| `/blog` | ❌ 404 |
| `/projects/dropx-website-design` | ⚠️ 302 → redirects to `/projects/vero-app-development` which also 404s |
| `/projects/radiant-skincare-branding` | ❌ 404 |
| `/projects/stoyo-branding` | ❌ 404 |

**SEO consequence:** Google can only index the homepage. No project pages, no service pages, no internal pages will ever rank. The Framer SPA's React Router handles routing client-side but Vercel returns 404 before the SPA loads.

**Likely root cause:** The catch-all rewrite `/(.*) → /thebrandle.framer.website/index.html` in `vercel.json` isn't applying to non-root paths. Possibly because `cleanUrls: true` is interfering, or the root `/index.html` static file resolution is short-circuiting only for `/`.

**Priority:** Fix routing before any other SEO investment. Without working deep URLs the site cannot scale beyond one indexed page no matter what content we produce.

---

## Foundations (Done)

| Item | Status | Commit |
|---|---|---|
| Canonical URL → `https://www.thebrandle.com/` | ✅ Live | `457fd66` |
| Sitemap.xml at `/sitemap.xml` | ✅ Live (homepage only after 2026-05-18) | this commit |
| robots.txt allowing all crawlers | ✅ Live | `cacf0d0` |
| Keyword-rich title, meta, og/twitter | ✅ Live | `cacf0d0` |
| ProfessionalService JSON-LD schema | ✅ Enhanced with OfferCatalog (6 services) | this commit |
| FAQPage JSON-LD schema | ✅ Added with 5 homepage FAQs | this commit |
| Domain verified in Google Search Console | ✅ Done (via Cloudflare OAuth) | 2026-05-18 |
| Sitemap submitted to GSC | ✅ Success, 4 pages parsed (now reduced to 1 valid URL) | 2026-05-18 |
| Homepage indexing requested | ✅ Queued | 2026-05-18 |

---

## Keyword Opportunity Table

Sorted by opportunity score. These keywords remain valid targets — but with the homepage-only constraint, we need to thread them into the homepage copy rather than building dedicated pages.

| Keyword | Est. Difficulty | Opportunity | Intent | Where to target |
|---------|----------------|-------------|--------|-----------------|
| Framer design agency | Low–Medium | 🔥 High | Commercial | Homepage services section |
| Webflow design agency | Medium | 🔥 High | Commercial | Homepage services section |
| branding studio for startups | Medium | 🔥 High | Commercial | Homepage hero + services |
| UI UX design studio | Medium | 🔥 High | Commercial | Homepage hero + services |
| brand identity designer for hire | Medium | 🔥 High | Transactional | Homepage services + schema |
| Framer developer for hire | Low–Medium | 🔥 High | Transactional | Homepage services + schema |
| landing page design service | Medium | 🔥 High | Transactional | Homepage services |
| one-page website design | Low | 🔥 High | Transactional | Homepage services |
| app design studio | Medium | 🟡 Medium | Commercial | Homepage services |
| motion design agency | Medium | 🟡 Medium | Commercial | Homepage services |
| WordPress website design service | Medium | 🟡 Medium | Transactional | Homepage services |
| Wix website designer | Low | 🟡 Medium | Transactional | Homepage services |
| HTML website design service | Low | 🟡 Medium | Transactional | Homepage services |
| logo and brand identity design | Medium | 🟡 Medium | Transactional | Homepage services + schema |
| videography for brands | Medium | 🟡 Medium | Commercial | Homepage services (when added) |

Long-tail informational keywords ("Framer vs Webflow", "what is brand identity design", etc.) are **on hold** until we can either (a) fix routing and add a blog, or (b) host content elsewhere (Medium, LinkedIn articles) that links back to the homepage.

---

## On-Page Issues (Homepage)

| Issue | Severity | Fix |
|------|----------|-----|
| **Routing 404s for all non-root URLs** | 🔴 Critical | Debug vercel.json rewrites and/or cleanUrls interaction. Could be: (a) `cleanUrls` short-circuiting, (b) static file resolution intercepting, (c) Vercel framework auto-detection. Test by temporarily disabling cleanUrls or adding explicit rewrites for /projects, /contact, /about. |
| Multiple H1s rendered by Framer SPA on homepage | 🟡 Medium | Without Framer access, can't fix in source. Mitigate via schema markup that explicitly identifies the page hero. |
| Image alt text dependent on Framer auto-generation | 🟡 Medium | Without Framer access, can't update. Future-fix when Framer access returns. |
| No internal cross-linking (single-page) | 🟡 Medium | Same constraint. Anchor links (`/#services`, `/#pricing`) work and could be promoted via outbound posts. |
| ProfessionalService schema enhanced with Service-per-offering | 🟢 Done | This commit |
| FAQPage schema with homepage FAQs | 🟢 Done | This commit — eligible for FAQ rich results in search |

---

## Priorities (Realistic, Constraint-Aware)

### This Week — Quick Wins
1. **Fix Vercel routing** so /projects, /contact, /about, /projects/* return 200. Without this, nothing else scales.
2. Monitor GSC for the homepage indexing refresh (within 7 days)
3. Test FAQ rich results in [Google's Rich Results Tester](https://search.google.com/test/rich-results) for the homepage URL
4. Test the new ProfessionalService + OfferCatalog schema in the same tester

### Next 30 Days — Homepage Optimisation
5. **Enhance homepage services section copy** — currently brief, needs keyword-rich paragraphs per service. Requires Framer access OR a content overlay (e.g., adding hidden SEO-only text via Vercel edge middleware, though that's a black-hat risk and not recommended).
6. **Recover Framer source access** if possible — single biggest unblocker. Worth a real attempt: check old emails, password recovery, etc.
7. **Off-site backlinks** (don't need Framer access):
   - Submit thebrandle.com to Framer Showcase
   - Create Clutch.co agency profile
   - Create DesignRush listing
   - Add thebrandle.com to Dribbble + Behance profiles
   - Google Business Profile
8. **LinkedIn presence** — publish 1-2 articles per week from Muteeb's account linking back to thebrandle.com

### 60-90 Days — Scale (Depends on Routing Fix)
9. If routing fixed: re-add /projects/[case-study] URLs to sitemap; request indexing for each
10. If Framer access restored: build out service-specific anchor sections on homepage with full keyword targeting
11. Long-tail blog content on external platforms (Medium, dev.to) linking back

---

## Off-Site SEO

This work doesn't require Framer access and is the highest-ROI channel given current constraints:

1. **Framer Showcase** — submit thebrandle.com (framer.com/showcase)
2. **Webflow Made in Webflow** — if any client sites are on Webflow
3. **Clutch.co** — free agency profile (high domain authority backlink)
4. **DesignRush** — free dofollow link
5. **Dribbble** — add thebrandle.com to profile
6. **Behance** — case study posts with site link
7. **ProductHunt** — launch the studio as a product
8. **LinkedIn articles** — publish weekly, link to homepage
9. **Guest posts** — pitch to UX Collective, Smashing Magazine, A List Apart
10. **Google Business Profile** — local SEO if targeting Dubai/UAE clients

---

## What's Not Going to Happen (And Why)

These are explicit non-goals given current constraints:

- ❌ **12 dedicated service pages** — Requires Framer access. Standalone HTML doesn't visually match the site.
- ❌ **Service page in /services route** — Same constraint.
- ❌ **Blog at /blog** — Same constraint. Also requires CMS or ongoing editing inside Framer.
- ❌ **Service-specific landing pages for paid ads** — Same constraint.

If/when Framer access is restored, all of these become viable and the strategy upgrades accordingly.

---

## Monthly Tracker

| Month | Goal | Key Actions |
|-------|------|-------------|
| May 2026 | ✅ Foundations + GSC + schema upgrades | Done |
| June 2026 | Fix routing + off-site backlinks | Debug vercel.json; submit to Clutch, DesignRush, Framer Showcase, Dribbble, Behance |
| July 2026 | LinkedIn content engine | 2 articles/week from Muteeb's profile, link to homepage |
| August 2026 | First rankings appearing | Monitor GSC; pursue 2 backlinks/month |
| September 2026 | Local SEO + UAE targeting | Google Business Profile, UAE-specific directories |
| Q4 2026 | Top 10 for long-tail terms | Compound effect of consistent content + backlinks |
| Q1 2027 | Top 10 for primary terms | Depends on routing fix + Framer access |

---

## Immediate Next Steps

1. **Investigate routing** — try toggling `cleanUrls: false` in vercel.json temporarily; see if /projects starts returning 200
2. **Test schema in Rich Results Tester** — confirm FAQPage and ProfessionalService validate cleanly
3. **Submit homepage to Bing Webmaster Tools** (separate from Google) — broaden coverage
4. **Off-site profile creation** — Clutch, DesignRush, Framer Showcase (~30 min total)
5. **Email recovery for Framer account** — biggest unblocker if reachable
