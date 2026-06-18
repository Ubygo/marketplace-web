import CategoryIcon from "@/components/categories/CategoryIcon";

export default function ConversationEmptyState() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-neutral-50/80 px-4 py-8 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/5">
        <CategoryIcon
          icon="Ionicons/chatbubble-outline"
          size={22}
          color="rgba(0,0,0,0.35)"
        />
      </div>
      <p className="text-sm font-medium text-black">
        Sélectionnez une conversation
      </p>
      <p className="mt-1.5 max-w-xs text-xs text-black/50">
        Choisissez une conversation dans la liste pour afficher les messages.
      </p>
    </div>
  );
}
