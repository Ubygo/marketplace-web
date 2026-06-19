"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";

interface ServiceDetailOptionsProps {
  isBooking: boolean;
  onBookingChange: (value: boolean) => void;
  isAtStore: boolean;
  onAtStoreChange: (value: boolean) => void;
  isHomeService: boolean;
  onHomeServiceChange: (value: boolean) => void;
  actionRadiusKm: number | null;
  onActionRadiusKmChange: (value: string) => void;
  disabled?: boolean;
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
  disabled,
}: {
  icon: string;
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-3 text-sm font-medium text-black">
        <CategoryIcon icon={icon} size={20} color={TEXT_COLOR} />
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded accent-[var(--tenant-primary)]"
      />
    </label>
  );
}

export default function ServiceDetailOptions({
  isBooking,
  onBookingChange,
  isAtStore,
  onAtStoreChange,
  isHomeService,
  onHomeServiceChange,
  actionRadiusKm,
  onActionRadiusKmChange,
  disabled = false,
}: ServiceDetailOptionsProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <ToggleRow
        icon="Ionicons/calendar-outline"
        label="Réservation avec créneaux"
        checked={isBooking}
        onChange={onBookingChange}
        disabled={disabled}
      />
      <div className="my-1 border-t border-black/5" />
      <ToggleRow
        icon="Ionicons/location-outline"
        label="Sur place"
        checked={isAtStore}
        onChange={onAtStoreChange}
        disabled={disabled}
      />
      <div className="my-1 border-t border-black/5" />
      <ToggleRow
        icon="Ionicons/home-outline"
        label="À domicile"
        checked={isHomeService}
        onChange={onHomeServiceChange}
        disabled={disabled}
      />

      {isHomeService ? (
        <div className="mt-3 flex flex-col gap-2">
          <label htmlFor="action-radius" className="text-sm font-medium text-black">
            Rayon d&apos;intervention (km)
          </label>
          <input
            id="action-radius"
            type="number"
            min={0}
            disabled={disabled}
            value={actionRadiusKm != null ? actionRadiusKm : ""}
            onChange={(event) => onActionRadiusKmChange(event.target.value)}
            placeholder="20"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
          />
        </div>
      ) : null}
    </div>
  );
}
