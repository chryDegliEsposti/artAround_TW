const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const floorInput = document.getElementById('floor-input');
    const floorUpBtn = document.getElementById('floor-up');
    const floorDownBtn = document.getElementById('floor-down');
    const rangeSlider = document.getElementById('range-slider');
    const rangeValue = document.getElementById('range-value');
    const scanBtn = document.getElementById('scan-btn');
    const itemsList = document.getElementById('items-list');
    const statusMsg = document.getElementById('status-msg');

    // Values
    let currentFloor = 0;
    let currentRange = 20;

    // --- Event Listeners ---

    floorUpBtn.addEventListener('click', () => {
        currentFloor++;
        updateControls();
    });

    floorDownBtn.addEventListener('click', () => {
        if (currentFloor > -5) currentFloor--; // Arbitrary min floor
        updateControls();
    });

    rangeSlider.addEventListener('input', (e) => {
        currentRange = e.target.value;
        rangeValue.textContent = currentRange;
    });

    scanBtn.addEventListener('click', handleScan);

    function updateControls() {
        floorInput.value = currentFloor;
    }

    // --- Main Logic ---

    async function handleScan() {
        setLoading(true);
        setStatus('Acquisizione posizione...', 'normal');
        itemsList.innerHTML = ''; // Clear previous

        if (!navigator.geolocation) {
            setStatus('Geolocalizzazione non supportata dal tuo browser.', 'error');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setStatus(`Posizione: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, 'success');

                try {
                    await fetchAndRenderItems(latitude, longitude);
                } catch (err) {
                    console.error(err);
                    setStatus('Errore nel recupero delle opere.', 'error');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geo Error:", error);

                // FALLBACK FOR DEV/TESTING (If inside a building GPS might fail)
                // Remove or comment out for production
                console.warn("Using fallback location for testing");
                const fallbackLat = 45.4642; // Example Milan
                const fallbackLon = 9.1900;
                setStatus(`GPS Fallito. Uso posizione test: ${fallbackLat}, ${fallbackLon}`, 'error');

                fetchAndRenderItems(fallbackLat, fallbackLon).then(() => setLoading(false));
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    async function fetchAndRenderItems(lat, lon) {
        const url = `${API_BASE_URL}/nav/items?lat=${lat}&lon=${lon}&floor=${currentFloor}&range=${currentRange}&limit=20`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Request failed');

        const items = await response.json();

        if (items.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ghost"></i>
                    <p>Nessuna opera trovata a questo piano nel raggio di ${currentRange}m.</p>
                </div>`;
            return;
        }

        renderItems(items);
    }

    function renderItems(items) {
        itemsList.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';

            // Calculate distance if not provided by backend (backend uses $near so they are sorted)
            // But raw distance isn't always in the response unless aggregated. 
            // We can just show them in order.

            card.innerHTML = `
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p class="author">Autore sconosciuto</p> <!-- Author name needs populate if not present -->
                </div>
                <div class="item-distance">
                    <i class="fas fa-map-marker-alt"></i> Vicino
                </div>
            `;

            card.addEventListener('click', () => openModal(item));
            itemsList.appendChild(card);
        });
    }

    // --- Modal Logic ---
    const modal = document.getElementById('item-modal');
    const closeModal = document.querySelector('.close-modal');

    function openModal(item) {
        document.getElementById('modal-title').textContent = item.title;
        // document.getElementById('modal-author').textContent = item.author?.name || '...';
        document.getElementById('modal-desc').textContent = item.description_short_easy || item.description || "Nessuna descrizione.";

        modal.style.display = "block";
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // --- Helpers ---
    function setStatus(msg, type) {
        statusMsg.textContent = msg;
        statusMsg.className = 'status-msg'; // reset
        if (type === 'error') statusMsg.classList.add('status-error');
        if (type === 'success') statusMsg.classList.add('status-success');
    }

    function setLoading(isLoading) {
        scanBtn.disabled = isLoading;
        if (isLoading) {
            scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scansione in corso...';
        } else {
            scanBtn.innerHTML = '<i class="fas fa-radar"></i> Scansiona Dintorni';
        }
    }
});