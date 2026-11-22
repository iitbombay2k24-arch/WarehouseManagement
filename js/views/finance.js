// Finance & Accounting View

window.renderFinance = function() {
    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <h1 class="page-title" style="margin:0;"><i class='bx bx-rupee' style="color:var(--primary-color);"></i> Finance & Accounting</h1>
                <div style="display:flex;gap:12px;">
                    <button class="btn btn-outline" style="display:flex;align-items:center;gap:8px;" onclick="window.showToast('Tally ERP 9 Sync completed successfully! 14 vouchers updated.', 'success')"><i class='bx bx-sync'></i> Sync to Tally ERP</button>
                    <button class="btn btn-primary" onclick="window.showToast('Journal Entry #JE-891 created & posted', 'success')"><i class='bx bx-file'></i> New Journal Entry</button>
                </div>
            </div>
            
            <div style="display:flex;gap:12px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;">
                <!-- F51: GST Manager -->
                <button class="btn btn-outline" onclick="window.showGSTManager()"><i class='bx bx-receipt'></i> GST Filing</button>
                <!-- F52: Aging Reports -->
                <button class="btn btn-outline" onclick="window.showAgingReports()"><i class='bx bx-time-five'></i> AR/AP Aging</button>
                <!-- F53: Payment Terms -->
                <button class="btn btn-outline" onclick="window.showPaymentTerms()"><i class='bx bx-credit-card'></i> Payment Terms</button>
                <!-- F54: P&L Statement -->
                <button class="btn btn-outline" onclick="window.showPLStatement()"><i class='bx bx-line-chart'></i> P&L Report</button>
                <!-- F55: Cash Flow -->
                <button class="btn btn-outline" onclick="window.showCashFlow()"><i class='bx bx-water'></i> Cash Flow</button>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon red"><i class='bx bx-up-arrow-circle'></i></div>
                    <div class="widget-value">₹4.2L</div>
                    <div class="widget-title">Accounts Payable (AP)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-down-arrow-circle'></i></div>
                    <div class="widget-value">₹8.5L</div>
                    <div class="widget-title">Accounts Receivable (AR)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-calculator'></i></div>
                    <div class="widget-value">32%</div>
                    <div class="widget-title">Avg Gross Margin</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon orange"><i class='bx bx-package'></i></div>
                    <div class="widget-value">₹12.4L</div>
                    <div class="widget-title">Inventory Valuation (FIFO)</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Cost of Goods Sold (COGS) vs Budget</h2>
                        <select class="form-control" style="width: 150px; padding: 4px; font-size: 0.8rem;">
                            <option>July 2026</option>
                            <option>Q2 2026</option>
                        </select>
                    </div>
                    <!-- Chart area -->
                    <div style="height: 250px; position: relative; margin-top: 16px;">
                        <canvas id="financeChart"></canvas>
                    </div>
                </div>

                <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 8px;">Landed Cost Allocation</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">Apportion freight/duty to true SKU cost</div>
                        <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;" onclick="window.showToast('Freight & duty apportioned to SKU landed costs', 'info')">Calculate Costs</button>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 8px;">Debit/Credit Notes</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">Manage supplier/distributor adjustments</div>
                        <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;" onclick="window.showToast('Credit Note #CN-402 draft created', 'info')">Issue New Note</button>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 8px;">Payment Terms Auto-Reminders</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">Active: WhatsApp & Email nudges to distributors</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.75rem; color: var(--danger-color); font-weight: 600;">3 Overdue AR</span>
                            <button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem;" onclick="window.showToast('WhatsApp reminders sent to 3 overdue distributors', 'success')">Send Nudge</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.initFinance = function() {
    console.log("Finance initialized");
    const ctx = document.getElementById('financeChart');
    if (ctx) {
        if (window._financeChart) window._financeChart.destroy();
        window._financeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Raw Materials', 'Packaging', 'Labor'],
                datasets: [
                    {
                        label: 'Budget',
                        data: [350000, 150000, 200000],
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Actual',
                        data: [300000, 180000, 190000],
                        backgroundColor: function(context) {
                            const index = context.dataIndex;
                            const budget = context.dataset.data[index];
                            const actual = context.chart.data.datasets[0].data[index];
                            return budget > actual ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
                        },
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + (value / 100000) + 'L';
                            }
                        }
                    }
                }
            }
        });
    }
};
