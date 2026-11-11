/* The Brandle Gazette: the blog as a newspaper.
   Front page: section filter (kept in the address hash), the masthead coming off the press, and a sheet of paper
   folding over the page when a story is opened. A post: the paper opened up. The cover, the story set in columns and
   the last word sit on one track that slides sideways as you scroll (pinned with ScrollTrigger); arrows, the arrow
   keys and the contents list jump a column at a time. Keywords are marked with a highlighter and one line of the story
   becomes a pull quote. Without GSAP, or with reduced motion, the post simply reads top to bottom. */
(() => {
  const { $, $$, ok } = TB;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the masthead carries today's date in Dubai, not the day the page was built
  const day = $('[data-today]');
  if (day) day.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).replace(',', '');

  /* ---------- front page: sections ---------- */
  const btns = $$('.bf');
  if (btns.length) {
    const items = $$('.np .nst');
    const note = $('.bcount');
    const names = Object.fromEntries(btns.map((b) => [b.dataset.g, b.firstChild.textContent.trim()]));
    const apply = (g, animate) => {
      if (!names[g]) g = 'all';
      btns.forEach((b) => { const on = b.dataset.g === g; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      const shown = items.filter((it) => { const s = g === 'all' || it.dataset.g === g; it.classList.toggle('is-out', !s); return s; });
      note.textContent = g === 'all' ? '' : `${shown.length} ${names[g]} stories in this edition. The other ${items.length - shown.length} are in another section, sulking.`;
      if (ok && animate) gsap.fromTo(shown, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.04, clearProps: 'transform,opacity' });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const g = b.dataset.g;
      history.replaceState(null, '', g === 'all' ? location.pathname : '#' + g);
      apply(g, true);
    }));
    addEventListener('hashchange', () => apply(location.hash.slice(1), true));
    if (location.hash) apply(location.hash.slice(1), false);

    if (ok && !reduce) {
      // off the press: the rules draw, the masthead stamps down, the stories settle in
      gsap.set('.npm__title', { scaleY: 0.2, opacity: 0, transformOrigin: '50% 100%' });
      gsap.set(['.npm__row', '.npm__tag', '.npm__sections', '.npt'], { opacity: 0, y: 12 });
      gsap.set('.npf .nst, .npf__side > *', { opacity: 0, y: 24 });
      TB.ready(() => gsap.timeline()
        .to('.npm__row', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0)
        .to('.npm__title', { scaleY: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.6)' }, 0.1)
        .to(['.npm__tag', '.npm__sections', '.npt'], { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out' }, 0.45)
        .to('.npf .nst, .npf__side > *', { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.6));
      $$('.npr .nst, .npg .nst').forEach((s) => gsap.from(s, { opacity: 0, y: 26, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 92%', once: true } }));
    }

    // opening a story: the page folds shut like a broadsheet, then the story opens
    if (ok && !reduce) $$('.np a.nst, .npt a').forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      e.preventDefault();
      const fold = document.createElement('div');
      fold.className = 'np-fold';
      document.body.appendChild(fold);
      gsap.fromTo(fold, { rotationX: -90, transformPerspective: 1600 }, { rotationX: 0, duration: 0.45, ease: 'power3.in', onComplete: () => { location.href = a.href; } });
      gsap.to('.np', { scale: 0.97, duration: 0.45, ease: 'power3.in' });
    }));
    addEventListener('pageshow', (e) => { if (e.persisted) { $$('.np-fold').forEach((f) => f.remove()); if (ok) gsap.set('.np', { clearProps: 'transform' }); } });
  }

  const post = $('.nps');
  if (!post) return;

  /* ---------- keywords with a highlighter, a line of the story as a pull quote ---------- */
  const KEYS = ['fixed quote', 'fixed price', 'fixed-price', 'Framer', 'Webflow', 'Shopify', 'WooCommerce', 'WordPress', 'Wix', 'SEO', 'Core Web Vitals',
    'Arabic', 'right-to-left', 'headless CMS', 'progressive web app', 'maintenance', 'redirects', 'VAT', 'Dubai', 'budget', 'template', 'custom design',
    'brand identity', 'conversion', 'mobile', 'page speed', 'security', 'backups', 'hosting', 'AI', 'ownership', 'you own'];
  const prose = $('.prose', post);
  const used = new Set();
  let marks = 0;
  $$('p, li', prose).forEach((el) => {
    if (marks >= 9) return;
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('a, strong, mark, h2, h3') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const nodes = []; let n; while ((n = walk.nextNode())) nodes.push(n);
    nodes.forEach((node) => {
      for (const k of KEYS) {
        if (used.has(k.toLowerCase()) || marks >= 9) continue;
        const m = new RegExp(`\\b${k.replace(/[-]/g, '\\-')}\\b`, k === 'AI' ? '' : 'i').exec(node.data);
        if (!m) continue;
        const after = node.splitText(m.index); after.splitText(m[0].length);
        const mark = document.createElement('mark'); mark.className = 'hl'; mark.textContent = after.data;
        after.replaceWith(mark); used.add(k.toLowerCase()); marks++;
        break;
      }
    });
  });
  // the pull quote: the strongest short sentence from the middle of the story
  const paras = $$(':scope > p', prose);
  if (paras.length > 4) {
    const pool = paras.slice(2, -1).flatMap((p) => (p.textContent.match(/[^.!?]+[.!?]/g) || []).map((s) => [s.trim(), p])).filter(([s]) => s.length > 40 && s.length < 120);
    const pick = pool.sort((a, b) => Math.abs(a[0].length - 75) - Math.abs(b[0].length - 75))[0];
    if (pick) { const q = document.createElement('p'); q.className = 'pq'; q.setAttribute('aria-hidden', 'true'); q.textContent = pick[0]; pick[1].after(q); }
  }

  const bar = $('.pbar i');
  const paper = ok && !reduce && window.ScrollTrigger;
  if (!paper) {
    // top to bottom: a plain reading progress bar
    if (bar) addEventListener('scroll', () => { const h = document.documentElement; bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`; }, { passive: true });
    return;
  }

  /* ---------- the paper, opened: one track slides sideways while you scroll down ---------- */
  document.body.classList.add('is-paper');
  const spread = $('.spread', post), track = $('.spread__track', post), body = $('.sb', post);
  const pagerN = $('.spager__n', post);
  const toc = $('.ptoc', post);
  if (toc) body.prepend(toc);      // the contents list becomes the story's first column, not a box squeezed under the headline
  let st = null, colW = 0;
  let snaps = [0];
  const size = () => {
    // the story's columns overflow sideways. Lay them out in a box far wider than needed (an exact number of columns, so
    // none get stretched), find where the last line ends, then shrink the box to exactly that many columns.
    const cs = getComputedStyle(body), pad = parseFloat(cs.paddingLeft), gap = parseFloat(cs.columnGap), cw = parseFloat(cs.columnWidth);
    colW = cw + gap || innerWidth * 0.8;
    body.style.width = `${pad * 2 + 60 * colW - gap}px`;
    const left = body.getBoundingClientRect().left + pad;
    let right = 0;
    $$('p, li, h2, h3, summary, ul, ol, nav, aside, section', body).forEach((el) => { for (const r of el.getClientRects()) if (r.width) right = Math.max(right, r.right - left); });
    const n = Math.max(1, Math.ceil((right + gap - 2) / colW));
    body.style.width = `${pad * 2 + n * colW - gap}px`;
  };
  // resting points: the cover, every column, the last word (x positions on the track). Scrolling settles on the nearest.
  let xs = [0], pages = [0];
  const points = () => {
    const D = (st ? st.end - st.start : dist()) || 1;   // the same distance the scroll covers
    const rel = (el) => el.offsetLeft;   // the track is their offset parent, so no transform (scroll, unfolding) gets in the way
    const n = Math.max(1, Math.round((body.offsetWidth - parseFloat(getComputedStyle(body).paddingLeft)) / colW));
    xs = [...new Set([0, ...Array.from({ length: n }, (_, k) => Math.round(rel(body) + k * colW)), Math.round(rel($('.se', post))), Math.round(D)]
      .map((x) => Math.min(D, Math.max(0, x))))].sort((a2, b2) => a2 - b2);
    snaps = xs.map((x) => x / D);
    // pages for the arrows and the counter: a full screen at a time (one column on a phone)
    const vw = document.documentElement.clientWidth;
    pages = [0];
    for (const x of xs) if (x > pages[pages.length - 1] + vw - colW - 4 || x === xs[xs.length - 1]) pages.push(x);
    pages = [...new Set(pages)];
  };
  const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
  document.fonts.ready.then(() => {
    size();
    const setX = gsap.quickSetter(track, 'x', 'px');   // the track follows the scroll directly (Lenis already smooths it)
    st = ScrollTrigger.create({
      trigger: post, start: 0, end: () => dist(),   // the paper's strip stays in view with the spread
      pin: post, invalidateOnRefresh: true, onRefresh: points,
      snap: { snapTo: (v) => snaps.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), snaps[0]), duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: 'power2.out' },
      onUpdate: (s) => {
        setX(-(s.progress * (s.end - s.start)));
        bar.style.transform = `scaleX(${s.progress})`;
        const x = s.progress * (s.end - s.start), at = pages.reduce((n, q, i) => (q <= x + 4 ? i : n), 0);
        pagerN.textContent = `${at + 1} / ${pages.length}`;
      },
    });
    ScrollTrigger.refresh();
    points();
    document.body.classList.add('is-ready');
    gsap.from(spread, { rotationY: -12, transformPerspective: 1800, transformOrigin: '0% 50%', opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity' });
    gsap.from('.sc__big', { yPercent: 40, opacity: 0, duration: 0.8, ease: 'back.out(1.6)', delay: 0.15 });
  });
  // jump sideways: to an x position on the track, through the page's scroll position
  const goX = (x) => { if (!st) return; const y = Math.round(st.start + Math.max(0, Math.min(dist(), x))); TB.lenis ? TB.lenis.scrollTo(y, { duration: 0.8, lock: true }) : scrollTo({ top: y, behavior: 'smooth' }); };
  const nowX = () => (st ? Math.max(0, (TB.lenis ? TB.lenis.targetScroll : scrollY) - st.start) : 0);
  const step = (d) => { const at = nowX(); const list = d > 0 ? pages.filter((x) => x > at + 4) : pages.filter((x) => x < at - 4).reverse(); if (list.length) goX(list[0]); };
  $$('.spager__b', post).forEach((b) => b.addEventListener('click', () => step(+b.dataset.d)));
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select') || !st || !st.isActive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
  });
  $$('.ptoc a', post).forEach((a) => a.addEventListener('click', (e) => {
    const h = document.getElementById(a.hash.slice(1)); if (!h) return;
    e.preventDefault();
    const x = h.getBoundingClientRect().left - track.getBoundingClientRect().left - 24;
    goX(x);
  }));
  // a question opening up changes how many columns there are
  $$('.pfaq details', post).forEach((d) => d.addEventListener('toggle', () => { size(); ScrollTrigger.refresh(); }));
  // sizes are measured once, and again only when the window really changes width (a refresh can catch the layout mid-pin)
  let rw = innerWidth, rt = 0;
  addEventListener('resize', () => { if (innerWidth === rw) return; rw = innerWidth; clearTimeout(rt); rt = setTimeout(() => { size(); ScrollTrigger.refresh(); }, 200); });

})();

/* the masthead's price line: "worth every dirham" tours the currencies of the people reading it */
(() => {
  const w = document.querySelector('.bflip');
  if (!w || !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const MONEY = ['dirham', 'dollar', 'riyal', 'pound', 'lira', 'euro', 'rupee', 'penny'];
  let i = 0;
  const next = () => {
    i = (i + 1) % MONEY.length;
    gsap.timeline()
      .to(w, { yPercent: -110, opacity: 0, duration: 0.3, ease: 'power2.in' })
      .add(() => { w.textContent = MONEY[i]; })
      .fromTo(w, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' });
  };
  setTimeout(() => setInterval(next, 2200), 2400);
})();
