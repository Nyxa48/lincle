// Lincle i18n (Internationalization) Engine v2.5
// Developed by: Emir Samed (Nyxa48)
// Languages: TR, EN, DE, FR, ES, PT, IT, RU, DA

// Bug fix: use the cross-browser shim instead of chrome.* directly
const _ext = (typeof browser !== "undefined") ? browser : chrome;

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
        avgWait: "Durchschn. Wartezeit (Sekunden):", avgWaitHelp: "Wird verwendet, um die von Lincle eingesparte Zeit zu berechnen.",
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
        popShield: "Bouclier de protection", popCleaned: "Nettoyé", popSaved: "Économisé",
        btnCleanClip: "Nettoyer le lien du presse-papiers", btnAdvSet: "Paramètres avancés",
        clipNoLink: "Aucun lien valide dans le presse-papiers.", clipSearch: "Résolution du lien en arrière-plan...", clipFound: "Cible trouvée & copiée dans le presse-papiers.", clipFail: "Aucune cible statique trouvée."
    },
    es: {
        themeDark: "Modo Oscuro", themeLight: "Modo Claro",
        optTitle: "Configuración de Lincle", optCalc: "Calculando datos...",
        langSelect: "Selección de idioma:",
        algTitle: "Algoritmo y Sistema", debugOpt: "Activar registros de la consola de desarrollador (Depuración)",
        avgWait: "Tiempo de espera promedio (Segundos):", avgWaitHelp: "Utilizado para calcular dinámicamente el tiempo ahorrado por Lincle.",
        timeoutOpt: "Duración del tiempo de espera (Segundos):",
        breadcrumb: "Activar rastreador de migas de pan (Registra todas las redirecciones de URL)",
        wlTitle: "Lista blanca y Atajos", domainOpt: "Dominios bloqueados/omitidos (Uno por línea):",
        domainPlh: "ejemplo.com\ncorto.co",
        shortcutOpt: "Atajo de teclado:", shortcutHelp: "Puede cambiar las teclas de acceso directo en la configuración nativa del navegador.", btnShortcut: "Editar teclas de acceso directo",
        bulkTitle: "Investigador: Resolvedor masivo", bulkHelp: "Resuelve enlaces masivos en segundo plano sin abrir pestañas.", btnBulk: "Resolver en masa",
        regexTitle: "Investigador: Reglas Regex personalizadas", regexHelp: "Agregue sus reglas de extracción de Capa 0. Ej: url=['\"]([^'\"]+)",
        logTitle: "Registros del sistema", chainOpt: "Cadena de redirección", btnClearChain: "Limpiar cadena",
        failOpt: "Informes de fallos del resolvedor", btnEmail: "Reportar al desarrollador", btnClearFail: "Limpiar informes",
        btnSave: "Guardar toda la configuración", saveStatus: "¡Guardado!",
        popShield: "Escudo de protección", popCleaned: "Limpiado", popSaved: "Ahorrado",
        btnCleanClip: "Limpiar enlace del portapapeles", btnAdvSet: "Configuración avanzada",
        clipNoLink: "No se encontró un enlace válido en el portapapeles.", clipSearch: "Resolviendo enlace en segundo plano...", clipFound: "¡Destino encontrado y copiado al portapapeles!", clipFail: "No se encontró un destino estático."
    },
    pt: {
        themeDark: "Modo Escuro", themeLight: "Modo Claro",
        optTitle: "Configurações do Lincle", optCalc: "Calculando dados...",
        langSelect: "Seleção de idioma:",
        algTitle: "Algoritmo e Sistema", debugOpt: "Ativar registros do console do desenvolvedor (Depuração)",
        avgWait: "Tempo médio de espera (Segundos):", avgWaitHelp: "Usado para calcular dinamicamente o tempo economizado pelo Lincle.",
        timeoutOpt: "Duração do tempo limite (Segundos):",
        breadcrumb: "Ativar rastreador de trilha (Registra todos os redirecionamentos de URL)",
        wlTitle: "Lista branca e Atalhos", domainOpt: "Domínios bloqueados/ignorados (Um por linha):",
        domainPlh: "exemplo.com\ncurto.co",
        shortcutOpt: "Atalho de teclado:", shortcutHelp: "Você pode alterar as teclas de atalho nas configurações nativas do navegador.", btnShortcut: "Editar teclas de atalho",
        bulkTitle: "Pesquisador: Resolvedor em massa", bulkHelp: "Resolve links em massa em segundo plano sem abrir abas.", btnBulk: "Resolver em massa",
        regexTitle: "Pesquisador: Regras Regex personalizadas", regexHelp: "Adicione suas regras de extração da Camada 0. Ex: url=['\"]([^'\"]+)",
        logTitle: "Registros do sistema", chainOpt: "Cadeia de redirecionamento", btnClearChain: "Limpar cadeia",
        failOpt: "Relatórios de falha do resolvedor", btnEmail: "Reportar ao desenvolvedor", btnClearFail: "Limpar relatórios",
        btnSave: "Salvar todas as configurações", saveStatus: "Salvo!",
        popShield: "Escudo de proteção", popCleaned: "Limpo", popSaved: "Economizado",
        btnCleanClip: "Limpar link da área de transferência", btnAdvSet: "Configurações avançadas",
        clipNoLink: "Nenhum link válido encontrado na área de transferência.", clipSearch: "Resolvendo link em segundo plano...", clipFound: "Destino encontrado e copiado para a área de transferência.", clipFail: "Nenhum destino estático encontrado."
    },
    it: {
        themeDark: "Modalità Scura", themeLight: "Modalità Chiara",
        optTitle: "Impostazioni Lincle", optCalc: "Calcolo dati in corso...",
        langSelect: "Selezione lingua:",
        algTitle: "Algoritmo e Sistema", debugOpt: "Abilita i registri della console per sviluppatori (Debug)",
        avgWait: "Tempo di attesa medio (Secondi):", avgWaitHelp: "Utilizzato per calcolare dinamicamente il tempo risparmiato da Lincle.",
        timeoutOpt: "Durata del timeout (Secondi):",
        breadcrumb: "Abilita il tracker breadcrumb (Registra tutti i reindirizzamenti URL)",
        wlTitle: "Lista bianca e Scorciatoie", domainOpt: "Domini bloccati/ignorati (Uno per riga):",
        domainPlh: "esempio.com\nbreve.co",
        shortcutOpt: "Scorciatoia da tastiera:", shortcutHelp: "Puoi modificare i tasti di scelta rapida dalle impostazioni native del browser.", btnShortcut: "Modifica tasti di scelta rapida",
        bulkTitle: "Ricercatore: Resolver in blocco", bulkHelp: "Risolve i link in blocco in background senza aprire schede.", btnBulk: "Risolvi in blocco",
        regexTitle: "Ricercatore: Regole Regex personalizzate", regexHelp: "Aggiungi le tue regole di estrazione Layer 0. Es: url=['\"]([^'\"]+)",
        logTitle: "Registri di sistema", chainOpt: "Catena di reindirizzamento", btnClearChain: "Cancella catena",
        failOpt: "Rapporti di errore del resolver", btnEmail: "Segnala allo sviluppatore", btnClearFail: "Cancella rapporti",
        btnSave: "Salva tutte le impostazioni", saveStatus: "Salvato!",
        popShield: "Scudo di protezione", popCleaned: "Ripulito", popSaved: "Risparmiato",
        btnCleanClip: "Pulisci link dagli appunti", btnAdvSet: "Impostazioni avanzate",
        clipNoLink: "Nessun link valido trovato negli appunti.", clipSearch: "Risoluzione del link in background...", clipFound: "Destinazione trovata e copiata negli appunti.", clipFail: "Nessuna destinazione statica trovata."
    },
    ru: {
        themeDark: "Тёмный режим", themeLight: "Светлый режим",
        optTitle: "Настройки Lincle", optCalc: "Вычисление данных...",
        langSelect: "Выбор языка:",
        algTitle: "Алгоритм и система", debugOpt: "Включить журналы консоли разработчика (Отладка)",
        avgWait: "Среднее время ожидания (Секунды):", avgWaitHelp: "Используется для динамического расчёта времени, сэкономленного Lincle.",
        timeoutOpt: "Время ожидания (Секунды):",
        breadcrumb: "Включить отслеживание цепочки переходов (Записывает все перенаправления URL)",
        wlTitle: "Белый список и Горячие клавиши", domainOpt: "Заблокированные/пропущенные домены (По одному на строку):",
        domainPlh: "primer.com\nkorotko.co",
        shortcutOpt: "Горячая клавиша:", shortcutHelp: "Горячие клавиши можно безопасно изменить в настройках браузера.", btnShortcut: "Изменить горячие клавиши",
        bulkTitle: "Исследователь: Массовый резолвер", bulkHelp: "Разрешает ссылки в фоновом режиме без открытия вкладок.", btnBulk: "Массовое разрешение",
        regexTitle: "Исследователь: Пользовательские правила Regex", regexHelp: "Добавьте свои правила извлечения уровня 0. Пример: url=['\"]([^'\"]+)",
        logTitle: "Системные журналы", chainOpt: "Цепочка перенаправлений", btnClearChain: "Очистить цепочку",
        failOpt: "Отчёты об ошибках резолвера", btnEmail: "Сообщить разработчику", btnClearFail: "Очистить отчёты",
        btnSave: "Сохранить все настройки", saveStatus: "Сохранено!",
        popShield: "Защитный щит", popCleaned: "Очищено", popSaved: "Сэкономлено",
        btnCleanClip: "Очистить ссылку из буфера обмена", btnAdvSet: "Расширенные настройки",
        clipNoLink: "В буфере обмена не найдена допустимая ссылка.", clipSearch: "Ссылка разрешается в фоновом режиме...", clipFound: "Цель найдена и скопирована в буфер обмена.", clipFail: "Статическая цель не найдена."
    },
    da: {
        themeDark: "Mørkt tema", themeLight: "Lyst tema",
        optTitle: "Lincle-indstillinger", optCalc: "Beregner data...",
        langSelect: "Sprogvalg:",
        algTitle: "Algoritme og system", debugOpt: "Aktiver udviklerkonsol-logfiler (Fejlfinding)",
        avgWait: "Gennemsnitlig ventetid (Sekunder):", avgWaitHelp: "Bruges til dynamisk at beregne den tid, som Lincle sparer.",
        timeoutOpt: "Timeout-varighed (Sekunder):",
        breadcrumb: "Aktiver brødkrumme-sporing (Registrerer alle URL-omdirigeringer)",
        wlTitle: "Hvidliste og Genveje", domainOpt: "Blokerede/oversprungne domæner (Ét pr. linje):",
        domainPlh: "eksempel.com\nkort.co",
        shortcutOpt: "Tastaturgenvej:", shortcutHelp: "Du kan sikkert ændre genvejstaster i browserens egne indstillinger.", btnShortcut: "Rediger genvejstaster",
        bulkTitle: "Forsker: Masseresolver", bulkHelp: "Løser masselinks i baggrunden uden at åbne faner.", btnBulk: "Masseresolution",
        regexTitle: "Forsker: Brugerdefinerede Regex-regler", regexHelp: "Tilføj dine ekstraheringsregler til lag 0. Eks: url=['\"]([^'\"]+)",
        logTitle: "Systemlogfiler", chainOpt: "Omdirigeringskæde", btnClearChain: "Ryd kæde",
        failOpt: "Fejlrapporter fra resolveren", btnEmail: "Rapportér til udvikleren", btnClearFail: "Ryd rapporter",
        btnSave: "Gem alle indstillinger", saveStatus: "Gemt!",
        popShield: "Beskyttelsesskim", popCleaned: "Renset", popSaved: "Sparet",
        btnCleanClip: "Rens link fra udklipsholder", btnAdvSet: "Avancerede indstillinger",
        clipNoLink: "Intet gyldigt link fundet i udklipsholderen.", clipSearch: "Løser link i baggrunden...", clipFound: "Mål fundet og kopieret til udklipsholderen.", clipFail: "Intet statisk mål fundet."
    }
};

// Bug fix: was using chrome.storage directly — now uses the cross-browser ext shim
async function applyTranslations() {
    const data = await _ext.storage.local.get("lincleLang");
    const lang = data.lincleLang || 'en';
    const dict = lincleDict[lang] || lincleDict['en'];

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
