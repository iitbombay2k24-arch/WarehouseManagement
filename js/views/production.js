// Production: Bills of Materials (BOM) and Work Orders.
// Starting a work order consumes raw material + packaging from the stock ledger;
// completing it books good output into finished-goods stock and records yield.
(function () {
    'use strict';
    var BOM_KEY = 'wms_boms', WO_KEY = 'wms_work_orders', MIG_KEY = 'wms_migr_rm_v1';
    var esc = window.escapeHtml;
    var COMPONENT_CATS = /^(Raw Material|Packaging)$/;

    function rd(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
    function wr(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
    function actor() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.username : 'system'; }
    function r3(n) { return Math.round(n * 1000) / 1000; }
    function prod(id) { return DataManager.getProducts().filter(function (p) { return p.id === id; })[0]; }
    function stockOf(id) { var p = prod(id); return p ? Number(p.stock) || 0 : 0; }

    // ---- one-time seed: raw materials, packaging and starter BOMs ----
    function migrate() {
        if (localStorage.getItem(MIG_KEY)) return;
        var have = {}; DataManager.getProducts().forEach(function (p) { have[p.id] = true; });
        [{ id: 'RM-001', name: 'Besan (Gram flour)', category: 'Raw Material', stock: 800, price: 75, unit: 'kg', minStock: 200 },
         { id: 'RM-002', name: 'Palm Oil', category: 'Raw Material', stock: 400, price: 130, unit: 'L', minStock: 100 },
         { id: 'RM-003', name: 'Spice Blend', category: 'Raw Material', stock: 120, price: 310, unit: 'kg', minStock: 30 },
         { id: 'PK-001', name: 'Pouch 500g (printed)', category: 'Packaging', stock: 5000, price: 2, unit: 'pcs', minStock: 1000 },
         { id: 'PK-002', name: 'Pouch 1kg (printed)', category: 'Packaging', stock: 3000, price: 3, unit: 'pcs', minStock: 800 }
        ].forEach(function (p) { if (!have[p.id]) DataManager.addProduct(p); });
        if (!rd(BOM_KEY).length) {
            wr(BOM_KEY, [
                { sku: 'SKU-001', batchSize: 100, components: [{ sku: 'RM-001', qty: 30 }, { sku: 'RM-002', qty: 12 }, { sku: 'RM-003', qty: 3 }, { sku: 'PK-001', qty: 100 }] },
                { sku: 'SKU-002', batchSize: 50, components: [{ sku: 'RM-001', qty: 20 }, { sku: 'RM-002', qty: 8 }, { sku: 'RM-003', qty: 4 }, { sku: 'PK-002', qty: 50 }] }
            ]);
        }
        localStorage.setItem(MIG_KEY, '1');
        if (window.StockLedger) StockLedger.init();
    }

    var Prod = {
        boms: function () { return rd(BOM_KEY); },
        orders: function () { return rd(WO_KEY); },
        bomFor: function (sku) { return rd(BOM_KEY).filter(function (b) { return b.sku === sku; })[0]; },

        // Materials needed for `qty` finished units.
        requirements: function (sku, qty) {
            var b = Prod.bomFor(sku); if (!b) throw new Error('No BOM defined for ' + sku + '.');
            return b.components.map(function (c) {
                var need = r3(c.qty * qty / b.batchSize), have = stockOf(c.sku), p = prod(c.sku);
                return { sku: c.sku, name: p ? p.name : c.sku, unit: p && p.unit || '', need: need, have: have, short: Math.max(0, r3(need - have)) };
            });
        },

        saveBom: function (bom) {
            var fg = prod(bom.sku); if (!fg) throw new Error('Choose a finished product.');
            if (COMPONENT_CATS.test(fg.category)) throw new Error('A raw material or packaging item cannot have a BOM.');
            bom.batchSize = Number(bom.batchSize);
            if (!(bom.batchSize > 0)) throw new Error('Batch size must be greater than 0.');
            if (!bom.components.length) throw new Error('Add at least one component.');
            var seen = {};
            bom.components = bom.components.map(function (c) {
                if (!prod(c.sku)) throw new Error('Unknown component: ' + c.sku);
                if (c.sku === bom.sku) throw new Error('A product cannot be a component of itself.');
                if (seen[c.sku]) throw new Error('Duplicate component ' + c.sku + '.');
                seen[c.sku] = 1;
                var q = Number(c.qty); if (!(q > 0)) throw new Error('Component quantities must be greater than 0.');
                return { sku: c.sku, qty: q };
            });
            var l = rd(BOM_KEY).filter(function (b) { return b.sku !== bom.sku; }); l.push(bom); wr(BOM_KEY, l);
            DataManager.logAction('BOM Saved', 'BOM for ' + fg.name + ' (' + bom.components.length + ' components)');
        },
        deleteBom: function (sku) {
            if (Prod.orders().some(function (o) { return o.sku === sku && (o.status === 'Planned' || o.status === 'In Progress'); }))
                throw new Error('Open work orders use this BOM.');
            wr(BOM_KEY, rd(BOM_KEY).filter(function (b) { return b.sku !== sku; }));
        },

        create: function (sku, qty, note) {
            qty = Number(qty);
            if (!(qty > 0) || qty > 1e6) throw new Error('Enter a valid quantity.');
            var reqs = Prod.requirements(sku, qty), l = rd(WO_KEY);
            var n = l.reduce(function (m, o) { return Math.max(m, parseInt(String(o.id).replace(/\D/g, ''), 10) || 0); }, 9000) + 1;
            var wo = { id: 'WO-' + n, sku: sku, qty: qty, status: 'Planned', created: new Date().toISOString(), createdBy: actor(), note: String(note || '').slice(0, 200),
                materials: reqs.map(function (r) { return { sku: r.sku, qty: r.need }; }) };
            l.unshift(wo); wr(WO_KEY, l); return wo;
        },
        get: function (id) { return rd(WO_KEY).filter(function (o) { return o.id === id; })[0]; },
        _update: function (id, fn) { var l = rd(WO_KEY), o = l.filter(function (x) { return x.id === id; })[0]; fn(o); wr(WO_KEY, l); return o; },

        // Consume materials atomically: verify everything first, roll back on any failure.
        start: function (id) {
            var wo = Prod.get(id); if (!wo) throw new Error('Work order not found.');
            if (wo.status !== 'Planned') throw new Error('Only planned work orders can be started.');
            var short = wo.materials.filter(function (m) { return stockOf(m.sku) < m.qty; });
            if (short.length) throw new Error('Shortage: ' + short.map(function (m) { var p = prod(m.sku); return (p ? p.name : m.sku) + ' needs ' + m.qty + ', has ' + stockOf(m.sku); }).join('; '));
            var done = [];
            try {
                wo.materials.forEach(function (m) {
                    StockLedger.post({ sku: m.sku, type: 'CONSUME', qty: m.qty, ref: wo.id, note: 'Consumed for ' + wo.id, idempotent: true });
                    done.push(m);
                });
            } catch (e) {
                done.forEach(function (m) { try { StockLedger.post({ sku: m.sku, type: 'ADJUST', qty: m.qty, ref: wo.id, note: 'Rollback: ' + wo.id + ' failed to start' }); } catch (x) {} });
                throw e;
            }
            return Prod._update(id, function (o) { o.status = 'In Progress'; o.started = new Date().toISOString(); });
        },
        complete: function (id, good, rejected) {
            var wo = Prod.get(id); if (!wo) throw new Error('Work order not found.');
            if (wo.status !== 'In Progress') throw new Error('Only in-progress work orders can be completed.');
            good = Number(good); rejected = Number(rejected) || 0;
            if (!(good >= 0) || !(rejected >= 0)) throw new Error('Quantities cannot be negative.');
            if (good + rejected > wo.qty * 1.5) throw new Error('Output is more than 150% of the planned quantity — check the numbers.');
            if (good > 0) StockLedger.post({ sku: wo.sku, type: 'PRODUCTION', qty: good, ref: wo.id, note: 'Output of ' + wo.id, idempotent: true });
            DataManager.logAction('Production Complete', wo.id + ': ' + good + ' good, ' + rejected + ' rejected');
            return Prod._update(id, function (o) { o.status = 'Completed'; o.completed = new Date().toISOString(); o.good = good; o.rejected = rejected; o.yield = o.qty ? Math.round(good / o.qty * 1000) / 10 : 0; });
        },
        cancel: function (id) {
            var wo = Prod.get(id); if (!wo || wo.status !== 'Planned') throw new Error('Only planned work orders can be cancelled.');
            Prod._update(id, function (o) { o.status = 'Cancelled'; });
        }
    };
    window.ProductionStore = Prod;

    // ---- UI ----
    function modal(html) {
        closeProdModal();
        var o = document.createElement('div'); o.id = 'prodModal';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;';
        o.innerHTML = '<div role="dialog" aria-modal="true" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;width:min(720px,100%);padding:22px;">' + html + '</div>';
        o.addEventListener('mousedown', function (e) { if (e.target === o) closeProdModal(); });
        document.body.appendChild(o);
    }
    window.closeProdModal = function () { var m = document.getElementById('prodModal'); if (m) m.remove(); };
    var closeProdModal = window.closeProdModal;
    function opts(list, sel) { return list.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(p.id) + ' — ' + esc(p.name) + '</option>'; }).join(''); }
    function finished() { return DataManager.getProducts().filter(function (p) { return !COMPONENT_CATS.test(p.category); }); }
    function components() { return DataManager.getProducts().filter(function (p) { return COMPONENT_CATS.test(p.category); }); }

    window.renderProduction = function () {
        setTimeout(window.refreshProduction, 40);
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;">Production</h1><div style="display:flex;gap:10px;">' +
            '<button class="btn btn-outline" onclick="prodBomEdit()"><i class="bx bx-list-check"></i> New / edit BOM</button>' +
            '<button class="btn btn-primary" onclick="prodNewWO()"><i class="bx bx-play-circle"></i> New work order</button></div></div>' +
            '<div class="dashboard-grid" id="prodKpis"></div>' +
            '<div class="card" style="margin-bottom:20px;"><h2 class="section-title">Work orders</h2><div class="table-container"><table class="table" id="woTable"><thead><tr><th>Order</th><th>Product</th><th>Planned</th><th>Status</th><th>Output</th><th>Yield</th><th>Actions</th></tr></thead><tbody id="woBody"></tbody></table></div></div>' +
            '<div class="card"><h2 class="section-title">Bills of materials</h2><div id="bomList"></div></div></div>';
    };

    window.refreshProduction = function () {
        var body = document.getElementById('woBody'); if (!body) return;
        var os = Prod.orders(), done = os.filter(function (o) { return o.status === 'Completed'; });
        var avg = done.length ? Math.round(done.reduce(function (s, o) { return s + o.yield; }, 0) / done.length * 10) / 10 : 0;
        var k = document.getElementById('prodKpis');
        if (k) k.innerHTML = [['blue', 'bx-timer', os.filter(function (o) { return o.status === 'In Progress'; }).length, 'In progress'], ['orange', 'bx-calendar', os.filter(function (o) { return o.status === 'Planned'; }).length, 'Planned'],
            ['green', 'bx-check-circle', done.length, 'Completed'], ['blue', 'bx-pie-chart-alt', avg + '%', 'Average yield']].map(function (x) {
            return '<div class="card dashboard-widget"><div class="widget-icon ' + x[0] + '"><i class="bx ' + x[1] + '"></i></div><div class="widget-value">' + x[2] + '</div><div class="widget-title">' + x[3] + '</div></div>'; }).join('');
        var cls = { Planned: 'status-info', 'In Progress': 'status-warning', Completed: 'status-success', Cancelled: 'status-danger' };
        body.innerHTML = os.length ? os.map(function (o) {
            var p = prod(o.sku), id = esc(o.id), jid = escJs(o.id), b = 'style="padding:3px 8px;font-size:.75rem;"', a = '';
            if (o.status === 'Planned') a = '<button class="btn btn-primary" ' + b + ' onclick="prodStart(\'' + jid + '\')">Start</button> <button class="btn btn-outline" ' + b + ' onclick="prodCancel(\'' + jid + '\')">Cancel</button>';
            else if (o.status === 'In Progress') a = '<button class="btn btn-primary" ' + b + ' onclick="prodFinish(\'' + jid + '\')">Complete</button>';
            return '<tr><td><b style="font-family:monospace;">' + id + '</b></td><td>' + esc(p ? p.name : o.sku) + '</td><td>' + esc(o.qty) + '</td><td><span class="status ' + cls[o.status] + '">' + esc(o.status) + '</span></td>' +
                '<td>' + (o.status === 'Completed' ? esc(o.good) + ' good' + (o.rejected ? ' / ' + esc(o.rejected) + ' rejected' : '') : '–') + '</td><td>' + (o.status === 'Completed' ? esc(o.yield) + '%' : '–') + '</td><td style="white-space:nowrap;">' + a + '</td></tr>';
        }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:18px;">No work orders yet.</td></tr>';
        var bl = document.getElementById('bomList');
        if (bl) bl.innerHTML = Prod.boms().map(function (b) {
            var p = prod(b.sku);
            return '<div style="border:1px solid var(--border-color);border-radius:8px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;"><div><b>' + esc(p ? p.name : b.sku) + '</b> <span style="color:var(--text-muted);font-size:.8rem;">per ' + esc(b.batchSize) + ' units</span>' +
                '<div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;">' + b.components.map(function (c) { var q = prod(c.sku); return esc(c.qty) + ' ' + esc(q && q.unit || '') + ' ' + esc(q ? q.name : c.sku); }).join(' · ') + '</div></div>' +
                '<div><button class="btn btn-outline" style="padding:3px 8px;font-size:.75rem;" onclick="prodBomEdit(\'' + escJs(b.sku) + '\')">Edit</button> <button class="icon-btn" style="color:var(--danger-color);" onclick="prodBomDel(\'' + escJs(b.sku) + '\')"><i class="bx bx-trash"></i></button></div></div>';
        }).join('') || '<p style="color:var(--text-muted);">No BOMs yet.</p>';
    };

    function run(fn, ok) { try { var r = fn(); if (ok) showToast(ok, 'success'); window.refreshProduction(); return r; } catch (e) { showToast(e.message, 'danger'); } }
    window.prodStart = function (id) { if (confirm('Start ' + id + '? Raw materials and packaging will be deducted from stock now.')) run(function () { return Prod.start(id); }, id + ' started — materials consumed'); };
    window.prodCancel = function (id) { if (confirm('Cancel ' + id + '?')) run(function () { return Prod.cancel(id); }, id + ' cancelled'); };
    window.prodBomDel = function (sku) { if (confirm('Delete the BOM for ' + sku + '?')) run(function () { Prod.deleteBom(sku); }, 'BOM deleted'); };

    window.prodFinish = function (id) {
        var o = Prod.get(id);
        modal('<h2 style="margin-top:0;">Complete ' + esc(id) + '</h2><p style="color:var(--text-muted);">Planned: <b>' + esc(o.qty) + '</b>. Only good units are added to stock.</p>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><label style="font-size:.75rem;">Good units</label><input id="woGood" type="number" min="0" step="any" class="form-control" style="width:100%;" value="' + esc(o.qty) + '"></div>' +
            '<div><label style="font-size:.75rem;">Rejected units</label><input id="woRej" type="number" min="0" step="any" class="form-control" style="width:100%;" value="0"></div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeProdModal()">Cancel</button><button class="btn btn-primary" onclick="prodFinishGo(\'' + escJs(id) + '\')">Complete &amp; add to stock</button></div>');
    };
    window.prodFinishGo = function (id) {
        try { var o = Prod.complete(id, woGood.value, woRej.value); closeProdModal(); showToast(id + ' completed — yield ' + o.yield + '%', 'success'); window.refreshProduction(); }
        catch (e) { showToast(e.message, 'danger'); }
    };

    function reqTable(sku, qty) {
        try {
            var rq = Prod.requirements(sku, Number(qty) > 0 ? Number(qty) : 0);
            return '<table class="table"><thead><tr><th>Material</th><th>Needed</th><th>In stock</th><th></th></tr></thead><tbody>' + rq.map(function (r) {
                return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.need) + ' ' + esc(r.unit) + '</td><td>' + esc(r.have) + '</td><td style="color:var(--' + (r.short ? 'danger' : 'secondary') + '-color);font-weight:600;">' + (r.short ? 'Short ' + esc(r.short) : 'OK') + '</td></tr>'; }).join('') + '</tbody></table>';
        } catch (e) { return '<div style="color:var(--danger-color);font-size:.85rem;">' + esc(e.message) + ' Create a BOM first.</div>'; }
    }
    window.prodNewWO = function () {
        var withBom = Prod.boms().map(function (b) { return prod(b.sku); }).filter(Boolean);
        if (!withBom.length) return showToast('Create a BOM first', 'warning');
        modal('<h2 style="margin-top:0;">New work order</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">' +
            '<select id="woSku" class="form-control" onchange="prodWOPreview()">' + opts(withBom) + '</select><input id="woQty" type="number" min="1" class="form-control" value="100" oninput="prodWOPreview()" placeholder="Quantity"></div>' +
            '<input id="woNote" class="form-control" style="width:100%;margin-bottom:12px;" maxlength="200" placeholder="Note (optional)"><div id="woPreview"></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeProdModal()">Cancel</button><button class="btn btn-primary" onclick="prodWOCreate()">Create work order</button></div>');
        window.prodWOPreview();
    };
    window.prodWOPreview = function () { var e = document.getElementById('woPreview'); if (e) e.innerHTML = reqTable(woSku.value, woQty.value); };
    window.prodWOCreate = function () {
        try { var o = Prod.create(woSku.value, woQty.value, woNote.value); closeProdModal(); showToast(o.id + ' created', 'success'); window.refreshProduction(); } catch (e) { showToast(e.message, 'danger'); }
    };

    var bomDraft = null;
    window.prodBomEdit = function (sku) {
        var ex = sku ? Prod.bomFor(sku) : null;
        bomDraft = ex ? JSON.parse(JSON.stringify(ex)) : { sku: finished()[0] ? finished()[0].id : '', batchSize: 100, components: [] };
        modal('<h2 style="margin-top:0;">' + (ex ? 'Edit' : 'New') + ' bill of materials</h2><div style="display:grid;grid-template-columns:2fr 1fr;gap:12px;margin-bottom:12px;">' +
            '<select id="bomSku" class="form-control"' + (ex ? ' disabled' : '') + ' onchange="bomDraft_sku(this.value)">' + opts(finished(), bomDraft.sku) + '</select>' +
            '<input id="bomBatch" type="number" min="1" step="any" class="form-control" value="' + esc(bomDraft.batchSize) + '" oninput="bomDraft_batch(this.value)" placeholder="Batch size"></div>' +
            '<div style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px;">Quantities below are for one batch of the size above.</div><div id="bomRows"></div>' +
            '<button class="btn btn-outline" style="margin-top:8px;" onclick="bomAddRow()"><i class="bx bx-plus"></i> Add component</button>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeProdModal()">Cancel</button><button class="btn btn-primary" onclick="bomSave()">Save BOM</button></div>');
        paintBom();
    };
    function paintBom() {
        var cs = components();
        document.getElementById('bomRows').innerHTML = bomDraft.components.map(function (c, i) {
            return '<div style="display:grid;grid-template-columns:2fr 1fr auto;gap:8px;margin-bottom:6px;"><select class="form-control" onchange="bomRow(' + i + ',\'sku\',this.value)">' + opts(cs, c.sku) + '</select>' +
                '<input type="number" min="0" step="any" class="form-control" value="' + esc(c.qty) + '" oninput="bomRow(' + i + ',\'qty\',this.value)"><button class="icon-btn" style="color:var(--danger-color);" onclick="bomDel(' + i + ')"><i class="bx bx-trash"></i></button></div>';
        }).join('') || '<div style="color:var(--text-muted);font-size:.85rem;">No components yet.</div>';
    }
    window.bomDraft_sku = function (v) { bomDraft.sku = v; };
    window.bomDraft_batch = function (v) { bomDraft.batchSize = v; };
    window.bomRow = function (i, f, v) { bomDraft.components[i][f] = v; };
    window.bomDel = function (i) { bomDraft.components.splice(i, 1); paintBom(); };
    window.bomAddRow = function () { var cs = components(); if (!cs.length) return showToast('No raw material or packaging products exist', 'warning'); bomDraft.components.push({ sku: cs[0].id, qty: 1 }); paintBom(); };
    window.bomSave = function () { try { Prod.saveBom(bomDraft); closeProdModal(); showToast('BOM saved', 'success'); window.refreshProduction(); } catch (e) { showToast(e.message, 'danger'); } };

    document.addEventListener('DOMContentLoaded', function () { if (typeof DataManager !== 'undefined') migrate(); });
})();
