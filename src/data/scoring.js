// Tabla de puntajes ponderados por pregunta y opción
export const SCORES = {
  P1: { A: 3, B: 3, C: 3, D: 0 },
  P2: { A: -2, B: -2, C: 0, D: 0 },
  P3: { A: 0, B: 3, C: 0, D: 3 },
  P4: { A: 3, B: 0, C: 2, D: -1 },
  P5: { A: 3, B: -3, C: -1, D: 2 },
  P6: { A: -3, B: 2, C: 0, D: -3 },
  P7: { A: 2, B: 0, C: 3, D: 0 },
  P8: { A: -3, B: 2, C: 2, D: 2 },
  P9: { A: 3, B: 0, C: 3, D: 0 },
  P10: { A: -3, B: 3, C: 0, D: 3 },
  P11: { A: 2, B: 2, C: 0, D: -1 },
  P12: { A: 3, B: 0, C: -3, D: -3 },
};

// Metadata por respuesta: prioridad, rol, variable clave
export const ANSWER_META = {
  'P1-A': { prioridad: 'Principal', rol: 'Activador', vc: 'Motivación por desafío' },
  'P1-B': { prioridad: 'Principal', rol: 'Activador', vc: 'Producción creativa' },
  'P1-C': { prioridad: 'Principal', rol: 'Activador', vc: 'Necesidad de propósito' },
  'P1-D': { prioridad: 'Complementaria', rol: 'Freno', vc: 'Necesidad de estructura' },
  'P2-A': { prioridad: 'Complementaria', rol: 'Freno', vc: 'Dificultad con lectura extensa' },
  'P2-B': { prioridad: 'Complementaria', rol: 'Freno', vc: 'Dificultad con exposición prolongada' },
  'P2-C': { prioridad: 'Principal', rol: 'Freno', vc: 'Necesidad de variedad' },
  'P2-D': { prioridad: 'Secundaria', rol: 'Freno', vc: 'Dificultad colaborativa' },
  'P3-A': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Apoyo en ejemplos y casos reales' },
  'P3-B': { prioridad: 'Principal', rol: 'Activador', vc: 'Aprender haciendo' },
  'P3-C': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Comprensión guiada' },
  'P3-D': { prioridad: 'Principal', rol: 'Activador', vc: 'Uso de nuevas tecnologías' },
  'P4-A': { prioridad: 'Principal', rol: 'Activador', vc: 'Búsqueda de alternativas' },
  'P4-B': { prioridad: 'Complementaria', rol: 'Freno', vc: 'Persistencia sin ajuste' },
  'P4-C': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Búsqueda de apoyo' },
  'P4-D': { prioridad: 'Secundaria', rol: 'Freno', vc: 'Evitación del problema' },
  'P5-A': { prioridad: 'Principal', rol: 'Activador', vc: 'Reflexión sobre el proceso' },
  'P5-B': { prioridad: 'Principal', rol: 'Freno', vc: 'Foco exclusivo en resultado' },
  'P5-C': { prioridad: 'Secundaria', rol: 'Freno', vc: 'Evitación del problema' },
  'P5-D': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Búsqueda de alternativas' },
  'P6-A': { prioridad: 'Principal', rol: 'Freno', vc: 'Creencia fija' },
  'P6-B': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Búsqueda de alternativas' },
  'P6-C': { prioridad: 'Complementaria', rol: 'Freno', vc: 'Necesidad de estructura' },
  'P6-D': { prioridad: 'Principal', rol: 'Freno', vc: 'Frustración ante el error' },
  'P7-A': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Planificación' },
  'P7-B': { prioridad: 'Secundaria', rol: 'Neutro', vc: 'Síntesis rápida' },
  'P7-C': { prioridad: 'Principal', rol: 'Activador', vc: 'Práctica activa' },
  'P7-D': { prioridad: 'Principal', rol: 'Neutro', vc: 'Estudio concentrado cercano a fecha' },
  'P8-A': { prioridad: 'Principal', rol: 'Freno', vc: 'Predominio memorístico' },
  'P8-B': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Aprender haciendo' },
  'P8-C': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Relación contenidos/vida cotidiana' },
  'P8-D': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Búsqueda de apoyo' },
  'P9-A': { prioridad: 'Principal', rol: 'Activador', vc: 'Comprensión profunda' },
  'P9-B': { prioridad: 'Secundaria', rol: 'Neutro', vc: 'Memoria inmediata' },
  'P9-C': { prioridad: 'Principal', rol: 'Activador', vc: 'Relación contenidos/vida cotidiana' },
  'P9-D': { prioridad: 'Complementaria', rol: 'Neutro', vc: 'Aprender haciendo' },
  'P10-A': { prioridad: 'Principal', rol: 'Freno', vc: 'Desigualdad de participación' },
  'P10-B': { prioridad: 'Principal', rol: 'Activador', vc: 'Organización colaborativa' },
  'P10-C': { prioridad: 'Complementaria', rol: 'Neutro', vc: 'Participación limitada' },
  'P10-D': { prioridad: 'Principal', rol: 'Activador', vc: 'Participación distribuida' },
  'P11-A': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Coordinación grupal' },
  'P11-B': { prioridad: 'Complementaria', rol: 'Activador', vc: 'Participación activa' },
  'P11-C': { prioridad: 'Complementaria', rol: 'Neutro', vc: 'Escucha colaborativa' },
  'P11-D': { prioridad: 'Secundaria', rol: 'Freno', vc: 'Participación pasiva' },
  'P12-A': { prioridad: 'Principal', rol: 'Activador', vc: 'Apertura a perspectivas' },
  'P12-B': { prioridad: 'Principal', rol: 'Neutro', vc: 'Defensa de postura' },
  'P12-C': { prioridad: 'Principal', rol: 'Freno', vc: 'Incomodidad ante el desacuerdo' },
  'P12-D': { prioridad: 'Principal', rol: 'Freno', vc: 'Evitación del conflicto' },
};

