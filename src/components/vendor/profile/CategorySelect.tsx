"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import type { Category } from "@/types/category";

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  disabled = false,
  isLoading = false,
}: CategorySelectProps) {
  const selected = categories.find((category) => category.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="vendor-category" className="text-sm font-medium text-black">
        Catégorie
      </label>
      <div className="relative">
        {selected ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2">
            <CategoryIcon icon={selected.icon} size={18} color={TEXT_COLOR} />
          </span>
        ) : null}
        <select
          id="vendor-category"
          value={value}
          disabled={disabled || isLoading}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border border-black/10 bg-white py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:cursor-not-allowed disabled:opacity-60 ${
            selected ? "pl-10 pr-4" : "px-4"
          }`}
        >
          <option value="">
            {isLoading ? "Chargement..." : "Sélectionner une catégorie"}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
