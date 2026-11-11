/* The services hub and the service pages: hero entrance, stickers slapped on by a click, the process line that draws
   through its four stops, scroll reveals, and the film player on the video page. Shared parts live in /main.js (window.TB).
   Without GSAP or with reduced motion (TB.ok is false) nothing is hidden: the line is drawn in full and nothing moves. */
(() => {
  const { $, $$, ok, fine, rnd, ready, lines, pop, reveal, draw } = TB;
  const hero = $('.sv-hero');
  if (!hero) return;

  /* ---------- the process line: a smooth S through the centre of every stop ---------- */
  const body = $('.sv-proc__body');
  let tl = null;
  if (body) {
    const svg = $('.sv-line', body), ghost = $('.sv-line__ghost', body), dark = $('.sv-line__dark', body);
    const nodes = $$('.sv-stop__n', body);
    const state = { p: ok ? 0 : 1 };
    let len = 0;
    const paint = () => { dark.style.strokeDashoffset = len * (1 - state.p); };
    const build = () => {
      const b = body.getBoundingClientRect();
      const pts = nodes.map((n) => { const r = n.getBoundingClientRect(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; });
      let d = `M${pts[0][0]} 0L${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], h = (y1 - y0) * 0.55;
        d += `C${x0} ${y0 + h} ${x1} ${y1 - h} ${x1} ${y1}`;
      }
      d += `L${pts[pts.length - 1][0]} ${b.height}`;
      svg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
      ghost.setAttribute('d', d); dark.setAttribute('d', d);
      len = dark.getTotalLength();
      dark.style.strokeDasharray = len;
      paint();
      return pts.map((q) => q[1] / b.height); // roughly where along the line each stop sits
    };
    const at = build(); // measured before anything is scaled
    if (ok) {
      tl = gsap.timeline({ scrollTrigger: { trigger: body, start: 'top 72%', end: 'bottom 78%', scrub: 1.1, invalidateOnRefresh: true } });
      tl.to(state, { p: 1, duration: 1, ease: 'none', onUpdate: paint }, 0);
      $$('.sv-stop', body).forEach((s, i) => {
        const t = Math.max(0, at[i] - 0.07);
        tl.fromTo($('.sv-stop__n', s), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.09, ease: 'back.out(3)' }, t)
          .fromTo($('.sv-stop__t', s), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.1, ease: 'power2.out' }, t + 0.02);
      });
    }
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const p = tl ? tl.progress() : 1; tl && tl.progress(1); build(); tl && tl.progress(p); }, 250); });
    document.fonts && document.fonts.ready.then(build);
  }

  /* ---------- click the hero: one of our own stickers lands where you clicked ---------- */
  const tray = $$('.sv-slap > *', hero);
  const stuck = [];
  let next = Math.floor(rnd(0, tray.length));
  hero.addEventListener('click', (e) => {
    if (!tray.length || e.target.closest('a, button')) return;
    const r = hero.getBoundingClientRect();
    const s = tray[next++ % tray.length].cloneNode(true);
    s.style.left = `${e.clientX - r.left}px`; s.style.top = `${e.clientY - r.top}px`;
    hero.append(s); stuck.push(s);
    const rot = rnd(-22, 22);
    if (ok) gsap.fromTo(s, { scale: 0.65, rotation: rot + 6, opacity: 0 }, { scale: 1, rotation: rot, opacity: 1, duration: 0.85, ease: 'back.out(2.2)' });
    else s.style.transform = `rotate(${rot}deg)`;
    if (stuck.length > 14) { // the oldest peels off
      const old = stuck.shift();
      ok ? gsap.to(old, { y: 60, rotation: '+=40', opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => old.remove() }) : old.remove();
    }
  });

  /* ---------- the film player (video page): a poster is a link to YouTube; with the script it plays here ---------- */
  const films = $$('.sv-film a[data-yt]');
  if (films.length) {
    const dlg = document.createElement('dialog');
    dlg.className = 'sv-player'; dlg.setAttribute('aria-label', 'Film player');
    dlg.innerHTML = '<button class="closebtn" type="button"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg>Close</button>';
    document.body.append(dlg);
    const shut = () => dlg.close();
    $('button', dlg).addEventListener('click', shut);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) shut(); });
    dlg.addEventListener('close', () => { const f = $('iframe', dlg); f && f.remove(); TB.lenis && TB.lenis.start(); });
    films.forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      const tall = a.parentNode.classList.contains('sv-film--v');
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${a.dataset.yt}?autoplay=1&rel=0&playsinline=1`;
      f.title = a.getAttribute('aria-label').replace(/^Play /, '');
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      f.dataset.shape = tall ? 'v' : 'w';
      f.style.setProperty('--ar', tall ? '9 / 16' : '16 / 9');
      dlg.append(f);
      dlg.showModal();
      TB.lenis && TB.lenis.stop();
    }));
  }

  if (!ok) return;

  /* ---------- hub hero story (tablet and up), scrubbed by the scroll:
     1. a big beaker on the left, the logos piled inside it at all angles
     2. it cracks, shakes and breaks: the glass falls in pieces and stays on the floor, the logos tumble out one by one
     3. the camel on the right gets up, frame by frame (a drawn image sequence), while the glass fades away
     4. the logos fly out to their places, left and right ---------- */
  const seq = $('.sv-beaker', hero) && matchMedia('(min-width: 768px)').matches;
  if (seq) {
    hero.classList.add('sv-seq');
    const stage = $('.sv-hub__stage', hero), cam = $('.sv-cam', hero), bk = $('.sv-beaker', hero);
    const stand = $('.sv-hub__art', cam);
    const logos = $$('.sv-cloud__a', hero);
    const shards = $$('.bk__shard', bk);
    const em = () => parseFloat(getComputedStyle(stage).fontSize);
    const R = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };   // steady "random"
    const home = (a) => [a.offsetLeft + a.offsetWidth / 2, a.offsetTop + a.offsetHeight / 2];
    // piled inside the glass: three to a layer from the bottom up, each at its own angle, overlapping
    const inJar = (i, a) => {
      const [hx, hy] = home(a), c = i % 3, r = Math.floor(i / 3);
      const x = bk.offsetLeft + bk.offsetWidth * (0.3 + 0.2 * c + (R(i, 1) - 0.5) * 0.09);
      const y = bk.offsetTop + bk.offsetHeight * (0.82 - 0.15 * r + (R(i, 2) - 0.5) * 0.05);
      return [x - hx, y - hy];
    };
    const jarTilt = (i) => (R(i, 3) - 0.5) * 150;
    // where each lands: scattered over the floor between the glass and the camel, in no order
    const onFloor = (i, a) => {
      const [hx, hy] = home(a), n = logos.length;
      const slot = Math.floor(R(i, 4) * n * 7) % n;
      const x0 = bk.offsetLeft + bk.offsetWidth * 0.1, span = Math.max(10 * em(), cam.offsetLeft + cam.offsetWidth * 0.32 - x0);
      const x = x0 + span * Math.pow((slot + 0.5) / n, 1.3) + (R(i, 5) - 0.5) * 3 * em();   // denser near the glass
      const y = stage.offsetHeight - a.offsetHeight * 0.3 - (0.1 + R(i, 6) * 3.2) * em();   // some land behind others: a heap, not a row
      return [x - hx, y - hy];
    };
    gsap.set(logos, { x: (i, a) => inJar(i, a)[0], y: (i, a) => inJar(i, a)[1], scale: 0.6, rotation: jarTilt, zIndex: 2 });
    gsap.set(cam, { x: () => 13 * em() });

    // the camel getting up: frames drawn into a canvas; the crisp drawing takes over on the last one
    const cv = document.createElement('canvas');
    cv.className = 'sv-cam__seq'; cv.setAttribute('aria-hidden', 'true');
    cam.appendChild(cv);
    const cx = cv.getContext('2d');
    const N = +cam.dataset.frames || 0, base = cam.dataset.base || '';
    const imgs = [];
    const cur = { f: 0 };
    let drawn = -1;
    const paint = () => {
      let k = Math.round(cur.f);
      while (k > 0 && !(imgs[k] && imgs[k].complete && imgs[k].naturalWidth)) k--;
      const im = imgs[k];
      if (!im || !im.complete || !im.naturalWidth || k === drawn) return;
      if (cv.width !== im.naturalWidth) { cv.width = im.naturalWidth; cv.height = im.naturalHeight; }
      cx.clearRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0); drawn = k;
    };
    for (let k = 0; k < N; k++) { const im = new Image(); im.decoding = 'async'; if (k === 0) im.onload = paint; im.src = `${base}${String(k).padStart(3, '0')}.webp`; imgs.push(im); }
    gsap.set(stand, { opacity: 0 });

    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'clamp(bottom bottom)', end: '+=2600', pin: true, scrub: 0.6, invalidateOnRefresh: true } });
    // 1. the crack runs, the glass shudders
    tl.to('.bk__crack', { strokeDashoffset: 0, duration: 0.1, ease: 'none' }, 0)
      .to(bk, { rotation: 2.5, duration: 0.025, yoyo: true, repeat: 3, ease: 'sine.inOut', transformOrigin: '50% 100%' }, 0.03)
      .to('.bk__crack', { opacity: 0, duration: 0.02 }, 0.125);
    // 2. the pieces drop where they are, bounce once and lie on the floor at an angle
    shards.forEach((sh, k) => {
      const [cxs, cys] = sh.dataset.c.split(' ').map(Number), bot = +sh.dataset.b;   // svg units, from the beaker file
      const drop = 472 - bot - R(k, 7) * 6;                                           // the beaker's floor is its bottom edge
      const out = (cxs - 190) * (0.35 + R(k, 8) * 0.6) + (R(k, 9) - 0.5) * 70;
      const spin = (R(k, 10) - 0.5) * 120;
      gsap.set(sh, { svgOrigin: `${cxs} ${cys}` });
      tl.to(sh, { y: drop, duration: 0.09, ease: 'bounce.out' }, 0.13 + R(k, 11) * 0.05)
        .to(sh, { x: out, rotation: spin, duration: 0.1, ease: 'power2.out' }, '<');
    });
    // the logos tumble out one by one: a fall with a bounce, a drift and a spin, landing scattered
    logos.forEach((a, i) => {
      const t0 = 0.15 + i * 0.015;
      tl.to(a, { y: onFloor(i, a)[1], duration: 0.1, ease: 'bounce.out' }, t0)
        .to(a, { x: onFloor(i, a)[0], duration: 0.1, ease: 'power1.out' }, t0)
        .to(a, { rotation: jarTilt(i) + (R(i, 12) > 0.5 ? 1 : -1) * (90 + R(i, 13) * 140), scale: 0.62, duration: 0.1, ease: 'power2.out' }, t0);
    });
    // 3. the camel gets up, slowly; the glass fades while he does
    tl.to(cur, { f: Math.max(0, N - 1), duration: 0.32, ease: 'none', onUpdate: paint }, 0.42)
      .to(shards, { opacity: 0, duration: 0.12, stagger: 0.006 }, 0.52)
      .to(stand, { opacity: 1, duration: 0.02 }, 0.74).to(cv, { opacity: 0, duration: 0.02 }, 0.755)
      .to(cam, { x: 0, duration: 0.12, ease: 'power2.inOut' }, 0.76);
    // 4. the logos go home, left and right
    tl.to(logos, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.16, ease: 'back.out(1.5)', stagger: { each: 0.012, from: 'random' } }, 0.8)
      .set(logos, { zIndex: 'auto' }, 1);
  }

  /* ---------- hero: lines rise, stickers and pills pop, the two squiggles draw themselves ---------- */
  const stk = $$(seq ? '.sv-hero__text .sv-stk' : '.sv-hero__text .sv-stk, .sv-cloud__a', hero);
  const pills = $$('.sv-pill', hero);
  const rest = $$(seq ? '.sv-crumb, .sv-joke, .sv-intro, .sv-hero__cta, .sv-hint' : '.sv-crumb, .sv-joke, .sv-intro, .sv-hero__cta, .sv-hint, .sv-hub__art', hero);
  const paths = $$('.hero__path path', hero);
  draw(paths);
  gsap.set(stk, { scale: 0.65, rotation: 6, opacity: 0 });
  gsap.set(pills, { scale: 0, opacity: 0 });
  gsap.set(rest, { y: 24, opacity: 0 });
  gsap.set($$('.sv-h1 .lm > span', hero), { yPercent: 115 });
  ready(() => {
    lines($('.sv-hero__text', hero));
    gsap.to(stk, { scale: 1, rotation: 0, opacity: 1, duration: 0.85, ease: 'back.out(2.2)', stagger: 0.09, delay: 0.35 });
    pop(pills, false, { delay: 0.55, stagger: 0.12 });
    gsap.to(rest, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', stagger: 0.08, delay: 0.5 });
    gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.15, delay: 0.2 });
  });
  if (fine) $$('.sv-hero__text .sv-stk', hero).forEach((s) => {
    s.addEventListener('mouseenter', () => gsap.timeline().to(s, { rotation: rnd(6, 12) * (Math.random() < 0.5 ? -1 : 1), scale: 1.08, duration: 0.25, ease: 'power2.out' }).to(s, { rotation: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' }));
  });

  /* ---------- scroll reveals, all at "top 85%" ---------- */
  const rise = (els, vars) => els.forEach((el) => {
    gsap.set(el, { opacity: 0, y: 40 });
    reveal(el, () => gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: 'back.out(1.4)', ...vars }));
  });
  const art = (els) => els.forEach((el) => {
    gsap.set(el, { scale: 0.65, rotation: 6, opacity: 0 });
    reveal(el, () => gsap.to(el, { scale: 1, rotation: 0, opacity: 1, duration: 0.85, ease: 'back.out(2.2)' }));
  });
  rise($$('.sv .shead .sheading, .sv-fit__l, .sv-proof__txt, .sv-tools h2, .sv-tools > p, .sv-group__l, .sv-rel > .sv-link, .sv-end__p'));
  rise($$('.sv-price > p:not(.label), .sv-price > .cta'), { delay: 0.35 });
  art($$('.sv-fit__card, .sv-film'));
  $$('.sv-list').forEach((ul) => $$('.sv-item', ul).forEach((it, i) => {
    const ic = $('i', it), tx = $('div', it);
    gsap.set(ic, { scale: 0, opacity: 0 }); gsap.set(tx, { opacity: 0, y: 30 });
    reveal(it, () => {
      gsap.to(ic, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.5)', delay: (i % 2) * 0.12 });
      gsap.to(tx, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: (i % 2) * 0.12 + 0.08 });
    });
  }));
  $$('.sv-rows').forEach((ul) => $$('.sv-row', ul).forEach((r) => {
    gsap.set(r, { opacity: 0, y: 30 });
    reveal(r, () => gsap.to(r, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' }));
  }));
  $$('.sv-commit ul, .sv-tools ul').forEach((ul) => pop($$('li', ul), true));
  $$('.sv-price').forEach((s) => lines(s, true));
  /* closing block: the home page's "there's more" recipe */
  $$('.sv-end').forEach((end) => {
    const pl = $$('.pend__para .lm > span', end), pp = $$('.ppill', end), pb = $('.cta', end);
    gsap.set(pl, { yPercent: 115 });
    gsap.set([...pp, pb], { opacity: 0, scale: 0.4 });
    const t = gsap.timeline({ scrollTrigger: { trigger: end, start: 'top 80%' } });
    t.to(pl, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' });
    pp.forEach((p, i) => t.to(p, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.45 + i * 0.12));
    t.to(pb, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.8);
  });
})();
