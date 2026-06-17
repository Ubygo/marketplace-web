import CategoryIcon from "@/components/categories/CategoryIcon";
import VendorCardLikeButton from "@/components/vendors/VendorCardLikeButton";
import {
  SECONDARY_TEXT_COLOR,
  TEXT_COLOR,
} from "@/constants/theme";
import { formatPriceFrom } from "@/lib/format-price";
import type { VendorCardData } from "@/types/vendor";
import Image from "next/image";
import Link from "next/link";

interface VendorCardProps {
  vendor: VendorCardData;
}

function formatReviewLabel(count: number): string {
  if (count >= 1000) {
    return `(${(count / 1000).toFixed(0)}k+)`;
  }
  return `(${count}+)`;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const coverImage = vendor.galleryImages[0];

  return (
    <article className="relative overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-sm">
      <VendorCardLikeButton vendorId={vendor.id} />

      <Link href={`/vendors/${vendor.id}`} className="block">
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
                {formatPriceFrom(vendor.priceFrom, vendor.currency)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
