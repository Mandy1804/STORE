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
    // Adicione frete, impostos etc. se necessário
    return {
        subtotal: subtotal.toFixed(2),
        total: subtotal.toFixed(2) // Por enquanto, total é o mesmo que subtotal
    };
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-btn');

    // Verifica se o usuário já está autenticado ao carregar a página de login
    function verificarAutenticacao() {
        if (localStorage.getItem('isAuthenticated') === 'true') {
            window.location.href = 'index.html';
        }
    }

    // Lógica de autenticação ao enviar o formulário
    function realizarLogin(event) {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (username === 'cliente@mercadinho.com' && password === 'senha123') {
            localStorage.setItem('isAuthenticated', 'true');
            loginError.textContent = '';
            alert('Login bem-sucedido!');
            window.location.href = 'index.html';
        } else {
            loginError.textContent = 'Usuário ou senha inválidos. Tente novamente. (usuario : cliente@mercadinho.com, e senha : senha123)';
            loginError.style.color = 'red';
            loginError.style.display = 'block';
        }
    }

    // Realiza logout ao clicar no botão de sair
    function realizarLogout(event) {
        event.preventDefault();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('cart');
        alert('Você saiu da sua conta.');
        window.location.href = 'login.html';
    }

    // Executa lógicas específicas com base na página
    if (loginForm) {
        verificarAutenticacao();
        loginForm.addEventListener('submit', realizarLogin);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', realizarLogout);
    }
});




document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação. Se não estiver autenticado, redireciona para o login.
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return; // Importante para parar a execução do script
    }

    const productCatalog = document.getElementById('product-catalog');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const openCartBtn = cartModal.querySelector('.button');
    const closeCartBtn = cartModal.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalSpan = document.getElementById('cart-subtotal');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartCountSpan = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const logoutBtn = document.getElementById('logout-btn'); // Certifique-se que este ID existe no index.html

    let products = []; // Para armazenar os produtos buscados

    // --- Logout Functionality ---
    // A lógica de logout foi movida para auth.js para centralizar a autenticação,
    // mas o event listener aqui ainda é útil se você quiser que o main.js
    // também possa lidar com o logout. Para evitar duplicação, preferimos manter
    // a lógica principal de logout em auth.js. O trecho abaixo foi mantido
    // apenas para referência, mas o `auth.js` já gerencia isso.
    /*
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('cart'); // Limpa o carrinho ao sair
            window.location.href = 'login.html';
        });
    }
    */

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
            cartModal.classList.remove('open');
        }
    });
});