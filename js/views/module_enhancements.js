// =========================================================
// Module Enhancements — F41-F70, F86-F90
// Appended as modal overlays and in-page injections
// =========================================================

// ===== F41-F45: PURCHASE ORDER ENHANCEMENTS =====

// F41: PO Approval Workflow
window.approvePO = function(id) {
    const orders = DataManager.getPurchaseOrders();
    const po = orders.find(o => o.id === id);
    if (!po) { window.showToast('PO not found', 'danger'); return; }
    if (po.status === 'Draft') {
        po.status = 'Approved';
        localStorage.setItem('wms_purchase_orders', JSON.stringify(orders));
        window.showToast(`✅ PO ${id} approved and sent to supplier`, 'success');
        DataManager.logAction('PO Approved', `${id} approved by manager`);
        if (typeof window.refreshPurchaseTable === 'function') window.refreshPurchaseTable();
    } else {
        window.showToast(`PO ${id} is already ${po.status}`, 'info');
    }
};

window.rejectPO = function(id) {
    const reason = prompt('Rejection reason for ' + id + ':');
    if (!reason) return;
    const orders = DataManager.getPurchaseOrders();
    const po = orders.find(o => o.id === id);
    if (po) {
        po.status = 'Rejected';
        po.rejectionReason = reason;
        localStorage.setItem('wms_purchase_orders', JSON.stringify(orders));
        window.showToast(`PO ${id} rejected`, 'danger');
        DataManager.logAction('PO Rejected', `${id} rejected: ${escapeHtml(reason)}`);
        if (typeof window.refreshPurchaseTable === 'function') window.refreshPurchaseTable();
    }
};

