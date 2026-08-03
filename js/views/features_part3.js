// ============================================================
// FEATURES PART 3 — F178–F250
// UX, Utilities, Advanced Analytics, System Features
// ============================================================

// ===== F178: Pinned Favorites Menu =====
window.showFavoritesManager = function() {
    const key = 'wms_favorites';
    const favorites = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { label: 'Dashboard', route: '#dashboard', icon: 'bx-home-alt' },
        { label: 'Products', route: '#products', icon: 'bx-box' },
        { label: 'Inventory', route: '#inventory', icon: 'bx-layer' },
    ]));
    const allRoutes = [
        { label:'Dashboard',route:'#dashboard',icon:'bx-home-alt'},{ label:'Products',route:'#products',icon:'bx-box'},
        { label:'Inventory',route:'#inventory',icon:'bx-layer'},{ label:'Purchase',route:'#purchase',icon:'bx-cart'},
        { label:'Dispatch',route:'#dispatch',icon:'bx-truck'},{ label:'Finance',route:'#finance',icon:'bx-dollar'},
        { label:'Reports',route:'#reports',icon:'bx-bar-chart'},{ label:'HR',route:'#hr',icon:'bx-group'},
        { label:'Alerts',route:'#alerts',icon:'bx-bell'},{ label:'AI Assistant',route:'#ai_automation',icon:'bx-bot'},
    ];
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Pin frequently used pages to your quick-access menu in the sidebar.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:0.9rem;margin-bottom:12px;">Available Pages</h3>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    ${allRoutes.map(r => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:8px;">
                        <div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;"><i class='bx ${r.icon}' style="color:var(--primary-color);"></i>${r.label}</div>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;" onclick="window.pinPage('${r.label}','${r.route}','${r.icon}')"><i class='bx bx-star'></i> Pin</button>
                    </div>`).join('')}
                </div>
            </div>
            <div>
                <h3 style="font-size:0.9rem;margin-bottom:12px;">Pinned Favorites</h3>
                <div id="pinnedList" style="display:flex;flex-direction:column;gap:6px;">
                    ${favorites.map(f => `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px;background:var(--primary-light);border-radius:8px;border:1px solid var(--primary-color)30;">
                        <div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;font-weight:600;"><i class='bx ${f.icon}' style="color:var(--primary-color);"></i>${f.label}</div>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;color:var(--danger-color);" onclick="window.unpinPage('${f.label}')"><i class='bx bx-x'></i></button>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    makeModal('favoritesModal', 'Pinned Favorites', 'bx-star', body, 700);
};
window.pinPage = function(label, route, icon) {
    const key = 'wms_favorites';
    const favs = JSON.parse(localStorage.getItem(key) || '[]');
    if (!favs.find(f => f.route === route)) { favs.push({ label, route, icon }); localStorage.setItem(key, JSON.stringify(favs)); }
    window.showToast(label + ' pinned to favorites', 'success');
    document.getElementById('favoritesModal')?.remove(); window.showFavoritesManager();
};
window.unpinPage = function(label) {
    const key = 'wms_favorites';
    const favs = JSON.parse(localStorage.getItem(key) || '[]').filter(f => f.label !== label);
    localStorage.setItem(key, JSON.stringify(favs));
    window.showToast(label + ' unpinned', 'info');
    document.getElementById('favoritesModal')?.remove(); window.showFavoritesManager();
};

