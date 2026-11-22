// Supplier Scorecard: metrics come from real deliveries (PurchaseStore.stats);
// suppliers with no received orders yet show their baseline values, flagged "baseline".
(function () {
    'use strict';
    var esc = window.escapeHtml;
    function inr(p) { return '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function rows() {
        return DataManager.getSuppliers().map(function (s) { return Object.assign({}, s, { m: PurchaseStore.stats(s.id) }); }).sort(function (a, b) { return b.m.score - a.m.score; });
    }

    window.renderSupplierScorecard = function () {
        setTimeout(window.refreshScorecard, 40);
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;"><i class="bx bx-medal" style="color:var(--primary-color);"></i> Supplier Scorecard</h1><div style="display:flex;gap:12px;">' +
            '<button class="btn btn-outline" onclick="exportScorecard()"><i class="bx bx-download"></i> Export CSV</button><button class="btn btn-primary" onclick="supplierEdit()"><i class="bx bx-plus"></i> Add supplier</button></div></div>' +
            '<div class="card" style="margin-bottom:24px;"><h2 class="section-title"><i class="bx bx-bar-chart-square"></i> Rankings</h2>' +
            '<p style="font-size:.8rem;color:var(--text-muted);margin:0 0 12px;">Score = 30% quality rating + 40% on-time delivery + 30% low defect rate. On-time, defects, price variance and lead time are measured from received purchase orders.</p>' +
            '<div class="table-container"><table class="table" id="scoreTable"><thead><tr><th>Rank</th><th>Supplier</th><th>Category</th><th>Rating</th><th>On-time</th><th>Defect rate</th><th>Price vs list</th><th>Avg lead (days)</th><th>Spend</th><th>Score</th></tr></thead><tbody id="scorecardBody"></tbody></table></div></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;"><div class="card"><h2 class="section-title" style="color:var(--secondary-color);"><i class="bx bx-trophy"></i> Best performer</h2><div id="bestSup" style="padding:12px 0;"></div></div>' +
            '<div class="card"><h2 class="section-title" style="color:var(--danger-color);"><i class="bx bx-error"></i> Needs improvement</h2><div id="worstSup" style="padding:12px 0;"></div></div>' +
            '<div class="card"><h2 class="section-title"><i class="bx bx-trending-up"></i> Averages</h2><div id="avgMetrics" style="display:flex;flex-direction:column;gap:10px;"></div></div></div></div>';
    };

    window.refreshScorecard = function () {
        var body = document.getElementById('scorecardBody'); if (!body) return;
        var list = rows();
        body.innerHTML = list.length ? list.map(function (s, i) {
            var m = s.m, cls = m.score > 80 ? 'status-success' : m.score > 60 ? 'status-warning' : 'status-danger', base = m.real ? '' : ' <span style="font-size:.65rem;color:var(--text-muted);" title="No received orders yet">baseline</span>';
            return '<tr><td><b>#' + (i + 1) + '</b></td><td><b>' + esc(s.name) + '</b><div style="font-size:.72rem;color:var(--text-muted);">' + esc(s.contact || '') + ' ' + esc(s.phone || '') + '</div></td><td>' + esc(s.category) + '</td>' +
                '<td><span style="color:gold;letter-spacing:2px;">' + '★'.repeat(m.rating) + '☆'.repeat(5 - m.rating) + '</span></td>' +
                '<td style="color:var(--' + (m.onTime >= 90 ? 'secondary' : 'danger') + '-color);">' + esc(m.onTime) + '%' + base + '</td><td style="color:var(--' + (m.defect < 2 ? 'secondary' : 'danger') + '-color);">' + esc(m.defect) + '%</td>' +
                '<td style="color:var(--' + (m.priceVar <= 0 ? 'secondary' : 'danger') + '-color);">' + (m.priceVar > 0 ? '+' : '') + esc(m.priceVar) + '%</td><td>' + (m.leadDays == null ? '–' : esc(m.leadDays)) + '</td><td>' + inr(m.spend) + '</td><td><span class="status ' + cls + '">' + m.score + '/100</span></td></tr>';
        }).join('') : '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:16px;">No suppliers yet.</td></tr>';
        function card(s, extra) { return s ? '<div style="font-size:1.1rem;font-weight:700;">' + esc(s.name) + '</div><div style="color:var(--text-muted);font-size:.85rem;margin-top:4px;">Score ' + s.m.score + '/100 · ' + extra(s.m) + '</div>' : '<div style="color:var(--text-muted);">–</div>'; }
        var best = list[0], worst = list.length > 1 ? list[list.length - 1] : null;
        document.getElementById('bestSup').innerHTML = card(best, function (m) { return m.onTime + '% on time'; });
        document.getElementById('worstSup').innerHTML = card(worst, function (m) { return m.defect + '% defects'; });
        var n = list.length, avg = function (f) { return n ? Math.round(list.reduce(function (t, x) { return t + f(x.m); }, 0) / n * 10) / 10 : 0; };
        function row(k, v) { return '<div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span>' + k + '</span><strong>' + v + '</strong></div>'; }
        document.getElementById('avgMetrics').innerHTML = row('Avg on-time', avg(function (m) { return m.onTime; }) + '%') + row('Avg defect rate', avg(function (m) { return m.defect; }) + '%') + row('Avg score', avg(function (m) { return m.score; }) + '/100') + row('Suppliers', n);
    };

    window.exportScorecard = function () {
        function c(v) { var t = String(v == null ? '' : v); if (/^[=+\-@]/.test(t)) t = "'" + t; return '"' + t.replace(/"/g, '""') + '"'; }
        var out = [['Rank', 'Supplier', 'Category', 'Rating', 'On-time %', 'Defect %', 'Price variance %', 'Avg lead days', 'Spend INR', 'Score', 'Measured from deliveries']].concat(rows().map(function (s, i) {
            var m = s.m; return [i + 1, s.name, s.category, m.rating, m.onTime, m.defect, m.priceVar, m.leadDays == null ? '' : m.leadDays, (m.spend / 100).toFixed(2), m.score, m.real ? 'yes' : 'baseline']; }));
        window.downloadFile('supplier-scorecard-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + out.map(function (r) { return r.map(c).join(','); }).join('\r\n'), 'text/csv;charset=utf-8');
    };
    window.addSupplierScore = function () { window.supplierEdit(); };
    window.rateSupplier = function (id) { window.supplierEdit(id); };
})();
