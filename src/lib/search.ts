const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface SearchMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchMerchant {
  id: string;
  name: string;
  description?: string;
  visible: boolean;
  status: "active" | "inactive";
  averageRating?: number;
  reviewCount?: number;
  vendorImages?: { id: string; url: string; order: number }[];
}

export interface SearchService {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  serviceType: string;
  duration: number;
  durationMetric: string;
  vendorId: string;
  serviceImages?: { id: string; url: string; order: number }[];
  vendor?: {
    id: string;
    name: string;
  };
}

export interface SearchResponse {
  merchants?: {
    data: SearchMerchant[];
    meta: SearchMeta;
  };
  services?: {
    data: SearchService[];
    meta: SearchMeta;
  };
}

interface SearchParams {
  tenantId: string;
  q: string;
  page?: number;
  limit?: number;
  type?: "all" | "merchants" | "services";
  categoryId?: string;
}

function buildSearchParams({
  q,
  page = 1,
  limit = 10,
  type = "all",
  categoryId,
}: Omit<SearchParams, "tenantId">): URLSearchParams {
  const searchParams = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
    type,
    ...(categoryId && { categoryId }),
  });

  return searchParams;
}

async function parseSearchResponse(res: Response): Promise<SearchResponse> {
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "La recherche a échoué.");
  }

  return res.json();
}

export async function searchMarketplace({
  tenantId,
  q,
  page = 1,
  limit = 10,
  type = "all",
  categoryId,
}: SearchParams): Promise<SearchResponse> {
  const searchParams = buildSearchParams({ q, page, limit, type, categoryId });
  const isBrowser = typeof window !== "undefined";
  const url = isBrowser
    ? `/api/search?${searchParams.toString()}`
    : `${API_BASE_URL}/search?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
  });

  return parseSearchResponse(res);
}
