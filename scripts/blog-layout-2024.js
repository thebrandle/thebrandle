/**
 * The 2024 Framer CMS post layout: full-bleed photo hero with the title
 * overlaid, white surround, #f5f5f5 article band with a sticky "Back to
 * blogs" rail, dark footer.
 *
 * Shared by both post generators (gen-blog.js and gen-opinly-blog.js) so the
 * two stay in step - they used to carry separate copies of the article CSS.
 */

// The author avatar the Framer posts use, pulled from the live site.
const AVATAR = '/framerusercontent.com/images/A0LPOEdkaRkfMcS2EWs1My620fA.jpg';

const BACK_ARROW = '<svg width="22" height="20" viewBox="0 0 22 20" fill="none" aria-hidden="true"><path d="M7 1L1.5 6.5L7 12" stroke="#f9452d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 6.5H14a6.5 6.5 0 0 1 6.5 6.5v6" stroke="#f9452d" stroke-width="1.7" stroke-linecap="round"/></svg>';

/** Layout CSS. Pass the site tokens so both generators render identically. */
function css({ LIGHT, ACCENT, MUTED }) {
  return `/* Full-bleed article hero - matches the Framer blog post template:
   photo, author chip pinned left, oversized title, date + excerpt on the
   bottom row. Offsets are proportional so it holds at any width. */
.bp-hero{position:relative;margin:26px 30px 0;height:calc(100vh - 150px);min-height:560px;overflow:hidden;isolation:isolate}
.bp-hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
/* two scrims: vertical for the title/date rows, plus a left wash so the
   author chip stays readable over a bright photo */
.bp-hero::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(0,0,0,.54) 0%,rgba(0,0,0,.38) 34%,rgba(0,0,0,.52) 72%,rgba(0,0,0,.74) 100%),linear-gradient(90deg,rgba(0,0,0,.52) 0%,rgba(0,0,0,.18) 34%,rgba(0,0,0,.06) 55%)}
.bp-inner{position:relative;height:100%;display:grid;grid-template-rows:1fr auto;padding:44px 46px 40px;box-sizing:border-box}
.bp-mid{display:flex;align-items:center;gap:0}
.bp-author{display:flex;align-items:center;gap:16px;flex:0 0 26.8%}
.bp-avatar{width:58px;height:58px;border-radius:50%;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.14)}
.bp-author .n{color:#fff;font-family:Inter,sans-serif;font-size:22px;font-weight:500;line-height:1.25;text-shadow:0 1px 16px rgba(0,0,0,.6)}
.bp-author .r{color:rgba(255,255,255,.82);font-family:Inter,sans-serif;font-size:18px;line-height:1.3;text-shadow:0 1px 16px rgba(0,0,0,.6)}
.bp-title{text-shadow:0 2px 28px rgba(0,0,0,.42);color:#fff!important;text-align:left;margin:0;flex:1;font-size:clamp(40px,7vw,106px)!important;line-height:1.06!important;letter-spacing:-0.04em!important;text-shadow:0 2px 30px rgba(0,0,0,.45)}
.bp-foot{display:flex;align-items:flex-start;gap:0;padding-left:26.8%}
.bp-date{text-shadow:0 1px 16px rgba(0,0,0,.5);color:#fff;font-family:Inter,sans-serif;font-size:22px;flex:0 0 30%}
.bp-desc{text-shadow:0 1px 16px rgba(0,0,0,.5);color:rgba(255,255,255,.96);font-family:Inter,sans-serif;font-size:19px;line-height:1.5;max-width:46ch;margin:0}
@media(max-width:1024px){
  .bp-hero{height:auto;min-height:0;margin:20px 20px 0}
  .bp-inner{display:block;padding:32px 26px 34px}
  .bp-mid{display:block}
  .bp-author{flex:none;margin-bottom:30px}
  .bp-title{margin:0 0 40px}
  .bp-foot{display:block;padding-left:0}
  .bp-date{margin-bottom:12px;font-size:18px}
  .bp-desc{font-size:17px;max-width:none}
}
/* ---- article body: light section with sticky sidebar, matching the
   Framer blog template (dark hero, then everything below on #f5f5f5) ---- */
.bp-main{background:${LIGHT};padding:96px 0 40px}
.bp-grid{max-width:1660px;margin:0 auto;padding:0 46px;display:grid;grid-template-columns:26.5% 1fr;box-sizing:border-box}
.bp-side{position:sticky;top:104px;align-self:start;padding-right:30px}
.bp-side-note{color:rgba(12,12,12,.5);font-family:Inter,sans-serif;font-size:17px;line-height:1.5;margin:0 0 30px}
.bp-back{display:inline-flex;align-items:center;gap:14px;color:#0c0c0c;font-family:Inter,sans-serif;font-size:22px;text-decoration:none}
.bp-back svg{flex-shrink:0}
.bp-back:hover{color:${ACCENT}}
.bp-col{max-width:1030px;min-width:0}
.bp-main .post-body{font-family:Inter,sans-serif}
.bp-main .post-body>p:first-of-type{color:#0c0c0c;font-size:clamp(21px,1.7vw,30px);line-height:1.42;letter-spacing:-0.01em;margin:0 0 30px}
.bp-main .post-body p, .bp-main .post-body li{color:rgba(12,12,12,.6);text-align:left;line-height:1.62;font-family:Inter,sans-serif;font-size:20px}
.bp-main .post-body p{margin:0 0 22px}
.bp-main .post-body h2, .bp-main .post-body h3, .bp-main .post-body h4{color:#0c0c0c!important;text-align:left;line-height:1.16!important;letter-spacing:-0.025em!important;font-family:Inter,sans-serif;font-weight:600}
.bp-main .post-body h2{font-size:clamp(28px,2.9vw,40px)!important;margin:64px 0 22px}
.bp-main .post-body h3{font-size:clamp(21px,1.7vw,25px)!important;margin:48px 0 16px}
.bp-main .post-body h4{font-size:20px!important;margin:38px 0 14px}
.bp-main .post-body ul, .bp-main .post-body ol{margin:0 0 24px;padding-left:24px}
.bp-main .post-body li{margin-bottom:10px}
.bp-main .post-body li::marker{color:rgba(12,12,12,.45)}
.bp-main .post-body a{color:#0c0c0c;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(12,12,12,.3)}
.bp-main .post-body a:hover{color:${ACCENT};text-decoration-color:${ACCENT}}
.bp-main .post-body strong{color:#0c0c0c;font-weight:600}
.bp-main .post-body blockquote{margin:32px 0;padding:4px 0 4px 24px;border-left:2px solid ${ACCENT}}
.bp-main .post-body blockquote p{color:#0c0c0c;font-size:22px;line-height:1.5}
.bp-main .post-body figure{margin:44px 0}
.bp-main .post-body figure img{width:100%;height:auto;display:block}
.bp-main .post-body figcaption{color:rgba(12,12,12,.45);font-family:Inter,sans-serif;font-size:14px;padding:12px 2px 0}
.bp-main .post-body pre{background:#ececec;border:1px solid rgba(12,12,12,.12);border-radius:12px;padding:18px 20px;overflow-x:auto;margin:0 0 24px}
.bp-main .post-body pre code{color:#0c0c0c;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;line-height:1.6}
.bp-main .post-body :not(pre)>code{background:rgba(12,12,12,.08);border-radius:5px;padding:2px 6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;color:#0c0c0c}
.bp-main .post-body hr{border:0;border-top:1px solid rgba(12,12,12,.14);margin:48px 0}
.bp-main .post-table-wrap{overflow-x:auto;margin:0 0 26px}
.bp-main .post-body table{border-collapse:collapse;width:100%;font-family:Inter,sans-serif;font-size:16px}
.bp-main .post-body th, .bp-main .post-body td{border:1px solid rgba(12,12,12,.16);padding:11px 15px;text-align:left;color:rgba(12,12,12,.6)}
.bp-main .post-body th{color:#0c0c0c;font-weight:600;background:rgba(12,12,12,.04)}
/* ---- more articles ---- */
.bp-more{background:${LIGHT};padding:70px 0 120px}
.bp-more-h{color:#0c0c0c!important;text-align:left;margin:0 0 58px;font-size:clamp(52px,8vw,118px)!important;line-height:1!important;letter-spacing:-0.045em!important;font-weight:600}
.bp-more-list{list-style:none;margin:0;padding:0;border-top:1px solid rgba(12,12,12,.14)}
.bp-more-list a{display:block;padding:26px 0;border-bottom:1px solid rgba(12,12,12,.14);text-decoration:none;font-family:Inter,sans-serif}
.bp-more-list .t{color:#0c0c0c;font-size:22px;letter-spacing:-0.01em}
.bp-more-list a:hover .t{color:${ACCENT}}
@media(max-width:900px){
  .bp-grid{grid-template-columns:1fr;padding:0 24px}
  .bp-side{position:static;padding:0 0 38px}
  .bp-main{padding:52px 0 26px}
  .bp-more{padding:36px 0 84px}
  .bp-more-h{margin-bottom:34px}
  .bp-more-list a{padding:20px 0}
  .bp-main .post-body p, .bp-main .post-body li{font-size:17px}
  .bp-main .post-body>p:first-of-type{font-size:20px}
  .bp-main .post-body h2{margin:48px 0 18px}
}
.post-cta{background:#0c0c0c;padding:110px 46px 118px;text-align:left}
.post-cta-inner{max-width:1660px;margin:0 auto}
.post-cta h2{margin:0 0 26px;font-size:clamp(38px,6vw,86px)!important;line-height:1.02!important;letter-spacing:-0.045em!important}
.post-cta p{max-width:52ch;margin:0;font-family:Inter,sans-serif;font-size:19px;line-height:1.6}
.post-cta .actions{display:flex;justify-content:flex-start;margin-top:40px}
@media(max-width:900px){.post-cta{padding:70px 24px 78px}}
.post-cta .framer-text{color:#fff!important}
.post-cta .framer-LqZE5{background:${ACCENT};border-radius:60px;transition:transform .18s ease,filter .2s ease}
.post-cta .framer-LqZE5:hover{filter:brightness(1.08)}
.post-cta .framer-LqZE5 .framer-13x93le{width:auto;min-width:200px;padding:20px 36px!important;justify-content:center!important;gap:0!important}
.post-cta .framer-1m71lft-container{display:none}


/* ---- motion -------------------------------------------------------------
   Curves and durations live here so both generators share one set.
   0.23,1,0.32,1 is the strong ease-out: fast off the mark, long settle. The
   built-in CSS easings are too weak to read as deliberate. */
:root{--bp-ease-out:cubic-bezier(0.23,1,0.32,1);--bp-ease-in-out:cubic-bezier(0.77,0,0.175,1)}

/* Hero entrance. Pure CSS animation, not a JS-toggled class: fill "both"
   holds the end state, and the un-animated base state is fully visible, so a
   script that never runs cannot leave the title invisible. */
@media(prefers-reduced-motion:no-preference){
  .bp-hero .bp-author{animation:bpRise .66s var(--bp-ease-out) .10s both}
  .bp-hero .bp-title{animation:bpRise .66s var(--bp-ease-out) .16s both}
  .bp-hero .bp-date{animation:bpRise .66s var(--bp-ease-out) .26s both}
  .bp-hero .bp-desc{animation:bpRise .66s var(--bp-ease-out) .32s both}
  .bp-hero>img{animation:bpSettle 1.1s var(--bp-ease-out) both}
}
@keyframes bpRise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes bpSettle{from{transform:scale(1.06)}to{transform:scale(1)}}

/* Hero parallax, driven by the scroll position itself rather than a rAF loop,
   so it runs on the compositor and cannot fall behind the scroll. Chrome and
   Safari 26 support it; everywhere else the @supports block is skipped and the
   hero simply does not drift. scale stays above 1 so the drift never exposes
   an edge. */
@supports (animation-timeline:view()){
  @media(prefers-reduced-motion:no-preference){
    .bp-hero>img{animation:bpPan linear both;animation-timeline:view();animation-range:entry 0% exit 100%}
    @keyframes bpPan{from{transform:scale(1.14) translateY(-2.4%)}to{transform:scale(1.14) translateY(2.4%)}}
  }
}

/* Article copy eases in as it arrives, driven by scroll position rather than
   an IntersectionObserver toggling a class.
   Two reasons. It tracks the scroll exactly instead of firing once at a
   threshold, which is what makes it feel smooth rather than snappy. And it
   fails safe: the hidden state lives inside @supports, so a browser without
   scroll timelines never hides the copy at all, and there is no script whose
   failure could strand a paragraph at opacity 0.
   12px, not 36 - on running copy a long travel reads as a lurch. */
@supports (animation-timeline:view()){
  @media(prefers-reduced-motion:no-preference){
    .bp-main .post-body>*,
    .bp-main .post-faq details,
    .bp-main .post-related{
      animation:bpIn 1s linear both;
      animation-timeline:view();
      animation-range:entry 0% entry 46%;
    }
  }
}
@keyframes bpIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

/* the rail's arrow leans toward where it takes you */
@media(hover:hover) and (pointer:fine){
  .bp-back svg{transition:transform .22s var(--bp-ease-out)}
  .bp-back:hover svg{transform:translateX(-4px)}
}

/* ---- 2024 layout page chrome -------------------------------------------
   The original Framer posts sit on a white page: white surround around the
   photo hero, #f5f5f5 article band, dark footer. The dark grain and the
   white nav text belong to the dark layout and have to be turned off here. */
body.bp2024 .svc-noise{display:none}
body.bp2024,body.bp2024 .svc-page{background:#fff}
/* Framer's nav container is position:absolute, so the wrapper collapses to
   ~1px: no white band paints and the bar lands on top of the photo hero.
   Give the wrapper the band height the original has. */
body.bp2024 .svc-nav-wrap{min-height:104px;background:rgba(255,255,255,.9);border-bottom:1px solid rgba(12,12,12,.07)}
body.bp2024 .svc-nav-wrap .framer-fyydzk-container{top:50%!important;transform:translateY(-50%)}
/* the logo is an <img> painted white by a filter - invert that over white */
body.bp2024 .svc-nav-wrap img[src*="TheBrandle"]{filter:brightness(0)!important}
body.bp2024 .svc-nav-wrap,body.bp2024 .svc-nav-wrap *{color:#0c0c0c!important}
body.bp2024 .svc-nav-wrap svg [fill="#fff"],body.bp2024 .svc-nav-wrap svg [fill="#FFF"],
body.bp2024 .svc-nav-wrap svg [fill="white"]{fill:#0c0c0c!important}
body.bp2024 .svc-nav-wrap svg [stroke="#fff"],body.bp2024 .svc-nav-wrap svg [stroke="#FFF"],
body.bp2024 .svc-nav-wrap svg [stroke="white"]{stroke:#0c0c0c!important}
/* FAQ and related-services blocks sit inside the light column on this
   layout, so their dark-layout borders and white text need inverting. */
.bp-main .post-faq{border-top-color:rgba(12,12,12,.14)}
.bp-main .post-faq details{border-bottom-color:rgba(12,12,12,.14)}
.bp-main .post-faq summary,.bp-main .post-faq summary span{color:#0c0c0c}
.bp-main .post-faq .ans{color:rgba(12,12,12,.62)}
.bp-main .post-related{border-color:rgba(12,12,12,.16)}
.bp-main .post-related h3{color:#0c0c0c}
/* The menu is Framer's own component and opens the same on every page, so it
   needs no styling of its own here. It does paint over the white article
   header, so the bar's dark-on-white treatment has to step aside while open. */
body.bp2024 .svc-nav-wrap:has(.bm-open),body.bp2024 .svc-nav-wrap:has(.bm-open) *{color:#fff!important}
body.bp2024 .svc-nav-wrap:has(.bm-open){background:transparent;border-bottom-color:transparent}
body.bp2024 .svc-nav-wrap:has(.bm-open) img[src*="TheBrandle"]{filter:brightness(0) invert(1)!important}
/* The bar is centred inside a fixed 104px band on this layout. Once the menu
   opens the header grows to 414px, and centring a 414px box in a 104px band
   puts its top at -155 - the logo, the label and every link end up above the
   viewport, leaving an empty red panel. Drop the centring while it is open. */
body.bp2024 .svc-nav-wrap:has(.bm-open){min-height:0}
body.bp2024 .svc-nav-wrap:has(.bm-open) .framer-fyydzk-container{top:0!important;transform:none!important}
`;
}

