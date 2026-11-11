/* 404 page: shows the address that was asked for, and hands out a fresh excuse on request. */
(() => {
  const { $, $$, ok, rnd, ready, lines, pop } = TB;

  // the address the visitor asked for, as text (never as HTML)
  let path = location.pathname;
  try { path = decodeURI(path); } catch (e) {}
  if (path !== '/404.html') $('[data-path]').textContent = path.length > 60 ? path.slice(0, 57) + '...' : path;

  const excuses = [
    'The camel ate it.',
    'It was here a minute ago. Honest.',
    'We moved it, then forgot where we put it.',
    'Design says development had it last. Development says design did.',
    'It is on a karak break. A long one.',
    'Somebody typed the address with their elbow. No names.',
    'It left to find itself. We respect that.',
    'We deleted it on purpose. Probably.',
  ];
  const bubble = $('[data-excuse]');
  const art = $('.nf__art');
  let i = 0;
  $('[data-again]').addEventListener('click', () => {
    i = (i + 1) % excuses.length;
    bubble.textContent = excuses[i];
    if (!ok) return;
    gsap.fromTo(bubble, { scale: 0.6, rotation: rnd(-5, 5) }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.5)', overwrite: true });
    gsap.fromTo(art, { rotation: rnd(-4, 4), scale: 0.96 }, { rotation: 0, scale: 1, duration: 0.8, ease: 'elastic.out(1.1, 0.4)', overwrite: true });
  });

  if (!ok) return;
  ready(() => {
    lines('.nf__text');
    pop($$('.nf__pill'), false, { delay: 0.45 });
    gsap.fromTo(art, { scale: 0.65, rotation: 6, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.85, ease: 'back.out(2.2)', delay: 0.35 });
    gsap.fromTo($$('.nf__lead, .nf__side--r > *, .nf__links > *'), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06, delay: 0.55 });
  });
})();
