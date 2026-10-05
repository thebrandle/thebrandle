#!/usr/bin/env node
/**
 * Service page generator v2 — TRUE-BRAND edition.
 *
 * Unlike v1 (hand-written lookalike CSS), v2 composes every page from the
 * site's OWN carved parts, so branding is identical by construction:
 *   - _snapshot/components/styles.html   → the full 519KB Framer stylesheet
 *   - _snapshot/components/nav-live.html → hydrated header (runtime-corrected)
 *   - _snapshot/components/footer-live.html → hydrated footer
 *   - real text presets (framer-styles-preset-*) for every heading/paragraph
 *   - the site's own CTA pill markup (carved "Let's talk" button)
 * Prereqs: run scripts/snapshot-homepage.js + scripts/carve-components.js
 * (and capture *-live.html via the /__save flow) before this.
 * Run: node scripts/gen-service-pages-v2.js
 */
const fs = require('fs');
const path = require('path');
const { pages, PROCESS } = require('./service-pages-data');
const { FAQ_GROUPS } = require('./faq-data');
const { TEAM } = require('./team-data');

const { ROOT, COMP, SITE, OG_IMAGE, EMAIL, read, styles, absolutize, NAV_LINKS, UNIT_RES, addNavLink, addNav, navHtml, navHtmlFinal, navPhoneHtml, footerHtml, ctaHtml, noiseHtml, snapshot, rootM, ROOT_OPEN, esc, pad2, P, ACCENT, MUTED, MUTED2, cta, GLUE, REVEAL_JS, MARK, head } = require('./site-shell');

const OUT = path.join(ROOT, 'services');

const fmtDur = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const isoDur = (sec) => `PT${Math.floor(sec / 60) ? Math.floor(sec / 60) + 'M' : ''}${sec % 60}S`;
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14z"/></svg>';

/* Self-hosted posters, no YouTube player until someone presses play. Five
   embedded players would cost several megabytes of script before anyone
   watched anything. */
function renderFilms(d) {
  if (!d.films) return '';
  const card = (f, i) => `      <button type="button" class="flm flm-${f.shape}" data-yt="${esc(f.id)}" data-shape="${f.shape}" aria-label="Play ${esc(f.title)}, ${fmtDur(f.seconds)}" data-reveal style="transition-delay:${i * 70}ms">
        <span class="flm-media"><img src="${esc(f.poster)}" alt="" width="${f.shape === 'tall' ? 540 : 960}" height="${f.shape === 'tall' ? 960 : 540}" loading="lazy" decoding="async"><span class="flm-play">${PLAY_ICON}</span></span>
        <span class="flm-meta"><span class="flm-title ${P.h3}">${esc(f.title)}</span><span class="flm-info ${P.small}">${fmtDur(f.seconds)}${f.tag ? ' · ' + esc(f.tag) : ''}</span></span>
      </button>`;
  const wide = d.films.items.filter((f) => f.shape === 'wide');
  const tall = d.films.items.filter((f) => f.shape === 'tall');
  return `
  <section class="svc-section" id="films">
    <span class="svc-label">${esc(d.films.eyebrow)}</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 14px">${esc(d.films.heading)}</h2>
    <p class="${P.body}" style="color:${MUTED};text-align:left;max-width:64ch">${esc(d.films.sub)}</p>
    <div class="flm-grid">
${wide.map(card).join('\n')}
    </div>${tall.length ? `
    <span class="svc-label flm-sub">Vertical cuts</span>
    <div class="flm-row">
${tall.map((f, i) => card(f, i + wide.length)).join('\n')}
    </div>` : ''}
  </section>
`;
}

const filmSchemas = (d) => (d.films ? d.films.items.map((f) => ({
  '@context': 'https://schema.org', '@type': 'VideoObject',
  name: f.title,
  description: `${f.title}, a ${fmtDur(f.seconds)} ${f.shape === 'tall' ? 'vertical ' : ''}film by Raheem Dzhairkhanov.`,
  thumbnailUrl: SITE + f.poster,
  uploadDate: f.uploaded,
  duration: isoDur(f.seconds),
  embedUrl: `https://www.youtube.com/embed/${f.id}`,
  contentUrl: `https://www.youtube.com/watch?v=${f.id}`,
  creator: { '@type': 'Person', name: 'Raheem Dzhairkhanov' },
  publisher: { '@type': 'Organization', name: 'TheBrandle', url: SITE + '/' },
})) : []);

/* One shared dialog, built on first use. Closing empties the stage, which
   tears the iframe down and stops playback rather than leaving audio running
   behind a hidden overlay. youtube-nocookie keeps YouTube from setting
   cookies until the visitor actually plays something. */
