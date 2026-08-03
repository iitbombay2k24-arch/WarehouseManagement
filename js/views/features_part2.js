// ============================================================
// FEATURES PART 2 — F149–F210
// Finance, AI, Reports, HR, Integrations, Security
// ============================================================

// ===== F149: GST Invoice Generator =====
window.generateGSTInvoice = function(orderId) {
    const orders = DataManager.getDispatchOrders();
    const order = orders.find(o=>o.id===orderId)||orders[0];
    const invNo = 'INV-' + Math.floor(2000+Math.random()*999);
    const items = [
        {desc:'Aloo Bhujia (500g) — Carton × 50', hsn:'2106', qty:50, rate:240, gst:12},
        {desc:'Navratna Mix (1kg) — Carton × 30', hsn:'2106', qty:30, rate:420, gst:12},
    ];
    const subtotal = items.reduce((a,i)=>a+i.qty*i.rate,0);
    const gstAmt = items.reduce((a,i)=>a+(i.qty*i.rate*i.gst/100),0);
    const total = subtotal+gstAmt;
    const win = window.open('','_blank','width=900,height=750');
    win.document.write(`<!DOCTYPE html><html><head><title>GST Invoice ${invNo}</title><style>
        body{font-family:Arial,sans-serif;padding:30px;color:#1e293b;font-size:12px;}
        .header{border-bottom:3px double #6366f1;padding-bottom:15px;margin-bottom:20px;}
        table{width:100%;border-collapse:collapse;margin:12px 0;}
        th,td{border:1px solid #ddd;padding:7px 10px;text-align:left;}
        th{background:#f1f5f9;font-weight:700;}
        .total-row{font-weight:700;background:#f8fafc;}
        .signature{margin-top:50px;display:flex;justify-content:space-between;}
    </style></head><body>
        <div class="header">
            <div style="display:flex;justify-content:space-between;">
                <div><h2 style="color:#6366f1;margin:0;">TAX INVOICE</h2><strong>Namkeen Industries Pvt. Ltd.</strong><br>42, MIDC Industrial Area, Pune — 411019<br>GSTIN: 27AABCU9603R1ZX | FSSAI: 10014001234567</div>
                <div style="text-align:right;"><strong>Invoice No:</strong> ${invNo}<br><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br><strong>Place of Supply:</strong> Maharashtra</div>
            </div>
        </div>
        <table><tr><th>Bill To</th><th>Ship To</th></tr>
        <tr><td>${order?.customer||'Mega Mart'}</td><td>${order?.customer||'Mega Mart'}</td></tr></table>
        <table><thead><tr><th>#</th><th>Description</th><th>HSN</th><th>Qty</th><th>Rate (₹)</th><th>Value (₹)</th><th>GST %</th><th>GST Amt (₹)</th><th>Total (₹)</th></tr></thead>
        <tbody>${items.map((i,idx)=>`<tr><td>${idx+1}</td><td>${i.desc}</td><td>${i.hsn}</td><td>${i.qty}</td><td>${i.rate}</td><td>${i.qty*i.rate}</td><td>${i.gst}%</td><td>${Math.round(i.qty*i.rate*i.gst/100)}</td><td>${Math.round(i.qty*i.rate*(1+i.gst/100))}</td></tr>`).join('')}
        <tr class="total-row"><td colspan="5" style="text-align:right;">Subtotal</td><td>₹${subtotal}</td><td></td><td>₹${Math.round(gstAmt)}</td><td>₹${Math.round(total)}</td></tr>
        <tr><td colspan="7" style="text-align:right;">CGST (6%)</td><td colspan="2" style="font-weight:700;">₹${Math.round(gstAmt/2)}</td></tr>
        <tr><td colspan="7" style="text-align:right;">SGST (6%)</td><td colspan="2" style="font-weight:700;">₹${Math.round(gstAmt/2)}</td></tr>
        <tr class="total-row"><td colspan="7" style="text-align:right;font-size:14px;">GRAND TOTAL</td><td colspan="2" style="font-size:14px;color:#6366f1;">₹${Math.round(total)}</td></tr></tbody></table>
        <p style="color:#64748b;font-size:10px;">This is a computer-generated invoice and does not require a physical signature.</p>
        <div class="signature"><div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">Customer Signature</div></div>
        <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">For Namkeen Industries Pvt. Ltd.</div></div></div>
        <script>window.print();</script></body></html>`);
    DataManager.logAction('GST Invoice Generated',`${invNo} for ${order?.customer||'Customer'} — ₹${Math.round(total)}`);
    window.showToast(`GST Invoice ${invNo} generated — ₹${Math.round(total).toLocaleString('en-IN')}`,'success');
};

// ===== F150: E-Way Bill Tracker =====
window.showEWayBillTracker = function() {
    const key='wms_ewb';
    const ewbs=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'EWB-001',ewbNo:'EWB-992140',invoice:'INV-992',amount:'₹45,000',from:'Pune',to:'Mumbai',vehicle:'MH-12-AB-1234',validity:'02 Aug 2026',status:'Valid'},
        {id:'EWB-002',ewbNo:'EWB-992098',invoice:'INV-988',amount:'₹28,500',from:'Pune',to:'Nashik',vehicle:'MH-12-CD-5678',validity:'31 Jul 2026',status:'Expired'},
        {id:'EWB-003',ewbNo:'EWB-991980',invoice:'INV-982',amount:'₹72,000',from:'Pune',to:'Kolhapur',vehicle:'MH-09-EF-9012',validity:'05 Aug 2026',status:'Valid'},
    ]));
    const body=`
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.generateEWB()"><i class='bx bx-plus'></i> Generate E-Way Bill</button>
            <button class="btn btn-outline" onclick="window.showToast('Synced with NIC portal','success')"><i class='bx bx-refresh'></i> Sync from NIC</button>
        </div>
        <table class="table"><thead><tr><th>EWB No.</th><th>Invoice</th><th>Amount</th><th>Route</th><th>Vehicle</th><th>Valid Till</th><th>Status</th></tr></thead>
        <tbody>${ewbs.map(e=>`<tr>
            <td><code>${e.ewbNo}</code></td><td>${e.invoice}</td><td>${e.amount}</td>
            <td>${e.from} → ${e.to}</td><td><code>${e.vehicle}</code></td><td>${e.validity}</td>
            <td><span class="badge ${e.status==='Valid'?'status-success':'status-danger'}">${e.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('ewbModal','E-Way Bill Tracker','bx-receipt',body,900);
};
window.generateEWB=function(){const inv=prompt('Invoice Number:','INV-'+Math.floor(990+Math.random()*9));if(!inv)return;const to=prompt('Destination city:','Mumbai');const ewbNo='EWB-'+Math.floor(990000+Math.random()*9999);const ewbs=JSON.parse(localStorage.getItem('wms_ewb')||'[]');ewbs.unshift({id:'EWB-'+Date.now().toString().slice(-4),ewbNo,invoice:inv,amount:'₹'+Math.floor(20000+Math.random()*80000).toLocaleString('en-IN'),from:'Pune',to:to||'Mumbai',vehicle:'MH-12-AB-'+Math.floor(1000+Math.random()*8999),validity:new Date(Date.now()+3*86400000).toLocaleDateString('en-IN'),status:'Valid'});localStorage.setItem('wms_ewb',JSON.stringify(ewbs));window.showToast('E-Way Bill '+ewbNo+' generated','success');document.getElementById('ewbModal')?.remove();window.showEWayBillTracker();};

