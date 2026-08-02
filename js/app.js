const DataManager = {
    init: function() {
        if (!localStorage.getItem('wms_products')) {
            localStorage.setItem('wms_products', JSON.stringify([
                { id: 'SKU-001', name: 'Aloo Bhujia (500g)', category: 'Bhujia', stock: 1450, price: 120 },
                { id: 'SKU-002', name: 'Navratna Mix (1kg)', category: 'Mixes', stock: 320, price: 250 }
            ]));
        }
        if (!localStorage.getItem('wms_returns')) {
            localStorage.setItem('wms_returns', JSON.stringify([
                { id: 'RMA-8492', customer: 'Mega Mart (Store #42)', items: 'Navratna Mix (1kg) x 50', reason: 'Expired / Near Expiry', status: 'Pending Receipt', reasonClass: 'status-warning', reasonBg: 'rgba(245, 158, 11, 0.1)', reasonColor: 'var(--warning-color)' },
                { id: 'RMA-8490', customer: 'Direct Consumer', items: 'Aloo Bhujia (500g) x 2', reason: 'Damaged Packaging', status: 'Inspection Required', reasonClass: 'status-danger', reasonBg: 'rgba(239, 68, 68, 0.1)', reasonColor: 'var(--danger-color)' },
                { id: 'RMA-8485', customer: 'City Supermarket', items: 'Khatta Meetha (250g) x 100', reason: 'Overstock Return', status: 'Processing Restock', reasonClass: 'status-success', reasonBg: 'rgba(16, 185, 129, 0.1)', reasonColor: 'var(--success-color)' }
            ]));
        }
        if (!localStorage.getItem('wms_quality_hold')) {
            localStorage.setItem('wms_quality_hold', JSON.stringify([
                { batch: '#B-2401', product: 'Aloo Bhujia (500g)', reason: 'Failed Moisture Test (Too high)', date: 'Yesterday', bg: 'rgba(239, 68, 68, 0.05)' },
                { batch: '#B-2415', product: 'Khatta Meetha (1kg)', reason: 'Awaiting Lab Results', date: 'Today', bg: 'rgba(245, 158, 11, 0.05)' }
            ]));
        }
        if (!localStorage.getItem('wms_integrations')) {
            localStorage.setItem('wms_integrations', JSON.stringify([
                { id: 'shopify', name: 'Shopify', desc: 'Sync orders & stock', type: 'ecommerce', status: 'Connected', icon: 'S', bg: '#96bf48' },
                { id: 'amazon', name: 'Amazon Seller', desc: 'FBA / FBM Sync', type: 'ecommerce', status: 'Not Connected', icon: 'a', bg: '#ff9900' },
                { id: 'zomato', name: 'Zomato B2B', desc: 'Quick-commerce', type: 'ecommerce', status: 'Not Connected', icon: 'Z', bg: '#cb202d' },
                { id: 'whatsapp', name: 'WhatsApp API', desc: 'Automated alerts', type: 'erp', status: 'Active', icon: "<i class='bx bxl-whatsapp'></i>", bg: '#25D366' },
                { id: 'sap', name: 'SAP ERP', desc: 'Bi-directional sync', type: 'erp', status: 'Testing', icon: 'SAP', bg: '#0088cc' },
                { id: 'email', name: 'Email Digests', desc: 'Daily manager reports', type: 'erp', status: 'Active', icon: "<i class='bx bx-envelope'></i>", bg: '#000' }
            ]));
        }
        if (!localStorage.getItem('wms_inventory')) {
            localStorage.setItem('wms_inventory', JSON.stringify([
                { id: 'INV-1', item: 'Aloo Bhujia (500g)', class: 'A', location: 'Z1-R4-B12', currentStock: '1,450 kg', altStock: '(2,900 Pkts)', reserved: '250 kg', available: '1,200 kg', flags: '-', classBg: 'rgba(16, 185, 129, 0.1)', classColor: 'var(--secondary-color)', flagHtml: '-' },
                { id: 'INV-2', item: 'Namkeen Mix (Spicy)', class: 'C', location: 'Z3-R8-B01', currentStock: '0 kg', altStock: '', reserved: '0', available: '0', flags: 'Dead Stock (>90d)', classBg: 'rgba(239, 68, 68, 0.1)', classColor: 'var(--danger-color)', flagHtml: '<span style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">Dead Stock (>90d)</span>' }
            ]));
        }
        if (!localStorage.getItem('wms_receiving')) {
            localStorage.setItem('wms_receiving', JSON.stringify([
                { id: 'GRN-2026-089', supplier: 'ABC Spices Ltd.', date: 'Today, 10:30 AM', items: 4, status: 'Passed', statusClass: 'status-success' },
                { id: 'GRN-2026-088', supplier: 'XYZ Packaging', date: 'Today, 09:15 AM', items: 2, status: 'Pending', statusClass: 'status-warning' }
            ]));
        }
        if (!localStorage.getItem('wms_dispatch_orders')) {
            localStorage.setItem('wms_dispatch_orders', JSON.stringify([
                { id: 'SO-4501', customer: 'Mega Mart (National)', type: 'Standard', status: 'Urgent Dispatch', statusClass: 'status-danger', flags: '<span style="font-size: 0.7rem; color: var(--danger-color); font-weight: bold;">(VIP)</span>', invoice: '' },
                { id: 'SO-4492', customer: 'SuperMart Retailers', type: '<span style="background: var(--info-color); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">Cross-Dock</span>', status: 'Ready for Dispatch', statusClass: 'status-success', flags: '<div style="font-size: 0.7rem; color: var(--text-muted);"><i class=\'bx bx-info-circle\'></i> Splittable</div>', invoice: '<span style="background: var(--primary-light); color: var(--primary-color); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-family: monospace;">INV-992 / EWB-992140</span>' },
                { id: 'SO-4493-A', customer: 'Local Distributors', type: '<span style="background: var(--secondary-color); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem;">Gift Kit/Bundle</span>', status: 'Picking', statusClass: 'status-warning', flags: '<span style="font-size: 0.7rem; color: var(--info-color);">(Split 1/2)</span>', invoice: '' }
            ]));
        }
        if (!localStorage.getItem('wms_purchase_orders')) {
            localStorage.setItem('wms_purchase_orders', JSON.stringify([
                { id: 'PO-2026-1045', supplier: 'ABC Spices Ltd.', date: '28 Jul 2026', expected: '02 Aug 2026', status: 'In Transit', statusClass: 'status-warning', value: '₹45,000' },
                { id: 'PO-2026-1046', supplier: 'Global Packaging', date: '30 Jul 2026', expected: '05 Aug 2026', status: 'Sent', statusClass: 'status-info', value: '₹1,20,000' },
                { id: 'PO-2026-1042', supplier: 'Premium Oils Co.', date: '20 Jul 2026', expected: '22 Jul 2026', status: 'Delivered (Matched)', statusClass: 'status-success', value: '₹85,500' }
            ]));
        }
        if (!localStorage.getItem('wms_workers')) {
            localStorage.setItem('wms_workers', JSON.stringify([
                { name: 'Admin User', email: 'admin@namkeenwms.com', role: 'Super Admin', roleBg: 'var(--primary-light)', roleColor: 'var(--primary-color)', status: 'Active' },
                { name: 'Warehouse Mgr', email: 'manager@namkeenwms.com', role: 'Manager', roleBg: 'rgba(245, 158, 11, 0.1)', roleColor: 'var(--warning-color)', status: 'Active' },
                { name: 'Scanner 1', email: 'scanner1@namkeenwms.com', role: 'Operator', roleBg: 'rgba(16, 185, 129, 0.1)', roleColor: 'var(--secondary-color)', status: 'Active' }
            ]));
        }
        if (!localStorage.getItem('wms_reorder_rules')) {
            localStorage.setItem('wms_reorder_rules', JSON.stringify([
                { id: 'RUL-1', material: 'Besan (Gram Flour)', stock: '<span style="color: var(--danger-color); font-weight: 600;">450 kg</span>', min: '500 kg', max: '2000 kg', status: 'PO Drafted', statusClass: 'status-danger' },
                { id: 'RUL-2', material: 'Refined Edible Oil', stock: '1200 L', min: '800 L', max: '3000 L', status: 'Optimal', statusClass: 'status-success' }
            ]));
        }
        if (!localStorage.getItem('wms_audit_trail')) {
            localStorage.setItem('wms_audit_trail', JSON.stringify([
                { id: 'AUD-1', date: 'Today, 10:45 AM', user: 'Admin User', action: 'Inventory Adjustment', actionClass: 'status-info', details: 'Adjusted Aloo Bhujia (500g) stock from 1,450 to 1,448 (Damaged)' },
                { id: 'AUD-2', date: 'Today, 09:12 AM', user: 'Warehouse Manager', action: 'Goods Receipt', actionClass: 'status-success', details: 'Received 1,000kg Khatta Meetha from ABC Spices (GRN-2026-089)' }
            ]));
        }
        if (!localStorage.getItem('wms_amrs')) {
            localStorage.setItem('wms_amrs', JSON.stringify([
                { id: 'AMR-1', status: 'Active', zone: 'Zone A' },
                { id: 'AMR-2', status: 'Charging', zone: 'Base' }
            ]));
        }
    },
    getProducts: function() { return JSON.parse(localStorage.getItem('wms_products')) || []; },
    addProduct: function(product) { const products = this.getProducts(); products.push(product); localStorage.setItem('wms_products', JSON.stringify(products)); },
    deleteProduct: function(id) { const products = this.getProducts().filter(p => p.id !== id); localStorage.setItem('wms_products', JSON.stringify(products)); },
    
    getReturns: function() { return JSON.parse(localStorage.getItem('wms_returns')) || []; },
    addReturn: function(ret) { const returns = this.getReturns(); returns.push(ret); localStorage.setItem('wms_returns', JSON.stringify(returns)); },
    deleteReturn: function(id) { const returns = this.getReturns().filter(r => r.id !== id); localStorage.setItem('wms_returns', JSON.stringify(returns)); },
    
    getQualityHolds: function() { return JSON.parse(localStorage.getItem('wms_quality_hold')) || []; },
    addQualityHold: function(hold) { const holds = this.getQualityHolds(); holds.push(hold); localStorage.setItem('wms_quality_hold', JSON.stringify(holds)); },
    deleteQualityHold: function(batch) { const holds = this.getQualityHolds().filter(h => h.batch !== batch); localStorage.setItem('wms_quality_hold', JSON.stringify(holds)); },
    
    getIntegrations: function() { return JSON.parse(localStorage.getItem('wms_integrations')) || []; },
    updateIntegrationStatus: function(id, status) { 
        const ints = this.getIntegrations(); 
        const idx = ints.findIndex(i => i.id === id); 
        if(idx > -1) { ints[idx].status = status; localStorage.setItem('wms_integrations', JSON.stringify(ints)); } 
    },

    getInventory: function() { return JSON.parse(localStorage.getItem('wms_inventory')) || []; },
    addInventory: function(inv) { const list = this.getInventory(); list.push(inv); localStorage.setItem('wms_inventory', JSON.stringify(list)); },
    deleteInventory: function(id) { const list = this.getInventory().filter(i => i.id !== id); localStorage.setItem('wms_inventory', JSON.stringify(list)); },

    getReceiving: function() { return JSON.parse(localStorage.getItem('wms_receiving')) || []; },
    addReceiving: function(grn) { const list = this.getReceiving(); list.push(grn); localStorage.setItem('wms_receiving', JSON.stringify(list)); },
    deleteReceiving: function(id) { const list = this.getReceiving().filter(r => r.id !== id); localStorage.setItem('wms_receiving', JSON.stringify(list)); },

    getDispatchOrders: function() { return JSON.parse(localStorage.getItem('wms_dispatch_orders')) || []; },
    addDispatchOrder: function(order) { const list = this.getDispatchOrders(); list.push(order); localStorage.setItem('wms_dispatch_orders', JSON.stringify(list)); },
    deleteDispatchOrder: function(id) { const list = this.getDispatchOrders().filter(o => o.id !== id); localStorage.setItem('wms_dispatch_orders', JSON.stringify(list)); },

    getPurchaseOrders: function() { return JSON.parse(localStorage.getItem('wms_purchase_orders')) || []; },
    addPurchaseOrder: function(po) { const list = this.getPurchaseOrders(); list.push(po); localStorage.setItem('wms_purchase_orders', JSON.stringify(list)); },
    deletePurchaseOrder: function(id) { const list = this.getPurchaseOrders().filter(p => p.id !== id); localStorage.setItem('wms_purchase_orders', JSON.stringify(list)); },

    getWorkers: function() { return JSON.parse(localStorage.getItem('wms_workers')) || []; },
    addWorker: function(worker) { const list = this.getWorkers(); list.push(worker); localStorage.setItem('wms_workers', JSON.stringify(list)); },
    deleteWorker: function(email) { const list = this.getWorkers().filter(w => w.email !== email); localStorage.setItem('wms_workers', JSON.stringify(list)); },

    getReorderRules: function() { return JSON.parse(localStorage.getItem('wms_reorder_rules')) || []; },
    addReorderRule: function(rule) { const list = this.getReorderRules(); list.push(rule); localStorage.setItem('wms_reorder_rules', JSON.stringify(list)); },
    deleteReorderRule: function(id) { const list = this.getReorderRules().filter(r => r.id !== id); localStorage.setItem('wms_reorder_rules', JSON.stringify(list)); },

    getAuditTrail: function() { return JSON.parse(localStorage.getItem('wms_audit_trail')) || []; },
    addAuditLog: function(log) { const list = this.getAuditTrail(); list.push(log); localStorage.setItem('wms_audit_trail', JSON.stringify(list)); },
    deleteAuditLog: function(id) { const list = this.getAuditTrail().filter(l => l.id !== id); localStorage.setItem('wms_audit_trail', JSON.stringify(list)); },

    getAMRs: function() { return JSON.parse(localStorage.getItem('wms_amrs')) || []; }
};

