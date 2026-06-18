import ConversationEmptyState from "@/components/messages/ConversationEmptyState";
import ConversationList from "@/components/messages/ConversationList";
import ConversationPanel from "@/components/messages/ConversationPanel";
import type { Conversation, ConversationListUpdate } from "@/types/conversation";

interface MessagesSplitViewProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onConversationUpdated: (update: ConversationListUpdate) => void;
}

export default function MessagesSplitView({
  conversations,
  isLoading,
  error,
  selectedConversationId = null,
  onSelectConversation,
  onConversationUpdated,
}: MessagesSplitViewProps) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-black/10">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            error={error}
            selectedId={selectedConversationId}
            onSelect={onSelectConversation}
            showTitle
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {selectedConversationId ? (
          <ConversationPanel
            key={selectedConversationId}
            conversationId={selectedConversationId}
            variant="embedded"
            onConversationUpdated={onConversationUpdated}
          />
        ) : (
          <ConversationEmptyState />
        )}
      </div>
    </div>
  );
}
