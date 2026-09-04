export default function Step4Contact({ data, update }) {
  return (
    <div>
      <h3>Ihre Kontaktdaten</h3>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Wir bestätigen Ihren Termin per E-Mail und melden uns bei Rückfragen.
      </p>

      <div className="stack-form">
        <div className="field">
          <label htmlFor="customer-name">Name <span className="req">*</span></label>
          <input
            type="text"
            id="customer-name"
            value={data.customerName}
            onChange={(e) => update({ customerName: e.target.value })}
            placeholder="Vor- und Nachname"
            autoComplete="name"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="customer-phone">Telefon <span className="req">*</span></label>
            <input
              type="tel"
              id="customer-phone"
              value={data.customerPhone}
              onChange={(e) => update({ customerPhone: e.target.value })}
              placeholder="z. B. 0170 1234567"
              autoComplete="tel"
            />
          </div>
          <div className="field">
            <label htmlFor="customer-email">E-Mail <span className="req">*</span></label>
            <input
              type="email"
              id="customer-email"
              value={data.customerEmail}
              onChange={(e) => update({ customerEmail: e.target.value })}
              placeholder="ihre@email.de"
              autoComplete="email"
            />
          </div>
        </div>

        <p className="field-hint">
          Mit Ihrer E-Mail-Adresse und dem Termincode können Sie Ihren
          Termin später jederzeit einsehen oder stornieren.
        </p>
      </div>
    </div>
  );
}