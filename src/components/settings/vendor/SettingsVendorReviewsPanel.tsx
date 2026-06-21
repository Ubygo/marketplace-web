"use client";

import VendorReviewsSection from "@/components/vendors/VendorReviewsSection";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";

export default function SettingsVendorReviewsPanel() {
  const { tenantId } = useTenant();
  const { vendor } = useVendor();

  if (!vendor) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold text-black">Avis clients</h1>

      <VendorReviewsSection
        vendorId={vendor.id}
        tenantId={tenantId}
        averageRating={vendor.averageRating}
        reviewCount={vendor.reviewCount}
        showTitle={false}
        inCard
      />
    </div>
  );
}
