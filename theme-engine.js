// Lincle Theme Engine v1.0
// Shared between popup.js and options.js
// Developed by: Emir Samed (Nyxa48)

const _themeExt = (typeof browser !== 'undefined') ? browser : chrome;

// ─── Default Presets ────────────────────────────────────────────────────────
const LINCLE_PRESETS = {
    dark: {
        bg:         '#11111a',
        surface:    '#1a1a28',
        surface2:   '#232336',
        border:     '#2e2e46',
        primary:    '#00caf5',
        green:      '#2ecc71',
        red:        '#e74c3c',
        text:       '#ededf8',
        textDim:    '#8080b0',
    },
    light: {
        bg:         '#f4f4fe',
        surface:    '#ffffff',
        surface2:   '#ececf8',
        border:     '#d2d2ec',
        primary:    '#0096d2',
        green:      '#27ae60',
        red:        '#c0392b',
        text:       '#15152a',
        textDim:    '#656595',
    },
};

// CSS variable map  →  key in preset colors
const CSS_VAR_MAP = {
    '--bg':          'bg',
    '--surface':     'surface',
    '--surface2':    'surface2',
    '--border':      'border',
    '--primary':     'primary',
    '--green':       'green',
    '--red':         'red',
    '--text':        'text',
    '--text-dim':    'textDim',
};

// Derived CSS vars computed from base colors
function computeDerived(colors) {
    return {
        '--primary-dim':  hexToRGBA(colors.primary, 0.12),
        '--primary-glow': hexToRGBA(colors.primary, 0.30),
        '--green-dim':    hexToRGBA(colors.green, 0.12),
        '--red-dim':      hexToRGBA(colors.red, 0.12),
    };
}

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Apply Theme to Document ────────────────────────────────────────────────
function lincleApplyTheme(themeObj) {
    if (!themeObj) themeObj = { preset: 'dark' };

    // Resolve colors
    let colors;
    if (themeObj.preset === 'custom' && themeObj.colors) {
        colors = { ...LINCLE_PRESETS.dark, ...themeObj.colors };
    } else {
        colors = LINCLE_PRESETS[themeObj.preset] || LINCLE_PRESETS.dark;
    }

    const root = document.documentElement;

    // Set base CSS vars
    for (const [cssVar, key] of Object.entries(CSS_VAR_MAP)) {
        if (colors[key]) root.style.setProperty(cssVar, colors[key]);
    }

    // Set derived CSS vars
    const derived = computeDerived(colors);
    for (const [cssVar, val] of Object.entries(derived)) {
        root.style.setProperty(cssVar, val);
    }

    // Set data-theme for any CSS selectors that still use it
    root.setAttribute('data-theme', themeObj.preset === 'light' ? 'light' : 'dark');
}

// ─── Load Theme from Storage ────────────────────────────────────────────────
async function lincleLoadTheme() {
    try {
        const d = await _themeExt.storage.local.get('lincleTheme');
        let themeObj = d.lincleTheme;

        // Migration: old format was just a string ("dark"/"light")
        if (typeof themeObj === 'string') {
            themeObj = { preset: themeObj };
            await _themeExt.storage.local.set({ lincleTheme: themeObj });
        }

        if (!themeObj) themeObj = { preset: 'dark' };
        lincleApplyTheme(themeObj);
        return themeObj;
    } catch {
        lincleApplyTheme({ preset: 'dark' });
        return { preset: 'dark' };
    }
}

// ─── Save Theme to Storage ──────────────────────────────────────────────────
async function lincleSaveTheme(themeObj) {
    await _themeExt.storage.local.set({ lincleTheme: themeObj });
    lincleApplyTheme(themeObj);
}

// ─── Cycle Preset (for popup button) ────────────────────────────────────────
// dark → light → custom (if exists) → dark ...
async function lincleCycleTheme() {
    const d = await _themeExt.storage.local.get('lincleTheme');
    let current = d.lincleTheme || { preset: 'dark' };
    if (typeof current === 'string') current = { preset: current };

    let next;
    if (current.preset === 'dark') {
        next = { preset: 'light' };
    } else if (current.preset === 'light') {
        // Check if custom theme exists
        const cd = await _themeExt.storage.local.get('lincleCustomTheme');
        if (cd.lincleCustomTheme && cd.lincleCustomTheme.colors) {
            next = { preset: 'custom', colors: cd.lincleCustomTheme.colors };
        } else {
            next = { preset: 'dark' };
        }
    } else {
        next = { preset: 'dark' };
    }

    await lincleSaveTheme(next);
    return next;
}

// ─── Export Theme as JSON ───────────────────────────────────────────────────
function lincleExportTheme(themeObj) {
    const json = JSON.stringify(themeObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lincle-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─── Import Theme from JSON File ────────────────────────────────────────────
function lincleImportTheme(callback) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const obj = JSON.parse(evt.target.result);
                if (obj && obj.colors) {
                    callback(obj);
                } else if (obj && obj.preset) {
                    callback(obj);
                }
            } catch { /* invalid JSON */ }
        };
        reader.readAsText(file);
    });
    input.click();
}

// ─── Get Current Preset Name ────────────────────────────────────────────────
function lincleGetPresetName(themeObj) {
    if (!themeObj) return 'dark';
    return themeObj.preset || 'dark';
}
