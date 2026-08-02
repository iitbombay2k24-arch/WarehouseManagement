// Quality & FSSAI Compliance View

window.renderQuality = function() {
    setTimeout(() => {
        if(window.refreshQualityTable) {
            window.refreshQualityTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-check-shield' style="color: var(--primary-color);"></i> Quality & Compliance</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-list-check'></i> New GMP Audit</button>
                    <button class="btn btn-primary" onclick="window.toggleQuarantineForm()"><i class='bx bx-block'></i> Quarantine Batch</button>
                </div>
            </div>

            <!-- Quarantine Form (Hidden by default) -->
            <div id="quarantineForm" style="display: none; background: var(--bg-main); padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid var(--border-color);">
                <h3 style="margin-top: 0;">Quarantine New Batch</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <input type="text" id="qBatch" placeholder="Batch No. (e.g. #B-2500)" class="form-control">
                    <input type="text" id="qProduct" placeholder="Product Name" class="form-control">
                    <input type="text" id="qReason" placeholder="Hold Reason" class="form-control">
                    <input type="text" id="qDate" placeholder="Date (e.g. Today)" class="form-control">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-primary" style="background: var(--danger-color);" onclick="window.saveQuarantine()">Quarantine</button>
                    <button class="btn btn-outline" onclick="document.getElementById('quarantineForm').style.display='none'">Cancel</button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="card">
                    <h2 class="section-title">Batches on Quality Hold (Quarantine)</h2>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Batch No.</th>
                                <th>Product</th>
                                <th>Hold Reason</th>
                                <th>Date Quarantined</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody id="qualityTableBody">
                            <!-- Dynamic Content -->
                        </tbody>
                    </table>
                </div>

                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card">
                        <h2 class="section-title">FSSAI Compliance Status</h2>
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
                            <i class='bx bx-certification' style="font-size: 48px; color: var(--secondary-color);"></i>
                            <div>
                                <div style="font-weight: 600;">Central License (Manufacturing)</div>
                                <div style="font-family: monospace; font-size: 0.9rem;">No. 11520000000123</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Valid till: 31 Dec 2027</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <i class='bx bx-certification' style="font-size: 48px; color: var(--warning-color);"></i>
                            <div>
                                <div style="font-weight: 600;">State License (Storage)</div>
                                <div style="font-family: monospace; font-size: 0.9rem;">No. 21520000000456</div>
                                <div style="font-size: 0.8rem; color: var(--danger-color); font-weight: 600;"><i class='bx bx-error'></i> Expiring in 45 days (Action Required)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <h2 class="section-title">Daily GMP (Good Manufacturing Practice) Checklist</h2>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: var(--primary-color);">
                        <span style="text-decoration: line-through; color: var(--text-muted);">All workers wearing hairnets and gloves</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" checked style="width: 18px; height: 18px; accent-color: var(--primary-color);">
                        <span style="text-decoration: line-through; color: var(--text-muted);">Pest control stations checked (Zone A)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" style="width: 18px; height: 18px; accent-color: var(--primary-color);">
                        <span>Floor sanitized and dry (Dispatch Area)</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" style="width: 18px; height: 18px; accent-color: var(--primary-color);">
                        <span>Allergen storage segregated properly</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.toggleQuarantineForm = function() {
    const form = document.getElementById('quarantineForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

window.saveQuarantine = function() {
    const batch = document.getElementById('qBatch').value;
    const product = document.getElementById('qProduct').value;
    const reason = document.getElementById('qReason').value;
    const date = document.getElementById('qDate').value;

    if (!batch || !product) {
        alert("Please enter Batch No and Product");
        return;
    }

    if(typeof DataManager !== 'undefined') {
        DataManager.addQualityHold({ 
            batch, product, reason, date, bg: 'rgba(239, 68, 68, 0.05)'
        });
        
        document.getElementById('qBatch').value = '';
        document.getElementById('qProduct').value = '';
        document.getElementById('qReason').value = '';
        document.getElementById('qDate').value = '';
        document.getElementById('quarantineForm').style.display = 'none';
        
        window.refreshQualityTable();
    } else {
        alert("DataManager not initialized.");
    }
};

window.releaseQuarantine = function(batch) {
    if(confirm("Are you sure you want to release / remove batch " + batch + " from quarantine?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteQualityHold(batch);
            window.refreshQualityTable();
        }
    }
};

window.refreshQualityTable = function() {
    const tbody = document.getElementById('qualityTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const holds = DataManager.getQualityHolds();
    let html = '';
    
    holds.forEach(h => {
        html += `
            <tr style="background: ${h.bg};">
                <td><span style="font-weight: 600;">${h.batch}</span></td>
                <td>${h.product}</td>
                <td>${h.reason}</td>
                <td>${h.date}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.releaseQuarantine('${h.batch}')">Release / Destroy</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};
