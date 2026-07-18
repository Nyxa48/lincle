// Eklenti tarayıcıya ilk yüklendiğinde bu kod tetiklenir
chrome.runtime.onInstalled.addListener(() => {
    console.log("Lincle başarıyla arka planda çalışmaya başladı.");
});