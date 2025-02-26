document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const products = productList.querySelectorAll('.product-item');
        let found = false;

        products.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
                found = true;
            } else {
                product.style.display = 'none';
            }
        });

        if (!found) {
            searchMessage.style.display = 'block';
        } else {
            searchMessage.style.display = 'none';
        }
    });

    const addToCartButtons = document.querySelectorAll('.product-item button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    function addToCart(event) {
        const productItem = event.target.closest('.product-item');
        const productName = productItem.querySelector('h3').textContent;
        const productPrice = productItem.querySelector('span').textContent.replace('₦', '').replace(',', '');
        const productImage = productItem.querySelector('img').src;
        const productQuantity = parseInt(productItem.querySelector('input[name="quantity"]').value);
        const availableQuantity = parseInt(productItem.getAttribute('data-quantity'));

        if (productQuantity > availableQuantity) {
            alert(`Only ${availableQuantity} items available for ${productName}.`);
            return;
        }

        const existingProductIndex = cart.findIndex(item => item.name === productName);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += productQuantity;
        } else {
            const product = {
                name: productName,
                price: parseFloat(productPrice),
                image: productImage,
                quantity: productQuantity
            };
            cart.push(product);
        }

        productItem.setAttribute('data-quantity', availableQuantity - productQuantity);
        productItem.querySelector('input[name="quantity"]').max = availableQuantity - productQuantity;

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${productQuantity} ${productName}(s) added to cart.`);
    }

    // Function to update product availability
    function updateProductAvailability() {
        const products = document.querySelectorAll('.product-item');
        products.forEach(product => {
            const productName = product.getAttribute('data-name');
            fetch('/api/check-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productName })
            })
            .then(response => response.json())
            .then(data => {
                console.log(`Availability for ${productName}:`, data); // Debugging statement
                if (data.availableQuantity !== undefined) {
                    product.setAttribute('data-quantity', data.availableQuantity);
                    product.querySelector('.available').textContent = `Available: ${data.availableQuantity}`;
                    product.querySelector('input[name="quantity"]').max = data.availableQuantity;
                }
            })
            .catch(error => {
                console.error('Error checking product availability:', error);
            });
        });
    }

    // Check product availability every 30 seconds
    setInterval(updateProductAvailability, 3000);

    // Initial check on page load
    updateProductAvailability();
});