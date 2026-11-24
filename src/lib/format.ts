const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** ₹1,20,000 style formatting. */
export function inr(n: number, decimals = false): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  return `${sign}₹${decimals ? inr2.format(abs) : inr0.format(Math.round(abs))}`;
}

/** Signed money: +₹150 / −₹4 */
export function signedInr(n: number): string {
  return `${n >= 0 ? '+' : '−'}${inr(Math.abs(n))}`;
}

/** Compact Indian units: ₹1.2 L, ₹4.8 Cr */
export function inrCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `₹${inr0.format(Math.round(n / 1e7))} Cr`;
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)}k`;
  return inr(n);
}

export function num(n: number): string {
  return inr0.format(n);
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

export function fmtDay(s: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }): string {
  return parseDate(s).toLocaleDateString('en-IN', opts);
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

/** Timestamp on a simulated day at a given hour (keeps "today" consistent with Skip-a-day). */
export function tsOn(date: string, hour: number, minute = 0): string {
  const d = parseDate(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
