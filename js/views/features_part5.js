// ============================================================
// FEATURES PART 5 — Final Remaining Features
// Operations, Kitting, Assets, Contracts, Notifications,
// Batch Traceability, NPS, SOP, Tasks, Utilities & more
// ============================================================

(function() {
'use strict';

// ===== LOCAL MAKE-MODAL HELPER =====
function m(id, title, icon, body, minW) {
    const ex = document.getElementById(id); if (ex) { ex.remove(); return null; }
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.80);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
    el.innerHTML = `<div style="background:var(--bg-card);border-radius:20px;padding:28px;min-width:${minW||580}px;max-width:97vw;max-height:92vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 30px 60px rgba(0,0,0,0.30);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid var(--border-color);">
            <h2 style="margin:0;font-size:1.1rem;display:flex;align-items:center;gap:9px;font-weight:700;"><i class='bx ${icon}' style="color:var(--primary-color);font-size:1.35rem;"></i>${title}</h2>
            <button onclick="document.getElementById('${id}').remove()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:5px 11px;cursor:pointer;color:var(--text-muted);font-size:0.9rem;">✕</button>
        </div>${body}</div>`;
    document.body.appendChild(el);
    el.addEventListener('click', e => { if (e.target === el) el.remove(); });
    return el;
}
function toast(msg, type) { window.showToast && window.showToast(msg, type || 'success'); }
function getData(key, def) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch(e) { return def; } }
function setData(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// =========================================================
// OPERATIONS FEATURES
// =========================================================

// ===== Kitting & Assembly Manager =====
window.showKittingManager = function() {
    const key = 'wms_kits';
    const kits = getData(key, [
        { id:'KIT-001', name:'Diwali Gift Box — Premium', components:[
            { item:'Aloo Bhujia (500g)', qty:2 },
            { item:'Navratna Mix (200g)', qty:1 },
            { item:'Khatta Meetha (250g)', qty:1 },
        ], kitPrice:320, assembled:45, target:100, status:'In Progress' },
        { id:'KIT-002', name:'Trial Pack — 5 Flavours', components:[
            { item:'Aloo Bhujia (100g)', qty:1 },
            { item:'Masala Peanuts (100g)', qty:1 },
            { item:'Sev (100g)', qty:1 },
        ], kitPrice:85, assembled:220, target:200, status:'Complete' },
    ]);
    const body = `
        <div style="margin-bottom:14px;"><button class="btn btn-primary" onclick="window.addKit()"><i class='bx bx-plus'></i> New Kit/Bundle</button></div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${kits.map(k => `
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:14px;padding:18px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                    <div><strong style="font-size:1rem;">${k.name}</strong> <code style="font-size:0.72rem;">${k.id}</code>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">Kit Price: <strong style="color:var(--primary-color);">₹${k.kitPrice}</strong></div></div>
                    <span class="badge ${k.status==='Complete'?'status-success':'status-warning'}">${k.status}</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">
                    ${k.components.map(c=>`<span style="background:var(--primary-light);border:1px solid var(--primary-color)30;padding:3px 8px;border-radius:6px;font-size:0.75rem;"><strong>${c.qty}×</strong> ${c.item}</span>`).join('')}
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="flex:1;height:8px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(100,Math.round(k.assembled/k.target*100))}%;background:${k.assembled>=k.target?'var(--success-color)':'var(--primary-color)'};border-radius:99px;"></div>
                    </div>
                    <span style="font-size:0.78rem;font-weight:700;">${k.assembled}/${k.target} assembled</span>
                    <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="window.assembleKit('${k.id}')">+ Assemble</button>
                </div>
            </div>`).join('')}
        </div>`;
    m('kitModal','Kitting & Assembly Manager','bx-package',body,780);
};
window.addKit = function() {
    const name = prompt('Kit/Bundle name:'); if(!name) return;
    const price = parseInt(prompt('Kit selling price (₹):','150')||150);
    const kits = getData('wms_kits',[]);
    kits.unshift({ id:'KIT-'+Date.now().toString().slice(-4), name, components:[], kitPrice:price, assembled:0, target:100, status:'In Progress' });
    setData('wms_kits', kits); toast('Kit created: '+name); DataManager.logAction('Kit Created',name);
    document.getElementById('kitModal')?.remove(); window.showKittingManager();
};
window.assembleKit = function(id) {
    const kits = getData('wms_kits',[]); const k = kits.find(x=>x.id===id);
    if(k && k.assembled<k.target) { k.assembled+=10; if(k.assembled>=k.target) k.status='Complete'; setData('wms_kits',kits); }
    toast('10 units assembled for '+id); document.getElementById('kitModal')?.remove(); window.showKittingManager();
};

// ===== Batch Expiry Calendar =====
window.showExpiryCalendar = function() {
    const batches = [
        { batch:'#B-2350', product:'Aloo Bhujia (500g)', expiry:'2026-08-31', stock:500 },
        { batch:'#B-2360', product:'Khatta Meetha (250g)', expiry:'2026-09-10', stock:120 },
        { batch:'#B-2380', product:'Aloo Bhujia (500g)', expiry:'2026-09-30', stock:800 },
        { batch:'#B-2390', product:'Navratna Mix (1kg)', expiry:'2026-10-15', stock:200 },
        { batch:'#B-2400', product:'Masala Peanuts', expiry:'2026-10-31', stock:350 },
        { batch:'#B-2410', product:'Navratna Mix (1kg)', expiry:'2026-10-15', stock:320 },
        { batch:'#B-2420', product:'Sev (200g)', expiry:'2026-11-30', stock:650 },
    ];
    const now = new Date();
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card" style="border-left:4px solid var(--danger-color)"><div class="stat-number" style="color:var(--danger-color);">${batches.filter(b=>Math.floor((new Date(b.expiry)-now)/86400000)<=30).length}</div><div class="stat-label">Expiring in 30 days</div></div>
            <div class="stat-card" style="border-left:4px solid var(--warning-color)"><div class="stat-number" style="color:var(--warning-color);">${batches.filter(b=>{const d=Math.floor((new Date(b.expiry)-now)/86400000);return d>30&&d<=60;}).length}</div><div class="stat-label">Expiring 31–60 days</div></div>
            <div class="stat-card" style="border-left:4px solid var(--success-color)"><div class="stat-number" style="color:var(--success-color);">${batches.filter(b=>Math.floor((new Date(b.expiry)-now)/86400000)>60).length}</div><div class="stat-label">Safe (60+ days)</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${batches.sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).map(b => {
                const daysLeft = Math.floor((new Date(b.expiry)-now)/86400000);
                const color = daysLeft<=30?'var(--danger-color)':daysLeft<=60?'var(--warning-color)':'var(--success-color)';
                const barW = Math.max(5,Math.min(100,Math.round(daysLeft/180*100)));
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:12px;display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:12px;">
                    <div>
                        <strong>${b.product}</strong> <code style="font-size:0.72rem;">${b.batch}</code>
                        <div style="font-size:0.75rem;color:var(--text-muted);">Stock: ${b.stock} units | Expires: ${new Date(b.expiry).toLocaleDateString('en-IN')}</div>
                        <div style="height:5px;background:var(--border-color);border-radius:99px;margin-top:6px;overflow:hidden;"><div style="height:100%;width:${barW}%;background:${color};border-radius:99px;"></div></div>
                    </div>
                    <div style="text-align:center;min-width:70px;"><div style="font-size:1.4rem;font-weight:900;color:${color};">${daysLeft}</div><div style="font-size:0.65rem;color:var(--text-muted);">days left</div></div>
                    <div>${daysLeft<=60?`<button class="btn btn-${daysLeft<=30?'danger':'outline'}" style="font-size:0.72rem;padding:4px 10px;" onclick="toast('FEFO dispatch priority set for ${b.batch}')">Prioritize</button>`:'<span style="color:var(--success-color);">✓ Safe</span>'}</div>
                </div>`;
            }).join('')}
        </div>`;
    m('expiryCalModal','Batch Expiry Calendar','bx-calendar-event',body,800);
};

// ===== Batch Traceability Report =====
window.showBatchTraceability = function() {
    const batchId = prompt('Enter Batch Number (e.g. #B-2380):','#B-2380') || '#B-2380';
    const body = `
        <div style="background:var(--primary-light);border-radius:12px;padding:16px;margin-bottom:20px;">
            <div style="font-size:0.85rem;color:var(--text-muted);">Tracing batch <strong style="color:var(--primary-color);">${batchId}</strong> — Aloo Bhujia (500g)</div>
        </div>
        <div style="position:relative;padding-left:28px;">
            <div style="position:absolute;left:10px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--primary-color),var(--success-color));"></div>
            ${[
                { step:'Raw Materials Received', icon:'bx-box', color:'var(--info-color)', date:'10 Jun 2026', detail:'Besan 250kg from ABC Spices (LOT-889) | Edible Oil 40L from Global Oils | QC: Passed' },
                { step:'Production Started', icon:'bx-cog', color:'var(--primary-color)', date:'15 Jun 2026', detail:'Line 2 | Operator: Ramesh K. | BOM-008 | Batch size: 1000 units' },
                { step:'Production Complete', icon:'bx-check-circle', color:'var(--success-color)', date:'15 Jun 2026', detail:'Yield: 980 units (98%) | Rejected: 20 units (moisture > 12%) | OEE: 82.4%' },
                { step:'Quality Inspection', icon:'bx-shield-quarter', color:'var(--success-color)', date:'16 Jun 2026', detail:'Inspector: Priya M. | Tests: Moisture, Taste, Weight, Seal | Result: PASSED | Certificate: QC-2026-0892' },
                { step:'Packaged & Labelled', icon:'bx-package', color:'var(--primary-color)', date:'16 Jun 2026', detail:'Packaged into 500g pouches | Batch printed: MFG 15/06/26 EXP 30/09/26 | 980 units labelled' },
                { step:'Moved to Finished Goods Store', icon:'bx-layer', color:'var(--info-color)', date:'16 Jun 2026', detail:'Zone A, Rack 4, Bin A4-03 | Temperature: 22°C | Humidity: 65%' },
                { step:'Partial Dispatch', icon:'bx-truck', color:'var(--warning-color)', date:'25 Jun 2026', detail:'180 units to Mega Mart (DO-2026-0445) | Delivery confirmed by Ramesh K.' },
                { step:'Current Stock', icon:'bx-store', color:'var(--success-color)', date:'Now', detail:'800 units remaining in warehouse | Days to expiry: 58 | Status: Available for sale' },
            ].map((s,i) => `
            <div style="position:relative;margin-bottom:16px;display:flex;gap:12px;align-items:flex-start;">
                <div style="position:absolute;left:-22px;width:24px;height:24px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;border:2px solid white;z-index:1;"><i class='bx ${s.icon}' style="color:white;font-size:0.7rem;"></i></div>
                <div style="flex:1;background:var(--bg-main);border-radius:10px;padding:12px;">
                    <div style="display:flex;justify-content:space-between;"><strong style="font-size:0.88rem;">${s.step}</strong><span style="font-size:0.72rem;color:var(--text-muted);">${s.date}</span></div>
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">${s.detail}</div>
                </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="toast('Traceability report exported to PDF')"><i class='bx bx-download'></i> Export PDF</button>
            <button class="btn btn-outline" onclick="toast('Traceability report emailed')"><i class='bx bx-mail-send'></i> Email Report</button>
        </div>`;
    m('traceModal','Batch Traceability — '+batchId,'bx-git-branch',body,780);
};

// ===== Cross-Dock Planner =====
window.showCrossDockPlanner = function() {
    const body = `
        <div style="margin-bottom:16px;padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Cross-docking allows inbound goods to be transferred directly to outbound dispatch without storage — reducing handling costs and time.
        </div>
        <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:start;">
            <div style="background:var(--bg-main);border-radius:12px;padding:16px;">
                <div style="font-weight:700;margin-bottom:12px;font-size:0.9rem;color:var(--primary-color);">📥 Inbound (Arriving Today)</div>
                ${[
                    { vehicle:'MH-12-XY-1234', supplier:'ABC Spices', items:'Besan 500kg, Edible Oil 80L', eta:'10:00 AM' },
                    { vehicle:'MH-09-AB-5678', supplier:'Global Pack', items:'Pouches 10,000 units', eta:'11:30 AM' },
                ].map(t=>`
                <div style="padding:10px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--primary-color);">
                    <div style="font-weight:600;font-size:0.82rem;">${t.supplier}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${t.items}</div>
                    <div style="font-size:0.72rem;margin-top:4px;"><code>${t.vehicle}</code> | ETA: ${t.eta}</div>
                </div>`).join('')}
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding-top:40px;">
                <i class='bx bx-transfer' style="font-size:2rem;color:var(--primary-color);"></i>
                <span style="font-size:0.72rem;color:var(--text-muted);text-align:center;">Cross<br>Dock</span>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:16px;">
                <div style="font-weight:700;margin-bottom:12px;font-size:0.9rem;color:var(--success-color);">📤 Outbound (Leaving Today)</div>
                ${[
                    { vehicle:'MH-12-GH-9012', customer:'Mega Mart (National)', items:'Besan 200kg', departure:'12:00 PM' },
                    { vehicle:'MH-12-CD-3456', customer:'SuperMart', items:'Edible Oil 40L', departure:'01:00 PM' },
                ].map(t=>`
                <div style="padding:10px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border-left:3px solid var(--success-color);">
                    <div style="font-weight:600;font-size:0.82rem;">${t.customer}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${t.items}</div>
                    <div style="font-size:0.72rem;margin-top:4px;"><code>${t.vehicle}</code> | Departs: ${t.departure}</div>
                </div>`).join('')}
            </div>
        </div>
        <button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="toast('Cross-dock plan confirmed — dock assignments sent to warehouse team')"><i class='bx bx-check'></i> Confirm Cross-Dock Plan</button>`;
    m('crossDockModal','Cross-Dock Planner','bx-transfer',body,820);
};

// ===== Freight & Shipping Cost Calculator =====
window.showFreightCalculator = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Shipment Details</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${[['Origin City','frOrigin','Pune'],['Destination City','frDest','Mumbai'],['Weight (kg)','frWeight','500'],['Length (cm)','frLen','120'],['Width (cm)','frWidth','80'],['Height (cm)','frHeight','80']].map(([l,id,v])=>`
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">${l}</label>
                    <input type="${id.includes('Weight')||id.includes('en')||id.includes('dth')||id.includes('ght')?'number':'text'}" id="${id}" value="${v}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" oninput="window.calcFreight()"></div>`).join('')}
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">Carrier</label>
                    <select id="frCarrier" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.calcFreight()">
                        <option>DTDC</option><option>BlueDart</option><option>Delhivery</option><option>FedEx India</option><option>Own Vehicle</option>
                    </select></div>
                </div>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;" id="freightResult">
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Cost Estimate</h3>
                <div style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Fill details to get estimate</div>
            </div>
        </div>`;
    m('freightModal','Freight Cost Calculator','bx-truck',body,800);
    setTimeout(window.calcFreight,100);
};
window.calcFreight = function() {
    const weight = parseFloat(document.getElementById('frWeight')?.value||0);
    const l=parseFloat(document.getElementById('frLen')?.value||0),w=parseFloat(document.getElementById('frWidth')?.value||0),h=parseFloat(document.getElementById('frHeight')?.value||0);
    const volWeight = Math.round(l*w*h/5000);
    const chargeableWeight = Math.max(weight,volWeight);
    const carrier = document.getElementById('frCarrier')?.value||'DTDC';
    const ratePerKg = carrier==='BlueDart'?12:carrier==='FedEx India'?15:carrier==='Own Vehicle'?4:8;
    const base = Math.round(chargeableWeight*ratePerKg);
    const fuel = Math.round(base*0.18);
    const gst = Math.round((base+fuel)*0.18);
    const total = base+fuel+gst;
    const el = document.getElementById('freightResult');
    if(!el)return;
    el.innerHTML=`<h3 style="font-size:0.95rem;margin-bottom:14px;">Cost Estimate</h3>
        <div style="text-align:center;padding:16px;background:var(--primary-light);border-radius:12px;margin-bottom:14px;">
            <div style="font-size:0.75rem;color:var(--text-muted);">Total Freight Cost</div>
            <div style="font-size:2.5rem;font-weight:900;color:var(--primary-color);">₹${total.toLocaleString('en-IN')}</div>
            <div style="font-size:0.78rem;">${carrier} | Chargeable: ${chargeableWeight}kg</div>
        </div>
        ${[['Base Freight','₹'+base],['Fuel Surcharge (18%)','₹'+fuel],['GST (18%)','₹'+gst],['Actual Weight',weight+'kg'],['Volumetric Weight',volWeight+'kg']].map(([l,v])=>`
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.8rem;"><span>${l}</span><strong>${v}</strong></div>`).join('')}`;
};

// ===== Shipping Label Generator =====
window.showShippingLabel = function() {
    const orders = DataManager.getDispatchOrders();
    const order = orders[0] || { id:'DO-001', customer:'Mega Mart', deliveryAddress:'42, Link Road, Andheri West, Mumbai — 400058' };
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Label Details</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">Order ID</label>
                    <select id="slOrder" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.updateShipLabel()">
                        ${orders.map(o=>`<option value="${o.id}">${o.id} — ${o.customer}</option>`).join('')}
                    </select></div>
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">No. of Boxes</label>
                    <input type="number" id="slBoxes" value="3" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);"></div>
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">Total Weight (kg)</label>
                    <input type="number" id="slWeight" value="45" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);"></div>
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:3px;">Carrier</label>
                    <select id="slCarrier" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                        <option>Own Vehicle</option><option>DTDC</option><option>BlueDart</option><option>Delhivery</option>
                    </select></div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-primary" style="flex:1;" onclick="window.printShippingLabel()"><i class='bx bx-printer'></i> Print Label</button>
                        <button class="btn btn-outline" style="flex:1;" onclick="toast('Label saved as PDF')"><i class='bx bx-download'></i> Save PDF</button>
                    </div>
                </div>
            </div>
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Preview</h3>
                <div id="shipLabelPreview" style="border:2px dashed var(--border-color);border-radius:10px;padding:16px;background:white;color:#1e293b;font-family:Arial,sans-serif;">
                    <div style="display:flex;justify-content:space-between;border-bottom:2px solid #1e293b;padding-bottom:8px;margin-bottom:8px;">
                        <div style="font-size:0.65rem;font-weight:700;">FROM:</div>
                        <div style="font-size:0.7rem;font-weight:700;">FRAGILE — HANDLE WITH CARE</div>
                    </div>
                    <div style="font-size:0.72rem;margin-bottom:8px;"><strong>Namkeen Industries Pvt. Ltd.</strong><br>42 MIDC, Pune — 411019<br>+91 20-2345-6789</div>
                    <div style="font-size:0.65rem;font-weight:700;margin-bottom:4px;">TO:</div>
                    <div id="sl_to" style="font-size:0.78rem;font-weight:700;">${order.customer}<br>${order.deliveryAddress||'Delivery Address'}</div>
                    <div style="margin-top:10px;display:flex;justify-content:space-between;font-size:0.68rem;border-top:1px solid #ddd;padding-top:8px;">
                        <span>Order: <strong>${order.id}</strong></span>
                        <span>Boxes: 3 | Wt: 45kg</span>
                    </div>
                    <div style="text-align:center;margin-top:8px;font-size:0.6rem;letter-spacing:2px;font-family:monospace;background:#f1f5f9;padding:6px;border-radius:4px;">|||||||| ${order.id} ||||||||</div>
                </div>
            </div>
        </div>`;
    m('shipLabelModal','Shipping Label Generator','bx-label',body,820);
};
window.printShippingLabel = function() {
    const win = window.open('','_blank','width=500,height=400');
    const preview = document.getElementById('shipLabelPreview');
    win.document.write(`<!DOCTYPE html><html><head><title>Shipping Label</title><style>body{margin:20px;font-family:Arial,sans-serif;}</style></head><body>${preview?.outerHTML||'Label'}<script>window.print();</script></body></html>`);
    toast('Shipping label sent to printer');
};

// ===== Inventory Reconciliation Tool =====
window.showInventoryReconciliation = function() {
    const products = DataManager.getProducts();
    const reconcile = products.map(p => {
        const systemQty = p.stock;
        const physicalQty = systemQty + Math.floor(Math.random()*7-3);
        const variance = physicalQty - systemQty;
        return { ...p, systemQty, physicalQty, variance, varianceValue: Math.round(Math.abs(variance)*parseFloat(p.price)) };
    });
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${reconcile.filter(r=>r.variance===0).length}</div><div class="stat-label">Items Matched</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${reconcile.filter(r=>r.variance<0).length}</div><div class="stat-label">Shortage</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${reconcile.filter(r=>r.variance>0).length}</div><div class="stat-label">Overage</div></div>
        </div>
        <table class="table"><thead><tr><th>Product</th><th>System Qty</th><th>Physical Qty</th><th>Variance</th><th>Value Impact</th><th>Action</th></tr></thead>
        <tbody>${reconcile.map(r=>`<tr style="${r.variance!==0?'background:var(--warning-color)03;':''}">
            <td>${r.name}</td>
            <td>${r.systemQty}</td>
            <td><input type="number" value="${r.physicalQty}" style="width:70px;padding:3px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-main);text-align:center;"></td>
            <td style="font-weight:700;color:${r.variance<0?'var(--danger-color)':r.variance>0?'var(--warning-color)':'var(--success-color)'};">
                ${r.variance>0?'+':''}${r.variance}
            </td>
            <td style="font-size:0.82rem;color:var(--text-muted);">${r.variance!==0?'₹'+r.varianceValue:''}</td>
            <td>${r.variance!==0?`<button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="toast('Adjustment posted for ${r.name}')">Adjust</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="toast('All reconciliation adjustments posted to ledger')"><i class='bx bx-check'></i> Post All Adjustments</button>`;
    m('reconModal','Inventory Reconciliation Tool','bx-git-compare',body,900);
};

// ===== Container Load Planner =====
window.showContainerLoadPlanner = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Container Details</h3>
                <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
                    <div><label style="font-size:0.8rem;color:var(--text-muted);">Container Type</label>
                    <select id="ctType" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.calcContainerLoad()">
                        <option value="20ft">20 ft Standard (33 CBM)</option>
                        <option value="40ft">40 ft Standard (67 CBM)</option>
                        <option value="40hc">40 ft High Cube (76 CBM)</option>
                    </select></div>
                </div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Products to Load</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${DataManager.getProducts().slice(0,4).map((p,i)=>`
                    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-main);border-radius:8px;">
                        <span style="flex:1;font-size:0.82rem;">${p.name}</span>
                        <input type="number" id="ct_qty_${i}" value="${Math.floor(Math.random()*500+100)}" style="width:65px;padding:5px;border:1px solid var(--border-color);border-radius:6px;text-align:center;" oninput="window.calcContainerLoad()" placeholder="Units">
                        <span style="font-size:0.72rem;color:var(--text-muted);">CBM/unit: 0.0012</span>
                    </div>`).join('')}
                </div>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;">
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Load Plan</h3>
                <div id="containerLoadResult">
                    <div style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Adjust quantities to see load plan</div>
                </div>
            </div>
        </div>`;
    m('containerModal','Container Load Planner','bx-package',body,820);
    setTimeout(window.calcContainerLoad,100);
};
window.calcContainerLoad = function() {
    const type = document.getElementById('ctType')?.value||'20ft';
    const maxCBM = type==='40hc'?76:type==='40ft'?67:33;
    const maxWeight = type==='20ft'?21700:26500;
    const qtys = [0,1,2,3].map(i=>parseInt(document.getElementById('ct_qty_'+i)?.value||0));
    const totalUnits = qtys.reduce((a,v)=>a+v,0);
    const totalCBM = +(totalUnits*0.0012*2.5).toFixed(2);
    const totalWeight = Math.round(totalUnits*0.52);
    const fillPct = Math.min(100,Math.round(totalCBM/maxCBM*100));
    const el = document.getElementById('containerLoadResult');
    if(!el) return;
    el.innerHTML = `
        <div style="text-align:center;margin-bottom:16px;">
            <div style="position:relative;width:120px;height:120px;margin:0 auto;">
                <svg viewBox="0 0 120 120" style="transform:rotate(-90deg);">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-color)" stroke-width="12"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="${fillPct>90?'var(--danger-color)':fillPct>70?'var(--warning-color)':'var(--primary-color)'}" stroke-width="12" stroke-dasharray="${Math.round(fillPct*3.14)} 314"/>
                </svg>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                    <div style="font-size:1.5rem;font-weight:900;color:var(--primary-color);">${fillPct}%</div>
                    <div style="font-size:0.65rem;color:var(--text-muted);">Used</div>
                </div>
            </div>
        </div>
        ${[['Container Type',type.toUpperCase()],['Max Volume',maxCBM+' CBM'],['Used Volume',totalCBM+' CBM'],['Total Units',totalUnits],['Cargo Weight',totalWeight.toLocaleString('en-IN')+' kg'],['Max Payload',maxWeight.toLocaleString('en-IN')+' kg'],['Available Space',(maxCBM-totalCBM).toFixed(2)+' CBM']].map(([l,v])=>`
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border-color);font-size:0.78rem;"><span>${l}</span><strong>${v}</strong></div>`).join('')}
        ${totalWeight>maxWeight?`<div style="margin-top:10px;padding:8px;background:var(--danger-color)10;border-radius:8px;font-size:0.78rem;color:var(--danger-color);">⚠️ Weight exceeds container payload capacity!</div>`:''}
        <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="toast('Load plan finalized and sent to dispatch team')">Finalize Load Plan</button>`;
};

// ===== Sample Request Tracker =====
window.showSampleTracker = function() {
    const key = 'wms_samples';
    const samples = getData(key, [
        { id:'SMP-001', requestedBy:'SuperMart', product:'New Chaat Masala Sev (trial)', qty:50, date:'01 Aug 2026', feedback:'Pending', status:'Dispatched' },
        { id:'SMP-002', requestedBy:'BigBazaar', product:'Aloo Bhujia (500g) — new packaging', qty:24, date:'25 Jul 2026', feedback:'Positive — proceeding to bulk order', status:'Feedback Received' },
    ]);
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.addSampleRequest()"><i class='bx bx-plus'></i> New Sample Request</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Requested By</th><th>Product</th><th>Qty</th><th>Date</th><th>Status</th><th>Feedback</th></tr></thead>
        <tbody>${samples.map(s=>`<tr>
            <td><code>${s.id}</code></td><td>${s.requestedBy}</td><td>${s.product}</td><td>${s.qty}</td><td>${s.date}</td>
            <td><span class="badge ${s.status.includes('Feedback')?'status-success':'status-warning'}">${s.status}</span></td>
            <td style="font-size:0.78rem;">${s.feedback}</td>
        </tr>`).join('')}</tbody></table>`;
    m('sampleModal','Sample Request Tracker','bx-gift',body,900);
};
window.addSampleRequest = function() {
    const requestedBy = prompt('Requested by (customer/retailer):'); if(!requestedBy) return;
    const product = prompt('Product for sampling:'); if(!product) return;
    const qty = parseInt(prompt('Quantity (units):','12')||12);
    const samples = getData('wms_samples',[]);
    samples.unshift({ id:'SMP-'+Date.now().toString().slice(-4), requestedBy, product, qty, date:new Date().toLocaleDateString('en-IN'), feedback:'Pending', status:'Requested' });
    setData('wms_samples',samples); toast('Sample request logged'); document.getElementById('sampleModal')?.remove(); window.showSampleTracker();
};

