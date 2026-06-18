import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";

export default function VendorEscrowInfo() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-black/5 p-4">
      <CategoryIcon
        icon="Ionicons/shield-checkmark-outline"
        size={18}
        color={TEXT_COLOR}
      />
      <div>
        <p className="text-sm font-semibold text-black">Paiement sécurisé</p>
        <p className="mt-1 text-sm leading-relaxed text-black/70">
          Les paiements de vos clients sont sécurisés et versés selon les
          conditions de la plateforme.
        </p>
      </div>
    </div>
  );
}
