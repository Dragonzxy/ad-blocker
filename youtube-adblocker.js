// // YouTube Ad Blocker - Aggressive approach
// (function() {
//   'use strict';

//   // Block ad requests by intercepting fetch and XMLHttpRequest
//   const originalFetch = window.fetch;
//   window.fetch = function(...args) {
//     const url = args[0];
//     if (typeof url === 'string' && (
//       url.includes('/api/stats/ads') ||
//       url.includes('/pagead/') ||
//       url.includes('/get_midroll_info') ||
//       url.includes('doubleclick.net') ||
//       url.includes('googlesyndication.com')
//     )) {
//       return Promise.reject(new Error('Ad blocked'));
//     }
//     return originalFetch.apply(this, args);
//   };

//   const originalOpen = XMLHttpRequest.prototype.open;
//   XMLHttpRequest.prototype.open = function(method, url) {
//     if (url.includes('/api/stats/ads') ||
//         url.includes('/pagead/') ||
//         url.includes('/get_midroll_info')) {
//       return;
//     }
//     return originalOpen.apply(this, arguments);
//   };

//   // Speed up ads to make them pass quickly
//   function speedUpAd() {
//     const video = document.querySelector('video');
//     if (!video) return;

//     const ad = document.querySelector('.ad-showing');
//     if (ad && video) {
//       video.playbackRate = 16; // 16x speed
//       video.muted = true;
//       video.currentTime = video.duration - 0.1; // Skip to end
//     } else if (video.playbackRate !== 1) {
//       video.playbackRate = 1; // Normal speed for actual content
//       video.muted = false;
//     }
//   }

//   // Remove ad containers and overlays
//   function removeAdElements() {
//     const adSelectors = [
//       '.ytp-ad-overlay-container',
//       '.ytp-ad-text-overlay',
//       '.ytp-ad-player-overlay-instream-info',
//       '.ytp-ad-button-icon',
//       '.ytp-ad-overlay-close-button',
//       'ytd-display-ad-renderer',
//       'ytd-promoted-sparkles-web-renderer',
//       'ytd-ad-slot-renderer',
//       'ytd-in-feed-ad-layout-renderer',
//       'ytd-banner-promo-renderer',
//       'ytd-video-masthead-ad-v3-renderer',
//       'ytd-statement-banner-renderer',
//       '#masthead-ad',
//       '.ytd-rich-item-renderer[is-ad]',
//       'ytd-rich-section-renderer',
//       '.ytd-compact-promoted-video-renderer',
//       '.ytd-promoted-video-renderer'
//     ];

//     adSelectors.forEach(selector => {
//       document.querySelectorAll(selector).forEach(el => {
//         el.remove();
//       });
//     });
//   }

//   // Click skip button automatically
//   function clickSkipButton() {
//     const skipButton = document.querySelector(
//       '.ytp-ad-skip-button-modern, .ytp-ad-skip-button, .ytp-skip-ad-button'
//     );
//     if (skipButton) {
//       skipButton.click();
//     }
//   }

//   // Main observer for video player
//   function observePlayer() {
//     const player = document.querySelector('.html5-video-player');
//     if (!player) {
//       setTimeout(observePlayer, 500);
//       return;
//     }

//     // Observer for ad detection
//     const observer = new MutationObserver(() => {
//       speedUpAd();
//       clickSkipButton();
//       removeAdElements();
//     });

//     observer.observe(player, {
//       attributes: true,
//       attributeFilter: ['class'],
//       subtree: false
//     });

//     // Also observe body for sidebar ads
//     const bodyObserver = new MutationObserver(() => {
//       removeAdElements();
//     });

//     bodyObserver.observe(document.body, {
//       childList: true,
//       subtree: true
//     });
//   }

//   // Run immediately and periodically
//   function init() {
//     removeAdElements();
//     speedUpAd();
//     clickSkipButton();
//   }

//   // Start when DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       init();
//       observePlayer();
//     });
//   } else {
//     init();
//     observePlayer();
//   }

//   // Run periodically as backup
//   setInterval(init, 1000);

