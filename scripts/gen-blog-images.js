#!/usr/bin/env node
/**
 * Blog header images -> assets/blog/<slug>.jpg (1600x900) + .svg source.
 *
 * Built as vectors, not AI-generated: AI reliably mangles brand logos, and
 * these marks are simple geometry. Rendered through headless Chrome so Inter
 * and the paths come out clean - ImageMagick's SVG renderer drops both.
 *
 * Logo accuracy was verified by rendering each mark and checking it by eye.
 * Framer, Webflow, Shopify and WordPress are correct. Wix and WooCommerce
 * could not be reproduced accurately, so posts needing those use a
 * typographic treatment instead of a wrong mark. Drop official SVGs into
 * LOGOS to upgrade them.
 *
 * Run: node scripts/gen-blog-images.js
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'blog');
const TMP = fs.mkdtempSync('/tmp/blogimg-');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const IM = '/opt/ImageMagick/bin/convert';
const DARK = '#0C0C0C', ACCENT = '#F9452D';
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

/* verified-accurate marks only */
const LOGOS = {
  framer:    { d: 'M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z', w: 16, h: 24, x: 4, y: 0 },
  webflow:   { d: 'M24 4.515l-7.658 14.97H9.149l3.205-6.204h-.144C9.566 16.9 5.621 19.183 0 19.485V13.36s3.596-.213 5.71-2.435H0V4.517h6.417v5.278l.144-.001 2.622-5.277h4.854v5.244h.144l2.72-5.244H24z', w: 24, h: 15, x: 0, y: 4.5 },
  shopify:   { d: 'M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023zM11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.658-1.694-2.658-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.362 1.875.362l-.961 2.704v.02zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 4.02-.656.203-1.293.405-1.889.588C7.71 3.9 8.85.84 11.17.84V.83zm1.235 2.913v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.386.116-.812.252-1.294.405v-.28c0-.828-.116-1.501-.309-2.036l.174.156zm2.462 1.5c-.02 0-.06.02-.078.02s-.29.077-.755.232c-.464-1.336-1.274-2.559-2.712-2.559h-.135C11.32.221 10.845 0 10.44 0 7.301 0 5.796 3.918 5.328 5.907c-1.22.377-2.093.649-2.194.682-.685.213-.706.235-.79.877-.68.489-1.869 14.36-1.869 14.36L14.36 24l.045-21.05v.06z', w: 22, h: 24, x: 1, y: 0 },
  wordpress: { d: 'M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.075.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C4.911 3.15 8.235 1.215 12 1.215c2.809 0 5.365 1.072 7.286 2.833-.046-.003-.091-.009-.141-.009-1.06 0-1.812.923-1.812 1.914 0 .89.513 1.643 1.06 2.531.411.72.89 1.643.89 2.977 0 .915-.354 1.994-.821 3.479l-1.075 3.585-3.9-11.61.001.014zM12 22.784c-1.059 0-2.081-.153-3.048-.437l3.237-9.406 3.315 9.087c.024.053.05.101.078.149-1.12.393-2.325.609-3.582.609M1.211 12c0-1.564.336-3.05.935-4.39L7.29 21.709C3.694 19.96 1.211 16.271 1.211 12M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0', w: 24, h: 24, x: 0, y: 0 },
};

const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function mark(key, cx, cy, targetH) {
  const L = LOGOS[key];
  const s = targetH / L.h;
  const tx = cx - (L.x + L.w / 2) * s;
  const ty = cy - (L.y + L.h / 2) * s;
  return `<g transform="translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${s.toFixed(3)})" fill="#FFFFFF"><path d="${L.d}"/></g>`;
}
const wordmark = (txt, cx, cy) =>
  `<text x="${cx}" y="${cy + 22}" text-anchor="middle" font-family="${FONT}" font-size="64" font-weight="700" letter-spacing="-2.5" fill="#FFFFFF">${esc(txt)}</text>`;

/* topic motifs - stroke geometry, deliberately abstract and consistent */
/* Motifs are drawn on a ~200px grid around (800,410) then scaled about that
   point. At 1:1 they read as small icons lost in a 1600x900 canvas; the
   comparison layouts carry far more visual weight, so these need to match. */
