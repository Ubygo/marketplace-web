import CategoryIcon from "@/components/categories/CategoryIcon";

interface VendorOnboardingProgressProps {
  primaryColor: string;
  completedSteps: number;
  totalSteps: number;
}

export default function VendorOnboardingProgress({
  primaryColor,
  completedSteps,
  totalSteps,
}: VendorOnboardingProgressProps) {
  const progress =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="rounded-2xl p-4 text-white" style={{ backgroundColor: primaryColor }}>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/30">
          <CategoryIcon icon="Ionicons/sparkles-outline" size={20} color="#fff" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Configuration du profil</p>
          <p className="mt-1 text-sm text-white/90">
            {completedSteps} sur {totalSteps} étapes complétées
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
