// Lincle i18n (Internationalization) Engine
// Developed by: Emir Samed (Nyxa48)

const lincleDict = {
    tr: {
        themeDark: "Koyu Mod", themeLight: "Açık Mod",
        optTitle: "Lincle Ayarları", optCalc: "Veriler Hesaplanıyor...",
        langSelect: "Dil Seçimi (Language):",
        algTitle: "Algoritma ve Sistem", debugOpt: "Geliştirici Konsol Loglarını Aktif Et (Debugging)",
        avgWait: "Ortalama Hedef Bekleme Süresi (Saniye):", avgWaitHelp: "Lincle'ın tasarruf ettiği zamanı dinamik hesaplamak için kullanılır.",
        timeoutOpt: "Zaman Aşımı Süresi (Saniye):",
        breadcrumb: "Breadcrumb İzleyiciyi Aktif Et (Tüm URL yönlendirmelerini kaydeder)",
        wlTitle: "Beyaz Liste ve Kısayollar", domainOpt: "Engellenen/Atlanan Domainler (Her satıra bir domain):",
        domainPlh: "ornek.com\nkisalt.co",
        shortcutOpt: "Klavye Kısayolu:", shortcutHelp: "Kısayol tuşlarını tarayıcının yerel ayarlarından güvenle değiştirebilirsiniz.", btnShortcut: "Kısayol Tuşlarını Düzenle",
        bulkTitle: "Araştırmacı: Toplu Çözümleyici", bulkHelp: "Sekme açmadan, arka planda statik motoruyla toplu link çözer.", btnBulk: "Toplu Çözümle",
        regexTitle: "Araştırmacı: Özel Regex Kuralları", regexHelp: "Layer 0 URL ayıklama kurallarınızı ekleyin. Örn: url=['\"]([^'\"]+)",
        logTitle: "Sistem Logları", chainOpt: "Yönlendirme Zinciri (Redirect Chain)", btnClearChain: "Zinciri Temizle",
        failOpt: "Başarısızlık Raporları (Resolver Failures)", btnEmail: "Geliştiriciye Raporla", btnClearFail: "Raporları Temizle",
        btnSave: "Tüm Ayarları Kaydet", saveStatus: "Kaydedildi!",
        popShield: "Koruma Kalkanı", popCleaned: "Temizlenen", popSaved: "Tasarruf",
        btnCleanClip: "Panodaki Bağlantıyı Temizle", btnAdvSet: "Gelişmiş Ayarlar",
        clipNoLink: "Panoda geçerli bir bağlantı bulunamadı.", clipSearch: "Bağlantı arka planda çözümleniyor...", clipFound: "Hedef bulundu ve panoya kopyalandı.", clipFail: "Statik bir hedef bulunamadı."
    },
    en: {
        themeDark: "Dark Mode", themeLight: "Light Mode",
        optTitle: "Lincle Settings", optCalc: "Calculating Data...",
        langSelect: "Language Selection:",
        algTitle: "Algorithm & System", debugOpt: "Enable Developer Console Logs (Debugging)",
        avgWait: "Average Target Wait Time (Seconds):", avgWaitHelp: "Used to dynamically calculate the time saved by Lincle.",
        timeoutOpt: "Timeout Duration (Seconds):",
        breadcrumb: "Enable Breadcrumb Tracker (Logs all URL redirects)",
        wlTitle: "Whitelist & Shortcuts", domainOpt: "Blocked/Skipped Domains (One per line):",
        domainPlh: "example.com\nshort.co",
        shortcutOpt: "Keyboard Shortcut:", shortcutHelp: "You can safely change shortcut keys from the browser's native settings.", btnShortcut: "Edit Shortcut Keys",
        bulkTitle: "Researcher: Bulk Resolver", bulkHelp: "Resolves bulk links in the background without opening tabs.", btnBulk: "Bulk Resolve",
        regexTitle: "Researcher: Custom Regex Rules", regexHelp: "Add your Layer 0 extraction rules. Ex: url=['\"]([^'\"]+)",
        logTitle: "System Logs", chainOpt: "Redirect Chain", btnClearChain: "Clear Chain",
        failOpt: "Resolver Failures", btnEmail: "Report to Developer", btnClearFail: "Clear Reports",
        btnSave: "Save All Settings", saveStatus: "Saved!",
        popShield: "Protection Shield", popCleaned: "Cleaned", popSaved: "Saved",
        btnCleanClip: "Clean Link from Clipboard", btnAdvSet: "Advanced Settings",
        clipNoLink: "No valid link found in clipboard.", clipSearch: "Resolving link in background...", clipFound: "Target found & copied to clipboard.", clipFail: "No static target found."
    },
    de: {
        themeDark: "Dunkelmodus", themeLight: "Heller Modus",
        optTitle: "Lincle Einstellungen", optCalc: "Daten werden berechnet...",
        langSelect: "Sprachauswahl:",
        algTitle: "Algorithmus & System", debugOpt: "Entwicklerkonsolen-Protokolle aktivieren",
        avgWait: "Durchsch. Wartezeit (Sekunden):", avgWaitHelp: "Wird verwendet, um die von Lincle eingesparte Zeit zu berechnen.",
        timeoutOpt: "Zeitüberschreitung (Sekunden):",
        breadcrumb: "Breadcrumb-Tracker aktivieren (Protokolliert alle Weiterleitungen)",
        wlTitle: "Whitelist & Verknüpfungen", domainOpt: "Blockierte/Übersprungene Domains (Eine pro Zeile):",
        domainPlh: "beispiel.com\nkurz.co",
        shortcutOpt: "Tastaturkürzel:", shortcutHelp: "Sie können die Tastenkombinationen in den Browsereinstellungen ändern.", btnShortcut: "Tastaturkürzel bearbeiten",
        bulkTitle: "Forscher: Bulk Resolver", bulkHelp: "Löst Massenlinks im Hintergrund auf, ohne Tabs zu öffnen.", btnBulk: "Massenauflösung",
        regexTitle: "Forscher: Eigene Regex-Regeln", regexHelp: "Fügen Sie Extraktionsregeln hinzu. Bsp: url=['\"]([^'\"]+)",
        logTitle: "Systemprotokolle", chainOpt: "Weiterleitungskette", btnClearChain: "Kette löschen",
        failOpt: "Fehlerberichte", btnEmail: "An Entwickler melden", btnClearFail: "Berichte löschen",
        btnSave: "Alle Einstellungen speichern", saveStatus: "Gespeichert!",
        popShield: "Schutzschild", popCleaned: "Gereinigt", popSaved: "Gespart",
        btnCleanClip: "Link aus Zwischenablage bereinigen", btnAdvSet: "Erweiterte Einstellungen",
        clipNoLink: "Kein gültiger Link in der Zwischenablage.", clipSearch: "Link wird im Hintergrund aufgelöst...", clipFound: "Ziel gefunden & in Zwischenablage kopiert.", clipFail: "Kein statisches Ziel gefunden."
    },
    fr: {
        themeDark: "Mode Sombre", themeLight: "Mode Clair",
        optTitle: "Paramètres Lincle", optCalc: "Calcul des données...",
        langSelect: "Sélection de la langue:",
        algTitle: "Algorithme et Système", debugOpt: "Activer les journaux de la console (Débogage)",
        avgWait: "Temps d'attente moyen (Secondes):", avgWaitHelp: "Utilisé pour calculer le temps économisé par Lincle.",
        timeoutOpt: "Délai d'attente (Secondes):",
        breadcrumb: "Activer le traceur de fil d'Ariane (Enregistre les redirections)",
        wlTitle: "Liste blanche et Raccourcis", domainOpt: "Domaines bloqués/ignorés (Un par ligne):",
        domainPlh: "exemple.com\ncourt.co",
        shortcutOpt: "Raccourci clavier:", shortcutHelp: "Vous pouvez modifier les raccourcis dans les paramètres du navigateur.", btnShortcut: "Modifier les raccourcis",
        bulkTitle: "Chercheur: Résolveur en masse", bulkHelp: "Résout les liens en arrière-plan sans ouvrir d'onglets.", btnBulk: "Résolution en masse",
        regexTitle: "Chercheur: Règles Regex personnalisées", regexHelp: "Ajoutez vos règles d'extraction. Ex: url=['\"]([^'\"]+)",
        logTitle: "Journaux système", chainOpt: "Chaîne de redirection", btnClearChain: "Effacer la chaîne",
        failOpt: "Rapports d'échec", btnEmail: "Signaler au développeur", btnClearFail: "Effacer les rapports",
        btnSave: "Enregistrer les paramètres", saveStatus: "Enregistré!",
        popShield: "Bouclier", popCleaned: "Nettoyé", popSaved: "Économisé",
        btnCleanClip: "Nettoyer le lien du presse-papiers", btnAdvSet: "Paramètres avancés",
        clipNoLink: "Aucun lien valide dans le presse-papiers.", clipSearch: "Résolution du lien...", clipFound: "Cible copiée dans le presse-papiers.", clipFail: "Aucune cible statique trouvée."
    }
};

// Sayfadaki "data-i18n" etiketine sahip tüm yazıları seçilen dile göre çevirir
async function applyTranslations() {
    const data = await chrome.storage.local.get("lincleLang");
    const lang = data.lincleLang || 'tr';
    const dict = lincleDict[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
}