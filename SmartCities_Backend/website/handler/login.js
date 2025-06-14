document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');


    function toggleForms(show) {
        if (show === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            showLogin.classList.add('bg-blue-500', 'text-white');
            showLogin.classList.remove('bg-gray-200', 'text-gray-700');
            showRegister.classList.remove('bg-blue-500', 'text-white');
            showRegister.classList.add('bg-gray-200', 'text-gray-700');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            showRegister.classList.add('bg-blue-500', 'text-white');
            showRegister.classList.remove('bg-gray-200', 'text-gray-700');
            showLogin.classList.remove('bg-blue-500', 'text-white');
            showLogin.classList.add('bg-gray-200', 'text-gray-700');
        }
    }

    showLogin.onclick = () => toggleForms('login');
    showRegister.onclick = () => toggleForms('register');


    loginForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = 'Logge ein...';

        try {

            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                body: new URLSearchParams(formData),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                loginMessage.textContent = 'Login erfolgreich!';


                if (data.is_first_login) {

                    window.location.href = '/setup.html';
                } else {

                    window.location.href = '/index.html';
                }
            } else {
                loginMessage.textContent = data.message || 'Login fehlgeschlagen!';
            }
        } catch (error) {
            loginMessage.textContent = 'Ein Netzwerkfehler ist aufgetreten.';
            console.error('Login-Fehler:', error);
        }
    };


    registerForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const registerMessage = document.getElementById('registerMessage');
        registerMessage.textContent = 'Registriere...';

        try {
            const res = await fetch('http://localhost:3001/api/register', {
                method: 'POST',
                body: new URLSearchParams(formData),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                registerMessage.textContent = 'Registrierung erfolgreich! Du kannst dich jetzt einloggen.';
                setTimeout(() => {
                    toggleForms('login');
                    registerMessage.textContent = '';
                }, 2000);
            } else {
                registerMessage.textContent = data.message || 'Registrierung fehlgeschlagen!';
            }
        } catch (error) {
            registerMessage.textContent = 'Ein Netzwerkfehler ist aufgetreten.';
            console.error('Registrierungs-Fehler:', error);
        }
    };
});