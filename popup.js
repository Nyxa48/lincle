// Lincle - İstemci Taraflı Güvenli Çözücü Motoru + Domain Yöneticisi

const STORAGE_KEY = "lincleDomains";
const DEFAULT_DOMAINS = ["bc.vc", "adf.ly"];

document.addEventListener('DOMContentLoaded', async () => {
    const currentTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const tabUrl = currentTab ? new URL(currentTab.url) : null;
    const continueParam = tabUrl ? tabUrl.searchParams.get("continue") : null;

    if (continueParam) {
        document.getElementById('resolveView').style.display = 'block';
        runResolver(currentTab, continueParam);
    } else {
        document.getElementById('manageView').style.display = 'block';
        initManager();
    }
});

function isSafeHttpUrl(value) {
    try {
        const u = new URL(value);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

async function runResolver(currentTab, rawTarget) {
    const infoText = document.getElementById('info');
    const spinner = document.getElementById('spinner');

    // Güvenlik: 'continue' parametresi sadece http/https olabilir.
    // Bu kontrol olmadan popup.html'e keyfi bir 'javascript:' veya
    // 'data:' adresi enjekte edilip yönlendirme tetiklenebilir.
    if (!isSafeHttpUrl(rawTarget)) {
        infoText.innerText = "Temizlenecek geçerli bir yönlendirme linki bulunamadı.";
        spinner.style.display = "none";
        return;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(rawTarget, {
            method: 'GET',
            credentials: 'omit', // çerezleri ve izleri tamamen gizle
            redirect: 'follow',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Kaynak siteye erişilemedi.");
        const htmlText = await response.text();

        const regexPatterns = [
            /var\s+url\s*=\s*['"]([^'"]+)['"]/,
            /var\s+target_url\s*=\s*['"]([^'"]+)['"]/,
            /window\.location\.href\s*=\s*['"]([^'"]+)['"]/,
            /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i
        ];

        let cleanDestination = null;
        for (const pattern of regexPatterns) {
            const match = htmlText.match(pattern);
            if (match && match[1] && isSafeHttpUrl(match[1])) {
                cleanDestination = match[1];
                break;
            }
        }

        if (cleanDestination) {
            infoText.innerHTML = "Link başarıyla temizlendi! <br><span style='color:#2ecc71;'>Güvenli alana uçuyorsunuz...</span>";
            setTimeout(() => chrome.tabs.update(currentTab.id, { url: cleanDestination }), 800);
        } else {
            infoText.innerText = "Otomatik çözülemedi. Orijinal siteye yönlendiriliyorsunuz...";
            setTimeout(() => chrome.tabs.update(currentTab.id, { url: rawTarget }), 1500);
        }
    } catch (error) {
        console.error("Lincle Çözüm Hatası:", error);
        infoText.innerText = "Bağlantı hatası oluştu. Orijinal siteye yönlendiriliyorsunuz...";
        setTimeout(() => chrome.tabs.update(currentTab.id, { url: rawTarget }), 1500);
        spinner.style.display = "none";
    }
}

async function initManager() {
    const listEl = document.getElementById('domainList');
    const input = document.getElementById('newDomain');
    const addBtn = document.getElementById('addDomainBtn');

    async function loadDomains() {
        const data = await chrome.storage.local.get(STORAGE_KEY);
        return (data[STORAGE_KEY] && data[STORAGE_KEY].length) ? data[STORAGE_KEY] : DEFAULT_DOMAINS;
    }

    async function saveDomains(domains) {
        await chrome.storage.local.set({ [STORAGE_KEY]: domains });
        // background.js'e kuralları yenilemesini söyle
        chrome.runtime.sendMessage({ type: "LINCLE_DOMAINS_UPDATED" });
    }

    async function render() {
        const domains = await loadDomains();
        listEl.innerHTML = '';
        domains.forEach(domain => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = domain;
            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadDomains()).filter(d => d !== domain);
                await saveDomains(updated);
                render();
            });
            li.appendChild(span);
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }

    addBtn.addEventListener('click', async () => {
        const raw = input.value.trim().toLowerCase();
        if (!raw) return;
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(raw)) {
            alert("Geçerli bir domain girin, örn: kisalt.co");
            return;
        }
        const domains = await loadDomains();
        if (!domains.includes(raw)) {
            domains.push(raw);
            await saveDomains(domains);
        }
        input.value = '';
        render();
    });

    render();
}
