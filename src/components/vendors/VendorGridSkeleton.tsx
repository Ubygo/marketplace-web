import VendorCardSkeleton from "@/components/vendors/VendorCardSkeleton";

interface VendorGridSkeletonProps {
  count?: number;
}

export default function VendorGridSkeleton({
  count = 8,
}: VendorGridSkeletonProps) {
  return (
    <section className="pb-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <VendorCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
