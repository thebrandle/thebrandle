// Page captures for the project pages (same method as the vault's page-shots.mjs, more sites).
// usage: node cap.mjs <outdir> [--wide] [name ...]
import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs';
const argv = process.argv.slice(2);
const wide = argv.includes('--wide');
const [outdir, ...only] = argv.filter((a) => a !== '--wide');
const BLOCK = /cloudflareinsights|emrldco|tp\.media|google-analytics|googletagmanager|doubleclick|facebook\.net|connect\.facebook|analytics\.tiktok|tiktok\.com\/i18n\/pixel|snap\.licdn|clarity\.ms|hotjar|monorail|\/api\/collect|trekkie|shopifycloud\/web-pixels|web-pixels|events\.framer\.com|plausible|umami|vercel-insights|vercel-scripts|workers\.dev|frog\.wix|panorama\.wixapps/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const JOBS = {
  soznikar: ['https://soznikar.com', [['/', 8, [0, 1.2, 2.6, 4.2]], ['/pages/the-ghutra', 5, [0, 1.3]], ['/collections/all', 5, [0]], ['/products/kashmiri-semi-pashmina-shawl-firdaus', 5, [0]], ['/pages/heritage', 5, [0]]]],
  pawsword: ['https://pawsword.app', [['/', 6, [0, 1.2, 2.5, 3.9, 5.4, 7, 8.6]], ['/support.html', 4, [0]]]],
  bellow: ['https://bellow.dev', [['/', 6, [0, 1.2, 2.5, 3.9, 5.4, 7]], ['/compare/', 4, [0]], ['/guides/offline-dictation-mac', 4, [0]]]],
  'voice-and-data-resale': ['https://voiceanddataresale.com', [['/', 7, [0, 1.2, 2.6, 4.2]], ['/collections/all', 5, [0]], ['/pages/it-asset-disposal', 5, [0, 1.3]], ['/pages/data-destruction', 5, [0]], ['/pages/about-us', 5, [0]]]],
  'storage-hire': ['https://www.storagehireltd.com', [['/', 8, [0, 1.2, 2.6, 4.2]], ['/storage-services-harlow', 6, [0, 1.3]], ['/storage-quote-harlow', 6, [0]], ['/about', 6, [0]], ['/storage-faqs-harlow', 6, [0]]]],
};
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars'] });
for (const [name, [base, pages]] of Object.entries(JOBS)) {
  if (only.length && !only.includes(name)) continue;
  const VH = wide ? 810 : 800;
  const ctx = await browser.newContext({ viewport: wide ? { width: 1440, height: 810 } : { width: 520, height: 800 }, deviceScaleFactor: wide ? 1 : 2, colorScheme: 'light', isMobile: !wide, hasTouch: !wide,
    ...(wide ? {} : { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }) });
  await ctx.route('**/*', (r) => (BLOCK.test(r.request().url()) ? r.abort() : r.continue()));
  const page = await ctx.newPage();
  let k = 0;
  for (const [path, settle, depths] of pages) {
    await page.goto(base + path, { waitUntil: 'load', timeout: 45000 }).catch(() => {});
    await sleep(settle * 1000);
    const b = page.getByRole('button', { name: /^(decline|reject|reject all|decline all)$/i }).first();
    if (await b.count()) { await b.click({ timeout: 2000 }).catch(() => {}); await sleep(700); }
    for (const d of depths) {
      if (d) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(d * VH)); await sleep(1700); }
      await page.evaluate(() => document.querySelectorAll('#WIX_ADS, #shopify-pc__banner, .shopify-pc__banner__dialog').forEach((e) => e.remove()));
      writeFileSync(`${outdir}/${name}-${wide ? 'w' : ''}${String(k++).padStart(2, '0')}.jpg`, await page.screenshot({ type: 'jpeg', quality: 90 }));
    }
  }
  await ctx.close();
  console.log(name, k, wide ? 'wide' : 'phone');
}
await browser.close();
