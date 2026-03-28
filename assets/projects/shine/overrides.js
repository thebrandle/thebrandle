// Shine Skincare Branding - Instant content overrides for project detail page
(function() {
  'use strict';

  var SLUG = 'radiant-skincare-branding';
  var IMAGE5_PATH = '/assets/projects/shine/image5.webp';

  // Image mapping: old Framer CDN image key -> new local path
  var IMAGE_MAP = {
    'BpFSTQ5eQJd8x1t06THJsBy6mU': '/assets/projects/shine/bg.gif',
    'mEUUzFINLTAMqcjxzWXrFUYzBPQ': '/assets/projects/shine/pallete.webp',
    'DoXq6u9izTQXkCnUIRkIihQFcLY': '/assets/projects/shine/image2.webp',
    'pRB6gumPdQ4EjikDzF8GcKawEw': '/assets/projects/shine/image4.webp',
    'X5grbrA9rWxLkHxGkUrMU5hYvLM': '/assets/projects/shine/pallete.webp',
    'Sl4ev11cuh935MExPXoGtMehHI': '/assets/projects/shine/bg.gif',
  };

  // The second occurrence of BpFSTQ5eQJd8x1t06THJsBy6mU (MacBook section) should use image3.gif
  var MACBOOK_PATH = '/assets/projects/shine/image3.gif';

  // Text replacements
  var TEXT_MAP = [
    ['Radiant skincare branding', 'Shine Skincare Branding'],
    ['Radiant skincare is offering a user-centric, ad-free platform.', 'High quality cosmetics brand created for independent and brave women who take care of their skin health. Brand mission is to help every woman be confident about her unique beauty and SHINE from inside.'],
    ["We aimed to bring Vero\u2019s vision of authentic social interaction to life by focusing on seamless design and user privacy.", 'High quality cosmetics brand created for independent and brave women who take care of their skin health. Brand mission is to help every woman be confident about her unique beauty and SHINE from inside.'],
    ["This project reinforced the importance of building user-centered features that offer value beyond aesthetics, especially in social networking. The app\u2019s launch exceeded initial user growth targets, and the client received positive feedback on the app\u2019s intuitive design and ad-free experience.", ''],
    ['Vero Labs Inc.', 'Shine Skincare'],
    ['6 months', '2 weeks'],
    ['Nov 13, 2024', 'Jun 22, 2024'],
    ['John Taylor', 'The Brandle Team'],
    ['Member of the team', 'Design Studio'],
    ['Designing an ad-free experience meant creating engaging content flows without traditional ads. We achieved this by focusing on rich, visual content and user-driven discovery options.', 'As the main concept for this package design we decided to create the minimalistic illustration of a smiling woman face. Together with the vibrant colors package design should cause a feeling of happiness, joy and satisfaction that reflects the main brand mission. SHINE...'],
    ['One challenge was ensuring privacy controls while maintaining an easy-to-use interface. Our team developed an accessible settings menu that lets users control visibility without overwhelming them.', ''],
    ['User experience focus', ''],
  ];

  // Track which BpFSTQ images we've seen (to differentiate hero vs MacBook)
  var bpImageCount = 0;

  function isProjectPage() {
    var path = window.location.pathname;
    var target = '/projects/' + SLUG;
    var idx = path.indexOf(target);
    if (idx === -1) return false;
    // Ensure exact match — next char must be end-of-string, '/', or '?'
    var next = path.charAt(idx + target.length);
    return next === '' || next === '/' || next === '?';
  }

  // Process a single image element
  function processImage(img) {
    if (!img || img.dataset.shineProcessed) return;
    // Skip images inside "Latest Projects" card links to OTHER projects
    var parentLink = img.closest('a');
    if (parentLink) {
      var h = parentLink.getAttribute('href') || '';
      if (h.indexOf('vero-app') !== -1 || h.indexOf('stoyo-branding') !== -1 ||
          h.indexOf('branding-copy') !== -1) return;
    }
    var src = img.getAttribute('src') || '';
    var origSrc = img.getAttribute('data-framer-original-sizes') ? src : src;

    // Check srcset too
    var srcset = img.getAttribute('srcset') || '';
    var combined = src + ' ' + srcset;

    // Special handling: BpFSTQ5eQJd8x1t06THJsBy6mU appears twice
    // First = hero bg (bg.gif), Second = MacBook section (image3.gif)
    if (combined.indexOf('BpFSTQ5eQJd8x1t06THJsBy6mU') !== -1 ||
        combined.indexOf('Sl4ev11cuh935MExPXoGtMehHI') !== -1) {
      bpImageCount++;
      if (bpImageCount <= 1) {
        img.src = '/assets/projects/shine/bg.gif';
      } else {
        img.src = MACBOOK_PATH;
      }
      img.srcset = '';
      img.removeAttribute('srcset');
      img.dataset.shineProcessed = '1';
      return;
    }

    // YouTube thumbnail
    if (combined.indexOf('ytimg.com') !== -1 || combined.indexOf('youtube') !== -1) {
      img.src = IMAGE5_PATH;
      img.srcset = '';
      img.removeAttribute('srcset');
      img.dataset.shineProcessed = '1';
      return;
    }

    // Standard image mapping
    for (var key in IMAGE_MAP) {
      if (combined.indexOf(key) !== -1) {
        img.src = IMAGE_MAP[key];
        img.srcset = '';
        img.removeAttribute('srcset');
        img.dataset.shineProcessed = '1';
        return;
      }
    }
  }

  // Process all images currently in DOM
  function processAllImages() {
    bpImageCount = 0;
    document.querySelectorAll('img').forEach(processImage);
  }

  // Replace YouTube embed (iframe or custom Framer component)
  function replaceYouTube() {
    // Replace iframes
    document.querySelectorAll('iframe').forEach(function(iframe) {
      var src = iframe.getAttribute('src') || '';
      if (src.indexOf('youtube') !== -1) {
        var img = document.createElement('img');
        img.src = IMAGE5_PATH;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = 'inherit';
        img.dataset.shineProcessed = '1';
        iframe.parentNode.replaceChild(img, iframe);
      }
    });

    // Find the Framer YouTube component by its data attributes or structure
    // The YouTube component often has a click-to-play overlay with a thumbnail
    document.querySelectorAll('[data-framer-name="Content"] > div').forEach(function(el) {
      // Look for the YouTube wrapper - it typically has a cursor:pointer and contains a play button
      var hasCursor = el.style.cursor === 'pointer' || getComputedStyle(el).cursor === 'pointer';
      var hasPlay = el.querySelector('button') || el.querySelector('[aria-label="Play"]');
      if (hasCursor && hasPlay) {
        // This is the YouTube player wrapper
        var existingImg = el.querySelector('img');
        if (existingImg && !existingImg.src.includes('image5')) {
          existingImg.src = IMAGE5_PATH;
          existingImg.srcset = '';
          existingImg.removeAttribute('srcset');
          existingImg.dataset.shineProcessed = '1';
        }
        // Hide play button
        var btn = el.querySelector('button');
        if (btn) btn.style.display = 'none';
      }
    });

    // Also hide any standalone play buttons near the video area
    document.querySelectorAll('button').forEach(function(btn) {
      var text = btn.textContent.trim();
      if (text === 'Play' || btn.getAttribute('aria-label') === 'Play') {
        btn.style.display = 'none';
      }
    });
  }

  // Replace text content
  function replaceText() {
    var walker = document.createTreeWalker(
      document.body, NodeFilter.SHOW_TEXT, null, false
    );
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

  // Replace background images in style attributes
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

  // ---- DISABLE FRAMER SCROLL ANIMATIONS on replaced-image containers ----
  // Framer Motion continuously resets inline opacity/transform on scroll.
  // We neutralize this by watching for style mutations and immediately reverting.
  var watchedContainers = [];

  function lockContainer(el) {
    if (el._shineLocked) return;
    el._shineLocked = true;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('transform', 'none', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('will-change', 'auto', 'important');
    watchedContainers.push(el);

    // Observe style attribute changes and immediately revert
    var mo = new MutationObserver(function(muts) {
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].attributeName === 'style') {
          var s = getComputedStyle(el);
          if (parseFloat(s.opacity) < 0.5 || s.visibility === 'hidden') {
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
    // Lock every ancestor of every replaced image
    document.querySelectorAll('img[data-shine-processed]').forEach(function(img) {
      var el = img.parentElement;
      while (el && el !== document.body) {
        var s = getComputedStyle(el);
        if (s.willChange === 'transform' || s.opacity === '0' || parseFloat(s.opacity) < 0.5) {
          lockContainer(el);
        }
        el = el.parentElement;
      }
    });

    // Inject CSS rule for known animation wrapper classes
    if (!document.getElementById('shine-force-css')) {
      var style = document.createElement('style');
      style.id = 'shine-force-css';
      // Mark locked containers with a data attribute so CSS can target them
      watchedContainers.forEach(function(c) { c.setAttribute('data-shine-locked', ''); });
      style.textContent =
        '[data-shine-locked] { opacity: 1 !important; transform: none !important; visibility: visible !important; will-change: auto !important; }';
      document.head.appendChild(style);
    } else {
      // Update: mark any new locked containers
      watchedContainers.forEach(function(c) { c.setAttribute('data-shine-locked', ''); });
    }
  }

  // Remove the "Web design" category pill from the hero
  function removeWebDesignPill() {
    // Strategy 1: Find text nodes with "Web design" and hide their pill container
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (node = walker.nextNode()) {
      var t = node.textContent.trim().toLowerCase();
      if (t === 'web design') {
        var el = node.parentElement;
        // Walk up to find the pill container (border-radius >= 20px)
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

    // Strategy 2: Also target by Framer component class patterns
    document.querySelectorAll('.framer-cktl4p-container, .framer-12wifwf-container, .framer-tb387f-container').forEach(function(container) {
      var text = container.textContent.trim().toLowerCase();
      if (text === 'web design') {
        container.style.setProperty('display', 'none', 'important');
        // Also hide parent pill wrapper
        if (container.parentElement) {
          container.parentElement.style.setProperty('display', 'none', 'important');
        }
      }
    });

    // Strategy 3: Find by data-framer-name attribute or exact p text
    document.querySelectorAll('p').forEach(function(p) {
      var text = p.textContent.trim();
      if (text === 'Web design' || text === 'WEB DESIGN' || text.toLowerCase() === 'web design') {
        // Find enclosing pill (walk up max 6 levels)
        var el = p;
        for (var i = 0; i < 6; i++) {
          el = el.parentElement;
          if (!el) break;
          var br = parseInt(getComputedStyle(el).borderRadius);
          var w = el.getBoundingClientRect().width;
          // Pill: has border-radius and is smallish width
          if ((br >= 20 && w < 200) || el.className.indexOf('container') !== -1) {
            el.style.setProperty('display', 'none', 'important');
            break;
          }
        }
      }
    });
  }

  // Hide the "Visit website" CTA below the hero
  function hideVisitWebsiteCTA() {
    document.querySelectorAll('a, button').forEach(function(el) {
      var text = el.textContent.trim().toLowerCase();
      if (text === 'visit website' || text === 'visit site') {
        // Hide the CTA and its container
        var container = el.closest('[data-framer-name]') || el.parentElement;
        if (container) {
          container.style.setProperty('display', 'none', 'important');
        } else {
          el.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }

  // Full pass: process everything
  function applyOverrides() {
    if (!isProjectPage()) return;
    processAllImages();
    replaceText();
    replaceYouTube();
    replaceBackgroundImages();
    forceShowContainers();
    hideVisitWebsiteCTA();
    removeWebDesignPill();
  }

  // ---- INSTANT MUTATION OBSERVER ----
  // Catches images the MOMENT they're added to the DOM (no delay)
  var observer = new MutationObserver(function(mutations) {
    if (!isProjectPage()) return;
    var needsTextPass = false;
    var needsYouTubePass = false;

    for (var i = 0; i < mutations.length; i++) {
      var added = mutations[i].addedNodes;
      for (var j = 0; j < added.length; j++) {
        var node = added[j];
        if (node.nodeType !== 1) continue;

        // Process img elements directly
        if (node.tagName === 'IMG') {
          processImage(node);
        }

        // Process img elements inside added containers
        var imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
        for (var k = 0; k < imgs.length; k++) {
          processImage(imgs[k]);
        }

        // Check for iframes (YouTube)
        if (node.tagName === 'IFRAME' || (node.querySelectorAll && node.querySelectorAll('iframe').length > 0)) {
          needsYouTubePass = true;
        }

        // Check for text nodes
        if (node.childNodes && node.childNodes.length > 0) {
          needsTextPass = true;
        }
      }

      // Also catch attribute changes on img (React may update src after mount)
      if (mutations[i].type === 'attributes') {
        var target = mutations[i].target;
        if (target.tagName === 'IMG') {
          target.dataset.shineProcessed = ''; // Reset so it gets re-processed
          processImage(target);
        }
        // Re-lock containers if Framer Motion changes their style
        if (mutations[i].attributeName === 'style' && target._shineLocked) {
          var cs = getComputedStyle(target);
          if (parseFloat(cs.opacity) < 0.5) {
            target.style.setProperty('opacity', '1', 'important');
            target.style.setProperty('transform', 'none', 'important');
            target.style.setProperty('visibility', 'visible', 'important');
          }
        }
      }
    }

    if (needsYouTubePass) {
      setTimeout(replaceYouTube, 100);
    }
    if (needsTextPass) {
      setTimeout(replaceText, 100);
    }
  });

  // Start observing immediately
  function startObserver() {
    var target = document.body || document.documentElement;
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'srcset', 'style']
    });
  }

  // ---- SHARED img.src INTERCEPTOR ----
  // This is the ONLY script that patches HTMLImageElement.prototype.src.
  // Other project scripts register handlers via window.__projectOverrides.
  window.__projectOverrides = window.__projectOverrides || [];
  var origSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (origSrcDescriptor && origSrcDescriptor.set) {
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      get: origSrcDescriptor.get,
      set: function(val) {
        if (typeof val === 'string') {
          // Run Shine interceptor
          if (isProjectPage()) {
            if (val.indexOf('ytimg.com') !== -1) {
              val = IMAGE5_PATH;
              this.dataset.shineProcessed = '1';
            } else if (val.indexOf('BpFSTQ5eQJd8x1t06THJsBy6mU') !== -1 ||
                val.indexOf('Sl4ev11cuh935MExPXoGtMehHI') !== -1) {
              bpImageCount++;
              val = bpImageCount <= 1 ? '/assets/projects/shine/bg.gif' : MACBOOK_PATH;
              this.dataset.shineProcessed = '1';
            } else {
              for (var key in IMAGE_MAP) {
                if (val.indexOf(key) !== -1) {
                  val = IMAGE_MAP[key];
                  this.dataset.shineProcessed = '1';
                  break;
                }
              }
            }
          }
          // Run all registered project overrides (Apex, Vero, etc.)
          var handlers = window.__projectOverrides;
          for (var h = 0; h < handlers.length; h++) {
            val = handlers[h](this, val);
          }
        }
        origSrcDescriptor.set.call(this, val);
      },
      configurable: true
    });
  }

  // ---- BOOTSTRAP ----
  if (document.body) {
    startObserver();
    // Immediate pass for any content already in the DOM
    applyOverrides();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      startObserver();
      applyOverrides();
    });
  }

  // Safety net: periodic re-check for a few seconds after load
  var checkCount = 0;
  var checker = setInterval(function() {
    applyOverrides();
    checkCount++;
    if (checkCount > 15) clearInterval(checker);
  }, 500);

  // Handle SPA navigation
  var lastUrl = window.location.href;
  setInterval(function() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      bpImageCount = 0;
      setTimeout(applyOverrides, 300);
      setTimeout(applyOverrides, 1000);
      setTimeout(applyOverrides, 3000);
    }
  }, 200);

})();
