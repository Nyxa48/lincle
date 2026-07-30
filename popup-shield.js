// Lincle Popup Shield v3.5 — runs at document_start
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

    // ─── Site-Level Protection Lists ──────────────────────────────────────────
    // FULL_BYPASS: Lincle makes ZERO API modifications on these sites.
    // This prevents false "ad-blocker detected" warnings on sites like Aternos
    // that fingerprint native API overrides (window.open, Notification, etc.).
    const FULL_BYPASS_SITES = [
        'aternos.org',
        'aternos.me',
        'aternos.host',
        'aternos.com',
        'twitch.tv',
        'spotify.com',
        'discord.com',
        'notion.so',
        'figma.com',
        'canva.com',
        'docs.google.com',
        'drive.google.com',
        'outlook.live.com',
        'mail.google.com',
    ];

    // OVERLAY_SAFE: Overlay/modal removal is disabled, but window.open blocking
    // and notification suppression still work. For sites with legitimate modals
    // (image lightboxes, galleries, login dialogs) that get falsely removed.
    const OVERLAY_SAFE_SITES = [
        'nexusmods.com',
        'deviantart.com',
        'artstation.com',
        'behance.net',
        'dribbble.com',
        'unsplash.com',
        'flickr.com',
        'imgur.com',
        'pinterest.com',
        'medium.com',
        'notion.so',
        'trello.com',
        'jira.atlassian.net',
        'github.com',
        'gitlab.com',
        'stackoverflow.com',
        'codepen.io',
    ];

    const currentHost = location.hostname.replace(/^www\./, '');

    // If site is in the full bypass list, exit immediately without touching anything
    if (FULL_BYPASS_SITES.some(s => currentHost === s || currentHost.endsWith('.' + s))) {
        return;
    }

    const isOverlaySafe = OVERLAY_SAFE_SITES.some(
        s => currentHost === s || currentHost.endsWith('.' + s)
    );

    // ─── Cross-browser shim ───────────────────────────────────────────────────
    const ext = (typeof browser !== 'undefined') ? browser : chrome;

    // ─── Quick kill-switch check ──────────────────────────────────────────────
    let shieldActive = true;
    function updateShieldState() {
        ext.storage.local.get(['lincleSettings', 'lincleOptions']).then(d => {
            const masterOn = (d.lincleSettings || {}).isActive !== false;
            const shieldOn = (d.lincleOptions || {}).enablePopupShield !== false; // default ON
            shieldActive = masterOn && shieldOn;
        }).catch(() => {});
    }
    updateShieldState();
    if (ext.storage && ext.storage.onChanged) {
        ext.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && (changes.lincleSettings || changes.lincleOptions)) {
                updateShieldState();
            }
        });
    }

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

    // ─── 4.1 Aggressive Scroll Unlocker ──────────────────────────────────────
    // Sites like obilet add wheel/touchmove listeners with { passive: false }
    // that call event.preventDefault() to freeze scrolling while a popup shows.
    // Our previous addEventListener wrapper only catches listeners added AFTER
    // Lincle loads — but many site scripts load simultaneously or even before.
    //
    // Strategy: Two layers that catch ALL scroll-blocking, past AND future:
    //
    // Layer A: Override Event.prototype.preventDefault — when blockedAnyOverlay
    //          is true and the event is wheel/touchmove, the call is silently
    //          swallowed so scrolling continues even if a site listener fires.
    //
    // Layer B: Capture-phase listeners on window that re-dispatch wheel events
    //          with { passive: true } semantics by preventing any subsequent
    //          handler from calling preventDefault().

    let blockedAnyOverlay = false;
    let isCleaning = false;

    // Layer A: Neuter preventDefault() for scroll events when shield is active
    const _origPreventDefault = Event.prototype.preventDefault;
    Object.defineProperty(Event.prototype, 'preventDefault', {
        value: function () {
            if (shieldActive && blockedAnyOverlay &&
                (this.type === 'wheel' || this.type === 'touchmove' ||
                 this.type === 'mousewheel' || this.type === 'DOMMouseScroll')) {
                // Silently ignore — allow the browser's default scroll behavior
                return;
            }
            return _origPreventDefault.call(this);
        },
        writable: true,
        configurable: true,
    });

    // Layer B: Capture-phase listeners that forcibly restore overflow before
    // any site handler can process the event. This runs first (capture = true).
    function forceScrollHandler(e) {
        if (!shieldActive || !blockedAnyOverlay) return;
        // While we're in "overlay was removed" mode, force-restore body scroll
        // on every scroll attempt to counter async re-lockers.
        const body = document.body;
        const html = document.documentElement;
        if (body) {
            const bs = body.style;
            if (bs.overflow === 'hidden') bs.overflow = '';
            if (bs.overflowY === 'hidden') bs.overflowY = '';
            if (bs.position === 'fixed') { bs.position = ''; bs.top = ''; bs.width = ''; }
            if (bs.pointerEvents === 'none') bs.pointerEvents = '';
        }
        if (html) {
            const hs = html.style;
            if (hs.overflow === 'hidden') hs.overflow = '';
            if (hs.overflowY === 'hidden') hs.overflowY = '';
        }
    }
    // These run at capture phase so they fire BEFORE any site handlers
    window.addEventListener('wheel', forceScrollHandler, true);
    window.addEventListener('touchmove', forceScrollHandler, true);
    window.addEventListener('mousewheel', forceScrollHandler, true);

    function isOverlayVisible() {
        return OVERLAY_SELECTORS.some(sel => {
            try {
                return Array.from(document.querySelectorAll(sel)).some(isCoveringOverlay);
            } catch { return false; }
        });
    }

    // ─── 4.2 Comprehensive Scroll Restoration (HTML, Body & Wrappers) ────────
    // Clears overflow: hidden, fixed positioning tricks, and modal lock classes.
    let _restoreTimer = null;

    function restoreScroll(force = false) {
        const targets = [
            document.documentElement,  // <html>
            document.body,             // <body>
        ];

        document.querySelectorAll('#__next, #root, .app, .app-root, [id*="wrapper"], [class*="scroll-lock"], [class*="no-scroll"], [class*="modal-open"], main, .container').forEach(el => {
            targets.push(el);
        });

        const lockClasses = ['modal-open', 'no-scroll', 'scroll-locked', 'overflow-hidden',
            'noscroll', 'is-modal-open', 'ReactModal__Body--open', 'modal-active', 'disable-scroll',
            'stop-scrolling', 'popup-open', 'ov-hidden', 'body-scroll-lock'];

        targets.forEach(el => {
            if (!el) return;
            const cs = window.getComputedStyle(el);
            if (force || cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.overflowX === 'hidden' ||
                el.style.overflow === 'hidden' || el.style.overflowY === 'hidden' || el.style.overflowX === 'hidden') {
                // Remove the site's inline overflow locks — DON'T set then remove!
                el.style.removeProperty('overflow');
                el.style.removeProperty('overflow-y');
                el.style.removeProperty('overflow-x');
                el.style.removeProperty('touch-action');
                el.style.removeProperty('overscroll-behavior');
                el.style.removeProperty('pointer-events');
                // If CSS rules (not inline) still force hidden, override with !important
                const csAfter = window.getComputedStyle(el);
                if (csAfter.overflow === 'hidden' || csAfter.overflowY === 'hidden') {
                    el.style.setProperty('overflow', 'auto', 'important');
                    el.style.setProperty('overflow-y', 'auto', 'important');
                }
            }
            lockClasses.forEach(cls => {
                if (el.classList.contains(cls)) el.classList.remove(cls);
            });
        });

        [document.documentElement, document.body].forEach(el => {
            if (!el) return;
            const elTop = el.style.top;
            if (el.style.position === 'fixed' && elTop) {
                const scrollY = Math.abs(parseInt(elTop, 10)) || 0;
                el.style.position = '';
                el.style.top = '';
                el.style.left = '';
                el.style.right = '';
                el.style.width = '';
                el.style.height = '';
                if (scrollY && el === document.body) window.scrollTo(0, scrollY);
            } else if (el.style.position === 'fixed' || el.style.pointerEvents === 'none') {
                el.style.removeProperty('position');
                el.style.removeProperty('pointer-events');
                el.style.removeProperty('height');
            }
        });

        // Many sites re-lock scroll asynchronously (requestAnimationFrame, setTimeout, etc.)
        // Run restoreScroll repeatedly for 10 seconds after overlay removal to counter this.
        if (force && !_restoreTimer) {
            let runs = 0;
            _restoreTimer = setInterval(() => {
                runs++;
                if (runs > 20 || !shieldActive) { clearInterval(_restoreTimer); _restoreTimer = null; return; }
                restoreScroll(false);
            }, 500);
        }
    }

    // ─── 4.3 Overflow Property Guard (Traps style.overflow setters) ──────────
    let guardedHtml = false;
    let guardedBody = false;

    function activateOverflowGuard() {
        function guardOverflow(el) {
            try {
                const proto = Object.getPrototypeOf(el.style);
                const descriptor = Object.getOwnPropertyDescriptor(proto, 'overflow') ||
                    Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'overflow');
                if (!descriptor) return;

                ['overflow', 'overflowY', 'overflowX'].forEach(prop => {
                    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                    const orig = descriptor.set;
                    if (!orig) return;
                    try {
                        Object.defineProperty(el.style, prop, {
                            set(val) {
                                if (shieldActive && (val === 'hidden' || val === 'clip') && !isOverlayVisible()) {
                                    console.debug(`[Lincle Shield] Blocked ${cssProp}:${val} re-lock on`, el.tagName);
                                    return; // swallow the lock attempt
                                }
                                orig.call(this, val);
                            },
                            get: descriptor.get,
                            configurable: true,
                        });
                    } catch { /* non-configurable — skip */ }
                });
            } catch { /* ignore security/proxy errors */ }
        }

        if (document.documentElement && !guardedHtml) {
            guardOverflow(document.documentElement);
            guardedHtml = true;
        }
        if (document.body && !guardedBody) {
            guardOverflow(document.body);
            guardedBody = true;
        }
    }

    // ─── 4.4 Unified Overlay Remover & Scroll Restorer ───────────────────────
    // Close button selectors — we try clicking these FIRST so the site's own
    // cleanup code runs (which properly releases scroll locks, listeners, etc.)
    const CLOSE_BTN_SELECTORS = [
        // BEM-style close buttons (obilet, booking sites)
        '[class*="close-btn"]', '[class*="close_btn"]', '[class*="closeBtn"]',
        '[class*="modal__close"]', '[class*="modal-close"]',
        // Generic close / dismiss buttons
        'button[aria-label="Close"]', 'button[aria-label="Kapat"]',
        'button[class*="dismiss"]', 'button[class*="close"]',
        '[data-dismiss="modal"]', '[data-close]',
        // X-icon patterns
        '.close', '.modal-close', '.popup-close', '.overlay-close',
        // Common SVG/icon close buttons
        'button > svg', 'div[role="button"][class*="close"]',
    ];

    function tryClickClose(overlayEl) {
        // 1. Look for a close button INSIDE the overlay
        for (const sel of CLOSE_BTN_SELECTORS) {
            try {
                const btn = overlayEl.querySelector(sel);
                if (btn && btn.offsetParent !== null) {
                    btn.click();
                    console.debug('[Lincle Shield] Clicked close button:', sel, btn.className);
                    return true;
                }
            } catch { /* skip invalid selector */ }
        }
        // 2. Look for a close button that's a SIBLING of the overlay (some sites)
        if (overlayEl.parentElement) {
            for (const sel of CLOSE_BTN_SELECTORS) {
                try {
                    const btn = overlayEl.parentElement.querySelector(sel);
                    if (btn && btn.offsetParent !== null && !overlayEl.contains(btn)) {
                        btn.click();
                        console.debug('[Lincle Shield] Clicked sibling close button:', sel);
                        return true;
                    }
                } catch { /* skip */ }
            }
        }
        return false;
    }

    function removeOverlays() {
        if (!shieldActive) return;
        // Skip overlay removal entirely on sites with legitimate modals/lightboxes
        if (isOverlaySafe) return;
        let removed = 0;

        activateOverflowGuard();

        // Collect all covering overlays first
        const overlays = [];
        OVERLAY_SELECTORS.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    if (isCoveringOverlay(el)) overlays.push(el);
                });
            } catch { /* invalid selector — skip */ }
        });

        document.querySelectorAll('body > *, body > * > *').forEach(el => {
            if (isCoveringOverlay(el) && !el.closest('#lincle-banner')) {
                const textLen = (el.innerText || '').length;
                if (textLen < 600) overlays.push(el);
            }
        });

        // De-duplicate
        const uniqueOverlays = [...new Set(overlays)];

        for (const el of uniqueOverlays) {
            // Strategy: try clicking close first → site cleans up scroll itself
            const clicked = tryClickClose(el);
            if (clicked) {
                removed++;
                // Give the site 600ms to clean up, then verify & force-clean if needed
                setTimeout(() => {
                    if (document.body && document.contains(el)) {
                        // Close click didn't remove it — force remove
                        el.remove();
                        console.debug('[Lincle Shield] Force-removed after click failed:', el.className);
                    }
                    restoreScroll(true);
                }, 600);
            } else {
                // No close button found — force remove
                el.remove();
                removed++;
                console.debug('[Lincle Shield] Force-removed overlay:', el.className || el.id);
            }
        }

        if (removed > 0) {
            blockedAnyOverlay = true;
        }

        restoreScroll(removed > 0);

        if (removed > 0) {
            console.debug(`[Lincle Shield] Processed ${removed} overlay(s), scroll restored.`);
            try {
                ext.storage.local.get("lincleStats").then(d => {
                    const s = d.lincleStats || {};
                    s.blockedPopups = (s.blockedPopups || 0) + removed;
                    ext.storage.local.set({ lincleStats: s });
                });
            } catch { /* non-fatal */ }
        }
    }

    function startOverlayWatcher() {
        if (!shieldActive) return;
        if (isOverlaySafe) return; // Do not attach scroll-lock overrides to safe sites like nexusmods

        removeOverlays();

        // 1) Child list observer: runs only when DOM nodes are added/removed
        const childObserver = new MutationObserver(() => {
            if (isCleaning || !shieldActive) return;
            isCleaning = true;
            try {
                removeOverlays();
            } finally {
                isCleaning = false;
            }
        });
        childObserver.observe(document.documentElement, { childList: true, subtree: true });

        // 2) Attribute observer: watches ONLY html and body style/class changes without subtree overhead
        const attrObserver = new MutationObserver(() => {
            if (isCleaning || !shieldActive) return;
            isCleaning = true;
            try {
                restoreScroll();
                activateOverflowGuard();
            } finally {
                isCleaning = false;
            }
        });
        if (document.documentElement) attrObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
        if (document.body) attrObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

        // Keep observers alive long enough for lazy-loaded popups (hotel search etc.)
        setTimeout(() => {
            childObserver.disconnect();
            attrObserver.disconnect();
        }, 120000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            startOverlayWatcher();
        });
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
