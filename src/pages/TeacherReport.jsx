import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupReport } from '../services/groups.js';
import { SCORES, ANSWER_META, PILL_LABELS, calcZoneScores } from '../data/scoring.js';

// ─── Agregación ─────────────────────────────────────────────────────────────
function aggregate(responses) {
  if (!responses.length) return null;

  const n = responses.length;
  const starsArr = responses.map(r => r.stars).filter(s => s != null);
  const starsAvg = starsArr.length ? starsArr.reduce((a, b) => a + b, 0) / starsArr.length : null;

  // Contar frecuencia de cada respuesta
  const freq = {};
  for (const r of responses) {
    const ans = r.answers ?? {};
    for (const [q, a] of Object.entries(ans)) {
      const key = `${q}-${a}`;
      freq[key] = (freq[key] ?? 0) + 1;
    }
  }

  // Top activadores y frenos por frecuencia (solo con PILL_LABELS)
  const activadoresList = [];
  const frenosList = [];
  for (const [key, count] of Object.entries(freq)) {
    const meta = ANSWER_META[key];
    const label = PILL_LABELS[key];
    if (!meta || !label) continue;
    const pct = Math.round((count / n) * 100);
    if (meta.rol === 'Activador' && meta.prioridad === 'Principal') {
      activadoresList.push({ key, label, pct, count });
    } else if (meta.rol === 'Freno' && meta.prioridad === 'Principal') {
      frenosList.push({ key, label, pct, count });
    }
  }
  activadoresList.sort((a, b) => b.pct - a.pct);
  frenosList.sort((a, b) => b.pct - a.pct);

  // Promedios de zona
  const zoneTotals = { CONECTAR: 0, EXPLORAR: 0, PREPARAR: 0, COLABORAR: 0 };
  for (const r of responses) {
    const scores = calcZoneScores(r.answers ?? {});
    for (const z of Object.keys(zoneTotals)) zoneTotals[z] += scores[z];
  }
  const zoneAvg = {};
  for (const z of Object.keys(zoneTotals)) zoneAvg[z] = Math.round(zoneTotals[z] / n);

  return { n, starsAvg, activadores: activadoresList.slice(0, 5), frenos: frenosList.slice(0, 5), zoneAvg };
}

function buildSintesis(activadores, frenos) {
  if (!activadores.length) return 'Este grupo muestra diversidad de perfiles de aprendizaje. El reporte está listo para explorar.';
  const top = activadores.slice(0, 2).map(a => a.label.toLowerCase()).join(' y ');
  const frenoTop = frenos[0] ? `, aunque hay que prestar atención a "${frenos[0].label.toLowerCase()}"` : '';
  return `Este grupo se involucra especialmente cuando puede trabajar en torno a ${top}${frenoTop}. El reporte refleja las tendencias más frecuentes para apoyar decisiones pedagógicas.`;
}

// ─── Círculo de progreso ─────────────────────────────────────────────────────
function CircleProgress({ pct, color, label }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="uso-cw">
      <div className="uso-c">
        <svg viewBox="0 0 72 72">
          <circle className="ucbg" cx="36" cy="36" r={r} />
          <circle
            className="ucfg" cx="36" cy="36" r={r}
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="ucl"><div className="ucpct">{pct}%</div></div>
      </div>
      <div className="uctit">{label}</div>
    </div>
  );
}

// ─── Barras de activadores / frenos ──────────────────────────────────────────
const GREEN_SHADES = ['#1A7A40', '#1A7A40', '#2E9050', '#5AB07A', '#85C8A0'];
const RED_SHADES   = ['#CC0000', '#CC0000', '#DD3322', '#EE6655', '#F49A8A'];

function PaGrid({ activadores, frenos }) {
  return (
    <div className="pa-grid">
      <div>
        <div className="pa-sect pa-on">Lo que los prende</div>
        {activadores.map((a, i) => (
          <div key={a.key} className="pa-item">
            <div className="pa-name">{a.label}</div>
            <div className="pa-track">
              <div className="pa-fill" style={{ width: `${a.pct}%`, background: GREEN_SHADES[i] ?? '#85C8A0' }} />
            </div>
            <div className="pa-pct">{a.pct}%</div>
          </div>
        ))}
        {!activadores.length && <p className="pa-empty">Sin datos suficientes</p>}
      </div>
      <div>
        <div className="pa-sect pa-off">Lo que los apaga</div>
        {frenos.map((f, i) => (
          <div key={f.key} className="pa-item">
            <div className="pa-name">{f.label}</div>
            <div className="pa-track">
              <div className="pa-fill" style={{ width: `${f.pct}%`, background: RED_SHADES[i] ?? '#F49A8A' }} />
            </div>
            <div className="pa-pct">{f.pct}%</div>
          </div>
        ))}
        {!frenos.length && <p className="pa-empty">Sin datos suficientes</p>}
      </div>
    </div>
  );
}

