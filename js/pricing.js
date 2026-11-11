/* The Brandle pricing page: the Build / Grow switch, rolling prices, plan cards, the printing receipt.
   The switch itself is two radio inputs read by CSS, so it works with no script; this file only adds the motion. */
(() => {
  const { $, $$, ok } = TB;
  if (!ok) return;

  const grow = () => $('#tier-grow').checked;
  const sw = $('.sw');
  const knob = $('.sw__knob');
  sw.classList.add('sw--js');
  gsap.set(knob, { xPercent: grow() ? 100 : 0 });

  /* ---------- prices: one strip of 0 to 9 per digit, rolled to the digit of the chosen tier ---------- */
  $$('.price__n').forEach((p) => {
    const b = p.dataset.build, g = p.dataset.grow; // "2,499" and "3,199": always the same length
    const roll = document.createElement('span');
    roll.className = 'price__roll';
    roll.setAttribute('aria-hidden', 'true');
    roll.innerHTML = [...b].map((c, i) => (/\d/.test(c) ? `<span class="rd"><span class="rd__s" data-b="${c}" data-g="${g[i]}">${[...'0123456789'].map((d) => `<b>${d}</b>`).join('')}</span></span>` : c)).join('');
    $$('[data-tier]', p).forEach((s) => s.classList.add('vh')); // screen readers keep the plain number
    p.append(roll);
  });
  const strips = $$('.rd__s');
  const digit = (i, el) => -10 * el.dataset[grow() ? 'g' : 'b'];
  gsap.set(strips, { yPercent: digit });

  const plans = $$('.plan');
  $$('.sw input').forEach((r) => r.addEventListener('change', () => {
    const g = grow();
    gsap.to(knob, { xPercent: g ? 100 : 0, duration: 0.8, ease: 'elastic.out(1, 0.55)', overwrite: true });
    gsap.fromTo(knob, { scaleX: 1.3, scaleY: 0.84 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    gsap.to(strips, { yPercent: digit, duration: 0.8, ease: 'back.out(1.4)', stagger: 0.04, overwrite: true });
    gsap.fromTo(plans, { rotation: g ? 2.5 : -2.5 }, { rotation: 0, duration: 0.9, ease: 'elastic.out(1.1, 0.4)', stagger: 0.05, overwrite: 'auto' });
    gsap.fromTo($$(`.plan__list[data-tier="${g ? 'grow' : 'build'}"] li`), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.025 });
    ScrollTrigger.refresh(); // the two tiers' lists differ in height
  }));

  /* ---------- hero ---------- */
  const paths = $$('.hero__path path');
  TB.draw(paths);
  const lines = $$('.pr-hero .lm > span');
  const pills = $$('.pr-hero .pill');
  gsap.set(lines, { yPercent: 115 });
  gsap.set(pills, { opacity: 0, scale: 0.4 });
  gsap.set('.pr-lede', { opacity: 0, y: 20 });
  TB.ready(() => {
    gsap.timeline()
      .to(lines, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
      .to(pills, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2.5)' }, 0.45)
      .to('.pr-lede', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.5)
      .to(paths, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.2);
  });

  /* ---------- scroll reveals ---------- */
  gsap.from('.pr-panel__h, .sw, .sw__note', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.pr-panel', start: 'top 85%' } });
  gsap.from(plans, { scale: 0.65, rotation: (i) => [-6, 6, -6][i], opacity: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.pr-cards', start: 'top 85%' } });

  const pl = $$('.pr-promise .lm > span');
  gsap.set(pl, { yPercent: 115 });
  gsap.to(pl, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)', scrollTrigger: { trigger: '.pr-promise', start: 'top 85%' } });
  /* the receipt feeds out of the slot in steps, like a till printer, then swings to rest */
  gsap.set('.rcpt-shadow', { yPercent: -103, transformOrigin: '50% 0%' });
  gsap.timeline({ scrollTrigger: { trigger: '.rcpt-wrap', start: 'top 75%' } })
    .to('.rcpt-shadow', { yPercent: 0, duration: 1.9, ease: 'steps(19)' })
    .fromTo('.rcpt-shadow', { rotation: -2.5 }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1.2, 0.3)' });

  gsap.from('.cmp tbody tr', { y: 24, opacity: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', scrollTrigger: { trigger: '.cmp', start: 'top 85%' } });
})();
