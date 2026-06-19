"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import type { MapboxFeature } from "@/types/mapbox";
import { useCallback, useEffect, useRef, useState } from "react";

interface MapboxAddressSearchProps {
  selectedAddress: MapboxFeature | null;
  onSelectedAddressChange: (address: MapboxFeature | null) => void;
  label?: string;
  placeholder?: string;
  inputId?: string;
  debounceMs?: number;
}

export default function MapboxAddressSearch({
  selectedAddress,
  onSelectedAddressChange,
  label = "Adresse",
  placeholder = "Rechercher une adresse...",
  inputId = "mapbox-address-search",
  debounceMs = 500,
}: MapboxAddressSearchProps) {
  const { mapboxPublicToken } = useTenant();
  const [addressQuery, setAddressQuery] = useState(
    selectedAddress?.place_name ?? "",
  );
  const [addressResults, setAddressResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const activeSearchRef = useRef<AbortController | null>(null);
  const latestSearchId = useRef(0);

  useEffect(() => {
    setAddressQuery(selectedAddress?.place_name ?? "");
  }, [selectedAddress]);

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
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [addressQuery, debounceMs, searchAddresses, selectedAddress]);

  useEffect(() => {
    return () => {
      activeSearchRef.current?.abort();
    };
  }, []);

  function handleQueryChange(value: string) {
    if (selectedAddress && value.trim() !== selectedAddress.place_name) {
      onSelectedAddressChange(null);
    }
    setAddressQuery(value);
  }

  function handleSelect(feature: MapboxFeature) {
    onSelectedAddressChange(feature);
    setAddressQuery(feature.place_name);
    setAddressResults([]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-black">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        value={addressQuery}
        onChange={(event) => handleQueryChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25"
      />
      {isSearching ? (
        <p className="text-xs text-black/50">Recherche...</p>
      ) : null}
      {!mapboxPublicToken ? (
        <p className="text-xs text-red-600">
          La recherche d&apos;adresse n&apos;est pas disponible.
        </p>
      ) : null}
      {addressResults.length > 0 && !selectedAddress ? (
        <ul className="overflow-hidden rounded-xl border border-black/10 bg-white">
          {addressResults.map((feature) => (
            <li key={feature.id} className="border-b border-black/5 last:border-b-0">
              <button
                type="button"
                onClick={() => handleSelect(feature)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50"
              >
                <CategoryIcon
                  icon="Ionicons/location-outline"
                  size={18}
                  color={TEXT_COLOR}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-black">
                    {feature.text}
                  </span>
                  <span className="block truncate text-black/60">
                    {feature.place_name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {selectedAddress ? (
        <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
          <div className="flex items-center gap-2">
            <CategoryIcon
              icon="Ionicons/checkmark-circle"
              size={20}
              color={TEXT_COLOR}
            />
            <p className="text-sm font-semibold text-black">
              Adresse sélectionnée
            </p>
          </div>
          <p className="mt-2 text-sm text-black/60">{selectedAddress.place_name}</p>
        </div>
      ) : null}
    </div>
  );
}
