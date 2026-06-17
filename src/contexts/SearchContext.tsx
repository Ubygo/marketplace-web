"use client";

import { useMarketplaceSearch } from "@/hooks/useMarketplaceSearch";
import type { SearchMerchant, SearchService } from "@/lib/search";
import { createContext, useContext, type ReactNode } from "react";

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchError: string | null;
  merchantResults: SearchMerchant[];
  serviceResults: SearchService[];
  trimmedQuery: string;
  hasActiveSearch: boolean;
  hasSearchResults: boolean;
}

const SearchContext = createContext<SearchContextValue | null>(null);

interface SearchProviderProps {
  tenantId: string;
  children: ReactNode;
}

export function SearchProvider({ tenantId, children }: SearchProviderProps) {
  const search = useMarketplaceSearch(tenantId);

  return (
    <SearchContext.Provider value={search}>{children}</SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }

  return context;
}
