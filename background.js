// Lincle Background Service - Context Menu
// Developed by: Emir Samed (Nyxa48)

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "lincle-bypass",
        title: "🛡️ Lincle ile Temizle ve Git",
        contexts: ["link"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // Sadece dinamik olarak tıklanan hedefe yönlendirir, hardcode içermez.
    if (info.menuItemId === "lincle-bypass" && info.linkUrl) {
        chrome.tabs.create({ url: info.linkUrl });
    }
});

// Aşama 2: Dinamik Klavye Kısayolu Dinleyicisi
chrome.commands.onCommand.addListener((command) => {
    if (command === "trigger-lincle") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                // Mevcut sekmeye 'zorla çalıştır' emri gönder
                chrome.tabs.sendMessage(tabs[0].id, { action: "manualBypass" });
            }
        });
    }
});

// AŞAMA 3.1: Redirect Breadcrumb Tracker (Sekme Yönlendirme İzleyicisi)
let breadcrumbsEnabled = false;
let tabBreadcrumbs = {};

// Ayarları dinle ve izleyiciyi sadece rıza varsa aç
chrome.storage.local.get("lincleOptions", (data) => {
    breadcrumbsEnabled = data.lincleOptions?.enableBreadcrumbs || false;
});
chrome.storage.onChanged.addListener((changes) => {
    if (changes.lincleOptions) {
        breadcrumbsEnabled = changes.lincleOptions.newValue.enableBreadcrumbs || false;
    }
});

// Sekme hareketlerini (Görünmez HTTP yönlendirmeleri dahil) kaydet
chrome.webNavigation.onCommitted.addListener((details) => {
    if (!breadcrumbsEnabled || details.frameId !== 0) return; // Sadece ana sayfayı ve izin varsa kaydet

    if (!tabBreadcrumbs[details.tabId]) tabBreadcrumbs[details.tabId] = [];
    
    // Geçiş tipi (Örn: server_redirect, client_redirect, link)
    const transition = (details.transitionQualifiers || []).includes("server_redirect") ? "⚡ Sunucu Yönlendirmesi" : "🖱️ Sayfa Yüklemesi";

    tabBreadcrumbs[details.tabId].push({
        time: new Date().toLocaleTimeString('tr-TR'),
        url: details.url,
        type: transition
    });

    // Zincir çok uzarsa eskiyi sil (Performans)
    if (tabBreadcrumbs[details.tabId].length > 10) tabBreadcrumbs[details.tabId].shift();

    // Veritabanına yaz ki Options sayfasından okunabilsin
    chrome.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
});

// Sekme kapatıldığında izleri sil (Garbage Collection)
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabBreadcrumbs[tabId]) {
        delete tabBreadcrumbs[tabId];
        chrome.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
    }
});