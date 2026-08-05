#!/usr/bin/env node
/**
 * Opinly -> static blog pages, rendered in TheBrandle's own carved components.
 *
 * Why static: this site has no framework and no server runtime for pages -
 * everything is pre-rendered HTML served by Vercel. So instead of ISR /
 * revalidatePath(), pages are generated at build time and the Opinly webhook
 * triggers a redeploy (see api/opinly-webhook.js).
 *
 * Writes:
 *   blog/<slug>/index.html   one page per Opinly post
 *   blog/all/index.html      paginated-style index (does NOT touch /blog,
 *                            which is the Framer SPA's own listing)
 *   rss.xml                  feed from /content/rss
 *   thebrandle.framer.website/sitemap.xml   Opinly URLs merged into a marked block
 *
 * Fail-soft by design: with no OPINLY_API_KEY, or if the API errors, it logs
 * and exits 0 without touching files, so it is safe in a Vercel build.
 *
 * Env: OPINLY_API_KEY
 * Run: node scripts/gen-opinly-blog.js
 */
const fs = require('fs');
const path = require('path');
const L = require('./opinly-lib');

const ROOT = path.join(__dirname, '..');
const COMP = path.join(ROOT, '_snapshot', 'components');
const SITE = 'https://www.thebrandle.com';
const SITEMAP = path.join(ROOT, 'thebrandle.framer.website', 'sitemap.xml');

/* Slugs already owned by the Framer SPA or the hand-written cluster.
   Opinly posts using these are skipped so nothing live gets clobbered. */
const RESERVED = new Set([
  'why-your-website-s-user-experience-is-its-greatest-asset',
  'why-mobile-first-design-is-crucial-for-modern-websites',
  'how-to-create-a-website-that-truly-connects-with-your-audience',
  // only the three above are linked from the homepage teaser; these two exist
  // on the blog listing only, so reserve them too or an Opinly post with a
  // matching slug would shadow a live Framer page
  'top-web-design-trends-to-watch-in-2024',
  'building-trust-online-the-importance-of-testimonials',
  'shopify-vs-woocommerce', 'website-cost-dubai', 'framer-vs-webflow', 'wix-to-shopify-migration',
  'all',
]);

/* Real posts for the "More articles" list. The Framer ones live in Framer's
   CMS, so they cannot be read at build time - titles and dates are mirrored
   here from the live listing. */
const FRAMER_POSTS = [
  { iso: '2024-11-18', title: 'Why your website’s user experience is its greatest asset', slug: 'why-your-website-s-user-experience-is-its-greatest-asset' },
  { iso: '2024-11-12', title: 'Why Mobile-First Design is Crucial for Modern Websites', slug: 'why-mobile-first-design-is-crucial-for-modern-websites' },
  { iso: '2024-11-09', title: 'How to create a website that truly connects with your audience', slug: 'how-to-create-a-website-that-truly-connects-with-your-audience' },
  { iso: '2024-11-05', title: 'Top Web Design Trends to Watch in 2024', slug: 'top-web-design-trends-to-watch-in-2024' },
  { iso: '2024-10-23', title: 'Building trust online: the importance of testimonials', slug: 'building-trust-online-the-importance-of-testimonials' },
];
const WRITTEN_POSTS = [
  { iso: '2026-07-22', title: 'How much does a website cost in Dubai?', slug: 'website-cost-dubai' },
  { iso: '2026-07-22', title: 'Shopify vs WooCommerce: which should you choose?', slug: 'shopify-vs-woocommerce' },
  { iso: '2026-07-22', title: 'Framer vs Webflow: an honest comparison', slug: 'framer-vs-webflow' },
  { iso: '2026-07-22', title: 'Migrating from Wix to Shopify', slug: 'wix-to-shopify-migration' },
];

/* Hero photography.
   The Framer blog template overlays the post title on a photo. Opinly's
   generated images are title cards with the headline already drawn into them,
   so overlaying a second title makes both unreadable - we ignore Opinly's
   image entirely and use the site's own photography.

   To pin a specific photo to a post, add slug -> filename in HERO_OVERRIDES.
   Everything else gets a stable pick from the pool (same slug, same photo on
   every build). Files live in framerusercontent.com/images and are AVIF
   despite the .jpg extension - that is how Framer ships them. */
