// Lincle Theme Engine v3.8.2
// Shared between popup.js and options.js
// Developed by: Emir Samed (Nyxa48)

const _themeExt = (typeof browser !== 'undefined') ? browser : chrome;

// ─── Font Presets ────────────────────────────────────────────────────────────
// 4 fonts selected for universal language coverage + modern aesthetics.
// Each entry includes Google Fonts URL fragment and CSS family strings.
const LINCLE_FONTS = {
    inter: {
        name:    'Inter',
        label:   'Inter — Clean & Modern',
        sample:  'Aa Bb 123 — Link Cleaner',
        display: "'Inter', 'Segoe UI', system-ui, sans-serif",
        body:    "'Inter', 'Segoe UI', system-ui, sans-serif",
        gfonts:  'Inter:wght@300;400;500',
    },
    geist: {
        name:    'Geist',
        label:   'Geist — Technical Sans',
        sample:  'Aa Bb 123 — Link Cleaner',
        display: "'Geist', 'Inter', system-ui, sans-serif",
        body:    "'Geist', 'Inter', system-ui, sans-serif",
        gfonts:  'Geist:wght@300;400;500',
    },
    noto: {
        name:    'Noto Sans',
        label:   'Noto Sans — Universal',
        sample:  'Aa あ 中 한 — عالمي',
        display: "'Noto Sans', 'Segoe UI', system-ui, sans-serif",
        body:    "'Noto Sans', 'Segoe UI', system-ui, sans-serif",
        gfonts:  'Noto+Sans:wght@300;400;500',
    },
    outfit: {
        name:    'Outfit',
        label:   'Outfit — Geometric',
        sample:  'Aa Bb 123 — Link Cleaner',
        display: "'Outfit', 'Inter', system-ui, sans-serif",
        body:    "'Outfit', 'Inter', system-ui, sans-serif",
        gfonts:  'Outfit:wght@300;400;500',
    },
};

// ─── Ready-Made Presets ───────────────────────────────────────────────────────
// 8 presets: 1 dark default, 1 light, 6 themed dark presets.
const LINCLE_PRESETS = {
    void: {
        name:    'Void',
        dark:    true,
        accent:  '#ffffff',
        bg:      '#000000',
        surface: '#1c1c1c',
        surface2:'#141414',
        border:  '#2e2e2e',
        primary: '#ffffff',
        green:   '#a0a0a0',
        red:     '#666666',
        text:    '#ffffff',
        textDim: '#555555',
    },
    light: {
        name:    'Clean Light',
        dark:    false,
        accent:  '#0096d2',
        bg:      '#f4f4f6',
        surface: '#ffffff',
        surface2:'#ececf0',
        border:  '#d4d4dc',
        primary: '#0078c8',
        green:   '#1a9e5a',
        red:     '#c0392b',
        text:    '#111120',
        textDim: '#60608a',
    },
    cyberpunk: {
        name:    'Cyberpunk',
        dark:    true,
        accent:  '#00caf5',
        bg:      '#0d0d14',
        surface: '#14141f',
        surface2:'#1c1c2c',
        border:  '#252538',
        primary: '#00caf5',
        green:   '#2ecc71',
        red:     '#e74c3c',
        text:    '#e8e8f8',
        textDim: '#6060a0',
    },
    nordic: {
        name:    'Nordic Slate',
        dark:    true,
        accent:  '#88c0d0',
        bg:      '#1a1f28',
        surface: '#222733',
        surface2:'#2c3244',
        border:  '#3a4260',
        primary: '#88c0d0',
        green:   '#a3be8c',
        red:     '#bf616a',
        text:    '#eceff4',
        textDim: '#7090b0',
    },
    emerald: {
        name:    'Emerald',
        dark:    true,
        accent:  '#10b981',
        bg:      '#091210',
        surface: '#111f1c',
        surface2:'#182c27',
        border:  '#1f3d38',
        primary: '#10b981',
        green:   '#34d399',
        red:     '#f87171',
        text:    '#e8fdf5',
        textDim: '#4a9e80',
    },
    sunset: {
        name:    'Sunset',
        dark:    true,
        accent:  '#f59e0b',
        bg:      '#120e10',
        surface: '#1e1620',
        surface2:'#2a1e2e',
        border:  '#382840',
        primary: '#f59e0b',
        green:   '#22c55e',
        red:     '#ef4444',
        text:    '#fdf4ff',
        textDim: '#9060a0',
    },
    dracula: {
        name:    'Dracula',
        dark:    true,
        accent:  '#bd93f9',
        bg:      '#12101c',
        surface: '#1c1830',
        surface2:'#28223e',
        border:  '#362e50',
        primary: '#bd93f9',
        green:   '#50fa7b',
        red:     '#ff5555',
        text:    '#f8f8f2',
        textDim: '#8070b0',
    },
    rose: {
        name:    'Rose Pine',
        dark:    true,
        accent:  '#ebbcba',
        bg:      '#191724',
        surface: '#1f1d2e',
        surface2:'#26233a',
        border:  '#31324e',
        primary: '#ebbcba',
        green:   '#9ccfd8',
        red:     '#eb6f92',
        text:    '#e0def4',
        textDim: '#6e6a86',
    },
};

