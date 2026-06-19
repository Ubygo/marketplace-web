"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { Location } from "@/types/location";

interface VendorLocationCardProps {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (locationId: string) => void;
  disabled?: boolean;
}

export default function VendorLocationCard({
  location,
  onEdit,
  onDelete,
  disabled = false,
}: VendorLocationCardProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-black/10 p-4">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: "color-mix(in srgb, var(--tenant-primary) 12%, white)",
        }}
      >
        <CategoryIcon icon="Ionicons/business-outline" size={22} color={TEXT_COLOR} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-black">
          {location.name || "Lieu sans nom"}
        </p>
        <p className="mt-1 text-sm text-black/70">{location.street}</p>
        <p className="text-sm text-black/70">
          {location.country}, {location.city}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEdit(location)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <CategoryIcon icon="Ionicons/create-outline" size={16} color={TEXT_COLOR} />
            Modifier
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete(location.id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <CategoryIcon icon="Ionicons/trash-outline" size={16} color="#dc2626" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
