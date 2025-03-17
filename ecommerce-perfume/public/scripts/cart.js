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
    // Get DOM elements
    const cartList = document.getElementById('cart-items-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    
    // Initialize cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Initial cart:', cart); // Debug log

    function renderCart() {
        cartList.innerHTML = '';
        let totalPrice = 0;

        if (!cart || cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.style.display = 'none';
            totalPriceElement.textContent = '₦0.00';
            console.log('Cart is empty');
            return;
        }

        emptyCartMessage.style.display = 'none';
        checkoutButton.style.display = 'block';

        cart.forEach((product) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.dataset.productId = product.id;
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;">
                <h3>${product.name}</h3>
                <p>Price: ₦${product.price.toLocaleString()}</p>
                <div class="quantity-controls">
                    <button class="minus-btn" data-product-id="${product.id}">-</button>
                    <input type="number" class="quantity-input" data-product-id="${product.id}" 
                           value="${product.quantity}" min="1" max="${product.availableQuantity || 99}">
                    <button class="plus-btn" data-product-id="${product.id}">+</button>
                </div>
                <p>Total: ₦${(product.price * product.quantity).toLocaleString()}</p>
                <button class="remove-from-cart-btn" data-product-id="${product.id}">Remove</button>
            `;
            cartList.appendChild(cartItem);
            totalPrice += product.price * product.quantity;
        });

        totalPriceElement.textContent = `₦${totalPrice.toLocaleString()}`;
        console.log('Cart rendered with', cart.length, 'items');
    }

    function updateProductInDatabase(productId, newQuantity) {
        const formData = new FormData();
        formData.append('id', productId);
        formData.append('quantity', newQuantity);

        console.log('Updating product quantity:', { productId, newQuantity });

        return fetch('http://scentsation_api.local/update_product_quantity.php', {
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
            if (!data.success) {
                throw new Error(data.error || 'Failed to update product quantity');
            }
            return data;
        });
    }

    function removeItem(productId) {
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const removedItem = cart.splice(productIndex, 1)[0];
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update database with returned quantity
            updateProductQuantity(productId, removedItem.quantity)
                .then(data => {
                    console.log(`Successfully returned ${removedItem.quantity} items to inventory. Response:`, data);
                    renderCart();
                    updateCartCount();
                    showPopupMessage(`Removed ${removedItem.name} from cart`);
                })
                .catch(error => {
                    console.error('Error updating product quantity:', error);
                    showPopupMessage('Error updating inventory. Please try again.');
                });
        }
    }

    function updateProductQuantity(productId, quantityToAdd) {
        const formData = new FormData();
        formData.append('id', productId);
        formData.append('quantity', quantityToAdd);

        console.log('Updating product quantity:', { productId, quantityToAdd });

        return fetch('http://scentsation_api.local/add_product_quantity.php', {
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
            if (!data.success) {
                throw new Error(data.error || 'Failed to update product quantity');
            }
            console.log('Quantity update successful:', data);
            return data;
        })
        .catch(error => {
            console.error('Error updating product quantity:', error);
            throw error; // Re-throw the error to be caught by the caller
        });
    }

    function updateQuantity(productId, change) {
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const product = cart[productIndex];

            // Fetch available quantity from the database
            fetchAvailableQuantity(productId)
                .then(availableQuantity => {
                    let newQuantity = product.quantity + change;

                    if (newQuantity > availableQuantity) {
                        alert(`Only ${availableQuantity} items available for ${product.name}.`);
                        newQuantity = availableQuantity;
                    }

                    if (newQuantity <= 0) {
                        removeItem(productId);
                        return;
                    }

                    // Update quantity in cart
                    product.quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                    updateCartCount();
                })
                .catch(error => {
                    console.error('Error fetching available quantity:', error);
                    showPopupMessage('Error updating quantity. Please try again.');
                });
        }
    }

    function fetchAvailableQuantity(productId) {
        return fetch(`http://scentsation_api.local/get_product_quantity.php?id=${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success) {
                    return data.quantity;
                } else {
                    throw new Error(data?.error || 'Failed to fetch available quantity');
                }
            });
    }

    // Event Listeners
    cartList.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.productId;

        if (target.classList.contains('plus-btn')) {
            updateQuantity(productId, 1);
        } else if (target.classList.contains('minus-btn')) {
            updateQuantity(productId, -1);
        } else if (target.classList.contains('remove-from-cart-btn')) {
            removeItem(productId);
        }
    });

    function showPopupMessage(message) {
        const popup = document.createElement('div');
        popup.className = 'popup-message';
        popup.textContent = message;
        document.body.appendChild(popup);
        setTimeout(() => popup.classList.add('show'), 10);
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => document.body.removeChild(popup), 300);
        }, 3000);
    }

    function updateCartCount() {
        const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }

    // Initialize cart display
    renderCart();
    updateCartCount();
});