import { useRef, useCallback, useEffect, useState } from 'react';
import './BottomBar.css';

export default function BottomBar({
  onPrev,
  onNext,
  onPlayPause,
  onMic,
  onSeekBack,
  onSeekForward,
  isPlaying,
  hasPrev,
  hasNext,
  progress = 0,
  showDescription,
  setShowDescription,
  currentItem,
  museumName = 'Museo'
}) {
  const dragStartY = useRef(null);
  const dragStartTarget = useRef(null);
  const scrollRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    dragStartY.current = e.clientY;
    dragStartTarget.current = e.target;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - e.clientY;
    const startTarget = dragStartTarget.current;
    
    // Check if we were at the top of the scroll when starting (if expanded)
    const isAtTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;
    
    dragStartY.current = null;
    dragStartTarget.current = null;

    // Swipe up to expand, swipe down to collapse
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        if (!showDescription) setShowDescription(true);
      } else {
        // Only collapse if swiping down from the top or on the header/hero
        if (showDescription && (isAtTop || !startTarget?.closest('.expanded-main'))) {
          setShowDescription(false);
        }
      }
      return;
    }

    // Click on player-bar to expand
    if (!showDescription && startTarget?.closest('.mini-player-clickable')) {
      setShowDescription(true);
    }
  }, [showDescription, setShowDescription]);

  // Handle back button/ESC (optional but good practice)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showDescription) setShowDescription(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showDescription, setShowDescription]);

  const defaultImage = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600";

  const [liveData, setLiveData] = useState({ 
    description: '', 
    style: '', 
    artist: '', 
    image: '' 
  });

  useEffect(() => {
    if (!currentItem) return;

    // Inizializza liveData con i valori arricchiti passati da currentItem
    setLiveData({
      description: currentItem.description || currentItem.desc || '',
      style: currentItem.style || '',
      artist: currentItem.artist || currentItem.author || '',
      image: currentItem.image || currentItem.recognitionImage || ''
    });

    const fetchDesc = async () => {
      try {
        const queryTarget = currentItem.itemRef || currentItem.artworkId || currentItem.id;
        const nameQuery = encodeURIComponent(currentItem.name || currentItem.title || '');
        const museumQuery = encodeURIComponent(currentItem.museumId || '');
        const response = await fetch(`/api/v1/navigator/museums/item/${queryTarget}?name=${nameQuery}&museumId=${museumQuery}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data) {
          setLiveData({
            description: data.description || currentItem.description || currentItem.desc || '',
            style: data.style || currentItem.style || '',
            artist: data.artist || data.author || currentItem.artist || currentItem.author || '',
            image: data.image || data.recognitionImage || currentItem.image || currentItem.recognitionImage || ''
          });
        }
      } catch (error) {
        console.warn("Could not fetch additional details for item:", error);
      }
    };
    fetchDesc();
  }, [currentItem]);



  const activeImage = liveData.image || currentItem?.image || currentItem?.recognitionImage || defaultImage;
  const activeTitle = currentItem?.name || currentItem?.title || 'Opera d\'Arte';
  const activeArtist = liveData.artist || currentItem?.artist || currentItem?.author || 'Autore non specificato';
  const activeStyle = liveData.style || currentItem?.style || 'Arte e Cultura';
  const activeDescription = liveData.description || currentItem?.description || currentItem?.desc || 'Descrizione non disponibile per questa opera.';

  return (
    <div
      className={`bottom-sheet-container ${showDescription ? 'expanded' : 'collapsed'}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: showDescription ? 'auto' : 'none' }}
    >
      {/* ---------------- COLLAPSED STATE (MINI PLAYER) ---------------- */}
      <div className={`mini-player ${showDescription ? 'hidden' : ''}`}>
        <div className="mini-player-clickable">
          <div className="mini-player-info">
            <div className="mini-player-img-container">
              <img src={activeImage} alt={activeTitle} />
            </div>
            <div className="mini-player-text">
              <span className="mini-player-title">{activeTitle}</span>
              <span className="mini-player-subtitle">{activeArtist !== 'Autore non specificato' ? activeArtist : museumName}</span>
            </div>
          </div>
        </div>
        
        <div className="mini-player-controls">
          <button className="icon-btn" onClick={onPrev} disabled={!hasPrev} title="Opera precedente">
            <span className="material-symbols-outlined">skip_previous</span>
          </button>
          <button className="mini-play-btn" onClick={onPlayPause} title={isPlaying ? 'Pausa' : 'Riproduci'}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button className="icon-btn" onClick={onNext} disabled={!hasNext} title="Prossima opera">
            <span className="material-symbols-outlined">skip_next</span>
          </button>
        </div>
        
        {/* Progress Bar under mini player */}
        <div className="mini-progress-track">
           <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* ---------------- EXPANDED STATE (ARTWORK DETAIL) ---------------- */}
      <div className={`expanded-view ${showDescription ? 'visible' : ''}`}>
        <header className="expanded-header">
          <button className="action-circle-btn" onClick={() => setShowDescription(false)} title="Chiudi scheda">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="expanded-logo">ArtAround Curator</h1>
        </header>

        <main className="expanded-main no-scrollbar" ref={scrollRef}>
          <section className="hero-section">
            <img src={activeImage} className="hero-img" alt={activeTitle} />
            <div className="hero-gradient"></div>
          </section>

          <div className="content-section">
            <div className="header-block">
              <span className="room-label">{museumName} • Sala {currentItem?.layerId || 1}</span>
              <h2 className="artwork-title">{activeTitle}</h2>
              <div className="artist-row">
                <div className="artist-line"></div>
                <span className="artist-name">{activeArtist}</span>
              </div>
            </div>

            <button className="primary-action-btn" onClick={onPlayPause}>
              <span className="btn-left">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause_circle' : 'play_circle'}
                </span>
                {isPlaying ? 'PAUSA GUIDA AUDIO' : 'ASCOLTA GUIDA AUDIO'}
              </span>
              <span className="btn-right">IT HD</span>
            </button>

            <div className="bento-grid">
              <div className="bento-card">
                <p className="bento-label">Stile / Periodo</p>
                <p className="bento-value">{activeStyle}</p>
              </div>
              <div className="bento-card">
                <p className="bento-label">Collezione</p>
                <p className="bento-value">{museumName}</p>
              </div>
            </div>

            <article className="description-article">
              <div className="flex justify-between items-center mb-1">
                <h3 className="desc-heading">Descrizione dell'Opera</h3>
              </div>
              <p className="desc-body">
                {activeDescription}
              </p>
            </article>

            <section className="tech-stats">
              <div className="stat-row">
                <span className="stat-label">Identificativo Opera</span>
                <span className="stat-value">{currentItem?.artworkId || currentItem?.id || 'N/D'}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Piano / Sala</span>
                <span className="stat-value">Sala {currentItem?.layerId || 1}</span>
              </div>
            </section>

            <button className="dismiss-btn" onClick={() => setShowDescription(false)}>
              CHIUDI DETTAGLI
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
