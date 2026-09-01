// Diseño inicial de las caritas de SocialReview. Este es el ÚNICO archivo que
// hay que tocar para cambiar el aspecto visual de los íconos — la lógica del
// componente principal no conoce el SVG, solo llama a renderFace(index, active).

/**
 * Devuelve el SVG inline correspondiente a una carita.
 * @param {number} index - 0 a 4, de muy insatisfecho a muy satisfecho.
 * @param {boolean} active - si el ícono está seleccionado.
 */
export function renderFace(index, active) {
  const c = active ? 'var(--social-review-active-color)' : 'var(--social-review-idle-color)';
  const bg = active ? 'var(--social-review-active-bg)' : 'var(--social-review-idle-bg)';

  const faces = [
    // 0 — Muy insatisfecho: cejas caídas hacia adentro, boca muy hacia abajo
    <svg key="0" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="25" fill={bg} stroke={c} strokeWidth="2" />
      <ellipse cx="20" cy="23" rx="2.2" ry="2.8" fill={c} />
      <ellipse cx="34" cy="23" rx="2.2" ry="2.8" fill={c} />
      <path d="M15 20 Q18 16 22 19" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M32 19 Q36 16 39 20" stroke={c} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M17 38 Q27 29 37 38" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>,

    // 1 — Insatisfecho: boca suavemente hacia abajo, sin cejas marcadas
    <svg key="1" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="25" fill={bg} stroke={c} strokeWidth="2" />
      <ellipse cx="20" cy="23" rx="2.2" ry="2.8" fill={c} />
      <ellipse cx="34" cy="23" rx="2.2" ry="2.8" fill={c} />
      <path d="M18 36 Q27 32 36 36" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>,

    // 2 — Neutral: boca recta horizontal
    <svg key="2" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="25" fill={bg} stroke={c} strokeWidth="2" />
      <ellipse cx="20" cy="23" rx="2.2" ry="2.8" fill={c} />
      <ellipse cx="34" cy="23" rx="2.2" ry="2.8" fill={c} />
      <line x1="18" y1="34" x2="36" y2="34" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
    </svg>,

    // 3 — Satisfecho: boca en curva hacia arriba
    <svg key="3" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="25" fill={bg} stroke={c} strokeWidth="2" />
      <ellipse cx="20" cy="23" rx="2.2" ry="2.8" fill={c} />
      <ellipse cx="34" cy="23" rx="2.2" ry="2.8" fill={c} />
      <path d="M18 33 Q27 40 36 33" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>,

    // 4 — Muy satisfecho: sonrisa amplia con relleno, ojos más expresivos
    <svg key="4" width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
      <circle cx="27" cy="27" r="25" fill={bg} stroke={c} strokeWidth="2" />
      <ellipse cx="19" cy="22" rx="2.6" ry="3.2" fill={c} />
      <ellipse cx="35" cy="22" rx="2.6" ry="3.2" fill={c} />
      <path d="M15 31 Q27 46 39 31 Q27 38 15 31 Z" fill={c} />
    </svg>,
  ];

  return faces[index];
}
