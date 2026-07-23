import { calcZoneScores, calcTitleParts, calcPills } from '../data/scoring.js';
import { TITLE_TEXTS, FRENO_TEXTS } from '../data/reportContent.js';
import StarRating from './StarRating.jsx';
import ZoneBar from './ZoneBar.jsx';
import CommitmentScreen from './CommitmentScreen.jsx';

function buildHeadline(activadorKey, frenoKey) {
  const actTexts = TITLE_TEXTS[activadorKey];
  const actLargo = actTexts?.activadorLargo ?? 'Tu perfil de aprendizaje está listo';
  const complementoA = actTexts?.complementoA ?? '';
  const frenoLargo = frenoKey ? (FRENO_TEXTS[frenoKey] ?? '') : '';

  if (frenoKey) {
    // Si el freno ya empieza con coma o punto, no agregar separador; si no, separar con espacio
    const sep = frenoLargo.match(/^[,.\s]/) ? '' : ' ';
    return `${actLargo}${sep}${frenoLargo}`;
  }
  return `${actLargo}${complementoA}`;
}

export default function ReportView({ answers, stars, onStars, commitment, onCommitment }) {
  const zones = calcZoneScores(answers);
  const { activadorPrincipal, frenoPrincipal } = calcTitleParts(answers);
  const { activadores, frenos } = calcPills(answers);

  const headline = buildHeadline(
    activadorPrincipal?.key,
    frenoPrincipal?.key
  );

  const reportUnlocked = stars !== null;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="report-wrapper">
      {/* ── Title block ── */}
      <div className="report-title-block">
        <div className="report-eyebrow">Tu perfil de aprendizaje</div>
        <p className="report-headline">{headline}</p>

        {activadores.length > 0 && (
          <div className="pills-section">
            <div className="pills-label">Lo que te prende ⚡</div>
            <div className="pills-row">
              {activadores.map(({ key, label }) => (
                <span key={key} className="pill activador">✓ {label}</span>
              ))}
            </div>
          </div>
        )}

        {frenos.length > 0 && (
          <div className="pills-section">
            <div className="pills-label">Lo que te apaga ⚠️</div>
            <div className="pills-row">
              {frenos.map(({ key, label }) => (
                <span key={key} className="pill freno">⚠ {label}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Star rating (unlock gate) ── */}
      <StarRating value={stars} onChange={onStars} />

      {/* ── Locked / unlocked zone ── */}
      {!reportUnlocked ? (
        <div className="report-locked-wrapper" style={{ minHeight: 220 }}>
          <div style={{ opacity: .25, pointerEvents: 'none', filter: 'blur(3px)' }}>
            <div className="zone-cards">
              {Object.entries(zones).map(([zone, pct]) => (
                <ZoneBar key={zone} zone={zone} pct={pct} />
              ))}
            </div>
          </div>
          <div className="report-locked-overlay">
            <p className="report-locked-msg">
              ⭐ Valorá el reporte para ver el detalle completo
            </p>
          </div>
        </div>
      ) : (
        <div className="report-unlocked">
          {/* Zone cards */}
          <div className="zone-cards">
            {Object.entries(zones).map(([zone, pct]) => (
              <ZoneBar key={zone} zone={zone} pct={pct} />
            ))}
          </div>

          {/* Commitment */}
          <CommitmentScreen value={commitment} onChange={onCommitment} />

          {/* Print */}
          <button className="print-btn" onClick={handlePrint}>
            🖨️ Imprimir / Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
