// Global State
let map;
let layers = {}; // Store L.FeatureGroup for each floor: { 0: fg, 1: fg }
let currentLayerId = 0;

// State to track current drawing type
let currentDrawType = null;
let currentEditingLayer = null;

// UI Elements
const propertiesPanel = document.getElementById('properties-panel');
const propTitleInput = document.getElementById('prop-title');
const savePropBtn = document.getElementById('save-prop-btn');
const cancelPropBtn = document.getElementById('cancel-prop-btn');
const layerListContainer = document.getElementById('layer-list');
const addLayerBtn = document.getElementById('add-layer-btn');

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Museum ID
    const urlParams = new URLSearchParams(window.location.search);
    const museumId = urlParams.get('museumId');

    if (!museumId) {
        alert("Nessun ID museo specificato!");
        window.location.href = '../marcketplace/pages/home/home_museum_owner.html';
        return;
    }

    // 2. Initialize Leaflet Map
    map = L.map('editor-map', {
        preferCanvas: true
    }).setView([44.494887, 11.342616], 18);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // 3. Initialize Geoman
    map.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawRectangle: false,
        cutPolygon: false,
    });

    // 4. Initialize First Layer (Ground Floor)
    initLayer(0, "Piano Terra");

    // 5. Fetch Museum Data
    fetchMuseumData(museumId, map);

    // 6. Setup UI and Events
    setupTools(map);
    setupDrawingEvents(map);
    setupLayerControls();
});


// --- Layer Management ---

function initLayer(id, name) {
    // Create FeatureGroup for this layer/floor
    const fg = L.featureGroup();
    layers[id] = {
        group: fg,
        name: name
    };

    // If it's the first one, add to map
    if (id === 0) {
        fg.addTo(map);
        currentLayerId = 0;
    }

    renderLayerList();
}

function switchLayer(id) {
    if (currentLayerId === id) return;

    // Remove old layer from map
    if (layers[currentLayerId]) {
        map.removeLayer(layers[currentLayerId].group);
        // Also remove global draw layer if any? Geoman usually draws on map.
        // We need to make sure newly drawn items go to the new group.
    }

    // Add new layer to map
    if (layers[id]) {
        map.addLayer(layers[id].group);
        currentLayerId = id;
    }

    renderLayerList();
    updateStatus(`Passato a: ${layers[id].name} `);
}

function addLayer() {
    const nextId = Object.keys(layers).length;
    const name = `Piano ${nextId} `; // 1, 2, 3... or "Piano 1"

    initLayer(nextId, name);
    switchLayer(nextId); // Auto-switch to new layer
}

function renderLayerList() {
    layerListContainer.innerHTML = '';

    Object.keys(layers).forEach(key => {
        const id = parseInt(key);
        const layerData = layers[id];

        const div = document.createElement('div');
        div.className = `layer - item ${id === currentLayerId ? 'active' : ''} `;
        div.innerHTML = `${layerData.name} ${id === currentLayerId ? '<i class="fas fa-check"></i>' : ''} `;

        div.addEventListener('click', () => switchLayer(id));
        layerListContainer.appendChild(div);
    });
}

function setupLayerControls() {
    addLayerBtn.addEventListener('click', addLayer);
}


// --- Main Logic ---

