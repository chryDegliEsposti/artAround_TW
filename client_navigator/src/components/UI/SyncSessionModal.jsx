import React, { useState, useEffect } from 'react';
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
  connectedStudents = [],
  studentInquiries = [],
  onStartTeacherSession,
  onJoinVisitorSession,
  onLeaveSyncSession,
  onBroadcastState,
  onStartGroupQuiz,
  onAskQuestion,
  teacherQuizResults = []
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(isTeacherMode ? 'teacher' : 'visitor');
  const [mnemonicInput, setMnemonicInput] = useState(activeMnemonic || 'Fenice rossa');
  const [visitorNameInput, setVisitorNameInput] = useState('');
  const [studentQuestionInput, setStudentQuestionInput] = useState('');
  const [teacherViewSubTab, setTeacherViewSubTab] = useState('controls'); // 'controls', 'students', 'inquiries', 'quizzes'

  useEffect(() => {
    if (isTeacherMode) {
      setActiveTab('teacher');
    } else if (isSyncedVisitor) {
      setActiveTab('visitor');
    }
  }, [isTeacherMode, isSyncedVisitor, isOpen]);

  const handleStartTeacher = () => {
    if (!mnemonicInput) return;
    onStartTeacherSession(mnemonicInput);
  };

  const handleJoinVisitor = () => {
    if (!mnemonicInput) return;
    onJoinVisitorSession(mnemonicInput, visitorNameInput || 'Studente');
  };

  const handleSendQuestion = (e) => {
    e.preventDefault();
    if (!studentQuestionInput.trim()) return;
    if (onAskQuestion) {
      onAskQuestion(studentQuestionInput.trim());
    }
    setStudentQuestionInput('');
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

        {/* Tab Selection */}
        <div className="sync-tabs">
          <button
            className={`sync-tab ${activeTab === 'visitor' ? 'active' : ''}`}
            onClick={() => setActiveTab('visitor')}
          >
            <Compass size={18} />
            <span>Partecipa come Studente / Visitatore</span>
          </button>
          <button
            className={`sync-tab ${activeTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveTab('teacher')}
          >
            <GraduationCap size={18} />
            <span>Modalità Docente / Guida</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="sync-body">
          
          {/* ================= VISITOR TAB ================= */}
          {activeTab === 'visitor' && (
            <div className="tab-pane">
              {isSyncedVisitor ? (
                <div className="synced-active-box">
                  <div className="status-indicator">
                    <span className="dot pulse-green"></span>
                    <span className="status-text">Sincronizzato con: <strong>{activeMnemonic}</strong></span>
                  </div>
                  <p className="status-desc">
                    I tuoi movimenti, le tappe e le spiegazioni audio sono sincronizzati in tempo reale con la guida del docente.
                  </p>

                  <div className="participants-count">
                    <Users size={16} />
                    <span>Dispositivi connessi al gruppo: <strong>{connectedVisitorsCount}</strong></span>
                  </div>

                  {/* Ask Question / Deeper Explanation Form */}
                  <form onSubmit={handleSendQuestion} className="student-question-box mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                      <HelpCircle size={14} />
                      Fai una domanda o chiedi un approfondimento alla Docente:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentQuestionInput}
                        onChange={(e) => setStudentQuestionInput(e.target.value)}
                        placeholder="Es: Perché l'artista ha usato questo colore?..."
                        className="flex-1 px-3 py-2 bg-slate-900/90 border border-white/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={!studentQuestionInput.trim()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition shrink-0"
                      >
                        <Send size={13} />
                        <span>Invia</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      💡 La docente riceverà la tua domanda in tempo reale con l'opera d'arte che stai osservando.
                    </span>
                  </form>

                  <button className="leave-sync-btn mt-4 w-full" onClick={onLeaveSyncSession}>
                    Esci dalla Sessione Sincronizzata
                  </button>
                </div>
              ) : (
                <div className="join-session-box">
                  <label className="input-label">Inserisci il Nome Mnemonico della Sessione</label>
                  <input
                    type="text"
                    className="sync-input mb-3"
                    value={mnemonicInput}
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    placeholder="es. Fenice rossa"
                  />

                  <div className="quick-mnemonics mb-4">
                    <span className="text-xs text-slate-400">Suggeriti:</span>
                    <button type="button" onClick={() => setMnemonicInput('Fenice rossa')} className="mnemonic-tag">Fenice rossa</button>
                    <button type="button" onClick={() => setMnemonicInput('Torre dorata')} className="mnemonic-tag">Torre dorata</button>
                    <button type="button" onClick={() => setMnemonicInput('Leone verde')} className="mnemonic-tag">Leone verde</button>
                  </div>

                  <label className="input-label">Il Tuo Nome / Nickname Studente</label>
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
                        <span>{connectedStudents.length || connectedVisitorsCount} studenti connessi</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Subtabs */}
                  <div className="flex gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-white/10 my-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setTeacherViewSubTab('controls')}
                      className={`flex-1 py-1.5 rounded-lg transition text-center ${teacherViewSubTab === 'controls' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Comandi Broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherViewSubTab('students')}
                      className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${teacherViewSubTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <span>Studenti</span>
                      <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{connectedStudents.length || connectedVisitorsCount}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherViewSubTab('inquiries')}
                      className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${teacherViewSubTab === 'inquiries' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <span>Domande</span>
                      {studentInquiries.length > 0 && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-[10px]">{studentInquiries.length}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeacherViewSubTab('quizzes')}
                      className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${teacherViewSubTab === 'quizzes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      <span>Quiz ({teacherQuizResults.length})</span>
                    </button>
                  </div>

                  {/* Subtab 1: Broadcast Controls */}
                  {teacherViewSubTab === 'controls' && (
                    <div className="space-y-3">
                      <div className="control-group">
                        <h4 className="group-title">Comandi Trasmissione alla Classe</h4>
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

                      {/* Quick Live Students Overview */}
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Users size={14} className="text-emerald-400" />
                            Studenti Connessi ({connectedStudents.length || connectedVisitorsCount})
                          </span>
                          <button 
                            type="button"
                            onClick={() => setTeacherViewSubTab('students')}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            Vedi Tutti &rarr;
                          </button>
                        </div>
                        {connectedStudents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                            {connectedStudents.map((st, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {st.visitorName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            {connectedVisitorsCount > 0 
                              ? `${connectedVisitorsCount} dispositivi in ascolto.`
                              : "In attesa che gli studenti digitino il codice \"" + activeMnemonic + "\"..."}
                          </p>
                        )}
                      </div>

                      {/* Quick Inquiries Notification */}
                      {studentInquiries.length > 0 && (
                        <div 
                          className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl cursor-pointer hover:bg-amber-500/15 transition"
                          onClick={() => setTeacherViewSubTab('inquiries')}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                              <HelpCircle size={14} />
                              {studentInquiries.length} {studentInquiries.length === 1 ? 'Nuova Domanda' : 'Nuove Domande'}
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-bold">Apri Registro &rarr;</span>
                          </div>
                          <p className="text-xs text-white truncate">
                            <strong>{studentInquiries[0].visitorName}:</strong> "{studentInquiries[0].text}"
                          </p>
                        </div>
                      )}

                      {/* Quick Quiz Results */}
                      {teacherQuizResults.length > 0 && (
                        <div 
                          className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl cursor-pointer hover:bg-indigo-500/15 transition"
                          onClick={() => setTeacherViewSubTab('quizzes')}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                              <Award size={14} />
                              {teacherQuizResults.length} Quiz Consegnati
                            </span>
                            <span className="text-[10px] text-indigo-400 font-bold">Vedi Voti &rarr;</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Ultimo: <strong>{teacherQuizResults[teacherQuizResults.length - 1].visitorName}</strong> ({teacherQuizResults[teacherQuizResults.length - 1].score}/{teacherQuizResults[teacherQuizResults.length - 1].total})
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 2: Connected Students List */}
                  {teacherViewSubTab === 'students' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="group-title mb-0">Appello Studenti Connessi</h4>
                        <span className="text-xs text-emerald-400 font-semibold">{connectedStudents.length || connectedVisitorsCount} in aula virtuale</span>
                      </div>

                      {connectedStudents.length === 0 ? (
                        <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-slate-400">
                          {connectedVisitorsCount > 0 
                            ? `${connectedVisitorsCount} dispositivi connessi alla stanza.`
                            : "Nessuno studente ancora connesso. Comunica il codice \"" + activeMnemonic + "\" alla classe."}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {connectedStudents.map((st, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="font-bold text-white">{st.visitorName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {st.joinedAt ? new Date(st.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Connesso'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 3: Student Inquiries / Questions Log ("Chi ha chiesto cosa") */}
                  {teacherViewSubTab === 'inquiries' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="group-title mb-0">Registro Domande & Approfondimenti Live</h4>
                        <span className="text-[11px] text-slate-400">Chi ha chiesto cosa</span>
                      </div>

                      {studentInquiries.length === 0 ? (
                        <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-slate-400">
                          Nessuna domanda o richiesta inviata finora dagli studenti.
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                          {studentInquiries.map((inq, idx) => (
                            <div key={inq.id || idx} className="p-3 bg-white/5 border border-indigo-500/20 rounded-2xl text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  {inq.visitorName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {inq.timestamp ? new Date(inq.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <div className="text-[11px] text-indigo-300 font-semibold">
                                Su: {inq.artworkTitle}
                              </div>
                              <p className="text-white text-xs bg-black/30 p-2 rounded-xl border border-white/5">
                                "{inq.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtab 4: Quiz Results Table */}
                  {teacherViewSubTab === 'quizzes' && (
                    <div className="quiz-results-live">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="group-title mb-0">Esiti Quiz Somministrato</h4>
                        <button
                          type="button"
                          onClick={onStartGroupQuiz}
                          className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition"
                        >
                          Nuovo Quiz
                        </button>
                      </div>

                      {teacherQuizResults.length === 0 ? (
                        <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-slate-400">
                          Nessun quiz ancora completato. Avvia un quiz dalla scheda "Comandi".
                        </div>
                      ) : (
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
                      )}
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
