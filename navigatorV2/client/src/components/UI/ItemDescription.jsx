import { X, Headphones, Info } from 'lucide-react';
import './ItemDescription.css';

export default function ItemDescription({ item, onClose }) {
  if (!item) return null;

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
            <button className="btn btn-secondary action-icon-btn">
              <Headphones size={20} />
              Audio Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
