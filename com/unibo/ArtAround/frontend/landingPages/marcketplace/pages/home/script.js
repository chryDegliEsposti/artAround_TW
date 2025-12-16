document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }



    const museumsGrid = document.getElementById('museums-grid');
    const paginationControls = document.getElementById('pagination-controls');
    let currentPage = 1;
    const limit = 30;

    if (museumsGrid) {
        fetchMuseums(currentPage);
    }

    async function fetchMuseums(page) {
        try {
            const response = await fetch(`http://localhost:5000/api/museums?page=${page}&limit=${limit}`);
            const data = await response.json();

            const museums = data.museums;
            const totalPages = data.totalPages;

            museumsGrid.innerHTML = '';

            if (museums.length === 0) {
                museumsGrid.innerHTML = '<p>Nessun museo trovato.</p>';
                paginationControls.innerHTML = '';
                return;
            }

            museums.forEach(museum => {
                const card = document.createElement('div');
                card.className = 'museum-card';


                const description = museum.description || 'Descrizione non disponibile.';

                let imageHtml = '';
                if (museum.imageLink) {
                    imageHtml = `<img src="${museum.imageLink}" alt="${museum.title}" class="museum-image">`;
                }

                card.innerHTML = `
                    ${imageHtml}
                    <h3>${museum.title}</h3>
                    <p class="address">${museum.address || 'Indirizzo non disponibile'}</p>
                    <p class="description">${description}</p>
                    <div class="card-actions">
                        <a href="#" class="btn-card">Visita</a>
                    </div>
                `;
                museumsGrid.appendChild(card);
            });

            renderPagination(page, totalPages);

            // Scroll to top of grid
            document.querySelector('main').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('Error fetching museums:', error);
            museumsGrid.innerHTML = '<p>Errore nel caricamento dei musei.</p>';
        }
    }

    function renderPagination(page, totalPages) {
        paginationControls.innerHTML = '';

        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.innerText = 'Precedente';
        prevBtn.disabled = page === 1;
        prevBtn.className = 'btn-pagination';
        prevBtn.onclick = () => {
            if (page > 1) {
                currentPage = page - 1;
                fetchMuseums(currentPage);
            }
        };

        const nextBtn = document.createElement('button');
        nextBtn.innerText = 'Successiva';
        nextBtn.disabled = page === totalPages;
        nextBtn.className = 'btn-pagination';
        nextBtn.onclick = () => {
            if (page < totalPages) {
                currentPage = page + 1;
                fetchMuseums(currentPage);
            }
        };

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.innerText = `Pagina ${page} di ${totalPages}`;

        paginationControls.appendChild(prevBtn);
        paginationControls.appendChild(pageInfo);
        paginationControls.appendChild(nextBtn);
    }
});
