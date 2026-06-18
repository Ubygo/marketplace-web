import type { Conversation } from "@/types/conversation";
import Image from "next/image";
import Link from "next/link";

interface ConversationRowProps {
  conversation: Conversation;
}

function formatConversationDate(date: string): string {
  const messageDate = new Date(date);
  if (Number.isNaN(messageDate.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );

  const dayDifference = Math.floor(
    (today.getTime() - messageDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference === 0) {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(messageDate);
  }

  if (dayDifference === 1) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(messageDate);
}

export default function ConversationRow({ conversation }: ConversationRowProps) {
  const avatar = conversation.interlocutor?.images?.[0];
  const unreadCount = Number(conversation.unreadCount) || 0;

  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="flex items-center gap-4 border-b border-black/5 py-4 transition-colors hover:bg-black/[0.02]"
    >
      {avatar ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          <Image
            src={avatar}
            alt={conversation.interlocutor.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-full bg-neutral-200" />
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="truncate text-base font-semibold text-black">
            {conversation.interlocutor.name}
          </p>
          <span className="shrink-0 text-xs text-black/50">
            {formatConversationDate(conversation.lastMessageDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="line-clamp-2 flex-1 text-sm text-black/60">
            {conversation.lastMessage?.content || "Aucun message"}
          </p>
          {unreadCount > 0 ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
