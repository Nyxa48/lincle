// Lincle Options v3.0 - Theme Engine + Collapsible Cards
// Developed by: Emir Samed (Nyxa48)
const ext = (typeof browser !== 'undefined') ? browser : chrome;

// ─── Color Picker Config ────────────────────────────────────────────────────
const COLOR_KEYS = [
    { key: 'bg',       label: 'Background',       i18n: 'themeBg' },
    { key: 'surface',  label: 'Cards',            i18n: 'themeSurface' },
    { key: 'surface2', label: 'Buttons & Panels', i18n: 'themeSurface2' },
    { key: 'primary',  label: 'Accent',           i18n: 'themePrimary' },
    { key: 'green',    label: 'Success',          i18n: 'themeGreen' },
    { key: 'red',      label: 'Error',            i18n: 'themeRed' },
    { key: 'text',     label: 'Text',             i18n: 'themeText' },
    { key: 'textDim',  label: 'Muted Text',       i18n: 'themeTextDim' },
    { key: 'border',   label: 'Border',           i18n: 'themeBorder' },
];

// ─── On Load ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Apply translations
    if (typeof applyTranslations === 'function') await applyTranslations();

    // Load theme via engine
    const currentTheme = await lincleLoadTheme();

    // ── Collapsible Cards ───────────────────────────────────────────────
    document.querySelectorAll('[data-toggle]').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('[data-card]');
            if (card) card.classList.toggle('open');
        });
    });

    // ── Custom SVG Flag Language Selector ──────────────────────────────
    const LANG_OPTIONS = [
        { code: 'en', name: 'English' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
        { code: 'pt', name: 'Português' },
        { code: 'it', name: 'Italiano' },
        { code: 'ru', name: 'Русский' },
        { code: 'da', name: 'Dansk' },
        { code: 'ja', name: '日本語' },
        { code: 'zh', name: '简体中文' },
        { code: 'ko', name: '한국어' },
        { code: 'ar', name: 'العربية' },
        { code: 'pl', name: 'Polski' },
    ];

    const langDropdown = document.getElementById('customLangDropdown');
    const langTrigger  = document.getElementById('customLangTrigger');
    const langMenu     = document.getElementById('customLangMenu');
    const currentFlag  = document.getElementById('currentLangFlag');
    const currentName  = document.getElementById('currentLangName');

    const langData    = await ext.storage.local.get('lincleLang');
    const currentLang = langData.lincleLang || 'en'; // Defaults to English
    window._currentLang = currentLang;

    function renderLangSelector() {
        if (!langMenu) return;
        const curOpt = LANG_OPTIONS.find(o => o.code === currentLang) || LANG_OPTIONS[0];
        if (currentFlag) currentFlag.innerHTML = LINCLE_FLAGS[curOpt.code] || '';
        if (currentName) currentName.textContent = curOpt.name;

        langMenu.innerHTML = '';
        LANG_OPTIONS.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'custom-lang-item' + (opt.code === currentLang ? ' selected' : '');
            item.innerHTML = `
                <span class="custom-lang-flag">${LINCLE_FLAGS[opt.code] || ''}</span>
                <span>${opt.name}</span>
            `;
            item.addEventListener('click', async () => {
                await ext.storage.local.set({ lincleLang: opt.code });
                langDropdown.classList.remove('open');
                setTimeout(() => location.reload(), 50);
            });
            langMenu.appendChild(item);
        });
    }

    if (langTrigger && langDropdown) {
        langTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target)) {
                langDropdown.classList.remove('open');
            }
        });
    }

    renderLangSelector();

    // ── Theme Preset & Library Management ──────────────────────────────
    const presetBtns       = document.querySelectorAll('[data-preset]');
    const customSection    = document.getElementById('customColorSection');
    const colorGrid        = document.getElementById('colorGrid');
    const btnToggleCustom  = document.getElementById('btnToggleCustom');
    const savedSelect      = document.getElementById('savedThemesSelect');
    const btnSaveCustom    = document.getElementById('btnSaveCustomTheme');
    const btnDeleteCustom  = document.getElementById('btnDeleteCustomTheme');
    const nameInput        = document.getElementById('themeNameInput');

    function setActivePresetUI(themeTarget) {
        const presetName = typeof themeTarget === 'string' ? themeTarget : (themeTarget.preset || '');
        const themeName  = typeof themeTarget === 'object' ? (themeTarget.name || '') : '';
        presetBtns.forEach(b => {
            const pKey  = b.dataset.preset;
            const pName = LINCLE_PRESETS[pKey]?.name || '';
            const isActive = pKey === presetName || (themeName && pName && themeName.toLowerCase() === pName.toLowerCase());
            b.classList.toggle('active', isActive);
        });
    }

    setActivePresetUI(currentTheme);

    const customColors = { ...(currentTheme.colors || LINCLE_PRESETS.dark) };

    // Toggle color editor box
    if (btnToggleCustom) {
        btnToggleCustom.addEventListener('click', () => {
            if (customSection) {
                const isHidden = customSection.style.display === 'none';
                customSection.style.display = isHidden ? 'block' : 'none';
            }
        });
    }

    // Build color picker grid with HEX input fields
    function renderColorGrid() {
        if (!colorGrid) return;
        colorGrid.innerHTML = '';
        const langData = window._currentLang || 'en';
        const dict = (typeof lincleDict !== 'undefined' && lincleDict[langData]) ? lincleDict[langData] : {};

        COLOR_KEYS.forEach(({ key, label, i18n }) => {
            const rawHex = (customColors[key] || '#000000').toUpperCase();
            const cleanHex = rawHex.replace('#', '');
            const localizedLabel = dict[i18n] || label;

            const item = document.createElement('div');
            item.className = 'color-item';
            item.innerHTML = `
                <div class="color-swatch-wrap" style="background:${rawHex}">
                    <input type="color" id="color_${key}" value="${rawHex}">
                </div>
                <div class="color-item-info">
                    <span class="color-item-label" data-i18n="${i18n}">${localizedLabel}</span>
                    <div class="hex-input-wrap">
                        <span class="hex-hash">#</span>
                        <input type="text" class="hex-input" id="hex_${key}" value="${cleanHex}" maxlength="6" spellcheck="false">
                    </div>
                </div>
            `;
            colorGrid.appendChild(item);

            const colorPicker = item.querySelector(`#color_${key}`);
            const hexInput    = item.querySelector(`#hex_${key}`);
            const swatchWrap  = item.querySelector('.color-swatch-wrap');

            colorPicker.addEventListener('input', (e) => {
                const val = e.target.value.toUpperCase();
                customColors[key] = val;
                hexInput.value = val.replace('#', '');
                swatchWrap.style.background = val;

                const themeName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
                const previewTheme = { preset: 'custom', name: themeName, colors: { ...customColors } };
                lincleApplyTheme(previewTheme);
            });

            hexInput.addEventListener('input', (e) => {
                let txt = e.target.value.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
                e.target.value = txt;

                let fullHex = txt;
                if (txt.length === 3) {
                    fullHex = txt.split('').map(c => c + c).join('');
                }

                if (fullHex.length === 6) {
                    const validHex = '#' + fullHex;
                    customColors[key] = validHex;
                    colorPicker.value = validHex;
                    swatchWrap.style.background = validHex;

                    const themeName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
                    const previewTheme = { preset: 'custom', name: themeName, colors: { ...customColors } };
                    lincleApplyTheme(previewTheme);
                }
            });
        });
    }

    renderColorGrid();

    // Auto-Harmonize colors helper
    const btnAutoHarmonize = document.getElementById('btnAutoHarmonize');
    if (btnAutoHarmonize) {
        btnAutoHarmonize.addEventListener('click', () => {
            const bgHex = customColors.bg || '#11111a';
            autoHarmonizeFromBg(bgHex);
        });
    }

    function autoHarmonizeFromBg(bgHex) {
        const rgb = hexToRgb(bgHex);
        if (!rgb) return;

        const isDark = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114) < 128;

        if (isDark) {
            customColors.surface  = adjustColorLightness(bgHex, 0.08);
            customColors.surface2 = adjustColorLightness(bgHex, 0.16);
            customColors.border   = adjustColorLightness(bgHex, 0.26);
            customColors.text     = '#ededf8';
            customColors.textDim  = '#8080b0';
        } else {
            customColors.surface  = adjustColorLightness(bgHex, -0.06);
            customColors.surface2 = adjustColorLightness(bgHex, -0.12);
            customColors.border   = adjustColorLightness(bgHex, -0.20);
            customColors.text     = '#15152a';
            customColors.textDim  = '#656595';
        }

        renderColorGrid();
        const themeName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
        const previewTheme = { preset: 'custom', name: themeName, colors: { ...customColors } };
        lincleApplyTheme(previewTheme);
    }

    // Populate saved custom themes library dropdown
    async function populateSavedThemes() {
        const savedList = await lincleGetSavedThemes();
        if (!savedSelect) return;
        const langData = await ext.storage.local.get("lincleLang");
        const lang = langData.lincleLang || 'en';
        const dict = (typeof lincleDict !== 'undefined' && lincleDict[lang]) ? lincleDict[lang] : (lincleDict['en'] || {});
        const defaultLabel = dict.themeSavedSelect || '-- My Saved Custom Themes --';

        savedSelect.innerHTML = `<option value="" data-i18n="themeSavedSelect">${defaultLabel}</option>`;
        savedList.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            savedSelect.appendChild(opt);
        });
    }
    await populateSavedThemes();

    // Preset button clicks (Dark, Light, Nordic, Emerald, Sunset, Dracula)
    presetBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const preset = btn.dataset.preset;
            setActivePresetUI(preset);
            if (savedSelect) savedSelect.value = '';
            if (btnDeleteCustom) btnDeleteCustom.style.display = 'none';

            if (preset === 'dark' || preset === 'light') {
                await lincleSaveTheme({ preset });
            } else {
                // For Nordic, Emerald, Sunset, Dracula -> set as active Custom theme!
                const presetTheme = LINCLE_PRESETS[preset];
                const themeObj = {
                    preset: 'custom',
                    name: presetTheme?.name || preset,
                    colors: { ...presetTheme },
                };
                Object.assign(customColors, presetTheme);
                COLOR_KEYS.forEach(({ key }) => {
                    const el = document.getElementById(`color_${key}`);
                    if (el && customColors[key]) el.value = customColors[key];
                });
                await lincleSaveTheme(themeObj);
                await ext.storage.local.set({ lincleCustomTheme: themeObj });
            }
        });
    });

    // Select a saved theme from dropdown
    if (savedSelect) {
        savedSelect.addEventListener('change', async () => {
            const selectedId = savedSelect.value;
            if (!selectedId) {
                if (btnDeleteCustom) btnDeleteCustom.style.display = 'none';
                return;
            }

            const savedList = await lincleGetSavedThemes();
            const found = savedList.find(t => t.id === selectedId);
            if (found) {
                if (btnDeleteCustom) btnDeleteCustom.style.display = 'inline-flex';
                if (nameInput) nameInput.value = found.name;

                Object.assign(customColors, found.colors);
                COLOR_KEYS.forEach(({ key }) => {
                    const el = document.getElementById(`color_${key}`);
                    if (el && customColors[key]) el.value = customColors[key];
                });

                const themeObj = { preset: 'custom', name: found.name, colors: { ...found.colors } };
                setActivePresetUI('');
                await lincleSaveTheme(themeObj);
                await ext.storage.local.set({ lincleCustomTheme: themeObj });
            }
        });
    }

    // Save custom theme to library
    if (btnSaveCustom) {
        btnSaveCustom.addEventListener('click', async () => {
            const name = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
            const saved = await lincleSaveThemeToLibrary(name, { ...customColors });

            const themeObj = { preset: 'custom', name: saved.name, colors: { ...saved.colors } };
            await lincleSaveTheme(themeObj);
            await ext.storage.local.set({ lincleCustomTheme: themeObj });

            await populateSavedThemes();
            if (savedSelect) savedSelect.value = saved.id;
            if (btnDeleteCustom) btnDeleteCustom.style.display = 'inline-flex';
            setActivePresetUI('');

            const status = document.getElementById('saveStatus');
            if (status) {
                status.textContent = `Theme "${name}" saved!`;
                status.style.display = 'inline';
                setTimeout(() => { status.style.display = 'none'; status.textContent = 'Saved!'; }, 2500);
            }
        });
    }

    // Delete custom theme from library
    if (btnDeleteCustom) {
        btnDeleteCustom.addEventListener('click', async () => {
            const selectedId = savedSelect ? savedSelect.value : '';
            if (!selectedId) return;

            await lincleDeleteSavedTheme(selectedId);
            await populateSavedThemes();
            if (savedSelect) savedSelect.value = '';
            btnDeleteCustom.style.display = 'none';

            // Fallback to dark preset
            setActivePresetUI('dark');
            await lincleSaveTheme({ preset: 'dark' });
        });
    }

    // ── Export / Import ──────────────────────────────────────────────────
    const btnExport = document.getElementById('btnExportTheme');
    const btnImport = document.getElementById('btnImportTheme');

    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            const d = await ext.storage.local.get('lincleTheme');
            const theme = d.lincleTheme || { preset: 'dark' };
            if (theme.preset === 'custom' && !theme.colors) {
                const cd = await ext.storage.local.get('lincleCustomTheme');
                theme.colors = cd.lincleCustomTheme?.colors;
                theme.name   = cd.lincleCustomTheme?.name;
            }
            lincleExportTheme(theme);
        });
    }

    if (btnImport) {
        btnImport.addEventListener('click', () => {
            lincleImportTheme(async (imported) => {
                if (imported.colors) {
                    const name = imported.name || 'İçe Aktarılan Tema';
                    Object.assign(customColors, imported.colors);
                    if (nameInput) nameInput.value = name;

                    COLOR_KEYS.forEach(({ key }) => {
                        const el = document.getElementById(`color_${key}`);
                        if (el && customColors[key]) el.value = customColors[key];
                    });

                    const saved = await lincleSaveThemeToLibrary(name, { ...customColors });
                    const themeObj = { preset: 'custom', name, colors: { ...customColors } };

                    await lincleSaveTheme(themeObj);
                    await ext.storage.local.set({ lincleCustomTheme: themeObj });

                    await populateSavedThemes();
                    if (savedSelect) savedSelect.value = saved.id;
                    if (btnDeleteCustom) btnDeleteCustom.style.display = 'inline-flex';
                    if (customSection) customSection.style.display = 'block';
                    setActivePresetUI('');
                } else if (imported.preset) {
                    await lincleSaveTheme(imported);
                    setActivePresetUI(imported.preset);
                }
            });
        });
    }

    // ── Restore Options ─────────────────────────────────────────────────
    await restoreOptions();

    // ── Button Listeners ────────────────────────────────────────────────
    const btnSave = document.getElementById('saveBtn');
    if (btnSave) btnSave.addEventListener('click', saveOptions);

    const btnShortcuts = document.getElementById('btnShortcuts');
    if (btnShortcuts) btnShortcuts.addEventListener('click', () => ext.tabs.create({ url: "chrome://extensions/shortcuts" }));

    const btnClearChain = document.getElementById('btnClearChain');
    if (btnClearChain) btnClearChain.addEventListener('click', async () => {
        await ext.storage.local.set({ lincleHistory: [] });
        await restoreOptions();
    });

    const btnClearFailures = document.getElementById('btnClearFailures');
    if (btnClearFailures) btnClearFailures.addEventListener('click', async () => {
        await ext.storage.local.set({ lincleFailures: [] });
        await restoreOptions();
    });

    const btnBulkResolve = document.getElementById('btnBulkResolve');
    if (btnBulkResolve) btnBulkResolve.addEventListener('click', runBulkResolver);

    const btnEmailDev = document.getElementById('btnEmailDev');
    if (btnEmailDev) btnEmailDev.addEventListener('click', sendEmailToDev);
});

