# Lincle - Link Cleaner

Kısaltıcı/reklam sayfalarını (bc.vc, adf.ly, vb.) atlayıp kullanıcıyı doğrudan
hedef linke, çerez ve izleyiciler olmadan ulaştıran bir Chrome uzantısı.

## Nasıl çalışır
1. `background.js`, izlenen domain listesine göre bir `declarativeNetRequest`
   yönlendirme kuralı kurar. Bu kural, eşleşen bir siteye gidildiğinde
   isteği `popup.html?continue=<orijinal_url>` adresine yönlendirir
   (orijinal URL kaybolmadan taşınır).
2. `popup.html` bu şekilde açıldığında, `popup.js` hedef sayfayı
   çerezsiz (`credentials: "omit"`) olarak indirir ve içindeki
   `var url = "..."` / `location.href = "..."` gibi kalıplardan gerçek
   hedefi çıkarmaya çalışır.
3. Bulursa kullanıcıyı doğrudan oraya, bulamazsa orijinal (kısaltılmış)
   adrese yönlendirir.
4. Uzantı araç çubuğundan normal açıldığında (yönlendirme değil), aynı
   popup bu sefer izlenen domain listesini eklemek/silmek için bir
   yönetim ekranı gösterir (`chrome.storage.local` üzerinde saklanır).

## Bilinen sınırlamalar
- Hedef site hangi domain olursa olsun içeriğini indirebilmek için
  `host_permissions: ["<all_urls>"]` gerekiyor — bu geniş bir izin,
  Chrome Web Store incelemesinde gerekçelendirilmesi gerekir.
- `continue` parametresi yalnızca `http:`/`https:` şemasına izin
  verecek şekilde doğrulanıyor, ama teknik olarak herhangi bir sayfa
  uzantının popup.html'ini bu parametreyle açabilir. Asıl güvenlik
  sınırı, bu adrese çerezsiz `fetch` atılması ve sadece düz metin
  regex ile ayrıştırılmasıdır (script çalıştırılmaz).
- Regex tabanlı ayrıştırma kırılgandır; kısaltıcı sitesi HTML yapısını
  değiştirirse yeni bir kalıp eklemek gerekebilir.
