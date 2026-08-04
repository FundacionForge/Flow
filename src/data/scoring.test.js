/**
 * Tests de la lógica de scoring de FLOW.
 *
 * Casos derivados directamente de las tablas fuente (FLOW_Reporte_Joven_v6).
 * Cada test documenta el cálculo paso a paso para facilitar auditoría.
 *
 * Fórmulas de zona (fuente: tabla de puntajes):
 *   CONECTAR  = round( (P1 + P3) / 6 * 100 )                   clamp [0,100]
 *   EXPLORAR  = round( ((P4 + P5 + P6) + 7) / 15 * 100 )       clamp [0,100]
 *   PREPARAR  = round( ((P7 + P8 + P9) + 3) / 11 * 100 )       clamp [0,100]
 *   COLABORAR = round( ((P10 + P11 + P12) + 7) / 15 * 100 )    clamp [0,100]
 *
 * Nota: P2 tiene puntajes (-2, -2, 0, 0) pero NO entra en ninguna zona.
 * Se incluyen tests que verifican esta exclusión explícita.
 */

import { describe, it, expect } from 'vitest';
import {
  SCORES,
  ANSWER_META,
  PILL_LABELS,
  calcZoneScores,
  getZoneFranja,
  calcTitleParts,
  calcPills,
} from './scoring.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Construye un objeto answers completo con una respuesta por pregunta */
function allAnswers(overrides = {}) {
  return {
    P1: 'D', P2: 'C', P3: 'A', P4: 'B',
    P5: 'C', P6: 'C', P7: 'B', P8: 'B',
    P9: 'B', P10: 'C', P11: 'C', P12: 'B',
    ...overrides,
  };
}

// ─── 1. Tabla SCORES — integridad estructural ──────────────────────────────────

describe('SCORES — integridad de la tabla fuente', () => {
  const EXPECTED_QUESTIONS = ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12'];
  const EXPECTED_OPTIONS   = ['A','B','C','D'];

  it('contiene exactamente las preguntas P1–P12', () => {
    expect(Object.keys(SCORES)).toEqual(EXPECTED_QUESTIONS);
  });

  it('cada pregunta tiene exactamente las opciones A, B, C, D', () => {
    for (const q of EXPECTED_QUESTIONS) {
      expect(Object.keys(SCORES[q])).toEqual(EXPECTED_OPTIONS);
    }
  });

  it('todos los puntajes son enteros', () => {
    for (const [q, opts] of Object.entries(SCORES)) {
      for (const [opt, val] of Object.entries(opts)) {
        expect(Number.isInteger(val), `${q}-${opt} debe ser entero`).toBe(true);
      }
    }
  });

  it('puntajes de P1 coinciden con tabla fuente: A=3, B=3, C=3, D=0', () => {
    expect(SCORES.P1).toEqual({ A: 3, B: 3, C: 3, D: 0 });
  });

  it('puntajes de P2 coinciden con tabla fuente: A=-2, B=-2, C=0, D=0', () => {
    expect(SCORES.P2).toEqual({ A: -2, B: -2, C: 0, D: 0 });
  });

  it('puntajes de P5 coinciden con tabla fuente: A=3, B=-3, C=-1, D=2', () => {
    expect(SCORES.P5).toEqual({ A: 3, B: -3, C: -1, D: 2 });
  });

  it('puntajes de P8 coinciden con tabla fuente: A=-3, B=2, C=2, D=2', () => {
    expect(SCORES.P8).toEqual({ A: -3, B: 2, C: 2, D: 2 });
  });

  it('puntajes de P12 coinciden con tabla fuente: A=3, B=0, C=-3, D=-3', () => {
    expect(SCORES.P12).toEqual({ A: 3, B: 0, C: -3, D: -3 });
  });
});

// ─── 2. ANSWER_META — integridad ─────────────────────────────────────────────

