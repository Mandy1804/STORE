export const getCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
};

export const addProductToCart = (product) => {
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

export const updateProductQuantity = (productId, newQuantity) => {
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

export const removeProductFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
};

export const clearCart = () => {
    localStorage.removeItem('cart');
    return [];
};

export const calculateCartTotals = (cart) => {
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