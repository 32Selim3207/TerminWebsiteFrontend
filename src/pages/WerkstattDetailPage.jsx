import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getServiceIcon, CATEGORY_LABELS } from '../constants/booking';

export default function WerkstattDetailPage() {
  const { werkstattId } = useParams();
  const navigate = useNavigate();
  const [werkstatt, setWerkstatt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/werkstaette/${werkstattId}`)
      .then((res) => setWerkstatt(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Werkstatt nicht gefunden.'))
      .finally(() => setLoading(false));
  }, [werkstattId]);

  if (loading) {
    return (
      <section className="view active">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="section-sub">Lädt...</p>
        </div>
      </section>
    );
  }

  if (error || !werkstatt) {
    return (
      <section className="view active">
        <div className="container narrow" style={{ padding: '80px 24px' }}>
          <div className="field-error">{error || 'Nicht gefunden.'}</div>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 20 }}>
            ← Zur Werkstatt-Suche
          </Link>
        </div>
      </section>
    );
  }

  // Hizmetleri kategoriye göre grupla
  const grouped = {};
  (werkstatt.services || []).forEach((s) => {
    const cat = s.category || 'custom';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const goToBooking = (serviceId) => {
    const path = `/werkstatt/${werkstattId}/book`;
    navigate(serviceId ? `${path}?service=${serviceId}` : path);
  };

  return (
    <section className="view active">
      <div className="hero">
        <div className="container hero-inner">
          <div>
            <p className="eyebrow">KFZ-WERKSTATT</p>
            <h1>{werkstatt.name}</h1>
            {werkstatt.description && (
              <p className="hero-sub">{werkstatt.description}</p>
            )}
            <div className="hero-actions">
              <button className="btn btn-accent" onClick={() => goToBooking(null)}>
                <svg className="icon"><use href="#icon-calendar" /></svg>
                Termin buchen
              </button>
            </div>
          </div>

          <div className="hours-plaque">
            <h4>Kontakt</h4>
            {werkstatt.address && (
              <div className="hours-row"><span>Adresse</span><span>{werkstatt.address}</span></div>
            )}
            {werkstatt.city && (
              <div className="hours-row"><span>Stadt</span><span>{werkstatt.postalCode ? `${werkstatt.postalCode} ` : ''}{werkstatt.city}</span></div>
            )}
            {werkstatt.phone && (
              <div className="hours-row"><span>Telefon</span><span>{werkstatt.phone}</span></div>
            )}
            {werkstatt.email && (
              <div className="hours-row"><span>E-Mail</span><span style={{ fontSize: 12 }}>{werkstatt.email}</span></div>
            )}
            <div style={{ height: 12 }} />
            <h4>Öffnungszeiten</h4>
            <div className="hours-row"><span>Mo – Fr</span><span>{werkstatt.openingHours?.weekdays || '—'}</span></div>
            <div className="hours-row"><span>Samstag</span><span>{werkstatt.openingHours?.saturday || '—'}</span></div>
            <div className="hours-row"><span>Sonntag</span><span>{werkstatt.openingHours?.sunday || 'Geschlossen'}</span></div>
          </div>
        </div>
      </div>

      <section className="services">
        <div className="container">
          <p className="eyebrow eyebrow-dark">LEISTUNGEN</p>
          <h2>Angebotene Leistungen</h2>
          <p className="section-sub">
            Klicken Sie auf eine Leistung, um direkt einen Termin zu buchen.
          </p>

          {Object.keys(grouped).length === 0 ? (
            <div className="appt-empty">Noch keine Leistungen eingetragen.</div>
          ) : (
            Object.entries(grouped).map(([cat, services]) => (
              <div key={cat} style={{ marginBottom: 28 }}>
                <h3 style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, textTransform: 'uppercase',
                  letterSpacing: '1.2px', color: 'var(--muted)', margin: '20px 0 12px',
                }}>
                  {CATEGORY_LABELS[cat] || cat}
                </h3>
                <div className="service-grid">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      className="service-card"
                      onClick={() => goToBooking(s.id)}
                      style={{ textAlign: 'left' }}
                    >
                      <span className="service-icon">
                        <svg><use href={`#${getServiceIcon(s)}`} /></svg>
                      </span>
                      <h3>{s.label}</h3>
                      {s.desc && <p>{s.desc}</p>}
                      <div style={{
                        marginTop: 12, display: 'flex', gap: 14,
                        fontSize: 13, color: 'var(--muted)',
                      }}>
                        <span>⏱ {s.duration} Min.</span>
                        {s.price > 0 && <span>💶 ab {s.price} €</span>}
                        {(!s.price || s.price === 0) && <span>Preis auf Anfrage</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );
}