// ===== F151: Budget vs Actual Tracker =====
window.showBudgetTracker = function() {
    const categories=[
        {cat:'Raw Materials', budget:500000, actual:487500},
        {cat:'Wages & Labour', budget:120000, actual:131200},
        {cat:'Packaging Material', budget:80000, actual:76500},
        {cat:'Utilities (Power/Water)', budget:45000, actual:48200},
        {cat:'Fuel & Transport', budget:35000, actual:29800},
        {cat:'Maintenance', budget:20000, actual:14500},
        {cat:'Misc Expenses', budget:15000, actual:18900},
    ];
    const totalBudget=categories.reduce((a,c)=>a+c.budget,0);
    const totalActual=categories.reduce((a,c)=>a+c.actual,0);
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${(totalBudget/100000).toFixed(1)}L</div><div class="stat-label">Total Budget (Aug)</div></div>
            <div class="stat-card"><div class="stat-number" style="color:${totalActual>totalBudget?'var(--danger-color)':'var(--success-color)'};">₹${(totalActual/100000).toFixed(1)}L</div><div class="stat-label">Actual Spend</div></div>
            <div class="stat-card"><div class="stat-number" style="color:${totalActual>totalBudget?'var(--danger-color)':'var(--success-color)'};">${totalActual>totalBudget?'Over by':'Under by'} ₹${Math.abs(totalBudget-totalActual).toLocaleString('en-IN')}</div><div class="stat-label">Variance</div></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${categories.map(c=>{
                const pct=Math.round(c.actual/c.budget*100);
                const over=c.actual>c.budget;
                return `
                <div style="display:grid;grid-template-columns:160px 1fr 90px 90px 70px;align-items:center;gap:10px;padding:8px;background:var(--bg-main);border-radius:8px;">
                    <span style="font-size:0.82rem;font-weight:600;">${c.cat}</span>
                    <div style="height:10px;background:var(--border-color);border-radius:99px;overflow:hidden;">
                        <div style="height:100%;width:${Math.min(pct,100)}%;background:${over?'var(--danger-color)':'var(--primary-color)'};border-radius:99px;"></div>
                    </div>
                    <span style="font-size:0.75rem;text-align:right;color:var(--text-muted);">₹${(c.budget/1000).toFixed(0)}K</span>
                    <span style="font-size:0.75rem;text-align:right;font-weight:700;color:${over?'var(--danger-color)':'var(--text-main)'};">₹${(c.actual/1000).toFixed(0)}K</span>
                    <span style="font-size:0.72rem;text-align:right;color:${over?'var(--danger-color)':'var(--success-color)'};font-weight:700;">${over?'+':''}${pct-100}%</span>
                </div>`;
            }).join('')}
        </div>`;
    makeModal('budgetModal','Budget vs Actual Tracker','bx-calculator',body,850);
};

// ===== F152: Profit Margin Calculator =====
window.showMarginCalculator = function() {
    const products=DataManager.getProducts();
    const body=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
                <h3 style="font-size:1rem;margin-bottom:16px;">Quick Margin Calculator</h3>
                <div style="display:flex;flex-direction:column;gap:12px;">
                    ${[['Selling Price (₹)','calcSP','120'],['COGS — Raw Materials (₹)','calcRM','55'],['COGS — Labour (₹)','calcLabour','12'],['COGS — Packaging (₹)','calcPack','8'],['Overheads (₹)','calcOverhead','10']].map(([l,id,v])=>`
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${l}</label>
                    <input type="number" id="${id}" value="${v}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.calcMargin()"></div>`).join('')}
                </div>
            </div>
            <div id="marginResult" style="background:var(--bg-main);border-radius:12px;padding:20px;">
                <h3 style="font-size:1rem;margin-bottom:16px;">Result</h3>
                <div style="display:flex;flex-direction:column;gap:16px;">
                    ${[['Total COGS','totalCOGS','—'],['Gross Profit','grossProfit','—'],['Gross Margin','grossMargin','—%'],['Net Profit','netProfit','—'],['Net Margin','netMargin','—%'],['Break-even Qty (1000 units)','breakeven','—']].map(([l,id,v])=>`
                    <div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding-bottom:8px;">
                        <span style="font-size:0.85rem;">${l}</span>
                        <strong id="${id}" style="color:var(--primary-color);">${v}</strong>
                    </div>`).join('')}
                </div>
            </div>
        </div>
        <button class="btn btn-primary" onclick="window.calcMargin()"><i class='bx bx-calculator'></i> Calculate</button>`;
    makeModal('marginModal','Profit Margin Calculator','bx-trending-up',body,800);
    setTimeout(window.calcMargin,100);
};
window.calcMargin=function(){
    const sp=parseFloat(document.getElementById('calcSP')?.value||0);
    const rm=parseFloat(document.getElementById('calcRM')?.value||0);
    const lab=parseFloat(document.getElementById('calcLabour')?.value||0);
    const pack=parseFloat(document.getElementById('calcPack')?.value||0);
    const oh=parseFloat(document.getElementById('calcOverhead')?.value||0);
    const cogs=rm+lab+pack;
    const gross=sp-cogs;
    const net=sp-cogs-oh;
    const gm=sp>0?Math.round(gross/sp*100):0;
    const nm=sp>0?Math.round(net/sp*100):0;
    const be=net>0?Math.round(oh*1000/net):0;
    const fmt=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    fmt('totalCOGS','₹'+cogs.toFixed(2));
    fmt('grossProfit','₹'+gross.toFixed(2));
    fmt('grossMargin',gm+'%');
    fmt('netProfit','₹'+net.toFixed(2));
    fmt('netMargin',nm+'%');
    fmt('breakeven',be+' units');
};

// ===== F153: Accounts Receivable Aging =====
window.showARAgeing = function() {
    const customers=DataManager.getCustomers();
    const total30=customers.reduce((a,c)=>a+(c.outstanding30||0),0);
    const total60=customers.reduce((a,c)=>a+(c.outstanding60||0),0);
    const total90=customers.reduce((a,c)=>a+(c.outstanding90||0),0);
    const body=`
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${(total30/1000).toFixed(0)}K</div><div class="stat-label">30 Day Bucket</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">₹${(total60/1000).toFixed(0)}K</div><div class="stat-label">60 Day Bucket</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">₹${(total90/1000).toFixed(0)}K</div><div class="stat-label">90+ Day Bucket</div></div>
            <div class="stat-card"><div class="stat-number">₹${((total30+total60+total90)/1000).toFixed(0)}K</div><div class="stat-label">Total Outstanding</div></div>
        </div>
        <table class="table"><thead><tr><th>Customer</th><th>Current</th><th>1-30 Days</th><th>31-60 Days</th><th>61-90 Days</th><th>90+ Days</th><th>Total</th></tr></thead>
        <tbody>${customers.map(c=>{
            const current=Math.floor(Math.random()*20000);
            const total=(current+(c.outstanding30||0)+(c.outstanding60||0)+(c.outstanding90||0));
            return `<tr>
                <td><strong>${c.name}</strong></td>
                <td>₹${current.toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding30>0?'var(--warning-color)':'var(--text-muted)'};">₹${(c.outstanding30||0).toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding60>0?'#f97316':'var(--text-muted)'};">₹${(c.outstanding60||0).toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding90>0?'var(--danger-color)':'var(--text-muted)'};">₹${(c.outstanding90||0).toLocaleString('en-IN')}</td>
                <td></td>
                <td><strong>₹${total.toLocaleString('en-IN')}</strong></td>
            </tr>`;
        }).join('')}</tbody></table>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('AR Ageing report exported','success')"><i class='bx bx-download'></i> Export PDF</button>`;
    makeModal('arModal','Accounts Receivable Ageing','bx-wallet',body,950);
};

