document.addEventListener('DOMContentLoaded', () => {
    const museumSelect = document.getElementById('museum-select');
    const availableList = document.getElementById('available-items-list');
    const selectedList = document.getElementById('selected-items-list');
    const visitForm = document.getElementById('visit-form');
    const museumsList = document.getElementById('museum-list');

    let availableItems = [];
    let selectedItems = [];


    fetchMuseums();
    let museumsData = [];

    async function fetchMuseums() {
        try {
            console.log('Fetching museums...');
            const PORT = 5000;
            const response = await fetch(`http://localhost:5000/api/museums`);
            const museums = await response.json();
            museumsData = museums;

            museums.forEach(museum => {
                const option = document.createElement('option');
                option.value = museum.title;

                museumsList.appendChild(option);
            });

        } catch (err) {
            console.error('Error fetching museums:', err);
        }
    }


    museumSelect.addEventListener('change', async (e) => {
        const museumTitle = e.target.value;
        const message = document.querySelector('.messagge');

        const selectedMuseum = museumsData.find(m => m.title === museumTitle);

        if (!selectedMuseum) {
            museumSelect.classList.add("error");
            message.innerText = "Devi selezionare un valore dalla lista!";
            availableItems = [];
            renderLists();
            return;
        } else {
            museumSelect.classList.remove("error");
            message.innerText = "";
            console.log("Valore accettato:", museumTitle);
        }

        const museumId = selectedMuseum._id;
        console.log("Selected Museum ID:", museumId);

        try {
            const response = await fetch('http://localhost:5000/api/items');
            const allItems = await response.json();

            availableItems = allItems.filter(item => item.museums.includes(museumId));
            selectedItems = [];
            renderLists();
        } catch (err) {
            console.error('Error fetching items:', err);
        }
    });


    function renderLists() {

        availableList.innerHTML = '';
        if (availableItems.length === 0) {
            availableList.innerHTML = '<li class="empty-msg">Nessuna opera disponibile.</li>';
        } else {
            availableItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.title}</span> <span class="add-icon">+</span>`;
                li.onclick = () => selectItem(index);
                availableList.appendChild(li);
            });
        }


        selectedList.innerHTML = '';
        if (selectedItems.length === 0) {
            selectedList.innerHTML = '<li class="empty-msg">Nessuna opera selezionata.</li>';
        } else {
            selectedItems.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${item.title}</span> <span class="remove-icon">&times;</span>`;
                li.onclick = () => deselectItem(index);
                selectedList.appendChild(li);
            });
        }
    }

    function selectItem(index) {
        const item = availableItems[index];
        selectedItems.push(item);
        availableItems.splice(index, 1);
        renderLists();
    }

    function deselectItem(index) {
        const item = selectedItems[index];
        availableItems.push(item);
        selectedItems.splice(index, 1);
        renderLists();
    }


    visitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (selectedItems.length === 0) {
            alert('Seleziona almeno un\'opera per la visita.');
            return;
        }

        const formData = new FormData(visitForm);
        const visitData = Object.fromEntries(formData.entries());

        const payload = {
            ...visitData,
            items: selectedItems.map(item => item._id)
        };

        try {
            const response = await fetch('http://localhost:5000/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Visita creata con successo!');
                visitForm.reset();
                selectedItems = [];
                availableItems = [];
                renderLists();
            } else {
                const error = await response.json();
                alert('Errore: ' + error.message);
            }
        } catch (err) {
            console.error(err);
            alert('Errore di connessione al server');
        }
    });
});
