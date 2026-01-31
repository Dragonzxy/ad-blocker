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















// chrome.runtime.onInstalled.addListener(() => {
//   chrome.storage.local.set({ enabled: true });
  
//   console.log('CyberBlocker installed and enabled');
  
//   chrome.declarativeNetRequest.updateEnabledRulesets({
//     enableRulesetIds: ["ruleset_1"]
//   }).catch(err => console.error('Error enabling ruleset:', err));
// });

// chrome.storage.onChanged.addListener(async (changes) => {
//   if (!changes.enabled) return;

//   if (changes.enabled.newValue) {
//     await chrome.declarativeNetRequest.updateEnabledRulesets({
//       enableRulesetIds: ["ruleset_1"]
//     });
//     console.log('Ad blocking enabled');
//   } else {
//     await chrome.declarativeNetRequest.updateEnabledRulesets({
//       disableRulesetIds: ["ruleset_1"]
//     });
//     console.log('Ad blocking disabled');
//   }
// });

// chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
//   console.log('Blocked:', details.request.url);
// });








console.log('=== CyberBlocker Service Worker Started ===');

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('onInstalled triggered, reason:', details.reason);
  
  try {
    await chrome.storage.local.set({ enabled: true });
    console.log('✓ Storage set');
    
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ["ruleset_1"]
    });
    console.log('✓ Static ruleset enabled');

    // More aggressive dynamic rules
    const dynamicRules = [
      {
        "id": 1000,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "regexFilter": "googlevideo\\.com.*[&?](oad|ctier|dur)=",
          "resourceTypes": ["media"]
        }
      },
      {
        "id": 1001,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*youtube.com*ad_pod*",
          "resourceTypes": ["xmlhttprequest"]
        }
      },
      {
        "id": 1002,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*youtube.com*adsense*",
          "resourceTypes": ["script", "xmlhttprequest"]
        }
      },
      {
        "id": 1003,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*youtube.com*adformat*",
          "resourceTypes": ["xmlhttprequest"]
        }
      },
      {
        "id": 1004,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*youtube.com*ad_break*",
          "resourceTypes": ["xmlhttprequest"]
        }
      },
      {
        "id": 1005,
        "priority": 4,
        "action": { "type": "block" },
        "condition": {
          "urlFilter": "*googlevideo.com*&cpn=*&cver=*&ptk=*",
          "resourceTypes": ["media"]
        }
      }
    ];

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: dynamicRules
    });
    
    console.log('✓ Dynamic rules added:', dynamicRules.length);
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
});

chrome.storage.onChanged.addListener(async (changes) => {
  if (!changes.enabled) return;

  try {
    if (changes.enabled.newValue) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["ruleset_1"]
      });
      console.log('✓ Ad blocking enabled');
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ["ruleset_1"]
      });
      console.log('✓ Ad blocking disabled');
    }
  } catch (err) {
    console.error('❌ Error toggling:', err);
  }
});

if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
    console.log('🚫 BLOCKED:', details.request.url);
  });
}

console.log('=== CyberBlocker Ready ===');