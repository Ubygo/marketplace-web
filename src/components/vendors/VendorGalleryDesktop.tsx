"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { getVendorCoverImageIndex } from "@/lib/vendor-display";
import Image from "next/image";
import { useEffect, useState } from "react";

interface VendorGalleryDesktopProps {
  images: string[];
  vendorName: string;
}

export default function VendorGalleryDesktop({
  images,
  vendorName,
}: VendorGalleryDesktopProps) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    getVendorCoverImageIndex(images.length),
  );

  useEffect(() => {
    setCurrentIndex(getVendorCoverImageIndex(images.length));
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] w-full rounded-2xl bg-neutral-300" />
    );
  }

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  function goToPrevious() {
    setCurrentIndex((index) => (index === 0 ? images.length - 1 : index - 1));
  }

  function goToNext() {
    setCurrentIndex((index) => (index === images.length - 1 ? 0 : index + 1));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-neutral-200">
        <Image
          src={currentImage}
          alt={`${vendorName} - ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 65vw"
          priority={currentIndex === 0}
        />

        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Image précédente"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:opacity-80"
            >
              <CategoryIcon
                icon="Ionicons/chevron-back"
                size={22}
                color={TEXT_COLOR}
              />
            </button>
            <button
              type="button"
              aria-label="Image suivante"
              onClick={goToNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm transition-opacity hover:opacity-80"
            >
              <CategoryIcon
                icon="Ionicons/chevron-forward"
                size={22}
                color={TEXT_COLOR}
              />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isSelected = index === currentIndex;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors"
                style={{
                  borderColor: isSelected ? TEXT_COLOR : "transparent",
                }}
              >
                <Image
                  src={image}
                  alt={`${vendorName} miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
