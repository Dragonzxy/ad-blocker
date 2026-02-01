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

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
      url.includes('/api/stats/ads') ||
      url.includes('/pagead/') ||
      url.includes('/get_midroll_info') ||
      url.includes('doubleclick.net') ||
      url.includes('googlesyndication.com')
    )) {
      return Promise.reject(new Error('Ad blocked'));
    }
    return originalFetch.apply(this, args);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (url.includes('/api/stats/ads') ||
        url.includes('/pagead/') ||
        url.includes('/get_midroll_info')) {
      return;
    }
    return originalOpen.apply(this, arguments);
  };

  function fixYouTubePlaybackRate() {
    try {
      const ytPlayerConfig = localStorage.getItem('yt-player-playback-rate');
      
      if (ytPlayerConfig) {
        const config = JSON.parse(ytPlayerConfig);
        
        if (config.data && parseFloat(config.data) < 1) {
          config.data = "1";
          localStorage.setItem('yt-player-playback-rate', JSON.stringify(config));
          console.log('Reset YouTube saved playback rate to 1x');
        }
      }
    } catch (e) {
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
          localStorage.setItem('yt-player-playback-rate', JSON.stringify(config));
          console.log('Prevented slow speed from being saved');
        } catch (e) {}
      }
      
      console.log('Current playback speed:', userPlaybackRate);
    }
  }

  function handleAd() {
    const video = document.querySelector('video');
    const player = document.querySelector('.html5-video-player');
    
    if (!video || !player) return;

    const isAdPlaying = player.classList.contains('ad-showing') || 
                        player.classList.contains('ad-interrupting');

    if (isAdPlaying) {
      isProcessingAd = true;
      video.playbackRate = 16;
      video.muted = true;
      
      if (video.duration && video.duration > 0 && !isNaN(video.duration)) {
        const skipTime = Math.max(video.duration - 0.5, 5);
        if (video.currentTime < skipTime) {
          video.currentTime = skipTime;
        }
      }
    } else {
      if (isProcessingAd) {
        isProcessingAd = false;
        
        const restoreSpeed = userPlaybackRate < 1 ? lastNormalSpeed : userPlaybackRate;
        video.playbackRate = restoreSpeed;
        userPlaybackRate = restoreSpeed;
        
        video.muted = false;
        console.log('Restored speed:', restoreSpeed);
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

    adSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove());
    });
  }

  function clickSkipButton() {
    if (!isProcessingAd) return;

    const skipSelectors = [
      '.ytp-ad-skip-button-modern',
      '.ytp-ad-skip-button',
      '.ytp-skip-ad-button',
      'button.ytp-ad-skip-button',
      '.ytp-ad-skip-button-container button'
    ];

    for (const selector of skipSelectors) {
      const buttons = document.querySelectorAll(selector);
      buttons.forEach(button => {
        const isVisible = button.offsetParent !== null && 
                         window.getComputedStyle(button).display !== 'none';
        
        if (isVisible && !button.disabled) {
          try {
            button.click();
            console.log('Skip button clicked');
            return;
          } catch (e) {}
        }
      });
    }
  }

  function updatePlaybackRateUI(rate) {
    try {
      const rateButton = document.querySelector('.ytp-settings-button');
      if (rateButton) {
        const video = document.querySelector('video');
        if (video) {
          video.playbackRate = rate;
        }
      }
    } catch (e) {}
  }

  function observePlayer() {
    const player = document.querySelector('.html5-video-player');
    if (!player) {
      setTimeout(observePlayer, 500);
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          handleAd();
          if (isProcessingAd) {
            clickSkipButton();
          }
        }
      });
    });

    observer.observe(player, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });

    const bodyObserver = new MutationObserver(() => {
      removeAdElements();
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
      updatePlaybackRateUI(1);
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

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('Navigation detected - resetting playback rate');
      setTimeout(() => {
        fixYouTubePlaybackRate();
        const video = document.querySelector('video');
        if (video && video.playbackRate < 1) {
          video.playbackRate = lastNormalSpeed;
          updatePlaybackRateUI(lastNormalSpeed);
        }
      }, 500);
    }
  }).observe(document, { subtree: true, childList: true });

  setInterval(() => {
    monitorPlaybackSpeed();
    handleAd();
    if (isProcessingAd) {
      clickSkipButton();
    }
  }, 100);

  setInterval(removeAdElements, 3000);

  const style = document.createElement('style');
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
    }

    .ytp-ad-badge,
    .ytp-ad-simple-ad-badge {
      display: none !important;
    }
  `;
  document.head.appendChild(style);

  console.log('YouTube Ad Blocker Active - Smart playback rate handling');
})();