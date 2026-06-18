export default function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-black/5 py-4">
      <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-neutral-200" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}
