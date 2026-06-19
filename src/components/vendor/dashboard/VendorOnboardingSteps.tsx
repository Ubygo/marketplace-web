"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import type { VendorOnboardingStepView } from "@/lib/vendor-onboarding-steps";
import { openStripeResolvedLink } from "@/lib/vendor-stripe-client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface VendorOnboardingStepsProps {
  steps: VendorOnboardingStepView[];
  primaryColor: string;
  isLoading?: boolean;
}

export default function VendorOnboardingSteps({
  steps,
  primaryColor,
  isLoading = false,
}: VendorOnboardingStepsProps) {
  const { slug, tenantId } = useTenant();
  const { vendor } = useVendor();
  const [openingStripeStepId, setOpeningStripeStepId] = useState<number | null>(
    null,
  );

  async function handleStripeStep(step: VendorOnboardingStepView) {
    if (!vendor?.id || openingStripeStepId !== null) return;

    setOpeningStripeStepId(step.id);

    try {
      await openStripeResolvedLink(slug, tenantId, vendor.id);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible d'ouvrir Stripe.",
      );
    } finally {
      setOpeningStripeStepId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const isInteractive =
          !step.completed &&
          (step.action === "stripe" || Boolean(step.href));
        const showChevron =
          isInteractive && step.action !== "stripe";

        const content = (
          <>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  step.completed ? "bg-white/20" : "bg-black/5"
                }`}
              >
                <CategoryIcon
                  icon={
                    step.completed
                      ? "Ionicons/checkmark"
                      : "Ionicons/ellipse-outline"
                  }
                  size={18}
                  color={step.completed ? "#fff" : TEXT_COLOR}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`font-semibold ${
                    step.completed ? "text-white" : "text-black"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-sm ${
                    step.completed ? "text-white/90" : "text-black/60"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
            {showChevron ? (
              <CategoryIcon
                icon="Ionicons/chevron-forward"
                size={20}
                color={TEXT_COLOR}
              />
            ) : null}
            {step.action === "stripe" && !step.completed ? (
              <span className="text-xs font-semibold text-black/50">
                {openingStripeStepId === step.id ? "Ouverture..." : "Ouvrir"}
              </span>
            ) : null}
          </>
        );

        if (step.completed || !isInteractive) {
          return (
            <div
              key={step.id}
              className={`flex items-center justify-between rounded-xl border p-3 ${
                step.completed
                  ? "border-transparent text-white"
                  : "border-dashed border-black/20 bg-white"
              }`}
              style={
                step.completed ? { backgroundColor: primaryColor } : undefined
              }
            >
              {content}
            </div>
          );
        }

        if (step.action === "stripe") {
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => void handleStripeStep(step)}
              disabled={openingStripeStepId !== null}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-black/20 bg-white p-3 text-left transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={step.id}
            href={step.href!}
            className="flex items-center justify-between rounded-xl border border-dashed border-black/20 bg-white p-3 transition-colors hover:bg-neutral-50"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
