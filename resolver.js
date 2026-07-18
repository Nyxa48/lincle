// Lincle Resolver v2 - artık HER sayfaya enjekte edilir (manifest'teki
// content_scripts sayesinde), domain'i elle eklemene gerek yok.
//
// Ama bu yüzden çok dikkatli davranmak zorunda: normal bir sitede rastgele
// "Devam Et" / "Continue" butonuna basmak istemeyiz (ör. bir checkout
// akışını bozabilir). Bu yüzden üç katmanlı çalışır:
//
//   Katman 0 (her zaman güvenli): sayfa kaynağında klasik
//     `var url = "..."` gibi bir kalıp var mı? Varsa direkt oraya git.
//     Bu hiçbir şeye tıklamaz, sadece statik metni okur.
//
//   Katman 1 (önceden bilinen / kullanıcı onaylı siteler): domains.json
//     ile gelen bilinen kısaltıcılar ya da popup'tan "güvenilir" olarak
//     eklenmiş domainler -> otomatik buton tıklama + link izleme devrede.
//
//   Katman 2 (otomatik algılama, YENİ): bilmediğimiz bir domain olsa
//     bile, sayfada hem (a) "devam et/skip" gibi görünür bir buton HEM DE
//     (b) geri sayım sayacı ya da "reklamı geç / link koruma altında /
//     please wait" gibi kapı sayfası ifadeleri varsa, bunu bir kısaltıcı
//     sayfası kabul edip aynı akışı çalıştırır. Sadece reklam scripti
//     olması (ör. Google Ads) YETERLİ DEĞİL çünkü internetteki neredeyse
//     her site reklam/analitik scripti kullanıyor - bu tek başına sinyal
//     olarak kullanılırsa normal sitelerde yanlış tetiklenir. Buton +
//     geri sayım/kapı-metni kombinasyonu çok daha nadir ve kısaltıcılara
//     özgü bir kalıp.
//
// Hiçbir katman eşleşmezse script sessizce hiçbir şey yapmadan çıkar.

(function () {
    const STORAGE_KEY = "lincleDomains";     // bilinen / güvenilir domainler (opsiyonel skipSelector ile)
    const EXCLUDE_KEY = "lincleExcluded";    // kullanıcının hiç dokunulmasını istemediği domainler
    const SETTINGS_KEY = "lincleSettings";   // { autoDetect: true/false }
    const MAX_WAIT_MS = 20000;
    const POLL_MS = 400;

    // Sadece bilgi amaçlı / gelecekte kullanılmak üzere tutulan reklam ağı listesi.
    // NOT: Katman 2 tetiklemesinde TEK BAŞINA kullanılmıyor (bkz. yukarıdaki not).
    const AD_DOMAIN_BLOCKLIST = [
        "doubleclick.net", "googlesyndication.com", "google-analytics.com",
        "amazon-adsystem.com", "taboola.com", "outbrain.com",
        "propellerads.com", "popads.net", "adsterra.com", "exoclick.com",
        "googletagmanager.com", "facebook.com"
    ];

    const SKIP_KEYWORDS = [
        "continue", "skip ad", "skip", "get link", "devam et", "devam",
        "linke git", "proceed", "i understand", "reveal link", "show link",
        "get destination", "linki göster", "download", "indir"
    ];

    // Katman 2 için: "kapı sayfası" ifadeleri (link kısaltıcılara özgü).
    const GATE_TEXT_PATTERNS = [
        /reklam(ı)?\s*geç/i,
        /link(iniz)?\s*koruma\s*altında/i,
        /devam\s*etmek\s*için\s*bekleyin/i,
        /please\s*wait/i,
        /verifying\s*you'?re\s*human/i,
        /skip\s*ad/i,
        /generat(ing|ed)\s*link/i,
        /destination\s*link/i,
        /your\s*link\s*is\s*ready/i,
        /wait\s*\d+\s*seconds?/i
    ];

    // Katman 2 için: geri sayım sayacı ifadeleri.
    const COUNTDOWN_TEXT_PATTERNS = [
        /\b([0-9]|1[0-9]|2[0-9])\s*(saniye|second|sec|sn)\b/i
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

    // Katman 2: sayfa gerçekten bir "kısaltıcı kapısı" gibi mi davranıyor?
    // Buton bulunması TEK BAŞINA yetmez (normal sitelerde de "Devam Et"
    // olur) - geri sayım veya kapı-metni ile birlikte olması gerekiyor.
    function looksLikeGatePage(bodyText) {
        const hasCountdown = COUNTDOWN_TEXT_PATTERNS.some(r => r.test(bodyText));
        const hasGatePhrase = GATE_TEXT_PATTERNS.some(r => r.test(bodyText));
        return hasCountdown || hasGatePhrase;
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

    async function isDomainExcluded() {
        try {
            const data = await chrome.storage.local.get(EXCLUDE_KEY);
            const list = data[EXCLUDE_KEY] || [];
            return list.some(d => location.hostname === d || location.hostname.endsWith("." + d));
        } catch {
            return false;
        }
    }

    async function getTrustedEntry() {
        try {
            const data = await chrome.storage.local.get(STORAGE_KEY);
            const list = data[STORAGE_KEY] || [];
            return list.find(d => location.hostname === d.domain || location.hostname.endsWith("." + d.domain)) || null;
        } catch {
            return null;
        }
    }

    async function getAutoDetectSetting() {
        try {
            const data = await chrome.storage.local.get(SETTINGS_KEY);
            const settings = data[SETTINGS_KEY] || {};
            return settings.autoDetect !== false; // varsayılan: açık
        } catch {
            return true;
        }
    }

    function runActiveResolver(customSelector) {
        showBanner("Lincle: sayfa çözülüyor...");
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

    async function init() {
        if (await isDomainExcluded()) return;

        // Katman 0: her zaman güvenli, hiçbir tıklama gerektirmez.
        const staticUrl = tryStaticExtraction();
        if (staticUrl) { goTo(staticUrl); return; }

        const trusted = await getTrustedEntry();

        // Katman 1: bilinen/güvenilir domain -> direkt aktif çözücüyü başlat.
        if (trusted) {
            runActiveResolver(trusted.skipSelector || null);
            return;
        }

        // Katman 2: otomatik algılama - buton VE (geri sayım veya kapı metni) birlikte olmalı.
        const autoDetectOn = await getAutoDetectSetting();
        if (!autoDetectOn) return;

        const bodyText = (document.body ? document.body.innerText : "").slice(0, 4000);
        const hasButton = !!findSkipButton(null);
        if (hasButton && looksLikeGatePage(bodyText)) {
            runActiveResolver(null);
        }
        // Aksi halde: bu normal bir sayfa, hiçbir şey yapma.
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
