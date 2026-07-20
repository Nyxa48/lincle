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