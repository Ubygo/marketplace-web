"use client";

import PaymentModal from "@/components/booking/PaymentModal";
import { useStripeContext } from "@/components/providers/StripeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import {
  createOrder,
  type CreateOrderRequest,
  type CreateOrderResponse,
} from "@/lib/checkout";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

function getLocationOutsideServiceAreaMessage(error: unknown): string | null {
  const err = error as { status?: unknown; message?: unknown };
  const status = typeof err?.status === "number" ? err.status : undefined;
  const message = typeof err?.message === "string" ? err.message : undefined;

  if (status !== 400 || !message) {
    return null;
  }

  const normalized = message.toLowerCase();
  const outside =
    normalized.includes("outside") ||
    normalized.includes("en dehors") ||
    normalized.includes("dehors");
  const serviceArea =
    normalized.includes("service area") ||
    normalized.includes("zone de service");
  const location = normalized.includes("location");
  const isLocationOutside =
    (outside && serviceArea) || (location && (outside || serviceArea));

  if (!isLocationOutside) {
    return null;
  }

  const distanceMatch = message.match(
    /Distance:\s*([0-9]+(?:[.,][0-9]+)?)\s*km/i,
  );
  const maxAllowedMatch = message.match(
    /max allowed:\s*([0-9]+(?:[.,][0-9]+)?)\s*km/i,
  );

  if (distanceMatch?.[1] && maxAllowedMatch?.[1]) {
    return `L'adresse est en dehors de la zone de service (distance : ${distanceMatch[1].replace(",", ".")} km, maximum : ${maxAllowedMatch[1].replace(",", ".")} km).`;
  }

  return "L'adresse est en dehors de la zone de service.";
}

interface PaymentState {
  clientSecret: string;
  amount: number;
  currency: string;
}

export function usePayment() {
  const router = useRouter();
  const { user } = useAuth();
  const { slug, tenantId, tenantName } = useTenant();
  const { isStripeEnabled } = useStripeContext();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);

  const handlePaymentSuccess = useCallback(() => {
    setPaymentState(null);
    toast.success("Paiement réussi");
    router.push("/commandes");
  }, [router]);

  const closePaymentModal = useCallback(() => {
    setPaymentState(null);
  }, []);

  const startPayment = useCallback(
    async (serviceId: string, orderData: CreateOrderRequest) => {
      if (!isStripeEnabled) {
        toast.error("Paiement indisponible pour ce marketplace.");
        return;
      }

      if (!user?.email && !orderData.customerEmail) {
        toast.error("Une adresse e-mail est requise.");
        return;
      }

      try {
        setIsCreatingOrder(true);

        const orderRequest: CreateOrderRequest = {
          ...orderData,
          customerEmail: orderData.customerEmail || user?.email,
        };

        const orderResponse: CreateOrderResponse = await createOrder(
          slug,
          tenantId,
          serviceId,
          orderRequest,
        );

        setPaymentState({
          clientSecret: orderResponse.clientSecret,
          amount: orderResponse.amount,
          currency: orderResponse.currency,
        });
      } catch (error) {
        const locationMessage = getLocationOutsideServiceAreaMessage(error);
        if (locationMessage) {
          toast.error(locationMessage);
        } else {
          const message =
            error instanceof Error
              ? error.message
              : "Une erreur inattendue est survenue.";
          toast.error(message);
        }
      } finally {
        setIsCreatingOrder(false);
      }
    },
    [isStripeEnabled, slug, tenantId, user?.email],
  );

  const paymentModal = paymentState ? (
    <PaymentModal
      clientSecret={paymentState.clientSecret}
      amount={paymentState.amount}
      currency={paymentState.currency}
      merchantName={tenantName}
      onClose={closePaymentModal}
      onSuccess={handlePaymentSuccess}
    />
  ) : null;

  return {
    startPayment,
    isCreatingOrder,
    isStripeEnabled,
    paymentModal,
  };
}
