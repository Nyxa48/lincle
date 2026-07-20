// Lincle Popup UI Engine (Fully Localized & Fail-Safe)
// Developed by: Emir Samed (Nyxa48)

document.addEventListener('DOMContentLoaded', initUI);

async function initUI() {
    let currentLang = 'en';

    // 1. ÇEVİRİ MOTORUNU ÇALIŞTIR
    try {
        if (typeof applyTranslations === "function") {
            await applyTranslations();
        }
        const langData = await chrome.storage.local.get("lincleLang");
        currentLang = langData.lincleLang || 'en'; 
    } catch (e) {
        console.error("[Lincle] Çeviri yüklenme hatası:", e);
    }

    // 2. TEMA YÖNETİMİ
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('lincleTheme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeBtn(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            theme = theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('lincleTheme', theme);
            updateThemeBtn(theme);
        });
    }

    function updateThemeBtn(theme) {
        if (typeof lincleDict !== "undefined") {
            themeToggle.textContent = theme === 'dark' ? lincleDict[currentLang].themeLight : lincleDict[currentLang].themeDark;
        } else {
            themeToggle.textContent = theme === 'dark' ? 'Açık Mod' : 'Koyu Mod';
        }
    }

    // 3. KALKAN KONTROLÜ
    const masterToggle = document.getElementById('masterToggle');
    if (masterToggle) {
        chrome.storage.local.get("lincleSettings", (data) => {
            const settings = data.lincleSettings || {};
            masterToggle.checked = settings.isActive !== false;
        });

        masterToggle.addEventListener('change', (e) => {
            chrome.storage.local.set({ lincleSettings: { isActive: e.target.checked } });
        });
    }

    // 4. İSTATİSTİKLERİ YÜKLE (Dinamik Birim Desteği)
    chrome.storage.local.get("lincleStats", (data) => {
        const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
        
        let timeText = "";
        const isTr = (currentLang === 'tr');
        
        if (stats.savedSeconds >= 60) {
            timeText = `${(stats.savedSeconds / 60).toFixed(1)} ${isTr ? 'dk' : 'min'}`;
        } else {
            timeText = `${Math.floor(stats.savedSeconds)} ${isTr ? 'sn' : 'sec'}`;
        }
        
        const valLinks = document.getElementById('valLinks');
        const valTime = document.getElementById('valTime');
        
        if (valLinks) valLinks.textContent = stats.cleanedLinks;
        if (valTime) valTime.textContent = timeText;
    });

    // 5. GELİŞMİŞ AYARLAR BUTONU
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });
    }

    // 6. PANO TEMİZLEYİCİ
    const btnCleanClipboard = document.getElementById('btnCleanClipboard');
    const clipboardStatus = document.getElementById('clipboardStatus');

    if (btnCleanClipboard) {
        btnCleanClipboard.addEventListener('click', async () => {
            let msgs = {
                noLink: "Panoda geçerli bir bağlantı bulunamadı.",
                search: "Bağlantı çözümleniyor...",
                found: "Hedef bulundu ve panoya kopyalandı.",
                fail: "Statik bir hedef bulunamadı."
            };
            
            if (typeof lincleDict !== "undefined") {
                msgs = {
                    noLink: lincleDict[currentLang].clipNoLink,
                    search: lincleDict[currentLang].clipSearch,
                    found: lincleDict[currentLang].clipFound,
                    fail: lincleDict[currentLang].clipFail
                };
            }

            try {
                const text = await navigator.clipboard.readText();
                if (!text.startsWith('http')) {
                    showStatus(msgs.noLink, "var(--danger)");
                    return;
                }

                showStatus(msgs.search, "var(--primary)");

                const response = await fetch(text.trim());
                const html = await response.text();
                const match = html.match(/(?:var\s+url\s*=\s*|url=)['"]([^'"]+)['"]/i);
                
                if (match && match[1] && match[1].startsWith('http')) {
                    await navigator.clipboard.writeText(match[1]);
                    showStatus(msgs.found, "var(--success)");
                } else {
                    showStatus(msgs.fail, "var(--danger)");
                }
            } catch (err) {
                showStatus(msgs.noLink, "var(--danger)");
            }
        });
    }

    function showStatus(msg, color) {
        if (clipboardStatus) {
            clipboardStatus.style.color = color;
            clipboardStatus.textContent = msg;
            clipboardStatus.style.display = "block";
        }
    }
}