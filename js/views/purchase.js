// Purchase & Supplier Management View

window.renderPurchase = function() {
    setTimeout(() => { if(window.refreshPurchaseTable) window.refreshPurchaseTable(); }, 100);

    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 class="page-title" style="margin:0;"><i class='bx bx-cart' style="color:var(--primary-color);"></i> Purchase Orders & Suppliers</h1>
                <div style="display:flex;gap:12px;">
                    <!-- F43: Supplier Price Comparison -->
                    <button class="btn btn-outline" onclick="window.showPriceComparison()"><i class='bx bx-line-chart'></i> Compare Prices</button>
                    <button class="btn btn-outline" onclick="window.addSupplierPrompt()"><i class='bx bx-user-plus'></i> Add Supplier</button>
                    <button class="btn btn-primary" onclick="window.createPOPrompt()"><i class='bx bx-file-blank'></i> Create PO</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-time'></i></div>
                    <div class="widget-value">12</div>
                    <div class="widget-title">Pending POs</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-check-double'></i></div>
                    <div class="widget-value">3</div>
                    <div class="widget-title">3-Way Matches Pending</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon purple"><i class='bx bx-building'></i></div>
                    <div class="widget-value">2</div>
                    <div class="widget-title">Vendor Managed (VMI)</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon orange"><i class='bx bx-group'></i></div>
                    <div class="widget-value">45</div>
                    <div class="widget-title">Active Suppliers</div>
                </div>
            </div>

            <!-- Advanced Purchasing Ops -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                <div class="card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <h2 class="section-title" style="margin:0;font-size:1rem;">Multi-Supplier Bidding (RFQ)</h2>
                        <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.showToast('New RFQ draft initiated for Raw Spices', 'info')">New RFQ</button>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Active Bids: 1 (Refined Palm Oil - 500L)</div>
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;background:var(--bg-main);padding:8px;border-radius:4px;">
                        <span>Lowest Bid: ₹45,000</span>
                        <span style="color:var(--secondary-color);font-weight:bold;">Premium Oils Co.</span>
                    </div>
                </div>
                <div class="card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                        <h2 class="section-title" style="margin:0;font-size:1rem;">Blanket Purchase Orders</h2>
                        <!-- F42: Blanket PO Manager -->
                        <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.showBlanketPOManager()">Manage Releases</button>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Long-term agreements with quantity releases</div>
                    <div style="width:100%;background:var(--bg-main);height:8px;border-radius:4px;">
                        <div style="width:75%;background:var(--info-color);height:100%;border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.75rem;text-align:right;margin-top:4px;">75% of Corrugated Boxes Quota Used</div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
                <div class="card">
                    <h2 class="section-title">Recent Purchase Orders</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>PO Number</th>
                                <th>Supplier</th>
                                <th>Date Issued</th>
                                <th>Expected Delivery</th>
                                <th>Status</th>
                                <th>Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="purchaseTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>

                <div class="card">
                    <h2 class="section-title">Supplier Performance</h2>
                    <div style="display:flex;flex-direction:column;gap:16px;">
                        <div style="border-bottom:1px solid var(--border-color);padding-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span style="font-weight:600;">ABC Spices Ltd.</span>
                                <span><i class='bx bxs-star' style="color:var(--warning-color);"></i> 4.8</span>
                            </div>
                            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Avg Lead Time: 4 days</div>
                            <div style="width:100%;background:var(--bg-main);height:6px;border-radius:3px;">
                                <div style="width:95%;background:var(--secondary-color);height:100%;border-radius:3px;"></div>
                            </div>
                            <div style="font-size:0.75rem;text-align:right;margin-top:4px;">95% On-Time Delivery</div>
                        </div>
                        
                        <div style="border-bottom:1px solid var(--border-color);padding-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span style="font-weight:600;">Premium Oils Co.</span>
                                <span><i class='bx bxs-star' style="color:var(--warning-color);"></i> 4.2</span>
                            </div>
                            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Avg Lead Time: 3 days</div>
                            <div style="width:100%;background:var(--bg-main);height:6px;border-radius:3px;">
                                <div style="width:82%;background:var(--warning-color);height:100%;border-radius:3px;"></div>
                            </div>
                            <div style="font-size:0.75rem;text-align:right;margin-top:4px;">82% On-Time Delivery</div>
                        </div>

                        <div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span style="font-weight:600;">Global Packaging</span>
                                <span><i class='bx bxs-star' style="color:var(--warning-color);"></i> 3.5</span>
                            </div>
                            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">Avg Lead Time: 12 days (Delayed)</div>
                            <div style="width:100%;background:var(--bg-main);height:6px;border-radius:3px;">
                                <div style="width:60%;background:var(--danger-color);height:100%;border-radius:3px;"></div>
                            </div>
                            <div style="font-size:0.75rem;text-align:right;margin-top:4px;">60% On-Time Delivery</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.refreshPurchaseTable = function() {
    const tbody = document.getElementById('purchaseTableBody');
    if(!tbody || typeof DataManager === 'undefined') return;

    const orders = DataManager.getPurchaseOrders();
    let html = '';
    
    orders.forEach(po => {
        html += `
            <tr>
                <td><span style="font-family:monospace;font-weight:600;">${po.id}</span></td>
                <td>${po.supplier}</td>
                <td>${po.date}</td>
                <td>${po.expected}</td>
                <td><span class="status ${po.statusClass}">${po.status}</span></td>
                <td style="font-weight:600;">${po.total}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        ${po.status === 'Draft' ? `
                        <!-- F41: PO Approval -->
                        <button class="icon-btn" title="Approve PO" onclick="window.approvePO('${po.id}')"><i class='bx bx-check' style="color:var(--secondary-color);"></i></button>
                        <button class="icon-btn" title="Reject PO" onclick="window.rejectPO('${po.id}')"><i class='bx bx-x' style="color:var(--danger-color);"></i></button>
                        ` : ''}
                        <!-- F44: Amendments -->
                        <button class="icon-btn" title="Amendments (F44)" onclick="window.showPOAmendments('${po.id}')"><i class='bx bx-history'></i></button>
                        <!-- F45: PDF Preview -->
                        <button class="icon-btn" title="View PDF (F45)" onclick="window.showPOPreview('${po.id}')"><i class='bx bxs-file-pdf' style="color:var(--danger-color);"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.deletePurchaseOrder = function(id) {
    if(confirm("Are you sure you want to delete PO " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deletePurchaseOrder(id);
            window.refreshPurchaseTable();
            if(window.showToast) window.showToast('PO ' + id + ' deleted', 'danger');
        }
    }
};

window.addSupplierPrompt = function() {
    const name = prompt("Enter Supplier Name:");
    if (!name) return;
    if (window.showToast) window.showToast(`Supplier '${name}' added successfully!`, 'success');
};

window.createPOPrompt = function() {
    const supplier = prompt("Enter Supplier Name (e.g. ABC Spices Ltd.):", "ABC Spices Ltd.");
    if (!supplier) return;
    const value = prompt("Enter Estimated PO Value (₹):", "50,000");
    if (!value) return;

    const newPO = {
        id: 'PO-2026-' + Math.floor(1000 + Math.random() * 9000),
        supplier: supplier,
        date: 'Today',
        expected: 'In 5 Days',
        status: 'Sent',
        statusClass: 'status-info',
        value: '₹' + value
    };

    if (typeof DataManager !== 'undefined') {
        DataManager.addPurchaseOrder(newPO);
        window.refreshPurchaseTable();
        if (window.showToast) window.showToast(`Purchase Order ${newPO.id} created!`, 'success');
    }
};

