// Products View

window.renderProducts = function() {
    // Generate initial table if DataManager is loaded
    setTimeout(() => {
        if(window.refreshProductsTable) {
            window.refreshProductsTable();
        }
    }, 100);

    return `
        <div class="fade-in">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 class="page-title" style="margin: 0;">Product Management</h1>
                <div style="display: flex; gap: 12px;">
                    <button class="btn btn-outline"><i class='bx bx-upload'></i> Import/Export</button>
                    <button class="btn btn-primary" onclick="window.toggleAddProduct()"><i class='bx bx-plus'></i> New Product</button>
                </div>
            </div>

            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 class="section-title" style="margin: 0;">Product Master List</h2>
                    <div class="search-bar" style="width: 300px; background: var(--bg-main);">
                        <i class='bx bx-search'></i>
                        <input type="text" placeholder="Search SKU or Name...">
                    </div>
                </div>

                <!-- Add New Product Form (Hidden by default) -->
                <div id="addProductForm" style="display: none; background: var(--bg-main); padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--border-color);">
                    <h3 style="margin-top: 0;">Add New Product</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                        <input type="text" id="newSku" placeholder="SKU (e.g. SKU-003)" class="form-control">
                        <input type="text" id="newName" placeholder="Product Name" class="form-control">
                        <input type="text" id="newCategory" placeholder="Category" class="form-control">
                        <input type="number" id="newPrice" placeholder="Base Price (₹)" class="form-control">
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-primary" onclick="window.saveNewProduct()">Save Product</button>
                        <button class="btn btn-outline" onclick="document.getElementById('addProductForm').style.display='none'">Cancel</button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Stock Base Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <!-- Dynamic Content Rendered Here -->
                        </tbody>
                    </table>
                </div>
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
    } else {
        alert("DataManager not initialized.");
    }
};

window.deleteProduct = function(id) {
    if(confirm("Are you sure you want to delete " + id + "?")) {
        if(typeof DataManager !== 'undefined') {
            DataManager.deleteProduct(id);
            window.refreshProductsTable();
        }
    }
};

window.refreshProductsTable = function() {
    const tbody = document.getElementById('productsTableBody');
    if(!tbody) return;
    
    if(typeof DataManager === 'undefined') return;

    const products = DataManager.getProducts();
    let html = '';
    
    products.forEach(p => {
        html += `
            <tr>
                <td><span style="font-family: monospace; font-weight: 600;">${p.id}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: var(--bg-main); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i class='bx bx-image' style="color: var(--text-muted); font-size: 20px;"></i>
                        </div>
                        <span style="font-weight: 500;">${p.name}</span>
                    </div>
                </td>
                <td>${p.category}</td>
                <td>₹${p.price}</td>
                <td><span class="status status-success">Active</span></td>
                <td>
                    <div style="display: flex; gap: 8px;">
                        <button class="icon-btn"><i class='bx bx-edit'></i></button>
                        <button class="icon-btn" style="color: var(--danger-color);" onclick="window.deleteProduct('${p.id}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
};
