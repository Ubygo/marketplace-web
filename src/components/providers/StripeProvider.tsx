"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

interface StripeContextValue {
  stripePromise: Promise<Stripe | null> | null;
  isStripeEnabled: boolean;
}

const StripeContext = createContext<StripeContextValue>({
  stripePromise: null,
  isStripeEnabled: false,
});

interface TenantStripeProviderProps {
  publishableKey: string | null;
  children: ReactNode;
}

export function TenantStripeProvider({
  publishableKey,
  children,
}: TenantStripeProviderProps) {
  const value = useMemo(() => {
    if (!publishableKey) {
      return { stripePromise: null, isStripeEnabled: false };
    }

    return {
      stripePromise: loadStripe(publishableKey),
      isStripeEnabled: true,
    };
  }, [publishableKey]);

  return (
    <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
  );
}

export function useStripeContext() {
  return useContext(StripeContext);
}

interface PaymentElementsWrapperProps {
  clientSecret: string;
  children: ReactNode;
}

export function PaymentElementsWrapper({
  clientSecret,
  children,
}: PaymentElementsWrapperProps) {
  const { stripePromise } = useStripeContext();

  if (!stripePromise) {
    return null;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            borderRadius: "12px",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
