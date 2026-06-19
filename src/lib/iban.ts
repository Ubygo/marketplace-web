import IBAN from "iban";

const ibanLib = (IBAN as { default?: typeof IBAN }).default ?? IBAN;

export function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function validateIban(value: string): boolean {
  const normalized = normalizeIban(value);
  if (!normalized) return false;
  return ibanLib.isValid(normalized);
}

export function formatIbanForDisplay(value: string): string {
  const normalized = normalizeIban(value);
  return normalized.replace(/(.{4})/g, "$1 ").trim();
}

export function toElectronicIban(value: string): string {
  const normalized = normalizeIban(value);
  return ibanLib.electronicFormat(normalized);
}
