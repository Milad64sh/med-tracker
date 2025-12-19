export function fmtDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/London',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function fmtDate(isoOrYmd: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeZone: 'Europe/London',
    }).format(new Date(isoOrYmd));
  } catch {
    return isoOrYmd;
  }
}
