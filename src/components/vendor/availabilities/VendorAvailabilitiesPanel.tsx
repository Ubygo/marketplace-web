"use client";

import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import {
  AVAILABILITY_DAYS,
  matchesWeekDay,
} from "@/lib/availability-weekday";
import {
  computeAvailabilityDiff,
  ensureDefaultAvailability,
  loadVendorAvailabilityData,
  saveAvailabilityDiff,
  type AvailabilitySlot,
} from "@/lib/availabilities-client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AvailabilityDayCard from "./AvailabilityDayCard";

interface VendorAvailabilitiesPanelProps {
  showTitle?: boolean;
}

export default function VendorAvailabilitiesPanel({
  showTitle = false,
}: VendorAvailabilitiesPanelProps) {
  const { slug, tenantId } = useTenant();
  const { vendor, isLoading: isVendorLoading } = useVendor();
  const vendorId = vendor?.id ?? "";
  const [availabilityId, setAvailabilityId] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [savedSlots, setSavedSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!vendorId) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await loadVendorAvailabilityData(slug, tenantId);
      setAvailabilityId(data.availabilityId);
      setSlots(data.slots);
      setSavedSlots(data.slots);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de charger les disponibilités.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId, vendorId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const hasChanges = useMemo(() => {
    const diff = computeAvailabilityDiff(savedSlots, slots);
    return (
      diff.toCreate.length > 0 ||
      diff.toUpdate.length > 0 ||
      diff.toDelete.length > 0
    );
  }, [savedSlots, slots]);

  const handleSlotsChange = useCallback(
    (weekDay: number, daySlots: AvailabilitySlot[]) => {
      setSlots((previous) => {
        const otherDays = previous.filter(
          (slot) => !matchesWeekDay(slot.weekDay, weekDay),
        );
        return [...otherDays, ...daySlots];
      });
    },
    [],
  );

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let currentAvailabilityId = availabilityId;

      if (!currentAvailabilityId) {
        currentAvailabilityId = await ensureDefaultAvailability(
          slug,
          tenantId,
        );
        setAvailabilityId(currentAvailabilityId);
      }

      const diff = computeAvailabilityDiff(savedSlots, slots);
      await saveAvailabilityDiff(
        slug,
        tenantId,
        currentAvailabilityId,
        diff,
      );

      const data = await loadVendorAvailabilityData(slug, tenantId);
      setAvailabilityId(data.availabilityId ?? currentAvailabilityId);
      setSlots(data.slots);
      setSavedSlots(data.slots);

      toast.success(
        data.slots.length > 0
          ? `${data.slots.length} créneau${data.slots.length > 1 ? "x" : ""} enregistré${data.slots.length > 1 ? "s" : ""}.`
          : "Disponibilités enregistrées.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d'enregistrer les disponibilités.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isVendorLoading || isLoading) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <p className="text-sm text-black/50">Chargement des disponibilités…</p>
      </div>
    );
  }

  if (!vendorId) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-6">
        <p className="text-sm text-black/50">
          Créez d&apos;abord votre profil prestataire pour gérer vos disponibilités.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showTitle ? (
        <div className="rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="text-lg font-semibold text-black">Disponibilités</h2>
          <p className="mt-1 text-sm text-black/50">
            Définissez vos créneaux horaires pour chaque jour de la semaine.
          </p>
        </div>
      ) : null}

      {AVAILABILITY_DAYS.map((day) => (
        <AvailabilityDayCard
          key={day.key}
          day={day}
          availabilityId={availabilityId}
          slots={slots.filter((slot) => matchesWeekDay(slot.weekDay, day.weekDay))}
          onSlotsChange={(daySlots) => handleSlotsChange(day.weekDay, daySlots)}
        />
      ))}

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          disabled={!hasChanges || isSaving}
          onClick={() => void handleSave()}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: TEXT_COLOR }}
        >
          {isSaving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
