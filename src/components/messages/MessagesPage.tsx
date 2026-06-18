"use client";

import ConversationRow from "@/components/messages/ConversationRow";
import ConversationRowSkeleton from "@/components/messages/ConversationRowSkeleton";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { buildLoginUrl } from "@/lib/auth-url";
import { getUserConversations } from "@/lib/conversations";
import type { Conversation } from "@/types/conversation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function MessagesPage() {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/messages"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserConversations(slug, tenantId, user.id);
      setConversations(response.data ?? []);
    } catch {
      setError("Impossible de charger vos messages.");
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    void loadConversations();
  }, [isAuthenticated, loadConversations, user?.id]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const showSkeleton = isAuthLoading || isLoading;

  return (
    <main>
      <ContentContainer className="max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-black">Messages</h1>

        {showSkeleton ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <ConversationRowSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : conversations.length === 0 ? (
          <p className="py-10 text-center text-sm text-black/60">
            Aucune conversation pour le moment.
          </p>
        ) : (
          <div>
            {conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
              />
            ))}
          </div>
        )}
      </ContentContainer>
    </main>
  );
}
