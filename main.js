/* The Brandle. Shared behaviour for every page: loader, header, contact panel, buttons, cards, FAQ, footer, cursor.
   Page scripts (js/*.js) load after this file and use window.TB. Motion values follow two26.studio's.
   TB members: $(sel, root), $$(sel, root) -> array, ok (GSAP is loaded and motion is allowed), fine (mouse with hover),
   reduce, rnd(a, b), chars(el) -> letter spans, draw(paths) hides SVG strokes ready to be drawn, lenis,
   ready(fn)             runs fn when the loader has lifted (at once if it already has): start hero entrances here
   em()                  the root em in px right now (16 at 1440 wide)
   lines(el, onScroll)   line-mask rise of every [data-lines] inside el: 0.85s back.out(1.4), stagger 0.12
   pop(els, onScroll)    pills and small parts pop from nothing: 0.55s back.out(2.5), stagger 0.08
                         both play at once (call them inside ready), or with onScroll = true wait until the element
                         reaches "top 85%" (call them while the script runs: the start state is set straight away).
                         A third argument overrides any tween value, e.g. lines(el, false, { delay: 0.2 }).
                         They return the tween, or null when !ok: then nothing is hidden and nothing moves.
   reveal(el, fn)        runs fn(el) once when el reaches "top 85%". Not called when !ok, so set start states in script.
   A page script must create its ScrollTriggers while it runs, not later: the ones made here for cards and the
   footer wait until every script has run, so anything a page pins above them is measured first. */
