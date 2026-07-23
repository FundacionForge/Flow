import { COMMITMENT_OPTIONS } from '../data/reportContent.js';

export default function CommitmentScreen({ value, onChange }) {
  return (
    <div className="commitment-block">
      <h3 className="commitment-title">Un desafío a la vez para cambiar un hábito</h3>
      <p className="commitment-subtitle">¿Qué probarás esta semana?</p>
      <div className="commitment-options">
        {COMMITMENT_OPTIONS.map((opt, i) => (
          <button
            key={i}
            className={`commitment-option ${value === opt ? 'chosen' : ''}`}
            onClick={() => onChange(opt)}
            disabled={!!value && value !== opt}
          >
            <span className="commitment-check">
              {value === opt ? '✓' : (i + 1)}
            </span>
            <span>{opt}</span>
          </button>
        ))}
      </div>
      {value && (
        <div className="commitment-chosen-msg">
          ✅ Tu compromiso: <strong>{value}</strong>
        </div>
      )}
    </div>
  );
}
