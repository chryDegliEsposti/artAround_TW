import React, { useState } from 'react';
import {
  Users,
  Radio,
  Sparkles,
  GraduationCap,
  Compass,
  Volume2,
  HelpCircle,
  Play,
  SkipForward,
  SkipBack,
  CheckCircle2,
  X,
  Send,
  Award
} from 'lucide-react';
import './SyncSessionModal.css';

export default function SyncSessionModal({
  isOpen,
  onClose,
  isTeacherMode,
  isSyncedVisitor,
  activeMnemonic,
  connectedVisitorsCount,
  onStartTeacherSession,
  onJoinVisitorSession,
  onLeaveSyncSession,
  onBroadcastState,
  onStartGroupQuiz,
  teacherQuizResults = []
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(isTeacherMode ? 'teacher' : 'visitor');
  const [mnemonicInput, setMnemonicInput] = useState(activeMnemonic || 'Fenice rossa');
  const [visitorNameInput, setVisitorNameInput] = useState('');

  const handleStartTeacher = () => {
    if (!mnemonicInput) return;
    onStartTeacherSession(mnemonicInput);
  };

  const handleJoinVisitor = () => {
    if (!mnemonicInput) return;
    onJoinVisitorSession(mnemonicInput, visitorNameInput || 'Studente');
  };

  return (
    <div className="sync-overlay fade-in">
      <div className="sync-modal slide-up">
        
        {/* Header */}
        <div className="sync-header">
          <div className="flex items-center gap-3">
            <div className="sync-icon-container">
              <Radio size={22} className="text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2>Visita Sincronizzata Real-Time</h2>
              <p className="sync-subtitle">Guida di gruppo e interazione docente-studenti con Socket.io</p>
            </div>
          </div>
          <button className="sync-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="sync-tabs">
          <button
            className={`sync-tab ${activeTab === 'visitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('visitor')}
          >
            <Compass size={18} />
            <span>Modalità Visitatore / Studente</span>
          </button>
          <button
            className={`sync-tab ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            <GraduationCap size={18} />
            <span>Modalità Docente / Guida</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="sync-body no-scrollbar">
          
          {/* ================= VISITOR TAB ================= */}
          {activeTab === 'visitor' && (
            <div className="tab-pane">
              {isSyncedVisitor ? (
                <div className="active-sync-card visitor-synced">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="pulse-dot"></div>
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Sincronizzazione Attiva</span>
                        <h3 className="text-lg font-bold text-white">Stanza: {activeMnemonic}</h3>
                      </div>
                    </div>
                    <button className="leave-sync-btn" onClick={onLeaveSyncSession}>
                      Disconnetti
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    La tua mappa, il piano dell'edificio e la scheda dell'opera sono collegati ai movimenti del docente.
                  </p>
                </div>
              ) : (
                <div className="join-form-box">
                  <label className="input-label">Nome Mnemonico Visita (o Codice Stanza)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      className="sync-input"
                      value={mnemonicInput}
                      onChange={(e) => setMnemonicInput(e.target.value)}
                      placeholder="es. Fenice rossa"
                    />
                  </div>

                  <div className="quick-mnemonics mb-4">
                    <span className="text-xs text-slate-400">Visita ufficiale consigliata:</span>
                    <button
                      className="quick-chip"
                      onClick={() => setMnemonicInput('Fenice rossa')}
                    >
                      <Sparkles size={14} className="text-amber-400" />
                      <span>Fenice rossa (Classe 4B)</span>
                    </button>
                  </div>

                  <label className="input-label">Il tuo Nome / Nickname (opzionale)</label>
                  <input
                    type="text"
                    className="sync-input mb-4"
                    value={visitorNameInput}
                    onChange={(e) => setVisitorNameInput(e.target.value)}
                    placeholder="es. Marco Bianchi"
                  />

                  <button className="primary-sync-btn join-btn" onClick={handleJoinVisitor}>
                    <Compass size={18} />
                    <span>Unisciti alla Visita Sincronizzata</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TEACHER TAB ================= */}
          {activeTab === 'teacher' && (
            <div className="tab-pane">
              {isTeacherMode ? (
                <div className="teacher-dashboard">
                  <div className="teacher-status-banner">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold text-amber-400">Sessione Guida Aperta</span>
                        <h3 className="text-xl font-bold text-white">Stanza: {activeMnemonic}</h3>
                      </div>
                      <div className="participants-badge">
                        <Users size={16} />
                        <span>{connectedVisitorsCount} studenti connessi</span>
                      </div>
                    </div>
                  </div>

                  {/* Broadcast Controls */}
                  <div className="control-group">
                    <h4 className="group-title">Comandi Broadcast alla Classe</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button className="broadcast-btn" onClick={() => onBroadcastState('POS')}>
                        <Radio size={16} className="text-indigo-400" />
                        <span>Trasmetti Posizione</span>
                      </button>
                      <button className="broadcast-btn" onClick={() => onBroadcastState('AUDIO')}>
                        <Volume2 size={16} className="text-emerald-400" />
                        <span>Avvia Audio a Tutti</span>
                      </button>
                      <button className="broadcast-btn" onClick={() => onBroadcastState('PREV')}>
                        <SkipBack size={16} className="text-blue-400" />
                        <span>Opera Precedente</span>
                      </button>
                      <button className="broadcast-btn" onClick={() => onBroadcastState('NEXT')}>
                        <SkipForward size={16} className="text-blue-400" />
                        <span>Prossima Opera</span>
                      </button>
                    </div>

                    <button className="quiz-trigger-btn mt-3" onClick={onStartGroupQuiz}>
                      <Award size={18} className="text-amber-400" />
                      <span>⚡ Somministra Quiz Finale alla Classe</span>
                    </button>
                  </div>

                  {/* Quiz Results Table */}
                  {teacherQuizResults.length > 0 && (
                    <div className="quiz-results-live mt-4">
                      <h4 className="group-title">Risultati Quiz Classe ({teacherQuizResults.length} completati)</h4>
                      <div className="results-table-box">
                        <table className="results-table">
                          <thead>
                            <tr>
                              <th>Studente</th>
                              <th>Punteggio</th>
                              <th>Esito</th>
                            </tr>
                          </thead>
                          <tbody>
                            {teacherQuizResults.map((r, idx) => (
                              <tr key={idx}>
                                <td>{r.visitorName}</td>
                                <td>{r.score}/{r.total} ({r.percentage}%)</td>
                                <td>
                                  <span className={`status-pill ${r.percentage >= 60 ? 'pass' : 'fail'}`}>
                                    {r.percentage >= 60 ? 'Superato' : 'Da Rivedere'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <button className="leave-sync-btn mt-4 w-full" onClick={onLeaveSyncSession}>
                    Termina Sessione Docente
                  </button>
                </div>
              ) : (
                <div className="start-teacher-box">
                  <label className="input-label">Definisci il Nome Mnemonico della Sessione</label>
                  <input
                    type="text"
                    className="sync-input mb-3"
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    placeholder="es. Fenice rossa"
                  />
                  <p className="text-xs text-slate-400 mb-4">
                    Gli studenti della classe utilizzeranno questo nome mnemonico per connettersi ai tuoi movimenti in tempo reale.
                  </p>

                  <button className="primary-sync-btn teacher-btn" onClick={handleStartTeacher}>
                    <GraduationCap size={18} />
                    <span>Avvia Visita Sincronizzata Docente</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