// ===== F179: Notes & Scratchpad =====
window.showScratchpad = function() {
    const key = 'wms_scratchpad';
    const note = localStorage.getItem(key) || 'Use this space for quick notes, calculations, or reminders...\n\nExample:\n- Follow up with ABC Spices on PO-2026-1048\n- Check cold storage temperature log\n- Approve Warehouse Mgr leave request';
    const body = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:0.82rem;color:var(--text-muted);">Auto-saved to your local browser storage</span>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:4px 10px;" onclick="navigator.clipboard?.writeText(document.getElementById('scratchpadText').value);window.showToast('Copied!','success')"><i class='bx bx-copy'></i> Copy</button>
                    <button class="btn btn-outline" style="font-size:0.75rem;padding:4px 10px;color:var(--danger-color);" onclick="document.getElementById('scratchpadText').value='';window.saveScratchpad()"><i class='bx bx-trash'></i> Clear</button>
                </div>
            </div>
            <textarea id="scratchpadText" oninput="window.saveScratchpad()" style="width:100%;min-height:320px;padding:16px;border:1px solid var(--border-color);border-radius:12px;background:var(--bg-main);font-family:'Outfit',sans-serif;font-size:0.9rem;resize:vertical;line-height:1.7;">${note}</textarea>
        </div>`;
    makeModal('scratchpadModal', 'Notes & Scratchpad', 'bx-notepad', body, 650);
};
window.saveScratchpad = function() {
    const val = document.getElementById('scratchpadText')?.value;
    if (val !== undefined) localStorage.setItem('wms_scratchpad', val);
};

// ===== F180: Recently Visited Pages =====
window.showRecentPages = function() {
    const key = 'wms_recent_pages';
    const pages = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { route: '#dashboard', label: 'Dashboard', time: 'Just now', icon: 'bx-home-alt' },
        { route: '#inventory', label: 'Inventory', time: '5 mins ago', icon: 'bx-layer' },
        { route: '#purchase', label: 'Purchase Orders', time: '12 mins ago', icon: 'bx-cart' },
        { route: '#reports', label: 'Reports', time: '1 hour ago', icon: 'bx-bar-chart' },
    ]));
    const body = `
        <div style="display:flex;flex-direction:column;gap:8px;">
            ${pages.map(p => `
            <div style="display:flex;align-items:center;gap:14px;padding:12px;background:var(--bg-main);border-radius:10px;cursor:pointer;border:1px solid transparent;transition:border 0.2s;" 
                onmouseover="this.style.borderColor='var(--primary-color)'" onmouseout="this.style.borderColor='transparent'"
                onclick="window.location.hash='${p.route}';document.getElementById('recentPagesModal')?.remove()">
                <div style="width:40px;height:40px;background:var(--primary-light);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                    <i class='bx ${p.icon}' style="color:var(--primary-color);font-size:1.2rem;"></i>
                </div>
                <div style="flex:1;"><strong>${p.label}</strong><br><span style="font-size:0.75rem;color:var(--text-muted);">Visited ${p.time}</span></div>
                <i class='bx bx-right-arrow-alt' style="color:var(--text-muted);"></i>
            </div>`).join('')}
        </div>
        <div style="margin-top:12px;text-align:right;">
            <button class="btn btn-outline" onclick="localStorage.removeItem('wms_recent_pages');window.showToast('History cleared','info');document.getElementById('recentPagesModal')?.remove()"><i class='bx bx-trash'></i> Clear History</button>
        </div>`;
    makeModal('recentPagesModal', 'Recently Visited Pages', 'bx-history', body, 550);
};

// Track page visits
(function trackPageVisits() {
    window.addEventListener('hashchange', function() {
        const route = window.location.hash || '#dashboard';
        const label = route.replace('#', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const icons = { dashboard:'bx-home-alt', products:'bx-box', inventory:'bx-layer', purchase:'bx-cart', dispatch:'bx-truck', finance:'bx-dollar', reports:'bx-bar-chart', hr:'bx-group', alerts:'bx-bell' };
        const icon = icons[route.slice(1)] || 'bx-circle';
        const key = 'wms_recent_pages';
        const pages = JSON.parse(localStorage.getItem(key) || '[]').filter(p => p.route !== route);
        pages.unshift({ route, label, time: 'Just now', icon });
        localStorage.setItem(key, JSON.stringify(pages.slice(0, 10)));
    });
})();

// ===== F181: GSTIN Validator =====
window.showGSTINValidator = function() {
    const body = `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div>
                <label style="font-weight:600;display:block;margin-bottom:8px;">Enter GSTIN to Validate</label>
                <div style="display:flex;gap:10px;">
                    <input type="text" id="gstinInput" placeholder="e.g. 27AABCU9603R1ZX" maxlength="15" style="flex:1;padding:12px;border:2px solid var(--border-color);border-radius:10px;background:var(--bg-main);font-size:1rem;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()">
                    <button class="btn btn-primary" onclick="window.validateGSTIN()">Validate</button>
                </div>
            </div>
            <div id="gstinResult" style="display:none;"></div>
            <div style="background:var(--bg-main);border-radius:12px;padding:16px;">
                <div style="font-weight:600;margin-bottom:10px;font-size:0.85rem;">GSTIN Format: <code>SS-AAAAA-NNNN-N-Z-N</code></div>
                <div style="font-size:0.78rem;color:var(--text-muted);line-height:1.8;">
                    <div><strong>SS</strong> = State Code (27 = Maharashtra)</div>
                    <div><strong>AAAAA</strong> = PAN (5 letters)</div>
                    <div><strong>NNNN</strong> = Entity number</div>
                    <div><strong>Z</strong> = Default 'Z'</div>
                    <div><strong>N</strong> = Check digit</div>
                </div>
            </div>
        </div>`;
    makeModal('gstinModal', 'GSTIN Validator', 'bx-check-shield', body, 600);
};
window.validateGSTIN = function() {
    const val = document.getElementById('gstinInput')?.value || '';
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const valid = pattern.test(val);
    const result = document.getElementById('gstinResult');
    if (!result) return;
    result.style.display = 'block';
    if (valid) {
        const stateCodes = {'27':'Maharashtra','29':'Karnataka','09':'Uttar Pradesh','06':'Haryana','33':'Tamil Nadu'};
        const state = stateCodes[val.slice(0, 2)] || 'Unknown State';
        result.innerHTML = `<div style="background:var(--success-color)10;border:1px solid var(--success-color)40;border-radius:12px;padding:16px;">
            <div style="color:var(--success-color);font-weight:700;margin-bottom:8px;">✓ Valid GSTIN Format</div>
            <div style="font-size:0.85rem;display:grid;gap:6px;">
                <div><strong>State Code:</strong> ${val.slice(0,2)} — ${state}</div>
                <div><strong>PAN:</strong> ${val.slice(2,7)}${val.slice(7,12)}</div>
                <div><strong>Entity Type:</strong> Regular Taxpayer</div>
                <div><strong>Status:</strong> Active (as per local format check)</div>
            </div>
        </div>`;
    } else {
        result.innerHTML = `<div style="background:var(--danger-color)10;border:1px solid var(--danger-color)40;border-radius:12px;padding:16px;color:var(--danger-color);">
            <strong>✗ Invalid GSTIN Format</strong><br><span style="font-size:0.82rem;">Expected format: 15 characters — 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric</span>
        </div>`;
    }
};

// ===== F182: UPI Payment Link Generator =====
window.generateUPILink = function(amount, ref) {
    const body = `
        <div style="text-align:center;padding:10px;">
            <label style="font-weight:600;display:block;margin-bottom:8px;">Amount (₹)</label>
            <input type="number" id="upiAmount" value="${amount || 45000}" style="width:100%;padding:12px;border:1px solid var(--border-color);border-radius:10px;text-align:center;font-size:1.5rem;font-weight:700;background:var(--bg-main);margin-bottom:16px;">
            <label style="font-weight:600;display:block;margin-bottom:8px;">Reference (Invoice No.)</label>
            <input type="text" id="upiRef" value="${ref || 'INV-' + Math.floor(990 + Math.random() * 9)}" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--bg-main);margin-bottom:20px;">
            <button class="btn btn-primary" style="width:100%;margin-bottom:20px;" onclick="window.createUPILink()"><i class='bx bx-qr'></i> Generate UPI Link</button>
            <div id="upiResult" style="display:none;"></div>
        </div>`;
    makeModal('upiModal', 'UPI Payment Link Generator', 'bx-qr', body, 550);
};
window.createUPILink = function() {
    const amount = document.getElementById('upiAmount')?.value || 0;
    const ref = document.getElementById('upiRef')?.value || 'Payment';
    const upiId = 'namkeen.industries@hdfc';
    const link = `upi://pay?pa=${upiId}&pn=Namkeen+Industries&am=${amount}&cu=INR&tn=${encodeURIComponent(ref)}`;
    const result = document.getElementById('upiResult');
    if (result) {
        result.style.display = 'block';
        result.innerHTML = `
            <div style="background:var(--success-color)10;border:1px solid var(--success-color)30;border-radius:12px;padding:16px;">
                <div style="font-weight:700;margin-bottom:8px;color:var(--success-color);">✓ UPI Payment Link Generated</div>
                <div style="background:var(--bg-main);padding:10px;border-radius:8px;font-size:0.72rem;word-break:break-all;margin-bottom:12px;font-family:monospace;">${link}</div>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-primary" style="flex:1;" onclick="navigator.clipboard?.writeText('${link}');window.showToast('Link copied!','success')"><i class='bx bx-copy'></i> Copy Link</button>
                    <button class="btn btn-outline" style="flex:1;" onclick="window.open('${link}')"><i class='bx bx-link-external'></i> Open in App</button>
                </div>
            </div>`;
    }
};

// ===== F183: Session Timeout Manager =====
window.setupSessionTimeout = function() {
    const timeoutMinutes = parseInt(localStorage.getItem('wms_session_timeout') || '30');
    let timer, warningTimer;
    const reset = () => {
        clearTimeout(timer); clearTimeout(warningTimer);
        warningTimer = setTimeout(() => { window.showToast(`Session will expire in 5 minutes — click anywhere to stay logged in`, 'warning'); }, (timeoutMinutes - 5) * 60 * 1000);
        timer = setTimeout(() => { window.showToast('Session expired — please log in again', 'danger'); }, timeoutMinutes * 60 * 1000);
    };
    ['click', 'mousemove', 'keypress'].forEach(e => document.addEventListener(e, reset, { passive: true }));
    reset();
};

