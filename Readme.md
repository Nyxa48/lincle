# Lincle - Link Cleaner

Kısaltıcı/reklam sayfalarını (bc.vc, adf.ly, vb.) atlayıp kullanıcıyı doğrudan
hedef linke, çerez ve izleyiciler olmadan ulaştıran bir Chrome uzantısı.

## Nasıl çalışır (v1.2)
Önceki sürüm, sayfayı hiç yüklemeden `fetch()` ile HTML'ini indirip
regex ile hedefi arıyordu. Bu, geri sayım veya "devam et" butonuna
ihtiyaç duyan sitelerde işe yaramıyordu çünkü sayfanın JS'i hiç
çalışmıyordu. v1.2 bunu değiştiriyor:

1. `background.js`, izlenen domain listesine göre `resolver.js` içerik
   betiğini `chrome.scripting.registerContentScripts` ile kaydeder.
2. Kullanıcı izlenen bir siteye girdiğinde sayfa **normal şekilde**
   yüklenir (JS, geri sayımlar, butonlar dahil) ve `resolver.js` o
   sayfanın içine enjekte edilir.
3. `resolver.js` sırasıyla dener:
   - Sayfa kaynağında `var url = "..."` gibi klasik kalıpları arar.
   - Bulamazsa "devam et / skip / continue" gibi anahtar kelimelere
     sahip görünür ve aktif bir butonu bulup otomatik tıklar.
   - Reklam/izleyici domain listesinde olmayan yeni bir dış link
     belirene kadar (veya 20 saniye zaman aşımına kadar) sayfayı
     izlemeye devam eder.
4. Hedef bulununca kullanıcıyı doğrudan oraya yönlendirir.

## Domain yönetimi
Araç çubuğu simgesine tıklayınca açılan ekrandan izlenecek domainleri
ekleyip silebilirsin. İsteğe bağlı olarak, otomatik buton tespiti
başarısız olan bir site için CSS seçici de girebilirsin (örn.
`#skip-button`); resolver önce bunu dener.

## Bilinen sınırlamalar
- Bazı siteler gerçek bir CAPTCHA veya bot-tespit sistemi kullanır
  (ör. "robot değilim" doğrulaması, davranışsal analiz). Bunlar
  bilerek otomasyona kapalıdır ve dürüstçe söylemek gerekirse hiçbir
  uzantı bunları güvenilir şekilde atlayamaz — bu durumda resolver
  20 saniye sonra "manuel tıklayın" uyarısı gösterip durur.
- `host_permissions: ["<all_urls>"]` ve içerik betiği enjeksiyonu
  geniş izinler gerektirir; hedef domain önceden bilinemediği için
  bu kaçınılmaz. Chrome Web Store incelemesinde bunu açıklayan kısa
  bir gerekçe eklemen gerekebilir.
- Otomatik buton tıklama, ilgili sitenin reklam gelirini atlamak
  anlamına gelir — bu senin kişisel tarayıcı deneyimin için normal
  bir reklam engelleme davranışıdır, ama bazı sitelerin kullanım
  şartlarıyla çelişebileceğini bilerek kullan.
