// Lincle Gelişmiş Ayarlar Motoru (Unified & Fail-Safe)
// Developed by: Emir Samed (Nyxa48)

document.addEventListener('DOMContentLoaded', restoreOptions);

// Buton dinleyicilerini (varsa) güvenli bir şekilde ekle
const btnSave = document.getElementById('saveBtn');
if (btnSave) btnSave.addEventListener('click', saveOptions);

const btnShortcuts = document.getElementById('btnShortcuts');
if (btnShortcuts) btnShortcuts.addEventListener('click', () => chrome.tabs.create({ url: "chrome://extensions/shortcuts" }));

const btnClearChain = document.getElementById('btnClearChain');
if (btnClearChain) btnClearChain.addEventListener('click', async () => {
    await chrome.storage.local.set({ lincleHistory: [] });
    restoreOptions();
});

const btnClearFailures = document.getElementById('btnClearFailures');
if (btnClearFailures) btnClearFailures.addEventListener('click', async () => {
    await chrome.storage.local.set({ lincleFailures: [] });
    restoreOptions();
});

const btnBulkResolve = document.getElementById('btnBulkResolve');
if (btnBulkResolve) btnBulkResolve.addEventListener('click', runBulkResolver);

const btnEmailDev = document.getElementById('btnEmailDev');
if (btnEmailDev) btnEmailDev.addEventListener('click', sendEmailToDev);


// AYARLARI EKRANA YÜKLE
async function restoreOptions() {
    try {
        const data = await chrome.storage.local.get([
            "lincleStats", "lincleOptions", "lincleDomains", 
            "lincleHistory", "lincleCustomRegex", "lincleFailures"
        ]);
        
        // 1. İstatistikler
        const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
        const timeText = stats.savedSeconds > 60 ? `${(stats.savedSeconds / 60).toFixed(1)} Dakika` : `${Math.floor(stats.savedSeconds)} Saniye`;
        const statsDisplay = document.getElementById('statsDisplay');
        if (statsDisplay) statsDisplay.textContent = `🚀 ${stats.cleanedLinks} Link Temizlendi | ⏳ ${timeText} Tasarruf Edildi`;

        // 2. Ana Ayarlar (Görselde çalışmayan kısım buradaydı)
        const options = data.lincleOptions || { assumedGateTime: 10, maxWaitTime: 20, enableLogging: false, enableBreadcrumbs: false };
        
        if (document.getElementById('assumedTime')) document.getElementById('assumedTime').value = options.assumedGateTime || 10;
        if (document.getElementById('loggingToggle')) document.getElementById('loggingToggle').checked = options.enableLogging || false;
        if (document.getElementById('maxWaitTime')) document.getElementById('maxWaitTime').value = options.maxWaitTime || 20;
        if (document.getElementById('breadcrumbToggle')) document.getElementById('breadcrumbToggle').checked = options.enableBreadcrumbs || false;

        // 3. Kara Liste
        const domains = data.lincleDomains || [];
        if (document.getElementById('domainList')) document.getElementById('domainList').value = domains.map(d => d.domain).join('\n');

        // 4. Özel Regexler
        const customRegex = data.lincleCustomRegex || [];
        if (document.getElementById('customRegexList')) document.getElementById('customRegexList').value = customRegex.join('\n');

        // 5. Yönlendirme Zinciri (History)
        const history = data.lincleHistory || [];
        const chainContainer = document.getElementById('chainContainer');
        if (chainContainer) {
            if (history.length === 0) {
                chainContainer.innerHTML = "<span style='color: #636e72;'>Henüz kaydedilmiş bir yönlendirme zinciri yok.</span>";
            } else {
                chainContainer.innerHTML = history.map(item => `
                    <div style="margin-bottom: 12px; border-bottom: 1px solid #dfe6e9; padding-bottom: 8px;">
                        <span style="color: #0984e3; font-weight:bold;">[${item.time}]</span> ⏱️ Kazanç: ${item.saved}s<br>
                        <span style="color: #d63031;">❌ ${item.from}</span><br>
                        <span style="color: #00b894;">↳ 🟢 ${item.to}</span>
                    </div>
                `).join('');
            }
        }

        // 6. Başarısızlık Raporları
        const failures = data.lincleFailures || [];
        const failureBox = document.getElementById('failureList');
        if (failureBox) {
            if (failures.length > 0) {
                failureBox.value = failures.map(f => `Tarih: ${f.date}\nHost: ${f.host}\nLink: ${f.url}\nHata: ${f.error}\nBulunan Metinler: ${f.gatePhrases.join(', ')}\n-------------------`).join('\n\n');
            } else {
                failureBox.value = "";
            }
        }
    } catch (e) {
        console.error("[Lincle] Ayarlar yüklenirken kritik hata:", e);
    }
}

