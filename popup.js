// Lincle - Modern UI Manager
// Developed by: Emir Samed (Nyxa48)

const DOMAINS_KEY = "lincleDomains";
const EXCLUDE_KEY = "lincleExcluded";
const SETTINGS_KEY = "lincleSettings";

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initManager();
});

// Sayfa Geçiş Yönetimi
function initUI() {
    const mainView = document.getElementById('mainView');
    const settingsView = document.getElementById('settingsView');
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');

    btnOpenSettings.addEventListener('click', () => {
        mainView.style.display = 'none';
        settingsView.style.display = 'block';
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsView.style.display = 'none';
        mainView.style.display = 'block';
    });
}

// Veri Yönetimi
async function loadDomains() {
    const data = await chrome.storage.local.get(DOMAINS_KEY);
    return data[DOMAINS_KEY] || [];
}
async function saveDomains(domains) { await chrome.storage.local.set({ [DOMAINS_KEY]: domains }); }
async function loadExcluded() {
    const data = await chrome.storage.local.get(EXCLUDE_KEY);
    return data[EXCLUDE_KEY] || [];
}
async function saveExcluded(list) { await chrome.storage.local.set({ [EXCLUDE_KEY]: list }); }
async function loadSettings() {
    const data = await chrome.storage.local.get(SETTINGS_KEY);
    return Object.assign({ autoDetect: true }, data[SETTINGS_KEY] || {});
}
async function saveSettings(settings) { await chrome.storage.local.set({ [SETTINGS_KEY]: settings }); }

async function initManager() {
    const listEl = document.getElementById('domainList');
    const domainInput = document.getElementById('newDomain');
    const addBtn = document.getElementById('addDomainBtn');

    const excludeListEl = document.getElementById('excludeList');
    const excludeInput = document.getElementById('newExclude');
    const addExcludeBtn = document.getElementById('addExcludeBtn');

    const autoToggle = document.getElementById('autoDetectToggle');

    const settings = await loadSettings();
    autoToggle.checked = settings.autoDetect;
    autoToggle.addEventListener('change', async () => {
        await saveSettings({ autoDetect: autoToggle.checked });
    });

    async function renderDomains() {
        const domains = await loadDomains();
        listEl.innerHTML = '';
        domains.forEach(entry => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${entry.domain}</span>`;
            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadDomains()).filter(d => d.domain !== entry.domain);
                await saveDomains(updated);
                renderDomains();
            });
            li.appendChild(btn);
            listEl.appendChild(li);
        });
    }

    addBtn.addEventListener('click', async () => {
        const rawDomain = domainInput.value.trim().toLowerCase();
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) {
            alert("Geçerli bir domain girin, örn: kisalt.co"); return;
        }
        const domains = await loadDomains();
        if (!domains.find(d => d.domain === rawDomain)) {
            domains.push({ domain: rawDomain });
            await saveDomains(domains);
        }
        domainInput.value = '';
        renderDomains();
    });

    async function renderExcluded() {
        const list = await loadExcluded();
        excludeListEl.innerHTML = '';
        list.forEach(domain => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${domain}</span>`;
            const btn = document.createElement('button');
            btn.textContent = 'Sil';
            btn.addEventListener('click', async () => {
                const updated = (await loadExcluded()).filter(d => d !== domain);
                await saveExcluded(updated);
                renderExcluded();
            });
            li.appendChild(btn);
            excludeListEl.appendChild(li);
        });
    }

    addExcludeBtn.addEventListener('click', async () => {
        const rawDomain = excludeInput.value.trim().toLowerCase();
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) {
            alert("Geçerli bir domain girin, örn: bankam.com"); return;
        }
        const list = await loadExcluded();
        if (!list.includes(rawDomain)) {
            list.push(rawDomain);
            await saveExcluded(list);
        }
        excludeInput.value = '';
        renderExcluded();
    });

    renderDomains();
    renderExcluded();
}