# 🛡️ Lincle - The Ultimate Link Cleaner & Bypass Tool

![Version](https://img.shields.io/badge/version-2.3-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Privacy](https://img.shields.io/badge/Privacy-Zero_Telemetry-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)

> 🌍 **Bilingual README**: [English](#english) | [Türkçe](#türkçe)

---

<a id="english"></a>
## 🇬🇧 English

### 📖 About the Project
**Lincle** is a privacy-first, open-source Chrome/Brave extension designed to protect your digital footprint. It automatically bypasses aggressive link shorteners, ad-gates, and countdown timers (such as bc.vc, adf.ly, linkvertise, etc.), taking you directly to your intended destination without exposing you to malware, tracking cookies, or annoying pop-ups.

### ✨ Key Features
* **🧠 Heuristic Engine (18 Languages):** Auto-detects countdowns and "skip ad" buttons globally (English, Spanish, Russian, Chinese, Arabic, and more).
* **🚫 Zero Telemetry:** 100% offline. No external APIs, no analytics. Your data never leaves your browser.
* **⚡ 3-Layer Bypass Architecture:** Combines static DOM extraction, global blacklists, and dynamic mutation observers to catch links in milliseconds.
* **🎛️ Master Kill Switch:** A modern, sleek UI that allows you to instantly enable or disable the extension with a single click.
* **🛡️ Global Whitelist:** Prevents false positives. Automatically sleeps on trusted domains like GitHub, Google, Amazon, and banking sites.

### 🏗️ How It Works (The Architecture)
Lincle does not rely on a simple clicker. It evaluates every page through a 3-layer security protocol:
1. **Layer 0 (Static Extraction):** Scans the raw HTML for hidden destination URLs (`var url = "..."` or meta-refreshes) and redirects you without executing any malicious page scripts.
2. **Layer 1 (Known Threats):** Instantly triggers the bypass engine for known ad-gate networks hardcoded into the global blacklist.
3. **Layer 2 (Auto-Detect MutationObserver):** If a site is unknown, Lincle monitors the DOM in real-time. If it detects a combination of a countdown timer and a gateway phrase (e.g., "Please wait" + "Skip Ad"), it surgically extracts the link or forces the button click safely.

### 🛠️ Installation (Developer Mode)
Since Lincle is currently an independent open-source project, you can install it manually in 3 simple steps:
1. Download this repository as a `.zip` file and extract it, or clone it:
   `git clone https://github.com/Nyxa48/lincle.git`
2. Open your Chromium-based browser (Chrome, Brave, Edge) and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner, click **"Load unpacked"**, and select the `lincle` folder.

---

<a id="türkçe"></a>
## 🇹🇷 Türkçe

### 📖 Proje Hakkında
**Lincle**, dijital ayak izinizi korumak için tasarlanmış, gizlilik odaklı ve açık kaynaklı bir Chrome/Brave eklentisidir. Agresif link kısaltıcıları, reklam kapılarını ve geri sayım sayaçlarını (bc.vc, adf.ly, linkvertise vb.) otomatik olarak atlayarak, sizi kötü amaçlı yazılımlara veya takip çerezlerine maruz bırakmadan doğrudan hedef linkinize ulaştırır.

### ✨ Temel Özellikler
* **🧠 Sezgisel Algılama Motoru (18 Dil):** Geri sayım sayaçlarını ve "Reklamı Geç" butonlarını küresel ölçekte (İngilizce, İspanyolca, Rusça, Çince, Arapça vb.) otomatik tanır.
* **🚫 Sıfır Veri Toplama (Zero Telemetry):** %100 yerel (offline) çalışır. Harici API veya analiz aracı kullanmaz. Verileriniz tarayıcınızdan asla dışarı çıkmaz.
* **⚡ 3 Katmanlı Atlatma Mimarisi:** Statik DOM çıkarımı, küresel kara listeler ve dinamik DOM izleyicilerini (MutationObserver) birleştirerek linkleri milisaniyeler içinde çözer.
* **🎛️ Ana Şalter (Kill Switch):** Eklentiyi tek bir tıklamayla anında açıp kapatmanızı sağlayan modern ve şık bir arayüz.
* **🛡️ Küresel Beyaz Liste:** Yanlış algılamaları (false-positive) önler. GitHub, Google, Amazon gibi güvenilir sitelerde sistem otomatik olarak uyku moduna geçer.

### 🏗️ Nasıl Çalışır? (Mimari)
Lincle sadece basit bir "butona tıklama" aracı değildir. Her sayfayı 3 katmanlı bir güvenlik protokolünden geçirir:
1. **Katman 0 (Statik Çıkarım):** Gizli hedef URL'leri sayfanın ham HTML kodunda arar ve zararlı sayfa scriptleri (reklamlar vb.) çalışmadan önce sizi güvenliğe yönlendirir.
2. **Katman 1 (Bilinen Tehditler):** Sisteme önceden kodlanmış bilinen reklam ağı listesine girildiğinde doğrudan çözücü motoru tetikler.
3. **Katman 2 (Sezgisel Otomatik Algılama):** Site bilinmiyorsa, Lincle DOM'u gerçek zamanlı izler. Bir geri sayım sayacı ile kapı metninin ("Lütfen bekleyin" + "Geç") birleşimini gördüğü an hedef linki cımbızla çeker veya güvenli bir şekilde butona tıklar.

### 🛠️ Kurulum (Geliştirici Modu)
Lincle şu an bağımsız, açık kaynaklı bir proje olduğu için tarayıcınıza 3 basit adımla manuel olarak kurabilirsiniz:
1. Bu depoyu `.zip` olarak indirin ve klasöre çıkartın veya terminalden klonlayın:
   `git clone https://github.com/Nyxa48/lincle.git`
2. Tarayıcınızı (Chrome, Brave, Edge) açın ve `chrome://extensions/` adresine gidin.
3. Sağ üst köşeden **"Geliştirici modu"** (Developer mode) seçeneğini açın, **"Paketlenmemiş öğe yükle"** (Load unpacked) butonuna tıklayın ve çıkarttığınız `lincle` klasörünü seçin.

---
**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48) | **License:** MIT