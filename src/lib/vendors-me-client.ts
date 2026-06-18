import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Order } from "@/types/order";
import type {
  OnboardingStepsResponse,
  Vendor,
  VendorStats,
  VendorStatsPeriod,
} from "@/types/vendor";

function normalizeVendor(payload: unknown): Vendor {
  if (!payload || typeof payload !== "object") {
    return payload as Vendor;
  }

  const obj = payload as Record<string, unknown>;
  const nested = (obj.data ?? obj.vendor ?? obj) as Vendor;
  return nested;
}

function normalizeVendorStats(payload: unknown): VendorStats {
  if (!payload || typeof payload !== "object") {
    return payload as VendorStats;
  }

  const obj = payload as Record<string, unknown>;
  const data = (obj.data ?? obj) as Record<string, unknown>;

  const topServicesRaw = Array.isArray(data.topServices) ? data.topServices : [];

  return {
    orderCount: Number(
      data.orderCount ?? data.ordersCount ?? data.totalOrders ?? 0,
    ),
    cancelledOrders: Number(data.cancelledOrders ?? 0),
    revenue: Number(data.revenue ?? data.totalRevenue ?? 0),
    currency: typeof data.currency === "string" ? data.currency : undefined,
    period:
      data.period && typeof data.period === "object"
        ? (data.period as VendorStats["period"])
        : undefined,
    topServices: topServicesRaw.map((item) => {
      const service = item as Record<string, unknown>;
      return {
        serviceId:
          typeof service.serviceId === "string" ? service.serviceId : undefined,
        name: String(service.name ?? service.serviceName ?? ""),
        orderCount: Number(service.orderCount ?? service.ordersCount ?? 0),
        revenue: Number(service.revenue ?? 0),
      };
    }),
  };
}

function extractOrders(payload: unknown): Order[] {
  if (Array.isArray(payload)) {
    return payload as Order[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as Order[];
    }
  }

  return [];
}

export async function fetchMyVendor(
  slug: string,
  tenantId: string,
): Promise<Vendor | null> {
  const res = await authenticatedFetch(slug, tenantId, "/api/vendors/me");

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Impossible de charger le profil prestataire.");
  }

  const payload = await res.json();
  return normalizeVendor(payload);
}

export async function fetchOnboardingSteps(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<OnboardingStepsResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/onboarding-steps`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les étapes d'onboarding.");
  }

  return res.json();
}

export type FetchVendorStatsParams =
  | { period: Exclude<VendorStatsPeriod, "custom"> }
  | { period: "custom"; startDate: string; endDate: string };

export async function fetchVendorStats(
  slug: string,
  tenantId: string,
  vendorId: string,
  params: FetchVendorStatsParams,
): Promise<VendorStats> {
  const query = new URLSearchParams({ period: params.period });

  if (params.period === "custom") {
    query.set("startDate", params.startDate);
    query.set("endDate", params.endDate);
  }

  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/stats?${query.toString()}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les statistiques.");
  }

  const payload = await res.json();
  return normalizeVendorStats(payload);
}

export async function fetchVendorOrders(
  slug: string,
  tenantId: string,
): Promise<Order[]> {
  const res = await authenticatedFetch(slug, tenantId, "/api/orders/vendor");

  if (!res.ok) {
    throw new Error("Impossible de charger les commandes.");
  }

  const payload = await res.json();
  return extractOrders(payload);
}

export async function updateMyVendor(
  slug: string,
  tenantId: string,
  vendorId: string,
  data: Partial<Pick<Vendor, "visible">>,
): Promise<Vendor> {
  const res = await authenticatedFetch(slug, tenantId, `/api/vendors/${vendorId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Impossible de mettre à jour le profil prestataire.");
  }

  const payload = await res.json();
  return normalizeVendor(payload);
}
