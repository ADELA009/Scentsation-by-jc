// This file contains JavaScript code for interactivity on the homepage.
// It includes functions for handling user interactions, such as adding products to a cart or filtering products.

document.addEventListener('DOMContentLoaded', () => {
    const cart = [];

    // Function to add a product to the cart
    function addToCart(product) {
        cart.push(product);
        alert(`${product.name} has been added to your cart!`);
    }

    // Function to filter products based on a search term
    function filterProducts(searchTerm) {
        const products = document.querySelectorAll('.product');
        products.forEach(product => {
            const productName = product.querySelector('.product-name').textContent.toLowerCase();
            if (productName.includes(searchTerm.toLowerCase())) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    // Event listener for the search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (event) => {
        filterProducts(event.target.value);
    });

    // Example of adding event listeners to product buttons
    const productButtons = document.querySelectorAll('.add-to-cart');
    productButtons.forEach(button => {
        button.addEventListener('click', () => {
            const product = {
                name: button.dataset.productName,
                price: button.dataset.productPrice
            };
            addToCart(product);
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
    });
});

 // Slideshow script
 let slideIndex = 0;
 showSlides();

 function showSlides() {
     let i;
     let slides = document.getElementsByClassName("mySlides");
     let dots = document.getElementsByClassName("dot");
     for (i = 0; i < slides.length; i++) {
         slides[i].style.display = "none";  
     }
     slideIndex++;
     if (slideIndex > slides.length) {slideIndex = 1}    
     for (i = 0; i < dots.length; i++) {
         dots[i].className = dots[i].className.replace(" active", "");
     }
     slides[slideIndex-1].style.display = "block";  
     dots[slideIndex-1].className += " active";
     setTimeout(showSlides, 6000); // Change image every 4 seconds
 }

 document.addEventListener('DOMContentLoaded', () => {
     const cart = JSON.parse(localStorage.getItem('cart')) || [];

     const addToCartButtons = document.querySelectorAll('.product-item button');
     addToCartButtons.forEach(button => {
         button.addEventListener('click', addToCart);
     });

     function addToCart(event) {
         const productItem = event.target.closest('.product-item');
         const productName = productItem.querySelector('h3').textContent;
         const productPrice = productItem.querySelector('span').textContent;
         const productImage = productItem.querySelector('img').src;

         const product = {
             name: productName,
             price: productPrice,
             image: productImage
         };

         cart.push(product);
         localStorage.setItem('cart', JSON.stringify(cart));
         alert(`${productName} has been added to your cart.`);
     }
 });