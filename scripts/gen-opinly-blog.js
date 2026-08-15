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
const L2024 = require('./blog-layout-2024');
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
  // hand-written cluster (blog-posts-data.js) - never let Opinly shadow these
  'headless-cms-guide',
  'ai-in-web-design',
  'arabic-rtl-website-design',
  'website-redesign-without-losing-seo',
  'website-maintenance-cost',
  'wordpress-vs-webflow',
  'website-total-cost-of-ownership',
  'real-estate-website-design',
  'core-web-vitals-guide',
  'progressive-web-apps',
  'website-security-checklist',
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
  { iso: '2026-07-22', title: "Shopify vs WooCommerce: which should you build your store on?", slug: 'shopify-vs-woocommerce' },
  { iso: '2026-07-22', title: "How much does a website cost in Dubai?", slug: 'website-cost-dubai' },
  { iso: '2026-07-22', title: "Framer vs Webflow: which builder fits your website?", slug: 'framer-vs-webflow' },
  { iso: '2026-07-22', title: "Moving from Wix to Shopify: a practical guide", slug: 'wix-to-shopify-migration' },
  { iso: '2026-07-28', title: "Headless CMS: what it is and when you actually need one", slug: 'headless-cms-guide' },
  { iso: '2026-07-28', title: "AI in web design: what it does well and where it fails", slug: 'ai-in-web-design' },
  { iso: '2026-07-28', title: "Arabic and RTL website design: doing it properly", slug: 'arabic-rtl-website-design' },
  { iso: '2026-07-28', title: "How to redesign your website without losing SEO", slug: 'website-redesign-without-losing-seo' },
  { iso: '2026-07-28', title: "Website maintenance: what you actually need to pay for", slug: 'website-maintenance-cost' },
  { iso: '2026-07-28', title: "WordPress vs Webflow: an honest comparison", slug: 'wordpress-vs-webflow' },
  { iso: '2026-07-28', title: "The real cost of a website over three years", slug: 'website-total-cost-of-ownership' },
  { iso: '2026-07-28', title: "Real estate website design: what actually converts", slug: 'real-estate-website-design' },
  { iso: '2026-07-28', title: "Core Web Vitals: what they are and how to fix them", slug: 'core-web-vitals-guide' },
  { iso: '2026-07-28', title: "Progressive web apps: do you actually need one?", slug: 'progressive-web-apps' },
  { iso: '2026-07-28', title: "Website security: a practical checklist for small businesses", slug: 'website-security-checklist' },
];

const BLOG_BLURB = {
  'shopify-vs-woocommerce': 'Hosted convenience against ownership and no platform fees.',
  'website-cost-dubai': 'Three price bands, and what actually moves the number.',
  'framer-vs-webflow': 'An honest comparison, from a studio that builds on both.',
  'wix-to-shopify-migration': 'Products, customers and URLs carried across properly.',
  'headless-cms-guide': 'What you gain, what it costs, and when a traditional CMS still wins.',
  'ai-in-web-design': 'What it does well, where it fails, and what Google actually penalises.',
  'arabic-rtl-website-design': 'Typography, mirroring and bilingual structure that reads native.',
  'website-redesign-without-losing-seo': 'URL mapping, redirects and content parity - the checklist.',
  'website-maintenance-cost': 'The work that matters, and the line items that are padding.',
  'wordpress-vs-webflow': 'Cost, editing, SEO and maintenance compared honestly.',
  'website-total-cost-of-ownership': 'Build, hosting, maintenance and the costs quotes leave out.',
  'real-estate-website-design': 'Search, listings and the details that decide the enquiry.',
  'core-web-vitals-guide': 'LCP, INP and CLS - what breaks them and how to fix it.',
  'progressive-web-apps': 'Where it beats a native app, and where you need neither.',
  'website-security-checklist': 'The realistic threats, and the fixes that stop most of them.',
};

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

/* "Back to blogs" points at /blog, which is now our own static listing served
   ahead of the Framer route by filesystem resolution. */
const BLOG_INDEX = '/blog';
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

/* The index is published at /blog. The footer and nav have always linked
   there, and the Framer CMS listing it replaces could only ever show the three
   2024 posts - it cannot list anything generated here. This index lists all of
   them, the Framer ones included. */
const INDEX_DIR = 'blog';

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

/* Market-size padding.
   Generated posts reach for TAM figures from low-tier report vendors
   ("projected to reach $10.7 billion by 2034", "According to <vendor> market
   research") to sound authoritative. The numbers are unverifiable, the vendors
   sell paywalled PDFs, and a founder choosing who to hire does not care what a
   market is worth in 2034. Worse than an obvious invention, because a real
   citation format makes it look checked.

   Removes whole sentences, not phrases, so the prose still reads. Deliberately
   narrow: it will not touch a citation naming a university or a real
   institution, e.g. the Carleton first-impressions study, or a widely-verified
   figure like WordPress's share of the web. */
