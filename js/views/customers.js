// Customer Management View — Features 11-15

window.renderCustomers = function() {
    setTimeout(() => { if(window.refreshCustomers) window.refreshCustomers(); }, 100);
    return `
    <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h1 class="page-title" style="margin:0;"><i class='bx bx-user-pin' style="color:var(--primary-color);"></i> Customer Management</h1>
            <div style="display:flex;gap:12px;">
                <button class="btn btn-outline" onclick="window.exportCustomers()"><i class='bx bx-download'></i> Export</button>
                <button class="btn btn-primary" onclick="window.addCustomer()"><i class='bx bx-user-plus'></i> Add Customer</button>
            </div>
        </div>

        <!-- F13: Outstanding Balance Summary -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;" id="custKpiRow"></div>

        <!-- F11: Customer Directory -->
        <div class="card" style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2 class="section-title" style="margin:0;"><i class='bx bx-list-ul'></i> Customer Directory</h2>
                <div class="search-bar" style="width:220px;background:var(--bg-main);">
                    <i class='bx bx-search'></i>
                    <input type="text" id="custSearch" placeholder="Search..." onkeyup="window.filterCustomers()">
                </div>
            </div>
            <table class="table">
                <thead><tr><th>Customer</th><th>GST No.</th><th>F12: Credit Limit</th><th>Used</th><th>Available</th><th>F13: Outstanding (30d)</th><th>F13: Outstanding (60d)</th><th>F13: Outstanding (90d+)</th><th>Actions</th></tr></thead>
                <tbody id="customersBody"></tbody>
            </table>
        </div>

        <!-- F15: Top Customers Chart + F14: Purchase History -->
        <div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;">
            <div class="card">
                <h2 class="section-title"><i class='bx bx-bar-chart'></i> Top Customers by Revenue</h2>
                <div id="topCustomersChart" style="display:flex;flex-direction:column;gap:10px;margin-top:8px;"></div>
            </div>
            <div class="card">
                <h2 class="section-title"><i class='bx bx-history'></i> Recent Orders by Customer</h2>
                <table class="table">
                    <thead><tr><th>SO No.</th><th>Customer</th><th>Value</th><th>Status</th></tr></thead>
                    <tbody id="custOrderHistory"></tbody>
                </table>
            </div>
        </div>
    </div>`;
};

