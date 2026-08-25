/**
 * Sažeti relativni prikaz vremena na hrvatskom, u stilu društvenih mreža.
 *
 * `"upravo sad"`, `"5min"`, `"3h"`, `"jučer"`, `"12d"`. Nakon godinu dana
 * prelazi na datum jer brojanje dana više nije čitljivo.
 */
export function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);

  if (mins < 1) return 'upravo sad';
  if (mins < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'jučer';
  if (days < 365) return `${days}d`;

  return date.toLocaleDateString('hr-HR');
}

/** Puni datum i vrijeme za `title` atribute i detaljne prikaze. */
export function fullDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleString('hr-HR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
