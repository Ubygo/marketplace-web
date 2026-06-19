"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import CategorySelect from "@/components/vendor/profile/CategorySelect";
import VendorPhotoGallery, {
  type PhotoItem,
} from "@/components/vendor/profile/VendorPhotoGallery";
import ServiceDetailOptions from "@/components/vendor/services/ServiceDetailOptions";
import ServiceStoreLocationSection from "@/components/vendor/services/ServiceStoreLocationSection";
import {
  buildPhotosFromService,
  normalizePhotoOrders,
  reorderServicePhotos,
  useServiceFormSubmit,
} from "@/components/vendor/services/useServiceFormSubmit";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { hasConfiguredAvailabilities } from "@/lib/availabilities-client";
import { fetchCategoriesClient } from "@/lib/categories-client";
import { fetchMyLocations } from "@/lib/locations-client";
import { PRO_SETTINGS_AVAILABILITIES_URL } from "@/lib/settings-url";
import { fetchServiceById } from "@/lib/services-me-client";
import type { Category } from "@/types/category";
import type { CreateServiceRequest } from "@/types/service";
import type { Location } from "@/types/location";
import type { MapboxFeature } from "@/types/mapbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface VendorServiceFormProps {
  serviceId?: string;
}

function createEmptyFormData(currency: string): CreateServiceRequest {
  return {
    name: "",
    description: "",
    price: null,
    currency,
    serviceType: "INSTANT",
    duration: null,
    durationMetric: "MINUTES",
    categoryId: "",
    paymentType: "DIRECT",
    visible: true,
    bookingLocationType: "ONLINE",
    actionRadiusKm: null,
    locationId: undefined,
    minBookingNoticeMinutes: null,
    bookingIntervalMinutes: null,
  };
}