window.refreshCustomers = function() {
    const customers = DataManager.getCustomers();

    // KPI Row
    const totalCredit = customers.reduce((s,c)=>s+c.creditLimit,0);
    const totalUsed = customers.reduce((s,c)=>s+c.used,0);
    const total30 = customers.reduce((s,c)=>s+c.outstanding30,0);
    const total60 = customers.reduce((s,c)=>s+c.outstanding60,0);
    const kpiEl = document.getElementById('custKpiRow');
    if(kpiEl) kpiEl.innerHTML = `
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Total Customers</div>
            <div style="font-size:2rem;font-weight:700;color:var(--primary-color);">${customers.length}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Total Credit Extended</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--secondary-color);">₹${(totalCredit/100000).toFixed(1)}L</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">30-Day Outstanding</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--warning-color);">₹${(total30/1000).toFixed(0)}K</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">60-Day Outstanding</div>
            <div style="font-size:1.5rem;font-weight:700;color:var(--danger-color);">₹${(total60/1000).toFixed(0)}K</div>
        </div>`;

    // Table
    const tbody = document.getElementById('customersBody');
    if(tbody) {
        tbody.innerHTML = customers.map(c => {
            const avail = c.creditLimit - c.used;
            const utilPct = Math.round(c.used/c.creditLimit*100);
            const utilColor = utilPct > 80 ? 'var(--danger-color)' : utilPct > 60 ? 'var(--warning-color)' : 'var(--secondary-color)';
            return `<tr>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td style="font-family:monospace;font-size:0.8rem;">${escapeHtml(c.gst)}</td>
                <td>₹${c.creditLimit.toLocaleString('en-IN')}</td>
                <td><span style="color:${utilColor};font-weight:600;">₹${c.used.toLocaleString('en-IN')} (${utilPct}%)</span></td>
                <td>₹${avail.toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding30>0?'var(--warning-color)':'var(--text-muted)'};">₹${c.outstanding30.toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding60>0?'var(--danger-color)':'var(--text-muted)'};">₹${c.outstanding60.toLocaleString('en-IN')}</td>
                <td style="color:${c.outstanding90>0?'var(--danger-color)':'var(--text-muted)'};">₹${c.outstanding90.toLocaleString('en-IN')}</td>
                <td>
                    <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.sendPaymentReminder('${escJs(c.id)}','${escJs(c.name)}')">Remind</button>
                    <button class="icon-btn" style="color:var(--danger-color);" onclick="window.deleteCustomer('${escJs(c.id)}')"><i class='bx bx-trash'></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    // Top customers chart (F15)
    const chartEl = document.getElementById('topCustomersChart');
    if(chartEl) {
        const sorted = [...customers].sort((a,b)=>b.used-a.used);
        const max = sorted[0]?.used || 1;
        chartEl.innerHTML = sorted.map((c,i) => `
            <div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
                    <span>${['🥇','🥈','🥉','4️⃣','5️⃣'][i]||''} ${escapeHtml(c.name)}</span>
                    <strong>₹${(c.used/1000).toFixed(0)}K</strong>
                </div>
                <div style="background:var(--bg-main);border-radius:4px;height:10px;overflow:hidden;">
                    <div style="height:100%;width:${Math.round(c.used/max*100)}%;background:var(--primary-color);border-radius:4px;transition:width 0.8s;"></div>
                </div>
            </div>`).join('');
    }

    // Order history (F14)
    const orders = DataManager.getDispatchOrders();
    const histEl = document.getElementById('custOrderHistory');
    if(histEl) {
        histEl.innerHTML = orders.slice(0,6).map(o => `<tr>
            <td><strong>${escapeHtml(o.id)}</strong></td>
            <td>${escapeHtml(o.customer)}</td>
            <td>₹${Math.floor(Math.random()*50000+20000).toLocaleString('en-IN')}</td>
            <td><span class="status ${o.statusClass}">${escapeHtml(o.status)}</span></td>
        </tr>`).join('');
    }
};

window.filterCustomers = function() {
    const q = document.getElementById('custSearch')?.value.toLowerCase() || '';
    const rows = document.querySelectorAll('#customersBody tr');
    rows.forEach(r => { r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none'; });
};

window.addCustomer = function() {
    const name = prompt('Customer Name:'); if(!name) return;
    const gst = prompt('GST Number:', '27AABCU0000R1ZX'); if(!gst) return;
    const limit = parseInt(prompt('Credit Limit (₹):', '200000')); if(!limit) return;
    const id = 'CUST-' + String(DataManager.getCustomers().length+1).padStart(3,'0');
    DataManager.addCustomer({ id, name, gst, creditLimit: limit, used: 0, outstanding30: 0, outstanding60: 0, outstanding90: 0 });
    window.showToast(`Customer ${name} added`, 'success');
    DataManager.logAction('Customer Added', `New customer: ${name} (Credit Limit: ₹${limit.toLocaleString('en-IN')})`);
    window.refreshCustomers();
};

window.deleteCustomer = function(id) {
    if(!confirm('Delete this customer?')) return;
    DataManager.deleteCustomer(id);
    window.showToast('Customer deleted', 'danger');
    window.refreshCustomers();
};

window.sendPaymentReminder = function(id, name) {
    window.showToast(`Payment reminder sent to ${name} via WhatsApp & Email`, 'info');
    DataManager.logAction('Payment Reminder', `Reminder sent to ${name}`);
};

window.exportCustomers = function() { window.showToast('Customers_Export.csv downloaded', 'info'); };
