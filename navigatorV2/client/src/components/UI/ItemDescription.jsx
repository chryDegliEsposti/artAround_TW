import { X, Headphones, Info, Play, Pause } from 'lucide-react';
import { useEffect, useState } from 'react';
import './ItemDescription.css';
import { useSpeaker } from '../../utils/useSpeaker.js'

export default function ItemDescription({ item, onClose, onPlayPause, isPlaying }) {
  if (!item) return null;

  const { speak, stop, isSpeaking } = useSpeaker();

  // Ensure speech stops when the component unmounts
  useEffect(() => {
    return () => stop();
  }, [stop]);

  if (!item) return null;

  const handleAudioToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(item.desc);
    }
  };

  const handleClose = () => {
    stop();
    onClose();
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
              {isPlaying ? 'Pause Audio' : 'Play Audio'}
            </button>
            <button className="btn btn-secondary action-icon-btn">
              <Headphones size={20} />
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