const MARKET_SIZE = [
  /[^.<>]*\b(?:market|industry|sector)\b[^.<>]*\b(?:projected|expected|forecast|estimated|valued|worth|reach|grow)\b[^.<>]*\$[\d.,]+\s*(?:billion|million|bn|m)\b[^.<>]*\./gi,
  /[^.<>]*\baccording to\b[^.<>]{0,60}\b(?:market research|market report|industry report|pricing research|research report)\b[^.<>]*\./gi,
  /[^.<>]*\b(?:Dataintelo|360iResearch|Grand View Research|MarketsandMarkets|IBISWorld|Statista)\b[^.<>]*\./gi,
];
function stripMarketSize(html) {
  let removed = 0;
  let out = html;
  for (const re of MARKET_SIZE) {
    out = out.replace(re, (m) => { removed++; return ''; });
  }
  // drop paragraphs left empty or with only stray whitespace
  out = out.replace(/<p>\s*<\/p>/g, '');
  return { html: out, removed };
}

/* Internal linking. Opinly posts ship with almost none - the branding post had
   3 service links across 6,300 words, against 6-8 in a third the length on the
   hand-written cluster. Link the first occurrence of each phrase only, never
   inside an existing anchor or a heading. */
const AUTOLINK = [
  ['brand identity', '/services/brand-identity-design/'],
  ['branding agency', '/services/brand-identity-design/'],
  ['logo design', '/services/brand-identity-design/'],
  ['Shopify', '/services/shopify-website-design/'],
  ['WooCommerce', '/services/woocommerce-website-design/'],
  ['WordPress', '/services/wordpress-website-design/'],
  ['Webflow', '/services/webflow-website-design/'],
  ['Framer', '/services/framer-website-design/'],
  ['Squarespace', '/services/squarespace-website-design/'],
  ['Wix', '/services/wix-website-design/'],
  ['UI/UX', '/services/ui-ux-design/'],
  ['website maintenance', '/services/website-maintenance/'],
  ['SEO', '/services/seo-services/'],
  ['ecommerce', '/services/ecommerce-website-design/'],
];
function autolink(html) {
  const used = new Set();   // per post: module scope would link only the first
  let added = 0;
  // split on tags so we only ever touch text nodes
  const parts = html.split(/(<[^>]+>)/);
  let inAnchor = 0, inHeading = 0;
  for (let i = 0; i < parts.length; i++) {
    const tok = parts[i];
    if (tok.startsWith('<')) {
      if (/^<a\b/i.test(tok)) inAnchor++;
      else if (/^<\/a>/i.test(tok)) inAnchor = Math.max(0, inAnchor - 1);
      else if (/^<h[1-6]\b/i.test(tok)) inHeading++;
      else if (/^<\/h[1-6]>/i.test(tok)) inHeading = Math.max(0, inHeading - 1);
      continue;
    }
    if (inAnchor || inHeading || !tok.trim()) continue;
    for (const [phrase, href] of AUTOLINK) {
      if (used.has(phrase)) continue;
      const re = new RegExp('\\b(' + phrase.replace(/[.*+?^${}()|[\]\\/]/g, '\\function auditContent(text, slug) {') + ')\\b');
      if (!re.test(parts[i])) continue;
      parts[i] = parts[i].replace(re, '<a href="' + href + '">$1</a>');
      used.add(phrase);
      added++;
      break; // one link per text node keeps it from clustering
    }
  }
  return { html: parts.join(''), added };
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
/* Any anchor without an explicit colour falls back to the browser default -
   blue, and purple once visited. That hit the logo, the overlay menu links and
   the CTA button. Neutralise the default here; every rule below is at least as
   specific and still wins, so intended colours are unaffected. */
.svc-page a,.svc-page a:link,.svc-page a:visited{color:inherit;text-decoration:none}
/* clip, not hidden: hidden makes this a scroll container and every sticky
   descendant (the nav, the article rail) then pins to nothing. */
.svc-page{display:flex;flex-direction:column;align-items:stretch;overflow-x:clip}
.svc-nav-wrap{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.78);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px)}
@media(max-width:760px){.svc-nav-desktop{display:none}}
@media(min-width:761px){.svc-nav-phone{display:none}}
/* All navigation lives in the MENU overlay. The duplicate text links in the bar
   were redundant once Services was added and clashed with the overlay visually.
   Target links by href rather than hiding the container - the logo is a sibling
   in the same container and must stay. */
