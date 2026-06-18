"use client";

import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { getAccessToken } from "@/lib/auth-session";
import { buildLoginUrl } from "@/lib/auth-url";
import {
  initChatSocket,
  joinConversation,
  leaveConversation,
  onMessageRead,
  onNewMessage,
  onUserTyping,
  typing,
} from "@/lib/chat-socket";
import { getConversationById } from "@/lib/conversations";
import {
  getMessages,
  markMessageAsRead,
  sendMessage,
} from "@/lib/messages";
import type { Conversation, Message } from "@/types/conversation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface ConversationPageProps {
  conversationId: string;
}

function normalizeIncomingMessage(message: Record<string, unknown>): Message | null {
  if (!message.id || !message.content) {
    return null;
  }

  const sender = message.sender as Message["sender"] | undefined;

  return {
    id: String(message.id),
    content: String(message.content),
    messageType: (message.messageType as Message["messageType"]) || "TEXT",
    mediaUrl: message.mediaUrl as string | undefined,
    thumbnailUrl: message.thumbnailUrl as string | undefined,
    fileSize: message.fileSize as number | undefined,
    isRead: Boolean(message.isRead),
    createdAt: String(message.createdAt || new Date().toISOString()),
    sender: sender ?? {
      id: String(message.senderId || ""),
      firstName: String(message.senderFirstName || ""),
      lastName: String(message.senderLastName || ""),
      photoUrl: String(message.senderPhotoUrl || ""),
    },
  };
}

export default function ConversationPage({ conversationId }: ConversationPageProps) {
  const router = useRouter();
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl(`/messages/${conversationId}`));
    }
  }, [conversationId, isAuthenticated, isAuthLoading, router]);

  const markUnreadMessagesAsRead = useCallback(
    async (items: Message[]) => {
      if (!user) return;

      const unreadMessages = items.filter(
        (message) => !message.isRead && message.sender.id !== user.id,
      );

      await Promise.all(
        unreadMessages.map((message) =>
          markMessageAsRead(slug, tenantId, conversationId, message.id).catch(
            () => undefined,
          ),
        ),
      );

      if (unreadMessages.length > 0) {
        setMessages((current) =>
          current.map((message) =>
            unreadMessages.some((unread) => unread.id === message.id)
              ? { ...message, isRead: true }
              : message,
          ),
        );
      }
    },
    [conversationId, slug, tenantId, user],
  );

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [conversationData, messagesData] = await Promise.all([
        getConversationById(slug, tenantId, conversationId),
        getMessages(slug, tenantId, conversationId),
      ]);

      setConversation(conversationData);
      setMessages(messagesData.data ?? []);
      await markUnreadMessagesAsRead(messagesData.data ?? []);
    } catch {
      setError("Impossible de charger la conversation.");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, markUnreadMessagesAsRead, slug, tenantId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void loadConversation();
  }, [isAuthenticated, loadConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const token = getAccessToken(slug);
    if (!token || !isAuthenticated) return;

    const socket = initChatSocket(token);
    if (!socket) return;

    const handleConnect = () => {
      joinConversation(conversationId);
    };

    if (socket.connected) {
      joinConversation(conversationId);
    } else {
      socket.on("connect", handleConnect);
    }

    const unsubscribeNewMessage = onNewMessage((rawMessage) => {
      const message = normalizeIncomingMessage(
        rawMessage as Record<string, unknown>,
      );
      if (!message) return;

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });

      if (user && message.sender.id !== user.id) {
        void markMessageAsRead(slug, tenantId, conversationId, message.id);
      }
    });

    const unsubscribeTyping = onUserTyping((data) => {
      if (data.conversationId !== conversationId || data.userId === user?.id) {
        return;
      }
      setIsTyping(data.isTyping);
    });

    const unsubscribeRead = onMessageRead((data) => {
      if (data.conversationId !== conversationId) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === data.messageId
            ? { ...message, isRead: true }
            : message,
        ),
      );
    });

    return () => {
      socket.off("connect", handleConnect);
      leaveConversation(conversationId);
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeRead();
    };
  }, [conversationId, isAuthenticated, slug, tenantId, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setDraft("");
    typing(conversationId, false);

    try {
      const message = await sendMessage(slug, tenantId, conversationId, {
        content,
        messageType: "TEXT",
      });

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    } catch {
      setDraft(content);
      setError("Impossible d'envoyer le message.");
    } finally {
      setIsSending(false);
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typing(conversationId, true);
    typingTimeoutRef.current = setTimeout(() => {
      typing(conversationId, false);
    }, 1000);
  }

  if (!isAuthLoading && !isAuthenticated) {
    return null;
  }

  const avatar = conversation?.interlocutor?.images?.[0];
  const showSkeleton = isAuthLoading || isLoading;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col py-4 md:py-6">
      <ContentContainer className="flex max-w-2xl flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3 border-b border-black/10 pb-4">
          <Link
            href="/messages"
            className="text-sm font-medium text-black/70 hover:text-black"
          >
            ← Messages
          </Link>
          <div className="ml-auto flex items-center gap-3">
            {avatar ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-neutral-200">
                <Image
                  src={avatar}
                  alt={conversation?.interlocutor.name ?? "Contact"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : showSkeleton ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200" />
            ) : null}
            <p className="font-semibold text-black">
              {conversation?.interlocutor.name ?? "Conversation"}
            </p>
          </div>
        </div>

        {showSkeleton ? (
          <div className="flex flex-1 flex-col gap-3 pb-4">
            <div className="flex justify-start">
              <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-end">
              <div className="h-12 w-1/2 animate-pulse rounded-2xl bg-neutral-200" />
            </div>
            <div className="flex justify-start">
              <div className="h-12 w-3/5 animate-pulse rounded-2xl bg-neutral-200" />
            </div>
          </div>
        ) : error && !conversation ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {messages.map((message) => {
                const isMine = message.sender.id === user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        isMine
                          ? "bg-black text-white"
                          : "bg-black/5 text-black"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}
              {isTyping ? (
                <p className="text-xs text-black/50">En train d&apos;écrire...</p>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-black/10 pt-4">
              <input
                type="text"
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-black/30"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Envoyer
              </button>
            </form>
          </>
        )}
      </ContentContainer>
    </main>
  );
}
