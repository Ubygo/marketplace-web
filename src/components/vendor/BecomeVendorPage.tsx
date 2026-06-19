"use client";

import ContentContainer from "@/components/layout/ContentContainer";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import VendorPhotoGallery, {
  type NewPhotoItem,
  type PhotoItem,
} from "@/components/vendor/profile/VendorPhotoGallery";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useTenantVendorMode } from "@/hooks/useTenantVendorMode";
import { buildLoginUrl } from "@/lib/auth-url";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";
import { addVendorImage } from "@/lib/vendor-images-client";
import { createMyVendor } from "@/lib/vendors-me-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function normalizeOrders(photos: PhotoItem[]): PhotoItem[] {
  return [...photos]
    .sort((a, b) => a.order - b.order)
    .map((photo, index) => ({ ...photo, order: index }));
}

function reorderPhotos(
  photos: PhotoItem[],
  photo: PhotoItem,
  direction: "up" | "down",
): PhotoItem[] | null {
  const sorted = normalizeOrders(photos);
  const index = sorted.findIndex((item) => {
    if (photo.type === "existing" && item.type === "existing") {
      return item.id === photo.id;
    }
    if (photo.type === "new" && item.type === "new") {
      return item.localKey === photo.localKey;
    }
    return false;
  });

  if (index < 0) return null;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) return null;

  const next = [...sorted];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return normalizeOrders(next);
}

export default function BecomeVendorPage() {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading, refreshVendor } = useVendor();
  const { isPublicVendorSignup } = useTenantVendorMode();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phone && !phoneNumber) {
      setPhoneNumber(user.phone);
    }
  }, [user?.phone, phoneNumber]);

  useEffect(() => {
    if (isAuthLoading || isVendorLoading) return;

    if (!isAuthenticated) {
      router.replace(buildLoginUrl("/devenir-prestataire"));
      return;
    }

    if (!isPublicVendorSignup) {
      router.replace("/");
      return;
    }

    if (hasVendor) {
      router.replace("/pro");
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isPublicVendorSignup,
    isVendorLoading,
    router,
  ]);

  function handleDeletePhoto(photo: PhotoItem) {
    setPhotos((current) =>
      normalizeOrders(
        current.filter((item) => {
          if (photo.type === "existing" && item.type === "existing") {
            return item.id !== photo.id;
          }
          if (photo.type === "new" && item.type === "new") {
            return item.localKey !== photo.localKey;
          }
          return true;
        }),
      ),
    );
  }

  function handleMovePhoto(photo: PhotoItem, direction: "up" | "down") {
    setPhotos((current) => reorderPhotos(current, photo, direction) ?? current);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newVendor = await createMyVendor(slug, tenantId, {
        name: trimmedName,
        description: description.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        visible: true,
        status: "active",
      });

      const newPhotos = photos.filter(
        (photo): photo is NewPhotoItem => photo.type === "new",
      );

      if (newPhotos.length > 0) {
        const uploadedImages = await Promise.all(
          newPhotos.map(async (photo) => {
            const imageUrl = await uploadImageToCloudinary(
              slug,
              tenantId,
              photo.file,
              newVendor.id,
              "vendor",
            );
            return { url: imageUrl, order: photo.order };
          }),
        );

        await Promise.all(
          uploadedImages.map((image) =>
            addVendorImage(slug, tenantId, newVendor.id, image),
          ),
        );
      }

      await refreshVendor();
      router.replace("/pro");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte prestataire.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = name.trim().length > 0;
  const isLoading = isAuthLoading || isVendorLoading;

  if (
    isLoading ||
    !isAuthenticated ||
    !isPublicVendorSignup ||
    hasVendor
  ) {
    return null;
  }

  return (
    <main>
      <ContentContainer className="max-w-2xl py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-black">
            Complétez votre profil
          </h1>

          <SettingsPanelCard>
            <VendorPhotoGallery
              photos={photos}
              onChange={setPhotos}
              onDelete={handleDeletePhoto}
              onMove={handleMovePhoto}
              disabled={isSubmitting}
            />
          </SettingsPanelCard>

          <SettingsPanelCard className="flex flex-col gap-5">
            <h2 className="text-lg font-semibold text-black">
              Infos de l&apos;entreprise
            </h2>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="become-vendor-phone"
                className="text-sm font-medium text-black"
              >
                Téléphone
              </label>
              <input
                id="become-vendor-phone"
                type="tel"
                value={phoneNumber}
                disabled={isSubmitting}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
                placeholder="Numéro de téléphone"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="become-vendor-name"
                className="text-sm font-medium text-black"
              >
                Nom de l&apos;entreprise{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="become-vendor-name"
                type="text"
                value={name}
                disabled={isSubmitting}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="become-vendor-description"
                className="text-sm font-medium text-black"
              >
                Description
              </label>
              <textarea
                id="become-vendor-description"
                value={description}
                disabled={isSubmitting}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
                placeholder="Décrivez votre entreprise..."
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              style={{ backgroundColor: "var(--tenant-primary)" }}
            >
              {isSubmitting ? "Création..." : "Créer l'entreprise"}
            </button>

            {error ? (
              <p className="text-center text-sm text-red-600">{error}</p>
            ) : null}
          </SettingsPanelCard>
        </form>
      </ContentContainer>
    </main>
  );
}
