document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('eventUploadForm');
  const errorDiv = document.getElementById('eventError');
  const successDiv = document.getElementById('eventSuccess');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorDiv.textContent = '';
    successDiv.textContent = '';

    // Clientseitige Validierung
    const title = form.title.value.trim();
    console.log("TITEL: " + JSON.stringify(title))

    const calendar_entry_id = form.calendar_entry_id.value.trim();
    const category = form.category.value.trim();
    const tags = form.tags.value.trim();
    const additional_info = form.additional_info.value.trim();

    if (!title) {
      errorDiv.textContent = 'Titel ist erforderlich.';
      return;
    }
    if (!calendar_entry_id || isNaN(calendar_entry_id)) {
      errorDiv.textContent = 'Kalender-ID muss eine Zahl sein.';
      return;
    }

    // Daten zusammenstellen
    const data = {
        title: title,
        category: category,
        tags: tags,
        additional_info: additional_info
    }

    console.log("DAS WOLLEN WIR IN DIE DB UEBERGEBEN: " + JSON.stringify(data))

    try {
        const response = await fetch('http://localhost:3000/events/add_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

      const resData = await response.json();

      if (response.ok && resData.status === 'success') {
        successDiv.textContent = 'Event erfolgreich gespeichert!';
        form.reset();
      } else {
        errorDiv.textContent = resData.message || 'Fehler beim Speichern!';
      }
    } catch (err) {
      errorDiv.textContent = 'Verbindungsfehler zum Server!';
      console.error('Event-Upload-Fehler:', err);
    }
  });
});