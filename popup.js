// Lincle - İstemci Taraflı Güvenli Çözücü Motoru

document.addEventListener('DOMContentLoaded', async () => {
    const infoText = document.getElementById('info');
    const spinner = document.getElementById('spinner');

    // 1. Mevcut sekmenin URL'sinden, kullanıcının gitmek istediği orijinal zararlı linki yakala
    const currentTab = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabUrl = new URL(currentTab[0].url);
    
    // Yönlendirme parametresinden orijinal linki ayıklıyoruz
    const realTargetUrl = tabUrl.searchParams.get("continue");

    if (!realTargetUrl) {
        infoText.innerText = "Temizlenecek geçerli bir yönlendirme linki bulunamadı.";
        spinner.style.display = "none";
        return;
    }

    try {
        // 2. GİZLİLİK KATMANI: Reklam sitesine kullanıcının çerezleri (cookies) gitmeden istek atıyoruz
        const response = await fetch(realTargetUrl, {
            method: 'GET',
            credentials: 'omit' // Tarayıcı izlerini ve çerezleri tamamen gizle!
        });

        if (!response.ok) throw new Error("Kaynak siteye erişilemedi.");

        const htmlText = await response.text();

        // 3. HEVRİSTİK PARSER (Cımbızlama): HTML içinde gizlenmiş hedef link kalıplarını ara
        // bc.vc ve benzeri scriptler genelde 'var url = "hedef"' veya 'location.href = "hedef"' kullanır.
        const regexPatterns = [
            /var\s+url\s*=\s*['"]([^'"]+)['"]/,
            /var\s+target_url\s*=\s*['"]([^'"]+)['"]/,
            /window\.location\.href\s*=\s*['"]([^'"]+)['"]/
        ];

        let cleanDestination = null;

        for (let pattern of regexPatterns) {
            const match = htmlText.match(pattern);
            if (match && match[1]) {
                cleanDestination = match[1];
                break;
            }
        }

        // 4. SONUÇ VE YÖNLENDİRME
        if (cleanDestination) {
            infoText.innerHTML = "Link başarıyla temizlendi! <br><span style='color:#2ecc71;'>Güvenli alana uçuyorsunuz...</span>";
            
            // Kullanıcıyı hiçbir reklama bulaştırmadan doğrudan temiz linke yönlendir
            setTimeout(() => {
                chrome.tabs.update(currentTab[0].id, { url: cleanDestination });
            }, 1000);
        } else {
            // Eğer kodun içinden çıkmazsa, güvenlik amacıyla kullanıcıyı uyarıp orijinal siteye bırakıyoruz
            infoText.innerText = "Otomatik çözülemedi. Güvenlik duvarı nedeniyle siteye yönlendiriliyorsunuz...";
            setTimeout(() => {
                chrome.tabs.update(currentTab[0].id, { url: realTargetUrl });
            }, 2000);
        }

    } catch (error) {
        console.error("Lincle Çözüm Hatası:", error);
        infoText.innerText = "Bağlantı hatası oluştu. Site çökmüş olabilir.";
        spinner.style.display = "none";
    }
});