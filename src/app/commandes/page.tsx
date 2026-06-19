import OrdersPage from "@/components/orders/OrdersPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ order?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Mes commandes", config);
}

export default async function CommandesPage({ searchParams }: PageProps) {
  const { order } = await searchParams;

  return (
    <Suspense fallback={null}>
      <OrdersPage initialOrderId={order ?? null} />
    </Suspense>
  );
}
