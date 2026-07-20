// Lincle Resolver v2.3 - Master Kill Switch & Global Heuristic
// Developed by: Emir Samed (Nyxa48)
const lincleStartTime = performance.now();

(function () {
    const STORAGE_KEY = "lincleDomains";
    const EXCLUDE_KEY = "lincleExcluded";
    const SETTINGS_KEY = "lincleSettings";
    const MAX_WAIT_MS = 20000;

    const GLOBAL_EXCLUDE_LIST = [
        "github.com",
        "google.com",
        "youtube.com",
        "twitter.com",
        "x.com",
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "reddit.com",
        "stackoverflow.com",
        "wikipedia.org",
        "microsoft.com",
        "apple.com",
        "whatsapp.com",
        "telegram.org",
        "amazon.com",
        "netflix.com",
        "pixeldrain.com",
    ];

    const DEFAULT_KNOWN_SHORTENERS = [
        "bc.vc",
        "adf.ly",
        "linkvertise.com",
        "link-to.net",
        "ouo.io",
        "exe.io",
        "gplinks.in",
        "gplinks.co",
        "shrinkme.io",
        "shorte.st",
        "adfoc.us",
        "sub2unlock.com",
        "mboost.me",
        "droplink.co",
        "clk.sh",
        "tii.la",
    ];

    const AD_DOMAIN_BLOCKLIST = [
        "doubleclick.net",
        "googlesyndication.com",
        "google-analytics.com",
        "amazon-adsystem.com",
        "taboola.com",
        "outbrain.com",
        "propellerads.com",
        "popads.net",
        "adsterra.com",
        "exoclick.com",
        "googletagmanager.com",
        "facebook.com",
    ];

    const SKIP_KEYWORDS = [
        "continue",
        "skip ad",
        "skip",
        "get link",
        "proceed",
        "i understand",
        "reveal link",
        "show link",
        "get destination",
        "download",
        "next",
        "devam et",
        "devam",
        "linke git",
        "linki göster",
        "indir",
        "geç",
        "reklamı geç",
        "saltar",
        "saltar anuncio",
        "continuar",
        "siguiente",
        "obtener enlace",
        "descargar",
        "pular",
        "pular anúncio",
        "obter link",
        "próximo",
        "baixar",
        "пропустить",
        "пропустить рекламу",
        "продолжить",
        "получить ссылку",
        "далее",
        "скачать",
        "überspringen",
        "weiter",
        "link erhalten",
        "herunterladen",
        "passer",
        "passer l'annonce",
        "continuer",
        "suivant",
        "obtenir le lien",
        "télécharger",
        "salta",
        "salta annuncio",
        "continua",
        "avanti",
        "ottieni link",
        "scarica",
        "lewati",
        "lewati iklan",
        "lanjutkan",
        "berikutnya",
        "dapatkan tautan",
        "unduh",
        "pomiń",
        "pomiń reklamę",
        "kontynuuj",
        "dalej",
        "pobierz",
        "overslaan",
        "advertentie overslaan",
        "doorgaan",
        "volgende",
        "downloaden",
        "bỏ qua",
        "bỏ qua quảng cáo",
        "tiếp tục",
        "lấy liên kết",
        "tải xuống",
        "ข้าม",
        "ข้ามโฆษณา",
        "ดำเนินการต่อ",
        "รับลิงก์",
        "ดาวน์โหลด",
        "スキップ",
        "広告をスキップ",
        "次へ",
        "続行",
        "リンクを取得",
        "ダウンロード",
        "건너뛰기",
        "광고 건너뛰기",
        "계속",
        "링크 받기",
        "다운로드",
        "跳过",
        "跳过广告",
        "继续",
        "获取链接",
        "下载",
        "下一步",
        "تخطي",
        "تخطي الإعلان",
        "استمرار",
        "متابعة",
        "احصل على الرابط",
        "تحميل",
        "छोड़ें",
        "विज्ञापन छोड़ें",
        "जारी रखें",
        "लिंक प्राप्त करें",
        "डाउनलोड",
    ];

    const GATE_TEXT_PATTERNS = [
        /please\s*wait/i,
        /verifying\s*you'?re\s*human/i,
        /skip\s*ad/i,
        /generat(ing|ed)\s*link/i,
        /destination\s*link/i,
        /your\s*link\s*is\s*ready/i,
        /reklam(ı)?\s*geç/i,
        /link(iniz)?\s*koruma\s*altında/i,
        /devam\s*etmek\s*için\s*bekleyin/i,
        /lütfen\s*bekleyin/i,
        /por\s*favor\s*espere/i,
        /tu\s*enlace\s*está\s*listo/i,
        /seu\s*link\s*está\s*pronto/i,
        /пожалуйста,\s*подождите/i,
        /ссылка\s*готова/i,
        /пропустить\s*рекламу/i,
        /veuillez\s*patienter/i,
        /votre\s*lien\s*est\s*prêt/i,
        /si\s*prega\s*di\s*attendere/i,
        /il\s*tuo\s*link\s*è\s*pronto/i,
        /harap\s*tunggu/i,
        /tautan\s*anda\s*sudah\s*siap/i,
        /bitte\s*warten/i,
        /dein\s*link\s*ist\s*bereit/i,
        /een\s*moment\s*geduld/i,
        /proszę\s*czekać/i,
        /vui\s*lòng\s*chờ/i,
        /กรุณารอสักครู่/i,
        /お待ちください/i,
        /잠시\s*기다려\s*주세요/i,
        /请稍候/i,
        /الرجاء\s*الانتظار/i,
        /कृपया\s*प्रतीक्षा\s*करें/i,
    ];

    const COUNTDOWN_TEXT_PATTERNS = [
        /(?:\b|\s)([0-9]|1[0-9]|2[0-9])\s*(saniye|second|sec|sn|segundos|секунд|sekunden|secondes|secondi|detik|sekund|giây|วินาที|秒|ثانية|सेकंड)/i,
    ];

    const STATIC_REGEXES = [
        /var\s+url\s*=\s*['"]([^'"]+)['"]/,
        /var\s+target_url\s*=\s*['"]([^'"]+)['"]/,
        /window\.location\.href\s*=\s*['"]([^'"]+)['"]/,
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i,
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
            return AD_DOMAIN_BLOCKLIST.some((d) => host.includes(d));
        } catch {
            return true;
        }
    }

    function tryStaticExtraction() {
        const html = document.documentElement.outerHTML;
        for (const pattern of STATIC_REGEXES) {
            const match = html.match(pattern);
            if (
                match &&
                match[1] &&
                isSafeHttpUrl(match[1]) &&
                !isAdOrTrackingUrl(match[1])
            )
                return match[1];
        }
        return null;
    }

    function findSkipButton(customSelector) {
        if (customSelector) {
            const el = document.querySelector(customSelector);
            if (el && el.offsetParent !== null && !el.disabled) return el;
        }
        const candidates = Array.from(
            document.querySelectorAll(
                "a, button, div[role='button'], input[type='button'], input[type='submit']",
            ),
        );
        return (
            candidates.find((el) => {
                if (el.offsetParent === null || el.disabled) return false;
                const text = (el.innerText || el.value || "").trim().toLowerCase();
                const id = (el.id || "").toLowerCase();
                const cls = (el.className || "").toString().toLowerCase();
                return SKIP_KEYWORDS.some((k) => {
                    const flat = k.replace(/\s/g, "");
                    return text.includes(k) || id.includes(flat) || cls.includes(flat);
                });
            }) || null
        );
    }

    function findOutboundLink() {
        const anchors = Array.from(document.querySelectorAll("a[href^='http']"));
        const candidate = anchors.find((a) => {
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

    function looksLikeGatePage(bodyText) {
        return (
            COUNTDOWN_TEXT_PATTERNS.some((r) => r.test(bodyText)) ||
            GATE_TEXT_PATTERNS.some((r) => r.test(bodyText))
        );
    }

    function showBanner(text) {
        let el = document.getElementById("lincle-banner");
        if (!el) {
            el = document.createElement("div");
            el.id = "lincle-banner";
            el.style.cssText =
                "position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#1e1e24;color:#00caf5;font:13px 'Segoe UI',Arial,sans-serif;padding:6px 10px;text-align:center;box-shadow: 0 2px 10px rgba(0,0,0,0.5);";
            (document.body || document.documentElement).appendChild(el);
        }
        el.textContent = text;
    }

    async function goTo(url) {
        // 1. Gerçek işlem süresini ölç (Hardcode yok)
        const executionTimeMs = performance.now() - lincleStartTime;
        const executionTimeSec = executionTimeMs / 1000;

        // Kapsam (Scope) sorunu yaşamamak için değişkeni en dışta tanımlıyoruz
        let savedThisTime = 0;

        try {
            // Veritabanından her şeyi TEK SEFERDE çek (Performans)
            const data = await chrome.storage.local.get(["lincleStats", "lincleOptions", "lincleHistory"]);

            // --- İSTATİSTİK HESAPLAMA ---
            const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
            const options = Object.assign({ assumedGateTime: 10, enableLogging: false }, data.lincleOptions);

            savedThisTime = options.assumedGateTime - executionTimeSec;
            if (savedThisTime < 0) savedThisTime = 0;

            stats.cleanedLinks += 1;
            stats.savedSeconds += savedThisTime;

            // --- YÖNLENDİRME ZİNCİRİ HESAPLAMA ---
            const history = data.lincleHistory || [];
            history.unshift({
                time: new Date().toLocaleTimeString("tr-TR"),
                from: location.href,
                to: url,
                saved: savedThisTime.toFixed(1),
            });

            if (history.length > 15) history.pop();

            // İkisini TEK SEFERDE veritabanına yaz (Best Practice)
            await chrome.storage.local.set({
                lincleStats: stats,
                lincleHistory: history
            });

            if (options.enableLogging) {
                console.log(`[Lincle] Atlatıldı. İşlem süresi: ${executionTimeSec.toFixed(3)}s | Kazandırılan: ${savedThisTime.toFixed(2)}s`);
            }

        } catch (e) {
            console.error("Lincle Veri Kaydetme Hatası:", e);
        }

        // Hedefe git
        setTimeout(() => {
            location.href = url;
        }, 500);
    }

    async function isDomainExcluded(host) {
        try {
            if (GLOBAL_EXCLUDE_LIST.some((d) => host === d || host.endsWith("." + d)))
                return true;
            const data = await chrome.storage.local.get(EXCLUDE_KEY);
            const list = data[EXCLUDE_KEY] || [];
            return list.some((d) => host === d || host.endsWith("." + d));
        } catch {
            return false;
        }
    }

    async function getTrustedEntry(host) {
        try {
            if (
                DEFAULT_KNOWN_SHORTENERS.some(
                    (d) => host === d || host.endsWith("." + d),
                )
            )
                return { domain: host };
            const data = await chrome.storage.local.get(STORAGE_KEY);
            const list = data[STORAGE_KEY] || [];
            return (
                list.find((d) => host === d.domain || host.endsWith("." + d.domain)) ||
                null
            );
        } catch {
            return null;
        }
    }

    // YENİ: Kalkanın durumunu soran (Ana Şalter Kontrolü) fonksiyon
    async function getMasterKillSwitchSetting() {
        try {
            const data = await chrome.storage.local.get(SETTINGS_KEY);
            return (data[SETTINGS_KEY] || {}).isActive !== false; // Varsayılanı true (açık)
        } catch {
            return true;
        }
    }

    function runActiveResolver(customSelector) {
        showBanner("Lincle: Sayfa analiz ediliyor...");
        const startedAt = Date.now();
        let clicked = false;
        let observer = null;
        let throttleTimer = null;

        function evaluateDOM() {
            if (Date.now() - startedAt > MAX_WAIT_MS) {
                if (observer) observer.disconnect();
                showBanner("Lincle: Otomatik atlanamadı. Lütfen manuel tıklayın.");
                return true;
            }

            const url = tryStaticExtraction();
            if (url) {
                if (observer) observer.disconnect();
                goTo(url);
                return true;
            }

            const outbound = findOutboundLink();
            if (outbound) {
                if (observer) observer.disconnect();
                goTo(outbound);
                return true;
            }

            if (!clicked) {
                const btn = findSkipButton(customSelector);
                if (btn) {
                    clicked = true;
                    btn.click();
                }
            }
            return false;
        }

        if (evaluateDOM()) return;

        observer = new MutationObserver(() => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                throttleTimer = null;
                evaluateDOM();
            }, 250);
        });

        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["disabled", "class", "style"],
        });

        setTimeout(() => {
            if (observer) observer.disconnect();
            evaluateDOM();
        }, MAX_WAIT_MS + 100);
    }

    async function init() {
        // EN ÖNEMLİ KISIM: Kalkan Kapalıysa Lincle hiçbir kod çalıştırmadan direkt çıkar.
        const isLincleActive = await getMasterKillSwitchSetting();
        if (!isLincleActive) return;

        const host = location.hostname;
        if (await isDomainExcluded(host)) return;

        const staticUrl = tryStaticExtraction();
        if (staticUrl) {
            goTo(staticUrl);
            return;
        }

        const trusted = await getTrustedEntry(host);
        if (trusted) {
            runActiveResolver(trusted.skipSelector || null);
            return;
        }

        const bodyText = (document.body ? document.body.innerText : "").slice(
            0,
            4000,
        );
        if (!!findSkipButton(null) && looksLikeGatePage(bodyText)) {
            runActiveResolver(null);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Kısayol (Keyboard Shortcut) ile manuel tetikleme emrini dinle
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "manualBypass") {
            console.log("[Lincle] Kısayol ile manuel tarama zorla tetiklendi!");
            // Güvenlik kontrollerini (Beyaz liste, kapı metni vs.) umursamadan, 
            // doğrudan sayfadaki butonları tarayan ve tıklayan ana fonksiyonu başlat.
            runActiveResolver(null);
        }
    });
})();
