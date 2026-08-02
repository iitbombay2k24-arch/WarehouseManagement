// Dashboard View

window.renderDashboard = function() {
    return `
        <div class="fade-in">
            <h1 class="page-title">Warehouse Dashboard</h1>
            
            <!-- 1. Real-time warehouse dashboard & 2. Daily stock summary -->
            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue">
                        <i class='bx bx-package'></i>
                    </div>
                    <div class="widget-value">12,450</div>
                    <div class="widget-title">Total Active Stock (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green">
                        <i class='bx bx-down-arrow-circle'></i>
                    </div>
                    <div class="widget-value">1,250</div>
                    <div class="widget-title">Today's Inward (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon orange">
                        <i class='bx bx-up-arrow-circle'></i>
                    </div>
                    <div class="widget-value">840</div>
                    <div class="widget-title">Today's Outward (Kg)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon red">
                        <i class='bx bx-error-circle'></i>
                    </div>
                    <div class="widget-value">12</div>
                    <div class="widget-title">Low Stock SKUs</div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">Weekly Stock Movement</h2>
                <div style="height: 300px;">
                    <canvas id="dashboardChart"></canvas>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                <!-- 5. Today's inward/outward summary -->
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Recent Movements</h2>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;">View All</button>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Type</th>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#TRX-001</td>
                                    <td><span class="status status-success">Inward</span></td>
                                    <td>Aloo Bhujia (500g)</td>
                                    <td>+500</td>
                                    <td>10:24 AM</td>
                                </tr>
                                <tr>
                                    <td>#TRX-002</td>
                                    <td><span class="status status-warning">Outward</span></td>
                                    <td>Moong Dal (1kg)</td>
                                    <td>-200</td>
                                    <td>09:45 AM</td>
                                </tr>
                                <tr>
                                    <td>#TRX-003</td>
                                    <td><span class="status status-success">Inward</span></td>
                                    <td>Khatta Meetha (250g)</td>
                                    <td>+1000</td>
                                    <td>09:12 AM</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 3. Low stock alerts & 4. Near-expiry alerts -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card">
                        <h2 class="section-title">Alerts & Notifications</h2>
                        
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="padding: 12px; border-left: 4px solid var(--danger-color); background: rgba(239, 68, 68, 0.05); border-radius: 4px;">
                                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Low Stock Alert</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Plain Sev (100g) is below minimum threshold (Current: 50, Min: 100)</div>
                            </div>
                            
                            <div style="padding: 12px; border-left: 4px solid var(--warning-color); background: rgba(245, 158, 11, 0.05); border-radius: 4px;">
                                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Near Expiry Warning</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Batch #B-2391 (Navratna Mix) expires in 7 days.</div>
                            </div>

                            <div style="padding: 12px; border-left: 4px solid var(--danger-color); background: rgba(239, 68, 68, 0.05); border-radius: 4px;">
                                <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Low Stock Alert</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Diet Chivda (500g) is out of stock!</div>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="width: 100%; margin-top: 16px;">View All Alerts</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.initDashboard = function() {
    console.log("Dashboard initialized");
    const ctx = document.getElementById('dashboardChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Inward (Kg)',
                    data: [1200, 1900, 800, 1500, 2000, 500, 300],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Outward (Kg)',
                    data: [800, 1200, 1500, 1000, 2500, 800, 400],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }
};
