#!/usr/bin/env node
/**
 * TheBrandle — service landing page generator.
 *
 * Standalone, pre-rendered, SEO-targeted pages that Vercel serves as static
 * files BEFORE the SPA catch-all (filesystem-first). Output:
 *   /services/<slug>/index.html  ->  https://www.thebrandle.com/services/<slug>/
 *   /services/index.html         ->  the hub linking all pages
 *
 * Design tokens are extracted verbatim from thebrandle.com:
 *   accent #F9452D · bg #0C0C0C · light section #FFFFFF · Inter
 *   display headings: weight 600, letter-spacing -0.07em, line-height 0.96
 *   sub-heads: weight 600, -0.04em, line-height 1.3 · pill buttons r=50px
 * Run:  node scripts/gen-service-pages.js
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.thebrandle.com';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'services');

const LOGO = '/framerusercontent.com/assets/TheBrandle.svg';
const OG_IMAGE = SITE + '/framerusercontent.com/images/YNmypiM868x4WUMKO25HF3tDPN4.jpg';
const EMAIL = 'hello@thebrandle.com';
const PHONE_DISPLAY = '+971 56 142 9789';
const PHONE_HREF = 'tel:+971561429789';
const INSTAGRAM = 'https://www.instagram.com/thebrandlestudio';
const YEAR = 2026;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* signature glyphs (thebrandle.com uses a red corner-arrow on CTAs + ⌐ marks) */
const ARROW = '<svg class="ca" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5h6"/><path d="M8 6.5l3.2 2.5L8 11.5"/></svg>';
const MARK = '<svg class="cm" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 1.5h9v9"/></svg>';

/* ----------------------------------------------------------------------- CSS */
const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0C0C0C;--surface:#151515;--surface-2:#191919;--border:#242424;
  --text:#FFFFFF;--muted:#9a9a9e;--muted-2:#6d6d72;--accent:#F9452D;--accent-hover:#ff5c47;
  --light:#FFFFFF;--light-2:#FAFAF8;--light-border:#E6E6E3;--ink:#0C0C0C;--ink-muted:#6b6b6e;
  --maxw:1200px;
}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
a{color:inherit;text-decoration:none}
img,svg{display:block;max-width:100%}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 28px}
h1,h2,h3{font-weight:600;letter-spacing:-0.055em;line-height:1.0}
.display{letter-spacing:-0.07em;line-height:0.96}
p{color:var(--muted)}

.eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:12.5px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:var(--accent)}
.eyebrow::before{content:"";width:22px;height:1px;background:var(--accent)}
.num{font-size:13px;font-weight:500;letter-spacing:.06em;color:var(--accent);font-variant-numeric:tabular-nums}
.num::before{content:"{ "}.num::after{content:" }"}
.ca{width:15px;height:15px;flex-shrink:0}
.cm{width:11px;height:11px;flex-shrink:0}

