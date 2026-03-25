import { X, Info, Play, Pause } from 'lucide-react';
import './ItemDescription.css';

export default function ItemDescription({ item, onClose, onPlayPause, isPlaying, currentTime, duration, onSeek }) {
  if (!item) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="item-description-overlay fade-in">
      <div className="item-description-card slide-up">
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>

        <div className="item-image-placeholder">
          <Info size={48} className="placeholder-icon" />
        </div>

        <div className="item-content">
          <div className="item-badge">In front of you</div>
          <h3>{item.name}</h3>
          <p className="item-text">{item.desc}</p>

          <div className="item-actions">
            <button
              className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'} action-icon-btn play-action-btn`}
              onClick={onPlayPause}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            
            <div className="audio-progress-container">
              <span className="time-text">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                className="audio-slider"
                min="0"
                max={duration || 100}
                value={currentTime || 0}
                onChange={(e) => onSeek(Number(e.target.value))}
              />
              <span className="time-text">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