/**
 * The article markup: hero + light body with the sticky rail.
 * Built by concatenation on purpose - nesting this inside a generator's own
 * template literal breaks on its own backticks.
 */
function renderArticle(o) {
  const img = o.hero
    ? '<img src="' + o.esc(o.hero) + '" alt="' + o.escCopy(o.heroAlt || o.title) + '" fetchpriority="high" decoding="async">'
    : '';
  const avatar = o.avatar
    ? '<img class="bp-avatar" src="' + o.esc(o.avatar) + '" alt="" width="58" height="58" loading="eager" decoding="async">'
    : '';
  return [
    '<header class="bp-hero">', img,
    '<div class="bp-inner"><div class="bp-mid"><div class="bp-author">', avatar,
    '<div><div class="n">' + o.escCopy(o.authorName) + '</div><div class="r">' + o.escCopy(o.authorRole) + '</div></div>',
    '</div><h1 class="bp-title ' + o.h2Preset + '">' + o.escCopy(o.title) + '</h1></div>',
    '<div class="bp-foot"><div class="bp-date">' + o.esc(o.date) + '</div>',
    '<p class="bp-desc">' + o.escCopy(o.desc || '') + '</p></div></div></header>',
    '<section class="bp-main"><div class="bp-grid">',
    '<aside class="bp-side"><p class="bp-side-note">Continue exploring ideas<br>in web design and beyond.</p>',
    '<a class="bp-back" href="' + o.backHref + '">' + BACK_ARROW + 'Back to blogs</a></aside>',
    '<div class="bp-col"><div class="post-body">', o.body, '</div>', o.after || '', '</div></div></section>',
  ].join('');
}

