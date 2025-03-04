document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    const productGrid = document.getElementsByClassName('product-grid');
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
            const productprice = product.querySelector('span').textContent;
            if (productName.includes(searchTerm) || productprice.includes(searchTerm)) {
                product.style.display = 'flex';
                found = true;
            } else {
                    product.style.display = 'none';
            }
        });

        if(!found) {
            searchMessage.innerHTML = `${searchTerm} is not available`
        }
    });

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
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

        // Update available quantity on the product item
        const newAvailableQuantity = availableQuantity - productQuantity;
        productItem.setAttribute('data-quantity', newAvailableQuantity);
        productItem.querySelector('.available').textContent = `Available: ${newAvailableQuantity}`;
        productItem.querySelector('input[name="quantity"]').max = newAvailableQuantity;

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Update the cart count after adding to cart
        alert(`${productQuantity} ${productName}(s) added to cart.`);
    }
});
