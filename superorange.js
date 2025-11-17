// This is the script that will actually make the changes to the product page
// based on the flag value that is set in the growthbook config
(function () {
  // Hide images until we decide what to keep
  try { document.documentElement.classList.add('gb-filter-pending'); } catch (e) { }
  function shouldShowImageByAlt(img, flagValue) {
    if (!flagValue || flagValue === 'none') return true; // Show all if no flag value or flag value is "none"
    var alt = (img.getAttribute('alt') || '').trim();
    return alt.indexOf('kai_' + flagValue) !== -1; // Check if alt text contains flag value
  }

  // Prune entire gallery slides/thumbnails (Dawn-style) so layout/counts match
  function pruneDawnGalleries(flagValue) {
    var galleryUl = document.querySelector('ul[id^="Slider-Gallery-"]');
    var thumbUl = document.querySelector('ul[id^="Slider-Thumbnails-"]');
    var productRoot = document.querySelector('[data-product]') || document.querySelector('.product');
    var slidesRemoved = 0;
    var kept = 0;
    if (galleryUl) {
      var items = Array.prototype.slice.call(galleryUl.children);
      items.forEach(function (li) {
        var img = li.querySelector('img');
        if (!img) return;
        // Check if image is within a .product-media-container with Image zoom button
        var container = img.closest('.product-media-container');
        if (!container) return;
        // Skip if container or any ancestor is #QuickView
        if (container.closest('#QuickView')) return;
        var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
        if (zoomButtons.length === 0) return;
        var shouldKeep = shouldShowImageByAlt(img, flagValue);
        if (shouldKeep) {
          kept++;
          return;
        }
        li.parentNode && li.parentNode.removeChild(li);
        slidesRemoved++;
      });
    }
    if (thumbUl) {
      var thumbs = Array.prototype.slice.call(thumbUl.children);
      thumbs.forEach(function (li) {
        var img = li.querySelector('img');
        if (!img) return;
        // Check if image is within a .product-media-container with Image zoom button
        var container = img.closest('.product-media-container');
        if (!container) return;
        // Skip if container or any ancestor is #QuickView
        if (container.closest('#QuickView')) return;
        var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
        if (zoomButtons.length === 0) return;
        var shouldKeep = shouldShowImageByAlt(img, flagValue);
        if (shouldKeep) return;
        li.parentNode && li.parentNode.removeChild(li);
      });
    }
    // Update media count indicators if present
    try {
      var countEls = document.querySelectorAll('[id^="MediaCount"]');
      countEls.forEach(function (el) { el.textContent = kept.toString(); });
      if (productRoot) {
        productRoot.setAttribute('data-media-count', kept.toString());
      }
    } catch (e) { }
    if (slidesRemoved || kept) {
      console.log('[GB] pruneDawnGalleries: kept', kept, 'removed', slidesRemoved);
      // Notify layout components
      try { window.dispatchEvent(new Event('resize')); } catch (e) { }
    }
  }

  function removeElementContainerForImage(img) {
    if (img && img.parentNode) {
      img.parentNode.removeChild(img);
    }
  }

  // Collect indices of images that should be removed based on flag value
  function collectImageIndicesToRemove(flagValue) {
    var indicesToRemove = [];
    // Find all .product-media-container that contain a button with aria-label="Image zoom"
    // Exclude containers inside #QuickView (at any nesting level)
    // Select divs within .product-media-container where x-ref is not 'thumbnail'
    var productMediaContainers = document.querySelectorAll('.product-media-container div:not([x-ref="thumbnail"])');
    for (var i = 0; i < productMediaContainers.length; i++) {
      var container = productMediaContainers[i];
      // Skip if container or any ancestor is #QuickView
      if (container.closest('#QuickView')) {
        continue;
      }
      var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
      if (zoomButtons.length > 0) {
        // Collect images and their indices
        var imgs = container.querySelectorAll('img');
        for (var j = 0; j < imgs.length; j++) {
          var shouldKeep = shouldShowImageByAlt(imgs[j], flagValue);
          if (!shouldKeep) {
            indicesToRemove.push(j);
          }
        }
        // Only process the first container that matches
        break;
      }
    }
    return indicesToRemove;
  }

  // Placeholder: Remove images from thumbnails by index
  // TODO: Add CSS selector for thumbnails
  function removeFromThumbnails(indicesToRemove) {
    // Select thumbnails within .splide-image elements
    var thumbnails = document.querySelectorAll(".splide-image .media-thumbnail");
    if (!thumbnails || thumbnails.length === 0) {
      console.log('[GB] removeFromThumbnails: no thumbnails found');
      return;
    }
    // TODO: Implement removal logic based on indices
    // Remove items in reverse order to maintain correct indices
    indicesToRemove.sort(function(a, b) { return b - a; });
    indicesToRemove.forEach(function(index) {
      if (thumbnails[index] && thumbnails[index].parentNode) {
        thumbnails[index].parentNode.removeChild(thumbnails[index]);
      }
    });
    console.log('[GB] removeFromThumbnails: removed', indicesToRemove.length, 'items');
  }

  // Placeholder: Remove images from main product gallery by index
  // TODO: Add CSS selector for main product gallery
  function removeFromMainGallery(indicesToRemove) {
    // TODO: Replace with actual CSS selector for main product gallery
    var gallerySelector = ''; // TODO: Add CSS selector for main product gallery
    if (!gallerySelector) {
      console.log('[GB] removeFromMainGallery: selector not yet configured');
      return;
    }
    var galleryItems = document.querySelectorAll(gallerySelector);
    // TODO: Implement removal logic based on indices
    // Remove items in reverse order to maintain correct indices
    indicesToRemove.sort(function(a, b) { return b - a; });
    indicesToRemove.forEach(function(index) {
      if (galleryItems[index] && galleryItems[index].parentNode) {
        galleryItems[index].parentNode.removeChild(galleryItems[index]);
      }
    });
    console.log('[GB] removeFromMainGallery: removed', indicesToRemove.length, 'items');
  }

  // Placeholder: Remove images from zoomed in view by index
  // TODO: Add CSS selector for zoomed in view
  function removeFromZoomedView(indicesToRemove) {
    // TODO: Replace with actual CSS selector for zoomed in view
    var zoomedSelector = ''; // TODO: Add CSS selector for zoomed in view
    if (!zoomedSelector) {
      console.log('[GB] removeFromZoomedView: selector not yet configured');
      return;
    }
    var zoomedItems = document.querySelectorAll(zoomedSelector);
    // TODO: Implement removal logic based on indices
    // Remove items in reverse order to maintain correct indices
    indicesToRemove.sort(function(a, b) { return b - a; });
    indicesToRemove.forEach(function(index) {
      if (zoomedItems[index] && zoomedItems[index].parentNode) {
        zoomedItems[index].parentNode.removeChild(zoomedItems[index]);
      }
    });
    console.log('[GB] removeFromZoomedView: removed', indicesToRemove.length, 'items');
  }

  function filterProductImages(flagValue) {
    // Collect indices of images to remove first
    var indicesToRemove = collectImageIndicesToRemove(flagValue);
    
    if (indicesToRemove.length === 0) {
      console.log('[GB] filterProductImages: no images to remove');
      try { document.documentElement.classList.remove('gb-filter-pending'); } catch (e) { }
      return;
    }

    // Remove from all three places
    removeFromThumbnails(indicesToRemove);
    removeFromMainGallery(indicesToRemove);
    removeFromZoomedView(indicesToRemove);

    var kept = 0, hidden = indicesToRemove.length;
    // Find all .product-media-container that contain a button with aria-label="Image zoom"
    // Exclude containers inside #QuickView (at any nesting level)
    var productMediaContainers = document.querySelectorAll('.product-media-container');
    for (var i = 0; i < productMediaContainers.length; i++) {
      var container = productMediaContainers[i];
      // Skip if container or any ancestor is #QuickView
      if (container.closest('#QuickView')) {
        continue;
      }
      var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
      if (zoomButtons.length > 0) {
        var imgs = container.querySelectorAll('img');
        kept = imgs.length - hidden;
        break;
      }
    }
    
    console.log('[GB] filterProductImages: kept', kept, 'hidden', hidden, 'filter value:', flagValue);
    try { document.documentElement.classList.remove('gb-filter-pending'); } catch (e) { }
  }

  function observeDynamicImages(flagValue) {
    var observer = new MutationObserver(function (mutations) {
      var touched = false;
      mutations.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1) {
            if (n.tagName === 'IMG') {
              // Check if image is within a .product-media-container with Image zoom button
              var container = n.closest('.product-media-container');
              if (container) {
                // Skip if container or any ancestor is #QuickView
                if (container.closest('#QuickView')) return;
                var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
                if (zoomButtons.length > 0) {
                  touched = true;
                  var shouldKeep = shouldShowImageByAlt(n, flagValue);
                  if (!shouldKeep) removeElementContainerForImage(n);
                }
              }
            } else {
              var imgs = n.querySelectorAll && n.querySelectorAll('img');
              if (imgs && imgs.length) {
                imgs.forEach(function (img) {
                  // Check if image is within a .product-media-container with Image zoom button
                  var container = img.closest('.product-media-container');
                  if (container) {
                    // Skip if container or any ancestor is #QuickView
                    if (container.closest('#QuickView')) return;
                    var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
                    if (zoomButtons.length > 0) {
                      touched = true;
                      var shouldKeep = shouldShowImageByAlt(img, flagValue);
                      if (!shouldKeep) removeElementContainerForImage(img);
                    }
                  }
                });
              }
            }
          }
        });
      });
      if (touched) {
        console.log('[GB] observer: applied filter to new images');
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return observer;
  }

  // Helper function to check if we're on a product page
  function isProductPage() {
    // Check for product page indicators
    if (document.querySelector('[data-product]') || document.querySelector('.product')) {
      return true;
    }
    // Check URL path for product page
    if (window.location.pathname && window.location.pathname.indexOf('/products/') !== -1) {
      return true;
    }
    return false;
  }

  // Helper function to check if any images contain "kai_" in their alt text
  function hasAnyKaiImages() {
    // Find all .product-media-container that contain a button with aria-label="Image zoom"
    // Exclude containers inside #QuickView (at any nesting level)
    var productMediaContainers = document.querySelectorAll('.product-media-container');
    for (var i = 0; i < productMediaContainers.length; i++) {
      var container = productMediaContainers[i];
      // Skip if container or any ancestor is #QuickView
      if (container.closest('#QuickView')) {
        continue;
      }
      var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
      if (zoomButtons.length > 0) {
        // Check images within this container
        var imgs = container.querySelectorAll('img');
        for (var j = 0; j < imgs.length; j++) {
          var alt = (imgs[j].getAttribute('alt') || '').trim();
          if (alt.indexOf('kai_') !== -1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Flag handlers - moved to root level
  // Handler for 'image-format' flag
  function handleImageFormat(value) {
    console.log("[GB] 'image-format' => value:", value);
    
    // Only apply filtering on product pages
    if (!isProductPage()) {
      console.log('Skipping filter: not on a product page');
      try { document.documentElement.classList.remove('gb-filter-pending'); } catch (e) { }
      return;
    }
    
    // Don't filter if flag value is "none" or if no images contain "kai_"
    if (value === 'none' || !hasAnyKaiImages()) {
      console.log('Skipping filter: flag value is "none" or no images contain "kai_"');
      try { document.documentElement.classList.remove('gb-filter-pending'); } catch (e) { }
      return;
    }
    
    if (value) {
      // Find all .product-media-container that contain a button with aria-label="Image zoom"
      // Exclude containers inside #QuickView (at any nesting level)
      var productMediaContainers = document.querySelectorAll('.product-media-container');
      for (var i = 0; i < productMediaContainers.length; i++) {
        var container = productMediaContainers[i];
        // Skip if container or any ancestor is #QuickView
        if (container.closest('#QuickView')) {
          continue;
        }
        var zoomButtons = container.querySelectorAll('button[aria-label="Image zoom"]');
        if (zoomButtons.length > 0) {
          // Resize images within this container
          var images = container.querySelectorAll('img');
          images.forEach(function(img) {
            img.style.setProperty("height", "533px", "important");
          });
          console.log('Resized', images.length, 'images in product-media-container with Image zoom button(s)');
        }
      }
      console.log('Filtering images: showing only images with alt text containing "' + value + '"');
    } else {
      console.log('No filter value: showing all images');
    }
    // Prune high-level gallery slides first so layout counts are correct
    pruneDawnGalleries(value);
    filterProductImages(value);
    observeDynamicImages(value);
  }

  function handleCartLabel(value) {
    console.log("[GB] 'cart-button-text' => value:", value);
    // Targeted replacement: Only in buttons (including nested ones) for text content and attributes
    // This scopes the traversal to button elements only, avoiding replacement in other divs/text
    // Usage: replaceInButtons('cart', 'bag');
    const regex = new RegExp('cart', 'gi');

    // Combined: Replace in text nodes and attributes in a single pass
    // Union multiple queries into a single array
    const buttonSelectors = ['button', '.add_to_cart_button'];
    const buttons = Array.from(new Set(
      buttonSelectors.flatMap(selector => Array.from(document.querySelectorAll(selector)))
    ));
    buttons.forEach(button => {
      // Part 1: Replace in text nodes *inside* buttons only
      const walker = document.createTreeWalker(
        button,
        NodeFilter.SHOW_TEXT,
        { acceptNode: (node) => node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
      );
      let node;
      while (node = walker.nextNode()) {
        const newText = node.textContent.replace(regex, value);
        if (newText !== node.textContent) node.textContent = newText;
      }
      
      // Part 2: Replace in button attributes (title, etc.)
      ['title', 'alt', 'aria-label', 'placeholder'].forEach(attr => {
        if (button.hasAttribute(attr)) {
          const current = button.getAttribute(attr);
          const updated = current.replace(regex, value);
          if (updated !== current) button.setAttribute(attr, updated);
        }
      });
    });

  // Change the cart icon to the bag icon
    switch (value) {
      case 'bag':
        const span = document.querySelector('#cart-icon span');
        if (span) {
          span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 18 20" fill="none" style="fill: none;">
              <path d="M3.97589 1.70605L1.48779 5.02351V16.6346C1.48779 17.0745 1.66255 17.4965 1.97362 17.8075C2.2847 18.1186 2.7066 18.2934 3.14652 18.2934H14.7576C15.1976 18.2934 15.6195 18.1186 15.9305 17.8075C16.2416 17.4965 16.4164 17.0745 16.4164 16.6346V5.02351L13.9283 1.70605H3.97589Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M1.48779 5.02344H16.4164" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M12.2697 8.34082C12.2697 9.22067 11.9202 10.0645 11.298 10.6866C10.6759 11.3088 9.83207 11.6583 8.95223 11.6583C8.07238 11.6583 7.22857 11.3088 6.60643 10.6866C5.98428 10.0645 5.63477 9.22067 5.63477 8.34082" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>`;
        }
    }
  }

  function handleHideAnnouncementBanner(value) {
    console.log("[GB] 'hide-announcement-banner' => value:", value);
    if (value) document.querySelector('#x-announcement').style.display = 'none';
  }



  // Handler for other flags - add more handlers here as needed
  function handleDefault(flagKey, value) {
    console.log("[GB] Unhandled flag '" + flagKey + "' => value:", value);
    // Default handler for flags that don't have specific handlers
  }

  function handleMobileLogoWidth(value) {
    console.log("[GB] 'mobile-logo-width' => value:", value);
    document.querySelector('.logo-name a')?.classList.replace('w-[140px]', `w-[${value}px]`);
  }

  function handleSmallImageTiles(value) {
    if (value) {
      document.querySelectorAll('.x-thumbnail').forEach(e => {
        e.parentNode?.classList.add('justify-center');
        e.parentNode?.classList.remove('w-fit');
      });
      document.querySelectorAll('.x-thumbnail button').forEach(e => {
        e.replaceChildren(); const div = document.createElement('div');
        div.style.width = '10px';
        div.style.height = '10px';
        div.style.backgroundColor = 'gray';
        div.style.borderRadius = '2px';
        e.appendChild(div);
        e.classList.remove('h-full'); e.classList.remove('w-full'); e.parentNode.classList.remove('min-w-[50px]')
      });
    }
  }

  function handleProductTitleFontSize(value) {
    console.log("[GB] 'product-title-font-size' => value:", value);
    if (document.querySelector('h1.product-title'))document.querySelector('h1.product-title').style.fontSize = value;
  }

  function evaluateFlag(context) {
    var gb = window._growthbook;
    if (!gb) {
      console.log('[GB] evaluateFlag called but _growthbook is undefined. Context:', context);
      return;
    }

    var doEval = function () {
      try {
        var attrs = (gb.getAttributes ? gb.getAttributes() : (window.GROWTHBOOK_CONFIG && window.GROWTHBOOK_CONFIG.attributes)) || {};
        console.log('[GB] Attributes:', attrs);
        var featureKeys = ['image-format', 'hide-announcement-banner', 'mobile-logo-width', 'small-image-tiles', 'product-title-font-size', 'cart-label'];

        console.log('[GB] Feature keys:', featureKeys);

        // Iterate over all flags and process each
        featureKeys.forEach(function (flagKey) {
          var value = gb.getFeatureValue(flagKey, null);
          console.log("[GB] Processing flag '" + flagKey + "' => value:", value);

          // Switch case to route to appropriate handler
          switch (flagKey) {
            case 'image-format':
              handleImageFormat(value);
              break;
            // Add more cases here for additional flags
            // case 'another-flag':
            //   handleAnotherFlag(value);
            //   break;
            case 'hide-announcement-banner':
              handleHideAnnouncementBanner(value);
              break;
            case 'mobile-logo-width':
              handleMobileLogoWidth(value);
              break;
            case 'small-image-tiles':
              handleSmallImageTiles(value);
              break;
            case 'product-title-font-size':
              handleProductTitleFontSize(value);
              break;
            case 'cart-label':
              handleCartLabel(value);
              break;
            default:
              handleDefault(flagKey, value);
              break;
          }
        });
      } catch (e) {
        console.log('[GB] Error reading attributes/features', e);
      }
    };
    if (gb.ready && typeof gb.ready.then === 'function') {
      console.log('[GB] Waiting for ready promise… Context:', context);
      gb.ready.then(doEval).catch(function (e) {
        console.log('[GB] ready promise rejected, evaluating anyway', e);
        doEval();
      });
    } else {
      console.log('[GB] No ready promise; evaluating immediately. Context:', context);
      doEval();
    }
  }

  // Initial attempt shortly after script tag
  if (window._growthbook) {
    console.log('[GB] _growthbook present at boot');
  }
  evaluateFlag('boot');

  // Listen for GrowthBook custom ready event if emitted
  window.addEventListener('growthbook:ready', function () {
    console.log('[GB] growthbook:ready event received');
    evaluateFlag('event:ready');
  });

  window.addEventListener('DOMContentLoaded', function () {
    console.log('[GB] DOMContentLoaded event received');
    evaluateFlag('DOMContentLoaded');
  });

  window.addEventListener('shopify:section:load', function () {
    console.log('[GB] shopify:section:load event received');
    evaluateFlag('shopify:section:load');
  });

  // Listen to any user interaction events
  var userInteractionTimeout = null;
  var userInteractionEvents = ['click', 'keydown', 'keyup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'focus', 'input'];
  var handleUserInteraction = function (eventType) {
    clearTimeout(userInteractionTimeout);
    userInteractionTimeout = setTimeout(function () {
      console.log('[GB] User interaction detected:', eventType);
      setTimeout(function () { evaluateFlag('user-interaction:' + eventType); }, 1000);
    }, 100); // Debounce: wait 100ms after last interaction
  };
  userInteractionEvents.forEach(function (eventType) {
    document.addEventListener(eventType, function (e) {
      handleUserInteraction(eventType);
    }, { passive: true, capture: true });
  });

  // Listen for DOM changes and re-evaluate flags
  var domChangeTimeout = null;
  var domChangeObserver = new MutationObserver(function (mutations) {
    var shouldReevaluate = false;
    
    mutations.forEach(function (mutation) {
      // Check if nodes were added, removed, or attributes changed
      if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0 || mutation.attributeName) {
        shouldReevaluate = true;
      }
    });
    
    if (shouldReevaluate) {
      // Debounce: wait for DOM changes to settle before re-evaluating
      clearTimeout(domChangeTimeout);
      domChangeTimeout = setTimeout(function () {
        console.log('[GB] DOM changes detected, re-evaluating flags');
        // evaluateFlag('dom-change');
      }, 300); // Wait 300ms after last change
    }
  });

  // Start observing DOM changes
  domChangeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: false
  });

  console.log('[GB] DOM change observer initialized');

})();

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-D4T9P5QTFH');

// Event delegation for button clicks
document.addEventListener('click', function(event) {
  // Check if clicked element is a button or has role="button"
  const button = event.target.closest('button, [role="button"]');
  if (!button) return; // Exit if not a button

  // Extract aria-label
  const ariaLabel = button.getAttribute('aria-label') || button.textContent.replaceAll("\n", "").trim();
  if (!ariaLabel) return; // Exit if no aria-label

  // Send GA4 event
  gtag('event', `button_click_${ariaLabel}`, {
    button_label: ariaLabel,  // Custom parameter (register as custom dimension in GA4 if needed)
    event_category: 'UI Interaction',  // Optional: For legacy UA compatibility
    event_label: ariaLabel    // Optional: For legacy UA
  });

  console.log(`Button clicked: ${ariaLabel}`);  // Optional: For debugging
}, false);