export default function VendorServiceForm({ serviceId }: VendorServiceFormProps) {
  const router = useRouter();
  const { slug, tenantId, currency } = useTenant();
  const { vendor } = useVendor();

  const [isLoadingData, setIsLoadingData] = useState(!!serviceId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [formData, setFormData] = useState<CreateServiceRequest>(() =>
    createEmptyFormData(currency),
  );
  const [isHomeService, setIsHomeService] = useState(false);
  const [useNewLocation, setUseNewLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [selectedNewLocation, setSelectedNewLocation] =
    useState<MapboxFeature | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [movedPhotos, setMovedPhotos] = useState<Record<string, number>>({});

  const loadLocations = useCallback(async () => {
    try {
      setIsLoadingLocations(true);
      const myLocations = await fetchMyLocations(slug, tenantId);
      setLocations(myLocations);
    } catch {
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const data = await fetchCategoriesClient(slug, tenantId);
        if (mounted) setCategories(data);
      } catch {
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setIsLoadingCategories(false);
      }
    }

    void loadCategories();
    return () => {
      mounted = false;
    };
  }, [slug, tenantId]);

  useEffect(() => {
    if (!serviceId) return;

    const currentServiceId = serviceId;
    let mounted = true;

    async function loadService() {
      try {
        setIsLoadingData(true);
        const service = await fetchServiceById(slug, tenantId, currentServiceId);
        if (!mounted) return;

        const hasLocationMode =
          service.bookingLocationType === "AT_STORE" ||
          service.bookingLocationType === "AT_CLIENT";
        const normalizedBookingLocationType =
          service.serviceType === "BOOKING" && !hasLocationMode
            ? "AT_STORE"
            : service.bookingLocationType || "ONLINE";

        setFormData({
          name: service.name,
          description: service.description || "",
          price: service.price,
          currency: service.currency,
          serviceType: service.serviceType || "INSTANT",
          duration: service.duration ?? null,
          durationMetric: service.durationMetric || "MINUTES",
          categoryId: service.categoryId,
          paymentType: service.paymentType || "DIRECT",
          visible: service.visible,
          bookingLocationType: normalizedBookingLocationType,
          actionRadiusKm: service.actionRadiusKm ?? null,
          locationId: service.locationId,
          minBookingNoticeMinutes: service.minBookingNoticeMinutes ?? null,
          bookingIntervalMinutes: service.bookingIntervalMinutes ?? null,
        });

        if (service.locationId) {
          setUseNewLocation(false);
          setNewLocationName("");
          setSelectedNewLocation(null);
        }

        setIsHomeService(normalizedBookingLocationType === "AT_CLIENT");
        setPhotos(
          buildPhotosFromService(service.serviceImages ?? service.images ?? []),
        );
        setPhotosToDelete([]);
        setMovedPhotos({});
      } catch {
        toast.error("Impossible de charger la prestation.");
        router.replace("/pro/prestations");
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    }

    void loadService();
    return () => {
      mounted = false;
    };
  }, [serviceId, slug, tenantId, router]);

  const { isSubmitting, handleSubmit } = useServiceFormSubmit({
    serviceId,
    slug,
    tenantId,
    vendorId: vendor?.id,
    formData,
    isHomeService,
    useNewLocation,
    selectedNewLocation,
    newLocationName,
    photos,
    photosToDelete,
    movedPhotos,
    onSuccess: () => router.push("/pro/prestations"),
  });

  function handleInputChange(
    field: keyof CreateServiceRequest,
    value: string | number | boolean | null | undefined,
  ) {
    setFormData((prev) => {
      if (
        field === "price" ||
        field === "duration" ||
        field === "actionRadiusKm" ||
        field === "bookingIntervalMinutes"
      ) {
        const numValue =
          value === "" || value === null || value === undefined
            ? null
            : Number(value);
        return { ...prev, [field]: numValue };
      }
      return { ...prev, [field]: value };
    });
  }

  function handleMinBookingNoticeHoursChange(value: string) {
    if (value === "") {
      handleInputChange("minBookingNoticeMinutes", null);
      return;
    }
    const hours = Number(value);
    handleInputChange(
      "minBookingNoticeMinutes",
      Number.isFinite(hours) ? hours * 60 : null,
    );
  }

  async function ensureAvailabilitiesBeforeLocationActivation(): Promise<boolean> {
    const configured = await hasConfiguredAvailabilities(slug, tenantId);
    if (!configured) {
      toast.error("Configurez vos disponibilités avant d'activer ce mode.", {
        action: {
          label: "Configurer",
          onClick: () => router.push(PRO_SETTINGS_AVAILABILITIES_URL),
        },
      });
    }
    return configured;
  }

  async function handleSubmitWithChecks() {
    const requiresSlots =
      formData.bookingLocationType === "AT_STORE" ||
      formData.bookingLocationType === "AT_CLIENT" ||
      isHomeService;

    if (requiresSlots) {
      const hasAvailabilities = await ensureAvailabilitiesBeforeLocationActivation();
      if (!hasAvailabilities) return;
    }

    await handleSubmit();
  }

  function handlePhotoDelete(photo: PhotoItem) {
    if (photo.type === "existing") {
      setPhotosToDelete((prev) => [...prev, photo.id]);
    }
    setPhotos((prev) =>
      normalizePhotoOrders(
        prev.filter((item) => {
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

  function handlePhotoMove(photo: PhotoItem, direction: "up" | "down") {
    const reordered = reorderServicePhotos(photos, photo, direction);
    if (!reordered) return;

    setPhotos(reordered);

    if (photo.type === "existing") {
      const updated = reordered.find(
        (item): item is typeof photo =>
          item.type === "existing" && item.id === photo.id,
      );
      if (updated) {
        setMovedPhotos((prev) => ({ ...prev, [photo.id]: updated.order }));
      }
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl py-4">
      <Link
        href="/pro/prestations"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
      >
        <CategoryIcon icon="Ionicons/arrow-back" size={18} color={TEXT_COLOR} />
        Retour aux prestations
      </Link>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {serviceId ? "Modifier la prestation" : "Nouvelle prestation"}
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Décrivez votre service et ajoutez des photos pour attirer vos clients.
          </p>
        </div>

        <CategorySelect
          categories={categories}
          value={formData.categoryId}
          onChange={(categoryId) => handleInputChange("categoryId", categoryId)}
          isLoading={isLoadingCategories}
          disabled={isSubmitting}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="service-name" className="text-sm font-medium text-black">
            Nom
          </label>
          <input
            id="service-name"
            type="text"
            disabled={isSubmitting}
            value={formData.name}
            onChange={(event) => handleInputChange("name", event.target.value)}
            placeholder="Ex. Coupe + brushing"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="service-description"
            className="text-sm font-medium text-black"
          >
            Description
          </label>
          <textarea
            id="service-description"
            disabled={isSubmitting}
            value={formData.description || ""}
            onChange={(event) =>
              handleInputChange("description", event.target.value)
            }
            placeholder="Décrivez votre prestation..."
            rows={4}
            className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="service-price" className="text-sm font-medium text-black">
              Prix ({currency === "EUR" ? "€" : currency})
            </label>
            <input
              id="service-price"
              type="number"
              min={0}
              disabled={isSubmitting}
              value={formData.price !== null ? formData.price : ""}
              onChange={(event) => handleInputChange("price", event.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
            />
          </div>

          {formData.serviceType === "BOOKING" ? (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="service-duration"
                className="text-sm font-medium text-black"
              >
                Durée (minutes)
              </label>
              <input
                id="service-duration"
                type="number"
                min={0}
                disabled={isSubmitting}
                value={
                  formData.duration !== null && formData.duration !== undefined
                    ? formData.duration
                    : ""
                }
                onChange={(event) =>
                  handleInputChange("duration", event.target.value)
                }
                placeholder="60"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              />
            </div>
          ) : null}
        </div>

        {formData.serviceType === "BOOKING" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="booking-interval"
                className="text-sm font-medium text-black"
              >
                Intervalle entre créneaux (min)
              </label>
              <input
                id="booking-interval"
                type="number"
                min={0}
                disabled={isSubmitting}
                value={
                  formData.bookingIntervalMinutes !== null &&
                  formData.bookingIntervalMinutes !== undefined
                    ? formData.bookingIntervalMinutes
                    : ""
                }
                onChange={(event) =>
                  handleInputChange("bookingIntervalMinutes", event.target.value)
                }
                placeholder="30"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="min-notice"
                className="text-sm font-medium text-black"
              >
                Préavis minimum (heures)
              </label>
              <input
                id="min-notice"
                type="number"
                min={0}
                disabled={isSubmitting}
                value={
                  formData.minBookingNoticeMinutes !== null &&
                  formData.minBookingNoticeMinutes !== undefined
                    ? formData.minBookingNoticeMinutes / 60
                    : ""
                }
                onChange={(event) =>
                  handleMinBookingNoticeHoursChange(event.target.value)
                }
                placeholder="2"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
              />
            </div>
          </div>
        ) : null}

        <VendorPhotoGallery
          photos={photos}
          onChange={setPhotos}
          onDelete={handlePhotoDelete}
          onMove={handlePhotoMove}
          disabled={isSubmitting}
        />

        <ServiceDetailOptions
          isBooking={formData.serviceType === "BOOKING"}
          onBookingChange={async (value) => {
            if (value) {
              const hasNoLocationMode =
                formData.bookingLocationType === "ONLINE" && !isHomeService;

              if (hasNoLocationMode) {
                const hasAvailabilities =
                  await ensureAvailabilitiesBeforeLocationActivation();
                if (!hasAvailabilities) return;

                handleInputChange("bookingLocationType", "AT_STORE");
                setIsHomeService(false);
                handleInputChange("actionRadiusKm", null);
              }

              handleInputChange("serviceType", "BOOKING");
              return;
            }

            if (formData.bookingLocationType !== "ONLINE") {
              const confirmed = window.confirm(
                "Désactiver les modes sur place et à domicile pour passer en service instantané ?",
              );
              if (!confirmed) return;

              setIsHomeService(false);
              setUseNewLocation(false);
              handleInputChange("locationId", undefined);
              setNewLocationName("");
              setSelectedNewLocation(null);
              handleInputChange("actionRadiusKm", null);
              handleInputChange("bookingLocationType", "ONLINE");
            }

            handleInputChange("serviceType", "INSTANT");
          }}
          isAtStore={formData.bookingLocationType === "AT_STORE"}
          onAtStoreChange={async (value) => {
            if (value) {
              const hasAvailabilities =
                await ensureAvailabilitiesBeforeLocationActivation();
              if (!hasAvailabilities) return;
            }

            handleInputChange(
              "bookingLocationType",
              value ? "AT_STORE" : "ONLINE",
            );

            if (value) {
              setIsHomeService(false);
              handleInputChange("actionRadiusKm", null);
              handleInputChange("serviceType", "BOOKING");
            } else {
              setUseNewLocation(false);
              handleInputChange("locationId", undefined);
              setNewLocationName("");
              setSelectedNewLocation(null);
              if (!isHomeService) {
                handleInputChange("serviceType", "INSTANT");
              }
            }
          }}
          isHomeService={isHomeService}
          onHomeServiceChange={async (value) => {
            if (value) {
              const hasAvailabilities =
                await ensureAvailabilitiesBeforeLocationActivation();
              if (!hasAvailabilities) return;
            }

            setIsHomeService(value);
            if (value) {
              handleInputChange("bookingLocationType", "AT_CLIENT");
              setUseNewLocation(false);
              handleInputChange("locationId", undefined);
              setNewLocationName("");
              setSelectedNewLocation(null);
              handleInputChange("serviceType", "BOOKING");
            } else {
              handleInputChange("actionRadiusKm", null);
              handleInputChange("bookingLocationType", "ONLINE");
              if (formData.bookingLocationType !== "AT_STORE") {
                handleInputChange("serviceType", "INSTANT");
              }
            }
          }}
          actionRadiusKm={formData.actionRadiusKm ?? null}
          onActionRadiusKmChange={(value) =>
            handleInputChange("actionRadiusKm", value)
          }
          disabled={isSubmitting}
        />

        {formData.bookingLocationType === "AT_STORE" ? (
          <ServiceStoreLocationSection
            isLoadingLocations={isLoadingLocations}
            locations={locations}
            useNewLocation={useNewLocation}
            onToggleUseNewLocation={(value) => {
              setUseNewLocation(value);
              if (value) {
                handleInputChange("locationId", undefined);
              } else {
                setNewLocationName("");
                setSelectedNewLocation(null);
              }
            }}
            selectedLocationId={formData.locationId}
            onSelectLocation={(locationId) =>
              handleInputChange("locationId", locationId)
            }
            newLocationName={newLocationName}
            onChangeNewLocationName={setNewLocationName}
            selectedNewLocation={selectedNewLocation}
            onSelectedNewLocationChange={setSelectedNewLocation}
            disabled={isSubmitting}
          />
        ) : null}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleSubmitWithChecks()}
          className="w-full rounded-full py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          {isSubmitting
            ? "Enregistrement..."
            : serviceId
              ? "Mettre à jour la prestation"
              : "Créer la prestation"}
        </button>
      </div>
    </main>
  );
}
