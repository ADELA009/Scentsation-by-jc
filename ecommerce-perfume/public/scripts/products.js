document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    const productGrid = document.querySelector('.product-grid');
    const categoryLinks = document.querySelectorAll('.sidebar a');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let productQuantities = JSON.parse(localStorage.getItem('productQuantities')) || {}; // Load product quantities from localStorage

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    const navMenuToggle = document.getElementById('nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    navMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    // Function to update available quantity on page load
    function updateAvailableQuantities() {
        const productItems = document.querySelectorAll('.product-item');
        productItems.forEach(productItem => {
            const productId = productItem.dataset.productId;
            const availableQuantitySpan = productItem.querySelector('.available-quantity');
            const quantityInput = productItem.querySelector('input[name="quantity"]');

            if (productQuantities[productId] !== undefined) {
                productItem.dataset.quantity = productQuantities[productId];
                availableQuantitySpan.textContent = productQuantities[productId];
                quantityInput.max = productQuantities[productId];
            } else {
                // Initialize productQuantities if not already set
                productQuantities[productId] = parseInt(productItem.dataset.quantity);
                availableQuantitySpan.textContent = productQuantities[productId];
                quantityInput.max = productQuantities[productId];
            }
        });
    }

    updateAvailableQuantities(); // Call on page load

    updateCartCount(); // Initial call to set the count on page load

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const products = productList.querySelectorAll('.product-item');
        let found = false;

        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
                found = true;
            } else {
                product.style.display = 'none';
            }
        });

        if (!found) {
            searchMessage.textContent = `${searchTerm} is not available`;
        } else {
            searchMessage.textContent = '';
        }
    });

    function showPopupMessage(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.textContent = message;
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.classList.add('show');
        }, 10);

        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 300);
        }, 4000); // Show for 4 seconds
    }

    // Update the addToCart function
    function addToCart(event) {
        const button = event.target;
        const productId = button.getAttribute('data-product-id');
        const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
        const quantityInput = productItem.querySelector(`input[name="quantity"]`);
        const quantity = parseInt(quantityInput.value);

        if (quantity > productQuantities[productId]) {
            showPopupMessage('Cannot add more than available quantity!');
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);

        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            const product = {
                id: productId,
                name: productItem.querySelector('h3').textContent,
                price: parseFloat(productItem.querySelector('.product-price').textContent.replace('₦', '').replace(',', '')),
                quantity: quantity,
                image: productItem.querySelector('img').src
            };
            cart.push(product);
        }

        // Update the available quantity
        productQuantities[productId] -= quantity;
        if (productQuantities[productId] <= 0) {
            productQuantities[productId] = 0;
            
            // Update inventory quantity
            const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
            const productIndex = inventory.findIndex(item => item.id === productId);
            if (productIndex !== -1) {
                inventory.splice(productIndex, 1); // Remove product from inventory
                localStorage.setItem('inventory', JSON.stringify(inventory));
            }
            
            // Remove empty products
            removeEmptyProducts();
        }
        
        localStorage.setItem('productQuantities', JSON.stringify(productQuantities));

        // Update the available quantity displayed on the page
        productItem.dataset.quantity = productQuantities[productId];
        productItem.querySelector('.available-quantity').textContent = productQuantities[productId];
        quantityInput.max = productQuantities[productId];

        localStorage.setItem('cart', JSON.stringify(cart));
        showPopupMessage(`Added ${quantity} of ${productItem.querySelector('h3').textContent} to cart!`);
        updateCartCount(); // Update cart count after adding product
    }

    function removeFromCart(productId) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const product = cart[productIndex];
            cart.splice(productIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            showPopupMessage(`Removed ${product.name} from cart!`);
            updateCartCount(); // Update cart count after removing product
        }
    }

    function loadProducts(category = 'All') {
        const products = JSON.parse(localStorage.getItem('inventory')) || [];
        // Filter out products with zero quantity
        const availableProducts = products.filter(product => product.quantity > 0);
        const filteredProducts = category === 'All' ? 
            availableProducts : 
            availableProducts.filter(product => product.category === category);

        productGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-item" data-product-id="${product.id}" data-quantity="${product.quantity}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <span class="product-price">₦${product.price.toLocaleString()}</span>
                <p class="available">Available: <span class="available-quantity">${product.quantity}</span></p>
                <label for="quantity-${product.id}">Quantity:</label>
                <input type="number" id="quantity-${product.id}" name="quantity" min="1" max="${product.quantity}" value="1">
                <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `).join('');

        // Add event listeners to "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });

        updateAvailableQuantities(); // Update available quantities after loading products
    }

    function removeEmptyProducts() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        const emptyProducts = inventory.filter(product => product.quantity <= 0);
        
        if (emptyProducts.length > 0) {
            // Remove empty products from inventory
            const updatedInventory = inventory.filter(product => product.quantity > 0);
            localStorage.setItem('inventory', JSON.stringify(updatedInventory));
            
            // Alert admin about removed products
            const message = emptyProducts.map(product => 
                `${product.name} (ID: ${product.id})`
            ).join('\n');
            
            // Store notification for admin
            const notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
            notifications.push({
                type: 'stock',
                message: `Products removed due to zero quantity:\n${message}`,
                date: new Date().toISOString()
            });
            localStorage.setItem('adminNotifications', JSON.stringify(notifications));
            
            // Refresh the product display
            loadProducts();
        }
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const category = event.target.dataset.category;
            loadProducts(category);

            categoryLinks.forEach(link => link.classList.remove('active'));
            event.target.classList.add('active');
        });
    });

    loadProducts(); // Load all products by default
});