// =========================================================
// ASSET & CONTRACT MANAGEMENT
// =========================================================

// ===== Asset Register =====
window.showAssetRegister = function() {
    const key = 'wms_assets';
    const assets = getData(key, [
        { id:'AST-001', name:'Forklift — Clark C30', category:'Material Handling', purchaseDate:'15 Jan 2024', cost:850000, currentValue:620000, location:'Warehouse Floor', status:'Operational', nextService:'01 Sep 2026' },
        { id:'AST-002', name:'Packaging Machine — Multivac R535', category:'Production', purchaseDate:'20 Mar 2022', cost:2200000, currentValue:1450000, location:'Production Line 3', status:'Operational', nextService:'15 Aug 2026' },
        { id:'AST-003', name:'Cold Storage Unit 1', category:'Refrigeration', purchaseDate:'10 Jun 2020', cost:1500000, currentValue:900000, location:'Warehouse Zone C', status:'Operational', nextService:'10 Sep 2026' },
        { id:'AST-004', name:'Weighbridge — Mettler Toledo', category:'Measurement', purchaseDate:'01 Nov 2023', cost:320000, currentValue:280000, location:'Loading Dock', status:'Operational', nextService:'01 Nov 2026' },
    ]);
    const totalCost = assets.reduce((a,x)=>a+x.cost,0);
    const totalValue = assets.reduce((a,x)=>a+x.currentValue,0);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">${assets.length}</div><div class="stat-label">Total Assets</div></div>
            <div class="stat-card"><div class="stat-number">₹${(totalCost/100000).toFixed(1)}L</div><div class="stat-label">Total Purchase Cost</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">₹${(totalValue/100000).toFixed(1)}L</div><div class="stat-label">Current Book Value</div></div>
        </div>
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="toast('Asset added')"><i class='bx bx-plus'></i> Add Asset</button></div>
        <table class="table"><thead><tr><th>Asset</th><th>Category</th><th>Purchase Date</th><th>Cost</th><th>Book Value</th><th>Location</th><th>Next Service</th><th>Status</th></tr></thead>
        <tbody>${assets.map(a=>`<tr>
            <td><strong>${a.name}</strong><br><code style="font-size:0.68rem;">${a.id}</code></td>
            <td>${a.category}</td><td>${a.purchaseDate}</td>
            <td>₹${(a.cost/100000).toFixed(1)}L</td>
            <td style="color:var(--warning-color);">₹${(a.currentValue/100000).toFixed(1)}L</td>
            <td>${a.location}</td>
            <td style="font-size:0.78rem;">${a.nextService}</td>
            <td><span class="badge status-success">${a.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    m('assetModal','Asset Register','bx-buildings',body,1000);
};

// ===== Contract Management =====
window.showContractManager = function() {
    const key = 'wms_contracts';
    const contracts = getData(key, [
        { id:'CONT-001', party:'ABC Spices Ltd.', type:'Supplier', startDate:'01 Apr 2026', endDate:'31 Mar 2027', value:2400000, terms:'Net 30 | Min order 500kg/month | Price locked at ₹48/kg', status:'Active', autoRenew:true },
        { id:'CONT-002', party:'Mega Mart (National)', type:'Customer', startDate:'01 Jan 2026', endDate:'31 Dec 2026', value:8500000, terms:'Annual agreement | 60-day credit | Volume rebate 3% above ₹50L', status:'Active', autoRenew:false },
        { id:'CONT-003', party:'ShipNow Logistics', type:'Logistics', startDate:'01 Jun 2026', endDate:'31 May 2027', value:600000, terms:'₹8/kg freight | Fuel surcharge capped at 20%', status:'Active', autoRenew:true },
    ]);
    const body = `
        <div style="margin-bottom:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="toast('Contract upload wizard opened')"><i class='bx bx-plus'></i> New Contract</button>
            <button class="btn btn-outline" onclick="toast('Contract expiry reminder emails sent')"><i class='bx bx-bell'></i> Send Renewal Reminders</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${contracts.map(c=>{
                const daysLeft = Math.floor((new Date(c.endDate)-new Date())/86400000);
                const urgency = daysLeft<30?'var(--danger-color)':daysLeft<90?'var(--warning-color)':'var(--success-color)';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:14px;padding:18px;border-left:4px solid ${urgency};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                        <div><strong style="font-size:1rem;">${c.party}</strong>
                        <span class="badge ${c.type==='Supplier'?'status-info':c.type==='Customer'?'status-success':'status-warning'}" style="margin-left:8px;">${c.type}</span>
                        <code style="font-size:0.72rem;margin-left:6px;">${c.id}</code></div>
                        <div style="text-align:right;">
                            <div style="font-size:1rem;font-weight:700;color:var(--primary-color);">₹${(c.value/100000).toFixed(1)}L</div>
                            <div style="font-size:0.7rem;color:${urgency};">${daysLeft} days remaining</div>
                        </div>
                    </div>
                    <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:10px;">${c.terms}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.75rem;color:var(--text-muted);">${c.startDate} → ${c.endDate} ${c.autoRenew?'| <span style="color:var(--info-color);">Auto-Renew ON</span>':''}</span>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="toast('${c.id} downloaded')"><i class='bx bx-download'></i> Download</button>
                            <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="toast('Renewal started for ${c.party}')">Renew</button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    m('contractModal','Contract Management','bx-file-find',body,800);
};

// ===== Rate Contract Manager =====
window.showRateContracts = function() {
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Rate contracts lock prices with suppliers for a fixed period, protecting against price fluctuations.</p>
        <table class="table"><thead><tr><th>Supplier</th><th>Material</th><th>Rate (₹/kg)</th><th>Min Qty</th><th>Valid Until</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${[
            ['ABC Spices Ltd.','Besan (Gram Flour)',48,500,'31 Mar 2027','Active'],
            ['Global Packaging','PP Pouches (500g)',1.20,10000,'31 Dec 2026','Active'],
            ['National Oils','Refined Edible Oil',98,500,'31 Oct 2026','Active'],
            ['Star Salt Co.','Iodized Salt',18,200,'28 Feb 2027','Active'],
            ['Spice World','Red Chilli Powder',220,100,'31 Aug 2026','Expiring Soon'],
        ].map(([supplier,material,rate,minQty,valid,status])=>`<tr>
            <td>${supplier}</td><td>${material}</td>
            <td><strong>₹${rate}</strong></td>
            <td>${minQty.toLocaleString('en-IN')} kg</td>
            <td>${valid}</td>
            <td><span class="badge ${status==='Active'?'status-success':'status-warning'}">${status}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="toast('New rate negotiation started with ${supplier}')">Renegotiate</button></td>
        </tr>`).join('')}</tbody></table>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="toast('New rate contract form opened')"><i class='bx bx-plus'></i> New Rate Contract</button>`;
    m('rateContractModal','Rate Contract Manager','bx-dollar',body,900);
};

// =========================================================
// NOTIFICATIONS & COMMUNICATION
// =========================================================

// ===== Push Notification Manager =====
window.showPushNotificationManager = function() {
    const key = 'wms_push_prefs';
    const prefs = getData(key, {
        lowStock:true, newPO:true, dispatchUpdate:true, qcAlert:true, paymentDue:true, systemAlert:true, dailyDigest:false, shiftChange:false
    });
    const notifGroups = [
        { key:'lowStock', label:'Low Stock Alerts', desc:'When any SKU falls below reorder level' },
        { key:'newPO', label:'New Purchase Order', desc:'When a new PO is created or approved' },
        { key:'dispatchUpdate', label:'Dispatch Updates', desc:'Status changes on dispatch orders' },
        { key:'qcAlert', label:'Quality Control Alerts', desc:'Batch pass/fail notifications' },
        { key:'paymentDue', label:'Payment Due Reminders', desc:'Upcoming and overdue payment alerts' },
        { key:'systemAlert', label:'System Alerts', desc:'Anomalies, errors, and critical events' },
        { key:'dailyDigest', label:'Daily Summary Digest', desc:'07:00 AM daily briefing notification' },
        { key:'shiftChange', label:'Shift Changeover Alert', desc:'30 minutes before shift changeover' },
    ];
    const body = `
        <div style="margin-bottom:16px;padding:12px;background:var(--success-color)10;border-radius:10px;display:flex;align-items:center;gap:10px;font-size:0.85rem;">
            <i class='bx bx-bell' style="color:var(--success-color);font-size:1.3rem;"></i>
            <div><strong>Browser Push Notifications Enabled</strong><br><span style="color:var(--text-muted);">Notifications will appear even when the tab is not active.</span></div>
            <button class="btn btn-outline" style="margin-left:auto;font-size:0.75rem;padding:4px 10px;" onclick="toast('Test notification sent!')">Test</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${notifGroups.map(g=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--bg-main);border-radius:10px;">
                <div><div style="font-weight:600;">${g.label}</div><div style="font-size:0.75rem;color:var(--text-muted);">${g.desc}</div></div>
                <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
                    <input type="checkbox" ${prefs[g.key]?'checked':''} style="opacity:0;width:0;height:0;" onchange="window.saveNotifPref('${g.key}',this.checked)">
                    <span style="position:absolute;inset:0;background:${prefs[g.key]?'var(--primary-color)':'var(--border-color)'};border-radius:99px;transition:0.3s;"></span>
                    <span style="position:absolute;left:${prefs[g.key]?'22px':'2px'};top:2px;width:20px;height:20px;background:white;border-radius:50%;transition:0.3s;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></span>
                </label>
            </div>`).join('')}
        </div>`;
    m('pushNotifModal','Push Notification Manager','bx-bell',body,650);
};
window.saveNotifPref = function(key, val) {
    const prefs = getData('wms_push_prefs',{}); prefs[key]=val; setData('wms_push_prefs',prefs);
    toast(`${key} notifications ${val?'enabled':'disabled'}`,'info');
    // Actually request browser permission
    if(val && 'Notification' in window && Notification.permission!=='granted') {
        Notification.requestPermission().then(p=>{ if(p==='granted') toast('Browser notifications granted!'); });
    }
};

// ===== SMS Alert Configurator =====
window.showSMSAlertConfig = function() {
    const key = 'wms_sms_config';
    const config = getData(key, { provider:'Twilio', sid:'ACxxxxxxxxxx', token:'••••••••', from:'+14155552671', recipients:['+91 98765 43210','+91 87654 32109'] });
    const body = `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                ${[['SMS Provider','smsProvider',config.provider,'select',['Twilio','AWS SNS','MSG91','2Factor','Fast2SMS']],['Account SID','smsSID',config.sid,'text'],['Auth Token','smsToken','••••••••','password'],['From Number','smsFrom',config.from,'text']].map(([l,id,v,type,opts])=>`
                <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${l}</label>
                ${type==='select'?`<select id="${id}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">${opts.map(o=>`<option>${o}</option>`).join('')}</select>`
                :`<input type="${type}" id="${id}" value="${v}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">`}
                </div>`).join('')}
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:8px;">Alert Recipients</label>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    ${config.recipients.map((r,i)=>`
                    <div style="display:flex;gap:8px;align-items:center;">
                        <input value="${r}" style="flex:1;padding:7px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-main);">
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;color:var(--danger-color);" onclick="toast('Recipient removed','warning')"><i class='bx bx-x'></i></button>
                    </div>`).join('')}
                    <button class="btn btn-outline" style="align-self:flex-start;" onclick="toast('Recipient added')"><i class='bx bx-plus'></i> Add Recipient</button>
                </div>
            </div>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-primary" onclick="toast('SMS configuration saved')"><i class='bx bx-save'></i> Save Config</button>
                <button class="btn btn-outline" onclick="toast('Test SMS sent to all recipients','info')"><i class='bx bx-send'></i> Send Test SMS</button>
            </div>
        </div>`;
    m('smsConfigModal','SMS Alert Configurator','bx-mobile-alt',body,700);
};

// =========================================================
// OPERATIONS & WORKFORCE
// =========================================================

// ===== Shift Handover Notes =====
window.showShiftHandover = function() {
    const key = 'wms_handover';
    const handovers = getData(key, [
        { id:'HO-001', date:'02 Aug 2026', fromShift:'AM (06:00–14:00)', toShift:'PM (14:00–22:00)', writtenBy:'Warehouse Mgr', production:'Line 1: 4,800 units (Aloo Bhujia). Line 2: 2,200 units (Navratna Mix). Line 3: STOPPED — sealing jaw repair.', issues:'Batch #B-2410 moisture test failed — quarantined. Cold Storage Unit 2 alarm at 12:00 (reset).', pending:'PO-2026-1052 arriving at 15:00 — please receive and check. EOD stock count for Zone B due.', acknowledged:true },
    ]);
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.createHandoverNote()"><i class='bx bx-plus'></i> Create Handover Note</button></div>
        ${handovers.map(h=>`
        <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:14px;padding:20px;margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <div><code>${h.id}</code> <strong style="margin-left:8px;">${h.date}</strong>
                <span style="font-size:0.8rem;color:var(--text-muted);margin-left:8px;">${h.fromShift} → ${h.toShift}</span></div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span class="badge ${h.acknowledged?'status-success':'status-warning'}">${h.acknowledged?'Acknowledged':'Pending'}</span>
                    ${!h.acknowledged?`<button class="btn btn-primary" style="font-size:0.72rem;padding:3px 8px;" onclick="toast('Handover acknowledged by incoming shift')">Acknowledge</button>`:''}
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                ${[['📦 Production Summary','production'],['⚠️ Issues & Incidents','issues'],['📋 Pending Tasks','pending']].map(([label,field])=>`
                <div style="padding:12px;background:var(--bg-card);border-radius:8px;">
                    <div style="font-weight:600;font-size:0.82rem;margin-bottom:6px;">${label}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted);">${h[field]}</div>
                </div>`).join('')}
            </div>
        </div>`).join('')}`;
    m('handoverModal','Shift Handover Notes','bx-clipboard',body,780);
};
window.createHandoverNote = function() {
    const prod = prompt('Production summary:','Line 1: 4,800 units | Line 2: 3,200 units'); if(!prod) return;
    const issues = prompt('Issues/incidents (or "None"):','None');
    const pending = prompt('Pending tasks for next shift:','Stock count Zone A due');
    const handovers = getData('wms_handover',[]);
    handovers.unshift({ id:'HO-'+Date.now().toString().slice(-4), date:new Date().toLocaleDateString('en-IN'), fromShift:'Current Shift', toShift:'Incoming Shift', writtenBy:'Admin User', production:prod, issues:issues||'None', pending:pending||'None', acknowledged:false });
    setData('wms_handover',handovers); toast('Handover note created and sent to incoming shift');
    document.getElementById('handoverModal')?.remove(); window.showShiftHandover();
};

// ===== Task Assignment Board (Kanban) =====
window.showTaskBoard = function() {
    const key = 'wms_tasks';
    const tasks = getData(key, [
        { id:'TASK-001', title:'Conduct Zone B stock count', assignee:'Scanner 1', priority:'High', status:'todo', due:'Today' },
        { id:'TASK-002', title:'Receive PO-2026-1052 from ABC Spices', assignee:'Warehouse Mgr', priority:'High', status:'inprogress', due:'Today 15:00' },
        { id:'TASK-003', title:'Repair Line 3 sealing jaw', assignee:'Maintenance', priority:'Medium', status:'inprogress', due:'Today' },
        { id:'TASK-004', title:'Update product catalog for Diwali range', assignee:'Admin User', priority:'Low', status:'done', due:'05 Aug' },
        { id:'TASK-005', title:'Schedule ISO 22000 pre-audit', assignee:'Admin User', priority:'Medium', status:'todo', due:'06 Aug' },
    ]);
    const cols = [
        { key:'todo', label:'📋 To Do', color:'var(--info-color)' },
        { key:'inprogress', label:'⚙️ In Progress', color:'var(--warning-color)' },
        { key:'done', label:'✅ Done', color:'var(--success-color)' },
    ];
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.addTask()"><i class='bx bx-plus'></i> Add Task</button></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
            ${cols.map(col=>`
            <div>
                <div style="font-weight:700;padding:8px;background:${col.color}15;border-radius:8px;margin-bottom:10px;text-align:center;font-size:0.88rem;border:1px solid ${col.color}30;">${col.label} <span class="badge" style="background:${col.color}20;color:${col.color};">${tasks.filter(t=>t.status===col.key).length}</span></div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${tasks.filter(t=>t.status===col.key).map(t=>`
                    <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;padding:12px;cursor:pointer;transition:border 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='var(--border-color)'">
                        <div style="font-size:0.82rem;font-weight:600;margin-bottom:6px;">${t.title}</div>
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.72rem;">
                            <span style="color:var(--text-muted);">👤 ${t.assignee}</span>
                            <span class="badge ${t.priority==='High'?'status-danger':t.priority==='Medium'?'status-warning':'status-info'}">${t.priority}</span>
                        </div>
                        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px;">Due: ${t.due}</div>
                        ${col.key!=='done'?`<div style="margin-top:8px;display:flex;gap:4px;">
                            ${col.key==='todo'?`<button class="btn btn-outline" style="font-size:0.68rem;padding:2px 6px;" onclick="window.moveTask('${t.id}','inprogress')">Start →</button>`:''}
                            ${col.key==='inprogress'?`<button class="btn btn-primary" style="font-size:0.68rem;padding:2px 6px;" onclick="window.moveTask('${t.id}','done')">Complete ✓</button>`:''}
                        </div>`:''}
                    </div>`).join('')}
                </div>
            </div>`).join('')}
        </div>`;
    m('taskBoardModal','Task Assignment Board','bx-task',body,950);
};
window.addTask = function() {
    const title = prompt('Task description:'); if(!title) return;
    const assignee = prompt('Assign to:','Admin User')||'Admin User';
    const priority = prompt('Priority (High/Medium/Low):','Medium')||'Medium';
    const due = prompt('Due:','Today')||'Today';
    const tasks = getData('wms_tasks',[]);
    tasks.unshift({ id:'TASK-'+Date.now().toString().slice(-4), title, assignee, priority, status:'todo', due });
    setData('wms_tasks',tasks); toast('Task added: '+title); DataManager.logAction('Task Created',title);
    document.getElementById('taskBoardModal')?.remove(); window.showTaskBoard();
};
window.moveTask = function(id, newStatus) {
    const tasks = getData('wms_tasks',[]); const t = tasks.find(x=>x.id===id);
    if(t) { t.status=newStatus; setData('wms_tasks',tasks); toast('Task moved to '+newStatus); }
    document.getElementById('taskBoardModal')?.remove(); window.showTaskBoard();
};

// ===== Feedback & Suggestion Box =====
window.showFeedbackBox = function() {
    const key = 'wms_feedback';
    const feedbacks = getData(key, [
        { id:'FB-001', from:'Scanner 1', category:'Improvement', message:'Barcode scanner app crashes when scanning high-density 2D codes. Need firmware update.', status:'Under Review', date:'28 Jul 2026', upvotes:3 },
        { id:'FB-002', from:'Warehouse Mgr', category:'Feature Request', message:'Add ability to bulk-approve purchase orders from mobile view.', status:'Planned', date:'25 Jul 2026', upvotes:7 },
        { id:'FB-003', from:'Admin User', category:'Bug', message:'Invoice total includes GST twice when customer is GST-exempt.', status:'Fixed', date:'20 Jul 2026', upvotes:5 },
    ]);
    const body = `
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.submitFeedback()"><i class='bx bx-message-add'></i> Submit Feedback</button></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${feedbacks.map(f=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge ${f.category==='Bug'?'status-danger':f.category==='Feature Request'?'status-info':'status-warning'}">${f.category}</span>
                        <code style="font-size:0.72rem;">${f.id}</code>
                        <span style="font-size:0.75rem;color:var(--text-muted);">by ${f.from}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge ${f.status==='Fixed'?'status-success':f.status==='Planned'?'status-info':'status-warning'}">${f.status}</span>
                        <span style="font-size:0.72rem;color:var(--text-muted);">${f.date}</span>
                    </div>
                </div>
                <div style="font-size:0.85rem;margin-bottom:10px;">${f.message}</div>
                <div style="display:flex;align-items:center;gap:10px;">
                    <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="toast('Upvoted!')">👍 ${f.upvotes}</button>
                    ${f.status!=='Fixed'?`<button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="toast('Status updated')">Update Status</button>`:''}
                </div>
            </div>`).join('')}
        </div>`;
    m('feedbackModal','Feedback & Suggestion Box','bx-message-dots',body,700);
};
window.submitFeedback = function() {
    const cat = prompt('Category (Bug/Improvement/Feature Request):','Improvement'); if(!cat) return;
    const msg = prompt('Your feedback or suggestion:'); if(!msg) return;
    const feedbacks = getData('wms_feedback',[]);
    feedbacks.unshift({ id:'FB-'+Date.now().toString().slice(-4), from:'Admin User', category:cat, message:msg, status:'New', date:new Date().toLocaleDateString('en-IN'), upvotes:0 });
    setData('wms_feedback',feedbacks); toast('Feedback submitted — thank you!');
    document.getElementById('feedbackModal')?.remove(); window.showFeedbackBox();
};

// =========================================================
// SYSTEM FEATURES & UTILITIES
// =========================================================

// ===== System Health Dashboard =====
window.showSystemHealth = function() {
    const metrics = [
        { label:'SQLite DB Size', value:'4.2 MB', max:100, pct:4, unit:'MB', status:'Good' },
        { label:'localStorage Used', value:`${Math.round(JSON.stringify(localStorage).length/1024)} KB`, max:5120, pct:Math.round(JSON.stringify(localStorage).length/1024/5120*100), unit:'KB', status:'Good' },
        { label:'Active Sessions', value:'1', max:10, pct:10, unit:'', status:'Good' },
        { label:'API Response Time', value:'12ms', max:2000, pct:1, unit:'ms', status:'Excellent' },
        { label:'JS Memory', value:`${Math.round((performance.memory?.usedJSHeapSize||10000000)/1024/1024)} MB`, max:256, pct:Math.round((performance.memory?.usedJSHeapSize||10000000)/1024/1024/256*100), unit:'MB', status:'Good' },
        { label:'Error Rate (24h)', value:'0%', max:100, pct:0, unit:'', status:'Excellent' },
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
            ${[['Uptime','99.98%','var(--success-color)'],['Server','Python/Flask @ :3000','var(--info-color)'],['DB Engine','SQLite 3.41.2','var(--primary-color)'],['Frontend','Vanilla JS + CSS','var(--warning-color)']].map(([l,v,c])=>`
            <div style="padding:14px;background:var(--bg-main);border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.82rem;">${l}</span><strong style="color:${c};">${v}</strong>
            </div>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${metrics.map(met=>`
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-main);border-radius:10px;">
                <div style="flex:1;"><div style="font-size:0.82rem;font-weight:600;">${met.label}</div>
                <div style="height:6px;background:var(--border-color);border-radius:99px;margin-top:6px;overflow:hidden;"><div style="height:100%;width:${met.pct}%;background:${met.pct>80?'var(--danger-color)':met.pct>50?'var(--warning-color)':'var(--success-color)'};border-radius:99px;"></div></div></div>
                <div style="text-align:right;min-width:80px;">
                    <div style="font-size:0.95rem;font-weight:700;">${met.value}</div>
                    <span class="badge status-success" style="font-size:0.65rem;">${met.status}</span>
                </div>
            </div>`).join('')}
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;">
            <button class="btn btn-outline" onclick="window.location.reload()"><i class='bx bx-refresh'></i> Reload App</button>
            <button class="btn btn-outline" onclick="toast('System diagnostics exported')"><i class='bx bx-download'></i> Export Diagnostics</button>
            <button class="btn btn-danger" onclick="window.sensitiveActionConfirm&&window.sensitiveActionConfirm('Clear all localStorage data',()=>{localStorage.clear();window.location.reload();})"><i class='bx bx-trash'></i> Clear All Data</button>
        </div>`;
    m('sysHealthModal','System Health Dashboard','bx-chip',body,700);
};

// ===== Keyboard Shortcut Guide =====
window.showKeyboardGuide = function() {
    const shortcuts = [
        { key:'Ctrl + Shift + F', action:'Open Feature Launcher (150+ features)' },
        { key:'Ctrl + Shift + S', action:'Global Search' },
        { key:'Ctrl + Shift + N', action:'New Purchase Order' },
        { key:'Ctrl + Shift + D', action:'Open Dashboard' },
        { key:'Ctrl + Shift + P', action:'Print current page' },
        { key:'Ctrl + Shift + B', action:'Download full data backup' },
        { key:'Ctrl + Shift + A', action:'Open AI Daily Briefing' },
        { key:'Ctrl + Shift + T', action:'Open Task Board' },
        { key:'Esc', action:'Close any open modal' },
        { key:'Alt + 1', action:'Navigate to Dashboard' },
        { key:'Alt + 2', action:'Navigate to Inventory' },
        { key:'Alt + 3', action:'Navigate to Purchase' },
        { key:'Alt + 4', action:'Navigate to Dispatch' },
        { key:'Alt + 5', action:'Navigate to Finance' },
    ];
    const body = `
        <div style="display:flex;flex-direction:column;gap:6px;">
            ${shortcuts.map(s=>`
            <div style="display:flex;align-items:center;gap:14px;padding:10px;background:var(--bg-main);border-radius:8px;">
                <kbd style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:4px 10px;font-family:monospace;font-size:0.82rem;font-weight:700;box-shadow:0 2px 0 var(--border-color);white-space:nowrap;">${s.key}</kbd>
                <span style="font-size:0.85rem;color:var(--text-muted);">${s.action}</span>
            </div>`).join('')}
        </div>
        <div style="margin-top:14px;padding:10px;background:var(--info-color)10;border-radius:8px;font-size:0.78rem;color:var(--text-muted);">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Press <kbd style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:4px;padding:1px 6px;font-family:monospace;">?</kbd> anywhere to show this guide.
        </div>`;
    m('kbGuideModal','Keyboard Shortcut Guide','bx-keyboard',body,650);
};

// ===== Net Promoter Score (NPS) Tracker =====
window.showNPSTracker = function() {
    const responses = [
        { customer:'Mega Mart', score:9, comment:'Excellent quality and on-time delivery. Very professional team.' },
        { customer:'SuperMart', score:8, comment:'Good products. Packaging could be improved for transit.' },
        { customer:'BigBazaar', score:10, comment:'Best Namkeen supplier in the region. Always fresh stock!' },
        { customer:'Local Mart', score:6, comment:'Products are good but delivery schedule is sometimes unpredictable.' },
        { customer:'FoodBazaar', score:7, comment:'Good range. Would like more variety in premium segment.' },
    ];
    const promoters = responses.filter(r=>r.score>=9).length;
    const passives = responses.filter(r=>r.score>=7&&r.score<9).length;
    const detractors = responses.filter(r=>r.score<7).length;
    const nps = Math.round((promoters-detractors)/responses.length*100);
    const body = `
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:20px;margin-bottom:20px;">
            <div style="text-align:center;padding:20px;background:var(--primary-light);border-radius:16px;">
                <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px;">Net Promoter Score</div>
                <div style="font-size:4rem;font-weight:900;color:${nps>=50?'var(--success-color)':nps>=0?'var(--warning-color)':'var(--danger-color)'};">${nps}</div>
                <div style="font-size:0.82rem;color:${nps>=50?'var(--success-color)':nps>=0?'var(--warning-color)':'var(--danger-color)'};">${nps>=50?'Excellent':'nps>=0?Good':'Needs Improvement'}</div>
                <div style="display:flex;gap:12px;justify-content:center;margin-top:14px;font-size:0.78rem;">
                    <div style="text-align:center;"><div style="font-weight:700;color:var(--success-color);">${promoters}</div><div style="color:var(--text-muted);">Promoters</div></div>
                    <div style="text-align:center;"><div style="font-weight:700;color:var(--warning-color);">${passives}</div><div style="color:var(--text-muted);">Passives</div></div>
                    <div style="text-align:center;"><div style="font-weight:700;color:var(--danger-color);">${detractors}</div><div style="color:var(--text-muted);">Detractors</div></div>
                </div>
            </div>
            <div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${responses.map(r=>`
                    <div style="padding:10px;background:var(--bg-main);border-radius:10px;display:flex;gap:12px;align-items:flex-start;">
                        <div style="width:38px;height:38px;border-radius:50%;background:${r.score>=9?'var(--success-color)':r.score>=7?'var(--warning-color)':'var(--danger-color)'}20;border:2px solid ${r.score>=9?'var(--success-color)':r.score>=7?'var(--warning-color)':'var(--danger-color)'};display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:900;color:${r.score>=9?'var(--success-color)':r.score>=7?'var(--warning-color)':'var(--danger-color)'};">${r.score}</div>
                        <div><div style="font-weight:600;font-size:0.85rem;">${r.customer}</div><div style="font-size:0.78rem;color:var(--text-muted);">${r.comment}</div></div>
                    </div>`).join('')}
                </div>
            </div>
        </div>
        <button class="btn btn-outline" onclick="toast('NPS survey sent to all customers')"><i class='bx bx-mail-send'></i> Send NPS Survey to All Customers</button>`;
    m('npsModal','Net Promoter Score (NPS)','bx-smile',body,850);
};

// ===== CSV/Excel Export =====
window.exportTableToCSV = function(tableData, filename) {
    if(!tableData || !tableData.length) { toast('No data to export','warning'); return; }
    const headers = Object.keys(tableData[0]);
    const csv = [headers.join(','), ...tableData.map(row=>headers.map(h=>`"${String(row[h]||'').replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=(filename||'export')+'_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
    URL.revokeObjectURL(url);
    toast(`${tableData.length} rows exported to ${filename}.csv`);
    DataManager.logAction('CSV Export',`${filename}.csv — ${tableData.length} rows`);
};
window.showDataExportCenter = function() {
    const exportOptions = [
        { label:'Products / SKU List', fn:()=>window.exportTableToCSV(DataManager.getProducts(),'products') },
        { label:'Purchase Orders', fn:()=>window.exportTableToCSV(DataManager.getPurchaseOrders(),'purchase_orders') },
        { label:'Dispatch Orders', fn:()=>window.exportTableToCSV(DataManager.getDispatchOrders(),'dispatch_orders') },
        { label:'Suppliers', fn:()=>window.exportTableToCSV(DataManager.getSuppliers(),'suppliers') },
        { label:'Customers', fn:()=>window.exportTableToCSV(DataManager.getCustomers(),'customers') },
        { label:'Workers', fn:()=>window.exportTableToCSV(DataManager.getWorkers(),'workers') },
        { label:'Expenses', fn:()=>window.exportTableToCSV(DataManager.getExpenses(),'expenses') },
        { label:'Audit Trail', fn:()=>window.exportTableToCSV(DataManager.getAuditTrail(),'audit_trail') },
        { label:'Alerts Log', fn:()=>window.exportTableToCSV(DataManager.getAlerts(),'alerts') },
        { label:'Customer Returns', fn:()=>window.exportTableToCSV(DataManager.getReturns(),'customer_returns') },
    ];
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Download any module's data as a CSV file that can be opened in Excel or Google Sheets.</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            ${exportOptions.map((o,i)=>`
            <button class="btn btn-outline" style="padding:14px;text-align:left;border-radius:10px;display:flex;align-items:center;gap:10px;" onclick="window._csvExportFns[${i}]()">
                <i class='bx bx-table' style="color:var(--primary-color);font-size:1.2rem;"></i>
                <div><div style="font-weight:600;">${o.label}</div><div style="font-size:0.72rem;color:var(--text-muted);">Download as .csv</div></div>
            </button>`).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:16px;width:100%;" onclick="window.downloadFullBackup&&window.downloadFullBackup()"><i class='bx bx-cloud-download'></i> Download Full Backup (JSON)</button>`;
    m('dataExportModal','Data Export Centre','bx-export',body,700);
    window._csvExportFns = exportOptions.map(o=>o.fn);
};

// ===== Unit Converter =====
window.showUnitConverter = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Weight Converter</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div><label style="font-size:0.8rem;color:var(--text-muted);">Value</label>
                    <input type="number" id="ucWeight" value="100" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" oninput="window.convertUnits()"></div>
                    <div><label style="font-size:0.8rem;color:var(--text-muted);">From</label>
                    <select id="ucFrom" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.convertUnits()">
                        <option>kg</option><option>g</option><option>lb</option><option>oz</option><option>metric ton</option><option>quintal</option>
                    </select></div>
                </div>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;" id="unitResults">
                <div style="text-align:center;color:var(--text-muted);">Enter value to convert</div>
            </div>
        </div>`;
    m('unitConvModal','Unit Converter','bx-math',body,700);
    setTimeout(window.convertUnits,100);
};
window.convertUnits = function() {
    const val = parseFloat(document.getElementById('ucWeight')?.value||0);
    const from = document.getElementById('ucFrom')?.value||'kg';
    const toKg = {'kg':1,'g':0.001,'lb':0.453592,'oz':0.0283495,'metric ton':1000,'quintal':100};
    const valInKg = val*(toKg[from]||1);
    const el = document.getElementById('unitResults');
    if(!el) return;
    el.innerHTML='<h3 style="font-size:0.9rem;margin-bottom:12px;">Conversions</h3>'+Object.entries(toKg).map(([unit,factor])=>`
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.82rem;">
        <span>${unit}</span>
        <strong style="color:${unit===from?'var(--primary-color)':'inherit'};">${+(valInKg/factor).toFixed(6)}</strong>
    </div>`).join('');
};

// ===== Currency Converter =====
window.showCurrencyConverter = function() {
    const rates = { INR:1, USD:0.012, EUR:0.011, GBP:0.0095, AED:0.044, SGD:0.016, JPY:1.81 };
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Convert</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div><label style="font-size:0.8rem;color:var(--text-muted);">Amount</label>
                    <input type="number" id="ccAmount" value="100000" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);font-size:1rem;" oninput="window.convertCurrency()"></div>
                    <div><label style="font-size:0.8rem;color:var(--text-muted);">From Currency</label>
                    <select id="ccFrom" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.convertCurrency()">
                        ${Object.keys(rates).map(c=>`<option ${c==='INR'?'selected':''}>${c}</option>`).join('')}
                    </select></div>
                    <div style="padding:12px;background:var(--info-color)10;border-radius:8px;font-size:0.75rem;color:var(--text-muted);">
                        <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Rates are indicative. Use for estimation only.
                    </div>
                </div>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;" id="currResults">
                <div style="text-align:center;color:var(--text-muted);">Enter amount to convert</div>
            </div>
        </div>`;
    m('currConvModal','Currency Converter','bx-dollar-circle',body,700);
    setTimeout(window.convertCurrency,100);
};
window.convertCurrency = function() {
    const rates={INR:1,USD:0.012,EUR:0.011,GBP:0.0095,AED:0.044,SGD:0.016,JPY:1.81};
    const amount = parseFloat(document.getElementById('ccAmount')?.value||0);
    const from = document.getElementById('ccFrom')?.value||'INR';
    const amountInINR = amount/(rates[from]||1);
    const el = document.getElementById('currResults');
    if(!el) return;
    el.innerHTML='<h3 style="font-size:0.9rem;margin-bottom:12px;">Equivalent Amounts</h3>'+Object.entries(rates).map(([cur,rate])=>`
    <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border-color);">
        <span style="font-weight:600;font-size:0.85rem;">${cur}</span>
        <strong style="color:${cur===from?'var(--primary-color)':'inherit'};">${(amountInINR*rate).toLocaleString('en-IN',{maximumFractionDigits:2})}</strong>
    </div>`).join('');
};

// ===== Product Certification Manager =====
window.showCertificationManager = function() {
    const key = 'wms_certifications';
    const certs = getData(key, [
        { product:'All Products', cert:'FSSAI License', certNo:'10014001234567', issuer:'FSSAI, India', validFrom:'01 Apr 2025', validTo:'31 Mar 2027', status:'Valid' },
        { product:'Aloo Bhujia (500g)', cert:'Agmark Certification', certNo:'AGM-2025-PUN-00892', issuer:'Directorate of Marketing', validFrom:'01 Jun 2025', validTo:'31 May 2026', status:'Renewal Due' },
        { product:'Navratna Mix', cert:'Halal Certification', certNo:'HALAL-IN-2025-0456', issuer:'Halal India Pvt. Ltd.', validFrom:'01 Mar 2025', validTo:'28 Feb 2027', status:'Valid' },
        { product:'All Products', cert:'ISO 22000:2018', certNo:'—', issuer:'Bureau Veritas', validFrom:'—', validTo:'In Progress', status:'In Progress' },
    ]);
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="toast('New certification form opened')"><i class='bx bx-plus'></i> Add Certification</button></div>
        <table class="table"><thead><tr><th>Product</th><th>Certificate</th><th>Cert. No.</th><th>Issuer</th><th>Valid To</th><th>Status</th></tr></thead>
        <tbody>${certs.map(c=>`<tr>
            <td>${c.product}</td>
            <td><strong>${c.cert}</strong></td>
            <td><code style="font-size:0.72rem;">${c.certNo}</code></td>
            <td style="font-size:0.8rem;">${c.issuer}</td>
            <td>${c.validTo}</td>
            <td><span class="badge ${c.status==='Valid'?'status-success':c.status==='In Progress'?'status-info':'status-warning'}">${c.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    m('certModal','Product Certification Manager','bx-badge',body,900);
};

// ===== Insurance Tracker =====
window.showInsuranceTracker = function() {
    const policies = [
        { type:'Property Insurance', insurer:'National Insurance', policyNo:'NIC-POL-2026-00892', premium:85000, coverage:'₹2.5 Crore', covers:'Factory building, machinery, stock', expiry:'31 Mar 2027', status:'Active' },
        { type:'Fire & Burglary', insurer:'United India Insurance', policyNo:'UIB-FB-2026-00345', premium:42000, coverage:'₹1.2 Crore', covers:'Finished goods, raw materials', expiry:'30 Sep 2026', status:'Renewal Due' },
        { type:'Vehicle Insurance', insurer:'HDFC Ergo', policyNo:'HE-VEH-2026-11230', premium:28500, coverage:'Own damage + Third Party', covers:'MH-12-AB-1234 & MH-12-GH-9012', expiry:'15 Nov 2026', status:'Active' },
        { type:'Workmen Compensation', insurer:'New India Assurance', policyNo:'NIA-WC-2026-00567', premium:18000, coverage:'As per WC Act', covers:'All 12 employees', expiry:'31 Mar 2027', status:'Active' },
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${(policies.reduce((a,p)=>a+p.premium,0)/1000).toFixed(0)}K</div><div class="stat-label">Annual Premium</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${policies.filter(p=>p.status==='Active').length}</div><div class="stat-label">Active Policies</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${policies.filter(p=>p.status==='Renewal Due').length}</div><div class="stat-label">Renewal Due</div></div>
        </div>
        <table class="table"><thead><tr><th>Type</th><th>Insurer</th><th>Policy No.</th><th>Premium</th><th>Coverage</th><th>Expiry</th><th>Status</th></tr></thead>
        <tbody>${policies.map(p=>`<tr>
            <td><strong>${p.type}</strong><br><span style="font-size:0.72rem;color:var(--text-muted);">${p.covers}</span></td>
            <td>${p.insurer}</td>
            <td><code style="font-size:0.72rem;">${p.policyNo}</code></td>
            <td>₹${p.premium.toLocaleString('en-IN')}/yr</td>
            <td>${p.coverage}</td>
            <td>${p.expiry}</td>
            <td><span class="badge ${p.status==='Active'?'status-success':'status-warning'}">${p.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    m('insuranceModal','Insurance Policy Tracker','bx-shield-quarter',body,950);
};

// ===== Internal Audit Scheduler =====
window.showAuditScheduler = function() {
    const key = 'wms_audit_schedule';
    const audits = getData(key, [
        { id:'AUDT-001', area:'Inventory & Warehousing', auditor:'Priya M.', scheduledDate:'15 Aug 2026', frequency:'Quarterly', lastAudit:'15 May 2026', status:'Scheduled', findings:'Pending' },
        { id:'AUDT-002', area:'Financial Records', auditor:'External — BDO India', scheduledDate:'01 Sep 2026', frequency:'Annual', lastAudit:'01 Sep 2025', status:'Scheduled', findings:'Pending' },
        { id:'AUDT-003', area:'Production & Quality', auditor:'Ramesh K.', scheduledDate:'10 Aug 2026', frequency:'Monthly', lastAudit:'10 Jul 2026', status:'Overdue', findings:'3 NCRs from last audit' },
        { id:'AUDT-004', area:'IT & Data Security', auditor:'Admin User', scheduledDate:'01 Oct 2026', frequency:'Annual', lastAudit:'01 Oct 2025', status:'Planned', findings:'—' },
    ]);
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="toast('New audit scheduled')"><i class='bx bx-plus'></i> Schedule Audit</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Audit Area</th><th>Auditor</th><th>Scheduled</th><th>Frequency</th><th>Last Audit</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${audits.map(a=>`<tr>
            <td><code>${a.id}</code></td>
            <td><strong>${a.area}</strong></td>
            <td>${a.auditor}</td>
            <td>${a.scheduledDate}</td>
            <td>${a.frequency}</td>
            <td>${a.lastAudit}</td>
            <td><span class="badge ${a.status==='Scheduled'?'status-success':a.status==='Overdue'?'status-danger':'status-info'}">${a.status}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="toast('${a.id} started')">Start</button></td>
        </tr>`).join('')}</tbody></table>
        ${audits.some(a=>a.status==='Overdue')?`<div style="margin-top:12px;padding:12px;background:var(--danger-color)10;border-radius:10px;font-size:0.82rem;color:var(--danger-color);"><i class='bx bx-error'></i> ${audits.filter(a=>a.status==='Overdue').length} audit(s) are overdue. Please schedule immediately.</div>`:''}`;
    m('auditSchedModal','Internal Audit Scheduler','bx-search-alt',body,950);
};

// ===== Meter Reading Tracker =====
window.showMeterReadings = function() {
    const key = 'wms_meter_readings';
    const readings = getData(key, [
        { meter:'EB Meter — Production Wing', unit:'kWh', lastReading:84250, currentReading:86450, consumption:2200, month:'Aug 2026', rate:8.5, cost:18700 },
        { meter:'EB Meter — Cold Storage', unit:'kWh', lastReading:32100, currentReading:32820, consumption:720, month:'Aug 2026', rate:8.5, cost:6120 },
        { meter:'Water Meter — Factory', unit:'KL', lastReading:1840, currentReading:1882, consumption:42, month:'Aug 2026', rate:45, cost:1890 },
        { meter:'Diesel Generator', unit:'Litres', lastReading:12450, currentReading:12530, consumption:80, month:'Aug 2026', rate:98, cost:7840 },
    ]);
    const totalCost = readings.reduce((a,r)=>a+r.cost,0);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${totalCost.toLocaleString('en-IN')}</div><div class="stat-label">Total Utility Cost (Aug)</div></div>
            <div class="stat-card"><div class="stat-number">${readings.length}</div><div class="stat-label">Meters Tracked</div></div>
        </div>
        <table class="table"><thead><tr><th>Meter</th><th>Last Reading</th><th>Current Reading</th><th>Consumption</th><th>Rate</th><th>Cost</th><th>Action</th></tr></thead>
        <tbody>${readings.map(r=>`<tr>
            <td><strong>${r.meter}</strong></td>
            <td>${r.lastReading} ${r.unit}</td>
            <td>${r.currentReading} ${r.unit}</td>
            <td><strong>${r.consumption} ${r.unit}</strong></td>
            <td>₹${r.rate}/${r.unit}</td>
            <td><strong style="color:var(--primary-color);">₹${r.cost.toLocaleString('en-IN')}</strong></td>
            <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.addMeterReading('${r.meter}')">Update Reading</button></td>
        </tr>`).join('')}</tbody></table>`;
    m('meterModal','Utility Meter Readings','bx-tachometer',body,950);
};
window.addMeterReading = function(meterName) {
    const reading = parseInt(prompt(`New reading for ${meterName}:`) || 0);
    if(!reading) return;
    const readings = getData('wms_meter_readings',[]);
    const r = readings.find(x=>x.meter===meterName);
    if(r){ r.lastReading=r.currentReading; r.currentReading=reading; r.consumption=reading-r.lastReading; r.cost=Math.round(r.consumption*r.rate); setData('wms_meter_readings',readings); }
    toast('Meter reading updated for '+meterName); document.getElementById('meterModal')?.remove(); window.showMeterReadings();
};

// =========================================================
// REGISTER ADDITIONAL KEYBOARD SHORTCUTS
// =========================================================
document.addEventListener('keydown', function(e) {
    if(e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case 'S': e.preventDefault(); window.showGlobalSearch && window.showGlobalSearch(); break;
            case 'P': e.preventDefault(); window.printCurrentPage && window.printCurrentPage(); break;
            case 'B': e.preventDefault(); window.downloadFullBackup && window.downloadFullBackup(); break;
            case 'A': e.preventDefault(); window.showDailyBriefing && window.showDailyBriefing(); break;
            case 'T': e.preventDefault(); window.showTaskBoard && window.showTaskBoard(); break;
        }
    }
    if(e.key==='?'&&!e.ctrlKey&&!e.altKey) {
        const active=document.activeElement; if(active.tagName==='INPUT'||active.tagName==='TEXTAREA') return;
        window.showKeyboardGuide && window.showKeyboardGuide();
    }
    if(e.key==='Escape') { const modals=document.querySelectorAll('[id$="Modal"]'); modals.forEach(m=>m.remove()); }
    if(e.altKey) {
        const navMap={'1':'#dashboard','2':'#inventory','3':'#purchase','4':'#dispatch','5':'#finance'};
        if(navMap[e.key]) { e.preventDefault(); window.location.hash=navMap[e.key]; toast('Navigated to '+e.key,'info'); }
    }
});

console.log('Features Part 5 loaded — Operations, Assets, Contracts, Notifications, Utilities & 20+ more features');

})(); // END IIFE
