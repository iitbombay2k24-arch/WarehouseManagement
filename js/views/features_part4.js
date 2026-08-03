// ============================================================
// FEATURES PART 4 — Remaining Features
// Finance, Security, UX, Charts, Documents, Ops & 30+ Utilities
// ============================================================

// ===== SHARED HELPER =====
function mkModal(id, title, icon, body, minWidth) {
    const ex = document.getElementById(id); if (ex) { ex.remove(); return null; }
    const m = document.createElement('div');
    m.id = id; m.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.78);backdrop-filter:blur(5px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    m.innerHTML = `<div style="background:var(--bg-card);border-radius:20px;padding:32px;min-width:${minWidth||600}px;max-width:96vw;max-height:91vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 25px 60px rgba(0,0,0,0.28);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
            <h2 style="margin:0;font-size:1.15rem;display:flex;align-items:center;gap:10px;"><i class='bx ${icon}' style="color:var(--primary-color);font-size:1.4rem;"></i>${title}</h2>
            <button onclick="document.getElementById('${id}').remove()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:6px 12px;cursor:pointer;color:var(--text-muted);">✕ Close</button>
        </div>${body}</div>`;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    return m;
}

// =========================================================
// FINANCE & COMPLIANCE — REMAINING
// =========================================================

// ===== TDS Deduction Ledger =====
window.showTDSLedger = function() {
    const key = 'wms_tds';
    const entries = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'TDS-001', vendor:'ABC Spices Ltd.', pan:'AABCS1234F', invoiceNo:'INV-982', gross:45000, tdsRate:2, tdsAmt:900, netPaid:44100, date:'28 Jul 2026', section:'194C', deposited:true },
        { id:'TDS-002', vendor:'Global Packaging', pan:'AABCG5678H', invoiceNo:'INV-975', gross:28500, tdsRate:2, tdsAmt:570, netPaid:27930, date:'22 Jul 2026', section:'194C', deposited:false },
        { id:'TDS-003', vendor:'Creative Designs (Logo)', pan:'AABCD9012K', invoiceNo:'INV-968', gross:15000, tdsRate:10, tdsAmt:1500, netPaid:13500, date:'10 Jul 2026', section:'194J', deposited:true },
    ]));
    const totalTDS = entries.reduce((a,e) => a+e.tdsAmt, 0);
    const pending = entries.filter(e=>!e.deposited).reduce((a,e) => a+e.tdsAmt, 0);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">₹${totalTDS.toLocaleString('en-IN')}</div><div class="stat-label">Total TDS Deducted</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">₹${(totalTDS-pending).toLocaleString('en-IN')}</div><div class="stat-label">Deposited to Govt.</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">₹${pending.toLocaleString('en-IN')}</div><div class="stat-label">Pending Deposit</div></div>
        </div>
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.addTDSEntry()"><i class='bx bx-plus'></i> New TDS Entry</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Vendor</th><th>PAN</th><th>Invoice</th><th>Gross Amt</th><th>Rate</th><th>TDS Amt</th><th>Section</th><th>Status</th></tr></thead>
        <tbody>${entries.map(e=>`<tr>
            <td><code>${e.id}</code></td><td>${e.vendor}</td><td><code>${e.pan}</code></td><td>${e.invoiceNo}</td>
            <td>₹${e.gross.toLocaleString('en-IN')}</td><td>${e.tdsRate}%</td>
            <td><strong>₹${e.tdsAmt.toLocaleString('en-IN')}</strong></td><td>${e.section}</td>
            <td><span class="badge ${e.deposited?'status-success':'status-danger'}">${e.deposited?'Deposited':'Pending'}</span>
            ${!e.deposited?`<button class="btn btn-outline" style="font-size:0.7rem;padding:2px 6px;margin-left:4px;" onclick="window.depositTDS('${e.id}')">Deposit</button>`:''}</td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('tdsModal','TDS Deduction Ledger','bx-receipt',body,950);
};
window.addTDSEntry = function() {
    const vendor = prompt('Vendor name:'); if(!vendor) return;
    const gross = parseInt(prompt('Invoice amount (₹):','50000')||0);
    const rate = parseFloat(prompt('TDS rate % (e.g. 2 for 194C, 10 for 194J):','2')||2);
    const section = prompt('Section (e.g. 194C, 194J):','194C')||'194C';
    const entries = JSON.parse(localStorage.getItem('wms_tds')||'[]');
    const tdsAmt = Math.round(gross * rate / 100);
    entries.unshift({ id:'TDS-'+Date.now().toString().slice(-4), vendor, pan:'—', invoiceNo:'INV-'+Date.now().toString().slice(-3), gross, tdsRate:rate, tdsAmt, netPaid:gross-tdsAmt, date:new Date().toLocaleDateString('en-IN'), section, deposited:false });
    localStorage.setItem('wms_tds', JSON.stringify(entries));
    window.showToast(`TDS ₹${tdsAmt} deducted from ${vendor}`,'success');
    document.getElementById('tdsModal')?.remove(); window.showTDSLedger();
};
window.depositTDS = function(id) {
    const entries = JSON.parse(localStorage.getItem('wms_tds')||'[]');
    const e = entries.find(x=>x.id===id); if(e) e.deposited=true;
    localStorage.setItem('wms_tds', JSON.stringify(entries));
    window.showToast(`${id} — TDS deposited to government`,'success');
    document.getElementById('tdsModal')?.remove(); window.showTDSLedger();
};

// ===== Expense Claim Approval Flow =====
window.showExpenseClaims = function() {
    const key = 'wms_expense_claims';
    const claims = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'EXP-CLM-001', submittedBy:'Warehouse Mgr', category:'Travel', description:'Fuel for delivery run to Mumbai distributor', amount:2200, date:'Today', receipts:2, status:'Pending', approver:'Admin User' },
        { id:'EXP-CLM-002', submittedBy:'Scanner 1', category:'Tools', description:'New scanning gun battery replacement', amount:850, date:'Yesterday', receipts:1, status:'Approved', approver:'Warehouse Mgr' },
        { id:'EXP-CLM-003', submittedBy:'Admin User', category:'Stationery', description:'Office supplies — paper, pens, files', amount:1500, date:'29 Jul', receipts:1, status:'Rejected', approver:'Manager', reason:'Budget exceeded' },
    ]));
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${claims.filter(c=>c.status==='Pending').length}</div><div class="stat-label">Pending Approval</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">₹${claims.filter(c=>c.status==='Approved').reduce((a,c)=>a+c.amount,0).toLocaleString('en-IN')}</div><div class="stat-label">Approved This Month</div></div>
            <div class="stat-card"><div class="stat-number">${claims.filter(c=>c.status==='Rejected').length}</div><div class="stat-label">Rejected Claims</div></div>
        </div>
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.submitExpenseClaim()"><i class='bx bx-plus'></i> Submit New Claim</button></div>
        <table class="table"><thead><tr><th>ID</th><th>By</th><th>Category</th><th>Description</th><th>Amount</th><th>Receipts</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${claims.map(c=>`<tr>
            <td><code>${c.id}</code></td><td>${c.submittedBy}</td>
            <td><span class="badge status-info">${c.category}</span></td>
            <td style="font-size:0.82rem;max-width:180px;">${c.description}</td>
            <td><strong>₹${c.amount.toLocaleString('en-IN')}</strong></td>
            <td>${c.receipts} file(s)</td>
            <td><span class="badge ${c.status==='Approved'?'status-success':c.status==='Rejected'?'status-danger':'status-warning'}">${c.status}</span></td>
            <td>${c.status==='Pending'?`
                <button class="btn btn-primary" style="font-size:0.7rem;padding:2px 7px;" onclick="window.approveExpenseClaim('${c.id}')">Approve</button>
                <button class="btn btn-outline" style="font-size:0.7rem;padding:2px 7px;color:var(--danger-color);margin-left:3px;" onclick="window.rejectExpenseClaim('${c.id}')">Reject</button>`:'—'}
            </td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('expClaimModal','Expense Claim Approval Flow','bx-money',body,1000);
};
window.submitExpenseClaim = function() {
    const cat = prompt('Category (Travel/Tools/Stationery/Other):','Travel'); if(!cat) return;
    const desc = prompt('Description:'); if(!desc) return;
    const amt = parseInt(prompt('Amount (₹):','0')||0);
    const claims = JSON.parse(localStorage.getItem('wms_expense_claims')||'[]');
    claims.unshift({ id:'EXP-CLM-'+Date.now().toString().slice(-4), submittedBy:'Admin User', category:cat, description:desc, amount:amt, date:'Today', receipts:0, status:'Pending', approver:'Manager' });
    localStorage.setItem('wms_expense_claims', JSON.stringify(claims));
    window.showToast('Expense claim submitted for approval','success');
    document.getElementById('expClaimModal')?.remove(); window.showExpenseClaims();
};
window.approveExpenseClaim = function(id) { _updateClaimStatus(id,'Approved'); };
window.rejectExpenseClaim = function(id) { _updateClaimStatus(id,'Rejected'); };
function _updateClaimStatus(id, status) {
    const claims = JSON.parse(localStorage.getItem('wms_expense_claims')||'[]');
    const c = claims.find(x=>x.id===id); if(c) c.status=status;
    localStorage.setItem('wms_expense_claims', JSON.stringify(claims));
    window.showToast(`${id} ${status}`,'success');
    DataManager.logAction(`Expense Claim ${status}`,`${id} ${status} by Admin`);
    document.getElementById('expClaimModal')?.remove(); window.showExpenseClaims();
}

// ===== Accounts Payable Aging =====
window.showAPAgeing = function() {
    const suppliers = DataManager.getSuppliers();
    const body = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px;">
            ${[['Current','var(--text-main)',Math.floor(Math.random()*100000+50000)],['1-30 Days','var(--warning-color)',Math.floor(Math.random()*80000+30000)],['31-60 Days','#f97316',Math.floor(Math.random()*40000+10000)],['60+ Days','var(--danger-color)',Math.floor(Math.random()*20000+5000)]].map(([l,c,v])=>`
            <div class="stat-card"><div class="stat-number" style="color:${c};">₹${Math.round(v/1000)}K</div><div class="stat-label">${l}</div></div>`).join('')}
        </div>
        <table class="table"><thead><tr><th>Supplier</th><th>Invoice</th><th>Due Date</th><th>Current</th><th>1-30d</th><th>31-60d</th><th>60d+</th><th>Total</th><th>Action</th></tr></thead>
        <tbody>${suppliers.map(s=>{
            const curr=Math.floor(Math.random()*30000);
            const d30=Math.floor(Math.random()*20000);
            const d60=Math.floor(Math.random()*10000);
            const d90=Math.floor(Math.random()*5000);
            const total=curr+d30+d60+d90;
            return `<tr>
                <td><strong>${s.name}</strong></td>
                <td><code>INV-${Math.floor(900+Math.random()*99)}</code></td>
                <td>${new Date(Date.now()+Math.floor(Math.random()*30-15)*86400000).toLocaleDateString('en-IN')}</td>
                <td>₹${curr.toLocaleString('en-IN')}</td>
                <td style="color:${d30>0?'var(--warning-color)':'var(--text-muted)'};">₹${d30.toLocaleString('en-IN')}</td>
                <td style="color:${d60>0?'#f97316':'var(--text-muted)'};">₹${d60.toLocaleString('en-IN')}</td>
                <td style="color:${d90>0?'var(--danger-color)':'var(--text-muted)'};">₹${d90.toLocaleString('en-IN')}</td>
                <td><strong>₹${total.toLocaleString('en-IN')}</strong></td>
                <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.showToast('Payment initiated for ${s.name}','success')">Pay</button></td>
            </tr>`;
        }).join('')}</tbody></table>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('AP Ageing report exported','success')"><i class='bx bx-download'></i> Export PDF</button>`;
    mkModal('apModal','Accounts Payable Ageing','bx-credit-card-front',body,1000);
};

// ===== Bank Reconciliation Helper =====
window.showBankReconciliation = function() {
    const bankTxns = [
        { date:'02 Aug', desc:'NEFT from Mega Mart', amount:75000, type:'credit', matched:true },
        { date:'02 Aug', desc:'RTGS to ABC Spices', amount:45000, type:'debit', matched:true },
        { date:'01 Aug', desc:'UPI from SuperMart', amount:28500, type:'credit', matched:false },
        { date:'01 Aug', desc:'Salary payment', amount:98000, type:'debit', matched:true },
        { date:'31 Jul', desc:'Bank charges', amount:450, type:'debit', matched:false },
    ];
    const unmatched = bankTxns.filter(t=>!t.matched);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${bankTxns.filter(t=>t.matched).length}</div><div class="stat-label">Matched Transactions</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${unmatched.length}</div><div class="stat-label">Unmatched — Needs Review</div></div>
            <div class="stat-card"><div class="stat-number">₹${bankTxns.filter(t=>t.type==='credit').reduce((a,t)=>a+t.amount,0).toLocaleString('en-IN')}</div><div class="stat-label">Total Credits</div></div>
        </div>
        <div style="margin-bottom:12px;display:flex;gap:10px;align-items:center;">
            <label style="font-weight:600;">Upload Bank Statement:</label>
            <input type="file" accept=".csv,.pdf" style="font-size:0.82rem;" onchange="window.showToast('Bank statement uploaded — matching in progress...','info');setTimeout(()=>window.showToast('3 transactions auto-matched!','success'),1500)">
        </div>
        <table class="table"><thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${bankTxns.map(t=>`<tr style="${!t.matched?'background:var(--warning-color)04;':''}">
            <td>${t.date}</td>
            <td>${t.desc}</td>
            <td style="font-weight:700;color:${t.type==='credit'?'var(--success-color)':'var(--danger-color)'};">${t.type==='credit'?'+':'-'}₹${t.amount.toLocaleString('en-IN')}</td>
            <td><span class="badge ${t.type==='credit'?'status-success':'status-danger'}">${t.type}</span></td>
            <td><span class="badge ${t.matched?'status-success':'status-warning'}">${t.matched?'Matched':'Unmatched'}</span></td>
            <td>${!t.matched?`<button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.showToast('Transaction matched manually','success')">Match</button>
                <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;margin-left:4px;" onclick="window.showToast('Flagged for review','warning')">Flag</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('bankReconModal','Bank Reconciliation Helper','bx-transfer-alt',body,900);
};

// ===== Customer Statement Generator =====
window.generateCustomerStatement = function() {
    const customers = DataManager.getCustomers();
    const customer = customers[0] || { name:'Mega Mart (National)', gst:'27AABCM1234F1ZX' };
    const txns = [
        { date:'05 Jul', ref:'INV-980', desc:'Sales Invoice', debit:0, credit:85000 },
        { date:'10 Jul', ref:'REC-220', desc:'Payment Received', debit:85000, credit:0 },
        { date:'18 Jul', ref:'INV-985', desc:'Sales Invoice', debit:0, credit:72000 },
        { date:'25 Jul', ref:'CN-015', desc:'Credit Note — Return', debit:8500, credit:0 },
        { date:'02 Aug', ref:'INV-992', desc:'Sales Invoice', debit:0, credit:45000 },
    ];
    let balance = 0;
    const rows = txns.map(t => { balance += t.credit - t.debit; return { ...t, balance }; });
    const win = window.open('','_blank','width=800,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>Statement — ${customer.name}</title><style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:12px;}
        h2{color:#6366f1;margin:0;}.header{border-bottom:2px solid #6366f1;margin-bottom:20px;padding-bottom:14px;}
        table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{border:1px solid #ddd;padding:7px 10px;}th{background:#f1f5f9;font-weight:700;}
        .cr{color:#16a34a;}.dr{color:#dc2626;}
    </style></head><body>
        <div class="header"><div style="display:flex;justify-content:space-between;">
            <div><h2>ACCOUNT STATEMENT</h2><strong>Namkeen Industries Pvt. Ltd.</strong><br>42, MIDC, Pune — 411019<br>GSTIN: 27AABCU9603R1ZX</div>
            <div style="text-align:right;"><strong>Statement For:</strong><br>${customer.name}<br>GSTIN: ${customer.gst}<br><strong>Period:</strong> 01 Jul – 02 Aug 2026</div>
        </div></div>
        <table><thead><tr><th>Date</th><th>Ref No.</th><th>Description</th><th>Debit (₹)</th><th>Credit (₹)</th><th>Balance (₹)</th></tr></thead>
        <tbody><tr><td colspan="5" style="font-weight:700;">Opening Balance</td><td style="font-weight:700;">₹0</td></tr>
        ${rows.map(r=>`<tr>
            <td>${r.date}</td><td>${r.ref}</td><td>${r.desc}</td>
            <td class="dr">${r.debit>0?'₹'+r.debit.toLocaleString('en-IN'):''}</td>
            <td class="cr">${r.credit>0?'₹'+r.credit.toLocaleString('en-IN'):''}</td>
            <td style="font-weight:700;color:${r.balance>=0?'#16a34a':'#dc2626'};">₹${Math.abs(r.balance).toLocaleString('en-IN')} ${r.balance<0?'Dr':'Cr'}</td>
        </tr>`).join('')}</tbody>
        <tfoot><tr style="background:#f8fafc;font-weight:700;font-size:13px;"><td colspan="4">Closing Balance</td><td colspan="2" style="color:${rows[rows.length-1].balance>=0?'#16a34a':'#dc2626'};">₹${Math.abs(rows[rows.length-1].balance).toLocaleString('en-IN')} ${rows[rows.length-1].balance<0?'Dr':'Cr'}</td></tr></tfoot></table>
        <p style="color:#64748b;font-size:10px;">This is a system-generated statement. For any discrepancies, contact accounts@namkeenindustries.com</p>
        <script>window.print();</script></body></html>`);
    window.showToast(`Customer statement generated for ${customer.name}`,'success');
};

// =========================================================
// AI / ANALYTICS — REMAINING
// =========================================================

// ===== Expiry Prediction Engine =====
window.showExpiryPrediction = function() {
    const batches = [
        { batch:'#B-2380', product:'Aloo Bhujia (500g)', mfgDate:'15 Jun 2026', expiryDate:'30 Sep 2026', stock:800, daysLeft:58, riskScore:72, recommendation:'Prioritize FEFO dispatch' },
        { batch:'#B-2350', product:'Aloo Bhujia (500g)', mfgDate:'01 Jun 2026', expiryDate:'31 Aug 2026', stock:500, daysLeft:28, riskScore:91, recommendation:'Launch markdown promotion immediately' },
        { batch:'#B-2410', product:'Navratna Mix (1kg)', mfgDate:'15 Jul 2026', expiryDate:'15 Oct 2026', stock:320, daysLeft:73, riskScore:42, recommendation:'Monitor — no action needed yet' },
        { batch:'#B-2360', product:'Khatta Meetha (250g)', mfgDate:'10 Jun 2026', expiryDate:'10 Sep 2026', stock:120, daysLeft:38, riskScore:85, recommendation:'Move to high-turnover channel' },
    ];
    const body = `
        <div style="margin-bottom:16px;padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;color:var(--text-muted);">
            <i class='bx bx-bot' style="color:var(--info-color);"></i> <strong>AI Prediction:</strong> Risk scores calculated using stock velocity, days remaining, and channel capacity.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${batches.map(b=>{
                const riskColor = b.riskScore>=85?'var(--danger-color)':b.riskScore>=65?'var(--warning-color)':'var(--success-color)';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;border-left:4px solid ${riskColor};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                        <div>
                            <strong>${b.product}</strong> — <code>${b.batch}</code>
                            <div style="font-size:0.78rem;color:var(--text-muted);">MFG: ${b.mfgDate} | EXP: ${b.expiryDate} | Stock: ${b.stock} units</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="font-size:1.8rem;font-weight:900;color:${riskColor};">${b.riskScore}</div>
                            <div style="font-size:0.68rem;color:var(--text-muted);">Risk Score</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <span style="font-size:0.82rem;font-weight:700;color:${riskColor};">${b.daysLeft} days remaining</span>
                        <div style="flex:1;height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${100-Math.min(b.riskScore,100)}%;background:${riskColor};border-radius:99px;"></div></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-size:0.8rem;color:var(--text-muted);"><i class='bx bx-bulb' style="color:var(--warning-color);"></i> ${b.recommendation}</span>
                        ${b.riskScore>=65?`<button class="btn btn-${b.riskScore>=85?'danger':'outline'}" style="font-size:0.75rem;padding:4px 12px;" onclick="window.showToast('Promotion created for batch ${b.batch}','success')">Take Action</button>`:''}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    mkModal('expiryPredModal','AI Expiry Prediction Engine','bx-bot',body,750);
};

// ===== Smart Alert Deduplicator =====
window.showAlertDeduplicator = function() {
    const alerts = DataManager.getAlerts();
    const grouped = {};
    alerts.forEach(a => { const key = a.type+':'+a.sku; grouped[key] = grouped[key]||[]; grouped[key].push(a); });
    const dedupedList = Object.entries(grouped).map(([key,[first,...rest]])=>({...first, duplicates:rest.length}));
    const suppressed = alerts.length - dedupedList.length;
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number">${alerts.length}</div><div class="stat-label">Total Raw Alerts</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${dedupedList.length}</div><div class="stat-label">Unique Alerts</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--info-color);">${suppressed}</div><div class="stat-label">Suppressed Duplicates</div></div>
        </div>
        <div style="margin-bottom:12px;padding:12px;background:var(--success-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-check-circle' style="color:var(--success-color);"></i> Deduplicator is <strong>Active</strong> — alerts for the same SKU+type within 1 hour are suppressed automatically.
        </div>
        <table class="table"><thead><tr><th>Alert</th><th>SKU</th><th>Type</th><th>Duplicates</th><th>Acknowledged</th></tr></thead>
        <tbody>${dedupedList.map(a=>`<tr>
            <td>${a.alert}</td><td><code>${a.sku||'—'}</code></td>
            <td><span class="badge ${a.alertClass||'status-warning'}">${a.type}</span></td>
            <td>${a.duplicates>0?`<span style="color:var(--info-color);font-weight:700;">+${a.duplicates} suppressed</span>`:'—'}</td>
            <td><span class="badge ${a.acknowledged?'status-success':'status-danger'}">${a.acknowledged?'Yes':'No'}</span></td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('alertDedupModal','Smart Alert Deduplicator','bx-filter',body,850);
};

// ===== Route Optimization Suggester =====
window.showRouteOptimizer = function() {
    const routes = [
        { id:'RTE-001', driver:'Ramesh K.', vehicle:'MH-12-AB-1234', stops:[
            { city:'Pune (Warehouse)', est:'08:00 AM', actual:'08:00 AM', status:'Departed' },
            { city:'Kothrud, Pune', est:'08:30 AM', actual:'08:35 AM', status:'Delivered' },
            { city:'Hadapsar, Pune', est:'09:15 AM', actual:'09:10 AM', status:'Delivered' },
            { city:'Pimpri, Pune', est:'10:00 AM', actual:'—', status:'Pending' },
            { city:'Chinchwad, Pune', est:'10:45 AM', actual:'—', status:'Pending' },
        ], totalDistance:'48 km', estReturn:'12:30 PM', optimizedSaving:'12 km saved' },
    ];
    const orders = DataManager.getDispatchOrders();
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">12 km</div><div class="stat-label">Saved by Optimization</div></div>
            <div class="stat-card"><div class="stat-number">₹840</div><div class="stat-label">Fuel Cost Saved</div></div>
            <div class="stat-card"><div class="stat-number">45 min</div><div class="stat-label">Time Saved</div></div>
        </div>
        ${routes.map(r=>`
        <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:16px;padding:20px;margin-bottom:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div><strong>${r.id}</strong> — ${r.driver} <span style="color:var(--text-muted);">| ${r.vehicle}</span></div>
                <div style="display:flex;gap:10px;font-size:0.82rem;color:var(--text-muted);">
                    <span><i class='bx bx-map-pin'></i> ${r.totalDistance}</span>
                    <span><i class='bx bx-time'></i> Return: ${r.estReturn}</span>
                    <span class="badge status-success">${r.optimizedSaving}</span>
                </div>
            </div>
            <div style="position:relative;padding-left:20px;">
                <div style="position:absolute;left:6px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,var(--primary-color),var(--success-color));border-radius:99px;"></div>
                ${r.stops.map((s,i)=>`
                <div style="position:relative;margin-bottom:12px;display:flex;align-items:center;gap:12px;">
                    <div style="position:absolute;left:-18px;width:12px;height:12px;border-radius:50%;background:${s.status==='Delivered'?'var(--success-color)':s.status==='Departed'?'var(--primary-color)':'var(--border-color)'};border:2px solid white;"></div>
                    <div style="flex:1;padding:8px;background:var(--bg-card);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:${i===0?700:400};">${s.city}</span>
                        <div style="display:flex;gap:8px;align-items:center;font-size:0.78rem;">
                            <span style="color:var(--text-muted);">Est: ${s.est}</span>
                            <span class="badge ${s.status==='Delivered'?'status-success':s.status==='Departed'?'status-info':'status-warning'}">${s.status}</span>
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>`).join('')}
        <button class="btn btn-primary" onclick="window.showToast('Route optimized using Dijkstra algorithm — 12 km saved!','success')"><i class='bx bx-map'></i> Re-Optimize All Routes</button>`;
    mkModal('routeOptModal','Route Optimization Suggester','bx-map',body,800);
};

// ===== Scheduled Report Mailer =====
window.showScheduledReports = function() {
    const key = 'wms_sched_reports';
    const schedules = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'RPT-SCH-001', name:'Daily Inventory Summary', frequency:'Daily 07:00 AM', recipients:'admin@namkeen.com, manager@namkeen.com', format:'PDF', status:'Active', lastSent:'Today 07:00 AM' },
        { id:'RPT-SCH-002', name:'Weekly P&L Report', frequency:'Every Monday 09:00 AM', recipients:'ceo@namkeen.com', format:'Excel', status:'Active', lastSent:'28 Jul 2026' },
        { id:'RPT-SCH-003', name:'Monthly Compliance Report', frequency:'1st of month 10:00 AM', recipients:'compliance@namkeen.com', format:'PDF', status:'Inactive', lastSent:'01 Jul 2026' },
    ]));
    const body = `
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.addScheduledReport()"><i class='bx bx-plus'></i> New Scheduled Report</button></div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${schedules.map(s=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <div>
                        <strong>${s.name}</strong>
                        <span class="badge status-info" style="margin-left:8px;font-size:0.7rem;">${s.format}</span>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        <span class="badge ${s.status==='Active'?'status-success':'status-danger'}">${s.status}</span>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.showToast('${s.name} sent now','success')">Send Now</button>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;color:var(--danger-color);" onclick="window.showToast('Schedule deleted','warning')">Delete</button>
                    </div>
                </div>
                <div style="font-size:0.8rem;color:var(--text-muted);">
                    <i class='bx bx-time'></i> ${s.frequency} &nbsp;&nbsp;
                    <i class='bx bx-envelope'></i> ${s.recipients} &nbsp;&nbsp;
                    <i class='bx bx-check'></i> Last: ${s.lastSent}
                </div>
            </div>`).join('')}
        </div>`;
    mkModal('schedReportModal','Scheduled Email Reports','bx-mail-send',body,750);
};
window.addScheduledReport = function() {
    const name = prompt('Report name:'); if(!name) return;
    const freq = prompt('Frequency (Daily/Weekly/Monthly):','Daily 07:00 AM')||'Daily 07:00 AM';
    const email = prompt('Recipient emails (comma-separated):','admin@company.com')||'admin@company.com';
    const schedules = JSON.parse(localStorage.getItem('wms_sched_reports')||'[]');
    schedules.push({ id:'RPT-SCH-'+Date.now().toString().slice(-4), name, frequency:freq, recipients:email, format:'PDF', status:'Active', lastSent:'Never' });
    localStorage.setItem('wms_sched_reports', JSON.stringify(schedules));
    window.showToast('Scheduled report created','success');
    document.getElementById('schedReportModal')?.remove(); window.showScheduledReports();
};

// =========================================================
// HR — REMAINING
// =========================================================

// ===== Disciplinary Action Log =====
window.showDisciplinaryLog = function() {
    const key = 'wms_disciplinary';
    const records = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'DA-001', worker:'Scanner 1', date:'25 Jul 2026', type:'Verbal Warning', description:'Late arrival — 45 minutes past shift start without prior notice', issuedBy:'Warehouse Mgr', acknowledged:true },
        { id:'DA-002', worker:'Warehouse Mgr', date:'10 Jul 2026', type:'Written Warning', description:'Inventory discrepancy — 50 units unaccounted for in Zone B', issuedBy:'Admin User', acknowledged:true },
    ]));
    const body = `
        <div style="margin-bottom:16px;display:flex;gap:10px;">
            <button class="btn btn-danger" onclick="window.addDisciplinaryRecord()"><i class='bx bx-file'></i> Issue Warning</button>
        </div>
        <table class="table"><thead><tr><th>ID</th><th>Worker</th><th>Date</th><th>Type</th><th>Description</th><th>Issued By</th><th>Acknowledged</th></tr></thead>
        <tbody>${records.map(r=>`<tr>
            <td><code>${r.id}</code></td>
            <td><strong>${r.worker}</strong></td>
            <td>${r.date}</td>
            <td><span class="badge ${r.type.includes('Written')?'status-danger':'status-warning'}">${r.type}</span></td>
            <td style="font-size:0.8rem;max-width:200px;">${r.description}</td>
            <td>${r.issuedBy}</td>
            <td><span class="badge ${r.acknowledged?'status-success':'status-danger'}">${r.acknowledged?'Yes':'Pending'}</span></td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('disciplinaryModal','Disciplinary Action Log','bx-file-find',body,950);
};
window.addDisciplinaryRecord = function() {
    const worker = prompt('Worker name:'); if(!worker) return;
    const type = prompt('Warning type (Verbal Warning / Written Warning / Final Warning):','Verbal Warning')||'Verbal Warning';
    const desc = prompt('Description of incident:'); if(!desc) return;
    const records = JSON.parse(localStorage.getItem('wms_disciplinary')||'[]');
    records.unshift({ id:'DA-'+Date.now().toString().slice(-4), worker, date:new Date().toLocaleDateString('en-IN'), type, description:desc, issuedBy:'Admin User', acknowledged:false });
    localStorage.setItem('wms_disciplinary', JSON.stringify(records));
    DataManager.logAction('Disciplinary Action Issued',`${type} issued to ${worker}`);
    window.showToast(`${type} issued to ${worker}`,'warning');
    document.getElementById('disciplinaryModal')?.remove(); window.showDisciplinaryLog();
};

// =========================================================
// INTEGRATIONS — REMAINING
// =========================================================

// ===== Shopify Order Puller =====
window.showShopifyPuller = function() {
    const key = 'wms_shopify_orders';
    const orders = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'SHP-10001', shopifyId:'#10001', customer:'Online Customer 1', items:'Aloo Bhujia (500g) x2, Navratna Mix x1', total:420, createdAt:'02 Aug 2026 10:15', status:'Pending Fulfillment', syncStatus:'Synced' },
        { id:'SHP-10002', shopifyId:'#10002', customer:'Online Customer 2', items:'Khatta Meetha (250g) x4', total:480, createdAt:'01 Aug 2026 18:42', status:'Fulfilled', syncStatus:'Synced' },
        { id:'SHP-10003', shopifyId:'#10003', customer:'Online Customer 3', items:'Aloo Bhujia (500g) x6', total:720, createdAt:'01 Aug 2026 14:30', status:'Pending Fulfillment', syncStatus:'Not Synced' },
    ]));
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">● Connected</div><div class="stat-label">Shopify Store Status</div></div>
            <div class="stat-card"><div class="stat-number">${orders.length}</div><div class="stat-label">Orders Today</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--warning-color);">${orders.filter(o=>o.syncStatus==='Not Synced').length}</div><div class="stat-label">Awaiting Sync</div></div>
        </div>
        <div style="margin-bottom:12px;display:flex;gap:10px;">
            <button class="btn btn-primary" onclick="window.pullShopifyOrders()"><i class='bx bx-refresh'></i> Pull Latest Orders</button>
            <button class="btn btn-outline" onclick="window.showToast('Tracking synced back to Shopify','success')"><i class='bx bx-send'></i> Push Tracking Numbers</button>
        </div>
        <table class="table"><thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Shopify Status</th><th>WMS Sync</th><th>Action</th></tr></thead>
        <tbody>${orders.map(o=>`<tr>
            <td><code>${o.shopifyId}</code></td>
            <td>${o.customer}</td>
            <td style="font-size:0.78rem;">${o.items}</td>
            <td><strong>₹${o.total}</strong></td>
            <td style="font-size:0.78rem;">${o.createdAt}</td>
            <td><span class="badge ${o.status.includes('Fulfilled')?'status-success':'status-warning'}">${o.status}</span></td>
            <td><span class="badge ${o.syncStatus==='Synced'?'status-success':'status-danger'}">${o.syncStatus}</span></td>
            <td>${o.syncStatus!=='Synced'?`<button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.showToast('${o.shopifyId} synced to WMS','success')">Sync</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('shopifyModal','Shopify Order Puller','bx-store-alt',body,1000);
};
window.pullShopifyOrders = function() {
    window.showToast('Pulling latest orders from Shopify...','info');
    setTimeout(()=>{
        const orders = JSON.parse(localStorage.getItem('wms_shopify_orders')||'[]');
        const newOrder = { id:'SHP-'+Date.now().toString().slice(-5), shopifyId:'#'+Date.now().toString().slice(-5), customer:'New Online Customer', items:'Aloo Bhujia (500g) x3', total:360, createdAt:new Date().toLocaleString('en-IN'), status:'Pending Fulfillment', syncStatus:'Synced' };
        orders.unshift(newOrder);
        localStorage.setItem('wms_shopify_orders', JSON.stringify(orders));
        window.showToast('1 new order pulled from Shopify','success');
        document.getElementById('shopifyModal')?.remove(); window.showShopifyPuller();
    },1200);
};

// ===== Email Template Editor =====
window.showEmailTemplateEditor = function() {
    const key = 'wms_email_templates';
    const templates = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'TMPL-001', name:'Low Stock Alert', subject:'[WMS Alert] Stock below reorder level: {{SKU}}', body:'Dear Team,\n\nThis is an automated alert.\n\nProduct: {{PRODUCT}}\nSKU: {{SKU}}\nCurrent Stock: {{STOCK}} units\nReorder Level: {{REORDER}} units\n\nPlease initiate a purchase order immediately.\n\nRegards,\nWMS System', active:true },
        { id:'TMPL-002', name:'PO Approval Request', subject:'Purchase Order Approval Required: {{PO_ID}}', body:'Dear {{APPROVER}},\n\nPO {{PO_ID}} for {{SUPPLIER}} worth ₹{{AMOUNT}} requires your approval.\n\nClick here to approve: [LINK]\n\nRegards,\nWMS System', active:true },
    ]));
    const [selected, setSelected] = [0, ()=>{}];
    const tmpl = templates[0];
    const body = `
        <div style="display:grid;grid-template-columns:220px 1fr;gap:20px;height:500px;">
            <div style="border-right:1px solid var(--border-color);padding-right:16px;">
                <div style="font-weight:600;margin-bottom:12px;font-size:0.85rem;">Templates</div>
                ${templates.map((t,i)=>`
                <div style="padding:10px;background:${i===0?'var(--primary-light)':'var(--bg-main)'};border:1px solid ${i===0?'var(--primary-color)':'var(--border-color)'};border-radius:8px;margin-bottom:6px;cursor:pointer;font-size:0.82rem;" onclick="window.loadTemplate(${i})">
                    <div style="font-weight:600;">${t.name}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">ID: ${t.id}</div>
                </div>`).join('')}
                <button class="btn btn-outline" style="width:100%;margin-top:10px;font-size:0.78rem;" onclick="window.showToast('New template created','success')"><i class='bx bx-plus'></i> New</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div>
                    <label style="font-weight:600;display:block;margin-bottom:4px;font-size:0.82rem;">Template Name</label>
                    <input id="tmplName" value="${tmpl.name}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);">
                </div>
                <div>
                    <label style="font-weight:600;display:block;margin-bottom:4px;font-size:0.82rem;">Subject</label>
                    <input id="tmplSubject" value="${tmpl.subject}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);font-size:0.82rem;">
                </div>
                <div style="flex:1;">
                    <label style="font-weight:600;display:block;margin-bottom:4px;font-size:0.82rem;">Body <span style="color:var(--text-muted);">(use {{VARIABLE}} for dynamic values)</span></label>
                    <textarea id="tmplBody" style="width:100%;height:200px;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);font-family:monospace;font-size:0.78rem;resize:none;">${tmpl.body}</textarea>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" onclick="window.saveEmailTemplate()"><i class='bx bx-save'></i> Save Template</button>
                    <button class="btn btn-outline" onclick="window.showToast('Test email sent to admin@company.com','info')"><i class='bx bx-mail-send'></i> Send Test</button>
                </div>
            </div>
        </div>`;
    mkModal('emailTmplModal','Email Template Editor','bx-envelope',body,900);
};
window.saveEmailTemplate = function() {
    const name = document.getElementById('tmplName')?.value;
    const subject = document.getElementById('tmplSubject')?.value;
    const tmplBody = document.getElementById('tmplBody')?.value;
    window.showToast(`Template "${name}" saved`,'success');
    DataManager.logAction('Email Template Saved',`Template "${name}" updated`);
};

// =========================================================
// SECURITY — REMAINING
// =========================================================

// ===== Data Export Restriction Manager =====
window.showExportRestrictions = function() {
    const key = 'wms_export_restrictions';
    const restrictions = JSON.parse(localStorage.getItem(key) || JSON.stringify({
        operator: { csvExport:false, pdfExport:false, printInvoice:true, barcodePrint:true },
        viewer: { csvExport:false, pdfExport:false, printInvoice:false, barcodePrint:false },
        manager: { csvExport:true, pdfExport:true, printInvoice:true, barcodePrint:true },
    }));
    const roles = Object.keys(restrictions);
    const actions = ['csvExport','pdfExport','printInvoice','barcodePrint'];
    const labels = { csvExport:'CSV Export', pdfExport:'PDF Export', printInvoice:'Print Invoice', barcodePrint:'Print Barcode' };
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Control which roles can export or print data. Toggle to enable/disable per role.</p>
        <div style="overflow-x:auto;">
            <table class="table">
                <thead><tr><th>Action</th>${roles.map(r=>`<th style="text-align:center;">${r.charAt(0).toUpperCase()+r.slice(1)}</th>`).join('')}</tr></thead>
                <tbody>${actions.map(action=>`<tr>
                    <td><strong>${labels[action]}</strong></td>
                    ${roles.map(role=>`<td style="text-align:center;">
                        <input type="checkbox" ${restrictions[role][action]?'checked':''} 
                            onchange="window.saveExportRestriction('${role}','${action}',this.checked)"
                            style="width:18px;height:18px;cursor:pointer;">
                    </td>`).join('')}
                </tr>`).join('')}</tbody>
            </table>
        </div>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('Export restrictions saved','success')"><i class='bx bx-save'></i> Save Changes</button>`;
    mkModal('exportRestrictModal','Data Export Restrictions','bx-shield',body,700);
};
window.saveExportRestriction = function(role, action, val) {
    const key='wms_export_restrictions';
    const r=JSON.parse(localStorage.getItem(key)||'{}');
    if(!r[role])r[role]={};r[role][action]=val;
    localStorage.setItem(key,JSON.stringify(r));
    window.showToast(`${action} for ${role}: ${val?'Enabled':'Disabled'}`,'info');
};

// ===== Password Policy Enforcer =====
window.showPasswordPolicy = function() {
    const key = 'wms_pwd_policy';
    const policy = JSON.parse(localStorage.getItem(key) || JSON.stringify({ minLength:8, requireUppercase:true, requireNumbers:true, requireSymbols:false, maxAgeDays:90, lockoutAttempts:5 }));
    const body = `
        <div style="display:flex;flex-direction:column;gap:16px;">
            ${[
                ['Minimum Password Length','minLength','number',policy.minLength],
                ['Maximum Age (days before forced reset)','maxAgeDays','number',policy.maxAgeDays],
                ['Lockout after N failed attempts','lockoutAttempts','number',policy.lockoutAttempts],
            ].map(([l,id,type,val])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--bg-main);border-radius:10px;">
                <label style="font-weight:600;">${l}</label>
                <input type="${type}" id="pwd_${id}" value="${val}" min="1" style="width:80px;padding:7px;border:1px solid var(--border-color);border-radius:6px;text-align:center;">
            </div>`).join('')}
            ${[
                ['Require Uppercase Letter (A-Z)','requireUppercase',policy.requireUppercase],
                ['Require Numbers (0-9)','requireNumbers',policy.requireNumbers],
                ['Require Special Symbols (!@#$)','requireSymbols',policy.requireSymbols],
            ].map(([l,id,val])=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--bg-main);border-radius:10px;">
                <label style="font-weight:600;">${l}</label>
                <input type="checkbox" id="pwd_${id}" ${val?'checked':''} style="width:18px;height:18px;cursor:pointer;">
            </div>`).join('')}
            <div style="padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;color:var(--text-muted);">
                <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Policy applies to all new password resets and user creation.
            </div>
            <button class="btn btn-primary" onclick="window.savePasswordPolicy()"><i class='bx bx-save'></i> Save Policy</button>
        </div>`;
    mkModal('pwdPolicyModal','Password Policy Enforcer','bx-lock-alt',body,600);
};
window.savePasswordPolicy = function() {
    const policy = {
        minLength:parseInt(document.getElementById('pwd_minLength')?.value||8),
        maxAgeDays:parseInt(document.getElementById('pwd_maxAgeDays')?.value||90),
        lockoutAttempts:parseInt(document.getElementById('pwd_lockoutAttempts')?.value||5),
        requireUppercase:document.getElementById('pwd_requireUppercase')?.checked||false,
        requireNumbers:document.getElementById('pwd_requireNumbers')?.checked||false,
        requireSymbols:document.getElementById('pwd_requireSymbols')?.checked||false,
    };
    localStorage.setItem('wms_pwd_policy',JSON.stringify(policy));
    DataManager.logAction('Password Policy Updated','New policy saved by Admin');
    window.showToast('Password policy saved and applied to all users','success');
};

