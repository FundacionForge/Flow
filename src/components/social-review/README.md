# SocialReview

Modal de valoración de experiencia (carita 1-5 + reseña opcional). Vive
temporalmente en `flow/app` mientras se prueba acá; el plan es migrarlo a un
repo compartido para todos los productos OnDemand de Forge.

## Uso

```jsx
import { SocialReview } from '@/components/social-review';

<SocialReview
  gameUserId={session.gameUserId}
  apiBaseUrl={import.meta.env.VITE_API_BASE_URL ?? 'mock'}
  onSuccess={() => setReviewEnviada(true)}
  onClose={() => setMostrarReview(false)}
/>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|---|---|---|---|
| `gameUserId` | string | sí | ID del usuario en la API de Flow. |
| `apiBaseUrl` | string | sí | URL base de la API. Pasar `"mock"` para desarrollo sin backend. |
| `onSuccess` | función | no | Se ejecuta tras un envío exitoso. |
| `onClose` | función | no | Se ejecuta al cerrar el modal (✕, Escape, o tras un envío exitoso). |

Las props están documentadas con JSDoc en `SocialReview.jsx`, no con
`PropTypes` — el proyecto no usa esa librería en ningún otro componente y no
vale la pena agregar una dependencia nueva a algo que se va a migrar pronto
(la spec original de `_shared/` ya definía pasar a TypeScript, que va a dar
esa validación gratis).

## Decisiones de esta primera etapa

Esta versión **reemplaza intencionalmente** la spec v1.0 que estaba en
`_shared/components/social-review/`, porque todavía no existe el endpoint
genérico `/api/review`:

- **JS, no TypeScript.** La migración a TS queda para cuando se mueva al repo
  compartido.
- **Acoplado a los endpoints de Flow**, no a un endpoint genérico. Usa
  `GameUserEvents` (evento `SOCIAL-REVIEW-{1..5}`) y `GameUserLogs`
  (`key: "Social Review"`), que ya existen y están probados en producción
  (ver `src/services/forgeApi.js:forgeLogEvent`, mismo POST).
- **Reintento granular.** Si el evento se guarda pero la reseña falla, el
  reintento solo repite el POST de la reseña — no vuelve a mandar el evento
  duplicado. Ver `review-service.js` (`skipEvent` / `err.eventSent`).
- **El evento y la reseña se mandan juntos al hacer clic en "ENVIAR"**, no al
  seleccionar la carita — así el usuario puede cambiar de opinión antes de
  confirmar sin generar eventos de más.

Cuando se defina el endpoint genérico, esto se vuelve a alinear con la spec
de `_shared/` y ese doc debería actualizarse a v2.0 (o reemplazarse) para que
no quede desactualizado para el próximo producto que lo integre.

## Cambiar el ícono

Todo el sistema de íconos pasa por un único punto de configuración,
`review-config.js`:

```js
export const REVIEW_ICON_TYPE = 'face'; // 'star' | 'heart' | 'thumb' en el futuro
```

Para agregar un nuevo estilo (por ejemplo estrellas):

1. Crear `star-icons.jsx` con `renderStar(index, active)`.
2. Agregarlo al mapa `renderers` en `SocialReview.jsx`.
3. Cambiar `REVIEW_ICON_TYPE = 'star'` en `review-config.js`.

Ningún producto que use `SocialReview` necesita cambios.

## Accesibilidad

- `role="dialog"` + `aria-modal="true"` en el panel.
- Cada ícono tiene `aria-label` con el estado emocional.
- Foco atrapado dentro del modal mientras está abierto (Tab cicla dentro del
  panel), foco inicial en el primer elemento interactivo.
- `Escape` cierra el modal (ejecuta `onClose`).

## Restricciones respetadas

- Sin librerías de UI externas, sin `localStorage`/cookies.
- Sin imports fuera de `src/components/social-review/`.
- SVGs siempre inline (`face-icons.jsx`), nunca archivos externos.
