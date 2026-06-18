import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Vendor } from "@/types/vendor";
import type { Service } from "@/types/service";

export async function fetchVendorByIdClient(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<Vendor | null> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}`,
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Impossible de charger le prestataire.");
  }

  return res.json() as Promise<Vendor>;
}

export async function fetchServicesByVendorIdClient(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<Service[]> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/services`,
  );

  if (!res.ok) {
    return [];
  }

  const payload = await res.json();
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as Service[];
    }
  }

  return [];
}
