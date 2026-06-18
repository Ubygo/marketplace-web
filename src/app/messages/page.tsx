import MessagesPage from "@/components/messages/MessagesPage";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ conversation?: string }>;
}

export default async function MessagesRoutePage({ searchParams }: PageProps) {
  const { conversation } = await searchParams;

  return (
    <Suspense fallback={null}>
      <MessagesPage initialConversationId={conversation ?? null} />
    </Suspense>
  );
}
