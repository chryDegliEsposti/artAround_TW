import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw, X, Sparkles } from 'lucide-react';
import './QuizModal.css';

export default function QuizModal({
  isOpen,
  onClose,
  quiz,
  onSubmitResults
}) {
  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (onSubmitResults) {
      onSubmitResults({
        score: correctCount,
        total: questions.length,
        answers: userAnswers
      });
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = questions.length > 0 && Object.keys(userAnswers).length === questions.length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="quiz-overlay fade-in">
      <div className="quiz-modal slide-up">
        
        {/* Header */}
        <div className="quiz-header">
          <div className="quiz-title-box">
            <div className="quiz-badge">
              <Award size={16} className="text-amber-400" />
              <span>QUIZ DI COMPETENZA DELLA VISITA</span>
            </div>
            <h2>{quiz.title || 'Verifica Finale delle Conoscenze'}</h2>
            <p className="quiz-subtitle">{quiz.description || 'Rispondi alle domande per verificare quanto appreso durante il tour.'}</p>
          </div>
          <button className="quiz-close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Quiz Content */}
        <div className="quiz-body no-scrollbar">
          
          {/* Result Card if submitted */}
          {submitted && (
            <div className="quiz-result-banner slide-in-top">
              <div className="result-score-circle">
                <span className="score-num">{score}</span>
                <span className="score-total">/{questions.length}</span>
              </div>
              <div className="result-text-block">
                <h3>
                  {percentage >= 80 ? '🎉 Risultato Straordinario!' : percentage >= 60 ? '👍 Ottimo Lavoro!' : '📚 Puoi Fare di Meglio!'}
                </h3>
                <p>
                  Hai totalizzato il <strong>{percentage}%</strong> di risposte corrette. Il tuo risultato è stato registrato ed inviato al docente.
                </p>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="questions-container">
            {questions.map((q, qIdx) => {
              const selectedOpt = userAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctAnswerIndex;

              return (
                <div key={qIdx} className={`question-card ${submitted ? (isCorrect ? 'correct-card' : 'wrong-card') : ''}`}>
                  <div className="question-header">
                    <span className="q-number">Domanda {qIdx + 1} di {questions.length}</span>
                    {submitted && (
                      <span className={`q-status-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {isCorrect ? 'Corretta (+1 p.to)' : 'Errata (0 p.ti)'}
                      </span>
                    )}
                  </div>

                  <h4 className="q-text">{q.question}</h4>

                  <div className="options-grid">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isTargetCorrect = submitted && optIdx === q.correctAnswerIndex;
                      const isUserWrong = submitted && isSelected && !isCorrect;

                      let optClass = 'option-btn';
                      if (isSelected) optClass += ' selected';
                      if (isTargetCorrect) optClass += ' option-correct';
                      if (isUserWrong) optClass += ' option-wrong';

                      return (
                        <button
                          key={optIdx}
                          className={optClass}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          disabled={submitted}
                        >
                          <span className="opt-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span className="opt-label">{opt}</span>
                          {isTargetCorrect && <CheckCircle2 size={16} className="text-emerald-400 ml-auto" />}
                          {isUserWrong && <XCircle size={16} className="text-red-400 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submitted && q.explanation && (
                    <div className="q-explanation">
                      <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Spiegazione didattica:</strong> {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="quiz-footer">
          {!submitted ? (
            <button
              className="quiz-submit-btn"
              disabled={!allAnswered}
              onClick={handleSubmit}
            >
              <span>Consegna e Calcola Punteggio ({Object.keys(userAnswers).length}/{questions.length})</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <div className="flex gap-3 w-full">
              <button className="quiz-retry-btn" onClick={handleReset}>
                <RotateCcw size={18} />
                <span>Riprova il Quiz</span>
              </button>
              <button className="quiz-close-action-btn" onClick={onClose}>
                <span>Torna alla Visita</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
