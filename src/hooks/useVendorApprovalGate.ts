import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useMemo } from "react";

export interface VendorApprovalGate {
  requiresApproval: boolean;
  isApproved: boolean;
  isPendingApproval: boolean;
}

export function useVendorApprovalGate(): VendorApprovalGate {
  const { features } = useTenant();
  const { vendor, hasVendor } = useVendor();

  return useMemo(() => {
    const requiresApproval = features?.requireProviderApproval === true;
    const isApproved = !requiresApproval || vendor?.approved === true;
    const isPendingApproval = requiresApproval && hasVendor && !isApproved;

    return {
      requiresApproval,
      isApproved,
      isPendingApproval,
    };
  }, [features?.requireProviderApproval, vendor?.approved, hasVendor]);
}
