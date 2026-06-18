"use client";

import { PaymentElementsWrapper } from "@/components/providers/StripeProvider";
import { TEXT_COLOR } from "@/constants/theme";
import { formatPrice } from "@/lib/format-price";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useCallback, useState } from "react";

function formatStripeAmount(amount: number, currency: string): string {
  return formatPrice(amount / 100, currency.toUpperCase());
}

interface PaymentModalProps {
  clientSecret: string;
  amount: number;
  currency: string;
  merchantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentForm({
  amount,
  currency,
  onClose,
  onSuccess,
}: Omit<PaymentModalProps, "clientSecret" | "merchantName">) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      const returnUrl = `${window.location.origin}/commandes?payment=success`;

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message ?? "Erreur de paiement.");
        } else {
          setErrorMessage(error.message ?? "Une erreur est survenue.");
        }
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      setIsSubmitting(false);
    },
    [elements, onSuccess, stripe],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-h-[min(52dvh,420px)] overflow-y-auto overscroll-contain pr-1">
        <div className="flex flex-col gap-4 pb-4">
          <div>
            <p className="text-sm text-black/60">Montant à payer</p>
            <p className="text-2xl font-bold" style={{ color: TEXT_COLOR }}>
              {formatStripeAmount(amount, currency)}
            </p>
          </div>

          <PaymentElement
            options={{
              layout: {
                type: "accordion",
                defaultCollapsed: false,
                radios: "auto",
                spacedAccordionItems: true,
              },
            }}
          />

          {errorMessage ? (
            <p className="text-sm text-red-600">{errorMessage}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex gap-3 border-t border-black/5 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 rounded-full border border-black/10 py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ color: TEXT_COLOR }}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || isSubmitting}
          className="flex-1 rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: TEXT_COLOR }}
        >
          {isSubmitting ? "Paiement..." : "Payer"}
        </button>
      </div>
    </form>
  );
}

export default function PaymentModal({
  clientSecret,
  amount,
  currency,
  merchantName,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-black/5 px-5 py-4 sm:px-6">
          <h2
            id="payment-modal-title"
            className="text-lg font-semibold"
            style={{ color: TEXT_COLOR }}
          >
            Paiement — {merchantName}
          </h2>
        </div>

        <div className="px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
          <PaymentElementsWrapper clientSecret={clientSecret}>
            <PaymentForm
              amount={amount}
              currency={currency}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </PaymentElementsWrapper>
        </div>
      </div>
    </div>
  );
}
