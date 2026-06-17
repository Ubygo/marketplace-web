import type { Category } from "@/types/category";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

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

export async function fetchCategories(tenantId: string): Promise<Category[]> {
  const url = `${API_BASE_URL}/categories?page=1&limit=100`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to load categories (${res.status}): ${body}`);
  }

  const payload = await res.json();
  return extractCategoryList(payload)
    .filter((category) => category.active !== false)
    .map(mapCategory);
}