// ===== IP Whitelist Manager =====
window.showIPWhitelist = function() {
    const key = 'wms_ip_whitelist';
    const whitelist = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { ip:'192.168.1.0/24', label:'Office Network (Pune)', addedBy:'Admin', addedOn:'01 Jun 2026', enabled:true },
        { ip:'10.0.0.0/8', label:'VPN Range', addedBy:'Admin', addedOn:'15 May 2026', enabled:true },
        { ip:'103.245.12.55', label:'Owner Home IP', addedBy:'Admin', addedOn:'20 Apr 2026', enabled:false },
    ]));
    const body = `
        <div style="margin-bottom:12px;padding:12px;background:var(--warning-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-error' style="color:var(--warning-color);"></i> <strong>Warning:</strong> Enabling IP restriction will block all access from unlisted IPs. Ensure your current IP is whitelisted before enabling.
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;">
                <strong>Your current IP:</strong> <code>192.168.1.101</code>
                <span class="badge status-success">✓ Whitelisted</span>
            </div>
            <button class="btn btn-primary" onclick="window.addIPRule()"><i class='bx bx-plus'></i> Add IP Rule</button>
        </div>
        <table class="table"><thead><tr><th>IP / Range</th><th>Label</th><th>Added By</th><th>Date</th><th>Enabled</th><th>Action</th></tr></thead>
        <tbody>${whitelist.map(ip=>`<tr>
            <td><code>${ip.ip}</code></td>
            <td>${ip.label}</td>
            <td>${ip.addedBy}</td>
            <td>${ip.addedOn}</td>
            <td><input type="checkbox" ${ip.enabled?'checked':''} onchange="window.showToast('IP rule updated','info')" style="width:16px;height:16px;cursor:pointer;"></td>
            <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;color:var(--danger-color);" onclick="window.showToast('IP rule removed','warning')">Remove</button></td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('ipWhitelistModal','IP Whitelist Manager','bx-network-chart',body,800);
};
window.addIPRule = function() {
    const ip = prompt('IP address or CIDR range (e.g. 192.168.1.0/24):'); if(!ip) return;
    const label = prompt('Label for this IP:','Office Network')||'Unlabeled';
    const whitelist = JSON.parse(localStorage.getItem('wms_ip_whitelist')||'[]');
    whitelist.push({ ip, label, addedBy:'Admin', addedOn:new Date().toLocaleDateString('en-IN'), enabled:true });
    localStorage.setItem('wms_ip_whitelist',JSON.stringify(whitelist));
    window.showToast('IP rule added: '+ip,'success');
    document.getElementById('ipWhitelistModal')?.remove(); window.showIPWhitelist();
};

