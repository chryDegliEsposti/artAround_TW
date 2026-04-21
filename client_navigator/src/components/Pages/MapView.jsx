import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { Navigation, Star, MapPin, Landmark } from 'lucide-react';
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
  { id: 1, name: "City Art Museum", lat: 45.4642, lng: 9.1900, rating: 4.8, img: "https://images.unsplash.com/photo-1597910037310-7dd8dd393e48?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Science Center", lat: 45.4655, lng: 9.1850, rating: 4.6, img: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Natural History Museum", lat: 45.4741, lng: 9.2018, rating: 4.9, img: "https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=400" }
];

const createLocationIcon = (heading) => {
  return L.divIcon({
    className: 'custom-location-marker',
    html: `
      <div class="location-beacon" style="transform: rotate(${heading || 0}deg)">
        ${heading !== null ? '<div class="beacon-arrow"></div>' : ''}
        <div class="beacon-core"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function LocationMarker({ position, heading }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 0.5 });
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position} icon={createLocationIcon(heading)}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapView() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [heading, setHeading] = useState(null);
  const [showScroller, setShowScroller] = useState(true);
  const dragStartY = useRef(null);

  const [liveMuseums, setLiveMuseums] = useState(mockMuseums);

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        const response = await fetch('/api/v1/navigator/museums/get');
        const data = await response.json();
        if (data && data.length > 0) {
          setLiveMuseums(data);
        } else {
          setLiveMuseums(mockMuseums);
        }
      } catch (error) {
        setLiveMuseums(mockMuseums);
      }
    };
    fetchMuseums();
  }, []);

  const filteredMuseums = liveMuseums.filter(museum =>
    museum.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          if (pos.coords.heading !== null && pos.coords.heading !== NaN) {
            setHeading(pos.coords.heading);
          }
        },
        (err) => {
          console.warn(err.message);
          setPosition(prev => prev || { lat: 45.4642, lng: 9.1900 });
          setError("Could not get exact location. Using fallback.");
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setPosition({ lat: 45.4642, lng: 9.1900 });
      setError("Geolocation is not supported by your browser");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (e.target.closest('.scroller-pull-handle')) {
      dragStartY.current = e.clientY;
      // Prevent Leaflet from panning if we touched the handle
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - e.clientY;
    dragStartY.current = null;

    if (Math.abs(deltaY) > 30) {
      if (deltaY < -30) setShowScroller(false); // swipe down
      if (deltaY > 30) setShowScroller(true);   // swipe up
    } else if (e.target.closest('.scroller-pull-handle')) {
      // Tap toggle
      setShowScroller(!showScroller);
    }
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!position) {
    return <div className="map-loading">Loading Map...</div>;
  }

  return (
    <div className="map-wrapper fade-in">
      <div className="map-controls-overlay">
        <SearchBar onSearch={setSearchTerm} />
      </div>

      {error && <div className="map-error-banner">{error}</div>}

      <div className="main-map-container">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="leaflet-map-container"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          <LocationMarker position={position} heading={heading} />

          {filteredMuseums.map((museum) => (
            <Marker key={museum.id} position={[museum.lat, museum.lng]}>
              <Popup>
                <div className="museum-popup">
                  <h4>{museum.name}</h4>
                  <div className="popup-meta">
                    <Star size={14} className="star-icon" fill="currentColor" />
                    <span>{museum.rating}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/museum/${museum.id}`)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <Landmark size={14} /> Explore
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openGoogleMaps(museum.lat, museum.lng)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <Navigation size={14} /> Go
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modern Swipeable Scrolling Museum List */}
      <div 
        className={`museums-scroller-container ${showScroller ? '' : 'collapsed'}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div className="scroller-pull-handle">
          <div className="pull-indicator"></div>
        </div>
        <div className="scroller-content">
          <div className="scroller-header">
            <h3>Popular Nearby</h3>
            <span className="scroller-subtitle">Find your next visit</span>
          </div>
          <div className="museum-horizontal-list">
            {liveMuseums.map(museum => (
              <div 
                key={museum.id} 
                className="museum-card-horizontal slide-in-bottom"
                onClick={() => navigate(`/museum/${museum.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="museum-card-image">
                  <img src={museum.img} alt={museum.name} />
                  <div className="museum-card-rating">
                    <Star size={12} fill="currentColor" />
                    {museum.rating}
                  </div>
                </div>
                <div className="museum-card-info">
                  <h4>{museum.name}</h4>
                  <div className="museum-card-meta">
                    <MapPin size={12} />
                    <span>0.8 km away</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
