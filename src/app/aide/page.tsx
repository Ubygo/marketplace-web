import ContentContainer from "@/components/layout/ContentContainer";
import HelpPage from "@/components/help/HelpPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import {
  buildStaticPageMetadata,
  getSiteOrigin,
  getSiteName,
} from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  const origin = await getSiteOrigin();

  if (!config) {
    return {};
  }

  const siteName = getSiteName(config);

  return buildStaticPageMetadata(
    "Centre d'aide",
    `Questions fréquentes pour les clients et les professionnels sur ${siteName}.`,
    config,
    "/aide",
    origin,
  );
}

export default function AidePage() {
  return (
    <main>
      <ContentContainer className="max-w-3xl">
        <HelpPage />
      </ContentContainer>
    </main>
  );
}
