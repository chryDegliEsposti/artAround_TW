import { Play, Pause, SkipBack, SkipForward, Mic, Accessibility as EasierIcon, ChevronUp, ChevronDown, Info, Headphones } from 'lucide-react';
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
  return (
    <div className={`bottom-sheet-container ${showDescription ? 'expanded' : ''}`}>
      {/* Static Handle Area (Description triggers purely from Play button now) */}
      <div className="pull-handle-area">
        <div className="pull-indicator"></div>
      </div>

      <div className="bottom-sheet-content">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Lower Bar Controls - Always Visible */}
        <div className="controls-container">
          <div className="side-controls">
            <button className="control-btn secondary-control" onClick={onEasier} aria-label="Easier Route"><EasierIcon size={22} /></button>
            <button className="control-btn secondary-control" onClick={onPrev} disabled={!hasPrev} aria-label="Previous Item"><SkipBack size={24} /></button>
          </div>
          
          <div className="center-anchor">
            {/* Play Button */}
            <button 
              className="control-btn primary-control play-btn" 
              onClick={() => {
                onPlayPause();
                setShowDescription(!showDescription); // Explicit toggle
              }} 
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

        {/* Item Description Layer */}
        <div className={`description-layer ${showDescription ? 'visible' : ''}`}>
          <div className="item-image-placeholder">
            <Info size={48} className="placeholder-icon" />
          </div>
          
          <div className="item-content-body">
            <div className="item-badge">In front of you</div>
            <h3>{currentItem?.name || 'Loading...'}</h3>
            <p className="item-text">
              {currentItem?.desc || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'}
            </p>
            
            <div className="item-actions">
              <button className="btn btn-secondary action-icon-btn" style={{ width: '100%' }}>
                <Headphones size={20} />
                Listen to Audio Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