window.TB = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const ok = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduce;
  const rnd = (a, b) => a + Math.random() * (b - a);
  let lenis = null;

  /* ---------- page scripts wait here until the loader has lifted ---------- */
  let lifted = false;
  const waiting = [];
  const ready = (fn) => { lifted ? fn() : waiting.push(fn); };
  const lift = () => {
    const l = $('.loader'); // fades over the page while the page's entrance starts under it
    if (l) { l.style.pointerEvents = 'none'; ok ? gsap.to(l, { opacity: 0, duration: 0.15, ease: 'power1.out', onComplete: () => l.remove() }) : l.remove(); }
    document.body.classList.remove('is-loading');
    lifted = true;
    waiting.splice(0).forEach((fn) => fn());
  };

  /* ---------- text splitting ---------- */
  $$('[data-lines]').forEach((el) => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="lm"><span>${l.trim()}</span></span>`).join(' ');
  });
  const chars = (el) => {
    el.innerHTML = el.textContent.trim().split(/[^\S\u00a0]+/).map((w) => `<span class="w">${[...w].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
    return $$('.ch', el);
  };
  const draw = (paths) => paths.forEach((p) => { const l = p.getTotalLength(); gsap.set(p, { strokeDasharray: l, strokeDashoffset: l }); });

  /* ---------- the shared reveal recipe, for page scripts ---------- */
  const em = () => parseFloat(getComputedStyle(document.body).fontSize);
  const one = (x) => (typeof x === 'string' ? $(x) : x && x.nodeType ? x : x && x[0]);
  const st = (trigger, onScroll) => (onScroll ? { scrollTrigger: { trigger: one(trigger), start: 'top 85%', once: true } } : {});
  const lines = (el, onScroll, vars) => {
    const t = $$('.lm > span', one(el) || document);
    return ok && t.length ? gsap.fromTo(t, { yPercent: 115 }, { yPercent: 0, duration: 0.85, ease: 'back.out(1.4)', stagger: 0.12, ...st(el, onScroll), ...vars }) : null;
  };
  const pop = (els, onScroll, vars) => {
    const t = typeof els === 'string' ? $$(els) : els && els.nodeType ? [els] : [...(els || [])];
    return ok && t.length ? gsap.fromTo(t, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(2.5)', stagger: 0.08, ...st(t[0], onScroll), ...vars }) : null;
  };
  const reveal = (el, fn) => (ok && one(el) ? ScrollTrigger.create({ trigger: one(el), start: 'top 85%', once: true, onEnter: () => fn(one(el)) }) : null);

  const api = { $, $$, reduce, fine, ok, rnd, chars, draw, ready, em, lines, pop, reveal, get lenis() { return lenis; } };

  /* ---------- header: current page, phone menu, and it steps aside for the footer ---------- */
  const here = location.pathname.replace(/\/(index\.html)?$/, '') || '/';
  $$('.header a[href^="/"], .footer a[href^="/"]').forEach((a) => { if ((a.getAttribute('href').replace(/\/$/, '') || '/') === here) a.setAttribute('aria-current', 'page'); });
  const header = $('.header'), footer = $('.footer'), burger = $('.burger'), menu = $('.menu');
  if (header && footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-away', e.isIntersecting), { rootMargin: '0px 0px -88% 0px' }).observe(footer);
  }
  let setMenu = () => {};
  if (burger && menu) {
    const items = $$('.navlink', menu);
    setMenu = (open, now) => {
      if (open === !menu.hidden) return;
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('menu-open', open);
      $$('main, .footer').forEach((el) => { el.inert = open; }); // Tab stays in the bar and the menu
      lenis && (open ? lenis.stop() : lenis.start());
      if (!ok || now) { ok && gsap.killTweensOf([menu, ...items]); menu.hidden = !open; return; }
      gsap.killTweensOf([menu, ...items]);
      if (open) {
        menu.hidden = false;
        gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
        gsap.fromTo(items, { opacity: 0, x: -35, y: 50, scale: 0.4, rotation: () => rnd(-10, 10) }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.75, ease: 'back.out(2.2)', stagger: 0.09, delay: 0.15 });
      } else {
        gsap.to(items, { opacity: 0, y: 20, scale: 0.8, duration: 0.25, stagger: 0.04, ease: 'power2.in' });
        gsap.to(menu, { opacity: 0, duration: 0.3, delay: 0.1, ease: 'power2.inOut', onComplete: () => { menu.hidden = true; } });
      }
    };
    burger.addEventListener('click', () => setMenu(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); } });
    addEventListener('pageshow', (e) => { if (e.persisted) setMenu(false, true); }); // never come Back to an open menu
    matchMedia('(min-width: 768px)').addEventListener('change', (e) => { if (e.matches) setMenu(false, true); });
  }

  /* ---------- the contact camel: his neck is a stroke drawn here from the bottom edge to wherever his head is, so it can
     bend without a seam. The head art rides the tip; the card in his mouth is a button that asks him for another line.
     Sizes come from the art: data-geo on the preview head, or assets/art/manifest.json once the drawn parts are ready
     (viewBox, display_em, neck = where the neck joins, mouth = where the card is held, eye = [x, y, r], a pivot per part). */
  const makeCamel = (root) => {
    const box = $('.ccamel', root);
    if (!box) return { start() {}, stop() {} };
    const head = $('.ccamel__head', box), art = $('.ccamel__art', box), card = $('.ccard', box), say = $('span', card);
    const [nk, nf] = $$('.ccamel__neck path', box), spots = $$('.ccamel__neck ellipse', box);
    const says = [say.textContent, ...box.dataset.says.split('|')];
    const BASE = [16.4, 2], TIP = [15.6, 9.4]; // em: where the neck leaves the bottom edge (x, depth under it) and where the head rests
    const p = { x: 0, y: 0, vx: 0, vy: 0, ca: 0, cv: 0 }, goal = { x: 0, y: 0 }, fx = { nod: 0, lift: 0 }, dc = {};
    let geo = JSON.parse(art.dataset.geo), em = 16, h = 0, on = false, line = 0, busy = false, asked = false;
    const draw = () => {
      const bx = BASE[0] * em, by = h + BASE[1] * em, tx = (TIP[0] + p.x) * em, ty = (TIP[1] + p.y - fx.lift) * em, L = by - ty;
      const c1 = [bx, by - L * 0.45], c2 = [tx - p.x * em * 0.9, ty + L * 0.4];
      const d = `M${bx} ${by}C${c1} ${c2} ${tx} ${ty}`;
      nk.setAttribute('d', d); nf.setAttribute('d', d);
      spots.forEach((s, i) => { // three spots ride the curve
        const t = [0.3, 0.52, 0.72][i], u = 1 - t, side = [-0.25, 0.85, -0.6][i] * em;
        s.setAttribute('cx', u * u * u * bx + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * tx + side);
        s.setAttribute('cy', u * u * u * by + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * ty);
      });
      const lean = Math.atan2(tx - c2[0], L * 0.4) * 57.3; // the head follows the end of the neck
      const nx = geo.neck[0] / geo.vb[0] * geo.em[0] * em, ny = geo.neck[1] / geo.vb[1] * geo.em[1] * em;
      head.style.transform = `translate(${tx - nx}px, ${ty - ny}px) rotate(${Math.max(-12, Math.min(12, lean)) + fx.nod}deg)`;
      card.style.rotate = `${8 + p.ca}deg`;
    };
    const layout = () => {
      em = parseFloat(getComputedStyle(box).fontSize); h = box.clientHeight;
      const [vw, vh] = geo.vb, pc = (v, of) => `${v / of * 100}%`;
      head.style.width = `${geo.em[0]}em`; head.style.height = `${geo.em[1]}em`;
      head.style.transformOrigin = `${pc(geo.neck[0], vw)} ${pc(geo.neck[1], vh)}`;
      card.style.right = pc(vw - geo.mouth[0], vw); card.style.top = pc(geo.mouth[1], vh);
      const lid = $('i.cc-lid', art);
      if (lid && geo.eye) { const [x, y, r] = geo.eye; Object.assign(lid.style, { left: pc(x - r, vw), top: pc(y - r, vh), width: pc(2 * r, vw), height: pc(2 * r, vh) }); }
      draw();
    };
    // the drawn parts replace the preview head when the art builder's manifest says they are ready
    const upgrade = () => {
      if (asked) return; asked = true;
      fetch('/assets/art/manifest.json').then((r) => r.json()).then((m) => {
        const f = m.files || {}, hd = f['contact-camel-head.svg'];
        if (!hd || !hd.ready || !hd.neck || !hd.mouth) return;
        const [, , vw, vh] = hd.viewBox;
        const img = (part, cls) => { const e = f[`contact-camel-${part}.svg`]; return e && e.ready ? `<img class="${cls}" src="/assets/art/contact-camel-${part}.svg" alt="" style="transform-origin:${(e.pivot || [vw / 2, vh / 2])[0] / vw * 100}% ${(e.pivot || [vw / 2, vh / 2])[1] / vh * 100}%">` : ''; };
        card.insertAdjacentHTML('beforebegin', `<div class="ccamel__under" aria-hidden="true">${img('ear-r', 'cc-ear')}${img('jaw', 'cc-jaw')}</div>`);
        art.innerHTML = img('head', 'cc-head') + img('ear-l', 'cc-ear') + (img('lid', 'cc-lid') || (hd.eye ? '<i class="cc-lid"></i>' : ''));
        geo = { vb: [vw, vh], em: hd.display_em, neck: hd.neck, mouth: hd.mouth, eye: hd.eye };
        layout();
      }).catch(() => {});
    };
    const tick = (t, dt) => { // two springs: the head chases its goal, the card swings behind it like a pendulum
      const s = Math.min(dt, 50) / 1000;
      p.vx += ((goal.x - p.x) * 90 - p.vx * 11) * s; p.vy += ((goal.y + Math.sin(t * 1.96) * 0.07 - p.y) * 90 - p.vy * 11) * s;
      p.x += p.vx * s; p.y += p.vy * s;
      p.cv += ((Math.max(-14, Math.min(14, -p.vx * 2.4)) - p.ca) * 90 - p.cv * 9) * s; p.ca += p.cv * s;
      draw();
    };
    const again = (name, fn, a, b) => { dc[name] = gsap.delayedCall(rnd(a, b), () => { if (on) { fn(); again(name, fn, a, b); } }); };
    const blink = () => { if (!$('.cc-lid', box)) return; const slow = Math.random() < 0.25; gsap.timeline().to($$('.cc-lid', box), { scaleY: 1, duration: 0.09 }).to($$('.cc-lid', box), { scaleY: 0, duration: 0.14 }, slow ? '+=0.3' : '+=0.05'); };
    const ears = () => {
      const e = $$('.cc-ear', box).reverse();
      if (e.length) e.forEach((el, i) => gsap.timeline({ delay: i * 0.06 }).to(el, { rotation: -18 / (i + 1), duration: 0.1 }).to(el, { rotation: 0, duration: 0.35, ease: 'back.out(3)' }));
      else gsap.timeline().to(fx, { nod: -5, duration: 0.08 }).to(fx, { nod: 0, duration: 0.5, ease: 'elastic.out(1.3, 0.35)' }); // no cut ears yet: the whole head flicks
    };
    const chew = (n) => {
      const jaw = $('.cc-jaw', box), tl = gsap.timeline();
      for (let i = 0; i < n; i++) {
        if (jaw) tl.to(jaw, { rotation: 7, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, i * 0.4);
        tl.to(fx, { nod: jaw ? 1.5 : 4, duration: 0.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, i * 0.4).call(() => { p.cv += 70; }, null, i * 0.4);
      }
      return tl;
    };
    const next = () => { // he eats the card, chews it over, and a fresh one slides out with the next line
      if (busy) return;
      line = (line + 1) % says.length;
      if (!ok) { say.textContent = says[line]; return; }
      busy = true;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(card, { scaleX: 0, duration: 0.22, ease: 'power2.in' })
        .add(chew(3))
        .call(() => { say.textContent = says[line]; })
        .to(card, { scaleX: 1, duration: 0.35, ease: 'back.out(2)' });
    };
    card.addEventListener('click', next);
    addEventListener('resize', () => { if (root.open) layout(); });
    if (ok) {
      if (fine) root.addEventListener('pointermove', (e) => { // he leans toward the pointer, a little
        if (!on || e.pointerType !== 'mouse') return;
        const r = box.getBoundingClientRect(), dx = (e.clientX - r.left) / em - TIP[0], dy = (e.clientY - r.top) / em - TIP[1], d = Math.hypot(dx, dy) || 1, k = Math.min(d * 0.12, 1.8) / d;
        goal.x = dx * k; goal.y = dy * k * 0.5;
      });
      const perk = (up) => { // an address has his full attention
        gsap.to(fx, { lift: up ? 1.4 : 0, duration: up ? 0.45 : 0.7, ease: up ? 'back.out(3)' : 'elastic.out(1, 0.5)', overwrite: 'auto' });
        if (up && on) ears();
      };
      $$('.elink', root).forEach((a) => {
        a.addEventListener('mouseenter', () => perk(true)); a.addEventListener('focus', () => perk(true));
        a.addEventListener('mouseleave', () => perk(false)); a.addEventListener('blur', () => perk(false));
      });
    }
    return {
      box,
      start(tl) {
        upgrade(); layout();
        if (!ok) return;
        on = true; busy = false;
        Object.assign(p, { x: 0, y: 0, vx: 0, vy: 0, ca: 0, cv: 0 }); goal.x = goal.y = fx.nod = fx.lift = 0;
        gsap.set(card, { scaleX: 1 });
        tl.fromTo(box, { yPercent: 105, rotation: rnd(-3, 3) }, { yPercent: 0, rotation: 0, duration: 0.75, ease: 'back.out(1.4)' }, 0.85)
          .call(() => { p.cv = -160; p.vx = -9; }, null, 1.15); // the card swings in as he arrives
        gsap.ticker.add(tick);
        again('blink', blink, 2.8, 5.5); again('ears', ears, 4, 9); again('chew', () => busy || chew(2), 3, 5.5);
        dc.auto = gsap.delayedCall(7, () => { if (on && !card.matches(':hover, :focus-visible')) next(); }); // the punchline, once per opening
      },
      stop() {
        on = false;
        if (!ok) return;
        gsap.ticker.remove(tick);
        Object.values(dc).forEach((c) => c.kill());
      },
    };
  };

  /* ---------- contact overlay: the orange floods up from the bottom edge as one fat stroke, then the content pops in.
     Timings follow two26.studio's. Without GSAP or with reduced motion the dialog simply opens, finished. ---------- */
  const contact = $('.contact'), flood = contact && $('.contact__flood', contact);
  if (flood && contact.showModal) {
    const fpath = $('path', flood);
    const logo = $('.navbar__logo', contact), close = $('.closebtn', contact), content = $('.contact__content', contact), pills = $$('.cpill', contact);
    const letters = $$('.cheading', contact).flatMap(chars);
    $$('.ehead', contact).forEach((el) => { el.innerHTML = el.textContent.trim().split(/[^\S\u00a0]+/).map((w) => `<span class="w"><span>${w}</span></span>`).join(' '); });
    const camel = makeCamel(contact);
    // the stroke's centre line, as percentages of a design box (x) and of the viewport height (y); the curve through them is ours
    const WAY = [[37, 98], [54, 98], [71, 95], [86, 86], [73, 77], [57, 80], [40, 85], [23, 88], [7, 85], [2, 68], [15, 55], [31, 52], [48, 51], [66, 50], [83, 48], [97, 39], [89, 26], [72, 27], [55, 30], [38, 32], [21, 32], [10, 19], [23, 8], [40, 4], [57, 2]];
    let len = 0, wide = 0, tl = null, out = null;
    const lay = () => { // box: full height, as wide as a 998:901 sheet, squeezed on portrait screens, widened past 16:9 so the sides always fill
      const vw = innerWidth, vh = innerHeight, bw = Math.max(Math.min(vw, vh * 998 / 901), vw - vh * 0.67), ox = (vw - bw) / 2;
      const P = WAY.map(([x, y]) => [ox + x / 100 * bw, y / 100 * vh]);
      let d = `M${P[0]}`;
      for (let i = 0; i < P.length - 1; i++) { // a smooth spline through the points, as cubic curves
        const a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
        d += `C${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6} ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6} ${c[0]} ${c[1]}`;
      }
      flood.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
      fpath.setAttribute('d', d);
      len = fpath.getTotalLength(); wide = vh * 1600 / 901;
      fpath.style.strokeDasharray = len;
    };
    const openContact = () => {
      if (contact.open) return;
      setMenu(false, true);
      contact.classList.toggle('is-anim', ok);
      contact.classList.remove('is-solid');
      contact.showModal();
      lenis && lenis.stop();
      if (!ok) { camel.start(); return; }
      lay();
      const pop = { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2.5)' }, rise = { opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.6)' };
      tl = gsap.timeline({ defaults: { autoRound: false } })
        .fromTo(fpath, { strokeDashoffset: len, strokeWidth: 0 }, { strokeDashoffset: 0, strokeWidth: wide, duration: 0.9, ease: 'power2.inOut', onComplete: () => contact.classList.add('is-solid') }, 0)
        .fromTo(logo, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(2.2)' }, 0.45)
        .fromTo(close, { opacity: 0, scale: 0.4, y: 20 }, { ...pop }, 0.55)
        .fromTo($('span', close), { opacity: 0, y: 15 }, { ...rise }, 0.67)
        .fromTo($$('.ehead .w > span', contact), { yPercent: 105, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'back.out(1.5)', stagger: 0.06 }, 0.7)
        .fromTo($('.csub span', contact), { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.85, ease: 'back.out(1.4)' }, 0.75)
        .fromTo($$('.elink', contact), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)', stagger: 0.08 }, 0.8);
      letters.forEach((c, n) => { // each letter lands fat and crooked, then straightens
        tl.fromTo(c, { opacity: 0, scale: 0.5, rotation: 0 }, { opacity: 1, scale: 1.1, rotation: rnd(-6, 6), duration: 0.45, ease: 'back.out(2)' }, 0.6 + n * 0.022)
          .to(c, { scale: 1, rotation: 0, duration: 0.6, ease: 'power2.out' }, 1.05 + n * 0.022);
      });
      [...pills].reverse().forEach((pl, i) => {
        tl.fromTo(pl, { opacity: 0, scale: 0.4, y: 20 }, { ...pop }, 0.9 + i * 0.12).fromTo($('span', pl), { opacity: 0, y: 15 }, { ...rise }, 1.05 + i * 0.12);
      });
      camel.start(tl);
    };
    const closeContact = () => {
      if (!contact.open || out) return;
      if (!ok) { contact.close(); return; }
      tl && tl.kill(); camel.stop();
      lay(); // for the viewport as it is now
      if (contact.classList.contains('is-solid')) gsap.set(fpath, { strokeDashoffset: 0, strokeWidth: wide });
      contact.classList.remove('is-solid');
      out = gsap.timeline({ defaults: { duration: 0.3, ease: 'power2.in', autoRound: false }, onComplete: () => contact.close() })
        .to([close, content, ...pills], { opacity: 0, y: -15 }, 0)
        .to(logo, { opacity: 0, scale: 0.85 }, 0)
        .to(fpath, { strokeDashoffset: len, strokeWidth: 0, duration: 0.45 }, 0.1); // the flood drains back where it came from
      if (camel.box) out.to(camel.box, { yPercent: 105 }, 0);
    };
    $$('[data-talk]').forEach((b) => b.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // a [data-talk] link still leads to the contact page in a new tab, or when this script has not run
      e.preventDefault();
      openContact();
    }));
    const closer = $('[data-close]', contact);
    closer && closer.addEventListener('click', closeContact);
    contact.addEventListener('cancel', (e) => { e.preventDefault(); closeContact(); });
    contact.addEventListener('close', () => { // however it closed: tidy up for the next opening
      camel.stop();
      lenis && lenis.start();
      if (!ok) return;
      tl && tl.kill(); out && out.kill(); out = null;
      contact.classList.remove('is-anim', 'is-solid');
      gsap.set([close, content, logo, ...pills], { clearProps: 'opacity,transform' });
    });
  }

  /* ---------- FAQ: one open at a time, answer pops out like a chat bubble ---------- */
  const fitems = $$('.fitem');
  if (fitems.length) {
    fitems[0].classList.add('show');
    const closeFaq = (it) => {
      it.classList.remove('open');
      $('.fq', it).setAttribute('aria-expanded', 'false');
      const fa = $('.fa', it);
      const end = () => { it.classList.remove('show'); ok && gsap.set(fa, { clearProps: 'height' }); };
      ok ? gsap.to(fa, { height: 0, duration: 0.25, ease: 'power2.inOut', onComplete: end }) : end();
    };
    const openFaq = (it) => {
      it.classList.add('open', 'show');
      $('.fq', it).setAttribute('aria-expanded', 'true');
      if (!ok) return;
      const fa = $('.fa', it);
      gsap.killTweensOf(fa);
      gsap.fromTo(fa, { height: 0 }, { height: 'auto', duration: 0.45, ease: 'power2.out' });
      gsap.fromTo($('.fa__block', it), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' });
      gsap.fromTo($('.fa__logo', it), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.15 });
      gsap.fromTo($('p', fa), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.12 });
    };
    fitems.forEach((it) => $('.fq', it).addEventListener('click', () => {
      const was = it.classList.contains('open');
      fitems.filter((o) => o.classList.contains('open')).forEach(closeFaq);
      if (!was) openFaq(it);
    }));
  }

  /* ---------- the logo on the home page scrolls to the top instead of reloading ---------- */
  if (location.pathname === '/' && $('.navbar__logo')) $('.navbar__logo').addEventListener('click', (e) => { e.preventDefault(); lenis ? lenis.scrollTo(0) : scrollTo(0, 0); });

  if (!ok) { lift(); return api; }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, prevent: (node) => !!node.closest('dialog, [data-lenis-prevent]') });   // a lighter glide; dialogs scroll on their own
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- loader: the logo is stamped on the first page of a visit. Later pages get one quick sweep with the header
     simply there, so it reads as the same bar. Back and Forward get no loader at all (loader.html removes it before paint). ---------- */
  const open = () => { lift(); lenis && lenis.start(); };
  const sweep = { strokeWidth: () => Math.hypot(innerWidth, innerHeight) * 1.5, duration: 0.8, ease: 'power2.inOut' };
  let seen = false;
  try { seen = !!sessionStorage.getItem('tb-seen'); sessionStorage.setItem('tb-seen', '1'); } catch (e) {}
  if (!$('.loader')) open();
  else if (seen) gsap.timeline().to('.loader__sweep path', { ...sweep, duration: 0.42 }).add(open, 0.3); // the band covers the screen by 0.3s
  else {
    gsap.set('.navbar > *', { y: -24, opacity: 0 });
    const lBase = $('.llogo__base');
    const lThe = $$('.llogo__the');
    const lCh = $$('.llogo__ch');
    gsap.set(lBase, { scale: 0, rotation: 10, transformOrigin: '50% 50%' });
    gsap.set(lThe, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(lCh, { scale: 2.6, opacity: 0, rotation: () => rnd(-18, 18), transformOrigin: '50% 50%' });
    gsap.set('.loader__logo', { visibility: 'visible' }); // hidden by CSS until its start state is set
    gsap.timeline({ delay: 0.25 })
      // the black sticker slaps down, THE ticks on, then each big letter is stamped into place
      .to(lBase, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(2.2)' })
      .to(lThe, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'back.out(3)' }, 0.3)
      .to(lCh, { scale: 1, opacity: 1, rotation: 0, duration: 0.32, stagger: 0.075, ease: 'back.out(2.4)' }, 0.5)
      // one squash when the last letter lands, then it settles
      .to('.llogo', { scaleX: 1.07, scaleY: 0.9, duration: 0.1, ease: 'power2.out', transformOrigin: '50% 100%' }, '-=0.08')
      .to('.llogo', { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.35)' })
      .to('.llogo', { rotation: -3, duration: 0.12, ease: 'power1.inOut', transformOrigin: '50% 50%' }, '-=0.1')
      .to('.llogo', { rotation: 0, duration: 0.6, ease: 'elastic.out(1.4, 0.3)' })
      .to('.loader__logo', { scale: 0.85, opacity: 0, duration: 0.3, ease: 'power1.in' }, '+=0.35')
      .to('.loader__sweep path', sweep, '<')
      .add(open)
      .to('.navbar > *', { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, '+=0.2');
  }

  /* ---------- cursor: a thin line trails the pointer and reels back in when it stops ---------- */
  if (matchMedia('(pointer: fine)').matches) {
    const cv = document.createElement('canvas');
    cv.className = 'trail'; cv.setAttribute('aria-hidden', 'true');
    document.body.append(cv);
    const c2 = cv.getContext('2d');
    const N = 16;
    let chain = null, mx = 0, my = 0, raf = 0, prev = 0;
    const size = () => { const d = devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; c2.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    const frame = (now) => {
      const k = 1 - Math.pow(0.5, Math.min(now - prev, 50) / 16.7); prev = now; // same reach at 60 and 120 Hz
      chain[0].x = mx; chain[0].y = my;
      for (let i = 1; i < N; i++) { chain[i].x += (chain[i - 1].x - chain[i].x) * k; chain[i].y += (chain[i - 1].y - chain[i].y) * k; }
      c2.clearRect(0, 0, innerWidth, innerHeight);
      c2.lineWidth = 1.5; c2.lineCap = 'round';
      for (let i = 1; i < N - 1; i++) { // one short curve per link so the tail can fade out
        const a = chain[i - 1], b = chain[i], c = chain[i + 1];
        c2.beginPath(); c2.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2); c2.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
        c2.strokeStyle = `rgba(0,0,0,${0.55 * (1 - i / N)})`; c2.stroke();
      }
      const t = chain[N - 1];
      raf = Math.hypot(t.x - mx, t.y - my) > 0.5 ? requestAnimationFrame(frame) : (c2.clearRect(0, 0, innerWidth, innerHeight), 0);
    };
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!chain) chain = Array.from({ length: N }, () => ({ x: mx, y: my }));
      if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); }
    }, { passive: true });
  }

  /* ---------- buttons: fill floods out of the arrow dot ---------- */
  if (fine) {
    $$('.cta').forEach((b) => {
      const fill = $('.cta__fill', b);
      const arrow = $('.cta__arrow svg', b);
      b.addEventListener('mouseenter', () => {
        gsap.to(fill, { scale: 10, duration: 0.55, ease: 'power2.out' });
        gsap.timeline().to(arrow, { rotation: -25, duration: 0.22, ease: 'power2.out' }).to(arrow, { rotation: 0, duration: 0.4, ease: 'back.out(2.5)' });
      });
      // the pill follows the pointer by a third of its offset, the label and arrow a little further, and all spring home
      const inner = $$('.cta__t, .cta__arrow', b);
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        gsap.to(b, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
        gsap.to(inner, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: 'power2.out' });
      });
      b.addEventListener('mouseleave', () => {
        gsap.to(fill, { scale: 1, duration: 0.45, ease: 'power2.out' });
        gsap.fromTo(arrow, { rotation: 12 }, { rotation: 0, duration: 0.8, ease: 'elastic.out(1.1, 0.4)' });
        gsap.to([b, ...inner], { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1.1, 0.4)' });
      });
    });
    /* headings lean toward the cursor and spring back */
    $$('[data-magnetic]').forEach((h) => {
      h.addEventListener('mousemove', (e) => {
        const r = h.getBoundingClientRect();
        gsap.to(h, { x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.18, duration: 0.2, ease: 'power1.out' });
      });
      h.addEventListener('mouseleave', () => gsap.to(h, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' }));
    });
  }

  /* ---------- project cards: the project's colour floods out of the arrow corner, then the tablet shot pours in through a
     second flood. Mechanics and timings follow two26.studio: two round strokes that draw and fatten, the second one is a mask.
     The curves are ours, drawn in a 453 x 688 box (one card at 1440 wide), each from the point where the liquid enters.
     Mouse hover and keyboard focus both play it; a touch screen has neither, so a tap just follows the link. ---------- */
  const BW = 453, BH = 688;
  const FLOOD = 'M458 702C440 679 354 627 350 566C346 505 475 319 434 336C393 353 102 725 102 666C102 607 448 34 432 -16C416 -66 49 369 6 368C-37 367 146 41 174 -24';
  const REVEAL = 'M404 -10C403 54 453 371 398 372C343 373 122 -56 74 -4C26 48 42 570 110 684C178 798 422 679 484 678';
  $$('.pitem').forEach((item, i) => {
    const clip = $('.pcard__clip', item), shot = $('.pcard__hover', item), arrow = $('.parrow svg', item);
    if (!clip || !shot) return; // a card without a tablet shot keeps its plain state
    clip.insertAdjacentHTML('beforeend', `<svg class="pwater" aria-hidden="true"><path class="pwater__flood" d="${FLOOD}"/><mask id="pwater-${i}"><path stroke="#fff" d="${REVEAL}"/></mask><image width="100%" height="100%" preserveAspectRatio="xMidYMin slice" mask="url(#pwater-${i})"/></svg>`);
    const [flood, reveal] = $$('.pwater path', clip), image = $('.pwater image', clip);
    // the lazy <img> still does the loading; the svg shows the same file, framed like object-fit: cover from the top
    const src = () => image.setAttribute('href', shot.currentSrc || shot.src);
    shot.complete && shot.naturalWidth ? src() : shot.addEventListener('load', src, { once: true });
    [flood, reveal].forEach((p) => { p.style.strokeDasharray = p.style.strokeDashoffset = p.getTotalLength(); p.style.strokeWidth = 0; });
    // the curves keep their shape and cover the card at any size
    const fit = () => {
      const w = clip.clientWidth, h = clip.clientHeight, s = Math.max(w / BW, h / BH);
      const t = `translate(${(w - BW * s) / 2} ${(h - BH * s) / 2}) scale(${s})`;
      flood.setAttribute('transform', t); reveal.setAttribute('transform', t);
    };
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power1.inOut', autoRound: false }, onReverseComplete: () => item.classList.remove('is-wet') })
      .to(flood, { strokeDashoffset: 0, strokeWidth: 815, duration: 0.95 }, 0)
      .to(reveal, { strokeDashoffset: 0, strokeWidth: 770, duration: 1.05 }, 0.35);
    if (arrow) tl.to(arrow, { rotation: -45, duration: 0.28, ease: 'power2.out' }, 0).to(arrow, { rotation: 0, duration: 0.65, ease: 'elastic.out(1.15, 0.35)' }, 0.28);
    item.classList.add('has-water');
    const wet = () => { shot.loading = 'eager'; fit(); item.classList.add('is-wet'); tl.timeScale(1).play(); };
    const dry = () => { if (!(fine && item.matches(':hover')) && !item.matches(':focus-visible')) { tl.timeScale(1.3).reverse(); if (!tl.time()) item.classList.remove('is-wet'); } }; // back from wherever it is, a little faster
    if (fine) { item.addEventListener('mouseenter', wet); item.addEventListener('mouseleave', dry); }
    item.addEventListener('focus', () => item.matches(':focus-visible') && wet());
    item.addEventListener('blur', dry);
  });

  if (fine) {
    /* footer links: letters hop in a wave */
    $$('.flink, .elink').forEach((l) => {
      const node = [...l.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (!node) return;
      const wrap = document.createElement('span');
      wrap.innerHTML = [...node.textContent.trim()].map((c) => (c === ' ' ? ' ' : `<span class="ch">${c}</span>`)).join('');
      l.replaceChild(wrap, node);
      const cs = $$('.ch', wrap), el = l.classList.contains('elink'), tilt = el ? 7 : 10; // addresses wave slower, and settle when the pointer leaves
      if (el) l.addEventListener('mouseleave', () => { gsap.killTweensOf(cs); gsap.to(cs, { scale: 1, rotation: 0, duration: 0.35, ease: 'power2.out', stagger: 0.018 }); });
      l.addEventListener('mouseenter', () => cs.forEach((c, i) => {
        gsap.timeline({ delay: i * (el ? 0.035 : 0.018) })
          .to(c, { scale: 1.14, rotation: rnd(-tilt, tilt), duration: 0.38, ease: 'back.out(1.8)' })
          .to(c, { scale: 1, rotation: 0, duration: 0.5, ease: 'power2.out' });
      }));
    });
  }

  /* ---------- project videos load and play only while their card is on screen ---------- */
  const pio = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: 0.2 });
  $$('.pcard__video').forEach((v) => pio.observe(v));

  /* ---------- flash cards: a burst of quick cuts through a project's pages, then a rest on its hero ---------- */
  const CUT = 210, PERIOD = 4500; // 210 ms a frame stays under three light-dark flashes a second (WCAG 2.3.1)
  $$('.pflash').forEach((box, n) => {
    const imgs = $$('img', box); // the first image is the hero frame the card rests on
    let i = 0, timer = 0, loaded = null, on = false;
    const step = () => {
      imgs[i].classList.remove('is-on', 'is-hold');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('is-on');
      if (!i) imgs[i].classList.add('is-hold');
      timer = setTimeout(step, i ? CUT : PERIOD - (imgs.length - 1) * CUT); // every card loops in the same time, so their turns stay apart
    };
    // frames are fetched when the card is near, and the burst waits until every one is decoded, so no cut shows a blank
    const load = () => loaded || (loaded = Promise.all(imgs.map((im) => { if (im.dataset.src) im.src = im.dataset.src; return im.decode().catch(() => {}); })));
    new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: '80% 0px' }).observe(box);
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      clearTimeout(timer);
      // cards in a row take turns, a third of the loop apart: the row flashes as a wave instead of all at once
      if (on) load().then(() => { clearTimeout(timer); if (on) timer = setTimeout(step, 300 + (n % 3) * PERIOD / 3); });
    }, { threshold: 0.35 }).observe(box);
  });

  /* ---------- scroll-triggered parts that sit below page content: made once every script has run ---------- */
  const late = () => {
    /* project cards unfold from a small tilted window */
    $$('.pitem').forEach((it, i) => {
      const col = i % 3;
      if ($('.pcard', it)) gsap.fromTo($('.pcard', it),
        { clipPath: 'inset(42.5% 42.5% 42.5% 42.5% round 1em)', scale: 1.45, rotationX: 25, rotationY: (col - 1) * -14, rotation: (col - 1) * 4 || 3 },
        { clipPath: 'inset(0% 0% 0% 0% round 1em)', scale: 1, rotationX: 0, rotationY: 0, rotation: 0, duration: 1.25, ease: 'power3.out', scrollTrigger: { trigger: it, start: 'top 85%' } });
    });
    /* footer: heading rises, wordmark springs up from a squash */
    const fl = $$('.footer__heading .lm > span');
    if (!fl.length || !$('.footer__btm')) return; // a page without the footer
    gsap.set(fl, { yPercent: 115, opacity: 0 });
    gsap.to(fl, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.footer', start: 'top 80%' } });
    gsap.fromTo('.footer__btm', { scaleY: 0.15 }, { scaleY: 1, duration: 1.4, ease: 'elastic.out(1.2, 0.35)', scrollTrigger: { trigger: '.footer', start: 'top 35%' } });
  };
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', late) : late();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());

  return api;
})();

