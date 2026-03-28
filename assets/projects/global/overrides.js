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

  // Hero image keys → card thumbnails
  var THUMB_MAP = {
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/shine/bg.gif',
    'bPs9iY1xCdYs2KmVLN2FyaQJhk': '/assets/projects/apex/project2_01.gif',
    'T3l9K398sRcCWjbIM6rTgD8UILk': '/assets/projects/dropx/image3.webp',
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',
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
        if (style.indexOf('text-transform') !== -1) return;
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

      // Pills
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
  // Replaces ALL card images whose src or srcset contains a Framer CDN path
  function patchThumbnails() {
    if (isOnProjectDetail()) return;
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (!slug || !SLUGS[slug]) return;
      var cfg = SLUGS[slug];
      if (!cfg.thumb) return;
      link.querySelectorAll('img').forEach(function(img) {
        var w = parseInt(img.getAttribute('width') || '0');
        if (w > 0 && w < 50) return;
        var cur = (img.getAttribute('src') || '') + ' ' + (img.getAttribute('srcset') || '');
        // Replace if src still points to framer CDN (catches React hydration resets)
        if (cur.indexOf('framerusercontent') !== -1) {
          img.src = cfg.thumb;
          img.srcset = '';
          img.removeAttribute('srcset');
        }
      });
    });
  }

  // ---- PATCH INDIVIDUAL IMG BY KEY ----
  // Called when any img gets its src/srcset set — checks for known hero keys
  function patchImgByKey(img) {
    if (isOnProjectDetail()) return;
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

  // ---- HIDE ALL FILTER TABS ON /PROJECTS PAGE ----
  function patchFilterArea() {
    // Only act on the /projects listing page
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
      // Skip text inside project card links (pill labels)
      if (el.closest && el.closest('a[href*="/projects/"]')) continue;
      // Skip navbar
      if (el.closest && (el.closest('nav') || el.closest('header'))) continue;

      // Walk up to find the filter tab's clickable container
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
    hideFifthProject();
    patchCards();
    patchThumbnails();
    patchFilterArea();
  }

  // ---- REGISTER THUMBNAIL INTERCEPTOR (catches dynamic img.src assignments) ----
  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (isOnProjectDetail()) return val;
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.globalThumbPatched = '1';
        // Also clear srcset so browser uses our src
        setTimeout(function() {
          img.removeAttribute('srcset');
        }, 0);
        return THUMB_MAP[key];
      }
    }
    return val;
  });

  // ---- MUTATION OBSERVER ----
  // Watch BOTH childList (new elements) AND attributes (src/srcset changes)
  var debounceTimer;
  var observer = new MutationObserver(function(mutations) {
    // Immediately patch any img whose src/srcset just changed
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.type === 'attributes' && m.target.tagName === 'IMG') {
        patchImgByKey(m.target);
      }
      // Also check newly added images
      if (m.type === 'childList') {
        var added = m.addedNodes;
        for (var j = 0; j < added.length; j++) {
          var node = added[j];
          if (node.nodeType !== 1) continue;
          if (node.tagName === 'IMG') patchImgByKey(node);
          var imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
          for (var k = 0; k < imgs.length; k++) patchImgByKey(imgs[k]);
        }
      }
    }
    // Debounced full pass for text, pills, filter tabs
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyOverrides, 150);
  });

  function startObserver() {
    var target = document.body || document.documentElement;
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset']
    });
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
