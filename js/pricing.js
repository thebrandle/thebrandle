/* The Brandle pricing page: the price builder (its receipt prints as you add things), the hero, the printing receipt. */
(() => {
  const { $, $$, ok } = TB;

  /* ---------- the price builder: tabs pick a service, ticks and steppers add lines to one receipt, grouped by
     service, with a one-off and a monthly total. Ticking an extra ticks its service's base item too. ---------- */
  const form = $('.bld');
  if (form) {
    const AED = +form.dataset.aed, NAMES = JSON.parse(form.dataset.names);
    const rows = $('.bcart__rows', form), usd = $('.bcart__usd', form), mo = $('.bcart__mo', form), moRow = $('.bcart__total--mo', form);
    const aed = $('.bcart__aed span', form), empty = $('.bcart__empty', form);
    const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const opts = $$('.bopt[data-key]', form);
    const qty = new Map();
    document.body.insertAdjacentHTML('beforeend', '<a class="bpill" href="#bld-cart"><span>Your receipt</span><b>$0</b></a>');
    const pill = document.body.lastElementChild, pillN = $('b', pill), cart = $('.bld__cart', form);
    let inOpts = false, cartSeen = false;
    const showPill = () => pill.classList.toggle('is-on', inOpts && !cartSeen);
    new IntersectionObserver(([e]) => { inOpts = e.isIntersecting; showPill(); }).observe($('.bld__opts', form));
    new IntersectionObserver(([e]) => { cartSeen = e.isIntersecting; showPill(); }, { threshold: 0.3 }).observe(cart);

    const lines = () => opts.map((o) => {
      const n = o.classList.contains('bopt--qty') ? (qty.get(o.dataset.key) || 0) : ($('input', o).checked ? 1 : 0);
      if (!n) return null;
      const price = o.dataset.price === '' ? null : +o.dataset.price;
      return { key: o.dataset.key, cat: o.dataset.cat, unit: o.dataset.unit, label: n > 1 || o.classList.contains('bopt--qty') ? `${n} x ${o.dataset.label.toLowerCase()}` : o.dataset.label, price: price == null ? null : price * n };
    }).filter(Boolean);
    let shownOnce = 0, shownMo = 0;
    const roll = (from, to, set) => (ok ? gsap.to({ v: from }, { v: to, duration: 0.6, ease: 'power3.out', onUpdate() { set(this.targets()[0].v); } }) : set(to));
    const paint = () => {
      const L = lines();
      // one group per service, in tab order; rows keep their nodes so new ones can print in
      const have = new Map($$('[data-k]', rows).map((el) => [el.dataset.k, el]));
      const want = [];
      Object.keys(NAMES).forEach((c) => { const g = L.filter((l) => l.cat === c); if (g.length) want.push({ k: 'h-' + c, head: NAMES[c] }, ...g.map((l) => ({ k: l.key, l }))); });
      want.forEach((w, i) => {
        let el = have.get(w.k);
        const html = w.head ? `<span>${w.head}</span>` : `<span>${w.l.label}</span><i></i><b>${w.l.price == null ? 'Quoted' : money(w.l.price) + (w.l.unit === 'mo' ? '/mo' : '')}</b>`;
        if (!el) {
          el = document.createElement('p'); el.dataset.k = w.k; el.className = w.head ? 'bcart__g' : 'bcart__r'; el.innerHTML = html;
          rows.insertBefore(el, rows.children[i] || null);
          if (ok) gsap.from(el, { height: 0, opacity: 0, y: -8, duration: 0.45, ease: 'back.out(2)', clearProps: 'all' });
        } else {
          if (el.innerHTML !== html) el.innerHTML = html;
          if (rows.children[i] !== el) rows.insertBefore(el, rows.children[i] || null);
        }
        have.delete(w.k);
      });
      have.forEach((el) => (ok ? gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => el.remove() }) : el.remove()));
      const once = L.filter((l) => l.unit !== 'mo').reduce((t, l) => t + (l.price || 0), 0);
      const month = L.filter((l) => l.unit === 'mo').reduce((t, l) => t + (l.price || 0), 0);
      const plus = L.some((l) => l.price == null) ? ' +' : '';
      roll(shownOnce, once, (v) => { usd.textContent = money(v) + plus; aed.textContent = Math.round(v * AED).toLocaleString('en-US') + (month ? ` plus ${Math.round(month * AED).toLocaleString('en-US')} a month` : ''); pillN.textContent = money(v) + (month ? ` + ${money(month)}/mo` : '') + plus; });
      roll(shownMo, month, (v) => { mo.textContent = money(v) + '/mo'; });
      moRow.hidden = !month;
      empty.hidden = L.length > 0;
      if (ok && (once !== shownOnce || month !== shownMo)) gsap.fromTo('.bcart', { rotation: once + month > shownOnce + shownMo ? -1.5 : 1.5 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
      shownOnce = once; shownMo = month;
      // tab badges: how many things are ticked in each service
      $$('.btab', form).forEach((t) => { const n = L.filter((l) => l.cat === t.dataset.cat).length; const b = $('.btab__n', t); b.textContent = n || ''; b.hidden = !n; });
    };
    const needBase = (o) => { const base = $(`.bopt[data-base][data-cat="${o.dataset.cat}"] input`, form); if (base && !o.hasAttribute('data-base') && !o.hasAttribute('data-alone')) base.checked = true; };   // naming or an app build can come on their own
    $$('.bopt--qty', form).forEach((o) => $$('.step__b', o).forEach((btn) => btn.addEventListener('click', () => {
      const n = Math.max(0, Math.min(30, (qty.get(o.dataset.key) || 0) + +btn.dataset.step));
      qty.set(o.dataset.key, n); $('.step__n', o).textContent = n;
      if (n) needBase(o);
      paint();
    })));
    form.addEventListener('change', (e) => {
      const o = e.target.closest('.bopt');
      if (o && e.target.checked) needBase(o);
      if (o && !e.target.checked && o.hasAttribute('data-base')) {   // no base, no extras: unticking a base clears its service
        $$(`.bopt[data-cat="${o.dataset.cat}"]`, form).forEach((x) => { const i = $('input', x); if (i) i.checked = false; if (x.classList.contains('bopt--qty')) { qty.set(x.dataset.key, 0); $('.step__n', x).textContent = 0; } });
      }
      paint();
    });
    // tabs: arrow keys move between them, as tabs do
    const tabs = $$('.btab', form);
    const pick = (t) => {
      tabs.forEach((x) => { const on = x === t; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; $('#bcat-' + x.dataset.cat).hidden = !on; });
      if (ok) gsap.from($$('#bcat-' + t.dataset.cat + ' .bopt'), { y: 14, opacity: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out', clearProps: 'all' });
    };
    tabs.forEach((t, i) => {
      t.tabIndex = i ? -1 : 0;
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); pick(n); } });
    });
    // ?service=video opens that tab
    const want = new URLSearchParams(location.search).get('service');
    const wt = want && tabs.find((t) => t.dataset.cat === want);
    if (wt) pick(wt);
    paint();
    // the receipt goes to the contact form: every line, by service, with both totals
    $('.bcart__go', form).addEventListener('click', () => {
      const L = lines();
      if (!L.length) { gsap && ok && gsap.fromTo('.bcart', { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' }); return; }
      const once = L.filter((l) => l.unit !== 'mo').reduce((t, l) => t + (l.price || 0), 0), month = L.filter((l) => l.unit === 'mo').reduce((t, l) => t + (l.price || 0), 0);
      const text = 'My receipt from the price builder:\n' + Object.keys(NAMES).filter((c) => L.some((l) => l.cat === c)).map((c) => NAMES[c] + '\n' + L.filter((l) => l.cat === c).map((l) => `- ${l.label}: ${l.price == null ? 'to be quoted' : money(l.price) + (l.unit === 'mo' ? ' a month' : '')}`).join('\n')).join('\n')
        + `\nOne-off total: ${money(once)}` + (month ? `\nMonthly: ${money(month)}` : '') + (L.some((l) => l.price == null) ? '\nPlus the quoted items' : '');
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
