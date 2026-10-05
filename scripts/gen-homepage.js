#!/usr/bin/env node
'use strict';
/**
 * Homepage generator.
 *
 * Replaces the Framer-exported homepage with one static page built from the
 * same parts as the service, team and FAQ pages (site-shell.js): the carved
 * Framer stylesheet and text presets, the hydrated nav, menu and footer. Every
 * section is laid out ONCE for all three breakpoints instead of Framer's three
 * copies, which is what Seobility flagged as 52 duplicate texts and 75 headings.
 *
 * Geometry comes from measuring the live page in headless Chrome at 1440, 1024
 * and 390px (_snapshot/measure/, local only), not from eyeballing screenshots.
 * Breakpoints match Framer's: desktop >= 1200, tablet 810-1199, phone <= 809.
 *
 * Motion is plain CSS plus a small script, timed off the export:
 *   hero intro      __framer__appearAnimationsContent delays and easings
 *   statement       scroll-linked: image 160px -> 0, text scale 1.3 -> 1
 *   first work row  scroll-linked: scale .8 -> 1, y 250 -> 0, opacity 0 -> 1
 *   quote           words rise 7px and fade in, staggered
 *
 *   node scripts/gen-homepage.js                                   -> index.html, the live homepage
 *   HOME_OUT=home-preview/index.html node scripts/gen-homepage.js  -> noindex preview copy
 */
const fs = require('fs');
const path = require('path');
const { ROOT, COMP, SITE, OG_IMAGE, EMAIL, styles, GLUE, REVEAL_JS, navHtmlFinal, navPhoneHtml, footerHtml, ROOT_OPEN, esc } = require('./site-shell');
const D = require('./home-data');
const { TEAM } = require('./team-data');

const OUT_REL = process.env.HOME_OUT || 'index.html';
const LIVE = OUT_REL === 'index.html';
const ICONS = JSON.parse(fs.readFileSync(path.join(COMP, 'home-icons.json'), 'utf8'));
const CAL_PILL = fs.readFileSync(path.join(COMP, 'cal-pill.js'), 'utf8');

/* Framer text presets, measured on the live homepage. Sizes step down at the
   tablet and phone breakpoints by themselves - that is what the presets are for.
   Colour is overridden inline through --framer-text-color, the same variable
   Framer's own inline overrides use. */
const PR = {
  display: 'framer-text framer-styles-preset-1usw2w6', // 112 / 80 / 42
  h2: 'framer-text framer-styles-preset-1t5qoig',      // 46 / 40 / 32
  h3: 'framer-text framer-styles-preset-ddjjzx',       // 26 / 22 / 20
  lead: 'framer-text framer-styles-preset-1dmjd5e',    // 22 / 20 / 18
  bodyLg: 'framer-text framer-styles-preset-1raml1m',  // 18 / 17 / 16
  body: 'framer-text framer-styles-preset-jnye1g',     // 16 / 15 / 15
  small: 'framer-text framer-styles-preset-1hahlh8',   // 14
  xs: 'framer-text framer-styles-preset-1hxhobn',      // 13 / 12 / 12
  bebas: 'framer-text framer-styles-preset-1f7rx9a',   // 50 / 40 / 32
};
const C = (c) => ` style="--framer-text-color:${c}"`;
const INK = 'rgb(12, 12, 12)';
const MUT = 'rgba(12, 12, 12, 0.6)';
const WHITE = 'rgb(255, 255, 255)';

const icon = (name, cls = '') => {
  const i = ICONS[name];
  if (i.svg) return i.svg.replace('<svg', `<svg class="${cls}" aria-hidden="true" focusable="false"`);
  return `<svg class="${cls}" viewBox="${i.viewBox}" fill="currentColor" aria-hidden="true" focusable="false">${i.body}</svg>`;
};
const corner = (cls = '') => `<i class="hm-corner ${cls}" aria-hidden="true"></i>`;
const rich = (parts) => parts.map((p, i) => (i % 2 ? `<strong>${esc(p)}</strong>` : esc(p))).join('');
/* the "↳ Let's talk" link: an arrow and a lead-preset label; a red pill on phones */
const arrowLink = (label, href, extra = '') => `<a class="hm-link ${extra}" href="${href}">${icon('arrowElbow', 'hm-link-ico')}<span class="${PR.lead} hm-link-txt" style="--framer-text-color:currentColor">${esc(label)}</span></a>`;

/* ------------------------------------------------------------------ sections */

function hero() {
  const h = D.hero;
  return `<section class="hm-hero" id="top" aria-label="Introduction">
  <div class="hm-hero-bg" aria-hidden="true">
    <img class="hm-hero-img" src="${h.image}" alt="${esc(h.imageAlt)}" fetchpriority="high" decoding="async">
    <video class="hm-hero-vid" muted loop playsinline preload="none" data-src="${h.video}" poster="${h.image}"></video>
  </div>
  <div class="hm-hero-noise" style="background-image:url(${h.noise})" aria-hidden="true"></div>
  <h1 class="hm-h1"><span class="hm-l1 hm-in1">${esc(h.line1)}</span> <span class="hm-l2 hm-in2">${esc(h.line2)}</span></h1>
  <span class="hm-l1 hm-in1 hm-ov" data-t="${esc(h.line1)}" aria-hidden="true"></span>
  <span class="hm-l2 hm-in2 hm-ov" data-t="${esc(h.line2)}" aria-hidden="true"></span>
  <ul class="hm-tags hm-in3">${h.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  <p class="${PR.body} hm-tagline hm-in4"${C('rgba(255, 255, 255, 0.9)')}>${esc(h.tagline)}</p>
</section>`;
}

function numbers() {
  const n = D.numbers;
  const fmt = (v, d) => (d ? v.toFixed(d) : String(v));
  return `<section class="hm-sec hm-num" aria-labelledby="hm-num-h">
  <div class="hm-wrap">
    <div class="hm-num-top">
      ${arrowLink(n.cta.label, n.cta.href, 'hm-num-cta')}
      <h2 id="hm-num-h" class="${PR.h2} hm-num-h" data-reveal${C(INK)}>${esc(n.heading).replace('numbers. ', 'numbers.<br class="hm-br"> ')}</h2>
    </div>
    <div class="hm-stats">
${n.stats.map((s, i) => `      <div class="hm-stat" data-reveal style="transition-delay:${i * 80}ms">
        <p class="hm-stat-num"><span data-count="${s.value}" data-dec="${s.decimals}">${fmt(s.value, s.decimals)}</span><span>${esc(s.suffix)}</span></p>
        <div class="hm-stat-txt"><h3 class="${PR.h3}"${C(INK)}>${esc(s.title)}</h3><p class="${PR.body}"${C(MUT)}>${esc(s.body)}</p></div>
      </div>`).join('\n')}
    </div>
  </div>
</section>`;
}

function statement() {
  const s = D.statement;
  return `<section class="hm-sec hm-stmt" aria-labelledby="hm-stmt-h">
  <div class="hm-stmt-top">
    <div class="hm-stmt-img" data-sl="stmtImg"><img src="${s.image}" alt="${esc(s.imageAlt)}" loading="lazy" decoding="async"></div>
    <h2 id="hm-stmt-h" class="hm-stmt-h" data-sl="stmtTxt"><span>${esc(s.line1)}</span> <span>${esc(s.line2)}</span></h2>
  </div>
  <div class="hm-stmt-col">
    <p class="${PR.bodyLg} hm-stmt-sub" data-reveal${C(MUT)}>${esc(s.sub)}</p>
    <p class="hm-wordmark" data-reveal style="transition-delay:80ms">Thebrandle</p>
    <a class="hm-stmt-arrow" href="#goals" aria-label="Scroll to the next section"><span>${icon('arrowDown')}</span></a>
  </div>
</section>`;
}

function benefits() {
  const b = D.benefits;
  const t = b.tweaks, k = b.kit, s = b.support, c = b.care;
  return `<section class="hm-sec hm-ben" id="goals" aria-labelledby="hm-ben-h">
  <div class="hm-wrap">
    <h2 id="hm-ben-h" class="${PR.display} hm-ben-h" data-reveal${C('rgb(11, 11, 12)')}>${esc(b.heading)}</h2>
    <p class="${PR.bodyLg} hm-ben-sub" data-reveal style="transition-delay:80ms;--framer-text-color:${MUT}">${esc(b.sub)}</p>
    <div class="hm-cards">
      <article class="hm-card hm-care" data-reveal style="background-image:url(${c.grid})">
        <img class="hm-care-img" src="${c.image}" alt="Two hands reaching towards each other" loading="lazy" decoding="async">
        <div class="hm-card-txt"><h3 class="${PR.h3}"${C(INK)}>${esc(c.title)}</h3><p class="${PR.body}"${C(MUT)}>${rich(c.body)}</p></div>
      </article>
      <article class="hm-card hm-tweak" data-reveal style="transition-delay:80ms">
        ${corner('hm-card-corner')}
        <h3 class="${PR.h3}"${C(INK)}>${esc(t.title)}</h3>
        <p class="${PR.body}"${C(MUT)}>${rich(t.body)}</p>
        <div class="hm-avatars" aria-hidden="true">${t.avatars.map((a) => `<img src="${a}" alt="Portrait photo" loading="lazy" decoding="async">`).join('')}</div>
        <div class="hm-req">
          <p class="hm-req-h">${esc(t.listTitle)}</p>
          <ul class="hm-req-list">
${t.done.map((x) => `            <li class="is-done"><span class="hm-tick">${icon('check')}</span><s>${esc(x)}</s></li>`).join('\n')}
${t.todo.map((x) => `            <li><span class="hm-tick"></span><span>${esc(x)}</span></li>`).join('\n')}
          </ul>
          <p class="hm-req-foot">${icon('calendar', 'hm-req-cal')}<span>${esc(t.validity)}</span></p>
        </div>
      </article>
      <article class="hm-card hm-kit" data-reveal style="transition-delay:160ms">
        <i class="hm-kit-l hm-kit-t"></i><i class="hm-kit-l hm-kit-b"></i><i class="hm-kit-l hm-kit-lv"></i><i class="hm-kit-l hm-kit-rv"></i>
        <p class="${PR.xs} hm-kit-label"${C(WHITE)}>${esc(k.label)}</p>
        <div class="hm-kit-icons" aria-hidden="true">${['folder', 'eyedropper', 'images', 'textAa', 'listIndent', 'stack'].map((n) => icon(n)).join('')}</div>
        <div class="hm-kit-btn" aria-hidden="true"><span class="hm-kit-dot">${icon('cloudDown')}</span><span class="hm-kit-count">${k.count}</span></div>
        <div class="hm-kit-txt"><h3 class="${PR.h3}"${C(WHITE)}>${esc(k.title)}</h3><p class="${PR.body}"${C('rgba(255, 255, 255, 0.6)')}>${rich(k.body)}</p></div>
      </article>
      <article class="hm-card hm-sup" data-reveal style="transition-delay:240ms">
        <img class="hm-sup-face" src="${s.face}" alt="Close-up portrait in soft light" loading="lazy" decoding="async">
        <i class="hm-sup-tint"></i>
        <i class="hm-sup-glass"></i>
        <img class="hm-sup-phone" src="${s.phone}" alt="Phone mockup" loading="lazy" decoding="async">
        <div class="hm-sup-ui">
          <p class="hm-sup-time" aria-hidden="true">${esc(s.time)}</p>
          <div class="hm-bubbles">
            <div class="hm-bubble"><img src="${s.avatar}" alt="Designer avatar" loading="lazy" decoding="async"><div><p class="hm-bubble-top"><b>${esc(s.sender)}</b><span>${esc(s.when)}</span></p><p class="${PR.xs} hm-bubble-msg"${C(MUT)}>${esc(s.message)}</p></div></div>
            <div class="hm-bubble hm-bubble-back" aria-hidden="true"></div>
          </div>
          <div class="hm-sup-logo"><p class="hm-wordmark hm-wordmark-w">Thebrandle</p><h3 class="hm-sup-cap">${s.caption.map(esc).join('<br>')}</h3></div>
        </div>
      </article>
    </div>
  </div>
</section>`;
}

