// Expense Management View — Features 16-20

window.renderExpenses = function() {
    setTimeout(() => { if(window.refreshExpenses) window.refreshExpenses(); }, 100);
    return `
    <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h1 class="page-title" style="margin:0;"><i class='bx bx-receipt' style="color:var(--primary-color);"></i> Expense Management</h1>
            <div style="display:flex;gap:12px;">
                <button class="btn btn-outline" onclick="window.exportExpenses()"><i class='bx bx-download'></i> Export CSV (F20)</button>
                <button class="btn btn-primary" onclick="window.addExpensePrompt()"><i class='bx bx-plus'></i> Log Expense (F16)</button>
            </div>
        </div>

        <!-- KPI Row -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;" id="expKpiRow"></div>

        <!-- F17: Budget vs Actual Chart -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px;">
            <div class="card">
                <h2 class="section-title"><i class='bx bx-bar-chart-alt-2'></i> Monthly Budget vs Actual (August 2026) (F17)</h2>
                <div id="budgetChart" style="display:flex;flex-direction:column;gap:12px;margin-top:8px;"></div>
            </div>
            <!-- F19: Cost Center Pie -->
            <div class="card">
                <h2 class="section-title"><i class='bx bx-pie-chart-alt'></i> Cost Center Breakdown (F19)</h2>
                <div id="costPie" style="display:flex;flex-direction:column;gap:8px;margin-top:8px;"></div>
            </div>
        </div>

        <!-- F16: Expense List + F18: Approval Queue -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;">
            <div class="card">
                <h2 class="section-title"><i class='bx bx-list-check'></i> All Expenses</h2>
                <table class="table">
                    <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th><th>Approver</th><th>Actions</th></tr></thead>
                    <tbody id="expensesBody"></tbody>
                </table>
            </div>
            <!-- F18: Approval Queue -->
            <div class="card">
                <h2 class="section-title"><i class='bx bx-check-shield'></i> Approval Queue (F18)</h2>
                <div id="approvalQueue" style="display:flex;flex-direction:column;gap:10px;"></div>
            </div>
        </div>
    </div>`;
};

