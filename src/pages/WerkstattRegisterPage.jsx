import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WerkstattRegisterPage() {
  const navigate = useNavigate();
  const { werkstatt, registerWerkstatt } = useAuth();

  const [form, setForm] = useState({
    name: '', ownerName: '', email: '', password: '',
    phone: '', address: '', city: '', postalCode: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Zaten girişliyse doğru yere at
  useEffect(() => {
    if (werkstatt) {
      if (!werkstatt.onboardingCompleted) navigate('/onboarding', { replace: true });
      else if (!werkstatt.isApproved) navigate('/pending', { replace: true });
      else navigate('/admin', { replace: true });
    }
  }, [werkstatt, navigate]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return 'Bitte geben Sie den Werkstatt-Namen an.';
    if (!form.ownerName.trim()) return 'Bitte geben Sie den Inhaber-Namen an.';
    if (!form.email.trim()) return 'Bitte geben Sie eine E-Mail an.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Ungültige E-Mail-Adresse.';
    if (form.password.length < 6) return 'Passwort muss mindestens 6 Zeichen lang sein.';
    if (!form.phone.trim()) return 'Bitte geben Sie eine Telefonnummer an.';
    if (!form.address.trim()) return 'Bitte geben Sie eine Adresse an.';
    if (!form.city.trim()) return 'Bitte geben Sie eine Stadt an.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    setError(null);
    try {
      await registerWerkstatt(form);
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registrierung fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="view active">
      <div className="container narrow" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 560 }}>
        <p className="eyebrow eyebrow-dark">FÜR WERKSTÄTTEN</p>
        <h2>Werkstatt registrieren</h2>
        <p className="section-sub">
          Erstellen Sie ein Werkstatt-Konto. Nach der Freischaltung durch unser Team
          können Kunden Termine bei Ihnen online buchen.
        </p>

        <form onSubmit={handleSubmit} className="stack-form" noValidate>
          <div className="field">
            <label htmlFor="reg-name">Werkstatt-Name <span className="req">*</span></label>
            <input
              id="reg-name" type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="z. B. Murat Garajı"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-owner">Inhaber-Name <span className="req">*</span></label>
            <input
              id="reg-owner" type="text"
              value={form.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
              placeholder="Vor- und Nachname"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-email">E-Mail <span className="req">*</span></label>
              <input
                id="reg-email" type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Passwort <span className="req">*</span></label>
              <input
                id="reg-password" type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="reg-phone">Telefon <span className="req">*</span></label>
            <input
              id="reg-phone" type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="z. B. 089 12345678"
            />
          </div>

          <div className="field">
            <label htmlFor="reg-address">Adresse <span className="req">*</span></label>
            <input
              id="reg-address" type="text"
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              placeholder="Straße und Hausnummer"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-plz">PLZ</label>
              <input
                id="reg-plz" type="text"
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="z. B. 80331"
              />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="reg-city">Stadt <span className="req">*</span></label>
              <input
                id="reg-city" type="text"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="z. B. München"
              />
            </div>
          </div>

          {error && <div className="field-error">{error}</div>}

          <button type="submit" className="btn btn-accent btn-block" disabled={submitting}>
            {submitting ? 'Wird registriert...' : 'Konto erstellen'}
          </button>

          <p className="field-hint" style={{ textAlign: 'center' }}>
            Bereits registriert? <Link to="/admin/login">Anmelden</Link>
          </p>
        </form>
      </div>
    </section>
  );
}