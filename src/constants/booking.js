// ---------- Fahrzeug markaları ----------
export const BRANDS = [
  'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Opel', 'Ford',
  'Renault', 'Peugeot', 'Fiat', 'Škoda', 'Seat', 'Toyota', 'Hyundai',
  'Kia', 'Nissan', 'Mazda', 'Honda', 'Volvo', 'Mini', 'Smart',
  'Dacia', 'Citroën', 'Andere',
];

// ---------- Takvim ----------
export const DOW_HEADER = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
export const DAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

// ---------- Servis kategorisi → ikon ----------
export const CATEGORY_ICONS = {
  wartung: 'icon-wrench',
  motor: 'icon-wrench',
  elektronik: 'icon-search',
  reifen: 'icon-tire',
  karosserie: 'icon-wrench',
  custom: 'icon-wrench',
};

export const CATEGORY_LABELS = {
  wartung: 'Wartung & Service',
  motor: 'Motor & Mechanik',
  elektronik: 'Elektronik & Diagnose',
  reifen: 'Reifen & Räder',
  karosserie: 'Karosserie & Glas',
  custom: 'Weitere',
};

export function getServiceIcon(service) {
  return CATEGORY_ICONS[service?.category] || 'icon-wrench';
}

/**
 * Bir servis listesinden id ile hizmet bulur.
 */
export function findService(services, id) {
  return services?.find((s) => s.id === id);
}

// ---------- Statik katalog label mapping ----------
// ManagePage ve AppointmentsPanel gibi werkstatt.services'e erişimi olmayan
// yerlerde en azından tanınan hizmetler için düzgün label göstermek için.
export const CATALOG_LABELS = {
  // Yeni katalog
  'inspektion-hu': 'Inspektion / Hauptuntersuchung (HU)',
  'oelwechsel': 'Ölwechsel',
  'autoservice': 'Autoservice / Kundendienst',
  'motorinstandsetzung': 'Motorinstandsetzung',
  'bremsen-service': 'Bremsen-Service',
  'kupplung': 'Kupplung wechseln',
  'auspuff': 'Auspuffservice',
  'zahnriemen': 'Zahnriemenwechsel',
  'fehlerauslese': 'Fehlerauslese / Fahrzeugdiagnose',
  'batterie': 'Batterieservice',
  'klima': 'Klimaservice',
  'reifenwechsel': 'Reifenwechsel',
  'achsvermessung': 'Achsvermessung',
  'karosseriearbeiten': 'Karosseriearbeiten',
  'autoglas': 'Autoglas-Service / Steinschlagreparatur',
  'lackierung': 'Lackierung',
  // Eski defaults (backend değişmeden önce oluşturulan werkstattlar için)
  'wartung': 'Allgemeine Wartung',
  'reifen': 'Reifenwechsel',
  'unbekannt': 'Unbekanntes Problem',
};

/**
 * Servis id'sinden label döner. Werkstatt'ın kendi services'i verilirse
 * önce orada arar, yoksa statik catalog'a düşer, o da yoksa id'yi döner.
 */
export function getServiceLabel(id, services = null) {
  if (services) {
    const found = services.find((s) => s.id === id);
    if (found?.label) return found.label;
  }
  return CATALOG_LABELS[id] || id;
}

// ---------- Utils ----------
export const pad = (n) => String(n).padStart(2, '0');
export const toDateStr = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayStr = () => toDateStr(new Date());

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS_DE[dt.getDay()]}, ${d}. ${MONTHS_DE[m - 1]} ${y}`;
}

// ---------- Boş booking state ----------
export const emptyBooking = {
  serviceType: null,
  problemNote: '',
  brand: '',
  brandOther: '',
  model: '',
  year: '',
  plate: '',
  date: null,
  startTime: null,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
};

// ---------- Validators ----------
export const validators = {
  1: (d) => (d.serviceType ? null : 'Bitte wählen Sie eine Leistung.'),
  2: (d) => {
    if (!d.brand) return 'Bitte wählen Sie eine Marke.';
    if (d.brand === 'Andere' && !d.brandOther.trim()) return 'Bitte geben Sie die Marke an.';
    if (!d.model.trim()) return 'Bitte geben Sie das Modell an.';
    return null;
  },
  3: (d) => {
    if (!d.date) return 'Bitte wählen Sie ein Datum.';
    if (!d.startTime) return 'Bitte wählen Sie eine Uhrzeit.';
    return null;
  },
  4: (d) => {
    if (!d.customerName.trim()) return 'Bitte geben Sie Ihren Namen an.';
    if (!d.customerPhone.trim()) return 'Bitte geben Sie Ihre Telefonnummer an.';
    if (!d.customerEmail.trim()) return 'Bitte geben Sie Ihre E-Mail-Adresse an.';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.customerEmail);
    if (!emailOk) return 'Ungültige E-Mail-Adresse.';
    return null;
  },
  5: () => null,
};

export const STEP_LABELS = [
  { num: 1, label: 'Service' },
  { num: 2, label: 'Fahrzeug' },
  { num: 3, label: 'Termin' },
  { num: 4, label: 'Kontakt' },
  { num: 5, label: 'Bestätigung' },
];