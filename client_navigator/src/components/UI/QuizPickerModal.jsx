import React, { useState, useEffect } from 'react';
import {
  Award,
  HelpCircle,
  Clock,
  User,
  PlusCircle,
  Play,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import './QuizPickerModal.css';

export default function QuizPickerModal({
  isOpen,
  onClose,
  museumId = 'PIN-BO',
  museumName = 'Pinacoteca Nazionale di Bologna',
  onSelectAndLaunchQuiz
}) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('apiToken') || localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch(`/api/v1/marketplace/quizzes/by-museum/${museumId}`, { headers });
        if (res.ok) {
          const json = await res.json();
          setQuizzes(json.data || []);
        } else {
          setQuizzes([]);
        }
      } catch (err) {
        console.error("Errore caricamento quiz:", err);
        setError("Impossibile caricare i quiz per questo museo.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [isOpen, museumId]);

  if (!isOpen) return null;

  const defaultStandardQuiz = {
    _id: 'standard-pinbo',
    title: 'Quiz di Competenza: I Capolavori della Pinacoteca (Standard)',
    description: 'Questionario ufficiale su Raffaello, Bedoli, Carracci e Guido Reni.',
    timeLimitMinutes: 10,
    questions: [
      {
        question: "Quale celebre santo è raffigurato nel ritratto di frate dipinto da Girolamo Mazzola Bedoli?",
        options: ["San Tommaso d'Aquino", "San Francesco d'Assisi", "San Petronio", "San Domenico"],
        correctAnswerIndex: 0
      },
      {
        question: "Quale strumento musicale suona Santa Cecilia nel celebre dipinto di Raffaello?",
        options: ["Liuto", "Organo portatile", "Arpa", "Violino"],
        correctAnswerIndex: 1
      },
      {
        question: "Quale schema compositivo caratterizza la 'Strage degli innocenti' di Guido Reni?",
        options: ["Piramidale inverso", "Orizzontale a fregio", "Circolare", "Prospettiva aerea"],
        correctAnswerIndex: 0
      }
    ],
    teacherName: 'Ministero / Predefinito'
  };

  const allAvailableQuizzes = quizzes.length > 0 ? quizzes : [defaultStandardQuiz];

  const toggleExpand = (id) => {
    setExpandedQuizId(expandedQuizId === id ? null : id);
  };

  const handleLaunch = (quiz) => {
    onSelectAndLaunchQuiz(quiz);
    onClose();
  };

  return (
    <div className="quiz-picker-overlay fade-in">
      <div className="quiz-picker-modal slide-up">
        
        {/* Header */}
        <div className="quiz-picker-header">
          <div className="flex items-center gap-3">
            <div className="quiz-picker-icon-box">
              <Award size={24} className="text-amber-400" />
            </div>
            <div>
              <h2>Seleziona Quiz per la Classe</h2>
              <p className="quiz-picker-subtitle">
                {museumName} ({museumId}) • Scegli il questionario da somministrare
              </p>
            </div>
          </div>
          <button className="quiz-picker-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="quiz-picker-body no-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Questionari Disponibili ({allAvailableQuizzes.length})
            </span>
            <a
              href={`/marketplace/homepage/createQuiz?museumId=${museumId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="create-new-quiz-link"
            >
              <PlusCircle size={14} />
              <span>Crea Nuovo Quiz</span>
            </a>
          </div>

          {loading ? (
            <div className="quiz-picker-loading">
              <div className="picker-spinner"></div>
              <span>Caricamento questionari...</span>
            </div>
          ) : (
            <div className="quiz-cards-list">
              {allAvailableQuizzes.map((q) => {
                const isExpanded = expandedQuizId === q._id;
                const qCount = q.questions?.length || 0;
                return (
                  <div key={q._id} className="quiz-selection-card">
                    <div className="quiz-card-main">
                      <div className="quiz-card-info">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="quiz-tag">
                            {q.museumId || museumId}
                          </span>
                          <span className="quiz-author-tag">
                            <User size={12} /> {q.teacherName || q.teacher?.username || 'Docente'}
                          </span>
                        </div>
                        <h3 className="quiz-card-title">{q.title}</h3>
                        <p className="quiz-card-desc">{q.description || 'Nessuna descrizione specificata.'}</p>
                        
                        <div className="quiz-meta-row">
                          <span><HelpCircle size={13} /> {qCount} Domande</span>
                          <span><Clock size={13} /> {q.timeLimitMinutes || 10} min</span>
                        </div>
                      </div>

                      <div className="quiz-card-actions">
                        <button
                          className="launch-quiz-btn"
                          onClick={() => handleLaunch(q)}
                        >
                          <Play size={15} />
                          <span>Attiva per la Classe</span>
                        </button>

                        <button
                          className="preview-toggle-btn"
                          onClick={() => toggleExpand(q._id)}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>{isExpanded ? 'Nascondi' : 'Anteprima'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Question Preview Dropdown */}
                    {isExpanded && (
                      <div className="quiz-questions-preview">
                        <h4 className="preview-heading">Anteprima Domande:</h4>
                        <ol className="preview-list">
                          {q.questions?.map((item, idx) => (
                            <li key={idx} className="preview-question-item">
                              <p className="font-semibold text-white mb-1.5">{idx + 1}. {item.question}</p>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                {item.options?.map((opt, oIdx) => (
                                  <span
                                    key={oIdx}
                                    className={`preview-option ${oIdx === (item.correctAnswerIndex ?? item.correctIndex) ? 'correct' : ''}`}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt}
                                    {oIdx === (item.correctAnswerIndex ?? item.correctIndex) && ' (✓)'}
                                  </span>
                                ))}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="quiz-picker-footer">
          <p className="footer-hint">
            💡 Il questionario verrà inviato all'istante a tutti gli studenti connessi alla stanza sincronizzata.
          </p>
          <button className="picker-cancel-btn" onClick={onClose}>
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
}
