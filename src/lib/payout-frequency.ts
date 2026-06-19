const PAYOUT_FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "chaque semaine",
  BIWEEKLY: "toutes les 2 semaines",
  MONTHLY: "tous les mois",
};

export function getPayoutFrequencyLabel(
  frequency: string | null | undefined,
): string {
  if (!frequency) {
    return "selon la fréquence définie par la plateforme";
  }

  const normalized = frequency.toUpperCase();
  return (
    PAYOUT_FREQUENCY_LABELS[normalized] ??
    "selon la fréquence définie par la plateforme"
  );
}
