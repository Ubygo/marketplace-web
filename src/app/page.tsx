import MarketplaceHome from "@/components/home/MarketplaceHome";
import { fetchCategories } from "@/lib/categories";
import { fetchVendorCards } from "@/lib/fetch-vendor-cards";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { buildHomeMetadata, getSiteOrigin } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  const origin = await getSiteOrigin();

  if (!config) {
    return {};
  }

  return buildHomeMetadata(config, origin);
}

export default async function Home() {
  const config = await getTenantAppConfig();
  const categories = config ? await fetchCategories(config.tenantId) : [];
  const vendors = config
    ? await fetchVendorCards(config.tenantId, config.currency)
    : [];

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <MarketplaceHome categories={categories} vendors={vendors} />
    </main>
  );
}
