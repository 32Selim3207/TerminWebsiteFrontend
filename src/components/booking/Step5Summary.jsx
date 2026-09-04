import { findService, formatDateLong } from '../../constants/booking';

export default function Step5Summary({ data, services }) {
  const service = findService(services, data.serviceType);
  const brandDisplay = data.brand === 'Andere' ? data.brandOther : data.brand;

  return (
    <div>
      <h3>Bitte prüfen Sie Ihre Angaben</h3>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Mit Klick auf "Termin buchen" wird Ihr Termin verbindlich reserviert.
      </p>

      <div className="summary-block">
        <div className="summary-block-head"><span>Leistung</span></div>
        <div className="summary-row"><span>Service</span><span>{service?.label || '—'}</span></div>
        {data.problemNote && <div className="summary-note">"{data.problemNote}"</div>}
      </div>

      <div className="summary-block">
        <div className="summary-block-head"><span>Fahrzeug</span></div>
        <div className="summary-row"><span>Marke / Modell</span><span>{brandDisplay} {data.model}</span></div>
        {data.year && <div className="summary-row"><span>Baujahr</span><span>{data.year}</span></div>}
        {data.plate && <div className="summary-row"><span>Kennzeichen</span><span>{data.plate}</span></div>}
      </div>

      <div className="summary-block">
        <div className="summary-block-head"><span>Termin</span></div>
        <div className="summary-row"><span>Datum</span><span>{formatDateLong(data.date)}</span></div>
        <div className="summary-row"><span>Uhrzeit</span><span>{data.startTime} Uhr</span></div>
      </div>

      <div className="summary-block">
        <div className="summary-block-head"><span>Kontakt</span></div>
        <div className="summary-row"><span>Name</span><span>{data.customerName}</span></div>
        <div className="summary-row"><span>Telefon</span><span>{data.customerPhone}</span></div>
        <div className="summary-row"><span>E-Mail</span><span>{data.customerEmail}</span></div>
      </div>
    </div>
  );
}