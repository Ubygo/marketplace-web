import FavoritesPage from "@/components/favorites/FavoritesPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Mes favoris", config);
}

export default function FavorisPage() {
  return <FavoritesPage />;
}
