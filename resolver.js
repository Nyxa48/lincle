// Lincle Resolver v2.1 - Global Heuristic & Optimized Observer
// Developed by: Emir Samed (Nyxa48)

(function () {
    const STORAGE_KEY = "lincleDomains";
    const EXCLUDE_KEY = "lincleExcluded";
    const SETTINGS_KEY = "lincleSettings";
    const MAX_WAIT_MS = 20000;

    const AD_DOMAIN_BLOCKLIST = [
        "doubleclick.net", "googlesyndication.com", "google-analytics.com",
        "amazon-adsystem.com", "taboola.com", "outbrain.com",
        "propellerads.com", "popads.net", "adsterra.com", "exoclick.com",
        "googletagmanager.com", "facebook.com"
    ];

    // Global SKIP KEYWORDS (TR, EN, ES, RU, PT, DE)
    const SKIP_KEYWORDS = [
        "continue", "skip ad", "skip", "get link", "devam et", "devam",
        "linke git", "proceed", "i understand", "reveal link", "show link",
        "get destination", "linki göster", "download", "indir",
        "saltar", "saltar anuncio", "пропустить", "получить ссылку", 
        "pular", "pular anúncio", "überspringen", "weiter"
    ];

    // Global GATE PATTERNS
    const GATE_TEXT_PATTERNS = [
        /reklam(ı)?\s*geç/i, /link(iniz)?\s*koruma\s*altında/i, /devam\s*etmek\s*için\s*bekleyin/i,
        /please\s*wait/i, /verifying\s*you'?re\s*human/i, /skip\s*ad/i,
        /generat(ing|ed)\s*link/i, /destination\s*link/i, /your\s*link\s*is\s*ready/i,
        /wait\s*\d+\s*seconds?/i, /por\s*favor\s*espere/i, /пожалуйста,\s*подождите/i
    ];

    // Global COUNTDOWN PATTERNS
    const COUNTDOWN_TEXT_PATTERNS = [
        /\b([0-9]|1[0-9]|2[0-9])\s*(saniye|second|sec|sn|segundos|секунд|sekunden)\b/i
    ];

    const STATIC_REGEXES = [
        /var\s+url\s*=\s*['"]([^'"]+)['"]/,
        /var\s+target_url\s*=\s*['"]([^'"]+)['"]/,
        /window\.location\.href\s*=\s*['"]([^'"]+)['"]/,
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i
    ];

    function isSafeHttpUrl(value) {
        try {
            const u = new URL(value, location.href);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch { return false; }
    }

    function isAdOrTrackingUrl(value) {
        try {
            const host = new URL(value, location.href).hostname;
            return AD_DOMAIN_BLOCKLIST.some(d => host.includes(d));
        } catch { return true; }
    }

    function tryStaticExtraction() {
        const html = document.documentElement.outerHTML;
        for (const pattern of STATIC_REGEXES) {
            const match = html.match(pattern);
            if (match && match[1] && isSafeHttpUrl(match[1]) && !isAdOrTrackingUrl(match[1])) {
                return match[1];
            }
        }
        return null;
    }

    function findSkipButton(customSelector) {
        if (customSelector) {
            const el = document.querySelector(customSelector);
            if (el && el.offsetParent !== null && !el.disabled) return el;
        }
        const candidates = Array.from(document.querySelectorAll(
            "a, button, div[role='button'], input[type='button'], input[type='submit']"
        ));
        return candidates.find(el => {
            if (el.offsetParent === null || el.disabled) return false;
            const text = (el.innerText || el.value || "").trim().toLowerCase();
            const id = (el.id || "").toLowerCase();
            const cls = (el.className || "").toString().toLowerCase();
            return SKIP_KEYWORDS.some(k => {
                const flat = k.replace(/\s/g, "");
                return text.includes(k) || id.includes(flat) || cls.includes(flat);
            });
        }) || null;
    }

    function findOutboundLink() {
        const anchors = Array.from(document.querySelectorAll("a[href^='http']"));
        const candidate = anchors.find(a => {
            const href = a.getAttribute("href");
            if (!isSafeHttpUrl(href) || isAdOrTrackingUrl(href)) return false;
            try { return new URL(href, location.href).hostname !== location.hostname; } 
            catch { return false; }
        });
        return candidate ? candidate.href : null;
    }

    function looksLikeGatePage(bodyText) {
        return COUNTDOWN_TEXT_PATTERNS.some(r => r.test(bodyText)) || GATE_TEXT_PATTERNS.some(r => r.test(bodyText));
    }

    function showBanner(text) {
        let el = document.getElementById("lincle-banner");
        if (!el) {
            el = document.createElement("div");
            el.id = "lincle-banner";
            el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;" +
                "background:#1e1e24;color:#00caf5;font:13px 'Segoe UI',Arial,sans-serif;" +
                "padding:6px 10px;text-align:center;box-shadow: 0 2px 10px rgba(0,0,0,0.5);";
            (document.body || document.documentElement).appendChild(el);
        }
        el.textContent = text;
    }

    function goTo(url) {
        showBanner("Lincle: Temiz linke yönlendiriliyor...");
        setTimeout(() => { location.href = url; }, 300);
    }

    async function isDomainExcluded() {
        try {
            const data = await chrome.storage.local.get(EXCLUDE_KEY);
            const list = data[EXCLUDE_KEY] || [];
            return list.some(d => location.hostname === d || location.hostname.endsWith("." + d));
        } catch { return false; }
    }

    async function getTrustedEntry() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEY);
            const list = data[STORAGE_KEY] || [];
            return list.find(d => location.hostname === d.domain || location.hostname.endsWith("." + d.domain)) || null;
        } catch { return null; }
    }

    async function getAutoDetectSetting() {
        try {
            const data = await chrome.storage.local.get(SETTINGS_KEY);
            return (data[SETTINGS_KEY] || {}).autoDetect !== false;
        } catch { return true; }
    }

    function runActiveResolver(customSelector) {
        showBanner("Lincle: Sayfa analiz ediliyor...");
        const startedAt = Date.now();
        let clicked = false;
        let observer = null;
        let throttleTimer = null;

        // Çözüm mantığını yürüten ana fonksiyon
        function evaluateDOM() {
            if (Date.now() - startedAt > MAX_WAIT_MS) {
                if (observer) observer.disconnect();
                showBanner("Lincle: Otomatik atlanamadı. Lütfen manuel tıklayın.");
                return true; // İşlemi durdur
            }

            const url = tryStaticExtraction();
            if (url) { if (observer) observer.disconnect(); goTo(url); return true; }

            const outbound = findOutboundLink();
            if (outbound) { if (observer) observer.disconnect(); goTo(outbound); return true; }

            if (!clicked) {
                const btn = findSkipButton(customSelector);
                if (btn) {
                    clicked = true;
                    btn.click();
                }
            }
            return false; // Aramaya devam et
        }

        // 1. Sayfa yüklendiğinde ilk kontrolü yap
        if (evaluateDOM()) return;

        // 2. Performans Dostu MutationObserver (Sürekli tarama yerine DOM değiştiğinde çalışır)
        observer = new MutationObserver(() => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
                evaluateDOM();
            }, 250); // 250ms Throttle ile işlemciyi korur
        });

        observer.observe(document.body || document.documentElement, {
            childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'class', 'style']
        });

        // Emniyet sübabı: Maksimum süre dolduğunda observer'ı kapat
        setTimeout(() => {
            if (observer) observer.disconnect();
            evaluateDOM();
        }, MAX_WAIT_MS + 100);
    }

    async function init() {
        if (await isDomainExcluded()) return;

        const staticUrl = tryStaticExtraction();
        if (staticUrl) { goTo(staticUrl); return; }

        const trusted = await getTrustedEntry();
        if (trusted) {
            runActiveResolver(trusted.skipSelector || null);
            return;
        }

        const autoDetectOn = await getAutoDetectSetting();
        if (!autoDetectOn) return;

        const bodyText = (document.body ? document.body.innerText : "").slice(0, 4000);
        if (!!findSkipButton(null) && looksLikeGatePage(bodyText)) {
            runActiveResolver(null);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();