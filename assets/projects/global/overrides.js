// Global overrides — cards, thumbnails, hide 5th project, hide filter tabs
(function() {
  'use strict';

  // ---- CONFIG ----
  var SLUGS = {
    'radiant-skincare-branding': {
      title: 'Shine Skincare Branding',
      desc: 'High quality cosmetics brand created for independent and brave women.',
      pills: ['Branding'],
      thumb: '/assets/projects/shine/bg.gif'
    },
    'radiant-skincare-branding-copy': {
      title: '\u201COh My Pasta.\u201D Branding',
      desc: 'A unique pasta bar branding project aimed to connect with customers.',
      pills: ['Branding'],
      thumb: '/assets/projects/apex/project2_01.gif'
    },
    'vero-app-development': {
      title: 'DropX Website Design',
      desc: 'A sleek and stylish landing page design for high-conversion digital products.',
      pills: ['Web design'],
      thumb: '/assets/projects/dropx/image3.webp'
    },
    'stoyo-branding': {
      title: 'ORBLEAD Website Design',
      desc: 'A simple minimalistic SaaS lead generation website design.',
      pills: ['Web design'],
      thumb: '/assets/projects/orblead/image1.webp'
    }
  };

  var THUMB_MAP = {
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/shine/bg.gif',
    'bPs9iY1xCdYs2KmVLN2FyaQJhk': '/assets/projects/apex/project2_01.gif',
    'T3l9K398sRcCWjbIM6rTgD8UILk': '/assets/projects/dropx/image3.webp',
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',
  };

  // ---- INJECT CSS THUMBNAIL OVERRIDES ----
  // Pure CSS approach: hide old <img> and show our image as background on the wrapper.
  // This is immune to React re-renders — CSS rules persist regardless of DOM changes.
  var cssRules = ['a[href*="stoyo-branding-copy"]{ display:none!important; }'];
  for (var imgKey in THUMB_MAP) {
    var thumb = THUMB_MAP[imgKey];
    // When wrapper contains an img whose src or srcset has this CDN key, show our thumb
    cssRules.push(
      '[data-framer-background-image-wrapper]:has(img[src*="' + imgKey + '"]),' +
      '[data-framer-background-image-wrapper]:has(img[srcset*="' + imgKey + '"])' +
      '{ background: url(' + thumb + ') center/cover no-repeat !important; }'
    );
    cssRules.push(
      'img[src*="' + imgKey + '"],' +
      'img[srcset*="' + imgKey + '"]' +
      '{ opacity: 0 !important; }'
    );
  }
  var cssEl = document.createElement('style');
  cssEl.id = 'global-thumb-overrides';
  cssEl.textContent = cssRules.join('\n');
  (document.head || document.documentElement).appendChild(cssEl);

  // Build a CSS selector that matches ANY link containing a known slug
  // This catches both href="./projects/slug" AND href="./slug" formats
  var ALL_SLUGS = Object.keys(SLUGS).concat(['stoyo-branding-copy']);
  var LINK_SELECTOR = ALL_SLUGS.map(function(s) { return 'a[href*="' + s + '"]'; }).join(', ');

  // ---- HELPERS ----
  function getSlug(a) {
    var href = a.getAttribute('href') || '';
    // Sort longest first so "stoyo-branding-copy" matches before "stoyo-branding"
    var sorted = ALL_SLUGS.slice().sort(function(x, y) { return y.length - x.length; });
    for (var i = 0; i < sorted.length; i++) {
      if (href.indexOf(sorted[i]) !== -1) return sorted[i];
    }
    return null;
  }

  function isDetail() {
    var p = window.location.pathname;
    return p.indexOf('/projects/') !== -1 && p.split('/projects/')[1].length > 0;
  }

  // ---- HIDE 5TH PROJECT ----
  function hideFifth() {
    document.querySelectorAll('a[href*="stoyo-branding-copy"]').forEach(function(a) {
      a.style.setProperty('display', 'none', 'important');
    });
  }

  // ---- GLOBAL TEXT REPLACEMENTS (catches titles anywhere on page) ----
  var TITLE_MAP = [
    ['Radiant skincare branding', 'Shine Skincare Branding'],
    ['Apex clothing Co. rebrand', '\u201COh My Pasta.\u201D Branding'],
    ['Vero app development', 'DropX Website Design'],
    ['Stoyo branding', 'ORBLEAD Website Design'],
    ['Radiant skincare is offering a user-centric, ad-free platform.', 'High quality cosmetics brand created for independent and brave women.'],
    ['Bold new look for an eco-conscious apparel brand.', 'A unique pasta bar branding project aimed to connect with customers.'],
    ['Vero aimed to distinguish itself in a competitive social media landscape.', 'A sleek and stylish landing page design for high-conversion digital products.'],
    ['Visual identity and packaging design for a Stoyo brand.', 'A simple minimalistic SaaS lead generation website design.'],
  ];

  function patchGlobalText() {
    // Runs on ALL pages including detail pages (to fix "Latest Projects" cards at bottom)
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var text = node.textContent;
      for (var i = 0; i < TITLE_MAP.length; i++) {
        if (text.indexOf(TITLE_MAP[i][0]) !== -1) {
          node.textContent = text.replace(TITLE_MAP[i][0], TITLE_MAP[i][1]);
          text = node.textContent;
        }
      }
    }
  }

  // ---- PATCH CARD TEXT & PILLS ----
  function patchCards() {
    document.querySelectorAll(LINK_SELECTOR).forEach(function(link) {
      var slug = getSlug(link);
      if (!slug || slug === 'stoyo-branding-copy') return;
      var cfg = SLUGS[slug];
      if (!cfg) return;

      // Title — always force correct value
      link.querySelectorAll('h3').forEach(function(h3) {
        if (h3.textContent.trim() !== cfg.title) h3.textContent = cfg.title;
      });

      // Description — only replace known old CMS descriptions (not any paragraph)
      link.querySelectorAll('p').forEach(function(p) {
        var st = p.getAttribute('style') || '';
        if (st.indexOf('text-transform') !== -1) return;
        var text = p.textContent.trim();
        // Match specific old CMS description texts
        if (text.indexOf('Radiant skincare is') !== -1 ||
            text.indexOf('ad-free platform') !== -1 ||
            text.indexOf('Bold new look') !== -1 ||
            text.indexOf('eco-conscious apparel') !== -1 ||
            text.indexOf('Vero aimed') !== -1 ||
            text.indexOf('competitive social media') !== -1 ||
            text.indexOf('Visual identity and packaging') !== -1 ||
            text.indexOf('Stoyo brand') !== -1) {
          p.textContent = cfg.desc;
        }
      });

      // Pills
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
  function patchThumbnails() {
    document.querySelectorAll(LINK_SELECTOR).forEach(function(link) {
      var slug = getSlug(link);
      if (!slug || slug === 'stoyo-branding-copy') return;
      var cfg = SLUGS[slug];
      if (!cfg || !cfg.thumb) return;

      // Method 1: patch <img> elements — replace with fresh img to drop cached srcset
      link.querySelectorAll('img').forEach(function(img) {
        if (img.dataset.globalPatched) return;
        var w = parseInt(img.getAttribute('width') || '0');
        if (w > 0 && w < 50) return;
        if (img.getAttribute('src') !== cfg.thumb) {
          var fresh = document.createElement('img');
          fresh.setAttribute('src', cfg.thumb);
          fresh.alt = '';
          fresh.dataset.globalPatched = '1';
          fresh.style.cssText = 'display:block;width:100%;height:100%;border-radius:inherit;object-position:center;object-fit:cover;';
          if (img.parentNode) img.parentNode.replaceChild(fresh, img);
        }
      });

      // Method 2: patch background-image on divs (Framer sometimes uses this after hydration)
      link.querySelectorAll('[data-framer-background-image-wrapper], [style*="background"]').forEach(function(div) {
        var bg = div.style.backgroundImage || '';
        if (bg && bg.indexOf('framerusercontent') !== -1) {
          div.style.backgroundImage = 'url(' + cfg.thumb + ')';
        }
        // Also check child divs with background
        div.querySelectorAll('div').forEach(function(child) {
          var cbg = child.style.backgroundImage || '';
          if (cbg && cbg.indexOf('framerusercontent') !== -1) {
            child.style.backgroundImage = 'url(' + cfg.thumb + ')';
          }
        });
      });
    });

    // Method 3: global sweep — patch ANY img on the page with a known Framer CDN key
    document.querySelectorAll('img').forEach(function(img) {
      patchImgByKey(img);
    });
  }

  function patchImgByKey(img) {
    if (img.dataset.globalPatched) return;
    var src = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('srcset') || '');
    for (var key in THUMB_MAP) {
      if (src.indexOf(key) !== -1) {
        // Replace the entire img element — only way to force browser to drop cached srcset
        var fresh = document.createElement('img');
        fresh.setAttribute('src', THUMB_MAP[key]);
        fresh.alt = '';
        fresh.dataset.globalPatched = '1';
        fresh.style.cssText = 'display:block;width:100%;height:100%;border-radius:inherit;object-position:center;object-fit:cover;';
        if (img.parentNode) img.parentNode.replaceChild(fresh, img);
        return;
      }
    }
  }

  // ---- HIDE FILTER TABS ON /PROJECTS PAGE ----
  function patchFilterArea() {
    var path = window.location.pathname;
    if (!(path === '/projects' || path === '/projects/')) return;

    var filterLabels = ['All', 'All cases', 'Web design', 'Websites', 'Branding', 'Support', 'Development'];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim();
      if (filterLabels.indexOf(t) === -1 && !/^\(\d+\)$/.test(t)) continue;

      var el = node.parentElement;
      if (!el) continue;
      // Skip pill labels inside project cards
      if (el.closest && el.closest(LINK_SELECTOR)) continue;
      // Skip navbar
      if (el.closest && (el.closest('nav') || el.closest('header'))) continue;

      for (var i = 0; i < 6; i++) {
        if (!el) break;
        if (el.tagName === 'A' && (el.getAttribute('href') || '').indexOf('projects') !== -1) {
          el.style.setProperty('display', 'none', 'important');
          break;
        }
        if (el.classList && el.classList.toString().indexOf('container') !== -1) {
          el.style.setProperty('display', 'none', 'important');
          break;
        }
        el = el.parentElement;
      }
    }
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    hideFifth();
    patchGlobalText();
    patchCards();
    patchThumbnails();
    patchFilterArea();
  }

  // ---- INTERCEPTOR ----
  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (isDetail()) return val;
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
        // Clear srcset and sizes immediately so browser uses our src
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
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
      attributeFilter: ['src', 'srcset']
    });

  // ---- BOOTSTRAP ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOverrides);
  } else {
    applyOverrides();
  }

  // Repeated checks to catch React hydration
  [100, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000].forEach(function(ms) {
    setTimeout(applyOverrides, ms);
  });

  // SPA navigation
  var lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      [300, 1000, 3000].forEach(function(ms) { setTimeout(applyOverrides, ms); });
    }
  }, 200);
})();
