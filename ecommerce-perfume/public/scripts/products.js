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

    function loadProducts() {
        fetch('http://scensation_api.local/get_inventory.php')
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
                <h3>${product.name}</h3>
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

        fetch('http://scensation_api.local/get_inventory.php')
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
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm)
                    );
                }

                displayProducts(filteredProducts);
                updateAvailableQuantities(filteredProducts); // Update quantities after filtering
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                productContainer.innerHTML = '<p>Error loading products.</p>';
            });
    }

    function updateProductQuantity(productId, newQuantity) {
        fetch('http://scentsation_api.local/update_product_quantity.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                id: productId,
                quantity: newQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                console.log(`Product ${productId} quantity updated successfully.`);
                loadProducts(); // Reload products to reflect updated quantity
            } else {
                console.error(`Error updating product ${productId} quantity:`, data.error);
            }
        })
        .catch(error => {
            console.error('Error updating product quantity:', error);
        });
    }

    loadProducts(); // Load all products by default
});