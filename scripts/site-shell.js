'use strict';
/**
 * Shared shell for every generated page: the carved Framer stylesheet, the
 * hydrated nav, phone nav and footer, the menu script, text presets and the
 * glue CSS that makes those carved parts work outside Framer.
 *
 * Lifted out of gen-service-pages-v2.js unchanged so the homepage generator
 * (gen-homepage.js) builds from the same parts and cannot drift from the
 * service, team and FAQ pages. The service generator output is byte-identical
 * before and after the move.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMP = path.join(ROOT, '_snapshot', 'components');
const SITE = 'https://www.thebrandle.com';
const OG_IMAGE = SITE + '/framerusercontent.com/images/YNmypiM868x4WUMKO25HF3tDPN4.jpg';
const EMAIL = 'hello@thebrandle.com';

const read = (f) => fs.readFileSync(path.join(COMP, f), 'utf8');
const styles = read('styles.html');
// carved components carry Framer's relative hrefs (./, ./about). Those
// resolve against the CURRENT path, so on /services/<slug>/ the logo links
// to itself and nav links 404 into the SPA. Absolutize them.
const absolutize = (h) => h.replace(/href="\.\//g, 'href="/').replace(/tel:555-666-7777/g, 'tel:+971561429789');
/* bake a Services link into carved nav/footer markup: clone the About
   anchor (native styling + hover-dup labels), relabel, insert before
   Contact when present, else right after About */
const NAV_LINKS = [
  { href: '/services/', upper: 'SERVICES', lower: 'Services' },
  { href: '/team/', upper: 'TEAM', lower: 'Team' },
];
/* The repeatable unit is a different element in each layout, and cloning the
   wrong one nests the new link INSIDE Contact's container instead of beside it:

     footer   <div RichTextContainer><p><a>About</a></p></div>
     top nav  <a href="/about"><div><p>About</p></div></a>

   Matching the <p> put Services, Team and Contact inside one footer div, where
   Framer's paragraph spacing adds 20px between siblings - so the footer list
   showed two gaps the Framer-rendered one does not have. Try the widest
   wrapper first, and match Contact at whatever level About was found. */