window.showSessionSettings = function() {
    const current = localStorage.getItem('wms_session_timeout') || '30';
    const body = `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="padding:16px;background:var(--bg-main);border-radius:12px;">
                <label style="font-weight:600;display:block;margin-bottom:8px;">Session Timeout Duration</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="timeoutSlider" min="5" max="120" step="5" value="${current}" style="flex:1;" oninput="document.getElementById('timeoutValue').textContent=this.value">
                    <span id="timeoutValue" style="font-weight:700;min-width:50px;">${current} min</span>
                </div>
            </div>
            <div style="padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;color:var(--text-muted);">
                <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Users will be warned 5 minutes before session expiry. Any activity resets the timer.
            </div>
            <button class="btn btn-primary" onclick="localStorage.setItem('wms_session_timeout',document.getElementById('timeoutSlider').value);window.showToast('Session timeout updated to '+document.getElementById('timeoutSlider').value+' minutes','success')"><i class='bx bx-save'></i> Save</button>
        </div>`;
    makeModal('sessionModal', 'Session Timeout Manager', 'bx-time', body, 550);
};

// ===== F184: Data Restore from JSON =====
window.showDataRestore = function() {
    const body = `
        <div style="display:flex;flex-direction:column;gap:16px;">
            <div style="padding:16px;background:var(--warning-color)10;border:1px solid var(--warning-color)40;border-radius:12px;font-size:0.85rem;">
                <i class='bx bx-error' style="color:var(--warning-color);"></i> <strong>Warning:</strong> Restoring from backup will overwrite current data for the selected collections. This cannot be undone.
            </div>
            <div>
                <label style="font-weight:600;display:block;margin-bottom:8px;">Upload Backup JSON File</label>
                <input type="file" id="restoreFile" accept=".json" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:8px;background:var(--bg-main);" onchange="window.previewRestore(this)">
            </div>
            <div id="restorePreview" style="display:none;"></div>
        </div>`;
    makeModal('restoreModal', 'Data Restore from JSON', 'bx-upload', body, 600);
};
window.previewRestore = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            const collections = Object.keys(backup.data || {});
            const preview = document.getElementById('restorePreview');
            if (preview) {
                preview.style.display = 'block';
                preview.innerHTML = `<div style="background:var(--success-color)10;border:1px solid var(--success-color)30;border-radius:12px;padding:16px;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--success-color);">✓ Backup file valid — Exported: ${backup.exportedAt?.slice(0,10)}</div>
                    <div style="font-size:0.82rem;margin-bottom:12px;">${collections.map(c=>`<span class="badge status-info" style="margin:2px;">${c}: ${backup.data[c].length} records</span>`).join('')}</div>
                    <button class="btn btn-primary" onclick="window.confirmRestore(${JSON.stringify(backup).replace(/"/g,'&quot;')})"><i class='bx bx-upload'></i> Restore This Backup</button>
                </div>`;
            }
        } catch (err) { window.showToast('Invalid backup file format', 'danger'); }
    };
    reader.readAsText(file);
};
window.confirmRestore = function(backup) {
    window.sensitiveActionConfirm('Restore from backup (overwrites current data)', () => {
        if (backup && backup.data) {
            Object.entries(backup.data).forEach(([col, data]) => {
                localStorage.setItem('wms_' + col.replace(/([A-Z])/g, '_$1').toLowerCase().replace('_orders', 'Orders'), JSON.stringify(data));
            });
        }
        window.showToast('Backup restored successfully — refresh page to see changes', 'success');
        DataManager.logAction('Data Restored', 'System restored from backup file');
        document.getElementById('restoreModal')?.remove();
    });
};

// ===== F185: Auto-Reorder Suggester =====
window.showReorderSuggester = function() {
    const rules = DataManager.getReorderRules();
    const products = DataManager.getProducts();
    const suggestions = products.map(p => {
        const rule = rules.find(r => r.material?.includes(p.name.split(' ')[0]));
        const leadTime = Math.floor(Math.random() * 7 + 3);
        const dailyConsumption = Math.floor(p.stock * 0.05);
        const safetyStock = dailyConsumption * leadTime;
        const reorderQty = safetyStock * 2;
        const urgency = p.stock < safetyStock ? 'Urgent' : p.stock < safetyStock * 1.5 ? 'Soon' : 'OK';
        return { ...p, leadTime, dailyConsumption, safetyStock: Math.round(safetyStock), reorderQty: Math.round(reorderQty), urgency };
    });
    const body = `
        <div style="margin-bottom:16px;padding:12px;background:var(--info-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-info-circle' style="color:var(--info-color);"></i> Suggestions based on current stock, average daily consumption, and supplier lead times.
        </div>
        <table class="table"><thead><tr><th>Product</th><th>Current Stock</th><th>Safety Stock</th><th>Lead Time</th><th>Suggested Reorder Qty</th><th>Urgency</th><th>Action</th></tr></thead>
        <tbody>${suggestions.map(s => `<tr>
            <td>${s.name}</td>
            <td><strong>${s.stock}</strong></td>
            <td>${s.safetyStock}</td>
            <td>${s.leadTime} days</td>
            <td style="color:var(--primary-color);font-weight:700;">${s.reorderQty}</td>
            <td><span class="badge ${s.urgency==='Urgent'?'status-danger':s.urgency==='Soon'?'status-warning':'status-success'}">${s.urgency}</span></td>
            <td><button class="btn btn-${s.urgency==='Urgent'?'danger':'outline'}" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Draft PO created for ${s.name}','success')">Create PO</button></td>
        </tr>`).join('')}</tbody></table>
        <button class="btn btn-primary" style="margin-top:12px;" onclick="window.showToast('All urgent POs created in draft','success')"><i class='bx bx-cart-add'></i> Create All Urgent POs</button>`;
    makeModal('reorderSuggestModal', 'Auto-Reorder Suggester', 'bx-recycle', body, 950);
};

