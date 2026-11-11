/* Work index and project pages. Reads its helpers from main.js (window.TB). Everything is visible and usable when
   TB.ok is false: start states are set here, never in the stylesheet. */
(() => {
  const { $, $$, ok, fine, reduce, ready, draw } = TB;

  /* ---------- looping videos load and play only while they are on screen; under reduced motion they wait for a press ---------- */
  const vids = $$('.pvid');
  if (reduce) vids.forEach((v) => { v.controls = true; });
  else if (vids.length) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: 0.2 });
    vids.forEach((v) => vio.observe(v));
  }

  /* ---------- Work index: hero entrance (one timeline at 0.75 speed, values from two26.studio) ---------- */
  const whero = $('.whero');
  if (whero && ok) {
    const lines = $$('.whero__h .lm > span', whero), pills = $$('.whero__pill', whero), path = $('.whero__path path', whero);
    const art = $('.whero__art', whero), para = $('.whero__para > span', whero);
    const T = 0.12 * lines.length + 0.5;
    gsap.set([lines, para], { yPercent: 115, opacity: 0 });
    gsap.set(pills, { scale: 0.4, y: 20, opacity: 0 });
    gsap.set(pills.map((p) => p.firstElementChild), { yPercent: 105, opacity: 0 });
    gsap.set(art, { opacity: 0, scale: 0.65, rotation: -6 });
    draw([path]); gsap.set(path, { strokeWidth: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } }).timeScale(0.75)
      .to(lines, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.4)', stagger: 0.12 }, 0)
      .to(path, { strokeDashoffset: 0, strokeWidth: 30, duration: 0.9 }, 0.35 * T)
      .to(art, { opacity: 1, scale: 1, rotation: 0, duration: 0.85, ease: 'back.out(2.2)' }, 0.45 * T)
      .to(para, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.4)' }, 0.5 * T);
    pills.forEach((p, i) => {
      tl.to(p, { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: 'back.out(2.5)' }, (0.25 + 0.25 * i) * T)
        .to(p.firstElementChild, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, (0.25 + 0.25 * i) * T + 0.15);
    });
    ready(() => tl.play());
  }

  /* ---------- Work index: two pills trail the cursor over a card, the project's name and where the click goes ---------- */
  const follow = $('.pfollow');
  if (follow && ok && fine) {
    const [name, go] = $$('.pill', follow), label = name.firstElementChild;
    const a = { x: 0, y: 0 }, b = { x: 0, y: 0 }, m = { x: 0, y: 0 };
    let on = false;
    follow.style.display = 'block';
    gsap.set([name, go], { scale: 0 });
    const tick = () => {
      a.x += (m.x - a.x) * 0.16; a.y += (m.y - a.y) * 0.16;       // the name follows the cursor,
      b.x += (a.x - b.x) * 0.12; b.y += (a.y - b.y) * 0.12;       // the second pill follows the name
      gsap.set(name, { x: a.x + 18, y: a.y + 14 });
      gsap.set(go, { x: b.x + 30, y: b.y + 62 });
    };
    const move = (e) => { m.x = e.clientX; m.y = e.clientY; };
    const leave = () => {
      if (!on) return;
      on = false;
      gsap.to([name, go], { scale: 0, duration: 0.25, ease: 'back.in(1.7)', stagger: 0.03, overwrite: true, onComplete: () => { if (!on) gsap.ticker.remove(tick); } });
    };
    $$('.projects--index .pitem').forEach((it) => {
      it.addEventListener('mouseenter', (e) => {
        label.textContent = it.dataset.title;
        move(e);
        if (!on) { a.x = b.x = m.x; a.y = b.y = m.y; gsap.ticker.add(tick); }
        on = true;
        gsap.to([name, go], { scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.05, overwrite: true });
      });
      it.addEventListener('mousemove', move);
      it.addEventListener('mouseleave', leave);
    });
    addEventListener('scroll', leave, { passive: true });     // the card slides out from under a still cursor
  }

  /* ---------- project page ---------- */
  const phero = $('.phero');
  if (!phero) return;

  /* the header's line of text turns light while the dark cover is behind it */
  new IntersectionObserver(([e]) => document.body.classList.toggle('on-cover', e.isIntersecting), { rootMargin: '-40px 0px 0px 0px' }).observe(phero);

  /* the big frame: the site's stills cut from one to the next by themselves, slowly, while it is on screen */
  $$('.pslides').forEach((box) => {
    const ims = $$('img', box);
    if (ims.length < 2 || reduce) return;
    let k = 0, t = 0;
    new IntersectionObserver(([e]) => {
      clearInterval(t);
      if (!e.isIntersecting) return;
      ims.forEach((im) => { if (im.dataset.src) { im.src = im.dataset.src; im.removeAttribute('data-src'); } });
      t = setInterval(() => {
        const n = (k + 1) % ims.length;
        if (!ims[n].complete || !ims[n].naturalWidth) return;
        ims[k].classList.remove('is-on'); ims[n].classList.add('is-on'); k = n;
      }, 2400);
    }, { threshold: 0.25 }).observe(box);
  });

  if (!ok) return;

  /* cover entrance: the scene settles from a slight zoom while the name rises from its mask and the label pops */
  const title = $$('.phero__h .lm > span', phero), type = $('.phero__type', phero);
  gsap.set(title, { yPercent: 115, opacity: 0 });
  gsap.set(type, { scale: 0.4, y: 20, opacity: 0 });
  gsap.set($('.mock', phero), { scale: 1.08 });
  ready(() => {
    gsap.to($('.mock', phero), { scale: 1, duration: 1.6, ease: 'power3.out' });
    gsap.to(title, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.4)', stagger: 0.12, delay: 0.1 });
    gsap.to(type, { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: 'back.out(2.5)', delay: 0.45 });
  });

  /* text blocks and media arrive quietly, once */
  $$('.ptext').forEach((t) => {
    gsap.from([$('.ptext__label', t), ...$('.ptext__col', t).children], { y: 30, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });
  $$('[data-reveal]').forEach((b) => {
    gsap.from(b, { y: 60, scale: 0.94, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 92%' } });
  });

  /* next project: its name rises, its arrow pops */
  const next = $('.pnext__link');
  const nl = $$('.pnext__title .lm > span', next);
  gsap.set(nl, { yPercent: 115, opacity: 0 });
  gsap.set($('.pnext__arrow', next), { scale: 0 });
  gsap.timeline({ scrollTrigger: { trigger: next, start: 'top 85%' } })
    .to(nl, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.4)', stagger: 0.12 })
    .to($('.pnext__arrow', next), { scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.3);
})();

/* films: loops play only while on screen; the button swaps in the YouTube film with sound */
(() => {
  const films = document.querySelectorAll('.film__media');
  if (!films.length) return;
  const io = new IntersectionObserver((es) => es.forEach(({ target, isIntersecting }) => {
    const vid = target.querySelector('video');
    if (!vid) return;
    if (isIntersecting) { if (!vid.src) vid.src = vid.dataset.src; if (!matchMedia('(prefers-reduced-motion: reduce)').matches) vid.play().catch(() => {}); }
    else vid.pause();
  }), { rootMargin: '10% 0px' });
  films.forEach((f) => io.observe(f));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.film__play');
    if (!b) return;
    const box = b.parentElement;
    box.querySelector('video')?.remove();
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${b.dataset.yt}?autoplay=1&rel=0" title="${b.getAttribute('aria-label').replace('Watch ', '').replace(' with sound', '')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  });
})();
