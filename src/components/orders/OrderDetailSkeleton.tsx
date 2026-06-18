export default function OrderDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-3 h-4 w-20 animate-pulse rounded-full bg-neutral-200" />
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-neutral-200" />
          <div className="min-w-0 flex-1">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-200" />
          </div>
          <div className="h-4 w-14 animate-pulse rounded-full bg-neutral-200" />
        </div>
      </section>

      <section>
        <div className="mb-3 h-4 w-24 animate-pulse rounded-full bg-neutral-200" />
        <div className="space-y-3">
          <div className="flex justify-between gap-4">
            <div className="h-4 w-20 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-4 w-28 animate-pulse rounded-full bg-neutral-200" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-4 w-16 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-200" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-black/[0.03] p-4">
        <div className="mb-3 h-4 w-20 animate-pulse rounded-full bg-neutral-200" />
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-neutral-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-3 w-full animate-pulse rounded-full bg-neutral-200" />
          </div>
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-neutral-200" />
        </div>
      </section>
    </div>
  );
}
