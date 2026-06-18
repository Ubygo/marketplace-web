"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { getAccessToken } from "@/lib/auth-session";
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
import type {
  Conversation,
  ConversationListUpdate,
  Message,
} from "@/types/conversation";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface ConversationPanelProps {
  conversationId: string;
  onBack?: () => void;
  variant?: "embedded" | "fullscreen";
  onConversationUpdated?: (update: ConversationListUpdate) => void;
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

function getSenderName(sender: Message["sender"]): string {
  return [sender.firstName, sender.lastName].filter(Boolean).join(" ").trim() || "Contact";
}

export default function ConversationPanel({
  conversationId,
  onBack,
  variant = "embedded",
  onConversationUpdated,
}: ConversationPanelProps) {
  const { slug, tenantId } = useTenant();
  const { user, isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldSmoothScrollRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        onConversationUpdated?.({ conversationId, clearUnread: true });
      }
    },
    [conversationId, onConversationUpdated, slug, tenantId, user],
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
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldSmoothScrollRef.current ? "smooth" : "auto",
    });
    shouldSmoothScrollRef.current = true;
  }, [messages]);

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
        void markMessageAsRead(slug, tenantId, conversationId, message.id).then(
          () =>
            onConversationUpdated?.({
              conversationId,
              lastMessage: { content: message.content },
              clearUnread: true,
            }),
        );
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
  }, [conversationId, isAuthenticated, onConversationUpdated, slug, tenantId, user]);

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
      onConversationUpdated?.({
        conversationId,
        lastMessage: { content: message.content },
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

  const interlocutor = conversation?.interlocutor;
  const avatar =
    interlocutor?.avatar ??
    interlocutor?.images?.[0] ??
    interlocutor?.photoUrl;
  const interlocutorName = interlocutor?.name ?? "Conversation";
  const showSkeleton = isLoading;
  const isFullscreen = variant === "fullscreen";

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col bg-white ${
        isFullscreen ? "h-full min-h-[calc(100vh-12rem)]" : "h-full"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2.5 border-b border-black/10 px-3 py-2.5 md:px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour aux messages"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/5 hover:text-black"
          >
            <CategoryIcon icon="Ionicons/arrow-back" size={18} color="currentColor" />
          </button>
        ) : null}

        {avatar ? (
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-200">
            <Image
              src={avatar}
              alt={interlocutorName}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : showSkeleton ? (
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-neutral-200" />
        ) : (
          <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-black">{interlocutorName}</p>
          {isTyping ? (
            <p className="text-[11px] text-emerald-600">
              {interlocutorName} est en train d&apos;écrire...
            </p>
          ) : null}
        </div>
      </div>

      {showSkeleton ? (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3 md:px-4">
          <div className="flex justify-start">
            <div className="h-9 w-2/3 animate-pulse rounded-xl bg-neutral-200" />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-1/2 animate-pulse rounded-xl bg-neutral-200" />
          </div>
          <div className="flex justify-start">
            <div className="h-9 w-3/5 animate-pulse rounded-xl bg-neutral-200" />
          </div>
        </div>
      ) : error && !conversation ? (
        <p className="px-3 py-4 text-xs text-red-600 md:px-4">{error}</p>
      ) : (
        <>
          <div
            ref={messagesContainerRef}
            className="flex-1 space-y-2.5 overflow-y-auto px-3 py-3 md:px-4"
          >
            {messages.map((message) => {
              const isMine = message.sender.id === user?.id;
              const senderPhoto =
                message.sender.photoUrl ||
                interlocutor?.avatar ||
                interlocutor?.images?.[0] ||
                interlocutor?.photoUrl ||
                "";

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {isMine ? (
                    <div className="flex max-w-[75%] flex-col items-end">
                      <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] leading-snug text-black shadow-sm">
                        {message.content}
                      </div>
                      {message.isRead ? (
                        <span className="mt-0.5 flex items-center text-emerald-500">
                          <CategoryIcon
                            icon="Ionicons/checkmark-done"
                            size={12}
                            color="currentColor"
                          />
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex max-w-[75%] gap-1.5">
                      {senderPhoto ? (
                        <div className="relative mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                          <Image
                            src={senderPhoto}
                            alt={getSenderName(message.sender)}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                      ) : (
                        <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-neutral-200" />
                      )}
                      <div className="min-w-0">
                        <p className="mb-0.5 text-[11px] font-medium text-black/55">
                          {getSenderName(message.sender)}
                        </p>
                        <div className="rounded-xl bg-black/5 px-3 py-2 text-[13px] leading-snug text-black">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 gap-2 border-t border-black/10 px-3 py-2.5 md:px-4"
          >
            <input
              type="text"
              value={draft}
              onChange={(event) => handleDraftChange(event.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-[13px] outline-none focus:border-black/30"
            />
            <button
              type="submit"
              disabled={isSending || !draft.trim()}
              className="rounded-xl bg-black px-3.5 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              Envoyer
            </button>
          </form>
        </>
      )}
    </div>
  );
}
