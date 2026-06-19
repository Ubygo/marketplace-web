import ProShell from "@/components/vendor/ProShell";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Espace pro", config);
}

export default function ProLayout({ children }: { children: ReactNode }) {
  return <ProShell>{children}</ProShell>;
}
