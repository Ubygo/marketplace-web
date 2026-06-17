import type { Vendor } from "@/types/vendor";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface PaginatedVendorsResponse {
  data?: Vendor[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function extractVendorList(payload: unknown): Vendor[] {
  if (Array.isArray(payload)) {
    return payload as Vendor[];
  }

  if (payload && typeof payload === "object") {
    const record = payload as PaginatedVendorsResponse;
    if (Array.isArray(record.data)) {
      return record.data;
    }
  }

  return [];
}

export async function fetchVendors(
  tenantId: string,
  page = 1,
  limit = 12,
): Promise<Vendor[]> {
  const url = `${API_BASE_URL}/vendors?page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to load vendors (${res.status}): ${body}`);
  }

  const payload = await res.json();
  return extractVendorList(payload).filter(
    (vendor) => vendor.visible !== false && vendor.status === "active",
  );
}