// ─── Mitos (estáticos) ───────────────────────────────────────────────────────
const MITOS = [
  {
    chip: 'Mito desafiado', chipClass: 'chip-b',
    title: '"A los jóvenes no les importa aprender"',
    text: 'La mayoría del grupo reportó motivación genuina. No les falta interés — les faltan condiciones que conecten ese interés con el aula.',
  },
  {
    chip: 'Para tener en cuenta', chipClass: 'chip-w',
    title: '"No pueden concentrarse"',
    text: 'Pueden concentrarse, pero el rango es amplio. Eso es heterogeneidad, no distracción. Diseñar para un solo ritmo deja afuera a una parte del grupo.',
  },
  {
    chip: 'Mito desafiado', chipClass: 'chip-b',
    title: '"No les gusta trabajar en grupo"',
    text: 'Una parte significativa eligió activadores colaborativos. El problema suele ser la falta de estructura, no el trabajo grupal en sí.',
  },
];

function MitosCarousel() {
  const [idx, setIdx] = useState(0);
  const go = d => setIdx(i => Math.max(0, Math.min(MITOS.length - 1, i + d)));
  const m = MITOS[idx];
  return (
    <div className="mitos-section">
      <div className="volanta">Lo que tus alumnos revelan</div>
      <h2 className="section-title" style={{ marginBottom: 18 }}>Mitos que se rompen</h2>
      <div className="mito-slide">
        <span className={`mito-chip ${m.chipClass}`}>{m.chip}</span>
        <div className="mito-h">{m.title}</div>
        <p className="mito-p">{m.text}</p>
      </div>
      <div className="mitos-nav">
        <button className="mito-nav-btn" onClick={() => go(-1)} disabled={idx === 0}>‹</button>
        <button className="mito-nav-btn" onClick={() => go(1)} disabled={idx === MITOS.length - 1}>›</button>
        <div className="mito-dots">
          {MITOS.map((_, i) => (
            <button key={i} className={`mito-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} />
          ))}
        </div>
        <span className="mito-counter">{idx + 1} / {MITOS.length}</span>
      </div>
    </div>
  );
}

// ─── Motores ─────────────────────────────────────────────────────────────────
const MOTORES = [
  {
    key: 'PREPARAR', label: 'Preparar', color: '#1A7A40',
    sub: 'Cómo suelen organizarse y estudiar los estudiantes.',
    icon: <svg viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13.5l1.8 1.8L15.5 11"/></svg>,
    positivo: [
      { title: 'Comprensión profunda', desc: 'El grupo comprende mejor cuando puede explicar ideas con sus propias palabras y construir relaciones entre conceptos.' },
      { title: 'Relación con la vida cotidiana', desc: 'Muchos estudiantes conectan mejor los contenidos cuando los relacionan con situaciones reales o cercanas.' },
    ],
    negativo: [
      { title: 'Predominio memorístico', desc: 'Parte del grupo se apoya principalmente en memorizar en lugar de comprender, lo que dificulta explicar o responder con palabras propias.' },
    ],
    ayuda: ['Ofrecer esquemas o resúmenes visuales de lo trabajado.', 'Guiar la conexión entre conceptos y ejemplos reales.', 'Pedir explicaciones con palabras propias, no solo repetición.'],
  },
  {
    key: 'CONECTAR', label: 'Conectar', color: '#E8720C',
    sub: 'Qué condiciones ayudan a sostener el interés y la atención.',
    icon: <svg viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="18" cy="19" r="2.8"/><line x1="8.4" y1="13.4" x2="15.5" y2="17.5"/><line x1="15.5" y1="6.5" x2="8.4" y2="10.6"/></svg>,
    positivo: [
      { title: 'Necesidad de propósito', desc: 'Comprender para qué sirve una actividad aumenta el interés y la participación del grupo.' },
      { title: 'Motivación por desafío', desc: 'El grupo se involucra más cuando las actividades representan un reto o problema para resolver.' },
    ],
    negativo: [
      { title: 'Dificultad con exposición prolongada', desc: 'Escuchar durante mucho tiempo sin participar dificulta la atención sostenida de una parte del grupo.' },
    ],
    ayuda: ['Explicar el sentido de las actividades antes de comenzar.', 'Incorporar desafíos breves o preguntas abiertas.', 'Alternar explicación con participación activa.'],
  },
  {
    key: 'EXPLORAR', label: 'Explorar', color: '#7A3FA0',
    sub: 'Cómo enfrentan dificultades y errores.',
    icon: <svg viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9.5"/><polygon points="15.5 8.5 13.2 13.2 8.5 15.5 10.8 10.8 15.5 8.5"/></svg>,
    positivo: [
      { title: 'Capacidad de buscar alternativas', desc: 'Una parte del grupo prueba distintas estrategias cuando algo no sale, en lugar de rendirse.' },
    ],
    negativo: [
      { title: 'Frustración ante el error', desc: 'Parte del grupo experimenta frustración cuando algo no sale como esperaba, lo que puede frenar el proceso de exploración.' },
    ],
    ayuda: ['Modelar explícitamente cómo afrontar el error como parte del aprendizaje.', 'Ofrecer andamiaje cuando la dificultad es alta.', 'Valorar el proceso, no solo el resultado correcto.'],
  },
  {
    key: 'COLABORAR', label: 'Colaborar', color: '#1A4A8A',
    sub: 'Cómo interactúan y aprenden junto a otros.',
    icon: <svg viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    positivo: [
      { title: 'Participación distribuida', desc: 'Una parte del grupo valora que todos aporten y que las ideas nazcan del intercambio.' },
      { title: 'Organización colaborativa', desc: 'Hay estudiantes que se involucran más cuando los roles están claros y hay estructura en el trabajo grupal.' },
    ],
    negativo: [
      { title: 'Evitación del conflicto', desc: 'Algunos estudiantes tienden a evitar el desacuerdo, lo que puede dificultar la defensa de ideas propias en el grupo.' },
    ],
    ayuda: ['Asignar roles claros antes de iniciar trabajos grupales.', 'Modelar cómo disentir de manera constructiva.', 'Favorecer grupos pequeños para facilitar la participación.'],
  },
];

function MotorRow({ motor, zoneAvg }) {
  const [open, setOpen] = useState(false);
  const pct = zoneAvg?.[motor.key] ?? 0;
  return (
    <div className={`motor-row${open ? ' open' : ''}`}>
      <button className="motor-summary" onClick={() => setOpen(o => !o)}>
        <div className="motor-row-icon" style={{ background: motor.color }}>{motor.icon}</div>
        <div className="motor-row-headtext">
          <div className="motor-row-title" style={{ color: motor.color }}>{motor.label}</div>
          <div className="motor-row-sub">{motor.sub}</div>
        </div>
        <div className="motor-row-score">
          <div className="motor-score-bar-bg">
            <div className="motor-score-bar-fill" style={{ width: `${pct}%`, background: motor.color }} />
          </div>
          <span className="motor-score-pct">{pct}%</span>
        </div>
        <span className="motor-row-toggle">
          <span className="txt-closed">Ver detalle</span>
          <span className="txt-open">Ocultar</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </span>
      </button>

      {open && (
        <div className="motor-row-body">
          <div>
            <div className="motor-row-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/></svg>
              Lo que más aparece
            </div>
            {motor.positivo.map(p => (
              <div key={p.title} className="motor-row-item">
                <div className="motor-row-item-title">{p.title}</div>
                <div className="motor-row-item-desc">{p.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="motor-row-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
              Aspecto a acompañar
            </div>
            {motor.negativo.map(p => (
              <div key={p.title} className="motor-row-item">
                <div className="motor-row-item-title">{p.title}</div>
                <div className="motor-row-item-desc">{p.desc}</div>
              </div>
            ))}
          </div>
          <div className="motor-row-help" style={{ background: motor.color }}>
            <div className="motor-row-help-lbl">
              <svg viewBox="0 0 24 24" fill="none" stroke={motor.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.55 1 1.36 1 2.2V16h6v-1.3c0-.84.4-1.65 1-2.2A6 6 0 0 0 12 2z"/></svg>
              ¿Qué podría ayudar?
            </div>
            <ul>{motor.ayuda.map(h => <li key={h}>{h}</li>)}</ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Estrellas ────────────────────────────────────────────────────────────────
function Stars({ avg }) {
  if (avg == null) return <span className="stars-na">Sin calificaciones aún</span>;
  const full = Math.floor(avg);
  const half = avg - full >= 0.4;
  return (
    <div className="stars-row">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= full ? 'on' : i === full + 1 && half ? 'half' : 'off'}`}>★</span>
      ))}
      <span className="stars-num">{avg.toFixed(1)}</span>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function TeacherReport() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [agg, setAgg]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getGroupReport(code)
      .then(rows => {
        setData(rows);
        setAgg(aggregate(rows));
      })
      .catch(() => setError('No se pudo cargar el reporte.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="report-loading">Cargando reporte…</div>;
  if (error)   return <div className="report-loading">{error}</div>;
  if (!agg || agg.n === 0) return (
    <div className="report-loading">
      <p>Todavía no hay respuestas suficientes para este grupo.</p>
      <Link to="/docente" className="teacher-btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>← Volver al dashboard</Link>
    </div>
  );

  const sintesis = buildSintesis(agg.activadores, agg.frenos);
  const completionPct = Math.min(100, Math.round((agg.n / (agg.n + 5)) * 100 + 40)); // approx display

  return (
    <div className="tr-page">
      {/* HEADER */}
      <div className="logo-header">
        <img src="/logo-flow.png" alt="FLOW" className="header-logo-flow" onError={e => { e.target.style.display='none'; }} />
        <img src="/logo-forge.png" alt="Fundación Forge" className="header-logo-forge" onError={e => { e.target.style.display='none'; }} />
      </div>

      {/* TITLE BAR */}
      <div className="report-title-bar">
        <div>
          <h1 className="report-title">Reporte docente</h1>
          <p className="report-subtitle">Tendencias grupales de aprendizaje</p>
        </div>
        <div className="report-title-grupo">
          <div className="uso-volanta" style={{ textAlign: 'right' }}>Grupo</div>
          <div className="grupo-value">{code}</div>
        </div>
      </div>

      {/* USO STRIP */}
      <div className="uso-strip">
        <div className="uso-cell">
          <div className="uso-volanta">Alcance</div>
          <div className="report-note">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
              <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5c.6.55 1 1.36 1 2.2V16h6v-1.3c0-.84.4-1.65 1-2.2A6 6 0 0 0 12 2z"/>
            </svg>
            <span>Muestra las tendencias de aprendizaje más frecuentes del grupo para apoyar decisiones pedagógicas. No busca clasificar al grupo ni definir perfiles fijos.</span>
          </div>
        </div>

        <div className="uso-cell centered">
          <div className="uso-volanta" style={{ textAlign: 'center' }}>Respuestas del grupo</div>
          <div className="uso-circles-row">
            <CircleProgress pct={completionPct} color="#CC0000" label={`${agg.n} completaron`} />
          </div>
        </div>

        <div className="uso-cell centered">
          <div className="uso-volanta" style={{ textAlign: 'center' }}>Identificación con el perfil</div>
          <div className="stars-txt" style={{ textAlign: 'center' }}>Calificación promedio del reporte individual</div>
          <Stars avg={agg.starsAvg} />
        </div>
      </div>

      {/* SÍNTESIS */}
      <div className="sintesis-row">
        <div className="sintesis-icon">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
            <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6z"/>
          </svg>
        </div>
        <div className="sintesis-text">
          <div className="sintesis-label">Síntesis general</div>
          <p>{sintesis}</p>
        </div>
      </div>

      {/* ACTIVADORES / FRENOS + MITOS */}
      <div className="header-row4">
        <div className="header-row4-main">
          <div className="volanta">Activadores y frenos</div>
          <h2 className="section-title">¿Qué los mueve y qué los apaga?</h2>
          <PaGrid activadores={agg.activadores} frenos={agg.frenos} />
        </div>
        <div className="header-row4-side">
          <MitosCarousel />
        </div>
      </div>

      {/* MOTORES */}
      <div className="motores-outer">
        <div className="volanta">Potencia para aprender</div>
        <h2 className="section-title">Los cuatro motores de tu clase</h2>
        <p className="section-sub">Cómo prepara, conecta, explora y colabora tu grupo. Tocá cada motor para ver el detalle.</p>
        {MOTORES.map(m => <MotorRow key={m.key} motor={m} zoneAvg={agg.zoneAvg} />)}
      </div>

      {/* FOOTER */}
      <div className="tr-footer">
        <Link to="/docente" className="teacher-btn-secondary tr-back">← Volver al dashboard</Link>
      </div>
    </div>
  );
}
