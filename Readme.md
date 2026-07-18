# Lincle - Link Cleaner

Kısaltıcı/reklam sayfalarını (bc.vc, adf.ly, linkvertise.com, vb.) atlayıp
kullanıcıyı doğrudan hedef linke, çerez ve izleyiciler olmadan ulaştıran bir
Chrome uzantısı.

## Nasıl çalışır (v2.0) — artık domain eklemene gerek yok

Önceki sürümde (v1.2) resolver.js sadece popup'tan elle eklediğin
domainlerde çalışıyordu: her yeni kısaltıcı için siteyi ziyaret edip
domaini yazman, (opsiyonel) CSS seçici bulman ve "Ekle"ye basman
gerekiyordu. v2.0 bunu ortadan kaldırıyor:

`resolver.js` artık `manifest.json` üzerinden **her sayfaya** enjekte
ediliyor (dinamik `chrome.scripting.registerContentScripts` yerine statik
`content_scripts` girişi — bu yüzden ayrı bir `background.js` servis
çalışanına da gerek kalmadı). Her sayfada üç katman sırayla denenir:

1. **Katman 0 — her zaman güvenli:** sayfa kaynağında klasik
   `var url = "..."` / meta-refresh gibi bir kalıp var mı? Varsa hiçbir
   şeye tıklamadan direkt oraya gider.
2. **Katman 1 — bilinen kısaltıcılar:** uzantı, aralarında `bc.vc`,
   `adf.ly`, `linkvertise.com`, `ouo.io`, `exe.io`, `gplinks.in` gibi
   yaygın kısaltıcıların da olduğu bir listeyle geliyor — bunlar hiçbir
   kurulum gerektirmeden çalışır. Popup'tan kendi domainlerini de bu
   listeye ekleyebilirsin (artık zorunlu değil, sadece ince ayar).
3. **Katman 2 — otomatik algılama (yeni):** listede olmayan bilinmeyen
   bir kısaltıcıya girdiğinde, sayfada hem (a) "devam et / skip / get
   link" gibi görünür bir buton HEM DE (b) bir geri sayım sayacı ya da
   "reklamı geç", "link koruma altında", "please wait" gibi kapı-sayfası
   ifadelerinden biri varsa, bunu otomatik olarak kısaltıcı kabul edip
   aynı akışı (buton tıkla, çıkış linkini bul, yönlendir) çalıştırır.

   **Neden sadece reklam scripti yeterli değil:** İnternetteki neredeyse
   her site Google Ads/Analytics gibi bir şey kullanıyor. Sadece "sayfada
   reklam scripti var" sinyaline güvenirsek uzantı normal sitelerde de
   (ör. bir checkout akışındaki "Devam Et" butonuna) yanlışlıkla
   tıklayabilir. Buton + geri sayım/kapı-metni kombinasyonu çok daha nadir
   ve kısaltıcılara özgü bir kalıp olduğu için yanlış pozitif riski düşük.

Hiçbir katman eşleşmezse (normal bir web sitesi) resolver.js sessizce
hiçbir şey yapmadan çıkar — banner göstermez, hiçbir şeye tıklamaz.

## Domain yönetimi (artık opsiyonel)

Araç çubuğu simgesine tıklayınca açılan ekrandan:
- **Otomatik algılamayı** açıp kapatabilirsin (varsayılan: açık).
- **Güvenilir/zorla çalıştır** listesine domain ekleyip, otomatik buton
  tespiti başarısız olan inatçı bir site için CSS seçici girebilirsin
  (örn. `#skip-button`) — bu, Katman 2'nin heuristiğini atlayıp doğrudan
  Katman 1 gibi davranmasını sağlar.
- **Hiç dokunma** listesine, uzantının kesinlikle karışmasını istemediğin
  domainleri (ör. bankan, e-posta sağlayıcın) ekleyebilirsin. Bu listedeki
  domainlerde resolver.js hiçbir şey yapmadan hemen çıkar.

## Bilinen sınırlamalar

- Bazı siteler gerçek bir CAPTCHA veya bot-tespit sistemi kullanır (ör.
  "robot değilim" doğrulaması, davranışsal analiz). Bunlar bilerek
  otomasyona kapalıdır — resolver 20 saniye sonra "manuel tıklayın"
  uyarısı gösterip durur.
- Otomatik algılama (Katman 2) bir heuristiktir, %100 değildir:
  - **Yanlış negatif** ihtimali var: alışılmadık ifadeler kullanan bir
    kısaltıcıyı atlayabilir. Çözüm: o domaini popup'tan güvenilir listeye
    ekle (gerekirse CSS seçiciyle).
  - **Yanlış pozitif** ihtimali teorik olarak var ama düşük: buton VE
    geri sayım/kapı-metni ikisi birden gerektiği için normal sitelerde
    (form sihirbazları, checkout adımları vb.) bu kombinasyon nadiren
    bir arada bulunur. Yine de hassas olduğun siteler için "Hiç dokunma"
    listesini kullanmanı öneririm.
- `host_permissions: ["<all_urls>"]` ve her sayfaya content script
  enjeksiyonu geniş izinler gerektirir; hedef domain önceden
  bilinemediği için bu kaçınılmaz. Chrome Web Store incelemesinde bunu
  açıklayan kısa bir gerekçe eklemen gerekebilir.
- Otomatik buton tıklama, ilgili sitenin reklam gelirini atlamak anlamına
  gelir — bu senin kişisel tarayıcı deneyimin için normal bir reklam
  engelleme davranışıdır, ama bazı sitelerin kullanım şartlarıyla
  çelişebileceğini bilerek kullan.
