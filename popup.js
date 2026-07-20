// Lincle - Modern UI Manager
// Developed by: Emir Samed (Nyxa48)

// Firefox/Safari 'browser' nesnesini (Promise tabanlı, native) sağlar.
// Chrome'da MV3'te 'chrome' de callback verilmediğinde Promise döndürür.
const ext = (typeof browser !== "undefined") ? browser : chrome;

const DOMAINS_KEY = "lincleDomains";
const EXCLUDE_KEY = "lincleExcluded";
const SETTINGS_KEY = "lincleSettings"; // { isActive: true/false }

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initManager();
});

function initUI() {
    const btnOpenSettings = document.getElementById('btnOpenSettings');

    // 1. Ayarlar Butonu Düzeltmesi: Tıklandığında GERÇEK options.html sayfasını yeni sekmede açar
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage(); // Chrome'un yerel ayarlar sayfasını tetikler
            } else {
                window.open(chrome.runtime.getURL('options.html')); // Alternatif açılış
            }
        });
    }

    // 2. İstatistikleri Yükle ve Ekrana Bas (Priority 1)
    chrome.storage.local.get("lincleStats", (data) => {
        const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
        
        let timeText = `${Math.floor(stats.savedSeconds)} Saniye`;
        if (stats.savedSeconds >= 60) {
            timeText = `${(stats.savedSeconds / 60).toFixed(1)} Dakika`;
        }
        
        const statsBadge = document.getElementById('statsBadge');
        if (statsBadge) {
            statsBadge.textContent = `🚀 ${stats.cleanedLinks} Link Temizlendi | ⏳ ${timeText} Kazanıldı`;
        }
    });

    // Explicit Opt-In Clipboard Cleaner
    const btnCleanClipboard = document.getElementById('btnCleanClipboard');
    const clipboardStatus = document.getElementById('clipboardStatus');

    if (btnCleanClipboard) {
        btnCleanClipboard.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (!text.startsWith('http')) {
                    clipboardStatus.style.color = "var(--danger)";
                    clipboardStatus.textContent = "Panoda geçerli bir link bulunamadı.";
                    clipboardStatus.style.display = "block";
                    return;
                }

                clipboardStatus.style.color = "#0984e3";
                clipboardStatus.textContent = "⏳ Hedef link arka planda aranıyor...";
                clipboardStatus.style.display = "block";

                // Arka planda Layer 0 taraması yap
                const response = await fetch(text.trim());
                const html = await response.text();
                
                // Hızlı basit Regex kontrolü
                const match = html.match(/(?:var\s+url\s*=\s*|url=)['"]([^'"]+)['"]/i);
                
                if (match && match[1] && match[1].startsWith('http')) {
                    // Temiz linki panoya geri yaz!
                    await navigator.clipboard.writeText(match[1]);
                    clipboardStatus.style.color = "var(--success)";
                    clipboardStatus.textContent = "✅ Hedef link bulundu ve panonuza kopyalandı!";
                } else {
                    clipboardStatus.style.color = "var(--danger)";
                    clipboardStatus.textContent = "❌ Statik bir hedef bulunamadı.";
                }
            } catch (err) {
                clipboardStatus.style.color = "var(--danger)";
                clipboardStatus.textContent = "Pano okuma izni reddedildi.";
                clipboardStatus.style.display = "block";
            }
        });
    }
}

// Arayüz Rengini ve Yazısını Değiştiren Animasyonlu Fonksiyon
function updateStatusUI(isActive) {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const desc = document.getElementById('statusDesc');

    if (isActive) {
        icon.innerHTML = "🛡️";
        icon.style.borderColor = "var(--success)";
        icon.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
        icon.style.boxShadow = "0 0 15px rgba(46, 204, 113, 0.2)";
        title.textContent = "Sistem Koruması Aktif";
        title.style.color = "var(--success)";
        desc.textContent = "Arka planda gereksiz kapılar atlanıyor";
    } else {
        icon.innerHTML = "❌";
        icon.style.borderColor = "var(--danger)";
        icon.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
        icon.style.boxShadow = "0 0 15px rgba(231, 76, 60, 0.2)";
        title.textContent = "Sistem Koruması Kapalı";
        title.style.color = "var(--danger)";
        desc.textContent = "Lincle şu an sitelere müdahale etmiyor";
    }
}