window.refreshExpenses = function() {
    const expenses = DataManager.getExpenses();
    const total = expenses.reduce((s,e)=>s+e.amount, 0);
    const totalApproved = expenses.filter(e=>e.status==='Approved').reduce((s,e)=>s+e.amount, 0);
    const pending = expenses.filter(e=>e.status==='Pending').length;

    // KPI
    const kpiEl = document.getElementById('expKpiRow');
    if(kpiEl) kpiEl.innerHTML = `
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Total Expenses</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--primary-color);">₹${total.toLocaleString('en-IN')}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Approved</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--secondary-color);">₹${totalApproved.toLocaleString('en-IN')}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Pending Approval</div>
            <div style="font-size:1.6rem;font-weight:700;color:var(--warning-color);">${pending}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;">
            <div style="font-size:0.8rem;color:var(--text-muted);">Budget Utilisation</div>
            <div style="font-size:1.6rem;font-weight:700;color:${total>100000?'var(--danger-color)':'var(--secondary-color)'};">${Math.round(total/200000*100)}%</div>
        </div>`;

    // Budget chart (F17)
    const budgets = { 'Fuel & Transport': 15000, 'Wages & Labour': 80000, 'Packaging Material': 30000, 'Utilities': 20000, 'Maintenance': 10000 };
    const actuals = {};
    expenses.forEach(e => { actuals[e.category] = (actuals[e.category]||0) + e.amount; });
    const chartEl = document.getElementById('budgetChart');
    if(chartEl) {
        chartEl.innerHTML = Object.entries(budgets).map(([cat, budget]) => {
            const actual = actuals[cat] || 0;
            const pct = Math.min(Math.round(actual/budget*100), 100);
            const over = actual > budget;
            return `<div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
                    <span>${escapeHtml(cat)}</span>
                    <span><strong style="color:${over?'var(--danger-color)':'var(--secondary-color)'};">₹${actual.toLocaleString('en-IN')}</strong> / ₹${budget.toLocaleString('en-IN')}</span>
                </div>
                <div style="background:var(--bg-main);border-radius:4px;height:12px;overflow:hidden;position:relative;">
                    <div style="height:100%;width:${pct}%;background:${over?'var(--danger-color)':'var(--primary-color)'};border-radius:4px;transition:width 0.8s;"></div>
                </div>
                ${over ? `<div style="font-size:0.7rem;color:var(--danger-color);margin-top:2px;">⚠ Over budget by ₹${(actual-budget).toLocaleString('en-IN')}</div>` : ''}
            </div>`;
        }).join('');
    }

    // Cost center pie (F19) — simple list with bars
    const pieEl = document.getElementById('costPie');
    if(pieEl) {
        const cats = [...new Set(expenses.map(e=>e.category))];
        const colors = ['var(--primary-color)','var(--secondary-color)','var(--warning-color)','var(--danger-color)','var(--info-color)'];
        pieEl.innerHTML = cats.map((cat, i) => {
            const amt = actuals[cat]||0;
            const pct = total ? Math.round(amt/total*100) : 0;
            return `<div style="display:flex;align-items:center;gap:10px;">
                <div style="width:12px;height:12px;border-radius:3px;background:${colors[i%colors.length]};flex-shrink:0;"></div>
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;font-size:0.78rem;"><span>${escapeHtml(cat)}</span><strong>${pct}%</strong></div>
                    <div style="background:var(--bg-main);border-radius:3px;height:6px;margin-top:2px;"><div style="height:100%;width:${pct}%;background:${colors[i%colors.length]};border-radius:3px;"></div></div>
                </div>
            </div>`;
        }).join('');
    }

    // Expenses table
    const tbody = document.getElementById('expensesBody');
    if(tbody) {
        tbody.innerHTML = expenses.map(e => {
            const cls = e.status==='Approved'?'status-success':'status-warning';
            return `<tr>
                <td>${escapeHtml(e.date)}</td>
                <td><span style="background:var(--primary-light);color:var(--primary-color);padding:2px 8px;border-radius:10px;font-size:0.75rem;">${escapeHtml(e.category)}</span></td>
                <td>${escapeHtml(e.description)}</td>
                <td><strong>₹${e.amount.toLocaleString('en-IN')}</strong></td>
                <td><span class="status ${cls}">${escapeHtml(e.status)}</span></td>
                <td>${escapeHtml(e.approver || '—')}</td>
                <td><button class="icon-btn" style="color:var(--danger-color);" onclick="window.deleteExpense('${escJs(e.id)}')"><i class='bx bx-trash'></i></button></td>
            </tr>`;
        }).join('');
    }

    // Approval queue (F18)
    const pending_exp = expenses.filter(e=>e.status==='Pending');
    const aqEl = document.getElementById('approvalQueue');
    if(aqEl) {
        aqEl.innerHTML = pending_exp.length ? pending_exp.map(e => `
            <div style="padding:12px;border-radius:8px;background:var(--bg-main);border-left:3px solid var(--warning-color);">
                <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(e.category)}</div>
                <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:8px;">${escapeHtml(e.description)}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <strong>₹${e.amount.toLocaleString('en-IN')}</strong>
                    <div style="display:flex;gap:6px;">
                        <button class="btn btn-primary" style="padding:2px 8px;font-size:0.75rem;" onclick="window.approveExpense('${escJs(e.id)}')">Approve</button>
                        <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;color:var(--danger-color);" onclick="window.deleteExpense('${escJs(e.id)}')">Reject</button>
                    </div>
                </div>
            </div>`).join('')
        : '<div style="color:var(--text-muted);font-size:0.85rem;padding:16px 0;text-align:center;">No pending approvals</div>';
    }
};

window.addExpensePrompt = function() {
    const categories = ['Fuel & Transport', 'Wages & Labour', 'Packaging Material', 'Utilities', 'Maintenance', 'Other'];
    const cat = prompt('Category:\n' + categories.map((c,i)=>`${i+1}. ${c}`).join('\n') + '\n\nEnter number or name:', '1');
    if(!cat) return;
    const category = categories[parseInt(cat)-1] || cat;
    const desc = prompt('Description:'); if(!desc) return;
    const amt = parseInt(prompt('Amount (₹):')); if(!amt) return;
    const id = 'EXP-' + String(DataManager.getExpenses().length+1).padStart(3,'0');
    DataManager.addExpense({ id, date:'Today', category, amount:amt, description:desc, status:'Pending', approver:'' });
    window.showToast(`Expense ₹${amt.toLocaleString('en-IN')} logged — pending approval`, 'info');
    DataManager.logAction('Expense Logged', `₹${amt} - ${category}: ${desc}`);
    window.refreshExpenses();
};

window.approveExpense = function(id) {
    DataManager.updateExpense(id, { status:'Approved', approver:'Admin User' });
    window.showToast('Expense approved', 'success');
    window.refreshExpenses();
};

window.deleteExpense = function(id) {
    if(!confirm('Delete this expense?')) return;
    DataManager.deleteExpense(id);
    window.showToast('Expense removed', 'danger');
    window.refreshExpenses();
};

window.exportExpenses = function() { window.showToast('Expenses_August2026.csv downloaded', 'info'); };
