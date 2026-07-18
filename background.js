const REMOTE_RULES_URL = "https://raw.githubusercontent.com/Nyxa48/lincle/main/rules.json";

async function updateRulesFromRemote() {
    try {
        const rules = [
            {
                "id": 1,
                "priority": 1,
                "action": {
                    "type": "redirect",
                    "redirect": { 
                        "url": chrome.runtime.getURL("popup.html?continue=https://pixeldrain.com/u/hUw5sNYf") // Test için yönlendirme parametresi ekledik
                    }
                },
                "condition": {
                    "urlFilter": "*://*.bc.vc/*",
                    "resourceTypes": ["main_frame"]
                }
            }
        ];

        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldIds = oldRules.map(rule => rule.id);

        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldIds,
            addRules: rules
        });
        console.log("Lincle: Kurallar güncellendi.");
    } catch (error) {
        console.error(error);
    }
}

chrome.runtime.onInstalled.addListener(updateRulesFromRemote);
chrome.runtime.onStartup.addListener(updateRulesFromRemote);