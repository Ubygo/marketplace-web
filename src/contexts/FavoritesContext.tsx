"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import {
  addVendorToFavorites,
  getMyFavorites,
  removeVendorFromFavorites,
  type FavoriteApiItem,
} from "@/lib/favorites";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface FavoritesContextValue {
  favoriteVendorIds: Set<string>;
  isLoading: boolean;
  isReady: boolean;
  isFavorite: (vendorId: string) => boolean;
  toggleFavorite: (vendorId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { slug, tenantId } = useTenant();
  const [favorites, setFavorites] = useState<FavoriteApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    setIsLoading(true);
    setIsReady(false);

    try {
      const data = await getMyFavorites(slug, tenantId);
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  }, [isAuthenticated, slug, tenantId]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void loadFavorites();
  }, [isAuthLoading, loadFavorites]);

  const favoriteVendorIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.vendorId)),
    [favorites],
  );

  const isFavorite = useCallback(
    (vendorId: string) => favoriteVendorIds.has(vendorId),
    [favoriteVendorIds],
  );

  const toggleFavorite = useCallback(
    async (vendorId: string) => {
      if (!isAuthenticated) {
        return;
      }

      const wasLiked = favoriteVendorIds.has(vendorId);

      if (wasLiked) {
        await removeVendorFromFavorites(slug, tenantId, vendorId);
        setFavorites((current) =>
          current.filter((favorite) => favorite.vendorId !== vendorId),
        );
      } else {
        await addVendorToFavorites(slug, tenantId, vendorId);
        const refreshed = await getMyFavorites(slug, tenantId);
        setFavorites(refreshed);
      }
    },
    [favoriteVendorIds, isAuthenticated, slug, tenantId],
  );

  const value = useMemo(
    () => ({
      favoriteVendorIds,
      isLoading,
      isReady: isAuthLoading ? false : isReady,
      isFavorite,
      toggleFavorite,
      refresh: loadFavorites,
    }),
    [
      favoriteVendorIds,
      isAuthLoading,
      isFavorite,
      isLoading,
      isReady,
      loadFavorites,
      toggleFavorite,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
