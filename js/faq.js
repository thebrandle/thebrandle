/* The Brandle FAQ page: search as you type, group pills that jump, a question opened from the address (#id).
   The accordion itself is the shared one in /main.js. Search and jumps work with or without GSAP. */
(() => {
  const { $, $$, ok } = TB;
  const input = $('#fq-search');
  const items = $$('.fq-body .fitem');
  const groups = $$('.fgroup');
  const pills = $$('.fpill');
  const count = $('.fsearch__count');
  const empty = $('.fempty');
  const text = items.map((it) => it.textContent.toLowerCase());
  const total = items.length;
  let reveals = [];

  /* ---------- search: every word typed must appear in the question or its answer ---------- */
  const run = () => {
    const words = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const shown = [];
    let n = 0;
    items.forEach((it, i) => {
      const hit = words.every((w) => text[i].includes(w));
      if (hit && it.hidden) shown.push(it);
      it.hidden = !hit;
      n += hit;
    });
    groups.forEach((g, i) => {
      const k = $$('.fitem:not([hidden])', g).length;
      g.hidden = !k;
      pills[i].classList.toggle('is-empty', !k);
      $('b', pills[i]).textContent = k;
    });
    empty.hidden = n > 0;
    count.textContent = !words.length ? `${total} questions in ${groups.length} groups` : n ? `${n} of ${total} questions match` : 'No questions match';
    if (!ok) return;
    reveals.forEach((t) => t.progress(1)); // a search shows everything at once: finish any entrance still waiting
    if (shown.length) gsap.fromTo(shown, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.02, overwrite: true });
    ScrollTrigger.refresh();
  };
  input.addEventListener('input', run);
  $('.fsearch').addEventListener('submit', (e) => { e.preventDefault(); const f = items.find((it) => !it.hidden); f && go(f); });
  $('.fempty button').addEventListener('click', () => { input.value = ''; run(); input.focus(); });

  /* ---------- jumps ---------- */
  const go = (el) => {
    TB.lenis ? TB.lenis.scrollTo(el, { offset: -90, duration: 1.1 }) : el.scrollIntoView({ behavior: TB.reduce ? 'auto' : 'smooth' });
  };
  pills.forEach((p, i) => p.addEventListener('click', (e) => {
    if (groups[i].hidden) return e.preventDefault();
    e.preventDefault();
    history.replaceState(null, '', p.getAttribute('href'));
    go(groups[i]);
    $('.fgroup__h', groups[i]).focus({ preventScroll: true }); // keyboard and screen reader users land in the group
  }));

  /* ---------- /faq#question-id opens that question ---------- */
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.classList.contains('fitem')) {
    if (!target.classList.contains('open')) $('.fq', target).click();
    TB.ready(() => go(target));
  }

  if (!ok) return;

  /* ---------- hero ---------- */
  const lines = $$('.fq-hero .lm > span');
  const hp = $$('.fq-hero__text .pill');
  const rest = $$('.fq-lede, .fsearch, .fpill');
  gsap.set(lines, { yPercent: 115 });
  gsap.set(hp, { opacity: 0, scale: 0.4 });
  gsap.set(rest, { opacity: 0, y: 20 });
  TB.ready(() => {
    gsap.timeline()
      .to(lines, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
      .to(hp, { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'back.out(2.5)' }, 0.45)
      .to(rest, { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: 'back.out(1.6)' }, 0.5);
  });

  /* ---------- each group: title rises, questions follow ---------- */
  reveals = groups.map((g) => gsap.timeline({ scrollTrigger: { trigger: g, start: 'top 85%' } })
    .from($$('.fgroup__n, .fgroup__h', g), { y: 40, opacity: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
    .from($$('.fitem', g), { y: 30, opacity: 0, duration: 0.55, stagger: 0.07, ease: 'back.out(1.6)' }, 0.15));
  gsap.from('.fq-end__art', { scale: 0.65, rotation: 6, opacity: 0, duration: 0.85, ease: 'back.out(2.2)', scrollTrigger: { trigger: '.fq-end', start: 'top 85%' } });
})();
