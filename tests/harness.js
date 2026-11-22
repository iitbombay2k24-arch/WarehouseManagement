'use strict';
// Loads the app's browser scripts into an isolated Node VM with in-memory storage,
// so business logic can be tested without a browser. Each load() is a clean slate.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Same order as index.html (only logic-bearing files; no UI-only views needed).
const FILES = [
    'js/util.js', 'js/auth.js', 'js/app.js', 'js/analytics.js',
    'js/views/products.js', 'js/views/receiving.js', 'js/views/production.js', 'js/views/returns.js',
    'js/views/purchase.js', 'js/views/ledger.js', 'js/views/invoices.js',
];

function memoryStorage() {
    const m = new Map();
    return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); }, clear: () => m.clear(), key: i => [...m.keys()][i], get length() { return m.size; } };
}

function load() {
    const listeners = [];
    const noop = () => {};
    const el = () => ({ style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, appendChild: noop, remove: noop, querySelector: () => null, querySelectorAll: () => [], setAttribute: noop, insertAdjacentElement: noop });
    const ctx = {
        console, setTimeout, clearTimeout, setInterval: () => 0, clearInterval: noop, Date, Math, JSON, Promise, TextEncoder, URL, Blob: class {},
        crypto: globalThis.crypto, btoa: globalThis.btoa, atob: globalThis.atob,
        localStorage: memoryStorage(), sessionStorage: memoryStorage(),
        document: { addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') listeners.push(fn); }, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el, body: el(), documentElement: el() },
        confirm: () => true, prompt: () => null, alert: noop,
    };
    ctx.window = ctx; ctx.self = ctx; ctx.addEventListener = noop;
    ctx.location = { hash: '', replace: noop, href: '' };
    ctx.Chart = undefined;
    const toasts = []; ctx.showToast = (m, t) => toasts.push({ m, t });
    vm.createContext(ctx);
    for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
    // Fire DOMContentLoaded handlers (migrations, ledger init). The router handler in app.js needs a real DOM and is skipped.
    for (const fn of listeners) { try { fn(); } catch (e) { /* DOM-only handlers */ } }
    const run = code => vm.runInContext(code, ctx);
    run('DataManager.init()');
    run('StockLedger.init()');
    return { ctx, run, toasts, A: ctx.WMSAuth };
}

// Signed in as admin (sessions live in sessionStorage); lets role-gated code run.
async function asAdmin(env) {
    await env.A.login('admin', 'admin123');
    return env;
}

module.exports = { load, asAdmin };
