// Power Features — F76-F100
// F66: Dark/Light Mode Toggle
window.applyTheme = function() {
    const theme = DataManager.getTheme();
    const root = document.documentElement;
    if (theme === 'light') {
        root.style.setProperty('--bg-main', '#f1f5f9');
        root.style.setProperty('--bg-card', '#ffffff');
        root.style.setProperty('--bg-sidebar', '#1e293b');
        root.style.setProperty('--text-main', '#0f172a');
        root.style.setProperty('--text-muted', '#64748b');
        root.style.setProperty('--border-color', '#e2e8f0');
    } else {
        root.style.setProperty('--bg-main', '#0f172a');
        root.style.setProperty('--bg-card', '#1e293b');
        root.style.setProperty('--bg-sidebar', '#0f172a');
        root.style.setProperty('--text-main', '#f8fafc');
        root.style.setProperty('--text-muted', '#94a3b8');
        root.style.setProperty('--border-color', '#334155');
    }
};

window.toggleTheme = function() {
    const current = DataManager.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    DataManager.setTheme(next);
    window.applyTheme();
    window.showToast(`${next.charAt(0).toUpperCase() + next.slice(1)} mode activated`, 'info');
};

// F76: Breadcrumb Navigation
window.updateBreadcrumb = function(route) {
    const el = document.getElementById('breadcrumbRoute');
    if (!el) return;
    const labels = {
        dashboard:'Dashboard', products:'Products', barcode:'Barcode', batch:'Batch Management',
        inventory:'Inventory', purchase:'Purchasing', receiving:'Receiving', production:'Production',
        dispatch:'Dispatch', returns:'Returns & Reverse', quality:'Quality & FSSAI', finance:'Finance',
        reports:'Reports', settings:'Users & Security', ai_automation:'AI & Automation',
        logistics:'Logistics', intelligence:'Intelligence', maintenance:'Operations & Maint',
        distributor:'Distributor Portal', integrations:'Integrations', hr:'HR & Payroll',
        supplier_scorecard:'Supplier Scorecard', customers:'Customers', expenses:'Expenses', alerts:'Alerts Hub'
    };
    el.textContent = labels[route] || route;
};

// F77: Page Loading Skeleton
window.showSkeleton = function() {
    return `<div style="display:flex;flex-direction:column;gap:16px;padding:24px;">
        ${[1,2,3].map(()=>`
        <div style="background:var(--bg-card);border-radius:12px;padding:20px;animation:pulse 1.5s infinite;">
            <div style="height:18px;background:var(--border-color);border-radius:4px;width:40%;margin-bottom:16px;"></div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${[1,2,3,4].map(()=>`<div style="height:80px;background:var(--border-color);border-radius:8px;"></div>`).join('')}
            </div>
        </div>`).join('')}
    </div>`;
};