describe('ANSWER_META — integridad estructural', () => {
  it('todas las claves referencian preguntas válidas en SCORES', () => {
    for (const key of Object.keys(ANSWER_META)) {
      const [q] = key.split('-');
      expect(SCORES[q], `Pregunta ${q} de ${key} no existe en SCORES`).toBeDefined();
    }
  });

  it('todos los roles son Activador, Freno o Neutro', () => {
    const validRoles = new Set(['Activador', 'Freno', 'Neutro']);
    for (const [key, meta] of Object.entries(ANSWER_META)) {
      expect(validRoles.has(meta.rol), `${key} tiene rol inválido: ${meta.rol}`).toBe(true);
    }
  });

  it('todas las prioridades son Principal, Complementaria o Secundaria', () => {
    const valid = new Set(['Principal', 'Complementaria', 'Secundaria']);
    for (const [key, meta] of Object.entries(ANSWER_META)) {
      expect(valid.has(meta.prioridad), `${key} prioridad inválida: ${meta.prioridad}`).toBe(true);
    }
  });

  it('todas las claves de PILL_LABELS existen en ANSWER_META', () => {
    for (const key of Object.keys(PILL_LABELS)) {
      expect(ANSWER_META[key], `${key} en PILL_LABELS no existe en ANSWER_META`).toBeDefined();
    }
  });

  it('las etiquetas de activadores principales en PILL_LABELS tienen rol Activador', () => {
    for (const [key, label] of Object.entries(PILL_LABELS)) {
      const meta = ANSWER_META[key];
      if (meta.prioridad === 'Principal' && meta.rol === 'Activador') {
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      }
    }
  });
});

// ─── 3. calcZoneScores — casos límite ─────────────────────────────────────────

describe('calcZoneScores — puntajes máximos', () => {
  it('CONECTAR máximo: P1=A(3) + P3=B(3) = 6 → round(6/6*100) = 100', () => {
    const scores = calcZoneScores(allAnswers({ P1: 'A', P3: 'B' }));
    expect(scores.CONECTAR).toBe(100);
  });

  it('EXPLORAR máximo: P4=A(3)+P5=A(3)+P6=B(2)=8 → round((8+7)/15*100) = 100', () => {
    const scores = calcZoneScores(allAnswers({ P4: 'A', P5: 'A', P6: 'B' }));
    expect(scores.EXPLORAR).toBe(100);
  });

  it('PREPARAR máximo: P7=C(3)+P8=B(2)+P9=A(3)=8 → round((8+3)/11*100) = 100', () => {
    const scores = calcZoneScores(allAnswers({ P7: 'C', P8: 'B', P9: 'A' }));
    expect(scores.PREPARAR).toBe(100);
  });

  it('COLABORAR máximo: P10=B(3)+P11=A(2)+P12=A(3)=8 → round((8+7)/15*100) = 100', () => {
    const scores = calcZoneScores(allAnswers({ P10: 'B', P11: 'A', P12: 'A' }));
    expect(scores.COLABORAR).toBe(100);
  });
});

describe('calcZoneScores — puntajes mínimos', () => {
  it('CONECTAR mínimo: P1=D(0)+P3=A(0)=0 → round(0/6*100) = 0', () => {
    const scores = calcZoneScores(allAnswers({ P1: 'D', P3: 'A' }));
    expect(scores.CONECTAR).toBe(0);
  });

  it('EXPLORAR mínimo: P4=D(-1)+P5=B(-3)+P6=A(-3)=-7 → round((-7+7)/15*100) = 0', () => {
    const scores = calcZoneScores(allAnswers({ P4: 'D', P5: 'B', P6: 'A' }));
    expect(scores.EXPLORAR).toBe(0);
  });

  it('PREPARAR mínimo: P7=B(0)+P8=A(-3)+P9=B(0)=-3 → round((-3+3)/11*100) = 0', () => {
    const scores = calcZoneScores(allAnswers({ P7: 'B', P8: 'A', P9: 'B' }));
    expect(scores.PREPARAR).toBe(0);
  });

  it('COLABORAR mínimo: P10=A(-3)+P11=D(-1)+P12=C(-3)=-7 → round((-7+7)/15*100) = 0', () => {
    const scores = calcZoneScores(allAnswers({ P10: 'A', P11: 'D', P12: 'C' }));
    expect(scores.COLABORAR).toBe(0);
  });
});

