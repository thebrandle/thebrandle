/* The Brandle contact page: "Let's Talk" scrolls to the form here, the form itself, the hero letters and the camel.
   Shared parts live in /main.js (window.TB). Without GSAP or with reduced motion everything is simply visible. */
(() => {
  const { $, $$, ok, fine, rnd } = TB;
  const brief = $('#brief');
  const form = $('.ct-form');
  const tagText = $('.camel__tag span');

  /* ---------- "Let's Talk" (header, footer, the camel's tag) goes to the form instead of opening the panel ---------- */
  const toForm = () => {
    const y = brief.getBoundingClientRect().top + scrollY - 70;
    TB.lenis ? TB.lenis.scrollTo(y, { duration: 1.1 }) : scrollTo({ top: y, behavior: TB.reduce ? 'auto' : 'smooth' });
    const first = form.hidden ? $('.ct-done__h') : form.elements.name;
    setTimeout(() => first.focus({ preventScroll: true }), TB.reduce ? 0 : 900);
  };
  // capture phase: runs before main.js's own listener on the button, which would open the overlay
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-talk], a[href="#brief"]');
    if (!t || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation();
    toForm();
  }, true);

  /* ---------- form ---------- */
  const EMAIL = 'hello@thebrandle.com';
  const status = $('.ct-status');
  const btn = $('.ct-submit');
  const btnT = $('.cta__t', btn);
  const rules = {
    name: (v) => (v ? '' : 'We need something to call you.'),
    email: (v) => (!v ? 'Where should the reply go?' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That email looks a letter or two short.'),
    message: (v) => (v ? '' : 'One sentence will do. We are good at follow-up questions.'),
  };
  const check = (name) => {
    const el = form.elements[name];
    const msg = rules[name](el.value.trim());
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('#' + el.getAttribute('aria-describedby')).textContent = msg;
    return !msg;
  };
  form.noValidate = true; // our own messages; with no script the browser's required checks still apply
  Object.keys(rules).forEach((n) => {
    const el = form.elements[n];
    el.addEventListener('blur', () => { if (el.value.trim() || el.getAttribute('aria-invalid') === 'true') check(n); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(n); });
  });

  // /contact?plan=build-pro preselects the plan, as the live page does
  const want = new URLSearchParams(location.search).get('plan');
  const opt = want && $$('option[data-plan]', form).find((o) => o.dataset.plan === want.toLowerCase());
  if (opt) opt.selected = true;
  // from the pricing page's price builder: its receipt goes into the message
  try { const q = sessionStorage.getItem('tb-quote'); if (q && want === 'custom') { form.elements.message.value = q; sessionStorage.removeItem('tb-quote'); } } catch (e) {}

  /* branded dropdowns: a button and a listbox over each real select, which stays in the form and keeps the value */
  const ARROW = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.8L5 6.8l3-3"/></svg>';
  $$('select', form).forEach((sel, n) => {
    const box = document.createElement('div');
    box.className = 'pick';
    sel.parentNode.insertBefore(box, sel);
    box.appendChild(sel);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const label = form.querySelector(`label[for="${sel.id}"]`);
    const id = `pick-${n}`;
    box.insertAdjacentHTML('afterbegin', `<button class="pick__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}"><span></span><i>${ARROW}</i></button><ul class="pick__list" id="${id}" role="listbox" tabindex="-1" hidden></ul>`);
    const btn = $('.pick__btn', box), list = $('.pick__list', box), opts = [...sel.options];
    if (label) { label.id = label.id || `${id}-l`; btn.setAttribute('aria-labelledby', `${label.id} ${id}-v`); list.setAttribute('aria-labelledby', label.id); label.htmlFor = ''; label.addEventListener('click', () => btn.focus()); }
    $('span', btn).id = `${id}-v`;
    list.innerHTML = opts.map((o, i) => `<li class="pick__opt" id="${id}-${i}" role="option" aria-selected="false">${o.text.replace(/, (\$[\d,]+)$/, ', <b>$1</b>')}</li>`).join('');
    const items = $$('.pick__opt', list);
    let active = 0;
    const paint = () => {
      $('span', btn).textContent = sel.options[sel.selectedIndex].text;
      items.forEach((li, i) => li.setAttribute('aria-selected', String(i === sel.selectedIndex)));
    };
    const hover = (i) => { active = (i + items.length) % items.length; items.forEach((li, k) => li.classList.toggle('is-active', k === active)); list.setAttribute('aria-activedescendant', items[active].id); items[active].scrollIntoView({ block: 'nearest' }); };
    const close = (focus) => {
      if (list.hidden) return;
      box.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      const end = () => { list.hidden = true; };
      ok ? gsap.to(list, { opacity: 0, scale: 0.92, y: -6, duration: 0.18, ease: 'power2.in', onComplete: end }) : end();
      if (focus) btn.focus();
    };
    const open = () => {
      $$('.pick.is-open').forEach((b) => b !== box && $('.pick__btn', b).click());
      list.hidden = false; box.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      hover(sel.selectedIndex); list.focus({ preventScroll: true });
      if (ok) gsap.fromTo(list, { opacity: 0, scale: 0.9, y: -8 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(2.2)' });
      if (ok) gsap.from(items, { x: -10, opacity: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out' });
    };
    const choose = (i) => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); paint(); close(true); };
    btn.addEventListener('click', () => (list.hidden ? open() : close()));
    items.forEach((li, i) => { li.addEventListener('click', () => choose(i)); li.addEventListener('mousemove', () => active !== i && hover(i)); });
    list.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); hover(active + (k === 'ArrowDown' ? 1 : -1)); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); hover(k === 'Home' ? 0 : items.length - 1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
      else if (k === 'Escape' || k === 'Tab') { if (k === 'Escape') e.preventDefault(); close(k === 'Escape'); }
    });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    document.addEventListener('pointerdown', (e) => { if (!box.contains(e.target)) close(); });
    sel.addEventListener('change', paint);
    paint();
  });
  // from a plan button on the pricing page: land on the form once the page has settled
  if (location.hash === '#brief') addEventListener('load', () => setTimeout(() => { const y = brief.getBoundingClientRect().top + scrollY - 70; TB.lenis ? TB.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); }, 120));

  // the handler emails name, email, phone, plan and message: needs and budget travel inside the message
  const payload = () => {
    const f = form.elements;
    const needs = $$('input[name="needs"]:checked', form).map((c) => c.value).join(', ');
    const message = [needs && `Needs: ${needs}.`, f.budget.value && `Budget: ${f.budget.value}.`, f.message.value.trim()].filter(Boolean).join(' ');
    return { name: f.name.value.trim(), email: f.email.value.trim(), phone: '', plan: f.plan.value, message };
  };
  const done = () => {
    const box = $('.ct-done');
    form.hidden = true; box.hidden = false;
    tagText.textContent = 'Got it';
    $('.ct-done__h').focus({ preventScroll: true });
    if (ok) gsap.fromTo(box.children, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.09 });
  };
  const failed = (data) => {
    const mail = `mailto:${EMAIL}?subject=${encodeURIComponent('New project from ' + data.name)}&body=${encodeURIComponent(data.message + (data.plan ? `\n\nPlan: ${data.plan}` : ''))}`;
    status.innerHTML = `That did not send. Our end, not yours, and everything you typed is still here. Try again in a moment, or <a href="${mail}">email it to ${EMAIL}</a> with your message already filled in.`;
    if (ok) gsap.fromTo(status, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.3)' });
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (btn.disabled) return;
    const bad = Object.keys(rules).filter((n) => !check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    if (form.elements.website.value) return done(); // a bot filled the hidden field: nothing is sent
    const data = payload();
    status.textContent = '';
    btn.disabled = true; btnT.textContent = 'Sending';
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 15000);
      const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctl.signal });
      clearTimeout(timer);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || res.status);
      done();
    } catch (err) {
      failed(data);
    }
    btn.disabled = false; btnT.textContent = 'Send it';
  });

  /* ---------- the camel's head: the contact panel's drawn head, cloned from the dialog on this same page, so page and
     panel share one character. Its data-geo says where the neck joins and where the mouth is. If the panel has no
     art, the simple stand-in head in the markup stays. Sizes are in the neck svg's units (400 wide = 25em). ---------- */
  const camel = $('.camel');
  const top = $('.camel__top');
  const tag = $('.camel__tag');
  const P0 = [285, 520], C0 = [300, 330], J0 = [262, 160];
  const src = $('.contact .ccamel__art');
  if (src && src.dataset.geo && src.firstElementChild) {
    const g = JSON.parse(src.dataset.geo), u = g.em[0] / g.vb[0] * 16 * 1.3, pc = (v) => `${v * 100}%`;
    const art = src.cloneNode(true);
    art.className = 'camel__head camel__head--art'; art.removeAttribute('data-geo');
    $$('i', art).forEach((i) => i.remove());
    $('.camel__head').replaceWith(art);
    Object.assign(top.style, { left: pc((J0[0] - g.neck[0] * u) / 400), top: pc((J0[1] - g.neck[1] * u) / 496), width: pc(g.vb[0] * u / 400), height: pc(g.vb[1] * u / 496), transformOrigin: `${pc(g.neck[0] / g.vb[0])} ${pc(g.neck[1] / g.vb[1])}` });
    Object.assign($('.camel__hold').style, { right: pc(1 - g.mouth[0] / g.vb[0]), top: pc(g.mouth[1] / g.vb[1]) });
    camel.classList.add('camel--art');
  }
  $$('.camel__neck path').forEach((n) => n.setAttribute('d', `M${P0}Q${C0} ${J0}`));

  if (!ok) return;

  /* ---------- hero: letters pop one by one (the panel's values), sub line rises, links follow ---------- */
  const letters = $$('.ct-h1 > span').flatMap((l) => TB.chars(l));
  const sub = $('.ct-sub > span');
  const side = $$('.ct-hero__right > div');
  gsap.set(letters, { opacity: 0, scale: 0.5 });
  gsap.set(sub, { yPercent: 120 });
  gsap.set(side, { y: 24, opacity: 0 });
  gsap.set(camel, { yPercent: 105, rotation: rnd(-3, 3), transformOrigin: '50% 100%' });

  /* ---------- the camel: the neck bends after the pointer, the head turns with it, the tag swings behind ---------- */
  const necks = $$('.camel__neck path');
  const spots = $$('.camel__neck ellipse');
  const REST = Math.atan2(J0[1] - C0[1], J0[0] - C0[0]);
  const SPOT = [[0.35, -10], [0.55, 12], [0.75, -6]];
  const s = { dx: 0, dy: 0, look: 0, nod: 0, tag: 0, tagV: 0 };
  const toX = gsap.quickTo(s, 'dx', { duration: 0.6, ease: 'power3.out' });
  const toY = gsap.quickTo(s, 'dy', { duration: 0.6, ease: 'power3.out' });
  let live = false, away = true, prevDx = 0, camW = camel.clientWidth;
  addEventListener('resize', () => { camW = camel.clientWidth; });
  const frame = (time, delta) => {
    const dt = Math.min(delta, 50) / 1000;
    const breathe = Math.sin(time * 1.96) * 1.4;
    const sway = away ? Math.sin(time * 0.9) * 9 : 0; // nobody is pointing at him: he looks around on his own
    const dx = s.dx + sway, dy = s.dy + breathe;
    const cx = C0[0] + dx * 0.35, cy = C0[1] + dy * 0.2, jx = J0[0] + dx, jy = J0[1] + dy;
    const d = `M${P0[0]} ${P0[1]}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${jx.toFixed(1)} ${jy.toFixed(1)}`;
    necks.forEach((p) => p.setAttribute('d', d));
    SPOT.forEach(([t, off], i) => { // three spots ride the curve
      const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
      spots[i].setAttribute('cx', (a * P0[0] + b * cx + c * jx + off).toFixed(1));
      spots[i].setAttribute('cy', (a * P0[1] + b * cy + c * jy).toFixed(1));
    });
    const k = camW / 400; // art units to pixels (measured on resize, not every frame)
    const turn = (Math.atan2(jy - cy, jx - cx) - REST) * 180 / Math.PI; // the head sits square on the end of the neck
    gsap.set(top, { x: dx * k, y: dy * k, rotation: turn + s.look + s.nod });
    // the tag hangs back like a pendulum: a spring pulled by how fast the head moves sideways
    const v = dt ? (dx - prevDx) / dt : 0; prevDx = dx;
    const goal = gsap.utils.clamp(-14, 14, -0.035 * v);
    s.tagV += ((goal - s.tag) * 90 - s.tagV * 9) * dt;
    s.tag += s.tagV * dt;
    gsap.set(tag, { rotation: s.tag });
  };
  const run = (on) => { if (on === live) return; live = on; on ? gsap.ticker.add(frame) : gsap.ticker.remove(frame); };
  new IntersectionObserver(([e]) => run(e.isIntersecting)).observe(camel);

  if (fine) {
    const hero = $('.ct-hero');
    hero.addEventListener('mousemove', (e) => {
      const r = camel.getBoundingClientRect(), k = r.width / 400;
      const x = (e.clientX - r.left) / k - (J0[0] - 60), y = (e.clientY - r.top) / k - (J0[1] - 60); // from his face, in art units
      const len = Math.hypot(x, y) || 1, reach = Math.min(len * 0.22, 70);
      away = false;
      toX((x / len) * reach); toY((y / len) * reach * 0.55);
      gsap.to(s, { look: gsap.utils.clamp(-8, 8, -y * 0.02), duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
    });
    hero.addEventListener('mouseleave', () => { away = true; toX(0); toY(0); gsap.to(s, { look: 0, duration: 0.8, overwrite: 'auto' }); });
    tag.addEventListener('mouseenter', () => gsap.to(tag, { scale: 1.06, duration: 0.35, ease: 'back.out(3)' }));
    tag.addEventListener('mouseleave', () => gsap.to(tag, { scale: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' }));
  }
  // two quick nods when the tag is pressed, and (stand-in head only) an ear flick every few seconds
  tag.addEventListener('click', () => gsap.fromTo(s, { look: 0 }, { look: 10, duration: 0.11, ease: 'sine.inOut', yoyo: true, repeat: 3 }));
  const near = $('.camel__ear--near'), far = $('.camel__ear--far');
  const flick = () => {
    if (live) {
      gsap.timeline().to(near, { rotation: -18, duration: 0.1 }).to(near, { rotation: 0, duration: 0.35, ease: 'back.out(3)' });
      gsap.timeline({ delay: 0.06 }).to(far, { rotation: -9, duration: 0.1 }).to(far, { rotation: 0, duration: 0.35, ease: 'back.out(3)' });
    }
    gsap.delayedCall(rnd(4, 9), flick);
  };
  if (near) gsap.delayedCall(rnd(3, 5), flick);

  TB.ready(() => {
    letters.forEach((c, i) => {
      gsap.timeline({ delay: 0.15 + i * 0.022 })
        .to(c, { opacity: 1, scale: 1.1, rotation: rnd(-6, 6), duration: 0.45, ease: 'back.out(2)' })
        .to(c, { scale: 1, rotation: 0, duration: 0.6, ease: 'power2.out' });
    });
    gsap.to(sub, { yPercent: 0, duration: 0.85, ease: 'back.out(1.4)', delay: 0.75 });
    gsap.to(side, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.1, delay: 0.7 });
    gsap.to(camel, { yPercent: 0, rotation: 0, duration: 0.75, ease: 'back.out(1.4)', delay: 0.55 });
    gsap.delayedCall(0.55, () => { s.tag = -20; }); // let go at -20 degrees: the spring does the settling
  });

  /* ---------- scroll reveals ---------- */
  const rise = (els, trigger) => {
    if (!els.length) return;
    gsap.set(els, { yPercent: 115 });
    gsap.to(els, { yPercent: 0, duration: 0.85, ease: 'back.out(1.4)', stagger: 0.12, scrollTrigger: { trigger, start: 'top 85%' } });
  };
  $$('.ct [data-lines]').forEach((h) => rise($$('.lm > span', h), h));
  $$('.way').forEach((w) => {
    const parts = $$('.way__k, .way__v, .way__q, .way__a', w);
    gsap.set(parts, { y: 28, opacity: 0 });
    gsap.to(parts, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06, scrollTrigger: { trigger: w, start: 'top 90%' } });
  });
  const fields = $$('.ct-form > *:not(.ct-hp):not(.ct-status):not(noscript)');
  gsap.set(fields, { y: 30, opacity: 0 });
  gsap.to(fields, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', stagger: 0.08, scrollTrigger: { trigger: form, start: 'top 85%' } });
  const pill = $('.ct-brief__pill');
  gsap.set(pill, { scale: 0 });
  gsap.to(pill, { scale: 1, duration: 0.55, ease: 'back.out(2.5)', scrollTrigger: { trigger: pill, start: 'top 90%' } });
  const TILT = [-3, 2, -1.5]; // the cards' rest angles, as in the CSS
  $$('.step').forEach((st, i) => {
    gsap.set(st, { opacity: 0, scale: 0.65, rotation: TILT[i] + (i % 2 ? 6 : -6) });
    gsap.to(st, { opacity: 1, scale: 1, rotation: TILT[i], duration: 0.85, ease: 'back.out(2.2)', delay: i * 0.12, scrollTrigger: { trigger: '.ct-steps', start: 'top 85%' } });
    if (fine) {
      st.addEventListener('mouseenter', () => gsap.to(st, { y: -10, rotation: 0, duration: 0.4, ease: 'back.out(3)' }));
      st.addEventListener('mouseleave', () => gsap.to(st, { y: 0, rotation: TILT[i], duration: 0.7, ease: 'elastic.out(1.1, 0.4)' }));
    }
  });

  /* ---------- the two ways in: hover the email and envelopes fall out of the camel's mouth; hover the call and
     headphones drop onto its head ---------- */
  const mailLink = $('[data-fx="mail"]'), callLink = $('[data-fx="call"]');
  if (fine && mailLink) {
    const layer = document.createElement('div');
    layer.className = 'mailfall'; layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    const ENV = '<svg viewBox="0 0 40 28"><rect x="1.5" y="1.5" width="37" height="25" rx="3" fill="#fdf8f5" stroke="#000" stroke-width="2.5"/><path d="M2.5 3l17.5 13L37.5 3" fill="none" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="16" r="3.4" fill="#f9452d" stroke="#000" stroke-width="1.6"/></svg>';
    let drip = 0;
    const drop = () => {
      const m = $('.camel__mouth').getBoundingClientRect(), floor = camel.getBoundingClientRect().bottom;
      const x = m.left, y = m.top;
      layer.insertAdjacentHTML('beforeend', ENV);
      const env = layer.lastElementChild, dir = rnd(-1, 0.35), fall = Math.max(160, floor - y + rnd(-40, 30));
      gsap.set(env, { x, y, xPercent: -50, yPercent: -50, scale: 0.2, rotation: rnd(-20, 20), opacity: 1 });
      // spat out a little, then it tumbles down like paper: gravity on y, a sideways drift, a lazy spin
      const tl = gsap.timeline({ onComplete: () => env.remove() });
      tl.to(env, { scale: rnd(0.85, 1.25), duration: 0.35, ease: 'back.out(3)' }, 0)
        .to(env, { x: x + dir * rnd(60, 190), duration: rnd(1.6, 2.3), ease: 'sine.out' }, 0)
        .to(env, { y: y + fall, duration: rnd(1.5, 2.1), ease: 'power2.in' }, 0.08)
        .to(env, { rotation: `+=${rnd(-260, 260)}`, duration: 2.2, ease: 'none' }, 0)
        .to(env, { opacity: 0, duration: 0.35 }, '-=0.35');
      gsap.fromTo(top, { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });   // a little cough with each one
    };
    const start = () => { if (drip) return; drop(); drip = setInterval(drop, 210); };
    const stop = () => { clearInterval(drip); drip = 0; };
    mailLink.addEventListener('mouseenter', start); mailLink.addEventListener('focus', start);
    mailLink.addEventListener('mouseleave', stop); mailLink.addEventListener('blur', stop);
  }
  const ph = $('.camel__phones');
  if (fine && callLink && ph) {
    const notes = $('.camel__notes', ph);
    gsap.set(ph, { yPercent: -40, scale: 0.7, transformOrigin: '75% 50%' });
    const on = () => {
      camel.classList.add('camel--phones');
      gsap.to(ph, { opacity: 1, yPercent: 0, scale: 1, duration: 0.55, ease: 'back.out(2.4)', overwrite: true });
      gsap.fromTo(notes, { opacity: 0, y: 10 }, { opacity: 1, y: -14, duration: 0.9, ease: 'power2.out', repeat: -1, repeatDelay: 0.25, delay: 0.3 });
      gsap.fromTo(s, { nod: -3 }, { nod: 5, duration: 0.36, yoyo: true, repeat: -1, ease: 'sine.inOut' });   // nodding along
    };
    const off = () => {
      camel.classList.remove('camel--phones');
      gsap.to(ph, { opacity: 0, yPercent: -40, scale: 0.7, duration: 0.35, ease: 'power2.in', overwrite: true });
      gsap.killTweensOf(notes); gsap.to(notes, { opacity: 0, duration: 0.2 });
      gsap.killTweensOf(s, 'nod'); gsap.to(s, { nod: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    };
    callLink.addEventListener('mouseenter', on); callLink.addEventListener('focus', on);
    callLink.addEventListener('mouseleave', off); callLink.addEventListener('blur', off);
  }
})();
