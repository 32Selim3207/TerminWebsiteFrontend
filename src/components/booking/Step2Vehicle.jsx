import { BRANDS } from '../../constants/booking';

export default function Step2Vehicle({ data, update }) {
  return (
    <div>
      <h3>Zu welchem Fahrzeug?</h3>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Damit wir die richtige Vorbereitung treffen können.
      </p>

      <div className="stack-form">
        <div className="field">
          <label htmlFor="brand">Marke <span className="req">*</span></label>
          <select
            id="brand"
            value={data.brand}
            onChange={(e) => update({ brand: e.target.value })}
          >
            <option value="">Bitte wählen</option>
            {BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {data.brand === 'Andere' && (
          <div className="field">
            <label htmlFor="brand-other">Marke angeben <span className="req">*</span></label>
            <input
              type="text"
              id="brand-other"
              value={data.brandOther}
              onChange={(e) => update({ brandOther: e.target.value })}
              placeholder="z. B. Tesla"
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="model">Modell <span className="req">*</span></label>
          <input
            type="text"
            id="model"
            value={data.model}
            onChange={(e) => update({ model: e.target.value })}
            placeholder="z. B. Golf VII"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="year">Baujahr</label>
            <input
              type="text"
              id="year"
              inputMode="numeric"
              maxLength={4}
              value={data.year}
              onChange={(e) => update({ year: e.target.value.replace(/\D/g, '') })}
              placeholder="z. B. 2018"
            />
          </div>
          <div className="field">
            <label htmlFor="plate">Kennzeichen</label>
            <input
              type="text"
              id="plate"
              value={data.plate}
              onChange={(e) => update({ plate: e.target.value.toUpperCase() })}
              placeholder="z. B. M-AB 1234"
            />
          </div>
        </div>
      </div>
    </div>
  );
}