import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { DOW_HEADER, MONTHS_DE, toDateStr, todayStr } from '../../constants/booking';

export default function Step3DateTime({ data, update, werkstattId, werkstatt }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const blockedDates = werkstatt?.blockedDates || [];

  useEffect(() => {
    if (!data.date || !data.serviceType) { setSlots([]); return; }
    setSlotsLoading(true);
    setSlotsError(null);
    api.get('/appointments/slots', {
      params: { werkstattId, date: data.date, serviceId: data.serviceType },
    })
      .then((res) => setSlots(res.data))
      .catch((err) => {
        setSlots([]);
        setSlotsError(err.response?.data?.error || 'Fehler beim Laden der Zeiten.');
      })
      .finally(() => setSlotsLoading(false));
  }, [data.date, data.serviceType, werkstattId]);

  const cells = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startPad = (firstDay.getDay() + 6) % 7;

    const arr = [];
    for (let i = 0; i < startPad; i++) arr.push({ empty: true, key: `e${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(calYear, calMonth, d);
      const dateStr = toDateStr(dateObj);
      arr.push({
        day: d, dateStr, key: dateStr,
        isDisabled: dateObj < today || dateObj.getDay() === 0 || blockedDates.includes(dateStr),
        isToday: dateStr === todayStr(),
        isSelected: dateStr === data.date,
      });
    }
    return arr;
  }, [calMonth, calYear, blockedDates, data.date, today]);

  const canGoPrev = !(calYear === today.getFullYear() && calMonth === today.getMonth());

  const goPrev = () => {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const goNext = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const handleDayClick = (cell) => {
    if (cell.isDisabled || cell.empty) return;
    update({ date: cell.dateStr, startTime: null });
  };

  return (
    <div>
      <h3>Wann passt es Ihnen?</h3>
      <p className="section-sub small" style={{ marginBottom: 20 }}>
        Wählen Sie zunächst ein Datum, danach eine verfügbare Uhrzeit.
      </p>

      <div className="calendar">
        <div className="cal-head">
          <button type="button" onClick={goPrev} disabled={!canGoPrev} aria-label="Vorheriger Monat">
            <svg className="icon"><use href="#icon-chevron-left" /></svg>
          </button>
          <div className="cal-title">{MONTHS_DE[calMonth]} {calYear}</div>
          <button type="button" onClick={goNext} aria-label="Nächster Monat">
            <svg className="icon"><use href="#icon-chevron-right" /></svg>
          </button>
        </div>

        <div className="cal-grid">
          {DOW_HEADER.map((d) => <div key={d} className="cal-dow">{d}</div>)}
          {cells.map((c) => (
            c.empty ? <div key={c.key} className="cal-day is-empty" /> : (
              <button
                key={c.key}
                type="button"
                className={
                  'cal-day' +
                  (c.isDisabled ? ' is-disabled' : '') +
                  (c.isToday ? ' is-today' : '') +
                  (c.isSelected ? ' is-selected' : '')
                }
                disabled={c.isDisabled}
                onClick={() => handleDayClick(c)}
              >{c.day}</button>
            )
          ))}
        </div>
      </div>

      {data.date && (
        <>
          <div className="slots-heading">
            <svg className="icon"><use href="#icon-clock" /></svg>
            Verfügbare Zeiten
          </div>
          {slotsLoading && <div className="slots-empty">Zeiten werden geladen...</div>}
          {!slotsLoading && slotsError && <div className="field-error">{slotsError}</div>}
          {!slotsLoading && !slotsError && slots.length === 0 && (
            <div className="slots-empty">
              An diesem Tag sind keine Zeiten mehr verfügbar. Bitte wählen Sie einen anderen Tag.
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="slot-grid">
              {slots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={'slot-btn' + (data.startTime === time ? ' is-selected' : '')}
                  onClick={() => update({ startTime: time })}
                >{time}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}