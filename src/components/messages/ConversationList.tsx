import ConversationRow from "@/components/messages/ConversationRow";
import ConversationRowSkeleton from "@/components/messages/ConversationRowSkeleton";
import type { Conversation } from "@/types/conversation";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  showTitle?: boolean;
}

export default function ConversationList({
  conversations,
  isLoading,
  error,
  selectedId = null,
  onSelect,
  showTitle = false,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div>
        {showTitle ? (
          <h1 className="border-b border-black/10 px-3 py-2.5 text-lg font-semibold text-black md:px-4">
            Messages
          </h1>
        ) : null}
        {Array.from({ length: 5 }).map((_, index) => (
          <ConversationRowSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showTitle ? (
          <h1 className="border-b border-black/10 px-3 py-2.5 text-lg font-semibold text-black md:px-4">
            Messages
          </h1>
        ) : null}
        <p className="px-3 py-4 text-xs text-red-600 md:px-4">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div>
        {showTitle ? (
          <h1 className="border-b border-black/10 px-3 py-2.5 text-lg font-semibold text-black md:px-4">
            Messages
          </h1>
        ) : null}
        <p className="px-3 py-8 text-center text-xs text-black/60 md:px-4">
          Aucune conversation pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      {showTitle ? (
        <h1 className="border-b border-black/10 px-3 py-2.5 text-lg font-semibold text-black md:px-4">
          Messages
        </h1>
      ) : null}
      <div>
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