// Main Application Logic & Routing

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Data
    DataManager.init();

    // 1. Sidebar Toggle Logic
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    toggleBtn.addEventListener('click', () => {
        const currentWidth = sidebar.style.width;
        if (currentWidth === '80px') {
            sidebar.style.width = '260px';
            document.querySelectorAll('.brand-name, .nav-text, .nav-section, .user-details').forEach(el => {
                el.style.display = 'block';
            });
        } else {
            sidebar.style.width = '80px';
            document.querySelectorAll('.brand-name, .nav-text, .nav-section, .user-details').forEach(el => {
                el.style.display = 'none';
            });
        }
    });

    // 2. Simple Routing System
    const contentDiv = document.getElementById('app-content');
    const navLinks = document.querySelectorAll('.nav-link');

    // Register routes
    const routes = {
        'dashboard': window.renderDashboard,
        'products': window.renderProducts,
        'barcode': window.renderBarcode,
        'batch': window.renderBatch,
        'inventory': window.renderInventory,
        'receiving': window.renderReceiving,
        'production': window.renderProduction,
        'dispatch': window.renderDispatch,
        'returns': window.renderReturns,
        'reports': window.renderReports,
        'settings': window.renderSettings,
        'ai_automation': window.renderAiAutomation,
        'logistics': window.renderLogistics,
        'intelligence': window.renderIntelligence,
        'maintenance': window.renderMaintenance,
        'distributor': window.renderDistributor,
        'purchase': window.renderPurchase,
        'quality': window.renderQuality,
        'finance': window.renderFinance,
        'integrations': window.renderIntegrations,
        // Fallback or not implemented
        'default': () => `<div class="card fade-in">
                            <h2 class="section-title">Coming Soon</h2>
                            <p>This module is currently under development.</p>
                          </div>`
    };

    function loadRoute(target) {
        // Update active class on nav
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Render content
        const renderFunc = routes[target] || routes['default'];
        
        if (typeof renderFunc === 'function') {
            contentDiv.innerHTML = renderFunc();
            
            // If the view has an initialization function, call it
            const initFuncName = 'init' + target.charAt(0).toUpperCase() + target.slice(1);
            if (typeof window[initFuncName] === 'function') {
                window[initFuncName]();
            } else {
                // Fallbacks for hardcoded ones just in case
                if (target === 'dashboard' && window.initDashboard) {
                    window.initDashboard();
                } else if (target === 'products' && window.initProducts) {
                    window.initProducts();
                }
            }
        }
    }

    // Handle hash change
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        loadRoute(hash);
    });

    // Initial load
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    loadRoute(initialHash);
});
