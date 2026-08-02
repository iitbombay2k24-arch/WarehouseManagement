// Production View

window.renderProduction = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Production Tracking</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary"><i class='bx bx-play-circle'></i> Start Production Order</button>
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
                        <tbody>
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
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;">Finish Goods Receipt</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
