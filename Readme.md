# Lincle

![Version](https://img.shields.io/badge/version-3.5-00caf5.svg?style=for-the-badge&labelColor=11111a)
![Manifest](https://img.shields.io/badge/manifest-V3-10b981.svg?style=for-the-badge&labelColor=11111a)
![Languages](https://img.shields.io/badge/languages-14_Supported-bd93f9.svg?style=for-the-badge&labelColor=11111a)
![Privacy](https://img.shields.io/badge/privacy-100%25_Local-2ecc71.svg?style=for-the-badge&labelColor=11111a)
![License](https://img.shields.io/badge/license-MIT-f59e0b.svg?style=for-the-badge&labelColor=11111a)

[ English ](#english) &nbsp;&middot;&nbsp; [ Türkçe ](#turkce)

---

<h2 id="english">English Overview</h2>

**Lincle** is a lightweight, privacy-first browser extension engineered to automatically bypass URL shorteners, redirect countdown gates, tracking links, and intrusive popup overlays.

Unlike typical ad blockers or URL tools, Lincle operates at the lowest interception layer (Layer 0). It resolves intermediate targets silently in the background, frees your browser scroll from overlay locks, and gives you total aesthetic control over its user interface.

---

### Core Highlights

#### 1. Silent Link & Gate Resolution
Skip countdown timers, intermediate redirect gates, and ad-filled landing pages. Lincle inspects DOM scripts and network redirects in real time to fetch the true destination URL before you even land on the page.

#### 2. Popup & Modal Shield
Breaks aggressive page overlays and modal freezes. When booking sites, hotel aggregators, or ad networks lock your page scroll or block interaction with invisible backdrop divs, Lincle's 3-layer event interceptor restores scroll capabilities and triggers native close routines without breaking site functionality.

#### 3. Custom Theme Engine & HEX Color Editor
Make Lincle look exactly the way you want. Choose from 6 carefully crafted design presets (Cyberpunk Dark, Clean Light, Nordic Slate, Emerald Matrix, Sunset Amber, Dracula Violet) or create your own custom themes using the interactive color palette. Features include direct HEX color inputs, 1-click Auto-Harmonize palette generation, saved theme libraries, and JSON export/import.

#### 4. Native 14-Language i18n Architecture
Fully localized for users worldwide with crisp SVG vector flags. Supported languages include English, Turkish, German, French, Spanish, Portuguese, Italian, Russian, Danish, Japanese, Simplified Chinese, Korean, Arabic, and Polish.

#### 5. Bulk Link Resolver
Process dozens of shortened links at once. Simply paste your link batch into the researcher console, and Lincle resolves all destination targets simultaneously in the background without opening a single new tab.

#### 6. Redirect Chain Tracker (Breadcrumbs)
Inspect the exact route a link takes before arriving at its final URL. Essential for security research, phishing detection, and debugging multi-hop shortener chains.

#### 7. Absolute Privacy & Local Execution
Your browsing habits belong to you. Lincle works 100% locally on your machine with zero remote server dependency, zero telemetry, and no data tracking whatsoever.

---

### Installation Guide

#### Chromium Browsers (Chrome, Brave, Edge, Opera)
1. Open `chrome://extensions/` in your address bar.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the root `lincle` folder.

#### Mozilla Firefox
1. Open `about:debugging#/runtime/this-firefox` in your address bar.
2. Click **Load Temporary Add-on...**.
3. Select the `manifest.json` file inside the `lincle` directory.

---

<br>

<h2 id="turkce">Türkçe Açıklama</h2>

**Lincle**, URL kısaltıcıları, bekleme süreli yönlendirme sayfalarını, izleme bağlantılarını ve rahatsız edici açılır ekran (popup/modal) engellerini otomatik olarak atlayan, gizlilik odaklı ve yüksek performanslı bir tarayıcı eklentisidir.

Lincle, sıradan reklam engelleyicilerden farklı olarak en alt katman olan Katman 0 (Layer 0) seviyesinde çalışır. Sekme trafiğini yormadan arka planda hedef bağlantıyı doğrudan ayıklar, sayfa kaydırma kilitlerini açar ve tamamen özelleştirilebilir modern bir arayüz sunar.

---

### Öne Çıkan Özellikler

#### 1. Arka Planda Sessiz Link Çözümleme
Geri sayım sayaçlarını, geçiş reklamlarını ve aracı kapı sayfalarını otomatik olarak atlayın. Lincle, sayfa komut dizilerini ve ağ yönlendirmelerini anlık analiz ederek henüz siz sayfaya girmeden asıl hedef adresi bulur ve yönlendirir.

#### 2. Popup & Modal Kalkanı
Otel, konaklama ve reklam sitelerindeki agresif açılır pencereleri ve kaydırma (scroll) kilitlerini kırar. Görünmez katmanlar veya modal pencereler nedeniyle sayfa kilitlendiğinde, 3 aşamalı kalkan mekanizması sayfa fonksiyonlarını bozmadan kaydırma özgürlüğünüzü geri verir.

#### 3. Özel Tema Motoru ve HEX Kod Düzenleyici
Lincle arayüzünü kendi tarzınıza göre renklendirin. 6 hazır tema konseptinden (Cyberpunk Dark, Clean Light, Nordic Slate, Emerald Matrix, Sunset Amber, Dracula Violet) birini seçebilir veya HEX kod girdili gelişmiş renk paletiyle kendi temalarınızı oluşturabilirsiniz. Tek tıkla "Otomatik Tonlama" yaparak uyumlu renkler üretebilir, temalarınızı kütüphaneye kaydedebilir ve JSON olarak dışa/içe aktarabilirsiniz.

#### 4. Vektörel SVG Bayraklı 14 Dil Desteği
İşletim sistemi kısıtlamalarından bağımsız, tüm platformlarda sorunsuz görünen SVG vektör bayraklarıyla 14 dünya dili desteklenmektedir: İngilizce, Türkçe, Almanca, Fransızca, İspanyolca, Portekizce, İtalyanca, Rusça, Danimarkaca, Japonca, Çince, Korece, Arapça ve Lehçe.

#### 5. Toplu Link Çözümleyici (Bulk Resolver)
Onlarca kısaltılmış bağlantıyı tek seferde temizleyin. Bağlantı listenizi yapıştırın; Lincle tek bir yeni sekme bile açmadan tüm hedefleri arka planda eşzamanlı olarak çözümler.

#### 6. Yönlendirme Zinciri İzleyici (Breadcrumb)
Bir bağlantının nihai hedefe ulaşmadan önce geçtiği tüm ara sunucu ve yönlendirme adımlarını haritalandırır. Güvenlik analizleri ve şüpheli bağlantı tespiti için idealdir.

#### 7. Tam Gizlilik ve Yerel Çalışma
İnternet gezinti verileriniz tamamen size aittir. Lincle %100 yerel depolama üzerinde çalışır. Çözümleme işlemlerinin hiçbir aşamasında harici sunucu, bulut işleme veya telemetri takibi yapılmaz.

---

### Kurulum Rehberi

#### Chromium Tarayıcılar (Chrome, Brave, Edge, Opera)
1. Adres çubuğuna `chrome://extensions/` yazın.
2. Sağ üstteki **Geliştirici modu** anahtarını açın.
3. **Paketlenmemiş öğe yükle** butonuna tıklayarak `lincle` klasörünü seçin.

#### Mozilla Firefox
1. Adres çubuğuna `about:debugging#/runtime/this-firefox` yazın.
2. **Geçici Eklenti Yükle...** butonuna tıklayın.
3. `lincle` klasöründeki `manifest.json` dosyasını seçin.

---

**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48)