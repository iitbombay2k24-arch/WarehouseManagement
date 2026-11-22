// Purchasing: suppliers, purchase orders (draft → approved → received), partial
// receiving straight into the stock ledger, reorder suggestions and price comparison.
(function () {
    'use strict';
    var KEY = 'wms_purchase_orders', SEQ = 'wms_po_seq', MIG = 'wms_migr_po_v1';
    var esc = window.escapeHtml;
    var GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    var GST_RATES = [0, 5, 12, 18, 28], TOL = 1.05;
    var CLOSED = /^(Received|Cancelled|Rejected|Delivered)/;
    var CATEGORIES = ['Raw Materials', 'Packaging', 'Edible Oils', 'Spices', 'Other'];

    function rd() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function wr(l) { localStorage.setItem(KEY, JSON.stringify(l)); }
    function actor() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.username : 'system'; }
    function role() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.role : ''; }
    function today() { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function addDays(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
    function fyOf(iso) { var d = new Date(iso + 'T00:00:00'), y = d.getFullYear(); if (d.getMonth() < 3) y--; return y + '-' + String(y + 1).slice(2); }
    function P(r) { return Math.round((Number(r) || 0) * 100); }
    function inr(p) { return '₹' + (p / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function fmt(iso) { var t = Date.parse(iso); return isNaN(t) ? esc(iso || '') : new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    function prod(id) { return DataManager.getProducts().filter(function (p) { return p.id === id; })[0]; }
    function supplier(id) { return DataManager.getSuppliers().filter(function (s) { return s.id === id; })[0]; }

    // ---- totals (CGST/SGST vs IGST by supplier and company state) ----
    function totals(po) {
        var co = (DataManager.getCompanyProfile() || {}).gst || '', sup = (supplier(po.supplierId) || {}).gstin || '';
        var inter = GSTIN_RE.test(co) && GSTIN_RE.test(sup) && co.slice(0, 2) !== sup.slice(0, 2);
        var t = { taxable: 0, tax: 0, total: 0, inter: inter };
        (po.lines || []).forEach(function (l) { var tx = Math.round(Number(l.qty) * P(l.rate)); t.taxable += tx; t.tax += Math.round(tx * (Number(l.gst) || 0) / 100); });
        t.total = t.taxable + t.tax; return t;
    }
    function legacyTotal(po) { return P(String(po.value || po.total || '0').replace(/[^\d.]/g, '')); }
    function poTotal(po) { return po.lines && po.lines.length ? totals(po).total : legacyTotal(po); }

    // ---- one-time migration of the old demo POs to the new structure ----
    function migrate() {
        if (localStorage.getItem(MIG)) return;
        var l = rd().map(function (po) {
            if (po.lines) return po;
            var d = Date.parse(po.date), e = Date.parse(po.expected);
            var st = /^Delivered/.test(po.status) ? 'Received' : (/Draft/.test(po.status) ? 'Draft' : 'Approved');
            return { id: po.id, legacy: true, supplier: po.supplier, supplierId: ((DataManager.getSuppliers().filter(function (s) { return s.name === po.supplier; })[0]) || {}).id || '',
                date: isNaN(d) ? today() : new Date(d).toISOString().slice(0, 10), expected: isNaN(e) ? addDays(today(), 7) : new Date(e).toISOString().slice(0, 10),
                status: st, lines: [], receipts: [], value: po.value, notes: 'Imported demo order' };
        });
        wr(l); localStorage.setItem(MIG, '1');
    }

    function validate(po) {
        if (!supplier(po.supplierId)) throw new Error('Choose a supplier.');
        if (!po.lines.length) throw new Error('Add at least one line.');
        var seen = {};
        po.lines.forEach(function (l, i) {
            var n = 'Line ' + (i + 1) + ': ';
            if (!prod(l.sku)) throw new Error(n + 'choose a product.');
            if (seen[l.sku]) throw new Error(n + 'duplicate product ' + l.sku + '.'); seen[l.sku] = 1;
            if (!(Number(l.qty) > 0) || Number(l.qty) > 1e7) throw new Error(n + 'quantity must be greater than 0.');
            if (!(Number(l.rate) >= 0)) throw new Error(n + 'rate is invalid.');
            if (GST_RATES.indexOf(Number(l.gst)) < 0) throw new Error(n + 'GST must be one of ' + GST_RATES.join(', ') + '%.');
        });
        if (!/^\d{4}-\d{2}-\d{2}$/.test(po.date) || !/^\d{4}-\d{2}-\d{2}$/.test(po.expected)) throw new Error('Enter valid dates.');
        if (po.expected < po.date) throw new Error('Expected delivery cannot be before the order date.');
    }

    var S = {
        list: rd, totals: totals, total: poTotal, CLOSED: CLOSED, isOpen: function (po) { return !CLOSED.test(po.status); },
        get: function (id) { return rd().filter(function (p) { return p.id === id; })[0]; },
        save: function (po) {
            validate(po);
            var l = rd(), i = l.findIndex(function (p) { return p.id === po.id; });
            if (i > -1) { if (l[i].status !== 'Draft') throw new Error('Only drafts can be edited.'); l[i] = po; }
            else { l.unshift(po); }
            wr(l); return po;
        },
        newId: function (dateIso) {
            var seq = {}; try { seq = JSON.parse(localStorage.getItem(SEQ)) || {}; } catch (e) {}
            var fy = fyOf(dateIso); seq[fy] = (seq[fy] || 0) + 1; localStorage.setItem(SEQ, JSON.stringify(seq));
            return 'PO/' + fy + '/' + String(seq[fy]).padStart(4, '0');
        },
        _set: function (id, fn) { var l = rd(), po = l.filter(function (p) { return p.id === id; })[0]; if (!po) throw new Error('PO not found.'); fn(po); wr(l); return po; },
        approve: function (id) {
            var po = S.get(id); if (!po || po.status !== 'Draft') throw new Error('Only drafts can be approved.');
            if (role() !== 'admin' && role() !== 'manager') throw new Error('Only a manager or admin can approve purchase orders.');
            validate(po);
            var o = S._set(id, function (p) { p.status = 'Approved'; p.approvedBy = actor(); p.approvedAt = new Date().toISOString(); });
            DataManager.logAction('PO Approved', id + ' to ' + o.supplier + ' for ' + inr(poTotal(o))); return o;
        },
        reject: function (id, reason) {
            var po = S.get(id); if (!po || po.status !== 'Draft') throw new Error('Only drafts can be rejected.');
            if (!String(reason || '').trim()) throw new Error('A reason is required.');
            S._set(id, function (p) { p.status = 'Rejected'; p.reason = String(reason).slice(0, 200); });
            DataManager.logAction('PO Rejected', id + ': ' + reason);
        },
        cancel: function (id, reason) {
            var po = S.get(id); if (!po || (po.status !== 'Approved' && po.status !== 'Partially Received')) throw new Error('This order cannot be cancelled.');
            if ((po.receipts || []).length) throw new Error('Goods were already received against this order; close it by receiving the rest.');
            if (!String(reason || '').trim()) throw new Error('A reason is required.');
            S._set(id, function (p) { p.status = 'Cancelled'; p.reason = String(reason).slice(0, 200); }); DataManager.logAction('PO Cancelled', id + ': ' + reason);
        },
        remove: function (id) { var po = S.get(id); if (!po) return; if (po.status !== 'Draft') throw new Error('Only drafts can be deleted.'); wr(rd().filter(function (p) { return p.id !== id; })); },

        // lines: [{sku, qty (accepted), rejected}]
        receive: function (id, lines, note) {
            var po = S.get(id);
            if (!po || (po.status !== 'Approved' && po.status !== 'Partially Received')) throw new Error('Only approved orders can be received.');
            var acts = [], rej = 0;
            lines.forEach(function (x) {
                var q = Number(x.qty) || 0, r = Number(x.rejected) || 0; if (q < 0 || r < 0) throw new Error('Quantities cannot be negative.');
                if (!q && !r) return;
                var ln = po.lines.filter(function (l) { return l.sku === x.sku; })[0]; if (!ln) throw new Error(x.sku + ' is not on this order.');
                var out = Number(ln.qty) - Number(ln.received || 0);
                if (q + r > out * TOL + 1e-9) throw new Error(x.sku + ': only ' + Math.max(0, out) + ' outstanding (5% over-delivery tolerance).');
                acts.push({ sku: x.sku, q: q, r: r }); rej += r;
            });
            if (!acts.length) throw new Error('Enter a quantity to receive.');
            var grns = DataManager.getReceiving(), n = grns.reduce(function (m, g) { var k = parseInt(String(g.id).split('-').pop(), 10); return isNaN(k) ? m : Math.max(m, k); }, 0) + 1;
            var grn = 'GRN-' + new Date().getFullYear() + '-' + String(n).padStart(3, '0');
            acts.forEach(function (a) { if (a.q > 0) StockLedger.post({ sku: a.sku, type: 'RECEIPT', qty: a.q, ref: grn, note: 'Received against ' + id + ' from ' + po.supplier, idempotent: true }); });
            DataManager.addReceiving({ id: grn, supplier: po.supplier, date: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), items: acts.length, poId: id, status: 'Put Away', statusClass: 'status-info' });
            var o = S._set(id, function (p) {
                acts.forEach(function (a) { var ln = p.lines.filter(function (l) { return l.sku === a.sku; })[0]; ln.received = (Number(ln.received) || 0) + a.q + a.r; ln.rejected = (Number(ln.rejected) || 0) + a.r; });
                p.receipts = (p.receipts || []).concat([{ grn: grn, date: today(), by: actor(), note: String(note || '').slice(0, 200), lines: acts.map(function (a) { return { sku: a.sku, qty: a.q, rejected: a.r }; }) }]);
                var done = p.lines.every(function (l) { return Number(l.received) >= Number(l.qty) - 1e-9; });
                p.status = done ? 'Received' : 'Partially Received'; if (done) p.receivedAt = today();
            });
            DataManager.logAction('PO Received', grn + ' against ' + id + (rej ? ' (' + rej + ' units rejected)' : '')); return { po: o, grn: grn };
        },

        // ---- supplier metrics from real receipts; falls back to the stored baseline ----
        stats: function (supId) {
            var s = supplier(supId) || {}, pos = rd().filter(function (p) { return p.supplierId === supId && !p.legacy; }), rc = 0, ot = 0, acc = 0, rej = 0, lead = 0, spend = 0, pvN = 0, pvD = 0, open = 0;
            pos.forEach(function (p) {
                if (p.status !== 'Draft' && p.status !== 'Rejected' && p.status !== 'Cancelled') spend += poTotal(p);
                if (S.isOpen(p) && p.status !== 'Draft') open++;
                (p.receipts || []).forEach(function (r) { rc++; if (r.date <= p.expected) ot++; lead += Math.max(0, (Date.parse(r.date) - Date.parse(p.date)) / 864e5); r.lines.forEach(function (l) { acc += l.qty; rej += l.rejected; }); });
                (p.lines || []).forEach(function (l) { var pr = prod(l.sku); if (pr && Number(pr.price) > 0) { var w = Number(l.qty) * Number(pr.price); pvN += (Number(l.rate) - Number(pr.price)) / Number(pr.price) * w; pvD += w; } });
            });
            var real = rc > 0;
            var m = { real: real, receipts: rc, orders: pos.length, open: open, spend: spend, leadDays: real ? Math.round(lead / rc * 10) / 10 : (Number(s.leadDays) || null),
                onTime: real ? Math.round(ot / rc * 1000) / 10 : Number(s.onTimeRate) || 0, defect: real && acc + rej > 0 ? Math.round(rej / (acc + rej) * 1000) / 10 : Number(s.defectRate) || 0,
                priceVar: pvD > 0 ? Math.round(pvN / pvD * 1000) / 10 : Number(s.priceVariance) || 0, rating: Number(s.rating) || 3 };
            m.score = Math.max(0, Math.min(100, Math.round(m.rating / 5 * 30 + m.onTime / 100 * 40 + Math.max(0, (5 - m.defect) / 5) * 30))); return m;
        },
        // Low-stock items worth reordering, with a suggested quantity (refill to 2× minimum).
        suggestions: function () {
            var open = {}; rd().forEach(function (p) { if (S.isOpen(p) && p.status !== 'Draft') (p.lines || []).forEach(function (l) { open[l.sku] = (open[l.sku] || 0) + Math.max(0, Number(l.qty) - Number(l.received || 0)); }); });
            return DataManager.getProducts().filter(function (p) { return /^(Raw Material|Packaging)$/.test(p.category); }).map(function (p) {
                var min = Number(p.minStock) || 0, st = Number(p.stock) || 0, inc = open[p.id] || 0;
                return { sku: p.id, name: p.name, unit: p.unit || '', stock: st, min: min, incoming: inc, qty: Math.max(0, Math.ceil(min * 2 - st - inc)), price: Number(p.price) || 0 };
            }).filter(function (x) { return x.min > 0 && x.stock + x.incoming < x.min && x.qty > 0; });
        },
        priceHistory: function (sku) {
            var by = {};
            rd().forEach(function (p) { if (p.status === 'Draft' || p.status === 'Rejected') return; (p.lines || []).forEach(function (l) { if (l.sku !== sku) return; var key = p.supplierId || p.supplier, r = by[key] || (by[key] = { name: p.supplier, rates: [], last: 0, lastDate: '' }); r.rates.push(Number(l.rate)); if (p.date >= r.lastDate) { r.lastDate = p.date; r.last = Number(l.rate); } }); });
            return Object.keys(by).map(function (k) { return by[k]; });
        },
        // ---- suppliers ----
        saveSupplier: function (s) {
            s.name = String(s.name || '').trim(); if (!s.name) throw new Error('Supplier name is required.');
            if (s.gstin && !GSTIN_RE.test(s.gstin)) throw new Error('GSTIN is not valid.');
            if (s.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email)) throw new Error('Email is not valid.');
            if (s.phone && !/^[0-9+\-\s()]{6,20}$/.test(s.phone)) throw new Error('Phone is not valid.');
            var all = DataManager.getSuppliers();
            if (all.some(function (x) { return x.id !== s.id && x.name.toLowerCase() === s.name.toLowerCase(); })) throw new Error('A supplier with this name already exists.');
            if (all.some(function (x) { return x.id === s.id; })) DataManager.updateSupplier(s.id, s);
            else { s.id = 'SUP-' + String(all.reduce(function (m, x) { return Math.max(m, parseInt(String(x.id).replace(/\D/g, ''), 10) || 0); }, 0) + 1).padStart(3, '0'); DataManager.addSupplier(s); }
            return s;
        },
        removeSupplier: function (id) {
            if (rd().some(function (p) { return p.supplierId === id && S.isOpen(p); })) throw new Error('This supplier has open purchase orders.');
            DataManager.deleteSupplier(id);
        }
    };
    window.PurchaseStore = S;

    // ---- shared modal ----
    function modal(html, w) {
        closePurModal();
        var o = document.createElement('div'); o.id = 'purModal';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;';
        o.innerHTML = '<div role="dialog" aria-modal="true" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;width:min(' + (w || 760) + 'px,100%);padding:22px;">' + html + '</div>';
        o.addEventListener('mousedown', function (e) { if (e.target === o) closePurModal(); });
        document.body.appendChild(o);
    }
    window.closePurModal = function () { var m = document.getElementById('purModal'); if (m) m.remove(); };
    var closePurModal = window.closePurModal;
    function err(e) { showToast(e.message, 'danger'); }
    function field(label, inner) { return '<div><label style="font-size:.75rem;">' + label + '</label>' + inner + '</div>'; }
    function inp(id, val, extra) { return '<input id="' + id + '" class="form-control" style="width:100%;" value="' + esc(val == null ? '' : val) + '" ' + (extra || '') + '>'; }

    // ---- supplier editor ----
    window.supplierEdit = function (id) {
        var s = id ? supplier(id) : { name: '', category: 'Raw Materials', contact: '', phone: '', email: '', gstin: '', address: '', paymentTerms: 30, leadDays: 5, rating: 3 };
        modal('<h2 style="margin-top:0;">' + (id ? 'Edit' : 'Add') + ' supplier</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">' +
            field('Name', inp('supName', s.name, 'maxlength="80"')) +
            field('Category', '<select id="supCat" class="form-control" style="width:100%;">' + CATEGORIES.map(function (c) { return '<option' + (c === s.category ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select>') +
            field('Contact person', inp('supContact', s.contact, 'maxlength="60"')) + field('Phone', inp('supPhone', s.phone, 'maxlength="20"')) + field('Email', inp('supEmail', s.email, 'maxlength="80"')) +
            field('GSTIN', inp('supGst', s.gstin, 'maxlength="15" style="width:100%;text-transform:uppercase;"')) + field('Payment terms (days)', inp('supTerms', s.paymentTerms, 'type="number" min="0"')) +
            field('Usual lead time (days)', inp('supLead', s.leadDays, 'type="number" min="0"')) + field('Quality rating (1–5)', inp('supRating', s.rating, 'type="number" min="1" max="5"')) +
            '<div style="grid-column:1/-1;">' + field('Address', inp('supAddr', s.address, 'maxlength="160"')) + '</div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closePurModal()">Cancel</button><button class="btn btn-primary" onclick="supplierSave(\'' + escJs(id || '') + '\')">Save supplier</button></div>');
    };
    window.supplierSave = function (id) {
        try {
            var old = id ? supplier(id) : {};
            var r = Math.round(Number(supRating.value)); if (!(r >= 1 && r <= 5)) throw new Error('Rating must be 1 to 5.');
            var t = Number(supTerms.value), l = Number(supLead.value); if (!(t >= 0 && t <= 365) || !(l >= 0 && l <= 365)) throw new Error('Terms and lead time must be 0 to 365 days.');
            S.saveSupplier(Object.assign({}, old, { id: id || '', name: supName.value, category: supCat.value, contact: supContact.value.trim(), phone: supPhone.value.trim(), email: supEmail.value.trim(), gstin: supGst.value.trim().toUpperCase(),
                address: supAddr.value.trim(), paymentTerms: t, leadDays: l, rating: r, onTimeRate: old.onTimeRate != null ? old.onTimeRate : 85, defectRate: old.defectRate != null ? old.defectRate : 2, priceVariance: old.priceVariance || 0, totalOrders: old.totalOrders || 0 }));
            closePurModal(); showToast('Supplier saved', 'success'); refreshAll();
        } catch (e) { err(e); }
    };
    window.supplierDelete = function (id) { if (!confirm('Delete this supplier?')) return; try { S.removeSupplier(id); showToast('Supplier deleted', 'warning'); refreshAll(); } catch (e) { err(e); } };

    // ---- PO editor ----
    var cur = null;
    function lineRow(l, i) {
        var prods = DataManager.getProducts();
        var sel = '<select class="form-control" style="width:100%;" onchange="poPick(' + i + ',this.value)"><option value="">Choose…</option>' + prods.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === l.sku ? ' selected' : '') + '>' + esc(p.id) + ' — ' + esc(p.name) + '</option>'; }).join('') + '</select>';
        function n(f, w, st) { return '<input class="form-control" style="width:' + w + ';" type="number" min="0" step="' + (st || 'any') + '" value="' + esc(l[f]) + '" oninput="poSet(' + i + ',\'' + f + '\',this.value)">'; }
        var g = '<select class="form-control" onchange="poSet(' + i + ',\'gst\',this.value)">' + GST_RATES.map(function (r) { return '<option' + (Number(l.gst) === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>';
        return '<tr><td style="min-width:200px;">' + sel + '</td><td>' + n('qty', '90px') + '</td><td>' + n('rate', '100px', '0.01') + '</td><td>' + g + '</td><td id="poLT' + i + '" style="text-align:right;white-space:nowrap;"></td>' +
            '<td><button class="icon-btn" style="color:var(--danger-color);" onclick="poDel(' + i + ')"><i class="bx bx-trash"></i></button></td></tr>';
    }
    function paint() {
        var tb = document.getElementById('poLines'); if (!tb) return;
        tb.innerHTML = cur.lines.map(lineRow).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:12px;">No lines yet.</td></tr>'; paintTot();
    }
    function paintTot() {
        cur.lines.forEach(function (l, i) { var e = document.getElementById('poLT' + i); if (e) e.textContent = inr(Math.round(Number(l.qty) * P(l.rate))); });
        var t = totals(cur), e = document.getElementById('poTotals');
        if (e) e.innerHTML = '<div>Taxable: <b>' + inr(t.taxable) + '</b></div><div>GST (' + (t.inter ? 'IGST' : 'CGST+SGST') + '): <b>' + inr(t.tax) + '</b></div><div style="font-size:1.05rem;margin-top:4px;">Total: <b>' + inr(t.total) + '</b></div>';
    }
    window.poSet = function (i, f, v) { cur.lines[i][f] = v; paintTot(); };
    window.poPick = function (i, sku) { var p = prod(sku); if (!p) return; cur.lines[i].sku = sku; cur.lines[i].rate = Number(p.price) || 0; paint(); };
    window.poAdd = function () { cur.lines.push({ sku: '', qty: 1, rate: 0, gst: 12, received: 0 }); paint(); };
    window.poDel = function (i) { cur.lines.splice(i, 1); paint(); };
    window.poSup = function (id) { cur.supplierId = id; var s = supplier(id) || {}; cur.supplier = s.name || ''; if (s.leadDays != null) { cur.expected = addDays(cur.date, Number(s.leadDays) || 0); var e = document.getElementById('poExp'); if (e) e.value = cur.expected; } paintTot(); };
    window.poField = function (f, v) { cur[f] = v; };

    function poEditor(po) {
        cur = JSON.parse(JSON.stringify(po)); var sups = DataManager.getSuppliers();
        if (!sups.length) return showToast('Add a supplier first', 'warning');
        modal('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 style="margin:0;">' + (S.get(cur.id) ? 'Edit ' + esc(cur.id) : 'New purchase order') + '</h2><button class="icon-btn" onclick="closePurModal()" aria-label="Close"><i class="bx bx-x" style="font-size:1.5rem;"></i></button></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:12px;">' +
            field('Supplier', '<select class="form-control" style="width:100%;" onchange="poSup(this.value)"><option value="">Select…</option>' + sups.map(function (s) { return '<option value="' + esc(s.id) + '"' + (s.id === cur.supplierId ? ' selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select>') +
            field('Order date', '<input type="date" class="form-control" style="width:100%;" value="' + esc(cur.date) + '" onchange="poField(\'date\',this.value)">') +
            field('Expected delivery', '<input id="poExp" type="date" class="form-control" style="width:100%;" value="' + esc(cur.expected) + '" onchange="poField(\'expected\',this.value)">') + '</div>' +
            '<div style="overflow-x:auto;"><table class="table" style="min-width:560px;"><thead><tr><th>Product</th><th>Qty</th><th>Rate ₹</th><th>GST %</th><th>Amount</th><th></th></tr></thead><tbody id="poLines"></tbody></table></div>' +
            '<button class="btn btn-outline" style="margin:8px 0;" onclick="poAdd()"><i class="bx bx-plus"></i> Add line</button>' +
            '<div style="display:flex;gap:16px;justify-content:space-between;flex-wrap:wrap;align-items:flex-start;"><div style="flex:1;min-width:220px;">' + field('Notes to supplier', '<textarea class="form-control" style="width:100%;" rows="2" maxlength="300" oninput="poField(\'notes\',this.value)">' + esc(cur.notes) + '</textarea>') + '</div><div id="poTotals" style="min-width:220px;font-size:.9rem;"></div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closePurModal()">Cancel</button><button class="btn btn-primary" onclick="poSave()">Save as draft</button></div>');
        paint();
    }
    window.poSave = function () {
        try {
            cur.lines.forEach(function (l) { l.qty = Number(l.qty); l.rate = Number(l.rate); l.gst = Number(l.gst); });
            if (!S.get(cur.id)) cur.id = S.newId(cur.date);
            S.save(cur); closePurModal(); showToast(cur.id + ' saved as draft', 'success'); refreshAll();
        } catch (e) { err(e); }
    };
    function blankPO(lines, supplierId) {
        var d = today(), s = supplier(supplierId) || {};
        return { id: 'DRAFT-' + Date.now(), supplierId: supplierId || '', supplier: s.name || '', date: d, expected: addDays(d, Number(s.leadDays) || 7), status: 'Draft', lines: lines || [], receipts: [], notes: '', createdBy: actor() };
    }
    window.poNew = function () { poEditor(blankPO()); };
    window.poEdit = function (id) { var p = S.get(id); if (p && p.status === 'Draft') poEditor(p); };
    window.poFromSuggestions = function () {
        var sg = S.suggestions(); if (!sg.length) return;
        modal('<h2 style="margin-top:0;">Create PO from reorder suggestions</h2><label style="font-size:.75rem;">Supplier</label><select id="sgSup" class="form-control" style="width:100%;margin-bottom:12px;">' + DataManager.getSuppliers().map(function (s) { return '<option value="' + esc(s.id) + '">' + esc(s.name) + ' (' + esc(s.category) + ')</option>'; }).join('') + '</select>' +
            sg.map(function (x, i) { return '<label style="display:flex;gap:8px;padding:4px 0;"><input type="checkbox" class="sgChk" value="' + i + '" checked> ' + esc(x.name) + ' — order <b>' + esc(x.qty) + ' ' + esc(x.unit) + '</b></label>'; }).join('') +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closePurModal()">Cancel</button><button class="btn btn-primary" onclick="poFromSuggestionsGo()">Continue</button></div>');
    };
    window.poFromSuggestionsGo = function () {
        var sg = S.suggestions(), picked = [].slice.call(document.querySelectorAll('.sgChk:checked')).map(function (c) { return sg[Number(c.value)]; });
        if (!picked.length) return showToast('Select at least one item', 'warning');
        poEditor(blankPO(picked.map(function (x) { return { sku: x.sku, qty: x.qty, rate: x.price, gst: 12, received: 0 }; }), sgSup.value));
    };

    // ---- receive modal ----
    window.poReceive = function (id) {
        var po = S.get(id); if (!po || !po.lines.length) return showToast('This imported demo order has no lines to receive.', 'warning');
        modal('<h2 style="margin-top:0;">Receive goods — ' + esc(id) + '</h2><p style="color:var(--text-muted);margin-top:0;">' + esc(po.supplier) + '. Accepted units are added to stock immediately; rejected units are recorded against the supplier.</p>' +
            '<table class="table"><thead><tr><th>Product</th><th>Ordered</th><th>Received</th><th>Outstanding</th><th>Accept now</th><th>Reject</th></tr></thead><tbody>' + po.lines.map(function (l, i) {
                var out = Math.max(0, Number(l.qty) - Number(l.received || 0)), p = prod(l.sku);
                return '<tr><td>' + esc(p ? p.name : l.sku) + '</td><td>' + esc(l.qty) + '</td><td>' + esc(l.received || 0) + '</td><td>' + esc(out) + '</td><td><input class="form-control rcvQ" data-sku="' + esc(l.sku) + '" type="number" min="0" step="any" value="' + esc(out) + '" style="width:90px;"></td><td><input class="form-control rcvR" data-sku="' + esc(l.sku) + '" type="number" min="0" step="any" value="0" style="width:80px;"></td></tr>'; }).join('') + '</tbody></table>' +
            '<input id="rcvNote" class="form-control" style="width:100%;margin-top:10px;" maxlength="200" placeholder="Delivery note / challan no. (optional)">' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closePurModal()">Cancel</button><button class="btn btn-primary" onclick="poReceiveGo(\'' + escJs(id) + '\')">Confirm receipt</button></div>', 820);
    };
    window.poReceiveGo = function (id) {
        try {
            var rej = {}; [].forEach.call(document.querySelectorAll('.rcvR'), function (e) { rej[e.dataset.sku] = e.value; });
            var lines = [].map.call(document.querySelectorAll('.rcvQ'), function (e) { return { sku: e.dataset.sku, qty: e.value, rejected: rej[e.dataset.sku] }; });
            var r = S.receive(id, lines, rcvNote.value); closePurModal(); showToast(r.grn + ' booked — ' + r.po.status, 'success'); refreshAll();
        } catch (e) { err(e); }
    };

    // ---- actions ----
    window.poApprove = function (id) { if (confirm('Approve ' + id + '?')) try { S.approve(id); showToast(id + ' approved', 'success'); refreshAll(); } catch (e) { err(e); } };
    window.poReject = function (id) { var r = prompt('Reason for rejecting ' + id + ':'); if (r === null) return; try { S.reject(id, r); showToast(id + ' rejected', 'warning'); refreshAll(); } catch (e) { err(e); } };
    window.poCancel = function (id) { var r = prompt('Reason for cancelling ' + id + ':'); if (r === null) return; try { S.cancel(id, r); showToast(id + ' cancelled', 'warning'); refreshAll(); } catch (e) { err(e); } };
    window.poDelete = function (id) { if (confirm('Delete draft ' + id + '?')) try { S.remove(id); refreshAll(); } catch (e) { err(e); } };
    window.deletePurchaseOrder = window.poDelete;

    // ---- print PO ----
    function printHtml(po) {
        var co = DataManager.getCompanyProfile() || {}, s = supplier(po.supplierId) || { name: po.supplier }, t = totals(po);
        var rows = po.lines.map(function (l, i) { var p = prod(l.sku), tx = Math.round(Number(l.qty) * P(l.rate)); return '<tr><td>' + (i + 1) + '</td><td>' + esc(p ? p.name : l.sku) + '</td><td style="text-align:right">' + esc(l.qty) + ' ' + esc(p && p.unit || '') + '</td><td style="text-align:right">' + esc(Number(l.rate).toFixed(2)) + '</td><td style="text-align:right">' + esc(l.gst) + '%</td><td style="text-align:right">' + inr(tx) + '</td></tr>'; }).join('');
        return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(po.id) + '</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;font-size:12px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:5px 6px;text-align:left}th{background:#f0f0f0}.f{display:flex;gap:12px}.f>div{flex:1}.b{border:1px solid #999;padding:8px;margin-bottom:10px}h1{font-size:20px;margin:0}</style></head><body>' +
            '<div class="f b"><div><h1>' + esc(co.name) + '</h1><div>' + esc(co.address) + '</div><div>GSTIN: <b>' + esc(co.gst) + '</b></div></div><div style="text-align:right"><h1>PURCHASE ORDER</h1><div>No: <b>' + esc(po.id) + '</b></div><div>Date: ' + fmt(po.date) + '</div><div>Expected: ' + fmt(po.expected) + '</div>' + (po.status === 'Draft' ? '<div style="color:#b00"><b>DRAFT – not approved</b></div>' : '') + '</div></div>' +
            '<div class="b"><b>Supplier</b><div style="font-size:14px;font-weight:700;">' + esc(s.name) + '</div><div>' + esc(s.address || '') + '</div><div>GSTIN: ' + esc(s.gstin || '–') + ' · ' + esc(s.contact || '') + ' ' + esc(s.phone || '') + '</div>' + (s.paymentTerms != null ? '<div>Payment terms: ' + esc(s.paymentTerms) + ' days</div>' : '') + '</div>' +
            '<table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>GST</th><th>Amount</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div style="text-align:right;margin-top:10px;line-height:1.6">Taxable: ' + inr(t.taxable) + '<br>GST (' + (t.inter ? 'IGST' : 'CGST+SGST') + '): ' + inr(t.tax) + '<br><b style="font-size:14px">Total: ' + inr(t.total) + '</b></div>' +
            (po.notes ? '<div class="b" style="margin-top:12px"><b>Notes</b><div>' + esc(po.notes) + '</div></div>' : '') + '<div style="margin-top:50px;text-align:right">For ' + esc(co.name) + '<br><b>Authorised Signatory</b></div></body></html>';
    }
    window.poPrint = function (id) {
        var po = S.get(id); if (!po || !po.lines.length) return showToast('Imported demo orders have no printable lines', 'warning');
        var old = document.getElementById('poPrintFrame'); if (old) old.remove();
        var f = document.createElement('iframe'); f.id = 'poPrintFrame'; f.setAttribute('sandbox', 'allow-modals allow-same-origin'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        f.srcdoc = printHtml(po); f.onload = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { showToast('Could not open the print dialog', 'danger'); } }; document.body.appendChild(f);
    };
    window.showPOPreview = window.poPrint;

    // ---- price comparison ----
    window.showPriceComparison = function () {
        var items = DataManager.getProducts().filter(function (p) { return /^(Raw Material|Packaging)$/.test(p.category); });
        modal('<h2 style="margin-top:0;">Supplier price comparison</h2><select id="pcSku" class="form-control" style="width:100%;margin-bottom:12px;" onchange="pcShow()">' + items.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('') + '</select><div id="pcOut"></div>' +
            '<div style="text-align:right;margin-top:12px;"><button class="btn btn-outline" onclick="closePurModal()">Close</button></div>'); window.pcShow();
    };
    window.pcShow = function () {
        var h = S.priceHistory(pcSku.value).sort(function (a, b) { return a.last - b.last; });
        document.getElementById('pcOut').innerHTML = h.length ? '<table class="table"><thead><tr><th>Supplier</th><th>Last rate</th><th>Average</th><th>Last ordered</th><th>Orders</th></tr></thead><tbody>' + h.map(function (v, i) {
            return '<tr><td>' + esc(v.name) + (i === 0 ? ' <span class="status status-success">Lowest</span>' : '') + '</td><td>' + inr(P(v.last)) + '</td><td>' + inr(P(v.rates.reduce(function (a, b) { return a + b; }, 0) / v.rates.length)) + '</td><td>' + fmt(v.lastDate) + '</td><td>' + v.rates.length + '</td></tr>'; }).join('') + '</tbody></table>' :
            '<p style="color:var(--text-muted);">No purchase history for this item yet.</p>';
    };

    // ---- page ----
    var filter = '';
    window.renderPurchase = function () {
        setTimeout(refreshAll, 40);
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:10px;flex-wrap:wrap;"><h1 class="page-title" style="margin:0;"><i class="bx bx-cart" style="color:var(--primary-color);"></i> Purchasing &amp; Suppliers</h1>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;"><button class="btn btn-outline" onclick="showPriceComparison()"><i class="bx bx-line-chart"></i> Compare prices</button><button class="btn btn-outline" onclick="supplierEdit()"><i class="bx bx-user-plus"></i> Add supplier</button><button class="btn btn-primary" onclick="poNew()"><i class="bx bx-file-blank"></i> New PO</button></div></div>' +
            '<div class="dashboard-grid" id="purKpis"></div><div id="purSuggest"></div>' +
            '<div class="card" style="margin-bottom:20px;"><div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;"><h2 class="section-title" style="margin:0;">Purchase orders</h2><select class="form-control" style="max-width:200px;margin-left:auto;" onchange="poFilter(this.value)"><option value="">All statuses</option>' +
            ['Draft', 'Approved', 'Partially Received', 'Received', 'Rejected', 'Cancelled'].map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div><div class="table-container"><table class="table" id="poTable"><thead><tr><th>PO</th><th>Supplier</th><th>Ordered</th><th>Expected</th><th>Status</th><th>Value</th><th>Actions</th></tr></thead><tbody id="purchaseTableBody"></tbody></table></div></div>' +
            '<div class="card"><h2 class="section-title">Suppliers</h2><div class="table-container"><table class="table" id="supTable"><thead><tr><th>Supplier</th><th>Category</th><th>Contact</th><th>Terms</th><th>Open POs</th><th>Spend</th><th>Score</th><th></th></tr></thead><tbody id="supplierBody"></tbody></table></div></div></div>';
    };
    window.poFilter = function (v) { filter = v; refreshAll(); };

    function refreshAll() {
        var body = document.getElementById('purchaseTableBody'); if (!body) return;
        var pos = rd(), now = Date.now(), sups = DataManager.getSuppliers();
        var open = pos.filter(function (p) { return S.isOpen(p) && p.status !== 'Draft'; }), over = open.filter(function (p) { var e = Date.parse(p.expected); return !isNaN(e) && now > e + 864e5; });
        var k = document.getElementById('purKpis');
        if (k) k.innerHTML = [['blue', 'bx-time', open.length, 'Open purchase orders'], ['orange', 'bx-edit', pos.filter(function (p) { return p.status === 'Draft'; }).length, 'Awaiting approval'], ['red', 'bx-alarm-exclamation', over.length, 'Overdue deliveries'],
            ['green', 'bx-rupee', inr(open.reduce(function (t, p) { return t + poTotal(p); }, 0)), 'Open order value'], ['blue', 'bx-group', sups.length, 'Suppliers']].map(function (x) {
            return '<div class="card dashboard-widget"><div class="widget-icon ' + x[0] + '"><i class="bx ' + x[1] + '"></i></div><div class="widget-value" style="font-size:1.5rem;">' + x[2] + '</div><div class="widget-title">' + x[3] + '</div></div>'; }).join('');
        var sg = S.suggestions(), box = document.getElementById('purSuggest');
        if (box) box.innerHTML = sg.length ? '<div class="card" style="margin-bottom:20px;border-left:4px solid var(--warning-color);"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;"><div><b>Reorder suggestions</b><div style="font-size:.82rem;color:var(--text-muted);margin-top:4px;">' +
            sg.map(function (x) { return esc(x.name) + ' (' + esc(x.stock) + ' / min ' + esc(x.min) + ', order ' + esc(x.qty) + ' ' + esc(x.unit) + ')'; }).join(' · ') + '</div></div><button class="btn btn-primary" onclick="poFromSuggestions()">Create PO</button></div></div>' : '';
        var cls = { Draft: 'status-info', Approved: 'status-warning', 'Partially Received': 'status-warning', Received: 'status-success', Rejected: 'status-danger', Cancelled: 'status-danger' };
        var rows = pos.filter(function (p) { return !filter || p.status === filter; });
        body.innerHTML = rows.length ? rows.map(function (p) {
            var id = esc(p.id), jid = escJs(p.id), b = 'style="padding:3px 8px;font-size:.75rem;"', a = '', isOver = over.indexOf(p) > -1;
            if (p.lines && p.lines.length) a += '<button class="btn btn-outline" ' + b + ' title="Print" onclick="poPrint(\'' + jid + '\')"><i class="bx bx-printer"></i></button> ';
            if (p.status === 'Draft') a += '<button class="btn btn-outline" ' + b + ' onclick="poEdit(\'' + jid + '\')">Edit</button> <button class="btn btn-primary" ' + b + ' onclick="poApprove(\'' + jid + '\')">Approve</button> <button class="btn btn-outline" ' + b + ' onclick="poReject(\'' + jid + '\')">Reject</button> <button class="icon-btn" style="color:var(--danger-color);" onclick="poDelete(\'' + jid + '\')"><i class="bx bx-trash"></i></button>';
            else if (p.status === 'Approved' || p.status === 'Partially Received') { if (p.lines && p.lines.length) a += '<button class="btn btn-primary" ' + b + ' onclick="poReceive(\'' + jid + '\')">Receive</button> '; if (!(p.receipts || []).length) a += '<button class="btn btn-outline" ' + b + ' onclick="poCancel(\'' + jid + '\')">Cancel</button>'; }
            return '<tr><td><b style="font-family:monospace;">' + id + '</b>' + (p.legacy ? ' <span style="font-size:.65rem;color:var(--text-muted);">(demo)</span>' : '') + '</td><td>' + esc(p.supplier) + '</td><td>' + fmt(p.date) + '</td><td>' + fmt(p.expected) + (isOver ? ' <span class="status status-danger">Overdue</span>' : '') + '</td>' +
                '<td><span class="status ' + (cls[p.status] || 'status-info') + '">' + esc(p.status) + '</span></td><td>' + inr(poTotal(p)) + '</td><td style="white-space:nowrap;">' + a + '</td></tr>';
        }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:18px;">No purchase orders.</td></tr>';
        var sb = document.getElementById('supplierBody');
        if (sb) sb.innerHTML = sups.length ? sups.map(function (s) {
            var m = S.stats(s.id), id = esc(s.id), jid = escJs(s.id);
            return '<tr><td><b>' + esc(s.name) + '</b><div style="font-size:.72rem;color:var(--text-muted);">' + esc(s.gstin || '') + '</div></td><td>' + esc(s.category) + '</td><td>' + esc(s.contact || '') + '<div style="font-size:.72rem;color:var(--text-muted);">' + esc(s.phone || '') + '</div></td><td>' + (s.paymentTerms != null ? esc(s.paymentTerms) + 'd' : '–') + '</td><td>' + m.open + '</td><td>' + inr(m.spend) + '</td>' +
                '<td><span class="status ' + (m.score > 80 ? 'status-success' : m.score > 60 ? 'status-warning' : 'status-danger') + '">' + m.score + '</span></td><td style="white-space:nowrap;"><button class="btn btn-outline" style="padding:3px 8px;font-size:.75rem;" onclick="supplierEdit(\'' + jid + '\')">Edit</button> <button class="icon-btn" style="color:var(--danger-color);" onclick="supplierDelete(\'' + jid + '\')"><i class="bx bx-trash"></i></button></td></tr>';
        }).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No suppliers yet.</td></tr>';
    }
    window.refreshPurchaseTable = refreshAll;
    window.refreshPurchaseAll = refreshAll;

    document.addEventListener('DOMContentLoaded', function () { if (typeof DataManager !== 'undefined') migrate(); });
})();
