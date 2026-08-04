import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getGroups, createGroup, getGroupStats } from '../services/groups.js';

function GroupCard({ group, onShare }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getGroupStats(group.code).then(setStats);
  }, [group.code]);

  const link = `${window.location.origin}/?g=${group.code}`;
  const hasEnough = (stats?.completions ?? 0) >= 10;
  const lastDate = stats?.lastAt
    ? new Date(stats.lastAt).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div className="group-card">
      <div className="group-card-top">
        <div>
          <h3 className="group-card-name">{group.name}</h3>
          <span className="group-card-code">Código: {group.code}</span>
        </div>
        <button className="group-share-btn" onClick={() => onShare(group)}>
          Compartir
        </button>
      </div>

      <div className="group-card-stats">
        <div className="group-stat">
          <span className="group-stat-num">{stats?.completions ?? '—'}</span>
          <span className="group-stat-label">completaron</span>
        </div>
        <div className="group-stat">
          <span className="group-stat-num">{lastDate}</span>
          <span className="group-stat-label">última respuesta</span>
        </div>
      </div>

      {!hasEnough && stats !== null && (
        <p className="group-card-notice">
          El reporte estará disponible cuando haya al menos 10 respuestas.
          {stats.completions > 0 && ` Ya hay ${stats.completions}.`}
        </p>
      )}

      {hasEnough && (
        <a
          className="teacher-btn-primary group-report-btn"
          href={`/docente/reporte/${group.code}`}
        >
          Ver reporte del grupo →
        </a>
      )}
    </div>
  );
}

function ShareModal({ group, onClose }) {
  const link = `${window.location.origin}/?g=${group.code}`;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const waText = encodeURIComponent(
    `Hola! Completa el cuestionario FLOW de Fundación Forge para el grupo "${group.name}":\n${link}`
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Compartir grupo</h3>
        <p className="modal-group-name">{group.name}</p>

        <div className="modal-qr">
          <QRCodeSVG value={link} size={200} />
          <p className="modal-qr-hint">Proyectá este QR en clase</p>
        </div>

        <div className="modal-link-row">
          <input className="modal-link-input" readOnly value={link} />
          <button className="teacher-btn-secondary" onClick={handleCopy}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>

        <a
          className="teacher-btn-whatsapp"
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          📲 Compartir por WhatsApp
        </a>
      </div>
    </div>
  );
}

function NewGroupModal({ teacher, onCreated, onClose }) {
  const [name, setName]     = useState('');
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Ingresa un nombre para el grupo.'); return; }
    setLoad(true);
    try {
      const group = await createGroup(name.trim(), teacher.id);
      onCreated(group);
    } catch {
      setError('No se pudo crear el grupo. Intentá de nuevo.');
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3 className="modal-title">Nuevo grupo</h3>
        <p className="modal-desc">
          Asigná un nombre que te ayude a identificar el grupo, por ejemplo "3° año B — 2025".
        </p>
        <form className="teacher-form" onSubmit={handleSubmit}>
          <div className="teacher-field">
            <label htmlFor="ng-name">Nombre del grupo</label>
            <input
              id="ng-name" type="text" value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Ej: 2° año A"
              autoFocus
            />
            {error && <span className="teacher-error">{error}</span>}
          </div>
          <button className="teacher-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando…' : 'Crear grupo →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TeacherDashboard({ teacher }) {
  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showNew, setShowNew]       = useState(false);
  const [shareGroup, setShareGroup] = useState(null);

  useEffect(() => {
    getGroups()
      .then(setGroups)
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(group) {
    setGroups(prev => [group, ...prev]);
    setShowNew(false);
    setShareGroup(group);
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Mis grupos</h1>
          <p className="dashboard-subtitle">
            Bienvenido/a, <strong>{teacher.name}</strong> · {teacher.institution}
          </p>
        </div>
        <button className="teacher-btn-primary" onClick={() => setShowNew(true)}>
          + Nuevo grupo
        </button>
      </div>

      {loading && <p className="dashboard-loading">Cargando grupos…</p>}

      {!loading && groups.length === 0 && (
        <div className="dashboard-empty">
          <p>Todavía no creaste ningún grupo.</p>
          <button className="teacher-btn-primary" onClick={() => setShowNew(true)}>
            Crear mi primer grupo →
          </button>
        </div>
      )}

      <div className="groups-list">
        {groups.map(g => (
          <GroupCard key={g.id} group={g} onShare={setShareGroup} />
        ))}
      </div>

      {showNew && (
        <NewGroupModal
          teacher={teacher}
          onCreated={handleCreated}
          onClose={() => setShowNew(false)}
        />
      )}

      {shareGroup && (
        <ShareModal
          group={shareGroup}
          onClose={() => setShareGroup(null)}
        />
      )}
    </div>
  );
}
