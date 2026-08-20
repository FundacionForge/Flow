import { useState, useEffect } from 'react';
import { SEQUENCE } from './data/questions.js';
import QuestionScreen from './components/QuestionScreen.jsx';
import ReportView from './components/ReportView.jsx';
import OndemandForm from './components/OndemandForm.jsx';
import { detectCountry } from './services/geoip.js';
import { insertResponse, updateStars, updateCommitment } from './services/responses.js';
import { DATOS_MOMENTO } from './config.js';
import {
  forgeCreateSession,
  forgeLogEvent,
  forgeLogAnswer,
  forgeLogBack,
  forgeRegisterUser,
} from './services/forgeApi.js';

const LS_ANSWERS    = 'flow_answers';
const LS_STARS      = 'flow_stars';
const LS_COMMITMENT = 'flow_commitment';
const LS_STEP       = 'flow_step';
const LS_CURRENT_Q  = 'flow_currentQ';

function loadState() {
  try {
    return {
      step:       localStorage.getItem(LS_STEP) || 'intro',
      currentQ:   parseInt(localStorage.getItem(LS_CURRENT_Q) || '0', 10),
      answers:    JSON.parse(localStorage.getItem(LS_ANSWERS) || '{}'),
      stars:      localStorage.getItem(LS_STARS) ? parseInt(localStorage.getItem(LS_STARS), 10) : null,
      commitment: localStorage.getItem(LS_COMMITMENT) || null,
    };
  } catch {
    return { step: 'intro', currentQ: 0, answers: {}, stars: null, commitment: null };
  }
}

function Header() {
  return (
    <header className="app-header">
      <img
        src="/logo-flow.png"
        alt="FLOW"
        className="header-logo-flow"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <img
        src="/logo-forge.png"
        alt="Fundación Forge"
        className="header-logo-forge"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </header>
  );
}

function IntroScreen({ collectData, detectedCountry, onStart }) {
  return (
    <div className="intro-screen">
      <div className="intro-hero">
        <span className="intro-badge">🎯 Fundación Forge</span>
        <h1 className="intro-title">
          Descubre tu estilo de <span>aprendizaje</span>
        </h1>
        <p className="intro-desc">
          FLOW es un cuestionario corto que te ayuda a entender cómo aprendes mejor:
          qué te motiva, qué te frena y cómo trabajas con otros.
          <br /><br />
          No hay respuestas correctas o incorrectas. Solo responde lo que realmente haces.
        </p>
        <div className="intro-chips">
          <span className="intro-chip">📋 15 preguntas</span>
          <span className="intro-chip">⏱ ~5 minutos</span>
          <span className="intro-chip">🔒 Tus respuestas son privadas</span>
        </div>

        {collectData && DATOS_MOMENTO === 'antes' ? (
          <OndemandForm detectedCountry={detectedCountry} onSubmit={onStart} submitLabel="Empezar →" />
        ) : (
          <button className="btn-start" onClick={() => onStart(null)}>
            Empezar →
          </button>
        )}
      </div>
      <p className="intro-note">
        Tus respuestas se guardan localmente en este dispositivo.
      </p>
    </div>
  );
}

function CollectScreen({ detectedCountry, onSubmit }) {
  return (
    <div className="intro-screen">
      <div className="intro-hero">
        <h1 className="intro-title" style={{ fontSize: '1.6rem' }}>
          ¡Listo! Ya terminaste el cuestionario
        </h1>
        <p className="intro-desc">
          Antes de ver tu reporte, completa estos datos. Solo los usamos para mejorar el programa.
        </p>
        <OndemandForm detectedCountry={detectedCountry} onSubmit={onSubmit} submitLabel="Ver mis resultados →" />
      </div>
    </div>
  );
}

