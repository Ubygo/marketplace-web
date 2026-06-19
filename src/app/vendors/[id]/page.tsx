import { redirect } from "next/navigation";

interface LegacyVendorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}

export default async function LegacyVendorPage({
  params,
  searchParams,
}: LegacyVendorPageProps) {
  const { id } = await params;
  const { serviceId } = await searchParams;

  const query = serviceId ? `?serviceId=${encodeURIComponent(serviceId)}` : "";
  redirect(`/vendor/${id}${query}`);
}
