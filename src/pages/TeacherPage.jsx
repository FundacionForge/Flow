import { useState, useEffect } from 'react';
import { getSession, onAuthStateChange, signOut } from '../services/auth.js';
import { getTeacherProfile } from '../services/teachers.js';
import TeacherLogin from './TeacherLogin.jsx';
import TeacherRegister from './TeacherRegister.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';

export default function TeacherPage() {
  const [loading, setLoading]   = useState(true);
  const [session, setSession]   = useState(null);
  const [profile, setProfile]   = useState(null); // null = not loaded, false = doesn't exist

  async function loadProfile(sess) {
    if (!sess) { setProfile(null); return; }
    try {
      const p = await getTeacherProfile();
      setProfile(p ?? false);
    } catch {
      setProfile(false);
    }
  }

  useEffect(() => {
    getSession().then(sess => {
      setSession(sess);
      loadProfile(sess).finally(() => setLoading(false));
    });

    const { data: { subscription } } = onAuthStateChange(sess => {
      setSession(sess);
      loadProfile(sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleRegistered(newProfile) {
    setProfile(newProfile);
  }

  if (loading) {
    return (
      <div className="teacher-loading">
        <div className="teacher-spinner" />
      </div>
    );
  }

  return (
    <div className="teacher-shell">
      <header className="teacher-header">
        <div className="teacher-header-inner">
          <img src="/logo-flow.png" alt="FLOW" className="teacher-header-logo" />
          {session && (
            <button className="teacher-signout-btn" onClick={signOut}>
              Cerrar sesión
            </button>
          )}
        </div>
      </header>

      <main className="teacher-main">
        {!session && <TeacherLogin />}
        {session && profile === false && (
          <TeacherRegister
            email={session.user.email}
            onRegistered={handleRegistered}
          />
        )}
        {session && profile && (
          <TeacherDashboard teacher={profile} />
        )}
      </main>
    </div>
  );
}
