"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import LikeButtonSkeleton from "@/components/vendors/LikeButtonSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { TEXT_COLOR } from "@/constants/theme";
import { buildLoginUrl } from "@/lib/auth-url";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";

interface VendorCardLikeButtonProps {
  vendorId: string;
}

export default function VendorCardLikeButton({
  vendorId,
}: VendorCardLikeButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isFavorite, isReady, toggleFavorite } = useFavorites();
  const [isUpdating, setIsUpdating] = useState(false);

  const isLiked = isFavorite(vendorId);
  const showSkeleton = isAuthenticated && (!isReady || isAuthLoading);

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isAuthLoading || showSkeleton) {
      return;
    }

    if (!isAuthenticated) {
      router.push(buildLoginUrl(pathname));
      return;
    }

    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await toggleFavorite(vendorId);
    } catch {
      // Keep current state on failure.
    } finally {
      setIsUpdating(false);
    }
  }

  if (showSkeleton) {
    return <LikeButtonSkeleton />;
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