export default function App() {
  const init = loadState();
  const [step, setStep]         = useState(init.step);
  const [currentQ, setCurrentQ] = useState(init.currentQ);
  const [answers, setAnswers]   = useState(init.answers);
  const [stars, setStars]       = useState(init.stars);
  const [commitment, setCommit] = useState(init.commitment);

  const [groupCode, setGroupCode]     = useState(null);
  const [collectData, setCollectData] = useState(false);
  const [countryCode, setCountryCode] = useState(null);
  const [odData, setOdData]           = useState(null);
  const [savedId, setSavedId]         = useState(null);
  const [pendingAnswers, setPendingAnswers] = useState(null);
  const [forgeSessionId, setForgeSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGroupCode(params.get('g') ?? null);
    setCollectData(params.get('datos') === '1');
    detectCountry().then(setCountryCode);
    forgeCreateSession().then(sessionId => {
      setForgeSessionId(sessionId);
      forgeLogEvent(sessionId, 'SESSION_START');
    });
  }, []);

  useEffect(() => { localStorage.setItem(LS_STEP, step); }, [step]);
  useEffect(() => { localStorage.setItem(LS_CURRENT_Q, currentQ); }, [currentQ]);
  useEffect(() => { localStorage.setItem(LS_ANSWERS, JSON.stringify(answers)); }, [answers]);
  useEffect(() => {
    if (stars !== null) localStorage.setItem(LS_STARS, stars);
  }, [stars]);
  useEffect(() => {
    if (commitment) localStorage.setItem(LS_COMMITMENT, commitment);
  }, [commitment]);

  async function handleStart(formData) {
    if (formData) setOdData(formData);
    const sessionId = forgeSessionId;
    forgeLogEvent(sessionId, 'quiz_started');
    if (formData) {
      forgeRegisterUser(sessionId, {
        name:     formData.name,
        lastname: formData.lastname,
        email:    formData.email,
        age:      formData.age,
        country:  formData.country,
      });
    }
    setStep('quiz');
  }

  function handleReset() {
    forgeLogEvent(forgeSessionId, 'quiz_reset');
    [LS_STEP, LS_CURRENT_Q, LS_ANSWERS, LS_STARS, LS_COMMITMENT].forEach(k => localStorage.removeItem(k));
    setStep('intro');
    setCurrentQ(0);
    setAnswers({});
    setStars(null);
    setCommit(null);
    setSavedId(null);
    setOdData(null);
    setPendingAnswers(null);
    setForgeSessionId(null);
  }

  async function saveAndShowReport(finalAnswers, formData) {
    const origin = groupCode ? 'classroom' : collectData ? 'ondemand' : 'direct';
    forgeLogEvent(forgeSessionId, 'quiz_completed');
    try {
      const id = await insertResponse({
        groupCode,
        answers: finalAnswers,
        countryCode,
        origin,
        odData: formData ?? odData,
      });
      setSavedId(id);
    } catch (err) {
      console.error('Error al guardar respuestas:', err);
    }
    forgeLogEvent(forgeSessionId, 'report_viewed');
    setStep('report');
  }

  async function handleAnswer(questionId, letter) {
    forgeLogAnswer(forgeSessionId, questionId, currentQ, letter);
    const newAnswers = { ...answers, [questionId]: letter };
    setAnswers(newAnswers);
    const nextIndex = currentQ + 1;

    if (nextIndex >= SEQUENCE.length) {
      // Último paso del quiz
      if (collectData && DATOS_MOMENTO === 'despues') {
        // Guardar respuestas en espera y pedir formulario
        setPendingAnswers(newAnswers);
        setStep('collect');
      } else {
        await saveAndShowReport(newAnswers, null);
      }
    } else {
      setCurrentQ(nextIndex);
    }
  }

  async function handleCollect(formData) {
    setOdData(formData);
    forgeRegisterUser(forgeSessionId, {
      name:     formData.name,
      lastname: formData.lastname,
      email:    formData.email,
      age:      formData.age,
      country:  formData.country,
    });
    await saveAndShowReport(pendingAnswers, formData);
    setPendingAnswers(null);
  }

  function handleStars(n) {
    setStars(n);
    updateStars(savedId, n);
    forgeLogEvent(forgeSessionId, `stars_rated_${n}`);
  }

  function handleCommitment(opt) {
    setCommit(opt);
    updateCommitment(savedId, opt);
    forgeLogEvent(forgeSessionId, `commitment_selected`);
  }

  const questionId = SEQUENCE[currentQ];

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        {step === 'intro' && (
          <IntroScreen
            collectData={collectData}
            detectedCountry={countryCode}
            onStart={handleStart}
          />
        )}

        {step === 'quiz' && questionId && (
          <QuestionScreen
            key={questionId}
            questionId={questionId}
            seqIndex={currentQ}
            totalSeq={SEQUENCE.length}
            onAnswer={handleAnswer}
            prevAnswer={answers[questionId] ?? null}
            onBack={() => {
              forgeLogBack(forgeSessionId, questionId, currentQ, answers[questionId] ?? null);
              if (currentQ > 0) {
                setCurrentQ(currentQ - 1);
              } else {
                setStep('intro');
              }
            }}
          />
        )}

        {step === 'collect' && (
          <CollectScreen
            detectedCountry={countryCode}
            onSubmit={handleCollect}
          />
        )}

        {step === 'report' && (
          <ReportView
            answers={answers}
            stars={stars}
            onStars={handleStars}
            commitment={commitment}
            onCommitment={handleCommitment}
            onReset={handleReset}
            email={odData?.email ?? null}
          />
        )}
      </main>
    </div>
  );
}
