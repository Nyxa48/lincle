document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);

async function restoreOptions() {
    // Özel Regexleri Yükle
    const regexData = await chrome.storage.local.get("lincleCustomRegex");

    document.getElementById('customRegexList').value = (regexData.lincleCustomRegex || []).join('\n');
    const data = await chrome.storage.local.get(["lincleStats", "lincleOptions", "lincleDomains"]);

    // İstatistikleri Yükle
    const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
    const timeText = stats.savedSeconds > 60 ? `${(stats.savedSeconds / 60).toFixed(1)} Dakika` : `${Math.floor(stats.savedSeconds)} Saniye`;
    document.getElementById('statsDisplay').textContent = `🚀 ${stats.cleanedLinks} Link Temizlendi | ⏳ ${timeText} Tasarruf Edildi`;

    // Ayarları Yükle
    const options = data.lincleOptions || { assumedGateTime: 10, enableLogging: false };
    document.getElementById('assumedTime').value = options.assumedGateTime;
    document.getElementById('loggingToggle').checked = options.enableLogging;

    // Kara Listeyi Yükle
    const domains = data.lincleDomains || [];
    document.getElementById('domainList').value = domains.map(d => d.domain).join('\n');

    // AŞAMA 2: Yönlendirme Zincirini (Redirect Chain) Görselleştir
    const hData = await chrome.storage.local.get("lincleHistory");
    const history = hData.lincleHistory || [];
    const chainContainer = document.getElementById('chainContainer');

    if (history.length === 0) {
        chainContainer.innerHTML = "<span style='color: #636e72;'>Henüz kaydedilmiş bir yönlendirme zinciri yok.</span>";
    } else {
        chainContainer.innerHTML = history.map(item => `
            <div style="margin-bottom: 12px; border-bottom: 1px solid #636e72; padding-bottom: 8px;">
                <span style="color: #ffeaa7;">[${item.time}]</span> ⏱️ Kazanç: ${item.saved}s<br>
                <span style="color: #ff7675;">❌ ${item.from}</span><br>
                <span style="color: #74b9ff;">↳ 🟢 ${item.to}</span>
            </div>
        `).join('');
    }

    // Kısayol butonuna tıklayınca Chrome'un Kısayol Ayarları sayfasını aç
    document.getElementById('btnShortcuts').addEventListener('click', () => {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    });

    // Zinciri temizleme butonu
    document.getElementById('btnClearChain').addEventListener('click', async () => {
        await chrome.storage.local.set({ lincleHistory: [] });
        restoreOptions(); // Sayfayı yenile
    });
}

async function saveOptions() {
    const assumedGateTime = parseInt(document.getElementById('assumedTime').value) || 10;
    const enableLogging = document.getElementById('loggingToggle').checked;

    // Güvenli regex denetimi ve veri formatlama
    const domainText = document.getElementById('domainList').value;
    const domainArray = domainText.split('\n')
        .map(d => d.trim().toLowerCase())
        .filter(d => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d));
    const formattedDomains = domainArray.map(d => ({ domain: d }));
    const regexText = document.getElementById('customRegexList').value;
    const customRegex = regexText.split('\n').map(r => r.trim()).filter(r => r !== "");

    // chrome.storage.local.set içine bunu da ekle:
    // lincleCustomRegex: customRegex
    await chrome.storage.local.set({
        lincleOptions: { assumedGateTime, enableLogging },
        lincleDomains: formattedDomains
    });

    const status = document.getElementById('saveStatus');
    status.style.display = 'inline';
    setTimeout(() => { status.style.display = 'none'; }, 2000);
}

// TOPLU ÇÖZÜMLEYİCİ MOTORU (Layer 0 Fetch)
document.getElementById('btnBulkResolve').addEventListener('click', async () => {
    const inputLines = document.getElementById('bulkInput').value.split('\n').filter(l => l.trim() !== '');
    const outBox = document.getElementById('bulkOutput');
    const btn = document.getElementById('btnBulkResolve');

    if (inputLines.length === 0) return;

    btn.textContent = "⏳ Çözümleniyor...";
    btn.disabled = true;
    outBox.value = "";

    // Varsayılan Statik Regexler (Resolver'dakiyle aynı mantık)
    const STATIC_PATTERNS = [
        /var\s+url\s*=\s*['"]([^'"]+)['"]/i,
        /window\.location\.href\s*=\s*['"]([^'"]+)['"]/i,
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i
    ];

    // Özel regexleri de al
    const customRegexRaw = document.getElementById('customRegexList').value.split('\n').filter(l => l.trim() !== '');
    const customPatterns = customRegexRaw.map(r => new RegExp(r, 'i'));
    const allPatterns = [...STATIC_PATTERNS, ...customPatterns];

    let results = [];

    for (let link of inputLines) {
        try {
            // Linkin kaynak kodunu arka planda gizlice indir (Sekme açmadan!)
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
});