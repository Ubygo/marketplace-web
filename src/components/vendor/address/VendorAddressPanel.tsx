"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import VendorLocationCard from "@/components/vendor/address/VendorLocationCard";
import VendorLocationForm from "@/components/vendor/address/VendorLocationForm";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import {
  deleteLocation,
  fetchMyLocations,
} from "@/lib/locations-client";
import type { Location } from "@/types/location";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface VendorAddressPanelProps {
  showTitle?: boolean;
}

export default function VendorAddressPanel({
  showTitle = true,
}: VendorAddressPanelProps) {
  const { slug, tenantId } = useTenant();
  const { refreshVendor } = useVendor();

  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyLocations(slug, tenantId);
      setLocations(data);
    } catch {
      toast.error("Impossible de charger vos lieux.");
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId]);

  useEffect(() => {
    void loadLocations();
  }, [loadLocations]);

  function handleAddLocation() {
    setLocationToEdit(null);
    setIsFormOpen(true);
  }

  function handleEditLocation(location: Location) {
    setLocationToEdit(location);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setLocationToEdit(null);
  }

  async function handleFormSuccess() {
    handleCloseForm();
    await loadLocations();
    await refreshVendor();
  }

  async function handleConfirmDelete() {
    if (!locationToDelete) return;

    setIsDeleting(true);

    try {
      await deleteLocation(slug, tenantId, locationToDelete.id);
      setLocationToDelete(null);
      toast.success("Lieu supprimé.");
      await loadLocations();
      await refreshVendor();
    } catch {
      toast.error("Impossible de supprimer le lieu.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        {showTitle ? (
          <h1 className="text-3xl font-bold text-black">Lieux de service</h1>
        ) : null}

        <SettingsPanelCard className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-black">Vos lieux</p>
              <p className="mt-1 text-sm text-black/60">
                Ajoutez les adresses où vous exercez votre activité.
              </p>
            </div>
            {!isFormOpen ? (
              <button
                type="button"
                onClick={handleAddLocation}
                className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                Ajouter un lieu
              </button>
            ) : null}
          </div>

          {isFormOpen ? (
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 sm:p-5">
              <VendorLocationForm
                locationToEdit={locationToEdit}
                onSuccess={() => void handleFormSuccess()}
                onCancel={handleCloseForm}
              />
            </div>
          ) : null}

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-2xl bg-black/5"
                />
              ))}
            </div>
          ) : locations.length === 0 && !isFormOpen ? (
            <p className="rounded-xl border border-dashed border-black/15 bg-black/[0.02] px-4 py-8 text-center text-sm text-black/60">
              Aucun lieu enregistré pour le moment.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {locations.map((location) => (
                <VendorLocationCard
                  key={location.id}
                  location={location}
                  onEdit={handleEditLocation}
                  onDelete={(locationId) => {
                    const target = locations.find((item) => item.id === locationId);
                    if (target) {
                      setLocationToDelete(target);
                    }
                  }}
                  disabled={isFormOpen || isDeleting}
                />
              ))}
            </div>
          )}
        </SettingsPanelCard>
      </div>

      <ConfirmDialog
        open={Boolean(locationToDelete)}
        title="Supprimer le lieu"
        description="Êtes-vous sûr de vouloir supprimer ce lieu ?"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setLocationToDelete(null)}
      />
    </>
  );
}
