// Logistics View

window.renderLogistics = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-map-alt' style="color: var(--primary-color);"></i> Logistics & Tracking</h1>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="card" style="padding: 0; overflow: hidden; height: 500px; display: flex; flex-direction: column;">
                    <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid var(--border-color);">
                        <h2 class="section-title" style="margin: 0;">Live GPS Tracking</h2>
                    </div>
                    <!-- Mock Map -->
                    <div style="flex: 1; background: #e5e7eb; position: relative; display: flex; align-items: center; justify-content: center;">
                        <i class='bx bx-map' style="font-size: 120px; color: #9ca3af; opacity: 0.5;"></i>
                        
                        <!-- Map Pins -->
                        <div style="position: absolute; top: 30%; left: 40%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
                            <div style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; box-shadow: var(--shadow-sm); margin-bottom: 4px;">Truck MH-12-AB-1234</div>
                            <div style="width: 16px; height: 16px; background: var(--primary-color); border-radius: 50%; border: 3px solid white; box-shadow: var(--shadow-sm);"></div>
                        </div>
                        
                        <div style="position: absolute; top: 60%; left: 70%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center;">
                            <div style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; box-shadow: var(--shadow-sm); margin-bottom: 4px;">Warehouse (HQ)</div>
                            <div style="width: 20px; height: 20px; background: var(--danger-color); border-radius: 50%; border: 3px solid white; box-shadow: var(--shadow-sm);"></div>
                        </div>

                        <!-- Mock Route Line -->
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                            <path d="M 40 30 L 55 45 L 70 60" stroke="var(--primary-color)" stroke-width="4" stroke-dasharray="8,8" vector-effect="non-scaling-stroke" fill="none" opacity="0.6"/>
                        </svg>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div class="card">
                        <h2 class="section-title">Route Optimization</h2>
                        <div class="form-group">
                            <label class="form-label">Active Fleet</label>
                            <select class="form-control">
                                <option>Truck MH-12-AB-1234 (North Zone)</option>
                                <option>Van MH-14-XY-9876 (City Limits)</option>
                            </select>
                        </div>
                        <div style="background: var(--bg-main); padding: 16px; border-radius: 8px; font-size: 0.85rem;">
                            <div style="display: flex; gap: 12px; margin-bottom: 12px; position: relative;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--primary-color); background: white; z-index: 2; margin-top: 4px;"></div>
                                <div>
                                    <div style="font-weight: 600;">Start: Main Warehouse</div>
                                    <div style="color: var(--text-muted);">08:00 AM</div>
                                </div>
                                <div style="position: absolute; left: 5px; top: 12px; bottom: -20px; width: 2px; background: var(--border-color); z-index: 1;"></div>
                            </div>
                            <div style="display: flex; gap: 12px; margin-bottom: 12px; position: relative;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--secondary-color); z-index: 2; margin-top: 4px;"></div>
                                <div>
                                    <div style="font-weight: 600;">Drop 1: SuperMart Retailers</div>
                                    <div style="color: var(--text-muted);">Est: 09:15 AM (Optimized route saved 12 mins)</div>
                                </div>
                                <div style="position: absolute; left: 5px; top: 12px; bottom: -20px; width: 2px; background: var(--border-color); z-index: 1;"></div>
                            </div>
                            <div style="display: flex; gap: 12px; position: relative;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--secondary-color); z-index: 2; margin-top: 4px;"></div>
                                <div>
                                    <div style="font-weight: 600;">Drop 2: Local Distributors</div>
                                    <div style="color: var(--text-muted);">Est: 10:30 AM</div>
                                </div>
                            </div>
                        </div>
                        <button class="btn btn-outline" style="width: 100%; margin-top: 16px;" onclick="window.showToast('Route recalculated! Saved an estimated 14 minutes & 2.1km', 'success')">Recalculate Route</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
