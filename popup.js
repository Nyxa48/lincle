// Lincle - Modern UI Manager
// Developed by: Emir Samed (Nyxa48)

const DOMAINS_KEY = "lincleDomains";
const EXCLUDE_KEY = "lincleExcluded";
const SETTINGS_KEY = "lincleSettings"; // { isActive: true/false }

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initManager();
});

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

// Arayüz Rengini ve Yazısını Değiştiren Animasyonlu Fonksiyon
function updateStatusUI(isActive) {
    const icon = document.getElementById('statusIcon');
    const title = document.getElementById('statusTitle');
    const desc = document.getElementById('statusDesc');

    if (isActive) {
        icon.innerHTML = "🛡️";
        icon.style.borderColor = "var(--success)";
        icon.style.backgroundColor = "rgba(46, 204, 113, 0.1)";
        icon.style.boxShadow = "0 0 15px rgba(46, 204, 113, 0.2)";
        title.textContent = "Sistem Koruması Aktif";
        title.style.color = "var(--success)";
        desc.textContent = "Arka planda gereksiz kapılar atlanıyor";
    } else {
        icon.innerHTML = "❌";
        icon.style.borderColor = "var(--danger)";
        icon.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
        icon.style.boxShadow = "0 0 15px rgba(231, 76, 60, 0.2)";
        title.textContent = "Sistem Koruması Kapalı";
        title.style.color = "var(--danger)";
        desc.textContent = "Lincle şu an sitelere müdahale etmiyor";
    }
}

async function loadDomains() { const data = await chrome.storage.local.get(DOMAINS_KEY); return data[DOMAINS_KEY] || []; }
async function saveDomains(domains) { await chrome.storage.local.set({ [DOMAINS_KEY]: domains }); }
async function loadExcluded() { const data = await chrome.storage.local.get(EXCLUDE_KEY); return data[EXCLUDE_KEY] || []; }
async function saveExcluded(list) { await chrome.storage.local.set({ [EXCLUDE_KEY]: list }); }
async function loadSettings() { const data = await chrome.storage.local.get(SETTINGS_KEY); return Object.assign({ isActive: true }, data[SETTINGS_KEY] || {}); }
async function saveSettings(settings) { await chrome.storage.local.set({ [SETTINGS_KEY]: settings }); }

async function initManager() {
    const listEl = document.getElementById('domainList');
    const domainInput = document.getElementById('newDomain');
    const addBtn = document.getElementById('addDomainBtn');

    const excludeListEl = document.getElementById('excludeList');
    const excludeInput = document.getElementById('newExclude');
    const addExcludeBtn = document.getElementById('addExcludeBtn');

    const masterToggle = document.getElementById('masterToggle');

    // Ayarları Yükle ve Şalteri Ayarla
    const settings = await loadSettings();
    masterToggle.checked = settings.isActive;
    updateStatusUI(settings.isActive); // Yüklenirken rengi ayarla

    // Şaltere Tıklanınca Çalışacak Olay
    masterToggle.addEventListener('change', async () => {
        await saveSettings({ isActive: masterToggle.checked });
        updateStatusUI(masterToggle.checked);
    });

    async function renderDomains() {
        const domains = await loadDomains();
        listEl.innerHTML = '';
        domains.forEach(entry => {
            const li = document.createElement('li');
            
            // XSS Güvenlik Yaması: innerHTML yerine textContent kullanımı
            const span = document.createElement('span');
            span.textContent = entry.domain;
            li.appendChild(span);

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
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) { alert("Geçerli bir domain girin, örn: kisalt.co"); return; }
        const domains = await loadDomains();
        if (!domains.find(d => d.domain === rawDomain)) { domains.push({ domain: rawDomain }); await saveDomains(domains); }
        domainInput.value = '';
        renderDomains();
    });

    async function renderExcluded() {
        const list = await loadExcluded();
        excludeListEl.innerHTML = '';
        list.forEach(domain => {
            const li = document.createElement('li');
            
            // XSS Güvenlik Yaması: innerHTML yerine textContent kullanımı
            const span = document.createElement('span');
            span.textContent = domain;
            li.appendChild(span);

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
        if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(rawDomain)) { alert("Geçerli bir domain girin, örn: bankam.com"); return; }
        const list = await loadExcluded();
        if (!list.includes(rawDomain)) { list.push(rawDomain); await saveExcluded(list); }
        excludeInput.value = '';
        renderExcluded();
    });

    renderDomains();
    renderExcluded();
}