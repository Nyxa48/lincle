// Lincle - Domain Yöneticisi
// Artık popup.html hiçbir zaman "çözücü" olarak açılmıyor; asıl çözme işi
// resolver.js tarafından hedef sayfanın içinde yapılıyor. Bu ekran sadece
// hangi domainlerin izleneceğini ve (opsiyonel) hangi CSS seçicinin
// "devam et" butonu olduğunu yönetmek için var.

const STORAGE_KEY = "lincleDomains";
const DEFAULT_DOMAINS = [{ domain: "bc.vc" }, { domain: "adf.ly" }];

document.addEventListener('DOMContentLoaded', initManager);

async function loadDomains() {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return (data[STORAGE_KEY] && data[STORAGE_KEY].length) ? data[STORAGE_KEY] : DEFAULT_DOMAINS;
}

async function saveDomains(domains) {
    await chrome.storage.local.set({ [STORAGE_KEY]: domains });
    chrome.runtime.sendMessage({ type: "LINCLE_DOMAINS_UPDATED" });
}

async function initManager() {
    const listEl = document.getElementById('domainList');
    const domainInput = document.getElementById('newDomain');
    const selectorInput = document.getElementById('newSelector');
    const addBtn = document.getElementById('addDomainBtn');

    async function render() {
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
                render();
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
        render();
    });

    render();
}
