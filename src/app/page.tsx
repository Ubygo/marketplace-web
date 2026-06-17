import CategoryBrowse from "@/components/categories/CategoryBrowse";
import { fetchCategories } from "@/lib/categories";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";

export default async function Home() {
  const config = await getTenantAppConfig();
  const categories = config ? await fetchCategories(config.tenantId) : [];

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <CategoryBrowse categories={categories} />
    </main>
  );
}