// AYARLARI KAYDET
async function saveOptions() {
    try {
        const assumedGateTime = document.getElementById('assumedTime') ? (parseInt(document.getElementById('assumedTime').value) || 10) : 10;
        const enableLogging = document.getElementById('loggingToggle') ? document.getElementById('loggingToggle').checked : false;
        const maxWaitTime = document.getElementById('maxWaitTime') ? (parseInt(document.getElementById('maxWaitTime').value) || 20) : 20;
        const enableBreadcrumbs = document.getElementById('breadcrumbToggle') ? document.getElementById('breadcrumbToggle').checked : false;
        
        let formattedDomains = [];
        if (document.getElementById('domainList')) {
            const domainText = document.getElementById('domainList').value;
            formattedDomains = domainText.split('\n').map(d => d.trim().toLowerCase()).filter(d => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)).map(d => ({ domain: d }));
        }

        let customRegex = [];
        if (document.getElementById('customRegexList')) {
            const regexText = document.getElementById('customRegexList').value;
            customRegex = regexText.split('\n').map(r => r.trim()).filter(r => r !== "");
        }

        await chrome.storage.local.set({
            lincleOptions: { assumedGateTime, enableLogging, maxWaitTime, enableBreadcrumbs },
            lincleDomains: formattedDomains,
            lincleCustomRegex: customRegex
        });

        const status = document.getElementById('saveStatus');
        if (status) {
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
        }
    } catch(e) {
         console.error("[Lincle] Ayarlar kaydedilirken hata:", e);
    }
}

// TOPLU ÇÖZÜMLEYİCİ (BULK RESOLVER) FONKSİYONU
async function runBulkResolver() {
    const inputEl = document.getElementById('bulkInput');
    const outBox = document.getElementById('bulkOutput');
    const btn = document.getElementById('btnBulkResolve');
    
    if (!inputEl || !outBox || !btn) return;

    const inputLines = inputEl.value.split('\n').filter(l => l.trim() !== '');
    if(inputLines.length === 0) return;
    
    btn.textContent = "⏳ Çözümleniyor...";
    btn.disabled = true;
    outBox.value = "";

    const STATIC_PATTERNS = [
        /var\s+url\s*=\s*['"]([^'"]+)['"]/i,
        /window\.location\.href\s*=\s*['"]([^'"]+)['"]/i,
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i
    ];
    
    let customPatterns = [];
    if (document.getElementById('customRegexList')) {
        const customRegexRaw = document.getElementById('customRegexList').value.split('\n').filter(l => l.trim() !== '');
        customPatterns = customRegexRaw.map(r => { try { return new RegExp(r, 'i'); } catch(e) { return null; } }).filter(r => r !== null);
    }
    
    const allPatterns = [...STATIC_PATTERNS, ...customPatterns];
    let results = [];

    for (let link of inputLines) {
        try {
            const response = await fetch(link.trim());
            const html = await response.text();
            
            let found = false;
            for (const pattern of allPatterns) {
                const match = html.match(pattern);
                if (match && match[1] && match[1].startsWith('http')) {
                    results.push(`✅ [TEMİZ]: ${match[1]}`);
                    found = true;
                    break;
                }
            }
            if (!found) results.push(`❌ [BULUNAMADI]: ${link}`);
        } catch (e) {
            results.push(`⚠️ [HATA]: Bağlantı kurulamadı - ${link}`);
        }
    }

    outBox.value = results.join('\n');
    btn.textContent = "🚀 Toplu Çözümle";
    btn.disabled = false;
}

// GELİŞTİRİCİYE MAİL GÖNDERME FONKSİYONU
async function sendEmailToDev() {
    const fData = await chrome.storage.local.get("lincleFailures");
    const failures = fData.lincleFailures || [];
    
    if (failures.length === 0) {
        alert("Gönderilecek bir hata raporu bulunmuyor!");
        return;
    }

    const reportText = failures.map(f => `Host: ${f.host}\nURL: ${f.url}\nPhrases: ${f.gatePhrases.join(', ')}`).join('\n\n');
    const email = "iletisim@emirsamed.com"; 
    const subject = encodeURIComponent("Lincle v2.4 - Hata Raporu (Failures)");
    const body = encodeURIComponent(`Merhaba Emir,\n\nAşağıdaki linkleri Lincle atlayamadı. İncelemen için gönderiyorum:\n\n${reportText}`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
}