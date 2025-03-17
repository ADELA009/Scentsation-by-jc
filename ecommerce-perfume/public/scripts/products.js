document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    const productGrid = document.querySelector('.product-grid');
    const categoryLinks = document.querySelectorAll('.sidebar a');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let productQuantities = {}; // productQuantities is no longer loaded from localStorage
    const categoryFilter = document.getElementById("category-filter"); // Get category filter
    const productContainer = document.getElementById("product-container"); // Get product container

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
    function updateAvailableQuantities(products) {
        const productItems = document.querySelectorAll('.product-item');
        productItems.forEach(productItem => {
            const productId = productItem.dataset.productId;
            const availableQuantitySpan = productItem.querySelector('.available-quantity');
            const quantityInput = productItem.querySelector('input[name="quantity"]');

            // Find the product in the fetched product list
            const product = products.find(p => p.id == productId);

            if (product) {
                productQuantities[productId] = product.quantity; // Update productQuantities
                productItem.dataset.quantity = product.quantity;
                availableQuantitySpan.textContent = product.quantity;
                quantityInput.max = product.quantity;
            } else {
                console.warn(`Product with ID ${productId} not found.`);
            }
        });
    }

    updateCartCount(); // Initial call to set the count on page load

    // Event listeners for filtering and searching
    categoryFilter.addEventListener("change", filterProducts);
    searchInput.addEventListener("input", filterProducts);

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
                price: parseFloat(productItem.querySelector('.price').textContent.replace('₦', '').replace(',', '')),
                quantity: quantity,
                image: productItem.querySelector('img').src
            };
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showPopupMessage(`Added ${quantity} of ${productItem.querySelector('h3').textContent} to cart!`);
        updateCartCount(); // Update cart count after adding product

        // Update product quantity in database
        updateProductQuantity(productId, productQuantities[productId] - quantity);
    }

    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const removedItem = cart[productIndex];
            cart.splice(productIndex, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            showPopupMessage(`Removed ${removedItem.name} from cart!`);
            updateCartCount();

            // Increase the available quantity by the removed amount
            updateProductAvailability(productId, removedItem.quantity);
        }
    }

    // This function adds back the returnedQuantity into the product's available stock
    function updateProductAvailability(productId, returnedQuantity) {
        // Get the current available quantity from a global productQuantities object (set during loadProducts)
        // If productQuantities is not global, you might need to fetch fresh data or store it in both files.
        let currentQuantity = window.productQuantities && window.productQuantities[productId] ? window.productQuantities[productId] : 0;
        const newQuantity = currentQuantity + returnedQuantity;

        const formData = new FormData();
        formData.append('id', productId);
        formData.append('quantity', newQuantity);

        console.log('Updating availability for product:', { productId, newQuantity });

        fetch('http://scentsation_api.local/update_product_quantity.php', {
            method: 'POST',
            body: formData,
            mode: 'cors'
        })
        .then(async response => {
            const text = await response.text();
            console.log('Raw response (availability update):', text);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid JSON response: ${text}`);
            }
        })
        .then(data => {
            console.log('Parsed availability response:', data);
            if (data && data.success) {
                // Update the global productQuantities and UI accordingly
                window.productQuantities[productId] = newQuantity;
                const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
                if (productItem) {
                    const availableQuantitySpan = productItem.querySelector('.available-quantity');
                    const quantityInput = productItem.querySelector('input[name="quantity"]');
                    if (availableQuantitySpan) availableQuantitySpan.textContent = newQuantity;
                    if (quantityInput) quantityInput.max = newQuantity;
                }
                showPopupMessage('Product availability updated successfully');
            } else {
                throw new Error(data?.error || 'Unknown error occurred in availability update');
            }
        })
        .catch(error => {
            console.error('Error updating product availability:', error);
            showPopupMessage('Error updating availability. Please try again.');
        });
    }

    function loadProducts() {
        fetch('http://scentsation_api.local/get_inventory.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                displayProducts(data);
                updateAvailableQuantities(data); // Update quantities after loading
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>Error loading products.</p>';
            });
    }

    function displayProducts(products) {
        productContainer.innerHTML = ""; // Clear existing content
        if (products.length === 0) {
            productContainer.innerHTML = "<p>No products found.</p>";
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.className = "product-item"; // Use product-item class
            productCard.dataset.productId = product.id; // Set product ID
            productCard.dataset.quantity = product.quantity; // Set initial quantity
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.product_name}</h3>
                <p class="price">₦${product.price.toLocaleString()}</p>
                <p>${product.description}</p>
                <p class="available">Available: <span class="available-quantity">${product.quantity}</span></p>
                <label for="quantity-${product.id}">Quantity:</label>
                <input type="number" id="quantity-${product.id}" name="quantity" min="1" max="${product.quantity}" value="1">
                <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            `;
            productContainer.appendChild(productCard);
        });

        // Add event listeners to "Add to Cart" buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    function filterProducts() {
        const category = categoryFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        fetch('http://scentsation_api.local/get_inventory.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                let filteredProducts = data;

                if (category !== "all") {
                    filteredProducts = filteredProducts.filter(product => product.category === category);
                }

                if (searchTerm !== "") {
                    filteredProducts = filteredProducts.filter(product =>
                        product.product_name.toLowerCase().includes(searchTerm) ||
                        (product.description && product.description.toLowerCase().includes(searchTerm))
                    );
                }

                displayProducts(filteredProducts);
                updateAvailableQuantities(filteredProducts);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>Error loading products.</p>';
            });
    }

    function updateProductQuantity(productId, newQuantity) {
        const formData = new FormData();
        formData.append('id', productId);
        formData.append('quantity', newQuantity);

        console.log('Sending request:', {
            id: productId,
            quantity: newQuantity
        });

        fetch('http://scentsation_api.local/update_product_quantity.php', {
            method: 'POST',
            body: formData,
            mode: 'cors'
        })
        .then(async response => {
            const text = await response.text();
            console.log('Raw response:', text);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                throw new Error(`Invalid JSON response: ${text}`);
            }
        })
        .then(data => {
            console.log('Parsed response:', data);
            
            if (data && data.success) {
                productQuantities[productId] = newQuantity;
                
                const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
                if (productItem) {
                    const availableQuantitySpan = productItem.querySelector('.available-quantity');
                    const quantityInput = productItem.querySelector('input[name="quantity"]');
                    if (availableQuantitySpan) availableQuantitySpan.textContent = newQuantity;
                    if (quantityInput) quantityInput.max = newQuantity;
                }
                
                showPopupMessage('Product quantity updated successfully');
            } else {
                throw new Error(data?.error || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Error updating product quantity:', error);
            showPopupMessage('Error updating product quantity. Please try again.');
            loadProducts();
        });
    }

    loadProducts(); // Load all products by default

    // Bind removeFromCart events if necessary (e.g., on delete buttons in your cart page)
    // Example:
    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = button.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
});