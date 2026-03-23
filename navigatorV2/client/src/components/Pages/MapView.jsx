import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import L from 'leaflet';
import './MapView.css';
import SearchBar from '../UI/searchBar';

// Fix Leaflet's default icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock nearest museums
const mockMuseums = [
  { id: 1, name: "City Art Museum", lat: 45.4642, lng: 9.1900 },
  { id: 2, name: "Science Center", lat: 45.4655, lng: 9.1850 },
  { id: 3, name: "Natural History Museum", lat: 45.4741, lng: 9.2018 }
];

function LocationMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapView() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMuseums = mockMuseums.filter(museum =>
    museum.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn(err.message);
          // Fallback location (Milan center)
          setPosition({ lat: 45.4642, lng: 9.1900 });
          setError("Could not get your location. Using default map center.");
        }
      );
    } else {
      setPosition({ lat: 45.4642, lng: 9.1900 });
      setError("Geolocation is not supported by your browser");
    }
  }, []);

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!position) {
    return <div className="map-loading">Loading Map...</div>;
  }

  return (
    <div className="map-wrapper fade-in">
      <SearchBar onSearch={setSearchTerm} />
      {error && <div className="map-error-banner">{error}</div>}
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="leaflet-map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} />

        {filteredMuseums.map((museum) => (
          <Marker key={museum.id} position={[museum.lat, museum.lng]}>
            <Popup>
              <div className="museum-popup">
                <h4>{museum.name}</h4>
                <button
                  className="btn btn-primary"
                  onClick={() => openGoogleMaps(museum.lat, museum.lng)}
                >
                  <Navigation size={16} /> Let's Go
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