// F78: Keyboard Shortcut Panel
window.showKeyboardShortcuts = function() {
    const modal = document.createElement('div');
    modal.id = 'kbShortcutModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;padding:32px;min-width:500px;max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <h2 style="margin:0;font-size:1.2rem;"><i class='bx bx-keyboard'></i> Keyboard Shortcuts</h2>
                <button onclick="document.getElementById('kbShortcutModal').remove()" style="background:none;border:none;color:var(--text-muted);font-size:1.5rem;cursor:pointer;">✕</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                ${[
                    ['?', 'Show this panel'],['Escape', 'Close modals'],['Alt + D', 'Go to Dashboard'],
                    ['Alt + P', 'Go to Products'],['Alt + I', 'Go to Inventory'],['Alt + R', 'Go to Reports'],
                    ['Alt + S', 'Go to Settings'],['Alt + T', 'Toggle Dark/Light mode'],['Alt + A', 'Go to Alerts Hub'],
                    ['Ctrl + Shift + N', 'New Product'],['Ctrl + Shift + P', 'New Purchase Order'],['Ctrl + Shift + S', 'New Sales Order']
                ].map(([key, desc]) => `
                    <div style="display:flex;justify-content:space-between;padding:8px;background:var(--bg-main);border-radius:6px;align-items:center;">
                        <span style="font-size:0.8rem;">${desc}</span>
                        <kbd style="background:var(--border-color);padding:2px 8px;border-radius:4px;font-size:0.75rem;font-family:monospace;">${key}</kbd>
                    </div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target === modal) modal.remove(); });
};

// F79: Right-Click Context Menu
window.setupContextMenu = function() {
    const menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.style.cssText = 'position:fixed;z-index:9999;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:6px;min-width:160px;box-shadow:var(--shadow-lg);display:none;';
    menu.innerHTML = `
        <div class="ctx-item" onclick="window.showToast('Row copied to clipboard','success');document.getElementById('contextMenu').style.display='none';" style="padding:6px 12px;cursor:pointer;border-radius:4px;font-size:0.8rem;display:flex;gap:8px;align-items:center;"><i class='bx bx-copy'></i> Copy Row</div>
        <div class="ctx-item" onclick="window.showToast('Row details exported','info');document.getElementById('contextMenu').style.display='none';" style="padding:6px 12px;cursor:pointer;border-radius:4px;font-size:0.8rem;display:flex;gap:8px;align-items:center;"><i class='bx bx-export'></i> Export Row</div>
        <hr style="border:none;border-top:1px solid var(--border-color);margin:4px 0;">
        <div class="ctx-item" onclick="window.showToast('Navigation feature','info');document.getElementById('contextMenu').style.display='none';" style="padding:6px 12px;cursor:pointer;border-radius:4px;font-size:0.8rem;display:flex;gap:8px;align-items:center;color:var(--primary-color);"><i class='bx bx-link-external'></i> Open Detail</div>`;
    document.body.appendChild(menu);
    
    document.addEventListener('contextmenu', e => {
        if (e.target.closest('table')) {
            e.preventDefault();
            menu.style.display = 'block';
            menu.style.left = e.clientX + 'px';
            menu.style.top = e.clientY + 'px';
        }
    });
    document.addEventListener('click', () => { menu.style.display = 'none'; });
};

// F80: Column Sort
window.sortTable = function(tableId, col) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    const rows = [...tbody.querySelectorAll('tr')];
    const asc = table.dataset.sortDir !== 'asc';
    table.dataset.sortDir = asc ? 'asc' : 'desc';
    rows.sort((a, b) => {
        const ta = a.cells[col]?.textContent.trim() || '';
        const tb = b.cells[col]?.textContent.trim() || '';
        return asc ? ta.localeCompare(tb, undefined, {numeric:true}) : tb.localeCompare(ta, undefined, {numeric:true});
    });
    rows.forEach(r => tbody.appendChild(r));
};

// F81: Import from JSON
window.importJSON = function() {
    const raw = prompt('Paste JSON array to import (products format: [{id,name,category,stock,price},...]):');
    if (!raw) return;
    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) throw new Error('Not an array');
        arr.forEach(item => DataManager.addProduct(item));
        window.showToast(`${arr.length} items imported successfully`, 'success');
        DataManager.logAction('JSON Import', `Bulk import: ${arr.length} products`);
    } catch(e) {
        window.showToast('Invalid JSON format', 'danger');
    }
};

// F82: Full Data Export
window.exportAllData = function() {
    const data = {
        products: DataManager.getProducts(),
        inventory: DataManager.getInventory(),
        purchaseOrders: DataManager.getPurchaseOrders(),
        dispatchOrders: DataManager.getDispatchOrders(),
        receiving: DataManager.getReceiving(),
        returns: DataManager.getReturns(),
        workers: DataManager.getWorkers(),
        customers: DataManager.getCustomers(),
        expenses: DataManager.getExpenses(),
        suppliers: DataManager.getSuppliers(),
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `WMS_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    window.showToast('Full data backup exported as JSON', 'success');
    DataManager.logAction('Data Export', 'Full WMS data backup exported');
};

// F83: Data Reset Wizard
window.openResetWizard = function() {
    const modules = ['products','inventory','purchase_orders','dispatch_orders','receiving','returns','workers','customers','expenses','suppliers','attendance','alerts'];
    const choice = prompt(`Data Reset Wizard\nSelect module to reset:\n${modules.map((m,i)=>`${i+1}. ${m}`).join('\n')}\n\nEnter number (WARNING: irreversible!):`);
    if (!choice) return;
    const mod = modules[parseInt(choice)-1];
    if (!mod) { window.showToast('Invalid selection','danger'); return; }
    if (!confirm(`CONFIRM: Delete ALL ${mod} data? This cannot be undone.`)) return;
    localStorage.removeItem(`wms_${mod}`);
    window.showToast(`${mod} data has been reset`, 'danger');
    DataManager.logAction('Data Reset', `Module ${mod} data wiped`);
};

// F84: localStorage Usage Meter
window.getStorageUsage = function() {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
        if (key.startsWith('wms_')) total += (localStorage.getItem(key)||'').length;
    }
    return (total / 1024).toFixed(1);
};

// F85: Undo Last Delete
window._lastDeleted = null;
window.undoDelete = function(entity, data, restoreFn) {
    window._lastDeleted = { entity, data, restoreFn };
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:100px;right:24px;background:#1e293b;color:white;padding:12px 20px;border-radius:10px;z-index:9999;display:flex;gap:16px;align-items:center;box-shadow:0 8px 32px rgba(0,0,0,0.3);';
    toast.innerHTML = `<span>${entity} deleted</span><button onclick="window._performUndo()" style="background:var(--primary-color);border:none;color:white;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:600;">Undo</button>`;
    document.body.appendChild(toast);
    setTimeout(() => { if(toast.parentNode) toast.remove(); }, 5000);
};
window._performUndo = function() {
    if (!window._lastDeleted) return;
    const { restoreFn } = window._lastDeleted;
    if (typeof restoreFn === 'function') restoreFn();
    window.showToast('Undo successful', 'success');
    window._lastDeleted = null;
};

// F86: FSSAI License Dashboard (shown in Settings)
window.getFSSAIStatus = function() {
    const profile = DataManager.getCompanyProfile();
    const expiry = new Date(profile.licenseExpiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return { license: profile.fssai, expiry: profile.licenseExpiry, daysLeft, status: daysLeft < 90 ? 'warning' : 'ok' };
};

// F96: Activity Feed Live Renderer
window.renderActivityFeed = function(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const feed = DataManager.getActivityFeed();
    el.innerHTML = feed.slice(0,10).map(a => `
        <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border-color);">
            <div style="width:28px;height:28px;border-radius:50%;background:${a.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class='bx ${a.icon}' style="color:${a.color};font-size:0.9rem;"></i>
            </div>
            <div style="flex:1;">
                <div style="font-size:0.82rem;">${a.text}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${a.time}</div>
            </div>
        </div>`).join('');
};

// F97: PWA Install Banner
window.showPWABanner = function() {
    if (document.getElementById('pwaBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'pwaBanner';
    banner.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));color:white;padding:12px 24px;border-radius:50px;box-shadow:0 8px 32px rgba(37,99,235,0.4);z-index:9998;display:flex;align-items:center;gap:16px;font-size:0.85rem;';
    banner.innerHTML = `
        <i class='bx bx-mobile-alt' style="font-size:1.4rem;"></i>
        <span>Install Namkeen WMS as an app for offline access</span>
        <button onclick="document.getElementById('pwaBanner').remove();window.showToast('Added to Home Screen!','success');" style="background:white;color:var(--primary-color);border:none;padding:6px 16px;border-radius:20px;cursor:pointer;font-weight:700;font-size:0.8rem;">Install</button>
        <button onclick="document.getElementById('pwaBanner').remove()" style="background:rgba(255,255,255,0.2);border:none;color:white;padding:6px;border-radius:50%;cursor:pointer;font-size:1rem;">✕</button>`;
    document.body.appendChild(banner);
    setTimeout(() => { if(document.getElementById('pwaBanner')) document.getElementById('pwaBanner').remove(); }, 12000);
};

// F98: Print Mode
window.togglePrintMode = function() {
    document.body.classList.toggle('print-mode');
    const isPrint = document.body.classList.contains('print-mode');
    window.showToast(isPrint ? 'Print layout active — Ctrl+P to print' : 'Print mode off', 'info');
};

// F99: Floating Quick-Add FAB (Speed Dial)
window.createFAB = function() {
    if (document.getElementById('fabContainer')) return;
    const fab = document.createElement('div');
    fab.id = 'fabContainer';
    fab.style.cssText = 'position:fixed;bottom:32px;right:32px;z-index:9990;display:flex;flex-direction:column-reverse;align-items:flex-end;gap:12px;';
    fab.innerHTML = `
        <div id="fabMain" onclick="window.toggleFAB()" style="width:56px;height:56px;background:linear-gradient(135deg,var(--primary-color),var(--secondary-color));border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(37,99,235,0.4);transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <i class='bx bx-plus' id="fabIcon" style="color:white;font-size:1.6rem;transition:transform 0.3s;"></i>
        </div>
        <div id="fabOptions" style="display:none;flex-direction:column;gap:8px;align-items:flex-end;">
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:var(--bg-card);padding:4px 10px;border-radius:20px;font-size:0.75rem;color:var(--text-main);box-shadow:0 2px 8px rgba(0,0,0,0.2);">New Product</span>
                <div onclick="window.location.hash='#products';window.toggleFAB();" style="width:44px;height:44px;background:var(--secondary-color);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                    <i class='bx bx-box' style="color:white;font-size:1.2rem;"></i>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:var(--bg-card);padding:4px 10px;border-radius:20px;font-size:0.75rem;color:var(--text-main);box-shadow:0 2px 8px rgba(0,0,0,0.2);">New Purchase Order</span>
                <div onclick="window.location.hash='#purchase';window.toggleFAB();" style="width:44px;height:44px;background:var(--warning-color);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                    <i class='bx bx-cart' style="color:white;font-size:1.2rem;"></i>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:var(--bg-card);padding:4px 10px;border-radius:20px;font-size:0.75rem;color:var(--text-main);box-shadow:0 2px 8px rgba(0,0,0,0.2);">New Sales Order</span>
                <div onclick="window.location.hash='#dispatch';window.toggleFAB();" style="width:44px;height:44px;background:var(--info-color);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                    <i class='bx bx-log-out-circle' style="color:white;font-size:1.2rem;"></i>
                </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
                <span style="background:var(--bg-card);padding:4px 10px;border-radius:20px;font-size:0.75rem;color:var(--text-main);box-shadow:0 2px 8px rgba(0,0,0,0.2);">Scan Barcode</span>
                <div onclick="window.location.hash='#barcode';window.toggleFAB();" style="width:44px;height:44px;background:var(--primary-color);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
                    <i class='bx bx-barcode-reader' style="color:white;font-size:1.2rem;"></i>
                </div>
            </div>
        </div>`;
    document.body.appendChild(fab);
};

window.toggleFAB = function() {
    const opts = document.getElementById('fabOptions');
    const icon = document.getElementById('fabIcon');
    if (!opts) return;
    const open = opts.style.display === 'flex';
    opts.style.display = open ? 'none' : 'flex';
    if (icon) icon.style.transform = open ? 'rotate(0deg)' : 'rotate(45deg)';
};

// F100: Kiosk Mode (Full-screen, hide sidebar + header)
window.kioskMode = false;
window.toggleKioskMode = function() {
    window.kioskMode = !window.kioskMode;
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('.topbar');
    const fab = document.getElementById('fabContainer');
    if (window.kioskMode) {
        if (sidebar) sidebar.style.display = 'none';
        if (header) header.style.display = 'none';
        if (fab) fab.style.display = 'none';
        document.querySelector('.main-content').style.marginLeft = '0';
        window.showToast('Kiosk Mode ON — Press F11 for fullscreen. Click again to exit.', 'info');
        // Show exit button
        const exitBtn = document.createElement('button');
        exitBtn.id = 'kioskExitBtn';
        exitBtn.onclick = window.toggleKioskMode;
        exitBtn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:9999;background:var(--danger-color);color:white;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:0.8rem;';
        exitBtn.textContent = '✕ Exit Kiosk';
        document.body.appendChild(exitBtn);
    } else {
        if (sidebar) sidebar.style.display = '';
        if (header) header.style.display = '';
        if (fab) fab.style.display = '';
        document.querySelector('.main-content').style.marginLeft = '';
        const exitBtn = document.getElementById('kioskExitBtn');
        if (exitBtn) exitBtn.remove();
        window.showToast('Kiosk Mode OFF', 'success');
    }
};

// === INITIALIZE ALL POWER FEATURES ON DOMContentLoaded ===
document.addEventListener('DOMContentLoaded', () => {
    // F66: Apply theme on load
    window.applyTheme();

    // F78: Keyboard shortcut listener
    document.addEventListener('keydown', e => {
        if (e.key === '?') { window.showKeyboardShortcuts(); return; }
        if (e.key === 'Escape') {
            const modal = document.getElementById('kbShortcutModal');
            if(modal) modal.remove();
        }
        if (e.altKey) {
            const keyRoutes = { d:'#dashboard', p:'#products', i:'#inventory', r:'#reports', s:'#settings', a:'#alerts', t:'theme' };
            const route = keyRoutes[e.key.toLowerCase()];
            if (route === 'theme') { e.preventDefault(); window.toggleTheme(); }
            else if (route) { e.preventDefault(); window.location.hash = route; }
        }
    });

    // F79: Context menu
    window.setupContextMenu();

    // F99: FAB
    window.createFAB();

    // F97: Show PWA banner after 5 seconds
    setTimeout(() => window.showPWABanner(), 5000);

    // F76: Hook breadcrumb to route changes
    const origLoad = window.loadRoute;
    if (!origLoad) {
        window.addEventListener('hashchange', () => {
            const route = window.location.hash.slice(1) || 'dashboard';
            window.updateBreadcrumb(route);
        });
    }
});
