//api
const fetchProducts = async () => {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
};

//cart
const getCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
};

const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

const addProductToCart = (product) => {
    const cart = getCart();
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    return cart;
};

const updateProductQuantity = (productId, newQuantity) => {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        if (newQuantity <= 0) {
            cart.splice(productIndex, 1); // Remove se a quantidade for 0 ou menos
        } else {
            cart[productIndex].quantity = newQuantity;
        }
    }
    saveCart(cart);
    return cart;
};

const removeProductFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
};

const clearCart = () => {
    localStorage.removeItem('cart');
    return [];
};

const calculateCartTotals = (cart) => {
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    
    return {
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2)
    };
};

//main

document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação. Se não estiver autenticado, redireciona para o login.
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return; // Importante para parar a execução do script
    }

    const productCatalog = document.getElementById('product-catalog');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = cartModal.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Elementos do novo modal de checkout
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModalBtn = document.getElementById('close-checkout-modal');
    const checkoutCartItemsContainer = document.getElementById('checkout-cart-items');
    const checkoutTotalSpan = document.getElementById('checkout-total');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const deliveryForm = document.getElementById('delivery-form');

    let products = []; // Para armazenar os produtos buscados

    // --- Product Catalog Rendering ---
    const renderProducts = (productsToRender) => {
        productCatalog.innerHTML = ''; // Limpa produtos anteriores
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

        // Adiciona event listeners aos botões "Adicionar ao Carrinho"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                const productToAdd = products.find(p => p.id === productId);
                if (productToAdd) {
                    addProductToCart(productToAdd);
                    updateCartDisplay();
                }
            });
        });
    };

    // --- Fetch Products on Load ---
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) { // Garante que o spinner existe antes de tentar manipulá-lo
        loadingSpinner.style.display = 'block'; // Mostra o spinner
    }
    products = await fetchProducts();
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none'; // Esconde o spinner
    }
    renderProducts(products);

    // --- Cart Display and Management ---
    const updateCartDisplay = () => {
        const cart = getCart();
        cartItemsContainer.innerHTML = ''; // Limpa itens atuais do carrinho
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

        const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountSpan.textContent = totalQuantity;

        // Adiciona event listeners para controles de quantidade e botões de remover
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

    // Exibição inicial do carrinho ao carregar a página
    updateCartDisplay();

    // --- Cart Modal Interactions ---
    cartIcon.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o comportamento padrão do link
        cartModal.classList.add('open');
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.classList.remove('open');
    });

    // --- Checkout Process (antigo) ---
    // Este trecho será modificado para abrir o novo modal de checkout
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.');
            return;
        }
        // Abre o modal de checkout e preenche os dados
        openCheckoutModal();
    });

    // --- Novo Checkout Process ---
    const openCheckoutModal = () => {
        const cart = getCart();
        checkoutCartItemsContainer.innerHTML = '';
        const { total } = calculateCartTotals(cart);

        if (cart.length === 0) {
            checkoutCartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const checkoutItemDiv = document.createElement('div');
                checkoutItemDiv.classList.add('cart-item'); // Reutiliza a classe para estilização
                checkoutItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <div class="item-details">
                        <h4>${item.title}</h4>
                        <p>Quantidade: <span>${item.quantity}</span> x R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <p>R$ ${(item.quantity * item.price).toFixed(2)}</p>
                `;
                checkoutCartItemsContainer.appendChild(checkoutItemDiv);
            });
        }
        checkoutTotalSpan.textContent = total;
        cartModal.classList.remove('open'); // Fecha o modal do carrinho
        checkoutModal.classList.add('open'); // Abre o modal de checkout
    };

    closeCheckoutModalBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('open');
    });

    confirmOrderBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const zipCode = document.getElementById('zip-code').value;

        if (!name || !address || !city || !zipCode) {
            alert('Por favor, preencha todas as informações de entrega.');
            return;
        }

        const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Simulação de processamento do pedido
        console.log('Pedido Confirmado!');
        console.log('Método de Pagamento:', selectedPaymentMethod);
        console.log('Informações de Entrega:', { name, address, city, zipCode });
        console.log('Itens do Pedido:', getCart());
        console.log('Total:', checkoutTotalSpan.textContent);

        alert('Pedido finalizado com sucesso! Em breve você receberá um e-mail com os detalhes da entrega e pagamento.');
        clearCart();
        updateCartDisplay();
        checkoutModal.classList.remove('open');
        deliveryForm.reset(); // Limpa o formulário de entrega
    });
});