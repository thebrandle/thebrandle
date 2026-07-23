#!/usr/bin/env node
/**
 * Service page generator v2 — TRUE-BRAND edition.
 *
 * Unlike v1 (hand-written lookalike CSS), v2 composes every page from the
 * site's OWN carved parts, so branding is identical by construction:
 *   - _snapshot/components/styles.html   → the full 519KB Framer stylesheet
 *   - _snapshot/components/nav-live.html → hydrated header (runtime-corrected)
 *   - _snapshot/components/footer-live.html → hydrated footer
 *   - real text presets (framer-styles-preset-*) for every heading/paragraph
 *   - the site's own CTA pill markup (carved "Let's talk" button)
 * Prereqs: run scripts/snapshot-homepage.js + scripts/carve-components.js
 * (and capture *-live.html via the /__save flow) before this.
 * Run: node scripts/gen-service-pages-v2.js
 */
const fs = require('fs');
const path = require('path');
const { pages, PROCESS } = require('./service-pages-data');

const ROOT = path.join(__dirname, '..');
const COMP = path.join(ROOT, '_snapshot', 'components');
const OUT = path.join(ROOT, 'services');
const SITE = 'https://www.thebrandle.com';
const OG_IMAGE = SITE + '/framerusercontent.com/images/YNmypiM868x4WUMKO25HF3tDPN4.jpg';
const EMAIL = 'hello@thebrandle.com';

