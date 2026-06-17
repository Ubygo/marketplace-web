import type { Service } from "@/types/service";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface PaginatedServicesResponse {
  data?: Service[];
}

export async function fetchServicesByVendorId(
  tenantId: string,
  vendorId: string,
  page = 1,
  limit = 100,
): Promise<Service[]> {
  const url = `${API_BASE_URL}/services/vendor/${vendorId}?page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to load services (${res.status}): ${body}`);
  }

  const payload = (await res.json()) as PaginatedServicesResponse | Service[];
  const services = Array.isArray(payload) ? payload : (payload.data ?? []);

  return services.filter((service) => service.visible !== false);
}
