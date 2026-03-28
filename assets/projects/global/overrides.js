// Global overrides — homepage and All Projects page patches
(function() {
  'use strict';

  // ---- PROJECT CARD CONFIGURATION ----
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
      thumb: '/assets/projects/apex/project2_02.gif'
    },
    'vero-app-development': {
      title: 'DropX Website Design',
      desc: 'A sleek and stylish landing page design for high-conversion digital products.',
      pills: ['Web design'],
      cat: 'website',
      thumb: '/assets/projects/dropx/image3.webp'
    },
    'stoyo-branding': {
      title: 'ORBLEAD Website Design',
      desc: 'A simple minimalistic SaaS lead generation website design.',
      pills: ['Web design'],
      cat: 'website',
      thumb: '/assets/projects/orblead/image1.webp'
    },
    'stoyo-branding-copy': { hidden: true }
  };

  // ---- HELPERS ----
  function getSlugFromLink(a) {
    var href = a.getAttribute('href') || '';
    // Match longest slug first to avoid partial matches
    var slugs = Object.keys(SLUGS).sort(function(a, b) { return b.length - a.length; });
    for (var i = 0; i < slugs.length; i++) {
      if (href.indexOf(slugs[i]) !== -1) return slugs[i];
    }
    return null;
  }

  // ---- PATCH CARD CONTENT ----
  function patchCard(link, slug) {
    var cfg = SLUGS[slug];
    if (!cfg) return;
    if (link.dataset.globalPatched === slug) return;

    // Hidden project — hide entire card wrapper
    if (cfg.hidden) {
      var wrapper = link;
      // Walk up to find the scroll container child (the card slot)
      for (var i = 0; i < 6; i++) {
        if (!wrapper.parentElement) break;
        wrapper = wrapper.parentElement;
      }
      wrapper.style.setProperty('display', 'none', 'important');
      link.dataset.globalPatched = slug;
      return;
    }

    // Title
    link.querySelectorAll('h3').forEach(function(h3) {
      var t = h3.textContent.trim();
      if (t !== cfg.title) h3.textContent = cfg.title;
    });

    // Description — find <p> elements that aren't pills (not uppercase)
    link.querySelectorAll('p').forEach(function(p) {
      var style = p.getAttribute('style') || '';
      if (style.indexOf('text-transform') !== -1) return; // skip pills
      if (style.indexOf('font-size: 55px') !== -1) return; // skip large labels
      if (style.indexOf('font-size: 48px') !== -1) return;
      if (style.indexOf('font-size: 30px') !== -1) return;
      if (style.indexOf('font-size: 102px') !== -1) return;
      var text = p.textContent.trim();
      // Replace known default descriptions
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

    // Pills — find pill containers (uppercase transform)
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
        // Show parent
        var pillContainer = pillEls[pi].closest('.framer-1e5war4') || pillEls[pi].parentElement;
        if (pillContainer) pillContainer.style.removeProperty('display');
      } else {
        // Hide extra pills
        var container = pillEls[pi].closest('.framer-1e5war4') || pillEls[pi].parentElement;
        if (container) {
          // Walk up to find the pill wrapper with border-radius
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
    }

    // Mark as patched
    link.dataset.globalPatched = slug;
  }

  // ---- PATCH CARD THUMBNAILS ----
  function patchThumbnails() {
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (!slug || !SLUGS[slug] || SLUGS[slug].hidden) return;
      var cfg = SLUGS[slug];
      if (!cfg.thumb) return;
      link.querySelectorAll('img').forEach(function(img) {
        if (img.dataset.globalThumbPatched) return;
        // Only replace the main card image, skip small icons
        var rect = img.getBoundingClientRect();
        if (rect.width < 50) return;
        img.src = cfg.thumb;
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.globalThumbPatched = '1';
      });
    });
  }

  // ---- HIDE 5TH PROJECT ----
  function hideFifthProject() {
    document.querySelectorAll('a[href*="stoyo-branding-copy"]').forEach(function(link) {
      // Walk up to find the containing grid/scroll child
      var el = link;
      for (var i = 0; i < 8; i++) {
        if (!el.parentElement) break;
        var siblings = el.parentElement.children;
        // If parent has multiple project card children, this el is the card slot
        if (siblings.length >= 3) {
          el.style.setProperty('display', 'none', 'important');
          break;
        }
        el = el.parentElement;
      }
    });
  }

  // ---- HIDE SUPPORT FILTER TAB ----
  function hideFilterTabs() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim();
      // Hide "Support" tab text
      if (t === 'Support') {
        var el = node.parentElement;
        // Walk up to find the tab link container
        for (var i = 0; i < 8; i++) {
          if (!el) break;
          if (el.tagName === 'A' && (el.getAttribute('href') || '').indexOf('projects') !== -1) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          // Also check for the framer tab container
          if (el.classList && el.classList.toString().indexOf('container') !== -1) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
          el = el.parentElement;
        }
      }
      // Fix count "(17)" → "(04)"
      if (/^\(\d+\)$/.test(t)) {
        node.textContent = '(04)';
      }
    }
  }

  // ---- CATEGORY FILTER OVERRIDE ----
  var activeFilter = 'all';

  function applyFilter() {
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (!slug || !SLUGS[slug]) return;
      var cfg = SLUGS[slug];

      // Always hide the 5th project
      if (cfg.hidden) return;

      // Find the card container to show/hide
      var container = link;
      for (var i = 0; i < 6; i++) {
        if (!container.parentElement) break;
        container = container.parentElement;
      }

      var shouldShow = activeFilter === 'all' || cfg.cat === activeFilter;
      if (shouldShow) {
        container.style.removeProperty('display');
      } else {
        container.style.setProperty('display', 'none', 'important');
      }
    });
  }

  function setupFilterClicks() {
    // Find filter tab links by their text content
    document.querySelectorAll('a[href*="projects"]').forEach(function(tabLink) {
      var text = tabLink.textContent.trim().toLowerCase();
      var filter = null;
      if (text.indexOf('all cases') !== -1 || text.indexOf('all') !== -1 && text.indexOf('(') !== -1) {
        filter = 'all';
      } else if (text.indexOf('branding') !== -1 && text.indexOf('skincare') === -1 && text.indexOf('pasta') === -1) {
        filter = 'branding';
      } else if (text.indexOf('website') !== -1) {
        filter = 'website';
      }

      if (filter && !tabLink.dataset.filterBound) {
        tabLink.dataset.filterBound = '1';
        tabLink.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          activeFilter = filter;
          setTimeout(applyFilter, 100);
          setTimeout(applyFilter, 500);
        }, true);
      }
    });
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    // Patch all project cards
    document.querySelectorAll('a[href*="/projects/"]').forEach(function(link) {
      var slug = getSlugFromLink(link);
      if (slug) patchCard(link, slug);
    });
    hideFifthProject();
    hideFilterTabs();
    patchThumbnails();
    setupFilterClicks();
  }

  // ---- REGISTER THUMBNAIL INTERCEPTOR ----
  // Map hero image keys to card thumbnails (runs on ALL pages)
  var THUMB_MAP = {
    'T3l9K398sRcCWjbIM6rTgD8UILk': '/assets/projects/dropx/image3.webp',
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',
  };

  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    // Only intercept on non-project-detail pages (homepage, /projects)
    if (window.location.pathname.indexOf('/projects/') !== -1 &&
        window.location.pathname.split('/projects/')[1].length > 0) {
      return val; // On a project detail page — let project overrides handle it
    }
    for (var key in THUMB_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.globalThumbPatched = '1';
        return THUMB_MAP[key];
      }
    }
    return val;
  });

  // ---- MUTATION OBSERVER ----
  var observer = new MutationObserver(function() {
    applyOverrides();
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
      activeFilter = 'all';
      setTimeout(applyOverrides, 300);
      setTimeout(applyOverrides, 1000);
      setTimeout(applyOverrides, 3000);
    }
  }, 200);
})();