.btn{display:inline-flex;align-items:center;gap:12px;font-weight:500;font-size:15px;padding:16px 28px;border-radius:50px;transition:transform .15s,background .2s,border-color .2s,color .2s;cursor:pointer;border:1px solid transparent;white-space:nowrap;line-height:1}
.btn:active{transform:scale(.97)}
.btn .ca{color:var(--accent)}
.btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:var(--accent-hover)}.btn-primary .ca{color:#fff}
.btn-ghost{background:transparent;color:var(--text);border-color:var(--border)}.btn-ghost:hover{border-color:#3d3d3d;background:var(--surface)}
.btn-dark{background:var(--ink);color:#fff}.btn-dark:hover{background:#000}.btn-dark .ca{color:#fff}

.nav{position:sticky;top:0;z-index:50;background:rgba(12,12,12,.72);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px);border-bottom:1px solid var(--border)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:72px}
.nav-logo{height:24px;width:auto}
.nav-links{display:flex;align-items:center;gap:36px}
.nav-links a{font-size:13.5px;color:var(--muted);font-weight:500;transition:color .18s}.nav-links a:hover{color:var(--text)}
@media(max-width:760px){.nav-links{display:none}}

.hero{padding:108px 0 88px;position:relative}
.hero::after{content:"";position:absolute;top:-8%;left:50%;transform:translateX(-50%);width:900px;height:560px;max-width:130%;background:radial-gradient(closest-side,rgba(249,69,45,.16),transparent 72%);pointer-events:none;z-index:0}
.hero .wrap{position:relative;z-index:1}
.crumbs{font-size:12.5px;color:var(--muted-2);margin-bottom:30px}
.crumbs a:hover{color:var(--muted)}.crumbs span{margin:0 9px;opacity:.5}
.hero h1{font-size:clamp(48px,7.6vw,104px);letter-spacing:-0.07em;line-height:0.96;margin:20px 0 26px;max-width:15ch}
.hero .sub{font-size:clamp(17px,2.1vw,22px);max-width:54ch;color:var(--muted);line-height:1.45}
.hero .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:42px}
.trust{display:flex;flex-wrap:wrap;margin-top:54px;border-top:1px solid var(--border)}
.trust span{padding:22px 32px 0 0;color:var(--muted);font-size:14.5px;display:flex;align-items:center;gap:10px}
.trust .cm{color:var(--accent)}.trust b{color:var(--text);font-weight:500}

section{padding:92px 0}
.sec-head{max-width:64ch}
.sec-head h2{font-size:clamp(34px,5vw,58px);letter-spacing:-0.065em;line-height:0.98;margin:18px 0 16px}
.sec-head p{font-size:17px;line-height:1.5}

/* big stacked service list — mirrors thebrandle.com's Development/Websites/Design support section */
.svclist{margin-top:58px;border-top:1px solid var(--border)}
.svcrow{position:relative;padding:38px 0;border-bottom:1px solid var(--border)}
.svcrow .num{position:absolute;top:42px;right:2px}
.svcrow h3{font-size:clamp(30px,5.4vw,60px);letter-spacing:-0.06em;line-height:0.98;font-weight:600;color:#666;transition:color .28s ease;padding-right:74px}
.svcrow p{font-size:15px;line-height:1.55;color:var(--muted-2);max-width:58ch;margin-top:16px;transition:color .28s ease}
.svcrow:hover h3{color:#fff}
.svcrow:hover p{color:var(--muted)}
@media(max-width:560px){.svcrow h3{padding-right:56px}}

.split{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start}
@media(max-width:840px){.split{grid-template-columns:1fr;gap:34px}}
.split h2{font-size:clamp(30px,4.4vw,48px);letter-spacing:-0.06em;line-height:1.0;margin-top:16px}
.split .body p{font-size:17px;line-height:1.6;color:var(--muted)}
.checklist{list-style:none;display:flex;flex-direction:column;gap:16px;margin-top:28px}
.checklist li{display:flex;gap:14px;font-size:16px;color:var(--text);align-items:flex-start}
.checklist li .cm{color:var(--accent);margin-top:4px}

.steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:52px;border-top:1px solid var(--border)}
@media(max-width:840px){.steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.steps{grid-template-columns:1fr}}
.step{padding:30px 26px 34px 0;border-right:1px solid var(--border)}
.step:last-child{border-right:none}
@media(max-width:840px){.step{border-right:none;border-bottom:1px solid var(--border)}}
.step .num{display:block;margin-bottom:22px}
.step h3{font-size:20px;letter-spacing:-0.04em;margin:0 0 10px;font-weight:600}
.step p{font-size:14.5px;line-height:1.5;color:var(--muted)}

.faq{max-width:860px;margin:52px auto 0}
.faq details{border-bottom:1px solid var(--border)}
.faq summary{list-style:none;cursor:pointer;padding:26px 0;font-size:20px;font-weight:500;letter-spacing:-0.035em;display:flex;justify-content:space-between;align-items:center;gap:22px;color:var(--text)}
.faq summary::-webkit-details-marker{display:none}
.faq summary .pm{width:22px;height:22px;flex-shrink:0;position:relative}
.faq summary .pm::before,.faq summary .pm::after{content:"";position:absolute;background:var(--accent);border-radius:2px}
.faq summary .pm::before{top:10px;left:3px;right:3px;height:2px}
.faq summary .pm::after{left:10px;top:3px;bottom:3px;width:2px;transition:opacity .2s}
.faq details[open] summary .pm::after{opacity:0}
.faq .ans{padding:0 0 28px;font-size:16px;color:var(--muted);max-width:74ch;line-height:1.6}

.band{border:1px solid var(--border);border-radius:28px;background:linear-gradient(180deg,var(--surface),#0e0e0e);padding:clamp(44px,6vw,84px);text-align:center;position:relative;overflow:hidden}
.band::before{content:"";position:absolute;inset:0;background:radial-gradient(closest-side at 50% -10%,rgba(249,69,45,.22),transparent 70%);pointer-events:none}
.band h2{font-size:clamp(34px,5.2vw,60px);letter-spacing:-0.07em;line-height:0.98;margin-bottom:18px;position:relative}
.band p{font-size:18px;max-width:52ch;margin:0 auto 32px;position:relative;line-height:1.45}
.band .actions{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;position:relative}

footer{border-top:1px solid var(--border);padding:72px 0 44px}
.foot{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:44px}
@media(max-width:720px){.foot{grid-template-columns:1fr;gap:32px}}
.foot img{height:24px;margin-bottom:20px}
.foot p{font-size:14.5px;max-width:34ch;line-height:1.5}
.foot h4{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted-2);margin-bottom:18px;font-weight:600}
.foot ul{list-style:none;display:flex;flex-direction:column;gap:12px}
.foot ul a{font-size:14.5px;color:var(--muted);transition:color .18s}.foot ul a:hover{color:var(--text)}
.foot-bottom{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:52px;padding-top:26px;border-top:1px solid var(--border);font-size:13px;color:var(--muted-2)}

/* hub */
.hub-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
@media(max-width:900px){.hub-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.hub-grid{grid-template-columns:1fr}}
.hub-card{position:relative;border:1px solid var(--border);border-radius:20px;padding:30px 28px;background:var(--surface);transition:transform .2s,border-color .2s,background .2s;display:flex;flex-direction:column;min-height:210px}
.hub-card:hover{transform:translateY(-4px);border-color:#3a3a3a;background:var(--surface-2)}
.hub-card .num{margin-bottom:18px}
.hub-card h3{font-size:23px;letter-spacing:-0.04em;margin-bottom:10px;font-weight:600}
.hub-card p{font-size:14.5px;line-height:1.5;flex:1}
.hub-card .go{display:inline-flex;align-items:center;gap:9px;color:var(--accent);font-size:14px;font-weight:500;margin-top:20px}
`;

/* ------------------------------------------------------------------ partials */
function nav() {
  return `<header class="nav"><div class="wrap nav-in">
  <a href="/" aria-label="TheBrandle home"><img class="nav-logo" src="${LOGO}" alt="TheBrandle" width="115" height="24"></a>
  <nav class="nav-links">
    <a href="/services/">Services</a><a href="/projects">Work</a><a href="/about">About</a><a href="/contact">Contact</a>
  </nav>
  <a class="btn btn-primary" href="/contact">Let's talk ${ARROW}</a>
</div></header>`;
}
function footer() {
  return `<footer><div class="wrap">
  <div class="foot">
    <div><img src="${LOGO}" alt="TheBrandle" width="115" height="24"><p>A branding, UI/UX &amp; web design studio building websites, stores and brand identities for founders and growing businesses.</p></div>
    <div><h4>Services</h4><ul>
      <li><a href="/services/shopify-website-design/">Shopify Design</a></li>
      <li><a href="/services/webflow-website-design/">Webflow Design</a></li>
      <li><a href="/services/framer-website-design/">Framer Design</a></li>
      <li><a href="/services/ui-ux-design/">UI/UX Design</a></li>
      <li><a href="/services/">All services</a></li>
    </ul></div>
    <div><h4>Get in touch</h4><ul>
      <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
      <li><a href="${PHONE_HREF}">${PHONE_DISPLAY}</a></li>
      <li><a href="${INSTAGRAM}" target="_blank" rel="noopener">Instagram</a></li>
    </ul></div>
  </div>
  <div class="foot-bottom"><span>© ${YEAR} TheBrandle. All rights reserved.</span><span>Branding · UI/UX · Web · Ecommerce</span></div>
</div></footer>`;
}
const pad2 = (n) => (n < 10 ? '0' + n : '' + n);
const head = (d, url) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)}</title>
<meta name="description" content="${esc(d.metaDescription)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.ico">
<meta property="og:type" content="website"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${esc(d.title)}"><meta property="og:description" content="${esc(d.metaDescription)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(d.title)}">
<meta name="twitter:description" content="${esc(d.metaDescription)}"><meta name="twitter:image" content="${OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>`;

/* --------------------------------------------------------------- page render */
function renderPage(d) {
  const url = `${SITE}/services/${d.slug}/`;
  const featureRows = d.features.map((f, i) => `      <div class="svcrow"><span class="num">${pad2(i + 1)}</span><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></div>`).join('\n');
  const checks = d.why.points.map(p => `        <li>${MARK}<span>${esc(p)}</span></li>`).join('\n');
  const steps = (d.process || PROCESS).map((s, i) => `      <div class="step"><span class="num">${pad2(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></div>`).join('\n');
  const faqItems = d.faqs.map(f => `      <details><summary>${esc(f.q)}<span class="pm" aria-hidden="true"></span></summary><div class="ans">${esc(f.a)}</div></details>`).join('\n');

  const serviceSchema = { '@context': 'https://schema.org', '@type': 'Service', serviceType: d.serviceType, name: d.h1, provider: { '@type': 'ProfessionalService', name: 'TheBrandle', url: SITE, email: EMAIL, telephone: '+971561429789', image: OG_IMAGE, areaServed: 'Worldwide' }, description: d.metaDescription, url };
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Services', item: SITE + '/services/' }, { '@type': 'ListItem', position: 3, name: d.navTitle, item: url }] };

  return `${head(d, url)}
<script type="application/ld+json">${JSON.stringify(serviceSchema)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>
</head>
<body>
${nav()}
<main>
  <section class="hero"><div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/services/">Services</a><span>/</span>${esc(d.navTitle)}</nav>
    <span class="eyebrow">${esc(d.eyebrow)}</span>
    <h1>${esc(d.h1)}</h1>
    <p class="sub">${esc(d.heroSub)}</p>
    <div class="actions"><a class="btn btn-primary" href="/contact">${ARROW} Start your project</a><a class="btn btn-ghost" href="/projects">${ARROW} See our work</a></div>
    <div class="trust"><span>${MARK}<b>${esc(d.trust[0])}</b></span><span>${MARK}<b>${esc(d.trust[1])}</b></span><span>${MARK}<b>${esc(d.trust[2])}</b></span></div>
  </div></section>

  <section><div class="wrap">
    <div class="sec-head"><span class="eyebrow">What you get</span><h2>${esc(d.deliverHeading)}</h2><p>${esc(d.deliverSub)}</p></div>
    <div class="svclist">
${featureRows}
    </div>
  </div></section>

  <section><div class="wrap"><div class="split">
    <div><span class="eyebrow">${esc(d.why.eyebrow)}</span><h2>${esc(d.why.heading)}</h2></div>
    <div class="body"><p>${esc(d.why.body)}</p><ul class="checklist">
${checks}
    </ul></div>
  </div></div></section>

  <section style="border-top:1px solid var(--border)"><div class="wrap">
    <div class="sec-head"><span class="eyebrow">How we work</span><h2>${esc(d.processHeading)}</h2><p>A clear, collaborative process from first call to launch — no black boxes, no surprises.</p></div>
    <div class="steps">
${steps}
    </div>
  </div></section>

  <section><div class="wrap">
    <div class="sec-head" style="margin:0 auto;text-align:center"><span class="eyebrow" style="justify-content:center">Questions</span><h2>${esc(d.navTitle)} design, answered</h2></div>
    <div class="faq">
${faqItems}
    </div>
  </div></section>

  <section><div class="wrap"><div class="band">
    <h2>${esc(d.ctaHeading)}</h2><p>${esc(d.ctaBody)}</p>
    <div class="actions"><a class="btn btn-primary" href="/contact">${ARROW} Book a free consultation</a><a class="btn btn-ghost" href="mailto:${EMAIL}">Email us</a></div>
  </div></div></section>
</main>
${footer()}
</body>
</html>
`;
}

function renderHub(list) {
  const url = `${SITE}/services/`;
  const d = { title: 'Services — Branding, Web, Ecommerce & UI/UX Design | TheBrandle', metaDescription: 'TheBrandle designs and builds websites, online stores and brand identities — Shopify, Webflow, Framer, WordPress, Wix, Squarespace and UI/UX design.' };
  const cards = list.map((p, i) => `      <a class="hub-card" href="/services/${p.slug}/"><span class="num">${pad2(i + 1)}</span><h3>${esc(p.hubTitle)}</h3><p>${esc(p.hubTagline)}</p><span class="go">${ARROW} Explore</span></a>`).join('\n');
  const itemList = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.hubTitle, url: `${SITE}/services/${p.slug}/` })) };
  return `${head(d, url)}
<script type="application/ld+json">${JSON.stringify(itemList)}</script>
</head>
<body>
${nav()}
<main>
  <section class="hero"><div class="wrap">
    <nav class="crumbs"><a href="/">Home</a><span>/</span>Services</nav>
    <span class="eyebrow">What we do</span>
    <h1>Design &amp; build, on your platform</h1>
    <p class="sub">From brand identity to a live website or online store — we design and build on the platform that fits your goals. Pick a service to see how we work.</p>
    <div class="actions"><a class="btn btn-primary" href="/contact">${ARROW} Start your project</a><a class="btn btn-ghost" href="/projects">${ARROW} See our work</a></div>
  </div></section>
  <section style="padding-top:0"><div class="wrap"><div class="hub-grid">
${cards}
  </div></div></section>
  <section><div class="wrap"><div class="band">
    <h2>Not sure which platform is right?</h2><p>Tell us your goals and we'll recommend the best fit — then design and build it end to end.</p>
    <div class="actions"><a class="btn btn-primary" href="/contact">${ARROW} Book a free consultation</a><a class="btn btn-ghost" href="mailto:${EMAIL}">Email us</a></div>
  </div></div></section>
</main>
${footer()}
</body>
</html>
`;
}

