"use client";

import AtClientAddressSearch from "@/components/booking/AtClientAddressSearch";
import BookingCalendar from "@/components/booking/BookingCalendar";
import BookingTimeSlots from "@/components/booking/BookingTimeSlots";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useSlotBooking } from "@/hooks/useSlotBooking";
import { formatPrice } from "@/lib/format-price";
import { fetchPublicVendorById } from "@/lib/vendors-client";
import type { Service } from "@/types/service";
import type { Vendor, VendorAvailabilitySlot } from "@/types/vendor";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VendorInlineBookingProps {
  vendor: Vendor;
  service: Service;
  currency: string;
  variant: "sidebar" | "overlay";
  onBack: () => void;
}

export default function VendorInlineBooking({
  vendor,
  service,
  currency,
  variant,
  onBack,
}: VendorInlineBookingProps) {
  const { tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const compact = variant === "sidebar";
  const [vendorSlots, setVendorSlots] = useState<VendorAvailabilitySlot[]>(
    vendor.availability?.slots ?? [],
  );
  const displayCurrency = service.currency
    ? service.currency.toUpperCase()
    : currency;

  const {
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
  } = useSlotBooking(service);

  useEffect(() => {
    let isMounted = true;

    async function refreshVendorSlots() {
      try {
        const refreshed = await fetchPublicVendorById(tenantId, vendor.id);
        console.log("[VendorInlineBooking] disponibilités vendeur (refresh client)", {
          vendorId: vendor.id,
          ssrSlots: vendor.availability?.slots ?? [],
          refreshedAvailability: refreshed?.availability,
          refreshedSlots: refreshed?.availability?.slots ?? [],
        });
        if (isMounted && refreshed?.availability?.slots) {
          setVendorSlots(refreshed.availability.slots);
        }
      } catch {
        // Keep SSR slots as fallback.
      }
    }

    void refreshVendorSlots();

    return () => {
      isMounted = false;
    };
  }, [tenantId, vendor.id]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error("Veuillez vous connecter pour réserver.");
      onBack();
    }
  }, [isAuthenticated, isAuthLoading, onBack]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  return (
    <>
      <div
        className={`flex flex-col overflow-hidden ${
          variant === "sidebar"
            ? "max-h-[calc(100vh-3rem)] rounded-2xl border border-black/5 bg-white shadow-sm"
            : "h-full bg-white"
        }`}
      >
        <div className="shrink-0 border-b border-black/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 pt-0.5 text-sm font-medium text-black/60 transition-colors hover:text-black"
            >
              ← Retour
            </button>
            <div className="min-w-0 flex-1 text-right">
              <h2
                className={`font-bold text-black ${compact ? "text-base" : "text-lg"}`}
              >
                {service.name}
              </h2>
              {service.description ? (
                <p
                  className={`mt-0.5 line-clamp-2 text-black/50 ${compact ? "text-xs" : "text-sm"}`}
                >
                  {service.description}
                </p>
              ) : null}
              {service.price > 0 ? (
                <p
                  className={`mt-1 font-bold text-black ${compact ? "text-base" : "text-lg"}`}
                >
                  {formatPrice(service.price, displayCurrency)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-5">
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
              compact={compact}
            />

            <BookingTimeSlots
              slots={localAvailableSlots}
              selectedTime={selectedTime}
              onTimeSelect={setSelectedTime}
              isLoading={isLoadingSlots}
              compact={compact}
              emptyMessage={
                slotsLoadError ??
                "Aucun créneau disponible pour cette date. Le prestataire n'a peut-être pas encore configuré ses horaires."
              }
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 bg-neutral-50/80 px-4 py-4">
          <button
            type="button"
            disabled={!canPay}
            onClick={() => void handlePayPress()}
            className="block w-full rounded-full py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: TEXT_COLOR }}
          >
            {isCreatingOrder ? "Préparation du paiement..." : "Payer"}
          </button>
        </div>
      </div>

      {paymentModal}
    </>
  );
}
