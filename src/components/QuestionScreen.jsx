import { useState } from 'react';
import { QUESTIONS } from '../data/questions.js';
import ProgressBar from './ProgressBar.jsx';

export default function QuestionScreen({ questionId, seqIndex, totalSeq, onAnswer, onBack, prevAnswer }) {
  // `confirmed` = opción recién tocada (dispara auto-avance)
  // `prevAnswer` = respuesta ya guardada (se muestra en verde, no avanza sola)
  const [confirmed, setConfirmed] = useState(null);

  const q = QUESTIONS[questionId];
  const isMyth = q.type === 'myth';
  const displayNumber = seqIndex + 1;

  function handleSelect(letter) {
    if (confirmed) return;
    setConfirmed(letter);
    setTimeout(() => {
      onAnswer(questionId, letter);
      setConfirmed(null);
    }, 320);
  }

  const highlighted = confirmed ?? prevAnswer ?? null;
  const busy = !!confirmed;

  return (
    <>
      <ProgressBar current={displayNumber} total={totalSeq} />
      <div className="quiz-area">
        <div className="question-slide" key={questionId}>
          <div className="question-card">
            {isMyth && (
              <span className="myth-badge">🤔 Una pregunta rápida</span>
            )}
            {!isMyth && q.situation && (
              <p className="question-situation">{q.situation}</p>
            )}
            <p className="question-text">{q.question}</p>

            <p className="question-hint">Elegí la opción que mejor te describe. Solo podés elegir una.</p>

            <div className="options-list">
              {Object.entries(q.options).map(([letter, text]) => (
                <button
                  key={letter}
                  className={`option-btn ${highlighted === letter ? 'selected' : ''}`}
                  onClick={() => handleSelect(letter)}
                  disabled={busy}
                >
                  <span className="option-letter">{letter}</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>

            <button className="back-btn" onClick={onBack} disabled={busy}>
              ← {seqIndex === 0 ? 'Volver al inicio' : 'Pregunta anterior'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
