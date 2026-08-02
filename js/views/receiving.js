// Receiving View

window.renderReceiving = function() {
    setTimeout(() => {
        if(window.refreshReceivingTable) {
            window.refreshReceivingTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Receiving Operations</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.toggleAddGRN()"><i class='bx bx-plus'></i> New GRN (Goods Receipt Note)</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-truck'></i></div>
                    <div class="widget-value">5</div>
                    <div class="widget-title">Pending Deliveries</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-check-shield'></i></div>
                    <div class="widget-value">12</div>
                    <div class="widget-title">Quality Inspected</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon red"><i class='bx bx-message-square-error'></i></div>
                    <div class="widget-value">2</div>
                    <div class="widget-title">Damage Reports</div>
                </div>
            </div>

            <!-- Add GRN Form (Hidden by default) -->
            <div id="addGRNForm" style="display: none; background: var(--bg-main); padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid var(--border-color);">
                <h3 style="margin-top: 0;">Create New GRN</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <input type="text" id="grnId" placeholder="GRN Number (e.g. GRN-2026-090)" class="form-control">
                    <input type="text" id="grnSupplier" placeholder="Supplier" class="form-control">
                    <input type="text" id="grnDate" placeholder="Date/Time (e.g. Today, 11:00 AM)" class="form-control">
                    <input type="number" id="grnItems" placeholder="Number of Items" class="form-control">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" onclick="window.saveNewGRN()">Save GRN</button>
                    <button class="btn btn-outline" onclick="document.getElementById('addGRNForm').style.display='none'">Cancel</button>
                </div>
            </div>

            <div class="card">
                <h2 class="section-title">Recent Goods Receipt Notes (GRN)</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>GRN Number</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Inspection Status</th>
                                <th>Put-away / Action</th>
                            </tr>
                        </thead>
                        <tbody id="receivingTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.toggleAddGRN = function() {
    const form = document.getElementById('addGRNForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

window.saveNewGRN = function() {
    const id = document.getElementById('grnId').value;
    const supplier = document.getElementById('grnSupplier').value;
    const date = document.getElementById('grnDate').value;
    const items = document.getElementById('grnItems').value;

    if (!id || !supplier) {
        alert("Please enter GRN Number and Supplier");
        return;
    }

    if(typeof DataManager !== 'undefined') {
        DataManager.addReceiving({ 
            id, supplier, date, items, status: 'Pending', statusClass: 'status-warning'
        });
        
        document.getElementById('grnId').value = '';
        document.getElementById('grnSupplier').value = '';
        document.getElementById('grnDate').value = '';
        document.getElementById('grnItems').value = '';
        document.getElementById('addGRNForm').style.display = 'none';
        
        window.refreshReceivingTable();
    } else {
        alert("DataManager not initialized.");
    }
};

window.deleteGRN = function(id) {
    if(confirm("Are you sure you want to delete GRN " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteReceiving(id);
            window.refreshReceivingTable();
        }
    }
};

window.refreshReceivingTable = function() {
    const tbody = document.getElementById('receivingTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const grns = DataManager.getReceiving();
    let html = '';
    
    grns.forEach(grn => {
        let actionBtn = grn.status === 'Passed' 
            ? `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;">Auto Put-away</button>`
            : `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" disabled>Wait</button>`;
            
        html += `
            <tr>
                <td><span style="font-family: monospace; font-weight: 600;">${grn.id}</span></td>
                <td>${grn.supplier}</td>
                <td>${grn.date}</td>
                <td>${grn.items}</td>
                <td><span class="status ${grn.statusClass}">${grn.status}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${actionBtn}
                        <button class="icon-btn" style="color: var(--danger-color); padding: 2px;" onclick="window.deleteGRN('${grn.id}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};
