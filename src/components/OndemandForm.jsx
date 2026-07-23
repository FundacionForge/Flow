import { useState } from 'react';

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

export default function OndemandForm({ detectedCountry, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    lastname: '',
    age: '',
    email: '',
    country: detectedCountry ?? '',
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())     e.name     = 'Ingresa tu nombre.';
    if (!form.lastname.trim()) e.lastname = 'Ingresa tu apellido.';
    const age = parseInt(form.age, 10);
    if (!form.age || isNaN(age) || age < 10 || age > 99)
      e.age = 'Ingresa una edad válida.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Ingresa un email válido.';
    if (!form.country)         e.country  = 'Selecciona tu país.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, age: parseInt(form.age, 10) });
  }

  return (
    <form className="od-form" onSubmit={handleSubmit} noValidate>
      <p className="od-form-title">Antes de empezar, completá tus datos</p>

      <div className="od-row">
        <div className="od-field">
          <label htmlFor="od-name">Nombre</label>
          <input
            id="od-name" type="text" value={form.name} autoComplete="given-name"
            onChange={ev => set('name', ev.target.value)}
            className={errors.name ? 'error' : ''}
            placeholder="Tu nombre"
          />
          {errors.name && <span className="od-error">{errors.name}</span>}
        </div>
        <div className="od-field">
          <label htmlFor="od-lastname">Apellido</label>
          <input
            id="od-lastname" type="text" value={form.lastname} autoComplete="family-name"
            onChange={ev => set('lastname', ev.target.value)}
            className={errors.lastname ? 'error' : ''}
            placeholder="Tu apellido"
          />
          {errors.lastname && <span className="od-error">{errors.lastname}</span>}
        </div>
      </div>

      <div className="od-row">
        <div className="od-field">
          <label htmlFor="od-age">Edad</label>
          <input
            id="od-age" type="number" value={form.age} min="10" max="99"
            onChange={ev => set('age', ev.target.value)}
            className={errors.age ? 'error' : ''}
            placeholder="Tu edad"
          />
          {errors.age && <span className="od-error">{errors.age}</span>}
        </div>
        <div className="od-field">
          <label htmlFor="od-country">País</label>
          <select
            id="od-country" value={form.country}
            onChange={ev => set('country', ev.target.value)}
            className={errors.country ? 'error' : ''}
          >
            <option value="">Seleccioná tu país</option>
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {errors.country && <span className="od-error">{errors.country}</span>}
        </div>
      </div>

      <div className="od-field">
        <label htmlFor="od-email">Email</label>
        <input
          id="od-email" type="email" value={form.email} autoComplete="email"
          onChange={ev => set('email', ev.target.value)}
          className={errors.email ? 'error' : ''}
          placeholder="tu@email.com"
        />
        {errors.email && <span className="od-error">{errors.email}</span>}
      </div>

      {/* TODO: insertar aquí el texto de política de privacidad provisto por el equipo legal de Forge */}
      <p className="od-privacy-placeholder">
        🔒 <em>[Política de privacidad — texto pendiente del equipo legal de Forge]</em>
      </p>

      <button type="submit" className="btn-start">
        Empezar →
      </button>
    </form>
  );
}