//   // Inject CSS to hide ads
//   const style = document.createElement('style');
//   style.textContent = `
//     /* Hide all ad containers */
//     .video-ads,
//     .ytp-ad-module,
//     .ytp-ad-overlay-container,
//     .ytp-ad-text-overlay,
//     .ytp-ad-player-overlay,
//     ytd-display-ad-renderer,
//     ytd-promoted-sparkles-web-renderer,
//     ytd-ad-slot-renderer,
//     ytd-in-feed-ad-layout-renderer,
//     ytd-banner-promo-renderer,
//     ytd-video-masthead-ad-v3-renderer,
//     ytd-statement-banner-renderer,
//     ytd-rich-section-renderer,
//     #masthead-ad,
//     .ytd-rich-item-renderer[is-ad],
//     .ytd-compact-promoted-video-renderer,
//     .ytd-promoted-video-renderer {
//       display: none !important;
//       visibility: hidden !important;
//       height: 0 !important;
//       min-height: 0 !important;
//       padding: 0 !important;
//       margin: 0 !important;
//     }

//     /* Hide ad announcement */
//     .ytp-ad-preview-container,
//     .ytp-ad-text,
//     .ytp-ad-skip-button-container {
//       display: none !important;
//     }
//   `;
//   document.head.appendChild(style);

//   console.log('YouTube Ad Blocker Active');
// })();





















