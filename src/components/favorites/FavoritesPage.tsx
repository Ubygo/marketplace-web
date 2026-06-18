"use client";

import VendorCard from "@/components/vendors/VendorCard";
import VendorGridSkeleton from "@/components/vendors/VendorGridSkeleton";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useTenant } from "@/contexts/TenantContext";
import { buildLoginUrl } from "@/lib/auth-url";
import { mapVendorToCardData } from "@/lib/vendor-display";
import {
  fetchServicesByVendorIdClient,
  fetchVendorByIdClient,
} from "@/lib/vendors-client";
import type { VendorCardData } from "@/types/vendor";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function FavoritesPage() {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isReady: areFavoritesReady, favoriteVendorIds } = useFavorites();
  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/favoris"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadFavorites = useCallback(async () => {
    if (!areFavoritesReady) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cards = await Promise.all(
        Array.from(favoriteVendorIds).map(async (vendorId) => {
          const vendor = await fetchVendorByIdClient(slug, tenantId, vendorId);
          if (!vendor) return null;

          const services = await fetchServicesByVendorIdClient(
            slug,
            tenantId,
            vendorId,
          );

          return mapVendorToCardData(vendor, services);
        }),
      );

      setVendors(cards.filter((card): card is VendorCardData => card !== null));
    } catch {
      setError("Impossible de charger vos favoris.");
      setVendors([]);
    } finally {
      setIsLoading(false);
    }
  }, [areFavoritesReady, favoriteVendorIds, slug, tenantId]);

  useEffect(() => {
    if (!isAuthenticated || !areFavoritesReady) return;
    void loadFavorites();
  }, [areFavoritesReady, favoriteVendorIds, isAuthenticated, loadFavorites]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const showSkeleton = isAuthLoading || !areFavoritesReady || isLoading;

  return (
    <main>
      <ContentContainer>
        <h1 className="mb-6 text-2xl font-bold text-black">Mes favoris</h1>

        {showSkeleton ? (
          <VendorGridSkeleton />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : vendors.length === 0 ? (
          <p className="py-10 text-center text-sm text-black/60">
            Aucun prestataire en favori pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </ContentContainer>
    </main>
  );
}
