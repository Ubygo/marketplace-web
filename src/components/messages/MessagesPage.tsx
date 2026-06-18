"use client";

import ConversationList from "@/components/messages/ConversationList";
import ConversationPanel from "@/components/messages/ConversationPanel";
import MessagesSplitView from "@/components/messages/MessagesSplitView";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useUnreadMessages } from "@/contexts/UnreadMessagesContext";
import { useVendor } from "@/contexts/VendorContext";
import { buildLoginUrl } from "@/lib/auth-url";
import {
  getUserConversations,
  getVendorConversations,
} from "@/lib/conversations";
import type {
  Conversation,
  ConversationListUpdate,
} from "@/types/conversation";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type MessagesMode = "customer" | "vendor";

interface MessagesPageProps {
  mode?: MessagesMode;
  initialConversationId?: string | null;
}

export default function MessagesPage({
  mode = "customer",
  initialConversationId = null,
}: MessagesPageProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { vendor, hasVendor, isLoading: isVendorLoading } = useVendor();
  const { setHasUnreadMessages } = useUnreadMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(initialConversationId);

  const basePath = mode === "vendor" ? "/pro/messages" : "/messages";

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const redirectPath = selectedConversationId
        ? `${basePath}?conversation=${selectedConversationId}`
        : basePath;
      router.replace(buildLoginUrl(redirectPath));
    }
  }, [
    basePath,
    isAuthenticated,
    isAuthLoading,
    router,
    selectedConversationId,
  ]);

  useEffect(() => {
    if (
      mode === "vendor" &&
      !isAuthLoading &&
      isAuthenticated &&
      !isVendorLoading &&
      !hasVendor
    ) {
      router.replace("/");
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isVendorLoading,
    mode,
    router,
  ]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "vendor") {
        if (!vendor?.id) {
          setConversations([]);
          return;
        }

        const response = await getVendorConversations(
          slug,
          tenantId,
          vendor.id,
        );
        setConversations(response.data ?? []);
        return;
      }

      if (!user?.id) return;

      const response = await getUserConversations(slug, tenantId, user.id);
      setConversations(response.data ?? []);
    } catch {
      setError("Impossible de charger vos messages.");
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [mode, slug, tenantId, user?.id, vendor?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (mode === "vendor" && (!vendor?.id || isVendorLoading)) return;
    if (mode === "customer" && !user?.id) return;
    void loadConversations();
  }, [
    isAuthenticated,
    isVendorLoading,
    loadConversations,
    mode,
    user?.id,
    vendor?.id,
  ]);

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

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      window.history.replaceState(
        null,
        "",
        `${basePath}?conversation=${conversationId}`,
      );
    },
    [basePath],
  );

  const handleDeselectConversation = useCallback(() => {
    setSelectedConversationId(null);
    window.history.replaceState(null, "", basePath);
  }, [basePath]);

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  if (
    mode === "vendor" &&
    !isAuthLoading &&
    isAuthenticated &&
    !isVendorLoading &&
    !hasVendor
  ) {
    return null;
  }

  const showSkeleton =
    isAuthLoading || isLoading || (mode === "vendor" && isVendorLoading);

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
