// Global overrides — cards, thumbnails, filters, hide 5th project
(function() {
  'use strict';

  // ---- CONFIG ----
  var SLUGS = {
    'radiant-skincare-branding': {
      title: 'Shine Skincare Branding',
      desc: 'High quality cosmetics brand created for independent and brave women.',
      pills: ['Branding'],
      cat: 'branding',
      thumb: '/assets/projects/shine/bg.gif'
    },
    'radiant-skincare-branding-copy': {
      title: '\u201COh My Pasta.\u201D Branding',
      desc: 'A unique pasta bar branding project aimed to connect with customers.',
      pills: ['Branding'],
      cat: 'branding',
      thumb: '/assets/projects/apex/project2_01.gif'
    },
    'vero-app-development': {
      title: 'DropX Website Design',
      desc: 'A sleek and stylish landing page design for high-conversion digital products.',
      pills: ['Web design'],
      cat: 'webdesign',
      thumb: '/assets/projects/dropx/image3.webp'
    },
    'stoyo-branding': {
      title: 'ORBLEAD Website Design',
      desc: 'A simple minimalistic SaaS lead generation website design.',
      pills: ['Web design'],
      cat: 'webdesign',
      thumb: '/assets/projects/orblead/image1.webp'
    }
  };

  var THUMB_MAP = {
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/shine/bg.gif',
    'bPs9iY1xCdYs2KmVLN2FyaQJhk': '/assets/projects/apex/project2_01.gif',
    'T3l9K398sRcCWjbIM6rTgD8UILk': '/assets/projects/dropx/image3.webp',
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',
  };

  // ---- INJECT CSS: always hide 5th project ----
  var css = document.createElement('style');
  css.textContent = [
    'a[href*="stoyo-branding-copy"]{ display:none!important; }',
    'a[href*="stoyo-branding-copy"] *{ display:none!important; }',
  ].join('\n');
  (document.head || document.documentElement).appendChild(css);

  // ---- HELPERS ----
  function getSlug(a) {
    var href = a.getAttribute('href') || '';
    var slugs = Object.keys(SLUGS).sort(function(x, y) { return y.length - x.length; });
    for (var i = 0; i < slugs.length; i++) {
      if (href.indexOf(slugs[i]) !== -1) return slugs[i];
    }
    return null;
  }

  function isDetail() {
    var p = window.location.pathname;
    return p.indexOf('/projects/') !== -1 && p.split('/projects/')[1].length > 0;
  }

  function isListing() {
    var p = window.location.pathname;
    return p === '/projects' || p === '/projects/';
  }

  // ---- HIDE 5TH PROJECT (JS fallback) ----
  function hideFifth() {
    document.querySelectorAll('a[href*="stoyo-branding-copy"]').forEach(function(a) {
      a.style.setProperty('display', 'none', 'important');
      // Walk up and hide wrappers
      var el = a.parentElement;
      for (var i = 0; i < 4; i++) {
        if (!el) break;
        el.style.setProperty('display', 'none', 'important');
        el = el.parentElement;
      }
    });
  }

  // ---- PATCH CARD TEXT & PILLS ----
  function patchCards() {
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlug(link);
      if (!slug) return;
      var cfg = SLUGS[slug];
      if (!cfg) return;

      link.querySelectorAll('h3').forEach(function(h3) {
        if (h3.textContent.trim() !== cfg.title && h3.textContent.trim() !== '')
          h3.textContent = cfg.title;
      });

      link.querySelectorAll('p').forEach(function(p) {
        var st = p.getAttribute('style') || '';
        if (st.indexOf('text-transform') !== -1) return;
        if (/font-size:\s*(30|48|55|102)px/.test(st)) return;
        var txt = p.textContent.trim();
        if (txt.indexOf('Vero aimed') !== -1 || txt.indexOf('Visual identity') !== -1 ||
            txt.indexOf('Bold new look') !== -1 || txt.indexOf('Radiant skincare') !== -1 ||
            txt.indexOf('ad-free platform') !== -1 || txt.indexOf('eco-conscious') !== -1 ||
            txt.indexOf('Stoyo brand') !== -1)
          p.textContent = cfg.desc;
      });

      var pills = [];
      link.querySelectorAll('p').forEach(function(p) {
        var st = p.getAttribute('style') || '';
        if (st.indexOf('text-transform: uppercase') !== -1 || st.indexOf('text-transform:uppercase') !== -1)
          pills.push(p);
      });
      for (var pi = 0; pi < pills.length; pi++) {
        if (pi < cfg.pills.length) {
          pills[pi].textContent = cfg.pills[pi];
        } else {
          var el = pills[pi].parentElement;
          for (var k = 0; k < 6; k++) {
            if (!el) break;
            if (parseInt(getComputedStyle(el).borderRadius) >= 20) {
              el.style.setProperty('display', 'none', 'important');
              break;
            }
            el = el.parentElement;
          }
        }
      }
    });
  }

  // ---- PATCH THUMBNAILS ----
  // Re-patches even if previously patched (React hydration can reset src)
  function patchThumbnails() {
    if (isDetail()) return;
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlug(link);
      if (!slug || !SLUGS[slug]) return;
      var thumb = SLUGS[slug].thumb;
      if (!thumb) return;
      link.querySelectorAll('img').forEach(function(img) {
        var w = parseInt(img.getAttribute('width') || '0');
        if (w > 0 && w < 50) return;
        var cur = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('srcset') || '');
        // Replace if it has a framer CDN URL (including after React hydration resets)
        if (cur.indexOf('framerusercontent') !== -1) {
          img.src = thumb;
          img.srcset = '';
          img.removeAttribute('srcset');
          img.dataset.globalThumbPatched = '1';
        }
      });
    });
  }

  function patchImgByKey(img) {
    if (isDetail()) return;
    var src = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('srcset') || '');
    for (var key in THUMB_MAP) {
      if (src.indexOf(key) !== -1) {
        img.src = THUMB_MAP[key];
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.globalThumbPatched = '1';
        return;
      }
    }
  }

  // ---- FILTER LOGIC ----
  var activeFilter = 'all';

  // Detect filter tab clicks via document-level capture listener
  document.addEventListener('click', function(e) {
    if (!isListing()) return;
    // Ignore clicks inside project card links
    if (e.target.closest && e.target.closest('a[href*="/projects/"]')) return;

    var el = e.target;
    for (var i = 0; i < 6; i++) {
      if (!el) break;
      var t = el.textContent.trim().toLowerCase();
      // Only match short text (filter labels, not long paragraphs)
      if (t.length > 30) { el = el.parentElement; continue; }
      if (t === 'all' || t === 'all cases' || t.indexOf('all cases') !== -1) {
        activeFilter = 'all'; scheduleEnforce(); break;
      } else if (t === 'branding') {
        activeFilter = 'branding'; scheduleEnforce(); break;
      } else if (t === 'web design' || t === 'websites') {
        activeFilter = 'webdesign'; scheduleEnforce(); break;
      }
      el = el.parentElement;
    }
  }, true);

  function scheduleEnforce() {
    setTimeout(enforceFilter, 50);
    setTimeout(enforceFilter, 200);
    setTimeout(enforceFilter, 500);
    setTimeout(enforceFilter, 1000);
    setTimeout(enforceFilter, 2000);
  }

  function enforceFilter() {
    if (!isListing()) return;
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlug(link);
      if (!slug) return;
      // Always hide 5th project
      if (slug === 'stoyo-branding-copy') return;
      var cfg = SLUGS[slug];
      if (!cfg) return;

      var show = (activeFilter === 'all') || (cfg.cat === activeFilter);

      // Walk up from link to find the card wrapper div
      var wrapper = link;
      var el = link.parentElement;
      while (el && el !== document.body) {
        // Stop at the grid/list container (has many children)
        if (el.children.length > 3) break;
        wrapper = el;
        el = el.parentElement;
      }

      if (show) {
        wrapper.style.removeProperty('display');
        // Also un-hide the link itself (in case React hid it)
        link.style.removeProperty('display');
      } else {
        wrapper.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // ---- HIDE SUPPORT/DEVELOPMENT TABS & FIX COUNTS ----
  function patchFilterArea() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim();
      if (t === 'Support' || t === 'Development') {
        var el = node.parentElement;
        if (el && el.closest && el.closest('a[href*="/projects/"]')) continue;
        for (var i = 0; i < 8; i++) {
          if (!el) break;
          if (el.tagName === 'A' && (el.getAttribute('href') || '').indexOf('projects') !== -1) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          if (el.classList && el.classList.toString().indexOf('container') !== -1 &&
              !(el.closest && el.closest('a[href*="/projects/"]'))) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          el = el.parentElement;
        }
      }
      if (/^\(\d+\)$/.test(t) && parseInt(t.replace(/[()]/g, '')) > 4) {
        node.textContent = '(04)';
      }
    }
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    hideFifth();
    patchCards();
    patchThumbnails();
    patchFilterArea();
    enforceFilter();
  }

  // ---- INTERCEPTOR ----
  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (isDetail()) return val;
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.globalThumbPatched = '1';
        setTimeout(function() { img.removeAttribute('srcset'); }, 0);
        return THUMB_MAP[key];
      }
    }
    return val;
  });

  // ---- OBSERVER ----
  var debounceTimer;
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && m.target.tagName === 'IMG') patchImgByKey(m.target);
      if (m.type === 'childList') {
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IMG') patchImgByKey(n);
          var imgs = n.querySelectorAll ? n.querySelectorAll('img') : [];
          for (var k = 0; k < imgs.length; k++) patchImgByKey(imgs[k]);
        }
      }
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyOverrides, 100);
  });

  (document.body || document.documentElement) &&
    observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ['src', 'srcset', 'style']
    });

  // ---- BOOTSTRAP ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOverrides);
  } else {
    applyOverrides();
  }

  // Repeated checks to catch React hydration and late renders
  var times = [100, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
  times.forEach(function(ms) { setTimeout(applyOverrides, ms); });

  // SPA navigation
  var lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      activeFilter = 'all';
      times.forEach(function(ms) { setTimeout(applyOverrides, ms); });
    }
  }, 200);
})();