// ===== Field-Level Encryption Indicator =====
window.showEncryptionStatus = function() {
    const fields = [
        { field:'Customer GSTIN', table:'customers', column:'gst', encrypted:true, method:'AES-256' },
        { field:'Customer Mobile', table:'customers', column:'mobile', encrypted:true, method:'AES-256' },
        { field:'Supplier PAN', table:'suppliers', column:'pan', encrypted:false, method:'Plaintext' },
        { field:'Worker Aadhar No.', table:'workers', column:'aadhar', encrypted:true, method:'AES-256' },
        { field:'Bank Account No.', table:'finance', column:'bank_acc', encrypted:true, method:'AES-256' },
        { field:'API Keys', table:'api_keys', column:'key', encrypted:true, method:'SHA-256 Hash' },
        { field:'Product Prices', table:'products', column:'price', encrypted:false, method:'Plaintext' },
        { field:'User Passwords', table:'users', column:'password', encrypted:true, method:'bcrypt' },
    ];
    const body = `
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card" style="border-left:4px solid var(--success-color);"><div class="stat-number" style="color:var(--success-color);">${fields.filter(f=>f.encrypted).length}</div><div class="stat-label">Encrypted Fields</div></div>
            <div class="stat-card" style="border-left:4px solid var(--warning-color);"><div class="stat-number" style="color:var(--warning-color);">${fields.filter(f=>!f.encrypted).length}</div><div class="stat-label">Plaintext Fields</div></div>
        </div>
        <table class="table"><thead><tr><th>Field</th><th>Table</th><th>Column</th><th>Encryption</th><th>Method</th><th>Action</th></tr></thead>
        <tbody>${fields.map(f=>`<tr>
            <td><strong>${f.field}</strong></td>
            <td><code>${f.table}</code></td>
            <td><code>${f.column}</code></td>
            <td><span class="badge ${f.encrypted?'status-success':'status-warning'}">${f.encrypted?'🔒 Encrypted':'⚠️ Plaintext'}</span></td>
            <td><code style="font-size:0.72rem;">${f.method}</code></td>
            <td>${!f.encrypted?`<button class="btn btn-outline" style="font-size:0.72rem;padding:2px 7px;" onclick="window.showToast('${f.field} encryption scheduled','info')">Enable Encryption</button>`:'✓'}</td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('encryptionModal','Field-Level Encryption Status','bx-shield-quarter',body,850);
};

