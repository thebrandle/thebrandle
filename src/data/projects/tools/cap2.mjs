// Phone-shaped captures (390x844 at 2x) of every project for the two-up rows, and tablet captures for the two client cards.
// usage: node cap2.mjs <outdir> [name ...]
import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs';
const [outdir, ...only] = process.argv.slice(2);
const BLOCK = /cloudflareinsights|emrldco|tp\.media|google-analytics|googletagmanager|doubleclick|facebook\.net|connect\.facebook|analytics\.tiktok|tiktok\.com\/i18n\/pixel|snap\.licdn|clarity\.ms|hotjar|monorail|\/api\/collect|trekkie|shopifycloud\/web-pixels|web-pixels|events\.framer\.com|plausible|umami|vercel-insights|vercel-scripts|workers\.dev|frog\.wix|panorama\.wixapps/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const JOBS = {
  sameticket: ['https://sameticket.com', [['/', 9, 0], ['/dubai/burj-khalifa/', 4, 0], ['/dubai/', 4, 0], ['/dubai/go-city-pass-calculator/', 4, 0]]],
  soznikar: ['https://soznikar.com', [['/', 8, 0], ['/pages/the-ghutra', 5, 0], ['/collections/all', 5, 0], ['/products/kashmiri-semi-pashmina-shawl-firdaus', 5, 0]]],
  pawsword: ['https://pawsword.app', [['/', 6, 0], ['/', 3, 2.5], ['/', 3, 5], ['/support.html', 4, 0]]],
  bellow: ['https://bellow.dev', [['/', 6, 0], ['/', 3, 1.3], ['/', 3, 3], ['/compare/', 4, 0]]],
  limonaia: ['https://limonaia.framer.website', [['/', 16, 0], ['/residences', 6, 0], ['/residences/residence-01', 6, 0], ['/contact', 6, 0]]],
  bezier: ['https://bezier-studio.framer.website', [['/', 7, 0], ['/work', 5, 0], ['/work/tidal', 5, 0], ['/journal', 5, 0]]],
  rotonda: ['https://rotonda.framer.website', [['/', 9, 0], ['/', 4, 3], ['/work/fernwell', 6, 0], ['/work/kilnhouse', 6, 0]]],
  sunwise: ['https://sunwise.framer.website', [['/', 7, 0], ['/services', 5, 0], ['/work/oakmere', 5, 0], ['/studio', 5, 0]]],
  tideline: ['https://tideline-template.webflow.io', [['/', 7, 0], ['/residences', 5, 0], ['/tower', 5, 0], ['/location', 5, 0]]],
  'voice-and-data-resale': ['https://voiceanddataresale.com', [['/', 7, 0], ['/collections/all', 5, 0], ['/pages/it-asset-disposal', 5, 0], ['/pages/data-destruction', 5, 0]]],
  'storage-hire': ['https://www.storagehireltd.com', [['/', 8, 0], ['/storage-services-harlow', 6, 0], ['/storage-quote-harlow', 6, 0], ['/about', 6, 0]]],
};
const TABLET = ['voice-and-data-resale', 'storage-hire'];
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
const tidy = (page) => page.evaluate(() => document.querySelectorAll('#__framer-badge-container, .w-webflow-badge, #WIX_ADS, #shopify-pc__banner').forEach((e) => e.remove()));
const decline = async (page) => { const b = page.getByRole('button', { name: /^(decline|reject|reject all|decline all)$/i }).first(); if (await b.count()) { await b.click({ timeout: 2000 }).catch(() => {}); await sleep(700); } };
for (const [name, [base, pages]] of Object.entries(JOBS)) {
  if (only.length && !only.includes(name)) continue;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'light', isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  await ctx.route('**/*', (r) => (BLOCK.test(r.request().url()) ? r.abort() : r.continue()));
  await ctx.addInitScript(() => { try { localStorage.setItem('limonaia-cookies', 'decline'); } catch (e) {} });
  const page = await ctx.newPage();
  let k = 1, last = '';
  for (const [path, settle, depth] of pages) {
    if (path !== last) await page.goto(base + path, { waitUntil: 'load', timeout: 45000 }).catch(() => {});
    last = path;
    await sleep(settle * 1000);
    await decline(page);
    if (depth) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(depth * 844)); await sleep(1800); }
    await tidy(page);
    writeFileSync(`${outdir}/${name}-p${k++}.jpg`, await page.screenshot({ type: 'jpeg', quality: 90 }));
  }
  await ctx.close();
  if (TABLET.includes(name)) {
    const t = await browser.newContext({ viewport: { width: 834, height: 1290 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
    await t.route('**/*', (r) => (BLOCK.test(r.request().url()) ? r.abort() : r.continue()));
    const tp = await t.newPage();
    await tp.goto(base + '/', { waitUntil: 'load', timeout: 45000 }).catch(() => {});
    await sleep(8000); await decline(tp); await tidy(tp);
    writeFileSync(`${outdir}/${name}-tablet.jpg`, await tp.screenshot({ type: 'jpeg', quality: 90 }));
    await t.close();
  }
  console.log(name, 'done');
}
await browser.close();