// ─── Restore Options ────────────────────────────────────────────────────────
async function restoreOptions() {
    try {
        if (typeof applyTranslations === 'function') await applyTranslations();

        const data = await ext.storage.local.get([
            'lincleStats', 'lincleOptions', 'lincleDomains',
            'lincleHistory', 'lincleCustomRegex', 'lincleFailures'
        ]);

        // Stats
        const stats = data.lincleStats || { cleanedLinks: 0, savedSeconds: 0, blockedPopups: 0 };
        const sec = stats.savedSeconds || 0;
        const timeText = sec >= 3600 ? `${(sec/3600).toFixed(1)}h`
                       : sec >= 60 ? `${(sec/60).toFixed(1)}m` : `${Math.floor(sec)}s`;

        const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setEl('optValLinks',   (stats.cleanedLinks || 0).toLocaleString());
        setEl('optValTime',    timeText);
        setEl('optValPopups',  (stats.blockedPopups || 0).toLocaleString());
        setEl('optValDomains', (data.lincleDomains || []).length.toLocaleString());

        // Options
        const options = data.lincleOptions || {};
        const setCheck = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
        const setVal   = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

        setVal('assumedTime', options.assumedGateTime || 10);
        setVal('maxWaitTime', options.maxWaitTime || 20);
        setCheck('loggingToggle', options.enableLogging || false);
        setCheck('breadcrumbToggle', options.enableBreadcrumbs || false);
        setCheck('popupShieldToggle', options.enablePopupShield !== false);

        // Domains
        const domains = data.lincleDomains || [];
        setVal('domainList', domains.map(d => d.domain).join('\n'));

        // Custom regex
        setVal('customRegexList', (data.lincleCustomRegex || []).join('\n'));

        // History chain
        const history = data.lincleHistory || [];
        const chainContainer = document.getElementById('chainContainer');
        if (chainContainer) {
            chainContainer.innerHTML = history.length === 0 ? '--' : history.map(item => `
                <div class="chain-item">
                    <span class="chain-time">[${item.time}]</span> ${item.saved}s<br>
                    <span class="chain-from">SRC: ${item.from}</span><br>
                    <span class="chain-to">DST: ${item.to}</span>
                </div>
            `).join('');
        }

        // Failures
        const failures = data.lincleFailures || [];
        const failureBox = document.getElementById('failureList');
        if (failureBox) {
            failureBox.value = failures.length > 0
                ? failures.map(f => `Host: ${f.host}\nURL: ${f.url}\nPhrases: ${f.gatePhrases.join(', ')}\n---`).join('\n\n')
                : '';
        }
    } catch (e) {
        console.error('[Lincle] Error loading options:', e);
    }
}

