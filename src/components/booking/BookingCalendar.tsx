"use client";

import { getActiveWeekDays } from "@/lib/booking-datetime";
import type { VendorAvailabilitySlot } from "@/types/vendor";
import { addMonths, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";
import { DayPicker, type Matcher } from "react-day-picker";
import "react-day-picker/style.css";
import "./booking-calendar.css";

interface BookingCalendarProps {
  slots: VendorAvailabilitySlot[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  monthsAhead?: number;
  compact?: boolean;
}

export default function BookingCalendar({
  slots,
  selectedDate,
  onDateSelect,
  monthsAhead = 3,
  compact = false,
}: BookingCalendarProps) {
  const activeWeekDays = useMemo(() => getActiveWeekDays(slots), [slots]);
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(
    () => addMonths(today, monthsAhead),
    [monthsAhead, today],
  );
  const hasWeekdayFilter = activeWeekDays.size > 0;

  const disabledDays = useMemo(() => {
    const matchers: Matcher[] = [{ before: today }, { after: maxDate }];

    if (hasWeekdayFilter) {
      matchers.push((date) => !activeWeekDays.has(date.getDay()));
    }

    return matchers;
  }, [activeWeekDays, hasWeekdayFilter, maxDate, today]);

  return (
    <section className="w-full">
      <h3
        className={`mb-3 font-semibold text-black/80 ${compact ? "text-sm" : "text-base"}`}
      >
        Choisir une date
      </h3>
      <div className={compact ? "w-full py-1" : "w-full py-2"}>
        <DayPicker
          mode="single"
          locale={fr}
          weekStartsOn={1}
          navLayout="around"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onDateSelect(date);
            }
          }}
          disabled={disabledDays}
          startMonth={today}
          endMonth={maxDate}
          showOutsideDays={false}
          className={`booking-calendar ${compact ? "booking-calendar--compact" : ""}`}
        />
      </div>
    </section>
  );
}
