"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import TypingIndicator from "@/components/messages/TypingIndicator";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import type { ChatSocketApi } from "@/hooks/useChatSocket";
import {
  getConversationIdFromMessage,
  normalizeIncomingMessage,
} from "@/lib/chat-message";
import { isSocketConnected } from "@/lib/chat-socket";
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
  chatSocket: ChatSocketApi;
  socketConnected: boolean;
  onBack?: () => void;
  variant?: "embedded" | "fullscreen";
  onConversationUpdated?: (update: ConversationListUpdate) => void;
}

function getSenderName(sender: Message["sender"]): string {
  return [sender.firstName, sender.lastName].filter(Boolean).join(" ").trim() || "Contact";
}

export default function ConversationPanel({
  conversationId,
  chatSocket,
  socketConnected,
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
  const isTypingEmitRef = useRef(false);
  const hideTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationIdRef = useRef(conversationId);
  const userRef = useRef(user);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  conversationIdRef.current = conversationId;
  userRef.current = user;
  onConversationUpdatedRef.current = onConversationUpdated;

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
    if (!container || (messages.length === 0 && !isTyping)) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: shouldSmoothScrollRef.current ? "smooth" : "auto",
    });
    shouldSmoothScrollRef.current = true;
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isAuthenticated || !socketConnected) return;

    const socket = chatSocket.getSocket();
    if (!socket) return;

    const unsubscribeNewMessage = chatSocket.onNewMessage((rawMessage) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[chat] new_message raw:", rawMessage);
      }

      const activeConversationId = conversationIdRef.current;
      const messageConversationId = getConversationIdFromMessage(rawMessage);
      if (
        messageConversationId &&
        messageConversationId !== activeConversationId
      ) {
        return;
      }

      const message = normalizeIncomingMessage(rawMessage);
      if (!message) return;

      const currentUser = userRef.current;

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        if (currentUser && message.sender.id === currentUser.id) {
          const tempIndex = current.findIndex(
            (item) =>
              item.id.startsWith("temp-") &&
              item.content === message.content &&
              item.sender.id === currentUser.id,
          );

          if (tempIndex !== -1) {
            const updated = [...current];
            updated[tempIndex] = message;
            return updated;
          }
        }

        return [...current, message];
      });

      if (currentUser && message.sender.id !== currentUser.id) {
        void markMessageAsRead(
          slug,
          tenantId,
          activeConversationId,
          message.id,
        ).then(() =>
          onConversationUpdatedRef.current?.({
            conversationId: activeConversationId,
            lastMessage: { content: message.content },
            clearUnread: true,
          }),
        );
      } else {
        onConversationUpdatedRef.current?.({
          conversationId: activeConversationId,
          lastMessage: { content: message.content },
        });
      }
    });

    const unsubscribeTyping = chatSocket.onUserTyping((data) => {
      if (data.userId === userRef.current?.id) {
        return;
      }

      const activeConversationId = conversationIdRef.current;
      const eventConversationId = String(
        data.conversationId ??
          (data as { conversation_id?: string }).conversation_id ??
          "",
      );
      if (eventConversationId && eventConversationId !== activeConversationId) {
        return;
      }

      if (hideTypingTimeoutRef.current) {
        clearTimeout(hideTypingTimeoutRef.current);
        hideTypingTimeoutRef.current = null;
      }

      if (data.isTyping) {
        setIsTyping(true);
        return;
      }

      hideTypingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        hideTypingTimeoutRef.current = null;
      }, 2500);
    });

    const unsubscribeRead = chatSocket.onMessageRead((data) => {
      if (data.conversationId !== conversationIdRef.current) return;
      setMessages((current) =>
        current.map((message) =>
          message.id === data.messageId
            ? { ...message, isRead: true }
            : message,
        ),
      );
    });

    const handleConnect = () => {
      chatSocket.joinConversation(conversationIdRef.current);
    };

    socket.on("connect", handleConnect);
    chatSocket.joinConversation(conversationIdRef.current);

    return () => {
      socket.off("connect", handleConnect);
      chatSocket.leaveConversation(conversationIdRef.current);
      unsubscribeNewMessage();
      unsubscribeTyping();
      unsubscribeRead();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (hideTypingTimeoutRef.current) {
        clearTimeout(hideTypingTimeoutRef.current);
      }
      isTypingEmitRef.current = false;
      setIsTyping(false);
    };
  }, [chatSocket, conversationId, isAuthenticated, slug, socketConnected, tenantId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending || !user) return;

    setIsSending(true);
    setDraft("");
    chatSocket.typing(conversationId, false);
    isTypingEmitRef.current = false;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content,
      messageType: "TEXT",
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photoUrl: user.photoUrl || "",
      },
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      const message = await sendMessage(slug, tenantId, conversationId, {
        content,
        messageType: "TEXT",
      });

      setMessages((current) =>
        current.map((item) => (item.id === tempId ? message : item)),
      );
      onConversationUpdated?.({
        conversationId,
        lastMessage: { content: message.content },
      });

      if (isSocketConnected()) {
        chatSocket.sendMessageViaSocket(conversationId, content);
      }
    } catch {
      setMessages((current) => current.filter((item) => item.id !== tempId));
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

    if (!isSocketConnected()) return;

    if (value.trim().length > 0) {
      if (!isTypingEmitRef.current) {
        chatSocket.typing(conversationId, true);
        isTypingEmitRef.current = true;
      }

      typingTimeoutRef.current = setTimeout(() => {
        chatSocket.typing(conversationId, false);
        isTypingEmitRef.current = false;
      }, 3000);
      return;
    }

    if (isTypingEmitRef.current) {
      chatSocket.typing(conversationId, false);
      isTypingEmitRef.current = false;
    }
  }

  const interlocutor = conversation?.interlocutor;
  const avatar =
    interlocutor?.avatar ??
    interlocutor?.images?.[0] ??
    interlocutor?.photoUrl;
  const interlocutorName = interlocutor?.name ?? "Conversation";
  const showSkeleton = isLoading;
  const lastMessage = messages[messages.length - 1];
  const showTypingAvatar =
    !lastMessage || lastMessage.sender.id !== interlocutor?.id;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
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
        </div>
      </div>

      {showSkeleton ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3 md:px-4">
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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 md:px-4"
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
                      <div className="inline-block max-w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] leading-snug break-words text-black shadow-sm">
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
                      <div className="min-w-0 max-w-full">
                        <p className="mb-0.5 text-[11px] font-medium text-black/55">
                          {getSenderName(message.sender)}
                        </p>
                        <div className="inline-block max-w-full rounded-xl bg-black/5 px-3 py-2 text-[13px] leading-snug break-words text-black">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping ? (
              <TypingIndicator
                userName={interlocutorName}
                userPhotoUrl={avatar}
                showAvatar={showTypingAvatar}
              />
            ) : null}
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
        </div>
      )}
    </div>
  );
}
