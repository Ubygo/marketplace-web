"use client";

import VendorEscrowInfo from "@/components/vendor/dashboard/VendorEscrowInfo";
import VendorOnboardingProgress from "@/components/vendor/dashboard/VendorOnboardingProgress";
import VendorOnboardingSteps from "@/components/vendor/dashboard/VendorOnboardingSteps";
import VendorPendingApproval from "@/components/vendor/dashboard/VendorPendingApproval";
import VendorRecentOrders from "@/components/vendor/dashboard/VendorRecentOrders";
import VendorStatsSection from "@/components/vendor/dashboard/VendorStatsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useTenantVendorMode } from "@/hooks/useTenantVendorMode";
import { useVendorApprovalGate } from "@/hooks/useVendorApprovalGate";
import { buildLoginUrl } from "@/lib/auth-url";
import { buildOnboardingSteps } from "@/lib/vendor-onboarding-steps";
import { fetchOnboardingSteps } from "@/lib/vendors-me-client";
import { fetchStripeRequirements } from "@/lib/vendor-stripe-client";
import type { OnboardingStep, StripeRequirementsResolution } from "@/types/vendor";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function VendorDashboardPage() {
  const router = useRouter();
  const { slug, tenantId, payoutMode, escrowEnabled, primaryColor } = useTenant();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { vendor, hasVendor, isLoading: isVendorLoading, refreshVendor } =
    useVendor();
  const { isPendingApproval } = useVendorApprovalGate();
  const { isPublicVendorSignup } = useTenantVendorMode();
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [stripeResolution, setStripeResolution] =
    useState<StripeRequirementsResolution>("none");

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace(
        isPublicVendorSignup ? "/devenir-prestataire" : "/",
      );
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isPublicVendorSignup,
    isVendorLoading,
    router,
  ]);

  const loadOnboardingSteps = useCallback(async () => {
    if (!vendor?.id || isPendingApproval) return;

    try {
      setIsLoadingSteps(true);

      if (payoutMode === "STRIPE_CONNECT") {
        try {
          const stripeRequirements = await fetchStripeRequirements(
            slug,
            tenantId,
            vendor.id,
          );
          setStripeResolution(stripeRequirements.resolution);
        } catch {
          setStripeResolution("none");
        }
      } else {
        setStripeResolution("none");
      }

      const response = await fetchOnboardingSteps(slug, tenantId, vendor.id);
      setOnboardingSteps(response.steps);
    } catch {
      setOnboardingSteps([]);
    } finally {
      setIsLoadingSteps(false);
    }
  }, [vendor?.id, isPendingApproval, payoutMode, slug, tenantId]);

  useEffect(() => {
    if (!vendor?.id) return;
    void refreshVendor();
    if (!isPendingApproval) {
      void loadOnboardingSteps();
    }
  }, [vendor?.id, isPendingApproval, loadOnboardingSteps, refreshVendor]);

  const steps = useMemo(
    () => buildOnboardingSteps(onboardingSteps, payoutMode, stripeResolution),
    [onboardingSteps, payoutMode, stripeResolution],
  );

  const completedStepsCount = steps.filter((step) => step.completed).length;
  const allStepsCompleted =
    steps.length > 0 && steps.every((step) => step.completed);

  if (isAuthLoading || isVendorLoading || !isAuthenticated || !hasVendor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  return (
    <main className="flex w-full flex-col gap-5 pb-8">
      {isPendingApproval ? (
        <VendorPendingApproval />
      ) : !allStepsCompleted ? (
        <div className="flex flex-col gap-4">
          <VendorOnboardingProgress
            primaryColor={primaryColor}
            completedSteps={completedStepsCount}
            totalSteps={steps.length}
          />
          <VendorOnboardingSteps
            steps={steps}
            primaryColor={primaryColor}
            isLoading={isLoadingSteps}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {vendor?.id ? (
            <VendorStatsSection
              vendorId={vendor.id}
              primaryColor={primaryColor}
            />
          ) : null}
          {escrowEnabled ? <VendorEscrowInfo /> : null}
          <VendorRecentOrders />
        </div>
      )}
    </main>
  );
}
