"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import VendorGrid from "@/components/vendors/VendorGrid";
import VendorSortSelect from "@/components/vendors/VendorSortSelect";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import {
  sortVendorCards,
  type VendorSortOption,
} from "@/lib/sort-vendors";
import type { Category } from "@/types/category";
import type { VendorCardData } from "@/types/vendor";
import { useMemo, useState } from "react";

const ALL_CATEGORIES_ID = "all";

interface MarketplaceHomeProps {
  categories: Category[];
  vendors: VendorCardData[];
}

export default function MarketplaceHome({
  categories,
  vendors,
}: MarketplaceHomeProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string>(ALL_CATEGORIES_ID);
  const [sort, setSort] = useState<VendorSortOption>("rating");

  const filteredVendors = useMemo(() => {
    if (selectedCategoryId === ALL_CATEGORIES_ID) {
      return vendors;
    }

    return vendors.filter(
      (vendor) => vendor.categoryId === selectedCategoryId,
    );
  }, [vendors, selectedCategoryId]);

  const sortedVendors = useMemo(
    () => sortVendorCards(filteredVendors, sort),
    [filteredVendors, sort],
  );

  return (
    <>
      {categories.length > 0 || vendors.length > 0 ? (
        <section className="pt-4 pb-4">
          {categories.length > 0 ? (
            <h2
              className="mb-3 text-[10px] font-bold tracking-[0.18em]"
              style={{ color: SECONDARY_TEXT_COLOR }}
            >
              BROWSE THE MARKETPLACE
            </h2>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            {categories.length > 0 ? (
              <div className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <CategoryPill
                  label="All"
                  selected={selectedCategoryId === ALL_CATEGORIES_ID}
                  onClick={() => setSelectedCategoryId(ALL_CATEGORIES_ID)}
                />

                {categories.map((category) => (
                  <CategoryPill
                    key={category.id}
                    label={category.displayName}
                    icon={category.icon ?? "Ionicons/apps-outline"}
                    selected={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <VendorSortSelect
              value={sort}
              onChange={setSort}
              className="self-end sm:self-auto"
            />
          </div>
        </section>
      ) : null}

      <VendorGrid vendors={sortedVendors} />
    </>
  );
}

interface CategoryPillProps {
  label: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}

function CategoryPill({ label, icon, selected, onClick }: CategoryPillProps) {
  const textColor = selected ? "#FFFFFF" : SECONDARY_TEXT_COLOR;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 sm:py-2.5"
      style={{
        backgroundColor: selected ? TEXT_COLOR : "#FFFFFF",
        color: textColor,
      }}
    >
      {icon ? <CategoryIcon icon={icon} size={16} color={textColor} /> : null}
      {label}
    </button>
  );
}
