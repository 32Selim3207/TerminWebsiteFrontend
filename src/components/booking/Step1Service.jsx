import { getServiceIcon, CATEGORY_LABELS } from '../../constants/booking';

export default function Step1Service({ data, update, services }) {
  // Kategoriye göre grupla
  const grouped = {};
  (services || []).forEach((s) => {
    const cat = s.category || 'custom';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  return (
    <div>
      <h3>Welche Leistung benötigen Sie?</h3>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Wählen Sie eine Leistung. Sie können zusätzlich einen Hinweis
        zu Ihrem Problem hinterlassen.
      </p>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} style={{ marginBottom: 22 }}>
          <h4 style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase',
            letterSpacing: '1.2px', color: 'var(--muted)', margin: '0 0 10px',
          }}>
            {CATEGORY_LABELS[cat] || cat}
          </h4>
          <div className="service-pick-grid">
            {list.map((s) => (
              <button
                key={s.id}
                type="button"
                className={'service-card' + (data.serviceType === s.id ? ' is-selected' : '')}
                onClick={() => update({ serviceType: s.id })}
              >
                <span className="service-icon">
                  <svg><use href={`#${getServiceIcon(s)}`} /></svg>
                </span>
                <h3>{s.label}</h3>
                {s.desc && <p>{s.desc}</p>}
                <div style={{
                  marginTop: 10, fontSize: 12.5, color: 'var(--muted)',
                  display: 'flex', gap: 12,
                }}>
                  <span>⏱ {s.duration} Min.</span>
                  {s.price > 0 && <span>ab {s.price} €</span>}
                </div>
                <span className="service-card-check">
                  <svg><use href="#icon-check" /></svg> Ausgewählt
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="field">
        <label htmlFor="problem-note">Beschreibung (optional)</label>
        <textarea
          id="problem-note"
          placeholder="Was ist das Problem? Wann tritt es auf?"
          value={data.problemNote}
          onChange={(e) => update({ problemNote: e.target.value })}
        />
      </div>
    </div>
  );
}