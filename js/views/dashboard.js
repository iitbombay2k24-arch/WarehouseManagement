// Dashboard View — Enhanced with F26-F30 + F91-F95 + F96

window.renderDashboard = function() {
    setTimeout(() => { if(window.initDashboard) window.initDashboard(); }, 100);
    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h1 class="page-title" style="margin:0;">📦 Warehouse Dashboard</h1>
                <!-- F27: Date range filter for chart -->
                <div style="display:flex;gap:8px;align-items:center;">
                    <span style="font-size:0.8rem;color:var(--text-muted);">Chart Range:</span>
                    <button id="chartFilter7" class="btn btn-primary" style="padding:4px 12px;font-size:0.75rem;" onclick="window.setChartRange(7)">7d</button>
                    <button id="chartFilter30" class="btn btn-outline" style="padding:4px 12px;font-size:0.75rem;" onclick="window.setChartRange(30)">30d</button>
                    <button id="chartFilter90" class="btn btn-outline" style="padding:4px 12px;font-size:0.75rem;" onclick="window.setChartRange(90)">90d</button>
                    <button class="btn btn-outline" style="padding:4px 12px;font-size:0.75rem;" onclick="window.toggleKioskMode()"><i class='bx bx-fullscreen'></i> Kiosk</button>
                </div>
            </div>

            <!-- F26: KPI counters (animate on load) -->
            <div class="dashboard-grid" style="margin-bottom:24px;">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-package'></i></div>
                    <div class="widget-value" id="kpi-stock" data-target="12450">0</div>
                    <div class="widget-title">Total Active Stock (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-down-arrow-circle'></i></div>
                    <div class="widget-value" id="kpi-inward" data-target="1250">0</div>
                    <div class="widget-title">Today's Inward (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon orange"><i class='bx bx-up-arrow-circle'></i></div>
                    <div class="widget-value" id="kpi-outward" data-target="840">0</div>
                    <div class="widget-title">Today's Outward (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon red"><i class='bx bx-error-circle'></i></div>
                    <div class="widget-value" id="kpi-lowstock" data-target="12">0</div>
                    <div class="widget-title">Low Stock SKUs</div>
                </div>
            </div>

            <!-- F29: Fulfilment Gauge + F91: Revenue Gauge -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:24px;">
                <!-- F29: Order Fulfilment Rate -->
                <div class="card" style="text-align:center;padding:20px;">
                    <h2 class="section-title" style="margin-bottom:16px;"><i class='bx bx-check-circle'></i> Order Fulfilment Rate</h2>
                    <div style="position:relative;width:130px;height:130px;margin:0 auto 12px;">
                        <svg viewBox="0 0 120 120" width="130" height="130">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="12"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary-color)" stroke-width="12"
                                stroke-dasharray="268" stroke-dashoffset="40" stroke-linecap="round"
                                transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s;"/>
                        </svg>
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.6rem;font-weight:700;color:var(--secondary-color);">85%</div>
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">17 of 20 orders fulfilled on time</div>
                </div>

                <!-- F91: Revenue vs Target -->
                <div class="card" style="text-align:center;padding:20px;">
                    <h2 class="section-title" style="margin-bottom:16px;"><i class='bx bx-rupee'></i> Revenue vs Target</h2>
                    <div style="position:relative;width:130px;height:130px;margin:0 auto 12px;">
                        <svg viewBox="0 0 120 120" width="130" height="130">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="12"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary-color)" stroke-width="12"
                                stroke-dasharray="268" stroke-dashoffset="54" stroke-linecap="round"
                                transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1s;"/>
                        </svg>
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.4rem;font-weight:700;color:var(--primary-color);">80%</div>
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">₹4.8L of ₹6L monthly target</div>
                </div>

                <!-- F95: Cost Per Order -->
                <div class="card" style="padding:20px;">
                    <h2 class="section-title"><i class='bx bx-calculator'></i> Key Metrics</h2>
                    <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
                        <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <span style="font-size:0.8rem;">Cost Per Order</span>
                            <strong style="color:var(--secondary-color);">₹142</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <span style="font-size:0.8rem;">Avg Lead Time</span>
                            <strong style="color:var(--primary-color);">2.4 days</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <span style="font-size:0.8rem;">Return Rate</span>
                            <strong style="color:var(--warning-color);">3.2%</strong>
                        </div>
                        <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <span style="font-size:0.8rem;">Warehouse Utilisation</span>
                            <strong style="color:var(--secondary-color);">72%</strong>
                        </div>
                    </div>
                </div>
            </div>

            <!-- F27: Stock Movement Chart -->
            <div class="card" style="margin-bottom:24px;">
                <h2 class="section-title">Weekly Stock Movement (F27: Date Filtered)</h2>
                <div style="height:260px;">
                    <canvas id="dashboardChart"></canvas>
                </div>
            </div>

            <!-- F92: Throughput Heatmap by Hour -->
            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px;">
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-grid-alt'></i> Throughput Heatmap by Hour (F92)</h2>
                    <div id="throughputHeatmap" style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-top:12px;"></div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.7rem;color:var(--text-muted);">
                        <span>6 AM</span><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span>
                    </div>
                </div>

                <!-- F30: Upcoming Tasks -->
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-task'></i> Upcoming Tasks (F30)</h2>
                    <div style="display:flex;flex-direction:column;gap:8px;" id="upcomingTasksList"></div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px;">
                <!-- Recent movements -->
                <div class="card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <h2 class="section-title" style="margin:0;">Recent Movements</h2>
                        <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;" onclick="window.location.hash='#reports'">View All</button>
                    </div>
                    <table class="table"><thead><tr><th>ID</th><th>Type</th><th>Item</th><th>Qty</th><th>Time</th></tr></thead>
                    <tbody>
                        <tr><td>#TRX-001</td><td><span class="status status-success">Inward</span></td><td>Aloo Bhujia (500g)</td><td>+500</td><td>10:24 AM</td></tr>
                        <tr><td>#TRX-002</td><td><span class="status status-warning">Outward</span></td><td>Moong Dal (1kg)</td><td>-200</td><td>09:45 AM</td></tr>
                        <tr><td>#TRX-003</td><td><span class="status status-success">Inward</span></td><td>Khatta Meetha (250g)</td><td>+1000</td><td>09:12 AM</td></tr>
                    </tbody></table>
                </div>

                <!-- Alerts panel + View All -->
                <div style="display:flex;flex-direction:column;gap:16px;">
                    <div class="card">
                        <h2 class="section-title">Alerts & Notifications</h2>
                        <div style="display:flex;flex-direction:column;gap:10px;" id="dashAlerts"></div>
                        <button class="btn btn-outline" style="width:100%;margin-top:12px;" onclick="window.location.hash='#alerts'">View All Alerts</button>
                    </div>
                </div>
            </div>

            <!-- F28: Top Products + F93: Return Rate Trend + F96: Activity Feed -->
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:24px;">
                <!-- F28: Top Selling Products -->
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-trending-up'></i> Top Selling Products (F28)</h2>
                    <div id="topProductsList" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div>
                </div>

                <!-- F93: Return Rate Trend -->
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-line-chart'></i> Return Rate Trend (F93)</h2>
                    <div style="height:140px;"><canvas id="returnRateChart"></canvas></div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.75rem;">
                        <span style="color:var(--text-muted);">3 months ago</span>
                        <span style="color:var(--secondary-color);font-weight:600;">Trend: ↓ Improving</span>
                        <span style="color:var(--text-muted);">This month</span>
                    </div>
                </div>

                <!-- F96: Activity Feed -->
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-pulse'></i> Activity Feed (F96)</h2>
                    <div id="activityFeedContainer" style="overflow-y:auto;max-height:200px;"></div>
                </div>
            </div>

            <!-- F94: Supplier Lead Time Matrix -->
            <div class="card" style="margin-bottom:24px;">
                <h2 class="section-title"><i class='bx bx-spreadsheet'></i> Supplier Lead Time Matrix (F94)</h2>
                <table class="table" id="leadTimeMatrix">
                    <thead><tr><th>Supplier</th><th>Item Category</th><th>Min Lead (days)</th><th>Avg Lead (days)</th><th>Max Lead (days)</th><th>Reliability</th></tr></thead>
                    <tbody>
                        <tr><td><strong>ABC Spices Ltd.</strong></td><td>Raw Spices</td><td>2</td><td>3.2</td><td>5</td><td><span class="status status-success">High</span></td></tr>
                        <tr><td><strong>Global Packaging</strong></td><td>BOPP/Pouches</td><td>4</td><td>6.8</td><td>12</td><td><span class="status status-warning">Medium</span></td></tr>
                        <tr><td><strong>Premium Oils Co.</strong></td><td>Edible Oils</td><td>1</td><td>1.8</td><td>3</td><td><span class="status status-success">Very High</span></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.initDashboard = function() {
    // F26: KPI counter animation
    document.querySelectorAll('.widget-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        let current = 0;
        const step = Math.ceil(target / 40);
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString('en-IN');
            if (current >= target) clearInterval(timer);
        }, 30);
    });

    // Dashboard Chart (F27)
    const ctx = document.getElementById('dashboardChart');
    if (ctx) {
        if (window._dashChart) window._dashChart.destroy();
        window._dashChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Inward (Kg)', data: [1200, 1900, 800, 1500, 2000, 500, 300],
                    borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4
                }, {
                    label: 'Outward (Kg)', data: [800, 1200, 1500, 1000, 2500, 800, 400],
                    borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
        });
    }

    // F93: Return Rate mini chart
    const rctx = document.getElementById('returnRateChart');
    if (rctx) {
        if (window._returnRateChart) window._returnRateChart.destroy();
        window._returnRateChart = new Chart(rctx, {
            type: 'line',
            data: {
                labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
                datasets: [{ label: 'Return %', data: [5.2, 4.8, 4.1, 3.9, 3.5, 3.2],
                    borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, pointRadius: 3 }]
            },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false, min: 2, max: 6, grid: { color: 'var(--border-color)' } } }
            }
        });
    }

    // F92: Throughput heatmap
    const hmap = document.getElementById('throughputHeatmap');
    if (hmap) {
        const hours = [6,7,8,9,10,11,12,13,14,15,16,17];
        const vals = [20, 55, 80, 95, 100, 88, 70, 75, 85, 60, 40, 25];
        hmap.innerHTML = hours.map((h, i) => {
            const pct = vals[i];
            const bg = pct > 80 ? 'var(--danger-color)' : pct > 60 ? 'var(--warning-color)' : pct > 40 ? 'var(--primary-color)' : 'var(--secondary-color)';
            return `<div title="${h}:00 — ${pct}% throughput" style="height:60px;background:${bg};border-radius:4px;opacity:${0.3 + pct/140};cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;" onclick="window.showToast('${h}:00 — ${pct}% warehouse throughput','info')">
                <span style="font-size:0.6rem;color:white;font-weight:700;">${pct}%</span>
            </div>`;
        }).join('');
    }

    // F28: Top Products Widget
    const prodEl = document.getElementById('topProductsList');
    if (prodEl) {
        const products = [
            { name: 'Aloo Bhujia (500g)', sales: 4500, pct: 100 },
            { name: 'Navratna Mix (1kg)', sales: 3200, pct: 71 },
            { name: 'Khatta Meetha (250g)', sales: 2800, pct: 62 },
            { name: 'Plain Sev (100g)', sales: 2100, pct: 47 },
            { name: 'Moong Dal (1kg)', sales: 1600, pct: 36 }
        ];
        prodEl.innerHTML = products.map((p, i) => `
            <div>
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:3px;">
                    <span>${['🥇','🥈','🥉','4️⃣','5️⃣'][i]} ${p.name}</span>
                    <strong>${p.sales.toLocaleString('en-IN')} kg</strong>
                </div>
                <div style="background:var(--bg-main);border-radius:3px;height:6px;">
                    <div style="height:100%;width:${p.pct}%;background:var(--primary-color);border-radius:3px;transition:width 0.8s 0.3s;"></div>
                </div>
            </div>`).join('');
    }

    // F30: Upcoming Tasks Widget
    const tasksEl = document.getElementById('upcomingTasksList');
    if (tasksEl) {
        const tasks = [
            { icon: 'bx-cart', color: 'var(--primary-color)', text: 'PO-2026-1046 delivery expected', time: 'Today 3 PM' },
            { icon: 'bx-shield-x', color: 'var(--danger-color)', text: 'QC inspection — Batch #B-2415', time: 'Tomorrow' },
            { icon: 'bx-wrench', color: 'var(--warning-color)', text: 'AMR-2 scheduled maintenance', time: '4 Aug' },
            { icon: 'bx-calendar', color: 'var(--secondary-color)', text: 'Monthly payroll processing', time: '5 Aug' }
        ];
        tasksEl.innerHTML = tasks.map(t => `
            <div style="display:flex;gap:10px;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;">
                <i class='bx ${t.icon}' style="color:${t.color};font-size:1.1rem;"></i>
                <div style="flex:1;"><div style="font-size:0.8rem;">${t.text}</div><div style="font-size:0.72rem;color:var(--text-muted);">${t.time}</div></div>
            </div>`).join('');
    }

    // Alerts from DataManager
    const dashAlerts = document.getElementById('dashAlerts');
    if (dashAlerts) {
        const alerts = DataManager.getAlerts().filter(a => !a.acknowledged).slice(0,3);
        dashAlerts.innerHTML = alerts.map(a => `
            <div style="padding:10px;border-left:4px solid var(--${a.severity}-color);background:rgba(${a.severity==='danger'?'239,68,68':'245,158,11'},0.05);border-radius:4px;">
                <div style="font-weight:600;font-size:0.85rem;">${a.type}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">${a.message.substring(0,60)}...</div>
            </div>`).join('') || '<div style="color:var(--text-muted);font-size:0.85rem;">No active alerts</div>';
    }

    // F96: Activity Feed
    if (typeof window.renderActivityFeed === 'function') window.renderActivityFeed('activityFeedContainer');
};

// F27: Chart date range filter
window.setChartRange = function(days) {
    ['7','30','90'].forEach(d => {
        const btn = document.getElementById(`chartFilter${d}`);
        if(btn) { btn.className = d == days ? 'btn btn-primary' : 'btn btn-outline'; btn.style.padding='4px 12px'; btn.style.fontSize='0.75rem'; }
    });
    const labels7 = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const labels30 = ['W1','W2','W3','W4'];
    const labels90 = ['Jul','Aug','Sep'];
    const data7i = [1200,1900,800,1500,2000,500,300], data7o = [800,1200,1500,1000,2500,800,400];
    const data30i = [8500,9200,7800,10200], data30o = [7200,8400,9100,8800];
    const data90i = [35000,42000,38000], data90o = [32000,38000,41000];
    if (!window._dashChart) return;
    window._dashChart.data.labels = days===7?labels7:days===30?labels30:labels90;
    window._dashChart.data.datasets[0].data = days===7?data7i:days===30?data30i:data90i;
    window._dashChart.data.datasets[1].data = days===7?data7o:days===30?data30o:data90o;
    window._dashChart.update();
    window.showToast(`Chart updated: Last ${days} days`, 'info');
};
