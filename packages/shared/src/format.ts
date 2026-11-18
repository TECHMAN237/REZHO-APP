const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_LONG = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];
const DAYS_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
export const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/** Format an amount in FCFA with thousands separators: 52 500 FCFA */
export function formatFCFA(amount: number, withUnit = true): string {
  const rounded = Math.round(amount);
  const digits = Math.abs(rounded).toString();
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += ' ';
  }
  const signed = rounded < 0 ? `-${out}` : out;
  return withUnit ? `${signed} FCFA` : signed;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** 18 avr. 2025 */
export function formatDate(iso: string, opts: { year?: boolean; weekday?: boolean } = {}): string {
  const d = parseISODate(iso);
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  const withYear = opts.year === false ? base : `${base} ${d.getFullYear()}`;
  return opts.weekday ? `${DAYS_SHORT[d.getDay()]} ${withYear}` : withYear;
}

/** 18 avril 2025 */
export function formatDateLong(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** 18 – 20 avr. 2025 (same month) or 28 avr. – 2 mai 2025 */
export function formatDateRange(startIso: string, endIso?: string): string {
  if (!endIso || endIso === startIso) return formatDate(startIso);
  const a = parseISODate(startIso);
  const b = parseISODate(endIso);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
  }
  return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  const m = MONTHS_LONG[monthIndex] ?? '';
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${year}`;
}

export function nightsBetween(startIso: string, endIso: string): number {
  const a = parseISODate(startIso).getTime();
  const b = parseISODate(endIso).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

export function daysInclusive(startIso: string, endIso: string): number {
  return nightsBetween(startIso, endIso) + 1;
}

export function relativeLabel(iso: string): string {
  const today = todayISO();
  if (iso === today) return "Aujourd'hui";
  if (iso === addDays(today, 1)) return 'Demain';
  if (iso === addDays(today, -1)) return 'Hier';
  return formatDate(iso, { year: false });
}

let counter = 0;
export function makeId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function makeRef(prefix = 'REZ'): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `${prefix}-${n}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toUpperCase())
    .join('');
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function matches(haystack: string, needle: string): boolean {
  if (!needle.trim()) return true;
  return normalize(haystack).includes(normalize(needle.trim()));
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}

export function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '');
  return /^\+?[0-9 ]+$/.test(v.trim()) && digits.length >= 8 && digits.length <= 15;
}
