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
                { id: 'amazon', name: 'Amazon Seller', desc: 'FBA / FBM Sync', type: 'ecommerce', status: 'Connected', icon: 'a', bg: '#ff9900' },
                { id: 'zomato', name: 'Zomato B2B', desc: 'Quick-commerce', type: 'ecommerce', status: 'Connected', icon: 'Z', bg: '#cb202d' },
                { id: 'whatsapp', name: 'WhatsApp API', desc: 'Automated alerts', type: 'erp', status: 'Active', icon: "<i class='bx bxl-whatsapp'></i>", bg: '#25D366' },
                { id: 'sap', name: 'SAP ERP', desc: 'Bi-directional sync', type: 'erp', status: 'Connected', icon: 'SAP', bg: '#0088cc' },
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
                { name: 'Admin User', email: 'admin@namkeenwms.com', role: 'Super Admin', roleBg: 'var(--primary-light)', roleColor: 'var(--primary-color)', status: 'Active', shift: 'AM', hourlyRate: 200 },
                { name: 'Warehouse Mgr', email: 'manager@namkeenwms.com', role: 'Manager', roleBg: 'rgba(245, 158, 11, 0.1)', roleColor: 'var(--warning-color)', status: 'Active', shift: 'AM', hourlyRate: 350 },
                { name: 'Scanner 1', email: 'scanner1@namkeenwms.com', role: 'Operator', roleBg: 'rgba(16, 185, 129, 0.1)', roleColor: 'var(--secondary-color)', status: 'Active', shift: 'PM', hourlyRate: 150 }
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
        // === NEW DATA STORES ===
        if (!localStorage.getItem('wms_attendance')) {
            localStorage.setItem('wms_attendance', JSON.stringify([
                { id: 'ATT-1', worker: 'Admin User', date: 'Today', punchIn: '08:30', punchOut: '17:30', hours: 9, status: 'Present' },
                { id: 'ATT-2', worker: 'Scanner 1', date: 'Today', punchIn: '13:00', punchOut: '', hours: 0, status: 'Clocked In' },
                { id: 'ATT-3', worker: 'Warehouse Mgr', date: 'Today', punchIn: '08:00', punchOut: '18:00', hours: 10, status: 'Overtime' }
            ]));
        }
        if (!localStorage.getItem('wms_customers')) {
            localStorage.setItem('wms_customers', JSON.stringify([
                { id: 'CUST-001', name: 'Mega Mart (National)', gst: '27AABCU9603R1ZX', creditLimit: 500000, used: 185000, outstanding30: 75000, outstanding60: 55000, outstanding90: 0 },
                { id: 'CUST-002', name: 'SuperMart Retailers', gst: '29AABCU9603R2ZY', creditLimit: 300000, used: 125000, outstanding30: 45000, outstanding60: 80000, outstanding90: 0 },
                { id: 'CUST-003', name: 'Local Distributors', gst: '27AABCU9603R3ZZ', creditLimit: 150000, used: 90000, outstanding30: 30000, outstanding60: 0, outstanding90: 60000 }
            ]));
        }
        if (!localStorage.getItem('wms_expenses')) {
            localStorage.setItem('wms_expenses', JSON.stringify([
                { id: 'EXP-001', date: 'Today', category: 'Fuel & Transport', amount: 4500, description: 'Diesel for delivery trucks', status: 'Approved', approver: 'Admin User' },
                { id: 'EXP-002', date: 'Yesterday', category: 'Wages & Labour', amount: 28000, description: 'Daily labour charges – Zone A', status: 'Approved', approver: 'Warehouse Mgr' },
                { id: 'EXP-003', date: 'Yesterday', category: 'Packaging Material', amount: 12000, description: 'BOPP rolls purchase', status: 'Pending', approver: '' },
                { id: 'EXP-004', date: '30 Jul 2026', category: 'Utilities', amount: 8200, description: 'Electricity bill – Cold storage', status: 'Approved', approver: 'Admin User' }
            ]));
        }
        if (!localStorage.getItem('wms_alerts')) {
            localStorage.setItem('wms_alerts', JSON.stringify([
                { id: 'ALT-001', type: 'Low Stock', severity: 'danger', message: 'Plain Sev (100g) below min threshold (50 vs min 100)', time: 'Today 10:30 AM', acknowledged: false, rule: 'stock < min' },
                { id: 'ALT-002', type: 'Near Expiry', severity: 'warning', message: 'Batch #B-2380 (Navratna Mix) expires in 7 days', time: 'Today 09:00 AM', acknowledged: false, rule: 'expiry < 10 days' },
                { id: 'ALT-003', type: 'PO Overdue', severity: 'danger', message: 'PO-2026-1042 from Premium Oils Co. is 3 days overdue', time: 'Yesterday 8:00 AM', acknowledged: true, rule: 'po_expected < today' },
                { id: 'ALT-004', type: 'Quality Fail', severity: 'danger', message: 'Batch #B-2401 failed moisture test (18% vs limit 12%)', time: 'Yesterday 2:15 PM', acknowledged: false, rule: 'qc_fail' }
            ]));
        }
        if (!localStorage.getItem('wms_suppliers')) {
            localStorage.setItem('wms_suppliers', JSON.stringify([
                { id: 'SUP-001', name: 'ABC Spices Ltd.', category: 'Raw Materials', rating: 4, onTimeRate: 92, defectRate: 1.2, priceVariance: -2.1, totalOrders: 24, contact: 'Ramesh Shah', phone: '9876543210' },
                { id: 'SUP-002', name: 'Global Packaging', category: 'Packaging', rating: 3, onTimeRate: 78, defectRate: 3.5, priceVariance: 5.0, totalOrders: 18, contact: 'Priya Mehta', phone: '9876543211' },
                { id: 'SUP-003', name: 'Premium Oils Co.', category: 'Edible Oils', rating: 5, onTimeRate: 97, defectRate: 0.4, priceVariance: -1.0, totalOrders: 31, contact: 'Suresh Patel', phone: '9876543212' }
            ]));
        }
        if (!localStorage.getItem('wms_company_profile')) {
            localStorage.setItem('wms_company_profile', JSON.stringify({
                name: 'Namkeen Industries Pvt. Ltd.',
                fssai: '10014001234567',
                gst: '27AABCU9603R1ZX',
                address: '42, MIDC Industrial Area, Pune – 411019',
                phone: '+91 20 2712 3456',
                email: 'ops@namkeenindustries.com',
                licenseExpiry: '2027-03-31'
            }));
        }
        if (!localStorage.getItem('wms_activity_feed')) {
            localStorage.setItem('wms_activity_feed', JSON.stringify([
                { id: 'ACT-1', time: '10:45 AM', icon: 'bx-package', color: 'var(--secondary-color)', text: 'GRN-2026-089 received from ABC Spices – 4 items' },
                { id: 'ACT-2', time: '10:12 AM', icon: 'bx-cart', color: 'var(--primary-color)', text: 'PO-2026-1046 created for Global Packaging' },
                { id: 'ACT-3', time: '09:30 AM', icon: 'bx-shield-x', color: 'var(--danger-color)', text: 'Batch #B-2401 quarantined – failed moisture test' },
                { id: 'ACT-4', time: '09:00 AM', icon: 'bx-log-out-circle', color: 'var(--warning-color)', text: 'SO-4501 dispatched to Mega Mart (National)' }
            ]));
        }
        if (!localStorage.getItem('wms_chat_history')) {
            localStorage.setItem('wms_chat_history', JSON.stringify([]));
        }
        if (!localStorage.getItem('wms_theme')) {
            localStorage.setItem('wms_theme', 'light');
        }
    },
    getProducts: function() { return JSON.parse(localStorage.getItem('wms_products')) || []; },
    addProduct: function(product) { const products = this.getProducts(); products.push(product); localStorage.setItem('wms_products', JSON.stringify(products)); },
    deleteProduct: function(id) { const products = this.getProducts().filter(p => p.id !== id); localStorage.setItem('wms_products', JSON.stringify(products)); },
    updateProduct: function(id, updates) { const list = this.getProducts(); const idx = list.findIndex(p => p.id === id); if(idx > -1) { list[idx] = {...list[idx], ...updates}; localStorage.setItem('wms_products', JSON.stringify(list)); } },
    
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
    addAuditLog: function(log) { const list = this.getAuditTrail(); list.unshift(log); localStorage.setItem('wms_audit_trail', JSON.stringify(list)); },
    deleteAuditLog: function(id) { const list = this.getAuditTrail().filter(l => l.id !== id); localStorage.setItem('wms_audit_trail', JSON.stringify(list)); },

    getAMRs: function() { return JSON.parse(localStorage.getItem('wms_amrs')) || []; },

    // NEW CRUD METHODS
    getAttendance: function() { return JSON.parse(localStorage.getItem('wms_attendance')) || []; },
    addAttendance: function(a) { const list = this.getAttendance(); list.unshift(a); localStorage.setItem('wms_attendance', JSON.stringify(list)); },
    updateAttendance: function(id, updates) { const list = this.getAttendance(); const idx = list.findIndex(a => a.id === id); if(idx > -1) { list[idx] = {...list[idx], ...updates}; localStorage.setItem('wms_attendance', JSON.stringify(list)); } },

    getCustomers: function() { return JSON.parse(localStorage.getItem('wms_customers')) || []; },
    addCustomer: function(c) { const list = this.getCustomers(); list.push(c); localStorage.setItem('wms_customers', JSON.stringify(list)); },
    deleteCustomer: function(id) { const list = this.getCustomers().filter(c => c.id !== id); localStorage.setItem('wms_customers', JSON.stringify(list)); },

    getExpenses: function() { return JSON.parse(localStorage.getItem('wms_expenses')) || []; },
    addExpense: function(e) { const list = this.getExpenses(); list.unshift(e); localStorage.setItem('wms_expenses', JSON.stringify(list)); },
    updateExpense: function(id, updates) { const list = this.getExpenses(); const idx = list.findIndex(e => e.id === id); if(idx > -1) { list[idx] = {...list[idx], ...updates}; localStorage.setItem('wms_expenses', JSON.stringify(list)); } },
    deleteExpense: function(id) { const list = this.getExpenses().filter(e => e.id !== id); localStorage.setItem('wms_expenses', JSON.stringify(list)); },

    getAlerts: function() { return JSON.parse(localStorage.getItem('wms_alerts')) || []; },
    acknowledgeAlert: function(id) { const list = this.getAlerts(); const idx = list.findIndex(a => a.id === id); if(idx > -1) { list[idx].acknowledged = true; localStorage.setItem('wms_alerts', JSON.stringify(list)); } },
    addAlert: function(a) { const list = this.getAlerts(); list.unshift(a); localStorage.setItem('wms_alerts', JSON.stringify(list)); },

    getSuppliers: function() { return JSON.parse(localStorage.getItem('wms_suppliers')) || []; },
    addSupplier: function(s) { const list = this.getSuppliers(); list.push(s); localStorage.setItem('wms_suppliers', JSON.stringify(list)); },
    deleteSupplier: function(id) { const list = this.getSuppliers().filter(s => s.id !== id); localStorage.setItem('wms_suppliers', JSON.stringify(list)); },
    updateSupplier: function(id, updates) { const list = this.getSuppliers(); const idx = list.findIndex(s => s.id === id); if(idx > -1) { list[idx] = {...list[idx], ...updates}; localStorage.setItem('wms_suppliers', JSON.stringify(list)); } },

    getCompanyProfile: function() { return JSON.parse(localStorage.getItem('wms_company_profile')) || {}; },
    saveCompanyProfile: function(profile) { localStorage.setItem('wms_company_profile', JSON.stringify(profile)); },

    getActivityFeed: function() { return JSON.parse(localStorage.getItem('wms_activity_feed')) || []; },
    addActivity: function(a) { const list = this.getActivityFeed(); list.unshift(a); if(list.length > 50) list.pop(); localStorage.setItem('wms_activity_feed', JSON.stringify(list)); },

    getChatHistory: function() { return JSON.parse(localStorage.getItem('wms_chat_history')) || []; },
    addChatMessage: function(msg) { const list = this.getChatHistory(); list.push(msg); localStorage.setItem('wms_chat_history', JSON.stringify(list)); },
    clearChatHistory: function() { localStorage.setItem('wms_chat_history', JSON.stringify([])); },

    getTheme: function() { return localStorage.getItem('wms_theme') || 'light'; },
    setTheme: function(theme) { localStorage.setItem('wms_theme', theme); },

    logAction: function(action, details, user) {
        const id = 'AUD-' + Date.now();
        const now = new Date();
        const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        this.addAuditLog({ id, date: `Today, ${time}`, user: user || 'Admin User', action, actionClass: 'status-info', details });
        this.addActivity({ id: 'ACT-' + Date.now(), time, icon: 'bx-history', color: 'var(--primary-color)', text: details });
    }
};

