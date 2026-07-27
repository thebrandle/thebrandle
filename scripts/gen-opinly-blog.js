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
  'shopify-vs-woocommerce', 'website-cost-dubai', 'framer-vs-webflow', 'wix-to-shopify-migration',
  'all',
]);

/* Index lives at /blog/all/ so the Framer SPA keeps owning /blog.
   Change to '' to publish the index at /blog/ instead (destructive). */
const INDEX_DIR = 'blog/all';

const { esc, escCopy, imageUrl, renderContent, flattenText, readingMinutes } = L;

/* --------------------------------------------------------------- brand shell */
const read = (f) => fs.readFileSync(path.join(COMP, f), 'utf8');
const absolutize = (h) => h.replace(/href="\.\//g, 'href="/').replace(/tel:555-666-7777/g, 'tel:+971561429789');
const addServices = (html) => {
  const aboutM = html.match(/<a\b[^>]*href="\/about"[\s\S]*?<\/a>/);
  if (!aboutM) return html;
  const clone = aboutM[0]
    .replace(/>(\s*)ABOUT(\s*)</g, '>$1SERVICES$2<')
    .replace(/>(\s*)About(\s*)</g, '>$1Services$2<')
    .replace(/href="\/about"/, 'href="/services/"')
    .replace(/ data-framer-page-link-current(="[^"]*")?/, '');
  if (clone === aboutM[0]) return html;
  const contactM = html.match(/<a\b[^>]*href="\/contact"[\s\S]*?<\/a>/);
  return contactM ? html.replace(contactM[0], clone + contactM[0]) : html.replace(aboutM[0], aboutM[0] + clone);
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
const cta = (text, href) => ctaHtml.replace(/Let’s talk/g, escCopy(text)).replace(/href="[^"]*"/, `href="${href}"`);

const GLUE = `<style>
html,body{background:#0C0C0C;margin:0}
.svc-page{display:flex;flex-direction:column;align-items:stretch;overflow-x:hidden}
.svc-nav-wrap{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.78);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px)}
@media(max-width:760px){.svc-nav-desktop{display:none}}
@media(min-width:761px){.svc-nav-phone{display:none}}
.post-wrap{width:100%;max-width:820px;margin:0 auto;padding:96px 30px 0;box-sizing:border-box}
.post-label{display:inline-flex;gap:10px;align-items:center;color:${ACCENT};letter-spacing:.14em;text-transform:uppercase;font-family:Inter,sans-serif;font-size:12.5px;font-weight:500;margin-bottom:20px}
.post-meta{color:rgba(255,255,255,.4)!important;font-family:Inter,sans-serif;font-size:13.5px;margin-top:22px}
.post-h1{color:#fff!important;text-align:left;margin:0;font-size:clamp(38px,5.6vw,64px)!important;line-height:1.02!important;letter-spacing:-0.045em!important}
.post-hero{margin:44px 0 8px;border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.12)}
.post-hero img{width:100%;height:auto;display:block}
.post-hero figcaption,.post-body figcaption{color:rgba(255,255,255,.38);font-family:Inter,sans-serif;font-size:13px;padding:12px 2px 0}
.post-body h2,.post-body h3,.post-body h4{color:#fff!important;text-align:left;margin:56px 0 18px;line-height:1.15!important;letter-spacing:-0.03em!important;font-family:Inter,sans-serif;font-weight:600}
.post-body h2{font-size:clamp(24px,3.2vw,32px)!important}
.post-body h3{font-size:22px!important;margin-top:44px}
.post-body h4{font-size:19px!important;margin-top:36px}
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
.post-body pre{background:#151515;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:0 0 22px}
.post-body pre code{color:#e6e6e6;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13.5px;line-height:1.6}
.post-body :not(pre)>code{background:rgba(255,255,255,.09);border-radius:5px;padding:2px 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;color:#fff}
.post-body hr{border:0;border-top:1px solid rgba(255,255,255,.14);margin:44px 0}
.post-table-wrap{overflow-x:auto;margin:0 0 24px}
.post-body table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:15px}
.post-body th,.post-body td{border:1px solid rgba(255,255,255,.14);padding:10px 14px;text-align:left;color:${MUTED}}
.post-body th{color:#fff;font-weight:600;background:rgba(255,255,255,.04)}
.post-author{display:flex;gap:14px;align-items:center;margin-top:56px;padding-top:26px;border-top:1px solid rgba(255,255,255,.12)}
.post-author img{width:46px;height:46px;border-radius:50%;object-fit:cover}
.post-author .n{color:#fff;font-family:Inter,sans-serif;font-size:15px;font-weight:600}
.post-author .b{color:rgba(255,255,255,.45);font-family:Inter,sans-serif;font-size:13.5px;margin-top:3px;max-width:60ch}
.post-cta{max-width:820px;margin:80px auto 110px;padding:0 30px;text-align:center}
.post-cta .actions{display:flex;justify-content:center;margin-top:34px}
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

/* ------------------------------------------------------------- post page */
function renderPostPage(post) {
  const url = `${SITE}/blog/${post.slug}/`;
  const hero = imageUrl(post.titleFile && post.titleFile.fileKey);
  // Opinly fills these with "AI-generated header image for: <title>" boilerplate.
  // Drop it: the caption adds nothing, and it is not something to advertise.
  const tf = post.titleFile || {};
  const heroCap = L.isBoilerplate(tf.caption) ? '' : tf.caption;
  const heroAlt = L.isBoilerplate(tf.altText) ? post.title : tf.altText;
  const bodyHtml = renderContent(post.content);
  const mins = readingMinutes(post.content);
  const desc = post.metaDescription || post.description || '';
  const a = post.author || {};
  const avatar = imageUrl(a.fileKey);

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'BlogPosting',
      headline: L.copy(post.title), description: L.copy(desc), url, mainEntityOfPage: url,
      datePublished: post.firstPublishedAt, dateModified: post.modifiedAt || post.firstPublishedAt,
      image: hero || OG_FALLBACK,
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

  const main = `
  <article class="post-wrap">
    ${post.category && post.category.name ? `<span class="post-label" data-reveal>${escCopy(post.category.name)}</span>` : ''}
    <h1 class="post-h1 ${P.h2}" data-reveal style="transition-delay:70ms">${escCopy(post.title)}</h1>
    <div class="post-meta ${P.small}" data-reveal style="transition-delay:140ms">${esc(fmtDate(post.firstPublishedAt))} &middot; ${mins} min read${a.name ? ` &middot; ${escCopy(a.name)}` : ''}</div>
    ${hero ? `<figure class="post-hero" data-reveal style="transition-delay:200ms"><img src="${esc(hero)}" alt="${escCopy(heroAlt)}" width="1200" height="630">${heroCap ? `<figcaption>${escCopy(heroCap)}</figcaption>` : ''}</figure>` : ''}
    <div class="post-body" data-reveal style="transition-delay:260ms">
${bodyHtml}
    </div>
    ${a.name ? `<div class="post-author">${avatar ? `<img src="${esc(avatar)}" alt="${escCopy(a.name)}" width="46" height="46" loading="lazy">` : ''}<div><div class="n">${escCopy(a.name)}</div>${a.bio ? `<div class="b">${escCopy(a.bio)}</div>` : ''}</div></div>` : ''}
  </article>

  <div class="post-cta">
    <h2 class="${P.h2}" style="color:#fff;margin:0 0 18px">Ready to build it right?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us about your project and we will come back with a clear plan, timeline and a fixed quote.</p>
    <div class="actions">${cta('Book a free consultation', '/contact')}</div>
  </div>`;

  return shell({ title: `${L.copy(post.metaTitle || post.title)} | TheBrandle`, description: desc, url, image: hero || OG_FALLBACK, schemas, main });
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
