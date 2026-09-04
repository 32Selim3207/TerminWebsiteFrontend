import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TABS = [
  { id: 'pending', label: 'Onay bekleyen' },
  { id: 'approved', label: 'Onaylı' },
  { id: 'all', label: 'Alle' },
];

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const { logoutSuperAdmin } = useAuth();

  const [tab, setTab] = useState('pending');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionId, setActionId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/superadmin/werkstaette', { params: { status: tab } });
      setList(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Daten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/superadmin/werkstaette/${id}/approve`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Aktion fehlgeschlagen.');
    } finally {
      setActionId(null);
    }
  };

  const unapprove = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/superadmin/werkstaette/${id}/unapprove`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Aktion fehlgeschlagen.');
    } finally {
      setActionId(null);
    }
  };

  const doDelete = async (id) => {
    setActionId(id);
    try {
      await api.delete(`/superadmin/werkstaette/${id}`);
      setConfirmDeleteId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Löschen fehlgeschlagen.');
    } finally {
      setActionId(null);
    }
  };

  const handleLogout = () => {
    logoutSuperAdmin();
    navigate('/superadmin/login', { replace: true });
  };

  return (
    <section className="view active">
      <div className="admin-shell">
        <div className="container">
          <div className="admin-head">
            <div>
              <p className="eyebrow eyebrow-dark">SUPER-ADMIN</p>
              <h2>Werkstätten verwalten</h2>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Abmelden
            </button>
          </div>

          <div className="admin-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={'tab-btn' + (tab === t.id ? ' is-active' : '')}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="field-error" style={{ marginBottom: 14 }}>{error}</div>
          )}

          <div className="admin-panel">
            {loading ? (
              <div className="appt-empty">Wird geladen...</div>
            ) : list.length === 0 ? (
              <div className="appt-empty">Keine Werkstätten in dieser Ansicht.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {list.map((w) => (
                  <WerkstattRow
                    key={w._id}
                    werkstatt={w}
                    isConfirmingDelete={confirmDeleteId === w._id}
                    isBusy={actionId === w._id}
                    onApprove={() => approve(w._id)}
                    onUnapprove={() => unapprove(w._id)}
                    onRequestDelete={() => setConfirmDeleteId(w._id)}
                    onAbortDelete={() => setConfirmDeleteId(null)}
                    onConfirmDelete={() => doDelete(w._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function WerkstattRow({
  werkstatt: w, isConfirmingDelete, isBusy,
  onApprove, onUnapprove, onRequestDelete, onAbortDelete, onConfirmDelete,
}) {
  return (
    <div style={{
      padding: 18, background: 'white', border: '1.5px solid var(--line)',
      borderRadius: 10,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ flex: '1 1 260px' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 16 }}>{w.name}</h4>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {w.ownerName} · {w.city}{w.address && ` · ${w.address}`}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {w.email} · {w.phone}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {w.isApproved ? (
              <span className="status-badge status-abgeschlossen">Onaylı</span>
            ) : w.onboardingCompleted ? (
              <span className="status-badge status-geplant">Onay bekliyor</span>
            ) : (
              <span className="status-badge status-storniert">Onboarding eksik</span>
            )}
            {(w.services?.length || 0) > 0 && (
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                padding: '3px 9px', background: 'var(--surface-2)',
                borderRadius: 12,
              }}>
                {w.services.length} Leistungen
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!w.isApproved && w.onboardingCompleted && (
            <button
              className="btn btn-accent btn-sm"
              onClick={onApprove}
              disabled={isBusy}
            >
              <svg className="icon"><use href="#icon-check" /></svg>
              Onayla
            </button>
          )}
          {w.isApproved && (
            <button
              className="btn btn-outline btn-sm"
              onClick={onUnapprove}
              disabled={isBusy}
            >
              Onayı kaldır
            </button>
          )}
          <button
            className="btn btn-danger-ghost btn-sm"
            onClick={onRequestDelete}
            disabled={isBusy}
          >
            <svg className="icon"><use href="#icon-trash" /></svg>
            Sil
          </button>
        </div>
      </div>

      {isConfirmingDelete && (
        <div className="cancel-confirm">
          <p>
            Möchten Sie <b>{w.name}</b> wirklich unwiderruflich löschen?
          </p>
          <div className="cancel-confirm-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={onAbortDelete}
              disabled={isBusy}
            >
              Abbrechen
            </button>
            <button
              className="btn btn-dark btn-sm"
              onClick={onConfirmDelete}
              disabled={isBusy}
              style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              {isBusy ? 'Wird gelöscht...' : 'Ja, löschen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}