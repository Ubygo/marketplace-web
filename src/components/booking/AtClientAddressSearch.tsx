"use client";

import MapboxAddressSearch from "@/components/common/MapboxAddressSearch";
import { TEXT_COLOR } from "@/constants/theme";
import type { MapboxFeature } from "@/types/mapbox";

interface AtClientAddressSearchProps {
  selectedAddress: MapboxFeature | null;
  onSelectedAddressChange: (address: MapboxFeature | null) => void;
  bookingNotes: string;
  onBookingNotesChange: (notes: string) => void;
}

export default function AtClientAddressSearch({
  selectedAddress,
  onSelectedAddressChange,
  bookingNotes,
  onBookingNotesChange,
}: AtClientAddressSearchProps) {
  return (
    <section className="flex flex-col gap-4">
      <MapboxAddressSearch
        selectedAddress={selectedAddress}
        onSelectedAddressChange={onSelectedAddressChange}
        label="Adresse d'intervention"
        placeholder="Rechercher une adresse..."
        inputId="booking-address"
        debounceMs={300}
      />

      <div>
        <label
          htmlFor="booking-notes"
          className="mb-2 block text-sm font-semibold"
          style={{ color: TEXT_COLOR }}
        >
          Notes (optionnel)
        </label>
        <textarea
          id="booking-notes"
          value={bookingNotes}
          onChange={(event) => onBookingNotesChange(event.target.value)}
          rows={3}
          placeholder="Informations complémentaires..."
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
        />
      </div>
    </section>
  );
}

export function buildClientLocation(feature: MapboxFeature) {
  const context = feature.context ?? [];
  const findContext = (prefix: string) =>
    context.find((item) => item.id.startsWith(prefix))?.text ?? "";

  const street = feature.address
    ? `${feature.address} ${feature.text}`
    : feature.text;

  return {
    name: feature.text,
    street,
    city: findContext("place"),
    zipcode: findContext("postcode"),
    country: findContext("country"),
    lng: feature.center[0],
    lat: feature.center[1],
  };
}

export type { MapboxFeature };
