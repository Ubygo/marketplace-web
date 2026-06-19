"use client";

import { useStripeContext } from "@/components/providers/StripeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { fetchServiceById } from "@/lib/checkout";
import { serviceNeedsSlotPicker } from "@/lib/booking-routing";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePayment } from "@/hooks/usePayment";

export function useBookingFlow(vendorId: string) {
  const router = useRouter();
  const { user } = useAuth();
  const { slug, tenantId } = useTenant();
  const { isStripeEnabled } = useStripeContext();
  const { startPayment, isCreatingOrder, paymentModal } = usePayment();
  const [isRouting, setIsRouting] = useState(false);

  const handleBook = useCallback(
    async (serviceId: string) => {
      if (!user?.email) {
        toast.error("Veuillez vous connecter pour réserver.");
        return;
      }

      if (!isStripeEnabled) {
        toast.error("Paiement indisponible pour ce marketplace.");
        return;
      }

      try {
        setIsRouting(true);
        const service = await fetchServiceById(slug, tenantId, serviceId);

        if (serviceNeedsSlotPicker(service)) {
          router.push(
            `/vendor/${vendorId}/reserver?serviceId=${encodeURIComponent(serviceId)}`,
          );
          return;
        }

        await startPayment(serviceId, { customerEmail: user.email });
      } catch {
        toast.error("Impossible de charger les informations du service.");
      } finally {
        setIsRouting(false);
      }
    },
    [
      isStripeEnabled,
      router,
      slug,
      startPayment,
      tenantId,
      user?.email,
      vendorId,
    ],
  );

  const isLoading = isRouting || isCreatingOrder;

  return {
    handleBook,
    isLoading,
    isStripeEnabled,
    paymentModal,
  };
}
