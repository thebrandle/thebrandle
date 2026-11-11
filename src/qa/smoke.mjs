// Smoke test for one page of the Brandle site, in headless Chrome.
// Loads it as a first visit (full logo loader) and again as a later page of the same visit (quick sweep),
// scrolls to the bottom, and reports: script errors, console errors, failed requests, how long the loader took,
// horizontal overflow, broken images, and ScrollTrigger count. Exit code 1 when something is wrong.
// usage: node smoke.mjs <url> [width height] [--shots <prefix>]
import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs';

const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const shots = si > -1 ? args.splice(si, 2)[1] : null;
const [url, w = '1440', h = '900'] = args;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1, isMobile: Number(w) < 600, hasTouch: Number(w) < 600 });
const report = { url, viewport: `${w}x${h}`, visits: [] };
let bad = false;

for (const visit of ['first', 'later']) {
  const page = await ctx.newPage();     // same context, so sessionStorage from the first visit is NOT shared between tabs: set it by hand
  const errors = [], failed = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 140)}`); });
  page.on('requestfailed', (r) => { const f = r.failure(); if (f && !/ERR_ABORTED/.test(f.errorText)) failed.push(`${f.errorText} ${r.url().slice(0, 140)}`); });
  if (visit === 'later') await page.addInitScript(() => { try { sessionStorage.setItem('tb-seen', '1'); } catch (e) {} });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  const lifted = await page.waitForFunction(() => !document.querySelector('.loader') && !document.body.classList.contains('is-loading'), null, { timeout: 15000 }).then(() => Date.now() - t0).catch(() => null);
  await sleep(1500);
  if (shots) writeFileSync(`${shots}-${visit}-top.jpg`, await page.screenshot({ type: 'jpeg', quality: 70 }));
  // wheel to the bottom the way a person would (Lenis smooths it), then look at what broke
  let last = -1;
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, Number(h) * 0.8); await sleep(350);
    const y = await page.evaluate(() => Math.round(scrollY));
    if (y === last) break; last = y;
    if (shots && visit === 'first' && i % 3 === 2) writeFileSync(`${shots}-scroll-${String(i).padStart(2, '0')}.jpg`, await page.screenshot({ type: 'jpeg', quality: 60 }));
  }
  await sleep(800);
  const facts = await page.evaluate(() => ({
    title: document.title,
    h1: [...document.querySelectorAll('h1')].map((e) => e.textContent.trim().replace(/\s+/g, ' ')).slice(0, 3),
    canonical: document.querySelector('link[rel=canonical]')?.href,
    pageHeight: document.documentElement.scrollHeight,
    scrolledTo: Math.round(scrollY),
    overflowX: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter((i) => i.complete && !i.naturalWidth && i.getAttribute('src')).map((i) => i.getAttribute('src')),
    scrollTriggers: typeof ScrollTrigger !== 'undefined' ? ScrollTrigger.getAll().length : null,
    tb: typeof TB !== 'undefined',
  }));
  const v = { visit, loaderLiftedMs: lifted, errors, failed, ...facts };
  if (lifted === null || errors.length || failed.length || facts.overflowX > 1 || facts.brokenImages.length || !facts.tb) bad = true;
  report.visits.push(v);
  await page.close();
}
await browser.close();
report.ok = !bad;
console.log(JSON.stringify(report, null, 1));
process.exit(bad ? 1 : 0);
