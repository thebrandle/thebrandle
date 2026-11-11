// Draws every blog post's art from src/og/blog-card.html + src/data/blog/cards.json into assets/blog/.
// usage: node src/og/blog-card.mjs [slug ...]      (no slug = all posts)
// Needs Playwright: on the studio Mac it uses the copy in ~/sameticket and Google Chrome; anywhere else
// `npm i --no-save playwright && npx playwright install chromium` first.
// Per post:  <slug>.jpg 1600x900 (card, og fallback, the address the old site used)   <slug>-og.jpg 1200x630 (share image)
//            <slug>-list.jpg and <slug>-hover.jpg 960x540 (listing card and its hover colourway)
//            covers/<slug>.jpg 2400x1000 and covers/<slug>-1200.jpg (post hero; the first is the old cover address)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const MAC = '/Users/muteebmehraj/sameticket/node_modules/playwright-core/index.mjs', CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { chromium } = await import(existsSync(MAC) ? MAC : 'playwright');

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const cards = JSON.parse(readFileSync(join(root, 'src/data/blog/cards.json'), 'utf8'));
const index = JSON.parse(readFileSync(join(root, 'src/data/blog/index.json'), 'utf8')).posts;
const only = process.argv.slice(2);
const NEXT = { cream: 'orange', orange: 'black', black: 'cream' };
const SHOTS = [['', 1600, 900, 0], ['-og', 1200, 630, 0], ['-list', 960, 540, 0], ['-hover', 960, 540, 1], ['covers/', 2400, 1000, 0], ['covers/-1200', 1200, 500, 0]];
const logo = (name) => { try { return readFileSync(join(root, `assets/blog/logos/${name}.svg`), 'utf8'); } catch (e) { return null; } };

mkdirSync(join(root, 'assets/blog/covers'), { recursive: true });
const browser = await chromium.launch({ ...(existsSync(CHROME) ? { executablePath: CHROME } : {}), headless: true });
// one window per size, never resized: a screenshot taken right after a resize can come out torn
const pages = [];
for (const [, width, height] of SHOTS) {
  const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })).newPage();
  await page.goto('file://' + join(here, 'blog-card.html'));
  pages.push(page);
}
for (const p of index) {
  if (only.length && !only.includes(p.slug)) continue;
  const c = cards[p.slug];
  if (!c) throw new Error('no card spec for ' + p.slug);
  const stickers = c.stickers.map((s) => (logo(s) ? { svg: logo(s) } : { icon: s }));
  for (const [k, [name, , , alt]] of SHOTS.entries()) {
    const page = pages[k];
    await page.evaluate((spec) => window.draw(spec), { lines: c.lines, quip: c.quip, group: p.suggestedGroup, stickers, ground: alt ? NEXT[c.ground] : c.ground });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = name.startsWith('covers/') ? `covers/${p.slug}${name.slice(7)}.jpg` : `${p.slug}${name}.jpg`;
    writeFileSync(join(root, 'assets/blog', file), await page.screenshot({ type: 'jpeg', quality: 84 }));
  }
  console.log('drew', p.slug);
}
await browser.close();
