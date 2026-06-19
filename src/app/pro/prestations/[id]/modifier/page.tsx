import VendorServiceForm from "@/components/vendor/services/VendorServiceForm";

interface ProEditPrestationPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProEditPrestationPage({
  params,
}: ProEditPrestationPageProps) {
  const { id } = await params;
  return <VendorServiceForm serviceId={id} />;
}
