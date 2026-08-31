import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Tooltip, Polygon } from 'react-leaflet';
import { 
  Download, Square, Minus, Bath, DoorOpen, Package, Coffee, 
  ArrowLeft, Layers, Plus, Menu, X, Eraser, Trash2, Save, 
  Building2, Check, AlertCircle, Loader2, RefreshCw, CheckCircle2 
} from 'lucide-react';
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

const getIconForType = (type, subType, isEraser = false) => {
  let iconHtml = '';
  if (isEraser) {
    iconHtml = '<div class="poi-icon-box eraser-mode" title="Clicca per cancellare">✕</div>';
  } else {
    switch (type) {
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
  }
  return L.divIcon({
    html: iconHtml,
    className: 'custom-poi-icon-wrapper',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

function ClickCatcher({ mode, onMapClick, center, onMouseMove }) {
  const map = useMapEvents({
    click(e) {
      if (mode !== 'none' && mode !== 'eraser') {
        // Project to a high zoom level (22) for pixel accuracy on a generic flat plane
        const centerPoint = map.project(center, 22);
        const clickPoint = map.project(e.latlng, 22);

        const x = clickPoint.x - centerPoint.x;
        const y = clickPoint.y - centerPoint.y;

        onMapClick(e.latlng, { x, y });
      }
    },
    mousemove(e) {
      if (onMouseMove) onMouseMove(e.latlng);
    }
  });
  return null;
}

// Controller to smoothly pan/zoom map when switching museum or center
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, 19);
    }
  }, [center, map]);
  return null;
}

const calculateRectanglePoints = (pt1, pt2, pt3, zoom = 22) => {
  const p1 = L.CRS.EPSG3857.latLngToPoint(L.latLng(pt1.lat, pt1.lng), zoom);
  const p2 = L.CRS.EPSG3857.latLngToPoint(L.latLng(pt2.lat, pt2.lng), zoom);
  const p3 = L.CRS.EPSG3857.latLngToPoint(L.latLng(pt3.lat, pt3.lng), zoom);

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) return [pt1, pt1, pt1, pt1];

  const n = { x: -dy, y: dx };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v2.x * n.x + v2.y * n.y;
  
  const hScale = dot / lengthSq;
  const orthX = n.x * hScale;
  const orthY = n.y * hScale;

  const rectP3 = L.point(p2.x + orthX, p2.y + orthY);
  const rectP4 = L.point(p1.x + orthX, p1.y + orthY);

  const latLng3 = L.CRS.EPSG3857.pointToLatLng(rectP3, zoom);
  const latLng4 = L.CRS.EPSG3857.pointToLatLng(rectP4, zoom);

  return [
    pt1,
    pt2,
    { lat: latLng3.lat, lng: latLng3.lng },
    { lat: latLng4.lat, lng: latLng4.lng }
  ];
};

