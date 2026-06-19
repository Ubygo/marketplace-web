"use client";

import MapboxAddressSearch from "@/components/common/MapboxAddressSearch";
import type { Location } from "@/types/location";
import type { MapboxFeature } from "@/types/mapbox";

interface ServiceStoreLocationSectionProps {
  isLoadingLocations: boolean;
  locations: Location[];
  useNewLocation: boolean;
  onToggleUseNewLocation: (value: boolean) => void;
  selectedLocationId?: string;
  onSelectLocation: (locationId: string) => void;
  newLocationName: string;
  onChangeNewLocationName: (value: string) => void;
  selectedNewLocation: MapboxFeature | null;
  onSelectedNewLocationChange: (address: MapboxFeature | null) => void;
  disabled?: boolean;
}

export default function ServiceStoreLocationSection({
  isLoadingLocations,
  locations,
  useNewLocation,
  onToggleUseNewLocation,
  selectedLocationId,
  onSelectLocation,
  newLocationName,
  onChangeNewLocationName,
  selectedNewLocation,
  onSelectedNewLocationChange,
  disabled = false,
}: ServiceStoreLocationSectionProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-black">
          {useNewLocation ? "Ajouter un lieu" : "Vos lieux"}
        </span>
        <input
          type="checkbox"
          checked={useNewLocation}
          disabled={disabled}
          onChange={(event) => onToggleUseNewLocation(event.target.checked)}
          className="h-5 w-5 rounded accent-[var(--tenant-primary)]"
        />
      </label>

      {!useNewLocation ? (
        <div className="mt-3 flex flex-col gap-2">
          {isLoadingLocations ? (
            <p className="text-sm text-black/50">Chargement des lieux...</p>
          ) : locations.length === 0 ? (
            <p className="text-sm text-black/50">
              Aucun lieu enregistré. Activez « Ajouter un lieu » ou configurez vos
              adresses dans les paramètres.
            </p>
          ) : (
            locations.map((location) => {
              const isSelected = selectedLocationId === location.id;
              const label =
                location.name?.trim() ||
                `${location.street}, ${location.city}${location.zipcode ? ` ${location.zipcode}` : ""}`;

              return (
                <button
                  key={location.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectLocation(location.id)}
                  className={`rounded-xl px-4 py-3 text-left text-sm transition-colors disabled:opacity-60 ${
                    isSelected
                      ? "bg-[var(--tenant-primary)] font-medium text-white"
                      : "bg-white text-black ring-1 ring-black/10 hover:bg-neutral-50"
                  }`}
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-location-name" className="text-sm font-medium text-black">
              Nom du lieu (optionnel)
            </label>
            <input
              id="new-location-name"
              type="text"
              disabled={disabled}
              value={newLocationName}
              onChange={(event) => onChangeNewLocationName(event.target.value)}
              placeholder="Ex. Cabinet principal"
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
            />
          </div>
          <MapboxAddressSearch
            selectedAddress={selectedNewLocation}
            onSelectedAddressChange={onSelectedNewLocationChange}
            label="Adresse"
            placeholder="Rechercher une adresse..."
          />
        </div>
      )}
    </div>
  );
}