const HERO_DIR = '/framerusercontent.com/images/';
const HERO_POOL = [
  { file: 'YlEKlxLXS5eEKd4QlVitTh30A.jpg', alt: 'Three people working together in a studio' },
  { file: 'eLsR49HoCXz2B9KTFAhtjD454Dw.jpg', alt: 'A studio lounge with green armchairs and plants' },
  { file: 'bPs9iY1xCdYs2KmVLN2FyaQJhk.jpg', alt: 'A phone resting on a concrete surface' },
  { file: 'T3l9K398sRcCWjbIM6rTgD8UILk.jpg', alt: 'A close-up of a tablet and fabric speaker' },
  { file: 'mEUUzFINLTAMqcjxzWXrFUYzBPQ.jpg', alt: 'Two phones displaying a design mockup' },
  { file: 'SDIyriYujLHtLJeg9tbQiqvoT4.jpg', alt: 'Dark product packaging on a marble tray' },
];
const HERO_OVERRIDES = {
  'should-i-hire-a-web-designer-or-do-it-myself': 'YlEKlxLXS5eEKd4QlVitTh30A.jpg',
};
function pickHero(slug) {
  const pinned = HERO_OVERRIDES[slug];
  if (pinned) return HERO_POOL.find((h) => h.file === pinned) || { file: pinned, alt: '' };
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum * 31 + slug.charCodeAt(i)) >>> 0;
  return HERO_POOL[sum % HERO_POOL.length];
}

/* Where "Back to blogs" points. /blog/all/ is our own static file, so it cold
   loads reliably. The Framer export links its Blog nav item to "./blog", but a
   direct load of /blog renders the homepage - unresolved, so do not point here
   until that is understood. */
const BLOG_INDEX = '/blog/all/';
const BACK_ARROW = '<svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden="true"><path d="M7 1L1.5 6.5L7 12" stroke="#f9452d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 6.5H14a6.5 6.5 0 0 1 6.5 6.5v6" stroke="#f9452d" stroke-width="1.7" stroke-linecap="round"/></svg>';

/* "More articles" rows: every real post except the one being rendered,
   newest first so the most recent work leads. Sorting by date (not by source)
   matters - ordering by list would bury every 2026 post under the 2024
   Framer ones and the list would read as stale. Dates are used for ordering
   only; they are not rendered. */
let OPINLY_INDEX = [];
function moreArticles(currentSlug, limit = 5) {
  const rows = [
    ...OPINLY_INDEX,
    ...FRAMER_POSTS.map((p) => ({ ...p, href: `/blog/${p.slug}` })),
    ...WRITTEN_POSTS.map((p) => ({ ...p, href: `/blog/${p.slug}/` })),
  ]
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => String(b.iso || '').localeCompare(String(a.iso || '')))
    .slice(0, limit);
  return rows.map((p) =>
    `          <li><a href="${esc(p.href)}"><span class="t">${escCopy(p.title)}</span></a></li>`
  ).join('\n');
}

/* Index lives at /blog/all/ so the Framer SPA keeps owning /blog.
   Change to '' to publish the index at /blog/ instead (destructive). */
const INDEX_DIR = 'blog/all';

const { esc, escCopy, imageUrl, renderContent, flattenText, readingMinutes } = L;

/* ------------------------------------------------------ content guardrails
   Unattended, Opinly has produced outbound links to competitors, invented
   statistics, and fabricated case studies - three times out of three. Dashboard
   instructions are a request, not a guarantee, so enforce it at build time.

   Outbound links are STRIPPED (link text is kept, so sentences still read).
   Statistics and case-study language are FLAGGED, not stripped - rewriting a
   claim automatically would be worse than surfacing it for a human. */
const LINK_ALLOW = /(^|\.)thebrandle\.com$/i;

