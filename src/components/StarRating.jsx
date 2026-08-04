export default function StarRating({ value, onChange }) {
  return (
    <div className="star-rating-block">
      {!value && (
        <p className="star-unlock-hint">
          🔒 Valorá el reporte para desbloquear el análisis completo
        </p>
      )}

      <p className="star-question">¿Te identificas con lo que dice tu reporte hasta aquí?</p>

      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`star-btn ${value && value >= n ? 'active' : ''}`}
            onClick={() => onChange(n)}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
          >
            ⭐
          </button>
        ))}
      </div>

      {value && (
        <p className="star-thanks">
          ✅ ¡Gracias! Ahora puedes ver el análisis completo.
        </p>
      )}
    </div>
  );
}
