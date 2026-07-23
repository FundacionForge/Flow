import { useState } from 'react';
import { sendMagicLink } from '../services/auth.js';

export default function TeacherLogin() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un email válido.');
      return;
    }
    setLoad(true);
    setError('');
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError('No se pudo enviar el link. Intentá de nuevo.');
    } finally {
      setLoad(false);
    }
  }

  if (sent) {
    return (
      <div className="teacher-card teacher-card-center">
        <div className="teacher-sent-icon">📬</div>
        <h2 className="teacher-card-title">¡Revisá tu email!</h2>
        <p className="teacher-card-desc">
          Te enviamos un link de acceso a <strong>{email}</strong>.
          <br />Hacé clic en el link para ingresar al panel de docentes.
        </p>
        <p className="teacher-card-note">
          El link es válido por 72 horas. Si no lo ves, revisá la carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <div className="teacher-card teacher-card-center">
      <h2 className="teacher-card-title">Panel de docentes</h2>
      <p className="teacher-card-desc">
        Ingresá tu email y te enviamos un link de acceso. No necesitás contraseña.
      </p>
      <form className="teacher-form" onSubmit={handleSubmit}>
        <div className="teacher-field">
          <label htmlFor="t-email">Email institucional</label>
          <input
            id="t-email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="tu@institución.edu"
            autoComplete="email"
          />
          {error && <span className="teacher-error">{error}</span>}
        </div>
        <button className="teacher-btn-primary" type="submit" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviarme el link de acceso →'}
        </button>
      </form>
    </div>
  );
}
