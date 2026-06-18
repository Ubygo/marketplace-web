import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Category } from "@/types/category";

interface ApiCategory {
  id: string;
  name: string;
  displayedName?: Record<string, string> | string | null;
  icon?: string | null;
  active?: boolean;
}

function resolveDisplayName(
  displayedName: ApiCategory["displayedName"],
  fallback: string,
): string {
  if (!displayedName) return fallback;
  if (typeof displayedName === "string") return displayedName;

  const values = Object.values(displayedName).filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );
  return values[0] ?? fallback;
}

function extractCategoryList(payload: unknown): ApiCategory[] {
  if (Array.isArray(payload)) {
    return payload as ApiCategory[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["data", "items", "categories", "results"]) {
      const value = record[key];
      if (Array.isArray(value)) {
        return value as ApiCategory[];
      }
    }
  }

  return [];
}

function mapCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    name: category.name,
    displayName: resolveDisplayName(category.displayedName, category.name),
    icon: category.icon ?? "Ionicons/apps-outline",
  };
}

export async function fetchCategoriesClient(
  slug: string,
  tenantId: string,
): Promise<Category[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/categories");

  if (!res.ok) {
    throw new Error("Impossible de charger les catégories.");
  }

  const payload = await res.json();
  return extractCategoryList(payload)
    .filter((category) => category.active !== false)
    .map(mapCategory);
}
