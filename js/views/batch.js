// Batch Management View

window.renderBatch = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Batch Management</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.createBatchPrompt()"><i class='bx bx-plus'></i> Create Batch</button>
                </div>
            </div>
            
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <h2 class="section-title">Active Batches (FEFO Tracking)</h2>
                    <div class="search-bar" style="width: 250px; background: var(--bg-main);">
                        <i class='bx bx-search'></i>
                        <input type="text" placeholder="Search batch number...">
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Batch No.</th>
                                <th>Product</th>
                                <th>Mfg Date</th>
                                <th>Expiry Date</th>
                                <th>Available Qty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="batchTableBody">
                            <tr>
                                <td><span style="font-weight: 600;">#B-2391</span></td>
                                <td>Aloo Bhujia (500g)</td>
                                <td>15-Jul-2026</td>
                                <td>15-Jan-2027</td>
                                <td>4,500</td>
                                <td><span class="status status-success">Healthy</span></td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.traceBatch('#B-2391')">Trace</button></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 600;">#B-2380</span></td>
                                <td>Navratna Mix (1kg)</td>
                                <td>10-Jun-2026</td>
                                <td>10-Dec-2026</td>
                                <td>800</td>
                                <td><span class="status status-warning">Near Expiry</span></td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.traceBatch('#B-2380')">Trace</button></td>
                            </tr>
                            <tr>
                                <td><span style="font-weight: 600;">#B-2375</span></td>
                                <td>Plain Sev (100g)</td>
                                <td>01-May-2026</td>
                                <td>01-Nov-2026</td>
                                <td>0</td>
                                <td><span class="status status-danger">Expired/Depleted</span></td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.traceBatch('#B-2375')">Trace</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.createBatchPrompt = function() {
    const product = prompt("Enter Product Name:", "Aloo Bhujia (500g)");
    if (!product) return;
    const qty = prompt("Initial Quantity:", "1000");
    if (!qty) return;

    const bNum = '#B-' + Math.floor(2400 + Math.random() * 100);
    const tbody = document.getElementById('batchTableBody');

    if (tbody) {
        tbody.innerHTML += `
            <tr>
                <td><span style="font-weight: 600;">${bNum}</span></td>
                <td>${product}</td>
                <td>Today</td>
                <td>In 6 Months</td>
                <td>${qty}</td>
                <td><span class="status status-success">Healthy</span></td>
                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="window.traceBatch('${bNum}')">Trace</button></td>
            </tr>
        `;
    }

    if (window.showToast) window.showToast(`Batch ${bNum} created for ${product}`, 'success');
};

window.traceBatch = function(bNum) {
    if (window.showToast) window.showToast(`Full FEFO genealogy trace generated for ${bNum}`, 'info');
};