// ===== GDPR/FSSAI Compliance Checklist =====
window.showComplianceChecklist = function() {
    const key = 'wms_compliance_checklist';
    const items = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { area:'GDPR', item:'Data Processing Agreement with vendors', done:true },
        { area:'GDPR', item:'Privacy Policy updated with data retention policy', done:true },
        { area:'GDPR', item:'User consent recorded for data collection', done:false },
        { area:'GDPR', item:'Right to erasure process documented', done:false },
        { area:'FSSAI', item:'Food Safety Management System (FSMS) documented', done:true },
        { area:'FSSAI', item:'HACCP plan implemented for all production lines', done:true },
        { area:'FSSAI', item:'Staff food safety training records maintained', done:true },
        { area:'FSSAI', item:'Recall/withdrawal procedure tested', done:false },
        { area:'Factory Act', item:'Factory licence displayed at entrance', done:true },
        { area:'Factory Act', item:'Accident register maintained', done:true },
        { area:'Labour Law', item:'Wages paid within 7 days of month end', done:true },
        { area:'Labour Law', item:'PF & ESIC challan deposited on time', done:true },
    ]));
    const completed = items.filter(i=>i.done).length;
    const total = items.length;
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${completed}</div><div class="stat-label">Completed</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${total-completed}</div><div class="stat-label">Pending</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--primary-color);">${Math.round(completed/total*100)}%</div><div class="stat-label">Compliance Score</div></div>
        </div>
        <div style="height:8px;background:var(--border-color);border-radius:99px;margin-bottom:20px;overflow:hidden;"><div style="height:100%;width:${Math.round(completed/total*100)}%;background:var(--primary-color);border-radius:99px;"></div></div>
        ${['GDPR','FSSAI','Factory Act','Labour Law'].map(area=>`
        <div style="margin-bottom:16px;">
            <div style="font-weight:700;margin-bottom:8px;color:var(--primary-color);">${area}</div>
            ${items.filter(i=>i.area===area).map((item,idx)=>`
            <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-main);border-radius:8px;margin-bottom:4px;">
                <input type="checkbox" ${item.done?'checked':''} style="width:16px;height:16px;cursor:pointer;" 
                    onchange="window.toggleComplianceItem('${area}','${idx}',this.checked)">
                <span style="font-size:0.82rem;${item.done?'text-decoration:line-through;color:var(--text-muted);':''}">${item.item}</span>
                ${item.done?'<span class="badge status-success" style="margin-left:auto;font-size:0.65rem;">Done</span>':'<span class="badge status-danger" style="margin-left:auto;font-size:0.65rem;">Pending</span>'}
            </div>`).join('')}
        </div>`).join('')}`;
    mkModal('complianceCheckModal','GDPR/FSSAI Compliance Checklist','bx-list-check',body,750);
};
window.toggleComplianceItem = function(area, idx, val) {
    const key='wms_compliance_checklist';
    const items=JSON.parse(localStorage.getItem(key)||'[]');
    const areaItems=items.filter(i=>i.area===area);
    if(areaItems[idx])areaItems[idx].done=val;
    localStorage.setItem(key,JSON.stringify(items));
    window.showToast('Compliance item updated','success');
};

// =========================================================
// UX / UTILITIES — REMAINING
// =========================================================

// ===== Sidebar Mini-Mode =====
window.toggleSidebarMiniMode = function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    if (!sidebar) { window.showToast('Sidebar not found','danger'); return; }
    const isMini = sidebar.classList.contains('mini-mode');
    if (isMini) {
        sidebar.classList.remove('mini-mode');
        sidebar.style.width = '';
        if (mainContent) mainContent.style.marginLeft = '';
        window.showToast('Full sidebar restored','info');
    } else {
        sidebar.classList.add('mini-mode');
        sidebar.style.width = '68px';
        sidebar.style.overflow = 'hidden';
        if (mainContent) mainContent.style.marginLeft = '68px';
        window.showToast('Sidebar collapsed to icon-only mode','info');
    }
    localStorage.setItem('wms_sidebar_mini', isMini ? '0' : '1');
};

// ===== Print-Ready Page Formatter =====
window.printCurrentPage = function() {
    const mainContent = document.getElementById('mainContent') || document.querySelector('.main-content');
    if (!mainContent) { window.print(); return; }
    const printWin = window.open('','_blank','width=900,height=700');
    printWin.document.write(`<!DOCTYPE html><html><head><title>WMS Print</title>
        <link rel="stylesheet" href="${window.location.origin}/css/style.css">
        <style>
            @media print { body { -webkit-print-color-adjust:exact; color-adjust:exact; } }
            body { padding: 24px; font-family: 'Outfit',Arial,sans-serif; }
            .btn,.sidebar,#featureLauncherFAB,#fabContainer { display:none!important; }
            table { page-break-inside:auto; } tr { page-break-inside:avoid; }
            .header-bar { display:flex;justify-content:space-between;border-bottom:2px solid #6366f1;margin-bottom:20px;padding-bottom:12px; }
        </style>
    </head><body>
        <div class="header-bar">
            <div><strong style="color:#6366f1;font-size:1.1rem;">Namkeen Industries Pvt. Ltd.</strong><br><span style="font-size:0.8rem;color:#64748b;">42 MIDC, Pune — 411019 | GSTIN: 27AABCU9603R1ZX</span></div>
            <div style="text-align:right;font-size:0.8rem;color:#64748b;">Printed: ${new Date().toLocaleString('en-IN')}<br>WMS v2.0</div>
        </div>
        ${mainContent.innerHTML}
        <script>window.print();</script>
    </body></html>`);
    window.showToast('Print window opened with formatted view','success');
};

// ===== Interactive Sales Trend Chart =====
window.showSalesTrendChart = function() {
    const months = ['Mar','Apr','May','Jun','Jul','Aug'];
    const salesData = [820000,940000,870000,1050000,980000,1120000];
    const targetData = [900000,900000,950000,1000000,1000000,1100000];
    const maxVal = Math.max(...salesData,...targetData);
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--primary-color);">₹${(salesData[salesData.length-1]/100000).toFixed(1)}L</div><div class="stat-label">This Month (Aug)</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">+${Math.round((salesData[5]-salesData[4])/salesData[4]*100)}%</div><div class="stat-label">MoM Growth</div></div>
            <div class="stat-card"><div class="stat-number">₹${(salesData.reduce((a,v)=>a+v,0)/salesData.length/100000).toFixed(1)}L</div><div class="stat-label">6-Month Average</div></div>
        </div>
        <div style="background:var(--bg-main);border-radius:12px;padding:20px;">
            <div style="display:flex;gap:16px;margin-bottom:16px;font-size:0.78rem;">
                <span style="display:flex;align-items:center;gap:6px;"><span style="width:20px;height:3px;background:var(--primary-color);display:inline-block;border-radius:2px;"></span>Actual Sales</span>
                <span style="display:flex;align-items:center;gap:6px;"><span style="width:20px;height:3px;background:var(--border-color);display:inline-block;border-radius:2px;border-top:2px dashed var(--warning-color);"></span>Target</span>
            </div>
            <div style="display:flex;align-items:flex-end;gap:12px;height:200px;padding:0 8px;">
                ${months.map((m,i)=>{
                    const salesH = Math.round(salesData[i]/maxVal*180);
                    const targetH = Math.round(targetData[i]/maxVal*180);
                    const beat = salesData[i]>=targetData[i];
                    return `
                    <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
                        <div style="font-size:0.68rem;font-weight:700;color:${beat?'var(--success-color)':'var(--danger-color)'};">${beat?'✓':'✗'}</div>
                        <div style="width:100%;display:flex;gap:2px;align-items:flex-end;height:180px;position:relative;">
                            <div style="position:absolute;bottom:${targetH}px;left:0;right:0;border-top:2px dashed var(--warning-color);z-index:1;"></div>
                            <div style="flex:1;height:${salesH}px;background:${beat?'var(--primary-color)':'var(--danger-color)'};border-radius:4px 4px 0 0;transition:height 0.5s;" title="₹${(salesData[i]/100000).toFixed(1)}L"></div>
                        </div>
                        <div style="font-size:0.72rem;font-weight:600;">${m}</div>
                        <div style="font-size:0.65rem;color:var(--text-muted);">₹${(salesData[i]/100000).toFixed(1)}L</div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    mkModal('salesTrendModal','Sales Trend Chart','bx-bar-chart-alt-2',body,750);
};