/* -------------------------------------------------------------------- shared */
const PROCESS = [
  { title: 'Discovery', body: 'We start with your goals, audience and competitors — then map scope, sitemap and success metrics before a pixel is drawn.' },
  { title: 'Design', body: 'Brand-first UI in Figma. You see real screens early and often, with rounds of feedback baked into the timeline.' },
  { title: 'Build', body: 'Pixel-perfect development on your chosen platform — responsive, fast, and easy for you to edit after handoff.' },
  { title: 'Launch & grow', body: 'QA, analytics, SEO basics and a smooth go-live — plus post-launch support to refine what the data tells us.' },
];

/* --------------------------------------------------------------------- pages */
const pages = [
  {
    slug: 'shopify-website-design', navTitle: 'Shopify', serviceType: 'Shopify Website Design & Development',
    title: 'Shopify Website Design & Development Agency | TheBrandle',
    metaDescription: 'TheBrandle designs and builds high-converting Shopify stores — custom themes, mobile-first product pages and frictionless checkout. Book a free consultation.',
    hubTitle: 'Shopify Design', hubTagline: 'High-converting custom Shopify stores, built to scale.',
    eyebrow: 'Ecommerce · Shopify', h1: 'Shopify stores designed to sell',
    heroSub: 'We design and build custom Shopify websites that turn browsers into buyers — brand-first storefronts, frictionless checkout, and the performance to scale as you grow.',
    trust: ['Custom Shopify themes', 'Conversion-focused', 'Built to scale'],
    deliverHeading: 'Everything your store needs to convert',
    deliverSub: 'A complete Shopify build — not a template with your logo dropped in. Designed around your products, customers and margins.',
    features: [
      { title: 'Custom theme design', body: 'A bespoke storefront designed around your brand and catalogue — no cookie-cutter themes, no generic layouts.' },
      { title: 'Mobile-first product pages', body: 'Most of your traffic is on mobile. We design product and collection pages that sell brilliantly on every screen.' },
      { title: 'Checkout & conversion UX', body: 'Streamlined cart-to-checkout flows, trust signals and upsells engineered to lift average order value.' },
      { title: 'App & payment integrations', body: 'Subscriptions, reviews, shipping, multi-currency and the apps your workflow needs — integrated cleanly.' },
      { title: 'Speed & Core Web Vitals', body: 'Fast-loading stores that keep customers and rank well — optimised images, clean code and a lean theme.' },
      { title: 'SEO-ready foundations', body: 'Structured data, clean URLs, metadata and a crawlable architecture so your products get found on Google.' },
    ],
    why: { eyebrow: 'When to choose Shopify', heading: 'The most reliable way to run a growing online store',
      body: 'Shopify handles the hard parts of ecommerce — secure checkout, payments, inventory and scale — so you can focus on product and brand. It is our go-to for direct-to-consumer brands, product launches and any store that needs to grow without re-platforming later.',
      points: ['Direct-to-consumer and retail brands ready to scale', 'Stores that need dependable checkout and payments out of the box', 'Teams that want to manage products without a developer', 'Brands planning subscriptions, multi-currency or international selling'] },
    processHeading: 'From first call to a store that sells',
    faqs: [
      { q: 'How much does a Shopify website cost?', a: 'It depends on catalogue size, custom functionality and integrations. We scope every project up front so you get a fixed, transparent quote before we begin — no surprises. Book a call and we will give you a clear number.' },
      { q: 'How long does a Shopify build take?', a: 'A typical custom Shopify store takes around 3 to 6 weeks from kickoff to launch, depending on scope and how quickly we get content and feedback. We agree the timeline before we start.' },
      { q: 'Can you migrate my existing store to Shopify?', a: 'Yes. We migrate from WooCommerce, Wix, Squarespace and other platforms — products, collections, customers and URLs — with redirects in place so you keep your SEO and traffic.' },
      { q: 'Will I be able to edit the store myself?', a: 'Absolutely. You will be able to add products, update content and manage orders yourself, and we provide a handover walkthrough so nothing feels unfamiliar.' },
    ],
    ctaHeading: 'Ready to launch a Shopify store that sells?', ctaBody: 'Tell us about your products and goals. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'ecommerce-website-design', navTitle: 'Ecommerce', serviceType: 'Ecommerce Website Design',
    title: 'Ecommerce Website Design Agency — Online Stores | TheBrandle',
    metaDescription: 'TheBrandle designs and builds online stores that convert — on Shopify, WooCommerce and more. Brand-first ecommerce websites for growing brands. Free consultation.',
    hubTitle: 'Ecommerce Design', hubTagline: 'Online stores that convert, on the right platform for you.',
    eyebrow: 'Ecommerce', h1: 'Online stores built to grow',
    heroSub: 'We design and build ecommerce websites that turn traffic into revenue — on Shopify, WooCommerce or the platform that fits your business. Brand-first, mobile-first, conversion-obsessed.',
    trust: ['Platform-agnostic', 'Conversion-focused', 'Brand-first design'],
    deliverHeading: 'A store designed around how people actually buy',
    deliverSub: 'From the first impression to the confirmation page — every screen engineered to build trust and remove friction.',
    features: [
      { title: 'Conversion-first UX', body: 'Product, collection and cart flows designed to reduce friction and lift average order value from day one.' },
      { title: 'Right-platform advice', body: 'Shopify, WooCommerce or headless — we recommend the platform that fits your catalogue, budget and roadmap.' },
      { title: 'Brand-led storefront', body: 'A store that looks like your brand, not a template — building the trust that turns first-time visitors into buyers.' },
      { title: 'Mobile-first everything', body: 'Designed for the phone first, where most of your sales happen — fast, tappable and effortless to check out.' },
      { title: 'Payments & logistics', body: 'Multi-currency, shipping, taxes and the integrations your operation needs, set up cleanly and correctly.' },
      { title: 'SEO & analytics', body: 'Crawlable structure, structured data and proper tracking so you can see what sells and get found on Google.' },
    ],
    why: { eyebrow: 'Why work with us', heading: 'Ecommerce that balances brand and performance',
      body: 'Plenty of stores look nice and convert poorly, or convert well and look generic. We do both — pairing brand-led design with a relentless focus on the numbers that matter. Whether you are launching your first product or replatforming a growing catalogue, we build stores that scale.',
      points: ['New brands launching their first online store', 'Growing brands outgrowing a template or DIY build', 'Teams replatforming for better performance', 'Businesses that want design and conversion in equal measure'] },
    processHeading: 'From concept to a store that converts',
    faqs: [
      { q: 'Which ecommerce platform should I use?', a: 'For most brands we recommend Shopify for its reliability and ease of running day-to-day; WooCommerce when you need deep WordPress/content integration. We advise on the right fit during discovery — free of charge.' },
      { q: 'How much does an ecommerce website cost?', a: 'It scales with catalogue size, custom features and integrations. We scope every project up front and give you a fixed, transparent quote before any work begins.' },
      { q: 'Can you redesign my existing store?', a: 'Yes. We regularly redesign and replatform existing stores — keeping what works, fixing what leaks conversions, and preserving your SEO with proper redirects.' },
      { q: 'Do you handle the launch and after?', a: 'We do. We QA thoroughly, launch smoothly, and offer post-launch support to keep refining based on real store data.' },
    ],
    ctaHeading: 'Ready to build a store that grows revenue?', ctaBody: 'Tell us about your products and goals. We will recommend the right platform and come back with a clear plan, timeline and quote.',
  },
  {
    slug: 'webflow-website-design', navTitle: 'Webflow', serviceType: 'Webflow Website Design & Development',
    title: 'Webflow Website Design & Development Agency | TheBrandle',
    metaDescription: 'TheBrandle designs and builds custom Webflow websites — pixel-perfect design, a CMS you can actually manage, and smooth interactions. Book a free consultation.',
    hubTitle: 'Webflow Design', hubTagline: 'Custom, CMS-powered Webflow sites you can manage yourself.',
    eyebrow: 'Web · Webflow', h1: 'Webflow sites with total design freedom',
    heroSub: 'We design and build custom Webflow websites — pixel-perfect, richly interactive, and powered by a CMS your team can actually manage. No templates, no limits.',
    trust: ['Custom, no templates', 'CMS you can manage', 'Smooth interactions'],
    deliverHeading: 'A site that looks bespoke and runs itself',
    deliverSub: 'The design freedom of custom code with a visual CMS your team can update without touching a developer.',
    features: [
      { title: 'Pixel-perfect custom design', body: 'Every section designed from scratch to your brand — Webflow gives us the freedom to build exactly what we design.' },
      { title: 'Structured CMS', body: 'Blog, case studies, team, careers — set up as clean CMS collections your team can update in minutes.' },
      { title: 'Interactions & motion', body: 'Scroll effects, hovers and transitions that feel premium, built natively so they stay fast and smooth.' },
      { title: 'Responsive by design', body: 'Crafted for every breakpoint — from ultrawide displays down to the smallest phone, nothing left to chance.' },
      { title: 'Fast & SEO-ready', body: 'Clean semantic markup, optimised assets and proper metadata so the site loads fast and ranks well.' },
      { title: 'Easy handoff', body: 'You own the project fully, with a walkthrough so editing content and publishing feels effortless.' },
    ],
    why: { eyebrow: 'When to choose Webflow', heading: 'For teams who want custom design and self-service editing',
      body: 'Webflow is the sweet spot between a rigid template and expensive custom code. It lets us design without constraints while handing you a visual CMS to run the site yourself. It is ideal for marketing sites, agencies and content-driven brands that update regularly and refuse to compromise on design.',
      points: ['Brands that want a truly custom marketing site', 'Teams that publish blogs or case studies regularly', 'Companies that want to edit content without a developer', 'Sites that need premium interactions and motion'] },
    processHeading: 'From design to a site you control',
    faqs: [
      { q: 'How much does a Webflow website cost?', a: 'It depends on page count, CMS complexity and interactions. We scope every project up front and give you a fixed, transparent quote before we start.' },
      { q: 'How long does a Webflow build take?', a: 'A typical custom marketing site takes around 3 to 6 weeks depending on scope and content readiness. We agree the timeline before kickoff.' },
      { q: 'Can I edit the site after launch?', a: 'Yes — that is a big reason we build in Webflow. You get a visual CMS and a handover walkthrough so updating pages and publishing is simple.' },
      { q: 'Can you migrate my existing site to Webflow?', a: 'We can. We rebuild and migrate from WordPress, Wix, Squarespace and others, preserving your content and SEO with proper redirects.' },
    ],
    ctaHeading: 'Ready for a Webflow site that stands out?', ctaBody: 'Tell us about your project. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'framer-website-design', navTitle: 'Framer', serviceType: 'Framer Website Design & Development',
    title: 'Framer Website Design Agency — Framer Developers | TheBrandle',
    metaDescription: 'TheBrandle designs and builds stunning Framer websites — fast to launch, beautifully animated, easy to edit. A Framer design agency for startups. Free consultation.',
    hubTitle: 'Framer Design', hubTagline: 'Beautiful, fast Framer sites — ideal for startups and launches.',
    eyebrow: 'Web · Framer', h1: 'Framer sites, launched fast',
    heroSub: 'We design and build striking Framer websites that go live in weeks, not months — beautifully animated, blazing fast, and simple for you to update. Perfect for startups and product launches.',
    trust: ['Fast to launch', 'Design-native', 'Easy to edit'],
    deliverHeading: 'Design-native sites, ready in weeks',
    deliverSub: 'Framer lets us take a design straight to a live, animated, responsive site — no translation lost, no time wasted.',
    features: [
      { title: 'Design-led build', body: 'We design and build in one place, so what you approve is exactly what ships — pixel for pixel.' },
      { title: 'Rich animation', body: 'Scroll effects, transitions and micro-interactions that feel alive, built natively and running smooth.' },
      { title: 'Fast turnaround', body: 'Framer is our fastest path to launch — ideal for startups that need a polished site on a tight timeline.' },
      { title: 'CMS for content', body: 'Blog, changelog or case studies powered by Framer\'s CMS, easy for your team to keep fresh.' },
      { title: 'Responsive & fast', body: 'Optimised, responsive and quick to load across every device, straight out of the box.' },
      { title: 'Effortless editing', body: 'Update copy and images yourself in Framer\'s editor — we hand over a site you can actually run.' },
    ],
    why: { eyebrow: 'When to choose Framer', heading: 'The fastest route to a beautiful, live website',
      body: 'Framer is built for designers, which makes it the quickest way to get a genuinely beautiful, animated site live. It is our top pick for startups, founders and product launches that need to look world-class without a long, expensive build. If speed and design polish both matter, Framer is hard to beat.',
      points: ['Startups and founders needing a site fast', 'Product and campaign launch pages', 'Brands that want premium animation without heavy code', 'Teams that value a quick, design-led turnaround'] },
    processHeading: 'From idea to a live Framer site',
    faqs: [
      { q: 'How much does a Framer website cost?', a: 'It depends on page count, animation and CMS needs. We scope the project up front and give you a fixed, transparent quote before we begin.' },
      { q: 'How fast can you launch a Framer site?', a: 'Framer is our fastest platform — many sites launch in 2 to 4 weeks depending on scope and content. We confirm the timeline before kickoff.' },
      { q: 'Can I edit my Framer site myself?', a: 'Yes. Framer\'s editor makes updating text, images and CMS content straightforward, and we walk you through it at handover.' },
      { q: 'Is Framer good for SEO?', a: 'It is. Framer sites are fast and we set up metadata, clean structure and best practices so your pages can rank.' },
    ],
    ctaHeading: 'Ready to launch a standout Framer site?', ctaBody: 'Tell us about your project. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'wordpress-website-design', navTitle: 'WordPress', serviceType: 'WordPress Website Design & Development',
    title: 'WordPress Website Design & Development Agency | TheBrandle',
    metaDescription: 'TheBrandle designs and builds custom WordPress websites — flexible, content-rich and fully yours to own and edit. Custom themes and WooCommerce. Free consultation.',
    hubTitle: 'WordPress Design', hubTagline: 'Flexible, content-rich WordPress sites you fully own.',
    eyebrow: 'Web · WordPress', h1: 'WordPress sites built your way',
    heroSub: 'We design and build custom WordPress websites — flexible, content-rich and completely yours to own, edit and extend. From marketing sites to WooCommerce stores.',
    trust: ['Custom themes', 'Fully ownable', 'Content-ready'],
    deliverHeading: 'The flexibility of WordPress, designed properly',
    deliverSub: 'A custom-designed WordPress site with the plugins and structure you need — not a bloated off-the-shelf theme.',
    features: [
      { title: 'Custom theme design', body: 'A bespoke theme built to your brand — clean, fast and free of the bloat that slows generic templates down.' },
      { title: 'Content & blog structure', body: 'Built for publishing — clear post types, categories and templates so your content stays organised as it grows.' },
      { title: 'WooCommerce stores', body: 'Need to sell? We build WooCommerce shops with the same care as our standalone ecommerce projects.' },
      { title: 'Plugins done right', body: 'Only the plugins you actually need, configured properly to stay secure, fast and maintainable.' },
      { title: 'Speed & security', body: 'Performance tuning, caching and sensible hardening so the site stays fast and safe over time.' },
      { title: 'You own everything', body: 'It is your site on your hosting — no lock-in. We hand over full access and a walkthrough.' },
    ],
    why: { eyebrow: 'When to choose WordPress', heading: 'For content-heavy sites that need full control',
      body: 'WordPress still powers a huge share of the web for good reason — it is endlessly flexible, great for content, and fully ownable. We use it for blogs, publishers, membership sites and businesses that need custom functionality or want complete control of their platform without vendor lock-in.',
      points: ['Content-heavy sites and publishers', 'Businesses that want to fully own their platform', 'Sites needing custom functionality or membership', 'WooCommerce stores tied to a content site'] },
    processHeading: 'From design to a site you fully own',
    faqs: [
      { q: 'How much does a WordPress website cost?', a: 'It depends on design scope, custom functionality and whether you need ecommerce. We scope up front and give you a fixed, transparent quote before starting.' },
      { q: 'Do you build custom themes or use a template?', a: 'We build custom, lightweight themes designed to your brand — no bloated multipurpose templates that hurt speed and security.' },
      { q: 'Can you redesign or speed up my existing WordPress site?', a: 'Yes. We redesign, optimise and harden existing WordPress sites, keeping your content and improving performance and security.' },
      { q: 'Will I be able to manage it myself?', a: 'Completely. You get full ownership, a clean editing experience and a handover walkthrough so you can publish confidently.' },
    ],
    ctaHeading: 'Ready for a WordPress site done right?', ctaBody: 'Tell us about your project. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'wix-website-design', navTitle: 'Wix', serviceType: 'Wix Website Design',
    title: 'Wix Website Design Agency — Wix Designers | TheBrandle',
    metaDescription: 'TheBrandle designs professional Wix websites for small businesses — polished, easy to manage and quick to launch. Custom Wix design that stands out. Free consultation.',
    hubTitle: 'Wix Design', hubTagline: 'Polished, easy-to-run Wix sites for small businesses.',
    eyebrow: 'Web · Wix', h1: 'Wix sites that look anything but DIY',
    heroSub: 'We design professional Wix websites for small businesses and founders — polished, on-brand and quick to launch, with an editor simple enough to run yourself.',
    trust: ['Small-business ready', 'Quick to launch', 'Easy to manage'],
    deliverHeading: 'A professional site without the agency price tag',
    deliverSub: 'Wix gets a bad rap because most Wix sites are self-built. Designed properly, it is a fast, affordable route to a polished web presence.',
    features: [
      { title: 'Custom Wix design', body: 'A professionally designed site tailored to your brand — a world away from a stock Wix template.' },
      { title: 'Quick, affordable launch', body: 'A polished web presence on a small-business budget and timeline, without cutting corners on design.' },
      { title: 'Easy self-management', body: 'Wix\'s editor is genuinely simple — update text, images and pages yourself with confidence.' },
      { title: 'Bookings & basics', body: 'Contact forms, bookings, galleries and the everyday features a small business actually needs.' },
      { title: 'Mobile-optimised', body: 'Designed to look sharp on phones, where most of your local customers will find you.' },
      { title: 'SEO essentials', body: 'Proper titles, metadata and structure so your business shows up when people search for it.' },
    ],
    why: { eyebrow: 'When to choose Wix', heading: 'For small businesses that want polish, fast and affordable',
      body: 'Wix is a smart choice when you need a professional site quickly and want to manage it yourself afterwards. It is ideal for local businesses, service providers and founders who need a strong web presence without the cost and complexity of a fully custom build — designed by us so it looks the part.',
      points: ['Local and small businesses', 'Service providers needing bookings or enquiries', 'Founders who want to self-manage after launch', 'Anyone needing a polished site on a tight budget'] },
    processHeading: 'From brief to a live Wix site',
    faqs: [
      { q: 'How much does a Wix website cost?', a: 'Wix projects are among our most affordable. Cost depends on page count and features — we give you a clear, fixed quote up front.' },
      { q: 'Can a Wix site look professional?', a: 'Absolutely. Most Wix sites look DIY because they are self-built. Designed by us to your brand, a Wix site can look every bit as polished as a custom one.' },
      { q: 'Will I be able to update it myself?', a: 'Yes — that is a key benefit of Wix. The editor is simple, and we give you a walkthrough so you can confidently make changes.' },
      { q: 'How quickly can it launch?', a: 'Wix is quick — many sites go live in 1 to 3 weeks depending on scope and content readiness.' },
    ],
    ctaHeading: 'Ready for a Wix site that looks the part?', ctaBody: 'Tell us about your business. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'squarespace-website-design', navTitle: 'Squarespace', serviceType: 'Squarespace Website Design',
    title: 'Squarespace Website Design Agency | TheBrandle',
    metaDescription: 'TheBrandle designs elegant Squarespace websites for creatives, studios and brands — refined, easy to manage and beautifully on-brand. Free consultation.',
    hubTitle: 'Squarespace Design', hubTagline: 'Elegant Squarespace sites for creatives and brands.',
    eyebrow: 'Web · Squarespace', h1: 'Squarespace sites with real polish',
    heroSub: 'We design refined Squarespace websites for creatives, studios and brands — elegant, on-brand and easy to manage, using the platform\'s strengths without settling for a stock template.',
    trust: ['Elegant & refined', 'Creative-friendly', 'Simple to manage'],
    deliverHeading: 'The elegance of Squarespace, tailored to you',
    deliverSub: 'Squarespace is beautiful out of the box — we take it further, shaping it into something unmistakably yours.',
    features: [
      { title: 'Tailored design', body: 'We push Squarespace well beyond its templates with custom styling and layout that reflects your brand.' },
      { title: 'Portfolio & galleries', body: 'Perfect for creatives — considered galleries and portfolio layouts that let your work speak.' },
      { title: 'Built-in commerce', body: 'Sell products, services or bookings with Squarespace\'s clean, reliable commerce tools.' },
      { title: 'Blog & content', body: 'An elegant place to publish, structured so your content stays easy to browse and manage.' },
      { title: 'Responsive polish', body: 'Refined on every screen, with the typographic and spacing care Squarespace is known for.' },
      { title: 'Simple to run', body: 'An intuitive editor plus our handover walkthrough so you can update everything with ease.' },
    ],
    why: { eyebrow: 'When to choose Squarespace', heading: 'For creatives and brands who value elegance and ease',
      body: 'Squarespace is the natural home for portfolios, studios, restaurants and lifestyle brands — anywhere design elegance and simple management matter more than deep custom functionality. We tailor it to your brand so it feels bespoke, while keeping the effortless editing Squarespace is loved for.',
      points: ['Creatives, photographers and studios', 'Restaurants, hospitality and lifestyle brands', 'Portfolios and personal brands', 'Anyone wanting elegance with easy self-management'] },
    processHeading: 'From brief to an elegant live site',
    faqs: [
      { q: 'How much does a Squarespace website cost?', a: 'It depends on page count, commerce and how much custom styling you want. We provide a clear, fixed quote up front before any work begins.' },
      { q: 'Can you make Squarespace look custom?', a: 'Yes. We go well beyond stock templates with custom styling and layout so your site feels tailored, not off-the-shelf.' },
      { q: 'Can I manage the site after launch?', a: 'Definitely. Squarespace is one of the easiest platforms to run, and we hand over a walkthrough so updates feel simple.' },
      { q: 'Can you migrate my site to Squarespace?', a: 'We can migrate from other platforms, moving your content across and preserving SEO with proper redirects.' },
    ],
    ctaHeading: 'Ready for an elegant Squarespace site?', ctaBody: 'Tell us about your project. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
  {
    slug: 'ui-ux-design', navTitle: 'UI/UX', serviceType: 'UI/UX Design',
    title: 'UI/UX Design Studio — Product & App Design | TheBrandle',
    metaDescription: 'TheBrandle is a UI/UX design studio crafting intuitive, beautiful product and app interfaces — research, wireframes, UI design and design systems. Free consultation.',
    hubTitle: 'UI/UX Design', hubTagline: 'Intuitive, beautiful interfaces for products and apps.',
    eyebrow: 'Product · UI/UX', h1: 'Interfaces people love to use',
    heroSub: 'We craft intuitive, beautiful UI/UX for web and mobile products — grounded in research, refined through testing, and delivered as a design system your team can build on.',
    trust: ['Research-led', 'Web & mobile', 'Design systems'],
    deliverHeading: 'From user insight to interface',
    deliverSub: 'A complete product design process — understanding your users, shaping the flow, and designing every screen and state.',
    features: [
      { title: 'UX research & flows', body: 'We map user journeys, information architecture and key flows so the product makes sense before it looks good.' },
      { title: 'Wireframes & prototypes', body: 'Low- to high-fidelity prototypes you can click through and test — validating ideas before a line of code.' },
      { title: 'UI design', body: 'Beautiful, consistent interfaces designed to your brand, balancing aesthetics with clarity and usability.' },
      { title: 'Design systems', body: 'Reusable components, tokens and guidelines so your product stays consistent and scales cleanly.' },
      { title: 'Mobile & web apps', body: 'Native-feeling mobile design and responsive web app interfaces, designed for real devices and contexts.' },
      { title: 'Developer-ready handoff', body: 'Organised Figma files, specs and assets so your engineers can build exactly what we designed.' },
    ],
    why: { eyebrow: 'When to work with us', heading: 'For products that need to be usable and beautiful',
      body: 'Great products are not just attractive — they are effortless to use. We combine UX rigour with strong visual design to create interfaces that feel obvious to users and on-brand to you. Whether you are shaping a new product or improving an existing one, we design experiences that convert and retain.',
      points: ['Startups designing a new product or MVP', 'Teams improving an existing app\'s usability', 'Founders who need research-backed UX, not guesswork', 'Products that need a scalable design system'] },
    processHeading: 'From research to a build-ready design',
    faqs: [
      { q: 'How much does UI/UX design cost?', a: 'It depends on the number of screens, research depth and whether you need a design system. We scope the work up front and give you a clear, fixed quote.' },
      { q: 'Do you do research or just visuals?', a: 'Both. We start with UX — flows, structure and, where useful, user testing — then design the UI on top of that foundation.' },
      { q: 'Do you deliver a design system?', a: 'When it fits the project, yes. We build reusable components and guidelines so your product stays consistent and scales without redesigning from scratch.' },
      { q: 'Can you work with our developers?', a: 'Absolutely. We deliver organised Figma files, specs and assets, and collaborate with your engineers for a clean, accurate handoff.' },
    ],
    ctaHeading: 'Ready to design a product people love?', ctaBody: 'Tell us about your product. We will come back with a clear plan, timeline and quote — and a free consultation to talk it through.',
  },
];

/* --------------------------------------------------------------------- write */
let count = 0;
for (const d of pages) {
  const dir = path.join(OUT, d.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(d));
  console.log('wrote services/' + d.slug + '/index.html');
  count++;
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), renderHub(pages));
console.log('wrote services/index.html (hub)');
console.log(`\nGenerated ${count} service pages + hub.`);
