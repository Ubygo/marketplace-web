"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { getVendorCoverImageIndex } from "@/lib/vendor-display";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface VendorGalleryProps {
  images: string[];
  vendorName: string;
}

export default function VendorGallery({ images, vendorName }: VendorGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(() =>
    getVendorCoverImageIndex(images.length),
  );

  useEffect(() => {
    const initialIndex = getVendorCoverImageIndex(images.length);
    setCurrentIndex(initialIndex);

    const container = scrollRef.current;
    if (!container || initialIndex === 0) {
      return;
    }

    container.scrollLeft = container.clientWidth * initialIndex;
  }, [images]);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || images.length === 0) {
      return;
    }

    const index = Math.round(container.scrollLeft / container.clientWidth);
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/10] w-full bg-neutral-300">
        <Link
          href="/"
          aria-label="Retour"
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40"
        >
          <CategoryIcon icon="Ionicons/arrow-back" size={22} color="#FFFFFF" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] w-full bg-neutral-300">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex h-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((image, index) => (
          <div
            key={image}
            className="relative h-full min-w-full shrink-0 snap-center"
          >
            <Image
              src={image}
              alt={`${vendorName} - ${index + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />

      <Link
        href="/"
        aria-label="Retour"
        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 transition-opacity hover:opacity-80"
      >
        <CategoryIcon icon="Ionicons/arrow-back" size={22} color="#FFFFFF" />
      </Link>

      {images.length > 1 ? (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {images.map((image, index) => (
            <span
              key={image}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: index === currentIndex ? 12 : 6,
                backgroundColor:
                  index === currentIndex
                    ? "#FFFFFF"
                    : "rgba(255, 255, 255, 0.45)",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
