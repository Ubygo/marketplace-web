import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";

export default function VendorPendingApproval() {
  return (
    <div className="flex flex-1 items-center justify-center py-8">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
          <CategoryIcon icon="Ionicons/time-outline" size={28} color={TEXT_COLOR} />
        </div>
        <h2 className="text-lg font-bold text-black">
          En attente de validation
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-black/60">
          Votre profil prestataire est en cours de vérification par notre équipe.
          Vous recevrez une notification dès qu&apos;il sera approuvé.
        </p>
      </div>
    </div>
  );
}