/* Post covers.
   Generated per post with Magnific (Seedream 5 Pro, 16:9). Abstract rather
   than literal - each one renders the article's idea as form, light and
   material instead of photographing the subject. Deliberately text-free: the layout paints the headline over the
   photo, so any lettering in the image collides with it. Dark and low-key for
   the same reason - white type has to hold.

   These replaced the studio's project photography, which was wrong for the
   job twice over: it is client work rather than editorial art, and several of
   those shots contain their own headlines and UI copy (the Orblead pricing
   page put "Flexible plans built to scale your leads" directly behind an
   article title).

   HERO_POOL below is only a fallback for a slug with no cover yet. */
const COVER_DIR = '/assets/blog/covers/';
const COVER_ALT = {
  'ai-in-web-design': 'Abstract glowing filaments resolving into an ordered lattice',
  'arabic-rtl-website-design': 'An abstract interlaced arabesque pattern in relief',
  'branding-agency': 'Abstract translucent planes resolving into one form',
  'core-web-vitals-guide': 'Abstract ribbons of light accelerating into streaks',
  'framer-vs-webflow': 'Two abstract forms, one fluid and one faceted',
  'headless-cms-guide': 'An abstract slab separating into floating layers',
  'progressive-web-apps': 'Abstract concentric waves spreading from a point',
  'real-estate-website-design': 'Abstract architectural volumes cut by a shaft of light',
  'shopify-vs-woocommerce': 'A closed abstract monolith beside an open modular frame',
  'should-i-hire-a-web-designer-or-do-it-myself': 'A rough abstract mass beside a polished one',
  'website-cost-dubai': 'Abstract translucent planes stacking into ascending tiers',
  'website-design': 'An abstract ribbon of light folded into a smooth form',
  'website-maintenance-cost': 'Abstract interlocking rings in continuous motion',
  'website-redesign-without-losing-seo': 'An abstract form dissolving and re-forming, one thread unbroken',
  'website-security-checklist': 'Abstract nested shells enclosing a glowing core',
  'website-total-cost-of-ownership': 'Abstract strata accumulating in layers',
  'wix-to-shopify-migration': 'Abstract particles streaming from one form into another',
  'wordpress-vs-webflow': 'A dense abstract texture meeting a smooth surface',
};
const coverFor = (slug) => {
  const rel = COVER_DIR + slug + '.jpg';
  return require('fs').existsSync(require('path').join(__dirname, '..', 'assets', 'blog', 'covers', slug + '.jpg'))
    ? { src: rel, alt: COVER_ALT[slug] || '' }
    : null;
};

