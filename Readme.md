# Lincle - Advanced Link Cleaner & Bypass Engine

![Version](https://img.shields.io/badge/version-2.3-blue.svg)
![Manifest](https://img.shields.io/badge/Manifest-V3-success.svg)
![Privacy](https://img.shields.io/badge/Privacy-Zero_Telemetry-brightgreen.svg)

> **Bilingual README**: [English](#english) | [Turkce](#turkce)

---

<a id="english"></a>
## English

### About the Project
Lincle is a privacy-first, open-source browser extension specifically engineered to neutralize aggressive link shorteners, ad-gateways, and countdown-based tracking pages. Many third-party redirect services harvest user data, inject third-party tracking cookies, and expose users to malicious scripts before delivering the actual destination URL. 

Lincle intercepts these requests at the browser engine level and extracts the true destination link, bypassing the intermediary networks entirely. It ensures a seamless, tracker-free navigation experience without compromising browser performance.

### Core Features & Capabilities
* **Global Heuristic Engine:** Operates across 18 major languages (including English, Spanish, Russian, Chinese, Japanese, and Arabic). The engine dynamically recognizes "skip" actions, gateway phrases, and countdown mechanisms regardless of the regional setting.
* **Zero Telemetry & 100% Local Execution:** Lincle does not rely on external APIs, remote servers, or cloud-based URL resolvers. Every parsing operation is executed locally on the client's machine using `chrome.storage.local`. No data is ever transmitted.
* **Performance-Optimized DOM Monitoring:** Instead of using resource-heavy continuous polling (`setInterval`), Lincle utilizes a throttled `MutationObserver`. It only scans the page when specific DOM elements change, drastically reducing CPU load.
* **Master Kill Switch:** A built-in, seamlessly integrated UI toggle allows users to completely halt Lincle's background operations without needing to uninstall or disable the extension from the browser settings.
* **Global Whitelist Architecture:** Features a hardcoded exclusion list for major platforms (GitHub, Google, Amazon, banking domains, etc.) to definitively prevent false-positive triggerings on trusted networks.

### Technical Architecture
Lincle does not blindly click buttons. It evaluates the Document Object Model (DOM) through a rigorous 3-layer security protocol:

* **Layer 0 (Static Extraction):** The engine scans the raw HTML upon load. It utilizes complex Regular Expressions to find hidden destination URLs typically embedded in script variables (e.g., `var url = "..."`) or meta-refresh tags. If found, it redirects immediately before malicious scripts execute.
* **Layer 1 (Pre-defined Threat Blacklist):** The extension ships with an integrated list of known aggressive redirectors (e.g., bc.vc, adf.ly, linkvertise). When a user visits these domains, the bypass mechanism is triggered unconditionally.
* **Layer 2 (Behavioral Auto-Detection):** If an unknown domain is accessed, Lincle analyzes the page structure behaviorally. The bypass protocol is authorized only if a specific combination is met: a visible action button AND a recognized gateway phrase/countdown timer. This dual-verification eliminates the risk of clicking arbitrary buttons on standard websites.

### Installation Guide (Developer Mode)
As an independent open-source tool, Lincle is installed via Chromium's developer environment:
1. Download this repository as a `.zip` file and extract it to a dedicated folder, or clone it via terminal:
   `git clone https://github.com/Nyxa48/lincle.git`
2. Launch your Chromium-based browser (Chrome, Brave, Edge, Opera) and navigate to the extensions page (`chrome://extensions/`).
3. Enable **"Developer mode"** located in the top right corner.
4. Click the **"Load unpacked"** button and select the extracted `lincle` folder.

---

<a id="turkce"></a>
## Turkce

### Proje Hakkinda
Lincle, agresif link kisalticilarini, reklam kapilarini ve geri sayim tabanli takip sayfalarini etkisiz hale getirmek uzere muhendisligi yapilmis, gizlilik odakli ve acik kaynakli bir tarayici eklentisidir. Bircok ucuncu taraf yonlendirme servisi, gercek hedef URL'yi sunmadan once kullanici verilerini toplar, izleme cerezleri enjekte eder ve kullanicilari zararli scriptlere maruz birakir.

Lincle, bu istekleri tarayici motoru seviyesinde yakalar ve araci aglari tamamen devre disi birakarak gercek hedef linki ayiklar. Tarayici performansindan odun vermeden, kesintisiz ve izleyicilerden arindirilmis bir gezinme deneyimi sunar.

### Temel Ozellikler ve Kapasite
* **Kuresel Sezgisel Motor (Heuristic Engine):** 18 farkli dilde (Ingilizce, Ispanyolca, Rusca, Cince, Japonca, Arapca vb.) calisir. Motor; bolgesel ayarlardan bagimsiz olarak atlama eylemlerini, kapi metinlerini ve geri sayim mekanizmalarini dinamik olarak tanir.
* **Sifir Veri Toplama (Zero Telemetry) ve %100 Yerel Calisma:** Lincle, harici API'lere, uzak sunuculara veya bulut tabanli URL cozuculerine ihtiyac duymaz. Tum ayiklama islemleri `chrome.storage.local` kullanilarak kullanicinin kendi cihazinda gerceklestirilir. Hicbir veri disari aktarilmaz.
* **Performans Odakli DOM Izleme:** Kaynak tuketen surekli tarama (`setInterval`) donguleri yerine Lincle, sinirlandirilmis (throttled) bir `MutationObserver` kullanir. Sayfayi yalnizca belirli DOM bilesenleri degistiginde tarayarak islemci (CPU) yukunu ciddi olcude azaltir.
* **Ana Salter (Kill Switch):** Sisteme entegre edilmis modern bir arayuz anahtari, kullanicilarin tarayici ayarlarina girmeden Lincle'in arka plan operasyonlarini tek tikla tamamen durdurmasina olanak tanir.
* **Kuresel Beyaz Liste Mimarisi:** Guvenilir aglarda yanlis algilamalari (false-positive) kesin olarak onlemek amaciyla buyuk platformlar (GitHub, Google, Amazon, bankacilik alan adlari vb.) icin koda gomulu bir haric tutma listesi barindirir.

### Teknik Mimari
Lincle sadece rastgele butonlara tiklayan bir arac degildir. DOM (Belge Nesne Modeli) yapisini 3 katmanli kati bir guvenlik protokolunden gecirir:

* **Katman 0 (Statik Cikarim):** Motor, sayfa yuklendiginde ham HTML'i tarar. Genellikle script degiskenlerine (`var url = "..."` gibi) veya meta-refresh etiketlerine gizlenmis hedef URL'leri bulmak icin karmasik Duzenli Ifadeler (Regex) kullanir. Bulunursa, zararli scriptler calismadan once aninda yonlendirme yapar.
* **Katman 1 (Onceden Tanimli Tehdit Kara Listesi):** Eklenti, bilinen agresif yonlendiricilerin (orn. bc.vc, adf.ly, linkvertise) entegre bir listesiyle birlikte gelir. Kullanici bu alan adlarina girdiginde, atlatma mekanizmasi kossulsuz olarak tetiklenir.
* **Katman 2 (Davranissal Otomatik Algilama):** Bilinmeyen bir alan adina erisildiginde, Lincle sayfa yapisini davranissal olarak analiz eder. Atlatma protokolu yalnizca belirli bir kombinasyon karsilandiginda onaylanir: Gorunur bir islem butonu VE taninan bir kapi metni/geri sayim sayaci. Bu cift dogrulama mekanizmasi, standart web sitelerindeki rastgele butonlara tiklanma riskini ortadan kaldirir.

### Kurulum Rehberi (Gelistirici Modu)
Bagimsiz acik kaynakli bir arac olarak Lincle, Chromium'un gelistirici ortami uzerinden kurulur:
1. Bu depoyu bir `.zip` dosyasi olarak indirin ve ozel bir klasore cikartin veya terminal uzerinden klonlayin:
   `git clone https://github.com/Nyxa48/lincle.git`
2. Chromium tabanli tarayicinizi (Chrome, Brave, Edge, Opera) basin ve uzantilar sayfasina (`chrome://extensions/`) gidin.
3. Sag ust kosede bulunan **"Gelistirici modu"** (Developer mode) secenegini aktiflestirin.
4. **"Paketlenmemis oge yukle"** (Load unpacked) butonuna tiklayin ve cikarttiginiz `lincle` klasorunu secin.

---
**Developed by** [Emir Samed (Nyxa48)](https://github.com/Nyxa48)