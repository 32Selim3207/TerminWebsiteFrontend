import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function routeForWerkstatt(w) {
  if (!w.onboardingCompleted) return '/onboarding';
  if (!w.isApproved) return '/pending';
  return '/admin';
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { werkstatt, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (werkstatt) {
      navigate(routeForWerkstatt(werkstatt), { replace: true });
    }
  }, [werkstatt, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const w = await login(email.trim(), password);
      navigate(routeForWerkstatt(w), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Anmeldung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="view active">
      <div className="container narrow" style={{ paddingTop: 60, paddingBottom: 80, maxWidth: 420 }}>
        <p className="eyebrow eyebrow-dark">FÜR WERKSTÄTTEN</p>
        <h2>Werkstatt-Login</h2>
        <p className="section-sub">
          Melden Sie sich mit Ihrer Werkstatt-E-Mail an.
        </p>

        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <div className="field">
            <label htmlFor="admin-email">E-Mail</label>
            <input
              type="email" id="admin-email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="admin-password">Passwort</label>
            <input
              type="password" id="admin-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="field-error">{error}</div>}

          <button type="submit" className="btn btn-dark btn-block" disabled={submitting}>
            {submitting ? 'Wird angemeldet...' : 'Anmelden'}
          </button>

          <p className="field-hint" style={{ textAlign: 'center' }}>
            Noch kein Konto? <Link to="/werkstatt/register">Jetzt registrieren</Link>
          </p>
        </form>
      </div>
    </section>
  );
}