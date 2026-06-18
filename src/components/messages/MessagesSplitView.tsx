import ConversationEmptyState from "@/components/messages/ConversationEmptyState";
import ConversationList from "@/components/messages/ConversationList";
import ConversationPanel from "@/components/messages/ConversationPanel";
import type { ChatSocketApi } from "@/hooks/useChatSocket";
import type { Conversation, ConversationListUpdate } from "@/types/conversation";

interface MessagesSplitViewProps {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  selectedConversationId?: string | null;
  chatSocket: ChatSocketApi;
  socketConnected: boolean;
  onSelectConversation: (id: string) => void;
  onConversationUpdated: (update: ConversationListUpdate) => void;
}

export default function MessagesSplitView({
  conversations,
  isLoading,
  error,
  selectedConversationId = null,
  chatSocket,
  socketConnected,
  onSelectConversation,
  onConversationUpdated,
}: MessagesSplitViewProps) {
  return (
    <div className="flex h-full max-h-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <aside className="flex min-h-0 w-[300px] shrink-0 flex-col border-r border-black/10">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {selectedConversationId ? (
          <ConversationPanel
            key={selectedConversationId}
            conversationId={selectedConversationId}
            chatSocket={chatSocket}
            socketConnected={socketConnected}
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
