import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Message, MessageResponse } from "@/types/conversation";

export interface SendMessageBody {
  content: string;
  messageType: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
}

export async function getMessages(
  slug: string,
  tenantId: string,
  conversationId: string,
  page = 1,
  limit = 50,
): Promise<MessageResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les messages.");
  }

  return res.json();
}

export async function sendMessage(
  slug: string,
  tenantId: string,
  conversationId: string,
  body: SendMessageBody,
): Promise<Message> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error("Impossible d'envoyer le message.");
  }

  const payload = await res.json();
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Message }).data;
  }

  return payload as Message;
}

export async function markMessageAsRead(
  slug: string,
  tenantId: string,
  conversationId: string,
  messageId: string,
): Promise<void> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/${conversationId}/messages/${messageId}/read`,
    { method: "PUT" },
  );

  if (!res.ok && res.status !== 204) {
    throw new Error("Impossible de marquer le message comme lu.");
  }
}
