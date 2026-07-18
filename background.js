// Lincle - Arka Plan Servisi
// Kısaltıcı sitelerin ana sayfa isteklerini yakalayıp uzantının kendi
// çözücü sayfasına (popup.html) - orijinal hedef URL'yi koruyarak -
// yönlendiren declarativeNetRequest kurallarını oluşturur.

const STORAGE_KEY = "lincleDomains";
const SEED_FILE = "domains.json";

// Domain adını güvenli bir regex kalıbına çevirir.
function domainToRegexFilter(domain) {
    const escaped = domain.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return `^https?://([a-z0-9-]+\\.)*${escaped}/.*$`;
}

async function getDomainList() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    if (Array.isArray(data[STORAGE_KEY]) && data[STORAGE_KEY].length > 0) {
        return data[STORAGE_KEY];
    }
    // İlk kurulum: paket içindeki domains.json'dan varsayılanları yükle
    const seedUrl = chrome.runtime.getURL(SEED_FILE);
    const response = await fetch(seedUrl);
    const seedDomains = await response.json();
    await chrome.storage.local.set({ [STORAGE_KEY]: seedDomains });
    return seedDomains;
}

function buildRules(domains, popupUrl) {
    return domains.map((domain, index) => ({
        id: index + 1,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                // \0 = eşleşen tüm orijinal URL. Böylece kullanıcının
                // gerçekte gitmek istediği adres kayıp gitmez, popup.html'e
                // 'continue' parametresi olarak taşınır.
                regexSubstitution: `${popupUrl}?continue=\\0`
            }
        },
        condition: {
            regexFilter: domainToRegexFilter(domain),
            resourceTypes: ["main_frame"]
        }
    }));
}

async function applyRules() {
    try {
        const domains = await getDomainList();
        const popupUrl = chrome.runtime.getURL("popup.html");
        const newRules = buildRules(domains, popupUrl);

        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldRules.map(r => r.id),
            addRules: newRules
        });

        console.log(`Lincle: ${newRules.length} kural güncellendi.`);
    } catch (error) {
        console.error("Lincle kural güncelleme hatası:", error);
    }
}

// popup.js domain listesini değiştirdiğinde bu mesajla kuralları yeniler.
chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "LINCLE_DOMAINS_UPDATED") {
        applyRules();
    }
});

chrome.runtime.onInstalled.addListener(applyRules);
chrome.runtime.onStartup.addListener(applyRules);
