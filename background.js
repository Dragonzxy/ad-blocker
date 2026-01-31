// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.set({ enabled: true });
// });

// chrome.storage.onChanged.addListener(async (changes) => {
//   if (!changes.enabled) return;

//   if (changes.enabled.newValue) {
//     await chrome.declarativeNetRequest.updateEnabledRulesets({
//       enableRulesetIds: ["ruleset_1"]
//     });
//   } else {
//     await chrome.declarativeNetRequest.updateEnabledRulesets({
//       disableRulesetIds: ["ruleset_1"]
//     });
//   }
// });

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
  
  console.log('CyberBlocker installed and enabled');
  
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: ["ruleset_1"]
  }).catch(err => console.error('Error enabling ruleset:', err));
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes.enabled) return;

  if (changes.enabled.newValue) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_1"]
    });
    console.log('Ad blocking enabled');
  } else {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ["ruleset_1"]
    });
    console.log('Ad blocking disabled');
  }
});

chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  console.log('Blocked:', details.request.url);
});