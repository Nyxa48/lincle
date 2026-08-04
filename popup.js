// Lincle Popup UI v3.8.2
// Developed by: Emir Samed (Nyxa48)
const ext = (typeof browser !== "undefined") ? browser : chrome;

document.addEventListener('DOMContentLoaded', initUI);

async function initUI() {
    // ── Language ─────────────────────────────────────────────────────────
    const langData = await ext.storage.local.get("lincleLang");
    const currentLang = langData.lincleLang || 'en';
    await applyTranslations();

    // ── Theme + Font (via theme-engine.js) ──────────────────────────────
    let currentTheme = await lincleLoadTheme();
    await lincleLoadFont();
    updateThemeIcon(currentTheme);

    document.getElementById('themeToggleBtn').addEventListener('click', async () => {
        currentTheme = await lincleCycleTheme();
        updateThemeIcon(currentTheme);
    });

    // ── Master toggle & Shield toggle ───────────────────────────────────
    const masterToggle  = document.getElementById('masterToggle');
    const shieldToggle  = document.getElementById('shieldToggle');
    const settingsData  = await ext.storage.local.get("lincleSettings");
    const optionsData   = await ext.storage.local.get("lincleOptions");

    const isActive       = (settingsData.lincleSettings || {}).isActive !== false;
    const isShieldActive = (optionsData.lincleOptions || {}).enablePopupShield !== false;

    if (masterToggle) masterToggle.checked = isActive;
    if (shieldToggle) shieldToggle.checked = isShieldActive;
    updateShieldUI(isActive && isShieldActive, currentLang);

    if (masterToggle) {
        masterToggle.addEventListener('change', async (e) => {
            const active = e.target.checked;
            await ext.storage.local.set({ lincleSettings: { isActive: active } });
            const curOpts = (await ext.storage.local.get("lincleOptions")).lincleOptions || {};
            updateShieldUI(active && (curOpts.enablePopupShield !== false), currentLang);
        });
    }

    if (shieldToggle) {
        shieldToggle.addEventListener('change', async (e) => {
            const on = e.target.checked;
            const curOpts = (await ext.storage.local.get("lincleOptions")).lincleOptions || {};
            curOpts.enablePopupShield = on;
            await ext.storage.local.set({ lincleOptions: curOpts });
            const curSettings = (await ext.storage.local.get("lincleSettings")).lincleSettings || {};
            updateShieldUI((curSettings.isActive !== false) && on, currentLang);
        });
    }

    // ── Stats ────────────────────────────────────────────────────────────
    const statsData = await ext.storage.local.get('lincleStats');
    const stats     = statsData.lincleStats || { cleanedLinks: 0, savedSeconds: 0 };
    const isTr      = currentLang === 'tr';
    const sec       = Number(stats.savedSeconds) || 0;
    const timeText  = sec >= 3600 ? `${(sec/3600).toFixed(1)}${isTr?'sa':'h'}`
                    : sec >= 60   ? `${(sec/60).toFixed(1)}${isTr?'dk':'m'}`
                                  : `${Math.floor(sec)}${isTr?'sn':'s'}`;
    setEl('valLinks', (Number(stats.cleanedLinks) || 0).toLocaleString());
    setEl('valTime',  timeText);

    // ── Version ──────────────────────────────────────────────────────────
    try {
        const v = ext.runtime.getManifest().version;
        setEl('shieldVersion', `v${v}`);
    } catch { /* non-fatal */ }

    // ── Clipboard cleaner ────────────────────────────────────────────────
    const dict          = getLangDict(currentLang);
    const cleanClipBtn  = document.getElementById('cleanClipBtn');
    const clipResult    = document.getElementById('clipResult');

    function showToast(text, type) {
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

        showToast(dict.clipSearch || 'Resolving...', 'info');

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
                showToast(`${found}`, 'success');
            } else {
                showToast(dict.clipFail || 'No static target found.', 'error');
            }
        } catch { showToast(dict.clipFail || 'Could not resolve.', 'error'); }
    });

    // ── Open options ─────────────────────────────────────────────────────
    const openOpts = () => ext.runtime.openOptionsPage
        ? ext.runtime.openOptionsPage()
        : ext.tabs.create({ url: ext.runtime.getURL('options.html') });
    const btnOpt = document.getElementById('openOptions');
    if (btnOpt) btnOpt.addEventListener('click', openOpts);
}

// ── Theme Icon Updater ──────────────────────────────────────────────────
function updateThemeIcon(themeObj) {
    const btn     = document.getElementById('themeToggleBtn');
    const use     = document.querySelector('#themeIcon use');
    if (!use) return;
    const preset    = lincleGetPresetName(themeObj);
    const presetDef = LINCLE_PRESETS[preset];
    const themeName = themeObj.name || presetDef?.name || preset;
    if (btn) btn.title = `Theme: ${themeName}`;

    // 3-state cycle icons:
    // void  → circle-dot (ic-void)  — darkest minimal
    // light → sun        (ic-sun)   — light mode
    // other → palette    (ic-palette) — any custom/preset 3rd slot
    if      (preset === 'void')  use.setAttribute('href', '#ic-void');
    else if (preset === 'light') use.setAttribute('href', '#ic-sun');
    else                         use.setAttribute('href', '#ic-palette');
}

// ── Shield UI Updater ───────────────────────────────────────────────────
function updateShieldUI(active, lang) {
    const card       = document.getElementById('shieldCard');
    const iconWrap   = document.getElementById('shieldIconWrap');
    const shieldSvg  = document.getElementById('shieldSvg');
    const statusEl   = document.getElementById('shieldStatus');
    const statusText = document.getElementById('shieldStatusText');
    const dot        = document.getElementById('statusDot');

    if (card)      card.className      = 'shield-card' + (active ? '' : ' off');
    if (iconWrap)  iconWrap.className  = 'shield-icon-wrap' + (active ? '' : ' off');
    if (shieldSvg) {
        const use = shieldSvg.querySelector('use');
        if (use) use.setAttribute('href', active ? '#ic-shield-check' : '#ic-shield-off');
    }
    if (statusEl)   statusEl.className  = 'shield-status' + (active ? '' : ' off');
    const dict = getLangDict(lang);
    if (statusText) statusText.textContent = active
        ? (dict.popActive || 'Active')
        : (dict.popDisabled || 'Disabled');
    if (dot)  dot.className  = 'status-dot' + (active ? '' : ' off');
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
