document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navLinks = document.querySelector('.nav-links');
    const sidebar = document.querySelector('.sidebar');

    // Function to close all menus
    function closeAllMenus() {
        navLinks.classList.remove('active');
        sidebar.classList.remove('active');
        navToggle.classList.remove('active');
        sidebarToggle.classList.remove('active');
        // Reset icons to default
        if (navToggle.querySelector('i')) {
            navToggle.querySelector('i').classList.remove('fa-times');
            navToggle.querySelector('i').classList.add('fa-bars');
        }
        if (sidebarToggle.querySelector('i')) {
            sidebarToggle.querySelector('i').classList.remove('fa-times');
            sidebarToggle.querySelector('i').classList.add('fa-list');
        }
    }

  
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        closeAllMenus();
    });

    // Prevent clicks inside the menus from closing them
    navLinks.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const productList = document.querySelector('.product-grid');

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const products = productList.querySelectorAll('.product-item');

        products.forEach(product => {
            const productName = product.dataset.name.toLowerCase();
            if (productName.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    });

    // Add to cart functionality
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const addToCartButtons = document.querySelectorAll('.product-item button');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    function addToCart(event) {
        const productItem = event.target.closest('.product-item');
        const productName = productItem.querySelector('h3').textContent;
        const productPrice = productItem.querySelector('span').textContent.replace('₦', '').replace(',', '');
        const productImage = productItem.querySelector('img').src;
        const productQuantity = parseInt(productItem.querySelector('input[type="number"]').value);
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
        productItem.querySelector('input[type="number"]').max = availableQuantity - productQuantity;

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${productQuantity} ${productName}(s) added to cart.`);
    }

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});