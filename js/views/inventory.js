// Inventory View

window.renderInventory = function() {
    setTimeout(() => {
        if(window.refreshInventoryTable) {
            window.refreshInventoryTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Inventory Control</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-transfer'></i> Stock Transfer</button>
                    <button class="btn btn-primary"><i class='bx bx-adjust'></i> Inventory Adjustment</button>
                </div>
            </div>

            <!-- Tabs -->
            <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px;">
                <button class="btn btn-primary" style="border-radius: 20px;">Live Stock & Locations</button>
                <button class="btn btn-outline" style="border-radius: 20px; border: none;">Cycle Counting 🔴</button>
            </div>

            <!-- Cycle Counting Section -->
            <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--primary-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title" style="margin: 0;">Scheduled Cycle Counts (Drone & Manual)</h2>
                    <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;"><i class='bx bx-plus'></i> Schedule Count</button>
                </div>
                <div style="display: flex; gap: 24px;">
                    <div style="flex: 1; border: 1px solid var(--border-color); padding: 16px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">Zone A (Racks 1-5)</span>
                            <span class="status status-warning">In Progress</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;"><i class='bx bx-user'></i> Assigned to: Scanner 1</div>
                        <div style="width: 100%; background: var(--bg-main); height: 8px; border-radius: 4px;">
                            <div style="width: 45%; background: var(--primary-color); height: 100%; border-radius: 4px;"></div>
                        </div>
                        <div style="font-size: 0.75rem; text-align: right; margin-top: 4px;">45% Complete</div>
                    </div>
                    <div style="flex: 1; border: 1px solid var(--border-color); padding: 16px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: 600;">Zone C (Top Racks)</span>
                            <span class="status status-info">Automated Scan</span>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;"><i class='bx bx-paper-plane'></i> Assigned to: Drone Alpha-1</div>
                        <button class="btn btn-outline" style="width: 100%; padding: 4px; font-size: 0.8rem;"><i class='bx bx-play-circle'></i> Start Drone Scan</button>
                    </div>
                </div>
            </div>

            <!-- Min/Max Replenishment Section -->
            <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--secondary-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title" style="margin: 0;"><i class='bx bx-transfer-alt'></i> Min/Max & Demand-Based Replenishment</h2>
                    <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;"><i class='bx bx-play'></i> Auto-Replenish Now</button>
                </div>
                <div class="table-container">
                    <table class="table" style="font-size: 0.85rem;">
                        <thead>
                            <tr>
                                <th>Item (SKU)</th>
                                <th>Forward Pick Loc</th>
                                <th>Current Qty</th>
                                <th>Min / Max</th>
                                <th>Status</th>
                                <th>Suggested Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Aloo Bhujia (500g)</td>
                                <td>Z1-R4-B12</td>
                                <td><span style="font-weight: bold; color: var(--danger-color);">15 Pkts</span></td>
                                <td>50 / 200 Pkts</td>
                                <td><span class="status status-danger" style="background: rgba(239,68,68,0.1); color: var(--danger-color);">Below Min</span></td>
                                <td><button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;">Move 185 from Reserve</button></td>
                            </tr>
                            <tr>
                                <td>Moong Dal (1kg)</td>
                                <td>Z1-R3-B10</td>
                                <td>80 Pkts</td>
                                <td>50 / 150 Pkts</td>
                                <td><span class="status status-warning" style="background: rgba(245,158,11,0.1); color: var(--warning-color);">Approaching Min</span></td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;">Schedule Replenish</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Aging & Perishable Alerts -->
            <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--warning-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title" style="margin: 0;"><i class='bx bx-alarm-exclamation'></i> Inventory Aging & Expiration Alerts</h2>
                </div>
                <div style="display: flex; gap: 16px;">
                    <div style="flex: 1; padding: 12px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px;">
                        <div style="font-weight: 600; color: var(--warning-color); margin-bottom: 4px;">Soon to Expire (Next 7 Days)</div>
                        <div style="font-size: 0.85rem;">Batch <strong>#B-822</strong> (Khatta Meetha 250g)</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Location: Z2-R1-B05 • Qty: 300 Pkts</div>
                    </div>
                    <div style="flex: 1; padding: 12px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px;">
                        <div style="font-weight: 600; color: var(--danger-color); margin-bottom: 4px;">Perishable Quality Risk</div>
                        <div style="font-size: 0.85rem;">Batch <strong>#B-799</strong> (Moong Dal 1kg)</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Location: Z1-R3-B10 • Qty: 50 Pkts • Storage Temp Alert</div>
                    </div>
                    <div style="flex: 1; padding: 12px; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 8px;">
                        <div style="font-weight: 600; color: var(--primary-color); margin-bottom: 4px;">Slow Moving / Aging (>90 Days)</div>
                        <div style="font-size: 0.85rem;">Batch <strong>#B-501</strong> (Diet Chivda 500g)</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Location: Z4-R8-B01 • Qty: 450 Pkts</div>
                    </div>
                </div>
            </div>

            <!-- Advanced Operations -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div class="card" style="padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">ABC Analysis Classification</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Auto-classify inventory by value and volume</div>
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;">Run Analysis</button>
                </div>
                <div class="card" style="padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Slotting Optimization</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Reorganize racks based on fast/slow moving items</div>
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;">View Recommendations</button>
                </div>
                <div class="card" style="padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Lot Traceability & Recall</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">End-to-end forward/backward trace</div>
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;">Start Trace</button>
                </div>
            </div>

            <!-- Warehouse Locations & Rack Mapping -->
            <div class="card">
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                    <h2 class="section-title">Live Stock & Warehouse Locations</h2>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;"><i class='bx bx-refresh'></i> Toggle Multi-UOM View</button>
                        <select class="form-control" style="width: 200px;">
                            <option>Warehouse A (Main)</option>
                            <option>Warehouse B (Cold Storage)</option>
                        </select>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Class</th>
                                <th>Zone/Rack/Bin</th>
                                <th>Current Stock (Base/Alt)</th>
                                <th>Reserved</th>
                                <th>Available</th>
                                <th>Flags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

window.refreshInventoryTable = function() {
    const tbody = document.getElementById('inventoryTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const inventory = DataManager.getInventory();
    let html = '';
    
    inventory.forEach(inv => {
        let altStockHtml = inv.altStock ? `<span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${inv.altStock}</span>` : '';
        html += `
            <tr>
                <td>${inv.item}</td>
                <td><span style="background: ${inv.classBg}; color: ${inv.classColor}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${inv.class}</span></td>
                <td><span style="background: var(--primary-light); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--primary-color);">${inv.location}</span></td>
                <td>${inv.currentStock} ${altStockHtml}</td>
                <td>${inv.reserved}</td>
                <td style="font-weight: 600;">${inv.available}</td>
                <td>${inv.flagHtml}</td>
                <td><button class="icon-btn" style="width: 32px; height: 32px; font-size: 18px;"><i class='bx bx-map-pin'></i></button></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};