describe('calcZoneScores — valores intermedios', () => {
  it('CONECTAR medio: P1=C(3)+P3=C(0)=3 → round(3/6*100) = 50', () => {
    const scores = calcZoneScores(allAnswers({ P1: 'C', P3: 'C' }));
    expect(scores.CONECTAR).toBe(50);
  });

  it('EXPLORAR medio: P4=C(2)+P5=C(-1)+P6=C(0)=1 → round((1+7)/15*100) = 53', () => {
    // (8/15)*100 = 53.333... → round = 53
    const scores = calcZoneScores(allAnswers({ P4: 'C', P5: 'C', P6: 'C' }));
    expect(scores.EXPLORAR).toBe(53);
  });

  it('PREPARAR alto: P7=A(2)+P8=D(2)+P9=C(3)=7 → round((7+3)/11*100) = 91', () => {
    // (10/11)*100 = 90.909... → round = 91
    const scores = calcZoneScores(allAnswers({ P7: 'A', P8: 'D', P9: 'C' }));
    expect(scores.PREPARAR).toBe(91);
  });

  it('COLABORAR: P10=D(3)+P11=C(0)+P12=B(0)=3 → round((3+7)/15*100) = 67', () => {
    // (10/15)*100 = 66.666... → round = 67
    const scores = calcZoneScores(allAnswers({ P10: 'D', P11: 'C', P12: 'B' }));
    expect(scores.COLABORAR).toBe(67);
  });

  it('EXPLORAR negativo parcial: P4=A(3)+P5=B(-3)+P6=C(0)=0 → round((0+7)/15*100) = 47', () => {
    // (7/15)*100 = 46.666... → round = 47
    const scores = calcZoneScores(allAnswers({ P4: 'A', P5: 'B', P6: 'C' }));
    expect(scores.EXPLORAR).toBe(47);
  });
});

describe('calcZoneScores — P2 NO afecta ninguna zona', () => {
  it('cambiar P2 de A a D no modifica CONECTAR, EXPLORAR, PREPARAR ni COLABORAR', () => {
    const base = { P1:'A', P3:'B', P4:'A', P5:'A', P6:'B',
                   P7:'C', P8:'B', P9:'A', P10:'B', P11:'A', P12:'A' };
    const withP2A = calcZoneScores({ ...base, P2: 'A' });
    const withP2D = calcZoneScores({ ...base, P2: 'D' });
    expect(withP2A).toEqual(withP2D);
  });

  it('P2=A(-2) no reduce EXPLORAR (P2 está excluida del cálculo)', () => {
    const scores = calcZoneScores(allAnswers({ P2: 'A', P4: 'A', P5: 'A', P6: 'B' }));
    expect(scores.EXPLORAR).toBe(100);
  });
});

