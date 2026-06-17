"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import {
  SECONDARY_TEXT_COLOR,
  TEXT_COLOR,
} from "@/constants/theme";
import {
  VENDOR_SORT_LABELS,
  type VendorSortOption,
} from "@/lib/sort-vendors";
import { useEffect, useRef, useState } from "react";

interface VendorSortSelectProps {
  value: VendorSortOption;
  onChange: (value: VendorSortOption) => void;
  className?: string;
}

const SORT_OPTIONS: VendorSortOption[] = ["rating", "price", "alphabetical"];

export default function VendorSortSelect({
  value,
  onChange,
  className = "",
}: VendorSortSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm whitespace-nowrap"
      >
        <span style={{ color: SECONDARY_TEXT_COLOR }}>Trier :</span>
        <span className="font-medium text-black">
          {VENDOR_SORT_LABELS[value]}
        </span>
        <CategoryIcon
          icon="Ionicons/chevron-down"
          size={14}
          color={TEXT_COLOR}
        />
      </button>

      {open ? (
        <ul className="absolute right-0 z-10 mt-2 min-w-full overflow-hidden rounded-2xl bg-white py-1 shadow-md">
          {SORT_OPTIONS.map((option) => (
            <li key={option}>
              <button
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-100"
                style={{
                  color: option === value ? TEXT_COLOR : SECONDARY_TEXT_COLOR,
                  fontWeight: option === value ? 600 : 400,
                }}
              >
                {VENDOR_SORT_LABELS[option]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
