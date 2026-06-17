"use client";

import type { VendorImage } from "@/types/vendor";
import Image from "next/image";
import { useState } from "react";

interface VendorGalleryTabProps {
  images: VendorImage[];
}

export default function VendorGalleryTab({ images }: VendorGalleryTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#B4B6B0]">
        Aucune image disponible
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 py-5 sm:grid-cols-3">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image.url)}
            className="aspect-square overflow-hidden rounded-2xl"
          >
            <Image
              src={image.url}
              alt=""
              width={240}
              height={240}
              className="h-full w-full object-cover transition-opacity hover:opacity-90"
            />
          </button>
        ))}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setSelectedImage(null);
            }
          }}
          role="presentation"
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Fermer
          </button>
          <Image
            src={selectedImage}
            alt=""
            width={1200}
            height={900}
            className="max-h-[85vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