// ─── Save Options ───────────────────────────────────────────────────────────
async function saveOptions() {
    try {
        const getVal = (id, def) => { const el = document.getElementById(id); return el ? el.value : def; };
        const getCheck = (id, def) => { const el = document.getElementById(id); return el ? el.checked : def; };

        const options = {
            assumedGateTime: parseInt(getVal('assumedTime', '10')) || 10,
            enableLogging: getCheck('loggingToggle', false),
            maxWaitTime: parseInt(getVal('maxWaitTime', '20')) || 20,
            enableBreadcrumbs: getCheck('breadcrumbToggle', false),
            enablePopupShield: getCheck('popupShieldToggle', true),
        };

        const domainText = getVal('domainList', '');
        const formattedDomains = domainText.split('\n')
            .map(d => d.trim().toLowerCase())
            .filter(d => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d))
            .map(d => ({ domain: d }));

        const regexText = getVal('customRegexList', '');
        const customRegex = regexText.split('\n').map(r => r.trim()).filter(r => r !== '');

        await ext.storage.local.set({
            lincleOptions: options,
            lincleDomains: formattedDomains,
            lincleCustomRegex: customRegex,
        });

        const status = document.getElementById('saveStatus');
        if (status) {
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 2000);
        }
    } catch (e) {
        console.error('[Lincle] Save error:', e);
    }
}

