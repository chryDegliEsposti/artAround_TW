import React, { useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Navigation, Volume2, HelpCircle, ArrowRight } from 'lucide-react';
import './VoiceControlModal.css';

export default function VoiceControlModal({
  isOpen,
  onClose,
  isListening,
  transcript,
  lastFeedback,
  onStartListening,
  onStopListening,
  onSelectCommand
}) {
  useEffect(() => {
    if (isOpen && !isListening) {
      onStartListening();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickCommands = [
    { label: 'Prossima Opera', text: 'prossima opera', icon: 'skip_next' },
    { label: 'Opera Precedente', text: 'opera precedente', icon: 'skip_previous' },
    { label: 'Spiega Capolavoro', text: 'spiega il quadro', icon: 'play_arrow' },
    { label: 'Pausa Audio', text: 'pausa', icon: 'pause' },
    { label: 'Dov\'è il Bagno?', text: 'dov\'è il bagno', icon: 'wc' },
    { label: 'Vai alla Caffetteria', text: 'vai al bar', icon: 'coffee' },
    { label: 'Vai a Raffaello', text: 'vai a Raffaello', icon: 'palette' },
    { label: 'Vai a Guido Reni', text: 'vai a Guido Reni', icon: 'palette' },
    { label: 'Vai al Bedoli', text: 'mostrami il Bedoli', icon: 'palette' },
    { label: 'Strada più Facile', text: 'strada più facile', icon: 'accessible' },
    { label: 'Sali al Primo Piano', text: 'sali al primo piano', icon: 'arrow_upward' },
    { label: 'Scendi al Piano Terra', text: 'scendi al piano terra', icon: 'arrow_downward' }
  ];

  return (
    <div className="voice-overlay fade-in" onClick={onClose}>
      <div className="voice-modal slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="voice-header">
          <div className="voice-title-container">
            <div className="voice-badge">
              <Mic size={16} className="mic-badge-icon" />
              <span>WEB SPEECH API</span>
            </div>
            <h3>Assistente Vocale ArtAround</h3>
            <p className="voice-subtitle">Controlla la visita e la navigazione con comandi vocali in lingua naturale.</p>
          </div>
          <button className="voice-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Listening Animation & Transcript Area */}
        <div className="voice-visualizer-container">
          <button 
            className={`voice-mic-main-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? onStopListening : onStartListening}
            title={isListening ? 'Tocca per fermare l\'ascolto' : 'Tocca per parlare'}
          >
            {isListening ? (
              <div className="pulse-waves-wrapper">
                <span className="wave-ring wave-1"></span>
                <span className="wave-ring wave-2"></span>
                <span className="wave-ring wave-3"></span>
                <Mic size={36} color="#fff" />
              </div>
            ) : (
              <MicOff size={32} color="#94a3b8" />
            )}
          </button>

          <div className="voice-status-text">
            {isListening ? (
              <span className="status-badge active">🔴 In ascolto... Parla ora</span>
            ) : (
              <span className="status-badge idle">⚪ Tocca il microfono per parlare</span>
            )}
          </div>

          {/* Real-time transcript display */}
          <div className="transcript-box">
            <p className="transcript-text">
              {transcript ? `"${transcript}"` : <em>"Pronuncia un comando come: 'prossima opera', 'dov'è il bagno', o 'vai a Raffaello'..."</em>}
            </p>
          </div>

          {/* Feedback message */}
          {lastFeedback && (
            <div className="voice-feedback-toast slide-in-top">
              <Volume2 size={16} />
              <span>{lastFeedback}</span>
            </div>
          )}
        </div>

        {/* Quick Command Suggestions */}
        <div className="voice-suggestions-section">
          <div className="section-title">
            <Sparkles size={16} />
            <span>COMANDI VOCALI RAPIDI (TOCCA PER ESEGUIRE)</span>
          </div>

          <div className="command-chips-grid no-scrollbar">
            {quickCommands.map((cmd, i) => (
              <button
                key={i}
                className="command-chip"
                onClick={() => onSelectCommand(cmd.text)}
              >
                <span>{cmd.label}</span>
                <ArrowRight size={14} className="chip-arrow" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
