// Products View — Enhanced with F31-F35

window.renderProducts = function() {
    setTimeout(() => { if(window.refreshProductsTable) window.refreshProductsTable(); }, 100);
    return `
        <div class="fade-in">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                <h1 class="page-title" style="margin:0;">Product Management</h1>
                <div style="display:flex;gap:8px;">
                    <button class="btn btn-outline" onclick="window.showToast('products_master.csv downloaded','success')"><i class='bx bx-upload'></i> Import/Export</button>
                    <!-- F32: Bulk Price Update -->
                    <button class="btn btn-outline" onclick="window.bulkPriceUpdate()"><i class='bx bx-dollar'></i> Bulk Price Update</button>
                    <!-- F81: JSON Import -->
                    <button class="btn btn-outline" onclick="window.importJSON()"><i class='bx bx-code-block'></i> JSON Import</button>
                    <button class="btn btn-primary" onclick="window.toggleAddProduct()"><i class='bx bx-plus'></i> New Product</button>
                </div>
            </div>

            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
                    <h2 class="section-title" style="margin:0;">Product Master List</h2>
                    <div style="display:flex;gap:10px;align-items:center;">
                        <!-- F31: Category Filter -->
                        <select id="productCategoryFilter" onchange="window.refreshProductsTable()" style="background:var(--bg-main);border:1px solid var(--border-color);border-radius:8px;padding:6px 12px;color:var(--text-main);font-size:0.8rem;">
                            <option value="">All Categories</option>
                            <option value="Bhujia">Bhujia</option>
                            <option value="Mixes">Mixes</option>
                            <option value="Sev">Sev</option>
                            <option value="Dal">Dal</option>
                            <option value="Chivda">Chivda</option>
                        </select>
                        <div class="search-bar" style="width:240px;background:var(--bg-main);">
                            <i class='bx bx-search'></i>
                            <input type="text" id="productSearchInput" placeholder="Search SKU or Name..." onkeyup="window.refreshProductsTable()">
                        </div>
                    </div>
                </div>

                <!-- Add New Product Form -->
                <div id="addProductForm" style="display:none;background:var(--bg-main);padding:16px;border-radius:8px;margin-bottom:16px;border:1px solid var(--border-color);">
                    <h3 style="margin-top:0;">Add New Product</h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <input type="text" id="newSku" placeholder="SKU (e.g. SKU-003)" class="form-control">
                        <input type="text" id="newName" placeholder="Product Name" class="form-control">
                        <input type="text" id="newCategory" placeholder="Category" class="form-control">
                        <input type="number" id="newPrice" placeholder="Base Price (₹)" class="form-control">
                        <input type="number" id="newStock" placeholder="Opening Stock (units)" class="form-control">
                        <input type="number" id="newMinStock" placeholder="Min Stock Threshold" class="form-control">
                    </div>
                    <!-- F33: Image Upload Simulation -->
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:10px;background:var(--bg-card);border-radius:8px;border:2px dashed var(--border-color);">
                        <i class='bx bx-image-add' style="font-size:2rem;color:var(--text-muted);"></i>
                        <div>
                            <div style="font-size:0.85rem;font-weight:600;">Product Image (F33)</div>
                            <div style="font-size:0.75rem;color:var(--text-muted);">PNG, JPG up to 2MB</div>
                        </div>
                        <button class="btn btn-outline" style="margin-left:auto;" onclick="window.showToast('Image upload simulation — file selected','info')"><i class='bx bx-upload'></i> Upload</button>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-primary" onclick="window.saveNewProduct()">Save Product</button>
                        <button class="btn btn-outline" onclick="document.getElementById('addProductForm').style.display='none'">Cancel</button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead><tr><th>SKU</th><th>Product Name</th><th>Category</th><th>Stock</th><th>Base Price</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody id="productsTableBody"><!-- dynamic --></tbody>
                    </table>
                </div>
            </div>

            <!-- F35: Barcode Preview Panel -->
            <div id="barcodePreviewPanel" style="display:none;" class="card" style="margin-top:24px;">
                <h2 class="section-title"><i class='bx bx-barcode'></i> Barcode Preview (F35)</h2>
                <div id="barcodePreviewContent" style="text-align:center;padding:20px;"></div>
            </div>
        </div>
    `;
};