// Main Application Logic & Routing

// Monkey-patch localStorage to sync to our new Python API Server
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, [key, value]);
    if (key.startsWith('wms_') && key !== 'wms_theme') {
        const collection = key.replace('wms_', '');
        fetch('/api/' + collection, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: value
        }).catch(e => console.error("API Sync error for", collection, e));
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Fetch existing backend database state before initializing frontend
    try {
        const res = await fetch('/api/all');
        if (res.ok) {
            const data = await res.json();
            for (const [table, rows] of Object.entries(data)) {
                if (rows && rows.length > 0) {
                    originalSetItem.call(localStorage, 'wms_' + table, JSON.stringify(rows));
                }
            }
        }
    } catch (e) {
        console.log("Running in offline mode or backend not reachable.");
    }

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
        // New modules
        'hr': window.renderHR,
        'supplier_scorecard': window.renderSupplierScorecard,
        'customers': window.renderCustomers,
        'expenses': window.renderExpenses,
        'alerts': window.renderAlerts,
        // Fallback
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

        // F76: Update breadcrumb
        if (typeof window.updateBreadcrumb === 'function') window.updateBreadcrumb(target);

        // F77: Show skeleton for brief transition effect
        contentDiv.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px;padding:8px;">
            ${[1,2].map(()=>`<div style="background:var(--bg-card);border-radius:12px;padding:24px;animation:pulse 1s infinite;">
                <div style="height:16px;background:var(--border-color);border-radius:4px;width:35%;margin-bottom:20px;"></div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;">
                    ${[1,2,3].map(()=>`<div style="height:70px;background:var(--border-color);border-radius:8px;"></div>`).join('')}
                </div>
            </div>`).join('')}
        </div>`;

        // Render after brief delay for skeleton effect
        setTimeout(() => {
            const renderFunc = routes[target] || routes['default'];
            if (typeof renderFunc === 'function') {
                contentDiv.innerHTML = renderFunc();
                
                // F80: Auto-add column sort to all tables
                setTimeout(() => {
                    contentDiv.querySelectorAll('table').forEach((table, ti) => {
                        const id = table.id || `wms-table-${ti}`;
                        table.id = id;
                        table.querySelectorAll('thead th').forEach((th, ci) => {
                            th.style.cursor = 'pointer';
                            th.title = 'Click to sort';
                            th.addEventListener('click', () => window.sortTable(id, ci));
                        });
                    });
                }, 200);
                
                const initFuncName = 'init' + target.charAt(0).toUpperCase() + target.slice(1);
                if (typeof window[initFuncName] === 'function') window[initFuncName]();
                else {
                    if (target === 'dashboard' && window.initDashboard) window.initDashboard();
                    else if (target === 'products' && window.initProducts) window.initProducts();
                }
            }
        }, 80);
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

// Toast Notifications System
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#2563eb'
    };
    
    toast.style.cssText = `
        background: ${bgColors[type] || bgColors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
    `;

    toast.innerHTML = `<i class='bx bx-info-circle'></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
};