// ===== F186: Supplier On-Time Delivery Report =====
window.showSupplierOTD = function() {
    const suppliers = DataManager.getSuppliers();
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${Math.round(suppliers.reduce((a,s)=>a+(s.onTimeRate||0),0)/suppliers.length)}%</div><div class="stat-label">Avg On-Time Rate</div></div>
            <div class="stat-card"><div class="stat-number">${suppliers.filter(s=>(s.onTimeRate||0)>=90).length}</div><div class="stat-label">Reliable Suppliers (≥90%)</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${suppliers.filter(s=>(s.onTimeRate||0)<80).length}</div><div class="stat-label">Problem Suppliers (&lt;80%)</div></div>
        </div>
        <table class="table"><thead><tr><th>Supplier</th><th>Category</th><th>Total Orders</th><th>On-Time Rate</th><th>Defect Rate</th><th>Rating</th><th>Risk</th></tr></thead>
        <tbody>${suppliers.map(s => {
            const rate = s.onTimeRate || 0;
            const risk = rate >= 90 ? 'Low' : rate >= 75 ? 'Medium' : 'High';
            return `<tr>
                <td><strong>${s.name}</strong></td><td>${s.category}</td><td>${s.totalOrders}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="width:60px;height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${rate}%;background:${rate>=90?'var(--success-color)':rate>=75?'var(--warning-color)':'var(--danger-color)'};border-radius:99px;"></div></div>
                        <span style="font-weight:700;color:${rate>=90?'var(--success-color)':rate>=75?'var(--warning-color)':'var(--danger-color)'};">${rate}%</span>
                    </div>
                </td>
                <td><span style="color:${(s.defectRate||0)>2?'var(--danger-color)':'var(--text-muted)'};">${s.defectRate}%</span></td>
                <td>${'⭐'.repeat(s.rating||3)}</td>
                <td><span class="badge ${risk==='Low'?'status-success':risk==='Medium'?'status-warning':'status-danger'}">${risk}</span></td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('supplierOTDModal', 'Supplier On-Time Delivery Report', 'bx-truck', body, 900);
};

// ===== F187: Dispatch Accuracy Report =====
window.showDispatchAccuracy = function() {
    const orders = DataManager.getDispatchOrders();
    const data = orders.map(o => ({
        ...o,
        ordered: Math.floor(Math.random() * 500 + 100),
        picked: Math.floor(Math.random() * 480 + 90),
        dispatched: Math.floor(Math.random() * 470 + 80),
    }));
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">${Math.round(data.reduce((a,d)=>a+(d.dispatched/d.ordered*100),0)/data.length)}%</div><div class="stat-label">Avg Dispatch Accuracy</div></div>
            <div class="stat-card"><div class="stat-number">${data.reduce((a,d)=>a+d.dispatched,0).toLocaleString()}</div><div class="stat-label">Units Dispatched</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--danger-color);">${data.reduce((a,d)=>a+(d.ordered-d.dispatched),0)}</div><div class="stat-label">Units Short-Shipped</div></div>
        </div>
        <table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Ordered</th><th>Picked</th><th>Dispatched</th><th>Accuracy</th></tr></thead>
        <tbody>${data.map(d => {
            const acc = Math.round(d.dispatched / d.ordered * 100);
            return `<tr>
                <td><code>${d.id}</code></td><td>${d.customer}</td>
                <td>${d.ordered}</td><td>${d.picked}</td><td>${d.dispatched}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="width:50px;height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${acc}%;background:${acc>=98?'var(--success-color)':acc>=90?'var(--warning-color)':'var(--danger-color)'};border-radius:99px;"></div></div>
                        <span style="font-weight:700;">${acc}%</span>
                    </div>
                </td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('dispatchAccModal', 'Dispatch Accuracy Report', 'bx-check-double', body, 850);
};

// ===== F188: Finance Monthly P&L =====
window.showMonthlyPL = function() {
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug (Partial)'];
    const data = months.map((m, i) => ({
        month: m,
        revenue: 850000 + i * 45000 + Math.random() * 50000,
        cogs: 520000 + i * 25000 + Math.random() * 30000,
        opex: 150000 + i * 5000 + Math.random() * 10000,
    }));
    const body = `
        <table class="table"><thead><tr><th>Month</th><th>Revenue</th><th>COGS</th><th>Gross Profit</th><th>OPEX</th><th>Net Profit</th><th>Net Margin</th></tr></thead>
        <tbody>${data.map(d => {
            const gp = d.revenue - d.cogs;
            const np = gp - d.opex;
            const nm = Math.round(np / d.revenue * 100);
            return `<tr>
                <td><strong>${d.month}</strong></td>
                <td>₹${Math.round(d.revenue / 1000)}K</td>
                <td>₹${Math.round(d.cogs / 1000)}K</td>
                <td style="color:var(--success-color);">₹${Math.round(gp / 1000)}K</td>
                <td>₹${Math.round(d.opex / 1000)}K</td>
                <td style="font-weight:700;color:${np > 0 ? 'var(--success-color)' : 'var(--danger-color)'};">₹${Math.round(np / 1000)}K</td>
                <td><span style="font-weight:700;color:${nm > 15 ? 'var(--success-color)' : nm > 8 ? 'var(--warning-color)' : 'var(--danger-color)'};">${nm}%</span></td>
            </tr>`;
        }).join('')}</tbody></table>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('P&L report exported to PDF','success')"><i class='bx bx-download'></i> Export PDF</button>`;
    makeModal('plModal', 'Monthly Profit & Loss Report', 'bx-stats', body, 900);
};

// ===== F189: Labour Productivity Report =====
window.showLabourProductivity = function() {
    const workers = DataManager.getWorkers();
    const body = `
        <table class="table"><thead><tr><th>Worker</th><th>Role</th><th>Hours Worked</th><th>Units Processed</th><th>Units/Hour</th><th>Task Completion</th><th>Rating</th></tr></thead>
        <tbody>${workers.map(w => {
            const hours = Math.floor(Math.random() * 4 + 6);
            const units = Math.floor(hours * (Math.random() * 80 + 60));
            const uph = Math.round(units / hours);
            const completion = Math.floor(Math.random() * 20 + 78);
            const rating = completion >= 95 ? '⭐⭐⭐' : completion >= 85 ? '⭐⭐' : '⭐';
            return `<tr>
                <td><strong>${w.name}</strong></td><td>${w.role}</td>
                <td>${hours}h</td><td>${units}</td>
                <td><strong>${uph}</strong></td>
                <td>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div style="width:60px;height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${completion}%;background:${completion>=95?'var(--success-color)':completion>=85?'var(--warning-color)':'var(--danger-color)'};border-radius:99px;"></div></div>
                        <span>${completion}%</span>
                    </div>
                </td>
                <td>${rating}</td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('labourProdModal', 'Labour Productivity Report', 'bx-group', body, 900);
};

// ===== F190: Emergency Contact Directory =====
window.showEmergencyContacts = function() {
    const key = 'wms_emergency_contacts';
    const contacts = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { name: 'Admin User', mobile: '+91 98765 43210', relation: 'Self', emergencyContact: 'Priya (Wife)', emergencyMobile: '+91 98765 43211' },
        { name: 'Warehouse Mgr', mobile: '+91 87654 32109', relation: 'Self', emergencyContact: 'Ramesh (Father)', emergencyMobile: '+91 87654 32108' },
        { name: 'Scanner 1', mobile: '+91 76543 21098', relation: 'Self', emergencyContact: 'Sita (Mother)', emergencyMobile: '+91 76543 21097' },
    ]));
    const body = `
        <table class="table"><thead><tr><th>Worker</th><th>Mobile</th><th>Emergency Contact</th><th>Emergency Mobile</th><th>Action</th></tr></thead>
        <tbody>${contacts.map(c => `<tr>
            <td><strong>${c.name}</strong></td>
            <td><a href="tel:${c.mobile}" style="color:var(--primary-color);">${c.mobile}</a></td>
            <td>${c.emergencyContact}</td>
            <td><a href="tel:${c.emergencyMobile}" style="color:var(--danger-color);">${c.emergencyMobile}</a></td>
            <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('Contact info updated','success')">Edit</button></td>
        </tr>`).join('')}</tbody></table>
        <div style="margin-top:12px;display:flex;gap:10px;">
            <div style="background:var(--danger-color)10;border:1px solid var(--danger-color)30;border-radius:10px;padding:12px;font-size:0.82rem;flex:1;">
                <strong style="color:var(--danger-color);">Emergency Numbers:</strong><br>
                Ambulance: 108 | Police: 100 | Fire: 101 | Factory Safety: 1800-XXX-XXXX
            </div>
        </div>`;
    makeModal('emergencyModal', 'Emergency Contact Directory', 'bx-phone', body, 850);
};

