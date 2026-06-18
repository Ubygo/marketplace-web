import ConversationPage from "@/components/messages/ConversationPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ConversationPage conversationId={id} />;
}
