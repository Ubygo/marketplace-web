import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CommandeDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/commandes?order=${id}`);
}