function work() {
  const w = D.work;
  const card = (p, cls, i) => `<a class="hm-proj ${cls}" href="${p.href}"${i ? ` data-reveal` : ''}>
          <span class="hm-proj-img">${/\.gif$/.test(p.image) ? '' : ''}<img src="${p.image}" alt="${esc(p.alt)}" loading="lazy" decoding="async">${corner('hm-proj-corner')}</span>
          <h3 class="${PR.h3}"${C(INK)}>${esc(p.title)}</h3>
          <p class="${PR.bodyLg}"${C(MUT)}>${esc(p.body)}</p>
          <span class="hm-tag">${esc(p.tag)}</span>
        </a>`;
  const [a, b, c, d] = w.projects;
  return `<section class="hm-sec hm-work" aria-labelledby="hm-work-h">
  <div class="hm-wrap">
    <div class="hm-work-head">
      <p class="hm-eyebrow">${corner()}<span>${esc(w.label)}</span></p>
      <h2 id="hm-work-h" class="${PR.display} hm-work-h"${C(INK)}><span>${esc(w.heading[0])}</span> <span>${esc(w.heading[1])}</span></h2>
      <p class="${PR.bebas} hm-year"${C(INK)}>${esc(w.year)}</p>
    </div>
    <div class="hm-work-body">
      <i class="hm-work-fade" aria-hidden="true"></i>
      <div class="hm-row hm-row1" data-sl="workRow">
        ${card(a, 'hm-proj-a', 0)}
        ${card(b, 'hm-proj-b', 0)}
      </div>
      <div class="hm-row hm-row2">${card(c, 'hm-proj-c', 1)}</div>
      <div class="hm-row hm-row3">${card(d, 'hm-proj-d', 1)}</div>
      <a class="hm-all" href="${w.all.href}">${icon('arrowRight', 'hm-all-ico')}<span>${esc(w.all.label)}</span></a>
    </div>
  </div>
</section>`;
}

function services() {
  const s = D.services;
  const first = s.items[0];
  return `<section class="hm-sec hm-svc" id="services" aria-labelledby="hm-svc-h">
  <div class="hm-wrap">
    <div class="hm-svc-top">
      <p class="hm-wordmark hm-wordmark-w" aria-hidden="true">Thebrandle</p>
      <h2 id="hm-svc-h" class="hm-eyebrow hm-eyebrow-w">${corner()}<span>${esc(s.label)}</span></h2>
    </div>
    <div class="hm-svc-body">
      <div class="hm-svc-panel" aria-live="polite">
        <div class="hm-svc-pic">${s.items.map((it, i) => `<img src="${it.image}" alt="${esc(it.alt)}" loading="lazy" decoding="async"${i ? ' class="is-off"' : ''}>`).join('')}</div>
        <a class="${PR.body} hm-svc-name" href="${first.href}"${C(WHITE)}>${esc(first.title)}</a>
        <p class="${PR.lead} hm-svc-desc"${C(WHITE)}>${esc(first.body)}</p>
      </div>
      <ul class="hm-svc-list">
${s.items.map((it, i) => `        <li><button type="button" class="hm-svc-row${i ? '' : ' is-on'}" data-i="${i}" data-href="${it.href}" data-body="${esc(it.body)}" aria-pressed="${i ? 'false' : 'true'}"><span class="hm-svc-t">${esc(it.title)}</span><span class="hm-svc-n" aria-hidden="true"><b>{</b>${String(i + 1).padStart(2, '0')}<b>}</b></span></button></li>`).join('\n')}
      </ul>
      ${arrowLink(s.cta.label, s.cta.href, 'hm-svc-cta')}
    </div>
  </div>
</section>`;
}

function quote() {
  const q = D.quote;
  // Words, not letters: the live page splits per character, which reads as one
  // letter per element to assistive tech and crawlers. Words keep the motion.
  const words = q.text.split(' ').map((w, i) => `<span style="--d:${i * 28}ms">${esc(w)}</span>`).join(' ');
  return `<section class="hm-sec hm-quote" aria-label="About the studio">
  <div class="hm-wrap hm-quote-grid">
    <div class="hm-quote-img"><img src="${q.image}" alt="${esc(q.imageAlt)}" loading="lazy" decoding="async">${corner('hm-card-corner')}</div>
    <figure class="hm-quote-body">
      ${icon('quote', 'hm-quote-marks')}
      <blockquote class="hm-quote-text" data-words><p>${words}</p></blockquote>
      <p class="${PR.lead} hm-quote-sub" data-reveal${C(MUT)}>${esc(q.sub)}</p>
      <figcaption class="hm-quote-by"><span class="${PR.lead}"${C(INK)}>${esc(q.by)}</span></figcaption>
    </figure>
  </div>
</section>`;
}

function pricing() {
  const p = D.pricing;
  const plan = (pl, i) => `<article class="hm-plan${pl.featured ? ' is-featured' : ''}" data-reveal style="transition-delay:${i * 80}ms">
        ${pl.featured ? corner('hm-card-corner') : ''}
        <div class="hm-plan-name"><h3 class="${PR.body}"${C(INK)}>${esc(pl.name)}</h3>${pl.badge ? `<span class="hm-badge${pl.featured ? '' : ' hm-badge-dark'}">${icon(pl.featured ? 'flame' : 'diamond')}${esc(pl.badge)}</span>` : ''}</div>
        <p class="hm-price"><span class="hm-roll"><span data-tier="0">${esc(pl.price[0])}</span><span data-tier="1">${esc(pl.price[1])}</span></span></p>
        <p class="${PR.body} hm-plan-blurb"${C(MUT)}><span data-tier="0">${esc(pl.blurb[0])}</span><span data-tier="1">${esc(pl.blurb[1])}</span></p>
        <a class="hm-plan-cta" href="${p.cta.href}">${icon('arrowElbow')}<span>${esc(p.cta.label)}</span></a>
        <p class="${PR.small} hm-plan-inc"${C('rgb(11, 11, 12)')}>${esc(p.included)}</p>
        ${pl.features.map((list, t) => `<ul class="hm-feat" data-tier="${t}">${list.map((f) => `<li>${corner()}<span class="${PR.body}"${C(MUT)}>${esc(f)}</span></li>`).join('')}</ul>`).join('\n        ')}
      </article>`;
  return `<section class="hm-sec hm-price-sec" id="pricing" aria-labelledby="hm-price-h" data-tier="1">
  <div class="hm-wrap">
    <h2 id="hm-price-h" class="${PR.display} hm-price-h" data-reveal${C('rgb(11, 11, 12)')}>${esc(p.heading)}</h2>
    <p class="${PR.bodyLg} hm-price-sub" data-reveal style="transition-delay:80ms;--framer-text-color:${MUT}">${esc(p.sub[0])}<br>${esc(p.sub[1])}</p>
    <div class="hm-toggle" data-reveal style="transition-delay:120ms">
      <span class="${PR.small} hm-tg-l" data-for="0">${esc(p.tiers[0])}</span>
      <button type="button" class="hm-switch" role="switch" aria-checked="true" aria-label="Show ${esc(p.tiers[1])} plans"><span></span></button>
      <span class="${PR.small} hm-tg-l" data-for="1">${esc(p.tiers[1])}</span>
      <span class="hm-save" aria-hidden="true"></span>
    </div>
    <div class="hm-plans">
      ${p.plans.map(plan).join('\n      ')}
    </div>
  </div>
</section>`;
}

function processSteps() {
  const p = D.process;
  return `<section class="hm-sec hm-proc" aria-labelledby="hm-proc-h">
  <div class="hm-wrap hm-proc-grid">
    <div class="hm-proc-intro">
      <h2 id="hm-proc-h" class="${PR.display}" data-reveal${C('rgb(11, 11, 12)')}>${esc(p.heading)}</h2>
      <p class="${PR.bodyLg} hm-proc-sub" data-reveal style="transition-delay:80ms;--framer-text-color:${MUT}">${esc(p.sub)}</p>
      ${arrowLink(p.cta.label, p.cta.href, 'hm-proc-cta')}
    </div>
    <ol class="hm-steps">
${p.steps.map((s, i) => `      <li class="hm-step" data-reveal style="transition-delay:${i * 80}ms">${corner('hm-step-corner')}<span class="hm-step-n">${String(i + 1).padStart(2, '0')}</span><div><h3 class="${PR.h3}"${C(INK)}>${esc(s.title)}</h3><p class="${PR.body}"${C(MUT)}>${esc(s.body)}</p></div></li>`).join('\n')}
    </ol>
  </div>
</section>`;
}

