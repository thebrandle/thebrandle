#!/usr/bin/env node
/**
 * Carve REAL components out of the Framer snapshot (_snapshot/index.html):
 *   - the full <style> set (530KB — tokens, presets, fonts, breakpoints)
 *   - the nav/header component (all responsive variants)
 *   - the footer component (all responsive variants)
 *   - one CTA pill button ("Let's talk") as reusable markup
 * Writes them to _snapshot/components/ and assembles a proof page at
 * _snapshot/test-service/index.html composed ONLY of carved markup + preset
 * classes. Nothing redrawn — every byte of styling comes from the site's own
 * stylesheet, so typography/colors/components are identical by construction.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SNAP = path.join(ROOT, '_snapshot', 'index.html');
const OUT = path.join(ROOT, '_snapshot', 'components');
const html = fs.readFileSync(SNAP, 'utf8');

/* -- helpers ---------------------------------------------------------- */
const tagPat = /<div\b|<\/div>/g;
function balancedEnd(start) {
  tagPat.lastIndex = start; let depth = 0, m;
  while ((m = tagPat.exec(html))) {
    depth += m[0] === '<div' ? 1 : -1;
    if (depth === 0) return tagPat.lastIndex;
  }
  return -1;
}
function containerAround(idx, matcher) {
  // walk up: nearest <div before idx whose balanced block covers idx and matches
  let pos = idx;
  for (let i = 0; i < 30; i++) {
    const s = html.lastIndexOf('<div', pos);
    if (s < 0) return null;
    const e = balancedEnd(s);
    if (e > idx) {
      const open = html.slice(s, Math.min(s + 300, e));
      if (matcher(open)) return { s, e, open };
    }
    pos = s - 1;
  }
  return null;
}

/* -- 1. styles -------------------------------------------------------- */
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map(m => m[0]);
const styleBundle = styles.join('\n');

/* -- 2. footer (all variants) ----------------------------------------- */
const BODY_AT = html.indexOf('</head>');
const fs_ = html.indexOf('framer-1a4qqw4-container', BODY_AT);
const fBlock = containerAround(fs_, () => true);
const footerHtml = html.slice(fBlock.s, fBlock.e);
if (!footerHtml.includes('Stay connected')) throw new Error('footer carve failed');

/* -- 3. nav (walk up from data-framer-name="Nav" to component container) */
const navIdx = html.indexOf('data-framer-name="Nav"', BODY_AT);
const navBlock = containerAround(navIdx, (open) => /-container/.test(open));
const navHtml = navBlock ? html.slice(navBlock.s, navBlock.e) : null;

/* -- 4. CTA button ("Let's talk", curly apostrophe) ------------------- */
const ctaText = html.indexOf('Let’s talk', BODY_AT);
const ctaBlock = containerAround(ctaText, (open) => open.includes('framer-LqZE5'));
const ctaHtml = ctaBlock ? html.slice(ctaBlock.s, ctaBlock.e) : null;

/* -- write artifacts --------------------------------------------------- */
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'styles.html'), styleBundle);
fs.writeFileSync(path.join(OUT, 'footer.html'), footerHtml);
if (navHtml) fs.writeFileSync(path.join(OUT, 'nav.html'), navHtml);
if (ctaHtml) fs.writeFileSync(path.join(OUT, 'button.html'), ctaHtml);
console.log('carved:',
  `styles=${(styleBundle.length/1024).toFixed(0)}KB`,
  `footer=${(footerHtml.length/1024).toFixed(0)}KB`,
  `nav=${navHtml ? (navHtml.length/1024).toFixed(1)+'KB' : 'FAILED'}`,
  `button=${ctaHtml ? (ctaHtml.length/1024).toFixed(1)+'KB' : 'FAILED'}`);

/* -- 5. assemble proof page ------------------------------------------- */
/* preset CSS is scoped under the root wrapper's classes (.framer-fzGCR etc.)
   — content must live inside the site's own data-framer-root element */
const rootM = html.slice(BODY_AT).match(/<div[^>]*data-framer-root[^>]*>/);
const ROOT_OPEN = rootM ? rootM[0] : '<div data-framer-root>';

/* prefer hydrated (runtime-corrected) components captured from the running
   site via /__save — they carry the final computed inline styles */
const liveFooterPath = path.join(OUT, 'footer-live.html');
const liveNavPath = path.join(OUT, 'nav-live.html');
let footerFinal = footerHtml;
if (fs.existsSync(liveFooterPath)) {
  footerFinal = fs.readFileSync(liveFooterPath, 'utf8')
    // the hydrated container carries a scroll-linked offset — neutralize it
    .replace(/style="will-change: transform; opacity: 1; transform: translateY\([^)]+\);"/, 'style="opacity: 1;"');
}
const navFinal = fs.existsSync(liveNavPath) ? fs.readFileSync(liveNavPath, 'utf8') : (navHtml || '');
const page = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Shopify Website Design — component-carve proof | TheBrandle</title>
<meta name="robots" content="noindex">
${styleBundle}
<style>
/* glue only: flowing page frame; all visual styling comes from carved presets */
html,body{background:#0C0C0C;margin:0}
.svc-page{display:flex;flex-direction:column;align-items:stretch}
.svc-section{width:100%;max-width:1200px;margin:0 auto;padding:96px 30px 0;box-sizing:border-box}
.svc-hero h1{margin:24px 0 28px}
.svc-hero .lead{max-width:58ch}
.svc-cta{margin-top:40px;display:inline-block}
.svc-footer{width:100%}
</style>
</head>
<body>
${ROOT_OPEN}
<div class="svc-page">
  <section class="svc-section svc-hero">
    <h1 class="framer-text framer-styles-preset-1usw2w6" style="color:#fff;text-align:left">Shopify stores designed to sell</h1>
    <p class="framer-text framer-styles-preset-1dmjd5e lead" style="color:rgb(154,154,158);text-align:left">We design and build custom Shopify websites that turn browsers into buyers — brand-first storefronts, frictionless checkout, and the performance to scale as you grow.</p>
    <div class="svc-cta">
${ctaHtml || '<!-- cta carve failed -->'}
    </div>
  </section>
  <section class="svc-section" style="padding-bottom:120px">
    <h2 class="framer-text framer-styles-preset-1t5qoig" style="color:#fff;text-align:left">Everything your store needs</h2>
  </section>
  <div class="svc-footer">
${footerFinal}
  </div>
</div>
</div>
</body>
</html>`;
const dir = path.join(ROOT, '_snapshot', 'test-service');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'index.html'), page);
console.log('proof page: _snapshot/test-service/index.html', `(${(page.length/1024).toFixed(0)}KB)`);
