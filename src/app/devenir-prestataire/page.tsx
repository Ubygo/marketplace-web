import BecomeVendorPage from "@/components/vendor/BecomeVendorPage";
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
    "Devenir prestataire",
    `Rejoignez ${siteName} et proposez vos services en ligne.`,
    config,
    "/devenir-prestataire",
    origin,
  );
}

export default function DevenirPrestatairePage() {
  return <BecomeVendorPage />;
}
