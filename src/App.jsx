import { useState, useEffect } from 'react';
import { SEQUENCE } from './data/questions.js';
import QuestionScreen from './components/QuestionScreen.jsx';
import ReportView from './components/ReportView.jsx';
import OndemandForm from './components/OndemandForm.jsx';
import { detectCountry } from './services/geoip.js';
import { insertResponse, updateStars, updateCommitment } from './services/responses.js';

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

function IntroScreen({ mode, detectedCountry, onStart }) {
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

        {mode === 'ondemand' ? (
          <OndemandForm detectedCountry={detectedCountry} onSubmit={onStart} />
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

export default function App() {
  const init = loadState();
  const [step, setStep]           = useState(init.step);
  const [currentQ, setCurrentQ]   = useState(init.currentQ);
  const [answers, setAnswers]     = useState(init.answers);
  const [stars, setStars]         = useState(init.stars);
  const [commitment, setCommit]   = useState(init.commitment);

  // Fase 2
  const [mode, setMode]               = useState(null);
  const [groupCode, setGroupCode]     = useState(null);
  const [countryCode, setCountryCode] = useState(null);
  const [odData, setOdData]           = useState(null);
  const [savedId, setSavedId]         = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get('g');
    setMode(g ? 'classroom' : 'ondemand');
    setGroupCode(g ?? null);
    detectCountry().then(setCountryCode);
  }, []);

  // Persist quiz state
  useEffect(() => { localStorage.setItem(LS_STEP, step); }, [step]);
  useEffect(() => { localStorage.setItem(LS_CURRENT_Q, currentQ); }, [currentQ]);
  useEffect(() => { localStorage.setItem(LS_ANSWERS, JSON.stringify(answers)); }, [answers]);
  useEffect(() => {
    if (stars !== null) localStorage.setItem(LS_STARS, stars);
  }, [stars]);
  useEffect(() => {
    if (commitment) localStorage.setItem(LS_COMMITMENT, commitment);
  }, [commitment]);

  function handleStart(formData) {
    if (formData) setOdData(formData);
    setStep('quiz');
  }

  function handleReset() {
    [LS_STEP, LS_CURRENT_Q, LS_ANSWERS, LS_STARS, LS_COMMITMENT].forEach(k => localStorage.removeItem(k));
    setStep('intro');
    setCurrentQ(0);
    setAnswers({});
    setStars(null);
    setCommit(null);
    setSavedId(null);
    setOdData(null);
  }

  async function handleAnswer(questionId, letter) {
    const newAnswers = { ...answers, [questionId]: letter };
    setAnswers(newAnswers);
    const nextIndex = currentQ + 1;
    if (nextIndex >= SEQUENCE.length) {
      setStep('report');
      try {
        const id = await insertResponse({
          groupCode,
          answers: newAnswers,
          countryCode,
          origin: mode ?? 'ondemand',
          odData,
        });
        setSavedId(id);
      } catch (err) {
        console.error('Error al guardar respuestas:', err);
      }
    } else {
      setCurrentQ(nextIndex);
    }
  }

  function handleStars(n) {
    setStars(n);
    updateStars(savedId, n);
  }

  function handleCommitment(opt) {
    setCommit(opt);
    updateCommitment(savedId, opt);
  }

  const questionId = SEQUENCE[currentQ];

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        {step === 'intro' && (
          <IntroScreen
            mode={mode}
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
          />
        )}
      </main>
    </div>
  );
}
