"use client";

import { useTenant } from "@/contexts/TenantContext";
import type { TenantFeatures } from "@/lib/app-config";
import { useMemo } from "react";

export type VendorMode = NonNullable<TenantFeatures["vendorMode"]>;

export interface TenantVendorMode {
  vendorMode: VendorMode;
  isPublicVendorSignup: boolean;
}

export function useTenantVendorMode(): TenantVendorMode {
  const { features } = useTenant();

  return useMemo(() => {
    const vendorMode = features?.vendorMode ?? "PUBLIC";
    const isPublicVendorSignup = vendorMode !== "LIMITED";

    return {
      vendorMode,
      isPublicVendorSignup,
    };
  }, [features?.vendorMode]);
}
