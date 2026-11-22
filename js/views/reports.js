// Reports & Analytics: every figure is computed live from the real stores via Analytics.
(function () {
    'use strict';
    var esc = window.escapeHtml, A = function () { return window.Analytics; };
    var state = { preset: '30', from: '', to: '' };
    var charts = {};

    function inr(p) { return '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function inrR(r) { return '₹' + Number(r).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function num(n) { return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 }); }
    function kpi(color, icon, value, label, sub) {
        return '<div class="card dashboard-widget"><div class="widget-icon ' + color + '"><i class="bx ' + icon + '"></i></div><div class="widget-value" style="font-size:1.5rem;">' + value + '</div><div class="widget-title">' + label + '</div>' +
            (sub ? '<div style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">' + sub + '</div>' : '') + '</div>';
    }
    function table(id, head, rows, empty) {
        return '<div class="table-container"><table class="table" id="' + id + '"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
            (rows.length ? rows.join('') : '<tr><td colspan="' + head.length + '" style="text-align:center;color:var(--text-muted);padding:16px;">' + empty + '</td></tr>') + '</tbody></table></div>';
    }
    function tr(cells) { return '<tr>' + cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }
    function card(title, body, extra) { return '<div class="card"' + (extra || '') + '><h2 class="section-title">' + title + '</h2>' + body + '</div>'; }

    window.renderReports = function () {
        setTimeout(window.refreshReports, 30);
        return '<div class="fade-in"><div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;">Reports &amp; Analytics</h1>' +
            '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">' +
            '<select id="repPreset" class="form-control" style="width:auto;" onchange="repRange(this.value)">' +
            [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['mtd', 'This month'], ['fy', 'This financial year'], ['custom', 'Custom range…']].map(function (o) { return '<option value="' + o[0] + '"' + (state.preset === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
            '<span id="repCustom" style="display:' + (state.preset === 'custom' ? 'inline-flex' : 'none') + ';gap:6px;align-items:center;"><input type="date" id="repFrom" class="form-control" style="width:auto;" value="' + esc(state.from) + '" onchange="repCustom()"> to <input type="date" id="repTo" class="form-control" style="width:auto;" value="' + esc(state.to) + '" onchange="repCustom()"></span>' +
            '<button class="btn btn-outline" onclick="repSummaryCSV()"><i class="bx bx-download"></i> Summary CSV</button>' +
            '<button class="btn btn-primary" onclick="window.print()"><i class="bx bx-printer"></i> Print / Save PDF</button></div></div>' +
            '<div id="repBody"></div></div>';
    };

    window.repRange = function (v) {
        state.preset = v; var c = document.getElementById('repCustom'); if (c) c.style.display = v === 'custom' ? 'inline-flex' : 'none';
        if (v === 'custom' && !state.from) { var t = new Date(), f = new Date(t.getTime() - 29 * 86400000); state.to = t.toISOString().slice(0, 10); state.from = f.toISOString().slice(0, 10); document.getElementById('repFrom').value = state.from; document.getElementById('repTo').value = state.to; }
        window.refreshReports();
    };
    window.repCustom = function () {
        state.from = document.getElementById('repFrom').value; state.to = document.getElementById('repTo').value;
        if (state.from && state.to) window.refreshReports();
    };

    var last = null;
    window.refreshReports = function () {
        var body = document.getElementById('repBody'); if (!body) return;
        var An = A(), r = An.range(state.preset, state.from, state.to);
        var s = An.sales(r), inv = An.inventory(r), rec = An.receivables(), ret = An.returns(r), pr = An.production(r), ful = An.fulfilment();
        last = { r: r, s: s, inv: inv, rec: rec, ret: ret, pr: pr, ful: ful };
        var label = r.from.toLocaleDateString('en-IN') + ' – ' + r.to.toLocaleDateString('en-IN');

        var top = Object.keys(s.byProduct).map(function (k) { return s.byProduct[k]; }).sort(function (a, b) { return b.revenue - a.revenue; });
        var cust = Object.keys(s.byCustomer).map(function (k) { return s.byCustomer[k]; }).sort(function (a, b) { return b.revenue - a.revenue; });
        var totalRev = top.reduce(function (t, x) { return t + x.revenue; }, 0) || 1;

        var h = '<div style="font-size:.8rem;color:var(--text-muted);margin-bottom:12px;">Period: <b>' + esc(label) + '</b> (' + r.days + ' days) · generated ' + esc(new Date().toLocaleString('en-IN')) + '</div>' +
            '<div class="dashboard-grid" style="margin-bottom:20px;">' +
            kpi('green', 'bx-rupee', inr(s.taxable), 'Net sales (ex-GST)', s.count + ' invoices' + (s.creditTotal ? ' · ' + inr(s.creditTotal) + ' credited' : '')) +
            kpi('blue', 'bx-receipt', inr(s.tax), 'GST charged', 'on net sales') +
            kpi('red', 'bx-wallet', inr(rec.total), 'Receivables outstanding', rec.rows.filter(function (x) { return x.overdue > 0; }).length + ' overdue') +
            kpi('blue', 'bx-package', inrR(inv.totalValue), 'Stock value', 'at list price · ' + inv.rows.length + ' items') +
            kpi('orange', 'bx-refresh', num(inv.turnover) + '×', 'Inventory turnover', 'annualised, finished goods' + (inv.cover !== null ? ' · ' + inv.cover + ' days cover' : '')) +
            kpi('green', 'bx-check-shield', inv.accuracy + '%', 'Stock accuracy', 'ledger vs stock · ' + num(inv.shrinkUnits) + ' units shrinkage') +
            kpi('red', 'bx-undo', ret.rate + '%', 'Return rate', ret.count + ' RMAs · ' + num(ret.units) + ' units') +
            kpi('blue', 'bx-cog', pr.completed ? pr.yield + '%' : '–', 'Production yield', pr.completed + ' work orders · ' + num(pr.good) + ' units') +
            kpi('green', 'bx-send', ful.total ? ful.rate + '%' : '–', 'Orders dispatched', ful.done + ' of ' + ful.total + ' orders') + '</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-bottom:20px;">' +
            card('Net sales trend (₹, ex-GST)', '<div style="height:240px;"><canvas id="repSales"></canvas></div>') +
            card('Stock inward vs outward (finished goods)', '<div style="height:240px;"><canvas id="repMove"></canvas></div>') +
            card('Receivables ageing', rec.total ? '<div style="height:240px;"><canvas id="repAge"></canvas></div>' : '<p style="color:var(--text-muted);">No outstanding receivables.</p>') +
            card('Stock value by category', '<div style="height:240px;"><canvas id="repCat"></canvas></div>') + '</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px;margin-bottom:20px;">' +
            card('Top products by revenue', table('repTop', ['Product', 'Units', 'Revenue (ex-GST)', 'Share'], top.map(function (x) { return tr([esc(x.name), num(x.units), inr(x.revenue), Math.round(x.revenue / totalRev * 100) + '%']); }), 'No sales in this period.')) +
            card('Sales by customer', table('repCust', ['Customer', 'Invoices', 'Revenue (ex-GST)'], cust.map(function (x) { return tr([esc(x.name), x.invoices, inr(x.revenue)]); }), 'No sales in this period.')) + '</div>';

        h += card('Stock valuation', table('repVal', ['SKU', 'Item', 'Category', 'On hand', 'Min', 'Unit price', 'Value', 'Status'], inv.rows.slice().sort(function (a, b) { return b.value - a.value; }).map(function (x) {
            return tr([esc(x.sku), esc(x.name), esc(x.category), num(x.stock), num(x.min), inrR(x.price), inrR(x.value), x.low ? '<span class="status status-danger">Below min</span>' : '<span class="status status-success">OK</span>']); }), 'No products.'), ' style="margin-bottom:20px;"');

        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px;margin-bottom:20px;">' +
            card('Slow / dead stock (no outward movement in ' + inv.deadDays + '+ days)', table('repDead', ['SKU', 'Item', 'On hand', 'Value', 'Days idle'], inv.dead.map(function (x) { return tr([esc(x.sku), esc(x.name), num(x.stock), inrR(x.value), x.daysSince === null ? 'never moved out' : x.daysSince]); }), 'No dead stock. 🎉')) +
            card('Overdue &amp; open receivables', table('repRec', ['Invoice', 'Customer', 'Due', 'Days overdue', 'Balance'], rec.rows.map(function (x) { return tr([esc(x.number), esc(x.customer), esc(x.due), x.overdue || '–', inr(x.balance)]); }), 'Nothing outstanding.')) + '</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px;margin-bottom:20px;">' +
            card('Returns by reason', table('repRet', ['Reason', 'RMAs'], Object.keys(ret.reasons).map(function (k) { return tr([esc(k), ret.reasons[k]]); }), 'No returns in this period.')) +
            card('Completed work orders', table('repProd', ['Order', 'Product', 'Planned', 'Good', 'Rejected', 'Yield'], pr.rows.map(function (w) { return tr([esc(w.id), esc(w.sku), esc(w.qty), esc(w.good), esc(w.rejected || 0), esc(w.yield) + '%']); }), 'No completed work orders in this period.')) + '</div>';

        h += '<div class="card"><h2 class="section-title">Audit trail</h2><div class="table-container"><table class="table"><thead><tr><th>Date/Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody id="auditTrailBody"></tbody></table></div></div>';
        body.innerHTML = h;
        window.refreshAuditTrailTable();
        drawCharts(r, s, inv, rec);
    };

    function drawCharts(r, s, inv, rec) {
        if (!window.Chart) return;
        Chart.defaults.color = '#94a3b8'; Chart.defaults.borderColor = 'rgba(148,163,184,.15)';
        Object.keys(charts).forEach(function (k) { try { charts[k].destroy(); } catch (e) {} }); charts = {};
        var An = A(), ss = An.salesSeries(r), mv = An.movement(r);
        function mk(id, cfg) { var c = document.getElementById(id); if (c) charts[id] = new Chart(c, cfg); }
        var base = { responsive: true, maintainAspectRatio: false };
        mk('repSales', { type: 'bar', data: { labels: ss.labels, datasets: [{ label: 'Net sales ₹', data: ss.values, backgroundColor: '#3b82f6', borderRadius: 4 }] }, options: Object.assign({}, base, { plugins: { legend: { display: false } } }) });
        mk('repMove', { type: 'line', data: { labels: mv.labels, datasets: [{ label: 'Inward', data: mv.inward, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.12)', fill: true, tension: .35 }, { label: 'Outward', data: mv.outward, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.12)', fill: true, tension: .35 }] }, options: base });
        var ak = Object.keys(rec.buckets);
        if (rec.total) mk('repAge', { type: 'doughnut', data: { labels: ak, datasets: [{ data: ak.map(function (k) { return rec.buckets[k] / 100; }), backgroundColor: ['#10b981', '#f59e0b', '#fb923c', '#ef4444'], borderWidth: 0 }] }, options: Object.assign({}, base, { plugins: { legend: { position: 'right' } } }) });
        var ck = Object.keys(inv.cats);
        mk('repCat', { type: 'doughnut', data: { labels: ck, datasets: [{ data: ck.map(function (k) { return inv.cats[k]; }), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'], borderWidth: 0 }] }, options: Object.assign({}, base, { plugins: { legend: { position: 'right' } } }) });
    }

    window.repSummaryCSV = function () {
        if (!last) return;
        function c(v) { var t = String(v).replace(/\s+/g, ' '); if (/^[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; }
        var L = last, rows = [['Period', L.r.from.toLocaleDateString('en-IN') + ' - ' + L.r.to.toLocaleDateString('en-IN')], ['Net sales ex-GST (INR)', (L.s.taxable / 100).toFixed(2)], ['GST charged (INR)', (L.s.tax / 100).toFixed(2)], ['Invoices', L.s.count],
            ['Credit notes (INR)', (L.s.creditTotal / 100).toFixed(2)], ['Receivables outstanding (INR)', (L.rec.total / 100).toFixed(2)], ['Stock value (INR)', L.inv.totalValue.toFixed(2)], ['Inventory turnover (x)', L.inv.turnover],
            ['Stock accuracy %', L.inv.accuracy], ['Return rate %', L.ret.rate], ['Production yield %', L.pr.yield], ['Orders dispatched %', L.ful.rate]];
        window.downloadFile('report-summary-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + rows.map(function (r) { return r.map(c).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
    };

    window.refreshAuditTrailTable = function () {
        var tbody = document.getElementById('auditTrailBody'); if (!tbody || typeof DataManager === 'undefined') return;
        var logs = DataManager.getAuditTrail().slice(0, 200);
        tbody.innerHTML = logs.length ? logs.map(function (l) {
            return '<tr><td>' + esc(l.date) + '</td><td>' + esc(l.user) + '</td><td><span class="status ' + esc(l.actionClass) + '">' + esc(l.action) + '</span></td><td>' + esc(l.details) + '</td></tr>';
        }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">No activity recorded yet.</td></tr>';
    };
})();
