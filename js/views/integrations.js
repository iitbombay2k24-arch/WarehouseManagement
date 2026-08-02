// Mobile & Third-Party Integrations View

window.renderIntegrations = function() {
    setTimeout(() => {
        if(window.refreshIntegrationsList) {
            window.refreshIntegrationsList();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-plug' style="color: var(--primary-color);"></i> Apps & Integrations</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline" onclick="alert('🔑 Active Production API Key:\nwms_live_key_9942a1b8c03e7d\n\nRate Limit: 5,000 req/min')"><i class='bx bx-code-alt'></i> Developer API Keys</button>
                    <button class="btn btn-primary" onclick="window.showToast('Integrations Store marketplace opened', 'info')"><i class='bx bx-store'></i> Integrations Store</button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                <!-- e-Commerce Integrations -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <h2 class="section-title">e-Commerce & Marketplaces</h2>
                    <div id="ecommerceList" style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
                        <!-- Dynamic Content -->
                    </div>
                </div>

                <!-- ERP & Comms Integrations -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <h2 class="section-title">Enterprise & Comms</h2>
                    <div id="erpList" style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
                        <!-- Dynamic Content -->
                    </div>
                </div>

                <!-- Devices & IoT -->
                <div class="card" style="display: flex; flex-direction: column;">
                    <h2 class="section-title">Devices & IoT Sensors</h2>
                    <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: var(--primary-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;"><i class='bx bx-mobile-alt'></i></div>
                                <div>
                                    <div style="font-weight: 600;">PWA / Mobile App</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">Worker handheld app</div>
                                </div>
                            </div>
                            <span class="status status-success">Active (12 Users)</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: var(--text-main); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;"><i class='bx bx-wifi'></i></div>
                                <div>
                                    <div style="font-weight: 600;">IoT Weighing Scales</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">Auto-fill GRN qty</div>
                                </div>
                            </div>
                            <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.showToast('IoT Scale Bluetooth pairing complete (Scale-04)', 'success')">Pair Device</button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: var(--danger-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;"><i class='bx bx-barcode-reader'></i></div>
                                <div>
                                    <div style="font-weight: 600;">RFID Portals</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">Dock door scanners</div>
                                </div>
                            </div>
                            <span class="status status-info">Configuring</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="background: linear-gradient(135deg, var(--bg-sidebar), #1e293b); color: white; border: none;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0 0 8px 0;">White-Label Multi-Tenant SaaS Engine <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; vertical-align: middle; margin-left: 8px;">FUTURE</span></h2>
                        <p style="color: #cbd5e1; margin: 0; font-size: 0.9rem;">Package this WMS software as a cloud product to license to other regional namkeen manufacturers.</p>
                    </div>
                    <button class="btn btn-primary" style="background: white; color: var(--text-main);" onclick="alert('🏢 Multi-Tenant Architecture Overview:\n- Isolated Postgres schemas per tenant\n- Custom domain CNAME routing\n- Automated tenant onboarding & billing')">View SaaS Architecture</button>
                </div>
            </div>
        </div>
        </div>
    `;
};

window.toggleIntegration = function(id) {
    if(typeof DataManager === 'undefined') return;
    const ints = DataManager.getIntegrations();
    const item = ints.find(i => i.id === id);
    if(item) {
        const newStatus = (item.status === 'Connected' || item.status === 'Active') ? 'Not Connected' : 'Connected';
        DataManager.updateIntegrationStatus(id, newStatus);
        window.refreshIntegrationsList();
    }
};

window.refreshIntegrationsList = function() {
    if(typeof DataManager === 'undefined') return;
    const ints = DataManager.getIntegrations();
    
    const ecomList = document.getElementById('ecommerceList');
    const erpList = document.getElementById('erpList');
    
    if(ecomList && erpList) {
        let ecomHtml = '';
        let erpHtml = '';
        
        ints.forEach(int => {
            let actionHtml = '';
            if(int.status === 'Connected' || int.status === 'Active') {
                actionHtml = `<span class="status status-success" style="cursor: pointer;" onclick="window.toggleIntegration('${int.id}')">${int.status}</span>`;
            } else if (int.status === 'Testing') {
                actionHtml = `<span class="status status-warning" style="cursor: pointer;" onclick="window.toggleIntegration('${int.id}')">${int.status}</span>`;
            } else {
                actionHtml = `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.toggleIntegration('${int.id}')">Connect</button>`;
            }
            
            const itemHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: ${int.bg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">${int.icon}</div>
                        <div>
                            <div style="font-weight: 600;">${int.name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${int.desc}</div>
                        </div>
                    </div>
                    ${actionHtml}
                </div>
            `;
            
            if(int.type === 'ecommerce') ecomHtml += itemHtml;
            if(int.type === 'erp') erpHtml += itemHtml;
        });
        
        ecomList.innerHTML = ecomHtml;
        erpList.innerHTML = erpHtml;
    }
};
