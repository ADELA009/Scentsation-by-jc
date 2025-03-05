/* filepath: /c:/Scentsation by jc/ecommerce-perfume/public/scripts/admin.js */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize buttons
    const viewInventoryBtn = document.getElementById('view-inventory');
    const addProductBtn = document.getElementById('add-product');
    const viewOrdersBtn = document.getElementById('view-orders');
    const processOrdersBtn = document.getElementById('process-orders');

    // Add event listeners
    viewInventoryBtn.addEventListener('click', showInventory);
    addProductBtn.addEventListener('click', showAddProductModal);
    viewOrdersBtn.addEventListener('click', showOrders);
    processOrdersBtn.addEventListener('click', showProcessOrders);

    function showInventory() {
        const inventoryData = JSON.parse(localStorage.getItem('inventory')) || [];
        showModal('Inventory Management', generateInventoryTable(inventoryData));
    }

    function showAddProductModal() {
        const modalHTML = `
            <div id="addProductModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Add New Product</h2>
                    <form id="addProductForm">
                        <div class="form-group">
                            <label for="productName">Product Name:</label>
                            <input type="text" id="productName" required>
                        </div>
                        <div class="form-group">
                            <label for="productPrice">Price (₦):</label>
                            <input type="number" id="productPrice" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="productQuantity">Quantity:</label>
                            <input type="number" id="productQuantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="productImage">Image URL:</label>
                            <input type="url" id="productImage" required>
                        </div>
                        <div class="form-group">
                            <label for="productDescription">Description:</label>
                            <textarea id="productDescription" required></textarea>
                        </div>
                        <button type="submit" class="submit-btn">Add Product</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('addProductModal');
        const closeBtn = modal.querySelector('.close');
        const form = document.getElementById('addProductForm');

        closeBtn.onclick = () => {
            modal.remove();
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.remove();
            }
        };

        form.onsubmit = (e) => {
            e.preventDefault();
            addNewProduct();
        };
    }

    function addNewProduct() {
        const product = {
            id: Date.now(), // Generate unique ID
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value
        };

        // Get existing products from localStorage using the "inventory" key
        let products = JSON.parse(localStorage.getItem('inventory')) || [];
        
        // Add the new product
        products.push(product);
        
        // Save the updated array back to localStorage using the "inventory" key
        localStorage.setItem('inventory', JSON.stringify(products));

        // Show a success message
        alert('Product added successfully!');
        
        // Close the modal
        document.getElementById('addProductModal').remove();
    }

    function showOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        showModal('Order Management', generateOrdersTable(orders));
    }

    function showProcessOrders() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const pendingOrders = orders.filter(order => order.status === 'pending');
        showModal('Process Orders', generateProcessOrdersTable(pendingOrders));
    }

    function showModal(title, content) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => {
            modal.remove();
        };
    }

    function generateInventoryTable(inventory) {
        return `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventory.map(item => `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>₦${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>
                                <button onclick="editItem(${item.id})">Edit</button>
                                <button onclick="deleteItem(${item.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
});