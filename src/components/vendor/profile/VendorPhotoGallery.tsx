"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import Image from "next/image";
import { useRef } from "react";

export type ExistingPhotoItem = {
  type: "existing";
  id: string;
  url: string;
  order: number;
};

export type NewPhotoItem = {
  type: "new";
  localKey: string;
  file: File;
  previewUrl: string;
  order: number;
};

export type PhotoItem = ExistingPhotoItem | NewPhotoItem;

interface VendorPhotoGalleryProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  onDelete: (photo: PhotoItem) => void;
  onMove: (photo: PhotoItem, direction: "up" | "down") => void;
  disabled?: boolean;
}

function getPhotoKey(photo: PhotoItem): string {
  return photo.type === "existing" ? photo.id : photo.localKey;
}

function getPhotoUrl(photo: PhotoItem): string {
  return photo.type === "existing" ? photo.url : photo.previewUrl;
}

export default function VendorPhotoGallery({
  photos,
  onChange,
  onDelete,
  onMove,
  disabled = false,
}: VendorPhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || disabled) return;

    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    const baseOrder = photos.length;
    const newPhotos: NewPhotoItem[] = files.map((file, index) => ({
      type: "new" as const,
      localKey: `new-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      order: baseOrder + index,
    }));

    onChange([...photos, ...newPhotos]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-black">Photos</p>
          <p className="text-xs text-black/50">
            La première photo sera utilisée comme image principale.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <CategoryIcon icon="Ionicons/add" size={18} color="#fff" />
          Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFilesSelected(event.target.files)}
        />
      </div>

      {sortedPhotos.length === 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-8 text-sm text-black/50 transition-colors hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CategoryIcon icon="Ionicons/images-outline" size={28} color={TEXT_COLOR} />
          Ajoutez des photos de votre activité
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sortedPhotos.map((photo, index) => (
            <div
              key={getPhotoKey(photo)}
              className="group relative overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-black/5"
            >
              <div className="relative aspect-square">
                <Image
                  src={getPhotoUrl(photo)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 200px"
                  unoptimized={photo.type === "new"}
                />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">
                    Principale
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => onMove(photo, "up")}
                    aria-label="Monter"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CategoryIcon icon="Ionicons/arrow-up" size={16} color={TEXT_COLOR} />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === sortedPhotos.length - 1}
                    onClick={() => onMove(photo, "down")}
                    aria-label="Descendre"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <CategoryIcon icon="Ionicons/arrow-down" size={16} color={TEXT_COLOR} />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onDelete(photo)}
                  aria-label="Supprimer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CategoryIcon icon="Ionicons/trash-outline" size={16} color="#fff" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
