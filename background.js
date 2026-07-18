// Lincle - Arka Plan Servisi
// Artık sayfayı yakalayıp başka bir yere yönlendirmiyoruz. Bunun yerine,
// izlenen domain listesindeki sayfalara "resolver.js" içerik betiğini
// otomatik olarak enjekte ediyoruz, böylece sayfanın kendi JS'i
// (geri sayımlar, "devam et" butonları) normal şekilde çalışabiliyor.

const STORAGE_KEY = "lincleDomains";
const SEED_FILE = "domains.json";
const CONTENT_SCRIPT_ID = "lincle-resolver";

async function getDomainList() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    if (Array.isArray(data[STORAGE_KEY]) && data[STORAGE_KEY].length > 0) {
        return data[STORAGE_KEY];
    }
    const seedUrl = chrome.runtime.getURL(SEED_FILE);
    const response = await fetch(seedUrl);
    const seedDomains = await response.json();
    await chrome.storage.local.set({ [STORAGE_KEY]: seedDomains });
    return seedDomains;
}

function domainToMatchPattern(domain) {
    return `*://*.${domain}/*`;
}

async function registerResolver() {
    try {
        const domains = await getDomainList();
        const matches = domains.map(d => domainToMatchPattern(d.domain));

        const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [CONTENT_SCRIPT_ID] });
        if (existing.length) {
            await chrome.scripting.unregisterContentScripts({ ids: [CONTENT_SCRIPT_ID] });
        }

        if (matches.length === 0) return;

        await chrome.scripting.registerContentScripts([{
            id: CONTENT_SCRIPT_ID,
            matches,
            js: ["resolver.js"],
            runAt: "document_start",
            allFrames: false
        }]);

        console.log("Lincle: resolver kaydedildi ->", matches);
    } catch (error) {
        console.error("Lincle resolver kayıt hatası:", error);
    }
}

// popup.js domain listesini değiştirdiğinde bu mesajla yeniden kaydeder.
chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "LINCLE_DOMAINS_UPDATED") {
        registerResolver();
    }
});

chrome.runtime.onInstalled.addListener(registerResolver);
chrome.runtime.onStartup.addListener(registerResolver);
