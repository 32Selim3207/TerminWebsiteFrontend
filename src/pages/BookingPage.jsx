import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  emptyBooking, validators, STEP_LABELS,
  findService, formatDateLong,
} from '../constants/booking';

import Step1Service from '../components/booking/Step1Service';
import Step2Vehicle from '../components/booking/Step2Vehicle';
import Step3DateTime from '../components/booking/Step3DateTime';
import Step4Contact from '../components/booking/Step4Contact';
import Step5Summary from '../components/booking/Step5Summary';

export default function BookingPage() {
  const { werkstattId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [werkstatt, setWerkstatt] = useState(null);
  const [wLoading, setWLoading] = useState(true);
  const [wError, setWError] = useState(null);

  const [step, setStep] = useState(1);
  const [data, setData] = useState(emptyBooking);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Werkstatt'ı yükle
  useEffect(() => {
    setWLoading(true);
    api.get(`/werkstaette/${werkstattId}`)
      .then((res) => {
        setWerkstatt(res.data);
        // URL'de ?service=xxx varsa ve werkstatt o hizmeti sunuyorsa Step 1'i doldur
        const preselected = searchParams.get('service');
        if (preselected && res.data.services?.some((s) => s.id === preselected)) {
          setData((prev) => ({ ...prev, serviceType: preselected }));
        }
      })
      .catch((err) => setWError(err.response?.data?.error || 'Werkstatt nicht gefunden.'))
      .finally(() => setWLoading(false));
  }, [werkstattId, searchParams]);

  const update = (patch) => {
    setData((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const handleNext = async () => {
    const err = validators[step](data);
    if (err) { setError(err); return; }

    if (step < 5) { setStep(step + 1); return; }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        werkstattId,
        serviceType: data.serviceType,
        problemNote: data.problemNote,
        vehicleBrand: data.brand === 'Andere' ? data.brandOther : data.brand,
        vehicleModel: data.model,
        vehicleYear: data.year,
        licensePlate: data.plate,
        date: data.date,
        startTime: data.startTime,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
      };
      const { data: appt } = await api.post('/appointments', payload);
      setCreatedAppointment(appt);
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Buchen. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) { setStep(step - 1); setError(null); }
  };

  if (wLoading) {
    return (
      <section className="view active">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="section-sub">Lädt...</p>
        </div>
      </section>
    );
  }

  if (wError || !werkstatt) {
    return (
      <section className="view active">
        <div className="container narrow" style={{ padding: '80px 24px' }}>
          <div className="field-error">{wError || 'Nicht gefunden.'}</div>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 20 }}>
            ← Zur Werkstatt-Suche
          </Link>
        </div>
      </section>
    );
  }

  if (!werkstatt.services || werkstatt.services.length === 0) {
    return (
      <section className="view active">
        <div className="container narrow" style={{ padding: '80px 24px' }}>
          <div className="field-error">
            Diese Werkstatt hat noch keine Leistungen eingetragen. Bitte wählen Sie eine andere.
          </div>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 20 }}>
            ← Zur Werkstatt-Suche
          </Link>
        </div>
      </section>
    );
  }

  // Başarılı → ticket
  if (createdAppointment) {
    return (
      <section className="view active">
        <div className="container narrow" style={{ paddingTop: 36, paddingBottom: 60 }}>
          <ConfirmationTicket
            appointment={createdAppointment}
            werkstattName={werkstatt.name}
            services={werkstatt.services}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Zur Startseite</button>
            <button className="btn btn-dark" onClick={() => navigate('/manage')}>Termin verwalten</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="container narrow" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <p className="eyebrow eyebrow-dark">TERMIN BUCHEN</p>
        <h2 style={{ marginBottom: 8 }}>{werkstatt.name}</h2>
        <p className="section-sub" style={{ marginBottom: 24 }}>{werkstatt.city}{werkstatt.address && ` · ${werkstatt.address}`}</p>

        <ol className="step-indicator">
          {STEP_LABELS.map((s) => (
            <li key={s.num} className={
              'step' + (step === s.num ? ' is-active' : '') + (step > s.num ? ' is-done' : '')
            }>
              <span className="step-num">{step > s.num ? '✓' : s.num}</span>
              <span className="step-label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="wizard-body">
          {step === 1 && <Step1Service data={data} update={update} services={werkstatt.services} />}
          {step === 2 && <Step2Vehicle data={data} update={update} />}
          {step === 3 && <Step3DateTime data={data} update={update} werkstattId={werkstattId} werkstatt={werkstatt} />}
          {step === 4 && <Step4Contact data={data} update={update} />}
          {step === 5 && <Step5Summary data={data} services={werkstatt.services} />}
          {error && <div className="field-error" style={{ marginTop: 18 }}>{error}</div>}
        </div>

        <div className="wizard-nav">
          <button
            className="btn btn-outline"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <svg className="icon"><use href="#icon-chevron-left" /></svg> Zurück
          </button>
          <button className="btn btn-accent" onClick={handleNext} disabled={submitting}>
            {step === 5
              ? (submitting ? 'Wird gebucht...' : <><svg className="icon"><use href="#icon-check" /></svg> Termin buchen</>)
              : <>Weiter <svg className="icon"><use href="#icon-chevron-right" /></svg></>
            }
          </button>
        </div>
      </div>
    </section>
  );
}

function ConfirmationTicket({ appointment, werkstattName, services }) {
  const service = findService(services, appointment.serviceType);
  return (
    <div className="ticket-wrap">
      <div className="ticket">
        <div className="ticket-stamp">BESTÄTIGT</div>
        <div className="ticket-top">
          <p className="eyebrow">TERMIN GEBUCHT</p>
          <h3>Vielen Dank, {appointment.customerName.split(' ')[0]}!</h3>
          <p style={{ color: 'rgba(255,255,255,.72)', fontSize: 14.5, margin: 0 }}>
            Eine Bestätigung wurde an {appointment.customerEmail} gesendet.
          </p>
        </div>
        <div className="ticket-divider" />
        <div className="ticket-bottom">
          <div className="ticket-code-label">Ihr Termincode</div>
          <div className="ticket-code">{appointment.appointmentCode}</div>
          <div className="ticket-details">
            <div><b>{werkstattName}</b></div>
            <div>{service?.label || appointment.serviceType}</div>
            <div>{formatDateLong(appointment.date)}</div>
            <div>{appointment.startTime} – {appointment.endTime} Uhr</div>
            <div>{appointment.vehicleBrand} {appointment.vehicleModel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}