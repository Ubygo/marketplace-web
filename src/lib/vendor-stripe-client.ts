import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { StripeRequirementsResponse } from "@/types/vendor";

export function extractStripeUrl(response: unknown): string | null {
  if (typeof response === "string" && /^https?:\/\//i.test(response)) {
    return response;
  }

  if (response && typeof response === "object" && "url" in response) {
    const url = (response as { url?: string }).url;
    if (typeof url === "string" && url.length > 0) {
      return url;
    }
  }

  return null;
}

import { PRO_SETTINGS_PAYOUT_URL } from "@/lib/settings-url";

export function getStripeReturnUrl(): string {
  if (typeof window === "undefined") {
    return PRO_SETTINGS_PAYOUT_URL;
  }

  return `${window.location.origin}${PRO_SETTINGS_PAYOUT_URL}`;
}

export async function fetchStripeRequirements(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<StripeRequirementsResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/stripe/requirements`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les informations Stripe.");
  }

  return res.json();
}

export async function createStripeAccountLink(
  slug: string,
  tenantId: string,
  vendorId: string,
  type: "account_onboarding" | "account_update" = "account_onboarding",
): Promise<unknown> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/stripe/account-link`,
    {
      method: "POST",
      body: JSON.stringify({
        returnUrl: getStripeReturnUrl(),
        type,
      }),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible de créer le lien Stripe.");
  }

  return res.json();
}

export async function createStripeLoginLink(
  slug: string,
  tenantId: string,
  vendorId: string,
): Promise<unknown> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/vendors/${vendorId}/stripe/login-link`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible d'ouvrir le dashboard Stripe.");
  }

  return res.json();
}

export async function createStripeResolvedLink(
  slug: string,
  tenantId: string,
  vendorId: string,
  requirements?: StripeRequirementsResponse,
): Promise<unknown> {
  const stripeRequirements =
    requirements ?? (await fetchStripeRequirements(slug, tenantId, vendorId));

  if (stripeRequirements.resolution === "account_onboarding") {
    return createStripeAccountLink(slug, tenantId, vendorId, "account_onboarding");
  }

  if (stripeRequirements.resolution === "account_update") {
    return createStripeAccountLink(slug, tenantId, vendorId, "account_update");
  }

  if (stripeRequirements.resolution === "none") {
    return createStripeLoginLink(slug, tenantId, vendorId);
  }

  throw new Error(
    "Compte Stripe en cours de vérification. Aucune action disponible pour le moment.",
  );
}

export async function openStripeResolvedLink(
  slug: string,
  tenantId: string,
  vendorId: string,
  requirements?: StripeRequirementsResponse,
): Promise<void> {
  const response = await createStripeResolvedLink(
    slug,
    tenantId,
    vendorId,
    requirements,
  );
  const url = extractStripeUrl(response);

  if (!url) {
    throw new Error("Impossible d'ouvrir Stripe.");
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
