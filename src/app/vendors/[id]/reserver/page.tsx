import { redirect } from "next/navigation";

interface LegacyReserverPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ serviceId?: string }>;
}

export default async function LegacyReserverPage({
  params,
  searchParams,
}: LegacyReserverPageProps) {
  const { id: vendorId } = await params;
  const { serviceId } = await searchParams;

  if (!serviceId) {
    redirect(`/vendor/${vendorId}`);
  }

  redirect(
    `/vendor/${vendorId}?serviceId=${encodeURIComponent(serviceId)}&book=1`,
  );
}
