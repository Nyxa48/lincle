// Lincle Background Service Worker v3.8.2
// Developed by: Emir Samed (Nyxa48)
//
// This background script runs in the extension context. It manages:
//   1. Context menu integration (right-click on links to bypass)
//   2. Keyboard shortcut commands (e.g. Alt+L to trigger manual cleanup)
//   3. Tab navigation breadcrumb tracking (records redirect chains for debugging)

// ─── Cross-Browser Extension API Shim ─────────────────────────────────────────
// Chrome uses 'chrome', Firefox uses 'browser'. This line ensures compatibility.
const ext = (typeof browser !== "undefined") ? browser : chrome;

// ─── 1. Context Menu Setup ───────────────────────────────────────────────────
// Creates a right-click menu item when the extension is first installed or updated.
ext.runtime.onInstalled.addListener(() => {
    ext.contextMenus.create({
        id: "lincle-bypass",
        title: "Lincle: Clean Link & Open",
        contexts: ["link"] // Only shows up when right-clicking a hyperlink
    });
});

// Handles right-click menu clicks
ext.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lincle-bypass" && info.linkUrl) {
        // Open the clicked URL directly in a new tab, bypassing middleman shorteners
        ext.tabs.create({ url: info.linkUrl });
    }
});

// ─── 2. Keyboard Shortcut Listener ───────────────────────────────────────────
// Listens for custom keyboard commands configured in manifest.json (e.g., Alt+L).
ext.commands.onCommand.addListener((command) => {
    if (command === "trigger-lincle") {
        // Find the currently active tab and send a message to trigger manual bypass
        ext.tabs.query({ active: true, currentWindow: true }).then(tabs => {
            if (tabs[0]) {
                ext.tabs.sendMessage(tabs[0].id, { action: "manualBypass" });
            }
        }).catch(() => {});
    }
});

// ─── 3. Navigation Breadcrumb Tracker ────────────────────────────────────────
// When enabled in settings, tracks redirect chains across tabs for debugging shorteners.
let tabBreadcrumbs = {};

ext.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Ignore iframe/subframe navigations (frameId 0 is the main page)
    if (details.frameId !== 0) return;

    // Check if user has enabled breadcrumb tracking in settings
    const opts = (await ext.storage.local.get("lincleOptions")).lincleOptions || {};
    if (!opts.enableBreadcrumbs) return;

    if (!tabBreadcrumbs[details.tabId]) tabBreadcrumbs[details.tabId] = [];

    // Classify transition type (HTTP server redirect vs standard page load)
    const transition = (details.transitionQualifiers || []).includes("server_redirect")
        ? "Server Redirect"
        : "Page Load";

    // Push new breadcrumb record
    tabBreadcrumbs[details.tabId].push({
        time: new Date().toLocaleTimeString(),
        url: details.url,
        type: transition
    });

    // Limit memory usage by capping chain history to 10 entries per tab
    if (tabBreadcrumbs[details.tabId].length > 10) {
        tabBreadcrumbs[details.tabId].shift();
    }

    // Save to local storage for display in the Options page
    ext.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
});

// Clean up memory when a tab is closed (Garbage collection)
ext.tabs.onRemoved.addListener((tabId) => {
    if (tabBreadcrumbs[tabId]) {
        delete tabBreadcrumbs[tabId];
        ext.storage.local.set({ lincleBreadcrumbs: tabBreadcrumbs });
    }
});