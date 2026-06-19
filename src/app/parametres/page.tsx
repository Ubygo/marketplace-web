import SettingsPage from "@/components/settings/SettingsPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Paramètres", config);
}

export default function ParametresPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
