"use client";

import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useCallback, useEffect, useRef, useState } from "react";

export interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  context?: Array<{ id: string; text: string }>;
  address?: string;
}

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
  const { mapboxPublicToken } = useTenant();
  const [addressQuery, setAddressQuery] = useState(
    selectedAddress?.place_name ?? "",
  );
  const [addressResults, setAddressResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const activeSearchRef = useRef<AbortController | null>(null);
  const latestSearchId = useRef(0);

  const searchAddresses = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 3 || !mapboxPublicToken) {
        setAddressResults([]);
        return;
      }

      try {
        setIsSearching(true);
        activeSearchRef.current?.abort();
        const controller = new AbortController();
        activeSearchRef.current = controller;
        const searchId = ++latestSearchId.current;

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query,
        )}.json?access_token=${mapboxPublicToken}&limit=5&types=address,poi`;

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();

        if (searchId !== latestSearchId.current) {
          return;
        }

        setAddressResults(Array.isArray(data.features) ? data.features : []);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        setAddressResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [mapboxPublicToken],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!selectedAddress) {
        void searchAddresses(addressQuery);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [addressQuery, searchAddresses, selectedAddress]);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="booking-address"
          className="mb-2 block text-sm font-semibold"
          style={{ color: TEXT_COLOR }}
        >
          Adresse d&apos;intervention
        </label>
        <input
          id="booking-address"
          type="text"
          value={addressQuery}
          onChange={(event) => {
            onSelectedAddressChange(null);
            setAddressQuery(event.target.value);
          }}
          placeholder="Rechercher une adresse..."
          className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
        />
        {isSearching ? (
          <p className="mt-2 text-xs text-black/50">Recherche...</p>
        ) : null}
        {!mapboxPublicToken ? (
          <p className="mt-2 text-xs text-red-600">
            La recherche d&apos;adresse n&apos;est pas disponible.
          </p>
        ) : null}
        {addressResults.length > 0 && !selectedAddress ? (
          <ul className="mt-2 overflow-hidden rounded-xl border border-black/10">
            {addressResults.map((feature) => (
              <li key={feature.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectedAddressChange(feature);
                    setAddressQuery(feature.place_name);
                    setAddressResults([]);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-black/5"
                >
                  {feature.place_name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

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
