document.addEventListener("DOMContentLoaded", () => {
    // Cache frequently used elements
    const viewInventoryBtn = document.getElementById("view-inventory");
    const addProductBtn = document.getElementById("add-product");
    const viewOrdersBtn = document.getElementById("view-orders");
    const processOrdersBtn = document.getElementById("process-orders");
    const searchInput = document.getElementById("search-input");

    // Attach event listeners
    viewInventoryBtn.addEventListener("click", showInventory);
    addProductBtn.addEventListener("click", showAddProductModal);
    if (viewOrdersBtn) viewOrdersBtn.addEventListener("click", showOrders);
    if (processOrdersBtn) processOrdersBtn.addEventListener("click", showProcessOrders);
    if (searchInput) searchInput.addEventListener("input", filterInventory);

    // Helper for inventory storage
    function getInventory() {
        return JSON.parse(localStorage.getItem("inventory")) || [];
    }
    function setInventory(data) {
        localStorage.setItem("inventory", JSON.stringify(data));
    }
    
    // Helper for orders storage
    function getOrders() {
        return JSON.parse(localStorage.getItem("orders")) || [];
    }
    function setOrders(data) {
        localStorage.setItem("orders", JSON.stringify(data));
    }

    // --- INVENTORY MANAGEMENT ---
    function showInventory() {
        const inventoryData = getInventory();
        showModal("Inventory Management", generateInventoryTable(inventoryData));
    }
    function filterInventory() {
        const term = searchInput.value.toLowerCase();
        const filtered = getInventory().filter(item =>
            item.id.toString().includes(term) ||
            item.name.toLowerCase().includes(term) ||
            item.price.toString().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
        showModal("Inventory Management", generateInventoryTable(filtered));
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
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventory.map(item => `
                        <tr data-product-id="${item.id}">
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>₦${item.price.toLocaleString()}</td>
                            <td>${item.quantity}</td>
                            <td>${item.category}</td>
                            <td>
                                <button class="edit-btn">Edit</button>
                                <button class="delete-btn">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Generic modal
    function showModal(title, content) {
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${title}</h2>
                ${content}
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = "block";

        const closeBtn = modal.querySelector(".close-modal");
        closeBtn.onclick = () => { modal.remove(); };

        // Attach event listeners for edit and delete buttons within the modal
        modal.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", handleEdit);
        });
        modal.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", handleDelete);
        });
        return modal;
    }

    // --- ADD NEW PRODUCT ---
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
                            <label for="productCategory">Category:</label>
                            <select id="productCategory" required>
                                <option value="For Men">For Men</option>
                                <option value="For Women">For Women</option>
                                <option value="Affordable Fragrance">Affordable Fragrance</option>
                                <option value="Exclusive Fragrance">Exclusive Fragrance</option>
                                <option value="Deodorants">Deodorants</option>
                                <option value="Body Mist">Body Mist</option>
                                <option value="Perfume Oil">Perfume Oil</option>
                                <option value="Perfumes">Perfumes</option>
                            </select>
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
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        const modal = document.getElementById("addProductModal");
        modal.querySelector(".close").onclick = () => { modal.remove(); };
        window.onclick = (event) => { if (event.target === modal) modal.remove(); };

        document.getElementById("addProductForm").onsubmit = (e) => {
            e.preventDefault();
            addNewProduct();
        };
    }
    function addNewProduct() {
        const newProduct = {
            id: Date.now(),
            name: document.getElementById("productName").value,
            price: parseFloat(document.getElementById("productPrice").value),
            quantity: parseInt(document.getElementById("productQuantity").value),
            category: document.getElementById("productCategory").value,
            image: document.getElementById("productImage").value,
            description: document.getElementById("productDescription").value
        };
        const inventory = getInventory();
        inventory.push(newProduct);
        setInventory(inventory);
        alert("Product added successfully!");
        const modal = document.getElementById("addProductModal");
        if (modal) modal.remove();
        showInventory();
    }

    // --- EDIT PRODUCT ---
    function handleEdit(event) {
        const productId = event.target.closest("tr").dataset.productId;
        const inventory = getInventory();
        const product = inventory.find(item => item.id == productId);
        showEditProductModal(product);
    }
    function showEditProductModal(product) {
        const modalHTML = `
            <div id="editProductModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Edit Product</h2>
                    <form id="editProductForm">
                        <div class="form-group">
                            <label for="editProductName">Product Name:</label>
                            <input type="text" id="editProductName" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editProductPrice">Price (₦):</label>
                            <input type="number" id="editProductPrice" value="${product.price}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="editProductQuantity">Quantity:</label>
                            <input type="number" id="editProductQuantity" value="${product.quantity}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="editProductCategory">Category:</label>
                            <select id="editProductCategory" required>
                                <option value="For Men" ${product.category === "For Men" ? "selected" : ""}>For Men</option>
                                <option value="For Women" ${product.category === "For Women" ? "selected" : ""}>For Women</option>
                                <option value="Affordable Fragrance" ${product.category === "Affordable Fragrance" ? "selected" : ""}>Affordable Fragrance</option>
                                <option value="Exclusive Fragrance" ${product.category === "Exclusive Fragrance" ? "selected" : ""}>Exclusive Fragrance</option>
                                <option value="Deodorants" ${product.category === "Deodorants" ? "selected" : ""}>Deodorants</option>
                                <option value="Body Mist" ${product.category === "Body Mist" ? "selected" : ""}>Body Mist</option>
                                <option value="Perfume Oil" ${product.category === "Perfume Oil" ? "selected" : ""}>Perfume Oil</option>
                                <option value="Perfumes" ${product.category === "Perfumes" ? "selected" : ""}>Perfumes</option>
                            </select>
                        </div>
                        <button type="submit" class="submit-btn">Save Changes</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        const modal = document.getElementById("editProductModal");
        modal.querySelector(".close").onclick = () => { modal.remove(); };
        window.onclick = (event) => { if (event.target === modal) modal.remove(); };

        document.getElementById("editProductForm").onsubmit = (e) => {
            e.preventDefault();
            saveProductChanges(product.id);
        };
    }
    function saveProductChanges(productId) {
        let inventory = getInventory();
        const index = inventory.findIndex(item => item.id == productId);
        if (index !== -1) {
            inventory[index].name = document.getElementById("editProductName").value;
            inventory[index].price = parseFloat(document.getElementById("editProductPrice").value);
            inventory[index].quantity = parseInt(document.getElementById("editProductQuantity").value);
            inventory[index].category = document.getElementById("editProductCategory").value;
            setInventory(inventory);
            alert("Product updated successfully!");
            document.getElementById("editProductModal").remove();
            showInventory();
        }
    }

    // --- DELETE PRODUCT ---
    function handleDelete(event) {
        const productId = event.target.closest("tr").dataset.productId;
        let inventory = getInventory();
        inventory = inventory.filter(item => item.id != productId);
        setInventory(inventory);
        alert("Product deleted successfully!");
        showInventory();
    }

    // --- ORDER MANAGEMENT (Optional) ---
    // Updated orders table generator with select checkboxes for pending orders
    function generateOrdersTable(orders) {
        if (!orders.length) return '<p class="no-orders">No orders found.</p>';
        
        const hasAnyPendingOrders = orders.some(order => order.status === 'pending');
        
        return `
            <table class="admin-table orders-table">
                <thead>
                    <tr>
                        ${hasAnyPendingOrders ? '<th>Select</th>' : ''}
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>User Location</th>
                        <th>Pickup Location</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr data-order-id="${order.id}">
                            ${hasAnyPendingOrders ? 
                                `<td>
                                    ${order.status === 'pending' ? 
                                        `<input type="checkbox" class="settle-checkbox" value="${order.id}">` 
                                        : ''}
                                </td>` 
                                : ''}
                            <td>${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${order.location || '-'}</td>
                            <td>${order.pickupLocation || '-'}</td>
                            <td>${order.items.length}</td>
                            <td>₦${order.total.toLocaleString()}</td>
                            <td><span class="status-${order.status}">${order.status}</span></td>
                            <td>
                                <button class="view-order-btn">View</button>
                                ${order.status === 'pending' 
                                    ? `<button class="transport-btn">Mark Transported</button>` 
                                    : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${hasAnyPendingOrders ? 
                `<button id="mark-settled-btn" class="btn">Mark Selected as Settled</button>` 
                : ''}
        `;
    }

    function generateProcessOrdersTable(orders) {
        if (!orders.length) return '<p class="no-orders">No orders found.</p>';
        
        const settledOrders = orders.filter(order => order.status === 'settled');
        const unsettledOrders = orders.filter(order => order.status !== 'settled');
        
        return `
            <div class="orders-sections">
                <div class="unsettled-orders">
                    <h3>Unsettled Orders</h3>
                    ${generateOrdersSection(unsettledOrders, true)}
                </div>
                
                <div class="settled-orders">
                    <h3>Settled Orders</h3>
                    ${generateOrdersSection(settledOrders, false)}
                </div>
            </div>
        `;
    }

    function generateOrdersSection(orders, showCheckbox) {
        if (!orders.length) return '<p class="no-orders">No orders in this section.</p>';
        
        return `
            <table class="admin-table orders-table">
                <thead>
                    <tr>
                        ${showCheckbox ? '<th>Select</th>' : ''}
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>User Location</th>
                        <th>Pickup Location</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr data-order-id="${order.id}">
                            ${showCheckbox ? 
                                `<td><input type="checkbox" class="settle-checkbox" value="${order.id}"></td>` 
                                : ''}
                            <td>${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${order.location || '-'}</td>
                            <td>${order.pickupLocation || '-'}</td>
                            <td>${order.items.length}</td>
                            <td>₦${order.total.toLocaleString()}</td>
                            <td><span class="status-${order.status}">${order.status}</span></td>
                            <td>
                                <button class="view-order-btn">View</button>
                                ${order.status === 'pending' ? 
                                    `<button class="transport-btn">Mark Transported</button>` 
                                    : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${showCheckbox && orders.length > 0 ? 
                `<button id="mark-settled-btn" class="btn">Mark Selected as Settled</button>` 
                : ''}
        `;
    }

    // Update showOrders to attach event listeners for the new button and "select all" checkbox.
    function showOrders() {
        const orders = getOrders();
        const modal = showModal("Order Management", generateOrdersTable(orders));
        
        // Attach event handlers for "Mark Transported" buttons.
        modal.querySelectorAll(".transport-btn").forEach(btn => {
            btn.addEventListener("click", handleTransport);
        });
        
        // Attach event handlers for "View" buttons.
        modal.querySelectorAll(".view-order-btn").forEach(btn => {
            btn.addEventListener("click", handleViewOrder);
        });
        
        // Attach event handler for "Mark Selected as Settled" button.
        const markSettledBtn = modal.querySelector("#mark-settled-btn");
        if (markSettledBtn) {
            markSettledBtn.addEventListener("click", () => {
                const checkboxes = modal.querySelectorAll(".settle-checkbox:checked");
                if (!checkboxes.length) {
                    alert("No orders selected.");
                    return;
                }

                let orders = getOrders();
                let settledCount = 0;

                checkboxes.forEach(checkbox => {
                    const orderId = checkbox.value;
                    const index = orders.findIndex(order => order.id == orderId);
                    if (index !== -1) {
                        orders[index].status = "settled";
                        settledCount++;
                    }
                });

                setOrders(orders);
                alert(`${settledCount} orders marked as settled.`);
                showOrders(); // Refresh the view
            });
        }
    }

    function showProcessOrders() {
        const orders = getOrders();
        const modal = showModal("Process Orders", generateProcessOrdersTable(orders));
        
        // Add event listeners for all buttons in the modal
        modal.querySelectorAll(".view-order-btn").forEach(btn => {
            btn.addEventListener("click", handleViewOrder);
        });
        
        modal.querySelectorAll(".transport-btn").forEach(btn => {
            btn.addEventListener("click", handleTransport);
        });
        
        // Add event listener for the Mark Selected as Settled button
        const markSettledBtn = modal.querySelector("#mark-settled-btn");
        if (markSettledBtn) {
            markSettledBtn.addEventListener("click", () => {
                const checkboxes = modal.querySelectorAll(".settle-checkbox:checked");
                if (!checkboxes.length) {
                    alert("No orders selected.");
                    return;
                }

                let orders = getOrders();
                let settledCount = 0;

                checkboxes.forEach(checkbox => {
                    const orderId = checkbox.value;
                    const index = orders.findIndex(order => order.id == orderId);
                    if (index !== -1) {
                        orders[index].status = "settled";
                        settledCount++;
                    }
                });

                setOrders(orders);
                alert(`${settledCount} orders marked as settled.`);
                // Refresh the process orders view
                showProcessOrders();
            });
        }
    }

    // New function to handle marking orders as transported.
    function handleTransport(event) {
        const orderId = event.target.closest("tr").dataset.orderId;
        let orders = getOrders();
        const index = orders.findIndex(order => order.id == orderId);
        if (index !== -1) {
            orders[index].status = "transported";
            setOrders(orders);
            alert("Order marked as transported!");
            showOrders();  // Refresh the orders view.
        }
    }

    // New function to handle viewing order details.
    function handleViewOrder(event) {
        const orderId = event.target.closest("tr").dataset.orderId;
        const orders = getOrders();
        const order = orders.find(o => o.id == orderId);
        if (!order) {
            alert("Order not found!");
            return;
        }
        
        const orderDetailsHtml = `
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.email || '-'}</p>
                <p><strong>State:</strong> ${order.state || '-'}</p>
                <p><strong>User Location:</strong> ${order.location || '-'}</p>
                <p><strong>Pickup Location:</strong> ${order.pickupLocation || '-'}</p>
                <p><strong>Delivery Fee:</strong> ₦${order.deliveryFee ? order.deliveryFee.toLocaleString() : '0'}</p>
                <p><strong>Total:</strong> ₦${order.total.toLocaleString()}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Transaction Reference:</strong> ${order.transactionReference || '-'}</p>
                <p><strong>Date:</strong> ${order.date}</p>
                <h4>Items:</h4>
                <ul>
                    ${order.items.map(item => `<li>${item.name} — Quantity: ${item.quantity} — Price: ₦${item.price.toLocaleString()}</li>`).join('')}
                </ul>
            </div>
        `;
        
        showModal("Order Details", orderDetailsHtml);
    }

    // New function that marks selected orders as settled.
    function markSelectedAsSettled() {
        const checkboxes = document.querySelectorAll(".settle-checkbox:checked");
        if (!checkboxes.length) {
            alert("No orders selected.");
            return;
        }
        let orders = getOrders();
        checkboxes.forEach(cb => {
            const orderId = cb.value;
            const index = orders.findIndex(order => order.id == orderId);
            if (index !== -1) {
                orders[index].status = "settled";
            }
        });
        setOrders(orders);
        alert("Selected orders marked as settled.");
        showOrders();  // Refresh the orders view.
    }

    // --- PAYMENT SUCCESS ---
    // Call this function when a user successfully completes a payment.
    // It updates the order status (e.g. "paid") and then displays the orders.
    function paymentSuccess(orderId) {
        let orders = getOrders();
        const index = orders.findIndex(order => order.id == orderId);
        if (index !== -1) {
            orders[index].status = "paid";
            setOrders(orders);
            alert("Payment successful! Order updated.");
            showOrders();
        }
    }

    // Helper function to filter orders by date criteria
    function sortOrdersByDate(criteria) {
        const now = new Date();
        let filterStartDate;
        switch (criteria) {
            case 'today':
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                // Assuming week starts on Monday:
                let day = now.getDay(); // 0 (Sun) to 6 (Sat)
                let diff = now.getDate() - (day === 0 ? 6 : day - 1);
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), diff);
                break;
            case 'month':
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case '3month':
                filterStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                break;
            case '6month':
                filterStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                break;
            case '1year':
                filterStartDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                filterStartDate = new Date(0); // all orders
        }
        const orders = getOrders();
        return orders.filter(order => new Date(order.date) >= filterStartDate);
    }

    // Helper function to compute summary details from orders
    function getOrderSummary(orders) {
        let totalAmount = 0;
        const userSet = new Set();
        orders.forEach(order => {
            totalAmount += order.total;
            if (order.email) {
                userSet.add(order.email);
            }
        });
        return {
            totalAmount,
            orderCount: orders.length,
            totalUsers: userSet.size
        };
    }

    // Function to display summary & orders filtered by date
    function showOrderSummaryByDate(criteria) {
        const filteredOrders = sortOrdersByDate(criteria);
        const summary = getOrderSummary(filteredOrders);
        let criteriaText = "";
        switch (criteria) {
            case 'today': criteriaText = "Today"; break;
            case 'week': criteriaText = "This Week"; break;
            case 'month': criteriaText = "This Month"; break;
            case '3month': criteriaText = "Last 3 Months"; break;
            case '6month': criteriaText = "Last 6 Months"; break;
            case '1year': criteriaText = "Last 1 Year"; break;
            default: criteriaText = "All Orders";
        }
        const summaryHtml = `
            <div class="order-summary">
                <h3>Order Summary: ${criteriaText}</h3>
                <p><strong>Total Orders:</strong> ${summary.orderCount}</p>
                <p><strong>Total Revenue:</strong> ₦${summary.totalAmount.toLocaleString()}</p>
                <p><strong>Total Users:</strong> ${summary.totalUsers}</p>
            </div>
            <hr>
            ${generateOrdersTable(filteredOrders)}
        `;
        showModal(`Orders: ${criteriaText}`, summaryHtml);
    }

    // Add event listener for the filter dropdown
    const orderFilter = document.getElementById('orderFilter');
    const applyFilterBtn = document.getElementById('applyOrderFilter');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            const selectedCriteria = orderFilter.value;
            if (selectedCriteria === 'all') {
                showOrders();
            } else {
                showOrderSummaryByDate(selectedCriteria);
            }
        });
    }

    // Update the showOrderSummaryByDate function
    function showOrderSummaryByDate(criteria) {
        const filteredOrders = sortOrdersByDate(criteria);
        const summary = getOrderSummary(filteredOrders);
        
        let criteriaText = "";
        switch (criteria) {
            case 'today': criteriaText = "Today"; break;
            case 'week': criteriaText = "This Week"; break;
            case 'month': criteriaText = "This Month"; break;
            case '3month': criteriaText = "Last 3 Months"; break;
            case '6month': criteriaText = "Last 6 Months"; break;
            case '1year': criteriaText = "Last 1 Year"; break;
            default: criteriaText = "All Orders";
        }

        const summaryHtml = `
            <div class="order-summary">
                <h3>Order Summary: ${criteriaText}</h3>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${summary.orderCount}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Revenue:</span>
                        <span class="stat-value">₦${summary.totalAmount.toLocaleString()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Users:</span>
                        <span class="stat-value">${summary.totalUsers}</span>
                    </div>
                </div>
            </div>
            <div class="filtered-orders">
                ${generateOrdersTable(filteredOrders)}
            </div>
        `;
        
        showModal(`Orders: ${criteriaText}`, summaryHtml);
    }

    // Update the sortOrdersByDate function to handle date comparison properly
    function sortOrdersByDate(criteria) {
        const now = new Date();
        let filterStartDate;
        
        switch (criteria) {
            case 'today':
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), diff);
                break;
            case 'month':
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case '3month':
                filterStartDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case '6month':
                filterStartDate = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case '1year':
                filterStartDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                filterStartDate = new Date(0);
        }

        const orders = getOrders();
        return orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= filterStartDate;
        });
    }

});