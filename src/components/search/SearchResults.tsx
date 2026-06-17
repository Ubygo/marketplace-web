"use client";

import { formatPrice } from "@/lib/format-price";
import SearchResultRow from "@/components/search/SearchResultRow";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import { useSearch } from "@/contexts/SearchContext";
import type { SearchMerchant, SearchService } from "@/lib/search";

export default function SearchResults() {
  const {
    isSearching,
    searchError,
    merchantResults,
    serviceResults,
    hasSearchResults,
  } = useSearch();

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: TEXT_COLOR, borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: SECONDARY_TEXT_COLOR }}>
          Recherche en cours...
        </p>
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-center text-sm" style={{ color: SECONDARY_TEXT_COLOR }}>
          {searchError}
        </p>
      </div>
    );
  }

  if (!hasSearchResults) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-center text-sm" style={{ color: SECONDARY_TEXT_COLOR }}>
          Aucun résultat
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {merchantResults.length > 0 ? (
        <section className="mb-5">
          <h2
            className="mb-3 text-base font-semibold"
            style={{ color: TEXT_COLOR }}
          >
            Prestataires
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {merchantResults.map((merchant) => (
              <MerchantResultRow key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </section>
      ) : null}

      {serviceResults.length > 0 ? (
        <section>
          <h2
            className="mb-3 text-base font-semibold"
            style={{ color: TEXT_COLOR }}
          >
            Services
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {serviceResults.map((service) => (
              <ServiceResultRow key={service.id} service={service} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MerchantResultRow({ merchant }: { merchant: SearchMerchant }) {
  return (
    <SearchResultRow
      title={merchant.name}
      subtitle={merchant.description?.trim() || undefined}
      imageUrl={merchant.vendorImages?.[0]?.url}
      href={`/vendors/${merchant.id}`}
    />
  );
}

function ServiceResultRow({ service }: { service: SearchService }) {
  return (
    <SearchResultRow
      title={service.name}
      subtitle={formatPrice(service.price, service.currency)}
      imageUrl={service.serviceImages?.[0]?.url}
      href={`/vendors/${service.vendorId}?serviceId=${service.id}`}
    />
  );
}
