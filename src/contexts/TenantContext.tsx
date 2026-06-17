"use client";

import { createContext, useContext, type ReactNode } from "react";

interface TenantContextValue {
  tenantId: string;
  slug: string;
  privacyPolicyUrl: string | null;
  cgvUrl: string | null;
  supportEmail: string | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  tenantId: string;
  slug: string;
  privacyPolicyUrl?: string | null;
  cgvUrl?: string | null;
  supportEmail?: string | null;
  children: ReactNode;
}

export function TenantProvider({
  tenantId,
  slug,
  privacyPolicyUrl = null,
  cgvUrl = null,
  supportEmail = null,
  children,
}: TenantProviderProps) {
  return (
    <TenantContext.Provider
      value={{ tenantId, slug, privacyPolicyUrl, cgvUrl, supportEmail }}
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
