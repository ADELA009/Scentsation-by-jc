document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const stateSelect = document.getElementById('state');
    const locationSelect = document.getElementById('location');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const deliveryFeeAmountElement = document.getElementById('delivery-fee-amount');
    const totalPriceElement = document.getElementById('total-price');
    const placeOrderButton = document.getElementById('place-order-button');

    const locationsByState = {
        'Lagos': ['Ikeja', 'Victoria Island', 'Lekki', 'Yaba', 'Surulere'],
        'Abuja': ['Wuse', 'Garki', 'Maitama', 'Asokoro', 'Gwarinpa'],
        'PortHarcourt': ['GRA', 'Rumuokoro', 'D-Line', 'Eleme'],
        'Kano': ['Nassarawa', 'Sabon Gari', 'Tarauni', 'Gwale', 'Fagge'],
        'Ibadan': ['Bodija', 'Ring Road', 'Dugbe', 'Mokola', 'Challenge'],
        'Ondo': ['Akure post office', 'Owo post office', 'Ondo Town', 'Ikare', 'Okitipupa'],
        'Edo': ['Benin City', 'Auchi', 'Ikpoba Hill', 'Ugbowo', 'Ekehuan', 'Ekpoma']
        // Add more states and locations as needed
    };

    const deliveryFees = {
        'Lagos': 1000,
        'Abuja': 1500,
        'PortHarcourt': 2000,
        'Kano': 2500,
        'Ibadan': 1200,
        'Ondo': 1800,
        'Edo': 1600
        // Add more states and delivery fees as needed
    };

    stateSelect.addEventListener('change', () => {
        const selectedState = stateSelect.value;
        locationSelect.innerHTML = '<option value="">Select a location</option>';
        if (selectedState && locationsByState[selectedState]) {
            locationsByState[selectedState].forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationSelect.appendChild(option);
            });
        }
        updateDeliveryFee();
    });

    locationSelect.addEventListener('change', updateDeliveryFee);

    function updateDeliveryFee() {
        const selectedState = stateSelect.value;
        if (selectedState && deliveryFees[selectedState] !== undefined) {
            const deliveryFee = deliveryFees[selectedState];
            deliveryFeeElement.style.display = 'block';
            deliveryFeeAmountElement.textContent = deliveryFee.toLocaleString();
            updateTotalPrice(deliveryFee);
        } else {
            deliveryFeeElement.style.display = 'none';
            deliveryFeeAmountElement.textContent = '0.00';
            updateTotalPrice(0);
        }
    }

    function updateTotalPrice(deliveryFee) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const totalPrice = cartTotal + deliveryFee;
        totalPriceElement.textContent = totalPrice.toLocaleString();
    }

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(checkoutForm);
        const orderDetails = {
            name: formData.get('name'),
            state: formData.get('state'),
            location: formData.get('location'),
            email: formData.get('email'),
            cart: JSON.parse(localStorage.getItem('cart')) || [],
            deliveryFee: parseFloat(deliveryFeeAmountElement.textContent.replace(/,/g, '')),
            totalPrice: parseFloat(totalPriceElement.textContent.replace(/,/g, ''))
        };

        console.log('Order Details:', orderDetails); // Log order details for debugging

        // Use a hardcoded Paystack public key
        const publicKey = 'pk_test_68dbfa8350773116088d7bcf0eaee6edeb589f03';
        payWithPaystack(orderDetails, publicKey);
    });

    function payWithPaystack(orderDetails, publicKey) {
        const handler = PaystackPop.setup({
            key: publicKey, // Use the hardcoded Paystack public key
            email: orderDetails.email,
            amount: orderDetails.totalPrice * 100, // Paystack amount is in kobo
            currency: 'NGN',
            ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random reference number
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
                    },
                    {
                        display_name: "Items",
                        variable_name: "itemDetails",
                        value: orderDetails.cart
                    },
                    {
                        display_name: "Delivery Fee",
                        variable_name: "deliveryFee",
                        value: orderDetails.deliveryFee
                    }
                ]
            },
            callback: function(response) {
                // Payment successful
                console.log('Payment successful. Transaction reference:', response.reference);
                localStorage.removeItem('cart');
                window.location.href = 'confirmation.html';
            },
            onClose: function() {
                console.log('Payment window closed.');
            }
        });
        handler.openIframe();
    }

    // Initial update of delivery fee and total price
    updateDeliveryFee();
});