// HR & Payroll View — Features 1-5

window.renderHR = function() {
    setTimeout(() => { if(window.refreshAttendance) window.refreshAttendance(); }, 100);
    return `
    <div class="fade-in">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h1 class="page-title" style="margin:0;"><i class='bx bx-group' style="color:var(--primary-color);"></i> HR & Payroll</h1>
            <div style="display:flex;gap:12px;">
                <button class="btn btn-outline" onclick="window.exportPayroll()"><i class='bx bx-download'></i> Export Payroll</button>
                <button class="btn btn-primary" onclick="window.addWorkerHR()"><i class='bx bx-user-plus'></i> Add Employee</button>
            </div>
        </div>

        <!-- F1: Attendance Tracker -->
        <div class="card" style="margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2 class="section-title" style="margin:0;"><i class='bx bx-time-five'></i> Attendance Tracker — Today</h2>
                <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;" onclick="window.punchInWorker()"><i class='bx bx-log-in'></i> Punch In</button>
            </div>
            <table class="table"><thead><tr><th>Employee</th><th>Shift</th><th>Punch In</th><th>Punch Out</th><th>Hours</th><th>Status</th><th>Action</th></tr></thead>
            <tbody id="attendanceBody"></tbody></table>
        </div>

        <!-- F2: Shift Scheduler -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
            <div class="card">
                <h2 class="section-title"><i class='bx bx-calendar-week'></i> Shift Roster — This Week</h2>
                <div id="shiftRosterBody" style="display:flex;flex-direction:column;gap:10px;"></div>
                <button class="btn btn-outline" style="width:100%;margin-top:16px;" onclick="window.assignShift()"><i class='bx bx-edit'></i> Edit Roster</button>
            </div>

            <!-- F4: Payroll Summary -->
            <div class="card">
                <h2 class="section-title"><i class='bx bx-rupee'></i> Payroll Summary — August 2026</h2>
                <div id="payrollBody" style="display:flex;flex-direction:column;gap:10px;"></div>
                <div style="border-top:1px solid var(--border-color);margin-top:12px;padding-top:12px;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:1rem;">
                        <span>Total Payroll</span>
                        <span id="totalPayroll" style="color:var(--primary-color);">₹0</span>
                    </div>
                </div>
                <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="window.processPayroll()"><i class='bx bx-check-circle'></i> Process Payroll</button>
            </div>
        </div>

        <!-- F3: Overtime Log + F5: Leave Requests -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
            <div class="card">
                <h2 class="section-title"><i class='bx bx-alarm-exclamation'></i> Overtime Log</h2>
                <div id="overtimeBody" style="display:flex;flex-direction:column;gap:8px;"></div>
            </div>
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h2 class="section-title" style="margin:0;"><i class='bx bx-calendar-x'></i> Leave Requests</h2>
                    <button class="btn btn-outline" style="padding:4px 12px;font-size:0.8rem;" onclick="window.requestLeave()"><i class='bx bx-plus'></i> Request Leave</button>
                </div>
                <div id="leaveBody" style="display:flex;flex-direction:column;gap:8px;">
                    <div style="padding:12px;border-radius:8px;background:var(--bg-main);display:flex;justify-content:space-between;align-items:center;">
                        <div><div style="font-weight:600;">Scanner 1</div><div style="font-size:0.8rem;color:var(--text-muted);">5 Aug – Sick Leave</div></div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-primary" style="padding:3px 10px;font-size:0.75rem;" onclick="window.showToast('Leave approved for Scanner 1','success')">Approve</button>
                            <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;color:var(--danger-color);" onclick="window.showToast('Leave rejected','danger')">Reject</button>
                        </div>
                    </div>
                    <div style="padding:12px;border-radius:8px;background:var(--bg-main);display:flex;justify-content:space-between;align-items:center;">
                        <div><div style="font-weight:600;">Warehouse Mgr</div><div style="font-size:0.8rem;color:var(--text-muted);">10-12 Aug – Casual Leave</div></div>
                        <div style="display:flex;gap:6px;">
                            <button class="btn btn-primary" style="padding:3px 10px;font-size:0.75rem;" onclick="window.showToast('Leave approved for Warehouse Mgr','success')">Approve</button>
                            <button class="btn btn-outline" style="padding:3px 10px;font-size:0.75rem;color:var(--danger-color);" onclick="window.showToast('Leave rejected','danger')">Reject</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};

window.refreshAttendance = function() {
    const records = DataManager.getAttendance();
    const workers = DataManager.getWorkers();

    // Attendance table
    const tbody = document.getElementById('attendanceBody');
    if (tbody) {
        tbody.innerHTML = records.map(r => {
            const scls = r.status === 'Present' ? 'status-success' : r.status === 'Overtime' ? 'status-warning' : r.status === 'Clocked In' ? 'status-info' : 'status-danger';
            return `<tr>
                <td><strong>${r.worker}</strong></td>
                <td>${workers.find(w=>w.name===r.worker)?.shift || 'AM'}</td>
                <td>${r.punchIn || '—'}</td>
                <td>${r.punchOut || '—'}</td>
                <td>${r.hours || '—'}</td>
                <td><span class="status ${scls}">${r.status}</span></td>
                <td><button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.punchOutWorker('${r.id}','${r.worker}')">Punch Out</button></td>
            </tr>`;
        }).join('');
    }

    // Shift roster
    const rosterEl = document.getElementById('shiftRosterBody');
    if (rosterEl) {
        rosterEl.innerHTML = workers.map(w => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-main);border-radius:8px;">
                <div style="font-weight:600;">${w.name}</div>
                <div style="display:flex;gap:8px;">
                    <span class="status ${w.shift==='AM'?'status-success':'status-info'}">${w.shift} Shift</span>
                    <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;" onclick="window.toggleShift('${w.email}','${w.shift}')">Toggle</button>
                </div>
            </div>`).join('');
    }

    // Payroll
    const payrollEl = document.getElementById('payrollBody');
    const totalEl = document.getElementById('totalPayroll');
    if (payrollEl) {
        let total = 0;
        const html = workers.map(w => {
            const att = records.filter(r => r.worker === w.name);
            const totalHrs = att.reduce((s, r) => s + (r.hours || 0), 0) + (att.length * 8);
            const pay = totalHrs * (w.hourlyRate || 150);
            total += pay;
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);">
                <div><div style="font-weight:600;">${w.name}</div><div style="font-size:0.75rem;color:var(--text-muted);">${totalHrs}h × ₹${w.hourlyRate||150}/hr</div></div>
                <div style="font-weight:700;color:var(--secondary-color);">₹${pay.toLocaleString('en-IN')}</div>
            </div>`;
        }).join('');
        payrollEl.innerHTML = html;
        if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
    }

    // Overtime
    const otEl = document.getElementById('overtimeBody');
    if (otEl) {
        const ot = records.filter(r => r.status === 'Overtime');
        otEl.innerHTML = ot.length ? ot.map(r => `
            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(245,158,11,0.08);border-left:3px solid var(--warning-color);border-radius:4px;">
                <div><strong>${r.worker}</strong> <span style="font-size:0.8rem;color:var(--text-muted);">— ${r.punchIn} to ${r.punchOut}</span></div>
                <span style="color:var(--warning-color);font-weight:700;">${r.hours}h (OT: ${r.hours - 8}h)</span>
            </div>`).join('')
        : '<div style="color:var(--text-muted);font-size:0.85rem;">No overtime logged today.</div>';
    }
};

window.punchInWorker = function() {
    const name = prompt('Worker name:', 'Admin User'); if(!name) return;
    const now = new Date();
    const time = now.toTimeString().slice(0,5);
    const id = 'ATT-' + Date.now();
    DataManager.addAttendance({ id, worker: name, date: 'Today', punchIn: time, punchOut: '', hours: 0, status: 'Clocked In' });
    window.refreshAttendance();
    window.showToast(`${name} punched in at ${time}`, 'success');
};

window.punchOutWorker = function(id, name) {
    const now = new Date();
    const time = now.toTimeString().slice(0,5);
    const records = DataManager.getAttendance();
    const rec = records.find(r => r.id === id);
    if (!rec || rec.punchOut) { window.showToast('Already punched out', 'warning'); return; }
    const [h1, m1] = rec.punchIn.split(':').map(Number);
    const [h2, m2] = time.split(':').map(Number);
    const hours = Math.round(((h2*60+m2)-(h1*60+m1))/60 * 10) / 10;
    DataManager.updateAttendance(id, { punchOut: time, hours, status: hours > 8 ? 'Overtime' : 'Present' });
    window.refreshAttendance();
    window.showToast(`${name} punched out at ${time} — ${hours}h logged`, hours > 8 ? 'warning' : 'success');
};

window.toggleShift = function(email, currentShift) {
    const list = DataManager.getWorkers();
    const idx = list.findIndex(w => w.email === email);
    if (idx > -1) { list[idx].shift = currentShift === 'AM' ? 'PM' : 'AM'; localStorage.setItem('wms_workers', JSON.stringify(list)); }
    window.refreshAttendance();
    window.showToast('Shift updated', 'info');
};

window.processPayroll = function() { window.showToast('Payroll for August 2026 processed & sent to accounts', 'success'); DataManager.logAction('Payroll Processed', 'Monthly payroll processed for August 2026'); };
window.exportPayroll = function() { window.showToast('Payroll_Aug2026.csv downloaded', 'info'); };
window.addWorkerHR = function() {
    const name = prompt('Employee Full Name:'); if(!name) return;
    const role = prompt('Role (Operator/Manager/Super Admin):', 'Operator'); if(!role) return;
    const rate = parseInt(prompt('Hourly Rate (₹):', '150')); if(!rate) return;
    const email = name.toLowerCase().replace(/ /g,'_') + '@namkeenwms.com';
    DataManager.addWorker({ name, email, role, roleBg:'rgba(16,185,129,0.1)', roleColor:'var(--secondary-color)', status:'Active', shift:'AM', hourlyRate: rate });
    window.showToast(`${name} added as ${role}`, 'success');
    DataManager.logAction('Employee Added', `New employee added: ${name} (${role})`);
    window.refreshAttendance();
};
window.requestLeave = function() {
    const name = prompt('Your name:'); if(!name) return;
    const dates = prompt('Leave dates:'); if(!dates) return;
    window.showToast(`Leave request submitted for ${name} — ${dates}`, 'info');
};