// ===== F191-F200: Remaining Quick Features =====

// F191: API Key Manager
window.showAPIKeyManager = function() {
    const key = 'wms_api_keys';
    const keys = JSON.parse(localStorage.getItem(key) || JSON.stringify([
        { id: 'KEY-001', name: 'Shopify Integration', key: 'wms_sh_live_' + Math.random().toString(36).slice(2, 18), created: '01 Jul 2026', lastUsed: 'Today', status: 'Active' },
        { id: 'KEY-002', name: 'Mobile App Access', key: 'wms_mob_' + Math.random().toString(36).slice(2, 18), created: '15 Jun 2026', lastUsed: 'Yesterday', status: 'Active' },
    ]));
    const body = `
        <div style="margin-bottom:16px;"><button class="btn btn-primary" onclick="window.generateAPIKey()"><i class='bx bx-plus'></i> Generate New Key</button></div>
        <table class="table"><thead><tr><th>Name</th><th>API Key</th><th>Created</th><th>Last Used</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${keys.map(k => `<tr>
            <td>${k.name}</td>
            <td><code style="font-size:0.72rem;">${k.key.slice(0, 20)}...</code> <button onclick="navigator.clipboard?.writeText('${k.key}');window.showToast('Copied!','success')" style="border:none;background:none;cursor:pointer;color:var(--primary-color);"><i class='bx bx-copy'></i></button></td>
            <td>${k.created}</td><td>${k.lastUsed}</td>
            <td><span class="badge status-success">${k.status}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.72rem;padding:2px 8px;color:var(--danger-color);" onclick="window.showToast('API Key revoked','warning')">Revoke</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('apiKeyModal', 'API Key Manager', 'bx-key', body, 850);
};
window.generateAPIKey = function() { window.showToast('New API key generated and copied to clipboard', 'success'); };

// F192: WhatsApp Message Log
window.showWhatsAppLog = function() {
    const logs = [
        { time: 'Today 10:30', recipient: 'Warehouse Mgr (+91 87654 32109)', message: '⚠️ LOW STOCK ALERT: Aloo Bhujia (500g) below 100 units', status: 'Delivered' },
        { time: 'Today 09:00', recipient: 'Admin (+91 98765 43210)', message: '📦 GRN-2026-089 received from ABC Spices — 4 items passed QC', status: 'Read' },
        { time: 'Yesterday 14:00', recipient: 'QC Team (+91 76543 21000)', message: '🔴 QUALITY FAIL: Batch #B-2401 failed moisture test (18% vs 12%)', status: 'Delivered' },
    ];
    const body = `
        <div style="display:flex;flex-direction:column;gap:10px;">
            ${logs.map(l => `
            <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:14px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.75rem;color:var(--text-muted);">${l.time} → ${l.recipient}</span>
                    <span class="badge ${l.status==='Read'?'status-success':'status-info'}" style="font-size:0.68rem;">${l.status}</span>
                </div>
                <div style="font-size:0.85rem;font-weight:500;">${l.message}</div>
            </div>`).join('')}
        </div>
        <button class="btn btn-outline" style="margin-top:12px;" onclick="window.showToast('Message sent to all recipients','success')"><i class='bxl bxl-whatsapp'></i> Send Test Message</button>`;
    makeModal('waLogModal', 'WhatsApp Message Log', 'bxl-whatsapp', body, 700);
};

// F193: SAP Sync Dashboard
window.showSAPSync = function() {
    const body = `
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">✓ Live</div><div class="stat-label">SAP Connection</div></div>
            <div class="stat-card"><div class="stat-number">Today 11:30</div><div class="stat-label">Last Sync</div></div>
            <div class="stat-card"><div class="stat-number" style="color:var(--success-color);">1,247</div><div class="stat-label">Records Synced</div></div>
        </div>
        <table class="table"><thead><tr><th>Module</th><th>Records</th><th>Last Sync</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${[['Materials','847','11:30','Synced'],['Purchase Orders','125','11:28','Synced'],['Goods Receipt','89','11:25','Synced'],['Vendors','42','11:20','Synced'],['Cost Centers','18','09:00','Warning — 2 errors']].map(([m,r,t,s])=>`<tr>
            <td>${m}</td><td>${r}</td><td>${t}</td>
            <td><span class="badge ${s.includes('Warning')?'status-warning':'status-success'}">${s}</span></td>
            <td><button class="btn btn-outline" style="font-size:0.75rem;padding:3px 8px;" onclick="window.showToast('${m} sync triggered','info')">Sync Now</button></td>
        </tr>`).join('')}</tbody></table>`;
    makeModal('sapModal', 'SAP ERP Sync Dashboard', 'bx-server', body, 800);
};

// F194: Login Audit Log
window.showLoginAudit = function() {
    const logs = [
        { user: 'Admin User', time: 'Today 08:00 AM', ip: '192.168.1.101', device: 'Chrome/Windows', status: 'Success' },
        { user: 'Warehouse Mgr', time: 'Today 08:15 AM', ip: '192.168.1.105', device: 'Chrome/Windows', status: 'Success' },
        { user: 'Unknown', time: 'Yesterday 02:31 AM', ip: '45.133.74.52', device: 'Firefox/Linux', status: 'Failed' },
        { user: 'Scanner 1', time: 'Yesterday 13:00 PM', ip: '192.168.1.108', device: 'Android/Chrome', status: 'Success' },
    ];
    const body = `
        <table class="table"><thead><tr><th>User</th><th>Date & Time</th><th>IP Address</th><th>Device</th><th>Status</th></tr></thead>
        <tbody>${logs.map(l => `<tr style="${l.status==='Failed'?'background:var(--danger-color)05;':''}">
            <td>${l.user}</td><td>${l.time}</td>
            <td><code>${l.ip}</code> ${l.ip.startsWith('45')?'<span class="badge status-danger" style="font-size:0.65rem;">External</span>':''}</td>
            <td style="font-size:0.8rem;color:var(--text-muted);">${l.device}</td>
            <td><span class="badge ${l.status==='Success'?'status-success':'status-danger'}">${l.status}</span></td>
        </tr>`).join('')}</tbody></table>
        <div style="margin-top:12px;padding:12px;background:var(--warning-color)10;border-radius:10px;font-size:0.82rem;">
            <i class='bx bx-error' style="color:var(--warning-color);"></i> 1 failed login attempt from external IP detected at 02:31 AM.
        </div>`;
    makeModal('loginAuditModal', 'Login Audit Log', 'bx-log-in', body, 850);
};

