# Lincle

![Version](https://img.shields.io/badge/version-2.4-2563eb.svg?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Chromium_|_Firefox_|_Safari-475569.svg?style=for-the-badge)
![Privacy](https://img.shields.io/badge/privacy-100%25_Local-059669.svg?style=for-the-badge)

[ English ](#english) &nbsp;&middot;&nbsp; [ Türkçe ](#turkce)

<br>

<h2 id="english">English</h2>

> **Lincle** is a lightweight, privacy-focused browser extension designed to automatically analyze and bypass URL shorteners, redirect gates, and tracking links.

### Key Features

**Advanced Link Resolution**
Bypasses intermediary pages and redirect gates locally. It uses a highly optimized extraction engine to find the true destination URL in the background without exposing the user to intrusive ads or wait timers.

**Bulk Resolver Module**
Need to extract multiple links? The built-in Bulk Resolver allows you to paste a list of URLs and processes them simultaneously in the background without opening dozens of tabs, keeping your workspace clean.

**Breadcrumb Tracker**
Designed for security analysis, Lincle can map out hidden HTTP and JavaScript redirect chains. It shows you exactly where a link travels before reaching its final destination, providing transparency over complex network routes.

**Absolute Privacy**
Your data never leaves your browser. Lincle operates entirely on local storage. There is no telemetry, no cloud processing, and no remote servers involved in the resolution process.

### Installation Guide

You can run Lincle by loading it as an unpacked extension on your preferred browser.

#### Chromium (Chrome, Brave, Edge, Opera)
1. Navigate to `chrome://extensions/` in your address bar.
2. Toggle **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the downloaded `lincle` folder.

#### Mozilla Firefox
1. Navigate to `about:debugging#/runtime/this-firefox` in your address bar.
2. Click the **Load Temporary Add-on** button.
3. Locate and select the `manifest.json` file inside the `lincle` folder.

#### Apple Safari
1. Open Safari Preferences, go to the **Advanced** tab, and check **Show Develop menu in menu bar**.
2. Click the **Develop** menu and select **Allow Unsigned Extensions**.
3. Use the Safari Extension Builder to load the extension folder.

---

<br>

<h2 id="turkce">Türkçe</h2>

> **Lincle**, URL kısaltıcıları, yönlendirme kapılarını ve izleme linklerini otomatik olarak analiz edip atlayan, gizlilik odaklı ve hafif bir tarayıcı eklentisidir.

### Temel Özellikler

**Gelişmiş Bağlantı Çözümleme**
Aracı sayfaları ve yönlendirme kapılarını yerel olarak atlar. Arka planda çalışarak asıl hedef URL'yi bulmak için yüksek düzeyde optimize edilmiş bir ayıklama motoru kullanır; böylece kullanıcıyı reklam veya geri sayım ekranlarından korur.

**Toplu Çözümleyici Modülü**
Birden fazla linki aynı anda temizlemeniz mi gerekiyor? Dahili Toplu Çözümleyici sayesinde, bağlantı listesini yapıştırıp onlarca sekme açmadan arka planda eşzamanlı işlem yapabilirsiniz. Tarayıcınızın belleğini yormaz.

**Yönlendirme İzleyici (Breadcrumb)**
Güvenlik analizleri için tasarlanan bu özellik, gizli HTTP ve JavaScript yönlendirme zincirlerini haritalandırır. Bir bağlantının nihai hedefine ulaşmadan önce hangi yollardan geçtiğini adım adım göstererek ağ trafiğinde şeffaflık sağlar.

**Mutlak Gizlilik**
Verileriniz asla tarayıcınızdan dışarı çıkmaz. Lincle %100 yerel depolama ile çalışır. Çözümleme işleminin hiçbir aşamasında telemetri, bulut işleme veya uzak sunucu bağlantısı kullanılmaz.

### Kurulum Rehberi

Lincle'ı paketlenmemiş bir eklenti olarak favori tarayıcınıza yükleyip anında kullanmaya başlayabilirsiniz.

#### Chromium (Chrome, Brave, Edge, Opera)
1. Adres çubuğuna `chrome://extensions/` yazarak uzantılar sayfasına gidin.
2. Sağ üst köşedeki **Geliştirici modu** (Developer mode) anahtarını aktifleştirin.
3. **Paketlenmemiş öğe yükle** (Load unpacked) butonuna tıklayın ve indirdiğiniz `lincle` klasörünü seçin.

#### Mozilla Firefox
1. Adres çubuğuna `about:debugging#/runtime/this-firefox` yazarak eklenti hata ayıklama sayfasına gidin.
2. **Geçici Eklenti Yükle** (Load Temporary Add-on) butonuna tıklayın.
3. `lincle` klasörünün içindeki `manifest.json` dosyasını seçerek yüklemeyi tamamlayın.

#### Apple Safari
1. Safari Ayarları'nı açın, **İleri Düzey** sekmesine gidin ve **Geliştirme menüsünü göster** seçeneğini işaretleyin.
2. Üstteki Geliştirme (Develop) menüsünden **İmzasız Eklentilere İzin Ver** seçeneğine tıklayın.
3. Safari Extension Builder aracını kullanarak eklenti klasörünü tarayıcıya ekleyin.
---
**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48)