// Ordered list for cycling (popup theme button)
const PRESET_CYCLE_ORDER = ['void', 'cyberpunk', 'nordic', 'emerald', 'sunset', 'dracula', 'rose', 'light'];

// CSS variable map → key in preset colors
const CSS_VAR_MAP = {
    '--bg':       'bg',
    '--surface':  'surface',
    '--surface2': 'surface2',
    '--border':   'border',
    '--primary':  'primary',
    '--green':    'green',
    '--red':      'red',
    '--text':     'text',
    '--text-dim': 'textDim',
};

// ─── Derived Colors ───────────────────────────────────────────────────────────
function computeDerived(colors) {
    const p = colors.primary || '#00caf5';
    const g = colors.green   || '#2ecc71';
    const r = colors.red     || '#e74c3c';
    return {
        '--primary-dim':  hexToRGBA(p, 0.14),
        '--primary-glow': hexToRGBA(p, 0.28),
        '--green-dim':    hexToRGBA(g, 0.14),
        '--red-dim':      hexToRGBA(r, 0.14),
    };
}

function hexToRGBA(hex, alpha) {
    if (!hex || hex[0] !== '#') return `rgba(0,202,245,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Apply Theme ──────────────────────────────────────────────────────────────
function lincleApplyTheme(themeObj) {
    if (!themeObj) themeObj = { preset: 'void' };

    let colors;
    if (themeObj.preset === 'custom' && themeObj.colors) {
        colors = { ...LINCLE_PRESETS.void, ...themeObj.colors };
    } else if (LINCLE_PRESETS[themeObj.preset]) {
        colors = LINCLE_PRESETS[themeObj.preset];
    } else if (themeObj.colors) {
        colors = { ...LINCLE_PRESETS.void, ...themeObj.colors };
    } else {
        colors = LINCLE_PRESETS.void;
    }

    const root = document.documentElement;
    for (const [cssVar, key] of Object.entries(CSS_VAR_MAP)) {
        if (colors[key]) root.style.setProperty(cssVar, colors[key]);
    }
    for (const [cssVar, val] of Object.entries(computeDerived(colors))) {
        root.style.setProperty(cssVar, val);
    }

    const isDark = colors.dark !== false;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
}

// ─── Apply Font ───────────────────────────────────────────────────────────────
function lincleApplyFont(fontKey) {
    const font = LINCLE_FONTS[fontKey] || LINCLE_FONTS.inter;
    const root = document.documentElement;
    root.style.setProperty('--font-display', font.display);
    root.style.setProperty('--font-body', font.body);
    root.setAttribute('data-font', fontKey);
}

// Load and inject Google Font dynamically (avoids having all 4 loaded at once)
function lincleInjectFont(fontKey) {
    const font = LINCLE_FONTS[fontKey];
    if (!font) return;
    const id = `lincle-gfont-${fontKey}`;
    if (document.getElementById(id)) return; // Already injected
    const link = document.createElement('link');
    link.id   = id;
    link.rel  = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.gfonts}&display=swap`;
    document.head.appendChild(link);
}

async function lincleLoadFont() {
    try {
        const d = await _themeExt.storage.local.get('lincleFont');
        const fontKey = d.lincleFont || 'inter';
        lincleInjectFont(fontKey);
        lincleApplyFont(fontKey);
        return fontKey;
    } catch {
        lincleApplyFont('inter');
        return 'inter';
    }
}

async function lincleSaveFont(fontKey) {
    await _themeExt.storage.local.set({ lincleFont: fontKey });
    lincleInjectFont(fontKey);
    lincleApplyFont(fontKey);
}

// ─── Load Theme ───────────────────────────────────────────────────────────────
async function lincleLoadTheme() {
    try {
        const d = await _themeExt.storage.local.get(['lincleTheme', 'lincleCustomTheme']);
        let themeObj = d.lincleTheme;

        // Migration: old format was just a string
        if (typeof themeObj === 'string') themeObj = { preset: themeObj };
        if (!themeObj) themeObj = { preset: 'void' };

        // Rename old 'dark' preset key → 'cyberpunk'
        if (themeObj.preset === 'dark') themeObj.preset = 'cyberpunk';

        // Load custom colors if needed
        if (themeObj.preset === 'custom' && !themeObj.colors && d.lincleCustomTheme?.colors) {
            themeObj.colors = d.lincleCustomTheme.colors;
            themeObj.name   = d.lincleCustomTheme.name || 'Custom Theme';
        }

        lincleApplyTheme(themeObj);
        return themeObj;
    } catch {
        lincleApplyTheme({ preset: 'void' });
        return { preset: 'void' };
    }
}

