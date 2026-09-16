// Formats a date string as DD/MM/YYYY. Accepts plain `YYYY-MM-DD` or full ISO
// strings; the leading date part is read directly to avoid timezone shifts.
export function formatDate(value?: string): string {
  if (!value) return '—';
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${d}/${m}/${y}`;
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${dt.getFullYear()}`;
}
