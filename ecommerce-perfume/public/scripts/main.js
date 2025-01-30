document.addEventListener('DOMContentLoaded', () => {
    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
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
        setTimeout(showSlides, 6000); // Change image every 6 seconds
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
});

 