// Oh My Pasta Branding - Content overrides for Apex project detail page
(function() {
  'use strict';

  var SLUG = 'radiant-skincare-branding-copy';

  var IMAGE_MAP = {
    'bPs9iY1xCdYs2KmVLN2FyaQJhk': '/assets/projects/apex/project2_04_img.webp',
    'mEUUzFINLTAMqcjxzWXrFUYzBPQ': '/assets/projects/apex/project2_03_img.webp',
    'DoXq6u9izTQXkCnUIRkIihQFcLY': '/assets/projects/apex/project2_02.gif',
    'pRB6gumPdQ4EjikDzF8GcKawEw': '/assets/projects/apex/project2_02_img.webp',
    'X5grbrA9rWxLkHxGkUrMU5hYvLM': '/assets/projects/apex/project2_03_img.webp',
  };

  // BpFSTQ appears twice: hero BG image vs full-width in Images section
  var BP_HERO = '/assets/projects/apex/project2_04_img.webp';
  var BP_FULLWIDTH = '/assets/projects/apex/project2_01.gif';

  var TEXT_MAP = [
    ['Apex clothing Co. rebrand', '"Oh My Pasta." Branding'],
    ['Bold new look for an eco-conscious apparel brand.', 'A unique pasta bar branding project aimed to connect with the customers and set the brand apart from competitors.'],
    ["We aimed to bring Vero\u2019s vision of authentic social interaction to life by focusing on seamless design and user privacy.", 'A unique pasta bar branding project aimed to connect with the customers and set the brand apart from competitors.'],
    ["This project reinforced the importance of building user-centered features that offer value beyond aesthetics, especially in social networking. The app\u2019s launch exceeded initial user growth targets, and the client received positive feedback on the app\u2019s intuitive design and ad-free experience.", ''],
    ['John Taylor', 'The Brandle Team'],
    ['Member of the team', 'Design Studio'],
    ['User experience focus', 'Brand mascot'],
    ['One challenge was ensuring privacy controls while maintaining an easy-to-use interface. Our team developed an accessible settings menu that lets users control visibility without overwhelming them.', ''],
    // LONGER match MUST come before shorter to avoid partial replacement
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options. One challenge was ensuring privacy controls while maintaining an easy-to-use interface.', 'We chose an egg as the brand\u2019s mascot, symbolizing one of the main ingredients of pasta. Since the egg is a fundamental component in many dishes on the pasta bar menu, it makes an ideal representation of the brand. We aimed to create a cheerful and whimsical character, depicting it in various scenarios to infuse it with personality and charm. This unique mascot will not only embody the brand but also evoke positive feelings among the visitors, serving as a powerful marketing asset.'],
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options.', 'In a highly competitive industry, our main challenge was to distinguish the pasta bar, Oh My Pasta, within the saturated food market. We aimed to establish an emotional connection with the customers and set the brand apart from competitors. To achieve this, we developed a unique and memorable brand identity centered around a charming mascot that will bring smiles to the guests and leave a lasting, positive impression.'],
  ];

  function isProjectPage() {
    var path = window.location.pathname;
    var target = '/projects/' + SLUG;
    var idx = path.indexOf(target);
    if (idx === -1) return false;
    var next = path.charAt(idx + target.length);
    return next === '' || next === '/' || next === '?';
  }

  // ---- IMAGE PROCESSING ----
  function processImage(img) {
    if (!img || img.dataset.apexProcessed) return;
    var src = img.getAttribute('src') || '';
    var srcset = img.getAttribute('srcset') || '';
    var combined = src + ' ' + srcset;

    // BpFSTQ appears in hero AND full-width — differentiate by parent container
    if (combined.indexOf('BpFSTQ5eQJd8x1t06THJsBy6mU') !== -1 ||
        src === BP_HERO || src === BP_FULLWIDTH) {
      var isHero = !!img.closest('[data-framer-name="BG image"]');
      var correctSrc = isHero ? BP_HERO : BP_FULLWIDTH;
      if (img.src !== window.location.origin + correctSrc && img.getAttribute('src') !== correctSrc) {
        img.src = correctSrc;
      }
      img.srcset = '';
      img.removeAttribute('srcset');
      img.dataset.apexProcessed = '1';
      return;
    }

    // YouTube thumbnail
    if (combined.indexOf('ytimg.com') !== -1 || combined.indexOf('maxresdefault') !== -1) {
      // No YouTube replacement specified — hide play button only
      img.dataset.apexProcessed = '1';
      return;
    }

    for (var key in IMAGE_MAP) {
      if (combined.indexOf(key) !== -1) {
        img.src = IMAGE_MAP[key];
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.apexProcessed = '1';
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

  // ---- REMOVE DEVELOPMENT PILL ----
  function removeDevelopmentPill() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim().toLowerCase();
      if (t === 'development') {
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
    if (el._apexLocked) return;
    el._apexLocked = true;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('will-change', 'auto', 'important');
    el.setAttribute('data-apex-locked', '');
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
    document.querySelectorAll('img[data-apex-processed]').forEach(function(img) {
      var el = img.parentElement;
      while (el && el !== document.body) {
        var s = getComputedStyle(el);
        if (s.willChange === 'transform' || s.opacity === '0' || parseFloat(s.opacity) < 0.5) {
          lockContainer(el);
        }
        el = el.parentElement;
      }
    });
    if (!document.getElementById('apex-force-css')) {
      var style = document.createElement('style');
      style.id = 'apex-force-css';
      style.textContent = '[data-apex-locked] { opacity: 1 !important; transform: none !important; visibility: visible !important; will-change: auto !important; }';
      document.head.appendChild(style);
    }
  }

  // ---- FULL PASS ----
  function applyOverrides() {
    if (!isProjectPage()) return;
    processAllImages();
    replaceText();
    replaceBackgroundImages();
    forceShowContainers();
    removeDevelopmentPill();
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
          target.dataset.apexProcessed = '';
          processImage(target);
        }
        if (mutations[i].attributeName === 'style' && target._apexLocked) {
          var cs = getComputedStyle(target);
          if (parseFloat(cs.opacity) < 0.5) {
            target.style.setProperty('opacity', '1', 'important');
            target.style.setProperty('transform', 'none', 'important');
            target.style.setProperty('visibility', 'visible', 'important');
          }
        }
      }
    }
    if (needsTextPass) setTimeout(replaceText, 100);
  });

  function startObserver() {
    var target = document.body || document.documentElement;
    observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'style'] });
  }

  // ---- INTERCEPT img.src SETTER ----
  var origSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (origSrcDescriptor && origSrcDescriptor.set) {
    var origSet = origSrcDescriptor.set;
    // Check if Shine override already patched; chain if so
    var currentSet = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: origSrcDescriptor.get,
      set: function(val) {
        if (isProjectPage() && typeof val === 'string') {
          if (val.indexOf('BpFSTQ5eQJd8x1t06THJsBy6mU') !== -1) {
            // Try DOM context; if not yet mounted, default to hero (first set wins)
            var isHero = this.parentElement ? !!this.closest('[data-framer-name="BG image"]') : true;
            val = isHero ? BP_HERO : BP_FULLWIDTH;
            this.dataset.apexProcessed = '1';
          } else {
            for (var key in IMAGE_MAP) {
              if (val.indexOf(key) !== -1) {
                val = IMAGE_MAP[key];
                this.dataset.apexProcessed = '1';
                break;
              }
            }
          }
        }
        currentSet.call(this, val);
      },
      configurable: true
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
