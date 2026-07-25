// Lincle Popup UI v2.7
// Developed by: Emir Samed (Nyxa48)
const ext = (typeof browser !== "undefined") ? browser : chrome;

document.addEventListener('DOMContentLoaded', initUI);

async function initUI() {
    // ── Language ───────────────────────────────────────────────────────────
    const langData = await ext.storage.local.get("lincleLang");
    const currentLang = langData.lincleLang || 'en';
    await applyTranslations();

    // ── Theme ──────────────────────────────────────────────────────────────
    const themeData = await ext.storage.local.get("lincleTheme");
    let theme = themeData.lincleTheme || 'dark';
    applyTheme(theme);

    document.getElementById('themeToggleBtn').addEventListener('click', async () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        await ext.storage.local.set({ lincleTheme: theme });
        applyTheme(theme);
    });

    // ── Master toggle ──────────────────────────────────────────────────────
    const masterToggle  = document.getElementById('masterToggle');
    const settingsData  = await ext.storage.local.get("lincleSettings");
    const isActive      = (settingsData.lincleSettings || {}).isActive !== false;
    masterToggle.checked = isActive;
    updateShieldUI(isActive, currentLang);

    masterToggle.addEventListener('change', async (e) => {
        const active = e.target.checked;
        await ext.storage.local.set({ lincleSettings: { isActive: active } });
        updateShieldUI(active, currentLang);
    });

    // ── Stats ──────────────────────────────────────────────────────────────
    const statsData = await ext.storage.local.get("lincleStats");
    const stats     = statsData.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
    const isTr      = currentLang === 'tr';
    const sec       = stats.savedSeconds || 0;
    const timeText  = sec >= 3600 ? `${(sec/3600).toFixed(1)}${isTr?'sa':'h'}`
                    : sec >= 60   ? `${(sec/60).toFixed(1)}${isTr?'dk':'m'}`
                                  : `${Math.floor(sec)}${isTr?'sn':'s'}`;
    setEl('valLinks', (stats.cleanedLinks || 0).toLocaleString());
    setEl('valTime',  timeText);

    // ── Version line ───────────────────────────────────────────────────────
    try {
        const v = ext.runtime.getManifest().version;
        setEl('shieldVersion', `v${v} · Lincle`);
    } catch { /* non-fatal */ }

    // ── Clipboard cleaner ──────────────────────────────────────────────────
    const dict          = getLangDict(currentLang);
    const cleanClipBtn  = document.getElementById('cleanClipBtn');
    const clipResult    = document.getElementById('clipResult');

    function showToast(text, type /* success|error|info|'' */) {
        clipResult.textContent  = text;
        clipResult.className    = 'show ' + type;
        clearTimeout(clipResult._timer);
        clipResult._timer = setTimeout(() => { clipResult.className = ''; }, 4500);
    }

    cleanClipBtn.addEventListener('click', async () => {
        let clipText = '';
        try { clipText = await navigator.clipboard.readText(); }
        catch { showToast(dict.clipNoLink || 'No clipboard access.', 'error'); return; }

        const urlMatch = clipText.match(/https?:\/\/[^\s"'<>]+/);
        if (!urlMatch) { showToast(dict.clipNoLink || 'No valid link found.', 'error'); return; }

        showToast(dict.clipSearch || 'Resolving…', 'info');

        try {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), 8000);
            const res  = await fetch(urlMatch[0], { credentials:'omit', redirect:'follow', signal:ctrl.signal });
            if (!res.ok) throw new Error('fetch failed');
            const html = await res.text();
            const patterns = [
                /var\s+url\s*=\s*['"]([^'"]+)['"]/,
                /var\s+target_url\s*=\s*['"]([^'"]+)['"]/,
                /window\.location\.href\s*=\s*['"]([^'"]+)['"]/,
            ];
            let found = null;
            for (const p of patterns) {
                const m = html.match(p);
                if (m?.[1] && /^https?:\/\//.test(m[1])) { found = m[1]; break; }
            }
            if (found) {
                await navigator.clipboard.writeText(found);
                showToast(`✓ ${found}`, 'success');
            } else {
                showToast(dict.clipFail || 'No static target found.', 'error');
            }
        } catch { showToast(dict.clipFail || 'Could not resolve.', 'error'); }
    });

    // ── Open options ───────────────────────────────────────────────────────
    const openOpts = () => ext.runtime.openOptionsPage
        ? ext.runtime.openOptionsPage()
        : ext.tabs.create({ url: ext.runtime.getURL('options.html') });
    document.getElementById('openOptions').addEventListener('click', openOpts);
    document.getElementById('openOptions2').addEventListener('click', openOpts);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const use = document.querySelector('#themeIcon use');
    if (use) use.setAttribute('href', theme === 'dark' ? '#ic-sun' : '#ic-moon');
}

function updateShieldUI(active, lang) {
    const card       = document.getElementById('shieldCard');
    const iconWrap   = document.getElementById('shieldIconWrap');
    const shieldSvg  = document.getElementById('shieldSvg');
    const statusEl   = document.getElementById('shieldStatus');
    const statusText = document.getElementById('shieldStatusText');
    const dot        = document.getElementById('statusDot');
    const hint       = document.getElementById('powerHint');
    const dict       = getLangDict(lang);

    if (card)      card.className      = 'shield-card' + (active ? '' : ' off');
    if (iconWrap)  iconWrap.className  = 'shield-icon-wrap' + (active ? '' : ' off');
    if (shieldSvg) {
        const use = shieldSvg.querySelector('use');
        if (use) use.setAttribute('href', active ? '#ic-shield-check' : '#ic-shield-off');
    }
    if (statusEl)   statusEl.className  = 'shield-status' + (active ? '' : ' off');
    if (statusText) statusText.textContent = active
        ? (lang === 'tr' ? 'Aktif — izleyiciler engellendi' : 'Active — blocking trackers')
        : (lang === 'tr' ? 'Devre Dışı' : 'Disabled');
    if (dot)  dot.className  = 'status-dot' + (active ? '' : ' off');
    if (hint) hint.textContent = active
        ? (lang === 'tr' ? 'Devre dışı bırakmak için tıkla' : 'Tap to disable')
        : (lang === 'tr' ? 'Etkinleştirmek için tıkla'       : 'Tap to enable');
}

function getLangDict(lang) {
    return (typeof lincleDict !== 'undefined' && lincleDict[lang]) ? lincleDict[lang]
         : (typeof lincleDict !== 'undefined' && lincleDict['en']) ? lincleDict['en']
         : {};
}

function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}