function stripExternalLinks(html) {
  let removed = 0;
  const out = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (m, attrs, inner) => {
    const href = (attrs.match(/href\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
    if (!/^https?:\/\//i.test(href)) return m;               // internal / relative - keep
    let host = '';
    try { host = new URL(href).hostname; } catch (e) { return m; }
    if (LINK_ALLOW.test(host)) return m;                      // our own domain - keep
    removed++;
    return inner;                                             // drop the link, keep the words
  });
  return { html: out, removed };
}

function auditContent(text, slug) {
  const warn = [];
  const stat = text.match(/\b\d{1,3}(?:\.\d+)?\s?%|\b\d+x\b|\b\d{1,3}(,\d{3})+\b/g);
  if (stat) warn.push('statistics (' + [...new Set(stat)].slice(0, 6).join(', ') + ')');
  if (/\bcase study\b|\bone client\b|\ba client of ours\b|\bwe worked with\b/i.test(text)) {
    warn.push('case-study / client claim');
  }
  if (/\baccording to\b|\bstudies show\b|\bresearch shows\b|\bsurvey found\b/i.test(text)) {
    warn.push('cited claim without a source');
  }
  if (warn.length) {
    console.warn('  [guardrail] ' + slug + ': ' + warn.join('; ') + ' - review before this stays live');
  }
  return warn;
}


/* --------------------------------------------------------------- brand shell */
const read = (f) => fs.readFileSync(path.join(COMP, f), 'utf8');
const absolutize = (h) => h.replace(/href="\.\//g, 'href="/').replace(/tel:555-666-7777/g, 'tel:+971561429789');
const addServices = (html) => {
  // Footer links are each wrapped in their own <p>; nav links are bare <a>.
  // Clone whichever unit the link actually lives in - cloning just the <a>
  // drops Services inside Contact's <p>, rendering "ServicesContact".
  const pAbout = html.match(/<p\b[^>]*>\s*<a\b[^>]*href="\/about"[\s\S]*?<\/a>\s*<\/p>/);
  const aAbout = html.match(/<a\b[^>]*href="\/about"[\s\S]*?<\/a>/);
  const unit = pAbout || aAbout;
  if (!unit) return html;
  const clone = unit[0]
    .replace(/>(\s*)ABOUT(\s*)</g, '>$1SERVICES$2<')
    .replace(/>(\s*)About(\s*)</g, '>$1Services$2<')
    .replace(/href="\/about"/, 'href="/services/"')
    .replace(/ data-framer-page-link-current(="[^"]*")?/, '');
  if (clone === unit[0]) return html;
  const target = pAbout
    ? html.match(/<p\b[^>]*>\s*<a\b[^>]*href="\/contact"[\s\S]*?<\/a>\s*<\/p>/)
    : html.match(/<a\b[^>]*href="\/contact"[\s\S]*?<\/a>/);
  return target ? html.replace(target[0], clone + target[0]) : html.replace(unit[0], unit[0] + clone);
};

const styles = read('styles.html');
const navHtml = addServices(absolutize(read('nav-live.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"')));
const navPhoneHtml = fs.existsSync(path.join(COMP, 'nav-phone.html'))
  ? addServices(absolutize(read('nav-phone.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"'))) : '';
const footerHtml = addServices(absolutize(read('footer-live.html')
  .replace(/style="will-change: transform; opacity: 1; transform: translateY\([^)]+\);"/, 'style="opacity: 1;"')));
const noiseHtml = fs.existsSync(path.join(COMP, 'noise-live.html')) ? read('noise-live.html') : '';
const ctaHtml = read(fs.existsSync(path.join(COMP, 'button-live.html')) ? 'button-live.html' : 'button.html');
const snapshot = fs.readFileSync(path.join(ROOT, '_snapshot', 'index.html'), 'utf8');
const rootM = snapshot.slice(snapshot.indexOf('</head>')).match(/<div[^>]*data-framer-root[^>]*>/);
const ROOT_OPEN = rootM ? rootM[0] : '<div data-framer-root>';

const P = {
  h2: 'framer-text framer-styles-preset-1t5qoig',
  h3: 'framer-text framer-styles-preset-ddjjzx',
  lead: 'framer-text framer-styles-preset-1dmjd5e',
  body: 'framer-text framer-styles-preset-bq16ho',
  small: 'framer-text framer-styles-preset-1hahlh8',
};
const ACCENT = 'var(--token-1662617d-fd18-4319-b3da-aa36e5415705, rgb(249, 69, 45))';
const MUTED = 'rgba(255, 255, 255, 0.66)';
const LIGHT = 'var(--token-0fe6d6b7-818b-4083-a138-519768e5d126, #f5f5f5)';
const cta = (text, href) => ctaHtml.replace(/Let’s talk/g, escCopy(text)).replace(/href="[^"]*"/, `href="${href}"`);

const GLUE = `<style>
html,body{background:#0C0C0C;margin:0}
.svc-page{display:flex;flex-direction:column;align-items:stretch;overflow-x:hidden}
.svc-nav-wrap{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.78);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px)}
@media(max-width:760px){.svc-nav-desktop{display:none}}
@media(min-width:761px){.svc-nav-phone{display:none}}
/* Framer exported the footer desktop-only. Its outer container carries 90px
   side padding and a 75px gap, so at 386px the content box is only 206px and
   the inner row (children on flex-basis:0) crushes to ~21px columns - text
   then wraps one character per line. Scale the padding and stack the rows. */
@media(max-width:760px){
  .svc-footer .framer-Q4FQe{padding-left:24px!important;padding-right:24px!important}
  .svc-footer .framer-92x2s6{width:100%!important;max-width:100%!important;min-width:0!important;gap:42px!important}
  .svc-footer .framer-11zhs3t{flex-direction:column!important;align-items:flex-start!important;gap:38px!important;width:100%!important}
  .svc-footer .framer-11zhs3t>*{flex:0 0 auto!important;width:100%!important;min-width:0!important;flex-basis:auto!important}
  .svc-footer .framer-e5ap8y,.svc-footer .framer-1bscsag,.svc-footer .framer-aj2el6{width:100%!important;min-width:0!important;flex-basis:auto!important;flex-grow:0!important}
  .svc-footer .framer-aj2el6{flex-direction:column!important;gap:12px!important}
  .svc-footer .framer-aj2el6>*{width:100%!important;min-width:0!important;flex:0 0 auto!important}
  /* newsletter row: first child claimed the full width, pushing the submit
     arrow outside the viewport - let both shrink instead */
  .svc-footer .framer-e5ap8y{flex-wrap:wrap!important}
  .svc-footer .framer-e5ap8y>*{min-width:0!important;max-width:100%!important}
}
.post-wrap{width:100%;max-width:820px;margin:0 auto;padding:96px 30px 0;box-sizing:border-box}
.post-label{display:inline-flex;gap:10px;align-items:center;color:${ACCENT};letter-spacing:.14em;text-transform:uppercase;font-family:Inter,sans-serif;font-size:12.5px;font-weight:500;margin-bottom:20px}
.post-meta{color:rgba(255,255,255,.4)!important;font-family:Inter,sans-serif;font-size:13.5px;margin-top:22px}
.post-h1{color:#fff!important;text-align:left;margin:0;font-size:clamp(38px,5.6vw,64px)!important;line-height:1.02!important;letter-spacing:-0.045em!important}
/* Full-bleed article hero - matches the Framer blog post template:
   photo, author chip pinned left, oversized title, date + excerpt on the
   bottom row. Offsets are proportional so it holds at any width. */
.bp-hero{position:relative;margin:26px 30px 0;height:calc(100vh - 150px);min-height:560px;overflow:hidden;isolation:isolate}
.bp-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
/* two scrims: vertical for the title/date rows, plus a left wash so the
   author chip stays readable over a bright photo */
.bp-hero::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.42) 0%,rgba(0,0,0,.24) 34%,rgba(0,0,0,.42) 72%,rgba(0,0,0,.68) 100%),linear-gradient(90deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,.10) 34%,rgba(0,0,0,0) 55%)}
.bp-inner{position:relative;height:100%;display:grid;grid-template-rows:1fr auto;padding:44px 46px 40px;box-sizing:border-box}
.bp-mid{display:flex;align-items:center;gap:0}
.bp-author{display:flex;align-items:center;gap:16px;flex:0 0 26.8%}
.bp-avatar{width:58px;height:58px;border-radius:50%;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.14)}
.bp-author .n{color:#fff;font-family:Inter,sans-serif;font-size:22px;font-weight:500;line-height:1.25;text-shadow:0 1px 16px rgba(0,0,0,.6)}
.bp-author .r{color:rgba(255,255,255,.82);font-family:Inter,sans-serif;font-size:18px;line-height:1.3;text-shadow:0 1px 16px rgba(0,0,0,.6)}
.bp-title{color:#fff!important;text-align:left;margin:0;flex:1;font-size:clamp(40px,7vw,106px)!important;line-height:1.06!important;letter-spacing:-0.04em!important;text-shadow:0 2px 30px rgba(0,0,0,.45)}
.bp-foot{display:flex;align-items:flex-start;gap:0;padding-left:26.8%}
.bp-date{color:#fff;font-family:Inter,sans-serif;font-size:22px;flex:0 0 30%}
.bp-desc{color:rgba(255,255,255,.92);font-family:Inter,sans-serif;font-size:19px;line-height:1.5;max-width:46ch;margin:0}
@media(max-width:1024px){
  .bp-hero{height:auto;min-height:0;margin:20px 20px 0}
  .bp-inner{display:block;padding:32px 26px 34px}
  .bp-mid{display:block}
  .bp-author{flex:none;margin-bottom:30px}
  .bp-title{margin:0 0 40px}
  .bp-foot{display:block;padding-left:0}
  .bp-date{margin-bottom:12px;font-size:18px}
  .bp-desc{font-size:17px;max-width:none}
}
/* ---- article body: light section with sticky sidebar, matching the
   Framer blog template (dark hero, then everything below on #f5f5f5) ---- */
.bp-main{background:${LIGHT};padding:96px 0 40px}
.bp-grid{max-width:1660px;margin:0 auto;padding:0 46px;display:grid;grid-template-columns:26.5% 1fr;box-sizing:border-box}
.bp-side{position:sticky;top:104px;align-self:start;padding-right:30px}
.bp-side-note{color:rgba(12,12,12,.5);font-family:Inter,sans-serif;font-size:17px;line-height:1.5;margin:0 0 30px}
.bp-back{display:inline-flex;align-items:center;gap:14px;color:#0c0c0c;font-family:Inter,sans-serif;font-size:22px;text-decoration:none}
.bp-back svg{flex-shrink:0}
.bp-back:hover{color:${ACCENT}}
.bp-col{max-width:1030px;min-width:0}
.post-body{font-family:Inter,sans-serif}
.post-body>p:first-of-type{color:#0c0c0c;font-size:clamp(21px,1.7vw,30px);line-height:1.42;letter-spacing:-0.01em;margin:0 0 30px}
.post-body p,.post-body li{color:rgba(12,12,12,.6);text-align:left;line-height:1.62;font-family:Inter,sans-serif;font-size:20px}
.post-body p{margin:0 0 22px}
.post-body h2,.post-body h3,.post-body h4{color:#0c0c0c!important;text-align:left;line-height:1.16!important;letter-spacing:-0.025em!important;font-family:Inter,sans-serif;font-weight:600}
.post-body h2{font-size:clamp(28px,2.9vw,40px)!important;margin:64px 0 22px}
.post-body h3{font-size:clamp(21px,1.7vw,25px)!important;margin:48px 0 16px}
.post-body h4{font-size:20px!important;margin:38px 0 14px}
.post-body ul,.post-body ol{margin:0 0 24px;padding-left:24px}
.post-body li{margin-bottom:10px}
.post-body li::marker{color:rgba(12,12,12,.45)}
.post-body a{color:#0c0c0c;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(12,12,12,.3)}
.post-body a:hover{color:${ACCENT};text-decoration-color:${ACCENT}}
.post-body strong{color:#0c0c0c;font-weight:600}
.post-body blockquote{margin:32px 0;padding:4px 0 4px 24px;border-left:2px solid ${ACCENT}}
.post-body blockquote p{color:#0c0c0c;font-size:22px;line-height:1.5}
.post-body figure{margin:44px 0}
.post-body figure img{width:100%;height:auto;display:block}
.post-body figcaption{color:rgba(12,12,12,.45);font-family:Inter,sans-serif;font-size:14px;padding:12px 2px 0}
.post-body pre{background:#ececec;border:1px solid rgba(12,12,12,.12);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:0 0 24px}
.post-body pre code{color:#0c0c0c;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;line-height:1.6}
.post-body :not(pre)>code{background:rgba(12,12,12,.08);border-radius:5px;padding:2px 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;color:#0c0c0c}
.post-body hr{border:0;border-top:1px solid rgba(12,12,12,.14);margin:48px 0}
.post-table-wrap{overflow-x:auto;margin:0 0 26px}
.post-body table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:16px}
.post-body th,.post-body td{border:1px solid rgba(12,12,12,.16);padding:11px 15px;text-align:left;color:rgba(12,12,12,.6)}
.post-body th{color:#0c0c0c;font-weight:600;background:rgba(12,12,12,.04)}
/* ---- more articles ---- */
.bp-more{background:${LIGHT};padding:70px 0 120px}
.bp-more-h{color:#0c0c0c!important;text-align:left;margin:0 0 58px;font-size:clamp(52px,8vw,118px)!important;line-height:1!important;letter-spacing:-0.045em!important;font-weight:600}
.bp-more-list{list-style:none;margin:0;padding:0;border-top:1px solid rgba(12,12,12,.14)}
.bp-more-list a{display:block;padding:26px 0;border-bottom:1px solid rgba(12,12,12,.14);text-decoration:none;font-family:Inter,sans-serif}
.bp-more-list .t{color:#0c0c0c;font-size:22px;letter-spacing:-0.01em}
.bp-more-list a:hover .t{color:${ACCENT}}
@media(max-width:900px){
  .bp-grid{grid-template-columns:1fr;padding:0 24px}
  .bp-side{position:static;padding:0 0 38px}
  .bp-main{padding:52px 0 26px}
  .bp-more{padding:36px 0 84px}
  .bp-more-h{margin-bottom:34px}
  .bp-more-list a{padding:20px 0}
  .post-body p,.post-body li{font-size:17px}
  .post-body>p:first-of-type{font-size:20px}
  .post-body h2{margin:48px 0 18px}
}
.post-cta{background:#0c0c0c;padding:110px 46px 118px;text-align:left}
.post-cta-inner{max-width:1660px;margin:0 auto}
.post-cta h2{margin:0 0 26px;font-size:clamp(38px,6vw,86px)!important;line-height:1.02!important;letter-spacing:-0.045em!important}
.post-cta p{max-width:52ch;margin:0;font-family:Inter,sans-serif;font-size:19px;line-height:1.6}
.post-cta .actions{display:flex;justify-content:flex-start;margin-top:40px}
@media(max-width:900px){.post-cta{padding:70px 24px 78px}}
.post-cta .framer-text{color:#fff!important}
.post-cta .framer-LqZE5{background:${ACCENT};border-radius:60px;transition:transform .18s ease,filter .2s ease}
.post-cta .framer-LqZE5:hover{filter:brightness(1.08)}
.post-cta .framer-LqZE5 .framer-13x93le{width:auto;min-width:200px;padding:20px 36px!important;justify-content:center!important;gap:0!important}
.post-cta .framer-1m71lft-container{display:none}
.idx-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:52px}
@media(max-width:720px){.idx-grid{grid-template-columns:1fr}}
.idx-card{display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.14);border-radius:18px;overflow:hidden;background:#151515;transition:transform .2s,border-color .2s}
.idx-card:hover{transform:translateY(-4px);border-color:#3a3a3a}
.idx-card img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.idx-card .pad{padding:22px 24px 26px}
.idx-card h2{color:#fff!important;font-family:Inter,sans-serif;font-size:21px!important;line-height:1.25;letter-spacing:-0.03em;margin:0 0 10px;font-weight:600}
.idx-card p{color:${MUTED};font-family:Inter,sans-serif;font-size:14.5px;line-height:1.55;margin:0}
.idx-card .tag{color:${ACCENT};font-family:Inter,sans-serif;font-size:12px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;display:block}
.idx-empty{margin-top:52px;padding:40px;border:1px dashed rgba(255,255,255,.18);border-radius:18px;text-align:center;color:${MUTED};font-family:Inter,sans-serif}
.svc-footer{width:100%;margin-top:90px}
.svc-noise{position:fixed;inset:0;z-index:30;pointer-events:none}
.svc-noise .framer-22mi0a{position:absolute;inset:0}
[data-reveal]{opacity:0;transform:translateY(36px);transition:opacity .7s cubic-bezier(.215,.61,.355,1),transform .7s cubic-bezier(.215,.61,.355,1)}
[data-reveal].in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}
</style>
<noscript><style>[data-reveal]{opacity:1;transform:none;transition:none}</style></noscript>`;

const JS = `<script>
(function(){
  var els=document.querySelectorAll('[data-reveal]');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:0});
  els.forEach(function(e){io.observe(e)});
  function toFooter(ev){ev.preventDefault();ev.stopPropagation();var f=document.querySelector('.svc-footer');if(!f)return;var y=window.scrollY;f.scrollIntoView({behavior:'smooth'});setTimeout(function(){if(Math.abs(window.scrollY-y)<100)f.scrollIntoView()},700)}
  var n=document.querySelectorAll('.svc-nav-wrap *');
  for(var i=0;i<n.length;i++){var el=n[i];if(!el.children.length&&(el.textContent||'').trim()==='MENU'&&!el.__mb){el.__mb=1;var t=el.closest('[data-framer-name]')||el;t.style.cursor='pointer';t.addEventListener('click',toFooter)}}
})();
</script>`;

const shell = ({ title, description, url, image, schemas, main }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escCopy(title)}</title>
<meta name="description" content="${escCopy(description)}">
<link rel="canonical" href="${esc(url)}">
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.ico">
<link rel="alternate" type="application/rss+xml" title="TheBrandle Blog" href="${SITE}/rss.xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${escCopy(title)}"><meta property="og:description" content="${escCopy(description)}">
<meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escCopy(title)}">
<meta name="twitter:description" content="${escCopy(description)}"><meta name="twitter:image" content="${esc(image)}">
${styles}
${GLUE}
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ''}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtml}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
${main}
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${JS}
</body>
</html>
`;

const OG_FALLBACK = SITE + '/framerusercontent.com/images/YNmypiM868x4WUMKO25HF3tDPN4.jpg';
const fmtDate = (iso) => { try { return new Date(iso).toISOString().slice(0, 10); } catch { return ''; } };
// "Nov 18, 2024" - the format the Framer blog template uses
const fmtDateLong = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  } catch { return ''; }
};

/* ------------------------------------------------------------- post page */
function renderPostPage(post) {
  const url = `${SITE}/blog/${post.slug}/`;
  // Opinly's title-card images bake the headline into the artwork, which
  // collides with the title overlaid on the hero - so we ignore them and use
  // the site's own photography instead. See HERO_POOL.
  const heroPick = pickHero(post.slug);
  const hero = HERO_DIR + heroPick.file;
  const heroAlt = heroPick.alt || post.title;
  let bodyHtml = renderContent(post.content);
  const linkGuard = stripExternalLinks(bodyHtml);
  bodyHtml = linkGuard.html;
  if (linkGuard.removed) console.warn('  [guardrail] ' + post.slug + ': stripped ' + linkGuard.removed + ' outbound link(s)');
  auditContent(flattenText(post.content), post.slug);
  const mins = readingMinutes(post.content);
  const desc = post.metaDescription || post.description || '';
  const a = post.author || {};
  const avatar = imageUrl(a.fileKey);

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: L.copy(post.title), description: L.copy(desc), url, mainEntityOfPage: url,
      datePublished: post.firstPublishedAt, dateModified: post.modifiedAt || post.firstPublishedAt,
      image: SITE + hero,
      author: a.name ? { '@type': 'Person', name: a.name, ...(a.slug ? { url: `${SITE}/blog/author/${a.slug}/` } : {}) }
                     : { '@type': 'Organization', name: 'TheBrandle', url: SITE },
      publisher: { '@type': 'Organization', name: 'TheBrandle', url: SITE, logo: { '@type': 'ImageObject', url: SITE + '/framerusercontent.com/assets/TheBrandle.svg' } },
      wordCount: flattenText(post.content).trim().split(/\s+/).filter(Boolean).length,
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog' },
        { '@type': 'ListItem', position: 3, name: L.copy(post.title), item: url },
      ],
    },
  ];

  // The Framer blog template shows the studio, not a byline. index.html
  // already rewrites the CMS author to these two strings on /blog pages.
  const authorName = a.name || 'The Brandle Team';
  const authorRole = a.bio || 'Design Studio';

  const main = `
  <header class="bp-hero">
    ${hero ? `<img src="${esc(hero)}" alt="${escCopy(heroAlt)}" fetchpriority="high" decoding="async">` : ''}
    <div class="bp-inner">
      <div class="bp-mid">
        <div class="bp-author">
          ${avatar ? `<img class="bp-avatar" src="${esc(avatar)}" alt="" width="58" height="58">` : ''}
          <div><div class="n">${escCopy(authorName)}</div><div class="r">${escCopy(authorRole)}</div></div>
        </div>
        <h1 class="bp-title ${P.h2}">${escCopy(post.title)}</h1>
      </div>
      <div class="bp-foot">
        <div class="bp-date">${esc(fmtDateLong(post.firstPublishedAt))}</div>
        <p class="bp-desc">${escCopy(desc)}</p>
      </div>
    </div>
  </header>

  <section class="bp-main">
    <div class="bp-grid">
      <aside class="bp-side">
        <p class="bp-side-note">Continue exploring ideas<br>in web design and beyond.</p>
        <a class="bp-back" href="${BLOG_INDEX}">${BACK_ARROW}Back to blogs</a>
      </aside>
      <div class="bp-col">
        <div class="post-body">
${bodyHtml}
        </div>
      </div>
    </div>
  </section>

  <section class="bp-more">
    <div class="bp-grid">
      <aside class="bp-side">
        <p class="bp-side-note">Explore our full library of<br>insights, stories, and ideas.</p>
      </aside>
      <div class="bp-col">
        <h2 class="bp-more-h">More articles</h2>
        <ul class="bp-more-list">
${moreArticles(post.slug)}
        </ul>
      </div>
    </div>
  </section>

  <div class="post-cta">
    <div class="post-cta-inner">
      <h2 class="${P.h2}" style="color:#fff">Let’s bring your vision to life</h2>
      <p style="color:${MUTED}">We are here to ensure your experience with us is smooth and successful. Reach out anytime - we will come back with a clear plan, timeline and a fixed quote.</p>
      <div class="actions">${cta('Get in touch', '/contact')}</div>
    </div>
  </div>`;

  return shell({ title: `${L.copy(post.metaTitle || post.title)} | TheBrandle`, description: desc, url, image: SITE + hero, schemas, main });
}

/* ------------------------------------------------------------ index page */
function renderIndexPage(posts) {
  const url = `${SITE}/${INDEX_DIR}/`;
  const cards = posts.map((p) => {
    const img = imageUrl(p.image && p.image.fileKey);
    return `      <a class="idx-card" href="/blog/${esc(p.slug)}/">${img ? `<img src="${esc(img)}" alt="${escCopy((p.image && p.image.alt) || p.title)}" loading="lazy" decoding="async">` : ''}<div class="pad">${p.category && p.category.name ? `<span class="tag">${escCopy(p.category.name)}</span>` : ''}<h2>${escCopy(p.title)}</h2><p>${escCopy(p.description || '')}</p></div></a>`;
  }).join('\n');

  const main = `
  <section class="post-wrap">
    <span class="post-label" data-reveal>Insights</span>
    <h1 class="post-h1 ${P.h2}" data-reveal style="transition-delay:70ms">Articles</h1>
    <p class="${P.lead}" data-reveal style="color:${MUTED};max-width:56ch;margin-top:20px;transition-delay:140ms">Practical guidance on websites, ecommerce and brand - written from real client work.</p>
    ${posts.length
      ? `<div class="idx-grid" data-reveal style="transition-delay:200ms">\n${cards}\n    </div>`
      : `<div class="idx-empty" data-reveal>No articles published yet. Check back soon.</div>`}
  </section>`;

  return shell({
    title: 'Articles | TheBrandle', url,
    description: 'Practical guidance on websites, ecommerce and brand from TheBrandle - a Dubai design and development studio.',
    image: OG_FALLBACK,
    schemas: [{
      '@context': 'https://schema.org', '@type': 'Blog', url, name: 'TheBrandle Articles',
      blogPost: posts.slice(0, 20).map((p) => ({ '@type': 'BlogPosting', headline: L.copy(p.title), url: `${SITE}/blog/${p.slug}/`, datePublished: p.firstPublishedAt })),
    }],
    main,
  });
}

/* ----------------------------------------------------------------- feeds */
function writeRss(items) {
  const esx = (s) => esc(L.copy(s));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>TheBrandle - Articles</title>
<link>${SITE}/blog</link>
<description>Practical guidance on websites, ecommerce and brand.</description>
<language>en</language>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items.map((it) => {
  const link = it.link || `${SITE}/blog/${it.slug}/`;
  return `<item>
<title>${esx(it.title)}</title>
<link>${esc(link)}</link>
<guid isPermaLink="true">${esc(link)}</guid>
${it.pubDate || it.firstPublishedAt ? `<pubDate>${esc(new Date(it.pubDate || it.firstPublishedAt).toUTCString())}</pubDate>` : ''}
<description>${esx(it.description || '')}</description>
</item>`;
}).join('\n')}
</channel>
</rss>
`;
  fs.writeFileSync(path.join(ROOT, 'rss.xml'), xml);
}

