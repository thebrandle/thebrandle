#!/usr/bin/env node
/**
 * Build a script-free static snapshot of the real Framer homepage.
 *
 * The Framer export (thebrandle.framer.website/index.html) contains the full
 * SSR DOM + all CSS, but sections carry inline `opacity: 0` / transforms that
 * the Framer runtime animates away on scroll. This script:
 *   1. strips ALL <script> blocks (runtime, our overrides) except JSON-LD
 *   2. neutralizes inline hidden states (opacity/visibility/translate) so
 *      every section renders in its final, revealed state
 * Output: _snapshot/index.html — served at /_snapshot/ for A/B against live.
 * The snapshot uses root-relative asset paths, so all local framerusercontent
 * assets resolve unchanged. This is the base for carving service pages from
 * the site's OWN markup/CSS (truly identical, not a lookalike).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'thebrandle.framer.website', 'index.html');
const OUT_DIR = path.join(ROOT, '_snapshot');

let html = fs.readFileSync(SRC, 'utf8');
const before = html.length;

/* 1 ── strip scripts, keep JSON-LD */
const kept = [];
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => {
  if (/application\/ld\+json/i.test(m)) { kept.push('ld+json'); return m; }
  return '';
});

/* 2 ── neutralize inline hidden/pre-animation states inside style="…" attrs.
   Surgical: opacity 0→1 and SMALL px translate offsets only. Percent-based
   translates stay untouched — Framer parks off-screen panels (menu overlay,
   intro-loader curtains) at translate(±100%) and clearing those drags them
   into view. */
let opacityFixes = 0, visFixes = 0, transformFixes = 0;
html = html.replace(/style="([^"]*)"/g, (m, css) => {
  let out = css;
  const wasHidden = /opacity:\s*0(?![.\d])/.test(out);
  if (wasHidden) { out = out.replace(/opacity:\s*0(?![.\d])/g, 'opacity: 1'); opacityFixes++; }
  if (/visibility:\s*hidden/.test(out)) { out = out.replace(/visibility:\s*hidden/g, 'visibility: visible'); visFixes++; }
  // Clear entry-animation offsets ONLY on elements that were hidden (opacity:0
  // in the same attr). Elements without it use translate for POSITIONING
  // (e.g. translateX(-50%) centering) and must keep their transforms.
  if (wasHidden) {
    out = out.replace(/transform:\s*(translate[XY]?\((-?\d{1,3}(?:\.\d+)?)px(?:\s*,\s*-?\d{1,3}(?:\.\d+)?px)?\)(?:\s*scale\([\d.]+\))?)/g, (mm, full, px) => {
      if (Math.abs(parseFloat(px)) <= 300) { transformFixes++; return 'transform: none'; }
      return mm;
    });
  }
  return `style="${out}"`;
});

/* 3 ── remove the intro-loader (curtain splash) — runtime-only theatre.
   It lives in a fixed z-9999 container component; without JS it can never
   dismiss itself, so it must not ship in the static snapshot. */
const LOADER_CLASS = 'framer-143iyx0-container';
let loaderRemovals = 0;
html = html.replace(new RegExp(`<div class="${LOADER_CLASS}"`, 'g'), () => { loaderRemovals++; return `<div style="display:none!important" class="${LOADER_CLASS}"`; });

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), html);
console.log(`snapshot written: _snapshot/index.html`);
console.log(`  size: ${before} -> ${html.length} bytes`);
console.log(`  scripts kept (ld+json): ${kept.length}`);
console.log(`  inline fixes: opacity=${opacityFixes} visibility=${visFixes} transform=${transformFixes}`);
console.log(`  loader containers hidden: ${loaderRemovals}`);
