// js/main.js
import { fetchProducts } from './api.js';
import { getCart, saveCart, addProductToCart, updateProductQuantity, removeProductFromCart, clearCart, calculateCartTotals } from './cart.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    const productCatalog = document.getElementById('product-catalog');
    const cartIcon = document.getElementById('cart-icon'); // Este é o link do ícone no cabeçalho
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = cartModal.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loadingSpinner = document.querySelector('.loading-spinner');

    let products = []; // To store fetched products

    // --- Logout Functionality ---
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('cart'); // Clear cart on logout
        window.location.href = 'login.html';
    });

    // --- Product Catalog Rendering ---
    const renderProducts = (productsToRender) => {
        productCatalog.innerHTML = ''; // Clear previous products
        if (productsToRender.length === 0) {
            productCatalog.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description.substring(0, 100)}...</p>
                <div class="price">R$ ${product.price.toFixed(2)}</div>
                <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productCatalog.appendChild(productCard);
        });

        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const productToAdd = products.find(p => p.id === productId);
                if (productToAdd) {
                    addProductToCart(productToAdd);
                    updateCartDisplay();
                    // Optional: Show a temporary "Added to cart" message
                }
            });
        });
    };

    // --- Fetch Products on Load ---
    loadingSpinner.style.display = 'block'; // Show spinner
    products = await fetchProducts();
    loadingSpinner.style.display = 'none'; // Hide spinner
    renderProducts(products);

    // --- Cart Display and Management ---
    const updateCartDisplay = () => {
        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Clear current cart items
        const { subtotal, total } = calculateCartTotals(cart);

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <p>R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="quantity-controls">
                        <button class="decrease-quantity-btn" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity-btn" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">Remover</button>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        cartSubtotalSpan.textContent = subtotal;
        cartTotalSpan.textContent = total;
        cartCountSpan.textContent = cart.length; // Update cart icon count

        // Add event listeners for quantity controls and remove buttons
        document.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const currentQuantity = cart.find(item => item.id === productId).quantity;
                updateProductQuantity(productId, currentQuantity + 1);
                updateCartDisplay();
            });
        });

        document.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const currentQuantity = cart.find(item => item.id === productId).quantity;
                updateProductQuantity(productId, currentQuantity - 1);
                updateCartDisplay();
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                removeProductFromCart(productId);
                updateCartDisplay();
            });
        });
    };

    // Initial cart display on load
    updateCartDisplay();

    // --- Cart Modal Interactions ---
    // Event listener para abrir o modal quando o ícone do carrinho é clicado
    cartIcon.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o comportamento padrão do link
        cartModal.classList.add('open'); // Adiciona a classe 'open' para deslizar
    });

    // Event listener para fechar o modal quando o botão de fechar é clicado
    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('open'); // Remove a classe 'open' para deslizar de volta
    });

    // Event listener para fechar o modal se clicar fora dele
    cartModal.addEventListener('click', (event) => {
        if (event.target === cartModal) { // Verifica se o clique foi diretamente no background do modal
            cartModal.classList.remove('open');
        }
    });

    // --- Checkout Process ---
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
            return;
        }

        const confirmation = confirm('Deseja finalizar a compra?');
        if (confirmation) {
            alert('Pedido finalizado com sucesso! Em breve você receberá um email com os detalhes da entrega e pagamento.');
            clearCart();
            updateCartDisplay();
            cartModal.classList.remove('open'); // Close cart modal after checkout
        }
    });
});