const FILMS_JS = `<script>
(function(){
  var cards=document.querySelectorAll('.flm[data-yt]'); if(!cards.length) return;
  var box=null, last=null;
  function build(){
    box=document.createElement('div');
    box.className='flm-box'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Video player');
    box.innerHTML='<button type="button" class="flm-close" aria-label="Close video">&times;</button><div class="flm-stage"></div>';
    document.body.appendChild(box);
    box.addEventListener('click',function(e){ if(e.target===box) close(); });
    box.querySelector('.flm-close').addEventListener('click',close);
  }
  function open(card){
    if(!box) build();
    last=card;
    var stage=box.querySelector('.flm-stage');
    stage.className='flm-stage flm-stage-'+card.getAttribute('data-shape');
    var f=document.createElement('iframe');
    f.src='https://www.youtube-nocookie.com/embed/'+card.getAttribute('data-yt')+'?autoplay=1&rel=0&playsinline=1';
    f.title=card.getAttribute('aria-label');
    f.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');
    f.setAttribute('allowfullscreen','');
    /* YouTube refuses embeds that do not name the site they sit on (Error 153,
       "Video player configuration error"). Browsers send the origin by default,
       but a stricter site-wide Referrer-Policy added later would silently break
       every film on the page, so say it explicitly here. */
    f.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
    stage.innerHTML=''; stage.appendChild(f);
    box.classList.add('is-open');
    document.documentElement.style.overflow='hidden';
    box.querySelector('.flm-close').focus();
  }
  function close(){
    if(!box||!box.classList.contains('is-open')) return;
    box.classList.remove('is-open');
    box.querySelector('.flm-stage').innerHTML='';
    document.documentElement.style.overflow='';
    if(last) last.focus();
  }
  for(var i=0;i<cards.length;i++) cards[i].addEventListener('click',function(){ open(this); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
})();
</script>`;

function renderPage(d) {
  const url = `${SITE}/services/${d.slug}/`;
  const rows = d.features.map((f, i) => `      <div class="svc-row" data-reveal style="transition-delay:${i * 70}ms"><span class="svc-num ${P.small}">${pad2(i + 1)}</span><h3 class="svc-row-title ${P.h2}" style="text-align:left">${esc(f.title)}</h3><p class="svc-row-body ${P.body}" style="color:${MUTED2};text-align:left">${esc(f.body)}</p></div>`).join('\n');
  const checks = d.why.points.map(p => `        <div class="svc-check">${MARK}<span class="${P.body}" style="color:#fff">${esc(p)}</span></div>`).join('\n');
  const steps = (d.process || PROCESS).map((s, i) => `      <div class="svc-step" data-reveal style="transition-delay:${i * 70}ms"><span class="svc-num ${P.small}" style="display:block;margin-bottom:22px">${pad2(i + 1)}</span><h3 class="${P.h3}" style="color:#fff;text-align:left;margin:0 0 10px">${esc(s.title)}</h3><p class="${P.small}" style="color:${MUTED};text-align:left">${esc(s.body)}</p></div>`).join('\n');
  const faqs = d.faqs.map((f, i) => `      <details data-reveal style="transition-delay:${i * 60}ms"><summary><span class="${P.h3}" style="color:#fff;text-align:left">${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></summary><div class="ans ${P.body}" style="color:${MUTED}">${esc(f.a)}</div></details>`).join('\n');

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'Service', serviceType: d.serviceType, name: d.h1, provider: { '@type': 'ProfessionalService', name: 'TheBrandle', url: SITE, email: EMAIL, telephone: '+971561429789', image: OG_IMAGE, areaServed: 'Worldwide' }, description: d.metaDescription, url },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Services', item: SITE + '/services/' }, { '@type': 'ListItem', position: 3, name: d.navTitle, item: url }] },
    ...filmSchemas(d),
  ];

  return `${head(d.title, d.metaDescription, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>

  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label" data-reveal>${esc(d.eyebrow)}</span>
    <h1 class="${P.display}" data-reveal style="color:#fff;text-align:left;margin:0 0 26px;transition-delay:70ms">${esc(d.h1)}</h1>
    <p class="${P.lead}" data-reveal style="color:${MUTED};text-align:left;max-width:58ch;transition-delay:140ms">${esc(d.heroSub)}</p>
    <div class="svc-hero-actions" data-reveal style="transition-delay:210ms">${cta('Start your project', '/contact')}</div>
  </section>
${renderFilms(d)}
  <section class="svc-section">
    <span class="svc-label">What you get</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 14px">${esc(d.deliverHeading)}</h2>
    <p class="${P.body}" style="color:${MUTED};text-align:left;max-width:64ch">${esc(d.deliverSub)}</p>
    <div class="svc-rows">
${rows}
    </div>
  </section>

  <section class="svc-section">
    <div class="svc-cols">
      <div><span class="svc-label">${esc(d.why.eyebrow)}</span><h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0">${esc(d.why.heading)}</h2></div>
      <div><p class="${P.body}" style="color:${MUTED};text-align:left">${esc(d.why.body)}</p><div style="margin-top:22px">
${checks}
      </div></div>
    </div>
  </section>

  <section class="svc-section">
    <span class="svc-label">How we work</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 14px">${esc(d.processHeading)}</h2>
    <div class="svc-steps">
${steps}
    </div>
  </section>

  <section class="svc-section">
    <span class="svc-label" style="text-align:center">Questions</span>
    <h2 class="${P.h2}" style="color:#fff;text-align:center;margin:0">${esc(d.faqHeading || d.navTitle + ' design')}, answered</h2>
    <div class="svc-faq">
${faqs}
    </div>
  </section>

  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">${esc(d.ctaHeading)}</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">${esc(d.ctaBody)}</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
${d.films ? FILMS_JS : ''}
</body>
</html>
`;
}