const EXHIBIT_NAMES = [
  "Ritratto di frate (Bedoli)",
  "Estasi di Santa Cecilia (Raffaello)",
  "Madonna di Santa Margherita (Parmigianino)",
  "Assunzione della Vergine (A. Carracci)",
  "Annunciazione (L. Carracci)",
  "Strage degli innocenti (Reni)",
  "San Sebastiano soccorso (Guercino)",
  "San Giorgio e il drago (Vitale)",
  "Polittico di Bologna (Giotto)",
  "Madonna in trono (Perugino)",
  "Mona Lisa",
  "David"
];

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();

  // Museum and DB State
  const [museums, setMuseums] = useState([]);
  const [currentMuseum, setCurrentMuseum] = useState(null);
  const [selectedMuseumId, setSelectedMuseumId] = useState('');
  const [isNewMuseumMode, setIsNewMuseumMode] = useState(false);
  const [returnUrl, setReturnUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Map Drawing State (Default fallback: 44.4975, 11.3533)
  const [center, setCenter] = useState([44.4975, 11.3533]);
  const [mode, setMode] = useState('none');
  const [currentLine, setCurrentLine] = useState([]);
  const [lines, setLines] = useState([]);
  const [pois, setPois] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentAreaPoints, setCurrentAreaPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);

  // Layer Management
  const [layers, setLayers] = useState([{ id: 1, name: 'Piano Terra (L1)' }, { id: 2, name: 'Primo Piano (L2)' }]);
  const [activeLayerId, setActiveLayerId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sub-type selections
  const [selectedExhibitName, setSelectedExhibitName] = useState(EXHIBIT_NAMES[0]);
  const [selectedRestaurantType, setSelectedRestaurantType] = useState('restaurant');
  const [selectedExitType, setSelectedExitType] = useState('normal');

  // Initialization: check URL query params and load museums from DB
  useEffect(() => {
    initEditor();
  }, []);

  const initEditor = async () => {
    setIsLoading(true);
    const searchParams = new URLSearchParams(window.location.search);
    const retUrl = searchParams.get('returnUrl');
    setReturnUrl(retUrl);

    const isNew = searchParams.get('newMuseum') === 'true' || Boolean(retUrl);
    const queryLat = parseFloat(searchParams.get('lat'));
    const queryLng = parseFloat(searchParams.get('lng'));
    const queryId = searchParams.get('id');
    const queryCode = searchParams.get('museumId');
    const museumName = searchParams.get('museumName') || 'Nuovo Museo';

    // 1. Fetch available museums in DB for switching between museums
    let dbMuseums = [];
    try {
      const res = await fetch('/api/v1/navigator/museums/get');
      if (res.ok) {
        dbMuseums = await res.json();
        setMuseums(dbMuseums);
      }
    } catch (e) {
      console.error("Error fetching museums list:", e);
    }

    // 2. Flow: Registering a NEW museum (from newMuseum.html)
    // MUST open on requested lat/lng with an EMPTY map, never another museum's layout!
    if (isNew && !isNaN(queryLat) && !isNaN(queryLng)) {
      setIsNewMuseumMode(true);
      const newCenter = [queryLat, queryLng];
      setCenter(newCenter);
      setSelectedMuseumId('__new__');
      setCurrentMuseum({
        id: '__new__',
        museumId: 'NEW',
        name: decodeURIComponent(museumName),
        museumCenter: newCenter
      });

      // If returning to edit a previously drafted plan in this session, restore it
      const savedDraft = sessionStorage.getItem('editorMapData');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (Array.isArray(parsed.layers) && parsed.layers.length > 0) setLayers(parsed.layers);
          if (Array.isArray(parsed.lines)) setLines(parsed.lines);
          if (Array.isArray(parsed.areas)) setAreas(parsed.areas);
          if (Array.isArray(parsed.pois)) setPois(parsed.pois);
        } catch (err) {}
      } else {
        // Pure blank map
        setLayers([{ id: 1, name: 'Piano Terra (L1)' }, { id: 2, name: 'Primo Piano (L2)' }]);
        setActiveLayerId(1);
        setLines([]);
        setAreas([]);
        setPois([]);
      }
      setIsLoading(false);
      return;
    }

    // 3. Flow: Standard Editor - load existing museum from DB
    setIsNewMuseumMode(false);
    let targetMuseum = null;
    if (queryId) {
      targetMuseum = dbMuseums.find(m => m.id === queryId || m._id === queryId);
    }
    if (!targetMuseum && queryCode) {
      targetMuseum = dbMuseums.find(m => m.museumId?.toUpperCase() === queryCode.toUpperCase());
    }
    if (!targetMuseum && !isNaN(queryLat) && !isNaN(queryLng)) {
      targetMuseum = dbMuseums.find(m => Math.abs(m.lat - queryLat) < 0.001 && Math.abs(m.lng - queryLng) < 0.001);
    }
    if (!targetMuseum && dbMuseums.length > 0) {
      targetMuseum = dbMuseums[0]; // Pinacoteca Nazionale di Bologna
    }

    if (targetMuseum) {
      const museumIdToLoad = targetMuseum.id || targetMuseum._id || targetMuseum.museumId;
      setSelectedMuseumId(museumIdToLoad);
      await loadMuseumData(museumIdToLoad);
    } else {
      setIsLoading(false);
    }
  };

  const loadMuseumData = async (museumIdOrCode) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/navigator/museums/museumData?id=${museumIdOrCode}&museumId=${museumIdOrCode}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentMuseum(data);
        if (data.museumCenter && data.museumCenter.length === 2) {
          setCenter([data.museumCenter[0], data.museumCenter[1]]);
        }
        if (Array.isArray(data.layers) && data.layers.length > 0) {
          setLayers(data.layers);
          setActiveLayerId(data.layers[0].id || 1);
        }
        setLines(Array.isArray(data.lines) ? data.lines : []);
        setAreas(Array.isArray(data.areas) ? data.areas : []);
        setPois(Array.isArray(data.pois) ? data.pois : []);
      }
    } catch (err) {
      console.error("Error loading museum map data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between museums in dropdown
  const handleMuseumChange = async (newId) => {
    if (newId === '__new__') {
      setIsNewMuseumMode(true);
      setSelectedMuseumId('__new__');
      setCurrentMuseum({
        id: '__new__',
        museumId: 'NEW',
        name: 'Nuova Piantina Vuota',
        museumCenter: center
      });
      setLayers([{ id: 1, name: 'Piano Terra (L1)' }, { id: 2, name: 'Primo Piano (L2)' }]);
      setActiveLayerId(1);
      setLines([]);
      setAreas([]);
      setPois([]);
      setMode('none');
      return;
    }

    setIsNewMuseumMode(false);
    setSelectedMuseumId(newId);
    setMode('none');
    setCurrentLine([]);
    setCurrentAreaPoints([]);
    await loadMuseumData(newId);
  };

  const toggleMode = (newMode) => {
    if (mode === newMode) {
      setMode('none');
    } else {
      setMode(newMode);
    }
    setCurrentAreaPoints([]);
  };

  // Eraser deletion handlers
  const handleDeleteLine = (lineId) => {
    if (mode === 'eraser') {
      setLines(prev => prev.filter(l => l.id !== lineId));
    }
  };

  const handleDeletePoi = (poiId) => {
    if (mode === 'eraser') {
      setPois(prev => prev.filter(p => p.id !== poiId));
    }
  };

  const handleDeleteArea = (areaId) => {
    if (mode === 'eraser') {
      setAreas(prev => prev.filter(a => a.id !== areaId));
      setPois(prev => prev.filter(p => p.id !== areaId + 1));
    }
  };

  const handleMapClick = (latlng, absoluteCoords) => {
    if (mode === 'eraser') return;

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
      } else if (type === 'exit') {
        subType = selectedExitType;
      }

      setPois((prev) => [...prev, {
        id: Date.now(),
        type,
        subType,
        name,
        position: pt,
        layerId: activeLayerId
      }]);
    } else if (mode.startsWith('area-')) {
      const type = mode.replace('area-', '');
      let subType = null;
      let name = null;

      if (type === 'restaurant') {
        subType = selectedRestaurantType;
      }

      if (currentAreaPoints.length === 0) {
        setCurrentAreaPoints([pt]);
      } else if (currentAreaPoints.length === 1) {
        setCurrentAreaPoints([currentAreaPoints[0], pt]);
      } else if (currentAreaPoints.length === 2) {
        const p1 = currentAreaPoints[0];
        const p2 = currentAreaPoints[1];
        const p3 = pt;
        
        const rectPoints = calculateRectanglePoints(p1, p2, p3);
        const timestamp = Date.now();

        setAreas((prev) => [...prev, {
          id: timestamp,
          type,
          subType,
          name,
          points: rectPoints,
          layerId: activeLayerId
        }]);

        const centerPt = {
          lat: (rectPoints[0].lat + rectPoints[1].lat + rectPoints[2].lat + rectPoints[3].lat) / 4,
          lng: (rectPoints[0].lng + rectPoints[1].lng + rectPoints[2].lng + rectPoints[3].lng) / 4,
          x: (rectPoints[0].x + rectPoints[1].x + rectPoints[2].x + rectPoints[3].x) / 4,
          y: (rectPoints[0].y + rectPoints[1].y + rectPoints[2].y + rectPoints[3].y) / 4
        };

        setPois((prev) => [...prev, {
          id: timestamp + 1,
          type,
          subType,
          name,
          position: centerPt,
          layerId: activeLayerId
        }]);

        setCurrentAreaPoints([]);
      }
    }
  };

  const finishLine = () => {
    if (currentLine.length > 1) {
      setLines((prev) => [...prev, {
        id: Date.now(),
        type: mode === 'ext-wall' ? 'ext-wall' : 'int-wall',
        points: currentLine,
        layerId: activeLayerId
      }]);
    }
    setCurrentLine([]);
  };

  const addLayer = () => {
    const newId = layers.length > 0 ? Math.max(...layers.map(l => l.id)) + 1 : 1;
    const newLayer = { id: newId, name: `Piano ${newId} (L${newId})` };
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

  const generateJSON = () => ({
    museumCenter: center,
    layers,
    lines,
    areas,
    pois
  });

  // Save when registering a new museum: persists to sessionStorage and returns to form
  const saveAndReturnToForm = () => {
    const data = generateJSON();
    sessionStorage.setItem('editorMapData', JSON.stringify(data));
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.location.href = '/marketplace/homepage/newMuseum';
    }
  };

  // Save to MongoDB Database (for existing museums)
  const saveToDatabase = async () => {
    const museumTargetId = currentMuseum?.id || currentMuseum?._id || selectedMuseumId || currentMuseum?.museumId;
    if (!museumTargetId || museumTargetId === '__new__') {
      saveAndReturnToForm();
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload = {
        id: museumTargetId,
        museumId: currentMuseum?.museumId,
        museumCenter: center,
        layers,
        lines,
        areas,
        pois
      };

      const res = await fetch(`/api/v1/navigator/museums/map/${museumTargetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ type: 'success', message: data.message || 'Mappa salvata con successo nel database!' });
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Errore durante il salvataggio sul database.' });
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus({ type: 'error', message: 'Errore di connessione con il server durante il salvataggio.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const exportJSON = () => {
    const data = generateJSON();
    if (returnUrl) {
      sessionStorage.setItem('editorMapData', JSON.stringify(data));
      window.location.href = returnUrl;
    } else {
      console.log(JSON.stringify(data, null, 2));
      alert("Dati mappa esportati nella Console del Browser!");
    }
  };

  const importJSON = () => {
    const inputJSON = prompt("Incolla qui il JSON della mappa esportata:");
    if (!inputJSON) return;

    try {
      const parsedData = JSON.parse(inputJSON);
      if (parsedData.museumCenter) setCenter(parsedData.museumCenter);
      if (parsedData.layers) setLayers(parsedData.layers);
      if (parsedData.lines) setLines(parsedData.lines);
      if (parsedData.pois) setPois(parsedData.pois);
      if (parsedData.areas) setAreas(parsedData.areas);

      alert("Dati mappa importati con successo!");
    } catch (err) {
      alert("Formato JSON non valido.");
      console.error(err);
    }
  };

  const clearAll = () => {
    if (window.confirm("Sei sicuro di voler cancellare tutti gli elementi della piantina?")) {
      setLayers([{ id: 1, name: 'Piano 1' }]);
      setActiveLayerId(1);
      setLines([]);
      setPois([]);
      setAreas([]);
      setCurrentLine([]);
      setCurrentAreaPoints([]);
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
  const visibleAreas = areas.filter(area => area.layerId === activeLayerId);

  const renderTooltipContent = (poi) => {
    if (mode === 'eraser') return "🗑️ Clicca per CANCELLARE questo elemento";
    if (poi.type === 'exhibit') return poi.name || "Opera d'Arte";
    if (poi.type === 'restaurant') return (poi.subType || 'Café').toUpperCase().replace('-', ' ');
    if (poi.type === 'exit') return (poi.subType || 'Uscita').toUpperCase() + " EXIT";
    return (poi.type || 'Punto').toUpperCase();
  };

  return (
    <div className={`editor-container ${mode === 'eraser' ? 'eraser-active' : ''}`}>
      {/* Mobile toggle button */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        title={isSidebarOpen ? "Chiudi Barra Laterale" : "Apri Barra Laterale"}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`editor-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="back-to-app" onClick={() => {
            if (returnUrl) {
              window.location.href = returnUrl;
            } else {
              window.location.href = '/marketplace/homepage';
            }
          }}>
            <ArrowLeft size={18} /> {returnUrl ? 'Torna alla Registrazione' : 'Torna al Marketplace'}
          </button>
          <h2>Editor Piantina 2D</h2>
          <p className="sidebar-desc">
            {isNewMuseumMode 
              ? 'Disegna la nuova piantina per la struttura in fase di registrazione.' 
              : 'Modifica muri, aree e punti di interesse direttamente sul database del museo.'}
          </p>
        </div>

        {/* Museum Selector Section (Change between museums) */}
        <div className="tool-section museum-select-section">
          <h3><Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Struttura Museale</h3>
          {isLoading ? (
            <div className="loading-badge"><Loader2 size={16} className="spin" /> Caricamento...</div>
          ) : (
            <select
              className="museum-dropdown"
              value={selectedMuseumId}
              onChange={(e) => handleMuseumChange(e.target.value)}
            >
              {isNewMuseumMode && (
                <option value="__new__">
                  ✨ {currentMuseum?.name || 'Nuovo Museo'} (In Registrazione)
                </option>
              )}
              {museums.map(m => (
                <option key={m.id || m._id || m.museumId} value={m.id || m._id || m.museumId}>
                  🏛️ {m.name} ({m.museumId})
                </option>
              ))}
              {!isNewMuseumMode && (
                <option value="__new__">➕ Crea Nuova Piantina Vuota</option>
              )}
            </select>
          )}
          {currentMuseum && !isLoading && (
            <div className="museum-status-badge">
              <span className="badge-name">
                {isNewMuseumMode ? '✨ ' + currentMuseum.name : '🏛️ ' + currentMuseum.name}
              </span>
              <span className="badge-code">{currentMuseum.museumId}</span>
            </div>
          )}
        </div>

        {/* Eraser / Delete Tool Section */}
        <div className="tool-section eraser-section">
          <h3>Strumenti Speciali</h3>
          <button 
            className={`tool-btn eraser-btn ${mode === 'eraser' ? 'active' : ''}`} 
            onClick={() => toggleMode('eraser')}
          >
            <Eraser size={18} /> Gomma / Cancella Elementi
          </button>
          {mode === 'eraser' && (
            <div className="eraser-hint">
              🧹 <strong>Modalità Gomma Attiva:</strong> Fai clic direttamente su muri, aree o opere sulla mappa per cancellarli.
            </div>
          )}
        </div>

        {/* Layers Section */}
        <div className="tool-section">
          <h3><Layers size={14} style={{ display: 'inline', marginRight: '4px' }} /> Piani / Layers</h3>
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
            <button className="layer-btn add-layer-btn" onClick={addLayer} title="Aggiungi Nuovo Piano">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Walls Section */}
        <div className="tool-section">
          <h3>Muri e Pareti</h3>
          <button className={`tool-btn ${mode === 'ext-wall' ? 'active' : ''}`} onClick={() => toggleMode('ext-wall')}>
            <Square size={18} /> Muro Perimetrale (Globale)
          </button>
          <button className={`tool-btn ${mode === 'int-wall' ? 'active' : ''}`} onClick={() => toggleMode('int-wall')}>
            <Minus size={18} /> Parete Interna
          </button>
          {(mode === 'ext-wall' || mode === 'int-wall') && currentLine.length > 0 && (
            <button className="finish-btn highlight" onClick={finishLine}>
              Termina Linea Corrente ({currentLine.length} punti)
            </button>
          )}
        </div>

        {/* POIs & Areas Section */}
        <div className="tool-section">
          <h3>Opere e Aree di Servizio</h3>

          <button className={`tool-btn ${mode === 'poi-exhibit' ? 'active' : ''}`} onClick={() => toggleMode('poi-exhibit')}>
            <Package size={18} /> Opera d'Arte (POI)
          </button>
          {mode === 'poi-exhibit' && (
            <div className="sub-tool-panel">
              <label>Nome Opera / Capolavoro:</label>
              <select value={selectedExhibitName} onChange={(e) => setSelectedExhibitName(e.target.value)}>
                {EXHIBIT_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <button className={`tool-btn ${mode === 'area-restaurant' ? 'active' : ''}`} onClick={() => toggleMode('area-restaurant')}>
            <Coffee size={18} /> Area Ristoro / Bar
          </button>
          {mode === 'area-restaurant' && (
            <div className="sub-tool-panel">
              <label>Tipo Ristoro:</label>
              <select value={selectedRestaurantType} onChange={(e) => setSelectedRestaurantType(e.target.value)}>
                <option value="restaurant">Ristorante</option>
                <option value="bar">Bar / Caffetteria</option>
                <option value="restaurant-bar">Bistrot & Lounge</option>
              </select>
              <p style={{ fontSize: '12px', marginTop: '5px', color: '#64748b' }}>Fai clic su 3 punti: 2 per la base, 1 per l'ampiezza.</p>
            </div>
          )}

          <button className={`tool-btn ${mode === 'poi-exit' ? 'active' : ''}`} onClick={() => toggleMode('poi-exit')}>
            <DoorOpen size={18} /> Uscita / Emergenza
          </button>
          {mode === 'poi-exit' && (
            <div className="sub-tool-panel">
              <label>Tipo Uscita:</label>
              <select value={selectedExitType} onChange={(e) => setSelectedExitType(e.target.value)}>
                <option value="normal">Uscita Standard</option>
                <option value="emergency">Uscita di Sicurezza (SOS)</option>
              </select>
            </div>
          )}

          <button className={`tool-btn ${mode === 'area-restroom' ? 'active' : ''}`} onClick={() => toggleMode('area-restroom')}>
            <Bath size={18} /> Area Servizi Igienici (WC)
          </button>
          {mode === 'area-restroom' && (
            <div className="sub-tool-panel">
              <p style={{ fontSize: '12px', color: '#64748b' }}>Fai clic su 3 punti: 2 per la base, 1 per l'ampiezza.</p>
            </div>
          )}
        </div>

        {/* Persistence & Actions */}
        <div className="tool-section">
          <h3>Salvataggio & Azioni</h3>
          
          {returnUrl ? (
            <button 
              className="tool-btn save-db-btn" 
              onClick={saveAndReturnToForm}
            >
              <CheckCircle2 size={18} /> Salva Piantina e Torna al Form
            </button>
          ) : (
            <button 
              className="tool-btn save-db-btn" 
              onClick={saveToDatabase}
              disabled={isSaving || isLoading}
            >
              {isSaving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {isSaving ? 'Salvataggio in corso...' : 'Salva nel Database'}
            </button>
          )}

          {saveStatus && (
            <div className={`status-toast ${saveStatus.type}`}>
              {saveStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{saveStatus.message}</span>
            </div>
          )}

          <button className="tool-btn danger" onClick={clearAll}>
            <Trash2 size={16} /> Cancella Tutta la Piantina
          </button>
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="tool-btn primary" onClick={exportJSON} style={{ flex: 1 }}>
              <Download size={16} /> Esporta
            </button>
            <button className="tool-btn highlight" onClick={importJSON} style={{ flex: 1 }}>
              Importa
            </button>
          </div>
        </div>
      </div>

      {/* Map Interactive Canvas */}
      <div className="editor-map-area">
        <MapContainer center={center} zoom={19} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={22}
            maxNativeZoom={19}
          />
          <MapCenterController center={center} />
          <ClickCatcher 
            mode={mode} 
            onMapClick={handleMapClick} 
            center={center} 
            onMouseMove={(latlng) => setMousePos(latlng)} 
          />

          {/* Render saved lines */}
          {visibleLines.map((line) => (
            <Polyline
              key={line.id}
              positions={line.points.map(p => [p.lat, p.lng])}
              color={mode === 'eraser' ? '#ef4444' : (line.type === 'ext-wall' ? '#0f172a' : '#64748b')}
              weight={line.type === 'ext-wall' ? 6 : 3}
              dashArray={mode === 'eraser' ? '4, 4' : null}
              eventHandlers={{
                click: (e) => {
                  if (mode === 'eraser') {
                    L.DomEvent.stopPropagation(e);
                    handleDeleteLine(line.id);
                  }
                }
              }}
            >
              {mode === 'eraser' && <Tooltip>🗑️ Clicca per cancellare questa parete</Tooltip>}
            </Polyline>
          ))}

          {/* Render current drawing line */}
          {currentLine.length > 0 && (
            <Polyline
              positions={currentLine.map(p => [p.lat, p.lng])}
              color={mode === 'ext-wall' ? '#3b82f6' : '#93c5fd'}
              weight={mode === 'ext-wall' ? 6 : 3}
              dashArray="10, 10"
            />
          )}

          {/* Render markers */}
          {visiblePois.map((poi) => (
            <Marker 
              key={poi.id} 
              position={[poi.position.lat, poi.position.lng]} 
              icon={getIconForType(poi.type, poi.subType, mode === 'eraser')}
              eventHandlers={{
                click: (e) => {
                  if (mode === 'eraser') {
                    L.DomEvent.stopPropagation(e);
                    handleDeletePoi(poi.id);
                  }
                }
              }}
            >
              <Tooltip>{renderTooltipContent(poi)}</Tooltip>
            </Marker>
          ))}

          {/* Render saved areas */}
          {visibleAreas.map((area) => (
            <Polygon
              key={area.id}
              positions={area.points.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: mode === 'eraser' ? '#ef4444' : (area.type === 'restaurant' ? '#ef4444' : '#3b82f6'),
                weight: mode === 'eraser' ? 3 : 2,
                fillOpacity: mode === 'eraser' ? 0.4 : 0.25,
                dashArray: mode === 'eraser' ? '6, 6' : null
              }}
              eventHandlers={{
                click: (e) => {
                  if (mode === 'eraser') {
                    L.DomEvent.stopPropagation(e);
                    handleDeleteArea(area.id);
                  }
                }
              }}
            >
              <Tooltip>
                {mode === 'eraser' ? '🗑️ Clicca per cancellare quest\'area' : (area.type === 'restaurant' ? (area.subType || 'Ristorante').toUpperCase().replace('-', ' ') : (area.type || 'Area').toUpperCase())}
              </Tooltip>
            </Polygon>
          ))}

          {/* Render current drawing area */}
          {mode.startsWith('area-') && currentAreaPoints.length > 0 && mousePos && (
            currentAreaPoints.length === 1 ? (
              <Polyline
                positions={[ [currentAreaPoints[0].lat, currentAreaPoints[0].lng], [mousePos.lat, mousePos.lng] ]}
                color="#f59e0b" weight={2} dashArray="10, 10"
              />
            ) : (
              <Polygon
                positions={calculateRectanglePoints(currentAreaPoints[0], currentAreaPoints[1], mousePos).map(p => [p.lat, p.lng])}
                pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '10, 10', fillOpacity: 0.2 }}
              />
            )
          )}
        </MapContainer>

        {/* HUD Indicator */}
        <div className="editor-hud">
          {mode === 'eraser' ? (
            <span style={{ color: '#ef4444', fontWeight: 600 }}>🧹 MODALITÀ GOMMA: Clicca un elemento per cancellarlo</span>
          ) : (
            <span>
              {isNewMuseumMode ? '✨ Nuova Piantina | ' : ''}
              Modalità: <strong>{mode === 'none' ? 'Navigazione' : mode.toUpperCase()}</strong> | Piano: <strong>{layers.find(l => l.id === activeLayerId)?.name}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
