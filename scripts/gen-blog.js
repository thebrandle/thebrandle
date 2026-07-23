#!/usr/bin/env node
/**
 * Blog post generator - same carve pipeline as gen-service-pages-v2.js.
 * Composes /blog/<slug>/index.html from the site's own components (styles,
 * hydrated nav/footer, presets, grain) so posts are on-brand by construction.
 *
 * IMPORTANT: /blog itself stays with the Framer SPA (it lists the original
 * Framer posts). We only create directories for NEW slugs; existing Framer
 * post slugs keep resolving through the SPA catch-all. Never create
 * /blog/index.html.
 * Run: node scripts/gen-blog.js
 */
const fs = require('fs');
const path = require('path');
const { posts } = require('./blog-posts-data');

const ROOT = path.join(__dirname, '..');
const COMP = path.join(ROOT, '_snapshot', 'components');
const OUT = path.join(ROOT, 'blog');
const SITE = 'https://www.thebrandle.com';
const OG_IMAGE = SITE + '/framerusercontent.com/images/YNmypiM868x4WUMKO25HF3tDPN4.jpg';
const EMAIL = 'hello@thebrandle.com';

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
  if (contactM) return html.replace(contactM[0], clone + contactM[0]);
  return html.replace(aboutM[0], aboutM[0] + clone);
};

const styles = read('styles.html');
const navHtml = addServices(absolutize(read('nav-live.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"')));
const navPhoneHtml = fs.existsSync(path.join(COMP, 'nav-phone.html'))
  ? addServices(absolutize(read('nav-phone.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"')))
  : '';
const footerHtml = addServices(absolutize(read('footer-live.html')
  .replace(/style="will-change: transform; opacity: 1; transform: translateY\([^)]+\);"/, 'style="opacity: 1;"')));
const ctaHtml = read(fs.existsSync(path.join(COMP, 'button-live.html')) ? 'button-live.html' : 'button.html');
const noiseHtml = fs.existsSync(path.join(COMP, 'noise-live.html')) ? read('noise-live.html') : '';

const snapshot = fs.readFileSync(path.join(ROOT, '_snapshot', 'index.html'), 'utf8');
const rootM = snapshot.slice(snapshot.indexOf('</head>')).match(/<div[^>]*data-framer-root[^>]*>/);
const ROOT_OPEN = rootM ? rootM[0] : '<div data-framer-root>';

const esc = (s) => String(s).replace(/\s*—\s*/g, ' - ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const P = {
  display: 'framer-text framer-styles-preset-1usw2w6',
  h2: 'framer-text framer-styles-preset-1t5qoig',
  h3: 'framer-text framer-styles-preset-ddjjzx',
  lead: 'framer-text framer-styles-preset-1dmjd5e',
  body: 'framer-text framer-styles-preset-bq16ho',
  small: 'framer-text framer-styles-preset-1hahlh8',
};
const ACCENT = 'var(--token-1662617d-fd18-4319-b3da-aa36e5415705, rgb(249, 69, 45))';
const MUTED = 'rgba(255, 255, 255, 0.66)';

