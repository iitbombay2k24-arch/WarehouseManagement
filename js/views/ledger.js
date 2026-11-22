// Stock Ledger + automatic Alert Engine.
// The ledger is append-only: every stock change is a signed movement and the
// product's `stock` is always the running balance of its movements.
(function () {
    'use strict';
    var KEY = 'wms_stock_ledger';
    var DEFAULT_MIN = 100;
    // Direction: +1 adds stock, -1 removes stock, 0 = signed delta supplied by caller.
    var TYPES = {
        OPENING:    { dir: +1, label: 'Opening balance' },
        RECEIPT:    { dir: +1, label: 'Goods receipt (GRN)' },
        PRODUCTION: { dir: +1, label: 'Production output' },
        RETURN_IN:  { dir: +1, label: 'Customer return (restock)' },
        DISPATCH:   { dir: -1, label: 'Dispatch / sale' },
        CONSUME:    { dir: -1, label: 'Production consumption' },
        DAMAGE:     { dir: -1, label: 'Damage / wastage' },
        ADJUST:     { dir: 0,  label: 'Stock-take adjustment' }
    };
    var esc = window.escapeHtml;

    function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function write(l) { localStorage.setItem(KEY, JSON.stringify(l)); }
    function actor() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.username : 'system'; }
    function round(n) { return Math.round(n * 1000) / 1000; }
    function products() { return DataManager.getProducts(); }

    var Ledger = {
        TYPES: TYPES,
        DEFAULT_MIN: DEFAULT_MIN,
        entries: read,

        // Seed one OPENING entry per product that has stock but no ledger history.
        init: function () {
            var l = read(), seen = {};
            l.forEach(function (e) { seen[e.sku] = true; });
            var added = false;
            products().forEach(function (p) {
                if (!seen[p.id] && Number(p.stock) > 0) {
                    l.push({ id: 'MOV-' + Date.now() + '-' + p.id, ts: new Date().toISOString(), sku: p.id, type: 'OPENING',
                        qty: Number(p.stock), balance: Number(p.stock), ref: 'OPENING', note: 'Opening balance', user: 'system' });
                    added = true;
                }
            });
            if (added) write(l);
        },

        // Record a movement and update the product balance. Throws Error on invalid input.
        post: function (m) {
            var def = TYPES[m.type];
            if (!def) throw new Error('Unknown movement type.');
            var prods = products(), p = prods.filter(function (x) { return x.id === m.sku; })[0];
            if (!p) throw new Error('Unknown SKU: ' + m.sku);
            var qty = Number(m.qty);
            if (!isFinite(qty) || qty === 0 || Math.abs(qty) > 1e7) throw new Error('Enter a valid quantity.');
            if (def.dir !== 0 && qty < 0) throw new Error('Quantity must be positive.');
            var delta = def.dir === 0 ? qty : def.dir * qty;
            var note = String(m.note || '').trim().slice(0, 200);
            if (m.type === 'ADJUST' && !note) throw new Error('A reason is required for adjustments.');
            var ref = String(m.ref || '').trim().slice(0, 60);
            var l = read();
            if (m.idempotent && ref && l.some(function (e) { return e.type === m.type && e.ref === ref && e.sku === m.sku; })) {
                throw new Error(ref + ' has already been posted for ' + m.sku + '.');
            }
            var before = Number(p.stock) || 0, after = round(before + delta);
            if (after < 0) throw new Error('Insufficient stock: ' + p.name + ' has ' + before + ', cannot remove ' + Math.abs(delta) + '.');
            // Write ledger first, then balance; if the balance write fails, roll the entry back.
            var entry = { id: 'MOV-' + Date.now() + '-' + Math.floor(Math.random() * 1e4), ts: new Date().toISOString(), sku: p.id, type: m.type,
                qty: round(delta), balance: after, ref: ref, note: note, user: actor() };
            l.push(entry); write(l);
            try { DataManager.updateProduct(p.id, { stock: after }); }
            catch (e) { l.pop(); write(l); throw e; }
            DataManager.logAction('Stock ' + m.type, (delta > 0 ? '+' : '') + round(delta) + ' × ' + p.name + (ref ? ' (' + ref + ')' : '') + ' → balance ' + after);
            AlertEngine.scan();
            return entry;
        },

        // Compare ledger running totals with product.stock.
        reconcile: function () {
            var sums = {};
            read().forEach(function (e) { sums[e.sku] = round((sums[e.sku] || 0) + e.qty); });
            return products().map(function (p) {
                var led = sums[p.id] || 0, cur = Number(p.stock) || 0;
                return { sku: p.id, name: p.name, ledger: led, stock: cur, diff: round(cur - led) };
            }).filter(function (r) { return r.diff !== 0; });
        },
        fixDrift: function () {
            var n = 0;
            Ledger.reconcile().forEach(function (r) {
                var l = read();
                l.push({ id: 'MOV-' + Date.now() + '-' + r.sku, ts: new Date().toISOString(), sku: r.sku, type: 'ADJUST', qty: r.diff,
                    balance: r.stock, ref: 'RECONCILE', note: 'Auto-reconciliation: stock changed outside the ledger', user: actor() });
                write(l); n++;
            });
            return n;
        }
    };

    // ---------------- Alert engine ----------------
    function parseDate(s) { var t = Date.parse(s); return isNaN(t) ? null : t; }
    var AlertEngine = {
        scan: function () {
            var found = {}, now = Date.now(), DAY = 86400000;
            products().forEach(function (p) {
                var min = Number(p.minStock) || DEFAULT_MIN, st = Number(p.stock) || 0;
                if (st <= 0) found['OOS:' + p.id] = { type: 'Out of Stock', severity: 'danger', message: p.name + ' (' + p.id + ') is out of stock', rule: 'stock = 0' };
                else if (st < min) found['LOW:' + p.id] = { type: 'Low Stock', severity: st < min / 2 ? 'danger' : 'warning',
                    message: p.name + ' (' + p.id + ') below minimum (' + st + ' vs min ' + min + ')', rule: 'stock < min' };
            });
            DataManager.getPurchaseOrders().forEach(function (po) {
                var due = parseDate(po.expected);
                if (due && !/^(Delivered|Received|Cancelled|Rejected|Draft)/.test(po.status) && now > due + DAY) {
                    var d = Math.floor((now - due) / DAY);
                    found['PO:' + po.id] = { type: 'PO Overdue', severity: 'danger', message: po.id + ' from ' + po.supplier + ' is ' + d + ' day(s) overdue', rule: 'po_expected < today' };
                }
            });
            var lic = parseDate((DataManager.getCompanyProfile() || {}).licenseExpiry);
            if (lic) {
                var left = Math.ceil((lic - now) / DAY);
                if (left <= 60) found['LIC:FSSAI'] = { type: 'License Expiry', severity: left <= 15 ? 'danger' : 'warning',
                    message: left < 0 ? 'FSSAI licence expired ' + (-left) + ' day(s) ago' : 'FSSAI licence expires in ' + left + ' day(s)', rule: 'licence < 60 days' };
            }
            var list = DataManager.getAlerts(), changed = false;
            // Drop auto alerts whose condition has cleared; refresh message of ones still active.
            var out = list.filter(function (a) {
                if (!a.auto) return true;
                if (!found[a.key]) { changed = true; return false; }
                return true;
            });
            var byKey = {}; out.forEach(function (a) { if (a.auto) byKey[a.key] = a; });
            var time = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            Object.keys(found).forEach(function (k) {
                var f = found[k], ex = byKey[k];
                if (ex) { if (ex.message !== f.message || ex.severity !== f.severity) { ex.message = f.message; ex.severity = f.severity; changed = true; } }
                else { out.unshift({ id: 'AUTO-' + k.replace(/[^A-Za-z0-9]/g, '') + '-' + Date.now(), type: f.type, severity: f.severity, message: f.message,
                    time: time, acknowledged: false, rule: f.rule, auto: true, key: k }); changed = true; }
            });
            if (changed) localStorage.setItem('wms_alerts', JSON.stringify(out));
            AlertEngine.updateBadge();
            return found;
        },
        updateBadge: function () {
            var b = document.getElementById('alertNavBadge'); if (!b) return;
            var n = DataManager.getAlerts().filter(function (a) { return !a.acknowledged; }).length;
            b.textContent = n; b.style.display = n ? 'inline-block' : 'none';
        }
    };

    window.StockLedger = Ledger;
    window.AlertEngine = AlertEngine;

    // ---------------- View ----------------
    function skuOptions(sel) {
        return products().map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.id) + ' — ' + esc(p.name) + '</option>'; }).join('');
    }

    window.renderLedger = function () {
        Ledger.init();
        var prods = products(), today = new Date().toDateString();
        var l = read();
        var low = prods.filter(function (p) { return (Number(p.stock) || 0) < (Number(p.minStock) || DEFAULT_MIN); }).length;
        var units = prods.reduce(function (s, p) { return s + (Number(p.stock) || 0); }, 0);
        var moves = l.filter(function (e) { return new Date(e.ts).toDateString() === today; }).length;
        var canWrite = window.WMSAuth && WMSAuth.session() && WMSAuth.session().role !== 'viewer';
        setTimeout(function () { window.refreshLedger(); }, 50);
        var typeOpts = Object.keys(TYPES).filter(function (t) { return t !== 'OPENING'; }).map(function (t) { return '<option value="' + t + '">' + esc(TYPES[t].label) + '</option>'; }).join('');
        var form = canWrite ? '<div class="card" style="margin-bottom:20px;"><h2 class="section-title">Post Stock Movement</h2>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:12px;">' +
            '<select id="ledSku" class="form-control">' + skuOptions() + '</select>' +
            '<select id="ledType" class="form-control" onchange="ledTypeChanged()">' + typeOpts + '</select>' +
            '<input type="number" id="ledQty" class="form-control" placeholder="Quantity" step="any">' +
            '<input type="text" id="ledRef" class="form-control" placeholder="Reference (GRN / SO / note id)" maxlength="60">' +
            '<input type="text" id="ledNote" class="form-control" placeholder="Reason / note" maxlength="200"></div>' +
            '<div id="ledHint" style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px;"></div>' +
            '<button class="btn btn-primary" onclick="postLedgerMovement()"><i class="bx bx-check"></i> Post movement</button></div>' : '';
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
            '<h1 class="page-title" style="margin:0;">Stock Ledger</h1>' +
            '<button class="btn btn-outline" onclick="AlertEngine.scan();showToast(\'Alert scan complete\',\'success\')"><i class="bx bx-refresh"></i> Run alert scan</button></div>' +
            '<div class="dashboard-grid">' +
            '<div class="card dashboard-widget"><div class="widget-icon blue"><i class="bx bx-box"></i></div><div class="widget-value">' + prods.length + '</div><div class="widget-title">SKUs</div></div>' +
            '<div class="card dashboard-widget"><div class="widget-icon green"><i class="bx bx-cube"></i></div><div class="widget-value">' + units.toLocaleString('en-IN') + '</div><div class="widget-title">Units on hand</div></div>' +
            '<div class="card dashboard-widget"><div class="widget-icon red"><i class="bx bx-error"></i></div><div class="widget-value">' + low + '</div><div class="widget-title">Below minimum</div></div>' +
            '<div class="card dashboard-widget"><div class="widget-icon blue"><i class="bx bx-transfer"></i></div><div class="widget-value">' + moves + '</div><div class="widget-title">Movements today</div></div></div>' +
            '<div id="ledDrift"></div>' + form +
            '<div class="card"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px;"><h2 class="section-title" style="margin:0;">Movement History</h2>' +
            '<select id="ledFilterSku" class="form-control" style="max-width:240px;margin-left:auto;" onchange="refreshLedger()"><option value="">All SKUs</option>' + skuOptions() + '</select>' +
            '<select id="ledFilterType" class="form-control" style="max-width:200px;" onchange="refreshLedger()"><option value="">All types</option>' +
            Object.keys(TYPES).map(function (t) { return '<option value="' + t + '">' + esc(TYPES[t].label) + '</option>'; }).join('') + '</select></div>' +
            '<div class="table-container"><table class="table" id="ledgerTable"><thead><tr><th>Time</th><th>SKU</th><th>Type</th><th>Qty</th><th>Balance</th><th>Reference</th><th>Note</th><th>By</th></tr></thead>' +
            '<tbody id="ledgerBody"></tbody></table></div></div></div>';
    };

    window.ledTypeChanged = function () {
        var t = document.getElementById('ledType').value, h = document.getElementById('ledHint');
        if (!h) return;
        h.textContent = t === 'ADJUST' ? 'Stock-take: enter the signed difference (e.g. -5 for 5 missing, +3 for 3 found). A reason is required.' :
            (TYPES[t].dir < 0 ? 'Removes stock. Cannot exceed the quantity on hand.' : 'Adds stock.');
    };

    window.postLedgerMovement = function () {
        try {
            var e = Ledger.post({ sku: ledSku.value, type: ledType.value, qty: ledQty.value, ref: ledRef.value, note: ledNote.value });
            showToast('Posted: ' + (e.qty > 0 ? '+' : '') + e.qty + ' → balance ' + e.balance, 'success');
            ledQty.value = ''; ledRef.value = ''; ledNote.value = '';
            window.refreshLedger();
        } catch (err) { showToast(err.message, 'danger'); }
    };

    window.refreshLedger = function () {
        var body = document.getElementById('ledgerBody'); if (!body) return;
        var fs = (document.getElementById('ledFilterSku') || {}).value, ft = (document.getElementById('ledFilterType') || {}).value;
        var names = {}; products().forEach(function (p) { names[p.id] = p.name; });
        var rows = read().slice().reverse().filter(function (e) { return (!fs || e.sku === fs) && (!ft || e.type === ft); }).slice(0, 500);
        body.innerHTML = rows.length ? rows.map(function (e) {
            var pos = e.qty > 0;
            return '<tr><td>' + esc(new Date(e.ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</td>' +
                '<td><strong>' + esc(e.sku) + '</strong><div style="font-size:.7rem;color:var(--text-muted);">' + esc(names[e.sku] || '') + '</div></td>' +
                '<td>' + esc((TYPES[e.type] || {}).label || e.type) + '</td>' +
                '<td style="font-weight:700;color:var(--' + (pos ? 'secondary' : 'danger') + '-color);">' + (pos ? '+' : '') + esc(e.qty) + '</td>' +
                '<td>' + esc(e.balance) + '</td><td>' + esc(e.ref) + '</td><td>' + esc(e.note) + '</td><td>' + esc(e.user) + '</td></tr>';
        }).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No movements yet.</td></tr>';
        var drift = Ledger.reconcile(), box = document.getElementById('ledDrift');
        if (box) box.innerHTML = drift.length ? '<div class="card" style="margin-bottom:20px;border-left:4px solid var(--warning-color);"><strong>Ledger mismatch on ' + drift.length +
            ' SKU(s):</strong> ' + drift.map(function (r) { return esc(r.sku) + ' (stock ' + esc(r.stock) + ' vs ledger ' + esc(r.ledger) + ')'; }).join(', ') +
            '<div style="margin-top:8px;"><button class="btn btn-outline" onclick="fixLedgerDrift()">Post correcting adjustments</button></div></div>' : '';
        window.ledTypeChanged();
    };
    window.fixLedgerDrift = function () {
        var n = Ledger.fixDrift(); showToast('Posted ' + n + ' correcting adjustment(s)', 'success'); window.refreshLedger();
    };
    window.initLedger = function () { AlertEngine.scan(); };

    document.addEventListener('DOMContentLoaded', function () {
        Ledger.init();
        AlertEngine.scan();
        setInterval(AlertEngine.scan, 5 * 60 * 1000);
    });
})();