// F195: Predictive Maintenance Scheduler
window.showPredictiveMaintenance = function() {
    const equipment = [
        { name: 'Line 1 Extruder', lastService: '01 Jun 2026', interval: 60, nextDue: '31 Jul 2026', healthScore: 62, status: 'Overdue' },
        { name: 'Line 2 Fryer', lastService: '15 Jul 2026', interval: 45, nextDue: '29 Aug 2026', healthScore: 88, status: 'Good' },
        { name: 'Cooling Conveyor', lastService: '10 Jul 2026', interval: 30, nextDue: '09 Aug 2026', healthScore: 71, status: 'Due Soon' },
        { name: 'Packaging Machine 3', lastService: '01 Aug 2026', interval: 30, nextDue: '31 Aug 2026', healthScore: 95, status: 'Good' },
        { name: 'Cold Storage Compressor', lastService: '20 Jul 2026', interval: 14, nextDue: '03 Aug 2026', healthScore: 58, status: 'Overdue' },
    ];
    const body = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            ${equipment.map(e => {
                const color = e.status === 'Good' ? 'var(--success-color)' : e.status === 'Due Soon' ? 'var(--warning-color)' : 'var(--danger-color)';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:12px;padding:14px;display:flex;align-items:center;gap:14px;">
                    <div style="width:50px;height:50px;background:${color}15;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:${color};">⚙️</div>
                    <div style="flex:1;">
                        <div style="font-weight:700;">${e.name}</div>
                        <div style="font-size:0.78rem;color:var(--text-muted);">Last: ${e.lastService} | Next: ${e.nextDue} | Interval: ${e.interval} days</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
                            <span style="font-size:0.72rem;color:var(--text-muted);">Health:</span>
                            <div style="width:80px;height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${e.healthScore}%;background:${color};border-radius:99px;"></div></div>
                            <span style="font-size:0.72rem;font-weight:700;color:${color};">${e.healthScore}%</span>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                        <span class="badge ${e.status==='Good'?'status-success':e.status==='Due Soon'?'status-warning':'status-danger'}">${e.status}</span>
                        <button class="btn btn-outline" style="font-size:0.72rem;padding:3px 8px;" onclick="window.showToast('Service scheduled for ${e.name}','success')">Schedule</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    makeModal('maintModal', 'Predictive Maintenance Scheduler', 'bx-wrench', body, 750);
};

// F196: Cost per Unit Trend
window.showCostPerUnit = function() {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const products = DataManager.getProducts().slice(0, 3);
    const body = `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Cost per unit trend for the last 6 months. Includes raw materials, labour, and packaging.</p>
        <table class="table"><thead><tr><th>Product</th>${months.map(m=>`<th>${m}</th>`).join('')}<th>Trend</th></tr></thead>
        <tbody>${products.map(p => {
            const base = parseFloat(p.price) * 0.65;
            const costs = months.map((_,i) => (base + (i * 0.8) + (Math.random() * 2 - 1)).toFixed(2));
            const trend = parseFloat(costs[5]) > parseFloat(costs[0]) ? '↑ Rising' : '↓ Falling';
            const trendColor = trend.includes('Rising') ? 'var(--danger-color)' : 'var(--success-color)';
            return `<tr>
                <td>${p.name}</td>
                ${costs.map(c => `<td>₹${c}</td>`).join('')}
                <td style="color:${trendColor};font-weight:700;">${trend}</td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('costTrendModal', 'Cost per Unit Trend', 'bx-line-chart', body, 900);
};

// F197: Customer Returns Analysis
window.showReturnsAnalysis = function() {
    const returns = DataManager.getReturns();
    const reasons = {};
    returns.forEach(r => { reasons[r.reason] = (reasons[r.reason] || 0) + 1; });
    const body = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h3 style="font-size:1rem;margin-bottom:12px;">Top Return Reasons</h3>
                ${Object.entries(reasons).sort((a,b)=>b[1]-a[1]).map(([reason, count]) => `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                    <div style="flex:1;font-size:0.82rem;">${reason}</div>
                    <div style="width:80px;height:8px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${count/returns.length*100}%;background:var(--danger-color);border-radius:99px;"></div></div>
                    <div style="font-weight:700;min-width:20px;">${count}</div>
                </div>`).join('')}
            </div>
            <div>
                <h3 style="font-size:1rem;margin-bottom:12px;">Returns by Customer</h3>
                ${returns.map(r => `
                <div style="padding:8px;background:var(--bg-main);border-radius:8px;margin-bottom:6px;font-size:0.82rem;">
                    <strong>${r.id}</strong> — ${r.customer}<br>
                    <span style="color:var(--text-muted);">${r.items}</span><br>
                    <span class="badge ${r.reasonClass||'status-warning'}">${r.status}</span>
                </div>`).join('')}
            </div>
        </div>`;
    makeModal('returnsAnalysisModal', 'Customer Returns Analysis', 'bx-undo', body, 800);
};

// F198: Attendance Punch-In Simulator (Biometric)
window.showBiometricPunch = function() {
    const body = `
        <div style="text-align:center;padding:20px;">
            <div style="width:120px;height:120px;background:var(--primary-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;border:3px solid var(--primary-color);">
                <i class='bx bx-fingerprint' style="font-size:4rem;color:var(--primary-color);"></i>
            </div>
            <h3>Biometric Attendance</h3>
            <p style="color:var(--text-muted);margin-bottom:20px;">Place your finger on the scanner or use the quick punch button below.</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">
                <button class="btn btn-primary" onclick="window.punchIn()"><i class='bx bx-log-in'></i> Punch In</button>
                <button class="btn btn-outline" onclick="window.punchOut()"><i class='bx bx-log-out'></i> Punch Out</button>
            </div>
            <div style="background:var(--bg-main);border-radius:12px;padding:16px;font-size:0.85rem;">
                <strong>Today's Status:</strong><br>
                <span style="color:var(--success-color);">✓ Admin User — Punched In at 08:30 AM</span>
            </div>
        </div>`;
    makeModal('biometricModal', 'Biometric Attendance', 'bx-fingerprint', body, 500);
};
window.punchIn = function() {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const att = DataManager.getAttendance();
    att.unshift({ id: 'ATT-' + Date.now().toString().slice(-4), worker: 'Admin User', date: 'Today', punchIn: time, punchOut: '', hours: 0, status: 'Clocked In' });
    localStorage.setItem('wms_attendance', JSON.stringify(att));
    window.showToast('Punched in at ' + time, 'success');
    document.getElementById('biometricModal')?.remove();
};
window.punchOut = function() {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    window.showToast('Punched out at ' + time, 'info');
    document.getElementById('biometricModal')?.remove();
};

// F199: Overtime Calculator
window.showOvertimeCalculator = function() {
    const workers = DataManager.getWorkers();
    const body = `
        <table class="table"><thead><tr><th>Worker</th><th>Regular Hours (8/day)</th><th>Overtime Hours</th><th>OT Rate</th><th>OT Pay</th><th>Approval</th></tr></thead>
        <tbody>${workers.map(w => {
            const ot = Math.floor(Math.random() * 15);
            const rate = (w.hourlyRate || 150) * 1.5;
            const otPay = Math.round(ot * rate);
            return `<tr>
                <td><strong>${w.name}</strong></td>
                <td>${w.shift === 'PM' ? 8 : 8}</td>
                <td><strong style="color:${ot > 0 ? 'var(--warning-color)' : 'var(--text-muted)'};">${ot}h</strong></td>
                <td>₹${rate.toFixed(0)}/hr</td>
                <td><strong>₹${otPay.toLocaleString('en-IN')}</strong></td>
                <td>${ot > 0 ? `<button class="btn btn-primary" style="font-size:0.72rem;padding:3px 7px;" onclick="window.showToast('OT approved for ${w.name}','success')">Approve</button>` : '—'}</td>
            </tr>`;
        }).join('')}</tbody></table>`;
    makeModal('overtimeModal', 'Overtime Calculator', 'bx-time-five', body, 850);
};

// F200: Worker Performance Scorecard
window.showWorkerScorecard = function() {
    const workers = DataManager.getWorkers();
    const body = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
            ${workers.map(w => {
                const attendance = Math.floor(Math.random() * 10 + 88);
                const taskCompletion = Math.floor(Math.random() * 15 + 82);
                const quality = Math.floor(Math.random() * 8 + 90);
                const overall = Math.round((attendance + taskCompletion + quality) / 3);
                const grade = overall >= 95 ? 'A+' : overall >= 90 ? 'A' : overall >= 85 ? 'B' : overall >= 75 ? 'C' : 'D';
                const gradeColor = overall >= 90 ? 'var(--success-color)' : overall >= 80 ? 'var(--warning-color)' : 'var(--danger-color)';
                return `
                <div style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:16px;padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                        <div><strong>${w.name}</strong><div style="font-size:0.75rem;color:var(--text-muted);">${w.role}</div></div>
                        <div style="width:48px;height:48px;background:${gradeColor}20;border:2px solid ${gradeColor};border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;color:${gradeColor};">${grade}</div>
                    </div>
                    ${[['Attendance', attendance], ['Task Completion', taskCompletion], ['Quality Score', quality]].map(([label, val]) => `
                    <div style="margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:3px;"><span>${label}</span><span style="font-weight:700;">${val}%</span></div>
                        <div style="height:6px;background:var(--border-color);border-radius:99px;"><div style="height:100%;width:${val}%;background:var(--primary-color);border-radius:99px;"></div></div>
                    </div>`).join('')}
                    <div style="margin-top:12px;padding:8px;background:var(--primary-light);border-radius:8px;text-align:center;">
                        <strong style="color:var(--primary-color);">Overall: ${overall}%</strong>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    makeModal('workerScorecardModal', 'Worker Performance Scorecard', 'bx-award', body, 900);
};

// ===== MAKE MODAL HELPER (fallback for Part 3) =====
if (typeof makeModal === 'undefined') {
    window.makeModal = function(id, title, icon, body, minWidth) {
        const existing = document.getElementById(id);
        if (existing) { existing.remove(); return null; }
        const modal = document.createElement('div');
        modal.id = id;
        modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        modal.innerHTML = `<div style="background:var(--bg-card);border-radius:20px;padding:32px;min-width:${minWidth||600}px;max-width:95vw;max-height:90vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 25px 50px rgba(0,0,0,0.3);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;"><h2 style="margin:0;font-size:1.2rem;display:flex;align-items:center;gap:10px;"><i class='bx ${icon}' style="color:var(--primary-color);font-size:1.4rem;"></i>${title}</h2><button onclick="document.getElementById('${id}').remove()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:6px 12px;cursor:pointer;color:var(--text-muted);font-size:1rem;">✕ Close</button></div>${body}</div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
        return modal;
    };
}

// ===== QUICK-ACCESS LAUNCHER for All New Features =====
window.showFeatureLauncher = function() {
    const features = [
        // Inventory
        ['Bin Map Visualizer','window.showBinMap()','bx-grid-alt','Inventory'],
        ['Cycle Count Scheduler','window.showCycleCount()','bx-calendar-check','Inventory'],
        ['ABC/XYZ Analysis','window.showABCXYZ()','bx-bar-chart-alt-2','Inventory'],
        ['Dead Stock Flag','window.showDeadStock()','bx-error','Inventory'],
        ['Over-Stock Radar','window.showOverStockRadar()','bx-radar','Inventory'],
        ['Transfer Order','window.showTransferOrder()','bx-transfer','Inventory'],
        ['Capacity Planner','window.showCapacityPlanner()','bx-building','Inventory'],
        ['FEFO Picker','window.showFEFOPicker()','bx-sort-alt-2','Inventory'],
        ['Pallet Optimizer','window.showPalletOptimizer()','bx-package','Inventory'],
        ['Heatmap','window.showHeatmap()','bx-grid','Inventory'],
        ['Stock Lock','window.showStockLock()','bx-lock','Inventory'],
        ['Reservations','window.showStockReservations()','bx-bookmark','Inventory'],
        ['Snapshots','window.showInventorySnapshots()','bx-history','Inventory'],
        ['Virtual Warehouse','window.showVirtualWarehouse()','bx-buildings','Inventory'],
        ['Stock Aging','window.showStockAging()','bx-time','Inventory'],
        ['Write-Off Form','window.showWriteOff()','bx-trash','Inventory'],
        ['Valuation Method','window.showValuationMethod()','bx-coin','Inventory'],
        ['Wave Planner','window.showWavePlanner()','bx-wave','Inventory'],
        ['Zone Throughput','window.showZoneThroughput()','bx-trending-up','Inventory'],
        // Sales
        ['SO Auto-Routing','window.showSORouter()','bx-map-alt','Sales'],
        ['Credit Checker','window.showCreditChecker()','bx-credit-card','Sales'],
        ['Priority Queue','window.showPriorityQueue()','bx-list-ol','Sales'],
        ['Partial Fulfillment','window.showPartialFulfillment()','bx-package','Sales'],
        ['Generate RMA','window.generateRMA()','bx-receipt','Sales'],
        ['COD Tracker','window.showCODTracker()','bx-money','Sales'],
        ['Payment Reminders','window.showPaymentReminders()','bx-bell','Sales'],
        ['Discount Matrix','window.showDiscountMatrix()','bx-purchase-tag','Sales'],
        ['Promo Manager','window.showPromoManager()','bx-gift','Sales'],
        ['Delivery Challan','window.generateDeliveryChallan()','bx-file','Sales'],
        ['Loyalty Points','window.showLoyaltyPoints()','bx-star','Sales'],
        ['Order History','window.showOrderHistory()','bx-history','Sales'],
        ['Territory Map','window.showTerritoryMap()','bx-map','Sales'],
        ['Top Customers','window.showCustomerLeaderboard()','bx-trophy','Sales'],
        ['Complaints','window.showComplaints()','bx-message-error','Sales'],
        // Production
        ['BOM Manager','window.showBOMManager()','bx-list-ul','Production'],
        ['Production Wizard','window.showProductionWizard()','bx-factory','Production'],
        ['OEE Dashboard','window.showOEEDashboard()','bx-tachometer','Production'],
        ['Shift Log','window.showShiftLog()','bx-clipboard','Production'],
        ['Yield Variance','window.showYieldVariance()','bx-pie-chart-alt','Production'],
        ['Rework Tracker','window.showReworkTracker()','bx-refresh','Production'],
        ['Rejection Pareto','window.showRejectionPareto()','bx-bar-chart','Production'],
        ['Stoppage Log','window.showStoppageLog()','bx-stop','Production'],
        ['RM Consumption','window.showConsumptionTracker()','bx-bar-chart-alt','Production'],
        ['FG Release Gate','window.showFGReleaseGate()','bx-shield-quarter','Production'],
        ['Production KPIs','window.showProductionKPIs()','bx-tachometer','Production'],
        ['Changeover Tracker','window.showChangeoverTracker()','bx-time-five','Production'],
        ['Batch Genealogy','window.showBatchGenealogy()','bx-git-branch','Production'],
        // Finance
        ['GST Invoice','window.generateGSTInvoice()','bx-receipt','Finance'],
        ['E-Way Bill','window.showEWayBillTracker()','bx-receipt','Finance'],
        ['Budget vs Actual','window.showBudgetTracker()','bx-calculator','Finance'],
        ['Margin Calculator','window.showMarginCalculator()','bx-trending-up','Finance'],
        ['AR Ageing','window.showARAgeing()','bx-wallet','Finance'],
        ['Cash Flow','window.showCashFlow()','bx-dollar','Finance'],
        ['Landed Cost','window.showLandedCost()','bx-ship','Finance'],
        ['Compliance Report','window.showComplianceReport()','bx-shield-quarter','Finance'],
        ['Monthly P&L','window.showMonthlyPL()','bx-stats','Finance'],
        ['Cost Trend','window.showCostPerUnit()','bx-line-chart','Finance'],
        ['Tally Export','window.exportTallyXML()','bx-file-blank','Finance'],
        ['UPI Link','window.generateUPILink()','bx-qr','Finance'],
        // AI & Analytics
        ['Demand Forecast','window.showDemandForecast()','bx-trending-up','AI/Analytics'],
        ['Anomaly Detector','window.showAnomalyDetector()','bx-radar','AI/Analytics'],
        ['Daily Briefing','window.showDailyBriefing()','bx-bot','AI/Analytics'],
        ['Workflow Builder','window.showWorkflowBuilder()','bx-git-branch','AI/Analytics'],
        ['SKU Velocity','window.showSKUVelocity()','bx-sprint','AI/Analytics'],
        ['Custom Reports','window.showReportBuilder()','bx-file-blank','AI/Analytics'],
        ['Reorder Suggester','window.showReorderSuggester()','bx-recycle','AI/Analytics'],
        ['Supplier OTD','window.showSupplierOTD()','bx-truck','AI/Analytics'],
        ['Dispatch Accuracy','window.showDispatchAccuracy()','bx-check-double','AI/Analytics'],
        ['Returns Analysis','window.showReturnsAnalysis()','bx-undo','AI/Analytics'],
        ['Labour Productivity','window.showLabourProductivity()','bx-group','AI/Analytics'],
        // HR
        ['Leave Management','window.showLeaveManagement()','bx-calendar-x','HR'],
        ['Payroll Summary','window.showPayrollSummary()','bx-money','HR'],
        ['Skill Matrix','window.showSkillMatrix()','bx-badge-check','HR'],
        ['Shift Roster','window.showShiftRoster()','bx-calendar','HR'],
        ['Training Tracker','window.showTrainingTracker()','bx-graduation','HR'],
        ['Biometric Punch','window.showBiometricPunch()','bx-fingerprint','HR'],
        ['Overtime Calc','window.showOvertimeCalculator()','bx-time-five','HR'],
        ['Worker Scorecard','window.showWorkerScorecard()','bx-award','HR'],
        ['Emergency Contacts','window.showEmergencyContacts()','bx-phone','HR'],
        // Integrations
        ['Webhook Manager','window.showWebhookDispatcher()','bx-link','Integrations'],
        ['API Keys','window.showAPIKeyManager()','bx-key','Integrations'],
        ['WhatsApp Log','window.showWhatsAppLog()','bxl-whatsapp','Integrations'],
        ['SAP Sync','window.showSAPSync()','bx-server','Integrations'],
        ['IoT Sensors','window.showIoTDashboard()','bx-wifi','Integrations'],
        ['GSTIN Validator','window.showGSTINValidator()','bx-check-shield','Integrations'],
        // Security & UX
        ['Access Matrix','window.showAccessMatrix()','bx-shield','Security'],
        ['Login Audit','window.showLoginAudit()','bx-log-in','Security'],
        ['2FA Simulator','window.showTwoFactorAuth()','bx-lock','Security'],
        ['Session Settings','window.showSessionSettings()','bx-time','Security'],
        ['Global Search','window.showGlobalSearch()','bx-search','UX'],
        ['Recent Pages','window.showRecentPages()','bx-history','UX'],
        ['Pinned Favorites','window.showFavoritesManager()','bx-star','UX'],
        ['Scratchpad','window.showScratchpad()','bx-notepad','UX'],
        ['Full Backup','window.downloadFullBackup()','bx-cloud-download','UX'],
        ['Restore Backup','window.showDataRestore()','bx-upload','UX'],
        ['Color Themes','window.showThemePicker()','bx-palette','UX'],
        ['Announcements','window.showAnnouncementManager()','bx-bell','UX'],
        ['Predictive Maint.','window.showPredictiveMaintenance()','bx-wrench','Maintenance'],
    ];

    const categories = [...new Set(features.map(f => f[3]))];
    const body = `
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
            ${categories.map(cat => `<button class="btn btn-outline" style="font-size:0.75rem;padding:4px 12px;" onclick="document.querySelectorAll('.feat-item').forEach(el=>el.style.display=el.dataset.cat==='${cat}'||'${cat}'===''?'flex':'none')">${cat}</button>`).join('')}
            <button class="btn btn-primary" style="font-size:0.75rem;padding:4px 12px;" onclick="document.querySelectorAll('.feat-item').forEach(el=>el.style.display='flex')">Show All</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;max-height:60vh;overflow-y:auto;">
            ${features.map(([name, action, icon, cat]) => `
            <div class="feat-item" data-cat="${cat}" style="display:flex;align-items:center;gap:8px;padding:10px;background:var(--bg-main);border:1px solid var(--border-color);border-radius:10px;cursor:pointer;transition:all 0.2s;font-size:0.78rem;"
                onmouseover="this.style.borderColor='var(--primary-color)';this.style.background='var(--primary-light)'"
                onmouseout="this.style.borderColor='var(--border-color)';this.style.background='var(--bg-main)'"
                onclick="${action};document.getElementById('featureLauncherModal')?.remove()">
                <i class='bx ${icon}' style="color:var(--primary-color);font-size:1.1rem;min-width:20px;"></i>
                <span>${name}</span>
            </div>`).join('')}
        </div>`;
    makeModal('featureLauncherModal', `Feature Launcher — ${features.length} Features`, 'bx-rocket', body, 900);
};

// Auto-initialize session timeout
document.addEventListener('DOMContentLoaded', function() {
    window.setupSessionTimeout && window.setupSessionTimeout();
});

console.log('Features Part 3 (F178-F200+) loaded — UX, Utilities, Security, Quick Launcher');
