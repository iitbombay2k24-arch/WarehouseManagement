// Dashboard: every tile is computed live from the real stores via Analytics.
(function () {
    'use strict';
    var esc = window.escapeHtml, chartRange = 7;

    function inr(p) { return '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
    function num(n) { return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 1 }); }
    function gauge(pct, color, label, sub) {
        var p = Math.max(0, Math.min(100, pct)), off = 314 - 314 * p / 100;
        return '<div class="card" style="text-align:center;padding:20px;"><h2 class="section-title" style="margin-bottom:12px;">' + label + '</h2>' +
            '<div style="position:relative;width:130px;height:130px;margin:0 auto 12px;"><svg viewBox="0 0 120 120" width="130" height="130"><circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="12"/>' +
            '<circle cx="60" cy="60" r="50" fill="none" stroke="' + color + '" stroke-width="12" stroke-dasharray="314" stroke-dashoffset="' + off + '" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg>' +
            '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.5rem;font-weight:700;color:' + color + ';">' + Math.round(pct) + '%</div></div>' +
            '<div style="font-size:.8rem;color:var(--text-muted);">' + sub + '</div></div>';
    }
    function widget(color, icon, value, title) {
        return '<div class="card dashboard-widget"><div class="widget-icon ' + color + '"><i class="bx ' + icon + '"></i></div><div class="widget-value">' + value + '</div><div class="widget-title">' + title + '</div></div>';
    }
    function metric(label, value, color) {
        return '<div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span style="font-size:.8rem;">' + label + '</span><strong style="color:' + color + ';">' + value + '</strong></div>';
    }

    window.renderDashboard = function () {
        setTimeout(function () { window.initDashboard(); }, 50);
        var btn = function (d) { return '<button id="chartFilter' + d + '" class="btn ' + (d === chartRange ? 'btn-primary' : 'btn-outline') + '" style="padding:4px 12px;font-size:.75rem;" onclick="window.setChartRange(' + d + ')">' + d + 'd</button>'; };
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;">📦 Warehouse Dashboard</h1><div style="display:flex;gap:8px;align-items:center;"><span style="font-size:.8rem;color:var(--text-muted);">Chart range:</span>' +
            btn(7) + btn(30) + btn(90) + '<button class="btn btn-outline" style="padding:4px 12px;font-size:.75rem;" onclick="window.toggleKioskMode && window.toggleKioskMode()"><i class="bx bx-fullscreen"></i> Kiosk</button></div></div>' +
            '<div class="dashboard-grid" id="dKpis" style="margin-bottom:24px;"></div>' +
            '<div id="dGauges" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;margin-bottom:24px;"></div>' +
            '<div class="card" style="margin-bottom:24px;"><h2 class="section-title" id="dChartTitle">Stock movement</h2><div style="height:260px;"><canvas id="dashboardChart"></canvas></div></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:24px;">' +
            '<div class="card" style="grid-column:span 2;"><h2 class="section-title"><i class="bx bx-grid-alt"></i> Activity by hour (last 30 days)</h2><div id="dHeat" style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-top:12px;"></div>' +
            '<div style="display:flex;justify-content:space-between;margin-top:8px;font-size:.7rem;color:var(--text-muted);"><span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span></div></div>' +
            '<div class="card"><h2 class="section-title"><i class="bx bx-task"></i> Upcoming &amp; pending</h2><div id="dTasks" style="display:flex;flex-direction:column;gap:8px;"></div></div></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:24px;">' +
            '<div class="card" style="grid-column:span 2;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 class="section-title" style="margin:0;">Recent stock movements</h2><button class="btn btn-outline" style="padding:4px 12px;font-size:.8rem;" onclick="location.hash=\'#ledger\'">Open ledger</button></div><div id="dRecent"></div></div>' +
            '<div class="card"><h2 class="section-title">Alerts</h2><div id="dAlerts" style="display:flex;flex-direction:column;gap:10px;"></div><button class="btn btn-outline" style="width:100%;margin-top:12px;" onclick="location.hash=\'#alerts\'">View all alerts</button></div></div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin-bottom:24px;">' +
            '<div class="card"><h2 class="section-title"><i class="bx bx-trending-up"></i> Top sellers (30 days)</h2><div id="dTop" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div></div>' +
            '<div class="card"><h2 class="section-title"><i class="bx bx-line-chart"></i> Return rate trend</h2><div style="height:150px;"><canvas id="returnRateChart"></canvas></div></div>' +
            '<div class="card"><h2 class="section-title"><i class="bx bx-pulse"></i> Activity feed</h2><div id="activityFeedContainer" style="overflow-y:auto;max-height:200px;"></div></div></div>' +
            '<div class="card" style="margin-bottom:24px;"><h2 class="section-title"><i class="bx bx-spreadsheet"></i> Supplier performance</h2><div id="dSuppliers"></div></div></div>';
    };

    window.initDashboard = function () {
        if (!document.getElementById('dKpis') || !window.Analytics) return;
        var An = Analytics, r30 = An.range(30), r7 = An.range(7), today = An.todayMovement();
        var inv = An.inventory(r30), ful = An.fulfilment(), rec = An.receivables(), ret = An.returns(r30);
        var mtd = An.sales(An.range('mtd')), target = An.revenueTarget(), mtdRev = mtd.taxable / 100;
        var fgUnits = inv.fgUnits;

        document.getElementById('dKpis').innerHTML =
            widget('blue', 'bx-package', num(fgUnits), 'Finished goods on hand (units)') + widget('green', 'bx-down-arrow-circle', num(today.inward), "Today's inward (units)") +
            widget('orange', 'bx-up-arrow-circle', num(today.outward), "Today's outward (units)") + widget('red', 'bx-error-circle', inv.lowCount, 'Items below minimum');

        var tgtPct = target > 0 ? mtdRev / target * 100 : 0;
        document.getElementById('dGauges').innerHTML =
            gauge(ful.rate, 'var(--secondary-color)', "<i class='bx bx-check-circle'></i> Orders dispatched", ful.total ? ful.done + ' of ' + ful.total + ' orders dispatched' : 'No orders yet') +
            gauge(tgtPct, 'var(--primary-color)', "<i class='bx bx-rupee'></i> Revenue vs target", '₹' + mtdRev.toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' of ₹' + target.toLocaleString('en-IN') + ' this month' +
                ' · <a href="#" style="color:var(--primary-color);" onclick="event.preventDefault();dashSetTarget()">edit target</a>') +
            '<div class="card" style="padding:20px;"><h2 class="section-title"><i class="bx bx-calculator"></i> Key metrics (30 days)</h2><div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">' +
            metric('Net sales (ex-GST)', inr(An.sales(r30).taxable), 'var(--secondary-color)') + metric('Receivables outstanding', inr(rec.total), rec.rows.some(function (x) { return x.overdue > 0; }) ? 'var(--danger-color)' : 'var(--secondary-color)') +
            metric('Return rate', ret.rate + '%', ret.rate > 5 ? 'var(--danger-color)' : 'var(--warning-color)') + metric('Stock accuracy', inv.accuracy + '%', 'var(--primary-color)') + '</div></div>';

        window.drawDashChart();

        var h = An.byHour(r30), peak = Math.max.apply(null, h.slice(6, 18).concat([1]));
        document.getElementById('dHeat').innerHTML = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(function (hr) {
            var v = h[hr], p = Math.round(v / peak * 100), bg = p > 80 ? 'var(--danger-color)' : p > 60 ? 'var(--warning-color)' : p > 30 ? 'var(--primary-color)' : 'var(--secondary-color)';
            return '<div title="' + hr + ':00 — ' + v + ' movements" style="height:60px;background:' + bg + ';border-radius:4px;opacity:' + (v ? 0.35 + p / 160 : 0.12) + ';display:flex;align-items:center;justify-content:center;"><span style="font-size:.65rem;color:white;font-weight:700;">' + v + '</span></div>';
        }).join('');

        var tasks = An.upcoming();
        document.getElementById('dTasks').innerHTML = tasks.length ? tasks.map(function (t) {
            return '<div style="display:flex;gap:10px;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;"><i class="bx ' + t.icon + '" style="color:' + t.color + ';font-size:1.1rem;"></i><div style="font-size:.8rem;">' + esc(t.text) + '</div></div>';
        }).join('') : '<div style="color:var(--text-muted);font-size:.85rem;">Nothing pending. 🎉</div>';

        var names = {}; DataManager.getProducts().forEach(function (p) { names[p.id] = p.name; });
        var recent = StockLedger.entries().slice(-6).reverse();
        document.getElementById('dRecent').innerHTML = recent.length ? '<table class="table"><thead><tr><th>Type</th><th>Item</th><th>Qty</th><th>Ref</th><th>Time</th></tr></thead><tbody>' + recent.map(function (e) {
            var pos = e.qty > 0;
            return '<tr><td><span class="status ' + (pos ? 'status-success' : 'status-warning') + '">' + esc((StockLedger.TYPES[e.type] || {}).label || e.type) + '</span></td><td>' + esc(names[e.sku] || e.sku) + '</td><td>' + (pos ? '+' : '') + esc(e.qty) + '</td><td>' + esc(e.ref || '–') + '</td><td>' + esc(new Date(e.ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })) + '</td></tr>';
        }).join('') + '</tbody></table>' : '<div style="color:var(--text-muted);">No movements yet.</div>';

        var alerts = DataManager.getAlerts().filter(function (a) { return !a.acknowledged; });
        document.getElementById('dAlerts').innerHTML = alerts.slice(0, 4).map(function (a) {
            var c = a.severity === 'danger' ? '239,68,68' : '245,158,11';
            return '<div style="padding:10px;border-left:4px solid var(--' + esc(a.severity) + '-color);background:rgba(' + c + ',.06);border-radius:4px;"><div style="font-weight:600;font-size:.85rem;">' + esc(a.type) + '</div><div style="font-size:.78rem;color:var(--text-muted);">' + esc(String(a.message).slice(0, 80)) + '</div></div>';
        }).join('') || '<div style="color:var(--text-muted);font-size:.85rem;">No active alerts</div>';

        var sales = An.sales(r30), top = Object.keys(sales.byProduct).map(function (k) { return sales.byProduct[k]; }).sort(function (a, b) { return b.units - a.units; }).slice(0, 5), mx = top.length ? top[0].units : 1;
        document.getElementById('dTop').innerHTML = top.length ? top.map(function (p, i) {
            return '<div><div style="display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:3px;"><span>' + ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i] + ' ' + esc(p.name) + '</span><strong>' + num(p.units) + ' units</strong></div>' +
                '<div style="background:var(--bg-main);border-radius:3px;height:6px;"><div style="height:100%;width:' + Math.round(p.units / mx * 100) + '%;background:var(--primary-color);border-radius:3px;"></div></div></div>';
        }).join('') : '<div style="color:var(--text-muted);font-size:.85rem;">No sales invoiced in the last 30 days.</div>';

        var rr = An.returnRateMonthly(6), rctx = document.getElementById('returnRateChart');
        if (rctx && window.Chart) {
            Chart.defaults.color = '#94a3b8'; Chart.defaults.borderColor = 'rgba(148,163,184,.15)';
            if (window._returnRateChart) window._returnRateChart.destroy();
            window._returnRateChart = new Chart(rctx, { type: 'line', data: { labels: rr.map(function (x) { return x.label; }), datasets: [{ label: 'Return %', data: rr.map(function (x) { return x.rate; }), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: .35, pointRadius: 3 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
        }

        var sup = DataManager.getSuppliers();
        document.getElementById('dSuppliers').innerHTML = sup.length ? '<table class="table"><thead><tr><th>Supplier</th><th>Category</th><th>On-time %</th><th>Defect %</th><th>Score</th></tr></thead><tbody>' + sup.map(function (s) {
            var m = PurchaseStore.stats(s.id);
            return '<tr><td><strong>' + esc(s.name) + '</strong></td><td>' + esc(s.category) + '</td><td>' + esc(m.onTime) + '%</td><td>' + esc(m.defect) + '%</td><td>' + esc(m.score) + '/100</td></tr>';
        }).join('') + '</tbody></table>' : '<div style="color:var(--text-muted);">No suppliers yet.</div>';

        if (typeof window.renderActivityFeed === 'function') window.renderActivityFeed('activityFeedContainer');
    };

    window.drawDashChart = function () {
        var ctx = document.getElementById('dashboardChart'); if (!ctx || !window.Chart) return;
        var m = Analytics.movement(Analytics.range(chartRange));
        Chart.defaults.color = '#94a3b8'; Chart.defaults.borderColor = 'rgba(148,163,184,.15)';
        if (window._dashChart) window._dashChart.destroy();
        window._dashChart = new Chart(ctx, { type: 'line', data: { labels: m.labels, datasets: [
            { label: 'Inward (units)', data: m.inward, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: .4 },
            { label: 'Outward (units)', data: m.outward, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)', fill: true, tension: .4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } } });
        var t = document.getElementById('dChartTitle'); if (t) t.textContent = 'Finished-goods stock movement — last ' + chartRange + ' days (' + num(m.totals.inward) + ' in / ' + num(m.totals.outward) + ' out)';
    };
    window.setChartRange = function (days) {
        chartRange = days;
        [7, 30, 90].forEach(function (d) { var b = document.getElementById('chartFilter' + d); if (b) b.className = 'btn ' + (d === days ? 'btn-primary' : 'btn-outline'); });
        window.drawDashChart();
    };
    window.dashSetTarget = function () {
        var v = prompt('Monthly revenue target (₹, ex-GST):', Analytics.revenueTarget());
        if (v === null) return;
        var n = Number(String(v).replace(/,/g, ''));
        if (!(n > 0) || n > 1e10) return showToast('Enter a valid amount', 'danger');
        localStorage.setItem('wms_revenue_target', String(Math.round(n))); window.initDashboard();
    };
})();
