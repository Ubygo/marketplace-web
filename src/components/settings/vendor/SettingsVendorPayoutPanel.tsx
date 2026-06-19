"use client";

import VendorBankDetailsPanel from "@/components/vendor/payout/VendorBankDetailsPanel";
import VendorStripePanel from "@/components/vendor/payout/VendorStripePanel";
import { useTenant } from "@/contexts/TenantContext";

export default function SettingsVendorPayoutPanel() {
  const { payoutMode } = useTenant();
  const isStripe = payoutMode === "STRIPE_CONNECT";

  if (isStripe) {
    return <VendorStripePanel showTitle />;
  }

  return <VendorBankDetailsPanel showTitle />;
}
