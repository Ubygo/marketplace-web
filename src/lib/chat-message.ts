import type { Message } from "@/types/conversation";

function isMessageShape(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Boolean(record.id || record.content);
}

function unwrapMessagePayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const candidates = [record.message, record.data, record];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const nested = candidate as Record<string, unknown>;

    if (nested.message && typeof nested.message === "object") {
      const inner = nested.message as Record<string, unknown>;
      if (isMessageShape(inner)) {
        return inner;
      }
    }

    if (isMessageShape(nested)) {
      return nested;
    }
  }

  return isMessageShape(record) ? record : null;
}

function normalizeSender(
  message: Record<string, unknown>,
): Message["sender"] | null {
  const senderSource = (message.sender ?? message.user) as
    | Record<string, unknown>
    | undefined;

  if (senderSource?.id) {
    return {
      id: String(senderSource.id),
      firstName: String(
        senderSource.firstName ?? senderSource.first_name ?? "",
      ),
      lastName: String(senderSource.lastName ?? senderSource.last_name ?? ""),
      photoUrl: String(
        senderSource.photoUrl ?? senderSource.photo_url ?? "",
      ),
    };
  }

  const senderId =
    message.senderId ??
    message.sender_id ??
    message.userId ??
    message.user_id;

  if (!senderId) {
    return null;
  }

  return {
    id: String(senderId),
    firstName: String(
      message.senderFirstName ?? message.sender_first_name ?? "",
    ),
    lastName: String(message.senderLastName ?? message.sender_last_name ?? ""),
    photoUrl: String(message.senderPhotoUrl ?? message.sender_photo_url ?? ""),
  };
}

export function getConversationIdFromMessage(raw: unknown): string | null {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const topLevelId = record.conversationId ?? record.conversation_id;
    if (topLevelId) {
      return String(topLevelId);
    }
  }

  const message = unwrapMessagePayload(raw);
  if (!message) {
    return null;
  }

  const conversationId = message.conversationId ?? message.conversation_id;
  return conversationId ? String(conversationId) : null;
}

export function normalizeIncomingMessage(raw: unknown): Message | null {
  const message = unwrapMessagePayload(raw);
  const messageId = message?.id;
  const messageContent = message?.content;

  if (!message || messageId == null || messageContent == null) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Message socket invalide:", raw);
    }
    return null;
  }

  const normalizedSender = normalizeSender(message);
  if (!normalizedSender?.id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Message socket sans expéditeur:", raw);
    }
    return null;
  }

  return {
    id: String(messageId),
    content: String(messageContent),
    messageType:
      (message.messageType as Message["messageType"]) ??
      (message.message_type as Message["messageType"]) ??
      "TEXT",
    mediaUrl: (message.mediaUrl ?? message.media_url) as string | undefined,
    thumbnailUrl: (message.thumbnailUrl ?? message.thumbnail_url) as
      | string
      | undefined,
    fileSize: (message.fileSize ?? message.file_size) as number | undefined,
    isRead: Boolean(message.isRead ?? message.is_read),
    createdAt: String(
      message.createdAt ?? message.created_at ?? new Date().toISOString(),
    ),
    sender: normalizedSender,
  };
}
