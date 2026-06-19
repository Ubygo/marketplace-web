"use client";

import { TEXT_COLOR } from "@/constants/theme";
import { useBookingFlow } from "@/hooks/useBookingFlow";
import { formatPrice } from "@/lib/format-price";
import type { Service } from "@/types/service";

interface VendorBookingMobileBarProps {
  vendorId: string;
  services: Service[];
  currency: string;
  selectedServiceId: string | null;
}

export default function VendorBookingMobileBar({
  vendorId,
  services,
  currency,
  selectedServiceId,
}: VendorBookingMobileBarProps) {
  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];
  const { handleBook, isLoading, isStripeEnabled, paymentModal } =
    useBookingFlow(vendorId);

  if (services.length === 0) {
    return null;
  }

  const displayCurrency = selectedService.currency
    ? selectedService.currency.toUpperCase()
    : currency;
  const isDisabled =
    !isStripeEnabled || selectedService.price <= 0 || isLoading;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white p-4 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">
              {selectedService.name}
            </p>
            {selectedService.price > 0 ? (
              <p className="text-lg font-bold" style={{ color: TEXT_COLOR }}>
                {formatPrice(selectedService.price, displayCurrency)}
              </p>
            ) : (
              <p className="text-sm text-black/60">
                {!isStripeEnabled
                  ? "Paiement indisponible"
                  : "Service gratuit"}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => void handleBook(selectedService.id)}
            className="shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: TEXT_COLOR }}
          >
            {isLoading ? "Chargement..." : "Réserver"}
          </button>
        </div>
      </div>
      {paymentModal}
    </>
  );
}
