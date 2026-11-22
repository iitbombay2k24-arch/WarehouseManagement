// Returns & Reverse Logistics: RMA lifecycle with ledger-backed restock/scrap
// and GST credit notes against the original invoice.
(function () {
    'use strict';
    var esc = window.escapeHtml;
    var REASONS = {
        'Damaged Packaging': { cls: 'danger', restock: false },
        'Expired / Near Expiry': { cls: 'warning', restock: false },
        'Overstock Return': { cls: 'success', restock: true },
        'Wrong Item Shipped': { cls: 'info', restock: true },
        'Quality Complaint': { cls: 'danger', restock: false }
    };
    var FINAL = { Restocked: 1, Scrapped: 1, Closed: 1 };

    function actor() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.username : 'system'; }
    function prod(id) { return DataManager.getProducts().filter(function (p) { return p.id === id; })[0]; }
    function get(id) { return DataManager.getReturns().filter(function (r) { return r.id === id; })[0]; }
    function nextId() {
        return 'RMA-' + (DataManager.getReturns().reduce(function (m, r) { return Math.max(m, parseInt(String(r.id).replace(/\D/g, ''), 10) || 0); }, 8000) + 1);
    }
    function sellable() { return DataManager.getProducts().filter(function (p) { return !/^(Raw Material|Packaging)$/.test(p.category); }); }
    function issuedInvoices() { return window.InvoiceStore ? InvoiceStore.list().filter(function (i) { return i.number && !i.cancelled; }) : []; }
    // Units of sku already under an open/closed RMA for this invoice (excludes nothing: prevents double returns).
    function alreadyReturned(invoiceId, sku, exceptId) {
        return DataManager.getReturns().reduce(function (t, r) { return t + (r.invoiceId === invoiceId && r.sku === sku && r.id !== exceptId ? Number(r.qty) || 0 : 0); }, 0);
    }

    var Returns = {
        create: function (d) {
            if (!d.customer) throw new Error('Choose a customer.');
            if (!REASONS[d.reason]) throw new Error('Choose a reason.');
            if (!prod(d.sku)) throw new Error('Choose a product.');
            var qty = Number(d.qty);
            if (!(qty > 0)) throw new Error('Enter a valid quantity.');
            if (d.invoiceId) {
                var inv = InvoiceStore.get(d.invoiceId), ln = inv && inv.lines.filter(function (l) { return l.sku === d.sku; })[0];
                if (!ln) throw new Error('That product is not on the selected invoice.');
                var left = Number(ln.qty) - alreadyReturned(d.invoiceId, d.sku);
                if (qty > left) throw new Error('Only ' + left + ' unit(s) of ' + d.sku + ' can still be returned against ' + inv.number + '.');
            }
            var p = prod(d.sku);
            var r = { id: nextId(), customer: d.customer, sku: d.sku, qty: qty, items: p.name + ' x ' + qty, reason: d.reason, invoiceId: d.invoiceId || '',
                notes: String(d.notes || '').slice(0, 200), status: 'Pending Receipt', created: new Date().toISOString(), createdBy: actor() };
            DataManager.addReturn(r);
            DataManager.logAction('RMA Created', r.id + ': ' + r.items + ' from ' + r.customer);
            return r;
        },
        receive: function (id) {
            var r = get(id); if (!r) throw new Error('RMA not found.');
            if (r.status !== 'Pending Receipt') throw new Error('RMA is not awaiting receipt.');
            DataManager.updateReturn(id, { status: 'Inspection Required', received: new Date().toISOString() });
        },
        // disposition: 'restock' | 'scrap'. Posts stock only when the RMA is linked to a product.
        dispose: function (id, action, creditNote) {
            var r = get(id); if (!r) throw new Error('RMA not found.');
            if (FINAL[r.status]) throw new Error('RMA is already closed.');
            if (r.status === 'Pending Receipt') throw new Error('Receive the goods before disposition.');
            var out = { status: '', credit: null };
            if (action === 'restock') {
                if (!REASONS[r.reason] || !REASONS[r.reason].restock) throw new Error('"' + r.reason + '" returns cannot go back to saleable stock. Scrap them instead.');
                if (r.sku) StockLedger.post({ sku: r.sku, type: 'RETURN_IN', qty: r.qty, ref: r.id, note: 'Restocked from ' + r.customer, idempotent: true });
                out.status = 'Restocked';
            } else if (action === 'scrap') {
                out.status = 'Scrapped';
                var p = r.sku && prod(r.sku);
                DataManager.logAction('Return Scrapped', r.id + ': write-off of ' + r.qty + ' × ' + (p ? p.name : r.items) + (p ? ' (₹' + (r.qty * (Number(p.price) || 0)).toLocaleString('en-IN') + ')' : ''));
            } else if (action === 'close') out.status = 'Closed';
            else throw new Error('Unknown action.');
            var patch = { status: out.status, disposition: action, disposed: new Date().toISOString() };
            if (creditNote && r.invoiceId && r.sku) {
                var cn = InvoiceStore.creditNote({ invoiceId: r.invoiceId, sku: r.sku, qty: r.qty, reason: r.reason + ' (' + r.id + ')', rmaId: r.id });
                patch.creditNoteId = cn.id; patch.creditNoteNo = cn.number; out.credit = cn;
            }
            DataManager.updateReturn(id, patch);
            return out;
        }
    };
    window.ReturnsStore = Returns;

    // ---- UI ----
    function modal(html) {
        closeRetModal();
        var o = document.createElement('div'); o.id = 'retModal';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;';
        o.innerHTML = '<div role="dialog" aria-modal="true" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;width:min(640px,100%);padding:22px;">' + html + '</div>';
        o.addEventListener('mousedown', function (e) { if (e.target === o) closeRetModal(); });
        document.body.appendChild(o);
    }
    window.closeRetModal = function () { var m = document.getElementById('retModal'); if (m) m.remove(); };
    var closeRetModal = window.closeRetModal;

    window.renderReturns = function () {
        setTimeout(function () { window.refreshReturnsTable(); window.initReturns(); }, 60);
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;"><i class="bx bx-revision" style="color:var(--primary-color);"></i> Returns &amp; Reverse Logistics</h1>' +
            '<button class="btn btn-primary" onclick="retNew()"><i class="bx bx-plus"></i> New return request</button></div>' +
            '<div class="dashboard-grid" id="retKpis"></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px;">' +
            '<div class="card" style="grid-column:1/-1;"><h2 class="section-title">Return authorizations (RMA)</h2><div class="table-container"><table class="table" id="rmaTable"><thead><tr><th>RMA</th><th>Customer</th><th>Items</th><th>Reason</th><th>Status</th><th>Credit note</th><th>Actions</th></tr></thead><tbody id="returnsTableBody"></tbody></table></div></div>' +
            '<div class="card"><h2 class="section-title">Return reasons</h2><div style="height:220px;"><canvas id="returnsChart"></canvas></div></div></div></div>';
    };

    window.refreshReturnsTable = function () {
        var body = document.getElementById('returnsTableBody'); if (!body) return;
        var rs = DataManager.getReturns();
        var open = rs.filter(function (r) { return !FINAL[r.status]; }).length;
        var restocked = rs.filter(function (r) { return r.status === 'Restocked'; }).reduce(function (t, r) { return t + (Number(r.qty) || 0); }, 0);
        var scrapVal = rs.filter(function (r) { return r.status === 'Scrapped' && r.sku; }).reduce(function (t, r) { var p = prod(r.sku); return t + (Number(r.qty) || 0) * (p ? Number(p.price) || 0 : 0); }, 0);
        var k = document.getElementById('retKpis');
        if (k) k.innerHTML = [['orange', 'bx-time-five', open, 'Open RMAs'], ['green', 'bx-check-shield', restocked, 'Units restocked'], ['red', 'bx-trash', '₹' + scrapVal.toLocaleString('en-IN'), 'Scrapped value'], ['blue', 'bx-file', rs.length, 'Total RMAs']].map(function (x) {
            return '<div class="card dashboard-widget"><div class="widget-icon ' + x[0] + '"><i class="bx ' + x[1] + '"></i></div><div class="widget-value">' + x[2] + '</div><div class="widget-title">' + x[3] + '</div></div>'; }).join('');
        body.innerHTML = rs.length ? rs.map(function (r) {
            var id = esc(r.id), jid = escJs(r.id), b = 'style="padding:3px 8px;font-size:.75rem;"', a = '', rc = REASONS[r.reason] || { cls: 'info' };
            if (r.status === 'Pending Receipt') a = '<button class="btn btn-outline" ' + b + ' onclick="retReceive(\'' + jid + '\')">Receive</button>';
            else if (!FINAL[r.status]) a = '<button class="btn btn-primary" ' + b + ' onclick="retDispose(\'' + jid + '\')">Inspect &amp; dispose</button>';
            if (r.creditNoteId) a += ' <button class="btn btn-outline" ' + b + ' onclick="printCreditNote(\'' + escJs(r.creditNoteId) + '\')" title="Print credit note"><i class="bx bx-printer"></i></button>';
            if (r.status === 'Pending Receipt' || r.status === 'Inspection Required' && !r.sku) a += ' <button class="icon-btn" style="color:var(--danger-color);" title="Delete" onclick="retDelete(\'' + jid + '\')"><i class="bx bx-trash"></i></button>';
            return '<tr><td><b style="font-family:monospace;">' + id + '</b></td><td>' + esc(r.customer) + '</td><td>' + esc(r.items) + '</td>' +
                '<td><span class="status status-' + rc.cls + '">' + esc(r.reason) + '</span></td><td>' + esc(r.status) + '</td><td>' + esc(r.creditNoteNo || '–') + '</td><td style="white-space:nowrap;">' + a + '</td></tr>';
        }).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:18px;">No returns yet.</td></tr>';
    };

    window.initReturns = function () {
        var ctx = document.getElementById('returnsChart'); if (!ctx || !window.Chart) return;
        var counts = {}; DataManager.getReturns().forEach(function (r) { var k = r.reason || 'Other'; counts[k] = (counts[k] || 0) + 1; });
        var labels = Object.keys(counts);
        if (window._returnsChart) window._returnsChart.destroy();
        if (!labels.length) { return; }
        window._returnsChart = new Chart(ctx, { type: 'doughnut', data: { labels: labels, datasets: [{ data: labels.map(function (l) { return counts[l]; }), backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#64748b'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } });
    };

    window.retNew = function () {
        var cs = DataManager.getCustomers();
        modal('<h2 style="margin-top:0;">New return request</h2><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
            '<div><label style="font-size:.75rem;">Customer</label><select id="retCust" class="form-control" style="width:100%;" onchange="retCustChanged()"><option value="">Select…</option>' + cs.map(function (c) { return '<option>' + esc(c.name) + '</option>'; }).join('') + '</select></div>' +
            '<div><label style="font-size:.75rem;">Against invoice (optional)</label><select id="retInv" class="form-control" style="width:100%;" onchange="retInvChanged()"></select></div>' +
            '<div><label style="font-size:.75rem;">Product</label><select id="retSku" class="form-control" style="width:100%;"></select></div>' +
            '<div><label style="font-size:.75rem;">Quantity</label><input id="retQty" type="number" min="1" step="any" class="form-control" style="width:100%;" value="1"></div>' +
            '<div><label style="font-size:.75rem;">Reason</label><select id="retReason" class="form-control" style="width:100%;">' + Object.keys(REASONS).map(function (r) { return '<option>' + esc(r) + '</option>'; }).join('') + '</select></div>' +
            '<div><label style="font-size:.75rem;">Notes</label><input id="retNotes" class="form-control" style="width:100%;" maxlength="200"></div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeRetModal()">Cancel</button><button class="btn btn-primary" onclick="retCreate()">Create RMA</button></div>');
        window.retCustChanged();
    };
    window.retCustChanged = function () {
        var invs = issuedInvoices().filter(function (i) { return i.buyer.name === retCust.value; });
        retInv.innerHTML = '<option value="">No invoice (manual)</option>' + invs.map(function (i) { return '<option value="' + esc(i.id) + '">' + esc(i.number) + '</option>'; }).join('');
        window.retInvChanged();
    };
    window.retInvChanged = function () {
        var inv = retInv.value && InvoiceStore.get(retInv.value);
        var list = inv ? inv.lines.map(function (l) { return prod(l.sku); }).filter(Boolean) : sellable();
        retSku.innerHTML = list.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.id) + ' — ' + esc(p.name) + '</option>'; }).join('');
    };
    window.retCreate = function () {
        try {
            var r = Returns.create({ customer: retCust.value, invoiceId: retInv.value, sku: retSku.value, qty: retQty.value, reason: retReason.value, notes: retNotes.value });
            closeRetModal(); showToast(r.id + ' created', 'success'); window.refreshReturnsTable(); window.initReturns();
        } catch (e) { showToast(e.message, 'danger'); }
    };
    window.retReceive = function (id) { try { Returns.receive(id); showToast(id + ' received — ready for inspection', 'success'); window.refreshReturnsTable(); } catch (e) { showToast(e.message, 'danger'); } };
    window.retDelete = function (id) {
        if (!confirm('Delete RMA ' + id + '?')) return;
        DataManager.deleteReturn(id); window.refreshReturnsTable(); window.initReturns();
    };
    window.deleteReturn = window.retDelete;

    window.retDispose = function (id) {
        var r = get(id), canRestock = REASONS[r.reason] && REASONS[r.reason].restock, canCredit = r.invoiceId && r.sku;
        modal('<h2 style="margin-top:0;">Inspect &amp; dispose — ' + esc(r.id) + '</h2><p style="color:var(--text-muted);">' + esc(r.items) + ' · ' + esc(r.reason) + '</p>' +
            (r.sku ? '' : '<div style="background:rgba(245,158,11,.12);padding:10px;border-radius:8px;margin-bottom:10px;font-size:.85rem;">This RMA has no linked product, so no stock will be posted.</div>') +
            '<div style="display:flex;flex-direction:column;gap:8px;">' +
            '<label style="display:flex;gap:8px;"><input type="radio" name="retAct" value="restock"' + (canRestock ? ' checked' : ' disabled') + '> Restock — add back to saleable stock' + (canRestock ? '' : ' <span style="color:var(--text-muted);">(not allowed for this reason)</span>') + '</label>' +
            '<label style="display:flex;gap:8px;"><input type="radio" name="retAct" value="scrap"' + (canRestock ? '' : ' checked') + '> Scrap — write off, no stock added</label>' +
            '<label style="display:flex;gap:8px;"><input type="radio" name="retAct" value="close"> Close without stock change</label></div>' +
            (canCredit ? '<label style="display:flex;gap:8px;margin-top:14px;"><input type="checkbox" id="retCN" checked> Issue credit note against the invoice</label>' : '') +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeRetModal()">Cancel</button><button class="btn btn-primary" onclick="retDisposeGo(\'' + escJs(id) + '\')">Confirm</button></div>');
    };
    window.retDisposeGo = function (id) {
        try {
            var act = document.querySelector('input[name=retAct]:checked').value, cn = document.getElementById('retCN');
            var out = Returns.dispose(id, act, cn && cn.checked);
            closeRetModal(); showToast(id + ' → ' + out.status + (out.credit ? ' · credit note ' + out.credit.number : ''), 'success');
            window.refreshReturnsTable(); window.initReturns();
            if (out.credit) window.printCreditNote(out.credit.id);
        } catch (e) { showToast(e.message, 'danger'); }
    };
    window.dispositionAction = function (action, batch) { showToast('Disposition "' + action + '" logged for ' + batch, 'success'); };
})();
