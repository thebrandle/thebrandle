
(function() {
  var CAL_USERNAME   = 'thebrandle';
  var CAL_EVENT_SLUG = '15min';
  var TIMEZONE       = 'Asia/Dubai';

  function initCTA() {
    if (document.getElementById('brandle-cta')) return;

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = '\
.brandle-cta{position:fixed;bottom:28px;right:28px;z-index:9999;display:inline-flex;align-items:center;gap:0;padding:10px;border-radius:980px;border:none;overflow:hidden;cursor:pointer;background:#1d1d1f;color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,"Inter",sans-serif;font-size:14px;font-weight:500;letter-spacing:-0.015em;white-space:nowrap;animation:brandle-rise .7s cubic-bezier(.34,1.4,.64,1) both;box-shadow:0 2px 12px rgba(0,0,0,.18),0 1px 3px rgba(0,0,0,.12);transition:max-width .35s cubic-bezier(.4,0,.2,1),padding .35s cubic-bezier(.4,0,.2,1),gap .35s cubic-bezier(.4,0,.2,1),transform .18s ease,background .18s ease;max-width:72px}\
.brandle-cta:hover{background:#2d2d2f;max-width:320px;gap:10px;padding:10px 16px 10px 10px}\
.brandle-cta:active{transform:scale(.97)}\
@keyframes brandle-rise{from{opacity:0;transform:translateY(20px) scale(.93)}to{opacity:1;transform:translateY(0) scale(1)}}\
@keyframes brandle-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}\
.brandle-cta:not(:hover){animation:brandle-rise .7s cubic-bezier(.34,1.4,.64,1) both,brandle-bob 2.5s ease-in-out 1.5s infinite}\
.brandle-cta__shimmer{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(249,68,45,.7) 50%,transparent 100%);background-size:200% 100%;animation:brandle-shimmer 3.2s ease-in-out 1s infinite}\
@keyframes brandle-shimmer{0%{background-position:-200% 0;opacity:0}20%{opacity:1}80%{opacity:1}100%{background-position:200% 0;opacity:0}}\
.brandle-cta__dot-wrap{position:relative;width:52px;height:52px;flex-shrink:0}\
.brandle-cta__dot-bg{position:absolute;inset:0;border-radius:50%;background:#F9442D;animation:brandle-breathe 2.8s ease-in-out infinite;transition:background .18s}\
.brandle-cta:hover .brandle-cta__dot-bg{background:#e03520}\
@keyframes brandle-breathe{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.12);opacity:.85}}\
.brandle-cta__dot-ring{position:absolute;inset:-4px;border-radius:50%;border:1.5px solid rgba(249,68,45,.38);animation:brandle-ring 2.8s ease-in-out infinite}\
@keyframes brandle-ring{0%{transform:scale(.8);opacity:0}25%{opacity:1}100%{transform:scale(1.6);opacity:0}}\
.brandle-cta__dot-icon{position:absolute;inset:-30px;display:flex;align-items:center;justify-content:center;overflow:visible}\
.brandle-cta__text{display:flex;flex-direction:column;line-height:1.2;flex:1;opacity:0;max-width:0;overflow:hidden;transition:opacity .25s ease,max-width .35s cubic-bezier(.4,0,.2,1)}\
.brandle-cta:hover .brandle-cta__text{opacity:1;max-width:200px}\
.brandle-cta__main{font-size:13.5px;font-weight:500;color:#f5f5f7;letter-spacing:-0.015em}\
.brandle-cta__sub{font-size:11px;color:rgba(245,245,247,.5);font-weight:400;margin-top:2px;transition:opacity .3s}\
.brandle-cta__sub--dim{opacity:.4}\
.brandle-cta__arrow{width:0;height:22px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;opacity:0;transition:width .25s ease,opacity .25s ease,background .18s,transform .18s}\
.brandle-cta:hover .brandle-cta__arrow{width:22px;opacity:1}\
.brandle-cta:hover .brandle-cta__arrow{background:rgba(255,255,255,.18);transform:translateX(2px)}\
@media(max-width:809px){.brandle-cta{max-width:72px!important;gap:0!important;padding:10px!important}.brandle-cta .brandle-cta__text,.brandle-cta .brandle-cta__arrow{display:none!important}}\
@media(prefers-reduced-motion:reduce){.brandle-cta,.brandle-cta__shimmer,.brandle-cta__dot-bg,.brandle-cta__dot-ring{animation:none}}';
    document.head.appendChild(style);

    // Inject button
    var btn = document.createElement('button');
    btn.id = 'brandle-cta';
    btn.className = 'brandle-cta';
    btn.setAttribute('aria-label', 'Book a free 15-minute call');
    btn.innerHTML = '<span class="brandle-cta__shimmer" aria-hidden="true"></span>'
      + '<span class="brandle-cta__dot-wrap" aria-hidden="true">'
      + '<span class="brandle-cta__dot-bg"></span>'
      + '<span class="brandle-cta__dot-ring"></span>'
      + '<span class="brandle-cta__dot-icon"><span id="brandle-lottie" style="width:110px;height:110px"></span></span>'
      + '</span>'
      + '<span class="brandle-cta__text">'
      + '<span class="brandle-cta__main">Book a free 15-min call</span>'
      + '<span class="brandle-cta__sub brandle-cta__sub--dim" id="brandle-cta-sub">Checking availability\u2026</span>'
      + '</span>'
      + '<span class="brandle-cta__arrow" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(245,245,247,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"/></svg></span>';
    document.body.appendChild(btn);

    // Load Lottie animation for icon
    var lottieScript = document.createElement('script');
    lottieScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
    lottieScript.onload = function() {
      lottie.loadAnimation({
        container: document.getElementById('brandle-lottie'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/animations/cal.json'
      });
    };
    document.head.appendChild(lottieScript);

    // Load Cal.com embed
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal;
        var ar  = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
        if (ar[0] === L) { var api = function () { p(api, arguments); }; var ns = ar[1]; api.q = []; api._n = ns; C.Cal.ns[ns] = api; p(api, ar); return; }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    Cal('init', CAL_EVENT_SLUG, { origin: 'https://app.cal.com' });
    Cal.ns[CAL_EVENT_SLUG]('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view' });

    btn.addEventListener('click', function () {
      Cal.ns[CAL_EVENT_SLUG]('modal', { calLink: CAL_USERNAME + '/' + CAL_EVENT_SLUG, config: { layout: 'month_view' } });
    });

    // Fetch next slot
    function formatSlot(iso) {
      var d = new Date(iso), now = new Date();
      var time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TIMEZONE });
      if (d.toDateString() === now.toDateString()) return 'Today at ' + time;
      if (d.toDateString() === new Date(now.getTime() + 864e5).toDateString()) return 'Tomorrow at ' + time;
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: TIMEZONE }) + ' at ' + time;
    }
    var params = new URLSearchParams({ eventTypeSlug: CAL_EVENT_SLUG, username: CAL_USERNAME, start: new Date().toISOString(), end: new Date(Date.now() + 7*864e5).toISOString(), timeZone: TIMEZONE });
    fetch('/api/cal-slots?' + params).then(function(r) { return r.ok ? r.json() : null; }).then(function(json) {
      var sub = document.getElementById('brandle-cta-sub');
      if (!json || !json.data) { sub.textContent = 'Book a time that works'; sub.classList.remove('brandle-cta__sub--dim'); return; }
      var slots = Object.values(json.data).flat().sort(function(a, b) { return new Date(a.start) - new Date(b.start); });
      sub.textContent = slots.length ? 'Next slot: ' + formatSlot(slots[0].start) : 'Book a time that works';
      sub.classList.remove('brandle-cta__sub--dim');
    }).catch(function() { var sub = document.getElementById('brandle-cta-sub'); sub.textContent = 'Book a time that works'; sub.classList.remove('brandle-cta__sub--dim'); });
  }

  // Wait for Framer hydration to finish, then inject
  if (document.readyState === 'complete') { setTimeout(initCTA, 500); }
  else { window.addEventListener('load', function() { setTimeout(initCTA, 500); }); }
})();
