import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshWerkstatt, logoutWerkstatt } = useAuth();

  const [catalog, setCatalog] = useState({ categories: [], services: [] });
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [customServices, setCustomServices] = useState([]);
  const [customLabel, setCustomLabel] = useState('');
  const [config, setConfig] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/services-catalog')
      .then((res) => setCatalog(res.data))
      .catch(() => setError('Leistungs-Katalog konnte nicht geladen werden.'))
      .finally(() => setCatalogLoading(false));
  }, []);

  const allSelected = useMemo(() => {
    const fromCatalog = catalog.services.filter((s) => selectedIds.has(s.id));
    return [...fromCatalog, ...customServices];
  }, [catalog, selectedIds, customServices]);

  // Step 2'ye geçince config'i initialize et
  useEffect(() => {
    if (step === 2) {
      setConfig((prev) => {
        const next = { ...prev };
        allSelected.forEach((s) => {
          if (!next[s.id]) {
            next[s.id] = { duration: s.suggestedDuration || 60, price: '' };
          }
        });
        return next;
      });
    }
  }, [step, allSelected]);

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const addCustom = () => {
    if (!customLabel.trim()) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCustomServices([...customServices, {
      id, label: customLabel.trim(), desc: '',
      category: 'custom', isCustom: true, suggestedDuration: 60,
    }]);
    setCustomLabel('');
  };

  const removeCustom = (id) => {
    setCustomServices(customServices.filter((s) => s.id !== id));
  };

  const setField = (id, field, value) => {
    setConfig({ ...config, [id]: { ...config[id], [field]: value } });
  };

  const handleNext = () => {
    if (allSelected.length === 0) {
      setError('Bitte wählen Sie mindestens eine Leistung aus.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    for (const s of allSelected) {
      const cfg = config[s.id];
      if (!cfg || !cfg.duration || Number(cfg.duration) < 5) {
        setError(`"${s.label}": Bitte geben Sie eine gültige Dauer an (mindestens 5 Minuten).`);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const services = allSelected.map((s) => ({
        id: s.id,
        label: s.label,
        desc: s.desc || '',
        category: s.category || 'custom',
        duration: Number(config[s.id].duration),
        price: Number(config[s.id].price) || 0,
        isCustom: !!s.isCustom,
      }));
      await api.patch('/werkstaette/me', {
        services,
        onboardingCompleted: true,
      });
      await refreshWerkstatt();
      navigate('/pending', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Speichern fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAbort = () => {
    if (window.confirm('Onboarding abbrechen? Sie werden abgemeldet.')) {
      logoutWerkstatt();
      navigate('/', { replace: true });
    }
  };

  if (catalogLoading) {
    return (
      <section className="view active">
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <p className="section-sub">Lädt...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="container narrow" style={{ paddingTop: 36, paddingBottom: 60 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p className="eyebrow eyebrow-dark">ONBOARDING</p>
            <h2 style={{ marginBottom: 4 }}>Ihre Werkstatt einrichten</h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleAbort}>
            Abbrechen
          </button>
        </div>
        <p className="section-sub" style={{ marginBottom: 20 }}>
          Wählen Sie die Leistungen, die Sie anbieten, und legen Sie Dauer und Preis fest.
        </p>

        <ol className="step-indicator">
          {[
            { n: 1, label: 'Leistungen auswählen' },
            { n: 2, label: 'Dauer & Preise' },
          ].map((s) => (
            <li key={s.n} className={
              'step' + (step === s.n ? ' is-active' : '') + (step > s.n ? ' is-done' : '')
            }>
              <span className="step-num">{step > s.n ? '✓' : s.n}</span>
              <span className="step-label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="wizard-body">
          {step === 1 && (
            <Step1
              catalog={catalog}
              selectedIds={selectedIds}
              onToggle={toggle}
              customServices={customServices}
              customLabel={customLabel}
              onCustomLabelChange={setCustomLabel}
              onAddCustom={addCustom}
              onRemoveCustom={removeCustom}
            />
          )}
          {step === 2 && (
            <Step2 services={allSelected} config={config} setField={setField} />
          )}

          {error && <div className="field-error" style={{ marginTop: 18 }}>{error}</div>}
        </div>

        <div className="wizard-nav">
          <button
            className="btn btn-outline"
            onClick={() => setStep(1)}
            disabled={step === 1 || submitting}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
          >
            <svg className="icon"><use href="#icon-chevron-left" /></svg> Zurück
          </button>
          <button
            className="btn btn-accent"
            onClick={step === 1 ? handleNext : handleSubmit}
            disabled={submitting}
          >
            {step === 1 ? (
              <>Weiter <svg className="icon"><use href="#icon-chevron-right" /></svg></>
            ) : (
              submitting
                ? 'Wird gespeichert...'
                : <><svg className="icon"><use href="#icon-check" /></svg> Abschließen</>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function Step1({ catalog, selectedIds, onToggle, customServices, customLabel, onCustomLabelChange, onAddCustom, onRemoveCustom }) {
  return (
    <div>
      {catalog.categories.map((cat) => {
        const services = catalog.services.filter((s) => s.category === cat.id);
        return (
          <div key={cat.id} style={{ marginBottom: 22 }}>
            <h4 style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase',
              letterSpacing: '1.2px', color: 'var(--muted)', margin: '0 0 10px',
            }}>
              {cat.label}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 8,
            }}>
              {services.map((s) => {
                const checked = selectedIds.has(s.id);
                return (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12,
                    border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--line)'}`,
                    background: checked ? 'rgba(240,196,25,.08)' : 'white',
                    borderRadius: 8, cursor: 'pointer', transition: 'all .15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(s.id)}
                      style={{ marginTop: 2 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                      {s.desc && (
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          {s.desc}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 30, padding: 16, background: 'var(--surface-2)', borderRadius: 10 }}>
        <h4 style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase',
          letterSpacing: '1.2px', color: 'var(--muted)', margin: '0 0 10px',
        }}>
          Weitere Leistungen (custom)
        </h4>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', marginBottom: 10 }}>
          Bieten Sie eine Leistung an, die nicht in der Liste ist? Fügen Sie sie hier hinzu.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={customLabel}
            onChange={(e) => onCustomLabelChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onAddCustom())}
            placeholder="z. B. Elektromobil-Wartung"
            style={{
              flex: 1, padding: '10px 12px',
              border: '1.5px solid var(--line)', borderRadius: 7, fontSize: 14,
            }}
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onAddCustom}
            disabled={!customLabel.trim()}
          >
            Hinzufügen
          </button>
        </div>

        {customServices.length > 0 && (
          <div className="chip-list" style={{ marginTop: 12 }}>
            {customServices.map((s) => (
              <div key={s.id} className="chip">
                <span>{s.label}</span>
                <button type="button" onClick={() => onRemoveCustom(s.id)} aria-label="Entfernen">
                  <svg><use href="#icon-x" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Step2({ services, config, setField }) {
  return (
    <div>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Legen Sie für jede Leistung Dauer (in Minuten) und ab-Preis fest.
        Setzen Sie den Preis auf 0 für "Preis auf Anfrage".
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {services.map((s) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 130px', gap: 12,
            alignItems: 'center', padding: '12px 14px',
            border: '1.5px solid var(--line)', borderRadius: 8,
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
              {s.isCustom && (
                <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: 0.8 }}>
                  CUSTOM
                </div>
              )}
            </div>
            <div>
              <input
                type="number" min={5} step={5}
                value={config[s.id]?.duration ?? ''}
                onChange={(e) => setField(s.id, 'duration', e.target.value)}
                placeholder="Min."
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1.5px solid var(--line)', borderRadius: 6,
                  textAlign: 'right', fontFamily: 'var(--font-mono)',
                }}
              />
              <div style={{ fontSize: 10.5, color: 'var(--muted)', textAlign: 'center', marginTop: 3 }}>
                Dauer (Min.)
              </div>
            </div>
            <div>
              <input
                type="number" min={0}
                value={config[s.id]?.price ?? ''}
                onChange={(e) => setField(s.id, 'price', e.target.value)}
                placeholder="0"
                style={{
                  width: '100%', padding: '8px 10px',
                  border: '1.5px solid var(--line)', borderRadius: 6,
                  textAlign: 'right', fontFamily: 'var(--font-mono)',
                }}
              />
              <div style={{ fontSize: 10.5, color: 'var(--muted)', textAlign: 'center', marginTop: 3 }}>
                ab-Preis (€)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}