.svc-nav-wrap a[href="/about"],
.svc-nav-wrap a[href="/projects"],
.svc-nav-wrap a[href="/services/"],
.svc-nav-wrap a[href="/contact"]{display:none!important}
.svc-nav-wrap .bm-open a[href="/about"],
.svc-nav-wrap .bm-open a[href="/projects"],
.svc-nav-wrap .bm-open a[href="/services/"],
.svc-nav-wrap .bm-open a[href="/contact"]{display:revert!important}
.bm-open{opacity:1!important;pointer-events:auto!important}
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
${L2024.css({ LIGHT, ACCENT, MUTED })}
/* dark article layout - matches the hand-written cluster exactly, so the blog
   reads as one design. Replaces the light Framer-CMS-style section. */
.post-hero{margin:40px 0 4px;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.10);background:#111;line-height:0}
.post-hero img{width:100%;height:auto;display:block}
.post-body{font-family:Inter,sans-serif}
.post-body h2,.post-body h3,.post-body h4{color:#fff!important;text-align:left;line-height:1.15!important;letter-spacing:-0.03em!important;font-family:Inter,sans-serif;font-weight:600}
.post-body h2{font-size:clamp(24px,3.2vw,32px)!important;margin:56px 0 18px}
.post-body h3{font-size:22px!important;margin:44px 0 16px}
.post-body h4{font-size:19px!important;margin:36px 0 14px}
.post-body p,.post-body li{color:${MUTED};text-align:left;line-height:1.65;font-family:Inter,sans-serif;font-size:16px}
.post-body p{margin:0 0 18px}
.post-body ul,.post-body ol{margin:0 0 20px;padding-left:22px}
.post-body li{margin-bottom:10px}
.post-body li::marker{color:${ACCENT}}
.post-body a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.post-body a:hover{color:${ACCENT}}
.post-body strong{color:#fff;font-weight:600}
.post-body blockquote{margin:28px 0;padding:4px 0 4px 22px;border-left:2px solid ${ACCENT}}
.post-body blockquote p{color:#fff;font-size:19px;line-height:1.5}
.post-body figure{margin:32px 0}
.post-body figure img{width:100%;height:auto;border-radius:14px;display:block}
.post-body figcaption{color:rgba(255,255,255,.38);font-family:Inter,sans-serif;font-size:13px;padding:12px 2px 0}
.post-body pre{background:#151515;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:0 0 22px}
.post-body pre code{color:#e6e6e6;font-family:ui-monospace,Menlo,monospace;font-size:13.5px;line-height:1.6}
.post-body :not(pre)>code{background:rgba(255,255,255,.09);border-radius:5px;padding:2px 6px;font-family:ui-monospace,Menlo,monospace;font-size:14px;color:#fff}
.post-body hr{border:0;border-top:1px solid rgba(255,255,255,.14);margin:44px 0}
.post-table-wrap{overflow-x:auto;margin:0 0 24px}
.post-body table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:15px}
.post-body th,.post-body td{border:1px solid rgba(255,255,255,.14);padding:10px 14px;text-align:left;color:${MUTED}}
.post-body th{color:#fff;font-weight:600;background:rgba(255,255,255,.04)}
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
  function overlayEl(){var as=document.querySelectorAll('.svc-nav-wrap a[href="/"]');for(var i=0;i<as.length;i++){var t=(as[i].textContent||'').trim();if(!/^home/i.test(t))continue;return as[i].parentElement&&as[i].parentElement.parentElement;}return null;}
  /* The overlay wraps each link in its own container div, which the build-time
     addServices() cannot match (it only handles <p> wrappers and bare <a>).
     Clone the About container into it at runtime instead. */
  function addServicesToOverlay(){
    var o=overlayEl(); if(!o||o.querySelector('[data-bm-svc]')) return;
    var about=null,contact=null,kids=o.children;
    for(var i=0;i<kids.length;i++){
      var a=kids[i].querySelector?kids[i].querySelector('a'):null; if(!a) continue;
      var h=a.getAttribute('href');
      if(h==='/about') about=kids[i];
      if(h==='/contact') contact=kids[i];
    }
    if(!about||!contact) return;
    var clone=about.cloneNode(true);
    clone.setAttribute('data-bm-svc','1');
    var link=clone.querySelector('a')||clone;
    link.setAttribute('href','/services/');
    link.removeAttribute('data-framer-page-link-current');
    (function walk(el){var k=el.children;if(!k.length){if((el.textContent||'').trim())el.textContent=(el.textContent.trim()===el.textContent.trim().toUpperCase()?'SERVICES':'Services');return;}for(var j=0;j<k.length;j++)walk(k[j]);})(clone);
    o.insertBefore(clone,contact);
  }
  /* The carved nav ships the overlay markup but not Framer's runtime, so MENU
     had nothing to toggle and fell back to scrolling to the footer. */
  function toFooter(ev){ev.preventDefault();ev.stopPropagation();var o=overlayEl();if(!o){var f=document.querySelector('.svc-footer');if(f)f.scrollIntoView({behavior:'smooth'});return;}o.classList.toggle('bm-open');}
  addServicesToOverlay();
  setTimeout(addServicesToOverlay, 600);
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
<body class="bp2024">
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
  /* Generated header card (scripts/gen-blog-images.js), same as the
     hand-written cluster. Opinly's own title-card art is ignored. */
  const heroRel = '/assets/blog/' + post.slug + '.jpg';
  const hasHero = fs.existsSync(path.join(ROOT, 'assets', 'blog', post.slug + '.jpg'));
  const hero = hasHero ? heroRel : HERO_DIR + pickHero(post.slug).file;
  const heroImg = hasHero
    ? `<figure class="post-hero" data-reveal style="transition-delay:210ms"><img src="${esc(heroRel)}" alt="${escCopy(post.title)}" width="1600" height="900" fetchpriority="high" decoding="async"></figure>`
    : '';
  const p_eyebrow = (post.category && post.category.name) || 'Insights';
  let bodyHtml = renderContent(post.content);
  const linkGuard = stripExternalLinks(bodyHtml);
  bodyHtml = linkGuard.html;
  const mkt = stripMarketSize(bodyHtml);
  bodyHtml = mkt.html;
  if (mkt.removed) console.warn('  [guardrail] ' + post.slug + ': stripped ' + mkt.removed + ' market-size claim(s)');
  const al = autolink(bodyHtml);
  bodyHtml = al.html;
  if (al.added) console.log('  [autolink] ' + post.slug + ': added ' + al.added + ' internal link(s)');
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
  ${L2024.renderArticle({
    esc, escCopy, h2Preset: P.h2, backHref: BLOG_INDEX,
    hero: HERO_DIR + pickHero(post.slug).file,
    heroAlt: pickHero(post.slug).alt || post.title,
    avatar: avatar || L2024.AVATAR,
    authorName, authorRole, title: post.title,
    date: fmtDateLong(post.firstPublishedAt), desc, body: bodyHtml,
  })}

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
/* Every post that exists, newest first - Opinly, the hand-written cluster, and
   the Framer CMS posts. Previously the index only received Opinly posts, so the
   15 hand-written articles were listed nowhere on the site and were reachable
   only by direct URL. */
/* Listing thumbnail. A generated card in /assets/blog always wins over the
   Opinly CDN art - Opinly's stock renders looked nothing like the site. */
function cardFor(slug, fallback) {
  const rel = '/assets/blog/' + slug + '.jpg';
  return fs.existsSync(path.join(ROOT, 'assets', 'blog', slug + '.jpg')) ? rel : (fallback || null);
}

function allPostsForIndex(opinly) {
  const own = WRITTEN_POSTS.map((w) => ({
    slug: w.slug, title: w.title, iso: w.iso, href: '/blog/' + w.slug + '/',
    img: cardFor(w.slug),
    description: BLOG_BLURB[w.slug] || '',
  }));
  const framer = FRAMER_POSTS.map((f) => ({
    slug: f.slug, title: f.title, iso: f.iso, href: '/blog/' + f.slug, img: cardFor(f.slug), description: '',
  }));
  const fromOpinly = (opinly || []).map((o) => ({
    slug: o.slug, title: o.title || o.slug, iso: fmtDate(o.firstPublishedAt),
    href: '/blog/' + o.slug + '/', img: cardFor(o.slug, imageUrl(o.image && o.image.fileKey)),
    description: o.description || '',
  }));
  const seen = new Set();
  return [...fromOpinly, ...own, ...framer]
    .filter((x) => (seen.has(x.slug) ? false : seen.add(x.slug)))
    .sort((a, b) => String(b.iso || '').localeCompare(String(a.iso || '')));
}

function renderIndexPage(posts) {
  const url = `${SITE}/${INDEX_DIR}/`;
  const cards = posts.map((p) =>
    `      <a class="idx-card" href="${esc(p.href)}">${p.img ? `<img src="${esc(p.img)}" alt="${escCopy(p.title)}" loading="lazy" decoding="async">` : ''}<div class="pad"><h2>${escCopy(p.title)}</h2>${p.description ? `<p>${escCopy(p.description)}</p>` : ''}</div></a>`
  ).join('\n');

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
  fs.writeFileSync(path.join(idxDir, 'index.html'), renderIndexPage(allPostsForIndex(usable)));
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
