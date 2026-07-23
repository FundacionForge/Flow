import { useState } from 'react';
import { QUESTIONS } from '../data/questions.js';
import ProgressBar from './ProgressBar.jsx';

export default function QuestionScreen({ questionId, seqIndex, totalSeq, onAnswer }) {
  const [selected, setSelected] = useState(null);

  const q = QUESTIONS[questionId];
  const isMyth = q.type === 'myth';
  const displayNumber = seqIndex + 1;

  function handleSelect(letter) {
    if (selected) return;
    setSelected(letter);
    setTimeout(() => {
      onAnswer(questionId, letter);
      setSelected(null);
    }, 320);
  }

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
            <div className="options-list">
              {Object.entries(q.options).map(([letter, text]) => (
                <button
                  key={letter}
                  className={`option-btn ${selected === letter ? 'selected' : ''}`}
                  onClick={() => handleSelect(letter)}
                  disabled={!!selected}
                >
                  <span className="option-letter">{letter}</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
