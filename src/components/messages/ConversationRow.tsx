import type { Conversation } from "@/types/conversation";
import Image from "next/image";

interface ConversationRowProps {
  conversation: Conversation;
  isSelected?: boolean;
  onSelect: (id: string) => void;
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

export default function ConversationRow({
  conversation,
  isSelected = false,
  onSelect,
}: ConversationRowProps) {
  const interlocutor = conversation.interlocutor;
  const avatar =
    interlocutor?.avatar ??
    interlocutor?.images?.[0] ??
    interlocutor?.photoUrl;
  const unreadCount = Number(conversation.unreadCount) || 0;

  return (
    <button
      type="button"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-center gap-3 border-b border-black/5 px-3 py-2.5 text-left transition-colors hover:bg-black/[0.02] md:px-4 ${
        isSelected ? "bg-black/[0.04]" : ""
      }`}
    >
      {avatar ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          <Image
            src={avatar}
            alt={conversation.interlocutor.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200" />
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-black">
            {conversation.interlocutor.name}
          </p>
          <span className="shrink-0 text-[11px] text-black/50">
            {formatConversationDate(conversation.lastMessageDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <p className="line-clamp-1 flex-1 text-xs text-black/55">
            {conversation.lastMessage?.content || "Aucun message"}
          </p>
          {unreadCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
