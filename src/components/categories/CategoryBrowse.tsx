"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { SECONDARY_TEXT_COLOR, TEXT_COLOR } from "@/constants/theme";
import type { Category } from "@/types/category";
import { useState } from "react";

const ALL_CATEGORIES_ID = "all";

interface CategoryBrowseProps {
  categories: Category[];
}

export default function CategoryBrowse({ categories }: CategoryBrowseProps) {
  const [selectedId, setSelectedId] = useState<string>(ALL_CATEGORIES_ID);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <h2
        className="mb-5 text-[10px] font-bold tracking-[0.18em]"
        style={{ color: SECONDARY_TEXT_COLOR }}
      >
        BROWSE THE MARKETPLACE
      </h2>

      <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryPill
          label="All"
          selected={selectedId === ALL_CATEGORIES_ID}
          onClick={() => setSelectedId(ALL_CATEGORIES_ID)}
        />

        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            label={category.displayName}
            icon={category.icon ?? "Ionicons/apps-outline"}
            selected={selectedId === category.id}
            onClick={() => setSelectedId(category.id)}
          />
        ))}
      </div>
    </section>
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
      className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
      style={{
        backgroundColor: selected ? TEXT_COLOR : "#FFFFFF",
        color: textColor,
      }}
    >
      {icon ? (
        <CategoryIcon icon={icon} size={16} color={textColor} />
      ) : null}
      {label}
    </button>
  );
}
