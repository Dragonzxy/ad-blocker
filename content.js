(function() {
  'use strict';

  // Exit early for YouTube - handle it separately
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

    // Use requestIdleCallback for stealth
    if (window.requestIdleCallback) {
      requestIdleCallback(() => {
        adSelectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => el.remove());
          } catch (e) {}
        });
      }, { timeout: 2000 });
    } else {
      adSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => el.remove());
        } catch (e) {}
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeAds);
  } else {
    removeAds();
  }

  // Increase interval to 5s instead of 2s - less detectable
  setInterval(removeAds, 5000);

  const style = document.createElement('style');
  style.type = 'text/css';
  style.textContent = `
    .adsbygoogle,
    [data-ad-rendered="true"],
    .advertisement,
    .sponsored {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);
})();