const M = (inner) => `<g transform="translate(800,410) scale(1.95) translate(-800,-410)" stroke="#FFFFFF" stroke-opacity="0.34" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
const MOTIF = {
  split:   M('<rect x="612" y="352" width="150" height="112" rx="10"/><rect x="838" y="352" width="150" height="112" rx="10"/><path d="M770 408h60"/><path d="M818 396l14 12-14 12"/>'),
  nodes:   M('<circle cx="800" cy="360" r="20"/><circle cx="700" cy="452" r="20"/><circle cx="900" cy="452" r="20"/><circle cx="800" cy="470" r="14"/><path d="M786 376l-72 62M814 376l72 62M800 380v76"/>'),
  mirror:  M('<path d="M742 352l-58 56 58 56"/><path d="M858 352l58 56-58 56"/><path d="M778 408h44"/>'),
  cycle:   M('<path d="M888 408a88 88 0 1 1-26-62"/><path d="M866 300v52h-52"/>'),
  bars:    M('<path d="M690 470V420"/><path d="M745 470V386"/><path d="M800 470V352"/><path d="M855 470V400"/><path d="M910 470V432"/><path d="M666 470h268"/>'),
  gauge:   M('<path d="M700 462a100 100 0 0 1 200 0"/><path d="M800 462l58-58"/><circle cx="800" cy="462" r="7"/>'),
  phone:   M('<rect x="748" y="336" width="104" height="156" rx="14"/><path d="M784 360h32"/><path d="M790 468h20"/>'),
  shield:  M('<path d="M800 336l72 28v56c0 44-30 76-72 92-42-16-72-48-72-92v-56z"/><path d="M770 414l22 22 40-42"/>'),
  building:M('<rect x="702" y="366" width="88" height="126" rx="6"/><rect x="810" y="330" width="88" height="162" rx="6"/><path d="M724 392h16M752 392h16M724 424h16M752 424h16M832 356h16M860 356h16M832 388h16M860 388h16M832 420h16M860 420h16"/>'),
  layers:  M('<path d="M800 340l96 46-96 46-96-46z"/><path d="M704 428l96 46 96-46"/>'),
};

const POSTS = [
  { slug:'framer-vs-webflow', kind:'logos', eyebrow:'COMPARISON', a:{logo:'framer',name:'Framer'}, b:{logo:'webflow',name:'Webflow'},
    h1:'Which builder fits your website?', sub:'An honest comparison, from a studio that builds on both' },
  { slug:'wordpress-vs-webflow', kind:'logos', eyebrow:'COMPARISON', a:{logo:'wordpress',name:'WordPress'}, b:{logo:'webflow',name:'Webflow'},
    h1:'Ownership or a polished product?', sub:'Cost, editing, SEO and maintenance compared honestly' },
  { slug:'shopify-vs-woocommerce', kind:'logos', eyebrow:'COMPARISON', a:{logo:'shopify',name:'Shopify'}, b:{name:'WooCommerce'},
    h1:'Which should your store run on?', sub:'Hosted convenience against ownership and no platform fees' },
  { slug:'wix-to-shopify-migration', kind:'logos', eyebrow:'MIGRATION', joiner:'→', a:{name:'Wix'}, b:{logo:'shopify',name:'Shopify'},
    h1:'Moving without losing your rankings', sub:'Products, customers and URLs carried across properly' },

  { slug:'headless-cms-guide', kind:'editorial', eyebrow:'ARCHITECTURE', motif:'split',
    h1:'Headless CMS, explained plainly', sub:'What you gain, what it costs, and when a traditional CMS still wins' },
  { slug:'ai-in-web-design', kind:'editorial', eyebrow:'INDUSTRY', motif:'nodes',
    h1:'AI in web design', sub:'What it does well, where it fails, and what Google actually penalises' },
  { slug:'arabic-rtl-website-design', kind:'editorial', eyebrow:'LOCALISATION', motif:'mirror',
    h1:'Arabic and RTL, done properly', sub:'Typography, mirroring and bilingual structure that reads native' },
  { slug:'website-redesign-without-losing-seo', kind:'editorial', eyebrow:'SEO', motif:'cycle',
    h1:'Redesign without losing your rankings', sub:'URL mapping, redirects and content parity - the checklist' },
  { slug:'website-maintenance-cost', kind:'editorial', eyebrow:'PRICING', motif:'gauge',
    h1:'What maintenance should actually cost', sub:'The work that matters, and the line items that are padding' },
  { slug:'website-total-cost-of-ownership', kind:'editorial', eyebrow:'PRICING', motif:'bars',
    h1:'The real cost over three years', sub:'Build, hosting, maintenance and the costs quotes leave out' },
  { slug:'website-cost-dubai', kind:'editorial', eyebrow:'PRICING', motif:'bars',
    h1:'What a website costs in Dubai', sub:'Three price bands, and what actually moves the number' },
  { slug:'real-estate-website-design', kind:'editorial', eyebrow:'INDUSTRY', motif:'building',
    h1:'Property websites that convert', sub:'Search, listings and the details that decide the enquiry' },
  { slug:'core-web-vitals-guide', kind:'editorial', eyebrow:'PERFORMANCE', motif:'gauge',
    h1:'Core Web Vitals, without the jargon', sub:'LCP, INP and CLS - what breaks them and how to fix it' },
  { slug:'progressive-web-apps', kind:'editorial', eyebrow:'ARCHITECTURE', motif:'phone',
    h1:'Do you actually need a PWA?', sub:'Where it beats a native app, and where you need neither' },
  { slug:'website-security-checklist', kind:'editorial', eyebrow:'SECURITY', motif:'shield',
    h1:'A security checklist that fits a small business', sub:'The realistic threats, and the fixes that stop most of them' },
];

function svgFor(p) {
  const base = `<rect width="1600" height="900" fill="url(#vig)"/>
  <text x="800" y="128" text-anchor="middle" font-family="${FONT}" font-size="19" letter-spacing="6" font-weight="500" fill="${ACCENT}">${esc(p.eyebrow)}</text>`;
  const foot = `<text x="800" y="700" text-anchor="middle" font-family="${FONT}" font-size="${p.h1.length > 34 ? 54 : 62}" font-weight="700" letter-spacing="-2.2" fill="#FFFFFF">${esc(p.h1)}</text>
  <text x="800" y="754" text-anchor="middle" font-family="${FONT}" font-size="25" fill="#FFFFFF" fill-opacity="0.55">${esc(p.sub)}</text>
  <line x1="700" y1="806" x2="900" y2="806" stroke="#FFFFFF" stroke-opacity="0.13"/>
  <text x="800" y="850" text-anchor="middle" font-family="${FONT}" font-size="20" letter-spacing="3.5" font-weight="500" fill="#FFFFFF" fill-opacity="0.45">THEBRANDLE.COM</text>`;

  let mid;
  if (p.kind === 'logos') {
    const j = p.joiner || 'VS';
    const A = p.a.logo ? mark(p.a.logo, 450, 410, 150) : wordmark(p.a.name, 450, 410);
    const B = p.b.logo ? mark(p.b.logo, 1150, 410, 150) : wordmark(p.b.name, 1150, 410);
    // only label a mark - a wordmark already says the name, and printing it
    // twice reads as a bug
    const lbl = (side, cx) => side.logo
      ? `<text x="${cx}" y="560" text-anchor="middle" font-family="${FONT}" font-size="38" font-weight="600" letter-spacing="-0.5" fill="#FFFFFF">${esc(side.name)}</text>`
      : '';
    mid = `${A}${B}${lbl(p.a, 450)}${lbl(p.b, 1150)}`;
    mid += `
  <line x1="800" y1="292" x2="800" y2="368" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>
  <text x="800" y="428" text-anchor="middle" font-family="${FONT}" font-size="54" font-weight="700" fill="${ACCENT}">${j}</text>
  <line x1="800" y1="462" x2="800" y2="538" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="1.5"/>`;
  } else {
    mid = MOTIF[p.motif];
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs><radialGradient id="vig" cx="50%" cy="42%" r="72%"><stop offset="0%" stop-color="#171717"/><stop offset="100%" stop-color="${DARK}"/></radialGradient></defs>
  ${base}${mid}${foot}</svg>`;
}

fs.mkdirSync(OUT, { recursive: true });
let ok = 0;
for (const p of POSTS) {
  const svg = svgFor(p);
  fs.writeFileSync(path.join(OUT, p.slug + '.svg'), svg);
  const html = path.join(TMP, p.slug + '.html');
  fs.writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:${DARK}}svg{display:block}</style></head><body>${svg}</body></html>`);
  const png = path.join(TMP, p.slug + '.png');
  execFileSync(CHROME, ['--headless','--disable-gpu','--hide-scrollbars','--force-device-scale-factor=2',
    '--screenshot=' + png, '--window-size=1600,900', 'file://' + html], { stdio: 'ignore' });
  execFileSync(IM, [png, '-resize', '1600x900', '-quality', '92', path.join(OUT, p.slug + '.jpg')]);
  ok++;
  console.log('  ' + p.slug + '.jpg');
}
console.log('generated ' + ok + ' blog header images -> assets/blog/');
