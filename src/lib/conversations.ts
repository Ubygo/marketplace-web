import { authenticatedFetch } from "@/lib/authenticated-fetch";
import type { Conversation, ConversationsResponse } from "@/types/conversation";

export async function getUserConversations(
  slug: string,
  tenantId: string,
  userId: string,
  page = 1,
  limit = 100,
): Promise<ConversationsResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/user/${userId}?page=${page}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les conversations.");
  }

  return res.json();
}

export async function getVendorConversations(
  slug: string,
  tenantId: string,
  vendorId: string,
  page = 1,
  limit = 100,
): Promise<ConversationsResponse> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/vendor/${vendorId}?page=${page}&limit=${limit}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger les conversations.");
  }

  return res.json();
}

export async function getConversationById(
  slug: string,
  tenantId: string,
  conversationId: string,
): Promise<Conversation> {
  const res = await authenticatedFetch(
    slug,
    tenantId,
    `/api/conversations/${conversationId}`,
  );

  if (!res.ok) {
    throw new Error("Impossible de charger la conversation.");
  }

  const payload = await res.json();
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Conversation }).data;
  }

  return payload as Conversation;
}

export async function createConversation(
  slug: string,
  tenantId: string,
  params: { vendorId?: string; userId?: string },
): Promise<Conversation> {
  const res = await authenticatedFetch(slug, tenantId, "/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error("Impossible de créer la conversation.");
  }

  const payload = await res.json();
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Conversation }).data;
  }

  return payload as Conversation;
}