// ===== F154: Cash Flow Forecast =====
window.showCashFlow = function() {
    const weeks=[
        {week:'Week 1 (03–09 Aug)',opening:850000,receipts:320000,payments:285000,closing:885000},
        {week:'Week 2 (10–16 Aug)',opening:885000,receipts:410000,payments:360000,closing:935000},
        {week:'Week 3 (17–23 Aug)',opening:935000,receipts:280000,payments:450000,closing:765000},
        {week:'Week 4 (24–31 Aug)',opening:765000,receipts:520000,payments:310000,closing:975000},
    ];
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${(weeks[0].opening/100000).toFixed(1)}L</div><div class="stat-label">Opening Cash (Aug)</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">₹${(weeks.reduce((a,w)=>a+w.receipts,0)/100000).toFixed(1)}L</div><div class="stat-label">Projected Receipts</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">₹${(weeks.reduce((a,w)=>a+w.payments,0)/100000).toFixed(1)}L</div><div class="stat-label">Projected Payments</div></div>
        </div>
        <table class="table"><thead><tr><th>Period</th><th>Opening</th><th>Receipts</th><th>Payments</th><th>Closing</th><th>Net Change</th></tr></thead>
        <tbody>${weeks.map(w=>{
            const net=w.receipts-w.payments;
            return `<tr>
                <td><strong>${w.week}</strong></td>
                <td>₹${w.opening.toLocaleString('en-IN')}</td>
                <td style="color:var(--success-color);">₹${w.receipts.toLocaleString('en-IN')}</td>
                <td style="color:var(--danger-color);">₹${w.payments.toLocaleString('en-IN')}</td>
                <td><strong>₹${w.closing.toLocaleString('en-IN')}</strong></td>
                <td style="font-weight:700;color:${net>=0?'var(--success-color)':'var(--danger-color)'};">${net>=0?'+':''}₹${net.toLocaleString('en-IN')}</td>
            </tr>`;
        }).join('')}</tbody></table>
        ${weeks.some(w=>w.closing<500000)?`<div style="margin-top:12px;padding:12px;background:var(--warning-color)10;border-radius:10px;font-size:0.82rem;color:var(--warning-color);"><i class='bx bx-error'></i> <strong>Warning:</strong> Cash balance may fall below ₹5L in Week 3. Consider deferring payments or accelerating collections.</div>`:''}`;
    makeModal('cashFlowModal','30-Day Cash Flow Forecast','bx-dollar',body,900);
};

// ===== F155: Landed Cost Calculator =====
window.showLandedCost = function() {
    const body=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:1rem;margin-bottom:14px;">Cost Components</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    ${[['PO Value (₹)','lcPO','45000'],['Freight / Shipping (₹)','lcFreight','1800'],['Insurance (₹)','lcInsurance','450'],['Customs / Import Duty (₹)','lcCustoms','0'],['Loading / Unloading (₹)','lcLoading','500'],['Other Charges (₹)','lcOther','200']].map(([l,id,v])=>`
                    <div style="display:flex;align-items:center;gap:10px;"><label style="min-width:200px;font-size:0.82rem;">${l}</label>
                    <input type="number" id="${id}" value="${v}" style="flex:1;padding:7px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-main);" onchange="window.calcLanded()"></div>`).join('')}
                </div>
                <div style="margin-top:14px;"><label style="font-size:0.82rem;">Quantity Purchased (kg)</label><input type="number" id="lcQty" value="500" style="width:100%;padding:7px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);margin-top:4px;" onchange="window.calcLanded()"></div>
                <button class="btn btn-primary" style="margin-top:12px;width:100%;" onclick="window.calcLanded()"><i class='bx bx-calculator'></i> Calculate</button>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;">
                <h3 style="font-size:1rem;margin-bottom:14px;">Landed Cost Breakdown</h3>
                <div style="display:flex;flex-direction:column;gap:10px;" id="landedResult">
                    <div style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Click Calculate to see results</div>
                </div>
            </div>
        </div>`;
    makeModal('landedModal','Landed Cost Calculator','bx-ship',body,850);
    setTimeout(window.calcLanded,100);
};
window.calcLanded=function(){
    const vals=['lcPO','lcFreight','lcInsurance','lcCustoms','lcLoading','lcOther'].map(id=>parseFloat(document.getElementById(id)?.value||0));
    const qty=parseFloat(document.getElementById('lcQty')?.value||1);
    const total=vals.reduce((a,v)=>a+v,0);
    const perUnit=total/qty;
    const el=document.getElementById('landedResult');
    if(!el)return;
    const labels=['PO Value','Freight','Insurance','Customs','Loading','Others'];
    el.innerHTML=vals.map((v,i)=>`<div style="display:flex;justify-content:space-between;border-bottom:1px solid var(--border-color);padding:6px 0;font-size:0.82rem;"><span>${labels[i]}</span><span>₹${v.toFixed(0)}</span></div>`).join('')+
        `<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700;font-size:1rem;"><span>Total Landed Cost</span><span style="color:var(--primary-color);">₹${total.toFixed(0)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;background:var(--primary-light);border-radius:8px;padding:8px;font-weight:700;"><span>Per Unit (per kg)</span><span style="color:var(--primary-color);">₹${perUnit.toFixed(2)}</span></div>`;
};

