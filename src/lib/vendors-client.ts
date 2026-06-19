import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Service } from "@/types/service";
import type { Vendor } from "@/types/vendor";

export async function fetchPublicVendorById(
  tenantId: string,
  vendorId: string,
): Promise<Vendor | null> {
  const res = await fetch(`/api/public/vendors/${vendorId}`, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Impossible de charger le prestataire.");
  }

  const payload = await res.json();
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Vendor }).data;
  }

  return payload as Vendor;
}

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
