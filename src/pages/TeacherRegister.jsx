import { useState } from 'react';
import { createTeacherProfile } from '../services/teachers.js';

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'República Dominicana' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'ES', name: 'España' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'MX', name: 'México' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'OTHER', name: 'Otro' },
];

export default function TeacherRegister({ email, onRegistered }) {
  const [form, setForm]     = useState({ name: '', institution: '', countryCode: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoad]  = useState(false);
  const [serverErr, setServerErr] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())        e.name        = 'Ingresá tu nombre.';
    if (!form.institution.trim()) e.institution = 'Ingresá el nombre de tu institución.';
    if (!form.countryCode)        e.countryCode = 'Seleccioná tu país.';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoad(true);
    setServerErr('');
    try {
      const profile = await createTeacherProfile({ ...form, email });
      onRegistered(profile);
    } catch {
      setServerErr('Ocurrió un error. Por favor intentá de nuevo.');
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="teacher-card">
      <h2 className="teacher-card-title">Completá tu perfil</h2>
      <p className="teacher-card-desc">
        Es la primera vez que ingresás. Necesitamos algunos datos para crear tu cuenta.
      </p>
      <form className="teacher-form" onSubmit={handleSubmit}>
        <div className="teacher-field">
          <label htmlFor="tr-name">Nombre completo</label>
          <input
            id="tr-name" type="text" value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Tu nombre y apellido"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="teacher-error">{errors.name}</span>}
        </div>
        <div className="teacher-field">
          <label htmlFor="tr-inst">Institución educativa</label>
          <input
            id="tr-inst" type="text" value={form.institution}
            onChange={e => set('institution', e.target.value)}
            placeholder="Nombre de tu escuela o institución"
            className={errors.institution ? 'error' : ''}
          />
          {errors.institution && <span className="teacher-error">{errors.institution}</span>}
        </div>
        <div className="teacher-field">
          <label htmlFor="tr-country">País</label>
          <select
            id="tr-country" value={form.countryCode}
            onChange={e => set('countryCode', e.target.value)}
            className={errors.countryCode ? 'error' : ''}
          >
            <option value="">Seleccioná tu país</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {errors.countryCode && <span className="teacher-error">{errors.countryCode}</span>}
        </div>
        <div className="teacher-field">
          <label>Email</label>
          <input type="email" value={email} disabled />
        </div>
        {serverErr && <p className="teacher-error">{serverErr}</p>}
        <button className="teacher-btn-primary" type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Crear cuenta →'}
        </button>
      </form>
    </div>
  );
}
