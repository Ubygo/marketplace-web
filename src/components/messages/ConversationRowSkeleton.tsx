export default function ConversationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 px-3 py-2.5 md:px-4">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-3 w-1/3 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}