/* Standalone /faq page. Reuses this generator's shell so it inherits the nav,
   the footer and every menu fix, and cannot drift from the service pages. */
function renderFaq() {
  const url = `${SITE}/faq`;
  const title = 'Frequently Asked Questions - Pricing, Timelines & Support | TheBrandle';
  const desc = 'Straight answers on what a website costs in Dubai, how long a project takes, what revisions and post-launch support cover, and who owns the code.';
  const flat = FAQ_GROUPS.flatMap((g) => g.items);
  const groups = FAQ_GROUPS.map((g, gi) => `
  <section class="svc-section"${gi === 0 ? ' style="padding-top:20px"' : ''}>
    <h2 class="${P.h2}" data-reveal style="color:#fff;text-align:left;margin:0">${esc(g.heading)}</h2>
    <div class="svc-faq" style="margin:34px 0 0">
${g.items.map((f, i) => `      <details data-reveal style="transition-delay:${i * 60}ms"><summary><span class="${P.h3}" style="color:#fff;text-align:left">${esc(f.q)}</span><span class="pm" aria-hidden="true"></span></summary><div class="ans ${P.body}" style="color:${MUTED}">${esc(f.a)}</div></details>`).join('\n')}
    </div>
  </section>`).join('\n');

  const schemas = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: flat.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'FAQ', item: url }] },
  ];

  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>

  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label" data-reveal>Questions</span>
    <h1 class="${P.display}" data-reveal style="color:#fff;text-align:left;margin:0 0 26px;transition-delay:70ms">Frequently asked questions</h1>
    <p class="${P.lead}" data-reveal style="color:${MUTED};max-width:60ch;margin:0;transition-delay:140ms">What things cost, how long they take, what is covered after launch, and who owns what. If your question is not here, ask us directly.</p>
  </section>
${groups}

  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Still have a question?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us what you are building and we will come back with a clear scope, a timeline and a fixed quote.</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

/* Social marks are drawn, not labelled - the ask was the logo itself.
   fill:currentColor so the accent and the hover swap both come from CSS. */
const ICONS = {
  LinkedIn: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>',
};

