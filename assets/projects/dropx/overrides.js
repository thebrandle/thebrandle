// DropX Website Design - Content overrides for Vero project detail page
(function() {
  'use strict';

  var SLUG = 'vero-app-development';
  var SLUG_ALT = 'dropx-website-design';

  // Video URLs (Vercel blob storage)
  var HERO_VIDEO = 'https://assets.thebrandle.com/project3_video1.mp4';
  var SECTION_VIDEO = 'https://assets.thebrandle.com/project3_img02.mp4';

  var TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  // Image keys that need VIDEO replacement
  var VIDEO_MAP = {
    'T3l9K398sRcCWjbIM6rTgD8UILk': HERO_VIDEO,     // Vero hero BG image
    'mEUUzFINLTAMqcjxzWXrFUYzBPQ': SECTION_VIDEO,   // Full-width challenges image
  };

  // Image keys that need static IMAGE replacement
  var IMAGE_MAP = {
    'DoXq6u9izTQXkCnUIRkIihQFcLY': '/assets/projects/dropx/image3.webp',  // Sneaker shot
    'pRB6gumPdQ4EjikDzF8GcKawEw': '/assets/projects/dropx/image4.webp',   // Tote bag
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/dropx/image5.webp',   // T-shirt
  };

  // Text replacements: [original, replacement]
  var TEXT_MAP = [
    // Title
    ['Vero app development', 'DropX Website Design'],
    // Short description — longer variant first
    ['Vero aimed to distinguish itself in a competitive social media landscape by offering a user-centric, ad-free platform.', 'A sleek and stylish landing page design made for high-conversion digital products and SaaS platforms.'],
    ['Vero aimed to distinguish itself in a competitive social media landscape.', 'A sleek and stylish landing page design made for high-conversion digital products and SaaS platforms.'],
    // Vision/description text
    ["We aimed to bring Vero\u2019s vision of authentic social interaction to life by focusing on seamless design and user privacy.", 'A sleek and stylish landing page design made for high-conversion digital products and SaaS platforms.'],
    // Outcome text (remove)
    ["This project reinforced the importance of building user-centered features that offer value beyond aesthetics, especially in social networking. The app\u2019s launch exceeded initial user growth targets, and the client received positive feedback on the app\u2019s intuitive design and ad-free experience.", ''],
    // Challenge text — LONGER match MUST come before shorter to avoid partial replacement
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options. One challenge was ensuring privacy controls while maintaining an easy-to-use interface.', '\u201CWe need to create something very bold and sharp, which feels premium and alive, and at the same time modern, minimal, and aesthetic.\u201D'],
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options.', '\u201CWe need to create something very bold and sharp, which feels premium and alive, and at the same time modern, minimal, and aesthetic.\u201D'],
    ['One challenge was ensuring privacy controls while maintaining an easy-to-use interface. Our team developed an accessible settings menu that lets users control visibility without overwhelming them.', 'We blended bold hero sections, animated UI, and sharp typography to create a layout that feels fast, premium, and alive. Built with a modern aesthetic and clear structure, it is made to showcase value, build trust, and drive action.'],
    // Client info
    ['Vero Labs Inc.', 'DropX'],
    ['6 months', '4 weeks'],
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

  // ---- VIDEO REPLACEMENT ----
  function replaceImgWithVideo(img, videoSrc) {
    if (img.dataset.dropxVideoReplaced) return;
    if (!img.parentNode) return;
    img.dataset.dropxVideoReplaced = '1';

    var video = document.createElement('video');
    video.src = videoSrc;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.dataset.dropxProcessed = '1';
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';

    img.style.setProperty('display', 'none', 'important');
    img.parentNode.insertBefore(video, img);

    video.addEventListener('error', function() {
      // If video fails to load, show original image again
      video.style.display = 'none';
      img.style.removeProperty('display');
    });
    video.play().catch(function() {});
  }

  // ---- IMAGE PROCESSING ----
  function processImage(img) {
    if (!img || img.dataset.dropxProcessed) return;
    // Skip images inside "Latest Projects" card links to OTHER projects
    var parentLink = img.closest('a');
    if (parentLink) {
      var h = parentLink.getAttribute('href') || '';
      if (h.indexOf('radiant-skincare-branding') !== -1 || h.indexOf('stoyo-branding') !== -1) return;
    }
    var src = img.getAttribute('src') || '';
    var srcset = img.getAttribute('srcset') || '';
    var combined = src + ' ' + srcset;

    // Check for video replacements
    for (var vKey in VIDEO_MAP) {
      if (combined.indexOf(vKey) !== -1) {
        img.dataset.dropxProcessed = '1';
        img.dataset.dropxVideoSrc = VIDEO_MAP[vKey];
        img.src = TRANSPARENT_GIF;
        img.srcset = '';
        img.removeAttribute('srcset');
        if (img.parentNode) replaceImgWithVideo(img, VIDEO_MAP[vKey]);
        return;
      }
    }

    // YouTube thumbnail — flag but skip
    if (combined.indexOf('ytimg.com') !== -1 || combined.indexOf('maxresdefault') !== -1) {
      img.dataset.dropxProcessed = '1';
      return;
    }

    // Standard image replacement
    for (var key in IMAGE_MAP) {
      if (combined.indexOf(key) !== -1) {
        img.src = IMAGE_MAP[key];
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.dropxProcessed = '1';
        return;
      }
    }
  }

  function processAllImages() {
    document.querySelectorAll('img').forEach(processImage);
  }

  // Process any video replacements that were flagged but not yet replaced
  function processVideoReplacements() {
    document.querySelectorAll('img[data-dropx-video-src]:not([data-dropx-video-replaced])').forEach(function(img) {
      if (img.parentNode) replaceImgWithVideo(img, img.dataset.dropxVideoSrc);
    });
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
  // The CMS date is formatted dynamically; match any rendered date near the "Date" label
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
          node.textContent = 'Nov 6, 2025';
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
  function removeDevelopmentPill() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim().toLowerCase();
      if (t === 'development' || t === 'branding' || t === 'support') {
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
    if (el._dropxLocked) return;
    el._dropxLocked = true;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('will-change', 'auto', 'important');
    el.setAttribute('data-dropx-locked', '');
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
    document.querySelectorAll('img[data-dropx-processed], video[data-dropx-processed]').forEach(function(el) {
      var parent = el.parentElement;
      while (parent && parent !== document.body) {
        var s = getComputedStyle(parent);
        if (s.willChange === 'transform' || s.opacity === '0' || parseFloat(s.opacity) < 0.5) {
          lockContainer(parent);
        }
        parent = parent.parentElement;
      }
    });
    if (!document.getElementById('dropx-force-css')) {
      var style = document.createElement('style');
      style.id = 'dropx-force-css';
      style.textContent = '[data-dropx-locked] { opacity: 1 !important; transform: none !important; visibility: visible !important; will-change: auto !important; }';
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
    processVideoReplacements();
    replaceText();
    replaceDate();
    replaceBackgroundImages();
    forceShowContainers();
    removeDevelopmentPill();
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
          target.dataset.dropxProcessed = '';
          processImage(target);
        }
        if (mutations[i].attributeName === 'style' && target._dropxLocked) {
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
    // Video replacements — mark for deferred replacement
    for (var vKey in VIDEO_MAP) {
      if (val.indexOf(vKey) !== -1) {
        img.dataset.dropxProcessed = '1';
        img.dataset.dropxVideoSrc = VIDEO_MAP[vKey];
        (function(imgRef, src) {
          setTimeout(function() { replaceImgWithVideo(imgRef, src); }, 0);
        })(img, VIDEO_MAP[vKey]);
        return TRANSPARENT_GIF;
      }
    }
    // Static image replacements
    for (var key in IMAGE_MAP) {
      if (val.indexOf(key) !== -1) {
        img.dataset.dropxProcessed = '1';
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
