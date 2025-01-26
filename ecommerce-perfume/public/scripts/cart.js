document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
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

        payWithPaystack(orderDetails, amount);
    });

    function calculateOrderAmount(cart) {
        // Calculate the total order amount based on the cart items
        return cart.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * 100, 0);
    }

    function payWithPaystack(orderDetails, amount) {
        const handler = PaystackPop.setup({
            key: 'pk_test_68dbfa8350773116088d7bcf0eaee6edeb589f03', // Replace with your Paystack public key
            email: orderDetails.email,
            amount: amount,
            currency: 'NGN',
            ref: 'PS_' + Math.floor((Math.random() * 1000000000) + 1), // Generate a unique reference
            metadata: {
                custom_fields: [
                    {
                        display_name: "Name",
                        variable_name: "name",
                        value: orderDetails.name
                    },
                    {
                        display_name: "Pickup Location",
                        variable_name: "location",
                        value: orderDetails.location
                    }
                ]
            },
            callback: function(response) {
                // Payment successful, send order details to the server
                orderDetails.reference = response.reference;

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
            },
            onClose: function() {
                alert('Payment cancelled.');
            }
        });

        handler.openIframe();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartList = document.querySelector('.cart-list');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.getElementById('checkout-button');
    const totalPriceElement = document.getElementById('total-price');

    function renderCart() {
        cartList.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutButton.style.display = 'none';
            totalPriceElement.textContent = '$0.00';
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutButton.style.display = 'block';
            let totalPrice = 0;
            cart.forEach((product, index) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>Price: ${product.price}</p>
                    <p>Quantity: ${product.quantity}</p>
                    <p>Total: $${(parseFloat(product.price.replace('$', '')) * product.quantity).toFixed(2)}</p>
                    <button class="remove-button" data-index="${index}">Remove</button>
                `;
                cartList.appendChild(cartItem);
                totalPrice += parseFloat(product.price.replace('$', '')) * product.quantity;
            });
            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        }
    }

    cartList.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            const index = event.target.dataset.index;
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    });

    renderCart();
});