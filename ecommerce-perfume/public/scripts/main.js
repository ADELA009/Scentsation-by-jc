document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isClickInsideMenu = menuToggle.contains(event.target) || navLinks.contains(event.target);
        if (!isClickInsideMenu && menuToggle.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });

    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Slideshow functionality
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        const slides = document.querySelectorAll('.mySlides');
        const dots = document.querySelectorAll('.dot');
        slides.forEach(slide => slide.style.display = 'none');
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1 }
        slides[slideIndex - 1].style.display = 'block';
        dots.forEach(dot => dot.classList.remove('active'));
        dots[slideIndex - 1].classList.add('active');
        setTimeout(showSlides, 5000); // Change image every 5 seconds
    }

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let productQuantities = JSON.parse(localStorage.getItem('productQuantities')) || {}; // Load product quantities from localStorage
    const addToCartButtons = document.querySelectorAll('.product-item .add-to-cart-btn'); // Correct selector

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
            }
        });
    }

    updateAvailableQuantities(); // Call on page load

    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    function addToCart(event) { // Renamed from addToCartNew
        const productItem = event.target.closest('.product-item');
        const productId = productItem.dataset.productId;
        const productName = productItem.querySelector('h3').textContent;
        const productPrice = productItem.querySelector('.product-price').textContent.replace('₦', '').replace(',', ''); // Correct selector
        const productImage = productItem.querySelector('img').src;
        const quantityInput = productItem.querySelector('input[name="quantity"]'); // Get the input element
        const productQuantity = parseInt(quantityInput.value); // Get the value from the input
        let availableQuantity = parseInt(productItem.dataset.quantity); // Use dataset for quantity
        const availableQuantitySpan = productItem.querySelector('.available-quantity'); // Correct selector

        if (productQuantity > availableQuantity) {
            alert(`Only ${availableQuantity} items available for ${productName}.`);
            return;
        }

        const existingProductIndex = cart.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += productQuantity;
        } else {
            const product = {
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                image: productImage,
                quantity: productQuantity
            };
            cart.push(product);
        }

        // Update available quantity on the product item
        const newAvailableQuantity = availableQuantity - productQuantity;
        productItem.dataset.quantity = newAvailableQuantity;
        availableQuantitySpan.textContent = newAvailableQuantity;
        quantityInput.max = newAvailableQuantity;

        // Store the updated quantity in localStorage
         productQuantities[productId] = newAvailableQuantity;
         localStorage.setItem('productQuantities', JSON.stringify(productQuantities));

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Update the cart count after adding to cart
        alert(`${productQuantity} ${productName}(s) added to cart.`);
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    updateCartCount(); // Initial call to set the count on page load

    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    const productGrid = document.getElementsByClassName('product-grid');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const products = productList.querySelectorAll('.product-item');
        let found = false;

        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            const productprice = product.querySelector('span').textContent;
            if (productName.includes(searchTerm) || productprice.includes(searchTerm)) {
                product.style.display = 'flex';
                found = true;
            } else {
                    product.style.display = 'none';
            }
        });

        if(!found) {
            searchMessage.innerHTML = `${searchTerm} is not available`
        }
    });

    // Function to remove item from cart and update available quantity
    function removeFromCart(productId, quantityRemoved) {
        // 1. Find the item in the cart
        const cartItemIndex = cart.findIndex(item => item.id === productId);

        if (cartItemIndex === -1) {
            console.log("Item not found in cart");
            return;
        }

        // 2. Remove the item or reduce its quantity
        if (cart[cartItemIndex].quantity > quantityRemoved) {
            cart[cartItemIndex].quantity -= quantityRemoved;
        } else {
            cart.splice(cartItemIndex, 1); // Remove the item from the cart
        }

        // 3. Update localStorage with the new cart
        localStorage.setItem('cart', JSON.stringify(cart));

        // 4. Get the product item
         const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
         if (!productItem) {
         console.log("Product item not found on the page");
         return;
         }
        const availableQuantitySpan = productItem.querySelector('.available-quantity');
        const quantityInput = productItem.querySelector('input[name="quantity"]');

        // 5. Get the current available quantity (or the initial quantity from the HTML)
        let availableQuantity = parseInt(productQuantities[productId] || productItem.dataset.quantity);

        // 6. Calculate the new available quantity
        const newAvailableQuantity = availableQuantity + quantityRemoved;

        // 7. Update productQuantities and localStorage
        productQuantities[productId] = newAvailableQuantity;
        localStorage.setItem('productQuantities', JSON.stringify(productQuantities));

        // 8. Update the display
        productItem.dataset.quantity = newAvailableQuantity;
        availableQuantitySpan.textContent = newAvailableQuantity;
        quantityInput.max = newAvailableQuantity;

        // 9. Update the cart count
        updateCartCount();

        // 10. Update available quantities on the page
        updateAvailableQuantities();

        // 11. Dispatch a custom event to signal that the cart has been updated
        const cartUpdatedEvent = new CustomEvent('cartUpdated');
        document.dispatchEvent(cartUpdatedEvent);

        console.log(`Removed ${quantityRemoved} of product ${productId} from cart.  New available quantity: ${newAvailableQuantity}`);
    }

    // Example: Attaching event listeners to "Remove from Cart" buttons (assuming they exist in cart.html)
    // Adapt this to your specific cart display in cart.html
    const cartItemsList = document.getElementById('cart-items-list'); // Replace with the actual ID of your cart list
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (event) => {
            if (event.target.classList.contains('remove-from-cart-btn')) {
                const productId = event.target.dataset.productId;
                const quantityRemoved = parseInt(event.target.dataset.quantity); // Or however you store the quantity to remove
                removeFromCart(productId, quantityRemoved);
                // Also, update the cart display in cart.html here (remove the item from the list)
                // ... your code to update the cart display ...
            }
        });
    }

    // Listen for the itemRemovedFromCart event
    document.addEventListener('itemRemovedFromCart', (event) => {
        const productId = event.detail.productId;
        const quantityRemoved = event.detail.quantity;

        // Get the product item
        const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
        if (!productItem) {
            console.log("Product item not found on the page");
            return;
        }
        const availableQuantitySpan = productItem.querySelector('.available-quantity');
        const quantityInput = productItem.querySelector('input[name="quantity"]');

        // Get the current available quantity (or the initial quantity from the HTML)
        let availableQuantity = parseInt(productQuantities[productId] || productItem.dataset.quantity);

        // Calculate the new available quantity
        const newAvailableQuantity = availableQuantity + quantityRemoved;

        // Update productQuantities and localStorage
        productQuantities[productId] = newAvailableQuantity;
        localStorage.setItem('productQuantities', JSON.stringify(productQuantities));

        // Update the display
        productItem.dataset.quantity = newAvailableQuantity;
        availableQuantitySpan.textContent = newAvailableQuantity;
        quantityInput.max = newAvailableQuantity;
    });
});

