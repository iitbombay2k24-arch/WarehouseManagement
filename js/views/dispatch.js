// Dispatch View

window.renderDispatch = function() {
    setTimeout(() => { if(window.refreshDispatchTable) window.refreshDispatchTable(); }, 100);

    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 class="page-title" style="margin:0;">Dispatch Management</h1>
                <div style="display:flex;gap:12px;">
                    <!-- F50: Dispatch Calendar -->
                    <button class="btn btn-outline" onclick="window.showDispatchCalendar()"><i class='bx bx-calendar'></i> Dispatch Calendar</button>
                    <button class="btn btn-primary" onclick="window.createSalesOrderPrompt()"><i class='bx bx-file-blank'></i> New Sales Order</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-list-check'></i></div>
                    <div class="widget-value">24</div>
                    <div class="widget-title">Pending Picking Lists</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon orange"><i class='bx bx-box'></i></div>
                    <div class="widget-value">18</div>
                    <div class="widget-title">Awaiting Packing Verification</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-receipt'></i></div>
                    <div class="widget-value">42</div>
                    <div class="widget-title">Invoices / e-Way Bills Generated</div>
                </div>
            </div>

            <!-- Advanced Order Management Strategies -->
            <div style="display:flex;gap:12px;margin-bottom:24px;border-bottom:1px solid var(--border-color);padding-bottom:16px;">
                <button class="btn btn-primary" style="border-radius:20px;">B2B / Wholesale Fulfillment</button>
                <button class="btn btn-outline" style="border-radius:20px;border:none;">B2C / Omnichannel Streaming</button>
            </div>

            <div class="card" style="margin-bottom:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="section-title" style="margin:0;"><i class='bx bx-water'></i> Wave Management & Order Streaming</h2>
                    <button class="btn btn-primary" style="padding:4px 12px;font-size:0.8rem;" onclick="window.showToast('Wave #W-4413 released to warehouse pickers', 'success')"><i class='bx bx-play'></i> Launch Next Wave</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div style="border:1px solid var(--border-color);padding:12px;border-radius:8px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:600;">Wave #W-4412 (Morning B2B)</span>
                            <span class="status status-success">Releasing (75%)</span>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Orders: 42 | Estimated Duration: 1.5 hrs</div>
                        <div style="width:100%;background:var(--bg-main);height:8px;border-radius:4px;">
                            <div style="width:75%;background:var(--primary-color);height:100%;border-radius:4px;"></div>
                        </div>
                    </div>
                    <div style="border:1px dashed var(--border-color);padding:12px;border-radius:8px;background:rgba(59, 130, 246, 0.02);">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:600;">Waveless / Continuous E-com</span>
                            <span class="status status-info">Active</span>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">Streaming individual D2C orders directly to floor.</div>
                        <div style="display:flex;gap:8px;font-size:0.75rem;color:var(--primary-color);">
                            <span><i class='bx bx-loader-circle bx-spin'></i> 5 orders in buffer...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="section-title" style="margin:0;">Today's Dispatch Orders</h2>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;"><i class='bx bx-package'></i> Kitting / Bundling</button>
                        <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;"><i class='bx bx-cut'></i> Split Large Order</button>
                        <!-- F47: E-Way Bill Bulk Generation (mock) -->
                        <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;" onclick="window.generateEWayBill('BULK')"><i class='bx bx-receipt'></i> Generate GST Invoice</button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Invoice/e-Way Bill</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="dispatchTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.refreshDispatchTable = function() {
    const tbody = document.getElementById('dispatchTableBody');
    if(!tbody || typeof DataManager === 'undefined') return;

    const orders = DataManager.getDispatchOrders();
    let html = '';
    
    orders.forEach(order => {
        const oid = order.id;
        let actionBtn = order.status === 'Dispatched'
            ? `<span style="font-size:0.8rem;color:var(--text-muted);">Shipped${order.qty ? ' (−' + escapeHtml(order.qty) + ')' : ''}</span>`
            : (order.status === 'Urgent Dispatch'
                ? `<button class="btn btn-primary" style="padding:4px 8px;font-size:0.8rem;background:var(--danger-color);" onclick="window.dispatchOrderNow('${escJs(oid)}')">Dispatch Now</button>`
                : `<button class="btn btn-outline" style="padding:4px 8px;font-size:0.8rem;" onclick="window.dispatchOrderNow('${escJs(oid)}')">Dispatch</button>`);

        let generateBtn = order.invoice !== '' 
            ? order.invoice 
            : `<button class="btn btn-outline" style="padding:2px 8px;font-size:0.7rem;" onclick="window.generateEWayBill('${escJs(order.id)}')">Generate</button>`;

        let rowStyle = order.status === 'Urgent Dispatch' ? `style="background:rgba(239, 68, 68, 0.05);"` : '';

        html += `
            <tr ${rowStyle}>
                <td>
                    <span style="font-weight:600;">${escapeHtml(order.id)}</span>
                    ${order.flags}
                </td>
                <td>${escapeHtml(order.customer)}</td>
                <td>${order.type}</td>
                <td><span class="status ${order.statusClass}">${escapeHtml(order.status)}</span></td>
                <td>${generateBtn}</td>
                <td>
                    <div style="display:flex;gap:4px;align-items:center;">
                        ${actionBtn}
                        <!-- F46: Route Optimization -->
                        <button class="icon-btn" title="Route Optimizer (F46)" onclick="window.showRouteOptimizer('${escJs(order.id)}')"><i class='bx bx-map-alt' style="color:var(--primary-color);"></i></button>
                        <!-- F48: Proof of Delivery -->
                        <button class="icon-btn" title="Proof of Delivery (F48)" onclick="window.showPODUpload('${escJs(order.id)}')"><i class='bx bx-camera'></i></button>
                        <!-- F49: Vehicle Inspection -->
                        <button class="icon-btn" title="Vehicle Inspection (F49)" onclick="window.showVehicleInspection('${escJs(order.id)}')"><i class='bx bx-car'></i></button>
                        
                        <button class="icon-btn" style="color:var(--danger-color);padding:2px;" onclick="window.deleteDispatchOrder('${escJs(order.id)}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.deleteDispatchOrder = function(id) {
    if(confirm("Are you sure you want to delete Order " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteDispatchOrder(id);
            window.refreshDispatchTable();
            if (window.showToast) window.showToast(`Dispatch Order ${id} deleted`, 'danger');
        }
    }
};

window.createSalesOrderPrompt = function() {
    const customer = prompt("Enter Customer / Retailer Name:", "SuperMart Retailers");
    if (!customer) return;

    const prods = DataManager.getProducts();
    const sku = (prompt("Product SKU to ship (leave blank for none):\n" + prods.map(p => p.id + " = " + p.name + " (" + p.stock + " in stock)").join("\n"), prods[0] ? prods[0].id : "") || "").trim();
    let qty = 0;
    if (sku) {
        if (!prods.some(p => p.id === sku)) { window.showToast("Unknown SKU " + sku, 'danger'); return; }
        qty = Number(prompt("Quantity to ship:", "10"));
        if (!isFinite(qty) || qty <= 0) { window.showToast("Enter a valid quantity", 'danger'); return; }
    }
    const newSO = {
        sku, qty,
        id: 'SO-' + Date.now().toString().slice(-6),
        customer: customer,
        type: 'Standard',
        status: 'Urgent Dispatch',
        statusClass: 'status-danger',
        flags: '<span style="font-size: 0.7rem; color: var(--danger-color); font-weight: bold;">(Manual)</span>',
        invoice: ''
    };

    if (typeof DataManager !== 'undefined') {
        DataManager.addDispatchOrder(newSO);
        window.refreshDispatchTable();
        if (window.showToast) window.showToast(`Sales Order ${newSO.id} created for ${customer}`, 'success');
    }
};



window.dispatchOrderNow = function(id) {
    const o = DataManager.getDispatchOrders().find(x => x.id === id);
    if (!o || o.status === 'Dispatched') return;
    try {
        if (o.sku && Number(o.qty) > 0) {
            StockLedger.post({ sku: o.sku, type: 'DISPATCH', qty: o.qty, ref: o.id, note: 'Shipped to ' + o.customer, idempotent: true });
        }
        DataManager.updateDispatchOrder(id, { status: 'Dispatched', statusClass: 'status-success' });
        window.showToast(o.sku ? `${id} dispatched: −${o.qty} from stock` : `${id} marked dispatched (no product linked, stock unchanged)`, 'success');
    } catch (e) { window.showToast(e.message, 'danger'); }
    window.refreshDispatchTable();
};
