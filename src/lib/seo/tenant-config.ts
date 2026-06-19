import type { AppConfig } from "@/lib/app-config";
import { fetchAppConfig } from "@/lib/app-config";
import { getTenantFromHeaders, extractTenantFromHost } from "@/lib/tenant";
import { headers } from "next/headers";

export function getSiteName(config: AppConfig): string {
  const displayName = config.branding.displayName?.trim();
  if (displayName) {
    return displayName;
  }

  const name = config.name?.trim();
  if (name) {
    return name;
  }

  return config.slug;
}

export async function getTenantConfigForFavicon(): Promise<AppConfig | null> {
  const slugFromHeader = await getTenantFromHeaders();

  if (slugFromHeader) {
    try {
      return await fetchAppConfig(slugFromHeader);
    } catch {
      return null;
    }
  }

  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const slugFromHost = extractTenantFromHost(host);

  if (!slugFromHost) {
    return null;
  }

  try {
    return await fetchAppConfig(slugFromHost);
  } catch {
    return null;
  }
}
