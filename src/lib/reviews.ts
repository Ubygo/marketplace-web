import type { Review } from "@/types/review";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

interface FetchVendorReviewsParams {
  tenantId: string;
  vendorId: string;
}

async function parseReviewsResponse(res: Response): Promise<Review[]> {
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "Impossible de charger les avis.");
  }

  return res.json();
}

export async function fetchVendorReviews({
  tenantId,
  vendorId,
}: FetchVendorReviewsParams): Promise<Review[]> {
  const isBrowser = typeof window !== "undefined";
  const url = isBrowser
    ? `/api/reviews/vendor/${vendorId}`
    : `${API_BASE_URL}/reviews/vendor/${vendorId}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Tenant-Id": tenantId,
    },
  });

  return parseReviewsResponse(res);
}
