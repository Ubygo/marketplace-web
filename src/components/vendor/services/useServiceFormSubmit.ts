"use client";

import type {
  ExistingPhotoItem,
  NewPhotoItem,
  PhotoItem,
} from "@/components/vendor/profile/VendorPhotoGallery";
import { uploadImageToCloudinary } from "@/lib/cloudinary-client";
import { parseMapboxFeature } from "@/lib/mapbox-address";
import {
  addServiceImage,
  deleteServiceImage,
  updateServiceImageOrder,
} from "@/lib/service-images-client";
import { createService, updateService } from "@/lib/services-me-client";
import type { CreateServiceRequest, ServiceNewLocation } from "@/types/service";
import type { MapboxFeature } from "@/types/mapbox";
import { useState } from "react";
import { toast } from "sonner";

interface UseServiceFormSubmitParams {
  serviceId?: string;
  slug: string;
  tenantId: string;
  vendorId?: string;
  formData: CreateServiceRequest;
  isHomeService: boolean;
  useNewLocation: boolean;
  selectedNewLocation: MapboxFeature | null;
  newLocationName: string;
  photos: PhotoItem[];
  photosToDelete: string[];
  movedPhotos: Record<string, number>;
  onSuccess: () => void;
}

export function useServiceFormSubmit({
  serviceId,
  slug,
  tenantId,
  vendorId,
  formData,
  isHomeService,
  useNewLocation,
  selectedNewLocation,
  newLocationName,
  photos,
  photosToDelete,
  movedPhotos,
  onSuccess,
}: UseServiceFormSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (!formData.name.trim() || !formData.serviceType || !formData.categoryId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const normalizedPrice =
      formData.price !== null ? Number(formData.price) : Number.NaN;
    if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      toast.error("Veuillez saisir un prix valide.");
      return;
    }

    if (formData.serviceType === "BOOKING") {
      const normalizedDuration =
        formData.duration !== null && formData.duration !== undefined
          ? Number(formData.duration)
          : Number.NaN;

      if (!Number.isFinite(normalizedDuration) || normalizedDuration <= 0) {
        toast.error("Veuillez saisir une durée valide.");
        return;
      }
    }

    if (!vendorId) {
      toast.error("Profil prestataire introuvable.");
      return;
    }

    try {
      setIsSubmitting(true);

      const isAtStore = formData.bookingLocationType === "AT_STORE";
      const resolvedBookingLocationType = isAtStore
        ? "AT_STORE"
        : isHomeService
          ? "AT_CLIENT"
          : "ONLINE";

      let resolvedLocationId: string | undefined;
      let resolvedNewLocation: ServiceNewLocation | undefined;

      if (isAtStore) {
        if (useNewLocation) {
          if (!selectedNewLocation) {
            toast.error("Veuillez ajouter une adresse.");
            return;
          }

          const parsedAddress = parseMapboxFeature(selectedNewLocation);
          if (
            !parsedAddress ||
            !parsedAddress.street.trim() ||
            !parsedAddress.city.trim() ||
            !parsedAddress.country.trim()
          ) {
            toast.error("Adresse invalide.");
            return;
          }

          resolvedNewLocation = {
            name: newLocationName.trim() || undefined,
            street: parsedAddress.street.trim(),
            city: parsedAddress.city.trim(),
            zipcode: parsedAddress.zipcode.trim() || undefined,
            country: parsedAddress.country.trim(),
            lat: parsedAddress.lat,
            lng: parsedAddress.lng,
          };
        } else if (!formData.locationId) {
          toast.error("Veuillez sélectionner un lieu.");
          return;
        } else {
          resolvedLocationId = formData.locationId;
        }
      }

      if (
        resolvedBookingLocationType !== "ONLINE" &&
        formData.serviceType !== "BOOKING"
      ) {
        toast.error(
          "Les modes sur place et à domicile nécessitent la réservation avec créneaux.",
        );
        return;
      }

      const serviceData: CreateServiceRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        price: normalizedPrice,
        currency: formData.currency,
        serviceType: formData.serviceType,
        ...(formData.serviceType !== "INSTANT" &&
        formData.duration !== undefined &&
        formData.duration !== null
          ? { duration: Number(formData.duration) }
          : {}),
        ...(formData.serviceType !== "INSTANT" && formData.durationMetric
          ? { durationMetric: formData.durationMetric }
          : {}),
        categoryId: formData.categoryId,
        paymentType: formData.paymentType,
        visible: formData.visible,
        bookingLocationType: resolvedBookingLocationType,
        actionRadiusKm:
          isHomeService && formData.actionRadiusKm !== null
            ? Number(formData.actionRadiusKm)
            : null,
        minBookingNoticeMinutes:
          formData.minBookingNoticeMinutes !== null &&
          formData.minBookingNoticeMinutes !== undefined
            ? Number(formData.minBookingNoticeMinutes)
            : null,
        bookingIntervalMinutes:
          formData.bookingIntervalMinutes !== null &&
          formData.bookingIntervalMinutes !== undefined
            ? Number(formData.bookingIntervalMinutes)
            : null,
        ...(resolvedLocationId ? { locationId: resolvedLocationId } : {}),
        ...(resolvedNewLocation ? { newLocation: resolvedNewLocation } : {}),
      };

      let createdOrUpdatedServiceId: string;

      if (serviceId) {
        await updateService(slug, tenantId, serviceId, serviceData);
        createdOrUpdatedServiceId = serviceId;
      } else {
        const createdService = await createService(slug, tenantId, serviceData);
        createdOrUpdatedServiceId = createdService.id;
      }

      if (photosToDelete.length > 0) {
        await Promise.all(
          photosToDelete.map((imageId) =>
            deleteServiceImage(slug, tenantId, imageId),
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
              vendorId,
              "service",
            );
            return { url: imageUrl, order: photo.order };
          }),
        );

        await Promise.all(
          uploadedImages.map((img) =>
            addServiceImage(slug, tenantId, createdOrUpdatedServiceId, img),
          ),
        );
      }

      if (serviceId && Object.keys(movedPhotos).length > 0) {
        await Promise.all(
          Object.entries(movedPhotos).map(([photoId, newOrder]) =>
            updateServiceImageOrder(slug, tenantId, photoId, newOrder),
          ),
        );
      }

      toast.success(
        serviceId ? "Prestation mise à jour." : "Prestation créée avec succès.",
      );
      onSuccess();
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, handleSubmit };
}

export function buildPhotosFromService(
  serviceImages: { id: string; url: string; order: number }[] = [],
): ExistingPhotoItem[] {
  return [...serviceImages]
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({
      type: "existing" as const,
      id: image.id,
      url: image.url,
      order: index,
    }));
}

export function normalizePhotoOrders(photos: PhotoItem[]): PhotoItem[] {
  return [...photos]
    .sort((a, b) => a.order - b.order)
    .map((photo, index) => ({ ...photo, order: index }));
}

export function reorderServicePhotos(
  photos: PhotoItem[],
  photo: PhotoItem,
  direction: "up" | "down",
): PhotoItem[] | null {
  const sorted = normalizePhotoOrders(photos);
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
  return normalizePhotoOrders(next);
}
