// Distributor Portal View

window.renderDistributor = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-store' style="color: var(--primary-color);"></i> Distributor Portal Configuration</h1>
                <button class="btn btn-outline" onclick="window.openMockPortal()"><i class='bx bx-link-external'></i> Open Mock Portal</button>
            </div>

            <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, var(--bg-sidebar), #1e293b); color: white; border: none;">
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 50%; font-size: 48px; display: flex; align-items: center; justify-content: center;">
                        <i class='bx bx-globe'></i>
                    </div>
                    <div>
                        <h2 style="margin: 0 0 8px 0; font-size: 1.5rem;">B2B Distributor Ordering System</h2>
                        <p style="color: #cbd5e1; margin-bottom: 16px; font-size: 0.95rem;">Give your distributors a self-service portal to place orders, check live stock, and download invoices directly, reducing manual entry.</p>
                        <div style="display: flex; gap: 12px;">
                            <span style="background: var(--secondary-color); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;"><i class='bx bx-check'></i> Portal Active</span>
                            <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-family: monospace;">distributor.namkeenwms.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Recent Portal Orders</h2>
                    </div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Distributor</th>
                                <th>Order ID</th>
                                <th>Value</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight: 500;">SuperMart Retailers</td>
                                <td>B2B-1004</td>
                                <td>₹45,200</td>
                                <td id="b2bOrderActionCell"><button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.convertB2bOrder('B2B-1004', 'SuperMart Retailers')">Convert to SO</button></td>
                            </tr>
                            <tr>
                                <td style="font-weight: 500;">City Traders</td>
                                <td>B2B-1003</td>
                                <td>₹12,500</td>
                                <td><span class="status status-success" style="font-size: 0.7rem;">Processed</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="card">
                    <h2 class="section-title">Distributor Access Management</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Distributor Name</th>
                                <th>Region</th>
                                <th>Portal Access</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="font-weight: 500;">SuperMart Retailers</td>
                                <td>North Zone</td>
                                <td>
                                    <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;" onclick="window.toggleDistributorAccess(this, 'SuperMart Retailers')">
                                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-weight: 500;">City Traders</td>
                                <td>West Zone</td>
                                <td>
                                    <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;" onclick="window.toggleDistributorAccess(this, 'City Traders')">
                                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="font-weight: 500;">Fresh Foods Pvt Ltd</td>
                                <td>South Zone</td>
                                <td>
                                    <div style="width: 40px; height: 20px; background: var(--border-color); border-radius: 10px; position: relative; cursor: pointer;" onclick="window.toggleDistributorAccess(this, 'Fresh Foods Pvt Ltd')">
                                        <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; left: 2px; top: 2px;"></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <button class="btn btn-outline" style="width: 100%; margin-top: 16px; padding: 6px;" onclick="window.inviteDistributorPrompt()"><i class='bx bx-user-plus'></i> Invite Distributor</button>
                </div>
            </div>
        </div>
    `;
};

window.openMockPortal = function() {
    alert("🚀 Distributor Self-Service Portal Simulator:\nURL: https://distributor.namkeenwms.com\nStatus: Online & Syncing with WMS");
};

window.convertB2bOrder = function(orderId, customer) {
    if (typeof DataManager !== 'undefined') {
        const newSO = {
            id: 'SO-' + Math.floor(4500 + Math.random() * 500),
            customer: customer + ' (B2B Portal)',
            type: 'B2B Self-Order',
            status: 'Ready for Dispatch',
            statusClass: 'status-success',
            flags: '<span style="font-size: 0.7rem; color: var(--secondary-color);">(Portal Auto)</span>',
            invoice: ''
        };
        DataManager.addDispatchOrder(newSO);
    }
    const cell = document.getElementById('b2bOrderActionCell');
    if (cell) {
        cell.innerHTML = '<span class="status status-success" style="font-size: 0.7rem;">Converted (SO Created)</span>';
    }
    if (window.showToast) window.showToast(`Order ${orderId} converted to Sales Order! Check Dispatch view.`, 'success');
};

window.inviteDistributorPrompt = function() {
    const name = prompt("Enter Distributor Business Name:");
    if (!name) return;
    const email = prompt("Enter Contact Email:");
    if (!email) return;
    if (window.showToast) window.showToast(`Portal invitation link sent to ${name} (${email})`, 'success');
};

window.toggleDistributorAccess = function(el, name) {
    const circle = el.querySelector('div');
    const isActive = el.style.background.includes('primary-color');

    if (isActive) {
        el.style.background = 'var(--border-color)';
        if (circle) {
            circle.style.right = 'auto';
            circle.style.left = '2px';
        }
        if (window.showToast) window.showToast(`Portal access revoked for ${name}`, 'warning');
    } else {
        el.style.background = 'var(--primary-color)';
        if (circle) {
            circle.style.left = 'auto';
            circle.style.right = '2px';
        }
        if (window.showToast) window.showToast(`Portal access enabled for ${name}`, 'success');
    }
};

