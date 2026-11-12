/* The Brandle home page: hero, slogans on the boards, curved marquee, pinned "about" line, carousel,
   "there's more" block, the services line and the numbers stack. Shared parts live in /main.js (window.TB). */
(() => {
  const { $, $$, ok, fine, rnd } = TB;

  const aboutChars = TB.chars($('[data-chars]'));

  /* ---------- hero word: a drop of orange falls into the word, and the liquid rises until it is full; then it
     drains and the next word gets its drop (the pour idea from Fanfare's preloader). Empty, the word is only a faint
     tint, never an outline. The heading's aria-label keeps the line steady for screen readers. ---------- */
  const hw = $('.hword');
  if (hw) {
    const WORDS = ['design', 'branding', 'websites', 'apps', 'deadlines', 'everything'];
    const o = $('.hword__o', hw), f = $('.hword__f', hw);
    const set = (w) => { o.textContent = w; f.textContent = w; };
    // desktop: the heading box is as wide as its widest word, so "Annoyingly" and the three labels never move;
    // only the word's own slot glides to the next word's width (phones stack the word on its own line instead)
    const wide = matchMedia('(min-width: 768px)'), box = $('.hero__text');
    let widths = [], cur = 0;
    const measure = () => {
      hw.style.width = ''; box.style.width = '';
      if (!wide.matches) return;
      const was = o.textContent;
      widths = WORDS.map((w) => { set(w); return hw.getBoundingClientRect().width; });
      set(WORDS[widths.indexOf(Math.max(...widths))]);
      box.style.width = `${box.getBoundingClientRect().width}px`;
      set(was);
      hw.style.width = `${widths[WORDS.indexOf(was)]}px`;
    };
    const glide = (i) => { if (widths.length && wide.matches) gsap.to(hw, { width: widths[i], duration: 0.75, ease: 'power3.inOut', overwrite: true }); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);
    let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(measure, 150); });
    if (!ok || TB.reduce) hw.classList.add('is-full');
    else {
      hw.insertAdjacentHTML('beforeend', '<i class="hword__drop" aria-hidden="true"></i><i class="hword__ring" aria-hidden="true"></i>');
      const drop = $('.hword__drop', hw), ring = $('.hword__ring', hw);
      gsap.set(f, { '--lvl': '-0.2em', '--wx': '0em' });
      const wave = gsap.to(f, { '--wx': '1.1em', duration: 1.4, ease: 'none', repeat: -1, paused: true });   // the wave rolls along, only while the level moves
      let i = 0;
      const tl = gsap.timeline({ repeat: -1, delay: 1.1 });
      tl.add(() => wave.play()).fromTo(drop, { y: '-1.4em', scaleX: 0.7, scaleY: 1.3, opacity: 0 }, { y: '0.8em', opacity: 1, duration: 0.5, ease: 'power2.in' })   // falls
        .to(drop, { scaleX: 2.2, scaleY: 0.25, opacity: 0, duration: 0.18, ease: 'power2.out' })                                                // lands
        .fromTo(ring, { scale: 0.2, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out' }, '<')                          // splash
        .to(f, { '--lvl': '-1.75em', duration: 1.4, ease: 'power2.out' }, '<')                                                                  // fills up
        .add(() => wave.pause())
        .to({}, { duration: 2.1 })                                                                                                                // full
        .add(() => wave.play())
        .to(f, { '--lvl': '-0.2em', duration: 0.7, ease: 'power2.in' })                                                                          // drains
        .add(() => { wave.pause(); i = (i + 1) % WORDS.length; set(WORDS[i]); glide(i); gsap.fromTo(o, { opacity: 0 }, { opacity: 1, duration: 0.45 }); })
        .to({}, { duration: 0.25 });
      document.addEventListener('visibilitychange', () => (document.hidden ? tl.pause() : tl.resume()));
    }
  }

  /* ---------- the two tags under "just here to procrastinate?": they sway on their strings; Yes opens the game
     (below), No opens a quick form that sends straight to our inbox through the same handler as the contact page ---------- */
  const tags = $$('.hask__tag');
  if (ok && tags.length) {
    gsap.from('.hask', { scale: 0, rotation: 15, duration: 0.7, ease: 'back.out(2.2)', delay: 1.5, transformOrigin: '50% 0%' });
    tags.forEach((t, i) => {
      const rest = i ? 3 : -4;
      if (!TB.reduce) gsap.fromTo(t, { rotation: rest - 3 }, { rotation: rest + 3, duration: 1.6 + i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      if (fine) {
        t.addEventListener('mouseenter', () => gsap.to(t, { scale: 1.07, duration: 0.35, ease: 'back.out(3)' }));
        t.addEventListener('mouseleave', () => gsap.to(t, { scale: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.45)' }));
      }
    });
  }
  const qd = $('.qf'), qbtn = $('[data-go="form"]');
  if (qd && qbtn && qd.showModal) {
    const qform = $('.qf__form', qd), qstat = $('.qf__status', qd), qgo = $('.qf__go .cta__t', qd);
    const qclose = () => qd.close();
    $('.qf__x', qd).addEventListener('click', qclose);
    qd.addEventListener('click', (e) => { if (e.target === qd) qclose(); });
    qd.addEventListener('close', () => TB.lenis && TB.lenis.start());
    qbtn.addEventListener('click', () => {
      qd.showModal(); TB.lenis && TB.lenis.stop();
      if (ok) gsap.fromTo($('.qf__card', qd), { scale: 0.85, rotation: 2, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'transform' });
      $('input', qform).focus();
    });
    const val = (n) => [...qform.querySelectorAll(`input[name="${n}"]:checked`)].map((c) => c.value).join(', ');
    qform.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = qform.elements, name = f.name.value.trim(), email = f.email.value.trim();
      const bad = [[f.name, !name], [f.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)]];
      bad.forEach(([el, b]) => el.closest('.qf__f').classList.toggle('is-bad', b));
      if (bad.some(([, b]) => b)) { qstat.textContent = !name ? 'We need a name to shout across the office.' : 'That email looks like it is missing a bit.'; return; }
      if (f.website.value) return;   // a bot filled the hidden field: nothing is sent
      const message = [val('need') && `Needs: ${val('need')}.`, val('when') && `When: ${val('when')}.`, val('budget') && `Budget: ${val('budget')}.`, f.message.value.trim(), '(Sent from the home page quick form.)'].filter(Boolean).join(' ');
      const data = { name, email, phone: '', plan: '', message };
      qgo.textContent = 'Sending...'; qstat.textContent = '';
      try {
        const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 15000);
        const res = await fetch(qform.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: ctl.signal });
        clearTimeout(timer);
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(res.status);
        qform.hidden = true; $('.qf__done', qd).hidden = false; $('.qf__done .qf__h', qd).focus();
        if (ok) gsap.from($('.qf__done', qd).children, { y: 24, opacity: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(2)' });
      } catch (err) {
        const mail = `mailto:hello@thebrandle.com?subject=${encodeURIComponent('New project from ' + name)}&body=${encodeURIComponent(message)}`;
        qstat.innerHTML = `That did not send, our fault. <a href="${mail}">Email it instead</a>, it is already written.`;
      }
      qgo.textContent = 'Send it to the herd';
    });
  }


  /* ---------- the floating speaker: muted by default; press to play the loop (gapless, through Web Audio), drag to
     move it anywhere. A press that moves more than a few pixels is a drag, not a toggle. ---------- */
  const vibe = $('.vibe');
  if (vibe) {
    const KEY = 'tb-vibe-pos';
    let ctx = null, gain = null, src = null, buf = null, on = false;
    const place = (x, y) => {
      const r = vibe.getBoundingClientRect(), m = 8;
      x = Math.max(m, Math.min(innerWidth - r.width - m, x)); y = Math.max(m, Math.min(innerHeight - r.height - m, y));
      Object.assign(vibe.style, { left: `${x}px`, top: `${y}px`, bottom: 'auto' });
      vibe.classList.toggle('is-right', x > innerWidth / 2);
      return [x, y];
    };
    try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved) place(saved[0] * innerWidth, saved[1] * innerHeight); } catch (e) {}
    const play = async () => {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') await ctx.resume();
      if (!buf) buf = await fetch(vibe.dataset.src).then((r) => r.arrayBuffer()).then((a) => new Promise((ok2, no) => ctx.decodeAudioData(a, ok2, no)));
      src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; src.connect(gain); src.start();
      gain.gain.setTargetAtTime(0.55, ctx.currentTime, 0.25);
    };
    const stop = () => { if (!src) return; const s0 = src; gain.gain.setTargetAtTime(0, ctx.currentTime, 0.12); setTimeout(() => s0.stop(), 600); src = null; };
    const toggle = () => {
      on = !on;
      vibe.classList.toggle('is-on', on);
      vibe.setAttribute('aria-pressed', String(on));
      vibe.setAttribute('aria-label', on ? 'Sound on? Drag me anywhere. Mutes music' : 'Sound on? Drag me anywhere. Plays music');
      on ? play().catch(() => { on = false; vibe.classList.remove('is-on'); }) : stop();
      if (ok) gsap.fromTo(vibe, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
    };
    let start = null, moved = false;
    vibe.addEventListener('pointerdown', (e) => {
      const r = vibe.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top }; moved = false;
      vibe.setPointerCapture(e.pointerId);
    });
    vibe.addEventListener('pointermove', (e) => {
      if (!start) return;
      if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
      moved = true; vibe.classList.add('is-drag');
      place(e.clientX - start.dx, e.clientY - start.dy);
    });
    const up = () => {
      if (!start) return;
      if (moved) { const r = vibe.getBoundingClientRect(); try { localStorage.setItem(KEY, JSON.stringify([r.left / innerWidth, r.top / innerHeight])); } catch (e) {} }
      vibe.classList.remove('is-drag'); start = null;
    };
    vibe.addEventListener('pointerup', up); vibe.addEventListener('pointercancel', up);
    vibe.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false; return; } toggle(); });
    addEventListener('resize', () => { const r = vibe.getBoundingClientRect(); if (vibe.style.top) place(r.left, r.top); });
    document.addEventListener('visibilitychange', () => { if (ctx && on) document.hidden ? ctx.suspend() : ctx.resume(); });
    if (ok) gsap.from(vibe, { scale: 0, rotation: -90, duration: 0.7, ease: 'back.out(2)', delay: 2 });
  }

  /* ---------- "just here to procrastinate?": a 30-second game in a dialog. The camel catches the good news and
     dodges the client notes. Arrow keys or A and D, or drag; canvas only, nothing loads until it opens. ---------- */
  const gbtn = $('[data-go="game"]'), gdlg = $('.game');
  if (gbtn && gdlg && gdlg.showModal) {
    const cv = $('.game__c', gdlg), cx = cv.getContext('2d');
    const hud = { s: $('.game__score', gdlg), l: $('.game__lives', gdlg), t: $('.game__time', gdlg) };
    const intro = $('.game__intro', gdlg), end = $('.game__end', gdlg);
    const GOOD = ['Approved', 'Invoice paid', 'No notes', 'Love it', 'Ship it', 'Dates', 'Five stars', 'On time'];
    const BAD = ['Make it pop', 'Logo bigger?', 'Comic Sans?', 'Quick tweak', 'Can it be free?', 'More blue', 'Per my last email', 'One more thing'];
    const cam = new Image();
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, g = null;
    const keys = {};
    const size = () => {
      const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const pill = (txt, x, y, good, a = 1) => {
      cx.save(); cx.globalAlpha = a;
      cx.font = '600 15px Geist, system-ui, sans-serif';
      const w = cx.measureText(txt).width + (good ? 44 : 28), h = 32;
      cx.translate(x, y); cx.rotate(good ? -0.05 : 0.05);
      cx.beginPath(); cx.roundRect(-w / 2, -h / 2, w, h, 16);
      cx.fillStyle = good ? '#f9452d' : '#111'; cx.fill();
      cx.lineWidth = 1.5; cx.strokeStyle = '#000'; cx.stroke();
      cx.fillStyle = good ? '#000' : '#f8eee8'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.fillText(good ? `✓ ${txt}` : txt, 0, 1);
      cx.restore();
      return w;
    };
    const start = () => {
      intro.hidden = true; end.hidden = true; size();
      g = { x: W / 2, to: W / 2, score: 0, dodged: 0, lives: 3, left: 30, items: [], pops: [], next: 0.4, hurt: 0, tilt: 0 };
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      cv.focus();
    };
    const finish = () => {
      cancelAnimationFrame(raf); raf = 0;
      const s = g.score;
      const pick = s === 0 ? ['Zero approvals.', `You dodged everything, the good news included. Bold strategy. It is also exactly how projects never launch.`]
        : s < 7 ? [`${s} approval${s > 1 ? 's' : ''}.`, `And ${g.dodged} notes dodged. The feedback won this round. It usually does, unless someone handles it for a living.`]
        : s < 15 ? ['Not bad at all.', `${s} approvals caught, ${g.dodged} notes dodged. Now imagine that all week. We do, and we enjoy it, strangely.`]
        : ['Annoyingly good.', `${s} approvals caught, ${g.dodged} notes dodged. Have you considered a career in this? We have. It is our career.`];
      $('.game__end-h', gdlg).textContent = pick[0];
      $('.game__end-p', gdlg).textContent = pick[1];
      end.hidden = false;
      $('.game__again', gdlg).focus();
    };
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = 30 - g.left, speed = 150 + t * 7, gap = Math.max(0.36, 0.75 - t * 0.014);
      g.left -= dt;
      if (keys.l) g.to -= 520 * dt;
      if (keys.r) g.to += 520 * dt;
      g.to = Math.max(46, Math.min(W - 46, g.to));
      const px = g.x; g.x += (g.to - g.x) * Math.min(1, dt * 14);
      g.tilt += ((g.x - px) * 0.012 - g.tilt) * Math.min(1, dt * 10);
      g.next -= dt;
      if (g.next <= 0) {
        const good = Math.random() < 0.5, list = good ? GOOD : BAD;
        g.items.push({ txt: list[(Math.random() * list.length) | 0], good, x: 70 + Math.random() * (W - 140), y: -20, v: speed * (0.85 + Math.random() * 0.35), w: 0 });
        g.next = gap;
      }
      const cw = 96, ch = 95, cyTop = H - ch - 8;
      cx.clearRect(0, 0, W, H);
      // floor line
      cx.strokeStyle = '#0000001f'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, H - 8); cx.lineTo(W, H - 8); cx.stroke();
      for (let k = g.items.length - 1; k >= 0; k--) {
        const it = g.items[k];
        it.y += it.v * dt;
        it.w = pill(it.txt, it.x, it.y, it.good);
        const hit = it.y + 14 > cyTop + 10 && it.y - 14 < cyTop + ch * 0.55 && Math.abs(it.x - g.x) < it.w / 2 + cw * 0.32;
        if (hit) {
          g.items.splice(k, 1);
          if (it.good) { g.score++; g.pops.push({ txt: '+1', x: it.x, y: cyTop, a: 1, c: '#f9452d' }); }
          else { g.lives--; g.hurt = 0.4; g.pops.push({ txt: 'Ugh', x: it.x, y: cyTop, a: 1, c: '#111' }); }
        } else if (it.y > H + 20) { g.items.splice(k, 1); if (!it.good) g.dodged++; }
      }
      g.pops = g.pops.filter((p) => (p.y -= 60 * dt, p.a -= dt * 1.4, p.a > 0));
      g.pops.forEach((p) => { cx.globalAlpha = p.a; cx.fillStyle = p.c; cx.font = '800 22px Bricolage Grotesque, system-ui'; cx.textAlign = 'center'; cx.fillText(p.txt, p.x, p.y); cx.globalAlpha = 1; });
      g.hurt = Math.max(0, g.hurt - dt);
      cx.save();
      cx.translate(g.x + (g.hurt ? Math.sin(now / 25) * 4 : 0), H - 8);
      cx.rotate(g.tilt);
      if (g.to < g.x - 2) cx.scale(-1, 1);                  // he faces the way he walks
      if (cam.complete && cam.naturalWidth) cx.drawImage(cam, -cw / 2, -ch, cw, ch);
      cx.restore();
      hud.s.textContent = g.score;
      hud.l.textContent = '♥'.repeat(Math.max(0, g.lives)) + '♡'.repeat(3 - Math.max(0, g.lives));
      hud.t.textContent = `${Math.max(0, Math.ceil(g.left))}s`;
      if (g.left <= 0 || g.lives <= 0) return finish();
      raf = requestAnimationFrame(loop);
    };
    const kd = (e, on) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { keys.l = on; e.preventDefault(); }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { keys.r = on; e.preventDefault(); }
    };
    gdlg.addEventListener('keydown', (e) => kd(e, true));
    gdlg.addEventListener('keyup', (e) => kd(e, false));
    cv.addEventListener('pointermove', (e) => { if (g) g.to = e.clientX - cv.getBoundingClientRect().left; });
    cv.addEventListener('pointerdown', (e) => { if (g) g.to = e.clientX - cv.getBoundingClientRect().left; });
    $$('.game__go', gdlg).forEach((b) => b.addEventListener('click', start));
    const close = () => { cancelAnimationFrame(raf); raf = 0; gdlg.close(); };
    $('.game__x', gdlg).addEventListener('click', close);
    gdlg.addEventListener('click', (e) => { if (e.target === gdlg) close(); });
    gdlg.addEventListener('close', () => { cancelAnimationFrame(raf); raf = 0; TB.lenis && TB.lenis.start(); });
    gbtn.addEventListener('click', () => {
      if (!cam.src) cam.src = gbtn.dataset.camel;
      intro.hidden = false; end.hidden = true; g = null;
      gdlg.showModal(); TB.lenis && TB.lenis.stop();
      size(); cx.clearRect(0, 0, W, H);
      if (ok) gsap.fromTo($('.game__card', gdlg), { scale: 0.85, rotation: -2, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'transform' });
      $('.game__go', gdlg).focus();
    });
    addEventListener('resize', () => gdlg.open && size());
  }

  /* ---------- curved marquee text ---------- */
  const tp = $('#mq-tp');
  const UNIT = 'BRANDS • WEBSITES • STORES • APPS • FIXED QUOTE • DESIGNED AND BUILT IN-HOUSE • IT’S ALL YOURS • ';
  let unitLen = 1;
  const buildBand = () => {
    tp.textContent = UNIT;
    unitLen = tp.getComputedTextLength() || 1;
    tp.textContent = UNIT.repeat(Math.ceil(2400 / unitLen) + 2);
  };

  /* ---------- numbers stack: click to send the top card to the back ---------- */
  const bg = $('.testi__bg');
  const cards = $$('.titem');
  const ticks = $$('.tside i');
  const rot = [-4, 3.5, -6, 5];
  let cur = 0;
  let busy = false;
  const layer = () => cards.forEach((c, i) => { c.style.zIndex = cards.length - ((i - cur + cards.length) % cards.length); });
  const mark = () => ticks.forEach((t, i) => t.classList.toggle('on', i === cur));
  layer(); mark();
  if (ok) cards.forEach((c, i) => gsap.set(c, { rotation: i === cur ? 0 : rot[i % rot.length] }));
  const nextCard = () => {
    if (busy) return;
    const out = cards[cur];
    const oi = cur;
    cur = (cur + 1) % cards.length;
    mark();
    if (!ok) { layer(); return; }
    busy = true;
    const tilt = rnd(6, 12) * (Math.random() < 0.5 ? -1 : 1);
    gsap.timeline({ onComplete: () => { busy = false; } })
      .to(out, { yPercent: -140, rotation: rot[oi % rot.length] + tilt, duration: 0.38, ease: 'power2.inOut' })
      .add(layer)
      .to(out, { yPercent: 0, rotation: rot[oi % rot.length], duration: 0.38, ease: 'power2.inOut' })
      .to(cards[cur], { rotation: 0, duration: 0.35, ease: 'power2.out' }, 0.2);
  };
  bg.addEventListener('click', nextCard);
  bg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nextCard(); } });

  if (!ok) { document.fonts.ready.then(buildBand); return; }

  /* ---------- hero: comes in when the loader lifts ---------- */
  const heroPaths = $$('.hero__path path');
  TB.draw(heroPaths);
  const heroLines = $$('.hero .lm > span');
  const heroPills = $$('.hero .pill');
  gsap.set(heroLines, { yPercent: 115 });
  gsap.set(heroPills, { opacity: 0, scale: 0.4 });
  gsap.set(heroPills.map((p) => p.firstElementChild), { yPercent: 105, opacity: 0 });
  gsap.set('.hero__stage', { yPercent: 12, opacity: 0 });
  TB.ready(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    tl.to(heroLines, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' }, 0)
      .to('.hero__stage', { yPercent: 0, opacity: 1, duration: 0.9 }, 0.1)
      .to(heroPaths, { strokeDashoffset: 0, duration: 0.9, stagger: 0.1 }, 0.3);
    heroPills.forEach((p, i) => {
      tl.to(p, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.55 + i * 0.12)
        .to(p.firstElementChild, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.65 + i * 0.12);
    });
  });

  /* ---------- hero boards: live words ride on the two boards ---------- */
  // where the painted words sat in each video frame (centre x, y, angle), tracked once from the footage
  const BOARDS = {"n":140,"fps":24.0,"W":2200,"H":1092,"b":[{"w":219.2,"h":114.4,"f":[[941.4,292.9,-0.82],[941.4,294.7,-0.77],[941.1,296.9,-0.8],[941.0,299.2,-0.89],[940.8,300.7,-0.71],[940.7,301.2,-0.67],[940.3,300.5,-0.56],[940.3,298.6,-0.53],[940.1,295.9,-0.44],[940.3,292.6,-0.61],[940.3,289.2,-0.67],[940.5,286.2,-0.87],[940.8,284.7,-0.91],[940.9,284.4,-0.93],[940.8,285.6,-0.94],[940.7,288.7,-0.88],[940.7,292.3,-0.88],[940.5,295.7,-0.84],[940.2,298.5,-0.75],[940.3,300.3,-0.74],[940.6,300.4,-0.78],[940.8,299.6,-0.78],[941.0,297.7,-0.8],[941.2,294.9,-0.84],[941.2,291.9,-0.83],[941.1,288.9,-0.85],[941.0,286.1,-0.84],[940.6,284.9,-0.78],[940.7,285.1,-0.78],[940.5,286.6,-0.61],[940.5,289.1,-0.52],[940.5,292.5,-0.55],[940.5,295.4,-0.65],[940.3,298.0,-0.51],[940.3,299.9,-0.7],[940.1,301.1,-0.75],[940.1,301.3,-0.7],[940.0,300.5,-0.6],[940.0,298.6,-0.6],[940.1,295.8,-0.59],[940.2,292.6,-0.64],[940.4,289.5,-0.67],[940.7,286.5,-0.69],[940.9,285.1,-0.88],[941.1,285.1,-0.88],[941.2,286.3,-0.81],[941.2,288.7,-0.75],[941.4,292.0,-0.88],[941.6,295.0,-0.91],[941.4,297.7,-0.87],[941.2,299.9,-0.92],[940.9,301.1,-0.91],[940.6,301.3,-0.84],[940.2,300.6,-0.75],[940.1,298.9,-0.77],[940.2,296.2,-0.79],[940.4,293.2,-0.86],[940.6,290.0,-0.86],[940.8,286.8,-0.93],[940.8,285.3,-0.76],[940.9,284.9,-0.75],[941.2,285.8,-0.7],[941.3,288.1,-0.77],[941.1,291.5,-0.7],[941.2,294.4,-0.83],[941.0,297.3,-0.81],[940.6,299.6,-0.75],[940.2,300.9,-0.68],[940.3,301.0,-0.69],[940.2,300.2,-0.75],[940.1,298.3,-0.77],[940.2,295.6,-0.83],[940.3,292.5,-0.83],[940.3,289.5,-0.85],[940.4,286.6,-0.83],[940.5,285.0,-0.82],[940.7,284.9,-0.83],[940.8,286.0,-0.82],[940.8,288.3,-0.83],[940.7,291.7,-0.9],[940.7,294.9,-0.92],[940.5,297.7,-0.91],[940.2,299.7,-0.89],[940.1,300.6,-0.71],[939.9,300.5,-0.55],[939.9,299.4,-0.52],[940.0,297.1,-0.56],[940.0,294.2,-0.63],[940.2,291.0,-0.82],[940.2,288.0,-0.88],[940.4,285.4,-0.85],[940.4,284.4,-0.84],[940.6,285.0,-0.82],[940.8,286.7,-0.82],[941.0,289.5,-0.8],[940.8,293.0,-0.81],[940.7,296.1,-0.8],[940.7,298.7,-0.82],[940.4,300.3,-0.76],[940.3,300.9,-0.82],[940.3,300.4,-0.87],[940.5,299.0,-0.97],[940.5,296.4,-0.94],[940.6,293.2,-0.93],[940.7,290.1,-0.88],[941.0,286.9,-0.83],[940.9,285.0,-0.76],[940.9,284.5,-0.78],[941.0,285.4,-0.79],[940.9,287.3,-0.82],[940.7,290.6,-0.77],[940.7,293.6,-0.76],[940.7,296.4,-0.78],[940.7,298.9,-0.83],[940.6,300.6,-0.8],[940.5,301.0,-0.84],[940.2,300.4,-0.66],[940.1,298.6,-0.59],[940.0,295.8,-0.54],[940.1,292.6,-0.58],[940.1,289.4,-0.61],[940.4,286.4,-0.79],[940.5,284.9,-0.85],[940.5,284.6,-0.9],[940.7,285.5,-0.91],[940.8,288.2,-0.88],[940.6,291.8,-0.83],[940.5,295.2,-0.8],[940.4,298.1,-0.76],[940.2,300.4,-0.71],[940.1,300.9,-0.68],[940.1,300.1,-0.71],[940.1,298.3,-0.68],[940.0,295.7,-0.65],[940.1,292.5,-0.7],[940.1,289.3,-0.73],[940.2,286.4,-0.76],[940.4,284.9,-0.83],[940.5,283.9,-0.89],[940.7,283.7,-0.9]]},{"w":527.5,"h":122.2,"f":[[1403.9,445.7,0.59],[1403.9,447.5,0.59],[1403.9,449.7,0.61],[1403.9,452.1,0.61],[1403.9,453.7,0.61],[1403.9,454.1,0.61],[1403.9,453.5,0.61],[1403.9,451.7,0.59],[1403.9,448.9,0.6],[1403.9,445.7,0.6],[1403.9,442.4,0.6],[1403.9,439.5,0.61],[1403.9,438.0,0.63],[1403.9,437.7,0.61],[1403.9,438.9,0.61],[1403.9,441.8,0.62],[1403.9,445.4,0.62],[1403.9,448.8,0.61],[1403.9,451.6,0.61],[1403.9,453.5,0.62],[1403.9,453.6,0.64],[1403.9,452.9,0.62],[1403.9,450.9,0.62],[1403.9,448.3,0.62],[1403.9,445.2,0.6],[1403.9,442.1,0.59],[1403.9,439.3,0.57],[1403.9,438.0,0.56],[1403.8,438.1,0.58],[1403.8,439.5,0.58],[1403.7,442.1,0.58],[1403.6,445.6,0.59],[1403.6,448.7,0.62],[1403.7,451.4,0.6],[1403.7,453.5,0.62],[1403.8,454.5,0.62],[1403.9,454.6,0.63],[1403.9,453.8,0.63],[1403.9,451.8,0.63],[1403.9,448.9,0.62],[1403.9,445.8,0.59],[1403.9,442.6,0.57],[1403.9,439.8,0.55],[1403.9,438.4,0.55],[1403.9,438.4,0.55],[1403.9,439.6,0.55],[1403.9,441.9,0.57],[1403.9,445.2,0.59],[1403.9,448.2,0.61],[1403.9,450.9,0.6],[1403.9,453.1,0.63],[1403.9,454.4,0.63],[1403.9,454.7,0.59],[1403.9,454.0,0.6],[1403.9,452.3,0.61],[1403.9,449.6,0.62],[1403.9,446.4,0.61],[1403.9,443.2,0.61],[1403.9,440.0,0.59],[1403.9,438.3,0.59],[1403.9,437.9,0.55],[1403.8,438.8,0.57],[1403.8,441.1,0.59],[1403.8,444.5,0.6],[1403.8,447.6,0.61],[1403.8,450.6,0.62],[1403.9,452.9,0.6],[1403.9,454.1,0.63],[1403.9,454.3,0.63],[1403.9,453.5,0.63],[1403.9,451.6,0.65],[1403.9,448.9,0.66],[1403.9,445.8,0.62],[1403.9,442.6,0.6],[1403.9,439.7,0.58],[1403.9,438.1,0.59],[1403.9,438.0,0.57],[1403.9,439.2,0.59],[1403.9,441.6,0.58],[1403.9,445.0,0.62],[1403.9,448.2,0.61],[1403.9,450.9,0.62],[1403.9,453.0,0.61],[1403.9,454.0,0.64],[1403.9,453.9,0.62],[1403.9,452.7,0.64],[1403.9,450.4,0.66],[1403.9,447.4,0.66],[1403.9,444.2,0.66],[1403.9,441.2,0.68],[1403.9,438.6,0.61],[1403.8,437.5,0.56],[1403.8,437.9,0.55],[1403.8,439.6,0.56],[1403.8,442.4,0.55],[1403.8,446.0,0.59],[1403.9,449.2,0.64],[1403.9,452.0,0.67],[1403.9,453.7,0.64],[1403.9,454.4,0.65],[1403.9,453.8,0.66],[1403.9,452.3,0.65],[1403.9,449.7,0.62],[1403.9,446.5,0.62],[1403.9,443.3,0.58],[1403.9,440.1,0.56],[1403.9,438.2,0.54],[1403.9,437.7,0.56],[1403.9,438.4,0.56],[1403.9,440.5,0.58],[1403.8,443.7,0.57],[1403.8,446.8,0.58],[1403.8,449.6,0.58],[1403.8,452.1,0.6],[1403.8,453.8,0.61],[1403.8,454.3,0.61],[1403.8,453.7,0.61],[1403.8,451.9,0.61],[1403.8,449.2,0.6],[1403.8,445.9,0.6],[1403.8,442.7,0.59],[1403.9,439.6,0.58],[1403.9,438.0,0.61],[1403.9,437.7,0.63],[1403.9,438.5,0.64],[1403.9,441.3,0.69],[1403.9,444.9,0.7],[1403.9,448.3,0.67],[1403.9,451.2,0.63],[1403.9,453.6,0.61],[1403.9,454.1,0.56],[1403.8,453.4,0.56],[1403.8,451.7,0.58],[1403.8,449.1,0.61],[1403.8,445.8,0.62],[1403.8,442.5,0.62],[1403.8,439.5,0.62],[1403.8,437.9,0.6],[1403.9,437.1,0.58],[1403.9,437.0,0.58]]}]};
  // word one sits on the small board, word two on the big one; shown in this order, then round again
  const SIGNS = [
    ['YES,', 'CAMELS'], ['SEND', 'HELP'], ['LOGO', 'BIGGER'], ['ARMS', 'TIRED'], ['FINAL', 'FINAL_V9'], ['HI', 'MUM'],
    ['DUE', 'YESTERDAY'], ['CAMELS', 'EXTRA'], ['NOT', 'CHEAP'], ['YOUR', 'AD HERE'], ['LOST,', 'PROBABLY'], ['STILL', 'HERE?'],
  ];
  const vid = $('.hero__video');
  // the video is not fetched until the loader has lifted, so the poster paints first and nothing competes with it
  // the walk plays only while the hero is on screen (its frames also drive the slogans on the boards)
  if (vid) TB.ready(() => new IntersectionObserver(([e]) => { if (e.isIntersecting) { const pl = vid.play(); pl && pl.catch(() => {}); } else vid.pause(); }).observe(vid));
  const signs = $$('.hero__signs g');
  if (vid && signs.length) {
    const CAP = 0.7; // cap height of the display face as a share of its font size
    const ROOM = [1.15, 1]; // board one has spare space around its word, board two does not
    const half = BOARDS.n >> 1;
    let si = -1, last = -1;
    const setSign = () => {
      si = (si + 1) % SIGNS.length;
      signs.forEach((g, j) => {
        const t = g.firstElementChild, b = BOARDS.b[j];
        t.textContent = SIGNS[si][j];
        t.style.fontSize = '100px';
        const fs = Math.min(b.h / CAP, 100 * b.w * ROOM[j] / t.getComputedTextLength());
        t.style.fontSize = fs + 'px';
        t.setAttribute('y', fs * CAP / 2);
        t.animate([{ opacity: 0, transform: 'scale(0.7) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: j * 70, fill: 'backwards', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
      });
    };
    const place = (time) => {
      const i = Math.round(time * BOARDS.fps) % BOARDS.n;
      if (i === last) return;
      if (last > -1 && (i < last || (last < half && i >= half))) setSign(); // new slogan twice per loop
      last = i;
      signs.forEach((g, j) => { const [x, y, a] = BOARDS.b[j].f[i]; g.setAttribute('transform', `translate(${x} ${y}) rotate(${a})`); });
    };
    document.fonts.ready.then(() => {
      setSign(); place(0);
      if (vid.requestVideoFrameCallback) { const cb = (_, m) => { place(m.mediaTime); vid.requestVideoFrameCallback(cb); }; vid.requestVideoFrameCallback(cb); }
      else { const cb = () => { place(vid.currentTime); requestAnimationFrame(cb); }; cb(); }
    });
    $('.hero__stage').addEventListener('click', setSign);
  }

  /* ---------- curved marquee ---------- */
  let off = 0;
  document.fonts.ready.then(() => {
    buildBand();
    let mqOn = true;   // only moves while on screen: a text path is laid out again on every step
    new IntersectionObserver(([e]) => { mqOn = e.isIntersecting; }).observe(tp.closest('svg'));
    gsap.ticker.add((_, dt) => {
      if (!mqOn) return;
      const v = TB.lenis ? Math.abs(TB.lenis.velocity) : 0;
      off = (off + (dt / 1000) * (80 + v * 24)) % unitLen;
      tp.setAttribute('startOffset', -off);
    });
  });

  /* ---------- cursor arrow on the numbers stack ---------- */
  if (fine) {
    const ta = $('.tarrow');
    gsap.set(ta, { xPercent: -50, yPercent: -50, scale: 0 });
    const tx = gsap.quickTo(ta, 'x', { duration: 0.35, ease: 'power2.out' });
    const ty = gsap.quickTo(ta, 'y', { duration: 0.35, ease: 'power2.out' });
    bg.addEventListener('mousemove', (e) => { const r = bg.getBoundingClientRect(); tx(e.clientX - r.left); ty(e.clientY - r.top); });
    bg.addEventListener('mouseenter', () => gsap.to(ta, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }));
    bg.addEventListener('mouseleave', () => gsap.to(ta, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' }));
  }

  /* ---------- about: pinned, letters flare orange then settle black ---------- */
  const apills = $$('.apill');
  gsap.set(apills, { opacity: 0, scale: 0.6 });
  const step = 0.9;
  const atl = gsap.timeline({
    scrollTrigger: { trigger: '.about__pinned', start: 'top top', end: () => `+=${innerHeight * 2.2}`, pin: true, pinSpacing: true, scrub: innerWidth < 992 ? 0.6 : 0.8 },
  });
  aboutChars.forEach((c, i) => {
    atl.to(c, { color: '#f9452d', scale: 1.12, rotation: rnd(-4, 4), duration: 3.5, ease: 'power1.out' }, i * step)
      .to(c, { color: '#000', scale: 1, rotation: 0, duration: 3.5, ease: 'power1.inOut' }, i * step + 3.5);
  });
  const total = aboutChars.length * step;
  apills.forEach((p, i) => atl.to(p, { opacity: 1, scale: 1, duration: 6, ease: 'back.out(2)' }, total * (0.3 + i * 0.26)));

  /* ---------- showcase: endless strip, direction and speed follow the scroll ---------- */
  const slider = $('.showcase__slider');
  slider.innerHTML += slider.innerHTML;
  let setW = 0;
  const measure = () => { setW = slider.scrollWidth / 2; };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);
  let x = 0, dir = -1, tdir = -1, slOn = true;
  new IntersectionObserver(([e]) => { slOn = e.isIntersecting; }).observe(slider);
  gsap.ticker.add(() => {
    if (!slOn) return;
    const v = TB.lenis ? TB.lenis.velocity : 0;
    if (Math.abs(v) > 0.5) tdir = v > 0 ? -1 : 1;
    dir += (tdir - dir) * 0.06;
    x += (1.5 + Math.min(Math.abs(v) * 0.27, 10)) * dir;
    if (x <= -setW) x += setW;
    if (x > 0) x -= setW;
    slider.style.transform = `translate3d(${x}px,0,0)`;
  });

  /* ---------- "there's more" block ---------- */
  const pend = $('.pend');
  const pl = $$('.lm > span', pend);
  const pp = $$('.ppill', pend);
  const pb = $('.cta', pend);
  gsap.set(pl, { yPercent: 115 });
  gsap.set([...pp, pb], { opacity: 0, scale: 0.4 });
  const ptl = gsap.timeline({ scrollTrigger: { trigger: pend, start: 'top 80%' } });
  ptl.to(pl, { yPercent: 0, duration: 0.85, stagger: 0.12, ease: 'back.out(1.4)' });
  pp.forEach((p, i) => ptl.to(p, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.45 + i * 0.12));
  ptl.to(pb, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.8);

  /* ---------- services: one smooth line loops through every service ---------- */
  const sbody = $('.sbody');
  const svg = $('.spath');
  const ghost = $('.spath__ghost');
  const dark = $('.spath__dark');
  const holes = $$('.spath__hole');
  const blocks = $$('.sblock');
  const line = { p: 0 };
  let len = 0;
  const paintLine = () => { dark.style.strokeDashoffset = len * (1 - line.p); };
  // Every node has a tangent; handles are a third of the chord, so long and short spans curve alike.
  const smooth = (nodes) => {
    const T = nodes.map((q, i) => {
      if (q.t) return q.t;
      const u = nodes[i - 1] || q, v = nodes[i + 1] || q;
      const l = Math.hypot(v.x - u.x, v.y - u.y) || 1;
      return [(v.x - u.x) / l, (v.y - u.y) / l];
    });
    let d = `M${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const u = nodes[i - 1], v = nodes[i];
      if (v.r) { d += `A${v.r} ${v.r} 0 0 ${v.cw} ${v.x} ${v.y}`; continue; }
      const h = Math.hypot(v.x - u.x, v.y - u.y) / 3;
      d += `C${u.x + T[i - 1][0] * h} ${u.y + T[i - 1][1] * h} ${v.x - T[i][0] * h} ${v.y - T[i][1] * h} ${v.x} ${v.y}`;
    }
    return d;
  };
  const P = (q) => ({ x: q[0], y: q[1] });
  // a real circle arc from angle a0 to a1 (degrees, screen space), entered and left along its tangent
  const loop = (c, R, a0, a1) => {
    const cw = a1 > a0 ? 1 : 0, out = [];
    const steps = Math.ceil(Math.abs(a1 - a0) / 90);
    for (let i = 0; i <= steps; i++) {
      const th = (a0 + (a1 - a0) * i / steps) * Math.PI / 180, sg = cw ? 1 : -1;
      out.push({ x: c[0] + R * Math.cos(th), y: c[1] + R * Math.sin(th), t: [-Math.sin(th) * sg, Math.cos(th) * sg], r: i ? R : 0, cw });
    }
    return out;
  };
  const buildPath = () => {
    const box = sbody.getBoundingClientRect();
    const W = box.width, H = box.height;
    const em = parseFloat(getComputedStyle(sbody).fontSize);
    const n = blocks.map((b) => { const r = $('i', b).getBoundingClientRect(); return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2]; });
    const a = [W - 1.7 * em, 1.6 * em];
    const z = [1.7 * em, H - 1.6 * em];
    const wide = W >= 768;
    const R = 3.4 * em;
    const gap = n[1][1] - n[0][1];
    const pts = [P(a), P(n[0])];
    if (wide) pts.push(...loop([n[0][0] + 1.2 * em, n[0][1] + gap * 0.56], R, 195, -115)); // drops out of the first service, curls, heads left
    pts.push(...[n[1], n[2], n[3], n[4], n[5]].map(P));
    if (wide) pts.push(...loop([Math.max(n[6][0] - 8 * em, R + 3 * em), n[6][1] - gap * 0.5], R, 65, 335)); // curls on the far left before the last service
    pts.push(P(n[6]), P(z));
    const d = smooth(pts);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    ghost.setAttribute('d', d);
    dark.setAttribute('d', d);
    const k = em / 16;
    holes[0].setAttribute('transform', `translate(${a[0]} ${a[1]}) scale(${k})`);
    holes[1].setAttribute('transform', `translate(${z[0]} ${z[1]}) scale(${-k} ${k})`);
    len = dark.getTotalLength();
    dark.style.strokeDasharray = len;
    paintLine();
  };
  buildPath(); // measured while the icons are still at full size
  const mtl = gsap.timeline({ scrollTrigger: { trigger: sbody, start: 'top 70%', end: 'bottom 70%', scrub: 1.2, invalidateOnRefresh: true } });
  mtl.to(line, { p: 1, duration: 1, ease: 'none', onUpdate: paintLine }, 0);
  mtl.fromTo(holes[0].firstElementChild, { scale: 0, svgOrigin: '0 0' }, { scale: 1, duration: 0.05, ease: 'back.out(3)' }, 0);
  mtl.fromTo(holes[1].firstElementChild, { scale: 0, svgOrigin: '0 0' }, { scale: 1, duration: 0.06, ease: 'back.out(3)' }, 0.97);
  blocks.forEach((b, i) => {
    const at = Math.max(0, i / (blocks.length - 1) - 0.04);
    // the icon grows between the two words and pushes them apart
    mtl.fromTo($('i', b), { width: 0, scale: 0, opacity: 0, marginLeft: 0, marginRight: 0 }, { width: '1.6em', scale: 1, opacity: 1, marginLeft: '0.1em', marginRight: '0.1em', duration: 0.14, ease: 'back.out(3.5)' }, at)
      .fromTo($('.sblock__p', b), { scale: 0, rotation: 0, opacity: 0 }, { scale: 1, rotation: -5, opacity: 1, duration: 0.14, ease: 'back.out(3.5)' }, at + 0.02);
  });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const p = mtl.progress(); mtl.progress(1); buildPath(); mtl.progress(p); }, 250); });
})();
