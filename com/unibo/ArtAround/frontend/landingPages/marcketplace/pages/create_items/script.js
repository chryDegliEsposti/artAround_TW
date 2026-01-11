document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const museumId = urlParams.get('museumId');
    const itemsContainer = document.querySelector('.content');

    if (!museumId) {
        alert("Nessun ID museo specificato");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/items?museumId=${museumId}`);
        const items = await response.json();

        itemsContainer.innerHTML = '';
        if (items.length === 0) {
            itemsContainer.innerHTML = '<p>Nessun oggetto trovato per questo museo.</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'items-list';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-card';
            itemDiv.style.border = '1px solid #444';
            itemDiv.style.padding = '15px';
            itemDiv.style.margin = '15px 0';
            itemDiv.style.borderRadius = '8px';
            itemDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';

            // Author input if missing
            const authorVal = item.authorName || ''; // Assuming authorName was stored or we need to fetch author

            let fieldsHtml = '<div class="descriptions-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top:10px;">';

            const complexities = ['easy', 'medium', 'hard'];
            const lengths = ['short', 'medium', 'long'];

            lengths.forEach(len => {
                complexities.forEach(comp => {
                    const key = `description_${len}_${comp}`;
                    const val = item[key] || '';
                    fieldsHtml += `
                        <div class="desc-field">
                            <label style="font-size:0.8em; color:#aaa;">${len} - ${comp}</label>
                            <textarea id="${key}-${item._id}" class="desc-input" rows="4" style="width:100%; background:#222; color:#fff; border:1px solid #555;">${val}</textarea>
                        </div>
                    `;
                });
            });
            fieldsHtml += '</div>';

            itemDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0">${item.title}</h3>
                    <span style="font-size:0.9em; color:#ccc;">${item.locationCode} (P.${item.floor})</span>
                </div>
                
                <div style="margin-top:10px;">
                    <label>Autore (per AI):</label>
                    <input type="text" id="author-${item._id}" value="${authorVal}" style="background:#222; color:#fff; border:1px solid #555; padding:5px;">
                </div>

                ${fieldsHtml}

                <div class="actions" style="margin-top:15px; display:flex; gap:10px;">
                    <button class="btn-generate-ai" data-id="${item._id}" style="padding: 8px 15px; cursor: pointer; background:#6c5ce7; color:white; border:none; border-radius:4px;">Genera Descrizioni AI</button>
                    <button class="btn-save-item" data-id="${item._id}" style="padding: 8px 15px; cursor: pointer; background:#00b894; color:white; border:none; border-radius:4px;">Salva Modifiche</button>
                </div>
            `;
            list.appendChild(itemDiv);
        });

        itemsContainer.appendChild(list);

        // --- Logic Handlers ---

        // 1. Generate AI
        document.querySelectorAll('.btn-generate-ai').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                const authorInput = document.getElementById(`author-${itemId}`);
                const author = authorInput ? authorInput.value : '';

                // Find title from the item object or DOM? 
                // We have items array in closure, let's find it.
                const itemObj = items.find(i => i._id === itemId);
                if (!itemObj) return;

                e.target.innerText = "Generazione...";
                e.target.disabled = true;

                try {
                    const response = await fetch(`http://localhost:5000/api/ai/generate_item_descriptions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: itemObj.title,
                            author: author
                        })
                    });

                    if (response.ok) {
                        const descriptions = await response.json();
                        // Populate textareas
                        Object.keys(descriptions).forEach(key => {
                            const textarea = document.getElementById(`${key}-${itemId}`);
                            if (textarea) textarea.value = descriptions[key];
                        });
                        alert("Descrizioni generate! Ricordati di salvare.");
                    } else {
                        throw new Error("Errore API AI");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Errore generazione: " + err.message);
                } finally {
                    e.target.innerText = "Genera Descrizioni AI";
                    e.target.disabled = false;
                }
            });
        });

        // 2. Save Item
        document.querySelectorAll('.btn-save-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                const authorInput = document.getElementById(`author-${itemId}`);

                // Collect all description fields
                const updateData = {
                    authorName: authorInput ? authorInput.value : ''
                };

                const complexities = ['easy', 'medium', 'hard'];
                const lengths = ['short', 'medium', 'long'];
                lengths.forEach(len => {
                    complexities.forEach(comp => {
                        const key = `description_${len}_${comp}`;
                        const textarea = document.getElementById(`${key}-${itemId}`);
                        if (textarea) updateData[key] = textarea.value;
                    });
                });

                e.target.innerText = "Salvataggio...";
                e.target.disabled = true;

                try {
                    const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                    });

                    if (response.ok) {
                        alert("Oggetto salvato con successo!");
                    } else {
                        throw new Error("Errore salvataggio");
                    }
                } catch (err) {
                    console.error(err);
                    alert("Errore salvataggio: " + err.message);
                } finally {
                    e.target.innerText = "Salva Modifiche";
                    e.target.disabled = false;
                }
            });
        });

    } catch (error) {
        console.error(error);
        itemsContainer.innerHTML = `<p>Errore nel caricamento degli oggetti: ${error.message}</p>`;
    }
});