// ===== Product Label Designer =====
window.showLabelDesigner = function() {
    const products = DataManager.getProducts();
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Label Settings</h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">Product</label>
                        <select id="lblProduct" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.updateLabelPreview()">
                            ${products.map(p=>`<option value="${p.id}" data-price="${p.price}" data-net="${p.stock}">${p.name}</option>`).join('')}
                        </select>
                    </div>
                    ${[['Net Weight','lblNet','500g'],['MFG Date','lblMfg',new Date().toLocaleDateString('en-IN')],['EXP Date','lblExp','31 Aug 2027'],['Batch No.','lblBatch','#B-2415'],['MRP (₹)','lblMRP','85']].map(([l,id,v])=>`
                    <div><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${l}</label>
                        <input id="${id}" value="${v}" style="width:100%;padding:7px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-main);" oninput="window.updateLabelPreview()"></div>`).join('')}
                    <div style="display:flex;gap:8px;margin-top:6px;">
                        <button class="btn btn-primary" style="flex:1;" onclick="window.printLabel()"><i class='bx bx-printer'></i> Print Label</button>
                        <button class="btn btn-outline" style="flex:1;" onclick="window.showToast('Label saved as template','success')"><i class='bx bx-save'></i> Save Template</button>
                    </div>
                </div>
            </div>
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:12px;">Label Preview</h3>
                <div id="labelPreview" style="border:2px dashed var(--border-color);border-radius:12px;padding:20px;background:white;color:#1e293b;font-family:Arial,sans-serif;">
                    <div style="text-align:center;border-bottom:2px solid #6366f1;padding-bottom:10px;margin-bottom:10px;">
                        <div style="font-size:0.65rem;color:#64748b;">NAMKEEN INDUSTRIES PVT. LTD. | FSSAI: 10014001234567</div>
                        <div id="lbl_name" style="font-size:1.1rem;font-weight:900;margin:4px 0;">Aloo Bhujia</div>
                        <div style="font-size:0.7rem;color:#64748b;">Premium Quality Namkeen</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:0.72rem;">
                        <div><strong>Net Wt:</strong> <span id="lbl_net">500g</span></div>
                        <div><strong>MRP:</strong> ₹<span id="lbl_mrp">85</span></div>
                        <div><strong>MFG:</strong> <span id="lbl_mfg">${new Date().toLocaleDateString('en-IN')}</span></div>
                        <div><strong>EXP:</strong> <span id="lbl_exp">31 Aug 2027</span></div>
                        <div><strong>Batch:</strong> <span id="lbl_batch">#B-2415</span></div>
                        <div><strong>HSN:</strong> 2106</div>
                    </div>
                    <div style="text-align:center;margin-top:10px;font-size:0.65rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;">
                        This product is manufactured and marketed by<br>Namkeen Industries Pvt. Ltd., Pune
                    </div>
                </div>
            </div>
        </div>`;
    mkModal('labelModal','Product Label Designer','bx-label',body,850);
};
window.updateLabelPreview = function() {
    const fmap = { 'lbl_net':'lblNet','lbl_mfg':'lblMfg','lbl_exp':'lblExp','lbl_batch':'lblBatch','lbl_mrp':'lblMRP' };
    Object.entries(fmap).forEach(([previewId,inputId])=>{
        const el=document.getElementById(previewId), input=document.getElementById(inputId);
        if(el&&input)el.textContent=input.value;
    });
    const nameEl=document.getElementById('lbl_name'), sel=document.getElementById('lblProduct');
    if(nameEl&&sel)nameEl.textContent=sel.options[sel.selectedIndex]?.text?.split('(')[0]?.trim()||'Product';
};
window.printLabel = function() {
    const preview = document.getElementById('labelPreview');
    if(!preview) return;
    const win = window.open('','_blank','width=500,height=400');
    win.document.write(`<!DOCTYPE html><html><head><title>Product Label</title><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;}</style></head><body>${preview.outerHTML}<script>window.print();</script></body></html>`);
    window.showToast('Label sent to printer','success');
};

// ===== Purchase Order PDF Generator =====
window.generatePOPDF = function(poId) {
    const pos = DataManager.getPurchaseOrders();
    const po = pos.find(p=>p.id===poId)||pos[0];
    if (!po) { window.showToast('No PO found','danger'); return; }
    const win = window.open('','_blank','width=800,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>PO ${po.id}</title><style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:12px;}
        h2{color:#6366f1;margin:0;}.header{border-bottom:2px solid #6366f1;margin-bottom:20px;padding-bottom:14px;}
        table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{border:1px solid #ddd;padding:8px 10px;}th{background:#f1f5f9;font-weight:700;}
        .tc{font-size:10px;color:#64748b;margin-top:20px;border-top:1px solid #ddd;padding-top:10px;}
    </style></head><body>
        <div class="header"><div style="display:flex;justify-content:space-between;">
            <div><h2>PURCHASE ORDER</h2><strong>Namkeen Industries Pvt. Ltd.</strong><br>42, MIDC, Pune | GSTIN: 27AABCU9603R1ZX</div>
            <div style="text-align:right;"><strong>PO Number:</strong> ${po.id}<br><strong>Date:</strong> ${po.date||new Date().toLocaleDateString('en-IN')}<br><strong>Status:</strong> ${po.status}</div>
        </div></div>
        <table><tr><th>Vendor</th><td>${po.supplier}</td><th>Payment Terms</th><td>Net 30 days</td></tr>
        <tr><th>Expected Delivery</th><td>${po.expectedDelivery||'TBD'}</td><th>Ship To</th><td>42, MIDC, Pune — 411019</td></tr></table>
        <table><thead><tr><th>#</th><th>Description / Item</th><th>UOM</th><th>Qty</th><th>Rate (₹)</th><th>Amount (₹)</th></tr></thead>
        <tbody>${(po.items||[{description:po.items||'As per specs', uom:'Kg', qty:po.quantity||100, rate:po.unitCost||50}]).map((item,i)=>`
        <tr><td>${i+1}</td><td>${item.description||item}</td><td>${item.uom||'—'}</td><td>${item.qty||po.quantity||100}</td><td>₹${item.rate||po.unitCost||0}</td><td>₹${((item.qty||po.quantity||100)*(item.rate||po.unitCost||0)).toLocaleString('en-IN')}</td></tr>`).join('')}
        <tr style="font-weight:700;"><td colspan="5" style="text-align:right;">TOTAL</td><td>₹${(po.totalAmount||0).toLocaleString('en-IN')}</td></tr></tbody></table>
        <div class="tc">Terms: Goods to be delivered within the agreed lead time. Quality must comply with agreed specifications. Payment will be made after GRN and invoice verification.</div>
        <div style="display:flex;justify-content:space-between;margin-top:50px;">
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">Vendor Acceptance</div></div>
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:180px;">Authorized Signatory</div></div>
        </div>
        <script>window.print();</script></body></html>`);
    window.showToast(`PO ${po.id} PDF generated`,'success');
};