// Calcula % por zona dado el objeto answers { P1: 'A', P2: 'B', ... }
export function calcZoneScores(answers) {
  const pp = (q, a) => (answers[q] ? (SCORES[q]?.[answers[q]] ?? 0) : 0);

  const conectarRaw = pp('P1', answers.P1) + pp('P3', answers.P3); // P2 excluida del raw
  const explorarRaw = pp('P4', answers.P4) + pp('P5', answers.P5) + pp('P6', answers.P6);
  const prepararRaw = pp('P7', answers.P7) + pp('P8', answers.P8) + pp('P9', answers.P9);
  const colaborarRaw = pp('P10', answers.P10) + pp('P11', answers.P11) + pp('P12', answers.P12);

  const conectarPct = Math.round((conectarRaw / 6) * 100);
  const explorarPct = Math.round(((explorarRaw + 7) / 15) * 100);
  const prepararPct = Math.round(((prepararRaw + 3) / 11) * 100);
  const colaborarPct = Math.round(((colaborarRaw + 7) / 15) * 100);

  return {
    CONECTAR: Math.max(0, Math.min(100, conectarPct)),
    EXPLORAR: Math.max(0, Math.min(100, explorarPct)),
    PREPARAR: Math.max(0, Math.min(100, prepararPct)),
    COLABORAR: Math.max(0, Math.min(100, colaborarPct)),
  };
}

export function getZoneFranja(zone, pct) {
  // CONECTAR: no puede mostrar "oportunidad" (mínimo real 0%) — se trata igual pero la UI no la mostrará
  if (pct < 33) return 'oportunidad';
  if (pct <= 67) return 'desarrollo';
  return 'consolidada';
}

// Respuestas elegibles para título (Principal, pp ≠ 0, no Neutro con pp=0)
const EXCLUDED_FROM_TITLE = new Set(['P2-C', 'P7-D', 'P12-B']);

export function calcTitleParts(answers) {
  let activadorPrincipal = null; // { key, pp }
  let frenoPrincipal = null;     // { key, pp }

  const QUESTION_KEYS = Object.keys(SCORES); // P1..P12

  for (const q of QUESTION_KEYS) {
    const a = answers[q];
    if (!a) continue;
    const key = `${q}-${a}`;
    if (EXCLUDED_FROM_TITLE.has(key)) continue;
    const meta = ANSWER_META[key];
    if (!meta || meta.prioridad !== 'Principal') continue;
    const pp = SCORES[q][a];
    if (pp === 0) continue;

    if (pp > 0) {
      if (!activadorPrincipal || pp > activadorPrincipal.pp) {
        activadorPrincipal = { key, pp };
      }
    } else {
      if (!frenoPrincipal || Math.abs(pp) > Math.abs(frenoPrincipal.pp)) {
        frenoPrincipal = { key, pp };
      }
    }
  }

  return { activadorPrincipal, frenoPrincipal };
}

// Etiquetas cortas para pastillas
export const PILL_LABELS = {
  'P1-A': 'Desafíos para resolver',
  'P1-B': 'Crear algo propio',
  'P1-C': 'Entender el para qué',
  'P3-B': 'Experimentar directamente',
  'P3-D': 'Aprender con IA',
  'P4-A': 'Buscar diferentes recursos',
  'P5-A': 'Reflexionar sobre el proceso',
  'P5-B': 'Presión por la nota más que por aprender',
  'P6-A': 'Tareas que parecen imposibles antes de intentar',
  'P6-D': 'Errores repetidos sin saber cómo avanzar',
  'P7-C': 'Tener ejercicios para practicar',
  'P8-A': 'Memorizar sin entender el porqué',
  'P9-A': 'Explicar con tus palabras',
  'P9-C': 'Conectar con lo real',
  'P10-A': 'Carga desigual en el grupo',
  'P10-B': 'Trabajo en equipo organizado',
  'P10-D': 'Ideas que nacen del grupo',
  'P12-A': 'Escuchar otras miradas',
  'P12-C': 'Desacuerdos o debate en el grupo',
  'P12-D': 'Tensión o conflictos grupales',
  'P11-D': 'No tener un rol claro en el grupo',
};

// Calcula las pastillas a mostrar: hasta 3 activadores y 3 frenos Principales con pp ≠ 0,
// ordenados de mayor a menor pp absoluto.
export function calcPills(answers) {
  const activadores = [];
  const frenos = [];

  for (const q of Object.keys(SCORES)) {
    const a = answers[q];
    if (!a) continue;
    const key = `${q}-${a}`;
    const meta = ANSWER_META[key];
    if (!meta || meta.prioridad !== 'Principal') continue;
    const pp = SCORES[q][a];
    if (pp === 0) continue;
    const label = PILL_LABELS[key];
    if (!label) continue;

    if (meta.rol === 'Activador') {
      activadores.push({ key, label, pp });
    } else if (meta.rol === 'Freno') {
      frenos.push({ key, label, pp });
    }
  }

  activadores.sort((a, b) => b.pp - a.pp);
  frenos.sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp));

  return { activadores: activadores.slice(0, 3), frenos: frenos.slice(0, 3) };
}
