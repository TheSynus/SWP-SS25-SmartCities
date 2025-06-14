
document.addEventListener('DOMContentLoaded', () => {

    const setupForm = document.getElementById('setupForm');
    const setupMessage = document.getElementById('setupMessage');

    setupForm.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(setupForm);
        setupMessage.textContent = 'Speichere...';

        try {
            const res = await fetch('http://localhost:3001/api/complete_setup', {
                method: 'POST',
                body: new URLSearchParams(formData),
                credentials: 'include'
            });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setupMessage.textContent = 'Profil aktualisiert! Du wirst weitergeleitet.';
                setupMessage.className = 'mt-2 text-center text-green-500 font-medium';

                // Leite zur Hauptseite (Dashboard) weiter
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 1500);
            } else {
                setupMessage.textContent = data.message || 'Speichern fehlgeschlagen!';
                setupMessage.className = 'mt-2 text-center text-red-500 font-medium';
            }
        } catch (error) {
            setupMessage.textContent = 'Ein Netzwerkfehler ist aufgetreten. Läuft der Server?';
            console.error('Setup-Fehler:', error);
        }
    };
});