(function() {
  'use strict';

  let isProcessingAd = false;
  let userPlaybackRate = 1;
  let lastNormalSpeed = 1;
  let originalPlaybackRateDescriptor = null;

  // Intercept localStorage to prevent YouTube from detecting modifications
  const originalSetItem = Storage.prototype.setItem;
  const originalGetItem = Storage.prototype.getItem;
  
  Storage.prototype.setItem = function(key, value) {
    if (key === 'yt-player-playback-rate' && isProcessingAd) {
      return; // Silently block during ad processing
    }
    return originalSetItem.apply(this, arguments);
  };

  function fixYouTubePlaybackRate() {
    try {
      const ytPlayerConfig = originalGetItem.call(localStorage, 'yt-player-playback-rate');
      
      if (ytPlayerConfig) {
        const config = JSON.parse(ytPlayerConfig);
        
        if (config.data && parseFloat(config.data) < 1) {
          config.data = "1";
          originalSetItem.call(localStorage, 'yt-player-playback-rate', JSON.stringify(config));
        }
      }
    } catch (e) {
      // Silent fail
    }
  }

  function monitorPlaybackSpeed() {
    const video = document.querySelector('video');
    const player = document.querySelector('.html5-video-player');
    
    if (!video || !player) return;

    if (!isProcessingAd && video.playbackRate !== userPlaybackRate) {
      userPlaybackRate = video.playbackRate;
      
      if (video.playbackRate >= 1) {
        lastNormalSpeed = video.playbackRate;
      }
      
      if (video.playbackRate < 1) {
        try {
          const config = {
            data: lastNormalSpeed.toString(),
            creation: Date.now()
          };
          originalSetItem.call(localStorage, 'yt-player-playback-rate', JSON.stringify(config));
        } catch (e) {}
      }
    }
  }

  function handleAd() {
    const video = document.querySelector('video');
    const player = document.querySelector('.html5-video-player');
    
    if (!video || !player) return;

    const isAdPlaying = player.classList.contains('ad-showing') || 
                        player.classList.contains('ad-interrupting');

    if (isAdPlaying) {
      if (!isProcessingAd) {
        isProcessingAd = true;
        
        // Store original descriptor if not already stored
        if (!originalPlaybackRateDescriptor) {
          originalPlaybackRateDescriptor = Object.getOwnPropertyDescriptor(
            HTMLMediaElement.prototype, 
            'playbackRate'
          );
        }
        
        // Override playbackRate property to hide speed from YouTube
        Object.defineProperty(video, 'playbackRate', {
          get: function() { 
            return userPlaybackRate; // Return normal speed to YouTube's detection
          },
          set: function(value) {
            // Ignore YouTube trying to slow us down during ads
            if (isProcessingAd && value < 1) {
              return;
            }
            // Actually set the speed (5x during ads, normal otherwise)
            if (originalPlaybackRateDescriptor && originalPlaybackRateDescriptor.set) {
              originalPlaybackRateDescriptor.set.call(this, isProcessingAd ? 5 : value);
            }
          },
          configurable: true
        });
        
        // Set actual playback rate to 5x
        if (originalPlaybackRateDescriptor && originalPlaybackRateDescriptor.set) {
          originalPlaybackRateDescriptor.set.call(video, 5);
        }
        
        video.muted = true;
      }
    } else {
      if (isProcessingAd) {
        isProcessingAd = false;
        
        // Restore normal playbackRate property
        if (originalPlaybackRateDescriptor) {
          Object.defineProperty(video, 'playbackRate', originalPlaybackRateDescriptor);
        }
        
        const restoreSpeed = userPlaybackRate < 1 ? lastNormalSpeed : userPlaybackRate;
        video.playbackRate = restoreSpeed;
        userPlaybackRate = restoreSpeed;
        
        video.muted = false;
      }
    }
  }

  function removeAdElements() {
    const adSelectors = [
      '.ytp-ad-overlay-container',
      '.ytp-ad-text-overlay',
      '.ytp-ad-player-overlay-instream-info',
      '.ytp-ad-image-overlay',
      'ytd-display-ad-renderer',
      'ytd-promoted-sparkles-web-renderer',
      'ytd-ad-slot-renderer',
      'ytd-in-feed-ad-layout-renderer',
      'ytd-banner-promo-renderer',
      'ytd-video-masthead-ad-v3-renderer',
      'ytd-statement-banner-renderer',
      '#masthead-ad',
      '.ytd-rich-item-renderer[is-ad]',
      'ytd-rich-section-renderer',
      '.ytd-compact-promoted-video-renderer',
      '.ytd-promoted-video-renderer',
      'ytd-action-companion-ad-renderer'
    ];

    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        adSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            el.style.display = 'none';
            el.remove();
          });
        });
      }, { timeout: 1000 });
    } else {
      adSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          el.style.display = 'none';
          el.remove();
        });
      });
    }
  }

  function clickSkipButton() {
    if (!isProcessingAd) return false;

    const skipSelectors = [
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button',
      '.ytp-skip-ad-button',
      'button.ytp-ad-skip-button',
      '.ytp-ad-skip-button-container button'
    ];

    for (const selector of skipSelectors) {
      try {
        const buttons = document.querySelectorAll(selector);
        
        for (const button of buttons) {
          const computedStyle = window.getComputedStyle(button);
          const isVisible = button.offsetParent !== null && 
                           computedStyle.display !== 'none' &&
                           computedStyle.visibility !== 'hidden';
          
          if (isVisible && !button.disabled) {
            button.click();
            return true;
          }
        }
      } catch (e) {
        // Silent fail
      }
    }
    
    return false;
  }

  function observePlayer() {
    const player = document.querySelector('.html5-video-player');
    if (!player) {
      setTimeout(observePlayer, 500);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          shouldCheck = true;
          break;
        }
      }
      
      if (shouldCheck) {
        handleAd();
        if (isProcessingAd) {
          clickSkipButton();
        }
      }
    });

    observer.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });

    let debounceTimer;
    const bodyObserver = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(removeAdElements, 500);
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    fixYouTubePlaybackRate();
    
    const video = document.querySelector('video');
    if (video) {
      video.playbackRate = 1;
    }
    
    handleAd();
    removeAdElements();
    if (isProcessingAd) {
      clickSkipButton();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      observePlayer();
    });
  } else {
    init();
    observePlayer();
  }

  // Navigation detection (YouTube SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(() => {
        fixYouTubePlaybackRate();
        const video = document.querySelector('video');
        if (video && video.playbackRate < 1) {
          video.playbackRate = lastNormalSpeed;
        }
      }, 500);
    }
  }).observe(document, { subtree: true, childList: true });

  // Check every 150ms - balance between responsiveness and stealth
  setInterval(() => {
    monitorPlaybackSpeed();
    handleAd();
    if (isProcessingAd) {
      clickSkipButton();
    }
  }, 150);

  setInterval(removeAdElements, 5000);

  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = `
    .ytp-ad-overlay-container,
    .ytp-ad-text-overlay,
    .ytp-ad-player-overlay-instream-info,
    .ytp-ad-image-overlay,
    ytd-display-ad-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-ad-slot-renderer,
    ytd-in-feed-ad-layout-renderer,
    ytd-banner-promo-renderer,
    ytd-video-masthead-ad-v3-renderer,
    ytd-statement-banner-renderer,
    ytd-rich-section-renderer,
    ytd-action-companion-ad-renderer,
    #masthead-ad,
    .ytd-rich-item-renderer[is-ad],
    .ytd-compact-promoted-video-renderer,
    .ytd-promoted-video-renderer {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    .ytp-ad-badge,
    .ytp-ad-simple-ad-badge {
      display: none !important;
    }
  `;
  
  (document.head || document.documentElement).appendChild(style);

})();
