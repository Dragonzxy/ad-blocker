// Generic ad blocker for non-YouTube sites
(function() {
  'use strict';

  // Don't run on YouTube (handled by youtube-adblocker.js)
  if (window.location.hostname.includes('youtube.com')) {
    return;
  }

  function removeAds() {
    const adSelectors = [
      '.adsbygoogle',
      '[class*="advertisement"]',
      '[id*="advertisement"]',
      '.ad-container',
      '.ad-wrapper',
      '.sponsored',
      '.banner-ad',
      'ins.adsbygoogle',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="advertising"]',
      'div[data-ad-slot]',
      '[data-ad-rendered="true"]'
    ];

    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (e) {}
    });
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeAds);
  } else {
    removeAds();
  }

  // Run periodically
  setInterval(removeAds, 2000);

  // CSS to hide ads
  const style = document.createElement('style');
  style.textContent = `
    .adsbygoogle,
    [data-ad-rendered="true"],
    .advertisement,
    .sponsored {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
})();