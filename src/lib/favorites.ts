import { getAccessToken } from "@/lib/auth-session";

export interface FavoriteApiItem {
  id: string;
  userId: string;
  vendorId: string;
  createdAt: string;
  updatedAt: string;
}

async function favoritesFetch(
  slug: string,
  path: string,
  tenantId: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken(slug);

  if (!token) {
    throw new Error("Non authentifié.");
  }

  return fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tenant-Id": tenantId,
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
}

export async function getMyFavorites(
  slug: string,
  tenantId: string,
): Promise<FavoriteApiItem[]> {
  const res = await favoritesFetch(slug, "/api/favorites", tenantId);

  if (!res.ok) {
    throw new Error("Impossible de charger les favoris.");
  }

  return res.json();
}

export async function addVendorToFavorites(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<void> {
  const res = await favoritesFetch(slug, "/api/favorites", tenantId, {
    method: "POST",
    body: JSON.stringify({ vendorId }),
  });

  if (!res.ok) {
    throw new Error("Impossible d'ajouter aux favoris.");
  }
}

export async function removeVendorFromFavorites(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<void> {
  const favorites = await getMyFavorites(slug, tenantId);
  const favorite = favorites.find((item) => item.vendorId === vendorId);

  if (!favorite?.id) {
    return;
  }

  const res = await favoritesFetch(
    slug,
    `/api/favorites/${favorite.id}`,
    tenantId,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de retirer des favoris.");
  }
}
