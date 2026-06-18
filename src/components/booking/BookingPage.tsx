"use client";

import AtClientAddressSearch, {
  buildClientLocation,
  type MapboxFeature,
} from "@/components/booking/AtClientAddressSearch";
import BookingCalendar from "@/components/booking/BookingCalendar";
import BookingTimeSlots, {
  type LocalAvailableSlot,
} from "@/components/booking/BookingTimeSlots";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { usePayment } from "@/hooks/usePayment";
import { buildLoginUrl } from "@/lib/auth-url";
import {
  formatDateToYYYYMMDD,
  formatUtcToTimeInTimeZone,
  getDateInTimeZone,
  zonedDateTimeToUtcIso,
} from "@/lib/booking-datetime";
import {
  getServiceAvailabilitiesSummary,
  getServiceAvailableSlots,
} from "@/lib/checkout";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface BookingPageProps {
  vendor: Vendor;
  service: Service;
}

export default function BookingPage({ vendor, service }: BookingPageProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { startPayment, isCreatingOrder, paymentModal } = usePayment();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    getDateInTimeZone(new Date(), userTimeZone),
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [availabilities, setAvailabilities] = useState<{
    date: string;
    timezone?: string;
    availableSlots: Array<{
      startTime: string;
      endTime: string;
      utcStart?: string;
      utcEnd?: string;
      available: boolean;
    }>;
  } | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<MapboxFeature | null>(
    null,
  );
  const [bookingNotes, setBookingNotes] = useState("");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(
        buildLoginUrl(
          `/vendors/${vendor.id}/reserver?serviceId=${service.id}`,
        ),
      );
    }
  }, [isAuthenticated, isAuthLoading, router, service.id, vendor.id]);

  const isAtClient = service.bookingLocationType === "AT_CLIENT";
  const vendorSlots = vendor.availability?.slots ?? [];

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadInitialDate() {
      try {
        const summary = await getServiceAvailabilitiesSummary(
          slug,
          tenantId,
          service.id,
        );

        if (!isMounted) {
          return;
        }

        if (summary.firstAvailableSlot) {
          setSelectedDate(
            getDateInTimeZone(
              new Date(summary.firstAvailableSlot),
              userTimeZone,
            ),
          );
        }
      } catch {
        // Keep default date
      }
    }

    void loadInitialDate();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, service.id, slug, tenantId, userTimeZone]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadSlots() {
      try {
        setIsLoadingSlots(true);
        const data = await getServiceAvailableSlots(
          slug,
          tenantId,
          service.id,
          formatDateToYYYYMMDD(selectedDate),
        );

        if (isMounted) {
          setAvailabilities(data);
        }
      } catch {
        if (isMounted) {
          setAvailabilities(null);
          toast.error("Impossible de charger les créneaux.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    }

    void loadSlots();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, selectedDate, service.id, slug, tenantId]);

  const localAvailableSlots = useMemo<LocalAvailableSlot[]>(() => {
    if (!availabilities?.availableSlots?.length) {
      return [];
    }

    const slotDate =
      availabilities.date || formatDateToYYYYMMDD(selectedDate);
    const proTimeZone = availabilities.timezone;

    return availabilities.availableSlots
      .map(({ available, startTime, endTime, utcStart, utcEnd }) => {
        let normalizedUtcStart = utcStart;
        let normalizedUtcEnd = utcEnd;

        if (!normalizedUtcStart && proTimeZone) {
          normalizedUtcStart = zonedDateTimeToUtcIso(
            slotDate,
            startTime,
            proTimeZone,
          );
        }

        if (!normalizedUtcEnd && proTimeZone) {
          normalizedUtcEnd = zonedDateTimeToUtcIso(
            slotDate,
            endTime,
            proTimeZone,
          );
        }

        const displayStart = normalizedUtcStart
          ? formatUtcToTimeInTimeZone(normalizedUtcStart, userTimeZone)
          : startTime;
        const displayEnd = normalizedUtcEnd
          ? formatUtcToTimeInTimeZone(normalizedUtcEnd, userTimeZone)
          : endTime;

        return {
          value: normalizedUtcStart ?? `${slotDate}T${startTime}`,
          available,
          startTime: displayStart,
          endTime: displayEnd,
          utcStart: normalizedUtcStart,
          utcEnd: normalizedUtcEnd,
        };
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [availabilities, selectedDate, userTimeZone]);

  const selectedAvailableSlot = useMemo(
    () => localAvailableSlots.find((slot) => slot.value === selectedTime),
    [localAvailableSlots, selectedTime],
  );

  const isAtClientDetailsValid = !isAtClient || !!selectedAddress;
  const canPay =
    !!selectedDate &&
    !!selectedTime &&
    isAtClientDetailsValid &&
    !isCreatingOrder;

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  }, []);

  const handlePayPress = useCallback(async () => {
    if (!selectedDate || !selectedTime || !user?.email) {
      return;
    }

    if (isAtClient && !selectedAddress) {
      return;
    }

    const orderData: {
      customerEmail: string;
      scheduledAt: string;
      scheduledDuration: number;
      clientLocation?: ReturnType<typeof buildClientLocation>;
      bookingNotes?: string;
    } = {
      customerEmail: user.email,
      scheduledAt: "",
      scheduledDuration: service.duration ?? 60,
    };

    if (selectedAvailableSlot?.utcStart) {
      orderData.scheduledAt = selectedAvailableSlot.utcStart;

      if (selectedAvailableSlot.utcEnd) {
        const utcStartMs = Date.parse(selectedAvailableSlot.utcStart);
        const utcEndMs = Date.parse(selectedAvailableSlot.utcEnd);
        const utcDurationMinutes = Math.round((utcEndMs - utcStartMs) / 60000);

        orderData.scheduledDuration =
          Number.isFinite(utcDurationMinutes) && utcDurationMinutes > 0
            ? utcDurationMinutes
            : (service.duration ?? 60);
      }
    } else {
      orderData.scheduledAt = new Date(selectedTime).toISOString();
      orderData.scheduledDuration = service.duration ?? 60;
    }

    if (isAtClient && selectedAddress) {
      orderData.clientLocation = buildClientLocation(selectedAddress);
      const trimmedNotes = bookingNotes.trim();
      if (trimmedNotes.length > 0) {
        orderData.bookingNotes = trimmedNotes;
      }
    }

    await startPayment(service.id, orderData);
  }, [
    bookingNotes,
    isAtClient,
    selectedAddress,
    selectedAvailableSlot,
    selectedDate,
    selectedTime,
    service.duration,
    service.id,
    startPayment,
    user?.email,
  ]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-28 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/vendors/${vendor.id}?serviceId=${service.id}`}
          className="text-sm font-medium text-black/60 hover:text-black"
        >
          ← Retour
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: TEXT_COLOR }}>
          Réserver — {service.name}
        </h1>
        <p className="mt-1 text-sm text-black/60">{vendor.name}</p>
      </div>

      {isAtClient ? (
        <AtClientAddressSearch
          selectedAddress={selectedAddress}
          onSelectedAddressChange={setSelectedAddress}
          bookingNotes={bookingNotes}
          onBookingNotesChange={setBookingNotes}
        />
      ) : null}

      <BookingCalendar
        slots={vendorSlots}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      <BookingTimeSlots
        slots={localAvailableSlots}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
        isLoading={isLoadingSlots}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white p-4">
        <button
          type="button"
          disabled={!canPay}
          onClick={() => void handlePayPress()}
          className="mx-auto block w-full max-w-2xl rounded-full py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: TEXT_COLOR }}
        >
          {isCreatingOrder ? "Préparation du paiement..." : "Payer"}
        </button>
      </div>

      {paymentModal}
    </main>
  );
}
