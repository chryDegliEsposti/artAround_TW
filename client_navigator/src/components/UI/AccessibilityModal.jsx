import React from 'react';
import { Accessibility, X, Check, Volume2, Type, Route, Eye, Sparkles } from 'lucide-react';
import './AccessibilityModal.css';

export default function AccessibilityModal({
  isOpen,
  onClose,
  accessibleRoute,
  onToggleAccessibleRoute,
  fontSizeMultiplier,
  onChangeFontSize,
  speechRate,
  onChangeSpeechRate,
  autoPlayAudio,
  onToggleAutoPlayAudio,
  highContrast,
  onToggleHighContrast
}) {
  if (!isOpen) return null;

  return (
    <div className="access-overlay fade-in" onClick={onClose}>
      <div className="access-modal slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="access-header">
          <div className="access-title-block">
            <div className="access-badge">
              <Accessibility size={18} className="access-badge-icon" />
              <span>ACCESSIBILITÀ INCLUSIVA</span>
            </div>
            <h2>Preferenze di Accessibilità</h2>
            <p className="access-subtitle">Personalizza percorsi fisici, visualizzazione e ascolto per una visita senza barriere.</p>
          </div>
          <button className="access-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="access-body no-scrollbar">

          {/* 1. Percorso Senza Barriere (Strada Facile) */}
          <div className="access-setting-card">
            <div className="setting-info">
              <div className="setting-icon-box blue">
                <Route size={22} />
              </div>
              <div>
                <h4 className="setting-title">Percorso Senza Barriere (Strada Facile)</h4>
                <p className="setting-desc">Evita gradini e scale, privilegiando ascensori, rampe e corridoi ampi per carrozzine e mobilità ridotta.</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={accessibleRoute}
                onChange={onToggleAccessibleRoute}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 2. Dimensione Testo */}
          <div className="access-setting-card col">
            <div className="setting-info">
              <div className="setting-icon-box purple">
                <Type size={22} />
              </div>
              <div>
                <h4 className="setting-title">Dimensione Testo e Schede</h4>
                <p className="setting-desc">Aumenta la grandezza dei caratteri delle didascalie e spiegazioni per ipovedenti.</p>
              </div>
            </div>
            <div className="font-size-options">
              <button 
                className={`font-btn ${fontSizeMultiplier === 1 ? 'active' : ''}`}
                onClick={() => onChangeFontSize(1)}
              >
                Aa Normale (100%)
              </button>
              <button 
                className={`font-btn ${fontSizeMultiplier === 1.2 ? 'active' : ''}`}
                onClick={() => onChangeFontSize(1.2)}
              >
                Aa Grande (120%)
              </button>
              <button 
                className={`font-btn ${fontSizeMultiplier === 1.4 ? 'active' : ''}`}
                onClick={() => onChangeFontSize(1.4)}
              >
                Aa Molto Grande (140%)
              </button>
            </div>
          </div>

          {/* 3. Velocità Guida Audio */}
          <div className="access-setting-card col">
            <div className="setting-info">
              <div className="setting-icon-box green">
                <Volume2 size={22} />
              </div>
              <div>
                <h4 className="setting-title">Velocità Voce della Guida Audio</h4>
                <p className="setting-desc">Regola il ritmo di lettura per favorire la comprensione.</p>
              </div>
            </div>
            <div className="speed-options">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  className={`speed-btn ${speechRate === rate ? 'active' : ''}`}
                  onClick={() => onChangeSpeechRate(rate)}
                >
                  {rate === 0.75 ? '0.75x Lenta' : rate === 1.0 ? '1.0x Normale' : `${rate}x`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Lettura Automatica alla Prossimità */}
          <div className="access-setting-card">
            <div className="setting-info">
              <div className="setting-icon-box amber">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="setting-title">Lettura Automatica alla Prossimità</h4>
                <p className="setting-desc">Avvia automaticamente la descrizione audio appena ti trovi davanti all'opera.</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={onToggleAutoPlayAudio}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 5. Alto Contrasto */}
          <div className="access-setting-card">
            <div className="setting-info">
              <div className="setting-icon-box teal">
                <Eye size={22} />
              </div>
              <div>
                <h4 className="setting-title">Modalità Alto Contrasto</h4>
                <p className="setting-desc">Massimizza il contrasto tra sfondi e testi per una lettura ottimale.</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={onToggleHighContrast}
              />
              <span className="slider"></span>
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="access-footer">
          <button className="access-save-btn" onClick={onClose}>
            <Check size={18} />
            <span>Applica Preferenze</span>
          </button>
        </div>

      </div>
    </div>
  );
}
