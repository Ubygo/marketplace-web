"use client";

import {
  searchMarketplace,
  type SearchMerchant,
  type SearchService,
} from "@/lib/search";
import { useEffect, useRef, useState } from "react";

export function useMarketplaceSearch(tenantId: string) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [merchantResults, setMerchantResults] = useState<SearchMerchant[]>([]);
  const [serviceResults, setServiceResults] = useState<SearchService[]>([]);
  const latestSearchRequestId = useRef(0);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 600);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const query = debouncedSearchQuery.trim();

    if (!query) {
      setIsSearching(false);
      setSearchError(null);
      setMerchantResults([]);
      setServiceResults([]);
      return;
    }

    const requestId = latestSearchRequestId.current + 1;
    latestSearchRequestId.current = requestId;
    setIsSearching(true);
    setSearchError(null);

    const runSearch = async () => {
      try {
        const response = await searchMarketplace({
          tenantId,
          q: query,
          page: 1,
          limit: 10,
          type: "all",
        });

        if (latestSearchRequestId.current !== requestId) {
          return;
        }

        setMerchantResults(response.merchants?.data ?? []);
        setServiceResults(response.services?.data ?? []);
      } catch (error: unknown) {
        if (latestSearchRequestId.current !== requestId) {
          return;
        }
        setMerchantResults([]);
        setServiceResults([]);
        const message =
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la recherche.";
        setSearchError(message);
      } finally {
        if (latestSearchRequestId.current === requestId) {
          setIsSearching(false);
        }
      }
    };

    runSearch();
  }, [debouncedSearchQuery, tenantId]);

  const trimmedQuery = searchQuery.trim();
  const hasActiveSearch = trimmedQuery.length > 0;
  const hasSearchResults =
    merchantResults.length > 0 || serviceResults.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchError,
    merchantResults,
    serviceResults,
    trimmedQuery,
    hasActiveSearch,
    hasSearchResults,
  };
}
