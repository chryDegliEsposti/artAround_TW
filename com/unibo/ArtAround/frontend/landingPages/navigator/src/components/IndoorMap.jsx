import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, Polygon, Polyline, Marker, Popup, Tooltip, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from 'react-bootstrap';

// Fix for icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function RecenterAutomatically({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.setView([lat, lng], 19);
        }
    }, [lat, lng, map]);
    return null;
}

// Helper to fit bounds
function BoundsFitter({ data }) {
    const map = useMap();
    useEffect(() => {
        if (!data || data.length === 0) return;

        console.log("BoundsFitter running with", data.length, "elements");
        const latLngs = [];

        data.forEach(el => {
            if (Array.isArray(el.coordinates)) {
                if (Array.isArray(el.coordinates[0])) {
                    // Polygon/Line
                    el.coordinates.forEach(pt => {
                        if (Array.isArray(pt)) latLngs.push(pt);
                    });
                } else {
                    // Point
                    latLngs.push(el.coordinates);
                }
            } else if (el.coordinates && el.coordinates.lat) {
                latLngs.push([el.coordinates.lat, el.coordinates.lon]);
            }
        });

        if (latLngs.length > 0) {
            const bounds = L.latLngBounds(latLngs);
            console.log("Fitting bounds to:", bounds.toBBoxString());
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [data, map]);
    return null;
}

function IndoorMap({ museum, onBack }) {
    const [items, setItems] = useState([]);
    const [mapElements, setMapElements] = useState([]);
    const [activeLayer, setActiveLayer] = useState(0);

    const museumLat = museum.location?.coordinates?.[1] || 0;
    const museumLng = museum.location?.coordinates?.[0] || 0;

    useEffect(() => {
        fetch(`http://localhost:5000/api/items?museumId=${museum._id}`)
            .then(res => res.json())
            .then(data => setItems(data))
            .catch(err => console.error(err));

        if (museum.mapData) {
            console.log("Setting map elements:", museum.mapData);
            setMapElements(museum.mapData);
        }
    }, [museum]);

    // Extract unique layers (floors)
    const layers = [...new Set(mapElements.map(el => el.layer || 0))].sort((a, b) => a - b);
    if (layers.length === 0) layers.push(0);

    // Simulated User Location (fixed for now, inside first room or center)
    // We'll just use the museum center slightly offset for demo
    const userLocation = [museumLat + 0.0001, museumLng + 0.0001];

    const visibleElements = mapElements.filter(el => (el.layer || 0) === activeLayer);
    const visibleItems = items.filter(item => (item.floor || 0) === activeLayer);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', background: '#000000' }}>
            <Button
                variant="light"
                onClick={onBack}
                style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}
            >
                Esci dalla Mappa
            </Button>

            <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000, background: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Piano:</span>
                {layers.map(layerId => (
                    <Button
                        key={layerId}
                        size="sm"
                        variant={activeLayer === layerId ? "primary" : "outline-dark"}
                        onClick={() => setActiveLayer(layerId)}
                    >
                        {layerId}
                    </Button>
                ))}
            </div>

            <MapContainer
                center={[museumLat, museumLng]}
                zoom={19}
                style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
                scrollWheelZoom={true}
            >
                <RecenterAutomatically lat={museumLat} lng={museumLng} />
                <BoundsFitter data={mapElements} />

                {/* User Location Marker */}
                <Marker position={userLocation}>
                    <Popup>Tu sei qui</Popup>
                    <Tooltip permanent direction="top" offset={[0, -20]} opacity={0.8}>Tu</Tooltip>
                </Marker>

                {/* Always show Museum Center to ensure seeing SOMETHING */}
                <Marker position={[museumLat, museumLng]}>
                    <Popup>Centro Museo (Geo)</Popup>
                </Marker>

                {visibleElements.map((el, idx) => {
                    if (!el.coordinates) return null;

                    if (el.type === 'room') {
                        return <Polygon key={idx} positions={el.coordinates} pathOptions={{ color: '#9d00ff', weight: 2, fillColor: '#9d00ff', fillOpacity: 0.2 }} />
                    }
                    if (el.type === 'wall') {
                        return <Polyline key={idx} positions={el.coordinates} pathOptions={{ color: '#00FF00', weight: 4, opacity: 0.8 }} />
                    }
                    if (el.type.startsWith('door')) {
                        const lat = el.coordinates.lat ?? el.coordinates[0];
                        const lng = el.coordinates.lon ?? el.coordinates[1];
                        if (isNaN(lat)) return null;
                        return <Marker key={idx} position={[lat, lng]} />;
                    }
                    return null;
                })}

                {visibleItems.map(item => (
                    <Marker
                        key={item._id}
                        position={[item.location.coordinates[1], item.location.coordinates[0]]}
                    >
                        <Popup>
                            <strong>{item.title}</strong>
                            <p>{item.description_short_easy || "..."}</p>
                        </Popup>
                    </Marker>
                ))}

            </MapContainer>
        </div>
    );
}

export default IndoorMap;
