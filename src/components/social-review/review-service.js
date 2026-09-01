// Llamadas HTTP de SocialReview, mismo patrón que src/services/ de Flow.
// No usa un endpoint propio: reutiliza GameUserEvents y GameUserLogs, que ya
// existen en la API de Flow.

const EVENT_PREFIX = 'SOCIAL-REVIEW-';
const LOG_KEY = 'Social Review';

async function postEvent(apiBaseUrl, gameUserId, valoracion) {
  const res = await fetch(`${apiBaseUrl}/api/v1/GameUserEvents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameUserId, event: `${EVENT_PREFIX}${valoracion}` }),
  });
  if (!res.ok) throw new Error('Error al guardar la valoración');
}

async function postLog(apiBaseUrl, gameUserId, resena) {
  const res = await fetch(`${apiBaseUrl}/api/v1/GameUserLogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gameUserId,
      key: LOG_KEY,
      answer: resena,
      event: '',
      externalId: '',
    }),
  });
  if (!res.ok) throw new Error('Error al guardar la reseña');
}

/**
 * Envía la valoración (siempre) y, si hay texto, la reseña escrita.
 *
 * Si el evento ya se guardó en un intento anterior y solo falló la reseña,
 * pasá `skipEvent: true` para que el reintento no vuelva a mandar el mismo
 * evento duplicado — el llamador se entera de esto porque el error de la
 * reseña llega con `err.eventSent = true`.
 *
 * @param {Object} params
 * @param {string} params.apiBaseUrl - URL base de la API, o "mock" para desarrollo.
 * @param {string} params.gameUserId
 * @param {number} params.valoracion - Valor de 1 a 5.
 * @param {string} params.resena - Texto de la reseña, puede venir vacío.
 * @param {boolean} [params.skipEvent] - No reenviar el evento (ya se guardó antes).
 * @returns {Promise<{ ok: true }>}
 */
export async function submitReview({ apiBaseUrl, gameUserId, valoracion, resena, skipEvent = false }) {
  const resenaTrimmed = resena ? resena.trim() : '';

  if (apiBaseUrl === 'mock') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { ok: true };
  }

  if (!skipEvent) {
    await postEvent(apiBaseUrl, gameUserId, valoracion);
  }

  if (resenaTrimmed) {
    try {
      await postLog(apiBaseUrl, gameUserId, resenaTrimmed);
    } catch (err) {
      err.eventSent = true;
      throw err;
    }
  }

  return { ok: true };
}
