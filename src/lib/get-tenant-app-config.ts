import { TENANT_NOT_FOUND_REDIRECT_URL } from "@/constants/urls";
import { type AppConfig, fetchAppConfig } from "@/lib/app-config";
import { getTenantFromHeaders } from "@/lib/tenant";
import { redirect } from "next/navigation";

export async function getTenantAppConfig(): Promise<AppConfig | null> {
  const slug = await getTenantFromHeaders();
  if (!slug) {
    return null;
  }

  try {
    return await fetchAppConfig(slug);
  } catch {
    redirect(TENANT_NOT_FOUND_REDIRECT_URL);
  }
}
