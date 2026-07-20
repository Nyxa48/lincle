// Lincle Gelişmiş Ayarlar Motoru (Theme, i18n & Fail-Safe)
// Developed by: Emir Samed (Nyxa48)

// TEMA YÖNETİMİ (Açık/Koyu Mod)
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('lincleTheme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton(currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lincleTheme', theme);
        updateThemeButton(theme);
    });
}

function updateThemeButton(theme) {
    if (typeof lincleDict !== "undefined") {
        chrome.storage.local.get("lincleLang", (data) => {
            const lang = data.lincleLang || 'tr';
            if (themeToggle) themeToggle.textContent = theme === 'dark' ? lincleDict[lang].themeLight : lincleDict[lang].themeDark;
        });
    } else {
        if (themeToggle) themeToggle.textContent = theme === 'dark' ? 'Açık Mod' : 'Koyu Mod';
    }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

// DİL DEĞİŞTİRİCİ DİNLEYİCİSİ
const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ lincleLang: e.target.value });
        location.reload(); 
    });
}

// Buton Dinleyicileri
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


// AYARLARI YÜKLE
async function restoreOptions() {
    try {
        // ÇEVİRİLERİ YÜKLE VE DİL KUTUSUNU AYARLA (Hata buradaydı, artık async fonksiyonun içinde!)
        if (typeof applyTranslations === "function") {
            await applyTranslations();
        }
        
        const langData = await chrome.storage.local.get("lincleLang");
        const currentLang = langData.lincleLang || 'tr';
        if (document.getElementById('langSelect')) {
            document.getElementById('langSelect').value = currentLang;
        }

        const data = await chrome.storage.local.get([
            "lincleStats", "lincleOptions", "lincleDomains", 
            "lincleHistory", "lincleCustomRegex", "lincleFailures"
        ]);
        
        // İstatistikleri Dinamik Yazdır (Dil destekli)
        const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
        const timeText = stats.savedSeconds > 60 ? `${(stats.savedSeconds / 60).toFixed(1)}` : `${Math.floor(stats.savedSeconds)}`;
        const statsDisplay = document.getElementById('statsDisplay');
        if (statsDisplay) {
            if (typeof lincleDict !== "undefined") {
                const dict = lincleDict[currentLang];
                statsDisplay.textContent = `${stats.cleanedLinks} ${dict.popCleaned} | ${timeText} ${stats.savedSeconds > 60 ? 'min' : 'sec'} ${dict.popSaved}`;
            } else {
                statsDisplay.textContent = `${stats.cleanedLinks} Link Temizlendi | ${timeText} ${stats.savedSeconds > 60 ? 'Dakika' : 'Saniye'} Tasarruf Edildi`;
            }
        }

        // Seçenekleri Doldur
        const options = data.lincleOptions || { assumedGateTime: 10, maxWaitTime: 20, enableLogging: false, enableBreadcrumbs: false };
        
        if (document.getElementById('assumedTime')) document.getElementById('assumedTime').value = options.assumedGateTime || 10;
        if (document.getElementById('loggingToggle')) document.getElementById('loggingToggle').checked = options.enableLogging || false;
        if (document.getElementById('maxWaitTime')) document.getElementById('maxWaitTime').value = options.maxWaitTime || 20;
        if (document.getElementById('breadcrumbToggle')) document.getElementById('breadcrumbToggle').checked = options.enableBreadcrumbs || false;

        const domains = data.lincleDomains || [];
        if (document.getElementById('domainList')) document.getElementById('domainList').value = domains.map(d => d.domain).join('\n');

        const customRegex = data.lincleCustomRegex || [];
        if (document.getElementById('customRegexList')) document.getElementById('customRegexList').value = customRegex.join('\n');

        const history = data.lincleHistory || [];
        const chainContainer = document.getElementById('chainContainer');
        if (chainContainer) {
            if (history.length === 0) {
                chainContainer.innerHTML = "-";
            } else {
                chainContainer.innerHTML = history.map(item => `
                    <div class="chain-item">
                        <span class="chain-time">[${item.time}]</span> ${item.saved}s<br>
                        <span class="chain-from">SRC: ${item.from}</span><br>
                        <span class="chain-to">DST: ${item.to}</span>
                    </div>
                `).join('');
            }
        }

        const failures = data.lincleFailures || [];
        const failureBox = document.getElementById('failureList');
        if (failureBox) {
            if (failures.length > 0) {
                failureBox.value = failures.map(f => `Host: ${f.host}\nURL: ${f.url}\nPhrases: ${f.gatePhrases.join(', ')}\n-------------------`).join('\n\n');
            } else {
                failureBox.value = "";
            }
        }
    } catch (e) {
        console.error("[Lincle] Ayarlar yüklenirken hata oluştu:", e);
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
         console.error("[Lincle] Kayıt hatası:", e);
    }
}

// TOPLU ÇÖZÜMLEYİCİ
async function runBulkResolver() {
    const inputEl = document.getElementById('bulkInput');
    const outBox = document.getElementById('bulkOutput');
    const btn = document.getElementById('btnBulkResolve');
    
    if (!inputEl || !outBox || !btn) return;

    const inputLines = inputEl.value.split('\n').filter(l => l.trim() !== '');
    if(inputLines.length === 0) return;
    
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
                    results.push(`[OK] ${match[1]}`);
                    found = true;
                    break;
                }
            }
            if (!found) results.push(`[NOT FOUND] ${link}`);
        } catch (e) {
            results.push(`[ERROR] ${link}`);
        }
    }

    outBox.value = results.join('\n');
    btn.disabled = false;
}

// GELİŞTİRİCİYE MAİL GÖNDERME
async function sendEmailToDev() {
    const fData = await chrome.storage.local.get("lincleFailures");
    const failures = fData.lincleFailures || [];
    
    if (failures.length === 0) return;

    const reportText = failures.map(f => `Host: ${f.host}\nURL: ${f.url}\nBulgular: ${f.gatePhrases.join(', ')}`).join('\n\n');
    const email = "nyxa4807@gmail.com"; 
    const subject = encodeURIComponent("Lincle - Hata Raporu");
    const body = encodeURIComponent(`Merhaba Emir,\n\nAşağıdaki bağlantılar Lincle tarafından atlanamadı. Analiz için gönderiyorum:\n\n${reportText}`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
}