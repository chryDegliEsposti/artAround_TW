import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DetailsCard from '../components/DetailsCard';
import SearchBar from '../components/SearchBar'; // [NEW]
import IndoorMap from '../components/IndoorMap'; // [NEW]

let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow });
L.Marker.prototype.options.icon = DefaultIcon;

function NavigatorHome() {
    const position = [44.4949, 11.3426]; // Coordinate di esempio (Bologna)
    const [selectedMuseum, setSelectedMuseum] = useState(null);

    const handleSelectMuseum = (museum) => {
        console.log("Selected museum:", museum);
        // If museum has mapData, we switch to indoor view.
        // We might need to ensure we have the FULL museum object including mapData.
        // SearchBar fetches limited data? No, MuseumsAPI GET / returns full objects usually.
        // Check if mapData is present.
        if (museum.mapData && museum.mapData.length > 0) {
            setSelectedMuseum(museum);
        } else {
            // For now, if no map data, maybe just fly to it on map? 
            // User requested: "se l'utente preme su un museo in cui è presente la mappa... metti la mappa salvata... senza la mappa sotto"
            // If no map data, logic is undefined by user request, but standard behavior implies flying to it.
            // Let's implement active selection but maybe keep tile map?
            // Actually, if selectedMuseum is set, we render IndoorMap.
            // So if no mapData, we shouldn't set it as "Indoor selection".
            alert("Questo museo non ha una planimetria digitale.");
        }
    };

    if (selectedMuseum) {
        return (
            <IndoorMap
                museum={selectedMuseum}
                onBack={() => setSelectedMuseum(null)}
            />
        );
    }

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>

            <SearchBar onSelect={handleSelectMuseum} />

            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <DetailsCard />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={position}>
                    <Popup>La tua posizione attuale</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default NavigatorHome;