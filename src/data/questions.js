// Secuencia completa de 15 items (12 preguntas + 3 mitos)
export const SEQUENCE = ['P1','P2','P3','P4','M1','P5','P6','P7','P8','M2','P9','P10','P11','P12','M3'];

export const QUESTIONS = {
  P1: {
    type: 'question',
    zone: 'CONECTAR',
    situation: 'Estás en una clase, capacitación o taller. Acaban de presentar un tema nuevo y llega el momento de empezar una actividad.',
    question: '¿Qué haría que realmente te den ganas de involucrarte?',
    options: {
      A: 'Que haya un problema o desafío para resolver',
      B: 'Que pueda crear o producir algo propio',
      C: 'Que entienda para qué sirve lo que estamos haciendo',
      D: 'Que las instrucciones sean claras y sepa exactamente qué tengo que hacer',
    },
  },
  P2: {
    type: 'question',
    zone: 'CONECTAR',
    situation: 'Te perdiste algunas clases y tienes que ponerte al día. Te dejaron distintos materiales y actividades para recuperar el contenido.',
    question: '¿Con cuál de estas opciones es más probable que pierdas la atención o el interés?',
    options: {
      A: 'Leer textos largos sin parar',
      B: 'Escuchar a alguien hablar mucho tiempo sin poder participar',
      C: 'Repetir siempre la misma dinámica o ejercicio',
      D: 'Trabajar en grupo cuando no está claro quién hace qué',
    },
  },
  P3: {
    type: 'question',
    zone: 'CONECTAR',
    situation: 'Un profesor, un amigo/a o alguien en el trabajo te cuenta una idea o concepto que nunca habías visto antes y te llama la atención. Te gustarías aprender más sobre eso.',
    question: '¿Qué suele ayudarte más a aprender algo que te interesa?',
    options: {
      A: 'Buscar ejemplos concretos o casos reales',
      B: 'Probar o experimentar directamente con el tema',
      C: 'Leer o escuchar una explicación paso a paso',
      D: 'Pedirle a la IA que me lo explique a mi manera',
    },
  },
  P4: {
    type: 'question',
    zone: 'EXPLORAR',
    situation: 'Llevas un rato estudiando y hay una idea que sigues sin entender. La volviste a leer varias veces y todavía no termina de cerrar.',
    question: '¿Qué haces normalmente en una situación así?',
    options: {
      A: 'Busco otra manera de entenderlo: un video, un gráfico o infografía, con alguna IA u otra.',
      B: 'Sigo intentando igual a ver si en algún momento entiendo',
      C: 'Le pregunto a alguien',
      D: 'Lo dejo para después y sigo con otra cosa',
    },
  },
  M1: {
    type: 'myth',
    question: '¿Para qué usas TikTok, YouTube o Instagram más seguido?',
    options: {
      A: 'Para aprender algo (tutoriales, tips, explicaciones)',
      B: 'Para entretenerme o desconectarme',
      C: 'Para ver qué hacen otros / estar al día',
      D: 'Para todas esas cosas según el momento',
    },
  },
  P5: {
    type: 'question',
    zone: 'EXPLORAR',
    situation: 'Terminaste una evaluación, un trabajo o una presentación. Ya está entregado y no puedes cambiar el resultado.',
    question: '¿Qué suele pasar después en tu cabeza?',
    options: {
      A: 'Pienso qué me ayudó y qué me resultó más difícil',
      B: 'Me fijo en la nota o resultado y listo',
      C: 'Prefiero no darle más vueltas, ya pasó',
      D: 'Pienso qué podría hacer diferente la próxima vez',
    },
  },
  P6: {
    type: 'question',
    zone: 'EXPLORAR',
    situation: 'Hay una materia, tema o habilidad que siempre te resultó difícil. Una vez más estás en el colegio o en el trabajo y te ves obligado a ponerla en práctica.',
    question: 'Cuando tienes que volver a enfrentarte con eso, ¿qué pensamiento aparece primero?',
    options: {
      A: "'Esto no es lo mío, nunca lo voy a entender'",
      B: "'Voy a buscar otro video o explicación hasta que algo me quede claro'",
      C: "'No sé por dónde empezar, me paralizo'",
      D: "'Me frustra, me da rabia y se me van las ganas'",
    },
  },
  P7: {
    type: 'question',
    zone: 'PREPARAR',
    situation: 'Son las diez de la noche. Mañana no tienes nada urgente, pero dentro de cuatro días tienes una evaluación importante.',
    question: '¿Qué es más probable que hagas?',
    options: {
      A: 'Abro el material y veo lo que tengo durante un rato, para ver de qué va, sin presión',
      B: 'Busco resúmenes o lo más importante para tener una idea general',
      C: 'Me pongo a practicar ejercicios o actividades directamente',
      D: 'La dejo para cuando esté más cerca de la fecha, porque ahí me concentro mejor',
    },
  },
  P8: {
    type: 'question',
    zone: 'PREPARAR',
    situation: 'Estás estudiando para un examen y después de un rato sientes que un tema no está terminando de quedarte claro.',
    question: '¿Qué haces más seguido?',
    options: {
      A: 'Intento memorizar lo importante',
      B: 'Practico ejercicios o actividades',
      C: 'Intento conectarlo con algo que ya sé o que me pasó',
      D: 'Le pregunto a alguien: un compañero, un profesor, o una IA',
    },
  },
  M2: {
    type: 'myth',
    question: 'Cuando decides aprender algo nuevo en tu vida, ¿cuál es la razón principal?',
    options: {
      A: 'Porque me gusta entender cómo funcionan las cosas',
      B: 'Porque me sirve para algo concreto que quiero hacer',
      C: 'Porque me interesa, sin importar si lo puedo usar ya para algo o no',
      D: 'Generalmente no aprendo cosas nuevas por mi cuenta',
    },
  },
  P9: {
    type: 'question',
    zone: 'PREPARAR',
    situation: 'Terminaste de estudiar un tema y quieres saber si realmente lo entendiste.',
    question: '¿Qué es lo que más te convence de que sí lo entendiste?',
    options: {
      A: 'Puedo explicárselo a alguien sin releer nada',
      B: 'Lo recuerdo bastante bien cuando pienso en ello',
      C: 'Siento que podría usarlo en situaciones nuevas y reales, me resulta fácil encontrar ejemplos',
      D: 'Puedo resolver los ejercicios sin dudar mucho',
    },
  },
  P10: {
    type: 'question',
    zone: 'COLABORAR',
    situation: 'Piensa en los últimos trabajos en equipo en los que participaste.',
    question: '¿Cuál de estas situaciones suele repetirse más?',
    options: {
      A: 'Casi siempre hay alguien que termina haciendo más que los demás',
      B: 'Cuando el grupo se organiza bien, todo fluye mejor',
      C: 'Siempre hay alguien que participa mucho y alguien que casi no dice nada',
      D: 'Las mejores ideas suelen venir de mezclar lo que cada uno tiene para dar',
    },
  },
  P11: {
    type: 'question',
    zone: 'COLABORAR',
    situation: 'Deben comenzar un trabajo en equipo y todavía nadie tomó la iniciativa para organizarse.',
    question: '¿Cuál suele ser tu reacción?',
    options: {
      A: 'Propongo cómo organizarnos o repartir las tareas',
      B: 'Propongo ideas',
      C: 'Escucho lo que proponen los demás y me voy sumando',
      D: 'Espero que el grupo tome forma y me sumo cuando todo está más claro',
    },
  },
  P12: {
    type: 'question',
    zone: 'COLABORAR',
    situation: 'Estás en un grupo y alguien defiende una idea completamente diferente a la tuya.',
    question: '¿Qué haces normalmente?',
    options: {
      A: 'Me interesa escuchar por qué piensa eso',
      B: 'Defiendo mi idea, si estoy convencido/a, la sostengo',
      C: 'Me incomoda el conflicto y prefiero no decir nada',
      D: 'Cedo para que no se genere un problema en el grupo',
    },
  },
  M3: {
    type: 'myth',
    question: '¿Qué es lo que más te preocupa cuando piensas en lo que viene después de la escuela?',
    options: {
      A: 'No saber de qué voy a trabajar',
      B: 'No tener experiencia cuando salga',
      C: 'No saber si voy a poder estudiar lo que quiero',
      D: 'No me preocupa mucho todavía, ya veré',
    },
  },
};
