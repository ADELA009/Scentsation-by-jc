document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Slideshow functionality
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        const slides = document.querySelectorAll('.mySlides');
        const dots = document.querySelectorAll('.dot');
        slides.forEach(slide => slide.style.display = 'none');
        slideIndex++;
        if (slideIndex > slides.length) { slideIndex = 1 }
        slides[slideIndex - 1].style.display = 'block';
        dots.forEach(dot => dot.classList.remove('active'));
        dots[slideIndex - 1].classList.add('active');
        setTimeout(showSlides, 5000); // Change image every 5 seconds
    }

    // Cart functionality
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
        const productQuantity = parseInt(productItem.querySelector('input[name="quantity"]').value);

        fetch('/api/check-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productName, quantity: productQuantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.available) {
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

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount(); // Update the cart count after adding to cart
                alert(`${productQuantity} ${productName}(s) have been added to your cart.`);
            } else {
                alert(`Only ${data.availableQuantity} items available for ${productName}.`);
            }
        })
        /*.catch(error => {
            console.error('Error checking product availability:', error);
            alert('Failed to add product to cart. Please try again.');
        });*/
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    updateCartCount(); // Initial call to set the count on page load

    const searchInput = document.getElementById('search-input');
    const productList = document.getElementById('product-list');
    const searchMessage = document.getElementById('search-message');
    const productGrid = document.getElementsByClassName('product-grid');

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    const navMenuToggle = document.getElementById('nav-menu-toggle');

    if (navMenuToggle) {
        navMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
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

    const addToCartButtonsNew = document.querySelectorAll('.add-to-cart');
    addToCartButtonsNew.forEach(button => {
        button.addEventListener('click', addToCartNew);
    });

    function addToCartNew(event) {
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

document.addEventListener('DOMContentLoaded', () => {
    const navMenuToggle = document.getElementById('nav-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (navMenuToggle) {
        navMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        let cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = cartCount;
    }

    updateCartCount();
});

