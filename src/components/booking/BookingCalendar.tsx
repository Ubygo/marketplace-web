"use client";

import { TEXT_COLOR } from "@/constants/theme";
import {
  addDays,
  formatDateToYYYYMMDD,
  getActiveWeekDays,
  getWeekdayLabel,
  isSameDay,
} from "@/lib/booking-datetime";
import type { VendorAvailabilitySlot } from "@/types/vendor";
import { useMemo } from "react";

interface BookingCalendarProps {
  slots: VendorAvailabilitySlot[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  monthsAhead?: number;
}

export default function BookingCalendar({
  slots,
  selectedDate,
  onDateSelect,
  monthsAhead = 3,
}: BookingCalendarProps) {
  const activeWeekDays = useMemo(() => getActiveWeekDays(slots), [slots]);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const maxDate = useMemo(() => {
    const end = new Date(today);
    end.setMonth(end.getMonth() + monthsAhead);
    return end;
  }, [monthsAhead, today]);

  const days = useMemo(() => {
    const result: Date[] = [];
    let current = new Date(today);

    while (current <= maxDate) {
      if (activeWeekDays.size === 0 || activeWeekDays.has(current.getDay())) {
        result.push(new Date(current));
      }
      current = addDays(current, 1);
    }

    return result;
  }, [activeWeekDays, maxDate, today]);

  return (
    <section>
      <h3 className="mb-3 text-base font-semibold" style={{ color: TEXT_COLOR }}>
        Choisir une date
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const dateKey = formatDateToYYYYMMDD(day);

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onDateSelect(day)}
              className="min-w-[72px] shrink-0 rounded-xl border px-3 py-3 text-center transition-colors"
              style={{
                borderColor: isSelected ? TEXT_COLOR : "rgba(0,0,0,0.08)",
                backgroundColor: isSelected ? TEXT_COLOR : "#fff",
                color: isSelected ? "#fff" : TEXT_COLOR,
              }}
            >
              <span className="block text-xs opacity-80">
                {getWeekdayLabel(day).slice(0, 3)}
              </span>
              <span className="block text-lg font-semibold">
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