async function loadDomains() { const data = await ext.storage.local.get(DOMAINS_KEY); return data[DOMAINS_KEY] || []; }
async function saveDomains(domains) { await ext.storage.local.set({ [DOMAINS_KEY]: domains }); }
async function loadExcluded() { const data = await ext.storage.local.get(EXCLUDE_KEY); return data[EXCLUDE_KEY] || []; }
async function saveExcluded(list) { await ext.storage.local.set({ [EXCLUDE_KEY]: list }); }
async function loadSettings() { const data = await ext.storage.local.get(SETTINGS_KEY); return Object.assign({ isActive: true }, data[SETTINGS_KEY] || {}); }
async function saveSettings(settings) { await ext.storage.local.set({ [SETTINGS_KEY]: settings }); }

async function initManager() {
    const listEl = document.getElementById('domainList');
    const domainInput = document.getElementById('newDomain');
    const addBtn = document.getElementById('addDomainBtn');

    const excludeListEl = document.getElementById('excludeList');
    const excludeInput = document.getElementById('newExclude');
    const addExcludeBtn = document.getElementById('addExcludeBtn');

    const masterToggle = document.getElementById('masterToggle');

    // Ayarları Yükle ve Şalteri Ayarla
    const settings = await loadSettings();
    masterToggle.checked = settings.isActive;
    updateStatusUI(settings.isActive); // Yüklenirken rengi ayarla

    // Şaltere Tıklanınca Çalışacak Olay
    masterToggle.addEventListener('change', async () => {
        await saveSettings({ isActive: masterToggle.checked });
        updateStatusUI(masterToggle.checked);
    });

    async function renderDomains() {
        const domains = await loadDomains();
        listEl.innerHTML = '';
        domains.forEach(entry => {
            const li = document.createElement('li');
            
            // XSS Güvenlik Yaması: innerHTML yerine textContent kullanımı
            const span = document.createElement('span');
            span.textContent = entry.domain;
            li.appendChild(span);

            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadDomains()).filter(d => d.domain !== entry.domain);
                await saveDomains(updated);
                renderDomains();
            });
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }

    addBtn.addEventListener('click', async () => {
        const rawDomain = domainInput.value.trim().toLowerCase();
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) { alert("Geçerli bir domain girin, örn: kisalt.co"); return; }
        const domains = await loadDomains();
        if (!domains.find(d => d.domain === rawDomain)) { domains.push({ domain: rawDomain }); await saveDomains(domains); }
        domainInput.value = '';
        renderDomains();
    });

    async function renderExcluded() {
        const list = await loadExcluded();
        excludeListEl.innerHTML = '';
        list.forEach(domain => {
            const li = document.createElement('li');
            
            // XSS Güvenlik Yaması: innerHTML yerine textContent kullanımı
            const span = document.createElement('span');
            span.textContent = domain;
            li.appendChild(span);

            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadExcluded()).filter(d => d !== domain);
                await saveExcluded(updated);
                renderExcluded();
            });
            li.appendChild(btn);
            excludeListEl.appendChild(li);
        });
    }

    addExcludeBtn.addEventListener('click', async () => {
        const rawDomain = excludeInput.value.trim().toLowerCase();
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) { alert("Geçerli bir domain girin, örn: bankam.com"); return; }
        const list = await loadExcluded();
        if (!list.includes(rawDomain)) { list.push(rawDomain); await saveExcluded(list); }
        excludeInput.value = '';
        renderExcluded();
    });

    renderDomains();
    renderExcluded();
}