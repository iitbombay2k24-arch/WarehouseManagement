// ============================================================
// FEATURES PART 1 — F101–F150
// Advanced Inventory, Sales & Orders, Production
// ============================================================

// ===== HELPER: Generic Modal Creator =====
function makeModal(id, title, icon, body, minWidth) {
    const existing = document.getElementById(id);
    if (existing) { existing.remove(); return null; }
    const modal = document.createElement('div');
    modal.id = id;
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:20px;padding:32px;min-width:${minWidth||600}px;max-width:95vw;max-height:90vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.3);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h2 style="margin:0;font-size:1.2rem;display:flex;align-items:center;gap:10px;"><i class='bx ${icon}' style="color:var(--primary-color);font-size:1.4rem;"></i>${title}</h2>
                <button onclick="document.getElementById('${id}').remove()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:6px 12px;cursor:pointer;color:var(--text-muted);font-size:1rem;">✕ Close</button>
            </div>
            ${body}
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    return modal;
}

// ===== F101: Live Bin-Map Visualizer =====
window.showBinMap = function() {
    const zones = [
        { id:'Z1', name:'Zone A — Raw Materials', rows:4, cols:8, fill:[0.9,0.7,0.5,0.2,0.95,0.3,0.8,0.6,0.1,0.4,0.75,0.9,0.6,0.2,0.3,0.85,0.5,0.7,0.4,0.9,0.1,0.6,0.8,0.95,0.3,0.2,0.7,0.5,0.9,0.4,0.6,0.8] },
        { id:'Z2', name:'Zone B — Finished Goods', rows:3, cols:8, fill:[0.5,0.9,0.3,0.7,0.2,0.8,0.6,0.4,0.95,0.1,0.7,0.5,0.3,0.9,0.2,0.6,0.8,0.4,0.1,0.7,0.5,0.3,0.9,0.6] },
        { id:'Z3', name:'Zone C — Packaging', rows:2, cols:6, fill:[0.2,0.4,0.6,0.8,0.1,0.9,0.7,0.3,0.5,0.2,0.8,0.4] }
    ];
    const legend = `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:0.78rem;">
        ${[['#22c55e','0-50% Full'],['#f59e0b','50-80% Full'],['#ef4444','80-100% Full'],['#6366f1','Empty']].map(([c,l])=>`<div style="display:flex;align-items:center;gap:6px;"><div style="width:16px;height:16px;background:${c};border-radius:3px;"></div>${l}</div>`).join('')}
    </div>`;
    const grid = zones.map(z=>`
        <div style="margin-bottom:20px;">
            <div style="font-weight:700;margin-bottom:8px;color:var(--primary-color);">${z.name}</div>
            <div style="display:grid;grid-template-columns:repeat(${z.cols},1fr);gap:4px;">
                ${z.fill.map((f,i)=>{
                    const color = f===0?'#6366f1':f<0.5?'#22c55e':f<0.8?'#f59e0b':'#ef4444';
                    const row=Math.floor(i/z.cols)+1, col=(i%z.cols)+1;
                    return `<div title="${z.id}-R${row}-B${String(col).padStart(2,'0')}: ${Math.round(f*100)}% full" style="height:32px;background:${color};border-radius:4px;opacity:0.85;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:white;font-weight:700;" onclick="window.showToast('${z.id}-R${row}-B${String(col).padStart(2,'0')}: ${Math.round(f*100)}% full','info')">${Math.round(f*100)}%</div>`;
                }).join('')}
            </div>
        </div>`).join('');
    makeModal('binMapModal','Live Bin-Map Visualizer','bx-grid-alt',legend+grid,800);
};

