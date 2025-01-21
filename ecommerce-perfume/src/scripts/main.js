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