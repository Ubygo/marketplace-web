"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import ContentContainer from "@/components/layout/ContentContainer";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import { useSearch } from "@/contexts/SearchContext";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface MobileSearchContextValue {
  mobileSearchOpen: boolean;
  setMobileSearchOpen: (open: boolean) => void;
  toggleMobileSearch: () => void;
}

const MobileSearchContext = createContext<MobileSearchContextValue | null>(null);

function useMobileSearch() {
  const context = useContext(MobileSearchContext);

  if (!context) {
    throw new Error("useMobileSearch must be used within MobileSearchProvider");
  }

  return context;
}

export function MobileSearchProvider({ children }: { children: ReactNode }) {
  const { searchQuery, setSearchQuery } = useSearch();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  function toggleMobileSearch() {
    if (mobileSearchOpen && !searchQuery) {
      setMobileSearchOpen(false);
      return;
    }

    if (mobileSearchOpen && searchQuery) {
      setSearchQuery("");
      setMobileSearchOpen(false);
      return;
    }

    setMobileSearchOpen(true);
  }

  return (
    <MobileSearchContext.Provider
      value={{ mobileSearchOpen, setMobileSearchOpen, toggleMobileSearch }}
    >
      {children}
    </MobileSearchContext.Provider>
  );
}

function SearchInput({
  className,
  autoFocus,
}: {
  className?: string;
  autoFocus?: boolean;
}) {
  const { searchQuery, setSearchQuery } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div
      className={`flex h-11 w-full items-center gap-3 rounded-full bg-white px-4 shadow-sm ring-1 ring-black/5 ${className ?? ""}`}
    >
      <CategoryIcon
        icon="Ionicons/search"
        size={20}
        color={SECONDARY_TEXT_COLOR}
      />
      <input
        ref={inputRef}
        type="search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder="Rechercher"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#B4B6B0]"
        style={{ color: TEXT_COLOR }}
      />
      {searchQuery.length > 0 ? (
        <button
          type="button"
          aria-label="Effacer la recherche"
          onClick={() => setSearchQuery("")}
          className="shrink-0"
        >
          <CategoryIcon
            icon="Ionicons/close-circle"
            size={20}
            color={SECONDARY_TEXT_COLOR}
          />
        </button>
      ) : null}
    </div>
  );
}

export function HeaderSearchDesktop() {
  return (
    <SearchInput className="hidden w-[288px] max-w-[288px] shrink-0 md:flex" />
  );
}

export function HeaderSearchMobileButton() {
  const { mobileSearchOpen, toggleMobileSearch } = useMobileSearch();

  return (
    <button
      type="button"
      aria-label="Rechercher"
      aria-expanded={mobileSearchOpen}
      onClick={toggleMobileSearch}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white md:hidden"
    >
      <CategoryIcon icon="Ionicons/search" size={22} color={TEXT_COLOR} />
    </button>
  );
}

export function HeaderSearchMobilePanel() {
  const { mobileSearchOpen } = useMobileSearch();

  if (!mobileSearchOpen) {
    return null;
  }

  return (
    <div className="border-t border-black/5 py-3 md:hidden">
      <ContentContainer>
        <SearchInput autoFocus />
      </ContentContainer>
    </div>
  );
}
