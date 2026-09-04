import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { todayStr, toDateStr } from '../constants/booking';
import AppointmentsPanel from '../components/admin/AppointmentsPanel';
import SettingsPanel from '../components/admin/SettingsPanel';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { werkstatt, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('appointments');

  const refreshAppointments = useCallback(async () => {
    const { data } = await api.get(`/appointments/werkstatt/${werkstatt.id}`);
    setAppointments(data);
  }, [werkstatt]);

  const refreshProfile = useCallback(async () => {
    const { data } = await api.get('/werkstaette/me');
    setProfile(data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [profileRes, apptsRes] = await Promise.all([
          api.get('/werkstaette/me'),
          api.get(`/appointments/werkstatt/${werkstatt.id}`),
        ]);
        if (!cancelled) {
          setProfile(profileRes.data);
          setAppointments(apptsRes.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || 'Daten konnten nicht geladen werden.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [werkstatt]);

  const stats = useMemo(() => {
    const today = todayStr();
    const weekAhead = new Date();
    weekAhead.setDate(weekAhead.getDate() + 7);
    const weekAheadStr = toDateStr(weekAhead);

    const todayCount = appointments.filter(
      (a) => a.date === today && a.status !== 'storniert'
    ).length;
    const weekCount = appointments.filter(
      (a) => a.date >= today && a.date <= weekAheadStr && a.status !== 'storniert'
    ).length;
    const upcomingCount = appointments.filter(
      (a) => a.date >= today && a.status === 'geplant'
    ).length;

    return { todayCount, weekCount, upcomingCount };
  }, [appointments]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  if (loading) {
    return (
      <section className="view active">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="section-sub">Lädt...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="view active">
        <div className="container" style={{ padding: '80px 24px' }}>
          <div className="field-error">{error}</div>
          <button className="btn btn-outline" onClick={handleLogout} style={{ marginTop: 20 }}>
            Abmelden
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="admin-shell">
        <div className="container">
          <div className="admin-head">
            <div>
              <p className="eyebrow eyebrow-dark">VERWALTUNG</p>
              <h2>{profile?.name || werkstatt.name} – Übersicht</h2>
            </div>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Abmelden
            </button>
          </div>

          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-num">{stats.todayCount}</div>
              <div className="stat-label">Heute</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{stats.weekCount}</div>
              <div className="stat-label">Nächste 7 Tage</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{stats.upcomingCount}</div>
              <div className="stat-label">Anstehend gesamt</div>
            </div>
          </div>

          <div className="admin-tabs">
            <button
              className={'tab-btn' + (activeTab === 'appointments' ? ' is-active' : '')}
              onClick={() => setActiveTab('appointments')}
            >
              Termine
            </button>
            <button
              className={'tab-btn' + (activeTab === 'settings' ? ' is-active' : '')}
              onClick={() => setActiveTab('settings')}
            >
              Einstellungen
            </button>
          </div>

          <div className="admin-panel">
            {activeTab === 'appointments' && (
              <AppointmentsPanel
                appointments={appointments}
                services={profile?.services}
                onRefresh={refreshAppointments}
              />
            )}
            {activeTab === 'settings' && profile && (
              <SettingsPanel
                profile={profile}
                onProfileUpdated={refreshProfile}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}