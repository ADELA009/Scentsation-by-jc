document.addEventListener('DOMContentLoaded', () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    displayCartItems();

    function displayCartItems() {
        const cartList = document.querySelector('.cart-list');
        const emptyCartMessage = document.getElementById('empty-cart-message');

        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        } else {
            emptyCartMessage.style.display = 'none';
            cart.forEach((product, index) => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.price}</p>
                    <button data-index="${index}">Remove</button>
                `;
                cartList.appendChild(cartItem);
            });

            const removeButtons = document.querySelectorAll('.cart-item button');
            removeButtons.forEach(button => {
                button.addEventListener('click', removeFromCart);
            });
        }
    }

    function removeFromCart(event) {
        const index = event.target.getAttribute('data-index');
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        location.reload();
    }
});