// Global Functions for Interactivity
window.toggleAddProduct = function() {
    const form = document.getElementById('addProductForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
};

window.saveNewProduct = function() {
    const sku = document.getElementById('newSku').value;
    const name = document.getElementById('newName').value;
    const cat = document.getElementById('newCategory').value;
    const price = document.getElementById('newPrice').value;

    if (!sku || !name) {
        alert("Please enter SKU and Name");
        return;
    }

    if(typeof DataManager !== 'undefined') {
        DataManager.addProduct({ id: sku, name: name, category: cat, stock: 0, price: price });
        
        document.getElementById('newSku').value = '';
        document.getElementById('newName').value = '';
        document.getElementById('newCategory').value = '';
        document.getElementById('newPrice').value = '';
        document.getElementById('addProductForm').style.display = 'none';
        
        window.refreshProductsTable();
        if (window.showToast) window.showToast(`Product ${sku} saved successfully!`, 'success');
    } else {
        alert("DataManager not initialized.");
    }
};

window.deleteProduct = function(id) {
    if(confirm("Are you sure you want to delete " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteProduct(id);
            window.refreshProductsTable();
            if (window.showToast) window.showToast(`Product ${id} deleted`, 'danger');
        }
    }
};

window.editProductPrompt = function(id) {
    const newPrice = prompt("Update Base Price for " + id + " (₹):", "150");
    if (!newPrice) return;
    const products = DataManager.getProducts();
    const p = products.find(prod => prod.id === id);
    if (p) {
        p.price = newPrice;
        localStorage.setItem('wms_products', JSON.stringify(products));
        window.refreshProductsTable();
        if (window.showToast) window.showToast(`Updated price for ${id} to ₹${newPrice}`, 'success');
    }
};

window.refreshProductsTable = function() {
    const tbody = document.getElementById('productsTableBody');
    if(!tbody || typeof DataManager === 'undefined') return;

    const searchTerm = (document.getElementById('productSearchInput')?.value || '').toLowerCase();
    // F31: Category filter
    const catFilter = document.getElementById('productCategoryFilter')?.value || '';

    const products = DataManager.getProducts().filter(p =>
        (p.id.toLowerCase().includes(searchTerm) || p.name.toLowerCase().includes(searchTerm)) &&
        (catFilter === '' || p.category === catFilter)
    );

    tbody.innerHTML = products.map(p => {
        // F34: Low stock badge
        const isLow = (p.stock || 0) < (p.minStock || 100);
        const stockDisplay = isLow
            ? `<span style="color:var(--danger-color);font-weight:700;">${p.stock||0}</span> <span style="background:rgba(239,68,68,0.1);color:var(--danger-color);padding:2px 6px;border-radius:8px;font-size:0.7rem;">⚠ Low</span>`
            : `<span>${p.stock||0}</span>`;

        return `<tr>
            <td><span style="font-family:monospace;font-weight:600;">${p.id}</span></td>
            <td>
                <div style="display:flex;align-items:center;gap:10px;">
                    <!-- F33: Image placeholder -->
                    <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--primary-light),var(--bg-main));border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="window.showProductImage('${p.id}')">
                        <i class='bx bx-package' style="color:var(--primary-color);font-size:1.1rem;"></i>
                    </div>
                    <span style="font-weight:500;">${p.name}</span>
                </div>
            </td>
            <td><span style="background:var(--primary-light);color:var(--primary-color);padding:2px 8px;border-radius:10px;font-size:0.75rem;">${p.category||'—'}</span></td>
            <td>${stockDisplay}</td>
            <td>₹${p.price||0}</td>
            <td><span class="status status-success">Active</span></td>
            <td>
                <div style="display:flex;gap:4px;">
                    <button class="icon-btn" title="Edit price" onclick="window.editProductPrompt('${p.id}')"><i class='bx bx-edit'></i></button>
                    <!-- F35: Barcode preview -->
                    <button class="icon-btn" title="View Barcode (F35)" onclick="window.previewBarcode('${p.id}','${p.name}')"><i class='bx bx-barcode'></i></button>
                    <button class="icon-btn" style="color:var(--danger-color);" onclick="window.deleteProduct('${p.id}')"><i class='bx bx-trash'></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
};

// F32: Bulk Price Update
window.bulkPriceUpdate = function() {
    const pct = parseFloat(prompt('Apply % price change to ALL products:\n(e.g., 5 for +5%, -3 for -3%)'));
    if (isNaN(pct)) return;
    const products = DataManager.getProducts();
    products.forEach(p => {
        const newPrice = Math.round(parseFloat(p.price||0) * (1 + pct/100));
        DataManager.updateProduct(p.id, { price: newPrice });
    });
    window.showToast(`Bulk price update applied: ${pct>0?'+':''}${pct}% across ${products.length} products`, 'success');
    DataManager.logAction('Bulk Price Update', `${pct}% price change applied to all ${products.length} products`);
    window.refreshProductsTable();
};

// F35: Barcode preview
window.previewBarcode = function(sku, name) {
    const panel = document.getElementById('barcodePreviewPanel');
    const content = document.getElementById('barcodePreviewContent');
    if (!panel || !content) return;
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
    // Generate visual barcode simulation using CSS bars
    const bars = sku.split('').map(c => {
        const w = (c.charCodeAt(0) % 3) + 1;
        return `<div style="display:inline-block;width:${w}px;height:60px;background:var(--text-main);margin:0 1px;"></div>`;
    }).join('') + sku.split('').reverse().map(c => {
        const w = (c.charCodeAt(0) % 2) + 1;
        return `<div style="display:inline-block;width:${w}px;height:60px;background:var(--text-main);margin:0 1px;"></div>`;
    }).join('');
    content.innerHTML = `
        <div style="display:inline-block;padding:20px 30px;background:white;border-radius:8px;border:1px solid var(--border-color);">
            <div style="margin-bottom:8px;line-height:1;">${bars}</div>
            <div style="font-family:monospace;font-size:0.85rem;color:#333;letter-spacing:2px;">${sku}</div>
            <div style="font-size:0.75rem;color:#666;margin-top:4px;">${name}</div>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-primary" onclick="window.showToast('Barcode PDF sent to printer','success')"><i class='bx bx-printer'></i> Print</button>
            <button class="btn btn-outline" onclick="document.getElementById('barcodePreviewPanel').style.display='none'">Close</button>
        </div>`;
};

window.showProductImage = function(id) {
    window.showToast(`Product image for ${id} — click Upload in the Add form to set image (F33)`, 'info');
};
