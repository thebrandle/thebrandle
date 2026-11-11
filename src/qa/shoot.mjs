// Screenshots of chosen parts of a page of the Brandle site at rest, in headless Chrome.
// usage: node shoot.mjs <url> <out-prefix> <width> <height> <selector[+offsetPx][@waitMs]> ...
// Each selector is scrolled to (its top lands offsetPx below the top of the window, default 20), then shot after waitMs (default 2500).
import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs';
const [url, out, w, h, ...targets] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1, isMobile: Number(w) < 600, hasTouch: Number(w) < 600 });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.addInitScript(() => { try { sessionStorage.setItem('tb-seen', '1'); } catch (e) {} });
await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => !document.querySelector('.loader'), null, { timeout: 20000 });
await sleep(1200);
let n = 0;
for (const t of targets) {
  const m = t.match(/^(.*?)(?:\+(-?\d+))?(?:@(\d+))?$/);
  const [sel, off = '20', wait = '2500'] = [m[1], m[2], m[3]];
  const ok = await page.evaluate(([sel, off]) => {
    const el = sel.includes('>>') ? document.querySelectorAll(sel.split('>>')[0].trim())[Number(sel.split('>>')[1])] : document.querySelector(sel);
    if (!el) return false;
    const y = el.getBoundingClientRect().top + scrollY - Number(off);
    (window.TB && TB.lenis) ? TB.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y);
    return true;
  }, [sel, off]);
  if (!ok) { console.log('not found:', sel); continue; }
  await sleep(Number(wait));
  writeFileSync(`${out}-${String(n++).padStart(2, '0')}.jpg`, await page.screenshot({ type: 'jpeg', quality: 78 }));
}
await browser.close();
