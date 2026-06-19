import { buildVendorJsonLd } from "@/lib/seo/metadata";
import type { Vendor } from "@/types/vendor";

interface VendorJsonLdProps {
  vendor: Vendor;
  origin: string;
  categoryName?: string;
}

export default function VendorJsonLd({
  vendor,
  origin,
  categoryName,
}: VendorJsonLdProps) {
  const jsonLd = buildVendorJsonLd(vendor, origin, categoryName);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
