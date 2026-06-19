import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type {
  CreateLocationRequest,
  Location,
  UpdateLocationRequest,
} from "@/types/location";

function normalizeLocation(payload: unknown): Location {
  if (!payload || typeof payload !== "object") {
    return payload as Location;
  }

  const obj = payload as Record<string, unknown>;
  return (obj.data ?? obj) as Location;
}

function extractLocations(payload: unknown): Location[] {
  if (Array.isArray(payload)) {
    return payload as Location[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as Location[];
    }
  }

  return [];
}

export async function fetchMyLocations(
  slug: string,
  tenantId: string,
): Promise<Location[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/locations");

  if (!res.ok) {
    throw new Error("Impossible de charger vos lieux.");
  }

  const payload = await res.json();
  return extractLocations(payload);
}

export async function createLocation(
  slug: string,
  tenantId: string,
  data: CreateLocationRequest,
): Promise<Location> {
  const res = await authenticatedFetch(slug, tenantId, "/api/locations", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Impossible de créer le lieu.");
  }

  const payload = await res.json();
  return normalizeLocation(payload);
}

export async function updateLocation(
  slug: string,
  tenantId: string,
  locationId: string,
  data: UpdateLocationRequest,
): Promise<Location> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/locations/${locationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour le lieu.");
  }

  const payload = await res.json();
  return normalizeLocation(payload);
}

export async function deleteLocation(
  slug: string,
  tenantId: string,
  locationId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/locations/${locationId}`,
    { method: "DELETE" },
  );

  if (!res.ok) {
    throw new Error("Impossible de supprimer le lieu.");
  }
}
