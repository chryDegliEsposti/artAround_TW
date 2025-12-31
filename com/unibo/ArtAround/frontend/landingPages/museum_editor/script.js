document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Museum ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const museumId = urlParams.get('museumId');

    if (!museumId) {
        alert("Nessun ID museo specificato!");
        window.location.href = '../marcketplace/pages/home/home_museum_owner.html';
        return;
    }

    // 2. Initialize Leaflet Map
    const map = L.map('editor-map', {
        preferCanvas: true // Improves performance for vector layers (drawing)
    }).setView([44.494887, 11.342616], 18); // Default to Bologna

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // 3. Initialize Leaflet-Geoman (Drawing Tools)
    map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: false, // Use polygon for rooms
        cutPolygon: false,
    });

    // Customize Geoman to match our "Tools" buttons
    // We can programmatically trigger draw modes:
    // map.pm.enableDraw('Polygon', { snappable: true, snapDistance: 20 });

    // 4. Fetch Museum Data to center map
    fetchMuseumData(museumId, map);

    // 5. Tool Button Logic
    setupTools(map);

    // 6. Handle Drawing Events
    setupDrawingEvents(map);
});

// State to track current drawing type
let currentDrawType = null;
let currentEditingLayer = null;

// UI Elements
const propertiesPanel = document.getElementById('properties-panel');
const propTitleInput = document.getElementById('prop-title');
const savePropBtn = document.getElementById('save-prop-btn');
const cancelPropBtn = document.getElementById('cancel-prop-btn');

async function fetchMuseumData(id, map) {
    try {
        const response = await fetch(`http://localhost:5000/api/museums/${id}`);
        if (!response.ok) throw new Error("Errore nel recupero dei dati del museo");

        const museum = await response.json();

        if (museum.location && museum.location.coordinates) {
            // MongoDB GeoJSON is [lon, lat], Leaflet wants [lat, lon]
            const [lon, lat] = museum.location.coordinates;
            map.setView([lat, lon], 19);

            // Add a marker to show the museum center (optional, helpful for context)
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${museum.title}</b><br>Centro del museo`)
                .openPopup();
        } else if (museum.lat && museum.lon) {
            map.setView([museum.lat, museum.lon], 19);
        } else {
            alert("Il museo non ha coordinate salvate. Usa la mappa per cercarlo.");
        }
    } catch (e) {
        console.error("Error fetching museum:", e);
        alert("Impossibile caricare i dati del museo.");
    }
}

function setupTools(map) {
    // Helper to set active tool
    const setTool = (type, mode, options = {}) => {
        currentDrawType = type;
        map.pm.enableDraw(mode, options);
        updateStatus(`Disegno selezionato: ${type}`);
    };

    document.getElementById('tool-wall').addEventListener('click', () => setTool('wall', 'Line', { snappable: true }));
    document.getElementById('tool-room').addEventListener('click', () => setTool('room', 'Polygon', { snappable: true }));

    document.getElementById('tool-door-entry').addEventListener('click', () =>
        setTool('door-entry', 'Marker', { markerStyle: { icon: getDoorIcon('green') } })
    );

    document.getElementById('tool-door-exit').addEventListener('click', () =>
        setTool('door-exit', 'Marker', { markerStyle: { icon: getDoorIcon('red') } })
    );

    document.getElementById('tool-door-both').addEventListener('click', () =>
        setTool('door-both', 'Marker', { markerStyle: { icon: getDoorIcon('orange') } })
    );

    document.getElementById('tool-item').addEventListener('click', () => {
        // Items might need a specific icon, for now default
        setTool('item', 'Marker');
    });

    document.getElementById('tool-poi').addEventListener('click', () => {
        setTool('poi', 'Marker');
    });
}

function setupDrawingEvents(map) {
    map.on('pm:create', (e) => {
        const layer = e.layer;
        const type = currentDrawType;

        // Reset current draw type loop (optional, or keep drawing)
        // map.pm.disableDraw(); // Start with single draw per click for clarity?

        // Prepare Layer Data
        layer.elementData = {
            type: type || 'custom',
            title: '', // Pending input
            created_at: new Date().toISOString()
        };

        // If it's an Item or POI, show properties panel
        if (type === 'item' || type === 'poi') {
            showPropertiesPanel(layer);
        } else {
            // Auto-name others if needed or just leave blank
            if (type === 'room') layer.bindTooltip("Stanza", { permanent: true, direction: 'center' });
        }
    });

    // Save Button Logic
    savePropBtn.addEventListener('click', () => {
        if (currentEditingLayer) {
            const title = propTitleInput.value;
            if (title) {
                currentEditingLayer.elementData.title = title;

                // Visual Indicator
                if (currentEditingLayer instanceof L.Marker) {
                    currentEditingLayer.bindTooltip(title, { permanent: true, direction: 'top', offset: [0, -20] }).openTooltip();
                } else {
                    currentEditingLayer.bindTooltip(title, { sticky: true });
                }

                hidePropertiesPanel();
            } else {
                alert("Inserisci un titolo.");
            }
        }
    });

    // Cancel Button Logic (removes layer if it was just created)
    cancelPropBtn.addEventListener('click', () => {
        if (currentEditingLayer) {
            // Remove the layer if we cancel creation?
            // Or just hide panel? User requested "insert ... appear card". 
            // Better to remove layer to avoid unnamed ghosts.
            map.removeLayer(currentEditingLayer);
            hidePropertiesPanel();
        }
    });
}

function showPropertiesPanel(layer) {
    currentEditingLayer = layer;
    propTitleInput.value = ''; // Reset
    propTitleInput.focus();
    propertiesPanel.style.display = 'block';
    updateStatus("Inserisci i dettagli dell'elemento.");
}

function hidePropertiesPanel() {
    propertiesPanel.style.display = 'none';
    currentEditingLayer = null;
    updateStatus("Seleziona uno strumento o clicca sulla mappa.");
}

function updateStatus(text) {
    const statusEl = document.getElementById('status-text');
    if (statusEl) statusEl.textContent = text;
}

function getDoorIcon(color) {
    // Placeholder, using default but ideally colorized
    // For now, we can use CSS classes on divIcon if we had them, or just default.
    // Let's create a simple colored divIcon for Doors.
    /*
    return L.divIcon({
        className: 'custom-door-icon',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`
    });
    */
    // Simple fallback for now
    return new L.Icon.Default();
}
