document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('item-modal');
    const addItemBtn = document.getElementById('add-item-btn');
    const closeModalSpan = document.querySelector('.close-modal');
    const itemForm = document.getElementById('item-form');
    const itemsList = document.getElementById('items-list');
    const museumForm = document.getElementById('museum-form');


    const addressInput = document.getElementById('address');
    const suggestionsList = document.getElementById('address-suggestions');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');


    const titleInput = document.getElementById('nome');
    const titleSuggestions = document.getElementById('museum-suggestions');
    let selectedMuseumId = null;


    const debounce = (func, delay) => {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    titleInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value;
        if (query.length < 3) {
            titleSuggestions.innerHTML = '';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/museums?q=${query}`);
            const museums = await response.json();

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
                });
                titleSuggestions.appendChild(li);
            });

            if (museums.length > 0) {
                titleSuggestions.style.display = 'block';
            } else {
                titleSuggestions.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching museums:', error);
        }
    }, 300));


    document.addEventListener('click', (e) => {
        if (!titleSuggestions.contains(e.target) && e.target !== titleInput) {
            titleSuggestions.innerHTML = '';
        }
    });

    let debounceTimer;


    addressInput.addEventListener('input', function () {
        const query = this.value;


        clearTimeout(debounceTimer);

        if (query.length < 3) {
            suggestionsList.style.display = 'none';
            return;
        }


        debounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
                const data = await response.json();

                renderSuggestions(data);
            } catch (error) {
                console.error('Error fetching address:', error);
            }
        }, 300);
    });

    function renderSuggestions(data) {
        suggestionsList.innerHTML = '';

        if (data.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        data.forEach(place => {
            const li = document.createElement('li');
            li.textContent = place.display_name;
            li.addEventListener('click', () => {
                selectAddress(place);
            });
            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = 'block';
    }

    function selectAddress(place) {
        addressInput.value = place.display_name;
        latInput.value = place.lat;
        lonInput.value = place.lon;
        suggestionsList.style.display = 'none';
    }


    document.addEventListener('click', (e) => {
        if (e.target !== addressInput && e.target !== suggestionsList) {
            suggestionsList.style.display = 'none';
        }
    });

    let items = [];


    addItemBtn.onclick = () => modal.style.display = "block";
    closeModalSpan.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }


    const aiCheckbox = document.getElementById('generate-ai');
    const manualDescriptions = document.getElementById('manual-descriptions');

    aiCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            manualDescriptions.style.display = 'none';
        } else {
            manualDescriptions.style.display = 'block';
        }
    });


    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const isAiGenerated = aiCheckbox.checked;

        const newItem = {
            title: document.getElementById('item-title').value,
            authorName: document.getElementById('item-author').value,
            generateAI: isAiGenerated,
            description_short_easy: isAiGenerated ? null : document.getElementById('item-desc-short').value

        };

        items.push(newItem);
        renderItems();

        itemForm.reset();
        manualDescriptions.style.display = 'block';
        modal.style.display = "none";
    });

    function renderItems() {
        itemsList.innerHTML = '';
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.title}</span>
                <button type="button" class="btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;" onclick="removeItem(${index})">Rimuovi</button>
            `;
            itemsList.appendChild(li);
        });
    }


    window.removeItem = (index) => {
        items.splice(index, 1);
        renderItems();
    };



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
            items: items
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(museumData)
            });

            if (response.ok) {
                alert(selectedMuseumId ? 'Museo aggiornato con successo!' : 'Museo creato con successo!');
                window.location.href = '../home/home_museum_owner.html';
            } else {
                const errorData = await response.json();
                alert(`Errore: ${errorData.message} `);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Si è verificato un errore durante la creazione/aggiornamento del museo.');
        }
    });
});
