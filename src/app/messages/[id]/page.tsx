import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/messages?conversation=${id}`);
}
