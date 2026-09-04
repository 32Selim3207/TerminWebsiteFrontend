import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { werkstatt, logoutWerkstatt, refreshWerkstatt } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshWerkstatt();
      if (data.isApproved) {
        navigate('/admin', { replace: true });
      }
    } catch {
      // Ignore, sessizce başarısız ol
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logoutWerkstatt();
    navigate('/', { replace: true });
  };

  return (
    <section className="view active">
      <div className="container narrow" style={{
        paddingTop: 80, paddingBottom: 80, maxWidth: 520, textAlign: 'center',
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%',
          background: 'var(--surface-2)', margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          <svg width="40" height="40"><use href="#icon-clock" /></svg>
        </div>

        <p className="eyebrow eyebrow-dark">STATUS</p>
        <h2>Ihr Konto wartet auf Freischaltung</h2>
        <p className="section-sub">
          Vielen Dank für Ihre Registrierung, <b>{werkstatt?.name}</b>!
          <br />
          Unser Team prüft Ihre Angaben und schaltet Ihr Konto so bald wie möglich frei.
          Sie erhalten eine Benachrichtigung, sobald Ihre Werkstatt freigeschaltet ist.
        </p>

        <div style={{
          padding: 18, background: 'var(--surface-2)', borderRadius: 10,
          margin: '28px 0', textAlign: 'left', fontSize: 14,
        }}>
          <div style={{ marginBottom: 6 }}><b>Was passiert als Nächstes?</b></div>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--muted)' }}>
            <li>Unser Team überprüft Ihre Werkstatt-Angaben.</li>
            <li>Nach der Freischaltung erscheinen Sie in der öffentlichen Suche.</li>
            <li>Kunden können dann Termine bei Ihnen buchen.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Wird geprüft...' : 'Status aktualisieren'}
          </button>
          <button className="btn btn-dark" onClick={handleLogout}>
            Abmelden
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 28 }}>
          Fragen? Kontakt: <a href="mailto:support@autotermin.de">support@autotermin.de</a>
        </p>
      </div>
    </section>
  );
}