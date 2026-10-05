#!/usr/bin/env node
/**
 * Trims the carved Framer stylesheet down to the rules the homepage uses.
 *
 * gen-homepage.js already drops rules whose classes never appear in the page,
 * but that keeps anything built from classes the page does carry - every preset
 * variant, every component state - which left ~270KB. This loads the generated
 * page in headless Chrome and keeps a rule only if its selector (pseudo-classes
 * stripped) matches an element, checked with the menu closed and open so the
 * menu's open variant survives. Fonts are kept for the families that remain.
 *
 * Output: _snapshot/components/home-framer.css (committed, like the other carved
 * parts). gen-homepage.js inlines it when present. Re-run after changing the
 * nav, footer, presets or section markup classes, then regenerate:
 *
 *   node scripts/trim-home-css.mjs && node scripts/gen-homepage.js
 *
 * It renders its own untrimmed copy first (NO_TRIM, into _snapshot/trim/), so
 * it always starts from the full carved sheet and never from its own output.
 *
 * Needs the local server (node server.js) and the Playwright install the
 * measurement tooling uses.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { chromium } from '/Users/muteebmehraj/.dev-browser/node_modules/playwright/index.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_snapshot', 'components', 'home-framer.css');
const URL = process.env.HOME_URL || 'http://localhost:8080/_snapshot/trim/';
execFileSync('node', [path.join(ROOT, 'scripts', 'gen-homepage.js')], { env: { ...process.env, NO_TRIM: '1', HOME_OUT: '_snapshot/trim/index.html' }, stdio: 'inherit' });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const keep = new Set();
let source = '';
for (const width of [1440, 1024, 390]) {
  const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // the first <style> is the Framer sheet; the second is the homepage's own
  const res = await page.evaluate(async () => {
    const sheet = document.styleSheets[0];
    const test = () => {
      const hits = [];
      const walk = (rules, prefix) => {
        for (let i = 0; i < rules.length; i++) {
          const r = rules[i];
          const id = prefix + i;
          if (r.cssRules && !(r instanceof CSSStyleRule)) { walk(r.cssRules, id + '.'); continue; }
          if (!(r instanceof CSSStyleRule)) continue;
          const sel = r.selectorText.replace(/::?(before|after|placeholder|selection|marker|-webkit-[a-z-]+|-moz-[a-z-]+)/g, '')
            .replace(/:(hover|focus|focus-visible|focus-within|active|visited|link|checked|disabled|first-child|last-child|nth-child\([^)]*\)|not\([^()]*\))/g, '');
          let ok = false;
          try { ok = !!document.querySelector(sel || '*'); } catch (e) { ok = true; }
          if (ok) hits.push(id);
        }
      };
      walk(sheet.cssRules, '');
      return hits;
    };
    const a = test();
    // open the menu: Framer swaps the header's closed variant class for the open one
    const swaps = [['framer-v-m5ha19', 'framer-v-185cz0f'], ['framer-v-19vil5u', 'framer-v-7tbwy4']];
    document.querySelectorAll('header').forEach((h) => { swaps.forEach(([c, o]) => { if (h.classList.contains(c)) { h.classList.remove(c); h.classList.add(o); } }); h.classList.add('bm-closing'); });
    // the menu script also marks the link list open (see REVEAL_JS in site-shell.js)
    document.querySelectorAll('.framer-1w3jqcb').forEach((e) => e.classList.add('bm-open'));
    const b = test();
    return { hits: [...new Set([...a, ...b])], css: [...sheet.cssRules].map((r) => r.cssText) };
  });
  res.hits.forEach((h) => keep.add(h));
  source = res.css;
  await page.close();
}
await browser.close();

// Rebuild the sheet from the kept rule ids, preserving @media nesting.
const families = new Set(['Inter', 'Bebas Neue']);
const parts = [];
const ruleText = (txt) => txt;
// Parse each top-level rule text again in Node: the browser serialises them
// as complete CSS, so nested @media blocks can be filtered by index.
for (let i = 0; i < source.length; i++) {
  const txt = source[i];
  if (txt.startsWith('@font-face')) { parts.push({ font: txt }); continue; }
  if (txt.startsWith('@media') || txt.startsWith('@supports')) {
    const head = txt.slice(0, txt.indexOf('{'));
    const inner = txt.slice(txt.indexOf('{') + 1, txt.lastIndexOf('}'));
    // split inner top-level rules
    const rules = [];
    let depth = 0, cur = '';
    for (const ch of inner) { cur += ch; if (ch === '{') depth++; if (ch === '}') { depth--; if (!depth) { rules.push(cur.trim()); cur = ''; } } }
    const kept = rules.filter((r, j) => keep.has(i + '.' + j));
    if (kept.length) parts.push({ css: head + '{' + kept.join('') + '}' });
    continue;
  }
  if (txt.startsWith('@')) { parts.push({ css: txt }); continue; }
  if (keep.has(String(i))) {
    parts.push({ css: ruleText(txt) });
    for (const m of txt.matchAll(/font-family:\s*([^;]+)/g)) families.add(m[1].split(',')[0].replace(/["']/g, '').trim());
  }
}
/* Fonts: only the faces the page sets (Inter 400-700 upright, Bebas Neue) and
   only the Latin subsets - the copy is English. Framer ships Cyrillic, Greek and
   Vietnamese subsets, italics and 900 for every weight; none are used here. */
const WEIGHTS = new Set(['400', '500', '600', '700']);
const keepFont = (ff) => {
  const fam = ((ff.match(/font-family:\s*"?([^";]+)"?/) || [])[1] || '').trim();
  if (fam === 'Bebas Neue') return true;
  if (fam !== 'Inter') return false;
  const w = ((ff.match(/font-weight:\s*([^;]+)/) || [])[1] || '').trim();
  const st = ((ff.match(/font-style:\s*([^;]+)/) || [])[1] || 'normal').trim();
  const ur = ((ff.match(/unicode-range:\s*([^;]+)/) || [])[1] || '').trim();
  const latin = /^U\+0-FF/.test(ur) || /^U\+100-24F/.test(ur);
  return WEIGHTS.has(w) && st === 'normal' && latin;
};
const minify = (css) => css.replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/:\s+/g, ':').replace(/;}/g, '}');
const out = minify(parts.map((p) => (p.font ? (keepFont(p.font) ? p.font : '') : p.css)).join('\n'));
fs.writeFileSync(OUT, out);
console.log(`trim: kept ${keep.size} rules -> ${(out.length / 1024).toFixed(0)}KB written to ${path.relative(ROOT, OUT)}`);