// F42: Blanket PO Manager
window.showBlanketPOManager = function() {
    const existing = document.getElementById('blanketPOModal');
    if (existing) { existing.remove(); return; }
    const blanket = [
        { id: 'BPO-001', supplier: 'ABC Spices Ltd.', item: 'Besan (Gram Flour)', totalQty: '5,000 kg', released: '2,200 kg', balance: '2,800 kg', expiry: '31 Dec 2026' },
        { id: 'BPO-002', supplier: 'Global Packaging', item: 'BOPP Pouches (500g)', totalQty: '1,00,000 pcs', released: '45,000 pcs', balance: '55,000 pcs', expiry: '30 Sep 2026' }
    ];
    const modal = document.createElement('div');
    modal.id = 'blanketPOModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:700px;max-width:90vw;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
                <h2 style="margin:0;"><i class='bx bx-book-open'></i> Blanket PO Manager (F42)</h2>
                <button onclick="document.getElementById('blanketPOModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <table class="table">
                <thead><tr><th>BPO ID</th><th>Supplier</th><th>Item</th><th>Total Qty</th><th>Released</th><th>Balance</th><th>Expiry</th><th>Action</th></tr></thead>
                <tbody>${blanket.map(b=>`
                    <tr>
                        <td><strong>${escapeHtml(b.id)}</strong></td>
                        <td>${escapeHtml(b.supplier)}</td>
                        <td>${escapeHtml(b.item)}</td>
                        <td>${b.totalQty}</td>
                        <td style="color:var(--primary-color);">${b.released}</td>
                        <td style="color:var(--secondary-color);font-weight:700;">${b.balance}</td>
                        <td>${b.expiry}</td>
                        <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 10px;" onclick="window.showToast('Release created for ${escapeHtml(b.id)}','success')">Release</button></td>
                    </tr>`).join('')}
                </tbody>
            </table>
            <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('New Blanket PO created','success')"><i class='bx bx-plus'></i> New Blanket PO</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F43: Supplier Price Comparison (last 3 POs)
window.showPriceComparison = function() {
    const existing = document.getElementById('priceCompModal');
    if (existing) { existing.remove(); return; }
    const modal = document.createElement('div');
    modal.id = 'priceCompModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:600px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-line-chart'></i> Supplier Price Comparison (F43)</h2><button onclick="document.getElementById('priceCompModal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table">
                <thead><tr><th>Item</th><th>Supplier</th><th>PO-1 Price</th><th>PO-2 Price</th><th>PO-3 Price</th><th>Trend</th></tr></thead>
                <tbody>
                    <tr><td>Besan (Gram Flour)</td><td>ABC Spices</td><td>₹52/kg</td><td>₹53/kg</td><td>₹55/kg</td><td><span style="color:var(--danger-color);">↑ +5.8%</span></td></tr>
                    <tr><td>BOPP Pouch (500g)</td><td>Global Pack</td><td>₹2.80</td><td>₹2.75</td><td>₹2.72</td><td><span style="color:var(--secondary-color);">↓ -2.9%</span></td></tr>
                    <tr><td>Refined Oil (15L)</td><td>Premium Oils</td><td>₹1,450</td><td>₹1,420</td><td>₹1,490</td><td><span style="color:var(--warning-color);">↑ +2.8%</span></td></tr>
                </tbody>
            </table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F44: PO Amendment Log
window.showPOAmendments = function(poId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:520px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;">PO Amendment Log (F44) — ${escapeHtml(poId||'PO-2026-1046')}</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${[
                    { time: '02 Aug 2026 09:12', user: 'Admin', change: 'Quantity changed: 500kg → 600kg (Besan)' },
                    { time: '01 Aug 2026 15:40', user: 'Manager', change: 'Delivery date extended: 5 Aug → 8 Aug' },
                    { time: '31 Jul 2026 11:20', user: 'Admin', change: 'PO created — Draft status' }
                ].map(a => `
                    <div style="padding:10px;background:var(--bg-main);border-radius:8px;border-left:3px solid var(--primary-color);">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <strong style="font-size:0.8rem;">${escapeHtml(a.user)}</strong>
                            <span style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(a.time)}</span>
                        </div>
                        <div style="font-size:0.82rem;">${a.change}</div>
                    </div>`).join('')}
            </div>
            <button class="btn btn-outline" style="margin-top:12px;width:100%;" onclick="window.showToast('Amendment added to PO','success')">Add Amendment Note</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F45: PO PDF Preview
window.showPOPreview = function(poId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const po = DataManager.getPurchaseOrders().find(p => p.id === poId) || { id: poId, supplier: 'ABC Spices Ltd.', items: [], total: '₹29,700', date: '02 Aug 2026' };
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:32px;min-width:580px;max-height:85vh;overflow-y:auto;color:#1e293b;border:1px solid #e2e8f0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:24px;">
                <div>
                    <div style="font-size:1.5rem;font-weight:900;color:#2563eb;">📦 PURCHASE ORDER</div>
                    <div style="font-size:1.1rem;font-weight:700;color:#1e293b;margin-top:4px;">${escapeHtml(po.id)}</div>
                    <div style="font-size:0.8rem;color:#64748b;">Date: ${po.date||new Date().toLocaleDateString()}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700;font-size:1rem;">Namkeen WMS Ltd.</div>
                    <div style="font-size:0.8rem;color:#64748b;">FSSAI: 10023102002345</div>
                    <div style="font-size:0.8rem;color:#64748b;">GSTIN: 27AAAFN2345R1Z5</div>
                </div>
            </div>
            <div style="padding:12px;background:#f1f5f9;border-radius:8px;margin-bottom:16px;font-size:0.85rem;">
                <strong>Supplier:</strong> ${escapeHtml(po.supplier)} | <strong>Status:</strong> <span style="color:#2563eb;">${escapeHtml(po.status||'Approved')}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:8px;text-align:left;border:1px solid #e2e8f0;">Item</th><th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Qty</th><th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Rate</th><th style="padding:8px;text-align:right;border:1px solid #e2e8f0;">Amount</th></tr></thead>
                <tbody>
                    <tr><td style="padding:8px;border:1px solid #e2e8f0;">Besan (Gram Flour)</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">500 kg</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₹55/kg</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₹27,500</td></tr>
                    <tr><td style="padding:8px;border:1px solid #e2e8f0;">Refined Oil (15L)</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">1 can</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₹1,490</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;">₹1,490</td></tr>
                    <tr style="background:#eff6ff;font-weight:700;"><td colspan="3" style="padding:8px;border:1px solid #e2e8f0;text-align:right;">Total:</td><td style="padding:8px;border:1px solid #e2e8f0;text-align:right;color:#2563eb;">${po.total||'₹28,990'}</td></tr>
                </tbody>
            </table>
            <div style="margin-top:20px;display:flex;gap:8px;">
                <button onclick="window.showToast('PO PDF downloaded','success');" style="background:#2563eb;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:600;"><i class='bx bx-download'></i> Download PDF</button>
                <button onclick="window.showToast('PO sent to supplier via email','success');" style="background:#10b981;color:white;border:none;padding:8px 20px;border-radius:8px;cursor:pointer;font-weight:600;"><i class='bx bx-send'></i> Send to Supplier</button>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:#f1f5f9;color:#1e293b;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};


// ===== F46-F50: DISPATCH ENHANCEMENTS =====

// F46: Pick List Generator
window.generatePickList = function(orderId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:560px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                <h2 style="margin:0;"><i class='bx bx-list-check'></i> Pick List (F46) — ${escapeHtml(orderId||'SO-4502')}</h2>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button>
            </div>
            <table class="table">
                <thead><tr><th>✓</th><th>Location</th><th>Item</th><th>Qty to Pick</th><th>Batch</th></tr></thead>
                <tbody>
                    <tr><td><input type="checkbox" onchange="window.showToast('Item picked!','success')"></td><td><code>Z1-R4-B12</code></td><td>Aloo Bhujia (500g)</td><td>150 pcs</td><td>B-2391</td></tr>
                    <tr><td><input type="checkbox" onchange="window.showToast('Item picked!','success')"></td><td><code>Z2-R1-B05</code></td><td>Navratna Mix (1kg)</td><td>80 pcs</td><td>B-2388</td></tr>
                    <tr><td><input type="checkbox" onchange="window.showToast('Item picked!','success')"></td><td><code>Z1-R2-B07</code></td><td>Khatta Meetha (250g)</td><td>200 pcs</td><td>B-2394</td></tr>
                </tbody>
            </table>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <button class="btn btn-primary" onclick="window.showToast('All items picked — ready for packing','success')">Mark All Picked</button>
                <button class="btn btn-outline" onclick="window.showToast('Pick list printed','info')"><i class='bx bx-printer'></i> Print</button>
                <button class="btn btn-outline" onclick="this.closest('[style*=fixed]').remove()">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F47: Packing Slip
window.generatePackingSlip = function(orderId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:white;border-radius:16px;padding:28px;min-width:500px;color:#1e293b;border:1px solid #e2e8f0;">
            <div style="text-align:center;margin-bottom:16px;padding-bottom:12px;border-bottom:2px dashed #e2e8f0;">
                <div style="font-size:1.3rem;font-weight:900;color:#2563eb;">PACKING SLIP (F47)</div>
                <div style="font-size:0.9rem;">Order: ${escapeHtml(orderId||'SO-4502')} | Date: ${new Date().toLocaleDateString()}</div>
            </div>
            <div style="font-size:0.85rem;margin-bottom:12px;"><strong>Ship To:</strong> Mega Mart, Dadar, Mumbai 400014</div>
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:12px;">
                <thead><tr style="background:#f1f5f9;"><th style="padding:6px;text-align:left;border:1px solid #e2e8f0;">Item</th><th style="padding:6px;text-align:center;border:1px solid #e2e8f0;">Ordered</th><th style="padding:6px;text-align:center;border:1px solid #e2e8f0;">Shipped</th></tr></thead>
                <tbody>
                    <tr><td style="padding:6px;border:1px solid #e2e8f0;">Aloo Bhujia (500g)</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">150</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">150</td></tr>
                    <tr><td style="padding:6px;border:1px solid #e2e8f0;">Navratna Mix (1kg)</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">80</td><td style="padding:6px;border:1px solid #e2e8f0;text-align:center;">80</td></tr>
                </tbody>
            </table>
            <div style="display:flex;gap:8px;">
                <button onclick="window.showToast('Packing slip printed','success');" style="background:#2563eb;color:white;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:0.8rem;"><i class='bx bx-printer'></i> Print</button>
                <button onclick="this.closest('[style*=fixed]').remove()" style="background:#f1f5f9;color:#1e293b;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:0.8rem;">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F48: Vehicle Assignment
window.assignVehicle = function(orderId) {
    const vehicles = ['MH04 AB 1234 — Tata 407 (Available)', 'MH04 CD 5678 — Mahindra Bolero (Available)', 'MH04 EF 9012 — Ashok Leyland (On Route)'];
    const choice = prompt(`Assign vehicle to ${escapeHtml(orderId||'SO-4502')}:\n${vehicles.map((v,i)=>`${i+1}. ${v}`).join('\n')}\nEnter number:`);
    if (!choice) return;
    const vehicle = vehicles[parseInt(choice)-1];
    if (!vehicle) { window.showToast('Invalid selection','danger'); return; }
    window.showToast(`🚛 ${vehicle.split('—')[0].trim()} assigned to ${orderId}`, 'success');
    DataManager.logAction('Vehicle Assignment', `${vehicle} assigned to ${orderId}`);
};

// F49: Delivery Proof Capture
window.captureDeliveryProof = function(orderId) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:460px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-camera'></i> Delivery Proof (F49) — ${escapeHtml(orderId||'SO-4502')}</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="padding:30px;border:2px dashed var(--border-color);border-radius:12px;text-align:center;cursor:pointer;" onclick="window.showToast('Signature captured','success')">
                    <i class='bx bx-pencil' style="font-size:2.5rem;color:var(--text-muted);"></i>
                    <div style="margin-top:8px;font-size:0.85rem;color:var(--text-muted);">Tap to capture e-signature</div>
                </div>
                <div style="padding:20px;border:2px dashed var(--border-color);border-radius:12px;text-align:center;cursor:pointer;" onclick="window.showToast('Photo uploaded successfully','success')">
                    <i class='bx bx-image-add' style="font-size:2rem;color:var(--text-muted);"></i>
                    <div style="margin-top:6px;font-size:0.85rem;color:var(--text-muted);">Upload delivery photo</div>
                </div>
                <input type="text" placeholder="Receiver Name" class="form-control">
                <input type="text" placeholder="Receiver Phone" class="form-control">
                <button class="btn btn-primary" onclick="window.showToast('Delivery proof saved for ${orderId}','success');this.closest('[style*=fixed]').remove();">✅ Confirm Delivery</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F50: Dispatch Calendar View
window.showDispatchCalendar = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const days = ['Mon 28','Tue 29','Wed 30','Thu 31','Fri 1','Sat 2','Sun 3'];
    const events = {
        'Mon 28': ['SO-4501: Mega Mart (10 AM)'],
        'Tue 29': ['SO-4502: Quick Commerce (9 AM)', 'SO-4503: D-Mart (2 PM)'],
        'Wed 30': [],
        'Thu 31': ['SO-4504: Vijay Sales (11 AM)'],
        'Fri 1': ['SO-4505: Reliance Fresh (4 PM)'],
        'Sat 2': ['SO-4506: Local Route (8 AM)'],
        'Sun 3': []
    };
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:700px;max-width:90vw;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-calendar'></i> Dispatch Calendar (F50)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">
                ${days.map(d=>`
                    <div style="padding:10px;background:var(--bg-main);border-radius:10px;min-height:100px;border:1px solid var(--border-color);">
                        <div style="font-size:0.75rem;font-weight:700;margin-bottom:6px;color:var(--text-muted);">${escapeHtml(d)}</div>
                        ${(events[d]||[]).map(e=>`<div style="background:var(--primary-color);color:white;padding:3px 6px;border-radius:5px;font-size:0.68rem;margin-bottom:3px;cursor:pointer;" onclick="window.showToast('${escJs(e)}','info')">${e.split(':')[0]}</div>`).join('')}
                        ${(events[d]||[]).length===0?`<div style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:10px;">No dispatches</div>`:''}
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};


// ===== F51-F55: FINANCE ENHANCEMENTS =====

// F51: GST Computation Panel
window.showGSTCalculator = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:460px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-calculator'></i> GST Calculator (F51)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Base Amount (₹)</label>
                        <input type="number" id="gstBase" placeholder="e.g. 10000" class="form-control" oninput="window.calcGST()" style="margin-top:4px;">
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">GST Rate</label>
                        <select id="gstRate" class="form-control" onchange="window.calcGST()" style="margin-top:4px;background:var(--bg-main);border:1px solid var(--border-color);padding:8px;border-radius:8px;color:var(--text-main);">
                            <option value="5">5% (Food Items)</option>
                            <option value="12">12%</option>
                            <option value="18" selected>18%</option>
                            <option value="28">28%</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Transaction Type</label>
                        <select id="gstType" class="form-control" onchange="window.calcGST()" style="margin-top:4px;background:var(--bg-main);border:1px solid var(--border-color);padding:8px;border-radius:8px;color:var(--text-main);">
                            <option value="intra">Intrastate (CGST+SGST)</option>
                            <option value="inter">Interstate (IGST)</option>
                        </select>
                    </div>
                </div>
                <div id="gstResult" style="padding:16px;background:var(--bg-main);border-radius:10px;display:none;">
                    <div style="font-size:0.8rem;color:var(--text-muted);">Breakdown</div>
                    <div id="gstBreakdown"></div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.calcGST = function() {
    const base = parseFloat(document.getElementById('gstBase')?.value)||0;
    const rate = parseFloat(document.getElementById('gstRate')?.value)||18;
    const type = document.getElementById('gstType')?.value;
    const result = document.getElementById('gstResult');
    const breakdown = document.getElementById('gstBreakdown');
    if (!base) { if(result) result.style.display='none'; return; }
    if(result) result.style.display='block';
    const gst = base * rate / 100;
    const total = base + gst;
    let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">`;
    html += `<div style="padding:8px;background:var(--bg-card);border-radius:6px;"><div style="font-size:0.72rem;color:var(--text-muted);">Base Amount</div><div style="font-weight:700;">₹${base.toLocaleString('en-IN')}</div></div>`;
    if(type==='intra') {
        html += `<div style="padding:8px;background:var(--bg-card);border-radius:6px;"><div style="font-size:0.72rem;color:var(--text-muted);">CGST (${rate/2}%)</div><div style="font-weight:700;color:var(--primary-color);">₹${(gst/2).toLocaleString('en-IN')}</div></div>`;
        html += `<div style="padding:8px;background:var(--bg-card);border-radius:6px;"><div style="font-size:0.72rem;color:var(--text-muted);">SGST (${rate/2}%)</div><div style="font-weight:700;color:var(--warning-color);">₹${(gst/2).toLocaleString('en-IN')}</div></div>`;
    } else {
        html += `<div style="padding:8px;background:var(--bg-card);border-radius:6px;"><div style="font-size:0.72rem;color:var(--text-muted);">IGST (${rate}%)</div><div style="font-weight:700;color:var(--primary-color);">₹${gst.toLocaleString('en-IN')}</div></div>`;
    }
    html += `<div style="padding:8px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));border-radius:6px;grid-column:span 2;"><div style="font-size:0.72rem;color:rgba(255,255,255,0.8);">Total Payable</div><div style="font-weight:900;color:white;font-size:1.2rem;">₹${total.toLocaleString('en-IN')}</div></div>`;
    html += '</div>';
    if(breakdown) breakdown.innerHTML = html;
};

// F52: Invoice Aging Tracker
window.showInvoiceAging = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const invoices = [
        { id: 'INV-2026-441', customer: 'Mega Mart', amount: '₹1,24,500', days: 12, bucket: '0-30d', cls: 'status-success' },
        { id: 'INV-2026-428', customer: 'D-Mart', amount: '₹88,200', days: 38, bucket: '31-60d', cls: 'status-warning' },
        { id: 'INV-2026-395', customer: 'Big Bazaar', amount: '₹52,000', days: 74, bucket: '61-90d', cls: 'status-danger' },
        { id: 'INV-2026-312', customer: 'Reliance Fresh', amount: '₹1,05,000', days: 92, bucket: '90d+', cls: 'status-danger' }
    ];
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:640px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-time'></i> Invoice Aging (F52)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px;">
                ${['0–30 days\n₹1,24,500','31–60 days\n₹88,200','61–90 days\n₹52,000','90+ days\n₹1,05,000'].map((l,i)=>{
                    const cols=['var(--secondary-color)','var(--primary-color)','var(--warning-color)','var(--danger-color)'];
                    return `<div style="padding:12px;background:${cols[i]}18;border-radius:10px;border:2px solid ${cols[i]};text-align:center;">
                        <div style="font-size:0.75rem;font-weight:700;color:${cols[i]};">${l.split('\n')[0]}</div>
                        <div style="font-size:1.1rem;font-weight:900;color:${cols[i]};margin-top:4px;">${l.split('\n')[1]}</div>
                    </div>`;
                }).join('')}
            </div>
            <table class="table"><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Age</th><th>Bucket</th><th>Action</th></tr></thead>
            <tbody>${invoices.map(inv=>`<tr><td><strong>${inv.id}</strong></td><td>${inv.customer}</td><td>${inv.amount}</td><td>${inv.days} days</td><td><span class="status ${inv.cls}">${inv.bucket}</span></td><td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;" onclick="window.showToast('Payment reminder sent to ${inv.customer}','success')">Send Reminder</button></td></tr>`).join('')}</tbody></table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F53: Payment Terms Configurator
window.showPaymentTerms = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:480px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-money-withdraw'></i> Payment Terms (F53)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                ${[['Mega Mart','Net-30','Active'],['D-Mart','Net-60','Active'],['Big Bazaar','Net-45','Active'],['Reliance Fresh','Net-30','Active'],['Quick Commerce','Cash on Delivery','Active']].map(([c,t,s])=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-main);border-radius:8px;">
                        <span style="font-size:0.85rem;font-weight:500;">${c}</span>
                        <select style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:4px 10px;color:var(--text-main);font-size:0.8rem;" onchange="window.showToast('Payment terms updated for ${c}','success')">
                            <option ${t==='Net-30'?'selected':''}>Net-30</option>
                            <option ${t==='Net-45'?'selected':''}>Net-45</option>
                            <option ${t==='Net-60'?'selected':''}>Net-60</option>
                            <option ${t==='Cash on Delivery'?'selected':''}>Cash on Delivery</option>
                            <option>Advance</option>
                        </select>
                    </div>`).join('')}
                <button class="btn btn-primary" style="margin-top:8px;" onclick="window.showToast('Payment terms saved for all customers','success')">Save All</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F54: P&L Mini Statement
window.showPLStatement = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:500px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-trending-up'></i> P&L Statement (F54) — July 2026</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:6px;">
                ${[
                    ['Revenue from Sales','₹12,45,000','var(--secondary-color)'],
                    ['Raw Material Cost','₹6,80,000','var(--danger-color)'],
                    ['Gross Profit','₹5,65,000','var(--primary-color)'],
                    ['Operating Expenses','₹2,10,000','var(--warning-color)'],
                    ['Salaries & Wages','₹1,20,000','var(--warning-color)'],
                    ['Logistics & Freight','₹45,000','var(--warning-color)'],
                    ['EBITDA','₹1,90,000','var(--secondary-color)'],
                    ['Depreciation','₹15,000','var(--danger-color)'],
                    ['Net Profit','₹1,75,000','var(--secondary-color)'],
                    ['Net Profit Margin','14.1%','var(--primary-color)']
                ].map(([l,v,c]) => `
                    <div style="display:flex;justify-content:space-between;padding:8px 12px;background:var(--bg-main);border-radius:6px;${l.includes('Profit')||l.includes('EBITDA')?'border-left:4px solid '+c+';font-weight:700;':''}">
                        <span style="font-size:0.85rem;">${l}</span>
                        <strong style="color:${c};">${v}</strong>
                    </div>`).join('')}
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.showToast('P&L report exported as PDF','success')"><i class='bx bx-download'></i> Export PDF</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F55: 30-Day Cash Flow Forecast
window.showCashFlowForecast = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:560px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-line-chart'></i> 30-Day Cash Flow (F55)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="height:200px;"><canvas id="cashFlowChart"></canvas></div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:16px;">
                <div style="padding:12px;background:rgba(16,185,129,0.1);border-radius:10px;text-align:center;border:2px solid var(--secondary-color);">
                    <div style="font-size:0.75rem;color:var(--text-muted);">Opening Balance</div>
                    <div style="font-weight:700;color:var(--secondary-color);font-size:1.1rem;">₹3,20,000</div>
                </div>
                <div style="padding:12px;background:rgba(37,99,235,0.1);border-radius:10px;text-align:center;border:2px solid var(--primary-color);">
                    <div style="font-size:0.75rem;color:var(--text-muted);">Expected Inflow</div>
                    <div style="font-weight:700;color:var(--primary-color);font-size:1.1rem;">₹12,45,000</div>
                </div>
                <div style="padding:12px;background:rgba(245,158,11,0.1);border-radius:10px;text-align:center;border:2px solid var(--warning-color);">
                    <div style="font-size:0.75rem;color:var(--text-muted);">Expected Outflow</div>
                    <div style="font-weight:700;color:var(--warning-color);font-size:1.1rem;">₹9,80,000</div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    setTimeout(() => {
        const ctx = document.getElementById('cashFlowChart');
        if(ctx && window.Chart) {
            new Chart(ctx, { type:'bar', data: {
                labels: ['W1','W2','W3','W4'],
                datasets: [
                    { label:'Inflow', data:[320000,380000,290000,455000], backgroundColor:'rgba(16,185,129,0.7)', borderRadius:4 },
                    { label:'Outflow', data:[210000,290000,240000,240000], backgroundColor:'rgba(239,68,68,0.7)', borderRadius:4 }
                ]
            }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top'}} } });
        }
    }, 100);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};


// ===== F56-F60: QUALITY ENHANCEMENTS =====

// F56: Test Parameter Library
window.showTestParams = function() {
    const params = [
        { name: 'Moisture Content', unit: '%', min: '3', max: '7', method: 'AOAC 925.09' },
        { name: 'Fat Content', unit: '%', min: '18', max: '35', method: 'Soxhlet' },
        { name: 'Salt Content', unit: '%', min: '1.5', max: '2.5', method: 'Titration' },
        { name: 'Peroxide Value', unit: 'meq/kg', min: '0', max: '10', method: 'AOCS Cd 8-53' },
        { name: 'pH Level', unit: '', min: '5.5', max: '7.0', method: 'pH Meter' }
    ];
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:620px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-test-tube'></i> Test Parameter Library (F56)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table"><thead><tr><th>Parameter</th><th>Unit</th><th>Min</th><th>Max</th><th>Method</th><th>Actions</th></tr></thead>
            <tbody>${params.map(p=>`<tr><td><strong>${escapeHtml(p.name)}</strong></td><td>${p.unit||'—'}</td><td>${p.min}</td><td>${p.max}</td><td><code style="font-size:0.75rem;">${p.method}</code></td><td><button class="icon-btn" onclick="window.showToast('Parameter ${escapeHtml(p.name)} edited','info')"><i class='bx bx-edit'></i></button></td></tr>`).join('')}</tbody></table>
            <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('New test parameter added','success')"><i class='bx bx-plus'></i> Add Parameter</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F57: QC Checklist Builder
window.showQCChecklist = function() {
    const items = ['Visual Inspection (Color/Texture)', 'Weight Check (±2g tolerance)', 'Taste & Aroma Test', 'Moisture Content Test', 'Packaging Integrity Check', 'Label Accuracy Verification'];
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:480px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-check-square'></i> QC Checklist (F57)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Batch: B-2415 | Product: Aloo Bhujia (500g)</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${items.map((item,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-main);border-radius:8px;">
                    <input type="checkbox" id="qcCheck${i}" onchange="window.checkQCItem(${i})" style="width:18px;height:18px;cursor:pointer;">
                    <label for="qcCheck${i}" style="cursor:pointer;font-size:0.85rem;">${escapeHtml(item)}</label>
                    <span id="qcStatus${i}" style="margin-left:auto;font-size:0.75rem;"></span>
                </div>`).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:16px;">
                <button class="btn btn-primary" onclick="window.submitQCChecklist()">Submit QC Report</button>
                <button class="btn btn-outline" onclick="this.closest('[style*=fixed]').remove()">Cancel</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

window.checkQCItem = function(i) {
    const status = document.getElementById('qcStatus' + i);
    const checked = document.getElementById('qcCheck' + i).checked;
    if(status) status.innerHTML = checked ? '<span style="color:var(--secondary-color);">✓ Passed</span>' : '';
};

window.submitQCChecklist = function() {
    const checkboxes = document.querySelectorAll('[id^=qcCheck]');
    const passed = [...checkboxes].filter(c => c.checked).length;
    const total = checkboxes.length;
    window.showToast(`QC Report submitted: ${passed}/${total} checks passed ${passed===total?'✅':'⚠️'}`, passed===total?'success':'warning');
    DataManager.logAction('QC Checklist', `Batch B-2415 QC: ${passed}/${total} passed`);
    document.querySelector('[id^=qcCheck]')?.closest('[style*=fixed]')?.remove();
};

// F58: CAPA Tracker
window.showCAPATracker = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const capas = [
        { id:'CAPA-001', issue:'High moisture in Batch B-2398', action:'Adjust dryer temp to 85°C', due:'05 Aug 2026', status:'In Progress' },
        { id:'CAPA-002', issue:'Packaging seal defect in 500g pouches', action:'Calibrate sealing machine', due:'03 Aug 2026', status:'Open' },
        { id:'CAPA-003', issue:'Salt content exceeded in Navratna Mix', action:'Reduce salt by 0.2% in formulation', due:'01 Aug 2026', status:'Closed' }
    ];
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:660px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-shield-x'></i> CAPA Tracker (F58)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table"><thead><tr><th>CAPA ID</th><th>Issue</th><th>Corrective Action</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${capas.map(c=>`<tr><td><strong>${c.id}</strong></td><td style="max-width:180px;font-size:0.8rem;">${c.issue}</td><td style="max-width:180px;font-size:0.8rem;">${c.action}</td><td>${c.due}</td><td><span class="status ${c.status==='Closed'?'status-success':c.status==='In Progress'?'status-warning':'status-danger'}">${c.status}</span></td><td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;" onclick="window.showToast('${c.id} marked closed','success')">Close</button></td></tr>`).join('')}</tbody></table>
            <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('New CAPA raised','success')"><i class='bx bx-plus'></i> Raise CAPA</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F59: Supplier QC Alert on high defect
window.raiseSupplierQCAlert = function(supplier) {
    const sp = supplier || prompt('Supplier name with high defect rate:');
    if (!sp) return;
    DataManager.addAlert({ id: 'ALT-QC-'+Date.now(), type: 'Supplier QC Alert', severity: 'danger', message: `Defect rate >5% detected for ${sp}. QC hold placed.`, time: new Date().toLocaleTimeString(), acknowledged: false, rule: 'auto-qc' });
    window.showToast(`🚨 QC Alert raised for ${sp} — batch put on hold`, 'danger');
    DataManager.logAction('Supplier QC Alert', `High defect rate flagged for ${sp}`);
};

// F60: COA Upload Simulation
window.uploadCOA = function(batchId) {
    const bid = batchId || prompt('Enter Batch ID for COA upload:', 'B-2415');
    if (!bid) return;
    window.showToast(`📄 Certificate of Analysis uploaded for Batch ${bid}`, 'success');
    DataManager.logAction('COA Upload', `COA uploaded for Batch ${bid}`);
};


// ===== F61-F65: REPORTS ENHANCEMENTS =====

// F61: Saved Reports Library
window.showSavedReports = function() {
    const reports = [
        { name: 'Monthly Stock Valuation', date: '01 Aug 2026', type: 'Inventory', icon: 'bx-spreadsheet', size: '48 KB' },
        { name: 'Q2 Purchase Summary', date: '30 Jun 2026', type: 'Purchase', icon: 'bx-cart', size: '82 KB' },
        { name: 'Dead Stock Report — Jul', date: '31 Jul 2026', type: 'Inventory', icon: 'bx-time-five', size: '24 KB' },
        { name: 'Customer Profitability — Jul', date: '31 Jul 2026', type: 'Finance', icon: 'bx-trending-up', size: '56 KB' },
        { name: 'FY2025-26 Annual Report', date: '31 Mar 2026', type: 'Annual', icon: 'bx-book', size: '2.4 MB' }
    ];
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:580px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-library'></i> Saved Reports (F61)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${reports.map(r=>`
                    <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-main);border-radius:10px;cursor:pointer;" onclick="window.showToast('Downloading ${escapeHtml(r.name)}...','info')">
                        <div style="width:40px;height:40px;background:var(--primary-light);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                            <i class='bx ${r.icon}' style="color:var(--primary-color);font-size:1.2rem;"></i>
                        </div>
                        <div style="flex:1;">
                            <div style="font-size:0.85rem;font-weight:600;">${escapeHtml(r.name)}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">${escapeHtml(r.type)} • ${escapeHtml(r.date)} • ${escapeHtml(r.size)}</div>
                        </div>
                        <button class="icon-btn" onclick="event.stopPropagation();window.showToast('${escapeHtml(r.name)} downloaded','success')"><i class='bx bx-download'></i></button>
                        <button class="icon-btn" style="color:var(--danger-color);" onclick="event.stopPropagation();window.showToast('${escapeHtml(r.name)} deleted','danger')"><i class='bx bx-trash'></i></button>
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F62: Scheduled Email Reports
window.showScheduledReports = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const scheds = [
        { report: 'Daily Stock Summary', freq: 'Daily 7 AM', email: 'director@company.com', active: true },
        { report: 'Weekly P&L Statement', freq: 'Monday 8 AM', email: 'accounts@company.com', active: true },
        { report: 'Monthly Supplier Scorecard', freq: '1st of Month', email: 'procurement@company.com', active: false }
    ];
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:580px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-mail-send'></i> Scheduled Reports (F62)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            ${scheds.map(s=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-main);border-radius:10px;margin-bottom:8px;">
                <div><div style="font-weight:600;font-size:0.85rem;">${escapeHtml(s.report)}</div><div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(s.freq)} → ${escapeHtml(s.email)}</div></div>
                <div style="width:42px;height:22px;background:${s.active?'var(--secondary-color)':'var(--border-color)'};border-radius:11px;position:relative;cursor:pointer;flex-shrink:0;" onclick="window.showToast('Schedule toggled','info')">
                    <div style="width:16px;height:16px;background:white;border-radius:50%;position:absolute;top:3px;${s.active?'right:3px':'left:3px'};transition:all 0.2s;"></div>
                </div>
            </div>`).join('')}
            <button class="btn btn-primary" style="width:100%;margin-top:8px;" onclick="window.showToast('New schedule created','success')"><i class='bx bx-plus'></i> Add Schedule</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F63: Stock Valuation Report
window.showStockValuation = function() {
    const products = DataManager.getProducts();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const total = products.reduce((s, p) => s + (p.stock||0) * (p.price||0), 0);
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:600px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-rupee'></i> Stock Valuation (F63)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="padding:16px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));border-radius:12px;margin-bottom:16px;color:white;">
                <div style="font-size:0.85rem;opacity:0.85;">Total Inventory Value</div>
                <div style="font-size:2rem;font-weight:900;">₹${total.toLocaleString('en-IN')}</div>
                <div style="font-size:0.78rem;opacity:0.8;">${products.length} SKUs at cost price</div>
            </div>
            <table class="table"><thead><tr><th>SKU</th><th>Name</th><th>Stock</th><th>Cost Price</th><th>Value</th></tr></thead>
            <tbody>${products.slice(0,10).map(p=>`<tr><td><code>${escapeHtml(p.id)}</code></td><td>${escapeHtml(p.name)}</td><td>${p.stock||0}</td><td>₹${p.price||0}</td><td style="font-weight:700;color:var(--primary-color);">₹${((p.stock||0)*(p.price||0)).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody></table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F64: Dead Stock Report
window.showDeadStockReport = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    const deadStock = [
        { sku: 'SKU-018', name: 'Namkeen Mix (Spicy Var)', stock: 840, lastMove: '92 days ago', value: '₹1,26,000' },
        { sku: 'SKU-023', name: 'Diet Chivda (Mini Pack)', stock: 200, lastMove: '105 days ago', value: '₹18,000' }
    ];
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:560px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-time-five'></i> Dead Stock Report (F64)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="padding:12px;background:rgba(239,68,68,0.08);border-radius:8px;margin-bottom:14px;font-size:0.82rem;color:var(--danger-color);border:1px solid var(--danger-color);">
                ⚠️ Dead Stock = No inventory movement for 90+ days. Consider discount sale or disposal.
            </div>
            <table class="table"><thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Last Movement</th><th>Blocked Value</th><th>Action</th></tr></thead>
            <tbody>${deadStock.map(d=>`<tr><td><code>${d.sku}</code></td><td>${d.name}</td><td>${d.stock}</td><td style="color:var(--danger-color);">${d.lastMove}</td><td style="font-weight:700;">${d.value}</td><td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;" onclick="window.showToast('Discount sale initiated for ${d.sku}','info')">Action</button></td></tr>`).join('')}</tbody></table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F65: Profitability Report per SKU
window.showProfitabilityReport = function() {
    const products = DataManager.getProducts().slice(0, 8);
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:640px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-bar-chart-alt'></i> SKU Profitability (F65)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <table class="table"><thead><tr><th>SKU</th><th>Product</th><th>Sale Price</th><th>Cost</th><th>Gross Profit</th><th>GP%</th><th>Grade</th></tr></thead>
            <tbody>${products.map(p=>{
                const sale = parseFloat(p.price||0) * 1.3;
                const cost = parseFloat(p.price||0);
                const gp = sale - cost;
                const gpPct = sale ? Math.round((gp/sale)*100) : 0;
                const grade = gpPct>30?'A':gpPct>20?'B':'C';
                return `<tr><td><code>${escapeHtml(p.id)}</code></td><td>${escapeHtml(p.name)}</td><td>₹${sale.toFixed(0)}</td><td>₹${cost}</td><td style="color:var(--secondary-color);font-weight:700;">₹${gp.toFixed(0)}</td><td style="color:var(--primary-color);font-weight:700;">${gpPct}%</td><td><span class="status ${grade==='A'?'status-success':grade==='B'?'status-warning':'status-danger'}">${grade}</span></td></tr>`;
            }).join('')}</tbody></table>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};


// ===== F67-F70: SETTINGS ENHANCEMENTS =====

// F67: Company Profile Setup
window.showCompanyProfile = function() {
    const profile = DataManager.getCompanyProfile();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:560px;max-height:85vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-building'></i> Company Profile (F67)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="grid-column:span 2;"><label style="font-size:0.8rem;color:var(--text-muted);">Company Name</label><input type="text" class="form-control" value="${escapeHtml(profile.name||'Namkeen WMS Ltd.')}" style="margin-top:4px;"></div>
                <div><label style="font-size:0.8rem;color:var(--text-muted);">FSSAI License No.</label><input type="text" class="form-control" value="${escapeHtml(profile.fssai||'10023102002345')}" style="margin-top:4px;"></div>
                <div><label style="font-size:0.8rem;color:var(--text-muted);">GSTIN</label><input type="text" class="form-control" value="${escapeHtml(profile.gstin||'27AAAFN2345R1Z5')}" style="margin-top:4px;"></div>
                <div><label style="font-size:0.8rem;color:var(--text-muted);">License Expiry</label><input type="date" class="form-control" value="${escapeHtml(profile.licenseExpiry||'2027-03-31')}" style="margin-top:4px;"></div>
                <div><label style="font-size:0.8rem;color:var(--text-muted);">Phone</label><input type="text" class="form-control" value="${escapeHtml(profile.phone||'+91 22 1234 5678')}" style="margin-top:4px;"></div>
                <div style="grid-column:span 2;"><label style="font-size:0.8rem;color:var(--text-muted);">Address</label><textarea class="form-control" style="margin-top:4px;height:60px;resize:none;">${escapeHtml(profile.address||'123, Warehouse Road, Andheri East, Mumbai 400069')}</textarea></div>
            </div>
            <!-- F86: FSSAI License status -->
            <div style="padding:12px;background:rgba(16,185,129,0.1);border-radius:8px;margin-top:12px;border:1px solid var(--secondary-color);">
                <div style="font-weight:600;font-size:0.85rem;color:var(--secondary-color);"><i class='bx bx-shield-check'></i> FSSAI License (F86): Valid until ${escapeHtml(profile.licenseExpiry||'31 Mar 2027')}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">Renewal reminder will be sent 90 days before expiry</div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.showToast('Company profile saved successfully','success');this.closest('[style*=fixed]').remove();">Save Profile</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F68: Warehouse Zone Config
window.showWarehouseConfig = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:560px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-map'></i> Warehouse Layout Config (F68)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;">
                ${['A','B','C','D','E','F'].map(z=>`
                    <div style="padding:16px;background:var(--bg-main);border-radius:10px;border:1px solid var(--border-color);">
                        <div style="font-weight:700;font-size:1rem;margin-bottom:8px;">Zone ${z}</div>
                        <select style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:4px 8px;color:var(--text-main);font-size:0.78rem;width:100%;margin-bottom:6px;">
                            <option>Dry Storage</option><option>Cold Storage</option><option>Packaging</option><option>Dispatch</option>
                        </select>
                        <input type="number" placeholder="Aisles" value="4" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:4px 8px;color:var(--text-main);font-size:0.78rem;width:100%;">
                    </div>`).join('')}
            </div>
            <button class="btn btn-primary" style="width:100%;" onclick="window.showToast('Warehouse layout saved','success')">Save Layout</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F69: Email Notification Toggles
window.showNotificationSettings = function() {
    const categories = [
        ['Low Stock Alerts', true], ['Expiry Warnings', true], ['PO Delivery Due', true],
        ['Quality Fails', true], ['Payroll Due', false], ['New Dispatch Order', true],
        ['Customer Outstanding', false], ['System Login', true]
    ];
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:460px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-bell'></i> Notification Settings (F69)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${categories.map(([label, active])=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-main);border-radius:8px;">
                        <span style="font-size:0.85rem;">${escapeHtml(label)}</span>
                        <div style="width:44px;height:24px;background:${active?'var(--secondary-color)':'var(--border-color)'};border-radius:12px;position:relative;cursor:pointer;flex-shrink:0;" onclick="this.style.background=this.style.background.includes('secondary')?'var(--border-color)':'var(--secondary-color)';window.showToast('Notification preference updated','info')">
                            <div style="width:18px;height:18px;background:white;border-radius:50%;position:absolute;top:3px;${active?'right:3px':'left:3px'};transition:all 0.2s;"></div>
                        </div>
                    </div>`).join('')}
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.showToast('Notification preferences saved','success')">Save Preferences</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F70: Session Activity Log
window.showSessionLog = function() {
    const auditLog = DataManager.getAuditTrail().slice(0, 12);
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:600px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-history'></i> Session Activity Log (F70)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:6px;">
                ${(auditLog.length ? auditLog : [
                    { action:'Dashboard View', details:'User opened dashboard', timestamp:'02 Aug 2026 16:00', user:'admin' },
                    { action:'Product Added', details:'SKU-007 Cornflakes Mix added', timestamp:'02 Aug 2026 15:42', user:'admin' },
                    { action:'PO Approved', details:'PO-2026-1046 approved', timestamp:'02 Aug 2026 15:30', user:'manager' }
                ]).map(log=>`
                    <div style="display:flex;gap:10px;padding:8px 12px;background:var(--bg-main);border-radius:8px;">
                        <i class='bx bx-user-circle' style="color:var(--primary-color);margin-top:2px;"></i>
                        <div style="flex:1;">
                            <div style="font-size:0.82rem;font-weight:600;">${escapeHtml(log.action)} <span style="font-weight:400;color:var(--text-muted);">by ${escapeHtml(log.user||'admin')}</span></div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(log.details)} • ${escapeHtml(log.timestamp)}</div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};


// ===== F87-F90: COMPLIANCE FEATURES =====

// F87: Allergen Register
window.showAllergenRegister = function() {
    const allergens = ['Tree Nuts', 'Groundnuts/Peanuts', 'Gluten (Wheat)', 'Soy', 'Sesame', 'Milk/Dairy'];
    const products = DataManager.getProducts();
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:680px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><h2 style="margin:0;"><i class='bx bx-shield-quarter'></i> Allergen Register (F87)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="overflow-x:auto;">
                <table class="table" style="font-size:0.8rem;">
                    <thead><tr><th>Product</th>${allergens.map(a=>`<th style="white-space:nowrap;">${escapeHtml(a)}</th>`).join('')}</tr></thead>
                    <tbody>${products.slice(0,8).map(p=>`<tr><td><strong>${escapeHtml(p.name)}</strong></td>${allergens.map(()=>`<td style="text-align:center;cursor:pointer;" onclick="this.innerHTML=this.innerHTML==='⚠️'?'':'⚠️'">${Math.random()>0.8?'⚠️':''}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:10px;padding:8px;background:var(--bg-main);border-radius:6px;">⚠️ = Allergen present or cross-contamination risk. Click any cell to toggle.</div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F88: Recall Management
window.initiateRecall = function() {
    const batchId = prompt('Enter Batch ID to recall:', 'B-2391');
    if (!batchId) return;
    const reason = prompt('Recall reason (e.g., Contamination, Mislabelling):');
    if (!reason) return;
    DataManager.addAlert({ id:'RCL-'+Date.now(), type:'PRODUCT RECALL', severity:'danger', message:`⚠️ RECALL INITIATED: Batch ${escapeHtml(batchId)} — ${escapeHtml(reason)}. Contact all dispatched customers immediately.`, time:new Date().toLocaleTimeString(), acknowledged:false, rule:'manual' });
    window.showToast(`🚨 Recall initiated for Batch ${escapeHtml(batchId)}. Alert sent to all stakeholders.`, 'danger');
    DataManager.logAction('Product Recall', `Batch ${escapeHtml(batchId)} recalled: ${escapeHtml(reason)}`);
};

// F89: Nutritional Info per SKU
window.showNutritionalInfo = function() {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:500px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-food-menu'></i> Nutritional Info (F89)</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;">Product: Aloo Bhujia (500g) | Per 100g serving</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                ${[['Energy','520 kcal'],['Protein','8.2 g'],['Carbohydrates','52 g'],['Total Sugars','2.1 g'],['Total Fat','32 g'],['Saturated Fat','4.8 g'],['Trans Fat','0 g'],['Cholesterol','0 mg'],['Sodium','680 mg'],['Dietary Fibre','3.2 g']].map(([n,v])=>`
                    <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;">
                        <span style="font-size:0.82rem;">${n}</span><strong style="color:var(--primary-color);">${v}</strong>
                    </div>`).join('')}
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.showToast('Nutritional info saved','success')"><i class='bx bx-save'></i> Save</button>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};

// F90: Traceability Report
window.showTraceabilityReport = function() {
    const batchId = prompt('Enter Batch ID for traceability:', 'B-2391') || 'B-2391';
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:28px;min-width:600px;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;margin-bottom:20px;"><h2 style="margin:0;"><i class='bx bx-git-branch'></i> Traceability Report (F90) — ${escapeHtml(batchId)}</h2><button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button></div>
            <div style="display:flex;flex-direction:column;gap:0;">
                ${[
                    { icon:'bx-store', color:'var(--primary-color)', title:'Supplier Origin', detail:'ABC Spices Ltd. — Besan delivery 28 Jul 2026 (PO-2026-1043)' },
                    { icon:'bx-factory', color:'var(--secondary-color)', title:'Production', detail:`Manufactured 01 Aug 2026 — Batch ${escapeHtml(batchId)} — Line 2, Shift AM` },
                    { icon:'bx-test-tube', color:'var(--warning-color)', title:'QC Inspection', detail:'QC passed 01 Aug 2026 — All parameters within limits' },
                    { icon:'bx-package', color:'var(--info-color)', title:'Inventory Stored', detail:'Zone B-R3-B08 since 02 Aug 2026' },
                    { icon:'bx-send', color:'var(--secondary-color)', title:'Dispatched To', detail:'Mega Mart, D-Mart (SO-4501, SO-4502) — 02 Aug 2026' }
                ].map((s,i,arr)=>`
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                        <div style="display:flex;flex-direction:column;align-items:center;">
                            <div style="width:36px;height:36px;border-radius:50%;background:${s.color}20;border:2px solid ${s.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                <i class='bx ${s.icon}' style="color:${s.color};font-size:1rem;"></i>
                            </div>
                            ${i<arr.length-1?`<div style="width:2px;flex:1;background:var(--border-color);min-height:24px;margin:2px 0;"></div>`:''}
                        </div>
                        <div style="padding:8px 0 16px 0;">
                            <div style="font-weight:700;font-size:0.85rem;">${escapeHtml(s.title)}</div>
                            <div style="font-size:0.78rem;color:var(--text-muted);">${escapeHtml(s.detail)}</div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
};
