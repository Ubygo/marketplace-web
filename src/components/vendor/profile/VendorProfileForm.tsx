"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import CategorySelect from "@/components/vendor/profile/CategorySelect";
import VendorPhotoGallery, {
  type ExistingPhotoItem,
  type NewPhotoItem,
  type PhotoItem,
} from "@/components/vendor/profile/VendorPhotoGallery";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { fetchCategoriesClient } from "@/lib/categories-client";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";
import {
  addVendorImage,
  deleteVendorImage,
  updateVendorImageOrder,
} from "@/lib/vendor-images-client";
import { deleteMyVendor, updateMyVendor } from "@/lib/vendors-me-client";
import type { Category } from "@/types/category";
import type { Vendor } from "@/types/vendor";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface VendorProfileFormProps {
  showTitle?: boolean;
}

interface VendorFormData {
  name: string;
  categoryId: string;
  phoneNumber: string;
  description: string;
}

function buildPhotosFromVendor(vendor: Vendor): ExistingPhotoItem[] {
  const source =
    vendor.images?.length > 0 ? vendor.images : vendor.vendorImages ?? [];

  return [...source]
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({
      type: "existing" as const,
      id: image.id,
      url: image.url,
      order: index,
    }));
}

function normalizeOrders(photos: PhotoItem[]): PhotoItem[] {
  return [...photos]
    .sort((a, b) => a.order - b.order)
    .map((photo, index) => ({ ...photo, order: index }));
}