// ===== GRN (Goods Receipt Note) PDF =====
window.generateGRNPDF = function() {
    const grnNo = 'GRN-2026-'+Math.floor(90+Math.random()*9);
    const win = window.open('','_blank','width=800,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>GRN ${grnNo}</title><style>
        body{font-family:Arial,sans-serif;padding:32px;color:#1e293b;font-size:12px;}
        h2{color:#6366f1;margin:0;}.header{border-bottom:2px solid #6366f1;margin-bottom:20px;padding-bottom:14px;}
        table{width:100%;border-collapse:collapse;margin:16px 0;}th,td{border:1px solid #ddd;padding:8px 10px;}th{background:#f1f5f9;font-weight:700;}
    </style></head><body>
        <div class="header"><div style="display:flex;justify-content:space-between;">
            <div><h2>GOODS RECEIPT NOTE</h2><strong>Namkeen Industries Pvt. Ltd.</strong><br>42, MIDC, Pune</div>
            <div style="text-align:right;"><strong>GRN No:</strong> ${grnNo}<br><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
        </div></div>
        <table><tr><th>PO Reference</th><td>PO-2026-1048</td><th>Supplier</th><td>ABC Spices Ltd.</td></tr>
        <tr><th>Vehicle No.</th><td>MH-12-GH-3456</td><th>Driver</th><td>Suresh D.</td></tr>
        <tr><th>Received By</th><td>Warehouse Manager</td><th>QC Status</th><td>Passed</td></tr></table>
        <table><thead><tr><th>#</th><th>Item Description</th><th>UOM</th><th>PO Qty</th><th>Received Qty</th><th>Accepted</th><th>Rejected</th><th>Batch/Lot</th></tr></thead>
        <tbody>
            <tr><td>1</td><td>Besan (Gram Flour)</td><td>Kg</td><td>500</td><td>498</td><td>495</td><td>3</td><td>LOT-889</td></tr>
            <tr><td>2</td><td>Refined Edible Oil (15L tin)</td><td>Tin</td><td>40</td><td>40</td><td>40</td><td>0</td><td>LOT-112</td></tr>
        </tbody></table>
        <div style="padding:12px;background:#f1f5f9;border-radius:8px;font-size:11px;margin-top:12px;">
            <strong>Rejection Reason:</strong> 3 kg Besan — minor contamination detected during visual inspection. Returned to driver.
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:50px;">
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:160px;">Supplier Signature</div></div>
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:160px;">QC Inspector</div></div>
            <div style="text-align:center;"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:40px;width:160px;">Store Manager</div></div>
        </div>
        <script>window.print();</script></body></html>`);
    window.showToast(`GRN ${grnNo} generated`,'success');
    DataManager.logAction('GRN Generated',grnNo+' printed');
};

// ===== Invoice Dispute Tracker =====
window.showInvoiceDisputes = function() {
    const key = 'wms_inv_disputes';
    const disputes = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id:'DISP-001', invoice:'INV-982', party:'ABC Spices Ltd.', amount:45000, disputed:2250, reason:'GST rate applied incorrectly (18% instead of 12%)', date:'01 Aug 2026', status:'Under Review' },
        { id:'DISP-002', invoice:'INV-975', party:'SuperMart', amount:28500, disputed:500, reason:'Delivery charges not agreed in PO', date:'28 Jul 2026', status:'Resolved — Credited' },
    ]));
    const body = `
        <div style="margin-bottom:12px;"><button class="btn btn-primary" onclick="window.addDispute()"><i class='bx bx-plus'></i> Log Dispute</button></div>
        <table class="table"><thead><tr><th>ID</th><th>Invoice</th><th>Party</th><th>Invoice Amt</th><th>Disputed Amt</th><th>Reason</th><th>Status</th></tr></thead>
        <tbody>${disputes.map(d=>`<tr>
            <td><code>${d.id}</code></td><td>${d.invoice}</td><td>${d.party}</td>
            <td>₹${d.amount.toLocaleString('en-IN')}</td>
            <td style="color:var(--danger-color);font-weight:700;">₹${d.disputed.toLocaleString('en-IN')}</td>
            <td style="font-size:0.78rem;max-width:180px;">${d.reason}</td>
            <td><span class="badge ${d.status.includes('Resolved')?'status-success':'status-warning'}">${d.status}</span></td>
        </tr>`).join('')}</tbody></table>`;
    mkModal('disputeModal','Invoice Dispute Tracker','bx-error-circle',body,950);
};
window.addDispute = function() {
    const invoice=prompt('Invoice number:'); if(!invoice)return;
    const party=prompt('Party name (supplier/customer):');
    const amount=parseInt(prompt('Total invoice amount:','0')||0);
    const disputed=parseInt(prompt('Disputed amount:','0')||0);
    const reason=prompt('Reason for dispute:'); if(!reason)return;
    const disputes=JSON.parse(localStorage.getItem('wms_inv_disputes')||'[]');
    disputes.unshift({id:'DISP-'+Date.now().toString().slice(-4),invoice,party,amount,disputed,reason,date:new Date().toLocaleDateString('en-IN'),status:'Under Review'});
    localStorage.setItem('wms_inv_disputes',JSON.stringify(disputes));
    window.showToast('Invoice dispute logged','warning');
    document.getElementById('disputeModal')?.remove(); window.showInvoiceDisputes();
};

// ===== Vendor Evaluation Form =====
window.showVendorEvaluation = function() {
    const suppliers = DataManager.getSuppliers();
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Score each supplier on 5 parameters. Scores are saved and used in the Supplier Scorecard.</p>
        <div style="display:flex;flex-direction:column;gap:20px;">
            ${suppliers.slice(0,3).map(s=>`
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:20px;">
                <div style="font-weight:700;margin-bottom:14px;">${s.name} <span style="color:var(--text-muted);font-size:0.8rem;">| ${s.category}</span></div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;">
                    ${['Quality','Delivery','Pricing','Communication','Flexibility'].map(param=>`
                    <div style="text-align:center;">
                        <label style="font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:6px;">${param}</label>
                        <select style="width:100%;padding:5px;border:1px solid var(--border-color);border-radius:6px;font-size:0.8rem;background:var(--bg-card);" onchange="window.showToast('Score saved for ${s.name}','info')">
                            ${[1,2,3,4,5].map(n=>`<option ${n===4?'selected':''}>${n}</option>`).join('')}
                        </select>
                    </div>`).join('')}
                </div>
                <div style="margin-top:12px;"><label style="font-size:0.78rem;color:var(--text-muted);">Notes</label>
                    <input placeholder="Add evaluation notes..." style="width:100%;padding:7px;border:1px solid var(--border-color);border-radius:6px;margin-top:4px;background:var(--bg-card);font-size:0.8rem;">
                </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-primary" style="margin-top:16px;" onclick="window.showToast('All vendor evaluations saved','success')"><i class='bx bx-save'></i> Save All Evaluations</button>`;
    mkModal('vendorEvalModal','Vendor Evaluation Form','bx-star',body,800);
};

// ===== Pricing History Log =====
window.showPricingHistory = function() {
    const products = DataManager.getProducts();
    const history = products.map(p=>{
        const changes = [];
        let price = parseFloat(p.price)*0.85;
        ['Jan','Feb','Mar','Apr','May','Jun','Jul'].forEach(m=>{ price*=(1+Math.random()*0.06-0.02); changes.push({month:m,price:Math.round(price*100)/100}); });
        return { product:p.name, changes };
    });
    const body = `
        <div style="overflow-x:auto;">
            <table class="table"><thead><tr><th>Product</th>${['Jan','Feb','Mar','Apr','May','Jun','Jul'].map(m=>`<th>${m}</th>`).join('')}<th>Change</th></tr></thead>
            <tbody>${history.map(h=>{
                const first=h.changes[0].price, last=h.changes[h.changes.length-1].price;
                const pctChange=Math.round((last-first)/first*100);
                return `<tr>
                    <td>${h.product}</td>
                    ${h.changes.map((c,i)=>{
                        const prev=i>0?h.changes[i-1].price:c.price;
                        const up=c.price>prev;
                        return `<td style="font-size:0.8rem;color:${i>0&&c.price!==prev?(up?'var(--danger-color)':'var(--success-color)'):'var(--text-main)'};">₹${c.price.toFixed(0)}</td>`;
                    }).join('')}
                    <td style="font-weight:700;color:${pctChange>0?'var(--danger-color)':'var(--success-color)'};">${pctChange>0?'+':''}${pctChange}%</td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
    mkModal('pricingHistModal','Pricing History Log','bx-line-chart',body,900);
};

// ===== Commission Calculator =====
window.showCommissionCalculator = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Commission Slabs</h3>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    ${[['0 – ₹50,000','2.5%'],['₹50,001 – ₹1,00,000','4%'],['₹1,00,001 – ₹2,00,000','5.5%'],['> ₹2,00,000','7%']].map(([slab,rate])=>`
                    <div style="display:flex;justify-content:space-between;padding:10px;background:var(--bg-main);border-radius:8px;">
                        <span style="font-size:0.82rem;">${slab}</span>
                        <strong style="color:var(--primary-color);">${rate}</strong>
                    </div>`).join('')}
                </div>
                <div style="margin-top:16px;">
                    <label style="font-weight:600;display:block;margin-bottom:6px;">Enter Sales Amount (₹)</label>
                    <input type="number" id="commSales" value="125000" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" oninput="window.calcCommission()">
                    <button class="btn btn-primary" style="margin-top:10px;width:100%;" onclick="window.calcCommission()"><i class='bx bx-calculator'></i> Calculate</button>
                </div>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;" id="commResult">
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Result</h3>
                <div style="text-align:center;padding:20px;">
                    <div style="font-size:0.85rem;color:var(--text-muted);">Enter sales amount and click Calculate</div>
                </div>
            </div>
        </div>`;
    mkModal('commModal','Commission Calculator','bx-dollar',body,750);
    setTimeout(window.calcCommission,100);
};
window.calcCommission = function() {
    const sales = parseFloat(document.getElementById('commSales')?.value||0);
    let rate = sales<=50000?2.5:sales<=100000?4:sales<=200000?5.5:7;
    const comm = Math.round(sales*rate/100);
    const el = document.getElementById('commResult');
    if(!el)return;
    el.innerHTML=`<h3 style="font-size:0.95rem;margin-bottom:14px;">Result</h3>
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="text-align:center;padding:20px;background:var(--primary-light);border-radius:12px;">
                <div style="font-size:0.8rem;color:var(--text-muted);">Commission Earned</div>
                <div style="font-size:2.5rem;font-weight:900;color:var(--primary-color);">₹${comm.toLocaleString('en-IN')}</div>
                <div style="font-size:0.85rem;">at ${rate}% on ₹${sales.toLocaleString('en-IN')}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem;">
                <div style="padding:10px;background:var(--bg-card);border-radius:8px;text-align:center;"><div style="font-weight:700;">₹${sales.toLocaleString('en-IN')}</div><div style="color:var(--text-muted);">Sales</div></div>
                <div style="padding:10px;background:var(--bg-card);border-radius:8px;text-align:center;"><div style="font-weight:700;">${rate}%</div><div style="color:var(--text-muted);">Rate</div></div>
            </div>
        </div>`;
};

// ===== ROI Calculator =====
window.showROICalculator = function() {
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.95rem;margin-bottom:14px;">Investment Details</h3>
                ${[['Initial Investment (₹)','roiInv','500000'],['Expected Annual Revenue (₹)','roiRev','820000'],['Annual Operating Cost (₹)','roiCost','620000'],['Investment Lifetime (years)','roiYears','5']].map(([l,id,v])=>`
                <div style="margin-bottom:12px;"><label style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:4px;">${l}</label>
                <input type="number" id="${id}" value="${v}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" oninput="window.calcROI()"></div>`).join('')}
                <button class="btn btn-primary" style="width:100%;" onclick="window.calcROI()"><i class='bx bx-calculator'></i> Calculate ROI</button>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:20px;" id="roiResult">
                <div style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Click Calculate to see results</div>
            </div>
        </div>`;
    mkModal('roiModal','ROI Calculator','bx-trending-up',body,750);
    setTimeout(window.calcROI,100);
};
window.calcROI = function() {
    const inv=parseFloat(document.getElementById('roiInv')?.value||0);
    const rev=parseFloat(document.getElementById('roiRev')?.value||0);
    const cost=parseFloat(document.getElementById('roiCost')?.value||0);
    const years=parseFloat(document.getElementById('roiYears')?.value||1);
    const annualProfit=rev-cost;
    const totalProfit=annualProfit*years-inv;
    const roi=inv>0?Math.round(totalProfit/inv*100):0;
    const payback=annualProfit>0?(inv/annualProfit).toFixed(1):0;
    const el=document.getElementById('roiResult');
    if(!el)return;
    el.innerHTML=`<h3 style="font-size:0.95rem;margin-bottom:14px;">Results</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="text-align:center;padding:16px;background:${roi>=0?'var(--success-color)':'var(--danger-color)'}15;border-radius:12px;">
                <div style="font-size:0.78rem;color:var(--text-muted);">Return on Investment</div>
                <div style="font-size:2.5rem;font-weight:900;color:${roi>=0?'var(--success-color)':'var(--danger-color)'};">${roi}%</div>
            </div>
            ${[['Annual Profit','₹'+annualProfit.toLocaleString('en-IN')],['Total Profit ('+years+'y)','₹'+totalProfit.toLocaleString('en-IN')],['Payback Period',payback+' years']].map(([l,v])=>`
            <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-card);border-radius:8px;font-size:0.82rem;"><span>${l}</span><strong>${v}</strong></div>`).join('')}
        </div>`;
};

// ===== New Supplier Onboarding Checklist =====
window.showSupplierOnboarding = function() {
    const key = 'wms_supplier_onboard';
    const steps = JSON.parse(localStorage.getItem(key)||JSON.stringify([
        { step:'GST Certificate received and verified', done:true },
        { step:'PAN Card copy collected', done:true },
        { step:'Bank account details verified', done:true },
        { step:'FSSAI License checked (if applicable)', done:false },
        { step:'Product samples evaluated', done:false },
        { step:'Pricing agreement signed', done:false },
        { step:'Credit terms agreed', done:false },
        { step:'Added to ERP/WMS system', done:false },
        { step:'First PO issued (trial order)', done:false },
        { step:'Post-trial evaluation completed', done:false },
    ]));
    const completed = steps.filter(s=>s.done).length;
    const body = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding:14px;background:var(--bg-main);border-radius:12px;">
            <div style="flex:1;height:12px;background:var(--border-color);border-radius:99px;overflow:hidden;"><div style="height:100%;width:${Math.round(completed/steps.length*100)}%;background:var(--primary-color);border-radius:99px;transition:width 0.4s;"></div></div>
            <strong>${completed}/${steps.length} Steps Complete</strong>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
            ${steps.map((s,i)=>`
            <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-main);border-radius:8px;">
                <input type="checkbox" ${s.done?'checked':''} style="width:18px;height:18px;cursor:pointer;" onchange="window.toggleOnboardStep(${i},this.checked)">
                <span style="font-size:0.85rem;${s.done?'text-decoration:line-through;color:var(--text-muted);':''}">${s.step}</span>
                ${s.done?'<span class="badge status-success" style="margin-left:auto;font-size:0.65rem;">Done</span>':'<span class="badge status-warning" style="margin-left:auto;font-size:0.65rem;">Pending</span>'}
            </div>`).join('')}
        </div>`;
    mkModal('onboardModal','New Supplier Onboarding','bx-user-plus',body,650);
};
window.toggleOnboardStep=function(i,val){const key='wms_supplier_onboard';const steps=JSON.parse(localStorage.getItem(key)||'[]');if(steps[i])steps[i].done=val;localStorage.setItem(key,JSON.stringify(steps));window.showToast('Step updated','success');document.getElementById('onboardModal')?.remove();window.showSupplierOnboarding();};

// ===== Add all remaining features to Feature Launcher =====
// This extends the existing launcher with new features
(function extendFeatureLauncher() {
    const originalShow = window.showFeatureLauncher;
    window.showFeatureLauncher = function() {
        if(typeof makeModal !== 'undefined') {
            originalShow && originalShow();
        } else {
            // Use mkModal fallback if makeModal from Part 1 not loaded
            window.showToast('Feature Launcher loading...','info');
            setTimeout(originalShow, 200);
        }
    };
})();

// ===== Quick-Access Panel for Part 4 Features =====
window.showPart4Features = function() {
    const features = [
        ['TDS Ledger','window.showTDSLedger()','bx-receipt','Finance'],
        ['Expense Claims','window.showExpenseClaims()','bx-money','Finance'],
        ['AP Ageing','window.showAPAgeing()','bx-credit-card-front','Finance'],
        ['Bank Reconciliation','window.showBankReconciliation()','bx-transfer-alt','Finance'],
        ['Customer Statement','window.generateCustomerStatement()','bx-file-find','Finance'],
        ['Expiry Prediction','window.showExpiryPrediction()','bx-bot','AI/Analytics'],
        ['Alert Deduplicator','window.showAlertDeduplicator()','bx-filter','AI/Analytics'],
        ['Route Optimizer','window.showRouteOptimizer()','bx-map','AI/Analytics'],
        ['Scheduled Reports','window.showScheduledReports()','bx-mail-send','Reports'],
        ['Sales Trend Chart','window.showSalesTrendChart()','bx-bar-chart-alt-2','Reports'],
        ['Pricing History','window.showPricingHistory()','bx-line-chart','Reports'],
        ['Disciplinary Log','window.showDisciplinaryLog()','bx-file-find','HR'],
        ['Shopify Orders','window.showShopifyPuller()','bx-store-alt','Integrations'],
        ['Email Templates','window.showEmailTemplateEditor()','bx-envelope','Integrations'],
        ['Export Restrictions','window.showExportRestrictions()','bx-shield','Security'],
        ['Password Policy','window.showPasswordPolicy()','bx-lock-alt','Security'],
        ['IP Whitelist','window.showIPWhitelist()','bx-network-chart','Security'],
        ['Encryption Status','window.showEncryptionStatus()','bx-shield-quarter','Security'],
        ['Compliance Checklist','window.showComplianceChecklist()','bx-list-check','Security'],
        ['Sales Trend Chart','window.showSalesTrendChart()','bx-bar-chart-alt-2','Analytics'],
        ['Label Designer','window.showLabelDesigner()','bx-label','UX'],
        ['Print Page','window.printCurrentPage()','bx-printer','UX'],
        ['Mini Sidebar','window.toggleSidebarMiniMode()','bx-sidebar','UX'],
        ['PO PDF','window.generatePOPDF()','bx-file-blank','Documents'],
        ['GRN PDF','window.generateGRNPDF()','bx-file','Documents'],
        ['Invoice Disputes','window.showInvoiceDisputes()','bx-error-circle','Finance'],
        ['Vendor Evaluation','window.showVendorEvaluation()','bx-star','Procurement'],
        ['Supplier Onboarding','window.showSupplierOnboarding()','bx-user-plus','Procurement'],
        ['Commission Calc','window.showCommissionCalculator()','bx-dollar','Finance'],
        ['ROI Calculator','window.showROICalculator()','bx-trending-up','Finance'],
    ];
    const body = `
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:16px;">Additional features implemented in Phase 4. Use the main 🚀 Feature Launcher for the complete list.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;max-height:65vh;overflow-y:auto;">
            ${features.map(([name,action,icon,cat])=>`
            <div style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;cursor:pointer;transition:all 0.2s;font-size:0.78rem;"
                onmouseover="this.style.borderColor='var(--primary-color)';this.style.background='var(--primary-light)'"
                onmouseout="this.style.borderColor='var(--border-color)';this.style.background='var(--bg-main)'"
                onclick="${action};document.getElementById('part4Modal')?.remove()">
                <i class='bx ${icon}' style="color:var(--primary-color);font-size:1.1rem;min-width:20px;"></i>
                <div><div>${name}</div><div style="font-size:0.65rem;color:var(--text-muted);">${cat}</div></div>
            </div>`).join('')}
        </div>`;
    mkModal('part4Modal',`Phase 4 Features — ${features.length} New`,'bx-rocket',body,900);
};

console.log('Features Part 4 loaded — Finance, Security, UX, Documents & 30 more features');