async function fetchMuseumData(id, map) {
    try {
        const response = await fetch(`http://localhost:5000/api/museums/${id}`);
        if (!response.ok) throw new Error("Errore nel recupero dei dati museo");
        const museum = await response.json();

        if (museum.location && museum.location.coordinates) {
            const [lon, lat] = museum.location.coordinates;
            // Add a marker to show the museum center (optional, helpful for context)
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${museum.title}</b><br>Centro del museo`)
                .openPopup();

            map.setView([lat, lon], 19);
        } else if (museum.lat && museum.lon) {
            map.setView([museum.lat, museum.lon], 19);
        }
    } catch (e) {
        console.error(e);
    }
}

function setupTools(map) {
    const setTool = (type, mode, options = {}) => {
        currentDrawType = type;
        map.pm.enableDraw(mode, options);
        updateStatus(`Disegno selezionato: ${type}`);
    };

    document.getElementById('tool-wall').addEventListener('click', () => setTool('wall', 'Line', { snappable: true }));
    document.getElementById('tool-room').addEventListener('click', () => setTool('room', 'Polygon', { snappable: true }));

    document.getElementById('tool-door-entry').addEventListener('click', () => setTool('door-entry', 'Marker', { markerStyle: { icon: getDoorIcon('green') } }));
    document.getElementById('tool-door-exit').addEventListener('click', () => setTool('door-exit', 'Marker', { markerStyle: { icon: getDoorIcon('red') } }));
    document.getElementById('tool-door-both').addEventListener('click', () => setTool('door-both', 'Marker', { markerStyle: { icon: getDoorIcon('orange') } }));

    document.getElementById('tool-item').addEventListener('click', () => setTool('item', 'Marker'));
    document.getElementById('tool-poi').addEventListener('click', () => setTool('poi', 'Marker'));

    // Save Map
    document.getElementById('save-map-btn').addEventListener('click', () => {
        const data = collectMapData();
        console.log("MAP JSON DATA:", JSON.stringify(data, null, 2));
        alert("Dati mappa generati in console (F12)");
    });
}

function setupDrawingEvents(map) {
    map.on('pm:create', (e) => {
        const layer = e.layer;
        const type = currentDrawType || 'custom';

        // 1. Move layer to the current FeatureGroup
        // Geoman adds to map by default. We remove from map and add to our group.
        map.removeLayer(layer);
        layers[currentLayerId].group.addLayer(layer);

        // 2. Add Metadata
        layer.elementData = {
            type: type,
            title: '',
            created_at: new Date().toISOString()
        };

        // 3. Show Properties for Items, POIs, AND Rooms
        if (['item', 'poi', 'room'].includes(type)) {
            showPropertiesPanel(layer);
        } else {
            // Walls or generic lines might not need names immediately
            if (type === 'wall') layer.bindTooltip("Muro", { sticky: true });
        }
    });

    savePropBtn.addEventListener('click', () => {
        if (currentEditingLayer) {
            const title = propTitleInput.value;
            if (title) {
                currentEditingLayer.elementData.title = title;

                // Visual feedback
                if (currentEditingLayer instanceof L.Marker) {
                    currentEditingLayer.bindTooltip(title, { permanent: true, direction: 'top', offset: [0, -20] }).openTooltip();
                } else {
                    currentEditingLayer.bindTooltip(title, { permanent: true, direction: 'center' }).openTooltip();
                }
                hidePropertiesPanel();
            } else {
                alert("Inserisci un titolo.");
            }
        }
    });

    cancelPropBtn.addEventListener('click', () => {
        if (currentEditingLayer) {
            // Remove from the group
            layers[currentLayerId].group.removeLayer(currentEditingLayer);
            hidePropertiesPanel();
        }
    });
}

// --- Data Export & Geometry ---

function collectMapData() {
    const exportData = [];

    // Iterate over ALL layers (floors)
    Object.keys(layers).forEach(layerId => {
        const group = layers[layerId].group;
        const rooms = [];
        const items = [];

        // 1. Scan group for Rooms and Items
        group.eachLayer(layer => {
            if (layer instanceof L.Polygon && layer.elementData?.type === 'room') {
                rooms.push(layer);
            }
            if (layer instanceof L.Marker && layer.elementData) {
                items.push(layer);
            }
        });

        // 2. Process Items in this floor
        items.forEach(marker => {
            const latLng = marker.getLatLng();
            let roomName = "museo";

            // Check if inside any room ON THIS FLOOR
            for (const room of rooms) {
                if (isPointInPolygon(latLng, room)) {
                    roomName = room.elementData.title || `Stanza (${layerId})`;
                    break;
                }
            }

            exportData.push({
                type: marker.elementData.type,
                name: marker.elementData.title || `Elemento ${marker.elementData.type}`,
                room: roomName,
                layer: parseInt(layerId), // Add Layer ID
                coordinates: {
                    lat: latLng.lat,
                    lon: latLng.lng
                }
            });
        });

        // Also, if you want to export Rooms themselves or Walls, you would do it here.
        // User asked: "item, POI, entrate e uscite". 
        // Logic handled above covers markers (items, pois, doors).
    });

    return exportData;
}

function isPointInPolygon(latLng, polygon) {
    const pt = [latLng.lat, latLng.lng];
    let latLngs = polygon.getLatLngs();

    // Normalize coordinates
    let vs = [];
    if (Array.isArray(latLngs) && latLngs.length > 0) {
        if (Array.isArray(latLngs[0])) { // Nested [[lat,lng]] or [[LatLng]]
            // Taking outer ring
            const ring = latLngs[0];
            // ring could be array of objects or array of numbers (if GeoJSON)
            // Leaflet usually objects
            vs = ring.map(p => [p.lat, p.lng]);
        } else { // Flat [LatLng]
            vs = latLngs.map(p => [p.lat, p.lng]);
        }
    }

    if (vs.length === 0) return false;

    let x = pt[0], y = pt[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// --- Helpers ---

function showPropertiesPanel(layer) {
    currentEditingLayer = layer;
    propTitleInput.value = '';
    propertiesPanel.style.display = 'block';
    propTitleInput.focus();
    updateStatus(`Inserisci nome per: ${layer.elementData.type}`);
}

function hidePropertiesPanel() {
    propertiesPanel.style.display = 'none';
    currentEditingLayer = null;
    updateStatus("Pronto.");
}

function updateStatus(text) {
    const statusEl = document.getElementById('status-text');
    if (statusEl) statusEl.textContent = text;
}

function getDoorIcon(color) {
    // Simple colored marker logic could go here, for now default
    return new L.Icon.Default();
}