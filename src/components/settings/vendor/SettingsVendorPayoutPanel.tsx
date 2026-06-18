"use client";

import SettingsVendorLinkPanel from "@/components/settings/vendor/SettingsVendorLinkPanel";
import { useTenant } from "@/contexts/TenantContext";

export default function SettingsVendorPayoutPanel() {
  const { payoutMode } = useTenant();
  const isStripe = payoutMode === "STRIPE_CONNECT";

  return (
    <SettingsVendorLinkPanel
      title={isStripe ? "Paiements Stripe" : "Coordonnées bancaires"}
      description={
        isStripe
          ? "Configurez votre compte Stripe Connect pour recevoir vos paiements."
          : "Renseignez vos coordonnées bancaires pour recevoir vos paiements."
      }
      href={isStripe ? "/pro/stripe" : "/pro/coordonnees-bancaires"}
      linkLabel={isStripe ? "Configurer Stripe" : "Renseigner mes coordonnées"}
    />
  );
}
