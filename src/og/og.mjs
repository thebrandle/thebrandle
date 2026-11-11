// Renders og.html to a 1200x630 share image (drawn at 2x, saved at 1x by the caller).
// usage: node og.mjs <og.html> <out.png>
import { writeFileSync } from 'node:fs';
import { chromium } from '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs';
const [html, out] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })).newPage();
await page.goto('file://' + html);
await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 20000 });
await new Promise((r) => setTimeout(r, 600));
writeFileSync(out, await page.screenshot({ type: 'png' }));
await browser.close();