// ─── Save Theme ───────────────────────────────────────────────────────────────
async function lincleSaveTheme(themeObj) {
    await _themeExt.storage.local.set({ lincleTheme: themeObj });
    lincleApplyTheme(themeObj);

    // Track last non-void, non-light preset for the popup 3-state cycle
    const p = themeObj.preset;
    if (p && p !== 'void' && p !== 'light') {
        await _themeExt.storage.local.set({ lincleLastPreset: themeObj });
    }
}

// ─── Cycle Preset (popup button) ─────────────────────────────────────────────
// 3-state cycle: void (dark default) → light → last saved preset/custom → void
async function lincleCycleTheme() {
    const d = await _themeExt.storage.local.get(['lincleTheme', 'lincleCustomTheme', 'lincleLastPreset']);
    let current = d.lincleTheme || { preset: 'void' };
    if (typeof current === 'string') current = { preset: current };
    if (current.preset === 'dark') current.preset = 'cyberpunk'; // migration

    // The 3rd slot is: lastPreset saved from Options, or cyberpunk as fallback
    const lastPreset = d.lincleLastPreset
        || (d.lincleCustomTheme?.colors
            ? { preset: 'custom', name: d.lincleCustomTheme.name || 'Custom', colors: d.lincleCustomTheme.colors }
            : { preset: 'cyberpunk' });

    let next;
    if (current.preset === 'void') {
        // void → light
        next = { preset: 'light' };
    } else if (current.preset === 'light') {
        // light → last selected preset / custom
        next = lastPreset;
    } else {
        // anything else → back to void
        next = { preset: 'void' };
    }

    await _themeExt.storage.local.set({ lincleTheme: next });
    lincleApplyTheme(next);
    return next;
}

// ─── Export / Import ──────────────────────────────────────────────────────────
function lincleExportTheme(themeObj, filename = 'lincle-theme') {
    let version = '3.8.2';
    try {
        const m = (typeof browser !== 'undefined' ? browser : chrome).runtime.getManifest();
        if (m && m.version) version = m.version;
    } catch { /* non-fatal */ }

    const exportObj = {
        name:    themeObj.name || LINCLE_PRESETS[themeObj.preset]?.name || 'Lincle Theme',
        preset:  themeObj.preset || 'custom',
        colors:  themeObj.colors || LINCLE_PRESETS[themeObj.preset] || LINCLE_PRESETS.void,
        version,
    };
    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${(exportObj.name).toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.lincle-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function lincleImportTheme(callback) {
    const input = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const obj = JSON.parse(evt.target.result);
                if (obj && (obj.colors || obj.bg)) {
                    const colors = obj.colors || obj;
                    const name = obj.name || file.name.replace(/\.json$/i, '').replace(/\.lincle-theme$/i, '');
                    callback({ preset: 'custom', name, colors });
                } else if (obj && obj.preset) {
                    callback(obj);
                }
            } catch { /* invalid JSON — silently ignore */ }
        };
        reader.readAsText(file);
    });
    input.click();
}

// ─── Saved Themes Library ─────────────────────────────────────────────────────
async function lincleGetSavedThemes() {
    const d = await _themeExt.storage.local.get('lincleSavedThemes');
    return d.lincleSavedThemes || [];
}

async function lincleSaveThemeToLibrary(name, colors) {
    const d    = await _themeExt.storage.local.get('lincleSavedThemes');
    const list = d.lincleSavedThemes || [];
    const id   = 'custom_' + Date.now();
    const newTheme = { id, name, colors };

    const existingIdx = list.findIndex(t => t.name.toLowerCase() === name.toLowerCase());
    if (existingIdx !== -1) {
        list[existingIdx] = newTheme;
    } else {
        list.push(newTheme);
    }

    await _themeExt.storage.local.set({ lincleSavedThemes: list });
    return newTheme;
}

async function lincleDeleteSavedTheme(id) {
    const d    = await _themeExt.storage.local.get('lincleSavedThemes');
    const list = (d.lincleSavedThemes || []).filter(t => t.id !== id);
    await _themeExt.storage.local.set({ lincleSavedThemes: list });
    return list;
}

function lincleGetPresetName(themeObj) {
    if (!themeObj) return 'void';
    const preset = themeObj.preset || 'void';
    // Migration guard
    return preset === 'dark' ? 'cyberpunk' : preset;
}
