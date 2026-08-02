// Production View

window.renderProduction = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Production Tracking</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.startProductionOrderPrompt()"><i class='bx bx-play-circle'></i> Start Production Order</button>
                </div>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">Active Production Orders</h2>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Raw Material Consumed</th>
                                <th>Packaging Track</th>
                                <th>Progress</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="productionTableBody">
                            <tr>
                                <td><span style="font-weight: 600;">PO-9921</span></td>
                                <td>Aloo Bhujia (500g)</td>
                                <td><span class="status status-success">Logged (120kg)</span></td>
                                <td><span class="status status-info">In Progress</span></td>
                                <td>
                                    <div style="width: 100%; background: var(--bg-main); border-radius: 4px; height: 8px; margin-top: 8px;">
                                        <div style="width: 65%; background: var(--primary-color); height: 100%; border-radius: 4px;"></div>
                                    </div>
                                </td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.finishGoodsReceipt('PO-9921')">Finish Goods Receipt</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.startProductionOrderPrompt = function() {
    const product = prompt("Enter Finished Product (e.g. Navratna Mix 1kg):", "Navratna Mix (1kg)");
    if (!product) return;
    const qty = prompt("Target Quantity (Pkts):", "500");
    if (!qty) return;

    const tbody = document.getElementById('productionTableBody');
    const orderId = 'PO-' + Math.floor(9000 + Math.random() * 999);

    if (tbody) {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-weight: 600;">${orderId}</span></td>
                <td>${product}</td>
                <td><span class="status status-success">Logged (${qty} Pkts)</span></td>
                <td><span class="status status-warning">Queued</span></td>
                <td>
                    <div style="width: 100%; background: var(--bg-main); border-radius: 4px; height: 8px; margin-top: 8px;">
                        <div style="width: 15%; background: var(--warning-color); height: 100%; border-radius: 4px;"></div>
                    </div>
                </td>
                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.finishGoodsReceipt('${orderId}')">Finish Goods Receipt</button></td>
            </tr>
        `;
    }

    if (window.showToast) window.showToast(`Production Order ${orderId} started for ${product}`, 'success');
};

window.finishGoodsReceipt = function(orderId) {
    if (window.showToast) window.showToast(`Goods Receipt Note logged for ${orderId}. Stock added to Finished Goods inventory.`, 'success');
};

