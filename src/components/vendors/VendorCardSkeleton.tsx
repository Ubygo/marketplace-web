export default function VendorCardSkeleton() {
  return (
    <article className="relative">
      <div className="aspect-[3/2] w-full animate-pulse rounded-2xl bg-neutral-200" />

      <div className="flex flex-col gap-3 pt-3">
        <div className="h-4 w-full animate-pulse rounded-full bg-neutral-200" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-neutral-200" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-neutral-200" />
      </div>
    </article>
  );
}
