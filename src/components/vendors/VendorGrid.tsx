import VendorCard from "@/components/vendors/VendorCard";
import type { VendorCardData } from "@/types/vendor";

interface VendorGridProps {
  vendors: VendorCardData[];
}

export default function VendorGrid({ vendors }: VendorGridProps) {
  if (vendors.length === 0) {
    return null;
  }

  return (
    <section className="pb-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {vendors.map((vendor) => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </section>
  );
}