/* Hero photos.
   These are the studio's own project photographs, not Framer's template
   stock. That matters: the site ships an override stylesheet
   (_snapshot/components/styles.html) that swaps several Framer placeholder
   images for real project work and hides the originals with
   "opacity: 0 !important". Three of the photos this pool used to carry were
   on that list, so seven posts rendered a grey scrim and no image at all.
   assertHeroVisible() below fails the build rather than let that recur.

   The 2024 layout overlays its own title on the photo, so a post must NOT use
   its generated listing card here - that art already has the title baked in. */
const HERO_DIR = '';
const HERO_POOL = [
  { file: '/assets/projects/apex/project2_02_img.webp', alt: 'Branded takeaway cups from an Apex identity project' },
  { file: '/assets/projects/apex/project2_03_img.webp', alt: 'Branded deck chairs from an Apex identity project' },
  { file: '/assets/projects/apex/project2_04_img.webp', alt: 'A branded t-shirt from an Apex identity project' },
  { file: '/assets/projects/dropx/image3.webp', alt: 'A DropX sneaker photographed on a dark set' },
  { file: '/assets/projects/dropx/image4.webp', alt: 'A DropX tote bag held against a dark backdrop' },
  { file: '/assets/projects/dropx/image5.webp', alt: 'A printed DropX t-shirt' },
  { file: '/assets/projects/orblead/image1.webp', alt: 'The Orblead web app open on a laptop' },
  { file: '/assets/projects/orblead/image2.webp', alt: 'An Orblead pricing page on a desktop display' },
  { file: '/assets/projects/orblead/image3.webp', alt: 'Orblead interface screens' },
  { file: '/assets/projects/orblead/image4.webp', alt: 'Orblead pricing and comparison screens' },
  { file: '/assets/projects/orblead/image5.png', alt: 'An Orblead analytics dashboard' },
  { file: '/assets/projects/shine/image2.webp', alt: 'Printed brand collateral from the Shine identity' },
  { file: '/assets/projects/shine/image4.webp', alt: 'A repeating pattern from the Shine identity' },
  { file: '/assets/projects/shine/image5.webp', alt: 'The Shine app on a phone with brand cards' },
  { file: '/assets/projects/shine/pallete.webp', alt: 'The Shine colour palette' },
  { file: '/framerusercontent.com/images/YlEKlxLXS5eEKd4QlVitTh30A.jpg', alt: 'Three people working together in a studio' },
  { file: '/framerusercontent.com/images/eLsR49HoCXz2B9KTFAhtjD454Dw.jpg', alt: 'A studio lounge with green armchairs and plants' },
  { file: '/framerusercontent.com/images/mEUUzFINLTAMqcjxzWXrFUYzBPQ.jpg', alt: 'Two phones displaying a design mockup' },
];

