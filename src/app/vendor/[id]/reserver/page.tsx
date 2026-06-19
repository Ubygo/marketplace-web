import BookingPage from "@/components/booking/BookingPage";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { fetchServicesByVendorId } from "@/lib/services";
import { fetchVendorById } from "@/lib/vendors";
import { notFound, redirect } from "next/navigation";

interface ReserverPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}

export default async function ReserverPage({
  params,
  searchParams,
}: ReserverPageProps) {
  const { id: vendorId } = await params;
  const { serviceId } = await searchParams;
  const config = await getTenantAppConfig();

  if (!config) {
    notFound();
  }

  if (!serviceId) {
    redirect(`/vendor/${vendorId}`);
  }

  const vendor = await fetchVendorById(config.tenantId, vendorId);

  if (!vendor) {
    notFound();
  }

  const services = await fetchServicesByVendorId(config.tenantId, vendorId);
  const service = services.find((item) => item.id === serviceId);

  if (!service) {
    notFound();
  }

  return <BookingPage vendor={vendor} service={service} />;
}
