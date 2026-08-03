// Barcode Management View

window.renderBarcode = function() {
    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Barcode Management</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline" onclick="window.showScanHistory()"><i class='bx bx-history'></i> Scan History</button>
                    <button class="btn btn-primary" onclick="window.showToast('Batch generator ready for new products', 'info')"><i class='bx bx-barcode-reader'></i> Generate New Barcodes</button>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card dashboard-widget">
                    <div class="widget-icon blue"><i class='bx bx-barcode'></i></div>
                    <div class="widget-value" id="barcodesGeneratedCount">1,204</div>
                    <div class="widget-title">Barcodes Generated Today</div>
                </div>
                <div class="card dashboard-widget">
                    <div class="widget-icon green"><i class='bx bx-printer'></i></div>
                    <div class="widget-value" id="barcodesPrintedCount">850</div>
                    <div class="widget-title">Barcodes Printed</div>
                </div>
            </div>
            
            <div class="card" style="margin-bottom: 24px;">
                <h2 class="section-title">Barcode Generation & Printing</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <div class="form-group">
                            <label class="form-label">Select Product / Batch</label>
                            <select class="form-control" id="barcodeProductSelect">
                                <option value="SKU-ALB-500-B2391">Aloo Bhujia (500g) - Batch #B-2391</option>
                                <option value="SKU-NVR-1000-B2392">Navratna Mix (1kg) - Batch #B-2392</option>
                                <option value="SKU-KHM-250-B2393">Khatta Meetha (250g) - Batch #B-2393</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Quantity of Labels</label>
                            <input type="number" class="form-control" id="barcodeQtyInput" value="100">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Barcode Type</label>
                            <select class="form-control" id="barcodeTypeSelect">
                                <option value="Code 128">Internal Barcode (Code 128)</option>
                                <option value="QR Code">QR Code</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" style="margin-top: 8px;" onclick="window.generateBarcodePreview()">Generate & Preview</button>
                    </div>
                    <div style="border: 1px solid var(--border-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--bg-main); min-height: 220px; padding: 20px;">
                        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <div id="barcodePreviewGraphic" style="display: flex; align-items: center; justify-content: center; min-height: 120px; min-width: 150px;">
                                <i class='bx bx-barcode' style="font-size: 80px; color: var(--text-main);"></i>
                            </div>
                            <div style="font-family: monospace; font-size: 14px; margin-top: 12px; font-weight: 600; color: var(--text-main);" id="barcodeSkuDisplay">SKU-ALB-500-B2391</div>
                            <button class="btn btn-outline" style="margin-top: 16px;" onclick="window.printBarcodeLabels()"><i class='bx bx-printer'></i> Print Labels</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.initBarcode = function() {
    window.generateBarcodePreview(true);
};

window.generateBarcodePreview = function(isInit = false) {
    const sel = document.getElementById('barcodeProductSelect');
    const sku = sel ? sel.value : 'SKU-ALB-500-B2391';
    const typeSel = document.getElementById('barcodeTypeSelect');
    const bType = typeSel ? typeSel.value : 'Code 128';
    const display = document.getElementById('barcodeSkuDisplay');
    const graphic = document.getElementById('barcodePreviewGraphic');

    if (display) display.innerText = sku;
    if (graphic) {
        if (bType === 'QR Code') {
            graphic.innerHTML = `<canvas id="qrcodeCanvas" style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);"></canvas>`;
            try {
                if (window.QRious) {
                    new QRious({
                        element: document.getElementById('qrcodeCanvas'),
                        value: sku,
                        size: 120,
                        level: 'H'
                    });
                } else {
                    graphic.innerHTML = `<p style="color:var(--danger-color);font-size:12px;">QR Code Library not loaded</p>`;
                }
            } catch (err) {
                console.error("Error generating QR code:", err);
                graphic.innerHTML = `<p style="color:var(--danger-color);font-size:12px;">Error generating QR Code</p>`;
            }
        } else {
            graphic.innerHTML = `<svg id="barcodeSvg" style="background: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 100%; height: auto;"></svg>`;
            try {
                if (window.JsBarcode) {
                    JsBarcode("#barcodeSvg", sku, {
                        format: "CODE128",
                        width: 2,
                        height: 70,
                        displayValue: false,
                        margin: 0
                    });
                } else {
                    graphic.innerHTML = `<p style="color:var(--danger-color);font-size:12px;">Barcode Library not loaded</p>`;
                }
            } catch (err) {
                console.error("Error generating barcode:", err);
                graphic.innerHTML = `<p style="color:var(--danger-color);font-size:12px;">Error generating Barcode</p>`;
            }
        }
    }

    if (!isInit) {
        const countEl = document.getElementById('barcodesGeneratedCount');
        if (countEl) {
            let val = parseInt(countEl.innerText.replace(',', '')) || 1204;
            countEl.innerText = (val + 1).toLocaleString();
        }
        if (window.showToast) window.showToast(`Generated ${bType} for ${sku}`, 'success');
    }
};

window.printBarcodeLabels = function() {
    const qty = document.getElementById('barcodeQtyInput')?.value || 100;
    const countEl = document.getElementById('barcodesPrintedCount');
    if (countEl) {
        let val = parseInt(countEl.innerText.replace(',', '')) || 850;
        countEl.innerText = (val + parseInt(qty)).toLocaleString();
    }
    if (window.showToast) window.showToast(`Sent ${qty} label job(s) to Zebra ZD420 Printer`, 'success');
};

window.showScanHistory = function() {
    const msg = "Recent Scans:\n1. #B-2391 @ Zone A (10 mins ago)\n2. #B-2392 @ Receiving Bay 2 (25 mins ago)\n3. #B-2390 @ Quality Lab (1 hour ago)";
    alert(msg);
};

