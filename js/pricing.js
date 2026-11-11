/* The Brandle pricing page: the price builder (its receipt prints as you add things), the hero, the printing receipt. */
(() => {
  const { $, $$, ok } = TB;

  /* ---------- the price builder: a receipt prints a line for everything you add, the total rolls up ---------- */
  const form = $('.bld');
  if (form) {
    const P = JSON.parse(form.dataset.prices);
    const rows = $('.bcart__rows', form), usd = $('.bcart__usd', form), aed = $('.bcart__aed span', form), num = $('.step__n', form);
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    // tablets and phones: a total pill floats over the options and jumps to the receipt
    document.body.insertAdjacentHTML('beforeend', '<a class="bpill" href="#bld-cart"><span>Your receipt</span><b>$0</b></a>');
    const pill = document.body.lastElementChild, pillN = $('b', pill), cart = $('.bld__cart', form);
    cart.id = 'bld-cart';
    let inOpts = false, cartSeen = false;
    const showPill = () => pill.classList.toggle('is-on', inOpts && !cartSeen);
    new IntersectionObserver(([e]) => { inOpts = e.isIntersecting; showPill(); }).observe($('.bld__opts', form));
    new IntersectionObserver(([e]) => { cartSeen = e.isIntersecting; showPill(); }, { threshold: 0.3 }).observe(cart);
    let pages = 0, shown = P.base;
    const label = (k) => $(`input[value="${k}"]`, form).closest('.bopt').querySelector('b').textContent;
    const lines = () => {
      const out = [['base', 'The website', P.base]];
      if (pages) out.push(['pages', `${pages} more page${pages > 1 ? 's' : ''}`, pages * P.page]);
      $$('input[name="addon"]:checked', form).forEach((c) => out.push([c.value, label(c.value), P.addons[c.value]]));
      return out;
    };
    const paint = () => {
      const want = lines(), have = new Map($$('li', rows).map((li) => [li.dataset.k, li]));
      want.forEach(([k, t, price], i) => {
        let li = have.get(k);
        const txt = `<span>${t}</span><i></i><b>${price == null ? 'Quoted' : money(price)}</b>`;
        if (!li) {
          li = document.createElement('li'); li.dataset.k = k; li.innerHTML = txt;
          rows.insertBefore(li, rows.children[i] || null);
          if (ok) gsap.from(li, { height: 0, opacity: 0, y: -8, duration: 0.45, ease: 'back.out(2)', clearProps: 'all' });
        } else if (li.innerHTML !== txt) li.innerHTML = txt;
        have.delete(k);
      });
      have.forEach((li) => (ok ? gsap.to(li, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => li.remove() }) : li.remove()));
      const total = want.reduce((sum, [, , p]) => sum + (p || 0), 0);
      const quoted = want.some(([, , p]) => p == null);
      const set = (v) => { usd.textContent = money(v) + (quoted ? ' +' : ''); pillN.textContent = usd.textContent; aed.textContent = Math.round(v * P.aed).toLocaleString('en-US'); };
      if (ok) gsap.to({ v: shown }, { v: total, duration: 0.6, ease: 'power3.out', onUpdate() { set(this.targets()[0].v); } });
      else set(total);
      if (ok && total !== shown) gsap.fromTo('.bcart', { rotation: total > shown ? -1.5 : 1.5 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
      shown = total;
      num.textContent = pages;
    };
    $$('.step__b', form).forEach((btn) => btn.addEventListener('click', () => { pages = Math.max(0, Math.min(20, pages + +btn.dataset.step)); paint(); }));
    form.addEventListener('change', paint);
    paint();
    // the receipt goes to the contact form: the plan box says "custom", the message holds every line
    $('.bcart__go', form).addEventListener('click', () => {
      const L = lines(), total = L.reduce((s2, [, , p]) => s2 + (p || 0), 0);
      const text = 'My website from the price builder:\n' + L.map(([, t, p]) => `- ${t}: ${p == null ? 'to be quoted' : money(p)}`).join('\n') + `\nTotal: ${money(total)}${L.some(([, , p]) => p == null) ? ' plus the quoted items' : ''}`;
      try { sessionStorage.setItem('tb-quote', text); } catch (e) {}
      location.href = '/contact?plan=custom#brief';
    });
  }

  if (!ok) return;

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
