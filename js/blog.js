/* The Brandle blog: the listing's filter and entrance, and on a post the hero, the reading line with its camel,
   the table of contents and the closing block. Shared parts live in /main.js (window.TB). */
(() => {
  const { $, $$, ok } = TB;
  const html = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  /* ---------- listing: filter by group, kept in the address hash ---------- */
  const btns = $$('.bf');
  if (btns.length) {
    const items = $$('.blog .pitem');
    const note = $('.bcount');
    const names = Object.fromEntries(btns.map((b) => [b.dataset.g, b.firstChild.textContent.trim()]));
    const apply = (g, animate) => {
      if (!names[g]) g = 'all';
      btns.forEach((b) => { const on = b.dataset.g === g; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      const shown = items.filter((it) => { const s = g === 'all' || it.dataset.g === g; it.hidden = !s; return s; });
      note.textContent = g === 'all' ? '' : `${shown.length} ${names[g]} guides. The other ${items.length - shown.length} are sulking.`;
      if (!ok) return;
      if (animate) gsap.fromTo(shown, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.5)', stagger: 0.04, clearProps: 'transform,opacity' });
      ScrollTrigger.refresh();
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const g = b.dataset.g;
      history.replaceState(null, '', g === 'all' ? location.pathname : '#' + g);
      apply(g, true);
    }));
    addEventListener('hashchange', () => apply(location.hash.slice(1), true));
    if (location.hash) apply(location.hash.slice(1), false);

    if (ok) {
      const lines = $$('.bhero .lm > span');
      const pills = $$('.bhero .pill');
      gsap.set(lines, { yPercent: 115 });
      gsap.set(pills, { opacity: 0, scale: 0.4 });
      gsap.set('.bhero .label, .bhero__lead', { opacity: 0, y: 15 });
      gsap.set('.bhero__art', { opacity: 0, scale: 0.65, rotation: 6 });
      TB.ready(() => {
        gsap.timeline()
          .to('.bhero .label', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
          .to(lines, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
          .to('.bhero__art', { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)' }, 0.25)
          .to(pills, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.12, ease: 'back.out(2.5)' }, 0.55)
          .to('.bhero__lead', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.6);
      });
      gsap.from(btns, { opacity: 0, scale: 0.4, duration: 0.55, stagger: 0.06, ease: 'back.out(2.5)', scrollTrigger: { trigger: '.bfilter', start: 'top 85%' } });
    }
  }

  const post = $('.post');
  if (!post) return;
  const col = $('.pcol');

  /* ---------- reading progress bar: phones, and everywhere when motion is off ---------- */
  const bar = $('.pbar i');
  let queued = false;
  const fill = () => {
    queued = false;
    const r = col.getBoundingClientRect();
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, (innerHeight * 0.55 - r.top) / r.height))})`;
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(fill); } }, { passive: true });

  /* ---------- table of contents (long posts): marks the section being read ---------- */
  const links = $$('.ptoc a');
  if (links.length) {
    links.forEach((a) => a.addEventListener('click', (e) => {
      const t = document.getElementById(a.hash.slice(1));
      if (!t || !TB.lenis) return;        // without smooth scrolling the browser's own jump does the job
      e.preventDefault();
      TB.lenis.scrollTo(t, { offset: -70 });
      history.replaceState(null, '', a.hash);
    }));
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => (a.hash === '#' + e.target.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    }), { rootMargin: '-15% 0px -70% 0px' });
    $$('.prose h2').forEach((h) => io.observe(h));
  }

  if (!ok) return;

  /* ---------- hero: comes in when the loader lifts ---------- */
  const h1 = $('.phero__h');
  h1.innerHTML = h1.textContent.trim().split(/\s+/).map((w) => `<span class="lm"><span>${html(w)}</span></span>`).join(' ');
  const words = $$('.lm > span', h1);
  gsap.set(words, { yPercent: 120 });
  gsap.set('.crumbs, .phero__lead, .phero__meta', { opacity: 0, y: 15 });
  gsap.set('.phero__group', { opacity: 0, scale: 0.4 });
  gsap.set('.phero__art', { opacity: 0, scale: 0.65, rotation: 6 });
  TB.ready(() => {
    gsap.timeline()
      .to('.crumbs', { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(words, { yPercent: 0, duration: 0.85, stagger: Math.min(0.06, 0.6 / words.length), ease: 'back.out(1.4)' }, 0)
      .to('.phero__group', { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.4)
      .to('.phero__lead, .phero__meta', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.45)
      .to('.phero__art', { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)' }, 0.55);
  });

  /* ---------- the reading line: drawn down the margin as you read, with a camel walking at its tip ---------- */
  const rail = $('.prail');
  if (matchMedia('(min-width: 768px)').matches) {
    post.classList.add('has-rail');
    const svg = $('.pline'), ghost = $('.pline__ghost'), dark = $('.pline__dark'), camel = $('.pcamel'), vid = $('video', camel);
    const st = { p: 0 };
    let len = 0, gap = 0, was = 0, side = 1, dir = 1, idle = 0;
    vid.addEventListener('playing', () => camel.classList.add('is-live'), { once: true });
    const paint = () => {
      const at = st.p * len;
      // the line stops short of the camel on both sides, so nothing shows through it
      dark.style.strokeDasharray = `${Math.max(0, at - gap)} ${len + 1}`;
      ghost.style.strokeDashoffset = -Math.min(len, at + gap);
      const a = dark.getPointAtLength(at), b = dark.getPointAtLength(Math.min(len, at + 6));
      if (Math.abs(b.x - a.x) > 0.2) side = b.x > a.x ? 1 : -1;
      gsap.set(camel, { x: a.x, y: a.y, scaleX: side * dir });
    };
    const build = () => {
      const W = rail.clientWidth, H = rail.clientHeight, em = parseFloat(getComputedStyle(rail).fontSize);
      const wide = W > 14 * em;
      const cx = wide ? W - 9.5 * em : W / 2 - 0.4 * em;
      const amp = wide ? 3.4 * em : Math.max(0.6 * em, W / 2 - 2.6 * em);
      const n = Math.max(2, Math.round(H / (24 * em))), h = H / n;
      let d = `M${cx} 0`, px = cx;
      for (let i = 1; i <= n; i++) {      // one gentle S per step, swinging left and right of the centre
        const x = i === n ? cx : cx + (i % 2 ? amp : -amp), y = i * h;
        d += `C${px} ${y - h / 2} ${x} ${y - h / 2} ${x} ${y}`;
        px = x;
      }
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      ghost.setAttribute('d', d); dark.setAttribute('d', d);
      len = dark.getTotalLength();
      gap = 3.3 * em;
      ghost.style.strokeDasharray = `${len} ${len}`;
      paint();
    };
    build();
    gsap.to(st, {
      p: 1, ease: 'none',
      onUpdate: () => {
        if (Math.abs(st.p - was) > 1e-5) {      // moving: the camel walks, and stops a moment after the page does
          dir = st.p > was ? 1 : -1;
          if (vid.paused && !document.hidden) vid.play().catch(() => {});
          clearTimeout(idle);
          idle = setTimeout(() => vid.pause(), 180);
        }
        was = st.p;
        paint();
      },
      scrollTrigger: { trigger: col, start: 'top 55%', end: 'bottom 55%', scrub: 0.5, onRefresh: build },
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) vid.pause(); });
  }

  /* ---------- closing block ---------- */
  const cl = $$('.pcta .lm > span');
  const cp = $$('.pcta .pill');
  gsap.set(cl, { yPercent: 115 });
  gsap.set(cp, { opacity: 0, scale: 0.4 });
  gsap.timeline({ scrollTrigger: { trigger: '.pcta', start: 'top 75%' } })
    .to(cl, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' })
    .to(cp, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.12, ease: 'back.out(2.5)' }, 0.4)
    .from('.pcta__p, .pcta .cta', { opacity: 0, y: 15, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 0.6);
})();

/* blog hero: "worth every dirham" tours the currencies of the people reading it */
(() => {
  const w = document.querySelector('.bflip');
  if (!w || !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MONEY = ['dirham', 'dollar', 'riyal', 'pound', 'lira', 'euro', 'rupee', 'penny'];
  let i = 0;
  const next = () => {
    i = (i + 1) % MONEY.length;
    gsap.timeline()
      .to(w, { yPercent: -110, duration: 0.35, ease: 'power2.in' })
      .add(() => { w.textContent = MONEY[i]; })
      .fromTo(w, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'back.out(1.6)' });
  };
  setTimeout(() => setInterval(next, 2200), 2400);
})();
