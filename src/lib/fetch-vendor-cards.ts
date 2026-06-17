import { fetchServicesByVendorId } from "@/lib/services";
import { fetchVendors } from "@/lib/vendors";
import { mapVendorToCardData } from "@/lib/vendor-display";
import type { VendorCardData } from "@/types/vendor";

export async function fetchVendorCards(
  tenantId: string,
  currency = "EUR",
): Promise<VendorCardData[]> {
  const vendors = await fetchVendors(tenantId, 1, 12);

  const cards = await Promise.all(
    vendors.map(async (vendor) => {
      const services = await fetchServicesByVendorId(tenantId, vendor.id);
      return mapVendorToCardData(vendor, services, currency);
    }),
  );

  return cards;
}