// ─── Bulk Resolver ──────────────────────────────────────────────────────────
async function runBulkResolver() {
    const inputEl = document.getElementById('bulkInput');
    const outBox = document.getElementById('bulkOutput');
    const btn = document.getElementById('btnBulkResolve');
    if (!inputEl || !outBox || !btn) return;

    const inputLines = inputEl.value.split('\n').filter(l => l.trim() !== '');
    if (inputLines.length === 0) return;

    btn.disabled = true;
    outBox.value = '';

    const STATIC_PATTERNS = [
        /var\s+url\s*=\s*['"]([^'"]+)['"]/i,
        /window\.location\.href\s*=\s*['"]([^'"]+)['"]/i,
        /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["'][^;]+;\s*url=([^"']+)["']/i,
        /<a[^>]+class=["'][^"']*(?:wfl_button|button|btn)[^"']*["'][^>]*href=["'](http[^"']+)["']/i,
        /<a[^>]+href=["'](http[^"']+)["'][^>]*class=["'][^"']*(?:wfl_button|button|btn)[^"']*["']/i,
    ];

    let customPatterns = [];
    const regexEl = document.getElementById('customRegexList');
    if (regexEl) {
        customPatterns = regexEl.value.split('\n')
            .filter(l => l.trim() !== '')
            .map(r => { try { return new RegExp(r, 'i'); } catch { return null; } })
            .filter(r => r !== null);
    }

    const allPatterns = [...STATIC_PATTERNS, ...customPatterns];
    const results = [];

    for (const link of inputLines) {
        try {
            const response = await fetch(link.trim());
            const html = await response.text();
            let found = false;
            for (const pattern of allPatterns) {
                const match = html.match(pattern);
                if (match && match[1] && match[1].startsWith('http')) {
                    results.push(`[OK] ${match[1]}`);
                    found = true;
                    break;
                }
            }
            if (!found) results.push(`[NOT FOUND] ${link}`);
        } catch {
            results.push(`[ERROR] ${link}`);
        }
    }

    outBox.value = results.join('\n');
    btn.disabled = false;
}

// ─── Email Developer ────────────────────────────────────────────────────────
async function sendEmailToDev() {
    const fData = await ext.storage.local.get('lincleFailures');
    const failures = fData.lincleFailures || [];
    if (failures.length === 0) return;

    const reportText = failures.map(f => `Host: ${f.host}\nURL: ${f.url}\nBulgular: ${f.gatePhrases.join(', ')}`).join('\n\n');
    const email = 'nyxa4807@gmail.com';
    const subject = encodeURIComponent('Lincle - Hata Raporu');
    const body = encodeURIComponent(`Merhaba Emir,\n\nAsagidaki baglantilar Lincle tarafindan atlanamaadi. Analiz icin gonderiyorum:\n\n${reportText}`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
}

// ─── Color Helper Utilities ──────────────────────────────────────────────────
function hexToRgb(hex) {
    if (!hex) return null;
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
    const clamp = x => Math.max(0, Math.min(255, Math.round(x)));
    return '#' + [r, g, b].map(x => clamp(x).toString(16).padStart(2, '0')).join('');
}

function adjustColorLightness(hex, percent) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const factor = 1 + percent;
    const delta = percent * 160;
    return rgbToHex(rgb.r * factor + delta, rgb.g * factor + delta, rgb.b * factor + delta);
}