function computeMovedUpdates(
  reordered: PhotoItem[],
  vendor: Vendor | null,
): Record<string, number> {
  if (!vendor) return {};

  const sourceImages =
    vendor.images?.length > 0 ? vendor.images : vendor.vendorImages ?? [];
  const updates: Record<string, number> = {};

  for (const item of reordered) {
    if (item.type !== "existing") continue;

    const original = sourceImages.find((image) => image.id === item.id);
    if (original && original.order !== item.order) {
      updates[item.id] = item.order;
    }
  }

  return updates;
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

export default function VendorProfileForm({
  showTitle = true,
}: VendorProfileFormProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { vendor, refreshVendor, clearVendor } = useVendor();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    categoryId: "",
    phoneNumber: "",
    description: "",
  });
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [movedPhotos, setMovedPhotos] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!vendor) return;

    setFormData({
      name: vendor.name || "",
      categoryId: vendor.categoryId || "",
      phoneNumber: vendor.phoneNumber || "",
      description: vendor.description || "",
    });
    setPhotos(buildPhotosFromVendor(vendor));
    setPhotosToDelete([]);
    setMovedPhotos({});
  }, [vendor]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const data = await fetchCategoriesClient(slug, tenantId);
        if (!cancelled) {
          setCategories(data);
        }
      } catch {
        if (!cancelled) {
          toast.error("Impossible de charger les catégories.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [slug, tenantId]);

  const canSave = useMemo(() => {
    if (!vendor) return false;

    const nameChanged = formData.name.trim() !== (vendor.name || "");
    const descriptionChanged =
      formData.description.trim() !== (vendor.description || "");
    const phoneChanged =
      formData.phoneNumber.trim() !== (vendor.phoneNumber || "");
    const categoryChanged = formData.categoryId !== (vendor.categoryId || "");
    const hasPhotosToDelete = photosToDelete.length > 0;
    const hasMovedPhotos = Object.keys(movedPhotos).length > 0;
    const hasNewPhotos = photos.some((photo) => photo.type === "new");

    return (
      nameChanged ||
      descriptionChanged ||
      phoneChanged ||
      categoryChanged ||
      hasPhotosToDelete ||
      hasMovedPhotos ||
      hasNewPhotos
    );
  }, [formData, movedPhotos, photos, photosToDelete.length, vendor]);

  const handleDeletePhoto = useCallback((photo: PhotoItem) => {
    if (photo.type === "existing") {
      setPhotosToDelete((current) =>
        current.includes(photo.id) ? current : [...current, photo.id],
      );
    } else {
      URL.revokeObjectURL(photo.previewUrl);
    }

    setPhotos((current) =>
      normalizeOrders(current.filter((item) => {
        if (photo.type === "existing" && item.type === "existing") {
          return item.id !== photo.id;
        }
        if (photo.type === "new" && item.type === "new") {
          return item.localKey !== photo.localKey;
        }
        return true;
      })),
    );
  }, []);

  const handleMovePhoto = useCallback(
    (photo: PhotoItem, direction: "up" | "down") => {
      setPhotos((current) => {
        const reordered = reorderPhotos(current, photo, direction);
        if (!reordered) return current;

        setMovedPhotos(computeMovedUpdates(reordered, vendor));
        return reordered;
      });
    },
    [vendor],
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!vendor) return;

    if (!formData.name.trim()) {
      toast.error("Le nom de l'entreprise est requis.");
      return;
    }

    setIsSaving(true);

    try {
      const nameChanged = formData.name.trim() !== (vendor.name || "");
      const descriptionChanged =
        formData.description.trim() !== (vendor.description || "");
      const phoneChanged =
        formData.phoneNumber.trim() !== (vendor.phoneNumber || "");
      const categoryChanged = formData.categoryId !== (vendor.categoryId || "");

      if (nameChanged || descriptionChanged || phoneChanged || categoryChanged) {
        await updateMyVendor(slug, tenantId, vendor.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          categoryId: formData.categoryId || undefined,
        });
      }

      if (photosToDelete.length > 0) {
        await Promise.all(
          photosToDelete.map((imageId) =>
            deleteVendorImage(slug, tenantId, imageId),
          ),
        );
      }

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
              vendor.id,
              "vendor",
            );
            return { url: imageUrl, order: photo.order };
          }),
        );

        await Promise.all(
          uploadedImages.map((image) =>
            addVendorImage(slug, tenantId, vendor.id, image),
          ),
        );
      }

      if (Object.keys(movedPhotos).length > 0) {
        await Promise.all(
          Object.entries(movedPhotos).map(([photoId, order]) =>
            updateVendorImageOrder(slug, tenantId, photoId, order),
          ),
        );
      }

      await refreshVendor();
      toast.success("Profil entreprise mis à jour.");
    } catch {
      toast.error("Impossible de mettre à jour le profil entreprise.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteVendor() {
    if (!vendor) return;

    setIsDeleting(true);

    try {
      await deleteMyVendor(slug, tenantId, vendor.id);
      clearVendor();
      setShowDeleteConfirm(false);
      toast.success("Compte prestataire supprimé.");
      router.replace("/");
    } catch {
      toast.error("Impossible de supprimer le compte prestataire.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!vendor) {
    return null;
  }

  const visiblePhotos = photos.filter((photo) => {
    if (photo.type === "existing") {
      return !photosToDelete.includes(photo.id);
    }
    return true;
  });

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        {showTitle ? (
          <h1 className="text-3xl font-bold text-black">Profil entreprise</h1>
        ) : null}

        <SettingsPanelCard>
          <VendorPhotoGallery
            photos={visiblePhotos}
            onChange={setPhotos}
            onDelete={handleDeletePhoto}
            onMove={handleMovePhoto}
            disabled={isSaving || isDeleting}
          />
        </SettingsPanelCard>

        <SettingsPanelCard className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="vendor-name" className="text-sm font-medium text-black">
              Nom de l&apos;entreprise <span className="text-red-500">*</span>
            </label>
            <input
              id="vendor-name"
              type="text"
              value={formData.name}
              disabled={isSaving || isDeleting}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              placeholder="Nom de votre activité"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="vendor-phone"
              className="text-sm font-medium text-black"
            >
              Téléphone
            </label>
            <input
              id="vendor-phone"
              type="tel"
              value={formData.phoneNumber}
              disabled={isSaving || isDeleting}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  phoneNumber: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <CategorySelect
            categories={categories}
            value={formData.categoryId}
            onChange={(categoryId) =>
              setFormData((current) => ({ ...current, categoryId }))
            }
            disabled={isSaving || isDeleting}
            isLoading={isLoadingCategories}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="vendor-description"
              className="text-sm font-medium text-black"
            >
              Description
            </label>
            <textarea
              id="vendor-description"
              value={formData.description}
              disabled={isSaving || isDeleting}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={5}
              className="w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              placeholder="Présentez votre activité aux clients"
            />
          </div>

          <button
            type="submit"
            disabled={!canSave || isSaving || isDeleting}
            className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={{ backgroundColor: "var(--tenant-primary)" }}
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </SettingsPanelCard>

        <SettingsPanelCard>
          <h2 className="text-base font-semibold text-black">
            Supprimer le compte prestataire
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-black/60">
            Cette action est irréversible. Votre profil prestataire et les
            données associées seront supprimés.
          </p>
          <button
            type="button"
            disabled={isSaving || isDeleting}
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-4 inline-flex rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Supprimer mon compte prestataire
          </button>
        </SettingsPanelCard>
      </form>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Supprimer le compte prestataire ?"
        description="Cette action est définitive. Vous ne pourrez plus accéder à votre espace pro."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
        isConfirming={isDeleting}
        onConfirm={() => void handleDeleteVendor()}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
