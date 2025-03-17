document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const stateSelect = document.getElementById('state');
    const locationSelect = document.getElementById('location');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const deliveryFeeAmountElement = document.getElementById('delivery-fee-amount');
    const totalPriceElement = document.getElementById('total-price');
    const placeOrderButton = document.getElementById('place-order-button');

    const deliveryFees = {
        "Lagos": 1000,
        "Abuja": 1500,
        "PortHarcourt": 2000,
        "Kano": 2500,
        "Ibadan": 1200,
        "Ondo": 1800,
        "Edo": 2200
    };

    let selectedState = null;

    const locations = {
        "Lagos": ["Ikeja", "Lekki", "Surulere", "Yaba"],
        "Abuja": ["Garki", "Wuse", "Asokoro", "Gwarimpa"],
        "PortHarcourt": ["Eleme", "Obio-Akpor", "Oyigbo", "Port Harcourt City"],
        "Kano": ["Kano Municipal", "Fagge", "Dala", "Nassarawa"],
        "Ibadan": ["Ibadan North", "Ibadan South West", "Akinyele", "Egbeda"],
        "Ondo": ["Akure", "Ondo City", "Owo", "Idanre"],
        "Edo": ["Benin City", "Ekpoma", "Auchi", "Uromi"]
    };

    stateSelect.addEventListener('change', () => {
        selectedState = stateSelect.value;
        locationSelect.innerHTML = '<option value="">Select a location</option>';
        if (locations[selectedState]) {
            locations[selectedState].forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                locationSelect.appendChild(option);
            });
        }
        updateDeliveryFee();
    });

    function updateDeliveryFee() {
        if (selectedState && deliveryFees[selectedState] !== undefined) {
            deliveryFeeElement.style.display = 'block';
            deliveryFeeAmountElement.textContent = deliveryFees[selectedState].toLocaleString();
            updateTotalPrice(deliveryFees[selectedState]);
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
            email: formData.get('email'),
            state: formData.get('state'),
            location: formData.get('location'),
            phoneNumber: formData.get('phoneNumber'),
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
        const amount = orderDetails.totalPrice * 100; // Amount in kobo
        const transactionReference = Math.floor((Math.random() * 1000000) + 1) + 'Scent' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
        let handler = PaystackPop.setup({
            key: publicKey,
            email: orderDetails.email,
            amount: amount,
            currency: 'NGN',
            ref: transactionReference, // Use the generated transaction reference
            metadata: {
                custom_fields: [
                    {
                        display_name: "Name",
                        variable_name: "name",
                        value: orderDetails.name
                    },
                    {
                        display_name: "Location",
                        variable_name: "location",
                        value: orderDetails.location
                    },
                    {
                        display_name: "State",
                        variable_name: "state",
                        value: orderDetails.state
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phoneNumber",
                        value: orderDetails.phoneNumber
                    }
                ]
            },
            callback: function(response){
                // Handle successful payment here
                console.log('Payment successful. Transaction reference:', response.reference);
                sendOrderToServer(orderDetails, transactionReference);
            },
            onClose: function(){
                alert('Transaction was not completed, something went wrong');
            }
        });
        handler.openIframe();
    }

    function sendOrderToServer(orderDetails, transactionReference) {
        const orderData = {
            customerName: orderDetails.name,
            email: orderDetails.email,
            state: orderDetails.state,
            location: orderDetails.location,
            phoneNumber: orderDetails.phoneNumber,
            deliveryFee: orderDetails.deliveryFee,
            total: orderDetails.totalPrice,
            items: orderDetails.cart.map(item => ({
                product_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            transactionReference: transactionReference,
            status: 'paid' // Add payment status
        };

        console.log('Sending order data:', orderData);

        return fetch('http://scentsation_api.local/create_order.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(async response => {
            const text = await response.text();
            console.log('Raw response:', text);

            try {
                // Clean up any HTML/PHP warnings from the response
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

                if (!jsonData.success) {
                    throw new Error(jsonData.message || 'Order creation failed');
                }

                // Store order ID in localStorage for reference
                if (jsonData.orderId) {
                    localStorage.setItem('lastOrderId', jsonData.orderId);
                }

                // Send SMS
                sendSMS(orderDetails.name, orderDetails.totalPrice, transactionReference, orderDetails.phoneNumber);

                // Update product quantities and clear cart
                return updateProductQuantities(orderDetails.cart)
                    .then(() => {
                        localStorage.removeItem('cart');
                        window.location.href = `confirmation.html?ref=${transactionReference}`;
                    });
            } catch (e) {
                console.error('Failed to parse response:', text);
                throw new Error('Invalid server response');
            }
        })
        .catch(error => {
            console.error('Error creating order:', error);
            alert('Failed to create order: ' + error.message);
        });
    }

    // Add this new function to update product quantities
    function updateProductQuantities(cartItems) {
        const updates = cartItems.map(item => {
            return fetch('http://scentsation_api.local/update_product_quantity.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `id=${item.id}&quantity=${-item.quantity}` // Negative to decrease stock
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    throw new Error(`Failed to update quantity for product ${item.id}`);
                }
            });
        });

        return Promise.all(updates);
    }

    function sendSMS(customerName, totalPrice, transactionReference, phoneNumber) {
        const message = `Dear ${customerName}, your Scentsation by JC order of ₦${totalPrice.toLocaleString()} is successful. Ref: ${transactionReference}`;

        fetch('http://scentsation_api.local/send_sms.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `phoneNumber=${phoneNumber}&message=${encodeURIComponent(message)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('SMS sent successfully:', data);
            } else {
                console.error('Failed to send SMS:', data);
            }
        })
        .catch(error => {
            console.error('Error sending SMS:', error);
        });
    }
});