function renderTeam() {
  const url = `${SITE}/team/`;
  const title = 'The Team - Design, Build and Media | TheBrandle';
  const desc = 'The people behind TheBrandle: who does the design and build, and who shoots the video. Based in Dubai.';

  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const members = TEAM.map((m, i) => {
    const portrait = m.photo
      ? `<img class="tm-photo" src="${esc(m.photo)}" alt="${esc(m.name)}, ${esc(m.role)} at TheBrandle" width="200" height="200" loading="lazy">`
      : `<div class="tm-mono" role="img" aria-label="${esc(m.name)}"><span class="${P.h2}">${esc(initials(m.name))}</span></div>`;
    const links = (m.links || []).length
      ? `\n        <div class="tm-links">${m.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener" aria-label="${esc(m.name)} on ${esc(l.label)}" title="${esc(l.label)}">${ICONS[l.label] || esc(l.label)}</a>`).join('')}</div>`
      : '';
    return `      <div class="tm-member" data-reveal style="transition-delay:${i * 80}ms">
        <div class="tm-portrait">${portrait}</div>
        <div class="tm-id">
          <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:0 0 12px">${esc(m.name)}</h2>
        </div>
        <div class="tm-meta"><span class="svc-label" style="margin:0">${esc(m.role)}</span><span class="${P.small}" style="color:${MUTED2}">${esc(m.location)}</span></div>
        <div class="tm-body">
${m.bio.map((para) => `          <p class="${P.body}" style="color:${MUTED};text-align:left;margin:0 0 14px;max-width:60ch">${esc(para)}</p>`).join('\n')}${links}
        </div>
      </div>`;
  }).join('\n');

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'Organization', name: 'TheBrandle', url: SITE + '/',
      employee: TEAM.map((m) => {
        const person = { '@type': 'Person', name: m.name, jobTitle: m.role };
        if ((m.links || []).length) person.sameAs = m.links.map((l) => l.href);
        return person;
      }),
    },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: 'Team', item: url }] },
  ];

  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>

  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label" data-reveal>Who you work with</span>
    <h1 class="${P.display}" data-reveal style="color:#fff;text-align:left;margin:0 0 26px;transition-delay:70ms">The team</h1>
    <p class="${P.lead}" data-reveal style="color:${MUTED};max-width:60ch;margin:0;transition-delay:140ms">A small studio in Dubai. The people who design your project are the people who build it.</p>
  </section>

  <section class="svc-section" style="padding-top:10px">
${members}
  </section>

  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Want to work together?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us what you are building and we will come back with a clear scope, a timeline and a fixed quote.</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

function renderHub() {
  const url = `${SITE}/services/`;
  const title = 'Services - Branding, Web, Ecommerce & UI/UX Design | TheBrandle';
  const desc = 'TheBrandle designs and builds websites, online stores and brand identities - Shopify, Webflow, Framer, WordPress, Wix, Squarespace and UI/UX design.';
  const rows = pages.map((p, i) => `      <a class="svc-row" style="display:block" href="/services/${p.slug}/"><span class="svc-num ${P.small}">${pad2(i + 1)}</span><h3 class="svc-row-title ${P.h2}" style="text-align:left">${esc(p.hubTitle)}</h3><p class="svc-row-body ${P.body}" style="color:${MUTED2};text-align:left">${esc(p.hubTagline)}</p></a>`).join('\n');
  const schemas = [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.hubTitle, url: `${SITE}/services/${p.slug}/` })) }];
  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label">What we do</span>
    <h1 class="${P.display}" style="color:#fff;text-align:left;margin:0 0 26px">Design &amp; build, on your platform</h1>
    <p class="${P.lead}" style="color:${MUTED};text-align:left;max-width:58ch">From brand identity to a live website or online store - we design and build on the platform that fits your goals. Pick a service to see how we work.</p>
    <div class="svc-hero-actions">${cta('Start your project', '/contact')}</div>
    <div class="svc-rows">
${rows}
    </div>
  </section>
  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Not sure which platform is right?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us your goals and we'll recommend the best fit - then design and build it end to end.</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

/* ---------------------------------------------------------------------------
   /tools/ai-visibility - the free checker.

   Lives in THIS generator rather than a fourth one on purpose: nav, footer and
   menu JS are already duplicated across three files and every fix has to be
   applied to all of them. Another copy makes that worse.

   Results are shown in full, free, before any email is asked for. A gate in
   front of an unevaluated tool kills the usage that makes it worth having.
--------------------------------------------------------------------------- */
const AIV_CSS = `<style>
.aiv-form{display:flex;gap:10px;flex-wrap:wrap;margin:30px 0 0;max-width:560px}
.aiv-form input{flex:1 1 260px;min-width:0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);
  border-radius:10px;padding:15px 17px;color:#fff;font:inherit;font-size:16px;outline:none}
.aiv-form input::placeholder{color:rgba(255,255,255,.36)}
.aiv-form input:focus{border-color:${ACCENT}}
.aiv-btn{background:${ACCENT};color:#fff;border:0;border-radius:10px;padding:15px 26px;font:inherit;
  font-size:16px;font-weight:600;cursor:pointer;white-space:nowrap}
.aiv-btn[disabled]{opacity:.55;cursor:progress}
.aiv-note{margin:12px 0 0;font-size:14px;color:${MUTED2}}
.aiv-out{margin:44px 0 0;display:none}
.aiv-out.on{display:block}
.aiv-score{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;padding:0 0 22px;border-bottom:1px solid rgba(255,255,255,.12)}
.aiv-num{font-size:64px;line-height:1;font-weight:700;color:#fff}
.aiv-verdict{font-size:19px;color:${MUTED}}
.aiv-dom{font-size:14px;color:${MUTED2};margin-left:auto}
.aiv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:26px 0 0}
.aiv-cell{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px 18px}
.aiv-cell b{display:block;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED2};margin:0 0 8px;font-weight:600}
.aiv-cell span{font-size:15px;color:#fff;line-height:1.5}
.aiv-find{margin:30px 0 0;padding:0;list-style:none}
.aiv-find li{padding:17px 0;border-top:1px solid rgba(255,255,255,.1)}
.aiv-sev{display:inline-block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700;
  padding:3px 9px;border-radius:5px;margin:0 10px 0 0;vertical-align:2px}
.aiv-sev.critical{background:#f9452d;color:#fff}
.aiv-sev.high{background:#ff8a3d;color:#221100}
.aiv-sev.medium{background:rgba(255,255,255,.2);color:#fff}
.aiv-sev.low{background:rgba(255,255,255,.1);color:${MUTED}}
.aiv-find h4{display:inline;font-size:17px;color:#fff;font-weight:600;margin:0}
.aiv-find p{margin:9px 0 0;font-size:15px;color:${MUTED};line-height:1.62;max-width:70ch}
.aiv-err{color:#ff8a3d;margin:22px 0 0;font-size:15px}
.aiv-pass{margin:26px 0 0;font-size:16px;color:${MUTED}}
@media (max-width:600px){.aiv-num{font-size:48px}.aiv-dom{margin-left:0;width:100%}}
</style>`;

function renderTool() {
  const url = `${SITE}/tools/ai-visibility/`;
  const title = 'Free AI Visibility Check - Can ChatGPT See Your Business? | TheBrandle';
  const desc = 'Check in seconds whether ChatGPT, Claude, Perplexity and Google AI can reach your website and find anything worth quoting. Free, no signup, results on screen.';
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication',
      name: 'AI Visibility Check', url,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
      provider: { '@type': 'Organization', name: 'TheBrandle', url: SITE },
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: [
        ['What does this check?', 'Whether AI assistants can reach your site, and whether there is anything machine readable for them to quote. It reads your robots.txt, llms.txt, sitemap, page metadata and structured data directly.'],
        ['Why do indexers and fetchers get scored separately?', 'They are different failures. Blocking an indexing crawler such as GPTBot or ClaudeBot keeps you out of the data behind unprompted recommendations. Blocking a live fetcher such as OAI-SearchBot or PerplexityBot stops an assistant reading your page when somebody asks about you directly.'],
        ['Is the score an opinion?', 'No. Every finding traces to a file fetched from your domain at the moment you run it, so the same site scores the same each time. No AI model is involved in producing the result.'],
      ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];

  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
${AIV_CSS}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label">Free tool</span>
    <h1 class="${P.display}" style="color:#fff;text-align:left;margin:0 0 26px">Can ChatGPT see your business?</h1>
    <p class="${P.lead}" style="color:${MUTED};text-align:left;max-width:60ch">Most sites are optimised for Google and invisible to the assistants people now ask instead. This reads your domain live and tells you which AI crawlers you allow, whether there is anything quotable when they arrive, and what is missing.</p>

    <form class="aiv-form" id="aivForm" autocomplete="off">
      <input id="aivDomain" type="text" inputmode="url" placeholder="yourcompany.com" aria-label="Your domain" required>
      <button class="aiv-btn" id="aivGo" type="submit">Check my site</button>
    </form>
    <p class="aiv-note">Free, no signup, results on this page. Takes about five seconds.</p>
    <p class="aiv-err" id="aivErr" style="display:none"></p>

    <div class="aiv-out" id="aivOut" aria-live="polite"></div>
  </section>

  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Want this fixed rather than measured?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Send us the result and we will tell you exactly what to change, in order, and what it costs. Fixed quote before any work starts.</p>
    <div class="svc-hero-actions">${cta('Get the fix list', '/contact')}</div>
  </div>

  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
<script>
(function () {
  var f = document.getElementById('aivForm'), out = document.getElementById('aivOut'),
      err = document.getElementById('aivErr'), btn = document.getElementById('aivGo'),
      inp = document.getElementById('aivDomain');
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cell(label, val) {
    return '<div class="aiv-cell"><b>' + esc(label) + '</b><span>' + esc(val) + '</span></div>';
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = (inp.value || '').trim();
    if (!d) return;
    err.style.display = 'none'; out.className = 'aiv-out'; btn.disabled = true; btn.textContent = 'Checking...';
    fetch('/api/visibility-check?domain=' + encodeURIComponent(d))
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Check failed'); return j; }); })
      .then(function (r) {
        var bi = r.crawlers.blockedIndexers, bf = r.crawlers.blockedFetchers;
        var html =
          '<div class="aiv-score"><span class="aiv-num">' + r.score + '</span>' +
          '<span class="aiv-verdict">' + esc(r.verdict) + '</span>' +
          '<span class="aiv-dom">' + esc(r.domain) + '</span></div>' +
          '<div class="aiv-grid">' +
            cell('Live AI fetchers', bf.length ? bf.length + ' blocked: ' + bf.join(', ') : 'All allowed') +
            cell('AI indexing crawlers', bi.length ? bi.length + ' blocked: ' + bi.join(', ') : 'All allowed') +
            cell('llms.txt', r.files.llmsTxt ? 'Present' : 'Missing') +
            cell('sitemap.xml', r.files.sitemapXml ? 'Present' : 'Missing') +
            cell('Structured data', r.page.schemas.length ? r.page.schemas.join(', ') : 'None found') +
            cell('Meta description', r.page.description ? 'Present' : 'Missing') +
          '</div>';
        if (r.findings.length) {
          html += '<ul class="aiv-find">' + r.findings.map(function (x) {
            return '<li><span class="aiv-sev ' + esc(x.severity) + '">' + esc(x.severity) + '</span>' +
                   '<h4>' + esc(x.title) + '</h4><p>' + esc(x.detail) + '</p></li>';
          }).join('') + '</ul>';
        } else {
          html += '<p class="aiv-pass">Nothing to flag. Every check passed.</p>';
        }
        out.innerHTML = html; out.className = 'aiv-out on';
      })
      .catch(function (e) { err.textContent = e.message || 'Something went wrong. Try again.'; err.style.display = 'block'; })
      .then(function () { btn.disabled = false; btn.textContent = 'Check my site'; });
  });
})();
</script>
${REVEAL_JS}
</body>
</html>
`;
}

const toolDir = path.join(ROOT, 'tools', 'ai-visibility');
fs.mkdirSync(toolDir, { recursive: true });
fs.writeFileSync(path.join(toolDir, 'index.html'), renderTool());

/* ---------------------------------------------------------------------------
   /projects - the work listing, and a page per non-CMS project.

   /projects used to be the Framer page, which lists only what is in the CMS
   collection. Newer work cannot be added there without Framer editor access, so
   the hub is generated here instead and covers everything. The four CMS case
   studies keep their own Framer-rendered pages; this page just links to them.
--------------------------------------------------------------------------- */
const projects = require('./projects-data.js');

const PRJ_CSS = `<style>
.prj-meta{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px}
.prj-tag{font-size:12px;letter-spacing:.07em;text-transform:uppercase;font-weight:600;color:${MUTED};
  border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 13px}
/* !important for the same reason .svc-num carries it: Framer's stylesheet sets
   anchor colour at a higher specificity, and without it this link computes to
   rgb(0,0,0) on a rgb(12,12,12) background - invisible. */
.prj-visit{display:inline-block;margin:26px 0 0;font-size:15px;color:${ACCENT}!important;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}
.prj-note{margin:34px 0 0;padding:16px 18px;border-left:2px solid rgba(255,255,255,.18);color:${MUTED2};font-size:14px;line-height:1.6;max-width:64ch}
.svc-row .prj-plat{display:inline-block;margin:8px 0 0;font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:${MUTED2};font-weight:600}
</style>`;

function renderProjectsHub() {
  const url = `${SITE}/projects`;
  const title = 'Selected Work - Web, Ecommerce & Brand Projects | TheBrandle';
  const desc = 'Selected projects from TheBrandle across Shopify, Webflow, Wix and Framer - ecommerce stores, agency sites, brand identities and landing pages.';
  const rows = projects.map((p, i) => {
    const href = p.framer ? `/projects/${p.slug}/` : `/projects/${p.slug}/`;
    return `      <a class="svc-row" style="display:block" href="${href}"><span class="svc-num ${P.small}">${pad2(i + 1)}</span><h3 class="svc-row-title ${P.h2}" style="text-align:left">${esc(p.title)}</h3><p class="svc-row-body ${P.body}" style="color:${MUTED2};text-align:left">${esc(p.tagline)}</p><span class="prj-plat">${esc(p.platform)} &middot; ${esc(p.sector)}</span></a>`;
  }).join('\n');
  const schemas = [{
    '@context': 'https://schema.org', '@type': 'ItemList',
    itemListElement: projects.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: `${SITE}/projects/${p.slug}/` })),
  }];
  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
${PRJ_CSS}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label">Selected work</span>
    <h1 class="${P.display}" style="color:#fff;text-align:left;margin:0 0 26px">Work we have shipped</h1>
    <p class="${P.lead}" style="color:${MUTED};text-align:left;max-width:58ch">Stores, sites and brand systems across Shopify, Webflow, Wix and Framer. We build on whichever platform fits the goal, then hand over the code.</p>
    <div class="svc-hero-actions">${cta('Start your project', '/contact')}</div>
    <div class="svc-rows">
${rows}
    </div>
  </section>
  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Want something like this?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Tell us the goal and we will recommend the platform, then design and build it end to end. Fixed quote before any work starts.</p>
    <div class="svc-hero-actions">${cta('Book a free consultation', '/contact')}</div>
  </div>
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

function renderProjectPage(p) {
  const url = `${SITE}/projects/${p.slug}/`;
  const title = `${p.title} - ${p.platform} ${p.sector === 'Marketing agency' ? 'Website' : 'Project'} | TheBrandle`;
  const desc = `${p.tagline} Built by TheBrandle, a Dubai design and development studio.`;
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'CreativeWork',
      name: p.title, url, about: p.sector,
      creator: { '@type': 'Organization', name: 'TheBrandle', url: SITE },
      ...(p.url ? { sameAs: [p.url] } : {}),
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Work', item: SITE + '/projects/' },
        { '@type': 'ListItem', position: 3, name: p.title, item: url },
      ],
    },
  ];
  return `${head(title, desc, url, schemas)}
<body>
${ROOT_OPEN}
${noiseHtml ? `<div class="svc-noise">${noiseHtml}</div>` : ``}
${PRJ_CSS}
<div class="svc-page">
  <div class="svc-nav-wrap"><div class="svc-nav-desktop">${navHtmlFinal}</div><div class="svc-nav-phone">${navPhoneHtml}</div></div>
  <section class="svc-section" style="padding-top:110px">
    <span class="svc-label">Selected work</span>
    <h1 class="${P.display}" style="color:#fff;text-align:left;margin:0 0 22px">${esc(p.title)}</h1>
    <div class="prj-meta"><span class="prj-tag">${esc(p.platform)}</span><span class="prj-tag">${esc(p.sector)}</span></div>
    <p class="${P.lead}" style="color:${MUTED};text-align:left;max-width:62ch">${esc(p.summary)}</p>
    <h2 class="${P.h2}" style="color:#fff;text-align:left;margin:44px 0 14px">What we built</h2>
    <p class="${P.body}" style="color:${MUTED};text-align:left;max-width:62ch">${esc(p.build)}</p>
    ${p.url ? `<a class="prj-visit" href="${p.url}" target="_blank" rel="noopener">Visit ${esc(p.client)}</a>` : ''}
    <p class="prj-note">This page describes the client and the platform. The scope, timeline and outcome are not published here yet.</p>
  </section>
  <div class="svc-band">
    <h2 class="${P.display}" style="color:#fff;margin:0 0 22px">Want something like this?</h2>
    <p class="${P.lead}" style="color:${MUTED};max-width:52ch;margin:0 auto">Fixed quote before any work starts, and you own the code at the end.</p>
    <div class="svc-hero-actions">${cta('Start your project', '/contact')}</div>
  </div>
  <div class="svc-footer">
${footerHtml}
  </div>
</div>
</div>
${REVEAL_JS}
</body>
</html>
`;
}

