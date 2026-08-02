// Settings & Security View

window.renderSettings = function() {
    setTimeout(() => {
        if(window.refreshWorkerTable) {
            window.refreshWorkerTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Users & Security</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary"><i class='bx bx-user-plus'></i> Add New User</button>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="card">
                    <h2 class="section-title">User Management & Role-based Access</h2>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                        <tbody id="workerTableBody">
                                <!-- Dynamic Content Rendered Here -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card" style="margin-top: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Labor Management & Task Productivity</h2>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;">View Detailed Analytics</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div style="border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Active Workers</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">24</div>
                        </div>
                        <div style="border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Avg Pick Rate (Units/Hr)</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary-color);">185</div>
                        </div>
                        <div style="border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 4px;">Task Completion</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-color);">94%</div>
                        </div>
                    </div>

                    <h3 style="font-size: 0.9rem; margin-bottom: 12px; color: var(--text-main);">Real-time Task Prioritization</h3>
                    <div class="table-container">
                        <table class="table" style="font-size: 0.85rem;">
                            <thead>
                                <tr>
                                    <th>Worker</th>
                                    <th>Current Task</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Scanner 1 (Rahul)</td>
                                    <td>Pick Wave #W-4412</td>
                                    <td><span class="status status-danger" style="background: rgba(239,68,68,0.1); color: var(--danger-color);">High</span></td>
                                    <td>In Progress (60%)</td>
                                </tr>
                                <tr>
                                    <td>Forklift A (Amit)</td>
                                    <td>Putaway Batch #B-890</td>
                                    <td><span class="status status-warning" style="background: rgba(245,158,11,0.1); color: var(--warning-color);">Medium</span></td>
                                    <td>Assigned</td>
                                </tr>
                                <tr>
                                    <td>Packer 3 (Neha)</td>
                                    <td>QA Inspection</td>
                                    <td><span class="status status-success" style="background: rgba(16,185,129,0.1); color: var(--success-color);">Normal</span></td>
                                    <td>In Progress (90%)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card">
                        <h2 class="section-title">System Settings</h2>
                        
                        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 500;">Multi-warehouse Support</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Enable managing multiple locations</div>
                            </div>
                            <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                            </div>
                        </div>

                        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 500; display: flex; align-items: center; gap: 8px;">Two-Factor Auth (2FA) <span style="background: var(--danger-color); color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem;">CRITICAL</span></div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Require OTP/Authenticator app on login</div>
                            </div>
                            <div style="width: 40px; height: 20px; background: var(--border-color); border-radius: 10px; position: relative; cursor: pointer;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; left: 2px; top: 2px;"></div>
                            </div>
                        </div>

                        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 500;">Tamper-Proof Audit Logs</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Enforce immutable record of all system changes</div>
                            </div>
                            <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                            </div>
                        </div>

                        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 12px;">
                            <div>
                                <div style="font-weight: 500;">Android Scanner API</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Allow barcode scanners to connect</div>
                            </div>
                            <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;">
                                <div style="width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                            </div>
                        </div>

                        <button class="btn btn-outline" style="width: 100%;"><i class='bx bx-cloud-download'></i> Database Backup</button>
                    </div>

                    <div class="card">
                        <h2 class="section-title">User Logs</h2>
                        <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; gap: 8px;"><span style="color: var(--text-muted);">10:45 AM</span> <span>Admin logged in</span></div>
                            <div style="display: flex; gap: 8px;"><span style="color: var(--text-muted);">09:12 AM</span> <span>Scanner 1 logged in via API</span></div>
                            <div style="display: flex; gap: 8px;"><span style="color: var(--text-muted);">Yesterday</span> <span>Warehouse Mgr logged out</span></div>
                        </div>
                        <button class="btn btn-outline" style="width: 100%; margin-top: 16px; padding: 4px; font-size: 0.8rem;">View Full Logs</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.refreshWorkerTable = function() {
    const tbody = document.getElementById('workerTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const workers = DataManager.getWorkers();
    let html = '';
    
    workers.forEach(w => {
        let statusHtml = w.status === 'Active' 
            ? `<span class="status status-success">${w.status}</span>` 
            : `<span class="status status-danger">${w.status}</span>`;
            
        html += `
            <tr>
                <td style="font-weight: 500;">${w.name}</td>
                <td>${w.email}</td>
                <td><span style="background: ${w.roleBg}; padding: 4px 8px; border-radius: 4px; color: ${w.roleColor}; font-size: 0.8rem; font-weight: 600;">${w.role}</span></td>
                <td>${statusHtml}</td>
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="icon-btn" style="width: 32px; height: 32px; font-size: 18px;"><i class='bx bx-edit-alt'></i></button>
                        <button class="icon-btn" style="width: 32px; height: 32px; font-size: 18px; color: var(--danger-color);" onclick="window.deleteWorker('${w.email}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.deleteWorker = function(email) {
    if(confirm("Are you sure you want to remove user " + email + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteWorker(email);
            window.refreshWorkerTable();
        }
    }
};