/* One cover per post, chosen to suit the subject. 18 posts, 18 photos, so no
   two posts share a cover. Anything not listed falls back to the hash pick. */
const HERO_OVERRIDES = {
  'ai-in-web-design': '/assets/projects/orblead/image5.png',
  'arabic-rtl-website-design': '/assets/projects/shine/image2.webp',
  'branding-agency': '/assets/projects/apex/project2_02_img.webp',
  'core-web-vitals-guide': '/assets/projects/orblead/image1.webp',
  'framer-vs-webflow': '/framerusercontent.com/images/YlEKlxLXS5eEKd4QlVitTh30A.jpg',
  'headless-cms-guide': '/assets/projects/orblead/image3.webp',
  'progressive-web-apps': '/framerusercontent.com/images/mEUUzFINLTAMqcjxzWXrFUYzBPQ.jpg',
  'real-estate-website-design': '/framerusercontent.com/images/eLsR49HoCXz2B9KTFAhtjD454Dw.jpg',
  'shopify-vs-woocommerce': '/assets/projects/dropx/image3.webp',
  'should-i-hire-a-web-designer-or-do-it-myself': '/assets/projects/apex/project2_03_img.webp',
  'website-cost-dubai': '/assets/projects/orblead/image2.webp',
  'website-design': '/assets/projects/shine/image4.webp',
  'website-maintenance-cost': '/assets/projects/orblead/image4.webp',
  'website-redesign-without-losing-seo': '/assets/projects/shine/pallete.webp',
  'website-security-checklist': '/assets/projects/dropx/image4.webp',
  'website-total-cost-of-ownership': '/assets/projects/shine/image5.webp',
  'wix-to-shopify-migration': '/assets/projects/dropx/image5.webp',
  'wordpress-vs-webflow': '/assets/projects/apex/project2_04_img.webp',
};
/** Deterministic per slug, so a post keeps the same photo across rebuilds. */
function pickHero(slug) {
  const pinned = HERO_OVERRIDES[slug];
  if (pinned) return HERO_POOL.find((h) => h.file === pinned) || { file: pinned, alt: '' };
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum * 31 + slug.charCodeAt(i)) >>> 0;
  return HERO_POOL[sum % HERO_POOL.length];
}

