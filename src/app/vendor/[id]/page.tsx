import VendorDetail from "@/components/vendors/VendorDetail";
import VendorJsonLd from "@/components/vendors/VendorJsonLd";
import { fetchCategories } from "@/lib/categories";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import {
  buildVendorMetadata,
  getSiteOrigin,
} from "@/lib/seo/metadata";
import { fetchServicesByVendorId } from "@/lib/services";
import { fetchVendorById } from "@/lib/vendors";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface VendorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string; book?: string }>;
}

export async function generateMetadata({
  params,
}: VendorPageProps): Promise<Metadata> {
  const { id } = await params;
  const config = await getTenantAppConfig();

  if (!config) {
    return {};
  }

  const [vendor, origin, categories] = await Promise.all([
    fetchVendorById(config.tenantId, id),
    getSiteOrigin(),
    fetchCategories(config.tenantId),
  ]);

  if (!vendor) {
    return {};
  }

  const categoryName = categories.find(
    (category) => category.id === vendor.categoryId,
  )?.name;

  return buildVendorMetadata(vendor, config, origin, categoryName);
}

export default async function VendorPage({ params, searchParams }: VendorPageProps) {
  const { id } = await params;
  const { serviceId, book } = await searchParams;
  const config = await getTenantAppConfig();

  if (!config) {
    notFound();
  }

  const origin = await getSiteOrigin();
  const vendor = await fetchVendorById(config.tenantId, id);

  if (!vendor) {
    notFound();
  }

  const [services, categories] = await Promise.all([
    fetchServicesByVendorId(config.tenantId, id),
    fetchCategories(config.tenantId),
  ]);

  const categoryName = categories.find(
    (category) => category.id === vendor.categoryId,
  )?.name;

  return (
    <>
      <VendorJsonLd
        vendor={vendor}
        origin={origin}
        categoryName={categoryName}
      />
      <VendorDetail
        vendor={vendor}
        services={services}
        categories={categories}
        currency={config.currency}
        tenantId={config.tenantId}
        initialServiceId={serviceId}
        initialBookMode={book === "1"}
      />
    </>
  );
}
