// Global overrides — patch card content and hide 5th project
(function() {
  'use strict';

  // ---- PROJECT CARD CONFIGURATION ----
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
      thumb: '/assets/projects/apex/project2_02.gif'
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

  // ---- HELPERS ----
  function getSlugFromLink(a) {
    var href = a.getAttribute('href') || '';
    var slugs = Object.keys(SLUGS).sort(function(a, b) { return b.length - a.length; });
    for (var i = 0; i < slugs.length; i++) {
      if (href.indexOf(slugs[i]) !== -1) return slugs[i];
    }
    return null;
  }

  function isOnProjectDetail() {
    var p = window.location.pathname;
    return p.indexOf('/projects/') !== -1 && p.split('/projects/')[1].length > 0;
  }

  // ---- HIDE 5TH PROJECT ----
  function hideFifthProject() {
    document.querySelectorAll('a[href*="stoyo-branding-copy"]').forEach(function(link) {
      if (link.dataset.globalHidden) return;
      link.dataset.globalHidden = '1';
      // Walk up to the card slot container
      var el = link;
      for (var i = 0; i < 8; i++) {
        if (!el.parentElement) break;
        var siblings = el.parentElement.children;
        if (siblings.length >= 3) {
          el.style.setProperty('display', 'none', 'important');
          break;
        }
        el = el.parentElement;
      }
    });
  }

  // ---- PATCH CARD TITLES & DESCRIPTIONS ----
  function patchCards() {
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (!slug) return;
      var cfg = SLUGS[slug];
      if (!cfg) return;

      // Title
      link.querySelectorAll('h3').forEach(function(h3) {
        var t = h3.textContent.trim();
        if (t !== cfg.title && t !== '') h3.textContent = cfg.title;
      });

      // Description
      link.querySelectorAll('p').forEach(function(p) {
        var style = p.getAttribute('style') || '';
        if (style.indexOf('text-transform') !== -1) return; // skip pills
        // Skip large font sizes (filter tabs, section titles)
        if (/font-size:\s*(30|48|55|102)px/.test(style)) return;
        var text = p.textContent.trim();
        if (text.indexOf('Vero aimed') !== -1 ||
            text.indexOf('Visual identity') !== -1 ||
            text.indexOf('Bold new look') !== -1 ||
            text.indexOf('Radiant skincare') !== -1 ||
            text.indexOf('ad-free platform') !== -1 ||
            text.indexOf('eco-conscious') !== -1 ||
            text.indexOf('Stoyo brand') !== -1) {
          p.textContent = cfg.desc;
        }
      });

      // Pills — find uppercase pill text elements
      var pillEls = [];
      link.querySelectorAll('p').forEach(function(p) {
        var style = p.getAttribute('style') || '';
        if (style.indexOf('text-transform: uppercase') !== -1 ||
            style.indexOf('text-transform:uppercase') !== -1) {
          pillEls.push(p);
        }
      });
      for (var pi = 0; pi < pillEls.length; pi++) {
        if (pi < cfg.pills.length) {
          pillEls[pi].textContent = cfg.pills[pi];
        } else {
          // Hide extra pills by walking up to border-radius container
          var el = pillEls[pi].parentElement;
          for (var k = 0; k < 6; k++) {
            if (!el) break;
            var br = parseInt(getComputedStyle(el).borderRadius);
            if (br >= 20) {
              el.style.setProperty('display', 'none', 'important');
              break;
            }
            el = el.parentElement;
          }
        }
      }
    });
  }

  // ---- PATCH CARD THUMBNAILS ----
  function patchThumbnails() {
    if (isOnProjectDetail()) return; // Let project overrides handle detail pages
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (!slug || !SLUGS[slug]) return;
      var cfg = SLUGS[slug];
      if (!cfg.thumb) return;
      link.querySelectorAll('img').forEach(function(img) {
        if (img.dataset.globalThumbPatched) return;
        // Only replace the main card image — skip tiny icons (width/height attrs)
        var w = parseInt(img.getAttribute('width') || '0');
        var h = parseInt(img.getAttribute('height') || '0');
        if (w > 0 && w < 50) return;
        // Also match by checking if current src contains a known Framer CDN key
        var src = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('srcset') || '');
        if (src.indexOf('framerusercontent') !== -1 || src.indexOf('data:image') !== -1) {
          img.src = cfg.thumb;
          img.srcset = '';
          img.removeAttribute('srcset');
          img.dataset.globalThumbPatched = '1';
        }
      });
    });
  }

  // ---- HIDE SUPPORT TEXT IN FILTER AREA & FIX COUNTS ----
  function patchFilterArea() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim();

      // Hide "Support" only when it appears as a standalone filter tab label
      if (t === 'Support') {
        var el = node.parentElement;
        // Check if this is inside a project card link — if so, skip (handled by pill logic)
        if (el && el.closest('a[href*="/projects/"]')) continue;
        // Walk up to find the tab container
        for (var i = 0; i < 8; i++) {
          if (!el) break;
          if (el.tagName === 'A' && (el.getAttribute('href') || '').indexOf('projects') !== -1) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          if (el.classList && el.classList.toString().indexOf('container') !== -1 &&
              !el.closest('a[href*="/projects/"]')) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          el = el.parentElement;
        }
      }

      // Fix project count
      if (/^\(\d+\)$/.test(t) && parseInt(t.replace(/[()]/g, '')) > 4) {
        node.textContent = '(04)';
      }
    }
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    hideFifthProject();
    patchCards();
    patchThumbnails();
    patchFilterArea();
  }

  // ---- REGISTER THUMBNAIL INTERCEPTOR ----
  var THUMB_MAP = {
    'T3l9K398sRcCWjbIM6rTgD8UILk': '/assets/projects/dropx/image3.webp',
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',
  };

  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (isOnProjectDetail()) return val;
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.globalThumbPatched = '1';
        return THUMB_MAP[key];
      }
    }
    return val;
  });

  // ---- MUTATION OBSERVER ----
  var debounceTimer;
  var observer = new MutationObserver(function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyOverrides, 150);
  });

  function startObserver() {
    var target = document.body || document.documentElement;
    observer.observe(target, { childList: true, subtree: true });
  }

  // ---- BOOTSTRAP ----
  if (document.body) {
    startObserver();
    applyOverrides();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      startObserver();
      applyOverrides();
    });
  }

  var checkCount = 0;
  var checker = setInterval(function() {
    applyOverrides();
    checkCount++;
    if (checkCount > 20) clearInterval(checker);
  }, 500);

  // SPA navigation
  var lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(applyOverrides, 300);
      setTimeout(applyOverrides, 1000);
      setTimeout(applyOverrides, 3000);
    }
  }, 200);
})();
