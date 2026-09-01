import { useEffect, useRef, useState } from 'react';
import { renderFace } from './face-icons';
import { REVIEW_ICON_TYPE, REVIEW_SCALE } from './review-config';
import { submitReview } from './review-service';
import './SocialReview.css';

const renderers = { face: renderFace };
const renderIcon = renderers[REVIEW_ICON_TYPE];

const ICON_LABELS = ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'];

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @typedef {Object} SocialReviewProps
 * @property {string} gameUserId - ID del usuario en la API de Flow.
 * @property {string} apiBaseUrl - URL base de la API. Pasar "mock" para desarrollo.
 * @property {() => void} [onSuccess] - Callback tras un envío exitoso.
 * @property {() => void} [onClose] - Callback al cerrar el modal sin enviar.
 */

/** @param {SocialReviewProps} props */
export function SocialReview({ gameUserId, apiBaseUrl, onSuccess, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [resena, setResena] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [eventSentForValue, setEventSentForValue] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.querySelector(FOCUSABLE_SELECTOR)?.focus();

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = dialog.querySelectorAll(FOCUSABLE_SELECTOR);
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleSelect(index) {
    if (status === 'submitting') return;
    setSelectedIndex(index);
    setStatus('idle');
    setErrorMessage('');
  }

  function handleReset() {
    if (status === 'submitting') return;
    setSelectedIndex(null);
    setResena('');
    setStatus('idle');
    setErrorMessage('');
    setEventSentForValue(null);
  }

  async function handleSubmit() {
    if (selectedIndex === null || status === 'submitting') return;

    const valoracion = selectedIndex + 1;
    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitReview({
        apiBaseUrl,
        gameUserId,
        valoracion,
        resena,
        skipEvent: eventSentForValue === valoracion,
      });
      setStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 1500);
    } catch (err) {
      if (err.eventSent) setEventSentForValue(valoracion);
      setStatus('error');
      setErrorMessage(err.message || 'Ocurrió un error. Intentá de nuevo.');
    }
  }

  return (
    <div className="social-review-overlay">
      <div
        className="social-review-panel"
        role="dialog"
        aria-modal="true"
        aria-label="¿Qué te pareció la experiencia?"
        ref={dialogRef}
        tabIndex={-1}
      >
        {status === 'success' ? (
          <p className="social-review-success">¡Gracias por tu valoración!</p>
        ) : (
          <>
            <div className="social-review-header">
              <button
                type="button"
                className="social-review-icon-action"
                aria-label="Limpiar selección"
                onClick={handleReset}
                disabled={status === 'submitting'}
              >
                ←
              </button>
              <button
                type="button"
                className="social-review-icon-action"
                aria-label="Cerrar"
                onClick={() => onClose?.()}
                disabled={status === 'submitting'}
              >
                ✕
              </button>
            </div>

            <h2 className="social-review-title">¿Qué te pareció la experiencia?</h2>

            <div className="social-review-icons" role="group" aria-label="Seleccioná tu valoración">
              {Array.from({ length: REVIEW_SCALE }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`social-review-icon-btn ${selectedIndex === i ? 'is-active' : ''}`}
                  aria-label={ICON_LABELS[i] ?? `Opción ${i + 1}`}
                  aria-pressed={selectedIndex === i}
                  disabled={status === 'submitting'}
                  onClick={() => handleSelect(i)}
                >
                  {renderIcon(i, selectedIndex === i)}
                </button>
              ))}
            </div>

            {selectedIndex !== null && (
              <div className="social-review-textarea-wrap">
                <textarea
                  className="social-review-textarea"
                  placeholder="Contanos tu experiencia (opcional)"
                  value={resena}
                  onChange={(e) => setResena(e.target.value)}
                  disabled={status === 'submitting'}
                />
              </div>
            )}

            {status === 'error' && (
              <p className="social-review-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              className="social-review-submit-btn"
              disabled={selectedIndex === null || status === 'submitting'}
              onClick={handleSubmit}
            >
              {status === 'submitting' ? 'Enviando…' : 'ENVIAR'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
