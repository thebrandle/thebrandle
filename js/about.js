/* The Brandle, About page: hero entrance, the orange line that is drawn by scroll and floods the team block,
   scene reveals, the team popup, two marquee rows, the sticky house rules and the pill hover.
   Shared parts live in /main.js (window.TB). Motion values follow the measured two26.studio About page. */
(() => {
  const { $, $$, ok, fine, rnd } = TB;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- text splitting (plain-text elements only) ---------- */
  // wraps each rendered line in a mask; call once fonts are in, the lines are frozen until unsplit
  const splitLines = (el) => {
    const src = el.dataset.src || (el.dataset.src = el.textContent.trim());
    el.innerHTML = src.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
    const lines = [];
    let top = null;
    $$('.w', el).forEach((s) => { if (s.offsetTop !== top) { lines.push([]); top = s.offsetTop; } lines[lines.length - 1].push(s.textContent); });
    el.innerHTML = lines.map((l) => `<span class="lm"><span>${esc(l.join(' '))}</span></span>`).join(' ');
    return $$('.lm > span', el);
  };
  const unsplit = (el) => { el.textContent = el.dataset.src; }; // back to plain text so it re-wraps on resize
  const splitChars = (el) => {
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${[...w].map((c) => `<span class="cm"><span class="ch">${esc(c)}</span></span>`).join('')}</span>`).join(' ');
    return $$('.ch', el);
  };

  /* ---------- the line: one smooth path through anchors measured from the page, rebuilt on resize ---------- */
  const top = $('.ab-top');
  const flow = $('.ab-flow');
  const lineSvg = $('.ab-line');
  const linePath = $('path', lineSvg);
  const A = Object.fromEntries($$('[data-anchor]', top).map((el) => [el.dataset.anchor, el]));
  const st = { len: 0, full: 0, sw: 0 }; // drawn length, share of the rest forced in by the flood, stroke width
  let total = 0, base = 0, swell = 0, step = 8, env = [], topY = 0;

  // every node has a tangent; handles are a third of the chord, so long and short spans curve alike
  const smooth = (nodes) => {
    const T = nodes.map((q, i) => {
      if (q.t) return q.t;
      const u = nodes[i - 1] || q, v = nodes[i + 1] || q;
      const l = Math.hypot(v.x - u.x, v.y - u.y) || 1;
      return [(v.x - u.x) / l, (v.y - u.y) / l];
    });
    let d = `M${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const u = nodes[i - 1], v = nodes[i];
      if (v.r) { d += `A${v.r} ${v.r} 0 0 ${v.cw} ${v.x} ${v.y}`; continue; }
      const h = Math.hypot(v.x - u.x, v.y - u.y) / 3;
      d += `C${u.x + T[i - 1][0] * h} ${u.y + T[i - 1][1] * h} ${v.x - T[i][0] * h} ${v.y - T[i][1] * h} ${v.x} ${v.y}`;
    }
    return d;
  };
  // a real circle arc from angle a0 to a1 (degrees, screen space), entered and left along its tangent
  const loop = (cx, cy, R, a0, a1) => {
    const cw = a1 > a0 ? 1 : 0, out = [];
    const n = Math.ceil(Math.abs(a1 - a0) / 90);
    for (let i = 0; i <= n; i++) {
      const th = (a0 + (a1 - a0) * i / n) * Math.PI / 180, sg = cw ? 1 : -1;
      out.push({ x: cx + R * Math.cos(th), y: cy + R * Math.sin(th), t: [-Math.sin(th) * sg, Math.cos(th) * sg], r: i ? R : 0, cw });
    }
    return out;
  };
  const paintLine = () => {
    const l = st.len + (total - st.len) * st.full;
    linePath.style.strokeDasharray = `${Math.max(l, 0.01)} ${total + 10}`;
    linePath.style.strokeWidth = st.sw || base;
  };
  const buildLine = () => {
    const box = top.getBoundingClientRect();
    const W = box.width, H = box.height;
    const em = parseFloat(getComputedStyle(document.body).fontSize);
    const R = (el) => { const b = el.getBoundingClientRect(); return { l: b.left - box.left, t: b.top - box.top, w: b.width, h: b.height, r: b.right - box.left, b: b.bottom - box.top }; };
    const hero = R(A.hero), a1 = R(A.a1), t1 = R(A.t1), a2 = R(A.a2), t2 = R(A.t2), cards = R(A.cards), team = R($('.ab-team'));
    const P = (x, y, t) => ({ x, y, t });
    const down = [0, 1];
    const p0 = P(hero.l + hero.w * 0.926, hero.t + hero.h * 0.732);
    let pts, rad;
    if (W >= 768) {
      // out of the hero, a swing to the left edge, behind the first drawing, across to the right behind the second,
      // then one curl in the empty band under the second scene's text
      base = (W >= 992 ? 6.25 : 3) * em;
      rad = (W >= 992 ? 8.6 : 5.4) * em;
      const y6 = Math.max(t1.b + base / 2 + 1.6 * em, a1.t + a1.h * 0.86);
      const cx = Math.max(t2.l + (t2.w * 0.5), rad + base / 2 + em);
      const cy = Math.max(t2.b, a2.t + a2.h * 0.8) + base / 2 + 2 * em + rad;
      pts = [p0,
        P(p0.x + 5.8 * em, hero.b + (W >= 992 ? 14 : 6) * em),
        P(W * 0.465, hero.b + (W >= 992 ? 26.4 : 12) * em),
        P(a1.l + a1.w * 0.3, a1.t),
        P(Math.max(a1.l + em, base / 2 + 0.6 * em), a1.t + a1.h * 0.35, down),
        P(a1.l + a1.w * 0.33, a1.t + a1.h * 0.7),
        P(W * 0.48, y6),
        P(W * 0.68, y6 + (a2.t - y6) * 0.3),
        P(a2.l + a2.w * 0.62, a2.t + a2.h * 0.12, down),
        P(a2.l + a2.w * 0.4, a2.t + a2.h * 0.78),
        ...loop(cx, cy, rad, 80, 372),
        P(cx + rad - 1.2 * em, team.t + team.h * 0.3),
        P(W * 0.48, cards.t + cards.h * 0.5)];
    } else {
      // phones: text sits above its drawing, so the line runs down a gutter beside each text block and ducks behind the art
      base = 1.7 * em;
      rad = 2.6 * em;
      const gl = 1.9 * em, gr = W - 1.9 * em;
      const cy = a2.b + base / 2 + 1.2 * em + rad;
      pts = [p0,
        P(p0.x - 2 * em, hero.b + 2.6 * em),
        P(gl, t1.t - 0.5 * em, down),
        P(gl, t1.b + 0.5 * em, down),
        P(a1.l + a1.w * 0.42, a1.t + a1.h * 0.6),
        P(W * 0.62, a1.b + (t2.t - a1.b) * 0.5),
        P(gr, t2.t - 0.5 * em, down),
        P(gr, t2.b + 0.5 * em, down),
        P(a2.l + a2.w * 0.55, a2.t + a2.h * 0.55),
        ...loop(W * 0.34, cy, rad, 60, 380),
        P(W * 0.5, team.t + team.h * 0.25),
        P(W * 0.5, cards.t + cards.h * 0.4)];
    }
    lineSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    linePath.setAttribute('d', smooth(pts));
    total = linePath.getTotalLength();
    swell = 1.8 * Math.max(W, innerHeight * 1.3);
    // env[i] = the lowest point the line has reached after i steps: how far the page must have scrolled to show it
    topY = box.top + scrollY;
    env = [];
    let m = -Infinity;
    for (let l = 0; l <= total; l += step) { m = Math.max(m, linePath.getPointAtLength(l).y); env.push(m); }
    if (!ok) linePath.style.strokeWidth = base; // no script motion: the whole line, at rest
  };
  // how much of the line is drawn at this scroll position: its tip rides near the bottom of the window,
  // and at the top of the page it is only the ball in the hero drawing, at every screen size
  const lineTarget = () => {
    const y = Math.min(scrollY + innerHeight * 0.8, topY + env[0] + scrollY * 2.4) - topY;
    let lo = 0, hi = env.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; env[mid] <= y ? (lo = mid) : (hi = mid - 1); }
    return Math.min(total, lo * step);
  };

  /* ---------- team popup (a native dialog: focus is trapped and returns to the card) ---------- */
  const pop = $('.ab-pop');
  const popCard = $('.ab-pop__card');
  let opener = null, closing = false;
  const TG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.9 4.3 18.6 19.8c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 13.3l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 2.8c.9-.3 1.7.2 1.4 1.5z"/></svg>';
  const LI = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.6c.6-1.1 2-1.9 3.7-1.9 3.3 0 4 2.1 4 5v6.3h-4v-5.6c0-1.4-.3-2.5-1.8-2.5s-1.9 1.1-1.9 2.5v5.6h-3.8z"/></svg>';
  const closePop = () => {
    if (closing || !pop.open) return;
    const end = () => { closing = false; ok && gsap.set(popCard, { clearProps: 'all' }); pop.close(); };
    if (!ok) return end();
    closing = true;
    gsap.to(popCard, { scale: 0.88, opacity: 0, duration: 0.28, ease: 'power2.inOut', onComplete: end });
  };
  const openPop = (person) => {
    if (closing || pop.open) return;
    opener = $('.ab-card', person);
    const bio = $('.ab-bio', person);
    const img = $('.ab-card__frame img', person);
    $('.ab-pop__img').src = img.currentSrc || img.src;
    $('.ab-pop__img').alt = img.alt;
    $('.ab-pop__name').textContent = $('.ab-card__name', person).textContent;
    $('.ab-pop__role').textContent = `${$('.ab-card__role', person).textContent} · ${bio.dataset.place}`;
    $('.ab-pop__bio').innerHTML = $$('p', bio).map((p) => p.outerHTML).join('');
    $('.ab-pop__links').innerHTML = $$('a', bio).map((a) => `<a href="${a.href}"${a.dataset.tag ? ` data-tag="${a.dataset.tag}"` : ''} target="_blank" rel="noopener">${a.dataset.icon === 'tg' ? TG : LI}${a.textContent}<span class="ab-sr"> (opens in a new tab)</span></a>`).join('');
    pop.showModal();
    TB.lenis && TB.lenis.stop();
    if (!ok) return;
    // the card grows out of the photo that was clicked
    const from = $('.ab-card__frame', person).getBoundingClientRect();
    const to = popCard.getBoundingClientRect();
    gsap.timeline()
      .fromTo(popCard, { x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2), scaleX: Math.max(0.25, from.width / to.width), scaleY: Math.max(0.25, from.height / to.height), opacity: 0.6 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.4)', clearProps: 'transform' }, 0)
      .fromTo($$('.ab-pop__name, .ab-pop__role, .ab-pop__bio p, .ab-pop__links a', pop), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, 0.18)
      .fromTo('.ab-pop__close', { scale: 0, opacity: 0, rotation: -90 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.5)', clearProps: 'all' }, 0.3);
  };
  $$('.ab-person').forEach((p) => $('.ab-card', p).addEventListener('click', () => openPop(p)));
  $('.ab-pop__close').addEventListener('click', closePop);
  pop.addEventListener('click', (e) => { if (e.target === pop) closePop(); });
  pop.addEventListener('cancel', (e) => { e.preventDefault(); closePop(); });
  pop.addEventListener('close', () => { TB.lenis && TB.lenis.start(); opener && opener.focus(); });

  /* ---------- no motion: everything stays as written, the line is shown whole ---------- */
  if (!ok) {
    const still = () => { buildLine(); linePath.style.strokeDasharray = 'none'; };
    still();
    document.fonts.ready.then(still);
    addEventListener('load', still);
    addEventListener('resize', still);
    return;
  }

  /* ---------- hero: comes in when the loader lifts ---------- */
  const h1Lines = $$('.ab-h1 .lm > span');
  const pills = $$('.ab-pill');
  const loopPath = $('.ab-loop path');
  const heroArt = $('.ab-hero .ab-art');
  const heroPara = $('.ab-hero__para');
  TB.draw([loopPath]);
  gsap.set(loopPath, { strokeWidth: 0 });
  gsap.set(h1Lines, { yPercent: 115, opacity: 0 });
  gsap.set(pills, { opacity: 0, scale: 0.4, y: 20 });
  gsap.set(pills.map((p) => p.firstElementChild), { yPercent: 105, opacity: 0, scale: 0.4 });
  gsap.set(heroArt, { opacity: 0, scale: 0.65, rotation: -6 });
  gsap.set(heroPara, { opacity: 0 });
  TB.ready(() => document.fonts.ready.then(() => {
    const T = h1Lines.length * 0.12 + 0.5;
    const para = splitLines(heroPara);
    gsap.set(para, { yPercent: 115, opacity: 0 });
    gsap.set(heroPara, { opacity: 1 });
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } }).timeScale(0.75);
    tl.to(h1Lines, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
      .to(loopPath, { strokeDashoffset: 0, strokeWidth: 30, duration: 0.9 }, T * 0.35)
      .to(heroArt, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)' }, T * 0.45)
      .to(para, { yPercent: 0, opacity: 1, duration: 0.85, stagger: 0.1, ease: 'back.out(1.4)', onComplete: () => unsplit(heroPara) }, T * 0.5);
    pills.forEach((p, i) => {
      const at = T * (0.25 + i * 0.5);
      tl.to(p, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2.5)' }, at)
        .to(p.firstElementChild, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, at + 0.15)
        .to(p.firstElementChild, { scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, T * (0.5 + i * 0.4));
    });
  }));

  /* ---------- the line follows the scroll; near the team block it swells until the block is flooded ---------- */
  top.classList.add('ab-flooding'); // the team block gives up its own orange, the flood brings it
  buildLine();
  st.len = lineTarget();
  paintLine();
  const follow = () => gsap.to(st, { len: lineTarget(), duration: 0.8, ease: 'power2.out', overwrite: 'auto', onUpdate: paintLine });
  ScrollTrigger.create({ trigger: top, start: 'top top', end: 'bottom top', onUpdate: follow });
  const flood = gsap.timeline({ scrollTrigger: { trigger: '.ab-team', start: 'top bottom', end: 'top 15%', scrub: 0.8, invalidateOnRefresh: true } });
  flood.to(st, { full: 1, duration: 0.3, ease: 'power1.in', onUpdate: paintLine }, 0)
    .fromTo(st, { sw: () => base }, { sw: () => swell, duration: 0.6, ease: 'power2.inOut', onUpdate: paintLine }, 0.08)
    .fromTo(flow, { backgroundColor: 'rgba(249, 69, 45, 0)' }, { backgroundColor: 'rgba(249, 69, 45, 1)', duration: 0.72, ease: 'power2.inOut' }, 0.08);
  let rt;
  const rebuild = () => { buildLine(); st.len = lineTarget(); flood.invalidate(); ScrollTrigger.refresh(); paintLine(); };
  let lastW = innerWidth;
  addEventListener('resize', () => { // a phone's address bar changes the height only: the route does not depend on it
    if (innerWidth === lastW) return;
    lastW = innerWidth; clearTimeout(rt); rt = setTimeout(rebuild, 250);
  });
  document.fonts.ready.then(rebuild);
  addEventListener('load', rebuild);

  /* ---------- scenes: label, heading and paragraph rise line by line, the drawing pops in ---------- */
  $$('.ab-scene').forEach((scene, i) => {
    const label = $('.ab-scene__label', scene), h = $('.ab-scene__h', scene), p = $('.ab-scene__p', scene), art = $('.ab-art', scene);
    gsap.set(label, { opacity: 0, y: 16 });
    gsap.set([h, p], { opacity: 0 });
    gsap.set(art, { opacity: 0, scale: 0.65, rotation: i ? 6 : -6 });
    ScrollTrigger.create({
      trigger: scene, start: 'top 85%', once: true,
      onEnter: () => TB.ready(() => document.fonts.ready.then(() => { // never plays under the loader
        const hl = splitLines(h), pl = splitLines(p);
        gsap.set([...hl, ...pl], { yPercent: 115, opacity: 0 });
        gsap.set([h, p], { opacity: 1 });
        gsap.timeline()
          .to(label, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0)
          .to(hl, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'back.out(1.7)' }, 0.05)
          .to(art, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)' }, 0.1)
          .to(pl, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: 'power2.out' }, 0.15)
          .add(() => { unsplit(h); unsplit(p); });
      })),
    });
  });
  gsap.fromTo('.ab-end .ab-art', { opacity: 0, scale: 0.65, rotation: 6 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.ab-end', start: 'top 85%' } });

  /* ---------- house rules: the divider is inked in as its card arrives, the text rises once ---------- */
  $$('.ab-rule').forEach((card, i) => {
    const line = $('.ab-rule__line', card), h = $('.ab-rule__h', card), p = $('.ab-rule__p', card);
    const stick = () => parseFloat(getComputedStyle(card).top) || 0;
    gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: card, start: i ? 'top bottom' : 'top center', end: () => `top ${stick()}px`, scrub: true, invalidateOnRefresh: true } });
    const cs = splitChars(h);
    gsap.set(cs, { yPercent: 115, opacity: 0 });
    gsap.set(p, { opacity: 0 });
    ScrollTrigger.create({
      trigger: card, start: i ? 'top 75%' : 'top 72%', once: true,
      onEnter: () => {
        const pl = splitLines(p);
        gsap.set(pl, { yPercent: 115, opacity: 0 });
        gsap.set(p, { opacity: 1 });
        gsap.timeline()
          .to(cs, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: 'back.out(1.7)' }, 0)
          .to(pl, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.08, ease: 'back.out(1.4)' }, 0.12)
          .add(() => unsplit(p));
      },
    });
  });

  /* ---------- capabilities: a fat zigzag stroke scribbles each pill full ---------- */
  $$('.ab-cap').forEach((pill) => {
    pill.classList.add('is-live');
    pill.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 314 104" preserveAspectRatio="none" aria-hidden="true"><path d="M300 118L262 -10L218 112L172 -10L128 112L84 -10L40 112L12 -14"/></svg>');
    const path = $('path', pill);
    TB.draw([path]);
    const tl = gsap.timeline({ paused: true })
      .to(path, { strokeDashoffset: 0, strokeWidth: 200, duration: 0.95, ease: 'power2.inOut' }, 0)
      .to(pill, { color: '#fdf8f5', duration: 0.6, ease: 'power1.out' }, 0.15);
    const on = () => tl.timeScale(1).play();
    const off = () => tl.timeScale(1.1).reverse();
    pill.addEventListener('pointerenter', on);
    pill.addEventListener('pointerleave', off);
    pill.addEventListener('focus', on);
    pill.addEventListener('blur', off);
  });
})();
