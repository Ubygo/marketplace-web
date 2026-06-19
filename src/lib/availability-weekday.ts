/** API convention: 1 = Monday … 7 = Sunday (aligned with mobile). */

export function toApiWeekDay(weekDay: number): number {
  return weekDay === 0 ? 7 : weekDay;
}

export function normalizeApiWeekDay(weekDay: number): number {
  if (!Number.isFinite(weekDay)) {
    return 1;
  }

  return weekDay === 0 ? 7 : weekDay;
}

/** Convert API weekDay to JS Date.getDay() (0 = Sunday … 6 = Saturday). */
export function apiWeekDayToJsDay(weekDay: number): number {
  const normalized = normalizeApiWeekDay(weekDay);
  return normalized === 7 ? 0 : normalized;
}

export function matchesWeekDay(
  slotWeekDay: number,
  apiWeekDay: number,
): boolean {
  return normalizeApiWeekDay(slotWeekDay) === normalizeApiWeekDay(apiWeekDay);
}

export const AVAILABILITY_DAYS = [
  { key: "monday", label: "Lundi", weekDay: 1 },
  { key: "tuesday", label: "Mardi", weekDay: 2 },
  { key: "wednesday", label: "Mercredi", weekDay: 3 },
  { key: "thursday", label: "Jeudi", weekDay: 4 },
  { key: "friday", label: "Vendredi", weekDay: 5 },
  { key: "saturday", label: "Samedi", weekDay: 6 },
  { key: "sunday", label: "Dimanche", weekDay: 7 },
] as const;
