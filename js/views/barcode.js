// Barcode Management View

window.renderBarcode = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Barcode Management</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-history'></i> Scan History</button>
                    <button class="btn btn-primary"><i class='bx bx-barcode-reader'></i> Generate New Barcodes</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-barcode'></i></div>
                    <div class="widget-value">1,204</div>
                    <div class="widget-title">Barcodes Generated Today</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-printer'></i></div>
                    <div class="widget-value">850</div>
                    <div class="widget-title">Barcodes Printed</div>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">Barcode Generation & Printing</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <div class="form-group">
                            <label class="form-label">Select Product / Batch</label>
                            <select class="form-control">
                                <option>Aloo Bhujia (500g) - Batch #B-2391</option>
                                <option>Navratna Mix (1kg) - Batch #B-2392</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Quantity of Labels</label>
                            <input type="number" class="form-control" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Barcode Type</label>
                            <select class="form-control">
                                <option>Internal Barcode (Code 128)</option>
                                <option>QR Code</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" style="margin-top: 8px;">Generate & Preview</button>
                    </div>
                    <div style="border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-main);">
                        <div style="text-align: center;">
                            <i class='bx bx-barcode' style="font-size: 80px; color: var(--text-main);"></i>
                            <div style="font-family: monospace; font-size: 14px; margin-top: 8px;">SKU-ALB-500-B2391</div>
                            <button class="btn btn-outline" style="margin-top: 16px;"><i class='bx bx-printer'></i> Print Labels</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