const cta = (text, href) => ctaHtml
  .replace(/Let’s talk/g, esc(text))
  .replace(/href="[^"]*"/, `href="${href}"`);

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
.post-body h2{color:#fff!important;text-align:left;margin:56px 0 18px;font-size:clamp(24px,3.2vw,32px)!important;line-height:1.15!important;letter-spacing:-0.03em!important}
.post-body p{color:${MUTED};text-align:left;line-height:1.65;margin:0 0 18px}
.post-body a{color:#fff;text-decoration:underline;text-underline-offset:3px}
.post-body a:hover{color:${ACCENT}}
.post-faq{margin-top:64px;border-top:1px solid rgba(255,255,255,.12);padding-top:8px}
.post-faq details{border-bottom:1px solid rgba(255,255,255,.12)}
.post-faq summary{list-style:none;cursor:pointer;padding:22px 0;display:flex;justify-content:space-between;align-items:center;gap:20px;color:#fff}
.post-faq summary::-webkit-details-marker{display:none}
.post-faq .pm{width:20px;height:20px;flex-shrink:0;position:relative}
.post-faq .pm::before,.post-faq .pm::after{content:"";position:absolute;background:${ACCENT};border-radius:2px}
.post-faq .pm::before{top:9px;left:3px;right:3px;height:2px}
.post-faq .pm::after{left:9px;top:3px;bottom:3px;width:2px;transition:opacity .2s}
.post-faq details[open] .pm::after{opacity:0}
.post-faq .ans{padding:0 0 24px;color:${MUTED};line-height:1.6}
.post-related{margin-top:56px;padding:26px 28px;border:1px solid rgba(255,255,255,.14);border-radius:18px}
.post-related h3{color:#fff;margin:0 0 14px;text-align:left}
.post-related a{display:inline-flex;align-items:center;gap:8px;color:${ACCENT};margin:6px 22px 6px 0;text-decoration:none;font-family:Inter,sans-serif;font-size:15px;font-weight:500}
.post-related a:hover{text-decoration:underline;text-underline-offset:3px}
.post-cta{max-width:820px;margin:80px auto 110px;padding:0 30px;text-align:center}
.post-cta .actions{display:flex;justify-content:center;margin-top:34px}
.post-cta .framer-text{color:#fff!important}
.post-cta .framer-LqZE5{background:${ACCENT};border-radius:60px;transition:transform .18s ease,filter .2s ease}
.post-cta .framer-LqZE5:hover{filter:brightness(1.08)}
.post-cta .framer-LqZE5 .framer-13x93le{width:auto;min-width:200px;padding:20px 36px!important;justify-content:center!important;gap:0!important}
.post-cta .framer-1m71lft-container{display:none}
.svc-footer{width:100%;margin-top:90px}
.svc-noise{position:fixed;inset:0;z-index:30;pointer-events:none}
.svc-noise .framer-22mi0a{position:absolute;inset:0}
[data-reveal]{opacity:0;transform:translateY(36px);transition:opacity .7s cubic-bezier(.215,.61,.355,1),transform .7s cubic-bezier(.215,.61,.355,1)}
[data-reveal].in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}
</style>`;

const JS = `<script>
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { els.forEach(function(e){e.classList.add('in');}); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function(e){ io.observe(e); });
  function toFooter(ev){ ev.preventDefault(); ev.stopPropagation(); var f = document.querySelector('.svc-footer'); if (!f) return; var y0 = window.scrollY; f.scrollIntoView({behavior:'smooth'}); setTimeout(function(){ if (Math.abs(window.scrollY - y0) < 100) f.scrollIntoView(); }, 700); }
  var navEls = document.querySelectorAll('.svc-nav-wrap *');
  for (var ni = 0; ni < navEls.length; ni++) {
    var el = navEls[ni];
    if (!el.children.length && (el.textContent || '').trim() === 'MENU' && !el.__menuBound) {
      el.__menuBound = true;
      var target = el.closest('[data-framer-name]') || el;
      target.style.cursor = 'pointer';
      target.addEventListener('click', toFooter);
    }
  }
})();
</script>`;

/* inline service links inside paragraph copy */
const LINKS = [
  ['Shopify website design service', '/services/shopify-website-design/'],
  ['WordPress website design service', '/services/wordpress-website-design/'],
  ['Framer website design service', '/services/framer-website-design/'],
  ['Webflow website design service', '/services/webflow-website-design/'],
  ['Wix website design service', '/services/wix-website-design/'],
  ['our services', '/services/'],
  ['get in touch', '/contact'],
];
function linkify(text) {
  let out = esc(text);
  for (const [label, href] of LINKS) {
    const escLabel = esc(label);
    if (out.includes(escLabel)) out = out.replace(escLabel, `<a href="${href}">${escLabel}</a>`);
  }
  return out;
}

function renderPost(d) {
  const url = `${SITE}/blog/${d.slug}/`;
  const body = d.sections.map(sec => {
    const h = sec.h ? `    <h2 class="${P.h3}">${esc(sec.h)}</h2>\n` : '';
    const ps = sec.p.map(p => `    <p class="${P.body}">${linkify(p)}</p>`).join('\n');
    return h + ps;
  }).join('\n');
  const faq = d.faq.map(f => `      <details><summary><span class="${P.h3}" style="color:#fff;text-align:left;font-size:19px!important">${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></summary><div class="ans ${P.body}">${esc(f.a)}</div></details>`).join('\n');
  const related = d.related.map(r => `      <a href="${r.href}">${esc(r.label)} &rarr;</a>`).join('\n');

  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: d.title, description: d.metaDescription, datePublished: d.date, dateModified: d.date,
    author: { '@type': 'Organization', name: 'TheBrandle', url: SITE },
    publisher: { '@type': 'Organization', name: 'TheBrandle', url: SITE, logo: { '@type': 'ImageObject', url: SITE + '/framerusercontent.com/assets/TheBrandle.svg' } },
    image: OG_IMAGE, mainEntityOfPage: url,
  };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: SITE + '/blog' },
    { '@type': 'ListItem', position: 3, name: d.title, item: url }] };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} | TheBrandle</title>
<meta name="description" content="${esc(d.metaDescription)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.ico">
<meta property="og:type" content="article"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${esc(d.title)}"><meta property="og:description" content="${esc(d.metaDescription)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(d.title)}">
<meta name="twitter:description" content="${esc(d.metaDescription)}"><meta name="twitter:image" content="${OG_IMAGE}">
${styles}
${GLUE}
<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
</head>
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ''}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtml}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>

  <article class="post-wrap">
    <span class="post-label" data-reveal>${esc(d.tag)}</span>
    <h1 class="post-h1 ${P.h2}" data-reveal style="transition-delay:70ms">${esc(d.h1)}</h1>
    <div class="post-meta ${P.small}" data-reveal style="transition-delay:140ms">${esc(d.date)} &middot; ${d.readMins} min read &middot; TheBrandle</div>
    <div class="post-body" data-reveal style="transition-delay:210ms">
${body}
    </div>
    <div class="post-faq">
${faq}
    </div>
    <aside class="post-related">
      <h3 class="${P.h3}">Related services</h3>
${related}
    </aside>
  </article>

  <div class="post-cta">
    <h2 class="${P.h2}" style="color:#fff;margin:0 0 18px">Ready to build it right?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us about your project and we will come back with a clear plan, timeline and a fixed quote.</p>
    <div class="actions">${cta('Book a free consultation', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${JS}
</body>
</html>
`;
}

let n = 0;
for (const d of posts) {
  const dir = path.join(OUT, d.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPost(d));
  console.log('wrote blog/' + d.slug + '/index.html');
  n++;
}
console.log(`\nGenerated ${n} blog posts. (/blog listing itself remains the Framer SPA's.)`);
