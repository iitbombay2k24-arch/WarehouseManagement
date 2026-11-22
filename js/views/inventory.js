// Inventory View

window.renderInventory = function() {
    setTimeout(() => { if(window.refreshInventoryTable) window.refreshInventoryTable(); }, 100);
    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 class="page-title" style="margin:0;">Inventory Control</h1>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <!-- F36: Zone Heatmap -->
                    <button class="btn btn-outline" onclick="window.showZoneHeatmap()"><i class='bx bx-grid-alt'></i> Zone Heatmap</button>
                    <!-- F38: Snapshot History -->
                    <button class="btn btn-outline" onclick="window.showSnapshotHistory()"><i class='bx bx-camera'></i> Snapshots</button>
                    <!-- F39: Aging Report -->
                    <button class="btn btn-outline" onclick="window.showAgingReport()"><i class='bx bx-time-five'></i> Aging Report</button>
                    <button class="btn btn-outline" onclick="window.showToast('Stock Transfer request initialized from Zone A to Zone C', 'info')"><i class='bx bx-transfer'></i> Stock Transfer</button>
                    <button class="btn btn-primary" onclick="window.showToast('Inventory Adjustment logged for Audit', 'success')"><i class='bx bx-adjust'></i> Adjustment</button>
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
                    <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.showToast('New cycle count scheduled for Zone B', 'success')"><i class='bx bx-plus'></i> Schedule Count</button>
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
                        <button class="btn btn-outline" style="width: 100%; padding: 4px; font-size: 0.8rem;" onclick="window.showToast('Drone Alpha-1 dispatched for high-bay LiDAR scan', 'info')"><i class='bx bx-play-circle'></i> Start Drone Scan</button>
                    </div>
                </div>
            </div>

            <!-- Min/Max Replenishment Section -->
            <div class="card" style="margin-bottom: 24px; border-left: 4px solid var(--secondary-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title" style="margin: 0;"><i class='bx bx-transfer-alt'></i> Min/Max & Demand-Based Replenishment</h2>
                    <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="window.showToast('Auto-replenishment task batch queued for Forklift operator', 'success')"><i class='bx bx-play'></i> Auto-Replenish Now</button>
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
                                <td><button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.showToast('Moved 185 Pkts from Reserve to Z1-R4-B12', 'success')">Move 185 from Reserve</button></td>
                            </tr>
                            <tr>
                                <td>Moong Dal (1kg)</td>
                                <td>Z1-R3-B10</td>
                                <td>80 Pkts</td>
                                <td>50 / 150 Pkts</td>
                                <td><span class="status status-warning" style="background: rgba(245,158,11,0.1); color: var(--warning-color);">Approaching Min</span></td>
                                <td><button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.showToast('Replenishment task scheduled for Shift 2', 'info')">Schedule Replenish</button></td>
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
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;" onclick="window.showToast('ABC Analysis updated: 12 Class A, 45 Class B, 110 Class C SKUs', 'info')">Run Analysis</button>
                </div>
                <div class="card" style="padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Slotting Optimization</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Reorganize racks based on fast/slow moving items</div>
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;" onclick="window.showToast('Slotting Engine: Move Aloo Bhujia closer to Dispatch Bay 1', 'info')">View Recommendations</button>
                </div>
                <div class="card" style="padding: 16px;">
                    <div style="font-weight: 600; margin-bottom: 8px;">Lot Traceability & Recall</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">End-to-end forward/backward trace</div>
                    <button class="btn btn-outline" style="width: 100%; font-size: 0.8rem;" onclick="window.showToast('Trace complete: 0 affected lots in active shipping', 'success')">Start Trace</button>
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
        let altStockHtml = inv.altStock ? `<span style="font-size: 0.75rem; color: var(--text-muted); display: block;">${escapeHtml(inv.altStock)}</span>` : '';
        html += `
            <tr>
                <td>${escapeHtml(inv.item)}</td>
                <td><span style="background: ${inv.classBg}; color: ${inv.classColor}; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${escapeHtml(inv.class)}</span></td>
                <td><span style="background: var(--primary-light); padding: 4px 8px; border-radius: 4px; font-family: monospace; color: var(--primary-color);">${escapeHtml(inv.location)}</span></td>
                <td>${escapeHtml(inv.currentStock)} ${altStockHtml}</td>
                <td>${escapeHtml(inv.reserved)}</td>
                <td style="font-weight: 600;">${escapeHtml(inv.available)}</td>
                <td>${inv.flagHtml}</td>
                <td>
                    <div style="display:flex;gap:4px;">
                        <button class="icon-btn" onclick="window.showLocationOnMap('${escJs(inv.id)}')"><i class='bx bx-map-pin'></i></button>
                        <!-- F37: Reserve toggle -->
                        <button class="icon-btn" title="Toggle Reserve (F37)" onclick="window.toggleReserve('${escJs(inv.id)}')"><i class='bx bx-lock-alt'></i></button>
                        <!-- F40: Bin transfer -->
                        <button class="icon-btn" title="Transfer Bin (F40)" onclick="window.multiBinTransfer('${escJs(inv.id)}','${escJs(inv.item)}')"><i class='bx bx-transfer'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
};

window.showLocationOnMap = function(id) { window.showToast(`Location map for ${id} — see Zone Grid above`, 'info'); };

// ===== F36-F40: NEW INVENTORY FEATURES =====

// F36: Zone Heatmap — rendered inside the existing page via button
window.showZoneHeatmap = function() {
    const zones = ['A','B','C','D','E','F'];
    const occupancy = [85, 62, 45, 91, 38, 74];
    const existing = document.getElementById('zoneHeatmapModal');
    if (existing) { existing.remove(); return; }
    const modal = document.createElement('div');
    modal.id = 'zoneHeatmapModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:500px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;">Zone Heatmap (F36)</h2><button onclick="document.getElementById('zoneHeatmapModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                ${zones.map((z,i) => {
                    const pct = occupancy[i];
                    const bg = pct>80?'var(--danger-color)':pct>60?'var(--warning-color)':'var(--secondary-color)';
                    return `<div style="padding:20px;background:${bg}22;border-radius:12px;border:2px solid ${bg};text-align:center;cursor:pointer;" onclick="window.showToast('Zone ${z}: ${pct}% occupied','info')">
                        <div style="font-size:1.8rem;font-weight:700;color:${bg};">Zone ${z}</div>
                        <div style="font-size:2rem;font-weight:900;color:${bg};margin:8px 0;">${pct}%</div>
                        <div style="height:8px;background:var(--border-color);border-radius:4px;"><div style="height:100%;width:${pct}%;background:${bg};border-radius:4px;"></div></div>
                        <div style="font-size:0.75rem;margin-top:6px;color:var(--text-muted);">${pct>80?'⚠ Critical':'✓ Normal'}</div>
                    </div>`;
                }).join('')}
            </div>
            <div style="margin-top:16px;padding:12px;background:var(--bg-main);border-radius:8px;font-size:0.8rem;color:var(--text-muted);"><span style="color:var(--secondary-color);">■</span> Normal &nbsp; <span style="color:var(--warning-color);">■</span> 60–80% &nbsp; <span style="color:var(--danger-color);">■</span> >80% Critical</div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F37: Reserve Stock Toggle
window.toggleReserve = function(id) {
    const inv = DataManager.getInventory().find(i => i.id === id);
    if (!inv) return;
    const isReserved = inv.reserved && inv.reserved !== '0';
    window.showToast(isReserved ? `Stock for ${escapeHtml(inv.item)} unreserved` : `Stock for ${escapeHtml(inv.item)} marked as reserved`, 'info');
    DataManager.logAction('Reserve Toggle', `${escapeHtml(inv.item)} reserve status toggled`);
};

// F38: Inventory Snapshot
window.showSnapshotHistory = function() {
    const snapshots = [
        { date: '01 Aug 2026', total: '12,450 kg', items: 24, value: '₹8,42,000' },
        { date: '25 Jul 2026', total: '11,890 kg', items: 22, value: '₹7,98,500' },
        { date: '18 Jul 2026', total: '13,200 kg', items: 25, value: '₹9,12,000' },
        { date: '11 Jul 2026', total: '10,500 kg', items: 20, value: '₹7,20,000' },
        { date: '04 Jul 2026', total: '14,800 kg', items: 27, value: '₹10,15,000' }
    ];
    const existing = document.getElementById('snapshotModal');
    if (existing) { existing.remove(); return; }
    const modal = document.createElement('div');
    modal.id = 'snapshotModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:500px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;">Snapshot History (F38)</h2><button onclick="document.getElementById('snapshotModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table">
                <thead><tr><th>Date</th><th>Total Stock</th><th>SKUs Active</th><th>Value</th><th>Action</th></tr></thead>
                <tbody>${snapshots.map(s=>`<tr><td>${s.date}</td><td>${s.total}</td><td>${s.items}</td><td>${s.value}</td><td><button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.showToast('Snapshot ${s.date} downloaded','info')"><i class='bx bx-download'></i></button></td></tr>`).join('')}</tbody>
            </table>
            <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="window.showToast('New snapshot taken — saved as ${new Date().toLocaleDateString()}','success')">Take Snapshot Now</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F39: Stock Aging Report
window.showAgingReport = function() {
    const items = [
        { item: 'Namkeen Mix (Spicy)', location: 'Z3-R8-B01', lastMoved: 95, class: 'status-danger' },
        { item: 'Diet Chivda (500g)', location: 'Z2-R5-B03', lastMoved: 67, class: 'status-warning' },
        { item: 'Cornflakes Mix (200g)', location: 'Z1-R2-B07', lastMoved: 34, class: 'status-info' }
    ];
    const existing = document.getElementById('agingModal');
    if (existing) { existing.remove(); return; }
    const modal = document.createElement('div');
    modal.id = 'agingModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:560px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;">⏳ Stock Aging Report (F39)</h2><button onclick="document.getElementById('agingModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table">
                <thead><tr><th>Item</th><th>Location</th><th>Days No Movement</th><th>Risk</th><th>Action</th></tr></thead>
                <tbody>${items.map(i=>`<tr><td>${escapeHtml(i.item)}</td><td><code>${escapeHtml(i.location)}</code></td><td>${i.lastMoved} days</td><td><span class="status ${i.class}">${i.lastMoved>90?'Dead Stock':i.lastMoved>60?'Slow Moving':'Normal'}</span></td><td><button class="btn btn-outline" style="font-size:0.75rem;padding:2px 8px;" onclick="window.showToast('Markdown/transfer action initiated','info')">Action</button></td></tr>`).join('')}</tbody>
            </table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F40: Multi-Bin Transfer
window.multiBinTransfer = function(id, item) {
    const fromBin = prompt(`Transfer: ${item}\nFrom Bin (e.g. Z1-R4-B12):`, 'Z1-R4-B12');
    if (!fromBin) return;
    const toBin = prompt('To Bin (e.g. Z2-R1-B05):', 'Z2-R1-B05');
    if (!toBin) return;
    const qty = prompt('Quantity to transfer (kg):');
    if (!qty) return;
    window.showToast(`✅ ${qty}kg of ${item} transferred from ${fromBin} → ${toBin}`, 'success');
    DataManager.logAction('Bin Transfer', `${qty}kg ${item} moved from ${fromBin} to ${toBin}`);
};

