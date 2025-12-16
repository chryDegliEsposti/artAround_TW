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
            const data = await response.json();
            const museums = data.museums;

            console.log(museums);

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



    // --- STEP NAVIGATION ---
    const step1 = document.getElementById('modal-step-1');
    const step2 = document.getElementById('modal-step-2');
    const btnNext = document.getElementById('btn-next-step');
    const btnPrev = document.getElementById('btn-prev-step');

    btnNext.onclick = () => {
        if (!document.getElementById('item-title').value) {
            alert('Inserisci il titolo dell\'opera.');
            return;
        }
        step1.style.display = 'none';
        step2.style.display = 'block';
    };

    btnPrev.onclick = () => {
        step2.style.display = 'none';
        step1.style.display = 'block';
    };

    addItemBtn.onclick = () => {
        modal.style.display = "block";
        // Reset steps
        step1.style.display = 'block';
        step2.style.display = 'none';
        itemForm.reset();
    };


    // --- AUTHOR AUTOCOMPLETE & AI ---
    const authorInput = document.getElementById('item-author');
    const authorSuggestions = document.getElementById('author-suggestions');
    const generateAuthorAiCheckbox = document.getElementById('generate-author-ai');
    const authorDescShort = document.getElementById('author-desc-short');
    const authorDescLong = document.getElementById('author-desc-long');

    let authorDebounceTimer;

    authorInput.addEventListener('input', function () {
        const query = this.value;
        clearTimeout(authorDebounceTimer);

        if (query.length < 2) {
            authorSuggestions.style.display = 'none';
            return;
        }

        authorDebounceTimer = setTimeout(async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/authors?q=${query}`);
                const authors = await response.json();

                authorSuggestions.innerHTML = '';
                if (authors.length > 0) {
                    authors.forEach(author => {
                        const li = document.createElement('li');
                        li.textContent = author.name;
                        li.onclick = () => {
                            authorInput.value = author.name;
                            // Populate descriptions if available
                            authorDescShort.value = author.descriptionShort || '';
                            authorDescLong.value = author.descriptionLong || '';
                            authorSuggestions.style.display = 'none';
                        };
                        authorSuggestions.appendChild(li);
                    });
                    authorSuggestions.style.display = 'block';
                } else {
                    authorSuggestions.style.display = 'none';
                }
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        }, 300);
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
        if (e.target !== authorInput && !authorSuggestions.contains(e.target)) {
            authorSuggestions.style.display = 'none';
        }
    });

    // AI Generation for Author
    generateAuthorAiCheckbox.addEventListener('change', async (e) => {
        if (e.target.checked) {
            const authorName = authorInput.value;
            if (!authorName) {
                alert('Inserisci il nome dell\'autore prima di generare.');
                e.target.checked = false;
                return;
            }

            try {
                authorDescShort.placeholder = "Generazione in corso...";
                authorDescLong.placeholder = "Generazione in corso...";

                const response = await fetch(`http://localhost:5000/api/ai/generate_author_description/${encodeURIComponent(authorName)}`);
                const data = await response.json();

                if (data) {
                    authorDescShort.value = data.descriptionShort || '';
                    authorDescLong.value = data.descriptionLong || '';
                }
            } catch (error) {
                console.error("AI Error:", error);
                alert("Errore nella generazione AI.");
            } finally {
                authorDescShort.placeholder = "";
                authorDescLong.placeholder = "";
            }
        }
    });

    // AI Generation for Item Descriptions
    const generateItemAiBtn = document.getElementById('generate-descriptions-ai-btn');
    generateItemAiBtn.onclick = async () => {
        const itemTitle = document.getElementById('item-title').value;
        // Author might be in the second step, but we try to get it if available, or ask user.
        // Since the UI splits them, maybe we can peek at the second step input or just send what we have.
        // Actually, the user fills Author in Step 2. So at Step 1, Author is unknown if we strictly follow order.
        // Let's try to generate with just Title. The prompt handles "unknown" author.

        if (!itemTitle) {
            alert('Inserisci almeno il titolo per generare le descrizioni.');
            return;
        }

        const authorName = document.getElementById('item-author').value; // Might be empty

        try {
            // Set placeholders
            const levels = ['easy', 'medium', 'hard'];
            const lengths = ['short', 'medium', 'long'];
            levels.forEach(lvl => {
                lengths.forEach(len => {
                    const id = `desc_${len}_${lvl}`;
                    document.getElementById(id).placeholder = "Generazione in corso...";
                    document.getElementById(id).value = "";
                });
            });

            const response = await fetch('http://localhost:5000/api/ai/generate_item_descriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: itemTitle, author: authorName })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const descriptions = await response.json();

            // Fill textareas
            Object.keys(descriptions).forEach(key => {
                // key format: description_short_easy -> we id: desc_short_easy
                // need to map keys if they differ. 
                // key: description_short_easy. ID: desc_short_easy.
                const id = key.replace('description_', 'desc_');
                const element = document.getElementById(id);
                if (element) {
                    element.value = descriptions[key];
                }
            });

        } catch (error) {
            console.error("AI Generation Error:", error);
            alert("Errore nella generazione delle descrizioni.");
        } finally {
            // Clear placeholders
            const levels = ['easy', 'medium', 'hard'];
            const lengths = ['short', 'medium', 'long'];
            levels.forEach(lvl => {
                lengths.forEach(len => {
                    const id = `desc_${len}_${lvl}`;
                    document.getElementById(id).placeholder = "";
                });
            });
        }
    };


    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Collect 9 descriptions
        const descriptions = {};
        const levels = ['easy', 'medium', 'hard'];
        const lengths = ['short', 'medium', 'long'];

        levels.forEach(lvl => {
            lengths.forEach(len => {
                const id = `desc_${len}_${lvl}`;
                descriptions[`description_${len}_${lvl}`] = document.getElementById(id).value;
            });
        });

        const authorData = {
            name: authorInput.value,
            descriptionShort: authorDescShort.value,
            descriptionLong: authorDescLong.value
        };

        const newItem = {
            title: document.getElementById('item-title').value,
            authorName: authorData.name,
            authorDescriptionShort: authorData.descriptionShort, // Pass these to backend to update/create author
            authorDescriptionLong: authorData.descriptionLong,
            ...descriptions
        };

        items.push(newItem);
        renderItems();

        itemForm.reset();
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
