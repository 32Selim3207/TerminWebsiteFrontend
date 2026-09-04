import { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDateLong } from '../../constants/booking';

export default function SettingsPanel({ profile, onProfileUpdated }) {
  return (
    <div>
      <DurationsBlock profile={profile} onProfileUpdated={onProfileUpdated} />
      <BlockedDatesBlock profile={profile} onProfileUpdated={onProfileUpdated} />
    </div>
  );
}

// ---------- Hizmet süreleri ----------
function DurationsBlock({ profile, onProfileUpdated }) {
  const [durations, setDurations] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Profil geldiğinde durations state'ini doldur
  useEffect(() => {
    const init = {};
    (profile.services || []).forEach((s) => { init[s.id] = s.duration; });
    setDurations(init);
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      // Mevcut servisleri koru, sadece duration'ları güncelle
      const newServices = profile.services.map((s) => ({
        id: s.id,
        label: s.label,
        desc: s.desc,
        price: s.price,
        duration: Number(durations[s.id]) || s.duration,
      }));
      await api.patch('/werkstaette/me', { services: newServices });
      await onProfileUpdated();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-block" style={{ marginBottom: 40 }}>
      <h3>Termindauer je Leistung</h3>
      <p className="section-sub small">
        Legen Sie fest, wie viele Minuten für jede Leistung standardmäßig eingeplant werden.
      </p>

      <div className="duration-fields">
        {(profile.services || []).map((s) => (
          <div key={s.id} className="duration-field-row">
            <label htmlFor={`dur-${s.id}`}>{s.label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                id={`dur-${s.id}`}
                type="number"
                min={5}
                max={480}
                step={5}
                value={durations[s.id] ?? ''}
                onChange={(e) => setDurations({ ...durations, [s.id]: e.target.value })}
                style={{
                  width: 80, padding: '8px 10px',
                  border: '1.5px solid var(--line)', borderRadius: 7,
                  fontFamily: 'var(--font-mono)', textAlign: 'right',
                }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>Min.</span>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="field-error" style={{ marginBottom: 10 }}>{error}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="btn btn-accent btn-sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Wird gespeichert...' : 'Speichern'}
        </button>
        {saved && (
          <span style={{ color: 'var(--success)', fontSize: 13.5, fontWeight: 600 }}>
            ✓ Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}

// ---------- Kapalı günler ----------
function BlockedDatesBlock({ profile, onProfileUpdated }) {
  const [newDate, setNewDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const blockedDates = [...(profile.blockedDates || [])].sort();

  const patchDates = async (nextDates) => {
    setSaving(true);
    setError(null);
    try {
      await api.patch('/werkstaette/me', { blockedDates: nextDates });
      await onProfileUpdated();
    } catch (err) {
      setError(err.response?.data?.error || 'Aktion fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newDate) return;
    if (blockedDates.includes(newDate)) {
      setError('Dieses Datum ist bereits blockiert.');
      return;
    }
    await patchDates([...blockedDates, newDate]);
    setNewDate('');
  };

  const handleRemove = async (dateStr) => {
    await patchDates(blockedDates.filter((d) => d !== dateStr));
  };

  return (
    <div className="settings-block">
      <h3>Geschlossene Tage</h3>
      <p className="section-sub small">
        Fügen Sie Feiertage oder Urlaubstage hinzu, an denen keine Termine gebucht werden können.
      </p>

      <div className="blocked-add">
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={handleAdd}
          disabled={saving || !newDate}
        >
          Hinzufügen
        </button>
      </div>

      {error && <div className="field-error" style={{ marginBottom: 10 }}>{error}</div>}

      {blockedDates.length === 0 ? (
        <div className="chips-empty">Keine geschlossenen Tage eingetragen.</div>
      ) : (
        <div className="chip-list">
          {blockedDates.map((d) => (
            <div key={d} className="chip">
              <span>{formatDateLong(d)}</span>
              <button
                type="button"
                onClick={() => handleRemove(d)}
                disabled={saving}
                aria-label={`${d} entfernen`}
              >
                <svg><use href="#icon-x" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}