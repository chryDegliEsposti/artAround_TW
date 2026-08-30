import { useRef, useCallback, useEffect, useState } from 'react';
import './BottomBar.css';

export default function BottomBar({
  onPrev,
  onNext,
  onPlayPause,
  onMic,
  onEasier,
  onSeekBack,
  onSeekForward,
  isPlaying,
  hasPrev,
  hasNext,
  progress = 0,
  showDescription,
  setShowDescription,
  currentItem,
  fontSizeMultiplier = 1,
  highContrast = false
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
  const dummyText = "Un capolavoro della pittura conservato presso la Pinacoteca Nazionale di Bologna. L'opera si distingue per l'alta maestria compositiva, l'uso calibrato della luce e la ricchezza cromatica.";

  const [liveData, setLiveData] = useState({ description: dummyText, style: 'Rinascimento', artist: 'Artista Pinacoteca' });
  const originalDescRef = useRef(dummyText);

  useEffect(() => {
    if (!currentItem) return;
    const fetchDesc = async () => {
      try {
        const response = await fetch(`/api/v1/navigator/museums/item/${currentItem.id}`);
        const data = await response.json();
        if (data) {
          const desc = data.description || currentItem.desc || dummyText;
          originalDescRef.current = desc;
          setLiveData({
            description: desc,
            style: data.style || currentItem.style || 'Scuola Emiliana',
            artist: data.artist || currentItem.artist || 'Artista Pinacoteca'
          });
          setSelectedLang('it');
          setSelectedTone('medio');
        }
      } catch (error) {
        const desc = currentItem.desc || dummyText;
        originalDescRef.current = desc;
        setLiveData({
          description: desc,
          style: currentItem.style || 'Scuola Emiliana',
          artist: currentItem.artist || 'Artista Pinacoteca'
        });
      }
    };
    fetchDesc();
  }, [currentItem]);



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
              <img src={currentItem?.image || defaultImage} alt={currentItem?.name || "Opera"} />
            </div>
            <div className="mini-player-text">
              <span className="mini-player-title">{currentItem?.name || 'Caricamento...'}</span>
              <span className="mini-player-subtitle">{currentItem?.artist || 'Pinacoteca di Bologna'}</span>
            </div>
          </div>
        </div>
        
        <div className="mini-player-controls">
          <button className="icon-btn" onClick={onPrev} disabled={!hasPrev}>
            <span className="material-symbols-outlined">skip_previous</span>
          </button>
          <button className="mini-play-btn" onClick={onPlayPause}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          <button className="icon-btn" onClick={onNext} disabled={!hasNext}>
            <span className="material-symbols-outlined">skip_next</span>
          </button>
        </div>
        
        {/* Progress Bar under mini player */}
        <div className="mini-progress-track">
           <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* ---------------- EXPANDED STATE (ARTWORK DETAIL) ---------------- */}
      <div 
        className={`expanded-view ${showDescription ? 'visible' : ''} ${highContrast ? 'high-contrast-mode' : ''}`}
        style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
      >
        <header className="expanded-header">
          <button className="action-circle-btn" onClick={() => setShowDescription(false)} title="Chiudi scheda">
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="expanded-logo">ArtAround Curator</h1>
          <div className="flex items-center gap-2">
            <button className="action-circle-btn" onClick={onEasier} title="Impostazioni Accessibilità">
              <span className="material-symbols-outlined">accessibility</span>
            </button>
          </div>
        </header>

        <main className="expanded-main no-scrollbar" ref={scrollRef}>
          <section className="hero-section">
            <img src={currentItem?.image || defaultImage} className="hero-img" alt={currentItem?.name || "Opera"} />
            <div className="hero-gradient"></div>
          </section>

          <div className="content-section">
            <div className="header-block">
              <span className="room-label">Pinacoteca Nazionale di Bologna • Sala {currentItem?.layerId || 1}</span>
              <h2 className="artwork-title" style={{ fontSize: `${fontSizeMultiplier * 1.5}rem` }}>{currentItem?.name || 'Capolavoro'}</h2>
              <div className="artist-row">
                <div className="artist-line"></div>
                <span className="artist-name">{currentItem?.artist || 'Autore Sconosciuto'}</span>
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
                <p className="bento-value">{liveData.style || 'Pittura Emiliana'}</p>
              </div>
              <div className="bento-card">
                <p className="bento-label">Collezione</p>
                <p className="bento-value">Pinacoteca Bologna</p>
              </div>
            </div>

            <article className="description-article" style={{ fontSize: `${fontSizeMultiplier * 1}rem`, lineHeight: 1.6 }}>
              <div className="flex justify-between items-center mb-1">
                <h3 className="desc-heading">Descrizione dell'Opera</h3>
                 
              </div>
              <p className="desc-body">
                {liveData.description || currentItem?.desc || 'Descrizione non disponibile.'}
              </p>
            </article>

            <section className="tech-stats">
              <div className="stat-row">
                <span className="stat-label">Accession Number</span>
                <span className="stat-value">INV. 779</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Dimensions</span>
                <span className="stat-value">77 cm × 53 cm</span>
              </div>
            </section>

            <button className="dismiss-btn" onClick={() => setShowDescription(false)}>
              CLOSE DETAILS
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
