// Returns & Reverse Logistics View

window.renderReturns = function() {
    setTimeout(() => {
        if(window.refreshReturnsTable) {
            window.refreshReturnsTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-revision' style="color: var(--primary-color);"></i> Returns & Reverse Logistics</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-search'></i> Search RMA</button>
                    <button class="btn btn-primary" onclick="window.toggleAddReturn()"><i class='bx bx-plus'></i> New Return Request</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon orange"><i class='bx bx-time-five'></i></div>
                    <div class="widget-value">14</div>
                    <div class="widget-title">Pending Inspections</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-check-shield'></i></div>
                    <div class="widget-value">42</div>
                    <div class="widget-title">Restocked (This Week)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon red"><i class='bx bx-trash'></i></div>
                    <div class="widget-value">₹12.5k</div>
                    <div class="widget-title">Damaged Inventory Value</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-trending-down'></i></div>
                    <div class="widget-value">1.2%</div>
                    <div class="widget-title">Return Rate</div>
                </div>
            </div>
            
            <!-- Add New Return Form (Hidden by default) -->
            <div id="addReturnForm" style="display: none; background: var(--bg-main); padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid var(--border-color);">
                <h3 style="margin-top: 0;">Create New RMA</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <input type="text" id="newRmaId" placeholder="RMA ID (e.g. RMA-9000)" class="form-control">
                    <input type="text" id="newRmaCustomer" placeholder="Customer / Distributor" class="form-control">
                    <input type="text" id="newRmaItems" placeholder="Item Details (e.g. Mix 1kg x 5)" class="form-control">
                    <input type="text" id="newRmaReason" placeholder="Reason (e.g. Expired)" class="form-control">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="window.saveNewReturn()">Save RMA</button>
                    <button class="btn btn-outline" onclick="document.getElementById('addReturnForm').style.display='none'">Cancel</button>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">Active Return Authorizations (RMA)</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>RMA ID</th>
                                <th>Customer/Distributor</th>
                                <th>Item Details</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="returnsTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <div class="card">
                    <h2 class="section-title">Damaged Item Disposition</h2>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Items awaiting final disposition decision after inspection.</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 500;">Batch #B-2391 (Navratna Mix)</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: 15 Kg | Reason: Pest Damage</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn" style="background: var(--danger-color); color: white; padding: 4px 12px; font-size: 0.8rem;" onclick="window.dispositionAction('Write Off', '#B-2391')">Write Off</button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 500;">Batch #B-2405 (Plain Sev)</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Qty: 50 Kg | Reason: Expired</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn" style="background: var(--warning-color); color: white; padding: 4px 12px; font-size: 0.8rem;" onclick="window.dispositionAction('Repurpose for Animal Feed', '#B-2405')">Repurpose</button>
                                <button class="btn" style="background: var(--danger-color); color: white; padding: 4px 12px; font-size: 0.8rem;" onclick="window.dispositionAction('Write Off', '#B-2405')">Write Off</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h2 class="section-title">Return Trends</h2>
                    <div style="height: 200px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                        <canvas id="returnsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.toggleAddReturn = function() {
    const form = document.getElementById('addReturnForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

window.saveNewReturn = function() {
    const id = document.getElementById('newRmaId').value;
    const customer = document.getElementById('newRmaCustomer').value;
    const items = document.getElementById('newRmaItems').value;
    const reason = document.getElementById('newRmaReason').value;

    if (!id || !customer) {
        alert("Please enter RMA ID and Customer");
        return;
    }

    if(typeof DataManager !== 'undefined') {
        DataManager.addReturn({ 
            id, customer, items, reason, status: 'Pending Receipt', 
            reasonClass: 'status-info', reasonBg: 'rgba(59, 130, 246, 0.1)', reasonColor: 'var(--primary-color)' 
        });
        
        document.getElementById('newRmaId').value = '';
        document.getElementById('newRmaCustomer').value = '';
        document.getElementById('newRmaItems').value = '';
        document.getElementById('newRmaReason').value = '';
        document.getElementById('addReturnForm').style.display = 'none';
        
        window.refreshReturnsTable();
    } else {
        alert("DataManager not initialized.");
    }
};

window.deleteReturn = function(id) {
    if(confirm("Are you sure you want to delete RMA " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteReturn(id);
            window.refreshReturnsTable();
        }
    }
};

window.refreshReturnsTable = function() {
    const tbody = document.getElementById('returnsTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const returns = DataManager.getReturns();
    let html = '';
    
    returns.forEach(r => {
        html += `
            <tr>
                <td><span style="font-family: monospace; font-weight: 600;">${r.id}</span></td>
                <td>${r.customer}</td>
                <td>${r.items}</td>
                <td><span class="status ${r.reasonClass}" style="background: ${r.reasonBg}; color: ${r.reasonColor};">${r.reason}</span></td>
                <td>${r.status}</td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;">Action</button>
                        <button class="icon-btn" style="color: var(--danger-color); font-size: 1.1rem; padding: 2px;" onclick="window.deleteReturn('${r.id}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.initReturns = function() {
    console.log("Returns & Reverse Logistics initialized");
    const ctx = document.getElementById('returnsChart');
    if (ctx) {
        try {
            if (window._returnsChart) window._returnsChart.destroy();
            window._returnsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Damaged', 'Expired', 'Overstock', 'Wrong Item'],
                    datasets: [{
                        data: [45, 25, 20, 10],
                        backgroundColor: [
                            '#ef4444', // red
                            '#f59e0b', // orange
                            '#10b981', // green
                            '#3b82f6'  // blue
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        } catch(e) { console.error("Chart error in returns", e); }
    }
};

window.dispositionAction = function(action, batch) {
    if (window.showToast) window.showToast(`Disposition '${action}' logged for ${batch}`, 'success');
};