const UNIT_RES = (href) => [
  new RegExp('<div\\b[^>]*>\\s*<p\\b[^>]*>\\s*<a\\b[^>]*href="' + href + '"[\\s\\S]*?<\\/a>\\s*<\\/p>\\s*<\\/div>'),
  new RegExp('<p\\b[^>]*>\\s*<a\\b[^>]*href="' + href + '"[\\s\\S]*?<\\/a>\\s*<\\/p>'),
  new RegExp('<a\\b[^>]*href="' + href + '"[\\s\\S]*?<\\/a>'),
];
const addNavLink = (html, spec) => {
  const about = UNIT_RES('/about');
  let unit = null, level = -1;
  for (let i = 0; i < about.length; i++) {
    const m = html.match(about[i]);
    if (m) { unit = m; level = i; break; }
  }
  if (!unit) return html;
  const clone = unit[0]
    .replace(/>(\s*)ABOUT(\s*)</g, '>$1' + spec.upper + '$2<')
    .replace(/>(\s*)About(\s*)</g, '>$1' + spec.lower + '$2<')
    .replace(/href="\/about"/, 'href="' + spec.href + '"')
    /* Drop the Framer editor label rather than renaming it to the link.
       Framer's stylesheet hides [data-framer-name="Team"] - a draft footer
       item that was never shipped - so a clone relabelled "Team" rendered
       display:none. The label has no function in a static export, and a
       nameless container inherits its styling from the class. */
    .replace(/\s*data-framer-name="[^"]*"/, '')
    .replace(/ data-framer-page-link-current(="[^"]*")?/, '');
  if (clone === unit[0]) return html;
  const target = html.match(UNIT_RES('/contact')[level]);
  if (target) return html.replace(target[0], clone + target[0]);
  return html.replace(unit[0], unit[0] + clone);
};
/* Each link is inserted before Contact in turn, so a nav that starts as
   About, Contact ends up About, Services, Team, Contact. */
const addNav = (html) => NAV_LINKS.reduce((h, spec) => addNavLink(h, spec), html);
const navHtml = absolutize(read('nav-live.html')
  // the container is captured in its pre-appear animation state — normalize
  .replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"'));
const navHtmlFinal = addNav(navHtml);
const navPhoneHtml = fs.existsSync(path.join(COMP, 'nav-phone.html'))
  ? addNav(absolutize(read('nav-phone.html').replace(/style="opacity: 0\.001;[^"]*"/, 'style="opacity: 1;"')))
  : '';
const footerHtml = addNav(absolutize(read('footer-live.html')
  .replace(/style="will-change: transform; opacity: 1; transform: translateY\([^)]+\);"/, 'style="opacity: 1;"')));
const ctaHtml = fs.existsSync(path.join(COMP, 'button-live.html'))
  ? read('button-live.html')            // hydrated red pill w/ real arrow icon
  : read('button.html');
const noiseHtml = fs.existsSync(path.join(COMP, 'noise-live.html'))
  ? read('noise-live.html')             // the site's tiled grain overlay
  : '';

const snapshot = fs.readFileSync(path.join(ROOT, '_snapshot', 'index.html'), 'utf8');
const rootM = snapshot.slice(snapshot.indexOf('</head>')).match(/<div[^>]*data-framer-root[^>]*>/);
const ROOT_OPEN = rootM ? rootM[0] : '<div data-framer-root>';

// note: also normalizes em dashes to plain hyphens (site copy convention)
const esc = (s) => String(s).replace(/\s*—\s*/g, ' - ').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad2 = (n) => (n < 10 ? '0' + n : '' + n);

/* real text presets, measured on-site:
   1usw2w6 112px/600 display · 1t5qoig 46px/600 H2 · ddjjzx 26px/600 H3
   1dmjd5e 22px/500 lead · 1raml1m 18px/500 body-lg · bq16ho 16px/400 body
   1hahlh8 14px/500 small */
const P = {
  display: 'framer-text framer-styles-preset-1usw2w6',
  h2: 'framer-text framer-styles-preset-1t5qoig',
  h3: 'framer-text framer-styles-preset-ddjjzx',
  lead: 'framer-text framer-styles-preset-1dmjd5e',
  body: 'framer-text framer-styles-preset-bq16ho',
  small: 'framer-text framer-styles-preset-1hahlh8',
};
const ACCENT = 'var(--token-1662617d-fd18-4319-b3da-aa36e5415705, rgb(249, 69, 45))';
const MUTED = 'rgba(255, 255, 255, 0.62)';
const MUTED2 = 'rgba(255, 255, 255, 0.4)';

const cta = (text, href) => ctaHtml
  .replace(/Let’s talk/g, esc(text))
  .replace(/href="[^"]*"/, `href="${href}"`);

/* glue CSS: layout frame only — all type/color/component styling is Framer's */
const GLUE = `<style>
html,body{background:#0C0C0C;margin:0}
/* Any anchor without an explicit colour falls back to the browser default -
   blue, and purple once visited. That hit the logo, the overlay menu links and
   the CTA button. Neutralise the default here; every rule below is at least as
   specific and still wins, so intended colours are unaffected. */
.svc-page a,.svc-page a:link,.svc-page a:visited{color:inherit;text-decoration:none}
.svc-page{display:flex;flex-direction:column;align-items:stretch;overflow-x:hidden}
.svc-nav-wrap{position:sticky;top:0;z-index:40;background:rgba(12,12,12,.78);backdrop-filter:saturate(160%) blur(14px);-webkit-backdrop-filter:saturate(160%) blur(14px)}
@media(max-width:760px){.svc-nav-desktop{display:none}}
@media(min-width:761px){.svc-nav-phone{display:none}}
/* All navigation lives in the MENU overlay. Target links by href rather than
   hiding the container - the logo is a sibling in the same container. */
.svc-nav-wrap a[href="/about"],
.svc-nav-wrap a[href="/projects"],
.svc-nav-wrap a[href="/services/"],
.svc-nav-wrap a[href="/team/"],
.svc-nav-wrap a[href="/contact"]{display:none!important}
.svc-nav-wrap .bm-open a[href="/about"],
.svc-nav-wrap .bm-open a[href="/projects"],
.svc-nav-wrap .bm-open a[href="/services/"],
.svc-nav-wrap .bm-open a[href="/team/"],
.svc-nav-wrap .bm-open a[href="/contact"]{display:revert!important}
/* No opacity here: the handler sets it inline on open and animates it back
   down on close, and an !important rule would win over that and freeze the
   list visible for the whole close. Pointer events still need forcing. */
.bm-open{pointer-events:auto!important}
/* Closing fade, driven by a class so nothing inline or !important can win. */
.svc-nav-wrap .framer-1w3jqcb,.svc-nav-wrap .framer-1oywgs7{transition:opacity .28s cubic-bezier(0.23,1,0.32,1)}
.svc-nav-wrap header.bm-closing .framer-1w3jqcb,
.svc-nav-wrap header.bm-closing .framer-1oywgs7{opacity:0!important}
/* Contact's container is wider than its word (it shares the container the
   Services clone came from), so the box was right-aligned but the text inside
   was not. Align the content, not just the box. */
/* Contact's box is wider than its word - it shares a container with the
   Services clone - so aligning the box was not enough: the glyphs still sat
   left inside it, ending ~10px short of the others. Align the text too. */
.svc-nav-wrap .bm-open a{justify-content:flex-end}
.svc-nav-wrap .bm-open a,.svc-nav-wrap .bm-open a *{text-align:right!important}
/* The burger animates on the homepage: the two bars converge onto one line
   and rotate to +/-12deg, making a shallow cross. Captured from the live
   header - closed they sit 10px apart with no transform; open they share a
   centre with matrix(0.978,+/-0.208,...), which is 12 degrees.
   Framer sets transform inline, so these have to outrank it. */
.svc-nav-wrap header .framer-1v2q1i2,
.svc-nav-wrap header .framer-6vcmxr{transition:transform .42s cubic-bezier(0.23,1,0.32,1)}
.svc-nav-wrap header.framer-v-185cz0f .framer-1v2q1i2,
.svc-nav-wrap header.framer-v-7tbwy4 .framer-1v2q1i2{transform:translateY(5px) rotate(12deg)!important}
.svc-nav-wrap header.framer-v-185cz0f .framer-6vcmxr,
.svc-nav-wrap header.framer-v-7tbwy4 .framer-6vcmxr{transform:translateY(-5px) rotate(-12deg)!important}
/* the link list's parent is faded too, so it needs the same transition */
.svc-nav-wrap .framer-1oywgs7{transition:opacity .3s cubic-bezier(0.23,1,0.32,1)}
/* Timed off the homepage: clicking MENU takes the header from 50px to 414px,
   settling around 480ms, with the link list fading in over the first ~130ms.
   Framer drives that with Motion; these two transitions reproduce it. */
.svc-nav-wrap header{transition:height .48s cubic-bezier(0.23,1,0.32,1)}
.svc-nav-wrap .framer-1w3jqcb{transition:opacity .22s cubic-bezier(0.23,1,0.32,1)}
/* The link label roll, cloned from the homepage.
   Each link carries the label twice: one in flow, a spare pinned 38px above.
   On hover Framer swaps which copy is in flow, so the word rolls downward and
   the spare arrives from above, the link's 36px box clipping both.
   That clip does not hold on these pages - the spare bleeds through, which is
   what produced the doubled labels - so the spare is carried at opacity 0 and
   the same 38px move is done with transforms. Identical motion, no reliance
   on clipping. */
/* Framer bakes "transform: none; opacity: 1" inline onto both labels, so
   every declaration here has to outrank the style attribute. */
.svc-nav-wrap .bm-open a>.framer-7xhv9u{opacity:0!important}
.svc-nav-wrap .bm-open a>.framer-1vowgdm,
.svc-nav-wrap .bm-open a>.framer-7xhv9u{transition:transform .42s cubic-bezier(0.23,1,0.32,1),opacity .26s linear!important}
@media(hover:hover) and (pointer:fine){
  .svc-nav-wrap .bm-open a:hover>.framer-1vowgdm{transform:translateY(38px)!important;opacity:0!important}
  .svc-nav-wrap .bm-open a:hover>.framer-7xhv9u{transform:translateY(38px)!important;opacity:1!important}
}
/* The open menu is Framer's own component state, not something we style.
   Its closed variant pins the header to height:50px; the open variant simply
   does not, so the header falls back to height:min-content and grows around
   the link list. Cloning it is therefore just the class swap Framer does,
   plus the inline opacity it sets on the list. See the JS below. */


/* Framer exported the footer desktop-only. Its outer container carries 90px
   side padding and a 75px gap, so at 386px the content box is only 206px and
   the inner row (children on flex-basis:0) crushes to ~21px columns - text
   then wraps one character per line. Scale the padding and stack the rows. */
@media(max-width:760px){
  /* Spacing below matches the phone variant of the Framer footer: a panel
     inset 24px, content 26px inside it, 20/40px between the blocks. */
  .svc-footer .framer-Q4FQe{padding:24px 50px!important}
  .svc-footer .framer-fmxr1t{inset:24px!important}
  .svc-footer .framer-92x2s6{width:100%!important;max-width:100%!important;min-width:0!important;gap:40px!important;padding:30px 0!important}
  .svc-footer .framer-11zhs3t{flex-direction:column!important;align-items:flex-start!important;gap:20px!important;width:100%!important}
  .svc-footer .framer-11zhs3t>*{flex:0 0 auto!important;width:100%!important;min-width:0!important;flex-basis:auto!important}
  .svc-footer .framer-e5ap8y,.svc-footer .framer-1bscsag,.svc-footer .framer-aj2el6{width:100%!important;min-width:0!important;flex-basis:auto!important;flex-grow:0!important}
  .svc-footer .framer-aj2el6{flex-direction:column!important;gap:0!important}
  .svc-footer .framer-aj2el6>*{width:100%!important;min-width:0!important;flex:0 0 auto!important}
  /* newsletter row: first child claimed the full width, pushing the submit
     arrow outside the viewport - let both shrink instead */
  .svc-footer .framer-e5ap8y{flex-wrap:wrap!important}
  .svc-footer .framer-e5ap8y>*{min-width:0!important;max-width:100%!important}
  /* The newsletter column is flex-basis 0 in the desktop variant, so once the
     row wraps it collapsed to 0px wide and "Stay connected" vanished on every
     phone. Give it the full row and drop the desktop spacer columns. */
  .svc-footer .framer-e5ap8y{flex-direction:column!important;gap:40px!important}
  .svc-footer .framer-1bnz1ae{flex:1 0 100%!important;width:100%!important;gap:34px!important}
  .svc-footer .framer-lq2n4p{gap:26px!important}
  .svc-footer .framer-14dqdyj{gap:8px!important}
  .svc-footer .framer-1jcs32i{min-height:34px}
  .svc-footer .framer-r4hit5,.svc-footer .framer-15isc0s,.svc-footer .framer-klkq66{display:none!important}
  /* The logo is fit-text, so it grew to the full column width; the phone
     variant of the Framer footer draws it 180px wide. */
  .svc-footer .framer-1bscsag{width:180px!important;flex:none!important}
}
.svc-section{width:100%;max-width:1200px;margin:0 auto;padding:100px 30px 0;box-sizing:border-box}
.svc-label{display:block;color:${ACCENT};letter-spacing:.14em;text-transform:uppercase;font-family:Inter,sans-serif;font-size:12.5px;font-weight:500;margin-bottom:18px}
.svc-num{color:${ACCENT}!important;font-variant-numeric:tabular-nums}
.svc-hero-actions .framer-text{color:#fff!important}
.svc-hero-actions .framer-LqZE5{background:${ACCENT};border-radius:60px}
.svc-hero-actions .framer-LqZE5 .framer-13x93le{width:auto;min-width:200px;padding:20px 36px!important}
.svc-hero-actions .framer-LqZE5{transition:transform .18s ease,filter .2s ease}
.svc-hero-actions .framer-LqZE5:hover{filter:brightness(1.08)}
.svc-hero-actions .framer-LqZE5:active{transform:scale(.97)}
.svc-hero-actions .framer-1m71lft-container{display:none}
.svc-hero-actions .framer-13x93le{justify-content:center!important;gap:0!important}
.svc-rows a,.svc-rows a *{text-decoration:none!important}
.svc-num::before{content:"{ "}.svc-num::after{content:" }"}
.svc-rows{margin-top:54px;border-top:1px solid rgba(255,255,255,.12)}
.svc-row{position:relative;padding:40px 0;border-bottom:1px solid rgba(255,255,255,.12)}
.svc-row .svc-num{position:absolute;top:44px;right:2px}
.svc-row-title{color:rgba(255,255,255,.45)!important;transition:color .28s ease;padding-right:80px}
.svc-row:hover .svc-row-title{color:#fff!important}
.svc-row-body{max-width:60ch;margin-top:14px}
.svc-cols{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;margin-top:8px}
@media(max-width:840px){.svc-cols{grid-template-columns:1fr;gap:34px}}
.svc-check{display:flex;gap:14px;align-items:flex-start;margin-top:16px}
.svc-check svg{width:11px;height:11px;flex-shrink:0;margin-top:7px;color:${ACCENT}}
.svc-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:54px;border-top:1px solid rgba(255,255,255,.12)}
@media(max-width:840px){.svc-steps{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.svc-steps{grid-template-columns:1fr}}
.svc-step{padding:32px 26px 36px 0;border-right:1px solid rgba(255,255,255,.12)}
.svc-step:last-child{border-right:none}
@media(max-width:840px){.svc-step{border-right:none;border-bottom:1px solid rgba(255,255,255,.12)}}
/* Three areas rather than two columns, so the phone layout can pair the
   portrait with the name and drop the bio to full width underneath. */
.tm-member{display:grid;grid-template-columns:200px 1fr;column-gap:48px;row-gap:0;align-items:start;padding:44px 0;border-top:1px solid rgba(255,255,255,.12);grid-template-areas:"portrait id" "portrait meta" "portrait body"}
.tm-portrait{grid-area:portrait}
.tm-id{grid-area:id}
.tm-body{grid-area:body}
.tm-photo{width:200px;height:200px;border-radius:50%;object-fit:cover;display:block}
/* Monogram stands in for a headshot we do not have. Deliberate, not a
   broken image - see the note in team-data.js. */
.tm-mono{width:200px;height:200px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.03)}
.tm-mono span{font-family:inherit;font-size:44px;font-weight:500;letter-spacing:.04em;color:${ACCENT}!important}
.tm-meta{grid-area:meta;display:flex;flex-wrap:wrap;gap:10px 18px;align-items:baseline;margin:0 0 18px}
.tm-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}
.tm-links a{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.18);color:${ACCENT}!important;text-decoration:none;transition:background .2s ease,border-color .2s ease,color .2s ease}
.tm-links a svg{width:18px;height:18px;fill:currentColor;display:block}
@media(hover:hover) and (pointer:fine){.tm-links a:hover{background:${ACCENT};border-color:${ACCENT};color:#fff!important}}
/* Phone. Every base rule above this point, none below: equal specificity means
   source order decides, and a media query placed earlier loses to a later base
   declaration - which is how the monogram stayed 200px on phones once already.
   A 128px portrait alone on its own row left ~190px of dead space beside it and
   pushed the name most of a screen down, so pair them. The name needs
   !important twice over: its size comes from a Framer preset class and its
   margin from an inline style. */
@media(max-width:760px){
  .tm-member{grid-template-columns:auto 1fr;grid-template-areas:"portrait id" "meta meta" "body body";column-gap:16px;row-gap:0;align-items:center;padding:34px 0}
  .tm-photo,.tm-mono{width:76px;height:76px}
  .tm-mono span{font-size:24px}
  .tm-member h2{font-size:24px!important;line-height:1.15!important;margin:0!important}
  /* Full width of its own row, so "Co-Founder / Chief of Media" stops
     breaking across two lines beside a 76px portrait. */
  .tm-meta{margin:14px 0 16px;gap:4px 14px}
}
.svc-faq{max-width:880px;margin:54px auto 0}
/* Films. Wide films get a grid, vertical cuts get their own row: putting 16:9
   and 9:16 in one grid leaves either ragged row heights or letterboxing. */
.flm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:44px}
.flm-sub{display:block;margin:46px 0 0}
.flm-row{display:grid;grid-template-columns:repeat(5,1fr);gap:22px;margin-top:18px}
.flm{appearance:none;-webkit-appearance:none;background:none;border:0;padding:0;margin:0;color:inherit;font:inherit;text-align:left;cursor:pointer;display:block;width:100%}
.flm-media{position:relative;display:block;overflow:hidden;background:#111;border-radius:10px}
.flm-wide .flm-media{aspect-ratio:16/9}
.flm-tall .flm-media{aspect-ratio:9/16}
.flm-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.23,1,.32,1)}
.flm-play{position:absolute;left:50%;top:50%;width:58px;height:58px;margin:-29px 0 0 -29px;border-radius:50%;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .2s ease,border-color .2s ease,transform .16s ease-out}
.flm-play svg{width:22px;height:22px;fill:#fff;margin-left:3px;display:block}
.flm-meta{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-top:12px}
.flm-title{color:#fff!important;text-align:left}
.flm-info{color:${MUTED2}!important;white-space:nowrap}
.flm-tall .flm-meta{flex-direction:column;gap:2px}
.flm:focus-visible{outline:2px solid ${ACCENT};outline-offset:4px;border-radius:10px}
.flm:active .flm-play{transform:scale(.94)}
.flm-box{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(5,5,5,.94);padding:64px 16px 24px}
.flm-box.is-open{display:flex;animation:flm-in .22s cubic-bezier(.23,1,.32,1)}
@keyframes flm-in{from{opacity:0}to{opacity:1}}
.flm-stage{position:relative;background:#000;border-radius:10px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.flm-stage-wide{width:min(1200px,100%,calc((100vh - 110px) * 16 / 9));aspect-ratio:16/9}
.flm-stage-tall{width:min(100%,calc((100vh - 110px) * 9 / 16),480px);aspect-ratio:9/16}
.flm-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.flm-close{position:absolute;top:12px;right:16px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.06);color:#fff;font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s ease,border-color .2s ease}
/* Every .flm base rule sits above this line and every media query below it:
   equal specificity, so a query placed earlier loses to a later base rule. */
@media(hover:hover) and (pointer:fine){
  .flm:hover .flm-media img{transform:scale(1.035)}
  .flm:hover .flm-play{background:${ACCENT};border-color:${ACCENT}}
  .flm-close:hover{background:${ACCENT};border-color:${ACCENT}}
}
@media(max-width:900px){.flm-grid{grid-template-columns:repeat(2,1fr)}.flm-row{grid-template-columns:repeat(3,1fr)}}
@media(max-width:600px){.flm-grid{grid-template-columns:1fr;gap:28px}.flm-row{grid-template-columns:repeat(2,1fr);gap:14px}.flm-play{width:50px;height:50px;margin:-25px 0 0 -25px}}
@media(prefers-reduced-motion:reduce){.flm-box.is-open{animation:none}.flm-media img,.flm-play{transition:none}}
.svc-faq details{border-bottom:1px solid rgba(255,255,255,.12)}
.svc-faq summary{list-style:none;cursor:pointer;padding:28px 0;display:flex;justify-content:space-between;align-items:center;gap:22px;color:#fff}
.svc-faq summary::-webkit-details-marker{display:none}
.svc-faq .pm{width:22px;height:22px;flex-shrink:0;position:relative}
.svc-faq .pm::before,.svc-faq .pm::after{content:"";position:absolute;background:${ACCENT};border-radius:2px}
.svc-faq .pm::before{top:10px;left:3px;right:3px;height:2px}
.svc-faq .pm::after{left:10px;top:3px;bottom:3px;width:2px;transition:opacity .2s}
.svc-faq details[open] .pm::after{opacity:0}
.svc-faq .ans{padding:0 0 30px}
.svc-hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:44px}
.svc-band{max-width:1200px;margin:100px auto 120px;padding:0 30px;text-align:center}
.svc-band .svc-hero-actions{justify-content:center}
/* The band centres its children, but text-align does not survive into the
   paragraph: a Framer preset on .framer-text sets it back to start, from a
   cross-origin stylesheet whose specificity we cannot read. Hence !important,
   the same reason .svc-num carries one. Without it the heading and button
   centre while the sentence between them sits left. */
.svc-band p{text-align:center!important}
.svc-footer{width:100%;margin-top:110px}
/* The carved footer is Framer's Desktop variant, which expects far more room
   than these pages give it, so the newsletter column lands at 180px while the
   word "connected" measures 181. Framer's break-word then chops it mid-word:
   "connecte / d". Letting the word stay whole overflows by that one pixel,
   which nobody can see, and reads correctly. */
.svc-footer [data-framer-name="Stay connected"] p{word-break:normal!important;overflow-wrap:normal!important}
/* site grain overlay (carved) */
.svc-noise{position:fixed;inset:0;z-index:30;pointer-events:none}
.svc-noise .framer-22mi0a{position:absolute;inset:0}
/* entry reveals — mirrors Framer's appear (fade + 40px rise, stagger) */
[data-reveal]{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.215,.61,.355,1),transform .7s cubic-bezier(.215,.61,.355,1)}
[data-reveal].in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){[data-reveal]{opacity:1;transform:none;transition:none}}
</style>`;

/* reveal driver — IntersectionObserver, stagger via per-element delay */
const REVEAL_JS = `<script>
(function(){
  var els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) { els.forEach(function(e){e.classList.add('in');}); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach(function(e, i){ io.observe(e); });
  // static pages: burger MENU can't open the Framer menu — jump to footer nav
  function overlayEl(){var as=document.querySelectorAll('.svc-nav-wrap a[href="/"]');for(var i=0;i<as.length;i++){var t=(as[i].textContent||'').trim();if(!/^home/i.test(t))continue;return as[i].parentElement&&as[i].parentElement.parentElement;}return null;}
  /* The overlay wraps each link in its own container div, which the build-time
     addNav() cannot match (it only handles <p> wrappers and bare <a>).
     Clone the About container into it at runtime instead. */
  var OVERLAY_LINKS=[{href:'/services/',mark:'data-bm-svc',upper:'SERVICES',lower:'Services'},{href:'/team/',mark:'data-bm-team',upper:'TEAM',lower:'Team'}];
  function addServicesToOverlay(){
    var o=overlayEl(); if(!o) return;
    var about=null,contact=null,kids=o.children;
    for(var i=0;i<kids.length;i++){
      var a=kids[i].querySelector?kids[i].querySelector('a'):null; if(!a) continue;
      var h=a.getAttribute('href');
      if(h==='/about') about=kids[i];
      if(h==='/contact') contact=kids[i];
    }
    if(!about||!contact) return;
    /* Per-link marker, not one shared one: with a single marker the first
       injected link would make the overlay look done and the second never
       lands. Each is inserted before Contact, giving Services then Team. */
    for(var n=0;n<OVERLAY_LINKS.length;n++){
      var spec=OVERLAY_LINKS[n];
      if(o.querySelector('['+spec.mark+']')) continue;
      var clone=about.cloneNode(true);
      clone.setAttribute(spec.mark,'1');
      var link=clone.querySelector('a')||clone;
      link.setAttribute('href',spec.href);
      link.removeAttribute('data-framer-page-link-current');
      (function(sp){(function walk(el){var k=el.children;if(!k.length){if((el.textContent||'').trim())el.textContent=(el.textContent.trim()===el.textContent.trim().toUpperCase()?sp.upper:sp.lower);return;}for(var j=0;j<k.length;j++)walk(k[j]);})(clone);})(spec);
      o.insertBefore(clone,contact);
    }
  }
  /* Clone of the homepage menu. Framer opens it by swapping the header's
     variant class and setting the link list's inline opacity - nothing more.
     Captured from the live homepage:
       desktop  framer-v-m5ha19  (h 50px)  ->  framer-v-185cz0f  (h 414px)
       phone    framer-v-19vil5u (h 70px)  ->  framer-v-7tbwy4   (h 524px)
     The open variants carry no rules of their own; dropping the closed one
     releases its fixed height and the header grows around the list. */
  var VARIANTS = [['framer-v-m5ha19','framer-v-185cz0f'],['framer-v-19vil5u','framer-v-7tbwy4']];
  function toFooter(ev){
    ev.preventDefault(); ev.stopPropagation();
    var hdr = ev.currentTarget.closest('header') ||
              (ev.currentTarget.closest('.svc-nav-wrap')||document).querySelector('header');
    if (!hdr) { var f = document.querySelector('.svc-footer'); if (f) f.scrollIntoView({behavior:'smooth'}); return; }
    var list = hdr.querySelector('.framer-1w3jqcb');
    /* The variant swap changes the header to height:min-content, and CSS
       cannot transition to an intrinsic height - it would snap. Framer's
       Motion animates the pixel value, so do the same: measure the target,
       animate between explicit px, then hand height back to CSS. */
    function collapse(from, to) {
      /* Closing is not the open animation reversed. The homepage fades the
         links out first and only then collapses the header - and animating
         height back down here does not work anyway: the inline height is
         applied but the header keeps measuring its open size, so it sat open
         for half a second and then snapped. Fade, then swap. */
      var closing = fadeEls();
      hdr.classList.add('bm-closing');
      clearTimeout(hdr.__c);
      hdr.__c = setTimeout(function () {
        hdr.style.transition = 'none';
        hdr.style.height = '';
        hdr.classList.remove(from); hdr.classList.add(to);
        hdr.classList.remove('bm-closing');
        for (var f = 0; f < closing.length; f++) closing[f].style.opacity = closing[f].__op0;
        if (list) list.classList.remove('bm-open');
      }, 300);
    }
    function fadeEls() {
      var a = [list, hdr.querySelector('.framer-1oywgs7')].filter(Boolean);
      for (var f = 0; f < a.length; f++) {
        if (a[f].__op0 === undefined) a[f].__op0 = a[f].style.opacity || getComputedStyle(a[f]).opacity;
      }
      return a;
    }
    function swap(from, to, openTo) {
      if (!openTo) { collapse(from, to); return; }
      clearTimeout(hdr.__c);
      var start = hdr.getBoundingClientRect().height;
      hdr.style.transition = 'none';
      hdr.style.height = '';
      hdr.classList.remove(from); hdr.classList.add(to);
      /* Framer fades in more than the link list itself: on the phone variant
         its parent .framer-1oywgs7 is baked at opacity 0 and the runtime
         animates it up. Raising only the list left the links inside an
         invisible ancestor - an empty panel. */
      var fade = fadeEls();
      for (var f = 0; f < fade.length; f++) fade[f].style.opacity = '1';
      if (list) list.classList.add('bm-open');
      var target = hdr.getBoundingClientRect().height;
      hdr.style.height = start + 'px';
      void hdr.offsetHeight;                       // force the start frame
      hdr.style.transition = 'height .48s cubic-bezier(0.23,1,0.32,1)';
      hdr.style.height = target + 'px';
      clearTimeout(hdr.__t);
      hdr.__t = setTimeout(function(){ hdr.style.height=''; hdr.style.transition=''; }, 520);
    }
    for (var i=0;i<VARIANTS.length;i++){
      var closed=VARIANTS[i][0], open=VARIANTS[i][1];
      if (hdr.classList.contains(closed)) { swap(closed, open, true); return; }
      if (hdr.classList.contains(open))   { swap(open, closed, false); return; }
    }
  }
  addServicesToOverlay();
  setTimeout(addServicesToOverlay, 500);
  setTimeout(addServicesToOverlay, 1500);
  var wraps = document.querySelectorAll('.svc-nav-wrap [data-framer-name="MENU"], .svc-nav-wrap [data-framer-name="Menu icon"], .svc-nav-wrap [data-framer-name="Burger"]');
  for (var mi = 0; mi < wraps.length; mi++) { wraps[mi].style.cursor = 'pointer'; wraps[mi].addEventListener('click', toFooter); }
  // fallback: any leaf element in the nav whose text is exactly MENU
  var navEls = document.querySelectorAll('.svc-nav-wrap *');
  for (var ni = 0; ni < navEls.length; ni++) {
    var el = navEls[ni];
    if (!el.children.length && (el.textContent || '').trim() === 'MENU' && !el.__menuBound) {
      el.__menuBound = true;
      /* the burger wrapper holds the icon and the label, so both are clickable */
      var target = el.closest('[data-framer-name="Header / Burger menu"]') || el.closest('[data-framer-name]') || el;
      target.style.cursor = 'pointer';
      target.addEventListener('click', toFooter);
    }
  }
})();
</script>`;

const MARK = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M1.5 1.5h9v9"/></svg>`;

function head(title, desc, url, schemas) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow">
<link rel="icon" href="/favicon.ico">
<meta property="og:type" content="website"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${OG_IMAGE}">
${styles}
${GLUE}
${schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>`;
}

module.exports = { ROOT, COMP, SITE, OG_IMAGE, EMAIL, read, styles, absolutize, NAV_LINKS, UNIT_RES, addNavLink, addNav, navHtml, navHtmlFinal, navPhoneHtml, footerHtml, ctaHtml, noiseHtml, snapshot, rootM, ROOT_OPEN, esc, pad2, P, ACCENT, MUTED, MUTED2, cta, GLUE, REVEAL_JS, MARK, head };
