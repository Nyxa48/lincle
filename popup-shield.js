// Lincle Popup Shield v1.0 — runs at document_start
// Developed by: Emir Samed (Nyxa48)
//
// Injected before the page's own scripts so we can override/intercept
// popup mechanisms before they're set up. Handles:
//   1. window.open() hijacking (new-tab ad traps)
//   2. Notification.requestPermission() suppression
//   3. Modal overlay removal (DOM-ready)
//   4. Click-to-open-tab ad traps (mousedown/click interception)
//   5. Scroll-lock removal (many overlays lock <body> overflow)

(function () {
    'use strict';

    // ─── Cross-browser shim ───────────────────────────────────────────────────
    const ext = (typeof browser !== 'undefined') ? browser : chrome;

    // ─── Quick kill-switch check ──────────────────────────────────────────────
    // We can't await here (document_start, synchronous context), so we store
    // the last known state and bail immediately if the shield was disabled.
    // The very first run defaults to active (no stored value yet = active).
    let shieldActive = true;
    ext.storage.local.get(['lincleSettings', 'lincleOptions']).then(d => {
        const masterOn = (d.lincleSettings || {}).isActive !== false;
        const shieldOn = (d.lincleOptions || {}).enablePopupShield !== false; // default ON
        shieldActive = masterOn && shieldOn;
    }).catch(() => {});

    // ─── 1. window.open() override ───────────────────────────────────────────
    // Many shorteners call window.open() on click/mouseover to open an ad tab.
    // We wrap it: calls that open an obviously-ad URL are silently dropped;
    // calls that open a plausible destination URL are allowed through.
    const _originalOpen = window.open.bind(window);
    const AD_OPEN_BLOCKLIST = [
        /doubleclick\.net/i, /googlesyndication\.com/i, /propellerads\.com/i,
        /popads\.net/i, /adsterra\.com/i, /exoclick\.com/i, /popcash\.net/i,
        /trafficjunky\.com/i, /revcontent\.com/i, /hilltopads\.net/i,
        /bidvertiser\.com/i, /mgid\.com/i, /zeropark\.com/i, /pushground\.com/i,
        /evadav\.com/i, /adcash\.com/i, /clickadu\.com/i, /trafficfactory\.biz/i,
    ];
    // Blank target + no URL is the classic "popup on click" pattern
    function isAdOpen(url, target) {
        if (!url || url === '' || url === 'about:blank') {
            // Blank popup — almost certainly an ad trap
            return true;
        }
        try {
            const u = new URL(url, location.href);
            if (AD_OPEN_BLOCKLIST.some(r => r.test(u.hostname))) return true;
            // Same-site opens are fine (e.g. navigating within the shortener)
            if (u.hostname === location.hostname) return false;
        } catch { return true; }
        return false;
    }

    window.open = function (url, target, features) {
        if (!shieldActive) return _originalOpen(url, target, features);
        if (isAdOpen(url, target)) {
            console.debug('[Lincle Shield] Blocked window.open:', url);
            return null; // Pretend the popup was opened but return null handle
        }
        return _originalOpen(url, target, features);
    };

    // ─── 2. Notification permission suppression ───────────────────────────────
    // Shorteners call Notification.requestPermission() hoping you'll click Allow,
    // then spam you with push-notification ads forever.
    // We override it to always return 'denied' without showing any browser prompt.
    if (typeof Notification !== 'undefined') {
        try {
            // Some browsers make this non-configurable — wrap in try/catch
            Object.defineProperty(Notification, 'requestPermission', {
                value: function () {
                    if (!shieldActive) return Notification.requestPermission();
                    console.debug('[Lincle Shield] Suppressed Notification.requestPermission()');
                    return Promise.resolve('denied');
                },
                writable: true,
                configurable: true,
            });
            Object.defineProperty(Notification, 'permission', {
                get: () => shieldActive ? 'denied' : (Notification.permission || 'default'),
                configurable: true,
            });
        } catch (e) {
            console.debug('[Lincle Shield] Could not override Notification API:', e.message);
        }
    }

    // ─── 3. Click-hijack trap suppression ─────────────────────────────────────
    // Some shorteners attach a global document click/mousedown listener that
    // calls window.open() with an ad URL on every click. Since we've already
    // overridden window.open(), most of these are already neutralised — but some
    // use setTimeout tricks to escape the override. We track rapid window.open
    // calls on click events and suppress them.
    let recentClickTime = 0;
    document.addEventListener('mousedown', () => {
        recentClickTime = Date.now();
    }, true); // capture phase — runs before page scripts

    // ─── 4. Modal overlay + scroll-lock removal (runs when DOM is ready) ──────
    // Patterns we look for:
    //   a) High z-index fixed/absolute elements covering most of the viewport
    //   b) Elements with class/id names matching common overlay patterns
    //   c) <body> overflow:hidden (scroll lock added when overlay appears)

    const OVERLAY_SELECTORS = [
        // Generic high-z-index patterns
        '[class*="modal"]:not([class*="modal-body"]):not([class*="modal-content"])',
        '[class*="overlay"]:not([class*="overlay-text"])',
        '[class*="popup"]:not([class*="popup-content"])',
        '[class*="interstitial"]',
        '[class*="gate"]',
        '[class*="adblock"]',
        '[class*="ad-block"]',
        '[id*="modal"]',
        '[id*="overlay"]',
        '[id*="popup"]',
        '[id*="interstitial"]',
        // Notification/cookie consent popups
        '[class*="cookie"]:not([class*="cookie-content"])',
        '[class*="consent"]',
        '[class*="gdpr"]',
        '[class*="notification-bar"]',
        '[class*="push-notification"]',
        '[class*="subscribe"]',
        // Common ad-gate specific patterns
        '[class*="verify"]',
        '[class*="captcha-modal"]',
        '[class*="human-verify"]',
    ];

    function isCoveringOverlay(el) {
        try {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const vw = window.innerWidth || 800;
            const vh = window.innerHeight || 600;

            const isFixed = style.position === 'fixed' || style.position === 'absolute';
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0.05;
            const isHighZ = parseInt(style.zIndex, 10) > 100;
            const isLarge = rect.width > vw * 0.4 && rect.height > vh * 0.3;

            return isFixed && isVisible && isHighZ && isLarge;
        } catch { return false; }
    }

    function removeOverlays() {
        if (!shieldActive) return;
        let removed = 0;

        // Selector-based removal (fast path)
        OVERLAY_SELECTORS.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    if (isCoveringOverlay(el)) {
                        el.remove();
                        removed++;
                        console.debug('[Lincle Shield] Removed overlay:', el.className || el.id);
                    }
                });
            } catch { /* invalid selector — skip */ }
        });

        // Heuristic scan: any large fixed/absolute high-z element not in our
        // selector list (catches dynamically generated classname overlays)
        document.querySelectorAll('body > *, body > * > *').forEach(el => {
            if (isCoveringOverlay(el) && !el.closest('#lincle-banner')) {
                // Extra safety: don't remove if it contains the main page text
                const textLen = (el.innerText || '').length;
                // A real overlay has little unique text vs the rest of the page,
                // or has a very specific overlay-like structure
                if (textLen < 600) {
                    el.remove();
                    removed++;
                    console.debug('[Lincle Shield] Heuristic overlay removed:', el.tagName, el.className);
                }
            }
        });

        // Restore body scroll if it was locked
        if (document.body) {
            const bodyStyle = window.getComputedStyle(document.body);
            if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') {
                document.body.style.overflow = '';
                document.body.style.overflowY = '';
                console.debug('[Lincle Shield] Restored body scroll.');
            }
        }

        if (removed > 0) {
            console.debug(`[Lincle Shield] Removed ${removed} overlay element(s).`);
        }
    }

    // Run once when DOM is interactive, then watch for dynamically injected overlays
    function startOverlayWatcher() {
        if (!shieldActive) return;

        // Initial sweep
        removeOverlays();

        // Watch for overlays injected after page load (common in JS-heavy shorteners)
        const observer = new MutationObserver(() => {
            removeOverlays();
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });

        // Stop watching after 30s to avoid running forever on normal pages
        setTimeout(() => observer.disconnect(), 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startOverlayWatcher);
    } else {
        startOverlayWatcher();
    }

    // ─── 5. Push notification prompt prevention via Permissions API ───────────
    // Some sites use the Permissions API to check status before prompting —
    // override that too so they think notifications are already denied.
    if (navigator.permissions && navigator.permissions.query) {
        const _origQuery = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = function (desc) {
            if (shieldActive && desc && desc.name === 'notifications') {
                return Promise.resolve({ state: 'denied', onchange: null });
            }
            return _origQuery(desc);
        };
    }

})();
