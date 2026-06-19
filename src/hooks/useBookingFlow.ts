"use client";

import { useStripeContext } from "@/components/providers/StripeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { fetchServiceById } from "@/lib/checkout";
import { serviceNeedsSlotPicker } from "@/lib/booking-routing";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { usePayment } from "@/hooks/usePayment";

interface UseBookingFlowOptions {
  onStartSlotBooking?: (serviceId: string) => void;
}

export function useBookingFlow(
  _vendorId: string,
  options: UseBookingFlowOptions = {},
) {
  const { onStartSlotBooking } = options;
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
          onStartSlotBooking?.(serviceId);
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
      onStartSlotBooking,
      slug,
      startPayment,
      tenantId,
      user?.email,
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
