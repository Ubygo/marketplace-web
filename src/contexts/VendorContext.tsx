"use client";

import { useAuth } from "@/contexts/AuthContext";
import { fetchMyVendor } from "@/lib/vendors-me-client";
import { useTenant } from "@/contexts/TenantContext";
import type { Vendor } from "@/types/vendor";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface VendorContextValue {
  vendor: Vendor | null;
  isLoading: boolean;
  hasVendor: boolean;
  refreshVendor: () => Promise<void>;
  clearVendor: () => void;
  error: string | null;
}

const VendorContext = createContext<VendorContextValue | null>(null);

export function VendorProvider({ children }: { children: ReactNode }) {
  const { slug, tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendor = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const myVendor = await fetchMyVendor(slug, tenantId);
      setVendor(myVendor);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger le profil prestataire.",
      );
      setVendor(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      setVendor(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    void loadVendor();
  }, [isAuthenticated, isAuthLoading, loadVendor]);

  const refreshVendor = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadVendor();
  }, [isAuthenticated, loadVendor]);

  const clearVendor = useCallback(() => {
    setVendor(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const value = useMemo<VendorContextValue>(
    () => ({
      vendor,
      isLoading,
      hasVendor: !!vendor,
      refreshVendor,
      clearVendor,
      error,
    }),
    [vendor, isLoading, refreshVendor, clearVendor, error],
  );

  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
}

export function useVendor(): VendorContextValue {
  const context = useContext(VendorContext);

  if (!context) {
    throw new Error("useVendor must be used within a VendorProvider");
  }

  return context;
}
