# Lincle

[English](#english) | [Türkçe](#turkce)

---

<h2 id="english">English</h2>

Lincle is a lightweight, privacy-first browser extension designed to automatically bypass URL shorteners, redirect gates, and tracking links without relying on hardcoded rules.

### Features
* **Dynamic Resolution:** Analyzes and bypasses redirect gates locally without hardcoded wait times.
* **Privacy First:** 100% local storage. No telemetry, no remote servers.
* **Bulk Resolver:** Bypass multiple links in the background simultaneously without opening new tabs.
* **Breadcrumb Tracker:** Logs hidden HTTP/JS redirect chains for security analysis (opt-in).

### Installation & Usage
Download or clone this repository to your local machine, then follow the instructions for your specific browser to load the extension manually.

* **Chromium (Chrome, Brave, Edge):**
  1. Go to `chrome://extensions/` (or `brave://extensions/`).
  2. Enable **Developer mode** (toggle in the top right).
  3. Click **Load unpacked** and select the downloaded `lincle` folder.
* **Firefox:**
  1. Go to `about:debugging#/runtime/this-firefox`.
  2. Click **Load Temporary Add-on**.
  3. Select the `manifest.json` file inside the `lincle` folder.
* **Safari:**
  1. Open Safari Preferences > Advanced > check **Show Develop menu**.
  2. From the Develop menu, select **Allow Unsigned Extensions**.
  3. Use the Safari Extension Builder to load the folder.

### License
This project is Unlicensed. All rights reserved. 

---

<h2 id="turkce">Türkçe</h2>

Lincle, URL kısaltıcıları, yönlendirme kapılarını ve izleme linklerini sabit kurallara (hardcode) bağlı kalmadan otomatik olarak atlayan, gizlilik odaklı ve hafif bir tarayıcı eklentisidir.

### Özellikler
* **Dinamik Çözümleme:** Yönlendirme kapılarını sabit bekleme süreleri olmadan, tarayıcı içinde yerel olarak analiz eder ve atlar.
* **Önce Gizlilik:** %100 yerel veri depolama. Telemetri veya uzak sunucu bağlantısı yoktur.
* **Toplu Çözümleyici:** Arka planda yeni sekmeler açmadan birden fazla linki aynı anda temizler.
* **Yönlendirme İzleyici:** Güvenlik analizleri için gizli HTTP/JS yönlendirme zincirlerini kaydeder (isteğe bağlı).

### Kurulum ve Kullanım
Bu depoyu (repository) bilgisayarınıza indirin veya klonlayın, ardından tarayıcınıza uygun adımları izleyerek eklentiyi manuel olarak yükleyin.

* **Chromium (Chrome, Brave, Edge):**
  1. `chrome://extensions/` (veya `brave://extensions/`) adresine gidin.
  2. Sağ üstten **Geliştirici modu**'nu (Developer mode) açın.
  3. **Paketlenmemiş öğe yükle**'ye (Load unpacked) tıklayın ve indirdiğiniz `lincle` klasörünü seçin.
* **Firefox:**
  1. `about:debugging#/runtime/this-firefox` adresine gidin.
  2. **Geçici Eklenti Yükle** (Load Temporary Add-on) butonuna tıklayın.
  3. `lincle` klasörünün içindeki `manifest.json` dosyasını seçin.
* **Safari:**
  1. Safari Ayarları > İleri Düzey > **Geliştirme menüsünü göster** seçeneğini işaretleyin.
  2. Geliştirme (Develop) menüsünden **İmzasız Eklentilere İzin Ver**'i seçin.
  3. Safari Extension Builder'ı kullanarak klasörü tarayıcıya yükleyin.

**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48)