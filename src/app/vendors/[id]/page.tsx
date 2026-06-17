import VendorDetail from "@/components/vendors/VendorDetail";
import { fetchCategories } from "@/lib/categories";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { fetchServicesByVendorId } from "@/lib/services";
import { fetchVendorById } from "@/lib/vendors";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface VendorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { id } = await params;
  const config = await getTenantAppConfig();

  if (!config) {
    return {};
  }

  const vendor = await fetchVendorById(config.tenantId, id);

  if (!vendor) {
    return {};
  }

  return {
    title: vendor.name,
    description: vendor.description ?? undefined,
  };
}

export default async function VendorPage({ params, searchParams }: VendorPageProps) {
  const { id } = await params;
  const { serviceId } = await searchParams;
  const config = await getTenantAppConfig();

  if (!config) {
    notFound();
  }

  const vendor = await fetchVendorById(config.tenantId, id);

  if (!vendor) {
    notFound();
  }

  const [services, categories] = await Promise.all([
    fetchServicesByVendorId(config.tenantId, id),
    fetchCategories(config.tenantId),
  ]);

  return (
    <VendorDetail
      vendor={vendor}
      services={services}
      categories={categories}
      currency={config.currency}
      tenantId={config.tenantId}
      initialServiceId={serviceId}
    />
  );
}
