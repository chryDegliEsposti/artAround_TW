document.addEventListener('DOMContentLoaded', () => {
    const museumForm = document.getElementById('museum-form');
    const addressInput = document.getElementById('address');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    const addressSuggestionsList = document.getElementById('address-suggestions');

    const titleInput = document.getElementById('nome');
    const titleSuggestions = document.getElementById('museum-suggestions');
    let selectedMuseumId = null;

    // --- Debounce Helper ---
    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // --- Museum Autocomplete (Backend) ---
    titleInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        if (query.length < 3) {
            titleSuggestions.innerHTML = '';
            titleSuggestions.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/museums?q=${query}`);
            const data = await response.json();
            const museums = data.museums || [];

            titleSuggestions.innerHTML = '';
            museums.forEach(museum => {
                const li = document.createElement('li');
                li.textContent = museum.title;
                li.addEventListener('click', () => {
                    titleInput.value = museum.title;
                    document.getElementById('description').value = museum.description || '';
                    addressInput.value = museum.address || '';
                    latInput.value = museum.location?.coordinates[1] || museum.lat || '';
                    lonInput.value = museum.location?.coordinates[0] || museum.lon || '';
                    document.getElementById('webSite').value = museum.webSite || '';
                    document.getElementById('mapLink').value = museum.mapLink || '';

                    selectedMuseumId = museum._id;
                    titleSuggestions.innerHTML = '';
                    titleSuggestions.style.display = 'none';
                });
                titleSuggestions.appendChild(li);
            });

            titleSuggestions.style.display = museums.length > 0 ? 'block' : 'none';
        } catch (error) {
            console.error('Error fetching museums:', error);
        }
    }, 300));

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!titleSuggestions.contains(e.target) && e.target !== titleInput) {
            titleSuggestions.style.display = 'none';
        }
        if (!addressSuggestionsList.contains(e.target) && e.target !== addressInput) {
            addressSuggestionsList.style.display = 'none';
        }
    });


    // --- Address Autocomplete (Nominatim) ---
    addressInput.addEventListener('input', debounce(async function (e) {
        const query = e.target.value;
        if (query.length < 3) {
            addressSuggestionsList.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            const data = await response.json();
            renderAddressSuggestions(data);
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    }, 300));

    function renderAddressSuggestions(data) {
        addressSuggestionsList.innerHTML = '';
        if (data.length === 0) {
            addressSuggestionsList.style.display = 'none';
            return;
        }

        data.forEach(place => {
            const li = document.createElement('li');
            li.textContent = place.display_name;
            li.addEventListener('click', () => {
                addressInput.value = place.display_name;
                latInput.value = place.lat;
                lonInput.value = place.lon;
                addressSuggestionsList.style.display = 'none';
            });
            addressSuggestionsList.appendChild(li);
        });
        addressSuggestionsList.style.display = 'block';
    }


    // --- Create/Update Museum & Redirect ---
    museumForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const museumData = {
            title: titleInput.value,
            description: document.getElementById('description').value,
            address: addressInput.value,
            lat: latInput.value,
            lon: lonInput.value,
            webSite: document.getElementById('webSite').value,
            mapLink: document.getElementById('mapLink').value,
            items: [] // No explicit items created here anymore
        };

        try {
            let url = 'http://localhost:5000/api/museums';
            let method = 'POST';

            if (selectedMuseumId) {
                url = `http://localhost:5000/api/museums/${selectedMuseumId}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(museumData)
            });

            if (response.ok) {
                const result = await response.json();
                // If created, result should contain the museum object.
                // If updated, it might return the updated doc or message.
                // Let's assume result._id exists or use selectedMuseumId.
                const targetId = result._id || selectedMuseumId;

                alert('Museo salvato! Reindirizzamento all\'editor...');
                // Redirect to Museum Editor (Correction: 3 levels up from insert_museum/ folder)
                window.location.href = `../../../museum_editor/index.html?museumId=${targetId}`;
            } else {
                const errorData = await response.json();
                alert(`Errore: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Errore di connessione al server.');
        }
    });

});
