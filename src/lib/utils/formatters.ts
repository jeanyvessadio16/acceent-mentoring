export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function formatSessionRange(start?: string | null, end?: string | null): string {
  if (!start) return '';
  try {
    const startDate = new Date(start);
    if (isNaN(startDate.getTime())) return '';

    const dayStr = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(startDate);

    const startTimeStr = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(startDate);

    if (!end) {
      return `${dayStr} à ${startTimeStr}`;
    }

    const endDate = new Date(end);
    const endTimeStr = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(endDate);

    return `${dayStr} • ${startTimeStr} - ${endTimeStr}`;
  } catch {
    return String(start);
  }
}

