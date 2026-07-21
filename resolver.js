// Lincle Resolver v2.5 - Cross-Browser, Multi-Language, Hardened
// Developed by: Emir Samed (Nyxa48)
const lincleStartTime = performance.now();

(function () {
    // Cross-browser shim: Firefox/Safari expose 'browser' (Promise-based).
    // Chrome MV3 'chrome' also returns Promises when no callback is given.
    const ext = (typeof browser !== "undefined") ? browser : chrome;

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
        // Content/download index sites — these are NOT ad-gate pages.
        // Lincle running here caused wrong-link redirects (steamrip bug).
        "steamrip.com",
        "fitgirl-repacks.site",
        "cs.rin.ru",
        "megadb.net",
        "gofile.io",
        "mediafire.com",
        "1fichier.com",
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
        // Hindi
        "छोड़ें",
        "विज्ञापन छोड़ें",
        "जारी रखें",
        "लिंक प्राप्त करें",
        "डाउनलोड",
        // Spanish (already partially present above, extended here)
        "omitir", "omitir anuncio", "ir al enlace", "ir al link", "obtener link",
        "acceder", "continua", "ir a descarga",
        // Portuguese
        "pular", "pular anúncio", "obter link", "ir para o link", "acessar",
        "baixar", "próximo", "continuar", "ir para download",
        // Italian
        "salta", "salta annuncio", "ottieni link", "vai al link", "accedi",
        "scarica", "avanti", "continua", "vai al download",
        // Russian
        "пропустить", "пропустить рекламу", "получить ссылку", "перейти",
        "скачать", "далее", "продолжить", "к загрузке",
        // Danish
        "spring over", "spring reklame over", "hent link", "gå til link",
        "download", "næste", "fortsæt", "gå til download", "få link",
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
        // Spanish
        /por\s*favor\s*espere/i, /tu\s*enlace\s*est[aá]\s*listo/i,
        /generando\s*enlace/i, /enlace\s*de\s*destino/i, /verificando/i,
        // Portuguese
        /seu\s*link\s*est[aá]\s*pronto/i, /aguarde\s*por\s*favor/i,
        /gerando\s*link/i, /link\s*de\s*destino/i, /verificando/i,
        // Italian
        /il\s*tuo\s*link\s*[eè]\s*pronto/i, /si\s*prega\s*di\s*attendere/i,
        /generazione\s*link/i, /link\s*di\s*destinazione/i, /verifica\s*in\s*corso/i,
        // Russian
        /пожалуйста,?\s*подождите/i, /ссылка\s*готова/i,
        /генерация\s*ссылки/i, /проверка/i, /пропустить\s*рекламу/i,
        // Danish
        /vent\s*venligst/i, /dit\s*link\s*er\s*klar/i,
        /genererer\s*link/i, /bekræfter/i, /spring\s*reklame\s*over/i,
    ];

    const COUNTDOWN_TEXT_PATTERNS = [
        // Added: DA=sekunder, ES=segundos, PT=segundos, IT=secondi, RU=секунд(ы)
        /(?:\b|\s)([0-9]|1[0-9]|2[0-9])\s*(saniye|second|seconds|sec|sn|segundos|segundo|секунд|секунды|sekunden|secondes|secondi|detik|sekund|sekunder|giây|วินาที|秒|ثانية|सेकंड)/i,
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

    // Bug fix v2.5: was always [] — now populated from storage before resolver runs.
    let CUSTOM_STATIC_REGEXES = [];
    async function loadCustomRegexes() {
        try {
            const data = await ext.storage.local.get("lincleCustomRegex");
            const raw = data.lincleCustomRegex || [];
            CUSTOM_STATIC_REGEXES = raw
                .map(r => { try { return new RegExp(r, "i"); } catch { return null; } })
                .filter(Boolean);
        } catch { /* non-fatal — keep empty */ }
    }

    // Mevcut tryStaticExtraction fonksiyonunu bununla değiştir:
    function tryStaticExtraction() {
        const html = document.documentElement.outerHTML;

        // Hem varsayılan hem de kullanıcının eklediği özel regexleri birleştir
        const allRegexes = [...STATIC_REGEXES, ...CUSTOM_STATIC_REGEXES];

        for (const pattern of allRegexes) {
            try {
                const match = html.match(pattern);
                if (match && match[1] && isSafeHttpUrl(match[1]) && !isAdOrTrackingUrl(match[1])) {
                    return match[1];
                }
            } catch (e) { continue; } // Geçersiz regex girildiyse sistemi çökertme
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

    // Scores an <a> element by how likely it is to be THE download/destination link.
    // Returns a number: higher = more confident. Returns -1 to exclude entirely.
    function scoreAnchor(a) {
        const href = a.getAttribute("href");
        if (!href || !isSafeHttpUrl(href) || isAdOrTrackingUrl(href)) return -1;
        try {
            if (new URL(href, location.href).hostname === location.hostname) return -1;
        } catch { return -1; }

        let score = 0;

        // Penalise links inside navigation/header/footer/sidebar — these are almost
        // never the download target but are often the *first* external link in the DOM.
        const badParents = ["nav", "header", "footer", "aside"];
        let node = a.parentElement;
        while (node) {
            const tag = node.tagName ? node.tagName.toLowerCase() : "";
            const cls = (node.className || "").toString().toLowerCase();
            const id  = (node.id || "").toLowerCase();
            if (badParents.includes(tag)) { score -= 20; break; }
            if (/\b(nav|menu|sidebar|widget|related|recommend|sponsor|ad[-_]|advertisement)\b/.test(cls + id)) {
                score -= 15; break;
            }
            node = node.parentElement;
        }

        // Reward links inside content / article / main
        node = a.parentElement;
        while (node) {
            const tag = node.tagName ? node.tagName.toLowerCase() : "";
            const cls = (node.className || "").toString().toLowerCase();
            const id  = (node.id || "").toLowerCase();
            if (["main", "article", "section"].includes(tag)) { score += 10; break; }
            if (/\b(content|post|entry|download[-_]?(?:area|box|section|wrap)?|link[-_]?(?:box|area|wrap)?)\b/.test(cls + id)) {
                score += 10; break;
            }
            node = node.parentElement;
        }

        // Reward anchor text / attributes that signal "this is the download link"
        const text = (a.innerText || a.textContent || "").trim().toLowerCase();
        const cls  = (a.className || "").toString().toLowerCase();
        const id   = (a.id || "").toLowerCase();
        const combined = text + " " + cls + " " + id;
        if (/\b(download|get\s*link|mega|pixeldrain|gofile|mediafire|filehost|direct\s*link|mirror)\b/.test(combined)) score += 15;
        if (/\b(wfl[_-]?button|btn[-_]?download|download[-_]?btn|dl[-_]?btn)\b/.test(cls + id)) score += 20;

        // Penalise obvious non-targets
        if (/\b(comment|share|tweet|facebook|pinterest|whatsapp|telegram|discord|reddit|instagram)\b/.test(combined)) score -= 25;
        if (/\b(privacy|terms|cookie|about|contact|faq|support|advertis)\b/.test(text)) score -= 20;

        // Reward if the link's hostname looks like a known file host
        try {
            const host = new URL(href, location.href).hostname;
            if (/megadb|pixeldrain|gofile|mediafire|1fichier|rapidgator|uploaded|filecrypt|mixdrop|ddownload|usersdrive/.test(host)) score += 25;
        } catch { /* ignore */ }

        return score;
    }

    function findOutboundLink() {
        const anchors = Array.from(document.querySelectorAll("a[href^='http'], a[href^='https']"));
        let best = null;
        let bestScore = -1; // must beat this to be a candidate

        for (const a of anchors) {
            const s = scoreAnchor(a);
            if (s > bestScore) { bestScore = s; best = a; }
        }

        // Require a minimum positive confidence score to avoid grabbing random nav links
        return (best && bestScore >= 0) ? best.href : null;
    }

    function looksLikeGatePage(bodyText) {
        // A countdown timer is a very strong standalone signal
        if (COUNTDOWN_TEXT_PATTERNS.some(r => r.test(bodyText))) return true;

        // Gate phrases alone aren't enough — require at least 2 distinct matches
        // to avoid false-positives on normal content pages (e.g. steamrip) that
        // have "download" in buttons but are not ad-gate pages.
        const matchCount = GATE_TEXT_PATTERNS.filter(r => r.test(bodyText)).length;
        return matchCount >= 2;
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
            const data = await ext.storage.local.get(["lincleStats", "lincleOptions", "lincleHistory"]);

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
            await ext.storage.local.set({
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
            const data = await ext.storage.local.get(EXCLUDE_KEY);
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
            const data = await ext.storage.local.get(STORAGE_KEY);
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
            const data = await ext.storage.local.get(SETTINGS_KEY);
            return (data[SETTINGS_KEY] || {}).isActive !== false; // Varsayılanı true (açık)
        } catch {
            return true;
        }
    }

    async function runActiveResolver(customSelector) {
        showBanner("Lincle: Sayfa analiz ediliyor...");
        const startedAt = Date.now();
        let clicked = false;
        let observer = null;
        let throttleTimer = null;

        const data = await ext.storage.local.get("lincleOptions");
        const maxWaitMs = (data.lincleOptions?.maxWaitTime || 20) * 1000;

        function evaluateDOM() {
            // 1. ZAMAN AŞIMI (TIMEOUT) VE HATA RAPORU
            if (Date.now() - startedAt > maxWaitMs) {
                if (observer) observer.disconnect();

                // Etkileşimli (İsteğe bağlı) Hata Raporu UI
                let el = document.getElementById("lincle-banner");
                if (el) {
                    el.innerHTML = `Lincle: Otomatik atlanamadı. 
            <button id="lincle-report-btn" style="background:#d63031;color:white;border:none;border-radius:4px;padding:4px 8px;margin-left:10px;cursor:pointer;font-weight:bold;">🐞 Bunu Raporla</button>`;

                    document.getElementById('lincle-report-btn').addEventListener('click', async () => {
                        // Sitedeki hangi kelimeler bizim listemizle eşleşti?
                        const bodyText = (document.body.innerText || "").slice(0, 3000);
                        const matchedGates = GATE_TEXT_PATTERNS.filter(p => p.test(bodyText)).map(p => p.source);

                        const report = {
                            date: new Date().toLocaleString('tr-TR'),
                            url: location.href,
                            host: location.hostname,
                            gatePhrases: matchedGates.length > 0 ? matchedGates : ["Kapı metni bulunamadı"],
                            error: "Timeout (Bekleme süresi aşıldı, buton veya link bulunamadı)"
                        };

                        // Yalnızca YEREL depolamaya kaydet (Privacy)
                        const repData = await ext.storage.local.get("lincleFailures");
                        const failures = repData.lincleFailures || [];
                        failures.push(report);
                        await ext.storage.local.set({ lincleFailures: failures });

                        el.innerHTML = "✅ Rapor yerel olarak kaydedildi. Lütfen Ayarlar'dan geliştiriciye iletin.";
                        setTimeout(() => el.remove(), 4000);
                    });
                }
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
        // Load custom regexes from storage FIRST (bug fix: was never called before)
        await loadCustomRegexes();

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
    ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "manualBypass") {
            console.log("[Lincle] Kısayol ile manuel tarama zorla tetiklendi!");
            // Güvenlik kontrollerini (Beyaz liste, kapı metni vs.) umursamadan, 
            // doğrudan sayfadaki butonları tarayan ve tıklayan ana fonksiyonu başlat.
            runActiveResolver(null);
        }
    });
})();
