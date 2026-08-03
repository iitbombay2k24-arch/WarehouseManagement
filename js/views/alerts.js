// Alerts & Notifications Hub — Features 21-25

window.renderAlerts = function() {
    setTimeout(() => { if(window.refreshAlerts) window.refreshAlerts(); }, 100);
    return `
    <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h1 class="page-title" style="margin:0;"><i class='bx bx-bell' style="color:var(--primary-color);"></i> Alerts & Notifications Hub</h1>
            <div style="display:flex;gap:12px;">
                <button class="btn btn-outline" onclick="window.acknowledgeAllAlerts()"><i class='bx bx-check-double'></i> Acknowledge All</button>
                <button class="btn btn-primary" onclick="window.addAlertRule()"><i class='bx bx-plus'></i> Add Alert Rule (F21)</button>
            </div>
        </div>

        <!-- Alert Summary Bar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;" id="alertKpiRow"></div>

        <!-- F21: Configurable Rules -->
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px;">
            <!-- F22: Alert History Timeline -->
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="section-title" style="margin:0;"><i class='bx bx-time'></i> Alert History (F22)</h2>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;" onclick="window.filterAlerts('all')">All</button>
                        <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;" onclick="window.filterAlerts('danger')">Critical</button>
                        <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;" onclick="window.filterAlerts('warning')">Warning</button>
                        <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;" onclick="window.filterAlerts('pending')">Unread</button>
                    </div>
                </div>
                <div id="alertTimeline" style="display:flex;flex-direction:column;gap:12px;"></div>
            </div>

            <!-- F21: Alert Rules Config + F24: WA Preview + F25: Escalation -->
            <div style="display:flex;flex-direction:column;gap:16px;">
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-cog'></i> Alert Rules (F21)</h2>
                    <div style="display:flex;flex-direction:column;gap:8px;" id="alertRules">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <div style="font-size:0.8rem;"><i class='bx bx-box' style="color:var(--danger-color);"></i> Stock &lt; Min Threshold</div>
                            <div style="width:36px;height:18px;background:var(--secondary-color);border-radius:9px;position:relative;cursor:pointer;" onclick="window.showToast('Rule toggled','info')">
                                <div style="width:14px;height:14px;background:var(--bg-main);border-radius:50%;position:absolute;right:2px;top:2px;"></div>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <div style="font-size:0.8rem;"><i class='bx bx-calendar-x' style="color:var(--warning-color);"></i> Expiry &lt; 10 days</div>
                            <div style="width:36px;height:18px;background:var(--secondary-color);border-radius:9px;position:relative;cursor:pointer;" onclick="window.showToast('Rule toggled','info')">
                                <div style="width:14px;height:14px;background:var(--bg-main);border-radius:50%;position:absolute;right:2px;top:2px;"></div>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <div style="font-size:0.8rem;"><i class='bx bx-shield-x' style="color:var(--danger-color);"></i> QC Failure Detected</div>
                            <div style="width:36px;height:18px;background:var(--secondary-color);border-radius:9px;position:relative;cursor:pointer;" onclick="window.showToast('Rule toggled','info')">
                                <div style="width:14px;height:14px;background:var(--bg-main);border-radius:50%;position:absolute;right:2px;top:2px;"></div>
                            </div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-main);border-radius:6px;">
                            <div style="font-size:0.8rem;"><i class='bx bx-cart-download' style="color:var(--info-color);"></i> PO Delivery Overdue</div>
                            <div style="width:36px;height:18px;background:var(--secondary-color);border-radius:9px;position:relative;cursor:pointer;" onclick="window.showToast('Rule toggled','info')">
                                <div style="width:14px;height:14px;background:var(--bg-main);border-radius:50%;position:absolute;right:2px;top:2px;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- F24: WhatsApp Preview -->
                <div class="card" style="background:linear-gradient(135deg,#075e54,#128c7e);color:white;">
                    <h2 style="margin:0 0 12px 0;font-size:0.9rem;display:flex;align-items:center;gap:8px;"><i class='bx bxl-whatsapp' style="font-size:1.4rem;"></i> WhatsApp Alert Preview (F24)</h2>
                    <div style="background:rgba(255,255,255,0.1);border-radius:8px;padding:12px;font-size:0.8rem;margin-bottom:12px;">
                        📦 *WMS Alert* [CRITICAL]<br>
                        Plain Sev (100g) stock is critically low.<br>
                        Current: 50 units | Min: 100 units<br>
                        _Raised by: Namkeen WMS • Auto-Alert_
                    </div>
                    <button class="btn btn-outline" style="color:#075e54;border-color:#075e54;" onclick="window.showToast('WhatsApp alert sent to Warehouse Manager','success')"><i class='bx bxl-whatsapp'></i> Send Now</button>
                </div>

                <!-- F25: Escalation -->
                <div class="card">
                    <h2 class="section-title"><i class='bx bx-chevrons-up'></i> Escalation Config (F25)</h2>
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px;">Auto-escalate unacknowledged alerts after:</div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:var(--bg-main);border-radius:6px;font-size:0.8rem;">
                            <span>Critical Alerts</span>
                            <select style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:4px;padding:2px 6px;color:var(--text-main);font-size:0.75rem;">
                                <option>30 minutes</option><option>1 hour</option><option>2 hours</option>
                            </select>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:var(--bg-main);border-radius:6px;font-size:0.8rem;">
                            <span>Warning Alerts</span>
                            <select style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:4px;padding:2px 6px;color:var(--text-main);font-size:0.75rem;">
                                <option>2 hours</option><option>4 hours</option><option>8 hours</option>
                            </select>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px;background:var(--bg-main);border-radius:6px;font-size:0.8rem;">
                            <span>Escalate to</span>
                            <select style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:4px;padding:2px 6px;color:var(--text-main);font-size:0.75rem;">
                                <option>Warehouse Manager</option><option>Admin User</option><option>Director</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" style="width:100%;margin-top:4px;" onclick="window.showToast('Escalation rules saved','success')">Save Rules</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

window.refreshAlerts = function(filter) {
    let alerts = DataManager.getAlerts();
    if(filter === 'danger') alerts = alerts.filter(a => a.severity === 'danger');
    else if(filter === 'warning') alerts = alerts.filter(a => a.severity === 'warning');
    else if(filter === 'pending') alerts = alerts.filter(a => !a.acknowledged);

    const unread = DataManager.getAlerts().filter(a => !a.acknowledged).length;
    const critical = DataManager.getAlerts().filter(a => a.severity === 'danger' && !a.acknowledged).length;

    // KPI row
    const kpiEl = document.getElementById('alertKpiRow');
    if(kpiEl) kpiEl.innerHTML = `
        <div class="card" style="text-align:center;padding:16px;border-left:4px solid var(--danger-color);">
            <div style="font-size:0.8rem;color:var(--text-muted);">Unread Alerts</div>
            <div style="font-size:2rem;font-weight:700;color:var(--danger-color);">${unread}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;border-left:4px solid var(--warning-color);">
            <div style="font-size:0.8rem;color:var(--text-muted);">Critical</div>
            <div style="font-size:2rem;font-weight:700;color:var(--warning-color);">${critical}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;border-left:4px solid var(--secondary-color);">
            <div style="font-size:0.8rem;color:var(--text-muted);">Acknowledged</div>
            <div style="font-size:2rem;font-weight:700;color:var(--secondary-color);">${DataManager.getAlerts().filter(a=>a.acknowledged).length}</div>
        </div>
        <div class="card" style="text-align:center;padding:16px;border-left:4px solid var(--primary-color);">
            <div style="font-size:0.8rem;color:var(--text-muted);">Total Rules Active</div>
            <div style="font-size:2rem;font-weight:700;color:var(--primary-color);">4</div>
        </div>`;

    // Update nav badge
    const badge = document.getElementById('alertNavBadge');
    if(badge) { badge.textContent = unread; badge.style.display = unread ? 'inline' : 'none'; }

    // Timeline (F22 + F23)
    const tlEl = document.getElementById('alertTimeline');
    if(tlEl) {
        tlEl.innerHTML = alerts.length ? alerts.map(a => `
            <div style="display:flex;gap:12px;padding:12px;border-radius:8px;background:${a.acknowledged?'var(--bg-main)':a.severity==='danger'?'rgba(239,68,68,0.05)':'rgba(245,158,11,0.05)'};border-left:3px solid var(--${a.severity==='danger'?'danger':'warning'}-color);${a.acknowledged?'opacity:0.6;':''}">
                <div style="flex:1;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-weight:700;font-size:0.8rem;color:var(--${a.severity==='danger'?'danger':'warning'}-color);">${a.type.toUpperCase()}</span>
                        <span style="font-size:0.75rem;color:var(--text-muted);">${a.time}</span>
                    </div>
                    <div style="font-size:0.85rem;">${a.message}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">Rule: <code>${a.rule}</code></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    ${!a.acknowledged ? `<button class="btn btn-outline" style="padding:2px 8px;font-size:0.7rem;" onclick="window.acknowledgeAlert('${a.id}')"><i class='bx bx-check'></i> (F23)</button>` : '<span style="color:var(--secondary-color);font-size:0.75rem;">✓ Done</span>'}
                </div>
            </div>`).join('')
        : '<div style="color:var(--text-muted);text-align:center;padding:24px;">No alerts matching filter</div>';
    }
};

window.filterAlerts = function(type) { window.refreshAlerts(type); };

window.acknowledgeAlert = function(id) {
    DataManager.acknowledgeAlert(id);
    window.showToast('Alert acknowledged', 'success');
    window.refreshAlerts();
};

window.acknowledgeAllAlerts = function() {
    DataManager.getAlerts().forEach(a => DataManager.acknowledgeAlert(a.id));
    window.showToast('All alerts marked as handled', 'success');
    window.refreshAlerts();
    const badge = document.getElementById('alertNavBadge');
    if(badge) badge.style.display = 'none';
};

window.addAlertRule = function() {
    const type = prompt('Alert type (e.g. "Low Stock", "Expiry", "PO Overdue"):'); if(!type) return;
    const msg = prompt('Alert message template:'); if(!msg) return;
    DataManager.addAlert({ id:'ALT-'+Date.now(), type, severity:'warning', message:msg, time:'Just now', acknowledged:false, rule:'manual' });
    window.showToast(`Alert rule "${type}" created`, 'success');
    window.refreshAlerts();
};
