document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }


    const museumsGrid = document.getElementById('museums-grid');
    if (museumsGrid) {
        fetchMuseums();
    }

    async function fetchMuseums() {
        try {

            const response = await fetch('http://localhost:5000/api/museums');
            const museums = await response.json();

            museumsGrid.innerHTML = '';

            if (museums.length === 0) {
                museumsGrid.innerHTML = '<p>Nessun museo trovato.</p>';
                return;
            }

            museums.forEach(museum => {
                const card = document.createElement('div');
                card.className = 'museum-card';


                const description = museum.description || 'Descrizione non disponibile.';

                card.innerHTML = `
                    <h3>${museum.title}</h3>
                    <p class="address">${museum.address || 'Indirizzo non disponibile'}</p>
                    <p class="description">${description}</p>
                    <div class="card-actions">
                        <a href="#" class="btn-card">Visita</a>
                    </div>
                `;
                museumsGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching museums:', error);
            museumsGrid.innerHTML = '<p>Errore nel caricamento dei musei.</p>';
        }
    }
});
