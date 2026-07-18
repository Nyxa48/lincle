// Lincle - Ayarlar Ekranı
// resolver.js artık HER sayfada çalışıp kendi kararını kendi veriyor
// (bkz. resolver.js Katman 2). Bu popup sadece ince ayar için var:
//  - Otomatik algılamayı aç/kapat
//  - Belirli domainleri "her zaman güvenilir" say (opsiyonel CSS seçici ile)
//  - Belirli domainleri "hiç dokunma" listesine ekle (ör. banka, e-posta)
// Hiçbir ayarı değiştirmesen de uzantı kurulum anında çalışmaya başlar.

const DOMAINS_KEY = "lincleDomains";
const EXCLUDE_KEY = "lincleExcluded";
const SETTINGS_KEY = "lincleSettings";
const DEFAULT_DOMAINS = [{ domain: "bc.vc" }, { domain: "adf.ly" }];

document.addEventListener('DOMContentLoaded', initManager);

async function loadDomains() {
    const data = await chrome.storage.local.get(DOMAINS_KEY);
    return (data[DOMAINS_KEY] && data[DOMAINS_KEY].length) ? data[DOMAINS_KEY] : DEFAULT_DOMAINS;
}

async function saveDomains(domains) {
    await chrome.storage.local.set({ [DOMAINS_KEY]: domains });
}

async function loadExcluded() {
    const data = await chrome.storage.local.get(EXCLUDE_KEY);
    return data[EXCLUDE_KEY] || [];
}

async function saveExcluded(list) {
    await chrome.storage.local.set({ [EXCLUDE_KEY]: list });
}

async function loadSettings() {
    const data = await chrome.storage.local.get(SETTINGS_KEY);
    return Object.assign({ autoDetect: true }, data[SETTINGS_KEY] || {});
}

async function saveSettings(settings) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

async function initManager() {
    const listEl = document.getElementById('domainList');
    const domainInput = document.getElementById('newDomain');
    const selectorInput = document.getElementById('newSelector');
    const addBtn = document.getElementById('addDomainBtn');

    const excludeListEl = document.getElementById('excludeList');
    const excludeInput = document.getElementById('newExclude');
    const addExcludeBtn = document.getElementById('addExcludeBtn');

    const autoToggle = document.getElementById('autoDetectToggle');

    // --- Otomatik algılama açma/kapama ---
    const settings = await loadSettings();
    autoToggle.checked = settings.autoDetect;
    autoToggle.addEventListener('change', async () => {
        await saveSettings({ autoDetect: autoToggle.checked });
    });

    // --- Güvenilir domain listesi ---
    async function renderDomains() {
        const domains = await loadDomains();
        listEl.innerHTML = '';
        domains.forEach(entry => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = entry.skipSelector ? `${entry.domain} (${entry.skipSelector})` : entry.domain;
            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadDomains()).filter(d => d.domain !== entry.domain);
                await saveDomains(updated);
                renderDomains();
            });
            li.appendChild(span);
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }

    addBtn.addEventListener('click', async () => {
        const rawDomain = domainInput.value.trim().toLowerCase();
        const rawSelector = selectorInput.value.trim();

        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) {
            alert("Geçerli bir domain girin, örn: kisalt.co");
            return;
        }

        const domains = await loadDomains();
        const existingIndex = domains.findIndex(d => d.domain === rawDomain);
        const entry = { domain: rawDomain };
        if (rawSelector) entry.skipSelector = rawSelector;

        if (existingIndex >= 0) {
            domains[existingIndex] = entry;
        } else {
            domains.push(entry);
        }

        await saveDomains(domains);
        domainInput.value = '';
        selectorInput.value = '';
        renderDomains();
    });

    // --- Hariç tutulan domain listesi ---
    async function renderExcluded() {
        const list = await loadExcluded();
        excludeListEl.innerHTML = '';
        list.forEach(domain => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = domain;
            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadExcluded()).filter(d => d !== domain);
                await saveExcluded(updated);
                renderExcluded();
            });
            li.appendChild(span);
            li.appendChild(btn);
            excludeListEl.appendChild(li);
        });
    }

    addExcludeBtn.addEventListener('click', async () => {
        const rawDomain = excludeInput.value.trim().toLowerCase();
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) {
            alert("Geçerli bir domain girin, örn: bankam.com");
            return;
        }
        const list = await loadExcluded();
        if (!list.includes(rawDomain)) list.push(rawDomain);
        await saveExcluded(list);
        excludeInput.value = '';
        renderExcluded();
    });

    renderDomains();
    renderExcluded();
}
