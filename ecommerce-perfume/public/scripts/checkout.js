document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle')
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    const stateSelect = document.getElementById('state');
    const locationSelect = document.getElementById('location');

    const locations = {
        Lagos: ["Ikeja", "Victoria Island", "Lekki", "Yaba", "Surulere"],
        Abuja: ["Wuse", "Garki", "Maitama", "Asokoro", "Gwarinpa"],
        PortHarcourt: ["GRA", "Rumuokoro", "D-Line", "Eleme"],
        Kano: ["Nassarawa", "Sabon Gari", "Tarauni", "Gwale", "Fagge"],
        Ibadan: ["Bodija", "Ring Road", "Dugbe", "Mokola", "Challenge"],
        Ondo: ["Akure post office", "Owo post office", "Ondo Town", "Ikare", "Okitipupa"],
        Edo: ["Benin City", "Auchi", "Ikpoba Hill", "Ugbowo", "Ekehuan", "Ekpoma"]
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

        fetch('/api/pay', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderDetails)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = data.paymentUrl;
            } 
        })
        .catch(error => {
            console.error('Error:', error);
            
        });
    });
});