/** Merge Opinly URLs into sitemap.xml inside a marked, idempotent block. */
function mergeSitemap(entries) {
  if (!fs.existsSync(SITEMAP)) return;
  const START = '  <!-- opinly:start -->';
  const END = '  <!-- opinly:end -->';
  const block = [START,
    ...entries.map(e => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${esc(e.lastmod)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`),
    END].join('\n');
  let xml = fs.readFileSync(SITEMAP, 'utf8');
  xml = xml.includes(START)
    ? xml.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block)
    : xml.replace('</urlset>', block + '\n</urlset>');
  fs.writeFileSync(SITEMAP, xml);
}

/* ------------------------------------------------------------------ main */
(async () => {
  if (!process.env.OPINLY_API_KEY) {
    console.log('[opinly] OPINLY_API_KEY not set - skipping generation (this is not an error).');
    return;
  }
  let summaries;
  try {
    summaries = await L.fetchAllPosts({ limit: 50, sort: 'newest' });
  } catch (err) {
    console.error('[opinly] listing failed, leaving existing pages untouched:', err.message);
    return;
  }

  const usable = summaries.filter((p) => p && p.slug && !RESERVED.has(p.slug));
  const skipped = summaries.length - usable.length;
  console.log(`[opinly] ${summaries.length} posts returned, ${usable.length} to generate${skipped ? `, ${skipped} skipped (reserved slug)` : ''}`);

  // Populate the "More articles" pool before rendering, so every post can
  // link to its siblings rather than only to the static lists.
  OPINLY_INDEX = usable.map((s) => ({
    slug: s.slug,
    title: s.title || s.metaTitle || s.slug,
    iso: fmtDate(s.firstPublishedAt),
    href: `/blog/${s.slug}/`,
  }));

  const sitemapEntries = [];
  let written = 0;
  for (const s of usable) {
    let full;
    try {
      full = await L.fetchPost(s.slug);
    } catch (err) { console.error(`[opinly] ${s.slug}: fetch failed - ${err.message}`); continue; }
    if (!full) { console.error(`[opinly] ${s.slug}: 404 from /content/post`); continue; }

    const post = { ...full, slug: full.slug || s.slug, category: full.category || s.category, author: full.author || s.author };
    const dir = path.join(ROOT, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), renderPostPage(post));
    sitemapEntries.push({ loc: `${SITE}/blog/${post.slug}/`, lastmod: fmtDate(post.modifiedAt || post.firstPublishedAt) || fmtDate(Date.now()) });
    written++;
    console.log(`  wrote blog/${post.slug}/index.html`);
  }

  const idxDir = path.join(ROOT, INDEX_DIR);
  fs.mkdirSync(idxDir, { recursive: true });
  fs.writeFileSync(path.join(idxDir, 'index.html'), renderIndexPage(usable));
  sitemapEntries.push({ loc: `${SITE}/${INDEX_DIR}/`, lastmod: fmtDate(Date.now()) });
  console.log(`  wrote ${INDEX_DIR}/index.html`);

  try {
    const rss = await L.fetchRss(20);
    const items = Array.isArray(rss) ? rss : (rss && (rss.items || rss.data)) || [];
    if (items.length) { writeRss(items); console.log('  wrote rss.xml'); }
  } catch (err) { console.error('[opinly] rss skipped:', err.message); }

  mergeSitemap(sitemapEntries);
  console.log(`[opinly] done - ${written} post page(s), sitemap updated with ${sitemapEntries.length} URL(s)`);
})().catch((err) => {
  console.error('[opinly] unexpected failure (build continues):', err.message);
});
