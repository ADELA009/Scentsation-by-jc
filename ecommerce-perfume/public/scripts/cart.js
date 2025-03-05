document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menuu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });

    const checkoutForm = document.getElementById('checkout-form');

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(checkoutForm);
        const orderDetails = {
            name: formData.get('name'),
            location: formData.get('location'),
            email: formData.get('email'),
            cart: JSON.parse(localStorage.getItem('cart')) || []
        };

        const amount = calculateOrderAmount(orderDetails.cart);

        // Fetch Paystack public key from the server
        // fetch('/api/paystack-key')
        //     .then(response => response.json())
        //     .then(data => {
        //         payWithPaystack(orderDetails, amount, data.key);
        //     })
        //     .catch(error => {
        //         console.error('Error fetching Paystack key:', error);
        //     });
        
                fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderDetails)
                })
                .then(response => response.json())
                .then(data => {
                    alert('Order placed successfully!');
                    localStorage.removeItem('cart');
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    alert('Failed to place order. Please try again.');
                });
    });

    function calculateOrderAmount(cart) {
        // Calculate the total order amount based on the cart items
        return cart.reduce((total, item) => total + parseFloat(item.price) * item.quantity * 100, 0);
    }

 
});

document.addEventListener('DOMContentLoaded', () => {
    const cartList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCart() {
        cartList.innerHTML = ''; // Clear existing cart items
        let totalPrice = 0;

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.style.display = 'none';
            totalPriceElement.textContent = '₦0.00';
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.style.display = 'block';

            cart.forEach((product, index) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.dataset.productId = product.id; // Add product ID to the cart item

                cartItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;">
                    <h3>${product.name}</h3>
                    <p>Price: ₦${product.price.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button class="minus-btn" data-product-id="${product.id}">-</button>
                        <input type="number" class="quantity-input" data-product-id="${product.id}" value="${product.quantity}" min="1">
                    </div>
                    <p>Total: ₦${(product.price * product.quantity).toLocaleString()}</p>
                    <button class="remove-from-cart-btn" data-product-id="${product.id}">Remove</button>
                `;
                cartList.appendChild(cartItem);
                totalPrice += product.price * product.quantity;
            });
            totalPriceElement.textContent = `₦${totalPrice.toLocaleString()}`;
        }
    }

    cartList.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.productId;

        if (target.classList.contains('plus-btn')) {
            // Increase quantity
            updateQuantity(productId, 1);
        } else if (target.classList.contains('minus-btn')) {
            // Decrease quantity
            updateQuantity(productId, -1);
        } else if (target.classList.contains('remove-from-cart-btn')) {
            // Remove item
            removeItem(productId);
        }
    });

    cartList.addEventListener('change', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const productId = event.target.dataset.productId;
            let newQuantity = parseInt(event.target.value);

            if (!isNaN(newQuantity) && newQuantity > 0) {
                updateQuantity(productId, newQuantity - getProductQuantity(productId));
            } else {
                // Reset to previous quantity if the input is invalid
                event.target.value = getProductQuantity(productId);
            }
        }
    });

    function updateQuantity(productId, change) {
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const product = cart[productIndex];
            const availableQuantity = getAvailableQuantity(productId); // Get available quantity from product page

            let newQuantity = product.quantity + change;

            if (newQuantity < availableQuantity) {
                alert(`Only ${availableQuantity} items available for ${product.name}.`);
                newQuantity = availableQuantity; // Set to max available quantity
            }

            if (newQuantity <= 0) {
                // Remove the item if the quantity is zero or less
                cart.splice(productIndex, 1);
            } else {
                product.quantity = newQuantity;
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    }

    function removeItem(productId) {
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const removedItem = cart.splice(productIndex, 1)[0]; // Get the removed item
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();

            // Dispatch a custom event to signal that an item has been removed from the cart
            const itemRemovedEvent = new CustomEvent('itemRemovedFromCart', {
                detail: {
                    productId: removedItem.id,
                    quantity: removedItem.quantity
                }
            });
            document.dispatchEvent(itemRemovedEvent);
        }
    }

    function getProductQuantity(productId) {
        const product = cart.find(item => item.id === productId);
        return product ? product.quantity : 0;
    }

    function getAvailableQuantity(productId) {
        // Get available quantity from the product page (e.g., from a data attribute)
        const productItem = document.querySelector(`.product-item[data-product-id="${productId}"]`);
         if (!productItem) {
             return 0; // Or some other appropriate default value
         }
        return productItem ? parseInt(productItem.dataset.quantity) : 0;
    }

    // Listen for the cartUpdated event
    document.addEventListener('cartUpdated', () => {
        renderCart();
    });

    renderCart();
    updateCartCount(); // Call it initially to display the count on page load

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }
});