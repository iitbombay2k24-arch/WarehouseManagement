// Reports View

window.renderReports = function() {
    setTimeout(() => {
        if(window.refreshAuditTrailTable) {
            window.refreshAuditTrailTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Reports & Analytics</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-export'></i> Export PDF</button>
                    <button class="btn btn-outline"><i class='bx bx-export'></i> Export CSV</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card" style="grid-column: span 2;">
                    <h2 class="section-title">KPI Dashboard</h2>
                    <div style="display: flex; gap: 24px; margin-top: 16px;">
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">Inventory Turnover</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">8.4x</div>
                            <div style="font-size: 0.75rem; color: var(--secondary-color);"><i class='bx bx-up-arrow-alt'></i> +12% vs last month</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">Order Fulfillment Rate</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">99.2%</div>
                            <div style="font-size: 0.75rem; color: var(--secondary-color);"><i class='bx bx-up-arrow-alt'></i> +0.5% vs last month</div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-muted);">Stock Accuracy</div>
                            <div style="font-size: 1.5rem; font-weight: 700;">99.8%</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">- No change</div>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="grid-column: span 2;">
                    <h2 class="section-title">Fast vs Slow Moving SKUs</h2>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Aloo Bhujia (500g)</span>
                        <span class="status status-success">Fast Moving</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Navratna Mix (1kg)</span>
                        <span class="status status-success">Fast Moving</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px;">
                        <span style="font-weight: 500;">Diet Chivda (500g)</span>
                        <span class="status status-warning">Slow Moving</span>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="card" style="display: flex; align-items: center; justify-content: center; min-height: 200px; border: 2px dashed var(--border-color); background: rgba(0,0,0,0.02); cursor: pointer; transition: all 0.2s;">
                    <div style="text-align: center;">
                        <i class='bx bx-layer-plus' style="font-size: 48px; color: var(--primary-color); margin-bottom: 8px;"></i>
                        <h3 style="margin: 0; color: var(--text-main);">Custom Report Builder</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 250px; margin: 8px auto 0;">Drag and drop fields to create any custom report without developer help.</p>
                    </div>
                </div>
                <div class="card">
                    <h2 class="section-title">Executive Drill-Down Dashboard</h2>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Click on any KPI to see the underlying data rows instantly.</p>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="background: var(--bg-main); padding: 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='transparent'">
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Fill Rate</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">98.5%</div>
                        </div>
                        <div style="background: var(--bg-main); padding: 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='transparent'">
                            <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Order Accuracy</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--secondary-color);">99.1%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Profitability per SKU (After All Costs)</h2>
                        <i class='bx bx-bar-chart' style="color: var(--text-muted); font-size: 20px;"></i>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Aloo Bhujia (500g)</span> <span style="font-weight: 600; color: var(--secondary-color);">42% Margin</span></div>
                            <div style="width: 100%; background: var(--bg-main); height: 6px; border-radius: 3px;"><div style="width: 85%; background: var(--secondary-color); height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Khatta Meetha (1kg)</span> <span style="font-weight: 600; color: var(--secondary-color);">35% Margin</span></div>
                            <div style="width: 100%; background: var(--bg-main); height: 6px; border-radius: 3px;"><div style="width: 65%; background: var(--secondary-color); height: 100%; border-radius: 3px;"></div></div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;"><span>Mathri (250g)</span> <span style="font-weight: 600; color: var(--warning-color);">12% Margin</span></div>
                            <div style="width: 100%; background: var(--bg-main); height: 6px; border-radius: 3px;"><div style="width: 25%; background: var(--warning-color); height: 100%; border-radius: 3px;"></div></div>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600;">Space Utilization</div>
                            <span class="status status-success">85% Optimal</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">Warehouse volume filled vs empty</div>
                        <div style="width: 100%; background: var(--bg-main); height: 12px; border-radius: 6px; overflow: hidden; display: flex;">
                            <div style="width: 85%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); height: 100%;"></div>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600;">Carbon Footprint Estimate <span style="background: rgba(16, 185, 129, 0.1); color: var(--secondary-color); padding: 2px 6px; border-radius: 10px; font-size: 0.65rem;">FUTURE</span></div>
                            <i class='bx bx-leaf' style="color: var(--secondary-color);"></i>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Estimated CO2 emissions from manufacturing and logistics: <span style="font-weight: bold; color: var(--text-main);">12.4 Tons (YTD)</span></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title">Audit Trail & Stock Movement</h2>
                    <select class="form-control" style="width: 200px;">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="auditTrailBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.refreshAuditTrailTable = function() {
    const tbody = document.getElementById('auditTrailBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const logs = DataManager.getAuditTrail();
    let html = '';
    
    logs.forEach(log => {
        html += `
            <tr>
                <td>${log.date}</td>
                <td>${log.user}</td>
                <td><span class="status ${log.actionClass}">${log.action}</span></td>
                <td>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        ${log.details}
                        <button class="icon-btn" style="color: var(--danger-color); padding: 2px;" onclick="window.deleteAuditLog('${log.id}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.deleteAuditLog = function(id) {
    if(confirm("Are you sure you want to delete this log?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteAuditLog(id);
            window.refreshAuditTrailTable();
        }
    }
};
