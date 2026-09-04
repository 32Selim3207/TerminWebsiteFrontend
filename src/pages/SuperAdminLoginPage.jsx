import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { superadmin, loginSuperAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (superadmin) navigate('/superadmin', { replace: true });
  }, [superadmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await loginSuperAdmin(email.trim(), password);
      navigate('/superadmin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="view active">
      <div className="container narrow" style={{
        paddingTop: 80, paddingBottom: 80, maxWidth: 420,
      }}>
        <p className="eyebrow eyebrow-dark">SUPER-ADMIN</p>
        <h2>Plattform-Verwaltung</h2>
        <p className="section-sub">
          Nur für Plattform-Administratoren.
        </p>

        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <div className="field">
            <label htmlFor="sa-email">E-Mail</label>
            <input
              type="email" id="sa-email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="sa-password">Passwort</label>
            <input
              type="password" id="sa-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="field-error">{error}</div>}

          <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
            {submitting ? 'Wird angemeldet...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </section>
  );
}