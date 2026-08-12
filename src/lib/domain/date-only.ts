const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function toDateOnly(value?: string): string {
  if (!value) return "";

  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return "";

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value: string, locale = "pt-BR"): string {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return value;

  return new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(
    new Date(`${dateOnly}T00:00:00.000Z`)
  );
}
