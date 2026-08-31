import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  Compass, 
  ExternalLink,
  Utensils,
  Accessibility,
  Info,
  ShieldAlert,
  Layers
} from 'lucide-react';
import './ExploreMuseum.css';

export default function ExploreMuseum() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const url = id ? `/api/v1/navigator/museums/exploreData?id=${id}` : '/api/v1/navigator/museums/exploreData';
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch explore data");
        const data = await response.json();
        setExploreData(data);
      } catch (err) {
        console.error("Failed to fetch explore data", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExploreData();
  }, [id]);

  const masterpieces = exploreData?.masterpieces || [];

  const handlePrevSlide = () => {
    if (masterpieces.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? masterpieces.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (masterpieces.length === 0) return;
    setCurrentSlide((prev) => (prev === masterpieces.length - 1 ? 0 : prev + 1));
  };

  // Helper per renderizzare le icone delle facilities
  const renderFacilityIcon = (facility) => {
    const type = (facility.type || facility.icon || '').toLowerCase();
    if (type.includes('restaurant') || type.includes('bar') || type.includes('cafe')) {
      return <Utensils size={22} />;
    }
    if (type.includes('shop')) {
      return <ShoppingBag size={22} />;
    }
    if (type.includes('accessible') || type.includes('elevator') || type.includes('stairs')) {
      return <Accessibility size={22} />;
    }
    if (type.includes('emergency') || type.includes('exit')) {
      return <ShieldAlert size={22} />;
    }
    return <Info size={22} />;
  };

  // Reindirizzamenti al Marketplace
  const goToMarketplaceVisits = () => {
    const museumName = exploreData?.museumName || '';
    window.location.href = `/marketplace/browseMarket?tab=visits&search=${encodeURIComponent(museumName)}`;
  };

  const goToMarketplaceItems = () => {
    const museumName = exploreData?.museumName || '';
    window.location.href = `/marketplace/browseMarket?tab=items&search=${encodeURIComponent(museumName)}`;
  };

  if (loading) {
    return (
      <div className="explore-loading-container">
        <div className="explore-spinner"></div>
        <p>Caricamento dettagli museo in corso...</p>
      </div>
    );
  }

  if (error || !exploreData) {
    return (
      <div className="explore-loading-container">
        <p className="explore-error-msg">Errore durante il caricamento del museo: {error}</p>
        <button className="explore-btn-back" onClick={() => navigate('/')}>
          Torna alla mappa
        </button>
      </div>
    );
  }

  const currentArtwork = masterpieces[currentSlide];

  const rawFacilities = exploreData?.facilities || [];
  const uniqueFacilities = [];
  const seenFacNames = new Set();
  rawFacilities.forEach(f => {
    const key = (f.name || '').trim().toLowerCase();
    if (key && !seenFacNames.has(key)) {
      seenFacNames.add(key);
      uniqueFacilities.push(f);
    }
  });

  return (
    <>
      <header className="explore-header-bar">
        <button className="action-circle-btn" onClick={() => navigate(-1)} title="Torna Indietro">
          <ArrowLeft size={20} />
        </button>
        <h1 className="explore-logo">{exploreData.museumName}</h1>
        <button className="action-circle-btn" onClick={goToMarketplaceVisits} title="Apri Marketplace">
          <ShoppingBag size={20} />
        </button>
      </header>

      <main className="explore-container">
        {/* Banner Informativo Museo */}
        <section className="museum-intro-card fade-in">
          <div className="museum-intro-badge">
            <MapPin size={14} />
            <span>{exploreData.city || 'Bologna'} {exploreData.address ? `• ${exploreData.address}` : ''}</span>
          </div>
          <h2 className="museum-intro-title">{exploreData.museumName}</h2>
          {exploreData.museumDescription && (
            <p className="museum-intro-desc">{exploreData.museumDescription}</p>
          )}
          <div className="museum-intro-actions">
            <button className="explore-btn-primary" onClick={() => navigate('/tour')}>
              <Compass size={18} />
              <span>Avvia Navigazione Indoor</span>
            </button>
            <button className="explore-btn-secondary" onClick={goToMarketplaceVisits}>
              <ExternalLink size={18} />
              <span>Percorsi nel Marketplace</span>
            </button>
          </div>
        </section>

        {/* Slider Opere Selezionate dal Creator */}
        <section className="explore-slider-section fade-in">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Opere Selezionate</h2>
              <p className="section-subtitle">Capolavori scelti dal curatore per la presentazione</p>
            </div>
            {masterpieces.length > 1 && (
              <div className="slider-controls">
                <button className="slider-arrow-btn" onClick={handlePrevSlide} title="Precedente">
                  <ChevronLeft size={22} />
                </button>
                <span className="slider-counter">
                  {currentSlide + 1} / {masterpieces.length}
                </span>
                <button className="slider-arrow-btn" onClick={handleNextSlide} title="Successiva">
                  <ChevronRight size={22} />
                </button>
              </div>
            )}
          </div>

          {masterpieces.length > 0 && currentArtwork ? (
            <div className="slider-card-wrapper">
              <div className="slider-card">
                <div className="slider-img-container">
                  <img 
                    className="slider-img" 
                    src={currentArtwork.image} 
                    alt={currentArtwork.title} 
                  />
                  <div className="slider-gradient-overlay"></div>
                  <div className="slider-badge">
                    <Sparkles size={14} className="text-amber-400" />
                    <span>CURATOR'S PICK</span>
                  </div>
                </div>

                <div className="slider-content">
                  <div>
                    <span className="artwork-style-tag">{currentArtwork.style || 'Collezione Ufficiale'}</span>
                    <h3 className="artwork-title">{currentArtwork.title}</h3>
                    <p className="artwork-artist">{currentArtwork.artist}</p>
                  </div>
                  {currentArtwork.desc && (
                    <p className="artwork-desc">{currentArtwork.desc}</p>
                  )}
                  <div className="slider-actions">
                    <button className="artwork-cta-btn" onClick={() => navigate('/tour')}>
                      <span>Visualizza sulla Mappa</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicatore Dots */}
              {masterpieces.length > 1 && (
                <div className="slider-dots">
                  {masterpieces.map((_, idx) => (
                    <button
                      key={idx}
                      className={`slider-dot ${idx === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(idx)}
                      title={`Opera ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-items-card">
              <p>Nessuna opera selezionata per l'anteprima di questo museo.</p>
            </div>
          )}
        </section>

        {/* Current Exhibitions / Percorsi Visita */}
        <section className="fade-in">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Percorsi di Visita</h2>
              <p className="section-subtitle">Tour e percorsi sincronizzati disponibili per questo museo</p>
            </div>
          </div>

          <div className="exhibitions-list">
            {exploreData.exhibitions && exploreData.exhibitions.length > 0 ? (
              exploreData.exhibitions.map((exhibition, index) => (
                <div key={index} className={`exhibition-item ${index % 2 !== 0 ? 'reversed' : ''}`}>
                  <div className="exhibition-img-wrapper" onClick={goToMarketplaceVisits}>
                    <img 
                      className="exhibition-img" 
                      src={exhibition.image} 
                      alt={exhibition.title} 
                    />
                    <div className="exhibition-price-tag">{exhibition.price || 'Marketplace'}</div>
                  </div>
                  <div className="exhibition-text-wrapper">
                    <p className="content-label">{exhibition.period}</p>
                    <h3 className="exhibition-title">{exhibition.title}</h3>
                    <p className="exhibition-desc">{exhibition.description || 'Un viaggio immersivo attraverso le sale della struttura museale.'}</p>
                    <button className="exhibition-btn exhibition-btn-primary" onClick={goToMarketplaceVisits}>
                      <ShoppingBag size={16} />
                      <span>Acquista Visita nel Marketplace</span>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </section>

        {/* Sezione Mostra Permanente & Catalogo Opere */}
        <section className="permanent-exhibition-section fade-in">
          <div className="permanent-card">
            <div className="permanent-content">
              <div className="permanent-badge">
                <Layers size={14} />
                <span>MOSTRA PERMANENTE</span>
              </div>
              <h3 className="permanent-title">Catalogo Completo delle Opere</h3>
              <p className="permanent-desc">
                Accedi al catalogo del Marketplace per esplorare e sbloccare tutte le singole spiegazioni, analisi visive e audio-descrizioni dedicate alle opere di <strong>{exploreData.museumName}</strong>.
              </p>
              <button className="permanent-cta-btn" onClick={goToMarketplaceItems}>
                <span>Sfoglia le Opere del Museo</span>
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Facilities (Servizi Struttura estratti dinamicamente) */}
        <section className="fade-in">
          <div className="section-title-row">
            <div>
              <h2 className="section-title">Servizi & Struttura</h2>
              <p className="section-subtitle">Dotazioni e servizi rilevati dalla planimetria</p>
            </div>
          </div>
          
          <div className="facilities-grid">
            {uniqueFacilities.length > 0 ? (
              uniqueFacilities.map((facility, index) => (
                <div key={index} className="facility-card">
                  <div className="facility-icon">
                    {renderFacilityIcon(facility)}
                  </div>
                  <div>
                    <h4 className="facility-title">{facility.name}</h4>
                    <p className="facility-desc">{facility.desc}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="facility-card empty-facility">
                <Info size={24} className="text-gray-400" />
                <div>
                  <h4 className="facility-title">Servizi non specificati</h4>
                  <p className="facility-desc">I servizi sono in fase di inserimento nella planimetria 2D.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
