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

  // ---- INJECT CSS ----
  var css = document.createElement('style');
  css.textContent = 'a[href*="stoyo-branding-copy"]{ display:none!important; }';
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

  // ---- HIDE 5TH PROJECT ----
  function hideFifth() {
    document.querySelectorAll('a[href*="stoyo-branding-copy"]').forEach(function(a) {
      a.style.setProperty('display', 'none', 'important');
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
        if (cur.indexOf('framerusercontent') !== -1) {
          img.src = thumb;
          img.srcset = '';
          img.removeAttribute('srcset');
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
        return;
      }
    }
  }

  // ---- HIDE ALL FILTER TABS ----
  function hideFilterTabs() {
    // Hide the entire filter row: find "All", "Web design", "Branding" etc.
    // These are text nodes NOT inside project card links
    var labels = ['All', 'All cases', 'Web design', 'Websites', 'Branding', 'Support', 'Development'];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim();
      // Hide filter tab labels (but not those inside project cards or navbar)
      if (labels.indexOf(t) !== -1 || /^\(\d+\)$/.test(t)) {
        var el = node.parentElement;
        if (!el) continue;
        // Skip if inside a project card link
        if (el.closest && el.closest('a[href*="/projects/"]')) continue;
        // Skip if inside the navbar (header area)
        if (el.closest && (el.closest('nav') || el.closest('header'))) continue;
        // Only hide filter-area elements: look for the tab container
        // Filter tabs are typically in a section with large font sizes or specific framer names
        var container = el;
        for (var i = 0; i < 8; i++) {
          if (!container) break;
          var dfn = container.getAttribute('data-framer-name') || '';
          // If this is the "All cases" data-framer-name or a tab link container
          if (dfn === 'All cases' || dfn === 'Text') {
            // Found a filter tab — walk up one more to find the row
            var row = container;
            while (row && row.parentElement) {
              row = row.parentElement;
              // The filter row container typically has a few tab children
              if (row.children.length >= 2 && row.children.length <= 8) {
                var hasFilterText = false;
                for (var c = 0; c < row.children.length; c++) {
                  var ct = row.children[c].textContent.trim();
                  if (ct.indexOf('All') !== -1 || ct.indexOf('Branding') !== -1 || ct.indexOf('Web') !== -1) {
                    hasFilterText = true;
                    break;
                  }
                }
                if (hasFilterText) {
                  row.style.setProperty('display', 'none', 'important');
                  return; // Done — hid the whole filter row
                }
              }
            }
          }
          container = container.parentElement;
        }
      }
    }
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    hideFifth();
    patchCards();
    patchThumbnails();
    hideFilterTabs();
  }

  // ---- INTERCEPTOR ----
  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (isDetail()) return val;
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
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
      attributeFilter: ['src', 'srcset']
    });

  // ---- BOOTSTRAP ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyOverrides);
  } else {
    applyOverrides();
  }

  var times = [100, 300, 500, 800, 1200, 1800, 2500, 3500, 5000, 7000, 10000];
  times.forEach(function(ms) { setTimeout(applyOverrides, ms); });

  // SPA navigation
  var lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      times.forEach(function(ms) { setTimeout(applyOverrides, ms); });
    }
  }, 200);
})();
