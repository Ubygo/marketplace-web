import type { VendorCardData } from "@/types/vendor";

export type VendorSortOption = "rating" | "price" | "alphabetical";

export const VENDOR_SORT_LABELS: Record<VendorSortOption, string> = {
  rating: "Note",
  price: "Prix",
  alphabetical: "Alphabétique",
};

export function sortVendorCards(
  vendors: VendorCardData[],
  sort: VendorSortOption,
): VendorCardData[] {
  const copy = [...vendors];

  switch (sort) {
    case "price":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "alphabetical":
      return copy.sort((a, b) =>
        a.vendorName.localeCompare(b.vendorName, "fr"),
      );
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
  }
}
