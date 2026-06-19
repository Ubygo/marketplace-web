"use client";

import MapboxAddressSearch from "@/components/common/MapboxAddressSearch";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import {
  createLocation,
  updateLocation,
} from "@/lib/locations-client";
import {
  locationToMapboxFeature,
  parseMapboxFeature,
} from "@/lib/mapbox-address";
import type { Location } from "@/types/location";
import type { MapboxFeature } from "@/types/mapbox";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface VendorLocationFormProps {
  locationToEdit?: Location | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VendorLocationForm({
  locationToEdit,
  onSuccess,
  onCancel,
}: VendorLocationFormProps) {
  const { slug, tenantId } = useTenant();
  const { vendor } = useVendor();
  const isEditMode = Boolean(locationToEdit);

  const [selectedAddress, setSelectedAddress] = useState<MapboxFeature | null>(
    locationToEdit ? locationToMapboxFeature(locationToEdit) : null,
  );
  const [locationName, setLocationName] = useState(locationToEdit?.name ?? "");
  const [nameError, setNameError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (locationToEdit) {
      setSelectedAddress(locationToMapboxFeature(locationToEdit));
      setLocationName(locationToEdit.name ?? "");
    } else {
      setSelectedAddress(null);
      setLocationName("");
    }
    setNameError(false);
  }, [locationToEdit]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedAddress) {
      toast.error("Veuillez sélectionner une adresse.");
      return;
    }

    const trimmedName = locationName.trim();
    if (!trimmedName) {
      setNameError(true);
      return;
    }

    if (!vendor?.id) {
      toast.error("Profil prestataire introuvable.");
      return;
    }

    const parsed = parseMapboxFeature(selectedAddress);
    if (!parsed) {
      toast.error(
        "Coordonnées invalides pour cette adresse. Veuillez en choisir une autre.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        street: parsed.street,
        city: parsed.city,
        country: parsed.country,
        zipcode: parsed.zipcode || undefined,
        lat: parsed.lat,
        lng: parsed.lng,
        vendorId: vendor.id,
        ownerType: "vendor" as const,
      };

      if (isEditMode && locationToEdit?.id) {
        await updateLocation(slug, tenantId, locationToEdit.id, payload);
        toast.success("Lieu mis à jour.");
      } else {
        await createLocation(slug, tenantId, payload);
        toast.success("Lieu créé.");
      }

      onSuccess();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : `Impossible de ${isEditMode ? "mettre à jour" : "créer"} le lieu.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-black">
          {isEditMode ? "Modifier le lieu" : "Ajouter un lieu"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-2 text-black/60 transition-colors hover:bg-black/5 hover:text-black"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      <MapboxAddressSearch
        selectedAddress={selectedAddress}
        onSelectedAddressChange={setSelectedAddress}
        placeholder="Rechercher une adresse..."
      />

      {selectedAddress ? (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="location-name"
            className="text-sm font-medium text-black"
          >
            Nom du lieu
          </label>
          <input
            id="location-name"
            type="text"
            value={locationName}
            disabled={isSubmitting}
            onChange={(event) => {
              setLocationName(event.target.value);
              if (nameError) {
                setNameError(false);
              }
            }}
            placeholder="Nom du lieu"
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60 ${
              nameError ? "border-red-500" : "border-black/10"
            }`}
          />
          {nameError ? (
            <p className="text-sm text-red-600">
              Veuillez saisir un nom pour ce lieu.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!selectedAddress || isSubmitting}
          className="inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          {isSubmitting
            ? "Enregistrement..."
            : isEditMode
              ? "Mettre à jour le lieu"
              : "Créer le lieu"}
        </button>
      </div>
    </form>
  );
}
