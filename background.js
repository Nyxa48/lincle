// Lincle - Dinamik Kural ve Uzaktan Güncelleme Motoru

// Güncel kuralları barındıracağın GitHub dosyanın ham (raw) adresi
// NOT: GitHub'a rules.json dosyasını yükledikten sonra buradaki URL'yi kendi linkinle değiştireceksin!
const REMOTE_RULES_URL = "https://raw.githubusercontent.com/Nyxa48/lincle/main/rules.json";

// 1. UZAKTAN GÜNCEL LİSTEYİ ÇEKEN FONKSİYON
async function updateRulesFromRemote() {
    try {
        console.log("Lincle: Güncel filtre listesi GitHub'dan çekiliyor...");
        const response = await fetch(REMOTE_RULES_URL);
        if (!response.ok) throw new Error("Sunucu yanıt vermedi.");
        
        const remoteRules = await response.json();
        
        // Tarayıcıdaki eski dinamik kuralları temizle
        const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
        const oldIds = oldRules.map(rule => rule.id);

        // Yeni gelen güncel listeyi tarayıcı çekirdeğine enjekte et
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: oldIds,
            addRules: remoteRules
        });

        console.log(`Lincle: ${remoteRules.length} adet güncel kural başarıyla sisteme yüklendi.`);
    } catch (error) {
        console.error("Lincle: Dinamik kurallar güncellenirken hata oluştu, yerel kurallar kullanılacak.", error);
    }
}

// Eklenti ilk yüklendiğinde ve tarayıcı her açıldığında listeyi güncelle
chrome.runtime.onInstalled.addListener(updateRulesFromRemote);
chrome.runtime.onStartup.addListener(updateRulesFromRemote);

// 2. GENEL HEVRİSTİK (SEZGİSEL) LINK AYIKLAMA MOTORU
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url.includes(chrome.runtime.getURL("popup.html"))) {
        
        console.log("Lincle: Arka planda genel link çözücü tetiklendi...");
        
        // Burası bir sonraki aşamada sitenin ham HTML'ini arka planda gizlice (fetch ile) çekip
        // içindeki gerçek yönlendirme linkini (örneğin senin pixeldrain linkini) cımbızla ayıklayacak.
        // Şimdilik test ortamımızın çalışması için yönlendirmeyi simüle ediyoruz:
        setTimeout(() => {
            chrome.tabs.update(tabId, {
                url: "https://pixeldrain.com/u/hUw5sNYf"
            });
        }, 1500);
    }
});