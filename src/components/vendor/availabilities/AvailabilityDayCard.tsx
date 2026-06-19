"use client";

import { TEXT_COLOR } from "@/constants/theme";
import type { AvailabilitySlot } from "@/lib/availabilities-client";
import { useCallback } from "react";

interface DayConfig {
  key: string;
  label: string;
  weekDay: number;
}

interface AvailabilityDayCardProps {
  day: DayConfig;
  availabilityId: string | null;
  slots: AvailabilitySlot[];
  onSlotsChange: (slots: AvailabilitySlot[]) => void;
}

function createTempSlot(weekDay: number): AvailabilitySlot {
  return {
    id: `temp-${weekDay}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    weekDay,
    startTime: "09:00",
    endTime: "17:00",
    active: true,
  };
}

export default function AvailabilityDayCard({
  day,
  availabilityId,
  slots,
  onSlotsChange,
}: AvailabilityDayCardProps) {
  const updateSlot = useCallback(
    (slotId: string, patch: Partial<AvailabilitySlot>) => {
      onSlotsChange(
        slots.map((slot) =>
          slot.id === slotId ? { ...slot, ...patch } : slot,
        ),
      );
    },
    [onSlotsChange, slots],
  );

  const removeSlot = useCallback(
    (slotId: string) => {
      onSlotsChange(slots.filter((slot) => slot.id !== slotId));
    },
    [onSlotsChange, slots],
  );

  const addSlot = useCallback(() => {
    onSlotsChange([...slots, createTempSlot(day.weekDay)]);
  }, [day.weekDay, onSlotsChange, slots]);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-black">{day.label}</h3>
        <button
          type="button"
          onClick={addSlot}
          className="text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: TEXT_COLOR }}
        >
          + Ajouter
        </button>
      </div>

      {!availabilityId && slots.length === 0 ? (
        <p className="mt-3 text-sm text-black/45">
          Ajoutez des créneaux puis cliquez sur Enregistrer.
        </p>
      ) : null}

      {slots.length === 0 ? (
        <p className="mt-3 text-sm text-black/45">Aucun créneau pour ce jour.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-neutral-50/60 px-3 py-3"
            >
              <label className="flex items-center gap-2 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={slot.active}
                  onChange={(event) =>
                    updateSlot(slot.id, { active: event.target.checked })
                  }
                  className="size-4 rounded border-black/20"
                />
                Actif
              </label>

              <input
                type="time"
                value={slot.startTime}
                onChange={(event) =>
                  updateSlot(slot.id, { startTime: event.target.value })
                }
                className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm"
              />
              <span className="text-sm text-black/40">→</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(event) =>
                  updateSlot(slot.id, { endTime: event.target.value })
                }
                className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm"
              />

              <button
                type="button"
                onClick={() => removeSlot(slot.id)}
                className="ml-auto text-sm text-red-600 transition-opacity hover:opacity-80"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
