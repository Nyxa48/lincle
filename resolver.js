// Lincle Resolver - izlenen kısaltıcı sayfalarına enjekte edilir.
// Sayfanın kendi JS'ini engellemeden çalışır: önce statik kalıpları dener,
// bulamazsa "devam et / skip" butonunu otomatik tıklamayı dener,
// sonunda gerçek hedef linki bulup kullanıcıyı oraya yönlendirir.

(function () {
    const STORAGE_KEY = "lincleDomains";
    const MAX_WAIT_MS = 20000;
    const POLL_MS = 500;

    const AD_DOMAIN_BLOCKLIST = [
        "doubleclick.net", "googlesyndication.com", "google-analytics.com",
        "amazon-adsystem.com", "taboola.com", "outbrain.com",
        "propellerads.com", "popads.net", "adsterra.com", "exoclick.com",
        "googletagmanager.com", "facebook.com", "googleapis.com"
    ];

    const SKIP_KEYWORDS = [
        "continue", "skip ad", "skip", "get link", "devam et", "devam",
        "linke git", "proceed", "i understand", "reveal link", "show link",
        "get destination", "linki göster"
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
        } catch {
            return false;
        }
    }

    function isAdOrTrackingUrl(value) {
        try {
            const host = new URL(value, location.href).hostname;
            return AD_DOMAIN_BLOCKLIST.some(d => host.includes(d));
        } catch {
            return true;
        }
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
            if (el.offsetParent === null) return false; // görünmüyorsa atla
            if (el.disabled) return false;
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
            try {
                return new URL(href, location.href).hostname !== location.hostname;
            } catch {
                return false;
            }
        });
        return candidate ? candidate.href : null;
    }

    function showBanner(text) {
        let el = document.getElementById("lincle-banner");
        if (!el) {
            el = document.createElement("div");
            el.id = "lincle-banner";
            el.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;" +
                "background:#1e1e24;color:#00caf5;font:13px 'Segoe UI',Arial,sans-serif;" +
                "padding:6px 10px;text-align:center;";
            (document.body || document.documentElement).appendChild(el);
        }
        el.textContent = text;
    }

    function goTo(url) {
        showBanner("Lincle: temiz linke yönlendiriliyor...");
        setTimeout(() => { location.href = url; }, 300);
    }

    async function getSkipSelectorForThisDomain() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEY);
            const list = data[STORAGE_KEY] || [];
            const entry = list.find(d => location.hostname === d.domain || location.hostname.endsWith("." + d.domain));
            return entry && entry.skipSelector ? entry.skipSelector : null;
        } catch {
            return null;
        }
    }

    async function init() {
        const staticUrl = tryStaticExtraction();
        if (staticUrl) { goTo(staticUrl); return; }

        showBanner("Lincle: sayfa çözülüyor...");
        const customSelector = await getSkipSelectorForThisDomain();

        const startedAt = Date.now();
        let clicked = false;

        const timer = setInterval(() => {
            if (Date.now() - startedAt > MAX_WAIT_MS) {
                clearInterval(timer);
                showBanner("Lincle: otomatik atlanamadı. Lütfen sayfadaki butona manuel tıklayın.");
                return;
            }

            const url = tryStaticExtraction();
            if (url) { clearInterval(timer); goTo(url); return; }

            const outbound = findOutboundLink();
            if (outbound) { clearInterval(timer); goTo(outbound); return; }

            if (!clicked) {
                const btn = findSkipButton(customSelector);
                if (btn) {
                    clicked = true;
                    btn.click();
                }
            }
        }, POLL_MS);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
