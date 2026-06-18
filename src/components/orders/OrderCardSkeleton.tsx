export default function OrderCardSkeleton() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4">
      <div className="flex gap-3">
        <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-neutral-200" />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-neutral-200" />
          </div>
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
