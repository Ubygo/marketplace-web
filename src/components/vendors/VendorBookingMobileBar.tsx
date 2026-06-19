"use client";

import { TEXT_COLOR } from "@/constants/theme";
import { formatPrice } from "@/lib/format-price";
import type { Service } from "@/types/service";

interface VendorBookingMobileBarProps {
  services: Service[];
  currency: string;
  selectedServiceId: string | null;
  onBook: (serviceId: string) => void;
  isBookingLoading: boolean;
  isStripeEnabled: boolean;
}

export default function VendorBookingMobileBar({
  services,
  currency,
  selectedServiceId,
  onBook,
  isBookingLoading,
  isStripeEnabled,
}: VendorBookingMobileBarProps) {
  const selectedService =
    services.find((service) => service.id === selectedServiceId) ?? services[0];

  if (services.length === 0) {
    return null;
  }

  const displayCurrency = selectedService.currency
    ? selectedService.currency.toUpperCase()
    : currency;
  const isDisabled =
    !isStripeEnabled || selectedService.price <= 0 || isBookingLoading;

  return (
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
          onClick={() => onBook(selectedService.id)}
          className="shrink-0 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: TEXT_COLOR }}
        >
          {isBookingLoading ? "Chargement..." : "Réserver"}
        </button>
      </div>
    </div>
  );
}
