document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('imageUploadForm');
  const fileInput = form.querySelector('input[type="file"]');
  const errorDiv = document.getElementById('imageError');
  const successDiv = document.getElementById('imageSuccess');

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorDiv.textContent = '';
    successDiv.textContent = '';

    const file = fileInput.files[0];
    if (!file) {
      errorDiv.textContent = 'Bitte wähle eine Datei aus.';
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      errorDiv.textContent = 'Nur JPG, PNG oder GIF Bilder sind erlaubt.';
      return;
    }
    if (file.size > MAX_SIZE) {
      errorDiv.textContent = 'Datei ist zu groß. Maximal 5MB.';
      return;
    }

    // Alles ok: jetzt per fetch an Node-API schicken
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3001/add_image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        successDiv.textContent = 'Bild erfolgreich hochgeladen!';
        fileInput.value = '';
      } else {
        errorDiv.textContent = data.message || 'Fehler beim Hochladen!';
      }
    } catch (err) {
        console.log(err)
      errorDiv.textContent = 'Verbindungsfehler zum Server!';
    }
  });
});