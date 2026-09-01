/**
 * Tests del retry granular de submitReview: si el evento se guardó pero la
 * reseña falló, un reintento con skipEvent no debe volver a mandar el evento.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitReview } from './review-service.js';

const API_BASE = 'https://api.test';

function jsonResponse(ok) {
  return { ok, text: async () => '' };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('submitReview — modo mock', () => {
  it('no llama a fetch y resuelve ok', async () => {
    global.fetch = vi.fn();
    const result = await submitReview({
      apiBaseUrl: 'mock',
      gameUserId: 'user-1',
      valoracion: 5,
      resena: 'genial',
    });
    expect(result).toEqual({ ok: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('submitReview — con API real', () => {
  it('manda solo el evento cuando no hay reseña', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(true));

    await submitReview({ apiBaseUrl: API_BASE, gameUserId: 'user-1', valoracion: 4, resena: '' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/api/v1/GameUserEvents`);
    expect(JSON.parse(options.body)).toEqual({ gameUserId: 'user-1', event: 'SOCIAL-REVIEW-4' });
  });

  it('manda evento y reseña cuando hay texto', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(true));

    await submitReview({ apiBaseUrl: API_BASE, gameUserId: 'user-1', valoracion: 5, resena: '  buenísimo  ' });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [logUrl, logOptions] = global.fetch.mock.calls[1];
    expect(logUrl).toBe(`${API_BASE}/api/v1/GameUserLogs`);
    expect(JSON.parse(logOptions.body)).toEqual({
      gameUserId: 'user-1',
      key: 'Social Review',
      answer: 'buenísimo',
      event: '',
      externalId: '',
    });
  });

  it('si falla el evento, no intenta la reseña y el error no marca eventSent', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(false));

    await expect(
      submitReview({ apiBaseUrl: API_BASE, gameUserId: 'user-1', valoracion: 3, resena: 'texto' })
    ).rejects.toMatchObject({ message: 'Error al guardar la valoración' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('si el evento se guarda pero la reseña falla, el error queda marcado con eventSent', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(true)) // GameUserEvents ok
      .mockResolvedValueOnce(jsonResponse(false)); // GameUserLogs falla

    let caught;
    try {
      await submitReview({ apiBaseUrl: API_BASE, gameUserId: 'user-1', valoracion: 2, resena: 'texto' });
    } catch (err) {
      caught = err;
    }

    expect(caught.message).toBe('Error al guardar la reseña');
    expect(caught.eventSent).toBe(true);
  });

  it('con skipEvent, el reintento solo manda la reseña, no repite el evento', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(true));

    await submitReview({
      apiBaseUrl: API_BASE,
      gameUserId: 'user-1',
      valoracion: 2,
      resena: 'texto',
      skipEvent: true,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url] = global.fetch.mock.calls[0];
    expect(url).toBe(`${API_BASE}/api/v1/GameUserLogs`);
  });
});
