const WEEKDAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatUtcToTimeInTimeZone(
  utcIso: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(utcIso));
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }

  const asUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
    0,
  );

  return asUtc - date.getTime();
}

export function zonedDateTimeToUtcIso(
  date: string,
  time: string,
  timeZone: string,
): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  const naiveUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  const firstOffset = getTimeZoneOffsetMs(new Date(naiveUtc), timeZone);
  let utcTimestamp = naiveUtc - firstOffset;

  const secondOffset = getTimeZoneOffsetMs(new Date(utcTimestamp), timeZone);
  utcTimestamp = naiveUtc - secondOffset;

  return new Date(utcTimestamp).toISOString();
}

export function getDateInTimeZone(date: Date, timeZone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }

  return new Date(values.year, values.month - 1, values.day);
}

export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getActiveWeekDays(
  slots: Array<{ weekDay: number; active: boolean }>,
): Set<number> {
  const activeDays = new Set<number>();

  for (const slot of slots) {
    if (slot.active) {
      // API uses 1=Monday..7=Sunday, JS uses 0=Sunday..6=Saturday
      const jsDay = slot.weekDay === 7 ? 0 : slot.weekDay;
      activeDays.add(jsDay);
    }
  }

  return activeDays;
}
