"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TenantFeatures } from "@/lib/app-config";

interface TenantContextValue {
  tenantId: string;
  slug: string;
  tenantName: string;
  primaryColor: string;
  currency: string;
  features: TenantFeatures | null;
  payoutMode: string | null;
  payoutFrequency: string | null;
  escrowEnabled: boolean;
  stripePublishableKey: string | null;
  mapboxPublicToken: string | null;
  privacyPolicyUrl: string | null;
  cgvUrl: string | null;
  supportEmail: string | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  tenantId: string;
  slug: string;
  tenantName: string;
  primaryColor?: string;
  currency?: string;
  features?: TenantFeatures | null;
  payoutMode?: string | null;
  payoutFrequency?: string | null;
  escrowEnabled?: boolean;
  stripePublishableKey?: string | null;
  mapboxPublicToken?: string | null;
  privacyPolicyUrl?: string | null;
  cgvUrl?: string | null;
  supportEmail?: string | null;
  children: ReactNode;
}

export function TenantProvider({
  tenantId,
  slug,
  tenantName,
  primaryColor = "#111111",
  currency = "EUR",
  features = null,
  payoutMode = null,
  payoutFrequency = null,
  escrowEnabled = false,
  stripePublishableKey = null,
  mapboxPublicToken = null,
  privacyPolicyUrl = null,
  cgvUrl = null,
  supportEmail = null,
  children,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider
      value={{
        tenantId,
        slug,
        tenantName,
        primaryColor,
        currency,
        features,
        payoutMode,
        payoutFrequency,
        escrowEnabled,
        stripePublishableKey,
        mapboxPublicToken,
        privacyPolicyUrl,
        cgvUrl,
        supportEmail,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }

  return context;
}
