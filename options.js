document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);

async function restoreOptions() {
    const data = await chrome.storage.local.get(["lincleStats", "lincleOptions", "lincleDomains"]);
    
    // İstatistikleri Yükle
    const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
    const timeText = stats.savedSeconds > 60 ? `${(stats.savedSeconds / 60).toFixed(1)} Dakika` : `${Math.floor(stats.savedSeconds)} Saniye`;
    document.getElementById('statsDisplay').textContent = `🚀 ${stats.cleanedLinks} Link Temizlendi | ⏳ ${timeText} Tasarruf Edildi`;

    // Ayarları Yükle
    const options = data.lincleOptions || { assumedGateTime: 10, enableLogging: false };
    document.getElementById('assumedTime').value = options.assumedGateTime;
    document.getElementById('loggingToggle').checked = options.enableLogging;

    // Kara Listeyi Yükle
    const domains = data.lincleDomains || [];
    document.getElementById('domainList').value = domains.map(d => d.domain).join('\n');
}

async function saveOptions() {
    const assumedGateTime = parseInt(document.getElementById('assumedTime').value) || 10;
    const enableLogging = document.getElementById('loggingToggle').checked;
    
    // Güvenli regex denetimi ve veri formatlama
    const domainText = document.getElementById('domainList').value;
    const domainArray = domainText.split('\n')
                                  .map(d => d.trim().toLowerCase())
                                  .filter(d => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d));
    const formattedDomains = domainArray.map(d => ({ domain: d }));

    await chrome.storage.local.set({
        lincleOptions: { assumedGateTime, enableLogging },
        lincleDomains: formattedDomains
    });

    const status = document.getElementById('saveStatus');
    status.style.display = 'inline';
    setTimeout(() => { status.style.display = 'none'; }, 2000);
}