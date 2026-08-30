import React, { useState } from 'react';
import { Zap, X, MapPin, Layers, Sparkles, Navigation, DoorOpen, Coffee, Droplets } from 'lucide-react';
import './TeleportModal.css';

export default function TeleportModal({ pois = [], activeLayerId, onTeleport, onClose }) {
  const [filterLayer, setFilterLayer] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dividiamo i POI in Opere e Servizi
  const exhibits = pois.filter(p => p.type === 'exhibit');
  const facilities = pois.filter(p => p.type !== 'exhibit');

  const filteredExhibits = exhibits.filter(item => {
    const matchesLayer = filterLayer === 'ALL' || item.layerId === Number(filterLayer);
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artworkId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesSearch;
  });

  const getServiceIcon = (type, subType) => {
    if (type === 'restaurant') return <Coffee size={18} />;
    if (type === 'restroom') return <Droplets size={18} />;
    if (type === 'exit') return <DoorOpen size={18} />;
    return <MapPin size={18} />;
  };

  return (
    <div className="teleport-overlay fade-in" onClick={onClose}>
      <div className="teleport-modal slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="teleport-header">
          <div className="teleport-title-block">
            <div className="teleport-badge">
              <Zap size={18} className="zap-icon" />
              <span>MODULO TELETRASPORTO</span>
            </div>
            <h2>Spostamento Virtuale Rapido</h2>
            <p className="teleport-subtitle">Simula la presenza fisica istantanea davanti a qualsiasi opera o servizio del museo.</p>
          </div>
          <button className="teleport-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="teleport-controls">
          <input
            type="text"
            className="teleport-search"
            placeholder="Cerca opera, artista o codice Wikidata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="teleport-layer-chips">
            <button 
              className={`layer-chip ${filterLayer === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterLayer('ALL')}
            >
              Tutti i Piani
            </button>
            <button 
              className={`layer-chip ${filterLayer === '1' ? 'active' : ''}`}
              onClick={() => setFilterLayer('1')}
            >
              Piano Terra (L1)
            </button>
            <button 
              className={`layer-chip ${filterLayer === '2' ? 'active' : ''}`}
              onClick={() => setFilterLayer('2')}
            >
              Primo Piano (L2)
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="teleport-content no-scrollbar">
          {/* Opere d'Arte */}
          <div className="teleport-section">
            <div className="section-label">
              <Sparkles size={16} />
              <span>CAPOLAVORI DELLA VISITA ({filteredExhibits.length})</span>
            </div>

            <div className="teleport-grid">
              {filteredExhibits.map((poi, idx) => (
                <div 
                  key={poi.id || idx} 
                  className="teleport-card exhibit-card"
                  onClick={() => onTeleport(poi)}
                >
                  <div className="teleport-card-info">
                    <div className="card-top-row">
                      <span className="card-layer-tag">Piano {poi.layerId || 1}</span>
                      {poi.artworkId && <span className="card-qid-tag">{poi.artworkId}</span>}
                    </div>
                    <h4 className="card-title">{poi.name}</h4>
                    <p className="card-artist">{poi.artist || 'Artista Pinacoteca'}</p>
                    <p className="card-desc">{poi.desc ? poi.desc.substring(0, 85) + '...' : ''}</p>
                  </div>
                  <div className="teleport-action-icon">
                    <Navigation size={18} />
                    <span>Teletrasporta</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Servizi & Luoghi del Museo */}
          {facilities.length > 0 && (
            <div className="teleport-section">
              <div className="section-label">
                <MapPin size={16} />
                <span>SERVIZI & PUNTI DI INTERESSE</span>
              </div>
              <div className="facility-grid">
                {facilities.map((fac, idx) => (
                  <button
                    key={fac.id || idx}
                    className="facility-pill"
                    onClick={() => onTeleport(fac)}
                  >
                    <span className="facility-icon">
                      {getServiceIcon(fac.type, fac.subType)}
                    </span>
                    <span className="facility-name">{fac.name || fac.type}</span>
                    <span className="facility-layer">L{fac.layerId || 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