const read = (f) => fs.readFileSync(path.join(COMP, f), 'utf8');
const styles = read('styles.html');
// carved components carry Framer's relative hrefs (./, ./about). Those
// resolve against the CURRENT path, so on /services/<slug>/ the logo links
// to itself and nav links 404 into the SPA. Absolutize them.
const absolutize = (h) => h.replace(/href="\.\//g, 'href="/').replace(/tel:555-666-7777/g, 'tel:+971561429789');
/* bake a Services link into carved nav/footer markup: clone the About
   anchor (native styling + hover-dup labels), relabel, insert before
   Contact when present, else right after About */
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
const navHtml = absolutize(read('nav-live.html')
  // the container is captured in its pre-appear animation state — normalize
  .replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"'));
const navHtmlFinal = addServices(navHtml);
const navPhoneHtml = fs.existsSync(path.join(COMP, 'nav-phone.html'))
  ? addServices(absolutize(read('nav-phone.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"')))
  : '';
const footerHtml = addServices(absolutize(read('footer-live.html')
  .replace(/style="will-change: transform; opacity: 1; transform: translateY\([^)]+\);"/, 'style="opacity: 1;"')));
const ctaHtml = fs.existsSync(path.join(COMP, 'button-live.html'))
  ? read('button-live.html')            // hydrated red pill w/ real arrow icon
  : read('button.html');
const noiseHtml = fs.existsSync(path.join(COMP, 'noise-live.html'))
  ? read('noise-live.html')             // the site's tiled grain overlay
  : '';

const snapshot = fs.readFileSync(path.join(ROOT, '_snapshot', 'index.html'), 'utf8');
const rootM = snapshot.slice(snapshot.indexOf('</head>')).match(/<div[^>]*data-framer-root[^>]*>/);
const ROOT_OPEN = rootM ? rootM[0] : '<div data-framer-root>';

// note: also normalizes em dashes to plain hyphens (site copy convention)
const esc = (s) => String(s).replace(/\s*—\s*/g, ' - ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => (n < 10 ? '0' + n : '' + n);

/* real text presets, measured on-site:
   1usw2w6 112px/600 display · 1t5qoig 46px/600 H2 · ddjjzx 26px/600 H3
   1dmjd5e 22px/500 lead · 1raml1m 18px/500 body-lg · bq16ho 16px/400 body
   1hahlh8 14px/500 small */
const P = {
  display: 'framer-text framer-styles-preset-1usw2w6',
  h2: 'framer-text framer-styles-preset-1t5qoig',
  h3: 'framer-text framer-styles-preset-ddjjzx',
  lead: 'framer-text framer-styles-preset-1dmjd5e',
  body: 'framer-text framer-styles-preset-bq16ho',
  small: 'framer-text framer-styles-preset-1hahlh8',
};
const ACCENT = 'var(--token-1662617d-fd18-4319-b3da-aa36e5415705, rgb(249, 69, 45))';
const MUTED = 'rgba(255, 255, 255, 0.62)';
const MUTED2 = 'rgba(255, 255, 255, 0.4)';

const cta = (text, href) => ctaHtml
  .replace(/Let’s talk/g, esc(text))
  .replace(/href="[^"]*"/, `href="${href}"`);

/* glue CSS: layout frame only — all type/color/component styling is Framer's */
const GLUE = `<style>
html,body{background:#0C0C0C;margin:0}
.svc-page{display:flex;flex-direction:column;align-items:stretch;overflow-x:hidden}
.svc-nav-wrap{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.78);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px)}
@media(max-width:760px){.svc-nav-desktop{display:none}}
@media(min-width:761px){.svc-nav-phone{display:none}}
.svc-section{width:100%;max-width:1200px;margin:0 auto;padding:100px 30px 0;box-sizing:border-box}
.svc-label{display:block;color:${ACCENT};letter-spacing:.14em;text-transform:uppercase;font-family:Inter,sans-serif;font-size:12.5px;font-weight:500;margin-bottom:18px}
.svc-num{color:${ACCENT}!important;font-variant-numeric:tabular-nums}
.svc-hero-actions .framer-text{color:#fff!important}
.svc-hero-actions .framer-LqZE5{background:${ACCENT};border-radius:60px}
.svc-hero-actions .framer-LqZE5 .framer-13x93le{width:auto;min-width:200px;padding:20px 36px!important}
.svc-hero-actions .framer-LqZE5{transition:transform .18s ease,filter .2s ease}
.svc-hero-actions .framer-LqZE5:hover{filter:brightness(1.08)}
.svc-hero-actions .framer-LqZE5:active{transform:scale(.97)}
.svc-hero-actions .framer-1m71lft-container{display:none}
.svc-hero-actions .framer-13x93le{justify-content:center!important;gap:0!important}
.svc-rows a,.svc-rows a *{text-decoration:none!important}
.svc-num::before{content:"{ "}.svc-num::after{content:" }"}
.svc-rows{margin-top:54px;border-top:1px solid rgba(255,255,255,.12)}
.svc-row{position:relative;padding:40px 0;border-bottom:1px solid rgba(255,255,255,.12)}
.svc-row .svc-num{position:absolute;top:44px;right:2px}
.svc-row-title{color:rgba(255,255,255,.45)!important;transition:color .28s ease;padding-right:80px}
.svc-row:hover .svc-row-title{color:#fff!important}
.svc-row-body{max-width:60ch;margin-top:14px}
.svc-cols{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;margin-top:8px}
@media(max-width:840px){.svc-cols{grid-template-columns:1fr;gap:34px}}
.svc-check{display:flex;gap:14px;align-items:flex-start;margin-top:16px}
.svc-check svg{width:11px;height:11px;flex-shrink:0;margin-top:7px;color:${ACCENT}}
.svc-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:54px;border-top:1px solid rgba(255,255,255,.12)}
@media(max-width:840px){.svc-steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.svc-steps{grid-template-columns:1fr}}
.svc-step{padding:32px 26px 36px 0;border-right:1px solid rgba(255,255,255,.12)}
.svc-step:last-child{border-right:none}
@media(max-width:840px){.svc-step{border-right:none;border-bottom:1px solid rgba(255,255,255,.12)}}
.svc-faq{max-width:880px;margin:54px auto 0}
.svc-faq details{border-bottom:1px solid rgba(255,255,255,.12)}
.svc-faq summary{list-style:none;cursor:pointer;padding:28px 0;display:flex;justify-content:space-between;align-items:center;gap:22px;color:#fff}
.svc-faq summary::-webkit-details-marker{display:none}
.svc-faq .pm{width:22px;height:22px;flex-shrink:0;position:relative}
.svc-faq .pm::before,.svc-faq .pm::after{content:"";position:absolute;background:${ACCENT};border-radius:2px}
.svc-faq .pm::before{top:10px;left:3px;right:3px;height:2px}
.svc-faq .pm::after{left:10px;top:3px;bottom:3px;width:2px;transition:opacity .2s}
.svc-faq details[open] .pm::after{opacity:0}
.svc-faq .ans{padding:0 0 30px}
.svc-hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:44px}
.svc-band{max-width:1200px;margin:100px auto 120px;padding:0 30px;text-align:center}
.svc-band .svc-hero-actions{justify-content:center}
.svc-footer{width:100%;margin-top:110px}
/* site grain overlay (carved) */
.svc-noise{position:fixed;inset:0;z-index:30;pointer-events:none}
.svc-noise .framer-22mi0a{position:absolute;inset:0}
/* entry reveals — mirrors Framer's appear (fade + 40px rise, stagger) */
[data-reveal]{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.215,.61,.355,1),transform .7s cubic-bezier(.215,.61,.355,1)}
[data-reveal].in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}
</style>`;

/* reveal driver — IntersectionObserver, stagger via per-element delay */
const REVEAL_JS = `<script>
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { els.forEach(function(e){e.classList.add('in');}); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function(e, i){ io.observe(e); });
  // static pages: burger MENU can't open the Framer menu — jump to footer nav
  function toFooter(ev){ ev.preventDefault(); ev.stopPropagation(); var f = document.querySelector('.svc-footer'); if (!f) return; var y0 = window.scrollY; f.scrollIntoView({behavior:'smooth'}); setTimeout(function(){ if (Math.abs(window.scrollY - y0) < 100) f.scrollIntoView(); }, 700); }
  var wraps = document.querySelectorAll('.svc-nav-wrap [data-framer-name="MENU"], .svc-nav-wrap [data-framer-name="Menu icon"], .svc-nav-wrap [data-framer-name="Burger"]');
  for (var mi = 0; mi < wraps.length; mi++) { wraps[mi].style.cursor = 'pointer'; wraps[mi].addEventListener('click', toFooter); }
  // fallback: any leaf element in the nav whose text is exactly MENU
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

const MARK = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 1.5h9v9"/></svg>`;

function head(title, desc, url, schemas) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.ico">
<meta property="og:type" content="website"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${OG_IMAGE}">
${styles}
${GLUE}
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>`;
}

function renderPage(d) {
  const url = `${SITE}/services/${d.slug}/`;
  const rows = d.features.map((f, i) => `      <div class="svc-row" data-reveal style="transition-delay:${i * 70}ms"><span class="svc-num ${P.small}">${pad2(i + 1)}</span><h3 class="svc-row-title ${P.h2}" style="text-align:left">${esc(f.title)}</h3><p class="svc-row-body ${P.body}" style="color:${MUTED2};text-align:left">${esc(f.body)}</p></div>`).join('\n');
  const checks = d.why.points.map(p => `        <div class="svc-check">${MARK}<span class="${P.body}" style="color:#fff">${esc(p)}</span></div>`).join('\n');
  const steps = (d.process || PROCESS).map((s, i) => `      <div class="svc-step" data-reveal style="transition-delay:${i * 70}ms"><span class="svc-num ${P.small}" style="display:block;margin-bottom:22px">${pad2(i + 1)}</span><h3 class="${P.h3}" style="color:#fff;text-align:left;margin:0 0 10px">${esc(s.title)}</h3><p class="${P.small}" style="color:${MUTED};text-align:left">${esc(s.body)}</p></div>`).join('\n');
  const faqs = d.faqs.map((f, i) => `      <details data-reveal style="transition-delay:${i * 60}ms"><summary><span class="${P.h3}" style="color:#fff;text-align:left">${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></summary><div class="ans ${P.body}" style="color:${MUTED}">${esc(f.a)}</div></details>`).join('\n');

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: d.serviceType, name: d.h1, provider: { '@type': 'ProfessionalService', name: 'TheBrandle', url: SITE, email: EMAIL, telephone: '+971561429789', image: OG_IMAGE, areaServed: 'Worldwide' }, description: d.metaDescription, url },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Services', item: SITE + '/services/' }, { '@type': 'ListItem', position: 3, name: d.navTitle, item: url }] },
  ];

  return `${head(d.title, d.metaDescription, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>

  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label" data-reveal>${esc(d.eyebrow)}</span>
    <h1 class="${P.display}" data-reveal style="color:#fff;text-align:left;margin:0 0 26px;transition-delay:70ms">${esc(d.h1)}</h1>
    <p class="${P.lead}" data-reveal style="color:${MUTED};text-align:left;max-width:58ch;transition-delay:140ms">${esc(d.heroSub)}</p>
    <div class="svc-hero-actions" data-reveal style="transition-delay:210ms">${cta('Start your project', '/contact')}</div>
  </section>

  <section class="svc-section">
    <span class="svc-label">What you get</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 14px">${esc(d.deliverHeading)}</h2>
    <p class="${P.body}" style="color:${MUTED};text-align:left;max-width:64ch">${esc(d.deliverSub)}</p>
    <div class="svc-rows">
${rows}
    </div>
  </section>

  <section class="svc-section">
    <div class="svc-cols">
      <div><span class="svc-label">${esc(d.why.eyebrow)}</span><h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0">${esc(d.why.heading)}</h2></div>
      <div><p class="${P.body}" style="color:${MUTED};text-align:left">${esc(d.why.body)}</p><div style="margin-top:22px">
${checks}
      </div></div>
    </div>
  </section>

  <section class="svc-section">
    <span class="svc-label">How we work</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 14px">${esc(d.processHeading)}</h2>
    <div class="svc-steps">
${steps}
    </div>
  </section>

  <section class="svc-section">
    <span class="svc-label" style="text-align:center">Questions</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:center;margin:0">${esc(d.navTitle)} design, answered</h2>
    <div class="svc-faq">
${faqs}
    </div>
  </section>

  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">${esc(d.ctaHeading)}</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">${esc(d.ctaBody)}</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

function renderHub() {
  const url = `${SITE}/services/`;
  const title = 'Services - Branding, Web, Ecommerce & UI/UX Design | TheBrandle';
  const desc = 'TheBrandle designs and builds websites, online stores and brand identities - Shopify, Webflow, Framer, WordPress, Wix, Squarespace and UI/UX design.';
  const rows = pages.map((p, i) => `      <a class="svc-row" style="display:block" href="/services/${p.slug}/"><span class="svc-num ${P.small}">${pad2(i + 1)}</span><h3 class="svc-row-title ${P.h2}" style="text-align:left">${esc(p.hubTitle)}</h3><p class="svc-row-body ${P.body}" style="color:${MUTED2};text-align:left">${esc(p.hubTagline)}</p></a>`).join('\n');
  const schemas = [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.hubTitle, url: `${SITE}/services/${p.slug}/` })) }];
  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label">What we do</span>
    <h1 class="${P.display}" style="color:#fff;text-align:left;margin:0 0 26px">Design &amp; build, on your platform</h1>
    <p class="${P.lead}" style="color:${MUTED};text-align:left;max-width:58ch">From brand identity to a live website or online store - we design and build on the platform that fits your goals. Pick a service to see how we work.</p>
    <div class="svc-hero-actions">${cta('Start your project', '/contact')}</div>
    <div class="svc-rows">
${rows}
    </div>
  </section>
  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Not sure which platform is right?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us your goals and we'll recommend the best fit - then design and build it end to end.</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

let n = 0;
for (const d of pages) {
  const dir = path.join(OUT, d.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(d));
  n++;
}
fs.writeFileSync(path.join(OUT, 'index.html'), renderHub());
console.log(`v2: generated ${n} service pages + hub from carved real components`);