describe('calcZoneScores — respuestas vacías / parciales', () => {
  it('sin respuestas: CONECTAR=0, EXPLORAR=47, PREPARAR=27, COLABORAR=47', () => {
    // CONECTAR: raw=0 → 0%
    // EXPLORAR: raw=0 → (7/15)*100 = 46.6... → 47
    // PREPARAR: raw=0 → (3/11)*100 = 27.27... → 27
    // COLABORAR: raw=0 → (7/15)*100 = 46.6... → 47
    const scores = calcZoneScores({});
    expect(scores.CONECTAR).toBe(0);
    expect(scores.EXPLORAR).toBe(47);
    expect(scores.PREPARAR).toBe(27);
    expect(scores.COLABORAR).toBe(47);
  });

  it('todos los resultados están en rango [0, 100]', () => {
    const testCases = [
      {},
      allAnswers(),
      allAnswers({ P1:'A', P3:'B', P4:'A', P5:'A', P6:'B', P7:'C', P8:'B', P9:'A', P10:'B', P11:'A', P12:'A' }),
      allAnswers({ P1:'D', P3:'A', P4:'D', P5:'B', P6:'A', P7:'B', P8:'A', P9:'B', P10:'A', P11:'D', P12:'C' }),
    ];
    for (const answers of testCases) {
      const scores = calcZoneScores(answers);
      for (const [zone, pct] of Object.entries(scores)) {
        expect(pct, `${zone} fuera de rango: ${pct}`).toBeGreaterThanOrEqual(0);
        expect(pct, `${zone} fuera de rango: ${pct}`).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ─── 4. getZoneFranja ─────────────────────────────────────────────────────────

describe('getZoneFranja — rangos de franja', () => {
  it('pct=0 → oportunidad', () => expect(getZoneFranja('CONECTAR', 0)).toBe('oportunidad'));
  it('pct=32 → oportunidad', () => expect(getZoneFranja('EXPLORAR', 32)).toBe('oportunidad'));
  it('pct=33 → desarrollo', () => expect(getZoneFranja('PREPARAR', 33)).toBe('desarrollo'));
  it('pct=50 → desarrollo', () => expect(getZoneFranja('COLABORAR', 50)).toBe('desarrollo'));
  it('pct=67 → desarrollo', () => expect(getZoneFranja('CONECTAR', 67)).toBe('desarrollo'));
  it('pct=68 → consolidada', () => expect(getZoneFranja('EXPLORAR', 68)).toBe('consolidada'));
  it('pct=100 → consolidada', () => expect(getZoneFranja('PREPARAR', 100)).toBe('consolidada'));
});

// ─── 5. calcTitleParts ────────────────────────────────────────────────────────

describe('calcTitleParts — selección de activador y freno principal', () => {
  it('P1=A(pp=3) es el activador principal cuando es el único activador', () => {
    const { activadorPrincipal } = calcTitleParts(allAnswers({ P1: 'A' }));
    expect(activadorPrincipal).not.toBeNull();
    expect(activadorPrincipal.key).toBe('P1-A');
    expect(activadorPrincipal.pp).toBe(3);
  });

  it('P5=B(pp=-3) es el freno principal cuando es el único freno', () => {
    const { frenoPrincipal } = calcTitleParts(allAnswers({ P1: 'D', P5: 'B' }));
    expect(frenoPrincipal).not.toBeNull();
    expect(frenoPrincipal.key).toBe('P5-B');
    expect(frenoPrincipal.pp).toBe(-3);
  });

  it('P12=B está excluido del título aunque pp=0', () => {
    // P12=B tiene pp=0, por lo que igual no aparecería; el test verifica la exclusión explícita
    const { activadorPrincipal, frenoPrincipal } = calcTitleParts({ P12: 'B' });
    expect(activadorPrincipal).toBeNull();
    expect(frenoPrincipal).toBeNull();
  });

  it('cuando compiten dos activadores gana el de mayor pp', () => {
    // P1=A pp=3, P4=C pp=2 → gana P1-A
    const { activadorPrincipal } = calcTitleParts(allAnswers({ P1: 'A', P4: 'C' }));
    expect(activadorPrincipal.key).toBe('P1-A');
    expect(activadorPrincipal.pp).toBe(3);
  });

  it('cuando compiten dos frenos gana el de mayor |pp|', () => {
    // P5=B pp=-3, P6=D pp=-3 (empate → primero encontrado por orden de preguntas)
    const { frenoPrincipal } = calcTitleParts(
      allAnswers({ P1: 'D', P5: 'B', P6: 'D' })
    );
    expect(frenoPrincipal.pp).toBe(-3);
  });

  it('respuestas neutras (pp=0) no se convierten en activador ni freno', () => {
    const { activadorPrincipal, frenoPrincipal } = calcTitleParts({ P1: 'D', P2: 'C' });
    expect(activadorPrincipal).toBeNull();
    expect(frenoPrincipal).toBeNull();
  });

  it('solo opciones con prioridad Principal son candidatas al título', () => {
    // P3=A es Complementaria Activador, no debe ser activadorPrincipal
    const { activadorPrincipal } = calcTitleParts({ P3: 'A' });
    expect(activadorPrincipal).toBeNull();
  });
});

// ─── 6. calcPills ────────────────────────────────────────────────────────────

describe('calcPills — pastillas de activadores y frenos', () => {
  it('devuelve arrays activadores y frenos', () => {
    const { activadores, frenos } = calcPills(allAnswers());
    expect(Array.isArray(activadores)).toBe(true);
    expect(Array.isArray(frenos)).toBe(true);
  });

  it('máximo 3 activadores y 3 frenos', () => {
    const answers = {
      P1: 'A', P9: 'C', P12: 'A',   // 3 activadores principales
      P5: 'B', P6: 'A', P10: 'A',   // 3 frenos principales
    };
    const { activadores, frenos } = calcPills(answers);
    expect(activadores.length).toBeLessThanOrEqual(3);
    expect(frenos.length).toBeLessThanOrEqual(3);
  });

  it('cada pill tiene key, label y pp', () => {
    const { activadores, frenos } = calcPills(
      allAnswers({ P1: 'A', P5: 'B' })
    );
    for (const pill of [...activadores, ...frenos]) {
      expect(pill).toHaveProperty('key');
      expect(pill).toHaveProperty('label');
      expect(pill).toHaveProperty('pp');
    }
  });

  it('activadores están ordenados de mayor a menor pp', () => {
    const { activadores } = calcPills(
      allAnswers({ P1: 'A', P4: 'C', P9: 'C' })
    );
    for (let i = 0; i < activadores.length - 1; i++) {
      expect(activadores[i].pp).toBeGreaterThanOrEqual(activadores[i + 1].pp);
    }
  });

  it('frenos están ordenados de mayor a menor |pp|', () => {
    const { frenos } = calcPills(
      allAnswers({ P1: 'D', P5: 'B', P6: 'D', P10: 'A' })
    );
    for (let i = 0; i < frenos.length - 1; i++) {
      expect(Math.abs(frenos[i].pp)).toBeGreaterThanOrEqual(Math.abs(frenos[i + 1].pp));
    }
  });

  it('P1=A aparece como activador con label "Desafíos para resolver"', () => {
    const { activadores } = calcPills(allAnswers({ P1: 'A' }));
    const pill = activadores.find(p => p.key === 'P1-A');
    expect(pill).toBeDefined();
    expect(pill.label).toBe('Desafíos para resolver');
  });

  it('P5=B aparece como freno con label actualizado', () => {
    const { frenos } = calcPills(allAnswers({ P1: 'D', P5: 'B' }));
    const pill = frenos.find(p => p.key === 'P5-B');
    expect(pill).toBeDefined();
    expect(pill.label).toBe('Presión por la nota más que por aprender');
  });

  it('P10=A aparece como freno con label "Carga desigual en el grupo"', () => {
    const { frenos } = calcPills(allAnswers({ P1: 'D', P10: 'A' }));
    const pill = frenos.find(p => p.key === 'P10-A');
    expect(pill).toBeDefined();
    expect(pill.label).toBe('Carga desigual en el grupo');
  });

  it('solo aparecen pills que tienen entrada en PILL_LABELS', () => {
    const { activadores, frenos } = calcPills(allAnswers({ P1: 'A', P5: 'B' }));
    for (const pill of [...activadores, ...frenos]) {
      expect(PILL_LABELS[pill.key], `${pill.key} no tiene label`).toBeDefined();
    }
  });
});

// ─── 7. Caso completo — combinación real ─────────────────────────────────────

describe('calcZoneScores — caso completo de ejemplo', () => {
  it('perfil explorador: P1=A, P3=B, P4=A, P5=A, P6=B, P7=C, P8=B, P9=A, P10=B, P11=A, P12=A → todas las zonas en 100', () => {
    const answers = {
      P1:'A', P2:'C', P3:'B',
      P4:'A', P5:'A', P6:'B',
      P7:'C', P8:'B', P9:'A',
      P10:'B', P11:'A', P12:'A',
    };
    const scores = calcZoneScores(answers);
    expect(scores.CONECTAR).toBe(100);
    expect(scores.EXPLORAR).toBe(100);
    expect(scores.PREPARAR).toBe(100);
    expect(scores.COLABORAR).toBe(100);
  });

  it('perfil más bajo posible: todas las zonas en 0', () => {
    const answers = {
      P1:'D', P2:'A', P3:'A',
      P4:'D', P5:'B', P6:'A',
      P7:'B', P8:'A', P9:'B',
      P10:'A', P11:'D', P12:'C',
    };
    const scores = calcZoneScores(answers);
    expect(scores.CONECTAR).toBe(0);
    expect(scores.EXPLORAR).toBe(0);
    expect(scores.PREPARAR).toBe(0);
    expect(scores.COLABORAR).toBe(0);
  });

  it('perfil mixto documentado: CONECTAR=50, EXPLORAR=53, PREPARAR=91, COLABORAR=67', () => {
    // CONECTAR: P1=C(3)+P3=C(0)=3 → round(3/6*100)=50
    // EXPLORAR: P4=C(2)+P5=C(-1)+P6=C(0)=1 → round((1+7)/15*100)=53
    // PREPARAR: P7=A(2)+P8=D(2)+P9=C(3)=7 → round((7+3)/11*100)=91
    // COLABORAR: P10=D(3)+P11=C(0)+P12=B(0)=3 → round((3+7)/15*100)=67
    const answers = {
      P1:'C', P2:'D', P3:'C',
      P4:'C', P5:'C', P6:'C',
      P7:'A', P8:'D', P9:'C',
      P10:'D', P11:'C', P12:'B',
    };
    const scores = calcZoneScores(answers);
    expect(scores.CONECTAR).toBe(50);
    expect(scores.EXPLORAR).toBe(53);
    expect(scores.PREPARAR).toBe(91);
    expect(scores.COLABORAR).toBe(67);
  });
});
