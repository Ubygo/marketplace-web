import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import {
  getVendorImageUrl,
  getVendorRating,
  getVendorReviewCount,
} from "@/lib/vendor-display";
import type { Vendor } from "@/types/vendor";
import Image from "next/image";

interface VendorDetailHeaderProps {
  vendor: Vendor;
  variant?: "mobile" | "desktop";
}

function formatReviewLabel(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}k+ avis`;
  }
  return count > 0 ? `${count} avis` : "Aucun avis";
}

function formatAddress(vendor: Vendor): string | null {
  const { location } = vendor;
  if (!location) {
    return null;
  }

  const parts = [
    location.street,
    [location.zipcode, location.city].filter(Boolean).join(" "),
    location.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

export default function VendorDetailHeader({
  vendor,
  variant = "mobile",
}: VendorDetailHeaderProps) {
  const rating = getVendorRating(vendor);
  const reviewCount = getVendorReviewCount(vendor);
  const address = formatAddress(vendor);
  const avatarUrl = vendor.photo ?? getVendorImageUrl(vendor) ?? "";
  const isDesktop = variant === "desktop";

  if (isDesktop) {
    return (
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={vendor.name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[var(--tenant-primary)]"
            />
          ) : (
            <h1 className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-base font-bold text-black ring-2 ring-[var(--tenant-primary)]">
              {vendor.name.charAt(0).toUpperCase()}
            </h1>
          )}

          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-base font-semibold text-black">{vendor.name}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-black">
              <div className="flex items-center gap-1">
                <CategoryIcon
                  icon="Ionicons/star"
                  size={15}
                  color={TEXT_COLOR}
                />
                <span className="font-bold">{rating.toFixed(1)}</span>
              </div>
              <span className="text-black/60">·</span>
              <span className="font-medium text-black/80">
                {formatReviewLabel(reviewCount)}
              </span>
            </div>
          </div>
        </div>

        {address ? (
          <div className="flex items-start gap-2 text-sm text-black">
            <CategoryIcon
              icon="Ionicons/location-outline"
              size={18}
              color={TEXT_COLOR}
            />
            <p>{address}</p>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="flex flex-col gap-3 px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-black">{vendor.name}</h1>

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={vendor.name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-black">
            {vendor.name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="flex items-center gap-2 text-sm text-black">
          <CategoryIcon icon="Ionicons/star" size={15} color={TEXT_COLOR} />
          <span className="font-bold">{rating.toFixed(1)}</span>
          <span className="text-black/60">·</span>
          <span className="text-black/80">
            {formatReviewLabel(reviewCount)}
          </span>
        </div>
      </div>

      {address ? (
        <div className="flex items-start gap-2 text-sm text-black">
          <CategoryIcon
            icon="Ionicons/location-outline"
            size={18}
            color={TEXT_COLOR}
          />
          <p>{address}</p>
        </div>
      ) : null}
    </header>
  );
}
