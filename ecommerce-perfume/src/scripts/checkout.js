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

    checkoutForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(checkoutForm);
        const orderDetails = {
            name: formData.get('name'),
            address: formData.get('address'),
            email: formData.get('email'),
            paymentMethod: formData.get('payment-method'),
            cart: JSON.parse(localStorage.getItem('cart')) || []
        };

        // Send order details to the server
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDetails)
        });

        if (response.ok) {
            alert('Order placed successfully!');
            localStorage.removeItem('cart');
            window.location.href = 'index.html';
        } else {
            alert('Failed to place order. Please try again.');
        }
    });
});