/* The override stylesheet hides specific Framer images outright. A hero on
   that list loads fine and reports naturalWidth, so nothing looks wrong at
   build time - it just paints nothing. Read the list and refuse to build. */
let _hidden = null;
function hiddenImageHashes() {
  if (_hidden) return _hidden;
  _hidden = new Set();
  try {
    const css = require('fs').readFileSync(
      require('path').join(__dirname, '..', '_snapshot', 'components', 'styles.html'), 'utf8');
    for (const m of css.matchAll(/img\[src\*="([A-Za-z0-9]+)"\][^{]*\{[^}]*opacity:\s*0/g)) _hidden.add(m[1]);
  } catch (_) { /* snapshot missing - guard simply cannot run */ }
  return _hidden;
}
function assertHeroVisible(slug, src) {
  for (const hash of hiddenImageHashes()) {
    if (src.includes(hash)) {
      throw new Error('hero for "' + slug + '" is ' + src + ', which the project-image override ' +
        'hides with opacity:0 - it would render as an empty scrim. Pick another photo.');
    }
  }
}
const heroFor = (slug) => {
  const cover = coverFor(slug);
  if (cover) return cover;
  const h = pickHero(slug);
  const src = HERO_DIR + h.file;
  assertHeroVisible(slug, src);
  return { src, alt: h.alt };
};

module.exports = { AVATAR, BACK_ARROW, css, renderArticle, COVER_DIR, COVER_ALT, coverFor, HERO_DIR, HERO_POOL, HERO_OVERRIDES, pickHero, heroFor, assertHeroVisible, hiddenImageHashes };
