// Lincle Theme Engine v3.6
// Shared between popup.js and options.js
// Developed by: Emir Samed (Nyxa48)

const _themeExt = (typeof browser !== 'undefined') ? browser : chrome;

// ─── Ready-Made Presets (Different Design Philosophies) ────────────────────
const LINCLE_PRESETS = {
    void: {
        name:       'Void',
        bg:         '#000000',
        surface:    '#252525',
        surface2:   '#1a1a1a',
        border:     '#333333',
        primary:    '#ffffff',
        green:      '#ffffff',
        red:        '#666666',
        text:       '#ffffff',
        textDim:    '#777777',
    },
    dark: {
        name:       'Cyberpunk Dark',
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
        name:       'Clean Light',
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
    nordic: {
        name:       'Nordic Slate',
        bg:         '#1b2028',
        surface:    '#222733',
        surface2:   '#2c3242',
        border:     '#3a4256',
        primary:    '#88c0d0',
        green:      '#a3be8c',
        red:        '#bf616a',
        text:       '#eceff4',
        textDim:    '#81a1c1',
    },
    emerald: {
        name:       'Emerald Matrix',
        bg:         '#0b1311',
        surface:    '#13201d',
        surface2:   '#1b2d29',
        border:     '#263f39',
        primary:    '#10b981',
        green:      '#34d399',
        red:        '#f87171',
        text:       '#ecfdf5',
        textDim:    '#6ee7b7',
    },
    sunset: {
        name:       'Sunset Amber',
        bg:         '#171219',
        surface:    '#221b25',
        surface2:   '#2e2433',
        border:     '#403247',
        primary:    '#f59e0b',
        green:      '#10b981',
        red:        '#ef4444',
        text:       '#fdf4ff',
        textDim:    '#c084fc',
    },
    dracula: {
        name:       'Dracula Violet',
        bg:         '#181524',
        surface:    '#221d33',
        surface2:   '#2d2744',
        border:     '#3e365c',
        primary:    '#bd93f9',
        green:      '#50fa7b',
        red:        '#ff5555',
        text:       '#f8f8f2',
        textDim:    '#a79ac5',
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

function computeDerived(colors) {
    return {
        '--primary-dim':  hexToRGBA(colors.primary || '#00caf5', 0.14),
        '--primary-glow': hexToRGBA(colors.primary || '#00caf5', 0.32),
        '--green-dim':    hexToRGBA(colors.green   || '#2ecc71', 0.14),
        '--red-dim':      hexToRGBA(colors.red     || '#e74c3c', 0.14),
    };
}

function hexToRGBA(hex, alpha) {
    if (!hex || hex[0] !== '#') return `rgba(0,202,245,${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Apply Theme to Document ────────────────────────────────────────────────
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

    const derived = computeDerived(colors);
    for (const [cssVar, val] of Object.entries(derived)) {
        root.style.setProperty(cssVar, val);
    }

    root.setAttribute('data-theme', themeObj.preset === 'light' ? 'light' : 'dark');
}

// ─── Load Theme from Storage ────────────────────────────────────────────────
async function lincleLoadTheme() {
    try {
        const d = await _themeExt.storage.local.get(['lincleTheme', 'lincleCustomTheme']);
        let themeObj = d.lincleTheme;

        // Migration: old format was just string
        if (typeof themeObj === 'string') {
            themeObj = { preset: themeObj };
        }
        if (!themeObj) themeObj = { preset: 'void' };

        // If custom theme is selected, ensure colors are loaded!
        if (themeObj.preset === 'custom') {
            if (!themeObj.colors && d.lincleCustomTheme && d.lincleCustomTheme.colors) {
                themeObj.colors = d.lincleCustomTheme.colors;
                themeObj.name   = d.lincleCustomTheme.name || 'Custom Theme';
            }
        }

        lincleApplyTheme(themeObj);
        return themeObj;
    } catch {
        lincleApplyTheme({ preset: 'void' });
        return { preset: 'void' };
    }
}

// ─── Save Theme to Storage ──────────────────────────────────────────────────
async function lincleSaveTheme(themeObj) {
    await _themeExt.storage.local.set({ lincleTheme: themeObj });
    lincleApplyTheme(themeObj);
}

// ─── Cycle Preset (for popup button) ────────────────────────────────────────
// Strictly cycles through 3 states: dark → light → custom → dark ...
async function lincleCycleTheme() {
    const d = await _themeExt.storage.local.get(['lincleTheme', 'lincleCustomTheme']);
    let current = d.lincleTheme || { preset: 'void' };
    if (typeof current === 'string') current = { preset: current };

    let next;
    if (current.preset === 'void') {
        next = { preset: 'dark' };
    } else if (current.preset === 'dark') {
        next = { preset: 'light' };
    } else if (current.preset === 'light') {
        // Load custom / active theme saved from options
        if (d.lincleCustomTheme && d.lincleCustomTheme.colors) {
            next = {
                preset: 'custom',
                name: d.lincleCustomTheme.name || 'Custom Theme',
                colors: d.lincleCustomTheme.colors,
            };
        } else {
            // Fallback custom theme (Nordic Slate) if none configured yet
            next = {
                preset: 'custom',
                name: 'Nordic Slate',
                colors: LINCLE_PRESETS.nordic,
            };
        }
    } else {
        // Back to void
        next = { preset: 'void' };
    }

    await lincleSaveTheme(next);
    return next;
}

// ─── Export Theme as JSON File ──────────────────────────────────────────────
function lincleExportTheme(themeObj, filename = 'lincle-theme') {
    const exportObj = {
        name: themeObj.name || LINCLE_PRESETS[themeObj.preset]?.name || 'Lincle Custom Theme',
        preset: themeObj.preset || 'custom',
        colors: themeObj.colors || LINCLE_PRESETS[themeObj.preset] || LINCLE_PRESETS.dark,
        version: '2.0',
    };
    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cleanName = (exportObj.name || filename).toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    a.download = `${cleanName}.lincle-theme.json`;
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
                if (obj && (obj.colors || obj.bg)) {
                    const colors = obj.colors || obj;
                    const name = obj.name || file.name.replace(/\.json$/i, '').replace(/\.lincle-theme$/i, '');
                    callback({ preset: 'custom', name, colors });
                } else if (obj && obj.preset) {
                    callback(obj);
                }
            } catch { /* invalid JSON */ }
        };
        reader.readAsText(file);
    });
    input.click();
}

// ─── Get Saved Themes Library ────────────────────────────────────────────────
async function lincleGetSavedThemes() {
    const d = await _themeExt.storage.local.get('lincleSavedThemes');
    return d.lincleSavedThemes || [];
}

async function lincleSaveThemeToLibrary(name, colors) {
    const d = await _themeExt.storage.local.get('lincleSavedThemes');
    const list = d.lincleSavedThemes || [];
    const id = 'custom_' + Date.now();
    const newTheme = { id, name, colors };

    // Update or push
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
    const d = await _themeExt.storage.local.get('lincleSavedThemes');
    let list = d.lincleSavedThemes || [];
    list = list.filter(t => t.id !== id);
    await _themeExt.storage.local.set({ lincleSavedThemes: list });
    return list;
}

function lincleGetPresetName(themeObj) {
    if (!themeObj) return 'dark';
    return themeObj.preset || 'dark';
}
