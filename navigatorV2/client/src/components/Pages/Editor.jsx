import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Tooltip } from 'react-leaflet';
import { Download, Square, Minus, Bath, DoorOpen, Package, Coffee, ArrowLeft, Layers, Plus, Menu, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Editor.css';

// Fix Leaflet's default icon path issues in React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const getIconForType = (type, subType) => {
  let iconHtml = '';
  switch(type) {
    case 'exhibit': 
      iconHtml = '<div class="poi-icon-box exhibit" title="Exhibit">Ex</div>'; 
      break;
    case 'restroom': 
      iconHtml = '<div class="poi-icon-box restroom" title="Restroom">WC</div>'; 
      break;
    case 'restaurant': 
      iconHtml = `<div class="poi-icon-box restaurant" title="Restaurant">
                    ${subType === 'bar' ? 'Bar' : subType === 'restaurant-bar' ? 'R&B' : 'Café'}
                  </div>`; 
      break;
    case 'exit': 
      iconHtml = `<div class="poi-icon-box exit ${subType === 'emergency' ? 'emergency' : ''}" title="Exit">
                    ${subType === 'emergency' ? 'SOS' : 'Exit'}
                  </div>`; 
      break;
    default: 
      iconHtml = '<div class="poi-icon-box default">P</div>';
  }
  return L.divIcon({
    html: iconHtml,
    className: 'custom-poi-icon-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function ClickCatcher({ mode, onMapClick, center }) {
  const map = useMapEvents({
    click(e) {
      if (mode !== 'none') {
        // Project to a high zoom level (22) for pixel accuracy on a generic flat plane (like Canvas)
        const centerPoint = map.project(center, 22);
        const clickPoint = map.project(e.latlng, 22);
        
        // Calculate the absolute X/Y distance from the center in abstract pixel "units"
        // This makes it extremely easy to reproduce entirely outside of Leaflet
        const x = clickPoint.x - centerPoint.x;
        const y = clickPoint.y - centerPoint.y;

        onMapClick(e.latlng, { x, y });
      }
    },
  });
  return null;
}

const EXHIBIT_NAMES = [
  "Mona Lisa",
  "David",
  "Rosetta Stone",
  "The Starry Night",
  "Venus de Milo",
  "Sistine Chapel Ceiling",
  "Girl with a Pearl Earring"
];

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // Default to Metropolitan Museum of Art or provided params
  const lat = parseFloat(searchParams.get('lat')) || 40.77943;
  const lng = parseFloat(searchParams.get('lng')) || -73.96324;
  const [center] = useState([lat, lng]);

  const [mode, setMode] = useState('none');
  const [currentLine, setCurrentLine] = useState([]);
  const [lines, setLines] = useState([]);
  const [pois, setPois] = useState([]);

  // Layer Management
  const [layers, setLayers] = useState([{ id: 1, name: 'Layer 1' }]);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  // Sub-type selections
  const [selectedExhibitName, setSelectedExhibitName] = useState(EXHIBIT_NAMES[0]);
  const [selectedRestaurantType, setSelectedRestaurantType] = useState('restaurant'); // 'restaurant', 'bar', 'restaurant-bar'
  const [selectedExitType, setSelectedExitType] = useState('normal'); // 'normal', 'emergency'

  const toggleMode = (newMode) => {
    if (mode === newMode) {
      setMode('none'); // Toggle off if clicked again
    } else {
      setMode(newMode);
    }
  };

  const handleMapClick = (latlng, absoluteCoords) => {
    // We store both the geographic point and the absolute flat canvas representation
    const pt = { 
      lat: latlng.lat, 
      lng: latlng.lng,
      x: absoluteCoords.x,
      y: absoluteCoords.y
    };
    
    if (mode === 'ext-wall' || mode === 'int-wall') {
      setCurrentLine((prev) => [...prev, pt]);
    } else if (mode.startsWith('poi-')) {
      const type = mode.replace('poi-', '');
      
      let subType = null;
      let name = null;

      if (type === 'exhibit') {
        name = selectedExhibitName;
      } else if (type === 'restaurant') {
        subType = selectedRestaurantType;
      } else if (type === 'exit') {
        subType = selectedExitType;
      }

      setPois((prev) => [...prev, { 
        id: Date.now(), 
        type, 
        subType,
        name,
        position: pt, // this object contains {lat, lng, x, y}
        layerId: activeLayerId 
      }]);
    }
  };

  const finishLine = () => {
    if (currentLine.length > 1) {
      setLines((prev) => [...prev, { 
        id: Date.now(), 
        type: mode, 
        points: currentLine,
        // ext-walls are global, we still attach a layerId for traceability but render them everywhere
        layerId: activeLayerId
      }]);
    }
    setCurrentLine([]);
  };

  const addLayer = () => {
    const newId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 1;
    const newLayer = { id: newId, name: `Layer ${newId}` };
    setLayers([...layers, newLayer]);
    setActiveLayerId(newId);
    setMode('none');
    finishLine();
  };

  const switchLayer = (id) => {
    finishLine();
    setMode('none');
    setActiveLayerId(id);
  };

  const exportJSON = () => {
    const data = {
      museumCenter: center,
      layers,
      lines,
      pois
    };
    console.log("--------------- MAP DATA JSON ---------------");
    console.log(JSON.stringify(data, null, 2));
    console.log("---------------------------------------------");
    alert("Map Data exported successfully to the Browser Console!");
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to completely clear the map?")) {
      setLayers([{ id: 1, name: 'Layer 1' }]);
      setActiveLayerId(1);
      setLines([]);
      setPois([]);
      setCurrentLine([]);
      setMode('none');
    }
  };

  useEffect(() => {
    if (currentLine.length > 0 && !(mode === 'ext-wall' || mode === 'int-wall')) {
      finishLine();
    }
  }, [mode]);

  // Derived state for rendering
  const visibleLines = lines.filter(line => line.type === 'ext-wall' || line.layerId === activeLayerId);
  const visiblePois = pois.filter(poi => poi.layerId === activeLayerId);

  const renderTooltipContent = (poi) => {
    if (poi.type === 'exhibit') return poi.name;
    if (poi.type === 'restaurant') return poi.subType.toUpperCase().replace('-', ' ');
    if (poi.type === 'exit') return poi.subType.toUpperCase() + " EXIT";
    return poi.type.toUpperCase();
  };

  return (
    <div className="editor-container">
      {/* Mobile toggle button */}
      <button 
        className="mobile-sidebar-toggle" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`editor-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="back-to-app" onClick={() => navigate('/')}>
             <ArrowLeft size={20} /> Back
          </button>
          <h2>Map Editor</h2>
          <p className="sidebar-desc">Select a tool and click the map to draw. Click the active tool again to deselect and navigate map.</p>
        </div>

        <div className="tool-section">
          <h3><Layers size={14} style={{ display: 'inline', marginRight: '4px' }}/> Layers</h3>
          <div className="layer-controls">
            {layers.map(layer => (
              <button 
                key={layer.id} 
                className={`layer-btn ${activeLayerId === layer.id ? 'active' : ''}`}
                onClick={() => switchLayer(layer.id)}
              >
                {layer.name}
              </button>
            ))}
            <button className="layer-btn add-layer-btn" onClick={addLayer} title="Add New Layer">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="tool-section">
          <h3>Walls</h3>
          <button className={`tool-btn ${mode === 'ext-wall' ? 'active' : ''}`} onClick={() => toggleMode('ext-wall')}>
            <Square size={18} /> Exterior Wall (Global)
          </button>
          <button className={`tool-btn ${mode === 'int-wall' ? 'active' : ''}`} onClick={() => toggleMode('int-wall')}>
            <Minus size={18} /> Interior Wall
          </button>
          {(mode === 'ext-wall' || mode === 'int-wall') && currentLine.length > 0 && (
             <button className="finish-btn highlight" onClick={finishLine}>
                Finish Current Line
             </button>
          )}
        </div>

        <div className="tool-section">
          <h3>Points of Interest</h3>
          
          <button className={`tool-btn ${mode === 'poi-exhibit' ? 'active' : ''}`} onClick={() => toggleMode('poi-exhibit')}>
            <Package size={18} /> Exhibit Item
          </button>
          {mode === 'poi-exhibit' && (
            <div className="sub-tool-panel">
              <label>Select Exhibit Name:</label>
              <select value={selectedExhibitName} onChange={(e) => setSelectedExhibitName(e.target.value)}>
                {EXHIBIT_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <button className={`tool-btn ${mode === 'poi-restaurant' ? 'active' : ''}`} onClick={() => toggleMode('poi-restaurant')}>
            <Coffee size={18} /> Restaurant/Cafe
          </button>
          {mode === 'poi-restaurant' && (
            <div className="sub-tool-panel">
              <label>Select Type:</label>
              <select value={selectedRestaurantType} onChange={(e) => setSelectedRestaurantType(e.target.value)}>
                <option value="restaurant">Restaurant</option>
                <option value="bar">Bar</option>
                <option value="restaurant-bar">Restaurant Bar</option>
              </select>
            </div>
          )}

          <button className={`tool-btn ${mode === 'poi-exit' ? 'active' : ''}`} onClick={() => toggleMode('poi-exit')}>
            <DoorOpen size={18} /> Exit / Emergency
          </button>
          {mode === 'poi-exit' && (
            <div className="sub-tool-panel">
              <label>Select Type:</label>
              <select value={selectedExitType} onChange={(e) => setSelectedExitType(e.target.value)}>
                <option value="normal">Normal Exit</option>
                <option value="emergency">Emergency Exit</option>
              </select>
            </div>
          )}

          <button className={`tool-btn ${mode === 'poi-restroom' ? 'active' : ''}`} onClick={() => toggleMode('poi-restroom')}>
            <Bath size={18} /> Restroom
          </button>

        </div>

        <div className="tool-section">
          <h3>Actions</h3>
          <button className="tool-btn danger" onClick={clearAll}>Clear All Objects</button>
          <button className="tool-btn primary" onClick={exportJSON}>
            <Download size={18} /> Export JSON to Console
          </button>
        </div>
      </div>

      <div className="editor-map-area">
         <MapContainer center={center} zoom={19} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={22}
                maxNativeZoom={19}
            />
            <ClickCatcher mode={mode} onMapClick={handleMapClick} center={center} />

            {/* Render saved lines */}
            {visibleLines.map((line) => (
               <Polyline 
                  key={line.id} 
                  positions={line.points.map(p => [p.lat, p.lng])} 
                  color={line.type === 'ext-wall' ? '#0f172a' : '#64748b'} 
                  weight={line.type === 'ext-wall' ? 6 : 2} 
               />
            ))}

            {/* Render current drawing line */}
            {currentLine.length > 0 && (
               <Polyline 
                  positions={currentLine.map(p => [p.lat, p.lng])} 
                  color={mode === 'ext-wall' ? '#3b82f6' : '#93c5fd'} 
                  weight={mode === 'ext-wall' ? 6 : 2} 
                  dashArray="10, 10" 
               />
            )}

            {/* Render markers */}
            {visiblePois.map((poi) => (
               <Marker key={poi.id} position={[poi.position.lat, poi.position.lng]} icon={getIconForType(poi.type, poi.subType)}>
                  <Tooltip>{renderTooltipContent(poi)}</Tooltip>
               </Marker>
            ))}
         </MapContainer>
         
         <div className="editor-hud">
            Mode: <strong>{mode === 'none' ? 'Navigating' : mode.toUpperCase()}</strong> | Layer: <strong>{layers.find(l => l.id === activeLayerId)?.name}</strong>
         </div>
      </div>
    </div>
  );
}

