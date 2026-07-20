# Lincle - Advanced Link Cleaner & Bypass Engine

![Version](https://img.shields.io/badge/version-2.4-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Browsers](https://img.shields.io/badge/Chrome_%7C_Firefox_%7C_Safari-supported-orange.svg)
![Privacy](https://img.shields.io/badge/Privacy-Zero_Telemetry-brightgreen.svg)

> **Bilingual README**: [English](#english) | [Turkce](#turkce)

---

<a id="english"></a>
## English

### About the Project
Lincle is a privacy-first, open-source browser extension engineered to neutralize aggressive link shorteners, ad-gateways, and countdown-based tracking pages, and deliver the true destination URL directly.

### What's new in 2.4: Cross-Browser + Hardening
- **Runs on Chrome, Firefox, and Safari** from the same source, no build step, no per-browser code fork.
- **Auto-click no longer touches forms.** On unknown (non-whitelisted) pages, Lincle will not click a `type="submit"` element or anything inside a `<form>` that posts to a different origin — this closes a real risk where a generic "click the button that says continue" heuristic could accidentally submit a form containing personal data.
- **Added a proper icon set** (16/32/48/128px) — required for Safari's App Store packaging and just generally makes it look like a real extension instead of the default puzzle-piece icon.
- **Removed a dead file.** The old `domains.json` was no longer read by anything (the actual list lives in `resolver.js`'s `DEFAULT_KNOWN_SHORTENERS`) — kept as two diverging lists is exactly the kind of bug that bites you later, so it's gone now.
- **Refreshed the shortener list.** `bc.vc` and `adf.ly` are confirmed discontinued and were removed; a few currently-active gate services (`cpmlink.net`, `za.gl`, `tpi.li`) were added. This list will always drift out of date over time — that's normal for this category of tool (see the note on FastForward below) — the real safety net is the Layer 2 behavioral heuristic, not the list.

### Why full automation (zero list, zero maintenance) isn't realistic
Worth being upfront about: even the most established open-source project in this space, [FastForward](https://github.com/FastForwardTeam/FastForward) (successor to Universal Bypass, maintained by a team for years), works by maintaining a curated per-site bypass database — there's no way to reliably detect *any* arbitrary shortener with zero configuration. FastForward was also removed from the Chrome Web Store over its Linkvertise bypass, which Google considered a "restriction bypass." Worth keeping in mind if you ever want to publish Lincle to a store yourself.

### Core Features
* **Global Heuristic Engine:** Recognizes "skip" actions and gateway phrases across 18 languages.
* **Zero Telemetry, 100% Local:** No remote servers, no external API calls. Everything runs through `storage.local` on-device.
* **Throttled MutationObserver:** No busy-polling; only re-evaluates the page when the DOM actually changes.
* **Master Kill Switch:** One toggle in the popup fully disables Lincle without uninstalling it.
* **Global + Custom Whitelist:** Hardcoded exclusions for major platforms (GitHub, banking-adjacent domains, PayPal, Steam, etc.) plus a user-editable exclude list.
* **Two-layer trust model:** Known/trusted domains run unconditionally; unknown domains only trigger if *both* a visible skip button *and* a recognized gate phrase/countdown are present — and even then, form-submission elements are off-limits (see above).

### Installation

#### Chrome / Edge / Brave / Opera (Chromium-based)
1. Download/clone this repository.
2. Go to `chrome://extensions` (or the equivalent in your browser).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `lincle` folder.

#### Firefox
1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` inside the `lincle` folder.
3. This loads it for the current session only. For a permanent install, package it (`web-ext build`) and either self-distribute or submit to [addons.mozilla.org](https://addons.mozilla.org) for signing — Firefox will not permanently load an unsigned extension from disk.
4. Note: `manifest.json` already includes `browser_specific_settings.gecko.id`, which Firefox requires for a signed/permanent install.

#### Safari (macOS)
Safari doesn't load raw web-extension folders — Apple requires converting the extension into a native app wrapper via Xcode. This step has to happen on a Mac with Xcode installed; it can't be done from a source-code handoff alone.
1. Install Xcode (from the Mac App Store) and its command-line tools.
2. From the `lincle` folder, run:
   ```
   xcrun safari-web-extension-converter . --project-location ./safari-build
   ```
3. Xcode will open the generated project. Build and run it (`Cmd+R`) — this installs the extension into Safari.
4. In Safari, go to **Settings → Advanced** and enable **"Show Develop menu"**, then in the **Develop** menu enable **"Allow Unsigned Extensions"** (needed for local testing without an Apple Developer account).
5. Enable the extension in **Settings → Extensions**.
6. To distribute beyond your own Mac, you'll need an Apple Developer account to notarize and submit the wrapper app to the Mac App Store.

### Security Notes
- `host_permissions: ["<all_urls>"]` and a content script running on every page are both necessary for this extension's core function (it can't know the target domain in advance) — this is the same tradeoff every extension in this category makes.
- The extension never sends any data off-device. No analytics, no remote config fetches, no crash reporting.
- Auto-click is deliberately restricted: unknown domains require two independent signals before anything is touched, and form-submitting elements are never auto-clicked outside of explicitly trusted domains.

---

<a id="turkce"></a>
## Turkce

### Proje Hakkinda
Lincle, agresif link kisalticilarini, reklam kapilarini ve geri sayim tabanli takip sayfalarini etkisiz hale getirip gercek hedef URL'yi dogrudan sunan, gizlilik odakli, acik kaynakli bir tarayici eklentisidir.

### 2.4'te yenilikler: Cross-Browser + Guvenlik Sertlestirme
- **Ayni kaynak kod uzerinden Chrome, Firefox ve Safari'de calisir**, build adimi ya da tarayiciya ozel kod catallanmasi yok.
- **Otomatik tiklama artik formlara dokunmuyor.** Bilinmeyen (beyaz listede olmayan) sayfalarda Lincle, `type="submit"` bir elemana ya da farkli bir origin'e post eden bir `<form>` icindeki hicbir elemana tiklamiyor — bu, "devam et yazan butona tikla" sezgiselinin yanlislikla kisisel veri iceren bir formu gondermesi riskini kapatir.
- **Duzgun bir ikon seti eklendi** (16/32/48/128px) — Safari'nin App Store paketlemesi icin gerekli, ayrica varsayilan yapboz-parcasi ikonu yerine gercek bir eklenti gibi gorunmesini sagliyor.
- **Olu bir dosya kaldirildi.** Eski `domains.json` artik hicbir yerden okunmuyordu (gercek liste `resolver.js` icindeki `DEFAULT_KNOWN_SHORTENERS`'da yasiyor) — iki ayri listenin birbirinden sapmasi tam olarak sonradan sizi isiran turden bir hataydi, o yuzden kaldirildi.
- **Kisaltici listesi guncellendi.** `bc.vc` ve `adf.ly` artik kapali oldugu icin listeden cikarildi; birkac aktif servis (`cpmlink.net`, `za.gl`, `tpi.li`) eklendi. Bu liste zamanla eskiyecek — bu, bu tur araclar icin normal (asagidaki FastForward notuna bakin) — asil guvenlik agi listeye degil Katman 2 davranissal sezgiseline dayaniyor.

### Kurulum

#### Chrome / Edge / Brave / Opera
1. Bu depoyu indirin/klonlayin.
2. `chrome://extensions` adresine gidin.
3. **Gelistirici modu**'nu acin.
4. **Paketlenmemis oge yukle**'ye tiklayip `lincle` klasorunu secin.

#### Firefox
1. `about:debugging#/runtime/this-firefox` adresine gidin.
2. **Gecici Eklenti Yukle...**'ye tiklayip `lincle` klasoru icindeki `manifest.json`'i secin.
3. Bu sadece o oturum icin yukler. Kalici kurulum icin paketleyip (`web-ext build`) [addons.mozilla.org](https://addons.mozilla.org) uzerinden imzalatmaniz gerekir.

#### Safari (macOS)
Safari, ham eklenti klasorlerini dogrudan yuklemez — Apple, Xcode uzerinden native bir uygulama sarmalayicisina donusturmenizi gerektirir. Bu adim bir Mac'te Xcode kurulu olmasini gerektirir.
1. Xcode'u (Mac App Store'dan) ve komut satiri araclarini kurun.
2. `lincle` klasorunden calistirin: `xcrun safari-web-extension-converter . --project-location ./safari-build`
3. Xcode acilan projeyi Cmd+R ile calistirin — bu, eklentiyi Safari'ye kurar.
4. Safari'de **Ayarlar → Gelismis** kismindan **"Gelistir menusunu goster"**i acin, sonra **Gelistir** menusunden **"Imzasiz Eklentilere Izin Ver"**i etkinlestirin.
5. Eklentiyi **Ayarlar → Eklentiler**'den etkinlestirin.

### Guvenlik Notlari
- `host_permissions: ["<all_urls>"]` ve her sayfada calisan bir icerik betigi, bu eklentinin temel islevi icin gerekli (hedef domain onceden bilinemez) — bu kategorideki her eklentinin yaptigi ayni tercih.
- Eklenti hicbir veriyi cihaz disina gondermez. Analitik yok, uzak yapilandirma cekme yok, hata raporlama yok.
- Otomatik tiklama bilincli olarak kisitlanmistir: bilinmeyen domainler herhangi bir seye dokunulmadan once iki bagimsiz sinyal gerektirir, ve form-gonderen elemanlara acikca guvenilen domainler disinda hicbir zaman otomatik tiklanmaz.

---
**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48)
