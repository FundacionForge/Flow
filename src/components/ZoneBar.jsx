import { useState } from 'react';
import { getZoneFranja } from '../data/scoring.js';
import { ZONE_CONTENT } from '../data/reportContent.js';

const FRANJA_LABELS = {
  consolidada: 'Tendencia consolidada',
  desarrollo: 'En desarrollo',
  oportunidad: 'Zona de oportunidad',
};

export default function ZoneBar({ zone, pct }) {
  const [tipOpen, setTipOpen] = useState(false);
  const franja = getZoneFranja(zone, pct);
  const content = ZONE_CONTENT[zone];
  const { texto, tip } = content[franja];

  return (
    <div className="zone-card">
      <div className="zone-card-header">
        <span className="zone-name">
          <span>{content.emoji}</span>
          {zone}
        </span>
        <span className={`zone-badge ${franja}`}>{FRANJA_LABELS[franja]}</span>
      </div>
      <div className="zone-bar-wrapper">
        <div className="zone-bar-track">
          <div
            className={`zone-bar-fill ${franja}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="zone-text">{texto}</p>
      <button
        className="tip-toggle"
        onClick={() => setTipOpen((o) => !o)}
        aria-expanded={tipOpen}
      >
        💡 {tipOpen ? 'Ocultar tip' : 'Ver tip'}
        <span style={{ marginLeft: 'auto' }}>{tipOpen ? '▲' : '▼'}</span>
      </button>
      {tipOpen && <div className="tip-content">{tip}</div>}
    </div>
  );
}
