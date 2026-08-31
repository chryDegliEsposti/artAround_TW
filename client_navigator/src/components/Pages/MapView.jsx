import { useEffect, useState, useRef, useMemo } from 'react';
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

// Haversine formula for exact distance calculation in kilometers
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm) {
  if (distKm == null || isNaN(distKm)) return "Distanza n/d";
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m di distanza`;
  }
  return `${distKm.toFixed(1)} km di distanza`;
}

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
      <Popup>La tua posizione attuale</Popup>
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

  const [liveMuseums, setLiveMuseums] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchMuseums = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const response = await fetch('/api/v1/navigator/museums/get');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setLiveMuseums(data);
        } else {
          setApiError("Nessun museo trovato nel database.");
        }
      } catch (error) {
        console.error("[MapView] Error fetching museums:", error);
        setApiError("Errore di connessione al server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMuseums();
  }, []);

  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          if (pos.coords.heading !== null && !Number.isNaN(pos.coords.heading)) {
            setHeading(pos.coords.heading);
          }
        },
        (err) => {
          console.warn(err.message);
          // Default to Bologna center if GPS unavailable
          setPosition(prev => prev || { lat: 44.4975, lng: 11.3533 });
          setError("Impossibile ottenere la posizione GPS esatta. Utilizzo coordinate di default.");
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } else {
      setPosition({ lat: 44.4975, lng: 11.3533 });
      setError("Geolocalizzazione non supportata dal browser");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Compute exact real distances and sort by closest
  const museumsWithDistances = useMemo(() => {
    return liveMuseums.map(museum => {
      const dist = position ? getHaversineDistanceKm(position.lat, position.lng, museum.lat, museum.lng) : null;
      return {
        ...museum,
        distanceKm: dist,
        distanceFormatted: formatDistance(dist)
      };
    }).sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [liveMuseums, position]);

  const filteredMuseums = useMemo(() => {
    return museumsWithDistances.filter(museum =>
      museum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (museum.city && museum.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [museumsWithDistances, searchTerm]);

  const handlePointerDown = (e) => {
    if (e.target.closest('.scroller-pull-handle')) {
      dragStartY.current = e.clientY;
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - e.clientY;
    dragStartY.current = null;

    if (Math.abs(deltaY) > 30) {
      if (deltaY < -30) setShowScroller(false);
      if (deltaY > 30) setShowScroller(true);
    } else if (e.target.closest('.scroller-pull-handle')) {
      setShowScroller(!showScroller);
    }
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!position) {
    return <div className="map-loading">Caricamento Mappa e Posizione...</div>;
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
          zoom={14} 
          scrollWheelZoom={true} 
          className="leaflet-map-container"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="bottomright" />
          <LocationMarker position={position} heading={heading} />

          {filteredMuseums.map((museum) => (
            <Marker key={museum.id || museum._id} position={[museum.lat, museum.lng]}>
              <Popup>
                <div className="museum-popup">
                  <h4>{museum.name}</h4>
                  <div className="popup-meta">
                    <Star size={14} className="star-icon" fill="currentColor" />
                    <span>{museum.rating || 4.9}</span>
                    <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: '#666' }}>
                      • {museum.distanceFormatted}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/museum/${museum.id || museum._id}`)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <Landmark size={14} /> Esplora
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => openGoogleMaps(museum.lat, museum.lng)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }}
                    >
                      <Navigation size={14} /> Indicazioni
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Modern Swipeable Scrolling Museum List Sorted by Real Distance */}
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
            <h3>Musei Vicini a Te</h3>
            <span className="scroller-subtitle">Ordinati per distanza reale GPS</span>
          </div>
          <div className="museum-horizontal-list">
            {filteredMuseums.map(museum => (
              <div 
                key={museum.id || museum._id} 
                className="museum-card-horizontal slide-in-bottom"
                onClick={() => navigate(`/museum/${museum.id || museum._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="museum-card-image">
                  <img src={museum.img} alt={museum.name} />
                  <div className="museum-card-rating">
                    <Star size={12} fill="currentColor" />
                    {museum.rating || 4.9}
                  </div>
                </div>
                <div className="museum-card-info">
                  <h4>{museum.name}</h4>
                  <div className="museum-card-meta">
                    <MapPin size={12} />
                    <span>{museum.distanceFormatted}</span>
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
