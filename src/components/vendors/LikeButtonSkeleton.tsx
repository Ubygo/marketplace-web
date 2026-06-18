export default function LikeButtonSkeleton() {
  return (
    <div
      aria-hidden
      className="absolute right-3 top-3 z-10 h-9 w-9 animate-pulse rounded-full bg-neutral-200 ring-1 ring-black/5"
    />
  );
}
