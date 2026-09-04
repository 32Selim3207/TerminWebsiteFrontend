import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CATEGORY_LABELS } from '../constants/booking';

const CATEGORY_FILTERS = [
  { id: '', label: 'Alle' },
  { id: 'wartung', label: 'Wartung' },
  { id: 'motor', label: 'Motor' },
  { id: 'elektronik', label: 'Elektronik' },
  { id: 'reifen', label: 'Reifen' },
  { id: 'karosserie', label: 'Karosserie' },
];

export default function DiscoveryPage() {
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (params) => {
    setLoading(true);
    try {
      const { data } = await api.get('/werkstaette', { params });
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load({ category: category || undefined });
  }, [category, load]);

  const handleSubmit = (e) => {
    e.preventDefault();
    load({
      city: city || undefined,
      search: search || undefined,
      category: category || undefined,
    });
  };

  return (
    <section className="view active">
      <div className="hero">
        <div className="container hero-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <p className="eyebrow">KFZ-WERKSTATT FINDEN</p>
            <h1>Termin online buchen bei Werkstätten in Ihrer Nähe.</h1>
            <p className="hero-sub">
              Suchen Sie nach Standort oder Leistung — buchen Sie in wenigen Minuten,
              ganz ohne Anruf.
            </p>

            <form onSubmit={handleSubmit} style={{
              display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap',
            }}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Werkstatt-Name..."
                style={{
                  flex: '1 1 220px', padding: '12px 14px',
                  border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 15,
                }}
              />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Stadt (z. B. München)"
                style={{
                  flex: '1 1 220px', padding: '12px 14px',
                  border: '1.5px solid var(--line)', borderRadius: 8, fontSize: 15,
                }}
              />
              <button type="submit" className="btn btn-accent">
                <svg className="icon"><use href="#icon-search" /></svg> Suchen
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="services">
        <div className="container">
          <div className="filter-bar" style={{ marginBottom: 22 }}>
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.id}
                className={'filter-btn' + (category === f.id ? ' is-active' : '')}
                onClick={() => setCategory(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="appt-empty">Werkstätten werden geladen...</div>
          ) : list.length === 0 ? (
            <div className="appt-empty">
              Keine Werkstätten gefunden. Bitte passen Sie Ihre Suche an.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 18,
            }}>
              {list.map((w) => <WerkstattCard key={w._id} werkstatt={w} />)}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

function WerkstattCard({ werkstatt: w }) {
  // Unique kategoriler
  const cats = [...new Set((w.services || []).map((s) => s.category))].filter(Boolean);

  return (
    <Link
      to={`/werkstatt/${w._id}`}
      className="service-card"
      style={{ textDecoration: 'none', textAlign: 'left' }}
    >
      <span className="service-icon">
        <svg><use href="#icon-wrench" /></svg>
      </span>
      <h3>{w.name}</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 12 }}>
        {w.city}{w.address && ` · ${w.address}`}
      </p>
      {w.description && (
        <p style={{
          fontSize: 13.5, color: 'var(--muted)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: 12,
        }}>
          {w.description}
        </p>
      )}
      {cats.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {cats.map((c) => (
            <span key={c} style={{
              fontSize: 11, fontFamily: 'var(--font-mono)',
              padding: '3px 9px', background: 'var(--surface-2)',
              borderRadius: 12, color: 'var(--ink)',
            }}>
              {CATEGORY_LABELS[c] || c}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}