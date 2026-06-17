import { TENANT_NOT_FOUND_REDIRECT_URL } from "@/constants/urls";
import { type AppConfig, fetchAppConfig } from "@/lib/app-config";
import { getTenantFromHeaders } from "@/lib/tenant";
import { cache } from "react";
import { redirect } from "next/navigation";

export const getTenantAppConfig = cache(async (): Promise<AppConfig | null> => {
  const slug = await getTenantFromHeaders();
  if (!slug) {
    return null;
  }

  try {
    return await fetchAppConfig(slug);
  } catch {
    redirect(TENANT_NOT_FOUND_REDIRECT_URL);
  }
});