/* brands wall: rows loop forever (the set is doubled), the camel blinks, twitches an ear and opens its mouth when a logo blushes */
(() => {
  const wall = document.querySelector('.brands');
  if (!wall) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* three arcs, edge to edge; the middle one runs the other way. Each tile's x loops round its row, its y and tilt follow the arc */
  const box = wall.querySelector('.brands__rows');
  const rows = [...wall.querySelectorAll('.brands__row')].map((row, r) => ({ tiles: [...row.children], dir: r === 1 ? 1 : -1, x: 0, speed: 1, r }));
  // sizes are measured once and on resize; each frame only writes transforms (reading layout every frame made it stutter)
  let W, tw, sag, lane, gap;
  const measure = () => {
    W = box.clientWidth; const em = parseFloat(getComputedStyle(box).fontSize);
    tw = rows[0].tiles[0].offsetWidth; const th = rows[0].tiles[0].offsetHeight; gap = 1.6 * em;
    sag = Math.min(th, W * 0.065); lane = th * 1.6;                    // sag: how much higher the middle of an arc sits; lane: arc to arc
    box.style.height = `${sag + 2 * lane + th + em}px`;
  };
  const place = () => {
    rows.forEach((row) => {
      const step = tw + gap, L = Math.max(row.tiles.length * step, W + 2 * step);
      const top = row.r * lane + sag;
      row.tiles.forEach((t, i) => {
        const x = ((((i * step + row.x) % L) + L) % L) - step;   // loops from just off the left edge to just off the right
        const u = (x + tw / 2) / W * 2 - 1;                    // -1 at the left edge, 1 at the right
        const y = top - sag * (1 - u * u);
        const a = Math.atan2(4 * sag * u / W, 1) * 180 / Math.PI;
        t.style.transform = `translate3d(${x}px,${y}px,0) rotate(${a}deg)`;
      });
    });
  };
  measure(); place();
  addEventListener('resize', () => { measure(); place(); });
  if (still) return;
  let on = false;
  new IntersectionObserver(([en]) => { on = en.isIntersecting; }, { rootMargin: '10% 0px' }).observe(box);
  rows.forEach((row) => row.tiles.forEach((t) => {
    t.addEventListener('pointerenter', () => { row.hold = true; });
    t.addEventListener('pointerleave', () => { row.hold = false; });
  }));
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(now - last, 50); last = now;
    if (on) {
      rows.forEach((row) => { row.speed += ((row.hold ? 0 : 1) - row.speed) * 0.08; row.x += row.dir * row.speed * dt * 0.045; });
      place();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  if (!window.gsap) return;
  const q = (s) => wall.querySelector(s);
  const lid = q('.bcamel__lid'), jaw = q('.bcamel__jaw'), ears = [q('.bcamel__ear-l'), q('.bcamel__ear-r')], camel = q('.bcamel');
  const blink = () => { gsap.timeline().to(lid, { scaleY: 1, duration: 0.08, ease: 'power2.in' }).to(lid, { scaleY: 0, duration: 0.14, ease: 'power2.out' }); gsap.delayedCall(gsap.utils.random(2.2, 5.5), blink); };
  gsap.set(lid, { scaleY: 0 }); blink();
  gsap.set(camel, { yPercent: 70 }); // pops up the first time the wall comes into view (an observer, so pinned sections above never skew it)
  const pop = new IntersectionObserver(([en]) => { if (en.isIntersecting) { gsap.to(camel, { yPercent: 0, duration: 0.9, ease: 'back.out(1.8)' }); pop.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' });
  pop.observe(wall);
  wall.querySelectorAll('.brands__rows').forEach((rows) => {
    rows.addEventListener('pointerover', (e) => {
      if (!e.target.closest('.btile')) return;
      gsap.to(jaw, { rotation: 6, duration: 0.25, ease: 'power2.out', overwrite: true });
      ears.forEach((ear, i) => gsap.fromTo(ear, { rotation: 0 }, { rotation: i ? -14 : 12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.inOut' }));
    });
    rows.addEventListener('pointerleave', () => gsap.to(jaw, { rotation: 0, duration: 0.4, ease: 'power2.out', overwrite: true }));
  });
  wall.addEventListener('pointermove', (e) => {
    const r = camel.getBoundingClientRect();
    gsap.to(camel, { rotation: gsap.utils.clamp(-8, 8, (e.clientX - (r.left + r.width / 2)) / 60), duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
  });
})();

/* phones: a pop-up's Close button stays exactly where it first appears while the card scrolls under it. Once the
   card has finished opening, the button moves out of the scrolling card into the dialog itself and is fixed at the
   spot it was drawn; it goes back when the dialog closes. */
(() => {
  const PAIRS = [['dialog.tm-pop', '.tm-pop__close'], ['dialog.ab-pop', '.ab-pop__close'], ['dialog.qf', '.qf__x'], ['dialog.game', '.game__x']];
  PAIRS.forEach(([d, b]) => {
    const dlg = document.querySelector(d), btn = dlg && dlg.querySelector(b);
    if (!btn) return;
    const home = btn.parentNode, next = btn.nextSibling;
    let timer = 0;
    const pin = () => {
      if (!dlg.open || innerWidth > 767) return;
      const r = btn.getBoundingClientRect();
      dlg.appendChild(btn);
      Object.assign(btn.style, { position: 'fixed', top: `${r.top}px`, left: `${r.left}px`, right: 'auto', bottom: 'auto', margin: '0', zIndex: '20' });
    };
    const unpin = () => { clearTimeout(timer); if (btn.parentNode !== home) home.insertBefore(btn, next); ['position', 'top', 'left', 'right', 'bottom', 'margin', 'zIndex'].forEach((k) => { btn.style[k] = ''; }); };
    new MutationObserver(() => { if (dlg.open) { clearTimeout(timer); timer = setTimeout(pin, 800); } else unpin(); }).observe(dlg, { attributes: true, attributeFilter: ['open'] });
  });
})();
