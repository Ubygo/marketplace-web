"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { TEXT_COLOR } from "@/constants/theme";
import { buildLoginUrl } from "@/lib/auth-url";
import {
  addVendorToFavorites,
  getMyFavorites,
  removeVendorFromFavorites,
} from "@/lib/favorites";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, useEffect, useState } from "react";

interface VendorCardLikeButtonProps {
  vendorId: string;
}

export default function VendorCardLikeButton({
  vendorId,
}: VendorCardLikeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const { tenantId, slug } = useTenant();
  const [isLiked, setIsLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentPath = pathname;

  useEffect(() => {
    if (!isAuthenticated || isLoading) {
      return;
    }

    let isMounted = true;

    getMyFavorites(slug, tenantId)
      .then((favorites) => {
        if (!isMounted) {
          return;
        }

        setIsLiked(favorites.some((favorite) => favorite.vendorId === vendorId));
      })
      .catch(() => {
        // Ignore favorites load errors on cards.
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isLoading, slug, tenantId, vendorId]);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginUrl(currentPath));
      return;
    }

    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      if (isLiked) {
        await removeVendorFromFavorites(slug, tenantId, vendorId);
        setIsLiked(false);
      } else {
        await addVendorToFavorites(slug, tenantId, vendorId);
        setIsLiked(true);
      }
    } catch {
      // Keep current state on failure.
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={handleClick}
      disabled={isUpdating}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-black/5 transition-all hover:scale-105 hover:bg-white hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CategoryIcon
        icon={isLiked ? "Ionicons/heart" : "Ionicons/heart-outline"}
        size={18}
        color={TEXT_COLOR}
      />
    </button>
  );
}
