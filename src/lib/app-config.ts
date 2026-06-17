export interface TenantWelcomeScreen {
  headline?: string;
  buttonColor?: string;
  topImageUrl?: string | null;
  headlineColor?: string;
  shadowEnabled?: boolean;
  backgroundImageUrl?: string | null;
}

export interface TenantBranding {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  displayName: string;
  welcomeScreen?: TenantWelcomeScreen;
}

export interface TenantFeatures {
  serviceType: "APPOINTMENT" | "SERVICE_ORDER" | "BOTH";
  deliveryMode?: "IN_PERSON" | "ONLINE" | "BOTH";
  monetization: "COMMISSION" | "SUBSCRIPTION" | "BOTH";
  commissionRate?: number;
  subscriptionPrice?: number;
}

export interface AppConfig {
  tenantId: string;
  slug: string;
  name: string;
  branding: TenantBranding;
  locale: string;
  currency: string;
  features: TenantFeatures | null;
  stripePublishableKey: string | null;
  mapboxPublicToken: string | null;
  supportEmail: string | null;
  privacyPolicyUrl: string | null;
  cgvUrl: string | null;
  homeLayout?: unknown[];
  payoutMode?: string;
  payoutFrequency?: string | null;
  escrowEnabled?: boolean;
  copyOverrides?: Record<string, unknown>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";

export async function fetchAppConfig(slug: string): Promise<AppConfig> {
  const url = `${API_BASE_URL}/public/app-config?slug=${encodeURIComponent(slug)}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to load app config (${res.status}): ${body}`);
  }

  return (await res.json()) as AppConfig;
}
