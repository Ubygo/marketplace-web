"use client";

import { TEXT_COLOR } from "@/constants/theme";

export interface LocalAvailableSlot {
  value: string;
  available: boolean;
  startTime: string;
  endTime: string;
  utcStart?: string;
  utcEnd?: string;
}

interface BookingTimeSlotsProps {
  slots: LocalAvailableSlot[];
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  isLoading?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

export default function BookingTimeSlots({
  slots,
  selectedTime,
  onTimeSelect,
  isLoading = false,
  compact = false,
  emptyMessage = "Aucun créneau disponible pour cette date.",
}: BookingTimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-black/60">
        Chargement des créneaux...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-black/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section>
      <h3
        className={`mb-3 font-semibold ${compact ? "text-sm" : "text-base"}`}
        style={{ color: TEXT_COLOR }}
      >
        Choisir un horaire
      </h3>
      <div
        className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
      >
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.value;
          const isDisabled = !slot.available;

          return (
            <button
              key={slot.value}
              type="button"
              disabled={isDisabled}
              onClick={() => onTimeSelect(slot.value)}
              className="rounded-xl border px-3 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderColor: isSelected ? TEXT_COLOR : "rgba(0,0,0,0.08)",
                backgroundColor: isSelected ? TEXT_COLOR : "#fff",
                color: isSelected ? "#fff" : TEXT_COLOR,
              }}
            >
              {slot.startTime}
              {slot.endTime ? ` - ${slot.endTime}` : ""}
            </button>
          );
        })}
      </div>
    </section>
  );
}