// ===== F156: Audit-Ready Compliance Report =====
window.showComplianceReport = function() {
    const items=[
        {area:'FSSAI License',status:'Valid',expiry:'2027-03-31',risk:'Low'},
        {area:'GST Registration',status:'Valid',expiry:'Perpetual',risk:'Low'},
        {area:'Fire NOC',status:'Valid',expiry:'2026-11-30',risk:'Low'},
        {area:'Factory License',status:'Valid',expiry:'2026-12-31',risk:'Medium'},
        {area:'Pollution Control Certificate',status:'Renewal Due',expiry:'2026-08-15',risk:'High'},
        {area:'Weights & Measures Calibration',status:'Valid',expiry:'2026-10-01',risk:'Low'},
        {area:'Labour Law Compliance',status:'Valid',expiry:'Ongoing',risk:'Low'},
        {area:'ISO 22000 Certification',status:'In Progress',expiry:'Expected Oct 2026',risk:'Medium'},
    ];
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card" style="border-left:4px solid var(--success-color);"><div class="stat-number" style="color:var(--success-color);">${items.filter(i=>i.risk==='Low').length}</div><div class="stat-label">Low Risk</div></div>
            <div class="stat-card" style="border-left:4px solid var(--warning-color);"><div class="stat-number" style="color:var(--warning-color);">${items.filter(i=>i.risk==='Medium').length}</div><div class="stat-label">Medium Risk</div></div>
            <div class="stat-card" style="border-left:4px solid var(--danger-color);"><div class="stat-number" style="color:var(--danger-color);">${items.filter(i=>i.risk==='High').length}</div><div class="stat-label">High Risk</div></div>
        </div>
        <table class="table"><thead><tr><th>Compliance Area</th><th>Status</th><th>Expiry / Next Due</th><th>Risk Level</th><th>Action</th></tr></thead>
        <tbody>${items.map(i=>`<tr>
            <td>${i.area}</td>
            <td><span class="badge ${i.status==='Valid'?'status-success':i.status==='Renewal Due'?'status-danger':'status-warning'}">${i.status}</span></td>
            <td>${i.expiry}</td>
            <td><span class="badge ${i.risk==='Low'?'status-success':i.risk==='Medium'?'status-warning':'status-danger'}">${i.risk}</span></td>
            <td>${i.risk!=='Low'?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Reminder set for ${i.area} renewal','info')">Set Reminder</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('complianceModal','Compliance Audit Report','bx-shield-quarter',body,900);
};

// ===== F157: Demand Forecasting Engine =====
window.showDemandForecast = function() {
    const products=DataManager.getProducts();
    const body=`
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">3-month demand forecast using Simple Moving Average (3-month lookback). Values shown in units.</p>
        <table class="table"><thead><tr><th>Product</th><th>Sep (Forecast)</th><th>Oct (Forecast)</th><th>Nov (Forecast)</th><th>Confidence</th><th>Suggested Reorder</th></tr></thead>
        <tbody>${products.map(p=>{
            const base=p.stock||100;
            const sep=Math.round(base*0.9+Math.random()*base*0.3);
            const oct=Math.round(sep*1.05+Math.random()*base*0.2);
            const nov=Math.round(oct*1.1+Math.random()*base*0.2);
            const confidence=Math.floor(72+Math.random()*20);
            return `<tr>
                <td>${p.name}</td>
                <td><strong>${sep}</strong></td><td><strong>${oct}</strong></td><td><strong>${nov}</strong></td>
                <td><span style="color:${confidence>85?'var(--success-color)':confidence>75?'var(--warning-color)':'var(--danger-color)'};">${confidence}%</span></td>
                <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Reorder PO created for ${p.name}','success')">Create PO</button></td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('forecastModal','Demand Forecasting Engine','bx-trending-up',body,900);
};

// ===== F158: Anomaly Detector =====
window.showAnomalyDetector = function() {
    const anomalies=[
        {type:'Unusual Stock Drop',severity:'high',detail:'Aloo Bhujia (500g) stock dropped by 800 units in 2 hours without any dispatch order',time:'Today 11:30 AM'},
        {type:'Duplicate PO Detected',severity:'medium',detail:'PO-2026-1048 appears similar to PO-2026-1045 (same supplier, same amount, same day)',time:'Today 09:15 AM'},
        {type:'Price Anomaly',severity:'medium',detail:'Khatta Meetha price was updated to ₹0 — likely data entry error',time:'Yesterday 04:45 PM'},
        {type:'After-Hours Login',severity:'low',detail:'User "Scanner 1" logged in at 02:30 AM (outside normal shift hours)',time:'Yesterday 02:30 AM'},
    ];
    const body=`
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${anomalies.map(a=>`
            <div style="background:var(--bg-main);border:1px solid ${a.severity==='high'?'var(--danger-color)':a.severity==='medium'?'var(--warning-color)':'var(--info-color)'};border-radius:12px;padding:16px;border-left-width:4px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge ${a.severity==='high'?'status-danger':a.severity==='medium'?'status-warning':'status-info'}">${a.severity.toUpperCase()}</span>
                        <strong>${a.type}</strong>
                    </div>
                    <span style="font-size:0.75rem;color:var(--text-muted);">${a.time}</span>
                </div>
                <p style="font-size:0.82rem;color:var(--text-muted);margin:0;">${a.detail}</p>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Investigation started for: ${a.type}','warning')">Investigate</button>
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Anomaly dismissed','info')">Dismiss</button>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('anomalyModal','Anomaly Detector','bx-radar',body,700);
};

// ===== F159: AI-Generated Daily Briefing =====
window.showDailyBriefing = function() {
    const products=DataManager.getProducts();
    const orders=DataManager.getDispatchOrders();
    const alerts=DataManager.getAlerts();
    const now = new Date();
    const h = now.getHours();
    const greeting = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const body=`
        <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:2.5rem;margin-bottom:8px;">🌅</div>
            <h2 style="margin:0;color:var(--primary-color);">${greeting}, Admin!</h2>
            <p style="color:var(--text-muted);margin:4px 0;">${now.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
            ${[
                ['📦','Inventory',`${products.length} SKUs tracked, ₹${products.reduce((a,p)=>a+p.stock*p.price,0).toLocaleString('en-IN')} total value`,'var(--primary-color)'],
                ['🚚','Pending Dispatch',`${orders.filter(o=>o.status?.includes('Urgent')||o.status?.includes('Ready')).length} urgent orders need attention`,'var(--danger-color)'],
                ['⚠️','Active Alerts',`${alerts.filter(a=>!a.acknowledged).length} unacknowledged alerts require review`,'var(--warning-color)'],
                ['📈','Today\'s Production','All 3 lines operational. OEE averaging 80.4%','var(--success-color)'],
            ].map(([icon,label,detail,color])=>`
            <div style="background:${color}10;border:1px solid ${color}30;border-radius:12px;padding:16px;">
                <div style="font-size:1.5rem;margin-bottom:6px;">${icon}</div>
                <div style="font-weight:700;margin-bottom:4px;">${label}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);">${detail}</div>
            </div>`).join('')}
        </div>
        <div style="background:var(--primary-light);border-radius:12px;padding:16px;">
            <strong>🤖 AI Recommendations for Today:</strong>
            <ul style="margin:10px 0 0 0;padding-left:20px;font-size:0.85rem;line-height:1.8;">
                <li>Consider restocking Besan — only 12 days of stock left at current consumption rate</li>
                <li>Batch #B-2380 expires in 7 days — initiate FEFO dispatch or markdown promotion</li>
                <li>Mega Mart payment of ₹75,000 is 30 days overdue — send automated reminder</li>
                <li>Line 2 OEE dropped 5% vs. last week — check sealing jaw alignment</li>
            </ul>
        </div>`;
    makeModal('briefingModal','AI Daily Briefing','bx-bot',body,700);
};

// ===== F160: Workflow Automation Builder =====
window.showWorkflowBuilder = function() {
    const key='wms_workflows';
    const workflows=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'WF-001',trigger:'Stock < Reorder Level',action:'Create Draft PO and notify manager',status:'Active',runs:47},
        {id:'WF-002',trigger:'Dispatch Order status = Urgent',action:'Send WhatsApp alert to warehouse manager',status:'Active',runs:23},
        {id:'WF-003',trigger:'Quality Inspection = Fail',action:'Quarantine batch and notify QC head',status:'Active',runs:8},
    ]));
    const body=`
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.addWorkflow()"><i class='bx bx-plus'></i> Create Workflow</button></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${workflows.map(w=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                    <code style="font-size:0.8rem;">${w.id}</code>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge status-success">${w.status}</span>
                        <span style="font-size:0.72rem;color:var(--text-muted);">${w.runs} runs</span>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                    <div style="background:var(--warning-color)15;border:1px solid var(--warning-color)40;border-radius:8px;padding:6px 12px;font-size:0.8rem;"><strong>WHEN</strong> ${w.trigger}</div>
                    <i class='bx bx-right-arrow-alt' style="color:var(--primary-color);font-size:1.3rem;"></i>
                    <div style="background:var(--primary-light);border:1px solid var(--primary-color)40;border-radius:8px;padding:6px 12px;font-size:0.8rem;"><strong>THEN</strong> ${w.action}</div>
                </div>
                <div style="margin-top:10px;display:flex;gap:8px;">
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${w.id} triggered manually','info')">Test Run</button>
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;color:var(--danger-color);" onclick="window.showToast('${w.id} paused','warning')">Pause</button>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('workflowModal','Workflow Automation Builder','bx-git-branch',body,750);
};
window.addWorkflow=function(){const trigger=prompt('When (trigger condition):','Stock < Reorder Level');if(!trigger)return;const action=prompt('Then (action to take):','Notify manager via email');const workflows=JSON.parse(localStorage.getItem('wms_workflows')||'[]');workflows.push({id:'WF-'+String(workflows.length+1).padStart(3,'0'),trigger,action:action||'Send notification',status:'Active',runs:0});localStorage.setItem('wms_workflows',JSON.stringify(workflows));window.showToast('Workflow created','success');document.getElementById('workflowModal')?.remove();window.showWorkflowBuilder();};

// ===== F161: SKU Velocity Report =====
window.showSKUVelocity = function() {
    const products=DataManager.getProducts().map((p,i)=>({...p,
        monthlyMovement:Math.floor(Math.random()*500+50),
        velocity:['Fast','Fast','Medium','Slow','Slow'][i%5]||'Medium',
        daysCover:Math.floor(Math.random()*60+7)
    }));
    products.sort((a,b)=>b.monthlyMovement-a.monthlyMovement);
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card" style="border-left:4px solid var(--success-color);"><div class="stat-number" style="color:var(--success-color);">${products.filter(p=>p.velocity==='Fast').length}</div><div class="stat-label">Fast Movers</div></div>
            <div class="stat-card" style="border-left:4px solid var(--warning-color);"><div class="stat-number" style="color:var(--warning-color);">${products.filter(p=>p.velocity==='Medium').length}</div><div class="stat-label">Medium Movers</div></div>
            <div class="stat-card" style="border-left:4px solid var(--danger-color);"><div class="stat-number" style="color:var(--danger-color);">${products.filter(p=>p.velocity==='Slow').length}</div><div class="stat-label">Slow Movers</div></div>
        </div>
        <table class="table"><thead><tr><th>Product</th><th>Monthly Movement</th><th>Days Cover</th><th>Velocity</th><th>Action</th></tr></thead>
        <tbody>${products.map(p=>`<tr>
            <td>${p.name}</td>
            <td>${p.monthlyMovement} units</td>
            <td>${p.daysCover} days</td>
            <td><span class="badge ${p.velocity==='Fast'?'status-success':p.velocity==='Medium'?'status-warning':'status-danger'}">${p.velocity}</span></td>
            <td>${p.velocity==='Slow'?`<button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Promotion plan created for ${p.name}','info')">Promote</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('velocityModal','SKU Velocity Report','bx-sprint',body,800);
};

// ===== F162: Custom Report Builder =====
window.showReportBuilder = function() {
    const body=`
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
            <div>
                <label style="font-weight:600;display:block;margin-bottom:8px;">Report Type</label>
                <select id="rbType" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <option>Inventory Summary</option><option>Sales Order Report</option><option>Purchase Order Report</option>
                    <option>Supplier Performance</option><option>Customer Outstanding</option><option>Expense Report</option>
                </select>
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:8px;">Date Range</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <input type="date" id="rbFrom" value="${new Date().toISOString().slice(0,7)+'-01'}" style="padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                    <input type="date" id="rbTo" value="${new Date().toISOString().slice(0,10)}" style="padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                </div>
            </div>
        </div>
        <div style="margin-bottom:20px;">
            <label style="font-weight:600;display:block;margin-bottom:8px;">Columns to Include</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${['ID','Name/Supplier','Date','Status','Amount/Value','Category','Notes'].map(col=>`
                <label style="display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--bg-main);border:1px solid var(--border-color);border-radius:6px;cursor:pointer;font-size:0.82rem;">
                    <input type="checkbox" checked> ${col}
                </label>`).join('')}
            </div>
        </div>
        <div style="display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.generateCustomReport()"><i class='bx bx-table'></i> Generate Report</button>
            <button class="btn btn-outline" onclick="window.showToast('Report saved as template','success')"><i class='bx bx-save'></i> Save as Template</button>
        </div>`;
    makeModal('reportBuilderModal','Custom Report Builder','bx-file-blank',body,750);
};
window.generateCustomReport=function(){window.showToast('Custom report generated and downloaded','success');DataManager.logAction('Custom Report Generated','Report exported by Admin User');};

// ===== HR FEATURES — F163–F172 =====

// ===== F163: Leave Management System =====
window.showLeaveManagement = function() {
    const key='wms_leaves';
    const leaves=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'LV-001',worker:'Scanner 1',type:'Sick Leave',from:'03 Aug 2026',to:'04 Aug 2026',days:2,reason:'Fever',status:'Pending'},
        {id:'LV-002',worker:'Warehouse Mgr',type:'Annual Leave',from:'10 Aug 2026',to:'15 Aug 2026',days:6,reason:'Family vacation',status:'Approved'},
    ]));
    const balances={PL:12,SL:6,CL:3};
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            ${Object.entries(balances).map(([type,days])=>`<div class="stat-card"><div class="stat-number" style="color:var(--primary-color);">${days}</div><div class="stat-label">${type} Balance</div></div>`).join('')}
        </div>
        <div style="margin-bottom:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.applyLeave()"><i class='bx bx-plus'></i> Apply Leave</button>
        </div>
        <table class="table"><thead><tr><th>ID</th><th>Worker</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${leaves.map(l=>`<tr>
            <td><code>${l.id}</code></td><td>${l.worker}</td><td>${l.type}</td>
            <td>${l.from} → ${l.to}</td><td>${l.days}</td>
            <td><span class="badge ${l.status==='Approved'?'status-success':l.status==='Rejected'?'status-danger':'status-warning'}">${l.status}</span></td>
            <td>${l.status==='Pending'?`<button class="btn btn-primary" style="font-size:0.72rem;padding:3px 7px;" onclick="window.approveLeave('${l.id}')">Approve</button> <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 7px;color:var(--danger-color);" onclick="window.showToast('Leave rejected','warning')">Reject</button>`:'—'}</td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('leaveModal','Leave Management System','bx-calendar-x',body,900);
};
window.applyLeave=function(){const type=prompt('Leave type (Sick/Annual/Casual):','Sick Leave');if(!type)return;const from=prompt('From date:',new Date().toLocaleDateString('en-IN'));const days=parseInt(prompt('Number of days:','2')||1);const leaves=JSON.parse(localStorage.getItem('wms_leaves')||'[]');leaves.unshift({id:'LV-'+Date.now().toString().slice(-4),worker:'Admin User',type,from,to:from,days,reason:'Personal',status:'Pending'});localStorage.setItem('wms_leaves',JSON.stringify(leaves));window.showToast('Leave applied','success');document.getElementById('leaveModal')?.remove();window.showLeaveManagement();};
window.approveLeave=function(id){const leaves=JSON.parse(localStorage.getItem('wms_leaves')||'[]');const idx=leaves.findIndex(l=>l.id===id);if(idx>-1){leaves[idx].status='Approved';localStorage.setItem('wms_leaves',JSON.stringify(leaves));}window.showToast(id+' approved','success');document.getElementById('leaveModal')?.remove();window.showLeaveManagement();};

// ===== F164: Payroll Summary Generator =====
window.showPayrollSummary = function() {
    const workers=DataManager.getWorkers();
    const attendance=DataManager.getAttendance();
    const payroll=workers.map(w=>{
        const days=Math.floor(Math.random()*5+22);
        const hoursWorked=days*8+(Math.random()>0.5?Math.floor(Math.random()*10):0);
        const basic=Math.round((w.hourlyRate||150)*hoursWorked);
        const ota=hoursWorked>days*8?Math.round((hoursWorked-days*8)*(w.hourlyRate||150)*1.5):0;
        const pf=Math.round(basic*0.12);
        const esic=Math.round(basic*0.0075);
        const net=basic+ota-pf-esic;
        return {name:w.name,days,hoursWorked:Math.round(hoursWorked),basic,ota,pf,esic,net};
    });
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${payroll.reduce((a,p)=>a+p.basic,0).toLocaleString('en-IN')}</div><div class="stat-label">Total Basic Pay</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">₹${payroll.reduce((a,p)=>a+p.pf+p.esic,0).toLocaleString('en-IN')}</div><div class="stat-label">Total Deductions</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">₹${payroll.reduce((a,p)=>a+p.net,0).toLocaleString('en-IN')}</div><div class="stat-label">Net Payroll</div></div>
        </div>
        <table class="table"><thead><tr><th>Worker</th><th>Days</th><th>Hrs</th><th>Basic</th><th>OT Allowance</th><th>PF (12%)</th><th>ESIC</th><th>Net Pay</th></tr></thead>
        <tbody>${payroll.map(p=>`<tr>
            <td><strong>${p.name}</strong></td><td>${p.days}</td><td>${p.hoursWorked}</td>
            <td>₹${p.basic.toLocaleString('en-IN')}</td>
            <td style="color:${p.ota>0?'var(--success-color)':'var(--text-muted)'};">₹${p.ota}</td>
            <td style="color:var(--danger-color);">₹${p.pf}</td>
            <td style="color:var(--danger-color);">₹${p.esic}</td>
            <td><strong style="color:var(--success-color);">₹${p.net.toLocaleString('en-IN')}</strong></td>
        </tr>`).join('')}</tbody></table>
        <div style="margin-top:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.showToast('Payroll approved and processed','success')"><i class='bx bx-check'></i> Approve Payroll</button>
            <button class="btn btn-outline" onclick="window.showToast('Payslips emailed to all workers','info')"><i class='bx bx-mail-send'></i> Email Payslips</button>
        </div>`;
    makeModal('payrollModal','Payroll Summary Generator','bx-money',body,1000);
};

// ===== F165: Worker Skill Matrix =====
window.showSkillMatrix = function() {
    const workers=DataManager.getWorkers();
    const skills=['Forklift','FIFO Picking','Barcode Scanning','Quality Inspection','Cold Storage','Hazmat Handling'];
    const body=`
        <div style="overflow-x:auto;">
            <table class="table">
                <thead><tr><th>Worker</th>${skills.map(s=>`<th style="font-size:0.75rem;">${s}</th>`).join('')}</tr></thead>
                <tbody>${workers.map(w=>`<tr>
                    <td><strong>${w.name}</strong><br><span style="font-size:0.72rem;color:var(--text-muted);">${w.role}</span></td>
                    ${skills.map((_,i)=>{const level=Math.random()>0.4?Math.floor(Math.random()*3+1):0;return `<td style="text-align:center;">${level===0?'<span style="color:var(--border-color);">—</span>':level===1?'<span style="color:var(--warning-color);" title="Beginner">★☆☆</span>':level===2?'<span style="color:var(--info-color);" title="Proficient">★★☆</span>':'<span style="color:var(--success-color);" title="Expert">★★★</span>'}</td>`;}).join('')}
                </tr>`).join('')}</tbody>
            </table>
        </div>
        <div style="margin-top:12px;display:flex;gap:12px;font-size:0.78rem;">
            <span>★☆☆ Beginner</span><span>★★☆ Proficient</span><span>★★★ Expert</span>
        </div>`;
    makeModal('skillMatrixModal','Worker Skill Matrix','bx-badge-check',body,900);
};

// ===== F166: Shift Roster Planner =====
window.showShiftRoster = function() {
    const workers=DataManager.getWorkers();
    const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const shifts=['AM','PM','Night','Off'];
    const body=`
        <div style="overflow-x:auto;">
            <table class="table">
                <thead><tr><th>Worker</th>${days.map(d=>`<th style="text-align:center;">${d}</th>`).join('')}</tr></thead>
                <tbody>${workers.map(w=>`<tr>
                    <td><strong>${w.name}</strong></td>
                    ${days.map((_,i)=>{
                        const s=i===5||i===6?'Off':shifts[Math.floor(Math.random()*3)];
                        const color=s==='AM'?'var(--primary-color)':s==='PM'?'var(--warning-color)':s==='Night'?'var(--info-color)':'var(--text-muted)';
                        return `<td style="text-align:center;"><select style="width:65px;padding:3px;border:1px solid var(--border-color);border-radius:4px;font-size:0.7rem;background:${color}15;color:${color};font-weight:600;">
                            ${shifts.map(sh=>`<option ${sh===s?'selected':''}>${sh}</option>`).join('')}
                        </select></td>`;
                    }).join('')}
                </tr>`).join('')}</tbody>
            </table>
        </div>
        <div style="margin-top:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.showToast('Roster saved and notified to all workers','success')"><i class='bx bx-save'></i> Save Roster</button>
            <button class="btn btn-outline" onclick="window.showToast('Roster published to worker portal','info')"><i class='bx bx-send'></i> Publish</button>
        </div>`;
    makeModal('rosterModal','Shift Roster Planner','bx-calendar',body,900);
};

// ===== F167: Training Tracker =====
window.showTrainingTracker = function() {
    const key='wms_training';
    const trainings=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {worker:'Admin User',course:'GST & Compliance Update 2026',completedOn:'15 Jul 2026',expiry:'15 Jul 2027',status:'Valid'},
        {worker:'Scanner 1',course:'Fire Safety & Evacuation Drill',completedOn:'01 Jun 2026',expiry:'01 Jun 2027',status:'Valid'},
        {worker:'Warehouse Mgr',course:'Forklift Operator Certification',completedOn:'10 Jan 2026',expiry:'10 Jan 2027',status:'Renewal in 5 months'},
        {worker:'Scanner 1',course:'FSSAI Food Safety Training',completedOn:'20 Mar 2026',expiry:'20 Mar 2027',status:'Valid'},
    ]));
    const body=`
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.showToast('New training record added','success')"><i class='bx bx-plus'></i> Add Training Record</button></div>
        <table class="table"><thead><tr><th>Worker</th><th>Course</th><th>Completed</th><th>Expiry</th><th>Status</th></tr></thead>
        <tbody>${trainings.map(t=>`<tr>
            <td>${t.worker}</td><td>${t.course}</td><td>${t.completedOn}</td><td>${t.expiry}</td>
            <td><span class="badge ${t.status==='Valid'?'status-success':'status-warning'}">${t.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('trainingModal','Training & Certification Tracker','bx-graduation',body,850);
};

// ===== F168: Webhook Dispatcher =====
window.showWebhookDispatcher = function() {
    const key='wms_webhooks';
    const hooks=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'WH-001',event:'New Purchase Order Created',url:'https://hooks.yourapp.com/po-created',status:'Active',lastFired:'Today 10:30 AM'},
        {id:'WH-002',event:'Stock below Reorder Level',url:'https://hooks.yourapp.com/low-stock',status:'Active',lastFired:'Today 08:15 AM'},
        {id:'WH-003',event:'Quality Inspection Failed',url:'https://hooks.yourapp.com/qc-fail',status:'Inactive',lastFired:'Yesterday 03:00 PM'},
    ]));
    const body=`
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.addWebhook()"><i class='bx bx-plus'></i> Add Webhook</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Trigger Event</th><th>Endpoint URL</th><th>Status</th><th>Last Fired</th><th>Actions</th></tr></thead>
        <tbody>${hooks.map(h=>`<tr>
            <td><code>${h.id}</code></td><td>${h.event}</td>
            <td><code style="font-size:0.72rem;">${h.url}</code></td>
            <td><span class="badge ${h.status==='Active'?'status-success':'status-danger'}">${h.status}</span></td>
            <td style="font-size:0.78rem;color:var(--text-muted);">${h.lastFired}</td>
            <td>
                <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 7px;" onclick="window.showToast('Test payload sent to ${h.url}','info')">Test</button>
                <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 7px;margin-left:4px;color:var(--danger-color);" onclick="window.showToast('${h.id} removed','warning')">Delete</button>
            </td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('webhookModal','Webhook Dispatcher','bx-link',body,950);
};
window.addWebhook=function(){const event=prompt('Trigger event:','New Order Created');if(!event)return;const url=prompt('Endpoint URL:','https://hooks.yourapp.com/');const hooks=JSON.parse(localStorage.getItem('wms_webhooks')||'[]');hooks.push({id:'WH-'+String(hooks.length+1).padStart(3,'0'),event,url:url||'https://example.com',status:'Active',lastFired:'Never'});localStorage.setItem('wms_webhooks',JSON.stringify(hooks));window.showToast('Webhook created','success');document.getElementById('webhookModal')?.remove();window.showWebhookDispatcher();};

// ===== F169: Tally XML Export =====
window.exportTallyXML = function() {
    const expenses=DataManager.getExpenses();
    const xml=`<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
  <BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>All Masters</REPORTNAME></REQUESTDESC>
    <REQUESTDATA>
${expenses.slice(0,5).map(e=>`      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="Journal" ACTION="Create">
          <DATE>${new Date().toISOString().slice(0,10).replace(/-/g,'')}</DATE>
          <NARRATION>${e.description||'Expense'}</NARRATION>
          <AMOUNT>${e.amount||0}</AMOUNT>
        </VOUCHER>
      </TALLYMESSAGE>`).join('\n')}
    </REQUESTDATA>
  </IMPORTDATA></BODY>
</ENVELOPE>`;
    const blob=new Blob([xml],{type:'text/xml'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='tally_export_'+new Date().toISOString().slice(0,10)+'.xml';a.click();URL.revokeObjectURL(url);
    window.showToast('Tally XML exported — '+expenses.length+' vouchers','success');
    DataManager.logAction('Tally XML Export','Exported to tally_export.xml');
};

// ===== F170: IoT Sensor Dashboard =====
window.showIoTDashboard = function() {
    const sensors=[
        {id:'SENS-001',location:'Cold Storage Unit 1',type:'Temperature',value:-3.2,unit:'°C',target:'-2 to -5°C',status:'Normal'},
        {id:'SENS-002',location:'Cold Storage Unit 2',type:'Temperature',value:1.8,unit:'°C',target:'-2 to -5°C',status:'Warning'},
        {id:'SENS-003',location:'Warehouse Floor — Zone A',type:'Humidity',value:68,unit:'%',target:'<70%',status:'Normal'},
        {id:'SENS-004',location:'Warehouse Floor — Zone B',type:'Humidity',value:74,unit:'%',target:'<70%',status:'Alert'},
        {id:'SENS-005',location:'Production Line 1',type:'Temperature',value:22.5,unit:'°C',target:'18-25°C',status:'Normal'},
        {id:'SENS-006',location:'Oil Storage Tank',type:'Level',value:78,unit:'%',target:'>20%',status:'Normal'},
    ];
    const body=`
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
            ${sensors.map(s=>{
                const color=s.status==='Normal'?'var(--success-color)':s.status==='Warning'?'var(--warning-color)':'var(--danger-color)';
                return `
                <div style="background:var(--bg-main);border:2px solid ${color}40;border-radius:16px;padding:16px;position:relative;">
                    <div style="position:absolute;top:12px;right:12px;width:10px;height:10px;background:${color};border-radius:50%;animation:${s.status!=='Normal'?'pulse 1s infinite':'none'};"></div>
                    <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:6px;">${s.id} | ${s.type}</div>
                    <div style="font-size:2rem;font-weight:900;color:${color};">${s.value}${s.unit}</div>
                    <div style="font-size:0.78rem;margin-top:4px;">${s.location}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">Target: ${s.target}</div>
                    <div style="margin-top:8px;"><span class="badge ${s.status==='Normal'?'status-success':s.status==='Warning'?'status-warning':'status-danger'}">${s.status}</span></div>
                </div>`;
            }).join('')}
        </div>
        <div style="margin-top:16px;text-align:right;">
            <button class="btn btn-outline" onclick="window.showToast('Sensor data refreshed','success')"><i class='bx bx-refresh'></i> Refresh</button>
        </div>`;
    makeModal('iotModal','IoT Sensor Dashboard','bx-wifi',body,900);
};

// ===== F171: Role-Based Access Matrix =====
window.showAccessMatrix = function() {
    const roles=['Super Admin','Manager','Operator','Viewer'];
    const modules=['Dashboard','Products','Inventory','Purchase Orders','Dispatch','Finance','Reports','HR','Settings','Delete Records'];
    const body=`
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Configure what each role can view, edit, or delete. Changes take effect immediately.</p>
        <div style="overflow-x:auto;">
            <table class="table">
                <thead><tr><th>Module</th>${roles.map(r=>`<th style="text-align:center;">${r}</th>`).join('')}</tr></thead>
                <tbody>${modules.map((m,mi)=>`<tr>
                    <td><strong>${m}</strong></td>
                    ${roles.map((_,ri)=>{
                        const access=mi<6?ri<3:mi<9?ri<2:ri<1;
                        const viewOnly=mi>=7&&ri===2;
                        return `<td style="text-align:center;">
                            <select style="font-size:0.72rem;padding:2px 4px;border:1px solid var(--border-color);border-radius:4px;background:var(--bg-main);" onchange="window.showToast('Access updated for ${m}','success')">
                                <option ${!access?'selected':''}>No Access</option>
                                <option ${viewOnly?'selected':''}>View Only</option>
                                <option ${access&&!viewOnly?'selected':''}>Full Access</option>
                            </select>
                        </td>`;
                    }).join('')}
                </tr>`).join('')}</tbody>
            </table>
        </div>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('Access matrix saved','success')"><i class='bx bx-save'></i> Save Changes</button>`;
    makeModal('accessMatrixModal','Role-Based Access Matrix','bx-shield',body,900);
};

// ===== F172: Two-Factor Auth Simulator =====
window.showTwoFactorAuth = function() {
    const body=`
        <div style="text-align:center;padding:20px;">
            <div style="width:80px;height:80px;background:var(--primary-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;"><i class='bx bx-mobile-alt' style="font-size:2rem;color:var(--primary-color);"></i></div>
            <h3>Two-Factor Authentication</h3>
            <p style="color:var(--text-muted);">Enter the 6-digit code sent to your registered mobile number: +91 98765 XXXXX</p>
            <div style="display:flex;gap:10px;justify-content:center;margin:20px 0;">
                ${[1,2,3,4,5,6].map(i=>`<input type="text" maxlength="1" id="otp${i}" style="width:45px;height:55px;text-align:center;font-size:1.5rem;font-weight:900;border:2px solid var(--border-color);border-radius:10px;background:var(--bg-main);" oninput="if(this.value.length===1&&${i}<6)document.getElementById('otp${i+1}')?.focus()">`).join('')}
            </div>
            <div style="display:flex;gap:10px;justify-content:center;">
                <button class="btn btn-outline" onclick="window.showToast('New OTP sent to mobile','info')">Resend OTP</button>
                <button class="btn btn-primary" onclick="window.verifyOTP()"><i class='bx bx-check'></i> Verify</button>
            </div>
        </div>`;
    makeModal('tfaModal','Two-Factor Authentication','bx-lock',body,500);
};
window.verifyOTP=function(){const code=[1,2,3,4,5,6].map(i=>document.getElementById('otp'+i)?.value||'').join('');if(code.length===6){window.showToast('2FA verified — Login successful','success');document.getElementById('tfaModal')?.remove();}else{window.showToast('Please enter all 6 digits','danger');}};

// ===== F173: Sensitive Action Confirmation =====
window.sensitiveActionConfirm = function(action, onConfirm) {
    const modal = document.createElement('div');
    modal.id = 'sensitiveModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(239,68,68,0.15);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:20px;padding:32px;max-width:480px;border:2px solid var(--danger-color);text-align:center;">
            <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
            <h3 style="color:var(--danger-color);margin-bottom:8px;">Sensitive Action</h3>
            <p style="color:var(--text-muted);margin-bottom:20px;">You are about to perform: <strong>${action}</strong><br>This action may be irreversible. Type <code>CONFIRM</code> to proceed.</p>
            <input type="text" id="sensitiveInput" placeholder="Type CONFIRM" style="width:100%;padding:12px;border:2px solid var(--danger-color);border-radius:8px;text-align:center;font-size:1rem;font-weight:700;letter-spacing:4px;background:var(--bg-main);margin-bottom:16px;">
            <div style="display:flex;gap:10px;justify-content:center;">
                <button class="btn btn-outline" onclick="document.getElementById('sensitiveModal').remove()">Cancel</button>
                <button class="btn btn-danger" onclick="window.checkSensitiveConfirm()">Proceed</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    window._sensitiveCallback = onConfirm;
};
window.checkSensitiveConfirm=function(){if(document.getElementById('sensitiveInput')?.value==='CONFIRM'){document.getElementById('sensitiveModal').remove();window._sensitiveCallback&&window._sensitiveCallback();}else{window.showToast('Please type CONFIRM exactly','danger');}};

// ===== F174: Global Full-Text Search =====
window.showGlobalSearch = function() {
    const body=`
        <div style="margin-bottom:20px;">
            <input type="text" id="globalSearchInput" placeholder="Search products, orders, suppliers, customers..." 
                style="width:100%;padding:14px;font-size:1rem;border:2px solid var(--primary-color);border-radius:12px;background:var(--bg-main);outline:none;"
                oninput="window.performGlobalSearch(this.value)" autofocus>
        </div>
        <div id="globalSearchResults"><p style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Start typing to search across all modules...</p></div>`;
    makeModal('globalSearchModal','Global Search','bx-search',body,750);
    setTimeout(()=>document.getElementById('globalSearchInput')?.focus(),100);
};
window.performGlobalSearch=function(query){
    const results=document.getElementById('globalSearchResults');
    if(!results||query.length<2){results&&(results.innerHTML='<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Type at least 2 characters...</p>');return;}
    const all=[
        ...DataManager.getProducts().map(p=>({type:'Product',icon:'bx-box',name:p.name,detail:`SKU: ${p.id} | Stock: ${p.stock}`,route:'#products'})),
        ...DataManager.getDispatchOrders().map(o=>({type:'Order',icon:'bx-truck',name:o.id,detail:`${o.customer} | ${o.status}`,route:'#dispatch'})),
        ...DataManager.getSuppliers().map(s=>({type:'Supplier',icon:'bx-store',name:s.name,detail:`${s.category} | Rating: ${s.rating}★`,route:'#supplier_scorecard'})),
        ...DataManager.getCustomers().map(c=>({type:'Customer',icon:'bx-user',name:c.name,detail:`GST: ${c.gst}`,route:'#customers'})),
        ...DataManager.getPurchaseOrders().map(p=>({type:'PO',icon:'bx-cart',name:p.id,detail:`${p.supplier} | ${p.status}`,route:'#purchase'})),
    ].filter(r=>r.name.toLowerCase().includes(query.toLowerCase())||r.detail.toLowerCase().includes(query.toLowerCase()));
    results.innerHTML=results&&all.length>0?`<div style="display:flex;flex-direction:column;gap:6px;">
        ${all.slice(0,10).map(r=>`<div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--bg-main);border-radius:8px;cursor:pointer;border:1px solid transparent;transition:border 0.2s;" onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='transparent'" onclick="window.location.hash='${r.route}';document.getElementById('globalSearchModal')?.remove()">
            <i class='bx ${r.icon}' style="color:var(--primary-color);font-size:1.2rem;min-width:20px;"></i>
            <div><div style="font-weight:600;">${r.name} <span class="badge status-info" style="font-size:0.65rem;">${r.type}</span></div>
            <div style="font-size:0.78rem;color:var(--text-muted);">${r.detail}</div></div>
        </div>`).join('')}
    </div>`:`<p style="text-align:center;color:var(--text-muted);">No results found for "${query}"</p>`;
};

// ===== F175: Data Backup Manager =====
window.downloadFullBackup = function() {
    const backup={
        exportedAt:new Date().toISOString(),
        version:'1.0',
        data:{
            products:DataManager.getProducts(),
            returns:DataManager.getReturns(),
            inventory:DataManager.getInventory(),
            purchaseOrders:DataManager.getPurchaseOrders(),
            dispatchOrders:DataManager.getDispatchOrders(),
            customers:DataManager.getCustomers(),
            suppliers:DataManager.getSuppliers(),
            workers:DataManager.getWorkers(),
            expenses:DataManager.getExpenses(),
            auditTrail:DataManager.getAuditTrail(),
            alerts:DataManager.getAlerts(),
            integrations:DataManager.getIntegrations(),
        }
    };
    const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='wms_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);
    window.showToast(`Full backup downloaded — ${Object.values(backup.data).reduce((a,v)=>a+v.length,0)} records exported`,'success');
    DataManager.logAction('Full Backup Created','System backup downloaded by Admin');
};

// ===== F176: Color Theme Picker =====
window.showThemePicker = function() {
    const themes=[
        {name:'Indigo & Slate (Default)',primary:'#6366f1',secondary:'#22c55e',bg:'#f8fafc'},
        {name:'Royal Blue & Amber',primary:'#3b82f6',secondary:'#f59e0b',bg:'#f0f9ff'},
        {name:'Purple & Pink',primary:'#9333ea',secondary:'#ec4899',bg:'#fdf4ff'},
        {name:'Teal & Orange',primary:'#0d9488',secondary:'#f97316',bg:'#f0fdfa'},
        {name:'Dark Crimson & Gold',primary:'#dc2626',secondary:'#d97706',bg:'#fef2f2'},
    ];
    const body=`
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:20px;">Select a color palette. Changes apply immediately to the entire application.</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${themes.map((t,i)=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:14px;background:var(--bg-main);border:2px solid ${i===0?'var(--primary-color)':'var(--border-color)'};border-radius:12px;cursor:pointer;" onclick="window.applyColorTheme('${t.primary}','${t.secondary}','${t.bg}');this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='var(--border-color)');this.style.borderColor='${t.primary}'">
                <span style="font-weight:600;">${t.name}</span>
                <div style="display:flex;gap:6px;">
                    <div style="width:24px;height:24px;background:${t.primary};border-radius:50%;"></div>
                    <div style="width:24px;height:24px;background:${t.secondary};border-radius:50%;"></div>
                    <div style="width:24px;height:24px;background:${t.bg};border-radius:50%;border:1px solid #ddd;"></div>
                </div>
            </div>`).join('')}
        </div>`;
    makeModal('themePickerModal','Color Theme Picker','bx-palette',body,600);
};
window.applyColorTheme=function(primary,secondary,bg){
    document.documentElement.style.setProperty('--primary-color',primary);
    document.documentElement.style.setProperty('--secondary-color',secondary);
    document.documentElement.style.setProperty('--bg-main',bg);
    window.showToast('Theme applied!','success');
};

// ===== F177: Announcement Banner System =====
window.showAnnouncementManager = function() {
    const key='wms_announcements';
    const announcements=JSON.parse(localStorage.getItem(key)||JSON.stringify([
        {id:'ANN-001',message:'System maintenance scheduled for Sunday 3 AM – 5 AM. Please save your work.',type:'warning',active:true,createdBy:'Admin'},
        {id:'ANN-002',message:'New packaging specifications effective from 01 Sep 2026. Please review SOP-14.',type:'info',active:true,createdBy:'Manager'},
    ]));
    const body=`
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.addAnnouncement()"><i class='bx bx-plus'></i> New Announcement</button></div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${announcements.map(a=>`
            <div style="background:var(--${a.type==='warning'?'warning':'info'}-color)10;border:1px solid var(--${a.type==='warning'?'warning':'info'}-color)40;border-radius:12px;padding:14px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                    <span class="badge ${a.type==='warning'?'status-warning':'status-info'}">${a.type.toUpperCase()}</span>
                    <div style="display:flex;gap:6px;">
                        ${a.active?`<span class="badge status-success">Active</span>`:`<span class="badge status-danger">Inactive</span>`}
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 6px;color:var(--danger-color);" onclick="window.showToast('Announcement removed','warning')">Remove</button>
                    </div>
                </div>
                <div style="font-size:0.85rem;">${a.message}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">By: ${a.createdBy}</div>
            </div>`).join('')}
        </div>`;
    makeModal('announcementModal','Announcement Banner System','bx-bell',body,700);
};
window.addAnnouncement=function(){const msg=prompt('Announcement message:');if(!msg)return;const type=prompt('Type (info/warning/danger):','info')||'info';const anns=JSON.parse(localStorage.getItem('wms_announcements')||'[]');anns.unshift({id:'ANN-'+Date.now().toString().slice(-4),message:msg,type,active:true,createdBy:'Admin User'});localStorage.setItem('wms_announcements',JSON.stringify(anns));window.showToast('Announcement broadcast to all users','success');document.getElementById('announcementModal')?.remove();window.showAnnouncementManager();};

// Helper makeModal for this file if loaded standalone
if(typeof makeModal==='undefined'){window.makeModal=function(id,title,icon,body,minWidth){const existing=document.getElementById(id);if(existing){existing.remove();return null;}const modal=document.createElement('div');modal.id=id;modal.style.cssText='position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';modal.innerHTML=`<div style="background:var(--bg-card);border-radius:20px;padding:32px;min-width:${minWidth||600}px;max-width:95vw;max-height:90vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.3);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><h2 style="margin:0;font-size:1.2rem;display:flex;align-items:center;gap:10px;"><i class='bx ${icon}' style="color:var(--primary-color);font-size:1.4rem;"></i>${title}</h2><button onclick="document.getElementById('${id}').remove()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:6px 12px;cursor:pointer;color:var(--text-muted);font-size:1rem;">✕ Close</button></div>${body}</div>`;document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});return modal;};}

console.log('Features Part 2 (F149-F177) loaded — Finance, AI, Reports, HR, Integrations, Security');
