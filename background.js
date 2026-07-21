// Lincle Background Service v2.5 - Cross-Browser Fix
// Developed by: Emir Samed (Nyxa48)

// Cross-browser shim
const ext = (typeof browser !== "undefined") ? browser : chrome;

ext.runtime.onInstalled.addListener(() => {
    ext.contextMenus.create({
        id: "lincle-bypass",
        title: "🛡️ Lincle ile Temizle ve Git",
        contexts: ["link"]
    });
});

ext.contextMenus.onClicked.addListener((info, tab) => {
    // Sadece dinamik olarak tıklanan hedefe yönlendirir, hardcode içermez.
    if (info.menuItemId === "lincle-bypass" && info.linkUrl) {
        ext.tabs.create({ url: info.linkUrl });
    }
});

// Aşama 2: Dinamik Klavye Kısayolu Dinleyicisi
ext.commands.onCommand.addListener((command) => {
    if (command === "trigger-lincle") {
        // Bug fix v2.5: callback style → async/await for cross-browser compat
        ext.tabs.query({active: true, currentWindow: true}).then(tabs => {
            if (tabs[0]) {
                ext.tabs.sendMessage(tabs[0].id, { action: "manualBypass" });
            }
        }).catch(() => {});
    }
});

// AŞAMA 3.1: Redirect Breadcrumb Tracker (Sekme Yönlendirme İzleyicisi)
let breadcrumbsEnabled = false;
let tabBreadcrumbs = {};

// Ayarları dinle ve izleyiciyi sadece rıza varsa aç
ext.storage.local.get("lincleOptions", (data) => {
    breadcrumbsEnabled = data.lincleOptions?.enableBreadcrumbs || false;
});
ext.storage.onChanged.addListener((changes) => {
    if (changes.lincleOptions) {
        breadcrumbsEnabled = changes.lincleOptions.newValue.enableBreadcrumbs || false;
    }
});

// Sekme hareketlerini (Görünmez HTTP yönlendirmeleri dahil) kaydet
ext.webNavigation.onCommitted.addListener((details) => {
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
    ext.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
});

// Sekme kapatıldığında izleri sil (Garbage Collection)
ext.tabs.onRemoved.addListener((tabId) => {
    if (tabBreadcrumbs[tabId]) {
        delete tabBreadcrumbs[tabId];
        ext.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
    }
});