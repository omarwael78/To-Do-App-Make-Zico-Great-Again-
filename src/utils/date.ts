/** Today's date as a YYYY-MM-DD string in local time. */
export function getDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string into a local Date (avoids UTC shift bugs). */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** The date string `daysAgo` days before `from`. */
export function daysBetween(from: string, daysAgo: number): string {
  const date = parseDate(from);
  date.setDate(date.getDate() - daysAgo);
  return getDateString(date);
}

/** Friendly label: "Today", "Yesterday", or e.g. "Monday, Mar 4". */
export function formatDateLabel(dateStr: string): string {
  const today = getDateString();
  if (dateStr === today) return 'Today';
  if (dateStr === daysBetween(today, 1)) return 'Yesterday';
  return parseDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/** Short label for compact UI, e.g. "Mar 4". */
export function formatShortDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** A time-of-day greeting. */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
