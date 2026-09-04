import { useState, useMemo } from 'react';
import api from '../../services/api';
import { getServiceLabel, todayStr, DAYS_DE } from '../../constants/booking';

const STATUS_LABEL = {
  geplant: 'Geplant',
  abgeschlossen: 'Abgeschlossen',
  storniert: 'Storniert',
};

const FILTERS = [
  { id: 'upcoming', label: 'Anstehend' },
  { id: 'today', label: 'Heute' },
  { id: 'completed', label: 'Abgeschlossen' },
  { id: 'cancelled', label: 'Storniert' },
  { id: 'all', label: 'Alle' },
];

function formatDateShort(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS_DE[dt.getDay()]}, ${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

export default function AppointmentsPanel({ appointments, services, onRefresh }) {
  const [filter, setFilter] = useState('upcoming');
  const [openId, setOpenId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const filteredList = useMemo(() => {
    const today = todayStr();
    let list = [...appointments];
    if (filter === 'upcoming') {
      list = list.filter((a) => a.date >= today && a.status === 'geplant');
    } else if (filter === 'today') {
      list = list.filter((a) => a.date === today && a.status !== 'storniert');
    } else if (filter === 'completed') {
      list = list.filter((a) => a.status === 'abgeschlossen');
    } else if (filter === 'cancelled') {
      list = list.filter((a) => a.status === 'storniert');
    }
    list.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
    return list;
  }, [appointments, filter]);

  const updateStatus = async (appointmentId, newStatus) => {
    setActionLoading(appointmentId);
    setActionError(null);
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      await onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Aktion fehlgeschlagen.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={'filter-btn' + (filter === f.id ? ' is-active' : '')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {actionError && (
        <div className="field-error" style={{ marginBottom: 14 }}>{actionError}</div>
      )}

      {filteredList.length === 0 ? (
        <div className="appt-empty">Keine Termine in dieser Ansicht.</div>
      ) : (
        <div className="appt-list">
          {filteredList.map((a) => (
            <AppointmentRow
              key={a._id}
              appointment={a}
              services={services}
              isOpen={openId === a._id}
              onToggle={() => setOpenId(openId === a._id ? null : a._id)}
              isLoading={actionLoading === a._id}
              onComplete={() => updateStatus(a._id, 'abgeschlossen')}
              onCancel={() => updateStatus(a._id, 'storniert')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ appointment: a, services, isOpen, onToggle, isLoading, onComplete, onCancel }) {
  const serviceLabel = getServiceLabel(a.serviceType, services);
  return (
    <div className={'appt-row' + (isOpen ? ' is-open' : '')}>
      <button type="button" className="appt-row-summary" onClick={onToggle}>
        <span className="cell-date">
          {a.startTime}
          <small>{formatDateShort(a.date)}</small>
        </span>
        <span className="cell-service">{serviceLabel}</span>
        <span className="cell-customer">
          {a.vehicleBrand} {a.vehicleModel} · {a.customerName}
        </span>
        <span className={`status-badge status-${a.status}`}>
          {STATUS_LABEL[a.status]}
        </span>
        <svg className="icon"><use href="#icon-chevron-down" /></svg>
      </button>

      {isOpen && (
        <div className="appt-row-detail">
          <div className="detail-grid">
            <div className="detail-block">
              <h5>Fahrzeug</h5>
              <p>{a.vehicleBrand} {a.vehicleModel}</p>
              {a.vehicleYear && <p>Baujahr {a.vehicleYear}</p>}
              {a.licensePlate && <p>{a.licensePlate}</p>}
            </div>
            <div className="detail-block">
              <h5>Kontakt</h5>
              <p>{a.customerName}</p>
              <p><a href={`tel:${a.customerPhone}`}>{a.customerPhone}</a></p>
              <p><a href={`mailto:${a.customerEmail}`}>{a.customerEmail}</a></p>
            </div>
          </div>

          {a.problemNote && (
            <div className="detail-note">
              <b>Notiz:</b> {a.problemNote}
            </div>
          )}

          {a.status === 'geplant' && (
            <div className="detail-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={onComplete}
                disabled={isLoading}
              >
                <svg className="icon"><use href="#icon-check" /></svg>
                Als abgeschlossen markieren
              </button>
              <button
                className="btn btn-danger-ghost btn-sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                <svg className="icon"><use href="#icon-x" /></svg>
                Stornieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}