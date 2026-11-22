// AI & Automation View

window.renderAiAutomation = function() {
    setTimeout(() => {
        if(window.refreshReorderRulesTable) {
            window.refreshReorderRulesTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-brain' style="color: var(--primary-color);"></i> AI & Automation</h1>
            </div>

            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">AI Demand Forecasting (Upcoming Peak)</h2>
                <div style="display: flex; gap: 24px;">
                    <div style="flex: 2; height: 200px; border-bottom: 1px solid var(--border-color); border-left: 1px solid var(--border-color); position: relative; margin-left: 20px;">
                        <!-- Mock Bar Chart -->
                        <div style="position: absolute; bottom: 0; left: 10%; width: 40px; height: 30%; background: var(--secondary-color);"></div>
                        <div style="position: absolute; bottom: -20px; left: 10%; font-size: 0.7rem; color: var(--text-muted);">Aug</div>
                        
                        <div style="position: absolute; bottom: 0; left: 30%; width: 40px; height: 45%; background: var(--secondary-color);"></div>
                        <div style="position: absolute; bottom: -20px; left: 30%; font-size: 0.7rem; color: var(--text-muted);">Sep</div>
                        
                        <!-- Forecast Highlight -->
                        <div style="position: absolute; bottom: 0; left: 50%; width: 40px; height: 90%; background: var(--primary-color); box-shadow: 0 0 10px var(--primary-color);"></div>
                        <div style="position: absolute; top: 10px; left: 45%; background: var(--primary-color); color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem;">+140% Diwali Surge</div>
                        <div style="position: absolute; bottom: -20px; left: 50%; font-size: 0.7rem; color: var(--text-muted);">Oct (Festive)</div>
                        
                        <div style="position: absolute; bottom: 0; left: 70%; width: 40px; height: 50%; background: var(--secondary-color);"></div>
                        <div style="position: absolute; bottom: -20px; left: 70%; font-size: 0.7rem; color: var(--text-muted);">Nov</div>
                    </div>
                    <div style="flex: 1;">
                        <h3 style="font-size: 1rem; margin-top: 0;">AI Recommendations</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Based on historical data and market trends, AI suggests increasing production of <span style="font-weight: bold; color: var(--text-main);">Premium Gift Hampers</span> by 140% for October.</p>
                        <button class="btn btn-primary" style="width: 100%;" onclick="window.showToast('Min/Max thresholds auto-adjusted for Diwali surge (+140%)', 'success')"><i class='bx bx-check'></i> Auto-Adjust Min/Max Levels</button>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="card" style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Digital Twin: Real-Time Warehouse Simulation <span style="background: rgba(16, 185, 129, 0.1); color: var(--secondary-color); padding: 2px 6px; border-radius: 10px; font-size: 0.65rem;">FUTURE</span></h2>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="alert('🎮 WebGL 3D Simulation View:\nNavigating Zone A & B in interactive 3D canvas...')"><i class='bx bx-cube'></i> Enter 3D View</button>
                    </div>
                    <!-- Digital Twin Mock -->
                    <div style="flex: 1; min-height: 250px; background: #0f172a; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
                        <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 30px 30px; transform: perspective(500px) rotateX(60deg) scale(2); transform-origin: top;"></div>
                        <i class='bx bx-cube-alt' style="font-size: 64px; color: var(--primary-color); opacity: 0.8; position: relative; z-index: 1;"></i>
                        <div style="position: absolute; top: 16px; left: 16px; color: white; font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; z-index: 1;">Live Sim: Zone A & B</div>
                        
                        <!-- AMR Bots -->
                        <div style="position: absolute; bottom: 40%; left: 30%; width: 12px; height: 12px; background: var(--secondary-color); border-radius: 50%; box-shadow: 0 0 10px var(--secondary-color); z-index: 1;"></div>
                        <div style="position: absolute; bottom: 50%; right: 40%; width: 12px; height: 12px; background: var(--secondary-color); border-radius: 50%; box-shadow: 0 0 10px var(--secondary-color); z-index: 1;"></div>
                    </div>
                </div>

                <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;"><i class='bx bx-bot' style="font-size: 20px; color: var(--primary-color);"></i> AMR Control Panel</div>
                            <span class="status status-success">2 Active</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Autonomous Mobile Robots (Picking)</div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary" style="flex: 1; font-size: 0.75rem; padding: 4px;" onclick="window.showToast('Batch picking route assigned to AMR Bots 1 & 2', 'info')">Assign Tasks</button>
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.75rem; padding: 4px;" onclick="window.showToast('AMR Bots returning to charging docks', 'warning')">Return to Base</button>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;"><i class='bx bx-move-horizontal' style="font-size: 20px; color: var(--secondary-color);"></i> MHE / Conveyor System</div>
                            <span class="status status-success">Running</span>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Main Sortation Line speed and routing.</div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.75rem; padding: 4px;" onclick="window.showToast('Conveyor belt speed updated to 1.5m/s', 'info')">Speed: 1.2m/s</button>
                            <button class="btn btn-outline" style="flex: 1; font-size: 0.75rem; padding: 4px; color: var(--danger-color); border-color: var(--danger-color);" onclick="window.showToast('EMERGENCY STOP ENGAGED for Conveyor Line', 'danger')">E-Stop</button>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;"><i class='bx bx-bulb' style="font-size: 20px; color: var(--warning-color);"></i> Pick-to-Light / Put-wall</div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Active zones for light-directed picking.</div>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-main); padding: 8px; border-radius: 4px; font-size: 0.75rem;">
                            <span>Zone A (Fast Movers)</span>
                            <div style="width: 32px; height: 16px; background: var(--primary-color); border-radius: 8px; position: relative; cursor: pointer;">
                                <div style="width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                            </div>
                        </div>
                    </div>
                    <hr style="border-top: 1px solid var(--border-color);">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="font-weight: 600; display: flex; align-items: center; gap: 8px;"><i class='bx bx-wrench' style="font-size: 20px; color: var(--danger-color);"></i> AI Predictive Maint.</div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">Predicts machine breakdown based on vibration/usage data.</div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <h2 class="section-title">Automated Reorder Rules (Min/Max Configuration)</h2>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Raw Material</th>
                            <th>Current Stock</th>
                            <th>Reorder Point (Min)</th>
                            <th>Target Stock (Max)</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="reorderRulesBody">
                        <!-- Dynamic Content Rendered Here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
};

window.refreshReorderRulesTable = function() {
    const tbody = document.getElementById('reorderRulesBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const rules = DataManager.getReorderRules();
    let html = '';
    
    rules.forEach(r => {
        let actionBtn = r.status === 'PO Drafted' 
            ? `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.location.hash='#purchase'">Review PO</button>`
            : `<button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.75rem;" onclick="window.showToast('Rule threshold updated', 'success')">Edit Rule</button>`;
            
        html += `
            <tr>
                <td>${escapeHtml(r.material)}</td>
                <td>${escapeHtml(r.stock)}</td>
                <td>${escapeHtml(r.min)}</td>
                <td>${escapeHtml(r.max)}</td>
                <td><span class="status ${r.statusClass}">${escapeHtml(r.status)}</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        ${actionBtn}
                        <button class="icon-btn" style="color: var(--danger-color); padding: 2px;" onclick="window.deleteReorderRule('${escJs(r.id)}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};

window.deleteReorderRule = function(id) {
    if(confirm("Are you sure you want to delete this rule?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteReorderRule(id);
            window.refreshReorderRulesTable();
        }
    }
};