window.toggleNotificationsDropdown = function() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

window.clearNotifications = function() {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');
    if (list) list.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No unread notifications</div>';
    if (badge) badge.style.display = 'none';
    window.showToast('All notifications marked as read', 'success');
};

// Global Search Engine
window.handleGlobalSearch = function(e) {
    const query = (document.getElementById('globalSearchInput')?.value || '').trim().toLowerCase();
    const container = document.getElementById('globalSearchResults');
    if (!container) return;

    if (!query) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    const products = DataManager.getProducts().filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query));
    const pos = DataManager.getPurchaseOrders().filter(p => p.id.toLowerCase().includes(query) || p.supplier.toLowerCase().includes(query));
    const grns = DataManager.getReceiving().filter(g => g.id.toLowerCase().includes(query) || g.supplier.toLowerCase().includes(query));
    const dispatches = DataManager.getDispatchOrders().filter(d => d.id.toLowerCase().includes(query) || d.customer.toLowerCase().includes(query));

    let html = '<div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">Search Results</div>';

    if (!products.length && !pos.length && !grns.length && !dispatches.length) {
        html += `<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px 0;">No matching items found for "${query}"</div>`;
    } else {
        products.slice(0, 3).forEach(p => {
            html += `<div style="padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: flex; justify-content: space-between; background: var(--bg-main); margin-bottom: 4px;" onclick="window.location.hash='#products'; document.getElementById('globalSearchResults').style.display='none';">
                        <span>📦 <strong>${p.name}</strong> (${p.id})</span>
                        <span style="color: var(--primary-color);">Product</span>
                    </div>`;
        });
        pos.slice(0, 3).forEach(po => {
            html += `<div style="padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: flex; justify-content: space-between; background: var(--bg-main); margin-bottom: 4px;" onclick="window.location.hash='#purchase'; document.getElementById('globalSearchResults').style.display='none';">
                        <span>🛒 <strong>${po.id}</strong> - ${po.supplier}</span>
                        <span style="color: var(--warning-color);">PO</span>
                    </div>`;
        });
        grns.slice(0, 3).forEach(grn => {
            html += `<div style="padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: flex; justify-content: space-between; background: var(--bg-main); margin-bottom: 4px;" onclick="window.location.hash='#receiving'; document.getElementById('globalSearchResults').style.display='none';">
                        <span>📥 <strong>${grn.id}</strong> - ${grn.supplier}</span>
                        <span style="color: var(--secondary-color);">GRN</span>
                    </div>`;
        });
        dispatches.slice(0, 3).forEach(d => {
            html += `<div style="padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; display: flex; justify-content: space-between; background: var(--bg-main); margin-bottom: 4px;" onclick="window.location.hash='#dispatch'; document.getElementById('globalSearchResults').style.display='none';">
                        <span>🚚 <strong>${d.id}</strong> - ${d.customer}</span>
                        <span style="color: var(--info-color);">Sales Order</span>
                    </div>`;
        });
    }

    container.innerHTML = html;
};

// Close search dropdown on click outside
document.addEventListener('click', (e) => {
    const searchBox = document.querySelector('.search-bar');
    const container = document.getElementById('globalSearchResults');
    if (container && searchBox && !searchBox.contains(e.target)) {
        container.style.display = 'none';
    }
});


