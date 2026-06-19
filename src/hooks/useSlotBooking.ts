"use client";

import {
  buildClientLocation,
  type MapboxFeature,
} from "@/components/booking/AtClientAddressSearch";
import type { LocalAvailableSlot } from "@/components/booking/BookingTimeSlots";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { usePayment } from "@/hooks/usePayment";
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
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useSlotBooking(service: Service) {
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated } = useAuth();
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
  const [slotsLoadError, setSlotsLoadError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<MapboxFeature | null>(
    null,
  );
  const [bookingNotes, setBookingNotes] = useState("");

  const isAtClient = service.bookingLocationType === "AT_CLIENT";

  useEffect(() => {
    setSelectedDate(getDateInTimeZone(new Date(), userTimeZone));
    setSelectedTime(undefined);
    setSelectedAddress(null);
    setBookingNotes("");
    setAvailabilities(null);
  }, [service.id, userTimeZone]);

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
        setSlotsLoadError(null);
        const data = await getServiceAvailableSlots(
          slug,
          tenantId,
          service.id,
          formatDateToYYYYMMDD(selectedDate),
        );

        if (isMounted) {
          setAvailabilities(data);
        }
      } catch (error) {
        if (isMounted) {
          setAvailabilities(null);
          const status =
            error && typeof error === "object" && "status" in error
              ? Number((error as { status?: number }).status)
              : undefined;

          if (status === 401) {
            setSlotsLoadError("Connectez-vous pour voir les créneaux disponibles.");
            toast.error("Veuillez vous connecter pour réserver.");
          } else if (status === 404) {
            setSlotsLoadError("Aucun créneau trouvé pour ce service.");
          } else {
            setSlotsLoadError(null);
            toast.error(
              error instanceof Error
                ? error.message
                : "Impossible de charger les créneaux.",
            );
          }
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

  return {
    isAtClient,
    selectedDate,
    selectedTime,
    selectedAddress,
    bookingNotes,
    localAvailableSlots,
    isLoadingSlots,
    slotsLoadError,
    canPay,
    isCreatingOrder,
    paymentModal,
    setSelectedTime,
    setSelectedAddress,
    setBookingNotes,
    handleDateSelect,
    handlePayPress,
  };
}
