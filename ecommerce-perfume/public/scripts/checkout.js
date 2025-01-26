document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const stateSelect = document.getElementById('state');
    const locationSelect = document.getElementById('location');

    const locations = {
        Lagos: [
            "Ikeja",
            "Victoria Island",
            "Lekki",
            "Yaba",
            "Surulere"
        ],
        Abuja: [
            "Wuse",
            "Garki",
            "Maitama",
            "Asokoro",
            "Gwarinpa"
        ],
        "Port Harcourt": [
            "GRA",
            "Rumuokoro",
            "Trans Amadi",
            "D-Line",
            "Eleme"
        ],
        Kano: [
            "Nassarawa",
            "Sabon Gari",
            "Tarauni",
            "Gwale",
            "Fagge"
        ],
        Ibadan: [
            "Bodija",
            "Ring Road",
            "Dugbe",
            "Mokola",
            "Challenge"
        ],
        Ondo: [
            "Akure post office",
            "Owo post office",
            "Ondo Town",
            "Ikare",
            "Okitipupa"
        ],
        Edo: [
            "Benin City",
            "Auchi",
            "Ikpoba Hill",
            "Ugbowo",
            "Ekehuan", 
            "Ekpoma"  
        ]
        // Add more states and their locations as needed
    };

    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        locationSelect.innerHTML = '<option value="">Select a location</option>';
        if (selectedState && locations[selectedState]) {
            locations[selectedState].forEach(location => {
                const option = document.createElement('option');
                option.value = `${selectedState} - ${location}`;
                option.textContent = `${selectedState} - ${location}`;
                locationSelect.appendChild(option);
            });
        }
    });

    const checkoutForm = document.getElementById('checkout-form');

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(checkoutForm);
        const orderDetails = {
            name: formData.get('name'),
            state: formData.get('state'),
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