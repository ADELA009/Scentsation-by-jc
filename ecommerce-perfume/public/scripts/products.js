document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    const navMenuToggle = document.getElementById('nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    navMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    updateCartCount(); // Initial call to set the count on page load

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
            searchMessage.textContent = `${searchTerm} is not available`;
        } else {
            searchMessage.textContent = '';
        }
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    function addToCart(event) {
        const productItem = event.target.closest('.product-item');
        const productName = productItem.dataset.name;
        const productPrice = parseFloat(productItem.querySelector('span').textContent.replace('₦', '').replace(',', ''));
        const productImage = productItem.querySelector('img').src;
        const availableQuantity = parseInt(productItem.dataset.quantity);
        const quantityInput = productItem.querySelector('input[name="quantity"]');
        let productQuantity = parseInt(quantityInput.value);

        if (isNaN(productQuantity) || productQuantity <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        if (productQuantity > availableQuantity) {
            alert(`Only ${availableQuantity} items of ${productName} are available.`);
            return;
        }

        let existingProductIndex = cart.findIndex(item => item.name === productName);

        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += productQuantity;
        } else {
            let product = {
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: productQuantity
            };
            cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${productQuantity} ${productName}(s) added to cart.`);

        // Update available quantity and reset input
        let newAvailableQuantity = availableQuantity - productQuantity;
        productItem.dataset.quantity = newAvailableQuantity;
        productItem.querySelector('.available').textContent = `Available: ${newAvailableQuantity}`;
        quantityInput.value = 1;
    }
});
