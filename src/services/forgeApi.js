const BASE  = (import.meta.env.VITE_FORGE_API_BASE ?? '').replace(/\/$/, '');
const GAME_ID = 11;

const LETTER_INDEX = { A: 1, B: 2, C: 3, D: 4 };

async function post(path, body) {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

async function put(path, body) {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return null;
  }
}

// Creates an anonymous game session. Returns the gameUserId (UUID) or null.
// Call once when the quiz starts.
export async function forgeCreateSession() {
  const params = Array.from(new URLSearchParams(window.location.search).entries())
    .map(([paramName, paramValue]) => ({ paramName, paramValue }));
  const data = await post('/api/v1/GameUsers', { gameId: GAME_ID, params });
  return data?.gameUserId ?? null;
}

// Logs a lifecycle event (quiz_started, quiz_completed, report_viewed, etc.)
export async function forgeLogEvent(gameUserId, event) {
  if (!gameUserId) return;
  await post('/api/v1/GameUserEvents', { gameUserId, event });
}

// Logs a question answer. answer format: "qNum.optionNum" e.g. "4.3" = P4, option C.
export async function forgeLogAnswer(gameUserId, questionId, seqIndex, letter) {
  if (!gameUserId) return;
  const qNum    = seqIndex + 1;
  const optNum  = LETTER_INDEX[letter] ?? 0;
  await post('/api/v1/GameUserLogs', {
    gameUserId,
    key:        questionId,           // "P4"
    answer:     `${qNum}.${optNum}`,  // "4.3"
    event:      'answer',
    externalId: qNum,
  });
}

// Logs a "back" navigation from a question.
// Includes the previously selected answer if any.
export async function forgeLogBack(gameUserId, questionId, seqIndex, prevLetter) {
  if (!gameUserId) return;
  const qNum   = seqIndex + 1;
  const optNum = prevLetter ? (LETTER_INDEX[prevLetter] ?? 0) : null;
  await post('/api/v1/GameUserLogs', {
    gameUserId,
    key:        questionId,
    answer:     optNum ? `${qNum}.${optNum}` : null,
    event:      'back',
    externalId: qNum,
  });
}

// Associates personal data with the game session (on-demand form).
export async function forgeRegisterUser(gameUserId, { name, lastname, email, age, country }) {
  if (!gameUserId) return;
  const birthYear = age ? new Date().getFullYear() - parseInt(age, 10) : null;
  await post('/api/v1/GameUsers/User', {
    gameUserId,
    firstname:   name,
    lastname,
    email:       email || null,
    countryCode: country || null,
    birthdate:   birthYear ? `${birthYear}-01-01T00:00:00Z` : null,
    sendOTP:     false,
  });
}
