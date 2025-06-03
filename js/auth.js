// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Basic authentication check on load
    // Se o usuário já estiver autenticado (tem a flag 'isAuthenticated' no localStorage),
    // ele é redirecionado diretamente para index.html ao carregar login.html.
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'index.html'; // Redireciona se já estiver autenticado
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = loginForm.username.value;
        const password = loginForm.password.value;

        // Simple validation for demonstration
        // Após a validação bem-sucedida do usuário e senha,
        // a flag 'isAuthenticated' é definida e o redirecionamento ocorre.
        if (username === 'cliente@mercadinho.com' && password === 'senha123') {
            localStorage.setItem('isAuthenticated', 'true'); // Marca o usuário como autenticado
            window.location.href = 'index.html'; // Redireciona para o catálogo de produtos
        } else {
            loginError.textContent = 'Usuário ou senha inválidos.';
            loginError.style.display = 'block';
        }
    });
});