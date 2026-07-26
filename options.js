// Lincle Options v3.0 - Theme Engine + Collapsible Cards
// Developed by: Emir Samed (Nyxa48)
const ext = (typeof browser !== 'undefined') ? browser : chrome;

// ─── Color Picker Config ────────────────────────────────────────────────────
const COLOR_KEYS = [
    { key: 'bg',      label: 'Background',   i18n: 'themeBg' },
    { key: 'surface', label: 'Surface',       i18n: 'themeSurface' },
    { key: 'primary', label: 'Accent',        i18n: 'themePrimary' },
    { key: 'green',   label: 'Success',       i18n: 'themeGreen' },
    { key: 'red',     label: 'Error',         i18n: 'themeRed' },
    { key: 'text',    label: 'Text',          i18n: 'themeText' },
    { key: 'textDim', label: 'Muted Text',    i18n: 'themeTextDim' },
    { key: 'border',  label: 'Border',        i18n: 'themeBorder' },
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

    // ── Language Selector ───────────────────────────────────────────────
    const langSelect = document.getElementById('langSelect');
    const langData = await ext.storage.local.get('lincleLang');
    const currentLang = langData.lincleLang || 'en';
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', async (e) => {
            await ext.storage.local.set({ lincleLang: e.target.value });
            setTimeout(() => location.reload(), 50);
        });
    }

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

    // Build color picker grid
    if (colorGrid) {
        colorGrid.innerHTML = '';
        COLOR_KEYS.forEach(({ key, label, i18n }) => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.innerHTML = `
                <input type="color" id="color_${key}" value="${customColors[key] || '#000000'}">
                <span class="color-item-label" data-i18n="${i18n}">${label}</span>
            `;
            colorGrid.appendChild(item);

            const input = item.querySelector('input');
            input.addEventListener('input', (e) => {
                customColors[key] = e.target.value;
                const themeName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
                const previewTheme = { preset: 'custom', name: themeName, colors: { ...customColors } };
                lincleApplyTheme(previewTheme);
            });
        });
    }

    // Populate saved custom themes library dropdown
    async function populateSavedThemes() {
        const savedList = await lincleGetSavedThemes();
        if (!savedSelect) return;
        savedSelect.innerHTML = '<option value="">-- My Saved Custom Themes --</option>';
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