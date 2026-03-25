import { useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Mic, Accessibility as EasierIcon, MapPin } from 'lucide-react';
import './BottomBar.css';

export default function BottomBar({
  onPrev,
  onNext,
  onPlayPause,
  onMic,
  onEasier,
  isPlaying,
  hasPrev,
  hasNext,
  progress = 0,
  showDescription,
  setShowDescription,
  currentItem
}) {
  const dragStartY = useRef(null);
  const dragStartTarget = useRef(null);

  const handlePointerDown = useCallback((e) => {
    dragStartY.current = e.clientY;
    dragStartTarget.current = e.target;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (dragStartY.current === null) return;
    const deltaY = dragStartY.current - e.clientY;
    const startTarget = dragStartTarget.current;
    dragStartY.current = null;
    dragStartTarget.current = null;

    // Check if this was a swipe gesture (large vertical movement)
    if (Math.abs(deltaY) > 30) {
      if (deltaY > 0) {
        setShowDescription(true);  // swipe up → expand
      } else {
        setShowDescription(false); // swipe down → collapse
      }
      return;
    }

    // Small movement = click. If clicked on the pull handle area, toggle.
    const handleArea = startTarget?.closest('.pull-handle-area');
    if (handleArea) {
      setShowDescription(prev => !prev);
    }
  }, [setShowDescription]);

  return (
    <div
      className={`bottom-sheet-container ${showDescription ? 'expanded' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Pull Handle Area — tap to toggle, drag/swipe to expand/collapse */}
      <div className="pull-handle-area">
        <div className="pull-indicator"></div>
      </div>

      <div className="bottom-sheet-content">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Lower Bar Controls — Always Visible */}
        <div className="controls-container">
          <div className="side-controls">
            <button className="control-btn secondary-control" onClick={onEasier} aria-label="Easier Route"><EasierIcon size={22} /></button>
            <button className="control-btn secondary-control" onClick={onPrev} disabled={!hasPrev} aria-label="Previous Item"><SkipBack size={24} /></button>
          </div>
          <div className="center-anchor">
            <button
              className="control-btn primary-control play-btn"
              onClick={onPlayPause}
              aria-label={isPlaying ? "Pause Tour" : "Start/Resume Tour"}
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="play-icon-offset" />}
            </button>
          </div>
          <div className="side-controls">
            <button className="control-btn secondary-control" onClick={onNext} disabled={!hasNext} aria-label="Next Item"><SkipForward size={24} /></button>
            <button className="control-btn secondary-control" onClick={onMic} aria-label="Microphone"><Mic size={22} /></button>
          </div>
        </div>

        {/* Item Description Layer — accessible via swipe/tap on handle */}
        <div className={`description-layer ${showDescription ? 'visible' : ''}`}>
          <div className="description-header">
            <MapPin size={18} className="desc-icon" />
            <span className="desc-label">Next stop</span>
          </div>

          <h3 className="desc-title">{currentItem?.name || 'Loading...'}</h3>
          <p className="desc-text">
            {currentItem?.desc || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
          </p>
        </div>
      </div>
    </div>
  );
}
