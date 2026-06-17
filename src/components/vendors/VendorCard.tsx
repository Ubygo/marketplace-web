import CategoryIcon from "@/components/categories/CategoryIcon";
import {
  SECONDARY_TEXT_COLOR,
  TEXT_COLOR,
} from "@/constants/theme";
import type { VendorCardData } from "@/types/vendor";
import Image from "next/image";

interface VendorCardProps {
  vendor: VendorCardData;
}

function formatReviewLabel(count: number): string {
  if (count >= 1000) {
    return `(${(count / 1000).toFixed(0)}k+)`;
  }
  return `(${count}+)`;
}

function formatPrice(price: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency;
  return `From ${symbol}${price}`;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const coverImage = vendor.galleryImages[0];
  const dotCount = Math.max(vendor.galleryImages.length, 4);

  return (
    <article className="overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-sm">
      <div className="relative aspect-[16/10] w-full bg-neutral-200">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={vendor.serviceTitle}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : null}

        <button
          type="button"
          aria-label="Add to favorites"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90"
        >
          <CategoryIcon
            icon="Ionicons/heart-outline"
            size={18}
            color={TEXT_COLOR}
          />
        </button>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: dotCount }).map((_, index) => (
            <span
              key={index}
              className="h-1.5 rounded-full"
              style={{
                width: index === 0 ? 12 : 6,
                backgroundColor:
                  index === 0 ? "#FFFFFF" : "rgba(255, 255, 255, 0.45)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2">
          {vendor.avatarUrl ? (
            <Image
              src={vendor.avatarUrl}
              alt={vendor.vendorName}
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-black">
              {vendor.vendorName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate text-sm font-bold text-black">
            {vendor.vendorName}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-snug text-black">
          {vendor.serviceTitle}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <CategoryIcon icon="Ionicons/star" size={14} color={TEXT_COLOR} />
            <span className="text-sm font-bold text-black">
              {vendor.rating.toFixed(1)}
            </span>
            <span className="text-sm" style={{ color: SECONDARY_TEXT_COLOR }}>
              {formatReviewLabel(vendor.reviewCount)}
            </span>
          </div>

          {vendor.priceFrom > 0 ? (
            <span className="text-sm font-bold text-black">
              {formatPrice(vendor.priceFrom, vendor.currency)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
