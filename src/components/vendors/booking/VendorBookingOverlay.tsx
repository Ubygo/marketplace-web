"use client";

import VendorInlineBooking from "@/components/vendors/booking/VendorInlineBooking";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";

interface VendorBookingOverlayProps {
  vendor: Vendor;
  services: Service[];
  currency: string;
  bookingServiceId: string;
  onExitBooking: () => void;
}

export default function VendorBookingOverlay({
  vendor,
  services,
  currency,
  bookingServiceId,
  onExitBooking,
}: VendorBookingOverlayProps) {
  const service = services.find((item) => item.id === bookingServiceId);

  if (!service) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
      <VendorInlineBooking
        vendor={vendor}
        service={service}
        currency={currency}
        variant="overlay"
        onBack={onExitBooking}
      />
    </div>
  );
}