function faq() {
  const f = D.faq;
  return `<section class="hm-sec hm-faq" aria-labelledby="hm-faq-h">
  <div class="hm-wrap hm-faq-grid">
    <div class="hm-faq-intro">
      <h2 id="hm-faq-h" class="${PR.display}" data-reveal${C('rgb(11, 11, 12)')}>${esc(f.heading)}</h2>
      <p class="${PR.bodyLg} hm-faq-sub" data-reveal style="transition-delay:80ms;--framer-text-color:${MUT}">${esc(f.sub)}</p>
      ${arrowLink(f.cta.label, f.cta.href, 'hm-faq-cta')}
    </div>
    <div class="hm-faq-list">
${f.items.map((it) => `      <details class="hm-qa"><summary><h3 class="${PR.bodyLg}"${C(INK)}>${esc(it.q)}</h3>${icon('plus', 'hm-qa-ico')}</summary><div class="hm-qa-a"><p class="${PR.body}"${C(MUT)}>${esc(it.a)}</p></div></details>`).join('\n')}
    </div>
  </div>
</section>`;
}

function contact() {
  const c = D.contact;
  return `<section class="hm-sec hm-contact" id="contact" aria-labelledby="hm-contact-h">
  <div class="hm-contact-bg" data-sl="contactBg" aria-hidden="true"><img src="${c.image}" alt="Black and white close-up of an eye" loading="lazy" decoding="async"></div>
  <p class="hm-eyebrow hm-eyebrow-w hm-contact-label">${corner()}<span>${esc(c.label)}</span></p>
  <div class="hm-wrap">
    <h2 id="hm-contact-h" class="${PR.display} hm-contact-h" data-reveal${C(WHITE)}>${esc(c.heading)}</h2>
    <div class="hm-contact-grid">
      <p class="${PR.bodyLg} hm-contact-body"${C('rgba(255, 255, 255, 0.6)')}>${esc(c.body)}</p>
      <form class="hm-form" action="/api/contact" method="post" novalidate>
        <label class="hm-field"><span class="hm-sr">${esc(c.fields.name)}</span><input name="Name" type="text" autocomplete="name" placeholder="${esc(c.fields.name)}" required></label>
        <label class="hm-field"><span class="hm-sr">${esc(c.fields.email)}</span><input name="E-mail" type="email" autocomplete="email" placeholder="${esc(c.fields.email)}" required></label>
        <label class="hm-field"><span class="hm-sr">${esc(c.fields.message)}</span><textarea name="Message" rows="1" placeholder="${esc(c.fields.message)}"></textarea></label>
        <div class="hm-hp" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
        <button class="hm-submit" type="submit">${icon('arrowElbow', 'hm-link-ico')}<span class="${PR.lead}"${C(WHITE)}>${esc(c.submit)}</span></button>
        <p class="hm-form-msg" role="status" aria-live="polite"></p>
      </form>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------- styles */

const HOME_CSS = `<style>
html,body{background:#fff!important}
.hm{--ink:rgb(12,12,12);--ink2:rgb(11,11,12);--red:var(--token-1662617d-fd18-4319-b3da-aa36e5415705,rgb(249,69,45));--mut:rgba(12,12,12,.6);--grey:rgb(245,245,245);--pad:36px;--inter:"Inter","Inter Placeholder",sans-serif;--bebas:"Bebas Neue","Bebas Neue Placeholder",sans-serif;position:relative;background:#fff;color:var(--ink);font-family:var(--inter);overflow-x:clip}
.hm *,.hm *::before,.hm *::after{box-sizing:border-box}
:where(.hm) :where(a,a:link,a:visited){color:inherit;text-decoration:none}
:where(.hm) :where(h1,h2,h3,p,ul,ol,figure,blockquote){margin:0;padding:0}
:where(.hm) :where(ul,ol){list-style:none}
:where(.hm) :where(img){display:block;max-width:none}
:where(.hm) :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;text-align:inherit}
.hm-sr{position:absolute!important;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.hm-wrap{width:100%;max-width:1920px;margin:0 auto;padding-left:var(--pad);padding-right:var(--pad)}
/* cancel Framer's paragraph spacing; every gap below is set explicitly */
.hm main .framer-text{margin-top:0}
.hm-sec{position:relative;z-index:2;background:#fff}
.hm-corner{display:inline-block;flex:none;width:9px;height:9px;border-top:2px solid var(--red);border-right:2px solid var(--red)}
.hm-card-corner{position:absolute;top:30px;right:30px;z-index:2}
.hm-eyebrow{display:flex;align-items:center;gap:10px;font:600 13px/18.2px var(--inter);letter-spacing:-.04em;text-transform:uppercase;color:var(--ink)}
.hm-eyebrow-w{color:#fff}
.hm-wordmark{font:400 50px/.85 var(--bebas);letter-spacing:-.04em;color:var(--ink);text-transform:uppercase}
.hm-wordmark-w{color:#fff}
.hm strong{font-weight:inherit;color:var(--strong,var(--ink))}

/* nav: the homepage header sits over the hero and scrolls away with it */
.hm .hm-navwrap{position:absolute;top:0;left:0;right:0;z-index:9;background:none;-webkit-backdrop-filter:none;backdrop-filter:none}
@media(max-width:809px){.hm .hm-navwrap .svc-nav-desktop{display:none}.hm .hm-navwrap .svc-nav-phone{display:block}}
@media(min-width:810px){.hm .hm-navwrap .svc-nav-desktop{display:block}.hm .hm-navwrap .svc-nav-phone{display:none}}

/* link with the elbow arrow */
.hm-link{display:inline-flex;align-items:center;gap:12px;color:var(--ink)}
.hm-link-ico{width:23px;height:23px;flex:none;color:var(--red)}
.hm-link-txt{--framer-text-color:currentColor}
.hm-link .hm-link-txt{transition:transform .35s cubic-bezier(.23,1,.32,1)}
@media(hover:hover){.hm-link:hover .hm-link-txt{transform:translateX(4px)}}

/* ---------- hero ---------- */
.hm-hero{position:sticky;top:0;z-index:1;height:100vh;min-height:640px;overflow:hidden;background:#0c0c0c;color:#fff}
.hm-hero-bg{position:absolute;inset:0;z-index:0;transform-origin:50% 50%;transform:translateY(160px) scale(1.5);transition:transform 1.2s cubic-bezier(.05,.65,.22,.96) 1.15s}
.hm-hero-bg img,.hm-hero-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hm-hero-vid{opacity:0;transition:opacity .4s ease}
.hm-hero-vid.is-on{opacity:1}
.hm-hero-noise{position:absolute;inset:0;z-index:1;background-size:150px auto;background-repeat:repeat;pointer-events:none}
.hm-h1{position:static;font:inherit;margin:0}
.hm-l1,.hm-l2{position:absolute;z-index:2;display:block;font-family:var(--inter);font-weight:700;line-height:1;letter-spacing:-.06em;white-space:nowrap;color:#fff;mix-blend-mode:difference}
.hm-ov{mix-blend-mode:overlay;pointer-events:none}
.hm-ov::before{content:attr(data-t)}
.hm-l1{left:var(--pad);font-size:20.67vw;bottom:calc(122px + 1.8603vw)}
.hm-l2{right:var(--pad);font-size:10.624vw;bottom:calc(26px + 1.0624vw)}
.hm-tags{position:absolute;z-index:2;left:calc(57.01vw + 200px);bottom:calc(10px + 19.71vw);font:600 18px/28.8px var(--inter);letter-spacing:-.05em;color:#fff}
.hm-tagline{position:absolute;z-index:2;left:var(--pad);bottom:56px;width:372px;text-indent:48px}
/* intro: timings from the export's appear-animation table */
.hm-in1,.hm-in2,.hm-in3,.hm-in4{opacity:0;translate:0 -60px;transition:opacity .9s cubic-bezier(.16,1,.3,1),translate 1s cubic-bezier(.16,1,.3,1)}
.hm-in1{transition-delay:1.33s}
.hm-in3{transition-delay:1.35s}
.hm-in2{translate:0 -70px;transition-delay:1.7s}
.hm-in4{translate:0 -40px;transition-delay:1.8s}
.hm.hm-go .hm-hero-bg{transform:none}
.hm.hm-go .hm-in1,.hm.hm-go .hm-in2,.hm.hm-go .hm-in3,.hm.hm-go .hm-in4{opacity:1;translate:0 0}
.hm .hm-navwrap{opacity:0;translate:0 60px;transition:opacity .9s cubic-bezier(.16,1,.3,1) 1.75s,translate 1s cubic-bezier(.16,1,.3,1) 1.75s}
.hm.hm-go .hm-navwrap{opacity:1;translate:0 0}

/* ---------- numbers ---------- */
.hm-num{padding:160px 0 220px}
.hm-num-top{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;align-items:start}
.hm-num-h{grid-column:2 / span 3;max-width:840px}
.hm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:80px}
.hm-stat-num{font:600 90px/normal var(--inter);letter-spacing:-.07em;color:var(--ink);font-variant-numeric:tabular-nums}
.hm-stat-txt{margin-top:30px;padding-top:40px;border-top:1px solid rgb(214,214,214)}
.hm-stat-txt p{margin-top:8px;text-wrap:balance}

/* ---------- statement ---------- */
.hm-stmt{z-index:3;--line:rgb(229,229,229)}
.hm-stmt-top{position:relative;height:516px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--line);overflow:hidden}
.hm-stmt-img{position:absolute;top:0;left:50%;width:720px;height:516px;margin-left:-360px;z-index:1;will-change:transform}
.hm-stmt-img img{width:100%;height:100%;object-fit:cover}
.hm-stmt-h{position:relative;z-index:2;font:600 12.007vw/.94 var(--inter);letter-spacing:-.06em;color:#fff;text-align:center;mix-blend-mode:difference;white-space:nowrap;will-change:transform}
.hm-stmt-h span{display:block}
.hm-stmt-col{position:relative;width:720px;max-width:100%;margin:0 auto;padding:75px 0 210px;display:flex;flex-direction:column;align-items:center;gap:40px;border-left:1px solid var(--line);border-right:1px solid var(--line)}
.hm-stmt::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--line);z-index:1}
.hm-stmt-col .hm-wordmark{margin-left:12px}
.hm-stmt-sub{max-width:290px;text-align:center;--framer-text-alignment:center}
.hm-stmt-arrow{position:absolute;left:50%;bottom:-42px;z-index:5;width:84px;height:84px;margin-left:-42px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center}
.hm-stmt-arrow>span{width:66px;height:66px;border-radius:50%;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;transition:transform .3s cubic-bezier(.23,1,.32,1)}
.hm-stmt-arrow svg{width:22px;height:22px}
@media(hover:hover){.hm-stmt-arrow:hover>span{transform:scale(.92)}}

/* ---------- benefits ---------- */
.hm-ben{padding:200px 0 160px}
.hm-ben-h{text-align:center;--framer-text-alignment:center}
.hm-ben-sub{max-width:510px;margin:50px auto 0;text-align:center;--framer-text-alignment:center}
.hm-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin-top:90px}
.hm-card{position:relative;height:670px;overflow:hidden}
.hm-card-txt p,.hm-tweak>p{margin-top:12px}
.hm-care{background:#fff 0 0/856.5px auto repeat;border:1px solid rgba(0,0,0,.13);display:flex;flex-direction:column;justify-content:space-between;padding:39px 0 39px}
.hm-care-img{width:100%;height:260px;object-fit:cover}
.hm-care .hm-card-txt{padding:0 39px}
.hm-tweak{background:var(--grey);padding:40px}
.hm-tweak h3{max-width:200px}
.hm-tweak>p{max-width:247px}
.hm-avatars{display:flex;gap:2px;margin-top:30px}
.hm-avatars img{width:42px;height:42px;border-radius:50%;border:3px solid #fff;object-fit:cover;opacity:.3}
.hm-avatars img:first-child{opacity:1}
.hm-req{margin-top:18px;background:#fff;border-radius:16px;padding:28px 26px 28px 28px}
.hm-req-h{font:500 18px/25.2px var(--inter);letter-spacing:-.04em;color:var(--ink2)}
.hm-req-list{margin-top:20px;display:flex;flex-direction:column;gap:8px}
.hm-req-list li{display:flex;align-items:flex-start;gap:9px;font:500 14px/19.6px var(--inter);letter-spacing:-.04em;color:var(--ink)}
.hm-req-list s{color:rgba(11,11,12,.4)}
.hm-tick{flex:none;width:18px;height:18px;border-radius:50%;border:1px solid rgb(207,207,207);display:flex;align-items:center;justify-content:center;margin-top:1px}
.hm-req .is-done .hm-tick{border:0;background:var(--red);box-shadow:0 2px 6px rgba(248,68,45,.35)}
.hm-tick svg{width:8px;height:6px}
.hm-req-foot{display:flex;align-items:flex-start;gap:6px;margin-top:24px;padding-top:25px;border-top:1px solid rgba(0,0,0,.08);font:500 13px/18.2px var(--inter);letter-spacing:-.04em;color:#000}
.hm-req-cal{width:18px;height:18px;flex:none}
.hm-kit{background:var(--ink);text-align:center;--strong:#fff;display:flex;flex-direction:column;align-items:center;padding:80px 40px 60px}
.hm-kit-l{position:absolute;background:rgb(50,50,50);z-index:1}
.hm-kit-t{left:0;right:0;top:40px;height:1px}.hm-kit-b{left:0;right:0;bottom:40px;height:1px}
.hm-kit-lv{top:0;bottom:0;left:40px;width:1px}.hm-kit-rv{top:0;bottom:0;right:40px;width:1px}
.hm-kit>*:not(.hm-kit-l){position:relative;z-index:2}
.hm-kit-label{width:100%;--framer-text-alignment:center}
.hm-kit-icons{display:flex;gap:10px;margin-top:20px;color:#fff}
.hm-kit-icons svg{width:22px;height:22px}
.hm-kit-btn{position:relative;width:136px;height:136px;margin-top:86px;border-radius:50%;border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}
.hm-kit-dot{width:116px;height:116px;border-radius:50%;background:var(--red);box-shadow:0 12px 75.8px 12px rgba(248,68,45,.59);display:flex;align-items:center;justify-content:center}
.hm-kit-dot svg{width:34px;height:26px}
.hm-kit-count{position:absolute;top:16px;right:16px;width:24px;height:24px;border-radius:50%;background:#fff;color:var(--red);font:600 12px/24px var(--inter);letter-spacing:-.04em;text-align:center}
.hm-kit-txt{margin-top:auto;max-width:247px}
.hm-kit-txt p{margin-top:12px}
.hm-kit-txt h3,.hm-kit-txt p{--framer-text-alignment:center;text-align:center}
.hm-sup{background:var(--red)}
.hm-sup-face{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.hm-sup-tint{position:absolute;inset:0;z-index:1;background:var(--red);-webkit-mask-image:linear-gradient(rgba(0,0,0,0) 8.9%,rgba(0,0,0,.8) 100%);mask-image:linear-gradient(rgba(0,0,0,0) 8.9%,rgba(0,0,0,.8) 100%)}
.hm-sup-glass{position:absolute;z-index:1;left:50%;bottom:0;width:332px;height:544px;margin-left:-166px;border-radius:50px 50px 0 0;background:rgba(255,255,255,.24);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.hm-sup-phone{position:absolute;z-index:2;left:50%;bottom:0;width:345px;height:555px;margin-left:-172.5px;object-fit:cover}
.hm-sup-ui{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:65px}
.hm-sup-time{font:500 62px/68.2px var(--inter);letter-spacing:-.07em;color:#fff}
.hm-bubbles{position:relative;width:307px;margin-top:50px}
.hm-bubble{position:relative;z-index:1;display:flex;align-items:center;gap:15px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 4px 23px rgba(0,0,0,.09);text-align:left}
.hm-bubble img{width:45px;height:45px;border-radius:50%;object-fit:cover;flex:none}
.hm-bubble-top{display:flex;align-items:center;gap:10px;font:600 12px/16.8px var(--inter);letter-spacing:-.04em;color:var(--ink2)}
.hm-bubble-top span{font:500 11px/11px var(--inter);letter-spacing:-.04em;color:rgb(17,17,18);opacity:.4}
.hm-bubble-msg{margin-top:3px;max-width:215px;text-align:left;--framer-text-alignment:left;text-wrap:balance}
.hm-bubble-back{position:absolute;z-index:0;left:14px;right:13px;top:13px;height:88px;padding:0;box-shadow:0 4px 23px rgba(0,0,0,.09)}
.hm-sup-logo{display:flex;flex-direction:column;align-items:center;gap:20px;margin-top:90px}
.hm-sup-cap{font:500 14px/19.6px var(--inter);letter-spacing:-.04em;color:#fff;text-align:center}

/* ---------- work ---------- */
.hm-work{padding:0 0 160px}
.hm-work-head{position:sticky;top:160px;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center}
.hm-work-h{margin-top:10px;--framer-text-alignment:center}
.hm-work-h span{display:block}
.hm-year{margin-top:77px;--framer-text-alignment:center;line-height:1}
.hm-work-body{position:relative;z-index:2;margin-top:75px}
.hm-work-fade{position:absolute;inset:0;z-index:0;background:linear-gradient(rgba(255,255,255,0) 0%,#fff 20.46%,#fff 100%);pointer-events:none}
.hm-row{position:relative;z-index:1;display:flex}
.hm-row1{justify-content:space-between;align-items:flex-start;transform-origin:50% 0;will-change:transform,opacity}
.hm-row2{justify-content:center;margin-top:140px}
.hm-row3{justify-content:flex-start;margin-top:141px}
.hm-proj{display:block;flex:none}
/* proportions of the 1368px content row, so the layout scales like Framer's */
.hm-proj-a,.hm-proj-d{width:49.27%}
.hm-proj-b{width:32.53%}
.hm-proj-c{width:50%}
.hm-proj-img{position:relative;display:block;overflow:hidden;aspect-ratio:674 / 410;background:rgb(240,236,230)}
.hm-proj-b .hm-proj-img{aspect-ratio:445 / 271}
.hm-proj-c .hm-proj-img{aspect-ratio:684 / 416}
.hm-proj-img img{width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.23,1,.32,1)}
.hm-proj-corner{position:absolute;top:30px;right:30px}
.hm-proj h3{margin-top:36px}
.hm-proj p{margin-top:8px;text-wrap:balance}
.hm-tag{display:inline-block;margin-top:30px;padding:6px 13px;border:1px solid rgb(217,217,217);border-radius:50px;background:#fff;font:600 11px/14.3px var(--inter);letter-spacing:-.04em;text-transform:uppercase;color:var(--ink2)}
@media(hover:hover){.hm-proj:hover .hm-proj-img img{transform:scale(1.04)}}
.hm-all{position:relative;z-index:1;display:flex;align-items:center;gap:19px;width:max-content;margin:10px 10px 0 auto;font:500 55px/66px var(--inter);letter-spacing:-.07em;color:var(--ink2)}
.hm-all-ico{width:42px;height:42px;transition:transform .35s cubic-bezier(.23,1,.32,1)}
@media(hover:hover){.hm-all:hover .hm-all-ico{transform:translateX(6px)}}

/* ---------- services ---------- */
.hm-svc{background:var(--ink);color:#fff;padding:36px 0 180px}
.hm-svc-top{display:flex;justify-content:space-between;align-items:flex-start}
.hm-svc-top .hm-eyebrow{padding-top:0}
.hm-svc-body{display:grid;grid-template-columns:225px 1fr;column-gap:244px;margin-top:150px;align-items:start}
.hm-svc-panel{grid-row:1 / span 2}
.hm-svc-pic{position:relative;width:225px;height:162px;overflow:hidden}
.hm-svc-pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .45s ease}
.hm-svc-pic img.is-off{opacity:0}
.hm-svc-name{display:inline-block;margin-top:50px;opacity:.6;transition:opacity .2s}
.hm-svc-name:hover{opacity:1}
.hm-svc-desc{margin-top:16px;transition:opacity .25s ease}
.hm-svc-desc.is-fading{opacity:0}
.hm-svc-list{display:flex;flex-direction:column;gap:10px}
.hm-svc-row{display:flex;align-items:flex-start;gap:24px;width:100%;padding:10px 0 20px;border-bottom:1px solid rgb(50,50,50);text-align:left}
/* Shrinks only when the longest title plus its number would not fit the
   list column: "Video production" is 7.098em wide at this tracking. */
.hm-svc-t{display:block;font:500 min(102px,calc((100vw - 610px) / 7.098))/1.1 var(--inter);letter-spacing:-.07em;color:#fff;opacity:.15;transition:opacity .35s ease,transform .45s cubic-bezier(.23,1,.32,1)}
.hm-svc-n{font:700 16px/19.2px var(--inter);letter-spacing:-.05em;color:rgba(255,255,255,.4);display:flex;gap:4px;transition:font-size .3s}
.hm-svc-n b{font-weight:700;color:rgba(255,255,255,.2)}
.hm-svc-row.is-on .hm-svc-t{opacity:1;transform:translateX(16px)}
.hm-svc-row.is-on .hm-svc-n{font-size:20px;line-height:24px;color:#fff;transform:translateX(16px)}
.hm-svc-row.is-on .hm-svc-n b{color:var(--red)}
.hm-svc-row:focus-visible{outline:2px solid var(--red);outline-offset:4px}
.hm-svc-cta{grid-column:2;margin-top:75px;color:#fff;justify-self:start}

/* ---------- quote ---------- */
.hm-quote{z-index:1;padding:160px 0}
.hm-quote-grid{display:grid;grid-template-columns:332px 1fr;column-gap:151px;align-items:start}
.hm-quote-img{position:relative;height:721px;overflow:hidden}
.hm-quote-img img{width:100%;height:100%;object-fit:cover}
.hm-quote-body{padding-top:50px}
.hm-quote-marks{position:absolute;width:40px;height:25px;margin-top:9px;color:var(--red);fill:var(--red)}
.hm-quote-marks path{fill:var(--red)}
.hm-quote-text{font:500 54px/1.2 var(--inter);letter-spacing:-.07em;color:var(--ink2);text-indent:180px}
.hm-quote-text span{display:inline-block;text-indent:0;opacity:0;translate:0 7px;transition:opacity .5s ease var(--d),translate .6s cubic-bezier(.16,1,.3,1) var(--d)}
.hm-quote-text.in span{opacity:1;translate:0 0}
.hm-quote-sub{max-width:740px;margin-top:40px}
.hm-quote-by{margin-top:50px;padding-top:50px;border-top:1px solid rgba(0,0,0,.12)}

/* ---------- pricing ---------- */
.hm-price-sec{padding:170px 0 0}
.hm-price-h{text-align:center;--framer-text-alignment:center}
.hm-price-sub{max-width:510px;margin:50px auto 0;text-align:center;--framer-text-alignment:center}
.hm-toggle{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:50px}
.hm-tg-l{--framer-text-color:rgba(12,12,12,.6);transition:color .25s}
.hm-price-sec[data-tier="0"] .hm-tg-l[data-for="0"],.hm-price-sec[data-tier="1"] .hm-tg-l[data-for="1"]{--framer-text-color:rgb(12,12,12)}
.hm-save{width:20px;height:10px;margin-left:4px;border-radius:50px;background:rgba(249,69,45,.08)}
.hm-switch{position:relative;width:78px;height:44px;border-radius:50px;background:var(--red)}
.hm-switch span{position:absolute;top:5px;left:5px;width:34px;height:34px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12);transition:transform .45s cubic-bezier(.23,1,.32,1)}
.hm-price-sec[data-tier="1"] .hm-switch span{transform:translateX(34px)}
.hm-switch:focus-visible{outline:2px solid var(--ink);outline-offset:3px}
.hm-plans{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;align-items:start;margin-top:50px;padding:50px;background:var(--grey)}
.hm-plan{position:relative;padding:50px;background:var(--grey)}
.hm-plan.is-featured{background:#fff}
.hm-plan-name{display:flex;align-items:center;gap:12px}
.hm-badge{display:inline-flex;align-items:center;gap:6px;height:27px;padding:0 10px;border-radius:50px;background:rgba(249,69,45,.08);color:var(--red);font:600 12px/16.8px var(--inter);letter-spacing:-.04em}
.hm-badge svg{width:17px;height:17px}
.hm-badge-dark{background:var(--ink);color:#fff}
.hm-price{margin-top:40px;height:46px;overflow:hidden;font:600 42px/46.2px var(--inter);letter-spacing:-.07em;color:var(--ink2)}
.hm-roll{display:flex;flex-direction:column;transition:transform .55s cubic-bezier(.23,1,.32,1)}
.hm-roll span{display:block;height:46px}
.hm-price-sec[data-tier="1"] .hm-roll{transform:translateY(-46px)}
.hm-plan-blurb{margin-top:24px;max-width:264px;min-height:42px}
.hm-price-sec[data-tier="0"] [data-tier="1"]:not(.hm-roll span),.hm-price-sec[data-tier="1"] [data-tier="0"]:not(.hm-roll span){display:none}
.hm-plan-cta{display:flex;align-items:center;justify-content:center;gap:12px;height:68px;margin-top:39px;border-radius:50px;background:#fff;font:600 20px/26px var(--inter);letter-spacing:-.05em;color:var(--ink);transition:filter .2s,transform .18s}
.hm-plan-cta svg{width:23px;height:23px;color:var(--red)}
.is-featured .hm-plan-cta{background:var(--red);color:#fff}
.is-featured .hm-plan-cta svg{color:#fff}
@media(hover:hover){.hm-plan-cta:hover{filter:brightness(.97)}.is-featured .hm-plan-cta:hover{filter:brightness(1.06)}}
.hm-plan-cta:active{transform:scale(.98)}
.hm-plan-inc{margin-top:40px}
.hm-feat{margin-top:22px;display:flex;flex-direction:column;gap:12px}
.hm-feat li{display:flex;align-items:flex-start;gap:12px}
.hm-feat .hm-corner{margin-top:5px}

/* ---------- process ---------- */
/* the display preset centres by default; these three headings sit left */
.hm-proc-intro h2,.hm-faq-intro h2,.hm-contact-h{text-align:left}
.hm-proc{padding:160px 0 0}
.hm-proc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}
.hm-proc-sub{max-width:510px;margin-top:50px}
.hm-proc-cta{margin-top:69px}
.hm-steps{display:flex;flex-direction:column;gap:50px}
.hm-step{position:relative;display:flex;align-items:flex-start;gap:16px;padding-top:40px;border-top:1px solid rgb(222,222,222)}
.hm-step-n{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid rgb(222,222,222);background:#fff;display:flex;align-items:center;justify-content:center;font:600 14px/19.6px var(--inter);letter-spacing:-.04em;color:var(--ink2)}
.hm-step p{margin-top:12px}
.hm-step-corner{position:absolute;top:30px;right:0}

/* ---------- faq ---------- */
.hm-faq{z-index:4;padding:160px 0 0}
.hm-faq-grid{display:grid;grid-template-columns:337px 1fr;column-gap:20px;align-items:start}
.hm-faq-sub{margin-top:50px}
.hm-faq-cta{margin-top:70px}
.hm-qa{border-bottom:1px solid rgb(222,222,222)}
.hm-qa:first-child{margin-top:0}
.hm-qa summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:34px 0}
.hm-qa summary::-webkit-details-marker{display:none}
.hm-qa summary h3,.hm-contact-body{text-wrap:balance}
.hm-qa-ico{width:18px;height:18px;flex:none;color:var(--red);transition:transform .35s cubic-bezier(.23,1,.32,1)}
.hm-qa[open] .hm-qa-ico{transform:rotate(45deg)}
.hm-qa-a{padding:0 60px 34px 0;margin-top:-14px}
.hm-qa summary:focus-visible{outline:2px solid var(--red);outline-offset:4px}

/* ---------- contact ---------- */
.hm-contact{background:var(--ink);color:#fff;padding:160px 0 159px;overflow:hidden}
.hm-contact-bg{position:absolute;left:0;right:0;top:-60px;bottom:0;opacity:.12;z-index:0;will-change:transform}
.hm-contact-bg img{width:100%;height:100%;object-fit:cover}
.hm-contact .hm-wrap{position:relative;z-index:1}
.hm-contact-label{position:absolute;top:36px;right:var(--pad);z-index:1}
.hm-contact-grid{display:grid;grid-template-columns:560px 1fr;column-gap:22px;margin-top:60px;align-items:start}
.hm-form{position:relative;display:flex;flex-direction:column}
.hm-field{display:block;position:relative;border-bottom:1px solid rgba(255,255,255,.3)}
.hm-field+.hm-field{margin-top:34px}
.hm-field input,.hm-field textarea{display:block;width:100%;background:none;border:0;outline:0;padding:0 0 18px;color:#fff;font:500 20px/28px var(--inter);letter-spacing:-.04em;resize:none;border-radius:0}
.hm-field input{height:46px}
.hm-field textarea{height:46px;min-height:46px;overflow:hidden}
.hm-field ::placeholder{color:rgba(255,255,255,.5);opacity:1}
.hm-field:focus-within{border-bottom-color:rgba(255,255,255,.8)}
.hm-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.hm-submit{display:inline-flex;align-items:center;gap:12px;margin-top:80px;align-self:flex-start;color:#fff}
.hm-submit[disabled]{opacity:.6;cursor:wait}
.hm-form-msg{position:absolute;left:0;right:0;top:100%;margin-top:16px;font:500 15px/21px var(--inter);color:rgba(255,255,255,.8);min-height:21px}

/* ---------- footer ---------- */
.hm .svc-footer{position:relative;z-index:2;margin-top:0;background:#fff}
.hm .svc-footer>div{transform:none!important}

/* reveal: Framer's appear is a fade and a rise */
.hm [data-reveal]{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.215,.61,.355,1),transform .8s cubic-bezier(.215,.61,.355,1)}
.hm [data-reveal].in{opacity:1;transform:none}

/* ================= tablet: 810 - 1199 ================= */
@media(max-width:1199px){
  .hm{--pad:32px}
  .hm-hero{height:872px;min-height:0}
  .hm-l1{font-size:23.79vw;bottom:calc(220px + 2.141vw)}
  .hm-l2{left:var(--pad);right:auto;font-size:calc((100vw - 64px) / 6.079);bottom:calc(93px + (100vw - 64px) / 60.79)}
  .hm-tags{left:auto;right:var(--pad);bottom:calc(106px + 22.69vw);text-align:right}
  .hm-tagline{bottom:39px;width:400px}
  .hm-num{padding:120px 0 120px}
  .hm-stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 20px;margin-top:70px}
  .hm-stat-num{font-size:66px}
  .hm-stat-txt{margin-top:24px;padding-top:32px}
  .hm-stat-txt p{margin-top:6px}
  .hm-stmt-top{height:367px}
  .hm-stmt-img{width:512px;height:367px;margin-left:-256px}
  .hm-stmt-col{width:512px;padding:80px 0 129px}
  .hm-ben{padding:130px 0 120px}
  .hm-ben-sub{margin-top:40px}
  .hm-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:21px 20px;margin-top:69px}
  .hm-card{height:561px}
  .hm-care{padding:39px 0 33px}
  .hm-care-img{height:374px}
  .hm-care .hm-card-txt{padding:0 33px}
  .hm-tweak{padding:34px}
  .hm-tweak h3{max-width:180px}
  .hm-tweak>p{max-width:none}
  .hm-kit{padding:70px 34px 60px}
  .hm-kit-l.hm-kit-t{top:34px}.hm-kit-l.hm-kit-b{bottom:34px}.hm-kit-lv{left:34px}.hm-kit-rv{right:34px}
  .hm-kit-icons{margin-top:19px}
  .hm-kit-btn{margin-top:70px}
  .hm-kit-txt{max-width:none}
  .hm-sup-glass{width:316px;height:518px;margin-left:-158px}
  .hm-sup-phone{width:330px;height:531px;margin-left:-165px}
  .hm-sup-ui{padding-bottom:55px}
  .hm-bubbles{width:374px;margin-top:40px}
  .hm-bubble-back{left:18px;right:16px;top:2px}
  .hm-bubble-msg{max-width:none}
  .hm-sup-logo{margin-top:70px}
  .hm-work{padding:0 0 119px}
  .hm-work-h{margin-top:11px}
  .hm-year{margin-top:50px}
  .hm-work-body{margin-top:70px}
  .hm-proj-a{width:48.85%}
  .hm-proj-b{width:36.15%}
  .hm-proj-b .hm-proj-img{aspect-ratio:347 / 211}
  .hm-proj-a .hm-proj-img,.hm-proj-d .hm-proj-img{aspect-ratio:469 / 285}
  .hm-proj-c{width:100%;max-width:none}
  .hm-proj-d{width:48.96%}
  .hm-proj h3{margin-top:37px}
  .hm-tag{margin-top:29px}
  .hm-row2{margin-top:79px}
  .hm-row3{margin-top:81px}
  .hm-all{margin:82px auto 0 0;font-size:48px;line-height:58px;gap:15px}
  .hm-svc{padding:36px 0 120px}
  .hm-svc-body{grid-template-columns:188px 1fr;column-gap:67px;margin-top:60px}
  .hm-svc-pic{width:188px;height:136px}
  .hm-svc-name{margin-top:49px}
  .hm-svc-row{padding:12px 0 26px}
  .hm-svc-t{font-size:min(72px,calc((100vw - 389px) / 7.098))}
  .hm-svc-n,.hm-svc-row.is-on .hm-svc-n{font-size:14px;line-height:16.8px}
  .hm-svc-row.is-on .hm-svc-t,.hm-svc-row.is-on .hm-svc-n{transform:none}
  .hm-svc-cta{margin-top:79px}
  .hm-quote{padding:120px 0}
  .hm-quote-grid{grid-template-columns:293px 1fr;column-gap:80px}
  .hm-quote-img{height:443px}
  .hm-quote-body{padding-top:0}
  .hm-quote-text{font-size:36px;text-indent:121px}
  .hm-quote-by{margin-top:29px;padding-top:30px}
  .hm-price-sec{padding-top:120px}
  .hm-price-sub{margin-top:40px}
  .hm-toggle{margin-top:39px}
  .hm-plans{grid-template-columns:1fr;padding:26px}
  .hm-plan{padding:46px}
  .hm-price{margin-top:30px}
  .hm-plan-blurb{margin-top:16px}
  .hm-plan-cta{margin-top:30px}
  .hm-plan-inc{margin-top:30px}
  .hm-proc{padding-top:120px}
  .hm-proc-sub{margin-top:40px}
  .hm-proc-cta{margin-top:70px}
  .hm-steps{gap:40px}
  .hm-faq{padding-top:120px}
  .hm-faq-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hm-faq-sub{margin-top:40px;max-width:350px}
  .hm-faq-cta{margin-top:69px}
  .hm-qa summary{padding:24px 0}
  .hm-qa-a{padding:0 40px 24px 0;margin-top:-8px}
  .hm-contact{padding:120px 0 120px}
  .hm-contact-label{top:32px}
  .hm-contact-grid{grid-template-columns:minmax(0,353fr) minmax(0,548fr);column-gap:59px;margin-top:70px}
  .hm-field+.hm-field{margin-top:30px}
  .hm-field input,.hm-field textarea{font-size:18px;line-height:25.2px}
  .hm-submit{margin-top:70px}
}

/* ================= phone: <= 809 ================= */
@media(max-width:809px){
  .hm{--pad:24px}
  .hm-hero{height:651px}
  .hm-hero-img{object-position:59.6% 50%}
  .hm-hero-vid{display:none}
  .hm-l1{left:var(--pad);font-size:calc((100vw - 48px) / 2.758);bottom:calc(153px + (100vw - 48px) * .03263)}
  .hm-l2{left:var(--pad);font-size:calc((100vw - 48px) / 6.079);bottom:calc(108px + (100vw - 48px) / 60.79)}
  .hm-tags{top:208px;bottom:auto;right:var(--pad)}
  .hm-tagline{bottom:34px;width:auto;right:var(--pad)}
  /* the arrow links become full-width red pills */
  .hm-link{display:flex;justify-content:center;width:100%;height:63px;border-radius:100px;background:var(--red);color:#fff}
  .hm-link .hm-link-ico{width:21px;height:21px;color:#fff}
  .hm-num{padding:50px 0 50px}
  .hm-num-top{display:flex;flex-direction:column-reverse;gap:26px}
  .hm-br{display:none}
  .hm-stats{grid-template-columns:1fr;gap:35px;margin-top:32px}
  .hm-stat{height:150px}
  .hm-stat:last-child{height:auto}
  .hm-stat-num{font-size:44px}
  .hm-stat-txt{margin-top:20px;padding-top:24px}
  .hm-stmt-top{height:279px}
  .hm-stmt-img{left:0;width:100%;height:279px;margin-left:0}
  .hm-stmt-h{font-size:12.594vw;line-height:1}
  .hm-stmt-col{width:100%;padding:40px 24px 90px;border:0}
  .hm-stmt-sub{max-width:268px}
  .hm-wordmark{font-size:40px}
  .hm-stmt-arrow{width:66px;height:66px;margin-left:-33px;bottom:-33px}
  .hm-stmt-arrow>span{width:52px;height:52px}
  .hm-stmt-arrow svg{width:18px;height:18px}
  .hm-ben{padding:90px 0 60px}
  .hm-ben-h{max-width:270px;margin:0 auto}
  .hm-ben-sub{margin-top:20px}
  .hm-cards{grid-template-columns:1fr;gap:20px;margin-top:32px}
  .hm-care{height:439px;padding:39px 0 29px}
  .hm-care-img{height:272px}
  .hm-care .hm-card-txt{padding:0 29px}
  .hm-tweak{height:550px;padding:30px}
  .hm-tweak h3{max-width:150px}
  .hm-kit{height:520px;padding:60px 24px 49px}
  .hm-kit-l.hm-kit-t{top:24px}.hm-kit-l.hm-kit-b{bottom:24px}.hm-kit-lv{left:24px}.hm-kit-rv{right:24px}
  .hm-kit-btn{margin-top:60px}
  .hm-sup{height:522px}
  .hm-sup-glass{width:288px;height:470px;margin-left:-144px}
  .hm-sup-phone{width:298px;height:480px;margin-left:-149px}
  .hm-sup-ui{padding-bottom:55px}
  .hm-sup-time{font-size:62px}
  .hm-bubbles{width:325px;margin-top:36px}
  .hm-bubble-back{left:15px;right:14px;top:10px}
  .hm-bubble-msg{max-width:215px}
  .hm-avatars{margin-top:24px}
  .hm-sup-logo{margin-top:60px}
  .hm-req{margin-top:16px}
  .hm-req-foot{margin-top:18px;padding-top:19px}
  .hm-sup-logo .hm-wordmark{font-size:46px}
  .hm-work{padding:0 0 50px}
  .hm-work-head{position:relative;top:0}
  .hm-work-h{margin-top:18px}
  .hm-year{margin-top:28px}
  .hm-work-body{margin-top:34px}
  .hm-work-fade{display:none}
  .hm-row{flex-direction:column;gap:40px}
  .hm-row1{transform:none!important;opacity:1!important}
  .hm-row2{margin-top:43px}
  .hm-row3{margin-top:44px}
  .hm-proj-a,.hm-proj-b,.hm-proj-c,.hm-proj-d{width:100%;max-width:none}
  .hm-proj .hm-proj-img,.hm-proj-b .hm-proj-img,.hm-proj-c .hm-proj-img{aspect-ratio:342 / 208}
  .hm-proj h3{margin-top:30px}
  .hm-proj p{margin-top:6px}
  .hm-tag{margin-top:24px;padding:5px 9px;font-size:10px;line-height:13px}
  .hm-all{font-size:30px;line-height:36px;gap:10px;margin:80px 8px 0 auto}
  .hm-all-ico{width:28px;height:28px}
  .hm-svc{padding:36px 0 50px}
  .hm-svc-body{display:flex;flex-direction:column;align-items:stretch;margin-top:70px}
  .hm-svc-list{order:1;gap:0}
  .hm-svc-panel{order:2;margin-top:28px}
  .hm-svc-cta{order:3;margin-top:40px}
  .hm-svc-pic{width:100%;height:190px}
  .hm-svc-name{margin-top:32px}
  .hm-svc-desc{margin-top:10px}
  .hm-svc-row{padding:0 0 25.5px;gap:12px}
  .hm-svc-t{font-size:35px;line-height:38.5px}
  .hm-svc-n{font-size:14px;line-height:16.8px}
  .hm-svc-row.is-on .hm-svc-t,.hm-svc-row.is-on .hm-svc-n{transform:none}
  .hm-svc-row.is-on .hm-svc-n{font-size:14px;line-height:16.8px}
  .hm-quote{padding:60px 0}
  .hm-quote-grid{display:flex;flex-direction:column-reverse;gap:40px}
  .hm-quote-img{width:100%;height:464px}
  .hm-quote-body{padding-top:0}
  .hm-quote-marks{margin-top:4px;width:37px;height:23px}
  .hm-quote-text{font-size:28px;text-indent:94px}
  .hm-quote-sub{margin-top:28px}
  .hm-quote-by{margin-top:30px;padding-top:30px}
  .hm-price-sec{padding-top:60px}
  .hm-price-h{max-width:270px;margin:0 auto}
  .hm-price-sub{margin-top:20px}
  .hm-toggle{margin-top:32px}
  .hm-plans{margin-top:34px;padding:10px;gap:20px}
  .hm-plan{padding:34px}
  .hm-price{margin-top:26px}
  .hm-plan-blurb{margin-top:16px}
  .hm-plan-cta{height:63px;margin-top:30px;font-size:18px;line-height:23.4px}
  .hm-plan-inc{margin-top:28px}
  .hm-proc{padding-top:50px}
  .hm-proc-grid{display:flex;flex-direction:column;gap:50px}
  .hm-proc-sub{margin-top:20px}
  .hm-proc-cta{margin-top:34px}
  .hm-steps{gap:34px}
  .hm-step{padding-top:30px}
  .hm-step-corner{top:30px}
  .hm-faq{padding-top:50px}
  .hm-faq-grid{display:flex;flex-direction:column;gap:20px}
  .hm-faq-sub{margin-top:20px}
  .hm-faq-cta{margin-top:30px}
  .hm-qa summary{padding:24px 0}
  .hm-qa-a{padding:0 30px 24px 0;margin-top:-8px}
  .hm-contact{padding:80px 0 50px}
  .hm-contact-label{top:24px}
  .hm-contact-grid{display:flex;flex-direction:column;align-items:stretch;gap:139px;margin-top:30px}
  .hm-field input,.hm-field textarea{font-size:16px;line-height:22.4px}
  .hm-field+.hm-field{margin-top:28px}
  .hm-submit{margin-top:40px}
}
@media(prefers-reduced-motion:reduce){
  .hm-hero-bg,.hm-in1,.hm-in2,.hm-in3,.hm-in4,.hm .hm-navwrap,.hm [data-reveal],.hm-quote-text span{transition:none!important;transform:none!important;translate:none!important;opacity:1!important}
}
</style>
<noscript><style>.hm [data-reveal],.hm-in1,.hm-in2,.hm-in3,.hm-in4,.hm .hm-navwrap,.hm-quote-text span{opacity:1!important;transform:none!important;translate:none!important}.hm-hero-bg{transform:none!important}</style></noscript>`;

/* Framer's stylesheet sets margin-top on every .framer-text that is not a
   first child (p.framer-text:not(:first-child), specificity 0,2,1). Section
   rules here are written as plain classes, so prefix them with ".hm main" to
   tie that specificity; this block comes later, so it wins. Selectors that
   target the root (.hm ..., .hm.hm-go ...) or use :where() are left alone. */
function scope(css) {
  const splitTop = (sel) => { const parts = []; let depth = 0, cur = ''; for (const ch of sel) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ',' && !depth) { parts.push(cur); cur = ''; } else cur += ch; } parts.push(cur); return parts; };
  const fix = (sel) => splitTop(sel).map((x) => { const y = x.trim(); return /^(\.hm[\s.:\[{]|\.hm$|:where|html|body)/.test(y) ? y : '.hm main ' + y; }).join(',');
  const walk = (src) => {
    let out = '', j = 0;
    while (j < src.length) {
      const open = src.indexOf('{', j);
      if (open < 0) { out += src.slice(j); break; }
      const head = src.slice(j, open).trim();
      let depth = 1, k = open + 1;
      while (k < src.length && depth) { if (src[k] === '{') depth++; else if (src[k] === '}') depth--; k++; }
      const body = src.slice(open + 1, k - 1);
      if (/^@(media|supports)/.test(head)) out += head + '{' + walk(body) + '}';
      else if (head.startsWith('@')) out += head + '{' + body + '}';
      else out += fix(head) + '{' + body + '}';
      j = k;
    }
    return out;
  };
  const m = css.match(/^<style>([\s\S]*?)<\/style>([\s\S]*)$/);
  return '<style>' + walk(m[1].replace(/\/\*[\s\S]*?\*\//g, '')) + '</style>' + m[2];
}

/* ------------------------------------------------------------------- script */

const HOME_JS = `<script>
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.querySelector('.hm');
  /* hero intro - one frame after load so the start state paints first */
  function go(){ root.classList.add('hm-go'); }
  if (reduce) go(); else setTimeout(go, 30);

  /* hero video: desktop and tablet only, as on the Framer page */
  var vid = document.querySelector('.hm-hero-vid');
  if (vid && window.innerWidth >= 810) {
    vid.src = vid.getAttribute('data-src');
    vid.addEventListener('canplay', function(){ vid.classList.add('is-on'); vid.play && vid.play().catch(function(){}); }, { once: true });
    vid.load();
  }

  /* counters */
  function count(el){
    var to = parseFloat(el.getAttribute('data-count')), dec = +el.getAttribute('data-dec') || 0, t0 = null, dur = 1600;
    if (reduce) return;
    function step(t){ if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); var e = 1 - Math.pow(1 - p, 3); el.textContent = (to * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); }
    el.textContent = (0).toFixed(dec); requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } }); }, { threshold: .6 });
    nums.forEach(function(n){ cio.observe(n); });
    var q = document.querySelector('[data-words]');
    if (q) { var qio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { q.classList.add('in'); qio.disconnect(); } }); }, { threshold: .35 }); qio.observe(q); }
  } else { var qq = document.querySelector('[data-words]'); if (qq) qq.classList.add('in'); }

  /* scroll-linked motion, measured off the Framer page */
  var sl = { stmtImg: document.querySelector('[data-sl="stmtImg"]'), stmtTxt: document.querySelector('[data-sl="stmtTxt"]'), workRow: document.querySelector('[data-sl="workRow"]'), contactBg: document.querySelector('[data-sl="contactBg"]') };
  var stmt = document.querySelector('.hm-stmt');
  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function frame(){
    var vh = window.innerHeight;
    if (stmt && sl.stmtImg) {
      var top = stmt.getBoundingClientRect().top;          // section top in the viewport
      var p = clamp((vh - top) / (vh + 33));
      sl.stmtImg.style.transform = 'translateY(' + (160 * (1 - p)).toFixed(1) + 'px)';
      sl.stmtTxt.style.transform = 'scale(' + (1 + .3 * (1 - p)).toFixed(4) + ')';
    }
    if (sl.workRow && window.innerWidth >= 810) {
      /* measured off the untransformed parent, so the row's own transform
         does not feed back into its progress */
      var rt = sl.workRow.parentNode.getBoundingClientRect().top;
      var q = clamp((vh - rt) / (vh - 330));
      sl.workRow.style.opacity = q.toFixed(3);
      sl.workRow.style.transform = 'translateY(' + (250 * (1 - q)).toFixed(1) + 'px) scale(' + (.8 + .2 * q).toFixed(4) + ')';
    }
    if (sl.contactBg) {
      var cb = sl.contactBg.parentNode.getBoundingClientRect();
      var r = clamp((vh - cb.top) / (vh + cb.height));
      sl.contactBg.style.transform = 'translateY(' + (60 * r).toFixed(1) + 'px)';
    }
  }
  var ticking = false;
  function onScroll(){ if (!ticking) { ticking = true; requestAnimationFrame(function(){ ticking = false; frame(); }); } }
  if (!reduce) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); frame(); }

  /* services: hover or tap a row to swap the panel */
  var rows = document.querySelectorAll('.hm-svc-row');
  var pics = document.querySelectorAll('.hm-svc-pic img');
  var name = document.querySelector('.hm-svc-name'), desc = document.querySelector('.hm-svc-desc');
  var cur = 0;
  function pick(i){
    if (i === cur) return; cur = i;
    rows.forEach(function(r, k){ r.classList.toggle('is-on', k === i); r.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    pics.forEach(function(im, k){ im.classList.toggle('is-off', k !== i); });
    var row = rows[i];
    desc.classList.add('is-fading');
    setTimeout(function(){ desc.textContent = row.getAttribute('data-body'); name.textContent = row.querySelector('.hm-svc-t').textContent; name.setAttribute('href', row.getAttribute('data-href')); desc.classList.remove('is-fading'); }, 180);
  }
  rows.forEach(function(r){
    var i = +r.getAttribute('data-i');
    r.addEventListener('mouseenter', function(){ pick(i); });
    r.addEventListener('focus', function(){ pick(i); });
    r.addEventListener('click', function(){ pick(i); });
  });

  /* pricing toggle */
  var ps = document.querySelector('.hm-price-sec'), sw = document.querySelector('.hm-switch');
  function tier(t){ ps.setAttribute('data-tier', t); sw.setAttribute('aria-checked', t === '1' ? 'true' : 'false'); }
  if (sw) {
    sw.addEventListener('click', function(){ tier(ps.getAttribute('data-tier') === '1' ? '0' : '1'); });
    document.querySelectorAll('.hm-tg-l').forEach(function(l){ l.style.cursor = 'pointer'; l.addEventListener('click', function(){ tier(l.getAttribute('data-for')); }); });
  }

  /* footer newsletter: the Framer original posted to Framer's form service,
     which nobody can read now. Send the address to the same inbox instead. */
  var nl = document.querySelector('.svc-footer form');
  if (nl) nl.addEventListener('submit', function(e){
    e.preventDefault();
    var inp = nl.querySelector('input[name="E-mail"]'), v = (inp.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { inp.value = ''; inp.placeholder = 'Enter a valid email'; inp.focus(); return; }
    inp.disabled = true;
    fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Newsletter signup', email: v, phone: '', plan: '', message: 'Newsletter signup from the homepage footer.' }) })
      .then(function(r){ if (!r.ok) throw 0; inp.value = ''; inp.placeholder = 'Thanks - you are on the list'; })
      .catch(function(){ inp.placeholder = 'That did not go through - try again'; })
      .then(function(){ inp.disabled = false; });
  });

  /* contact form - posts the same JSON the Framer form hook sent */
  var form = document.querySelector('.hm-form');
  if (form) {
    var msg = form.querySelector('.hm-form-msg'), btn = form.querySelector('.hm-submit'), label = btn.querySelector('span');
    var ta = form.querySelector('textarea');
    if (ta) ta.addEventListener('input', function(){ ta.style.height = '46px'; ta.style.height = Math.max(46, ta.scrollHeight) + 'px'; });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var f = form.elements, name = f['Name'].value.trim(), email = f['E-mail'].value.trim();
      if (!name || !email || !/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) { msg.textContent = 'Please add your name and a valid email.'; return; }
      if (f['website'].value) { msg.textContent = 'Thanks - we will be in touch within one business day.'; form.reset(); return; }
      btn.disabled = true; var old = label.textContent; label.textContent = 'Sending...'; msg.textContent = '';
      fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, email: email, phone: '', plan: '', message: f['Message'].value.trim() }) })
        .then(function(r){ return r.json().then(function(j){ if (!r.ok) throw new Error(j.error || r.status); }); })
        .then(function(){ label.textContent = 'Sent!'; msg.textContent = 'Thanks - we will be in touch within one business day.'; form.reset(); })
        .catch(function(){ label.textContent = old; msg.textContent = 'That did not send. Email us at ${EMAIL} instead.'; })
        .then(function(){ btn.disabled = false; setTimeout(function(){ label.textContent = old; }, 4000); });
    });
  }
})();
</script>`;

/* ------------------------------------------------------------------- schema */

function schemas(url) {
  const founders = TEAM.map((m) => ({ '@type': 'Person', name: m.name, jobTitle: m.role, sameAs: m.links.map((l) => l.href) }));
  const offer = (name, description) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description, provider: { '@type': 'Organization', name: 'TheBrandle' } } });
  return [
    {
      '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'TheBrandle', url: SITE,
      logo: `${SITE}/framerusercontent.com/images/0qZrfBuw0vpXfqa4iQEyDlGqjU.png`,
      image: `${SITE}/framerusercontent.com/images/0qZrfBuw0vpXfqa4iQEyDlGqjU.png`,
      description: 'TheBrandle is a Dubai branding, UI/UX and web design studio. Websites on Framer, Webflow, Shopify and WordPress, brand identities, app design and video production, built in-house.',
      founder: founders, email: EMAIL, telephone: '+971561429789', areaServed: 'Worldwide',
      priceRange: '$799-$3,799',
      serviceType: ['Branding', 'UI/UX Design', 'Web Design', 'Landing Page Design', 'App Design', 'Motion Design', 'Video Production', 'Framer Development', 'Webflow Development', 'WordPress Development', 'Wix Development'],
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Design and development services', itemListElement: [
        offer('Brand Identity Design', 'Logos, brand systems, typography, color palettes and full brand guidelines for founders and growing businesses.'),
        offer('UI/UX Design', 'User research, wireframes, prototypes and high-fidelity interface design for websites and apps.'),
        offer('Web Design and Development', 'Custom website design and development on Framer, Webflow, WordPress, Wix and bespoke HTML. Platform migrations included.'),
        offer('Landing Page Design', 'High-conversion landing pages for product launches, lead generation and marketing campaigns.'),
        offer('App Design', 'Mobile and web app interface design with full UI kits, interactive prototypes and developer-ready specs.'),
        offer('Motion Design', 'Micro-interactions, brand motion, animated assets and product demos for digital experiences.'),
        offer('Video Production', 'Event films, founder interviews and brand content shot in Dubai and cut for social and the web.'),
      ] },
      sameAs: ['https://www.instagram.com/thebrandlestudio'],
    },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: D.faq.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'TheBrandle', url: SITE + '/' },
  ];
}

/* ------------------------------------------------------------- css pruning */

/* The carved Framer stylesheet is ~400KB and this page uses a fraction of it.
   Keep a rule when every class and id its selector names appears in the page;
   keep @font-face for the families the kept rules use; drop empty @media. */
function prune(css, html) {
  const used = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).forEach((c) => c && used.add('.' + c));
  for (const m of html.matchAll(/id="([^"]*)"/g)) used.add('#' + m[1]);
  // classes the scripts add at runtime
  ['in', 'is-on', 'is-off', 'is-fading', 'hm-go', 'bm-open', 'bm-closing', 'framer-v-185cz0f', 'framer-v-7tbwy4', 'framer-v-m5ha19', 'framer-v-19vil5u'].forEach((c) => used.add('.' + c));
  const keepSel = (sel) => sel.split(',').some((s) => {
    const toks = s.replace(/::?[a-z-]+(\([^)]*\))?/g, '').match(/[.#][A-Za-z0-9_-]+/g) || [];
    return toks.every((t) => used.has(t));
  });
  const out = [];
  const families = new Set();
  let i = 0;
  const walk = (src) => {
    let res = '';
    let j = 0;
    while (j < src.length) {
      const open = src.indexOf('{', j);
      if (open < 0) break;
      const head = src.slice(j, open).trim();
      // find the matching close brace
      let depth = 1, k = open + 1;
      while (k < src.length && depth) { if (src[k] === '{') depth++; else if (src[k] === '}') depth--; k++; }
      const body = src.slice(open + 1, k - 1);
      if (head.startsWith('@media') || head.startsWith('@supports')) {
        const inner = walk(body);
        if (inner.trim()) res += head + '{' + inner + '}';
      } else if (head.startsWith('@font-face')) {
        res += '\u0000FF' + head + '{' + body + '}\u0000';
      } else if (head.startsWith('@keyframes') || head.startsWith('@-webkit-keyframes')) {
        res += head + '{' + body + '}';
      } else if (head.startsWith('@')) {
        res += head + '{' + body + '}';
      } else if (keepSel(head)) {
        res += head + '{' + body + '}';
        for (const f of body.matchAll(/font-family:\s*([^;]+)/g)) families.add(f[1].split(',')[0].replace(/["']/g, '').trim());
        for (const f of body.matchAll(/--framer-font-family[a-z-]*:\s*([^;]+)/g)) families.add(f[1].split(',')[0].replace(/["']/g, '').trim());
      }
      j = k;
    }
    return res;
  };
  let kept = walk(css.replace(/\/\*[\s\S]*?\*\//g, ''));
  ['Inter', 'Bebas Neue'].forEach((f) => families.add(f));
  kept = kept.replace(/\u0000FF(@font-face\{[\s\S]*?\})\u0000/g, (m, ff) => {
    const fam = (ff.match(/font-family:\s*"?([^";]+)"?/) || [])[1];
    return fam && families.has(fam.trim()) ? ff : '';
  });
  return kept;
}

/* ------------------------------------------------------------------- render */

function render() {
  const url = SITE + '/';
  const m = D.meta;
  const body = `<body>
${ROOT_OPEN}
<div class="hm">
  <div class="svc-nav-wrap hm-navwrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <main>
${hero()}
${numbers()}
${statement()}
${benefits()}
${work()}
${services()}
${quote()}
${pricing()}
${processSteps()}
${faq()}
${contact()}
  </main>
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
${HOME_JS}
<script>${CAL_PILL}</script>
<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};</script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
  const rawCss = styles.replace(/<\/?style[^>]*>/g, '') + '\n' + GLUE.replace(/<\/?style[^>]*>/g, '');
  // Prefer the browser-trimmed sheet (scripts/trim-home-css.mjs); the class-based
  // prune is the fallback when it has not been generated yet.
  const TRIMMED = path.join(COMP, 'home-framer.css');
  const pruned = fs.existsSync(TRIMMED) && !process.env.NO_TRIM ? fs.readFileSync(TRIMMED, 'utf8') : prune(rawCss, body);
  const headHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${LIVE ? 'index, follow, max-image-preview:large' : 'noindex, nofollow'}">
<link rel="icon" href="/framerusercontent.com/images/0qZrfBuw0vpXfqa4iQEyDlGqjU.png">
<link rel="apple-touch-icon" href="/framerusercontent.com/images/kSD5jxsYs1XjwIhA7wJG06330.png">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="TheBrandle">
<meta property="og:title" content="${esc(m.title)}"><meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${OG_IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(m.title)}">
<meta name="twitter:description" content="${esc(m.description)}"><meta name="twitter:image" content="${OG_IMAGE}">
<link rel="preload" as="image" href="${D.hero.image}" fetchpriority="high">
<style>${pruned}</style>
${scope(HOME_CSS)}
${schemas(url).map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
`;
  return { html: headHtml + body, cssBefore: rawCss.length, cssAfter: pruned.length };
}

const { html, cssBefore, cssAfter } = render();
const outPath = path.join(ROOT, OUT_REL);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);
const h1s = (html.match(/<h1\b/g) || []).length;
const hs = (html.match(/<h[1-6]\b/g) || []).length;
console.log(`home: wrote ${OUT_REL}  ${(html.length / 1024).toFixed(0)}KB  (framer css ${(cssBefore / 1024).toFixed(0)}KB -> ${(cssAfter / 1024).toFixed(0)}KB)  h1=${h1s} headings=${hs}  ${LIVE ? 'INDEXABLE' : 'noindex preview'}`);