// ===== F102: Cycle Count Scheduler =====
window.showCycleCount = function() {
    const zones = ['Zone A','Zone B','Zone C'];
    const schedules = DataManager.getInventory().map((inv,i)=>({
        location: inv.location||'Z1-R1-B01', item: inv.item||'Item', lastCount: i===0?'Today':'Yesterday', nextCount: i===0?'In 7 days':'In 14 days', status: i===0?'Counted':'Pending'
    }));
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;flex-wrap:wrap;">
            ${zones.map(z=>`<button class="btn btn-outline" style="font-size:0.8rem;" onclick="window.showToast('Count sheet generated for ${z}','success')"><i class='bx bx-printer'></i> Generate ${z} Sheet</button>`).join('')}
        </div>
        <table class="table"><thead><tr><th>Location</th><th>Item</th><th>Last Count</th><th>Next Count</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${schedules.map(s=>`<tr>
            <td><code>${s.location}</code></td><td>${s.item}</td><td>${s.lastCount}</td><td>${s.nextCount}</td>
            <td><span class="badge ${s.status==='Counted'?'status-success':'status-warning'}">${s.status}</span></td>
            <td><button class="btn btn-primary" style="font-size:0.75rem;padding:3px 10px;" onclick="window.showToast('Count started for ${s.location}','info')">Start Count</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('cycleCountModal','Cycle Count Scheduler','bx-calendar-check',body,750);
};

// ===== F103: ABC/XYZ Analysis Matrix =====
window.showABCXYZ = function() {
    const products = DataManager.getProducts();
    const data = products.map((p,i)=>({
        name:p.name, abc:['A','A','B','B','C'][i%5]||'B', xyz:['X','Y','Z','X','Y'][i%5]||'Y',
        annualValue: Math.floor(p.price*p.stock*1.2), velocity:['High','High','Medium','Low','Medium'][i%5]||'Medium'
    }));
    const body = `
        <div style="margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
            ${[['A','High Value (Top 70% revenue)','var(--success-color)'],['B','Mid Value (Next 20%)','var(--warning-color)'],['C','Low Value (Bottom 10%)','var(--danger-color)']].map(([cls,desc,color])=>`
            <div style="background:${color}15;border:1px solid ${color}40;border-radius:12px;padding:16px;text-align:center;">
                <div style="font-size:2rem;font-weight:900;color:${color};">Class ${cls}</div>
                <div style="font-size:0.78rem;color:var(--text-muted);">${desc}</div>
                <div style="font-size:1.2rem;font-weight:700;margin-top:8px;">${data.filter(d=>d.abc===cls).length} SKUs</div>
            </div>`).join('')}
        </div>
        <table class="table"><thead><tr><th>Product</th><th>ABC Class</th><th>XYZ Class</th><th>Annual Value</th><th>Velocity</th></tr></thead>
        <tbody>${data.map(d=>`<tr>
            <td>${d.name}</td>
            <td><span class="badge ${d.abc==='A'?'status-success':d.abc==='B'?'status-warning':'status-danger'}">${d.abc}</span></td>
            <td><span class="badge status-info">${d.xyz}</span></td>
            <td>₹${d.annualValue.toLocaleString('en-IN')}</td>
            <td>${d.velocity}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('abcXYZModal','ABC/XYZ Analysis Matrix','bx-bar-chart-alt-2',body,750);
};

// ===== F104: Dead Stock Auto-Flag =====
window.showDeadStock = function() {
    const products = DataManager.getProducts();
    const dead = products.filter((_,i)=>i%3===1).map(p=>({...p, daysSinceMovement:Math.floor(90+Math.random()*60), value:p.price*p.stock}));
    const body = `
        <div style="background:var(--danger-color)15;border:1px solid var(--danger-color)40;border-radius:12px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
            <i class='bx bx-error-circle' style="font-size:2rem;color:var(--danger-color);"></i>
            <div><strong>${dead.length} SKUs</strong> have had zero movement for over 90 days.<br>
            <span style="color:var(--text-muted);font-size:0.85rem;">Total locked value: ₹${dead.reduce((a,d)=>a+d.value,0).toLocaleString('en-IN')}</span></div>
        </div>
        <table class="table"><thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Days Idle</th><th>Value</th><th>Action</th></tr></thead>
        <tbody>${dead.map(d=>`<tr>
            <td><code>${d.id}</code></td><td>${d.name}</td><td>${d.stock}</td>
            <td><span style="color:var(--danger-color);font-weight:700;">${d.daysSinceMovement}d</span></td>
            <td>₹${d.value.toLocaleString('en-IN')}</td>
            <td>
                <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Markdown promotion created for ${d.name}','success')">Promote</button>
                <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;margin-left:4px;color:var(--danger-color);" onclick="window.showToast('Write-off request sent for ${d.name}','warning')">Write-Off</button>
            </td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('deadStockModal','Dead Stock Auto-Flag','bx-error',body,800);
};

// ===== F105: Over-Stock Alert Radar =====
window.showOverStockRadar = function() {
    const products = DataManager.getProducts();
    const over = products.filter((_,i)=>i%2===0).map(p=>({...p, max:p.stock*0.6, excess:Math.floor(p.stock*0.4), excessValue:Math.floor(p.price*p.stock*0.4)}));
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${over.length}</div><div class="stat-label">Over-Stocked SKUs</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">₹${(over.reduce((a,o)=>a+o.excessValue,0)/1000).toFixed(0)}K</div><div class="stat-label">Excess Capital Locked</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--primary-color);">${Math.round(over.reduce((a,o)=>a+(o.excess/o.stock*100),0)/over.length||0)}%</div><div class="stat-label">Avg Over-Stock %</div></div>
        </div>
        <table class="table"><thead><tr><th>Product</th><th>Current</th><th>Max Recommended</th><th>Excess Qty</th><th>Excess Value</th><th>Action</th></tr></thead>
        <tbody>${over.map(o=>`<tr>
            <td>${o.name}</td><td>${o.stock}</td><td>${Math.round(o.max)}</td>
            <td><span style="color:var(--warning-color);font-weight:700;">+${o.excess}</span></td>
            <td>₹${o.excessValue.toLocaleString('en-IN')}</td>
            <td><button class="btn btn-primary" style="font-size:0.75rem;padding:3px 10px;" onclick="window.showToast('Transfer order created for ${o.name}','success')">Transfer Out</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('overStockModal','Over-Stock Alert Radar','bx-radar',body,800);
};

// ===== F106: Multi-Location Transfer Order =====
window.showTransferOrder = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Transfer From (Zone)</label>
                <select style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <option>Zone A — Raw Materials</option><option>Zone B — Finished Goods</option><option>Zone C — Packaging</option>
                </select>
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Transfer To (Zone)</label>
                <select style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <option>Zone B — Finished Goods</option><option>Zone A — Raw Materials</option><option>Zone C — Packaging</option>
                </select>
            </div>
        </div>
        <div style="margin-bottom:20px;">
            <label style="font-weight:600;display:block;margin-bottom:6px;">Select Items to Transfer</label>
            ${DataManager.getInventory().map(inv=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg-main);border-radius:8px;margin-bottom:6px;">
                <label><input type="checkbox" style="margin-right:8px;">${inv.item}</label>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span style="color:var(--text-muted);font-size:0.85rem;">Available: ${inv.available}</span>
                    <input type="number" placeholder="Qty" style="width:80px;padding:6px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-card);">
                </div>
            </div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="document.getElementById('transferModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="window.showToast('Transfer Order TRF-'+Date.now().toString().slice(-4)+' created successfully','success');document.getElementById('transferModal').remove()"><i class='bx bx-transfer'></i> Create Transfer Order</button>
        </div>`;
    makeModal('transferModal','Multi-Location Transfer Order','bx-transfer',body,700);
};

// ===== F107: Warehouse Capacity Planner =====
window.showCapacityPlanner = function() {
    const zones = [
        {name:'Zone A', totalPallets:200, usedPallets:182, type:'Raw Materials'},
        {name:'Zone B', totalPallets:150, usedPallets:89, type:'Finished Goods'},
        {name:'Zone C', totalPallets:80, usedPallets:34, type:'Packaging'},
        {name:'Zone D (Cold)', totalPallets:60, usedPallets:58, type:'Cold Storage'},
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px;">
            ${zones.map(z=>{
                const pct=Math.round(z.usedPallets/z.totalPallets*100);
                const color=pct>90?'var(--danger-color)':pct>70?'var(--warning-color)':'var(--success-color)';
                return `<div style="background:var(--bg-main);border-radius:12px;padding:20px;border:1px solid var(--border-color);">
                    <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                        <div><strong>${z.name}</strong><br><span style="font-size:0.78rem;color:var(--text-muted);">${z.type}</span></div>
                        <div style="font-size:1.5rem;font-weight:900;color:${color};">${pct}%</div>
                    </div>
                    <div style="height:10px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${color};border-radius:99px;transition:width 0.5s;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.78rem;color:var(--text-muted);">
                        <span>Used: ${z.usedPallets} pallets</span><span>Total: ${z.totalPallets} pallets</span>
                    </div>
                </div>`;
            }).join('')}
        </div>
        <div style="background:var(--primary-light);border-radius:12px;padding:16px;text-align:center;">
            <strong>Total Warehouse Utilization: ${Math.round(zones.reduce((a,z)=>a+z.usedPallets,0)/zones.reduce((a,z)=>a+z.totalPallets,0)*100)}%</strong>
            <span style="margin-left:16px;font-size:0.85rem;color:var(--text-muted);">Available: ${zones.reduce((a,z)=>a+(z.totalPallets-z.usedPallets),0)} pallets</span>
        </div>`;
    makeModal('capacityModal','Warehouse Capacity Planner','bx-building',body,700);
};

// ===== F108: FEFO Picker Assist =====
window.showFEFOPicker = function() {
    const batches = [
        {sku:'SKU-001', product:'Aloo Bhujia (500g)', batch:'#B-2350', mfgDate:'01 Jun 2026', expDate:'31 Aug 2026', daysLeft:28, qty:500, location:'Z1-R2-B04'},
        {sku:'SKU-001', product:'Aloo Bhujia (500g)', batch:'#B-2380', mfgDate:'15 Jun 2026', expDate:'30 Sep 2026', daysLeft:58, qty:800, location:'Z1-R2-B05'},
        {sku:'SKU-002', product:'Navratna Mix (1kg)', batch:'#B-2360', mfgDate:'10 Jun 2026', expDate:'10 Sep 2026', daysLeft:38, qty:320, location:'Z1-R4-B01'},
    ];
    const body = `
        <div style="background:var(--info-color)15;border:1px solid var(--info-color)30;border-radius:10px;padding:14px;margin-bottom:16px;font-size:0.85rem;">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> <strong>FEFO (First Expired, First Out)</strong> — Always pick the batch with the <strong>nearest expiry date</strong> first to minimize waste.
        </div>
        <table class="table"><thead><tr><th>Batch</th><th>Product</th><th>MFG Date</th><th>Exp Date</th><th>Days Left</th><th>Qty</th><th>Location</th><th>FEFO</th></tr></thead>
        <tbody>${batches.map((b,i)=>`<tr style="${i===0||i===2?'background:var(--success-color)08;':''}"}>
            <td><code>${b.batch}</code></td><td>${b.product}</td><td>${b.mfgDate}</td><td>${b.expDate}</td>
            <td><span style="color:${b.daysLeft<40?'var(--danger-color)':'var(--text-main)'};font-weight:${b.daysLeft<40?700:400};">${b.daysLeft}d</span></td>
            <td>${b.qty}</td><td><code>${b.location}</code></td>
            <td>${(i===0||i===2)?'<span class="badge status-success">✓ Pick First</span>':'<span class="badge status-warning">After</span>'}</td>
        </tr>`).join('')}</tbody></table>
        <div style="margin-top:16px;text-align:right;">
            <button class="btn btn-primary" onclick="window.showToast('FEFO pick list generated and sent to scanner','success')"><i class='bx bx-printer'></i> Print Pick List</button>
        </div>`;
    makeModal('fefoModal','FEFO Picker Assist','bx-sort-alt-2',body,900);
};

// ===== F109: Pallet Build Optimizer =====
window.showPalletOptimizer = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:1rem;margin-bottom:16px;">Input Parameters</h3>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    ${[['Product SKU','SKU-001 — Aloo Bhujia (500g)'],['Case Weight','12 kg/case'],['Case Dimensions','40×30×20 cm'],['Pallet Max Height','180 cm'],['Pallet Max Weight','800 kg']].map(([l,v])=>`
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${l}</label>
                    <input value="${v}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);"></div>`).join('')}
                </div>
                <button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="document.getElementById('palletResult').style.display='block';window.showToast('Optimization complete','success')">
                    <i class='bx bx-calculator'></i> Optimize
                </button>
            </div>
            <div id="palletResult" style="display:none;">
                <h3 style="font-size:1rem;margin-bottom:16px;">Optimization Result</h3>
                <div style="background:var(--success-color)10;border:1px solid var(--success-color)30;border-radius:12px;padding:20px;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        ${[['Cases per Layer','6'],['Layers per Pallet','9'],['Total Cases','54'],['Total Weight','648 kg'],['Space Utilization','81%'],['Cases Remaining','—']].map(([l,v])=>`
                        <div style="text-align:center;"><div style="font-size:1.5rem;font-weight:900;color:var(--primary-color);">${v}</div><div style="font-size:0.75rem;color:var(--text-muted);">${l}</div></div>`).join('')}
                    </div>
                </div>
            </div>
        </div>`;
    makeModal('palletModal','Pallet Build Optimizer','bx-package',body,750);
};

// ===== F110: Space Utilization Heatmap =====
window.showHeatmap = function() {
    const rows = 10, cols = 12;
    const heatData = Array.from({length:rows*cols},()=>Math.random());
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
            <span style="font-size:0.85rem;font-weight:600;">Warehouse Floor Plan — Fill Level Heatmap</span>
            <div style="display:flex;gap:8px;font-size:0.75rem;">
                ${[['#dcfce7','Empty (0%)'],['#86efac','Low (<40%)'],['#fde68a','Medium (<70%)'],['#fca5a5','High (<90%)'],['#ef4444','Critical (>90%)']].map(([c,l])=>`<span style="display:flex;align-items:center;gap:4px;"><span style="width:14px;height:14px;background:${c};border-radius:2px;display:inline-block;"></span>${l}</span>`).join('')}
            </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:3px;margin-bottom:16px;">
            ${heatData.map((v,i)=>{
                const pct=Math.round(v*100);
                const color = v<0.1?'#dcfce7':v<0.4?'#86efac':v<0.7?'fde68a':v<0.9?'#fca5a5':'#ef4444';
                const row=Math.floor(i/cols)+1, col=(i%cols)+1;
                return `<div style="height:36px;background:${color};border-radius:3px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:#333;" title="R${row}-C${col}: ${pct}% full" onclick="window.showToast('Bin R${row}-C${col}: ${pct}% utilized','info')">${pct}%</div>`;
            }).join('')}
        </div>`;
    makeModal('heatmapModal','Space Utilization Heatmap','bx-grid',body,900);
};

// ===== F111: Negative Stock Prevention Lock =====
window.showStockLock = function() {
    const settings = JSON.parse(localStorage.getItem('wms_stock_lock')||'{"enabled":true,"blockDispatch":true,"alertThreshold":10}');
    const body = `
        <div style="display:flex;flex-direction:column;gap:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:20px;background:var(--bg-main);border-radius:12px;">
                <div><strong>Block Dispatch on Zero Stock</strong><br><span style="font-size:0.85rem;color:var(--text-muted);">Prevent dispatch orders from processing when stock = 0</span></div>
                <label style="position:relative;display:inline-block;width:50px;height:26px;">
                    <input type="checkbox" id="stockLockToggle" ${settings.enabled?'checked':''} style="opacity:0;width:0;height:0;" onchange="window.saveStockLock()">
                    <span style="position:absolute;cursor:pointer;inset:0;background:${settings.enabled?'var(--primary-color)':'var(--border-color)'};border-radius:99px;transition:0.3s;" onclick="document.getElementById('stockLockToggle').click()"><span style="position:absolute;height:20px;width:20px;left:${settings.enabled?'26':'3'}px;bottom:3px;background:white;border-radius:50%;transition:0.3s;"></span></span>
                </label>
            </div>
            <div style="padding:20px;background:var(--bg-main);border-radius:12px;">
                <label style="font-weight:600;display:block;margin-bottom:8px;">Low Stock Alert Threshold (units)</label>
                <input type="number" id="alertThreshold" value="${settings.alertThreshold}" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-card);">
            </div>
            <div style="padding:16px;background:var(--danger-color)10;border-radius:12px;border:1px solid var(--danger-color)30;">
                <strong style="color:var(--danger-color);">Currently Blocked SKUs (stock ≤ 0)</strong>
                <div style="margin-top:10px;">${DataManager.getProducts().filter(p=>p.stock<=0).map(p=>`<div style="padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.85rem;">${p.id} — ${p.name}</div>`).join('')||'<span style="color:var(--text-muted);font-size:0.85rem;">No blocked SKUs currently</span>'}</div>
            </div>
            <button class="btn btn-primary" onclick="window.saveStockLock()"><i class='bx bx-save'></i> Save Settings</button>
        </div>`;
    makeModal('stockLockModal','Negative Stock Prevention Lock','bx-lock',body,600);
};
window.saveStockLock = function() {
    const enabled = document.getElementById('stockLockToggle')?.checked??true;
    const threshold = document.getElementById('alertThreshold')?.value??10;
    localStorage.setItem('wms_stock_lock', JSON.stringify({enabled, blockDispatch:enabled, alertThreshold:parseInt(threshold)}));
    window.showToast('Stock lock settings saved','success');
};

// ===== F112: Stock Reservation Manager =====
window.showStockReservations = function() {
    const key = 'wms_reservations';
    const reservations = JSON.parse(localStorage.getItem(key)||'[]');
    const defaultRes = [
        {id:'RES-001', sku:'SKU-001', product:'Aloo Bhujia (500g)', qty:500, for:'SO-4501 (Mega Mart)', expiry:'05 Aug 2026', status:'Active'},
        {id:'RES-002', sku:'SKU-002', product:'Navratna Mix (1kg)', qty:200, for:'SO-4492 (SuperMart)', expiry:'03 Aug 2026', status:'Active'},
    ];
    const allRes = [...defaultRes, ...reservations];
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.addReservation()"><i class='bx bx-plus'></i> New Reservation</button>
        </div>
        <table class="table"><thead><tr><th>ID</th><th>SKU</th><th>Product</th><th>Qty Reserved</th><th>For</th><th>Expiry</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${allRes.map(r=>`<tr>
            <td><code>${r.id}</code></td><td><code>${r.sku}</code></td><td>${r.product}</td>
            <td><strong>${r.qty}</strong></td><td>${r.for}</td><td>${r.expiry}</td>
            <td><span class="badge status-success">${r.status}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.75rem;padding:2px 8px;color:var(--danger-color);" onclick="window.showToast('Reservation ${r.id} released','warning')">Release</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('reservationModal','Stock Reservation Manager','bx-bookmark',body,900);
};
window.addReservation = function() {
    const sku = prompt('SKU to reserve (e.g. SKU-001):');
    if (!sku) return;
    const qty = prompt('Quantity to reserve:');
    if (!qty) return;
    const forOrder = prompt('For which order/customer?');
    const reservations = JSON.parse(localStorage.getItem('wms_reservations')||'[]');
    const product = DataManager.getProducts().find(p=>p.id===sku);
    reservations.push({id:'RES-'+Date.now().toString().slice(-4), sku, product:product?.name||'Unknown', qty:parseInt(qty), for:forOrder||'Manual', expiry:'10 Aug 2026', status:'Active'});
    localStorage.setItem('wms_reservations', JSON.stringify(reservations));
    window.showToast(`Reserved ${qty} units of ${sku}`, 'success');
    document.getElementById('reservationModal')?.remove();
    window.showStockReservations();
};

// ===== F113: Inventory Snapshot History =====
window.showInventorySnapshots = function() {
    const today = new Date();
    const snapshots = Array.from({length:7},(_, i)=>{
        const d = new Date(today); d.setDate(d.getDate()-i);
        const products = DataManager.getProducts();
        const totalStock = products.reduce((a,p)=>a+(parseInt(p.stock)||0),0);
        const totalValue = products.reduce((a,p)=>a+((parseInt(p.stock)||0)*(parseFloat(p.price)||0)),0);
        return { date: d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}), totalStock:totalStock+Math.floor(Math.random()*200-100), totalValue:Math.round(totalValue+Math.random()*50000-25000), skuCount:products.length };
    }).reverse();
    const body = `
        <div style="overflow-x:auto;">
            <table class="table"><thead><tr><th>Date</th><th>SKU Count</th><th>Total Stock (units)</th><th>Inventory Value</th><th>Δ Value</th></tr></thead>
            <tbody>${snapshots.map((s,i)=>{
                const prev = snapshots[i-1];
                const delta = prev ? s.totalValue - prev.totalValue : 0;
                return `<tr>
                    <td><strong>${s.date}</strong></td><td>${s.skuCount}</td><td>${s.totalStock.toLocaleString('en-IN')}</td>
                    <td>₹${s.totalValue.toLocaleString('en-IN')}</td>
                    <td>${i>0?`<span style="color:${delta>=0?'var(--success-color)':'var(--danger-color)'};font-weight:700;">${delta>=0?'+':''}₹${delta.toLocaleString('en-IN')}</span>`:'—'}</td>
                </tr>`;
            }).join('')}</tbody></table>
        </div>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('Snapshot taken for today','success')"><i class='bx bx-camera'></i> Take Snapshot Now</button>`;
    makeModal('snapshotModal','Inventory Snapshot History','bx-history',body,750);
};

// ===== F114: Virtual Multi-Site Warehouse =====
window.showVirtualWarehouse = function() {
    const sites = [
        {name:'Pune Main Warehouse', location:'MIDC, Pune', products:DataManager.getProducts().length, stock:DataManager.getProducts().reduce((a,p)=>a+(p.stock||0),0), status:'Primary'},
        {name:'Mumbai Transit Hub', location:'Bhiwandi, Mumbai', products:3, stock:12000, status:'Secondary'},
        {name:'Delhi Distribution Center', location:'Rohini, Delhi', products:2, stock:5400, status:'Secondary'},
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
            ${sites.map(s=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:16px;padding:20px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
                    <div>
                        <div style="font-weight:700;">${s.name}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);"><i class='bx bx-map-pin'></i> ${s.location}</div>
                    </div>
                    <span class="badge ${s.status==='Primary'?'status-success':'status-info'}">${s.status}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
                    <div style="text-align:center;padding:10px;background:var(--bg-card);border-radius:8px;"><div style="font-size:1.3rem;font-weight:700;">${s.products}</div><div style="font-size:0.72rem;color:var(--text-muted);">SKUs</div></div>
                    <div style="text-align:center;padding:10px;background:var(--bg-card);border-radius:8px;"><div style="font-size:1.3rem;font-weight:700;">${s.stock.toLocaleString()}</div><div style="font-size:0.72rem;color:var(--text-muted);">Total Units</div></div>
                </div>
                <button class="btn btn-outline" style="width:100%;font-size:0.8rem;" onclick="window.showToast('Viewing ${s.name} inventory...','info')">View Inventory</button>
            </div>`).join('')}
        </div>
        <div style="margin-top:16px;text-align:right;">
            <button class="btn btn-primary" onclick="window.showToast('New site added','success')"><i class='bx bx-plus'></i> Add New Site</button>
        </div>`;
    makeModal('virtualWHModal','Virtual Multi-Site Warehouse','bx-buildings',body,800);
};

// ===== F115: Stock Aging Report =====
window.showStockAging = function() {
    const products = DataManager.getProducts();
    const aging = products.map((p,i)=>({...p, age30:Math.floor(p.stock*0.3), age60:Math.floor(p.stock*0.2), age90:Math.floor(p.stock*0.1), fresh:Math.floor(p.stock*0.4)}));
    const body = `
        <table class="table"><thead><tr><th>Product</th><th>Fresh (&lt;30d)</th><th>30-60 Days</th><th>60-90 Days</th><th>90+ Days</th><th>Total</th></tr></thead>
        <tbody>${aging.map(a=>`<tr>
            <td>${a.name}</td>
            <td><span style="color:var(--success-color);">${a.fresh}</span></td>
            <td><span style="color:var(--info-color);">${a.age30}</span></td>
            <td><span style="color:var(--warning-color);">${a.age60}</span></td>
            <td><span style="color:var(--danger-color);font-weight:${a.age90>0?700:400};">${a.age90}</span></td>
            <td><strong>${a.stock}</strong></td>
        </tr>`).join('')}</tbody>
        <tfoot><tr style="font-weight:700;background:var(--primary-light);">
            <td>TOTAL</td>
            <td>${aging.reduce((a,x)=>a+x.fresh,0)}</td>
            <td>${aging.reduce((a,x)=>a+x.age30,0)}</td>
            <td>${aging.reduce((a,x)=>a+x.age60,0)}</td>
            <td style="color:var(--danger-color);">${aging.reduce((a,x)=>a+x.age90,0)}</td>
            <td>${products.reduce((a,p)=>a+(p.stock||0),0)}</td>
        </tr></tfoot></table>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('Stock aging report exported as CSV','success')"><i class='bx bx-download'></i> Export CSV</button>`;
    makeModal('stockAgingModal','Stock Aging Report','bx-time',body,800);
};

// ===== F116: Damage Write-Off Form =====
window.showWriteOff = function() {
    const body = `
        <form onsubmit="event.preventDefault();window.submitWriteOff()">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                <div><label style="font-weight:600;display:block;margin-bottom:6px;">SKU / Product *</label>
                    <select id="woSku" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                        ${DataManager.getProducts().map(p=>`<option value="${p.id}">${p.id} — ${p.name}</option>`).join('')}
                    </select></div>
                <div><label style="font-weight:600;display:block;margin-bottom:6px;">Quantity to Write-Off *</label>
                    <input type="number" id="woQty" min="1" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" placeholder="Enter quantity"></div>
            </div>
            <div style="margin-bottom:16px;"><label style="font-weight:600;display:block;margin-bottom:6px;">Reason for Write-Off *</label>
                <select id="woReason" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <option>Physical Damage</option><option>Expired / Near-Expiry</option><option>Pest Contamination</option>
                    <option>Water / Moisture Damage</option><option>Fire / Flood Damage</option><option>Quality Rejection</option>
                </select></div>
            <div style="margin-bottom:16px;"><label style="font-weight:600;display:block;margin-bottom:6px;">Additional Notes</label>
                <textarea id="woNotes" rows="3" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);resize:vertical;" placeholder="Describe the damage..."></textarea></div>
            <div style="margin-bottom:20px;padding:14px;background:var(--warning-color)10;border-radius:10px;border:1px solid var(--warning-color)30;font-size:0.85rem;">
                <i class='bx bx-info-circle' style="color:var(--warning-color);"></i> Write-off will reduce stock and create an audit log entry for compliance.
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button type="button" class="btn btn-outline" onclick="document.getElementById('writeOffModal').remove()">Cancel</button>
                <button type="submit" class="btn btn-danger"><i class='bx bx-trash'></i> Submit Write-Off</button>
            </div>
        </form>`;
    makeModal('writeOffModal','Damage Write-Off Form','bx-trash',body,650);
};
window.submitWriteOff = function() {
    const sku = document.getElementById('woSku')?.value;
    const qty = parseInt(document.getElementById('woQty')?.value||0);
    const reason = document.getElementById('woReason')?.value;
    if (!sku||!qty) { window.showToast('Please fill in all required fields','danger'); return; }
    DataManager.updateProduct(sku, {stock: Math.max(0,(DataManager.getProducts().find(p=>p.id===sku)?.stock||0)-qty)});
    DataManager.logAction('Write-Off', `Wrote off ${qty} units of ${sku}: ${reason}`);
    window.showToast(`Write-off of ${qty} units processed for ${sku}`,'success');
    document.getElementById('writeOffModal')?.remove();
};

// ===== F117: Inventory Valuation Toggle =====
window.showValuationMethod = function() {
    const products = DataManager.getProducts();
    const methods = {
        FIFO: products.reduce((a,p)=>a+(p.stock*p.price*1.02),0),
        WAC: products.reduce((a,p)=>a+(p.stock*p.price),0),
        Standard: products.reduce((a,p)=>a+(p.stock*p.price*0.98),0),
    };
    const body = `
        <p style="color:var(--text-muted);margin-bottom:20px;">Select a valuation method to see how it affects your total inventory value. This affects your balance sheet and COGS calculations.</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
            ${Object.entries(methods).map(([method, value])=>`
            <div style="background:var(--bg-main);border:2px solid var(--border-color);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;" 
                onclick="this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='var(--border-color)');this.style.borderColor='var(--primary-color)';window.showToast('${method} valuation selected — ₹${Math.round(value).toLocaleString('en-IN')} total','info')">
                <div style="font-size:1.1rem;font-weight:800;margin-bottom:4px;">${method}</div>
                <div style="font-size:1.5rem;font-weight:900;color:var(--primary-color);">₹${Math.round(value).toLocaleString('en-IN')}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${method==='FIFO'?'First In, First Out':method==='WAC'?'Weighted Average Cost':'Standard Cost'}</div>
            </div>`).join('')}
        </div>
        <div style="padding:14px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;color:var(--text-muted);">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Note: Switching valuation methods requires accountant approval in a live ERP. This view is for analysis only.
        </div>`;
    makeModal('valuationModal','Inventory Valuation Method','bx-coin',body,700);
};

// ===== F118: Stock Reservation Release Bulk =====
// (already covered above) — skip to F119

// ===== F119: Replenishment Wave Planner =====
window.showWavePlanner = function() {
    const rules = DataManager.getReorderRules();
    const waves = [
        {id:'WAVE-001', time:'08:00 AM', zones:['Zone A'], items: rules.length+1, status:'Planned'},
        {id:'WAVE-002', time:'11:30 AM', zones:['Zone B'], items:3, status:'Planned'},
        {id:'WAVE-003', time:'03:00 PM', zones:['Zone A','Zone C'], items:5, status:'Pending Approval'},
    ];
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.showToast('New replenishment wave created','success')"><i class='bx bx-plus'></i> Create Wave</button>
            <button class="btn btn-outline" onclick="window.showToast('All waves released to floor','info')"><i class='bx bx-send'></i> Release All Waves</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${waves.map(w=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="width:48px;height:48px;background:var(--primary-light);border-radius:12px;display:flex;align-items:center;justify-content:center;"><i class='bx bx-time' style="color:var(--primary-color);font-size:1.4rem;"></i></div>
                    <div>
                        <div style="font-weight:700;">${w.id} — ${w.time}</div>
                        <div style="font-size:0.8rem;color:var(--text-muted);">${w.zones.join(', ')} • ${w.items} items to replenish</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="badge ${w.status==='Planned'?'status-info':'status-warning'}">${w.status}</span>
                    <button class="btn btn-primary" style="font-size:0.75rem;padding:4px 12px;" onclick="window.showToast('${w.id} released to floor team','success')">Release</button>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('waveModal','Replenishment Wave Planner','bx-wave',body,750);
};

// ===== F120: Zone Throughput Report =====
window.showZoneThroughput = function() {
    const zones = [
        {zone:'Zone A', zoneIn:1450, zoneOut:1200, turnover:2.3, topItem:'Besan (Gram Flour)'},
        {zone:'Zone B', zoneIn:3200, zoneOut:2950, turnover:4.1, topItem:'Aloo Bhujia (500g)'},
        {zone:'Zone C', zoneIn:800, zoneOut:750, turnover:1.8, topItem:'BOPP Pouches'},
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            ${zones.map(z=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;">
                <div style="font-weight:700;margin-bottom:12px;color:var(--primary-color);">${z.zone}</div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.82rem;"><span>Items In (today)</span><span style="font-weight:700;color:var(--success-color);">${z.zoneIn.toLocaleString()}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.82rem;"><span>Items Out (today)</span><span style="font-weight:700;color:var(--primary-color);">${z.zoneOut.toLocaleString()}</span></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.82rem;"><span>Turnover Ratio</span><span style="font-weight:700;">${z.turnover}x</span></div>
                <div style="font-size:0.75rem;color:var(--text-muted);">Top: ${z.topItem}</div>
            </div>`).join('')}
        </div>
        <table class="table"><thead><tr><th>Hour</th><th>Zone A In</th><th>Zone A Out</th><th>Zone B In</th><th>Zone B Out</th></tr></thead>
        <tbody>${['08:00','09:00','10:00','11:00','12:00','13:00','14:00'].map(h=>`<tr>
            <td><strong>${h}</strong></td>
            <td>${Math.floor(Math.random()*200+50)}</td><td>${Math.floor(Math.random()*180+40)}</td>
            <td>${Math.floor(Math.random()*400+100)}</td><td>${Math.floor(Math.random()*380+80)}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('throughputModal','Zone Throughput Report','bx-trending-up',body,800);
};

// =====================================================
// SALES, ORDERS & CUSTOMER FEATURES — F121–F135
// =====================================================

// ===== F121: Sales Order Auto-Routing =====
window.showSORouter = function() {
    const orders = DataManager.getDispatchOrders();
    const body = `
        <div style="margin-bottom:16px;padding:14px;background:var(--info-color)10;border-radius:10px;font-size:0.85rem;color:var(--text-muted);">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Auto-routing assigns each SO to the nearest zone that has sufficient stock, minimizing picker travel distance.
        </div>
        <table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Assigned Zone</th><th>Action</th></tr></thead>
        <tbody>${orders.map(o=>{
            const zones = ['Zone A — R3-B08','Zone B — R1-B12','Zone B — R5-B02'];
            const zone = zones[Math.floor(Math.random()*zones.length)];
            return `<tr>
                <td><code>${o.id}</code></td><td>${o.customer}</td>
                <td><span class="badge ${o.statusClass||'status-info'}">${o.status}</span></td>
                <td><span style="color:var(--primary-color);">${zone}</span></td>
                <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${o.id} re-routed to optimal zone','success')">Re-Route</button></td>
            </tr>`;
        }).join('')}</tbody></table>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('All orders auto-routed to optimal zones','success')"><i class='bx bx-map-alt'></i> Auto-Route All</button>`;
    makeModal('soRouterModal','Sales Order Auto-Routing','bx-map-alt',body,800);
};

// ===== F122: Customer Credit Limit Checker =====
window.showCreditChecker = function() {
    const customers = DataManager.getCustomers();
    const body = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${customers.map(c=>{
                const usedPct = Math.round(c.used/c.creditLimit*100);
                const color = usedPct>90?'var(--danger-color)':usedPct>70?'var(--warning-color)':'var(--success-color)';
                const available = c.creditLimit - c.used;
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <div><strong>${c.name}</strong><br><span style="font-size:0.78rem;color:var(--text-muted);">GST: ${c.gst||'—'}</span></div>
                        <div style="text-align:right;"><div style="font-size:1.2rem;font-weight:900;color:${color};">${usedPct}% used</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">₹${available.toLocaleString('en-IN')} available</div></div>
                    </div>
                    <div style="height:8px;background:var(--border-color);border-radius:99px;overflow:hidden;margin-bottom:8px;">
                        <div style="height:100%;width:${usedPct}%;background:${color};border-radius:99px;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted);">
                        <span>Used: ₹${c.used?.toLocaleString('en-IN')}</span><span>Limit: ₹${c.creditLimit?.toLocaleString('en-IN')}</span>
                    </div>
                    ${usedPct>90?`<div style="margin-top:8px;padding:6px 10px;background:var(--danger-color)10;border-radius:6px;font-size:0.78rem;color:var(--danger-color);font-weight:600;"><i class='bx bx-block'></i> New orders blocked — credit limit exceeded</div>`:''}
                </div>`;
            }).join('')}
        </div>`;
    makeModal('creditModal','Customer Credit Limit Checker','bx-credit-card',body,650);
};

// ===== F123: Order Priority Queue Manager =====
window.showPriorityQueue = function() {
    const orders = DataManager.getDispatchOrders();
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Drag orders to reprioritize. Changes are saved automatically.</p>
        <div id="priorityList" style="display:flex;flex-direction:column;gap:8px;">
            ${orders.map((o,i)=>`
            <div draggable="true" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:14px;display:flex;align-items:center;gap:12px;cursor:grab;transition:all 0.2s;">
                <div style="width:28px;height:28px;background:var(--primary-color);border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.8rem;">#${i+1}</div>
                <div style="flex:1;">
                    <strong>${o.id}</strong> — ${o.customer}
                    <div style="font-size:0.78rem;color:var(--text-muted);">${o.status}</div>
                </div>
                <span class="badge ${o.statusClass||'status-info'}">${o.status}</span>
                <div style="display:flex;gap:4px;">
                    <button class="btn btn-outline" style="padding:3px 8px;font-size:0.75rem;" onclick="window.showToast('${o.id} moved up','info')">↑</button>
                    <button class="btn btn-outline" style="padding:3px 8px;font-size:0.75rem;" onclick="window.showToast('${o.id} moved down','info')">↓</button>
                </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="window.showToast('Priority queue saved','success')"><i class='bx bx-save'></i> Save Priority Order</button>`;
    makeModal('priorityModal','Order Priority Queue','bx-list-ol',body,700);
};

// ===== F124: Partial Fulfillment Tracker =====
window.showPartialFulfillment = function() {
    const orders = DataManager.getDispatchOrders().map(o=>({
        ...o, ordered:Math.floor(Math.random()*500+100), shipped:Math.floor(Math.random()*400+50)
    }));
    const body = `
        <table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Ordered Qty</th><th>Shipped Qty</th><th>Pending</th><th>Fulfillment</th><th>Action</th></tr></thead>
        <tbody>${orders.map(o=>{
            const pct = Math.min(100,Math.round(o.shipped/o.ordered*100));
            const pending = Math.max(0,o.ordered-o.shipped);
            return `<tr>
                <td><code>${o.id}</code></td><td>${o.customer}</td>
                <td>${o.ordered}</td><td>${o.shipped}</td>
                <td><span style="color:${pending>0?'var(--warning-color)':'var(--success-color)'};">${pending}</span></td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="flex:1;height:6px;background:var(--border-color);border-radius:99px;min-width:60px;"><div style="height:100%;width:${pct}%;background:${pct<50?'var(--danger-color)':pct<100?'var(--warning-color)':'var(--success-color)'};border-radius:99px;"></div></div>
                        <span style="font-size:0.75rem;font-weight:700;">${pct}%</span>
                    </div>
                </td>
                <td>${pending>0?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Backorder created for ${o.id}','info')">Backorder</button>`:'<span class="badge status-success">Complete</span>'}</td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('partialModal','Partial Fulfillment Tracker','bx-package',body,900);
};

// ===== F125: Return Merchandise Authorization (RMA) PDF =====
window.generateRMA = function() {
    const rmaId = 'RMA-' + Math.floor(8000+Math.random()*999);
    const customer = prompt('Customer name for RMA:','Mega Mart');
    if (!customer) return;
    const items = prompt('Items being returned:','Aloo Bhujia (500g) x 50');
    const reason = prompt('Reason for return:','Near Expiry');
    const win = window.open('','_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>RMA ${rmaId}</title><style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;}
        .header{text-align:center;border-bottom:3px solid #6366f1;padding-bottom:20px;margin-bottom:30px;}
        table{width:100%;border-collapse:collapse;margin:20px 0;}
        th,td{padding:10px;border:1px solid #e2e8f0;text-align:left;}
        th{background:#f8fafc;font-weight:700;}
        .badge{padding:4px 12px;border-radius:6px;font-size:0.8rem;font-weight:700;}
    </style></head><body>
        <div class="header">
            <h1 style="color:#6366f1;margin:0;">RETURN MERCHANDISE AUTHORIZATION</h1>
            <h2 style="margin:0;">RMA #${rmaId}</h2>
            <p style="color:#64748b;">Namkeen Industries Pvt. Ltd. — MIDC, Pune</p>
        </div>
        <table><tr><th>RMA Number</th><td>${rmaId}</td><th>Date</th><td>${new Date().toLocaleDateString('en-IN')}</td></tr>
        <tr><th>Customer</th><td>${customer}</td><th>Status</th><td><span class="badge" style="background:#fef3c7;color:#b45309;">Pending Receipt</span></td></tr>
        <tr><th>Items</th><td colspan="3">${items||'—'}</td></tr>
        <tr><th>Return Reason</th><td colspan="3">${reason||'—'}</td></tr>
        <tr><th>Instructions</th><td colspan="3">Please ship items to our warehouse within 7 days. Include this form with the shipment.</td></tr></table>
        <div style="margin-top:40px;display:flex;justify-content:space-between;">
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:8px;margin-top:40px;width:200px;">Customer Signature</div></div>
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:8px;margin-top:40px;width:200px;">Authorized By</div></div>
        </div>
        <script>window.print();</script>
    </body></html>`);
    DataManager.logAction('RMA Generated', `${rmaId} for ${customer}: ${items}`);
    window.showToast(`RMA ${rmaId} generated for ${customer}`, 'success');
};

// ===== F126: Cash-on-Delivery Tracker =====
window.showCODTracker = function() {
    const codEntries = [
        {id:'COD-001', order:'SO-4501', customer:'Mega Mart', amount:18500, deliveryDate:'Today', status:'Pending Collection', driver:'Ramesh K.'},
        {id:'COD-002', order:'SO-4490', customer:'SuperMart', amount:9800, deliveryDate:'Yesterday', status:'Collected', driver:'Suresh P.'},
        {id:'COD-003', order:'SO-4485', customer:'Local Distributor', amount:5500, deliveryDate:'30 Jul', status:'Deposited', driver:'Vijay M.'},
    ];
    const pending = codEntries.filter(c=>c.status==='Pending Collection').reduce((a,c)=>a+c.amount,0);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">₹${pending.toLocaleString('en-IN')}</div><div class="stat-label">Pending Collection</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">₹${codEntries.filter(c=>c.status==='Collected').reduce((a,c)=>a+c.amount,0).toLocaleString('en-IN')}</div><div class="stat-label">Collected (not deposited)</div></div>
            <div class="stat-card"><div class="stat-number">₹${codEntries.filter(c=>c.status==='Deposited').reduce((a,c)=>a+c.amount,0).toLocaleString('en-IN')}</div><div class="stat-label">Deposited to Bank</div></div>
        </div>
        <table class="table"><thead><tr><th>COD ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Delivery</th><th>Driver</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${codEntries.map(c=>`<tr>
            <td><code>${c.id}</code></td><td>${c.order}</td><td>${c.customer}</td>
            <td><strong>₹${c.amount.toLocaleString('en-IN')}</strong></td><td>${c.deliveryDate}</td><td>${c.driver}</td>
            <td><span class="badge ${c.status==='Deposited'?'status-success':c.status==='Collected'?'status-info':'status-warning'}">${c.status}</span></td>
            <td>${c.status==='Pending Collection'?`<button class="btn btn-primary" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${c.id} marked as collected','success')">Mark Collected</button>`:
                c.status==='Collected'?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${c.id} deposited to bank','success')">Deposit</button>`:'—'}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('codModal','Cash-on-Delivery Tracker','bx-money',body,950);
};

// ===== F127: Payment Reminder Scheduler =====
window.showPaymentReminders = function() {
    const customers = DataManager.getCustomers();
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.showToast('Reminders sent to all overdue customers via WhatsApp','success')"><i class='bxl bxl-whatsapp'></i> Send All Reminders</button>
            <button class="btn btn-outline" onclick="window.showToast('Reminder schedule configured','info')"><i class='bx bx-calendar'></i> Configure Schedule</button>
        </div>
        <table class="table"><thead><tr><th>Customer</th><th>30d Overdue</th><th>60d Overdue</th><th>90d+ Overdue</th><th>Action</th></tr></thead>
        <tbody>${customers.map(c=>{
            const hasOverdue = (c.outstanding30||0)+(c.outstanding60||0)+(c.outstanding90||0)>0;
            return `<tr style="${hasOverdue?'':'opacity:0.6'}">
                <td><strong>${c.name}</strong></td>
                <td style="color:${c.outstanding30>0?'var(--warning-color)':'var(--text-muted)'};">₹${(c.outstanding30||0).toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding60>0?'#f97316':'var(--text-muted)'};">₹${(c.outstanding60||0).toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding90>0?'var(--danger-color)':'var(--text-muted)'};">₹${(c.outstanding90||0).toLocaleString('en-IN')}</td>
                <td>${hasOverdue?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Reminder sent to ${c.name}','success')">Send Reminder</button>`:'<span style="color:var(--success-color);font-size:0.8rem;">✓ No Overdue</span>'}</td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('paymentReminderModal','Payment Reminder Scheduler','bx-bell',body,800);
};

// ===== F128: Trade Discount Matrix =====
window.showDiscountMatrix = function() {
    const segments = ['VIP / Key Account','Distributor','Retailer','Occasional Buyer'];
    const products = ['Aloo Bhujia (500g)','Navratna Mix (1kg)','Khatta Meetha (250g)'];
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Configure discount percentages per customer segment and product line. Click any cell to edit.</p>
        <div style="overflow-x:auto;">
            <table class="table">
                <thead><tr><th>Customer Segment</th>${products.map(p=>`<th>${p}</th>`).join('')}<th>Actions</th></tr></thead>
                <tbody>${segments.map((seg,si)=>`<tr>
                    <td><strong>${seg}</strong></td>
                    ${products.map((_,pi)=>{
                        const discount = [15,10,5,2][si]+pi;
                        return `<td><input type="number" value="${discount}" min="0" max="50" style="width:60px;padding:4px;border:1px solid var(--border-color);border-radius:4px;text-align:center;" onchange="window.showToast('Discount updated','success')">%</td>`;
                    }).join('')}
                    <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Discount saved for ${seg}','success')">Save</button></td>
                </tr>`).join('')}</tbody>
            </table>
        </div>`;
    makeModal('discountModal','Trade Discount Matrix','bx-purchase-tag',body,800);
};

// ===== F129: Scheme / Promotion Manager =====
window.showPromoManager = function() {
    const key='wms_promotions';
    const promos = JSON.parse(localStorage.getItem(key)||'[]');
    const defaultPromos=[
        {id:'PROMO-01', name:'Diwali Combo Offer', type:'Buy X Get Y', description:'Buy 10 boxes Aloo Bhujia, Get 2 Free', startDate:'01 Oct 2026', endDate:'15 Nov 2026', status:'Scheduled'},
        {id:'PROMO-02', name:'Bulk Slab Discount', type:'Slab Discount', description:'Order > ₹50K = 8% off, > ₹1L = 12% off', startDate:'01 Aug 2026', endDate:'31 Aug 2026', status:'Active'},
    ];
    const allPromos=[...defaultPromos,...promos];
    const body = `
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.addPromo()"><i class='bx bx-plus'></i> New Promotion</button></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${allPromos.map(p=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:700;">${p.name} <span class="badge status-info" style="font-size:0.7rem;">${p.type}</span></div>
                    <div style="font-size:0.82rem;color:var(--text-muted);">${p.description}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">${p.startDate} → ${p.endDate}</div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <span class="badge ${p.status==='Active'?'status-success':p.status==='Scheduled'?'status-warning':'status-danger'}">${p.status}</span>
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${p.name} deactivated','warning')">Deactivate</button>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('promoModal','Promotion Manager','bx-gift',body,750);
};
window.addPromo=function(){const name=prompt('Promotion name:');if(!name)return;const type=prompt('Type (Buy X Get Y / Slab Discount / Fixed Discount):','Slab Discount');const desc=prompt('Description:');const promos=JSON.parse(localStorage.getItem('wms_promotions')||'[]');promos.push({id:'PROMO-'+Date.now().toString().slice(-3),name,type:type||'Fixed Discount',description:desc||'',startDate:new Date().toLocaleDateString('en-IN'),endDate:'31 Dec 2026',status:'Active'});localStorage.setItem('wms_promotions',JSON.stringify(promos));window.showToast('Promotion '+name+' created','success');document.getElementById('promoModal')?.remove();window.showPromoManager();};

// ===== F130: Delivery Challan Generator =====
window.generateDeliveryChallan = function(orderId) {
    const orders = DataManager.getDispatchOrders();
    const order = orders.find(o=>o.id===orderId)||orders[0];
    const dcNo = 'DC-' + Math.floor(2026000+Math.random()*999);
    const win = window.open('','_blank','width=800,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>Delivery Challan ${dcNo}</title><style>
        body{font-family:Arial,sans-serif;padding:30px;color:#1e293b;font-size:13px;}
        h1{color:#6366f1;margin:0;}.header{border-bottom:2px solid #6366f1;padding-bottom:15px;margin-bottom:20px;}
        table{width:100%;border-collapse:collapse;margin:15px 0;}
        th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f8fafc;}
        .footer{margin-top:40px;display:flex;justify-content:space-between;}
    </style></head><body>
        <div class="header"><h1>DELIVERY CHALLAN</h1><strong>Namkeen Industries Pvt. Ltd.</strong> | 42, MIDC, Pune — 411019 | GST: 27AABCU9603R1ZX</div>
        <table><tr><th>DC Number</th><td>${dcNo}</td><th>Date</th><td>${new Date().toLocaleDateString('en-IN')}</td></tr>
        <tr><th>SO Reference</th><td>${order?.id||'N/A'}</td><th>Vehicle No.</th><td>MH-12-AB-1234</td></tr>
        <tr><th>Deliver To</th><td colspan="3">${order?.customer||'Customer'}</td></tr></table>
        <table><thead><tr><th>#</th><th>Description</th><th>UOM</th><th>Qty</th><th>Remarks</th></tr></thead>
        <tbody><tr><td>1</td><td>Aloo Bhujia (500g)</td><td>Carton</td><td>50</td><td>Handle with care</td></tr>
        <tr><td>2</td><td>Navratna Mix (1kg)</td><td>Carton</td><td>30</td><td></td></tr></tbody></table>
        <p style="color:#64748b;font-size:11px;">This is a delivery challan and not an invoice. For billing queries, contact accounts@namkeenindustries.com</p>
        <div class="footer"><div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">Driver Signature</div></div>
        <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">Receiver Signature</div></div></div>
        <script>window.print();</script></body></html>`);
    window.showToast(`Delivery Challan ${dcNo} generated`,'success');
};

// ===== F131: Customer Loyalty Points Tracker =====
window.showLoyaltyPoints = function() {
    const key='wms_loyalty';
    const loyalty = JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'CUST-001', name:'Mega Mart (National)', points:12500, tier:'Gold', lastEarned:'Today', totalSpend:625000},
        {id:'CUST-002', name:'SuperMart Retailers', points:6800, tier:'Silver', lastEarned:'Yesterday', totalSpend:340000},
        {id:'CUST-003', name:'Local Distributors', points:2100, tier:'Bronze', lastEarned:'30 Jul', totalSpend:105000},
    ]));
    const body = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${loyalty.map(c=>{
                const tierColor = c.tier==='Gold'?'#f59e0b':c.tier==='Silver'?'#94a3b8':'#b45309';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:44px;height:44px;background:${tierColor}20;border:2px solid ${tierColor};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">⭐</div>
                        <div>
                            <strong>${c.name}</strong>
                            <div style="font-size:0.78rem;"><span style="color:${tierColor};font-weight:700;">${c.tier} Member</span> • Total Spend: ₹${c.totalSpend.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:1.5rem;font-weight:900;color:var(--primary-color);">${c.points.toLocaleString()}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);">points (₹${Math.floor(c.points/100)} redeemable)</div>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;margin-top:4px;" onclick="window.showToast('Points redeemed for ${c.name}','success')">Redeem</button>
                    </div>
                </div>`;
            }).join('')}
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;color:var(--text-muted);">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Loyalty points are awarded at <strong>₹100 spend = 20 points</strong>. 100 points = ₹1 discount.
        </div>`;
    makeModal('loyaltyModal','Customer Loyalty Points','bx-star',body,700);
};

// ===== F132: Order History Timeline =====
window.showOrderHistory = function(customerId) {
    const customers = DataManager.getCustomers();
    const customer = customers[0];
    const orders = DataManager.getDispatchOrders();
    const body = `
        <div style="margin-bottom:16px;">
            <select style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.showToast('Viewing orders for selected customer','info')">
                ${customers.map(c=>`<option>${c.name}</option>`).join('')}
            </select>
        </div>
        <div style="position:relative;padding-left:28px;">
            <div style="position:absolute;left:10px;top:0;bottom:0;width:2px;background:var(--border-color);border-radius:99px;"></div>
            ${orders.map((o,i)=>`
            <div style="position:relative;margin-bottom:20px;">
                <div style="position:absolute;left:-22px;width:14px;height:14px;background:var(--primary-color);border-radius:50%;top:4px;border:2px solid white;"></div>
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
                    <div style="display:flex;justify-content:space-between;">
                        <strong>${o.id}</strong>
                        <span class="badge ${o.statusClass||'status-info'}" style="font-size:0.7rem;">${o.status}</span>
                    </div>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${o.customer} • ${i===0?'Today':i===1?'Yesterday':'3 days ago'}</div>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('orderHistoryModal','Customer Order History','bx-history',body,650);
};

// ===== F133: Sales Territory Map =====
window.showTerritoryMap = function() {
    const territories = [
        {region:'Pune Metro', customers:12, revenue:1250000, color:'#6366f1'},
        {region:'Mumbai', customers:8, revenue:980000, color:'#22c55e'},
        {region:'Nashik', customers:5, revenue:450000, color:'#f59e0b'},
        {region:'Kolhapur', customers:3, revenue:280000, color:'#ef4444'},
        {region:'Nagpur', customers:4, revenue:320000, color:'#06b6d4'},
    ];
    const maxRevenue = Math.max(...territories.map(t=>t.revenue));
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:20px;">Sales territory breakdown by region. Circle size represents revenue contribution.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;min-height:300px;position:relative;overflow:hidden;">
                <div style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-bottom:12px;">Maharashtra Region Map (Simulated)</div>
                ${territories.map((t,i)=>{
                    const size=Math.round(40+(t.revenue/maxRevenue)*80);
                    const positions=[{top:30,left:40},{top:15,left:65},{top:20,left:25},{top:60,left:30},{top:45,left:70}];
                    const pos=positions[i]||{top:50,left:50};
                    return `<div style="position:absolute;top:${pos.top}%;left:${pos.left}%;transform:translate(-50%,-50%);width:${size}px;height:${size}px;background:${t.color}33;border:3px solid ${t.color};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.7rem;font-weight:700;color:${t.color};" title="${t.region}: ${t.customers} customers" onclick="window.showToast('${t.region}: ${t.customers} customers, ₹${(t.revenue/100000).toFixed(1)}L revenue','info')">${t.region.split(' ')[0]}</div>`;
                }).join('')}
            </div>
            <div>
                ${territories.map(t=>`
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg-main);border-radius:8px;margin-bottom:8px;border-left:4px solid ${t.color};">
                    <div><strong>${t.region}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${t.customers} customers</div></div>
                    <div style="text-align:right;"><div style="font-weight:700;">₹${(t.revenue/100000).toFixed(1)}L</div><div style="font-size:0.72rem;color:var(--text-muted);">${Math.round(t.revenue/maxRevenue*100)}% share</div></div>
                </div>`).join('')}
            </div>
        </div>`;
    makeModal('territoryModal','Sales Territory Map','bx-map',body,850);
};

// ===== F134: Top 10 Customer Leaderboard =====
window.showCustomerLeaderboard = function() {
    const customers = DataManager.getCustomers().map((c,i)=>({...c,revenue:c.totalSpend||(Math.random()*500000+50000),orders:Math.floor(Math.random()*30+5)}));
    customers.sort((a,b)=>b.revenue-a.revenue);
    const body = `
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${customers.slice(0,10).map((c,i)=>{
                const medal=['🥇','🥈','🥉'][i]||`#${i+1}`;
                const barWidth=Math.round(c.revenue/customers[0].revenue*100);
                return `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-main);border-radius:10px;border:1px solid var(--border-color);">
                    <div style="font-size:1.4rem;min-width:36px;text-align:center;">${medal}</div>
                    <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                            <strong style="font-size:0.9rem;">${c.name}</strong>
                            <span style="font-weight:700;color:var(--primary-color);">₹${Math.round(c.revenue).toLocaleString('en-IN')}</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                            <div style="height:100%;width:${barWidth}%;background:var(--primary-color);border-radius:99px;"></div>
                        </div>
                        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">${c.orders} orders</div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    makeModal('leaderboardModal','Top Customer Leaderboard','bx-trophy',body,650);
};

// ===== F135: Customer Complaint Tracker =====
window.showComplaints = function() {
    const key='wms_complaints';
    const complaints=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'COMP-001',customer:'Mega Mart',date:'Today',type:'Product Quality',description:'Batch B-2380 packets were stale',priority:'High',status:'Open'},
        {id:'COMP-002',customer:'SuperMart',date:'Yesterday',type:'Delivery Delay',description:'Order SO-4490 delivered 2 days late',priority:'Medium',status:'In Progress'},
        {id:'COMP-003',customer:'Local Distributor',date:'29 Jul',type:'Billing Error',description:'Invoice amount mismatch with DC',priority:'Low',status:'Resolved'},
    ]));
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.addComplaint()"><i class='bx bx-plus'></i> Log Complaint</button>
            <div style="display:flex;gap:8px;margin-left:auto;font-size:0.8rem;align-items:center;">
                <span class="badge status-danger">Open: ${complaints.filter(c=>c.status==='Open').length}</span>
                <span class="badge status-warning">In Progress: ${complaints.filter(c=>c.status==='In Progress').length}</span>
                <span class="badge status-success">Resolved: ${complaints.filter(c=>c.status==='Resolved').length}</span>
            </div>
        </div>
        <table class="table"><thead><tr><th>ID</th><th>Customer</th><th>Type</th><th>Priority</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${complaints.map(c=>`<tr>
            <td><code>${c.id}</code></td><td>${c.customer}</td><td>${c.type}</td>
            <td><span class="badge ${c.priority==='High'?'status-danger':c.priority==='Medium'?'status-warning':'status-info'}">${c.priority}</span></td>
            <td>${c.date}</td>
            <td><span class="badge ${c.status==='Resolved'?'status-success':c.status==='In Progress'?'status-warning':'status-danger'}">${c.status}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${c.id} resolved','success')">Resolve</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('complaintsModal','Customer Complaint Tracker','bx-message-error',body,950);
};
window.addComplaint=function(){const customer=prompt('Customer name:');if(!customer)return;const type=prompt('Complaint type (Quality/Delivery/Billing/Other):','Quality');const desc=prompt('Description:');const complaints=JSON.parse(localStorage.getItem('wms_complaints')||'[]');complaints.push({id:'COMP-'+Date.now().toString().slice(-3),customer,date:'Today',type:type||'Other',description:desc||'',priority:'Medium',status:'Open'});localStorage.setItem('wms_complaints',JSON.stringify(complaints));window.showToast('Complaint logged','success');document.getElementById('complaintsModal')?.remove();window.showComplaints();};

// =====================================================
// PRODUCTION & MANUFACTURING — F136–F148
// =====================================================

// ===== F136: Bill of Materials (BOM) Manager =====
window.showBOMManager = function() {
    const key='wms_bom';
    const boms=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'BOM-001',product:'Aloo Bhujia (500g)',batchSize:'100 kg output',materials:[
            {material:'Besan (Gram Flour)',qty:'45 kg',uom:'kg',wastage:'2%'},
            {material:'Refined Edible Oil',qty:'18 L',uom:'L',wastage:'1%'},
            {material:'Salt',qty:'3 kg',uom:'kg',wastage:'0%'},
            {material:'Spice Mix',qty:'5 kg',uom:'kg',wastage:'0.5%'},
            {material:'BOPP Pouch (500g)',qty:'200 pcs',uom:'pcs',wastage:'1%'},
        ]},
    ]));
    const bom=boms[0];
    const body=`
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <select style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                ${boms.map(b=>`<option>${b.product}</option>`).join('')}
            </select>
            <button class="btn btn-primary" onclick="window.showToast('New BOM created','success')"><i class='bx bx-plus'></i> New BOM</button>
        </div>
        <div style="background:var(--primary-light);border-radius:10px;padding:14px;margin-bottom:16px;">
            <strong>${bom.product}</strong> • Batch Size: ${bom.batchSize}
        </div>
        <table class="table"><thead><tr><th>Raw Material</th><th>Required Qty</th><th>UOM</th><th>Wastage %</th><th>Available</th><th>Status</th></tr></thead>
        <tbody>${bom.materials.map(m=>{
            const avail=Math.floor(Math.random()*200+20);
            const required=parseFloat(m.qty)||0;
            const ok=avail>=required;
            return `<tr>
                <td>${m.material}</td><td><strong>${m.qty}</strong></td><td>${m.uom}</td><td>${m.wastage}</td>
                <td style="color:${ok?'var(--success-color)':'var(--danger-color)'};">${avail} ${m.uom}</td>
                <td><span class="badge ${ok?'status-success':'status-danger'}">${ok?'Sufficient':'Short'}</span></td>
            </tr>`;
        }).join('')}</tbody></table>
        <div style="margin-top:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.showToast('Production order created from BOM','success')"><i class='bx bx-play'></i> Create Production Order</button>
            <button class="btn btn-outline" onclick="window.showToast('BOM exported','success')"><i class='bx bx-download'></i> Export</button>
        </div>`;
    makeModal('bomModal','Bill of Materials (BOM) Manager','bx-list-ul',body,850);
};

// ===== F137: Production Order Wizard =====
window.showProductionWizard = function() {
    const body=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Product to Manufacture *</label>
                <select id="pwProduct" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    ${DataManager.getProducts().map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Quantity to Produce (kg) *</label>
                <input type="number" id="pwQty" value="100" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Production Line</label>
                <select id="pwLine" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <option>Line 1 (Bhujia/Sev)</option><option>Line 2 (Namkeen Mix)</option><option>Line 3 (Packaging)</option>
                </select>
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;">Target Date</label>
                <input type="date" id="pwDate" value="${new Date().toISOString().slice(0,10)}" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
            </div>
        </div>
        <div style="margin-top:20px;padding:16px;background:var(--success-color)10;border:1px solid var(--success-color)30;border-radius:12px;">
            <strong>Auto Pick List Preview</strong>
            <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;font-size:0.85rem;">
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);"><span>Besan (Gram Flour)</span><span style="font-weight:700;">45 kg</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);"><span>Refined Edible Oil</span><span style="font-weight:700;">18 L</span></div>
                <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>BOPP Pouches (500g)</span><span style="font-weight:700;">200 pcs</span></div>
            </div>
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-outline" onclick="document.getElementById('prodWizardModal').remove()">Cancel</button>
            <button class="btn btn-primary" onclick="window.createProductionOrder()"><i class='bx bx-check'></i> Create Production Order</button>
        </div>`;
    makeModal('prodWizardModal','Production Order Wizard','bx-factory',body,750);
};
window.createProductionOrder=function(){
    const product=document.getElementById('pwProduct')?.value;
    const qty=document.getElementById('pwQty')?.value;
    const line=document.getElementById('pwLine')?.value;
    const poId='PRO-'+Date.now().toString().slice(-4);
    DataManager.logAction('Production Order Created',`${poId}: ${qty}kg of ${product} on ${line}`);
    window.showToast(`Production Order ${poId} created — Pick list sent to floor`,'success');
    document.getElementById('prodWizardModal')?.remove();
};

// ===== F138: Machine OEE Dashboard =====
window.showOEEDashboard = function() {
    const lines=[
        {name:'Line 1 — Bhujia/Sev',availability:94,performance:87,quality:98.5,oee:80.4,status:'Running',uptime:'6h 12m'},
        {name:'Line 2 — Namkeen Mix',availability:78,performance:91,quality:97.2,oee:68.9,status:'Minor Stoppage',uptime:'4h 45m'},
        {name:'Line 3 — Packaging',availability:99,performance:96,quality:99.1,oee:94.2,status:'Running',uptime:'7h 30m'},
    ];
    const body=`
        <div style="display:flex;flex-direction:column;gap:16px;">
            ${lines.map(l=>{
                const oeeColor=l.oee>=85?'var(--success-color)':l.oee>=65?'var(--warning-color)':'var(--danger-color)';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:16px;padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                        <div>
                            <strong>${l.name}</strong>
                            <div style="font-size:0.78rem;color:var(--text-muted);">Uptime today: ${l.uptime}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <span class="badge ${l.status==='Running'?'status-success':'status-warning'}">${l.status}</span>
                            <div style="text-align:center;"><div style="font-size:2rem;font-weight:900;color:${oeeColor};">${l.oee}%</div><div style="font-size:0.7rem;color:var(--text-muted);">OEE</div></div>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                        ${[['Availability',l.availability,'#22c55e'],['Performance',l.performance,'#6366f1'],['Quality',l.quality,'#f59e0b']].map(([label,val,color])=>`
                        <div style="text-align:center;padding:10px;background:var(--bg-card);border-radius:10px;">
                            <div style="font-size:1.3rem;font-weight:700;color:${color};">${val}%</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">${label}</div>
                            <div style="height:4px;background:var(--border-color);border-radius:99px;margin-top:6px;overflow:hidden;"><div style="height:100%;width:${val}%;background:${color};border-radius:99px;"></div></div>
                        </div>`).join('')}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    makeModal('oeeModal','Machine OEE Dashboard','bx-tachometer',body,750);
};

// ===== F139: Shift Production Log =====
window.showShiftLog = function() {
    const key='wms_shift_log';
    const logs=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'SLOG-001',date:'Today',shift:'AM (06:00-14:00)',line:'Line 1',product:'Aloo Bhujia (500g)',target:2000,actual:1850,defects:45,operator:'Raju Singh'},
        {id:'SLOG-002',date:'Today',shift:'AM (06:00-14:00)',line:'Line 2',product:'Navratna Mix (1kg)',target:1500,actual:1420,defects:28,operator:'Mohan Patel'},
        {id:'SLOG-003',date:'Yesterday',shift:'PM (14:00-22:00)',line:'Line 1',product:'Aloo Bhujia (500g)',target:2000,actual:2100,defects:30,operator:'Raju Singh'},
    ]));
    const body=`
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.addShiftEntry()"><i class='bx bx-plus'></i> Log New Entry</button>
            <button class="btn btn-outline" onclick="window.showToast('Shift report exported','success')"><i class='bx bx-download'></i> Export</button>
        </div>
        <table class="table"><thead><tr><th>Date</th><th>Shift</th><th>Line</th><th>Product</th><th>Target</th><th>Actual</th><th>Defects</th><th>Efficiency</th></tr></thead>
        <tbody>${logs.map(l=>{
            const eff=Math.round(l.actual/l.target*100);
            return `<tr>
                <td>${l.date}</td><td>${l.shift}</td><td>${l.line}</td><td>${l.product}</td>
                <td>${l.target}</td><td><strong>${l.actual}</strong></td>
                <td><span style="color:var(--danger-color);">${l.defects}</span></td>
                <td><span style="color:${eff>=100?'var(--success-color)':eff>=90?'var(--warning-color)':'var(--danger-color)'};font-weight:700;">${eff}%</span></td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('shiftLogModal','Shift Production Log','bx-clipboard',body,900);
};
window.addShiftEntry=function(){const product=prompt('Product manufactured:','Aloo Bhujia (500g)');if(!product)return;const actual=parseInt(prompt('Actual qty produced (kg):','1800')||0);const target=parseInt(prompt('Target qty (kg):','2000')||0);const logs=JSON.parse(localStorage.getItem('wms_shift_log')||'[]');logs.unshift({id:'SLOG-'+Date.now().toString().slice(-4),date:'Today',shift:'AM (06:00-14:00)',line:'Line 1',product,target,actual,defects:Math.floor(Math.random()*50),operator:'Admin User'});localStorage.setItem('wms_shift_log',JSON.stringify(logs));window.showToast('Shift entry logged','success');document.getElementById('shiftLogModal')?.remove();window.showShiftLog();};

// ===== F140: Yield Variance Tracker =====
window.showYieldVariance = function() {
    const data=[
        {product:'Aloo Bhujia (500g)',stdYield:88,actualYield:85.5,variance:-2.5,reason:'Higher oil absorption'},
        {product:'Navratna Mix (1kg)',stdYield:91,actualYield:92.1,variance:+1.1,reason:'Better raw material quality'},
        {product:'Khatta Meetha (250g)',stdYield:86,actualYield:83.0,variance:-3.0,reason:'Excess moisture in besan'},
    ];
    const body=`
        <table class="table"><thead><tr><th>Product</th><th>Standard Yield %</th><th>Actual Yield %</th><th>Variance</th><th>Reason</th><th>Action</th></tr></thead>
        <tbody>${data.map(d=>`<tr>
            <td>${d.product}</td>
            <td>${d.stdYield}%</td>
            <td><strong>${d.actualYield}%</strong></td>
            <td style="font-weight:700;color:${d.variance>=0?'var(--success-color)':'var(--danger-color)'};">${d.variance>=0?'+':''}${d.variance}%</td>
            <td style="color:var(--text-muted);font-size:0.82rem;">${d.reason}</td>
            <td>${d.variance<-1?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;color:var(--danger-color);" onclick="window.showToast('Investigation started','warning')">Investigate</button>`:'<span style="color:var(--success-color);">✓ OK</span>'}</td>
        </tr>`).join('')}</tbody></table>
        <div style="margin-top:12px;padding:12px;background:var(--warning-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-info-circle' style="color:var(--warning-color);"></i> Yield variance > ±2% triggers an investigation workflow automatically.
        </div>`;
    makeModal('yieldModal','Yield Variance Tracker','bx-pie-chart-alt',body,850);
};

// ===== F141: Rework Order Tracker =====
window.showReworkTracker = function() {
    const key='wms_rework';
    const reworks=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'RWK-001',batch:'#B-2401',product:'Aloo Bhujia (500g)',qty:150,reason:'Failed moisture test',status:'In Rework',assignedTo:'Line 1'},
        {id:'RWK-002',batch:'#B-2390',product:'Khatta Meetha (250g)',qty:80,reason:'Underfill — below 245g avg',status:'Pending',assignedTo:'Line 3'},
    ]));
    const body=`
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.showToast('New rework order logged','success')"><i class='bx bx-plus'></i> New Rework Order</button></div>
        <table class="table"><thead><tr><th>Rework ID</th><th>Batch</th><th>Product</th><th>Qty (kg)</th><th>Reason</th><th>Status</th><th>Line</th><th>Action</th></tr></thead>
        <tbody>${reworks.map(r=>`<tr>
            <td><code>${r.id}</code></td><td><code>${r.batch}</code></td><td>${r.product}</td>
            <td>${r.qty}</td><td style="color:var(--text-muted);font-size:0.82rem;">${r.reason}</td>
            <td><span class="badge ${r.status==='In Rework'?'status-warning':'status-info'}">${r.status}</span></td>
            <td>${r.assignedTo}</td>
            <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${r.id} marked complete','success')">Complete</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('reworkModal','Rework Order Tracker','bx-refresh',body,900);
};

// ===== F142: Rejection Analysis Pareto =====
window.showRejectionPareto = function() {
    const reasons=[
        {reason:'Moisture / Texture Fail',count:48,pct:38},
        {reason:'Underfill (<weight spec)',count:29,pct:23},
        {reason:'Packaging Seal Defect',count:21,pct:17},
        {reason:'Foreign Matter',count:15,pct:12},
        {reason:'Color Deviation',count:8,pct:6},
        {reason:'Others',count:5,pct:4},
    ];
    let cumulative=0;
    const body=`
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Pareto analysis of production rejections this month. Top 3 reasons account for 78% of all rejections.</p>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${reasons.map((r,i)=>{cumulative+=r.pct;return `
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="min-width:120px;font-size:0.8rem;text-align:right;color:${i<3?'var(--text-main)':'var(--text-muted)'};">${r.reason}</div>
                <div style="flex:1;height:28px;background:var(--border-color);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${r.pct*2.5}%;background:${i<3?'var(--danger-color)':'var(--text-muted)'};display:flex;align-items:center;padding-left:6px;font-size:0.72rem;color:white;font-weight:700;">${r.count}</div>
                </div>
                <div style="min-width:40px;font-size:0.78rem;text-align:right;">${r.pct}%</div>
                <div style="min-width:50px;font-size:0.72rem;color:var(--text-muted);">Cum: ${cumulative}%</div>
            </div>`;}).join('')}
        </div>
        <div style="margin-top:16px;padding:12px;background:var(--danger-color)10;border-radius:10px;font-size:0.82rem;">
            <strong>Top Action:</strong> Focus on moisture/texture control — 38% of rejections can be eliminated by fixing humidity in the mixing stage.
        </div>`;
    makeModal('paretoModal','Rejection Analysis Pareto','bx-bar-chart',body,750);
};

// ===== F143: Line Stoppage Log =====
window.showStoppageLog = function() {
    const key='wms_stoppages';
    const logs=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'STP-001',date:'Today',line:'Line 2',start:'10:15',end:'10:45',duration:'30 min',reason:'Mechanical — Sealing jaw misalignment',recorded:'Mohan P.'},
        {id:'STP-002',date:'Today',line:'Line 1',start:'08:05',end:'08:20',duration:'15 min',reason:'Material shortage — Besan replenishment',recorded:'Raju S.'},
    ]));
    const totalDowntime=logs.reduce((a,l)=>a+parseInt(l.duration),0);
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${logs.length}</div><div class="stat-label">Stoppages Today</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${totalDowntime} min</div><div class="stat-label">Total Downtime</div></div>
            <div class="stat-card"><div class="stat-number">₹${(totalDowntime*450).toLocaleString()}</div><div class="stat-label">Est. Cost of Downtime</div></div>
        </div>
        <div style="margin-bottom:16px;"><button class="btn btn-danger" onclick="window.logStoppage()"><i class='bx bx-stop-circle'></i> Log New Stoppage</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Line</th><th>Start</th><th>End</th><th>Duration</th><th>Reason</th></tr></thead>
        <tbody>${logs.map(l=>`<tr>
            <td><code>${l.id}</code></td><td>${l.line}</td><td>${l.start}</td><td>${l.end}</td>
            <td><span style="color:var(--danger-color);font-weight:700;">${l.duration}</span></td>
            <td style="font-size:0.82rem;">${l.reason}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('stoppageModal','Line Stoppage Log','bx-stop',body,850);
};
window.logStoppage=function(){const line=prompt('Production line:','Line 1');const reason=prompt('Reason for stoppage:');if(!line||!reason)return;const duration=prompt('Duration (minutes):','30');const logs=JSON.parse(localStorage.getItem('wms_stoppages')||'[]');logs.unshift({id:'STP-'+Date.now().toString().slice(-4),date:'Today',line,start:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}),end:'Ongoing',duration:duration+' min',reason,recorded:'Admin User'});localStorage.setItem('wms_stoppages',JSON.stringify(logs));DataManager.logAction('Line Stoppage Logged',`${line}: ${reason} (${duration} min)`);window.showToast('Stoppage logged — '+duration+' min downtime','danger');document.getElementById('stoppageModal')?.remove();window.showStoppageLog();};

// ===== F144: Raw Material Consumption Tracker =====
window.showConsumptionTracker = function() {
    const data=[
        {material:'Besan (Gram Flour)',stdPer100kg:'45 kg',actual:'47.2 kg',variance:'+4.9%',batch:'#B-2401',status:'Over-consumed'},
        {material:'Refined Edible Oil',stdPer100kg:'18 L',actual:'17.8 L',variance:'-1.1%',batch:'#B-2401',status:'Normal'},
        {material:'Spice Mix',stdPer100kg:'5 kg',actual:'5.1 kg',variance:'+2.0%',batch:'#B-2401',status:'Normal'},
        {material:'BOPP Pouches (500g)',stdPer100kg:'200 pcs',actual:'204 pcs',variance:'+2.0%',batch:'#B-2401',status:'Normal'},
    ];
    const body=`
        <table class="table"><thead><tr><th>Raw Material</th><th>Std per 100kg</th><th>Actual Used</th><th>Variance</th><th>Status</th></tr></thead>
        <tbody>${data.map(d=>`<tr>
            <td>${d.material}</td><td>${d.stdPer100kg}</td><td><strong>${d.actual}</strong></td>
            <td style="color:${d.variance.startsWith('+')&&parseFloat(d.variance)>3?'var(--danger-color)':d.variance.startsWith('-')?'var(--success-color)':'var(--text-muted)'};font-weight:700;">${d.variance}</td>
            <td><span class="badge ${d.status==='Over-consumed'?'status-danger':'status-success'}">${d.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('consumptionModal','RM Consumption Tracker','bx-bar-chart-alt',body,750);
};

// ===== F145: Finished Goods Release Gate =====
window.showFGReleaseGate = function() {
    const key='wms_fg_release';
    const batches=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'FG-REL-001',batch:'#B-2415',product:'Aloo Bhujia (500g)',qty:'500 kg',qcStatus:'Pending',qcBy:'',releaseStatus:'Blocked'},
        {id:'FG-REL-002',batch:'#B-2410',product:'Navratna Mix (1kg)',qty:'300 kg',qcStatus:'Passed',qcBy:'QC Inspector',releaseStatus:'Released'},
        {id:'FG-REL-003',batch:'#B-2405',product:'Khatta Meetha (250g)',qty:'200 kg',qcStatus:'Failed',qcBy:'QC Inspector',releaseStatus:'Hold'},
    ]));
    const body=`
        <div style="margin-bottom:16px;padding:14px;background:var(--warning-color)10;border-radius:10px;font-size:0.85rem;">
            <i class='bx bx-shield' style="color:var(--warning-color);"></i> <strong>QC Gate:</strong> Finished goods cannot be moved to inventory until a QC Inspector signs off on this batch.
        </div>
        <table class="table"><thead><tr><th>FG Lot</th><th>Batch</th><th>Product</th><th>Qty</th><th>QC Status</th><th>Release Status</th><th>Action</th></tr></thead>
        <tbody>${batches.map(b=>`<tr>
            <td><code>${b.id}</code></td><td><code>${b.batch}</code></td><td>${b.product}</td><td>${b.qty}</td>
            <td><span class="badge ${b.qcStatus==='Passed'?'status-success':b.qcStatus==='Failed'?'status-danger':'status-warning'}">${b.qcStatus}</span></td>
            <td><span class="badge ${b.releaseStatus==='Released'?'status-success':b.releaseStatus==='Blocked'?'status-warning':'status-danger'}">${b.releaseStatus}</span></td>
            <td>${b.qcStatus==='Pending'?`<button class="btn btn-primary" style="font-size:0.75rem;padding:3px 8px;" onclick="window.approveFGRelease('${b.id}')">Approve Release</button>`:b.releaseStatus==='Released'?'<span style="color:var(--success-color);font-size:0.8rem;">✓ In Inventory</span>':'<span style="color:var(--danger-color);font-size:0.8rem;">✗ Quarantined</span>'}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('fgReleaseModal','FG Release Gate','bx-shield-quarter',body,900);
};
window.approveFGRelease=function(id){window.showToast(`${id} QC approved — stock moved to inventory`,'success');DataManager.logAction('FG QC Release',`${id} approved and moved to finished goods inventory`);};

// ===== F146: Production KPI Tiles =====
window.showProductionKPIs = function() {
    const kpis=[
        {label:'Units/Hour (Line 1)',value:'420',target:'450',unit:'units',pct:93,color:'var(--primary-color)'},
        {label:'Defect Rate (Today)',value:'1.8',target:'<2.0',unit:'%',pct:90,color:'var(--success-color)'},
        {label:'Changeover Time (Avg)',value:'22',target:'20 min',unit:'min',pct:90,color:'var(--warning-color)'},
        {label:'Schedule Adherence',value:'94',target:'95',unit:'%',pct:99,color:'var(--info-color)'},
        {label:'First Pass Yield',value:'97.2',target:'98',unit:'%',pct:99,color:'var(--success-color)'},
        {label:'Overall OEE',value:'80.4',target:'85',unit:'%',pct:94,color:'var(--danger-color)'},
    ];
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
            ${kpis.map(k=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:16px;padding:20px;text-align:center;">
                <div style="font-size:2rem;font-weight:900;color:${k.color};">${k.value}${k.unit==='%'?'%':''}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">${k.unit!=='%'?k.unit:''}</div>
                <div style="font-size:0.78rem;font-weight:600;">${k.label}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">Target: ${k.target}</div>
                <div style="height:6px;background:var(--border-color);border-radius:99px;margin-top:10px;overflow:hidden;">
                    <div style="height:100%;width:${k.pct}%;background:${k.color};border-radius:99px;"></div>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('prodKPIModal','Production KPI Dashboard','bx-tachometer',body,800);
};

// ===== F147: Changeover Time Tracker =====
window.showChangeoverTracker = function() {
    const key='wms_changeovers';
    const cos=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'CO-001',date:'Today',line:'Line 1',from:'Aloo Bhujia (500g)',to:'Khatta Meetha (250g)',startTime:'12:00',endTime:'12:22',duration:22,target:20,status:'Slightly Over'},
        {id:'CO-002',date:'Yesterday',line:'Line 2',from:'Sev (Thin)',to:'Navratna Mix',startTime:'13:15',endTime:'13:31',duration:16,target:20,status:'Under Target'},
    ]));
    const avgDuration=Math.round(cos.reduce((a,c)=>a+c.duration,0)/cos.length);
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">${cos.length}</div><div class="stat-label">Total Changeovers</div></div>
            <div class="stat-card"><div class="stat-number" style="color:${avgDuration<=20?'var(--success-color)':'var(--warning-color)'};">${avgDuration} min</div><div class="stat-label">Avg Changeover Time</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--primary-color);">20 min</div><div class="stat-label">Target Time</div></div>
        </div>
        <table class="table"><thead><tr><th>ID</th><th>Line</th><th>From</th><th>To</th><th>Duration</th><th>Target</th><th>Status</th></tr></thead>
        <tbody>${cos.map(c=>`<tr>
            <td><code>${c.id}</code></td><td>${c.line}</td><td>${c.from}</td><td>${c.to}</td>
            <td style="font-weight:700;color:${c.duration<=c.target?'var(--success-color)':'var(--warning-color)'};">${c.duration} min</td>
            <td>${c.target} min</td>
            <td><span class="badge ${c.status==='Under Target'?'status-success':'status-warning'}">${c.status}</span></td>
        </tr>`).join('')}</tbody></table>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('New changeover log started','success')"><i class='bx bx-play'></i> Start Changeover Timer</button>`;
    makeModal('changeoverModal','Changeover Time Tracker','bx-time-five',body,850);
};

// ===== F148: Batch Genealogy Viewer =====
window.showBatchGenealogy = function() {
    const batchId=prompt('Enter Batch ID to trace (e.g. #B-2401):','#B-2401');
    if(!batchId)return;
    const steps=[
        {icon:'bx-store',color:'var(--primary-color)',title:'Raw Materials',detail:`Besan from ABC Spices (PO-2026-1045, Lot L-889) | Oil from Premium Oils (PO-2026-1042, Drum D-112)`},
        {icon:'bx-flask',color:'#6366f1',title:'Pre-Mix & Mixing',detail:`Mixing done 01 Aug 2026, 07:30 AM | Operator: Raju Singh | Line 1 Mixer`},
        {icon:'bx-factory',color:'var(--secondary-color)',title:'Manufacturing',detail:`Extruded & Fried 01 Aug 2026, 09:00–13:00 | Line 1 | Batch yield: 85.5%`},
        {icon:'bx-test-tube',color:'var(--warning-color)',title:'QC Inspection',detail:`Lab test 01 Aug 2026, 14:00 | Passed: moisture, fat, salt | Inspector: QC Lab`},
        {icon:'bx-package',color:'var(--info-color)',title:'Packaging & Coding',detail:`Packed 01 Aug 2026, 15:00-18:00 | 200 cartons × 24 pkts | MFG/EXP printed`},
        {icon:'bx-store-alt',color:'#22c55e',title:'Inventory → Dispatch',detail:`Stored: Zone B-R3-B08 | Dispatched to Mega Mart (SO-4501) on 02 Aug 2026`},
    ];
    const body=`<div style="position:relative;padding-left:24px;"><div style="position:absolute;left:9px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--primary-color),var(--success-color));border-radius:99px;"></div>
        ${steps.map((s,i)=>`<div style="position:relative;margin-bottom:20px;">
            <div style="position:absolute;left:-22px;width:14px;height:14px;background:${s.color};border-radius:50%;top:4px;border:2px solid white;"></div>
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><i class='bx ${s.icon}' style="color:${s.color};"></i><strong>${s.title}</strong></div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${s.detail}</div>
            </div>
        </div>`).join('')}
    </div>`;
    makeModal('batchGenealogyModal',`Batch Genealogy: ${batchId}`,'bx-git-branch',body,700);
};

console.log('Features Part 1 (F101-F148) loaded — Advanced Inventory, Sales & Production');
