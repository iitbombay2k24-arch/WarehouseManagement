// Operations & Maintenance View

window.renderMaintenance = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;"><i class='bx bx-wrench' style="color: var(--primary-color);"></i> Operations & Maintenance</h1>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Maintenance Scheduling</h2>
                        <button class="btn btn-outline" style="padding: 4px 12px; font-size: 0.8rem;"><i class='bx bx-calendar-plus'></i> Schedule</button>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--danger-color);">
                            <div>
                                <div style="font-weight: 600;">Packaging Machine #2 Servicing</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);"><i class='bx bx-calendar'></i> Today, 02:00 PM (Overdue)</div>
                            </div>
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;">Mark Done</button>
                        </div>
                        
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--warning-color);">
                            <div>
                                <div style="font-weight: 600;">Forklift A Battery Replacement</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);"><i class='bx bx-calendar'></i> Tomorrow, 10:00 AM</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Reschedule</button>
                        </div>
                        
                        <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--info-color);">
                            <div>
                                <div style="font-weight: 600;">Cold Storage Temp Calibration</div>
                                <div style="font-size: 0.85rem; color: var(--text-muted);"><i class='bx bx-calendar'></i> 15 Aug 2026</div>
                            </div>
                            <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;">Edit</button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 class="section-title" style="margin: 0;">Document Management</h2>
                        <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.8rem;"><i class='bx bx-upload'></i> Upload</button>
                    </div>
                    
                    <div class="search-bar" style="width: 100%; margin-bottom: 16px; background: var(--bg-main);">
                        <i class='bx bx-search'></i>
                        <input type="text" placeholder="Search invoices, compliance docs...">
                    </div>
                    
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Document Name</th>
                                <th>Type</th>
                                <th>Date Added</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><i class='bx bxs-file-pdf' style="color: #ef4444; margin-right: 8px; font-size: 18px; vertical-align: middle;"></i> FSSAI_License_2026.pdf</td>
                                <td>Compliance</td>
                                <td>01 Jan 2026</td>
                                <td><i class='bx bx-download' style="cursor: pointer; color: var(--primary-color);"></i></td>
                            </tr>
                            <tr>
                                <td><i class='bx bxs-file-pdf' style="color: #ef4444; margin-right: 8px; font-size: 18px; vertical-align: middle;"></i> Invoice_ABCSpices_089.pdf</td>
                                <td>Invoice</td>
                                <td>Today</td>
                                <td><i class='bx bx-download' style="cursor: pointer; color: var(--primary-color);"></i></td>
                            </tr>
                            <tr>
                                <td><i class='bx bxs-file-doc' style="color: #3b82f6; margin-right: 8px; font-size: 18px; vertical-align: middle;"></i> SOP_Quality_Check.docx</td>
                                <td>Procedure</td>
                                <td>15 May 2026</td>
                                <td><i class='bx bx-download' style="cursor: pointer; color: var(--primary-color);"></i></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};
