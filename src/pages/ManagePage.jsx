import { useState } from 'react';
import api from '../services/api';
import { getServiceLabel, formatDateLong } from '../constants/booking';

const STATUS_META = {
  geplant: { label: 'Geplant', className: 'status-geplant' },
  abgeschlossen: { label: 'Abgeschlossen', className: 'status-abgeschlossen' },
  storniert: { label: 'Storniert', className: 'status-storniert' },
};

export default function ManagePage() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [appointment, setAppointment] = useState(null);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim() || !email.trim()) {
      setSearchError('Bitte geben Sie Termincode und E-Mail-Adresse ein.');
      return;
    }
    setSearching(true);
    setSearchError(null);
    setAppointment(null);
    setConfirmCancel(false);
    setCancelError(null);
    try {
      const { data } = await api.post('/appointments/search', {
        code: code.trim(),
        email: email.trim(),
      });
      setAppointment(data);
    } catch (err) {
      setSearchError(
        err.response?.data?.error ||
        'Termin nicht gefunden. Bitte prüfen Sie Ihre Angaben.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const { data } = await api.patch('/appointments/cancel', {
        code: appointment.appointmentCode,
        email: appointment.customerEmail,
      });
      setAppointment(data);
      setConfirmCancel(false);
    } catch (err) {
      setCancelError(
        err.response?.data?.error ||
        'Termin konnte nicht storniert werden.'
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <section className="view active">
      <div className="container narrow" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <p className="eyebrow eyebrow-dark">TERMIN VERWALTEN</p>
        <h2>Ihren Termin finden</h2>
        <p className="section-sub">
          Geben Sie Ihren Termincode und Ihre E-Mail-Adresse ein,
          um Ihren Termin einzusehen oder zu stornieren.
        </p>

        <form onSubmit={handleSearch} className="stack-form" noValidate>
          <div className="field">
            <label htmlFor="manage-code">Termincode</label>
            <input
              type="text"
              id="manage-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="z. B. MG-7F3K9"
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label htmlFor="manage-email">E-Mail-Adresse</label>
            <input
              type="email"
              id="manage-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@email.de"
              autoComplete="email"
            />
          </div>

          {searchError && (
            <div className="field-error">{searchError}</div>
          )}

          <button
            type="submit"
            className="btn btn-accent btn-block"
            disabled={searching}
          >
            <svg className="icon"><use href="#icon-search" /></svg>
            {searching ? 'Wird gesucht...' : 'Termin suchen'}
          </button>
        </form>

        {appointment && (
          <div className="manage-result">
            <ResultCard
              appointment={appointment}
              confirmCancel={confirmCancel}
              cancelling={cancelling}
              cancelError={cancelError}
              onRequestCancel={() => setConfirmCancel(true)}
              onAbortCancel={() => { setConfirmCancel(false); setCancelError(null); }}
              onConfirmCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function ResultCard({
  appointment, confirmCancel, cancelling, cancelError,
  onRequestCancel, onAbortCancel, onConfirmCancel,
}) {
  const status = STATUS_META[appointment.status] || STATUS_META.geplant;
  const canCancel = appointment.status === 'geplant';

  return (
    <div className="result-card">
      <div className="result-head">
        <div>
          <h3>{getServiceLabel(appointment.serviceType)}</h3>
          <div style={{ color: 'var(--muted)', fontSize: 13.5, fontFamily: 'var(--font-mono)' }}>
            {appointment.appointmentCode}
          </div>
        </div>
        <span className={`status-badge ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="result-rows">
        <div><span>Datum:</span> <b>{formatDateLong(appointment.date)}</b></div>
        <div><span>Uhrzeit:</span> <b>{appointment.startTime} – {appointment.endTime} Uhr</b></div>
        <div><span>Fahrzeug:</span> {appointment.vehicleBrand} {appointment.vehicleModel}
          {appointment.licensePlate && ` (${appointment.licensePlate})`}
        </div>
        <div><span>Name:</span> {appointment.customerName}</div>
        <div><span>Telefon:</span> {appointment.customerPhone}</div>
        {appointment.problemNote && (
          <div><span>Hinweis:</span> {appointment.problemNote}</div>
        )}
      </div>

      {canCancel && !confirmCancel && (
        <button
          type="button"
          className="btn btn-danger-ghost btn-sm"
          onClick={onRequestCancel}
        >
          <svg className="icon"><use href="#icon-trash" /></svg>
          Termin stornieren
        </button>
      )}

      {confirmCancel && (
        <div className="cancel-confirm">
          <p>Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.</p>
          {cancelError && (
            <div className="field-error" style={{ marginBottom: 10 }}>{cancelError}</div>
          )}
          <div className="cancel-confirm-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onAbortCancel}
              disabled={cancelling}
            >
              Zurück
            </button>
            <button
              type="button"
              className="btn btn-dark btn-sm"
              onClick={onConfirmCancel}
              disabled={cancelling}
              style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
            >
              {cancelling ? 'Wird storniert...' : 'Ja, stornieren'}
            </button>
          </div>
        </div>
      )}

      {appointment.status === 'storniert' && (
        <p style={{ color: 'var(--muted)', fontSize: 13.5, margin: '10px 0 0', fontStyle: 'italic' }}>
          Dieser Termin wurde storniert.
        </p>
      )}
    </div>
  );
}