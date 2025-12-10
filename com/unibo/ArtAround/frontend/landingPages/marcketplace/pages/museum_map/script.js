document.addEventListener('DOMContentLoaded', () => {
    let map;
    let markers = [];
    let allMuseums = [];
    let userLocation = null;


    function initMap(lat, lon) {
        map = L.map('miaMappa', {
            zoomControl: false
        }).setView([lat, lon], 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);


        const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="background-color: #677db7; width: 15px; height: 15px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(103, 125, 183, 0.5);"></div>',
            iconSize: [20, 20]
        });
        L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup("Sei qui");


        fetchMuseums(lat, lon);
    }


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
                initMap(userLocation.lat, userLocation.lon);
            },
            (error) => {
                console.error("Geolocation error:", error);

                initMap(45.4642, 9.1900);
            }
        );
    } else {
        initMap(45.4642, 9.1900);
    }


    async function fetchMuseums(lat, lon) {
        try {


            const response = await fetch(`http://localhost:5000/api/museums/nearby?lat=${lat}&lon=${lon}&maxDistance=10000`);
            const museums = await response.json();
            allMuseums = museums;

            renderMarkers(museums);
            renderSidebarList(museums);
        } catch (error) {
            console.error('Error fetching museums:', error);
        }
    }

    function renderMarkers(museums) {

        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        museums.forEach(museum => {
            if (!museum.location || !museum.location.coordinates) return;

            const [lon, lat] = museum.location.coordinates;

            const marker = L.marker([lat, lon]).addTo(map);


            marker.on('click', () => {
                showInfoCard(museum);
                map.setView([lat, lon], 15, { animate: true });
            });

            markers.push(marker);
        });
    }


    const resultsList = document.getElementById('results-list');
    function renderSidebarList(museums) {
        resultsList.innerHTML = '';
        museums.forEach(museum => {
            const li = document.createElement('li');
            li.className = 'result-item';
            li.innerHTML = `
                <h3>${museum.title}</h3>
                <p>${museum.address || 'Indirizzo non disponibile'}</p>
            `;
            li.addEventListener('click', () => {
                const [lon, lat] = museum.location.coordinates;
                map.setView([lat, lon], 16, { animate: true });
                showInfoCard(museum);
            });
            resultsList.appendChild(li);
        });
    }

    const infoCard = document.getElementById('info-card');
    function showInfoCard(museum) {
        const [lon, lat] = museum.location.coordinates;

        document.getElementById('card-title').textContent = museum.title;
        document.getElementById('card-address').textContent = museum.address || 'Indirizzo non disponibile';
        document.getElementById('card-description').textContent = museum.description || 'Descrizione non disponibile.';


        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
        document.getElementById('btn-directions').href = directionsUrl;

        infoCard.style.display = 'block';
    }


    document.querySelector('.close-btn').addEventListener('click', () => {
        infoCard.style.display = 'none';
    });


    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allMuseums.filter(m =>
            m.title.toLowerCase().includes(query) ||
            (m.address && m.address.toLowerCase().includes(query))
        );
        renderSidebarList(filtered);
    });
});
