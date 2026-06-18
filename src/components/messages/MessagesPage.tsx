"use client";

import ConversationList from "@/components/messages/ConversationList";
import ConversationPanel from "@/components/messages/ConversationPanel";
import MessagesSplitView from "@/components/messages/MessagesSplitView";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { buildLoginUrl } from "@/lib/auth-url";
import { getUserConversations } from "@/lib/conversations";
import type {
  Conversation,
  ConversationListUpdate,
} from "@/types/conversation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface MessagesPageProps {
  initialConversationId?: string | null;
}

export default function MessagesPage({
  initialConversationId = null,
}: MessagesPageProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { setHasUnreadMessages } = useUnreadMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const redirectPath = selectedConversationId
        ? `/messages?conversation=${selectedConversationId}`
        : "/messages";
      router.replace(buildLoginUrl(redirectPath));
    }
  }, [isAuthenticated, isAuthLoading, router, selectedConversationId]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

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

  useEffect(() => {
    setHasUnreadMessages(
      conversations.some((conversation) => Number(conversation.unreadCount) > 0),
    );
  }, [conversations, setHasUnreadMessages]);

  const handleConversationUpdated = useCallback(
    (update: ConversationListUpdate) => {
      setConversations((current) => {
        const next = current.map((conversation) => {
          if (conversation.id !== update.conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            ...(update.lastMessage
              ? {
                  lastMessage: update.lastMessage,
                  lastMessageDate: new Date().toISOString(),
                }
              : {}),
            ...(update.clearUnread ? { unreadCount: 0 } : {}),
          };
        });

        return [...next].sort(
          (a, b) =>
            new Date(b.lastMessageDate).getTime() -
            new Date(a.lastMessageDate).getTime(),
        );
      });
    },
    [],
  );

  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    window.history.replaceState(
      null,
      "",
      `/messages?conversation=${conversationId}`,
    );
  }, []);

  const handleDeselectConversation = useCallback(() => {
    setSelectedConversationId(null);
    window.history.replaceState(null, "", "/messages");
  }, []);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const showSkeleton = isAuthLoading || isLoading;

  return (
    <main>
      <div className="hidden md:block">
        <MessagesSplitView
          conversations={conversations}
          isLoading={showSkeleton}
          error={error}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onConversationUpdated={handleConversationUpdated}
        />
      </div>

      <div className="md:hidden">
        {selectedConversationId ? (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
            <ConversationPanel
              key={selectedConversationId}
              conversationId={selectedConversationId}
              variant="fullscreen"
              onBack={handleDeselectConversation}
              onConversationUpdated={handleConversationUpdated}
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
            <ConversationList
              conversations={conversations}
              isLoading={showSkeleton}
              error={error}
              onSelect={handleSelectConversation}
              showTitle
            />
          </div>
        )}
      </div>
    </main>
  );
}