const prjDir = path.join(ROOT, 'projects');
fs.mkdirSync(prjDir, { recursive: true });
fs.writeFileSync(path.join(prjDir, 'index.html'), renderProjectsHub());
let prjN = 0;
for (const p of projects.filter((x) => !x.framer)) {
  const d = path.join(prjDir, p.slug);
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'index.html'), renderProjectPage(p));
  prjN++;
}
console.log(`projects: hub with ${projects.length} entries + ${prjN} static project pages`);

/* Merge the pages this generator owns but that Framer never knew about into the
   sitemap, inside a marked block - same idempotent pattern gen-opinly-blog.js
   uses for its posts, so repeated runs replace rather than accumulate. The four
   CMS case studies are already in the Framer-exported part and are not touched. */
function mergeSitemap(entries) {
  const SITEMAP = path.join(ROOT, 'thebrandle.framer.website', 'sitemap.xml');
  if (!fs.existsSync(SITEMAP)) { console.warn('sitemap: not found, skipped'); return; }
  const START = '  <!-- generated:start -->';
  const END = '  <!-- generated:end -->';
  const today = new Date().toISOString().slice(0, 10);
  let xml = fs.readFileSync(SITEMAP, 'utf8');
  const already = new Set((xml.match(/<loc>([^<]*)<\/loc>/g) || []).map((m) => m.slice(5, -6)));
  /* Keep the date a URL already carries. Stamping today on every run told Google
     these pages changed each time the generator was run for an unrelated reason,
     which is a false freshness signal - only genuinely new URLs get today. */
  const priorLastmod = (loc) => {
    const at = xml.indexOf(`<loc>${loc}</loc>`);
    if (at < 0) return null;
    const open = xml.indexOf('<lastmod>', at);
    const close = xml.indexOf('</lastmod>', open);
    if (open < 0 || close < 0 || open > xml.indexOf('</url>', at)) return null;
    return xml.slice(open + 9, close).trim() || null;
  };
  const block = [START,
    ...entries.map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${e.lastmod || priorLastmod(e.loc) || today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`),
    END].join('\n');
  xml = xml.includes(START)
    ? xml.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block)
    : xml.replace('</urlset>', block + '\n</urlset>');
  fs.writeFileSync(SITEMAP, xml);
  const added = entries.filter((e) => !already.has(e.loc)).length;
  console.log(`sitemap: ${entries.length} generated URLs in the marked block (${added} new)`);
}

mergeSitemap([
  ...projects.filter((p) => !p.framer).map((p) => ({ loc: `${SITE}/projects/${p.slug}/`, priority: '0.7' })),
  { loc: `${SITE}/tools/ai-visibility/`, priority: '0.7' },
]);

/* ---------------------------------------------------------------------------
   /llms.txt - what an assistant reads when it wants to describe this business.

   Generated from the same service data as the pages, so the link list cannot
   drift. Every fact below is a public commitment already stated on /faq. No
   statistics, no client names that are not already on the site.
--------------------------------------------------------------------------- */
function renderLlms() {
  const svc = pages.map((p) => `- [${p.hubTitle}](${SITE}/services/${p.slug}/): ${p.hubTagline}`).join('\n');
  return `# TheBrandle

> Dubai based design and development studio. We design and build websites, online
> stores, brand identities and mobile apps, and hand over the code. Work is fully
> in-house. We serve the UAE, Saudi Arabia and international clients.

TheBrandle builds on whichever platform fits the goal rather than pushing one:
Shopify, WooCommerce, Webflow, Framer, WordPress, Wix and Squarespace, plus custom
web applications, mobile apps, B2B and B2C portals and payment gateway integration.

## How we work

- Fixed quote agreed before any work starts. Custom builds sit in the mid four to
  low five figures in AED.
- A custom website or Shopify store typically takes three to six weeks. A mobile
  app MVP takes a few months.
- Two rounds of revisions at each stage. Anything beyond that is quoted before it
  is started.
- Thirty days of bug fixes after launch at no cost.
- One point of contact, a weekly call and a shared WhatsApp group.
- Replies within one business day.
- The client owns the codebase. The repository is handed over and source files are
  included.

## Services

${svc}

## Elsewhere on the site

- [Services overview](${SITE}/services/): every service in one place
- [Team](${SITE}/team/): the people who do the design, build and video work
- [FAQ](${SITE}/faq/): pricing, timelines, revisions, ownership and support, answered directly
- [Blog](${SITE}/blog/): articles on design, build and platform choices
- [AI visibility check](${SITE}/tools/ai-visibility/): free tool that reports whether AI assistants can reach and quote a given website
- [Contact](${SITE}/contact): start a project

## Contact

Email: ${EMAIL}
Based in Dubai, United Arab Emirates. Working across the UAE, Saudi Arabia and internationally.
`;
}

fs.writeFileSync(path.join(ROOT, 'llms.txt'), renderLlms());

let n = 0;
for (const d of pages) {
  const dir = path.join(OUT, d.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(d));
  n++;
}
fs.writeFileSync(path.join(OUT, 'index.html'), renderHub());

const faqDir = path.join(__dirname, '..', 'faq');
fs.mkdirSync(faqDir, { recursive: true });
fs.writeFileSync(path.join(faqDir, 'index.html'), renderFaq());
console.log('  wrote faq/index.html');

const teamDir = path.join(__dirname, '..', 'team');
fs.mkdirSync(teamDir, { recursive: true });
fs.writeFileSync(path.join(teamDir, 'index.html'), renderTeam());
console.log(`  wrote team/index.html (${TEAM.length} members)`);
console.log(`v2: generated ${n} service pages + hub from carved real components`);
