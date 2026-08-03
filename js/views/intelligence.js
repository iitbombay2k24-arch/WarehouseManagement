// Warehouse Intelligence View

window.renderIntelligence = function() {
    setTimeout(() => {
        if(window.refreshIntelStats) {
            window.refreshIntelStats();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-radar' style="color: var(--primary-color);"></i> Warehouse Intelligence</h1>
            </div>

            <div class="dashboard-grid">
                <div class="card" style="grid-column: span 2;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Digital-Twin Warehouse Visualization</h2>
                        <div style="display: flex; gap: 8px;">
                            <span class="status status-success" style="padding: 4px 8px;">Live Sync Active</span>
                            <select class="form-control" style="width: 120px; padding: 4px 8px; font-size: 0.8rem;">
                                <option>Floor 1</option>
                                <option>Cold Storage</option>
                            </select>
                        </div>
                    </div>
                    <!-- Digital Twin Simulation Area -->
                    <div style="height: 300px; background: var(--bg-main); border-radius: 8px; position: relative; border: 1px solid var(--border-color); overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
                        <!-- Grid lines -->
                        <div style="position: absolute; inset: 0; background-image: linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5;"></div>
                        
                        <!-- Racks & Zones -->
                        <div style="position: absolute; top: 40px; left: 40px; width: 120px; height: 60px; background: var(--bg-card); border: 2px solid var(--primary-color); border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                            Zone A (Bhujia)
                            <span style="font-size: 0.65rem; font-weight: normal; color: var(--text-muted); margin-top: 4px;">Cap: 85%</span>
                        </div>
                        <div style="position: absolute; top: 140px; left: 40px; width: 120px; height: 60px; background: var(--bg-card); border: 2px solid var(--secondary-color); border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                            Zone B (Mix)
                            <span style="font-size: 0.65rem; font-weight: normal; color: var(--text-muted); margin-top: 4px;">Cap: 42%</span>
                        </div>
                        <div style="position: absolute; top: 40px; right: 40px; width: 100px; height: 160px; background: var(--bg-card); border: 2px dashed var(--warning-color); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Dispatch</div>

                        <!-- Active Assets / Robots -->
                        <div style="position: absolute; top: 110px; left: 180px; display: flex; flex-direction: column; align-items: center;">
                            <div style="width: 24px; height: 24px; background: var(--primary-color); border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;"><i class='bx bx-car'></i></div>
                            <span style="font-size: 0.6rem; background: var(--bg-card); padding: 2px 4px; border-radius: 4px; margin-top: 2px; border: 1px solid var(--border-color); font-weight: 600;">AMR-1</span>
                        </div>

                        <div style="position: absolute; top: 60px; right: 160px; display: flex; flex-direction: column; align-items: center;">
                            <div style="width: 20px; height: 20px; background: var(--warning-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;"><i class='bx bx-user'></i></div>
                            <span style="font-size: 0.6rem; background: var(--bg-card); padding: 2px 4px; border-radius: 4px; margin-top: 2px; border: 1px solid var(--border-color);">Rahul</span>
                        </div>

                        <!-- Heat Spots -->
                        <div style="position: absolute; top: 30px; left: 110px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(239,68,68,0) 70%);"></div>
                    </div>
                    <div id="intelStats" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 12px; display: flex; justify-content: center; gap: 16px;">
                        <span><i class='bx bx-car' style="color: var(--primary-color);"></i> Active AMR Bots</span>
                        <span><i class='bx bx-user' style="color: var(--warning-color);"></i> Human Workers</span>
                        <span><span style="display: inline-block; width: 10px; height: 10px; background: rgba(239,68,68,0.5); border-radius: 50%;"></span> Heat/Congestion Zone</span>
                    </div>
                </div>

                <div class="card" style="grid-column: span 2; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Live CCTV Feeds</h2>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;" onclick="alert('🎥 Full Screen CCTV Feed Grid (4K AI Cameras 1-4)')"><i class='bx bx-fullscreen'></i> Full Screen</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1;">
                        <div style="background: #000; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            <div style="position: absolute; top: 8px; left: 8px; color: white; font-size: 0.7rem; font-family: monospace; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;"><span style="color: var(--danger-color);">● REC</span> CAM 1 - Loading Dock</div>
                            <i class='bx bx-video' style="color: #333; font-size: 48px;"></i>
                        </div>
                        <div style="background: #000; border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                            <div style="position: absolute; top: 8px; left: 8px; color: white; font-size: 0.7rem; font-family: monospace; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;"><span style="color: var(--danger-color);">● REC</span> CAM 2 - Zone A</div>
                            <i class='bx bx-video' style="color: #333; font-size: 48px;"></i>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <h2 class="section-title">Voice Picking Configuration</h2>
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                    <div>
                        <div style="font-weight: 500;">Headset Integration (Vocollect)</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Enable API link for voice-directed warehouse picking.</div>
                    </div>
                    <div style="width: 40px; height: 20px; background: var(--primary-color); border-radius: 10px; position: relative; cursor: pointer;">
                        <div style="width: 16px; height: 16px; background: var(--bg-main); border-radius: 50%; position: absolute; right: 2px; top: 2px;"></div>
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-primary" onclick="window.showToast('Voice Recognition vocabulary synced (Hindi + English)', 'success')"><i class='bx bx-sync'></i> Sync Vocabulary</button>
                    <button class="btn btn-outline" onclick="window.showToast('Audio Prompt Sent: Head to Aisle 4, Bin B-12', 'info')"><i class='bx bx-headphone'></i> Test Audio Prompts</button>
                </div>
            </div>
        </div>
    `;
};

window.refreshIntelStats = function() {
    const statsContainer = document.getElementById('intelStats');
    if(!statsContainer) return;
    
    if(typeof DataManager === 'undefined') return;

    const amrs = DataManager.getAMRs();
    const activeAmrs = amrs.filter(a => a.status === 'Active').length;
    const workers = typeof DataManager.getWorkers === 'function' ? DataManager.getWorkers().length : 0;
    
    statsContainer.innerHTML = `
        <span><i class='bx bx-car' style="color: var(--primary-color);"></i> ${activeAmrs} Active AMR Bots</span>
        <span><i class='bx bx-user' style="color: var(--warning-color);"></i> ${workers} Human Workers</span>
        <span><span style="display: inline-block; width: 10px; height: 10px; background: rgba(239,68,68,0.5); border-radius: 50%;"></span> Heat/Congestion Zone</span>
    `;
};
