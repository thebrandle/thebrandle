// ORBLEAD Website Design - Content overrides for Stoyo project detail page
(function() {
  'use strict';

  var SLUG = 'stoyo-branding';
  var SLUG_ALT = 'orblead-website-design';

  // Image mapping: Framer CDN image key -> local asset
  var IMAGE_MAP = {
    'SDIyriYujLHtLJeg9tbQiqvoT4': '/assets/projects/orblead/image1.webp',   // Hero BG
    'mEUUzFINLTAMqcjxzWXrFUYzBPQ': '/assets/projects/orblead/image2.webp',  // Full-width challenges
    'DoXq6u9izTQXkCnUIRkIihQFcLY': '/assets/projects/orblead/image3.webp',  // Column image
    'pRB6gumPdQ4EjikDzF8GcKawEw': '/assets/projects/orblead/image4.webp',   // Column image
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/orblead/image5.png',    // Full-width bottom
  };

  // Text replacements: [original, replacement]
  var TEXT_MAP = [
    // Title
    ['Stoyo branding', 'ORBLEAD Website Design'],
    // Short description
    ['Visual identity and packaging design for a Stoyo brand.', 'A simple minimalistic SaaS lead generation website design.'],
    // Vision/description text
    ["We aimed to bring Vero\u2019s vision of authentic social interaction to life by focusing on seamless design and user privacy.", 'A simple minimalistic SaaS lead generation website design.'],
    // Outcome text (remove)
    ["This project reinforced the importance of building user-centered features that offer value beyond aesthetics, especially in social networking. The app\u2019s launch exceeded initial user growth targets, and the client received positive feedback on the app\u2019s intuitive design and ad-free experience.", ''],
    // Challenge text — LONGER match MUST come before shorter
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options. One challenge was ensuring privacy controls while maintaining an easy-to-use interface.', 'We had to build a design which focuses on clarity, conversion, and trust by structuring different pricing tiers. The challenge was capturing all these details in a clean, modern layout, which can easily guide users from exploration to action.'],
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options.', 'We had to build a design which focuses on clarity, conversion, and trust by structuring different pricing tiers. The challenge was capturing all these details in a clean, modern layout, which can easily guide users from exploration to action.'],
    ['One challenge was ensuring privacy controls while maintaining an easy-to-use interface. Our team developed an accessible settings menu that lets users control visibility without overwhelming them.', 'In this project, we focus on clarity, conversion, and trust by structuring three distinct pricing tiers: Starter, Growth, and Pro. With a strong visual hierarchy highlighting the most popular plan and reinforcing value through a detailed comparison table, we include feature breakdowns like AI lead scoring, personalized outreach, and multi-channel capture. All of this is supported by real testimonials to build credibility, wrapped in a clean, modern layout with subtle gradients and a bold CTA section to guide users smoothly from exploration to action.'],
    // Client info
    ['Vero Labs Inc.', 'Orblead'],
    ['6 months', '1 week'],
    ['John Taylor', 'The Brandle Team'],
    ['Member of the team', 'Design Studio'],
    ['User experience focus', 'Web design'],
  ];

  function isProjectPage() {
    var path = window.location.pathname;
    var targets = ['/projects/' + SLUG, '/projects/' + SLUG_ALT];
    for (var ti = 0; ti < targets.length; ti++) {
      var idx = path.indexOf(targets[ti]);
      if (idx === -1) continue;
      var next = path.charAt(idx + targets[ti].length);
      if (next === '' || next === '/' || next === '?') return true;
    }
    return false;
  }

  // ---- IMAGE PROCESSING ----
  function processImage(img) {
    if (!img || img.dataset.orbleadProcessed) return;
    // Skip images inside "Latest Projects" card links to OTHER projects
    var parentLink = img.closest('a');
    if (parentLink) {
      var h = parentLink.getAttribute('href') || '';
      if (h.indexOf('radiant-skincare-branding') !== -1 || h.indexOf('vero-app') !== -1) return;
    }
    var src = img.getAttribute('src') || '';
    var srcset = img.getAttribute('srcset') || '';
    var combined = src + ' ' + srcset;

    // YouTube thumbnail — flag but skip
    if (combined.indexOf('ytimg.com') !== -1 || combined.indexOf('maxresdefault') !== -1) {
      img.dataset.orbleadProcessed = '1';
      return;
    }

    for (var key in IMAGE_MAP) {
      if (combined.indexOf(key) !== -1) {
        img.src = IMAGE_MAP[key];
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.orbleadProcessed = '1';
        return;
      }
    }
  }

  function processAllImages() {
    document.querySelectorAll('img').forEach(processImage);
  }

  // ---- TEXT ----
  function replaceText() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var text = node.textContent;
      for (var i = 0; i < TEXT_MAP.length; i++) {
        if (text.indexOf(TEXT_MAP[i][0]) !== -1) {
          node.textContent = text.replace(TEXT_MAP[i][0], TEXT_MAP[i][1]);
          text = node.textContent;
        }
      }
    }
  }

  // ---- DATE REPLACEMENT ----
  function replaceDate() {
    document.querySelectorAll('[data-framer-name="Date"]').forEach(function(dateEl) {
      var container = dateEl.closest('div');
      if (!container) container = dateEl.parentElement;
      if (!container) return;
      var parent = container.parentElement;
      if (!parent) return;
      var walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while (node = walker.nextNode()) {
        var text = node.textContent.trim();
        if (/^[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}$/.test(text)) {
          node.textContent = 'May 2, 2025';
          break;
        }
      }
    });
  }

  // ---- BACKGROUND IMAGES ----
  function replaceBackgroundImages() {
    document.querySelectorAll('[style*="background"]').forEach(function(el) {
      var style = el.getAttribute('style') || '';
      for (var key in IMAGE_MAP) {
        if (style.indexOf(key) !== -1) {
          el.style.backgroundImage = 'url(' + IMAGE_MAP[key] + ')';
        }
      }
    });
  }

  // ---- REMOVE UNWANTED PILLS (keep only Web design) ----
  function removeBrandingPill() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim().toLowerCase();
      if (t === 'branding' || t === 'support' || t === 'development') {
        var el = node.parentElement;
        for (var i = 0; i < 8; i++) {
          if (!el || el === document.body) break;
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

  // ---- FORCE SHOW CONTAINERS ----
  var watchedContainers = [];
  function lockContainer(el) {
    if (el._orbleadLocked) return;
    el._orbleadLocked = true;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('will-change', 'auto', 'important');
    el.setAttribute('data-orblead-locked', '');
    watchedContainers.push(el);
    var mo = new MutationObserver(function(muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'style') {
          var s = getComputedStyle(el);
          if (parseFloat(s.opacity) < 0.5) {
            el.style.setProperty('opacity', '1', 'important');
            el.style.setProperty('transform', 'none', 'important');
            el.style.setProperty('visibility', 'visible', 'important');
          }
        }
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['style'] });
  }

  function forceShowContainers() {
    document.querySelectorAll('img[data-orblead-processed]').forEach(function(img) {
      var el = img.parentElement;
      while (el && el !== document.body) {
        var s = getComputedStyle(el);
        if (s.willChange === 'transform' || s.opacity === '0' || parseFloat(s.opacity) < 0.5) {
          lockContainer(el);
        }
        el = el.parentElement;
      }
    });
    if (!document.getElementById('orblead-force-css')) {
      var style = document.createElement('style');
      style.id = 'orblead-force-css';
      style.textContent = '[data-orblead-locked] { opacity: 1 !important; transform: none !important; visibility: visible !important; will-change: auto !important; }';
      document.head.appendChild(style);
    }
  }

  // ---- HIDE YOUTUBE SECTION ----
  function hideYouTubeSection() {
    document.querySelectorAll('img').forEach(function(img) {
      var src = img.getAttribute('src') || '';
      if (src.indexOf('maxresdefault') !== -1 || src.indexOf('ytimg') !== -1) {
        var el = img;
        for (var i = 0; i < 6; i++) {
          el = el.parentElement;
          if (!el) break;
          if (el.parentElement && el.parentElement.getAttribute('data-framer-name') === 'Content') {
            el.style.setProperty('display', 'none', 'important');
            return;
          }
        }
        var article = img.closest('article');
        if (article && article.parentElement) {
          article.parentElement.style.setProperty('display', 'none', 'important');
        }
      }
    });
    document.querySelectorAll('iframe').forEach(function(iframe) {
      if ((iframe.getAttribute('src') || '').indexOf('youtube') !== -1) {
        var container = iframe.closest('[class*="container"]') || iframe.parentElement;
        if (container) container.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // ---- HIDE VISIT WEBSITE CTA ----
  function hideVisitWebsiteCTA() {
    document.querySelectorAll('a, button').forEach(function(el) {
      var text = el.textContent.trim().toLowerCase();
      if (text === 'visit website' || text === 'visit site') {
        var container = el.closest('[data-framer-name]') || el.parentElement;
        if (container) {
          container.style.setProperty('display', 'none', 'important');
        } else {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    if (!isProjectPage()) return;
    processAllImages();
    replaceText();
    replaceDate();
    replaceBackgroundImages();
    forceShowContainers();
    removeBrandingPill();
    hideYouTubeSection();
    hideVisitWebsiteCTA();
  }

  // ---- MUTATION OBSERVER ----
  var observer = new MutationObserver(function(mutations) {
    if (!isProjectPage()) return;
    var needsTextPass = false;
    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;
        if (node.tagName === 'IMG') processImage(node);
        var imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
        for (var k = 0; k < imgs.length; k++) processImage(imgs[k]);
        if (node.childNodes && node.childNodes.length > 0) needsTextPass = true;
      }
      if (mutations[i].type === 'attributes') {
        var target = mutations[i].target;
        if (target.tagName === 'IMG') {
          target.dataset.orbleadProcessed = '';
          processImage(target);
        }
        if (mutations[i].attributeName === 'style' && target._orbleadLocked) {
          var cs = getComputedStyle(target);
          if (parseFloat(cs.opacity) < 0.5) {
            target.style.setProperty('opacity', '1', 'important');
            target.style.setProperty('transform', 'none', 'important');
            target.style.setProperty('visibility', 'visible', 'important');
          }
        }
      }
    }
    if (needsTextPass) setTimeout(function() { replaceText(); replaceDate(); }, 100);
  });

  function startObserver() {
    var target = document.body || document.documentElement;
    observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'style'] });
  }

  // ---- REGISTER WITH SHARED INTERCEPTOR ----
  window.__projectOverrides = window.__projectOverrides || [];
  window.__projectOverrides.push(function(img, val) {
    if (!isProjectPage()) return val;
    for (var key in IMAGE_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.orbleadProcessed = '1';
        return IMAGE_MAP[key];
      }
    }
    return val;
  });

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
    if (checkCount > 15) clearInterval(checker);
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
