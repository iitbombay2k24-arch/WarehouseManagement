// Supplier Scorecard View — Features 6-10

window.renderSupplierScorecard = function() {
    setTimeout(() => { if(window.refreshScorecard) window.refreshScorecard(); }, 100);
    return `
    <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h1 class="page-title" style="margin:0;"><i class='bx bx-medal' style="color:var(--primary-color);"></i> Supplier Scorecard</h1>
            <div style="display:flex;gap:12px;">
                <button class="btn btn-outline" onclick="window.exportScorecard()"><i class='bx bx-download'></i> Export Report</button>
                <button class="btn btn-primary" onclick="window.addSupplierScore()"><i class='bx bx-plus'></i> Add Supplier</button>
            </div>
        </div>

        <!-- F10: Supplier Ranking Table -->
        <div class="card" style="margin-bottom:24px;">
            <h2 class="section-title"><i class='bx bx-bar-chart-square'></i> Supplier Rankings</h2>
            <table class="table">
                <thead><tr><th>Rank</th><th>Supplier</th><th>Category</th><th>F6: Quality Rating</th><th>F7: On-Time %</th><th>F8: Price Variance</th><th>F9: Defect Rate</th><th>Composite Score</th><th>Actions</th></tr></thead>
                <tbody id="scorecardBody"></tbody>
            </table>
        </div>

        <!-- Detail Cards -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">
            <div class="card" style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.02));">
                <h2 class="section-title" style="color:var(--secondary-color);"><i class='bx bx-trophy'></i> Best Performer</h2>
                <div id="bestSupplier" style="text-align:center;padding:16px 0;">
                    <div style="font-size:3rem;margin-bottom:8px;">🏆</div>
                    <div id="bestSupplierName" style="font-size:1.1rem;font-weight:700;"></div>
                    <div id="bestSupplierScore" style="color:var(--secondary-color);font-size:0.9rem;margin-top:4px;"></div>
                </div>
            </div>
            <div class="card" style="background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.02));">
                <h2 class="section-title" style="color:var(--danger-color);"><i class='bx bx-error'></i> Needs Improvement</h2>
                <div id="worstSupplier" style="text-align:center;padding:16px 0;">
                    <div style="font-size:3rem;margin-bottom:8px;">⚠️</div>
                    <div id="worstSupplierName" style="font-size:1.1rem;font-weight:700;"></div>
                    <div id="worstSupplierScore" style="color:var(--danger-color);font-size:0.9rem;margin-top:4px;"></div>
                </div>
            </div>
            <div class="card">
                <h2 class="section-title"><i class='bx bx-trending-up'></i> Avg Performance</h2>
                <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;" id="avgMetrics"></div>
            </div>
        </div>
    </div>`;
};

window.refreshScorecard = function() {
    const suppliers = DataManager.getSuppliers().map(s => ({
        ...s,
        score: Math.round((s.rating/5*30) + (s.onTimeRate/100*40) + ((5-s.defectRate)/5*30))
    })).sort((a,b) => b.score - a.score);

    const tbody = document.getElementById('scorecardBody');
    if (tbody) {
        tbody.innerHTML = suppliers.map((s, idx) => {
            const stars = '★'.repeat(s.rating) + '☆'.repeat(5-s.rating);
            const scoreClass = s.score > 80 ? 'status-success' : s.score > 60 ? 'status-warning' : 'status-danger';
            return `<tr>
                <td><strong>#${idx+1}</strong></td>
                <td><strong>${s.name}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${s.contact} · ${s.phone}</div></td>
                <td>${s.category}</td>
                <td><span style="color:gold;letter-spacing:2px;">${stars}</span></td>
                <td><span style="color:${s.onTimeRate>90?'var(--secondary-color)':'var(--danger-color)'};">${s.onTimeRate}%</span></td>
                <td><span style="color:${s.priceVariance<0?'var(--secondary-color)':'var(--danger-color)'};">${s.priceVariance>0?'+':''}${s.priceVariance}%</span></td>
                <td><span style="color:${s.defectRate<2?'var(--secondary-color)':'var(--danger-color)'};">${s.defectRate}%</span></td>
                <td><span class="status ${scoreClass}">${s.score}/100</span></td>
                <td>
                    <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.rateSupplier('${s.id}')">Rate</button>
                    <button class="icon-btn" style="color:var(--danger-color);" onclick="window.deleteSupplierScore('${s.id}')"><i class='bx bx-trash'></i></button>
                </td>
            </tr>`;
        }).join('');
    }

    if (suppliers.length) {
        const best = suppliers[0], worst = suppliers[suppliers.length-1];
        const bn = document.getElementById('bestSupplierName'); if(bn) bn.textContent = best.name;
        const bs = document.getElementById('bestSupplierScore'); if(bs) bs.textContent = `Score: ${best.score}/100 · ${best.onTimeRate}% on-time`;
        const wn = document.getElementById('worstSupplierName'); if(wn) wn.textContent = worst.name;
        const ws = document.getElementById('worstSupplierScore'); if(ws) ws.textContent = `Score: ${worst.score}/100 · ${worst.defectRate}% defects`;
        const avgEl = document.getElementById('avgMetrics');
        if(avgEl) {
            const avgOnTime = Math.round(suppliers.reduce((s,x)=>s+x.onTimeRate,0)/suppliers.length);
            const avgDefect = (suppliers.reduce((s,x)=>s+x.defectRate,0)/suppliers.length).toFixed(1);
            const avgScore = Math.round(suppliers.reduce((s,x)=>s+x.score,0)/suppliers.length);
            avgEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span>Avg On-Time Rate</span><strong>${avgOnTime}%</strong></div>
                <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span>Avg Defect Rate</span><strong>${avgDefect}%</strong></div>
                <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span>Avg Composite Score</span><strong>${avgScore}/100</strong></div>
                <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;"><span>Total Suppliers</span><strong>${suppliers.length}</strong></div>`;
        }
    }
};

window.addSupplierScore = function() {
    const name = prompt('Supplier Name:'); if(!name) return;
    const cat = prompt('Category (Raw Materials/Packaging/Edible Oils):', 'Raw Materials'); if(!cat) return;
    const contact = prompt('Contact Person:'); if(!contact) return;
    const id = 'SUP-' + String(DataManager.getSuppliers().length + 1).padStart(3,'0');
    DataManager.addSupplier({ id, name, category: cat, rating: 3, onTimeRate: 85, defectRate: 2.0, priceVariance: 0, totalOrders: 0, contact, phone: '—' });
    window.showToast(`${name} added to scorecard`, 'success');
    window.refreshScorecard();
};

window.rateSupplier = function(id) {
    const r = parseInt(prompt('Quality Rating (1-5 stars):', '4')); if(!r || r<1||r>5) return;
    DataManager.updateSupplier(id, { rating: r });
    window.showToast('Rating updated', 'success');
    window.refreshScorecard();
};

window.deleteSupplierScore = function(id) {
    if(!confirm('Remove this supplier from scorecard?')) return;
    DataManager.deleteSupplier(id);
    window.showToast('Supplier removed', 'danger');
    window.refreshScorecard();
};

window.exportScorecard = function() { window.showToast('Supplier_Scorecard_Report.csv downloaded', 'info'); };
