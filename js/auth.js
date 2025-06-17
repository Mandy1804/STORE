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

