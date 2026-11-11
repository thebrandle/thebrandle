/* The Brandle team page: a card opens a popup that grows out of it (same idea as the About page's team block).
   The popup is a <dialog>, so focus trapping, Escape and focus return are the browser's. With no script the bios
   simply sit under each card. */
(() => {
  const { $, $$, ok } = TB;
  const pop = $('.tm-pop');
  const card = $('.tm-pop__card');
  const img = $('.tm-pop__img');
  const name = $('.tm-pop__name');
  const role = $('.tm-pop__role');
  const bio = $('.tm-pop__bio');
  const closeBtn = $('.tm-pop__close');
  $('.tm').classList.add('tm-js'); // hides the in-card bios and shows the "+" badges

  const open = (c) => {
    const src = $('.tm-frame img', c);
    img.src = src.currentSrc || src.src; img.alt = src.alt;
    name.textContent = $('.tm-name', c).textContent;
    role.textContent = $('.tm-role', c).textContent;
    bio.innerHTML = $('.tm-bio', c).innerHTML;
    pop.showModal();
    TB.lenis && TB.lenis.stop();
    if (!ok) return;
    const a = $('.tm-frame', c).getBoundingClientRect();
    gsap.set(card, { clearProps: 'all' });
    const b = card.getBoundingClientRect();
    gsap.timeline()
      .fromTo(card,
        { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scaleX: Math.max(0.25, a.width / b.width), scaleY: Math.max(0.25, a.height / b.height), opacity: 0.6 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.4)', clearProps: 'transform' }, 0)   // no transform left behind: the pinned Close button needs a plain card
      .fromTo([name, role, ...bio.children], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, 0.18)
      .fromTo(closeBtn, { scale: 0, opacity: 0, rotation: -90 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.5)' }, 0.3);
  };
  const close = () => {
    if (!ok) return pop.close();
    gsap.to(card, { scale: 0.88, opacity: 0, duration: 0.28, ease: 'power2.inOut', onComplete: () => pop.close() });
  };
  $$('.tm-card').forEach((c) => c.addEventListener('click', (e) => { if (!e.target.closest('a')) open(c); })); // the button inside makes it keyboard reachable
  closeBtn.addEventListener('click', close);
  pop.addEventListener('click', (e) => { if (e.target === pop) close(); });
  pop.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  pop.addEventListener('close', () => TB.lenis && TB.lenis.start());

  if (!ok) return;

  /* ---------- hero ---------- */
  const lines = $$('.tm-hero .lm > span');
  const pills = $$('.tm-hero .pill');
  gsap.set(lines, { yPercent: 115 });
  gsap.set(pills, { opacity: 0, scale: 0.4 });
  gsap.set('.tm-lede', { opacity: 0, y: 20 });
  TB.ready(() => {
    gsap.timeline()
      .to(lines, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
      .to(pills, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2.5)' }, 0.45)
      .to('.tm-lede', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5);
  });

  /* ---------- cards pop in, text follows ---------- */
  $$('.tm-cards').forEach((row) => {
    const cs = $$('.tm-card', row);
    gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%' } })
      .from(cs.map((c) => $('.tm-card__open', c)), { scale: 0.65, rotation: (i) => (i % 2 ? -6 : 6), opacity: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(2.2)' }, 0)
      .from(cs.flatMap((c) => $$('.tm-name, .tm-role, .tm-loc', c)), { y: 20, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, 0.3);
  });
  const el = $$('.tm-end .lm > span');
  gsap.set(el, { yPercent: 115 });
  gsap.to(el, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.tm-end', start: 'top 85%' } });

})();
