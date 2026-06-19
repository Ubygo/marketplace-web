"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import {
  fetchStripeRequirements,
  openStripeResolvedLink,
} from "@/lib/vendor-stripe-client";
import type { StripeRequirementsResponse } from "@/types/vendor";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface VendorStripePanelProps {
  showTitle?: boolean;
}

function getStripeCopy(requirements: StripeRequirementsResponse | null): {
  title: string;
  description: string;
  buttonLabel: string | null;
} {
  if (!requirements) {
    return {
      title: "Configurer Stripe",
      description:
        "Connectez votre compte Stripe pour recevoir vos paiements en ligne.",
      buttonLabel: "Configurer Stripe",
    };
  }

  switch (requirements.resolution) {
    case "pending_verification":
      return {
        title: "Vérification Stripe en cours",
        description:
          "Votre compte Stripe est en cours de vérification. Vous serez notifié dès qu'il sera activé.",
        buttonLabel: null,
      };
    case "account_update":
      return {
        title: "Action requise sur Stripe",
        description:
          requirements.resolutionDescription ||
          "Une action est requise sur votre compte Stripe pour continuer à recevoir des paiements.",
        buttonLabel: "Compléter mon compte Stripe",
      };
    case "account_onboarding":
      return {
        title: "Configurer Stripe",
        description:
          "Finalisez la configuration de votre compte Stripe Connect pour recevoir vos paiements.",
        buttonLabel: "Configurer Stripe",
      };
    case "none":
    default:
      return {
        title: "Compte Stripe connecté",
        description:
          "Votre compte Stripe est configuré. Vous pouvez accéder à votre dashboard Stripe pour consulter vos paiements.",
        buttonLabel: "Accéder au dashboard Stripe",
      };
  }
}

export default function VendorStripePanel({
  showTitle = true,
}: VendorStripePanelProps) {
  const { slug, tenantId } = useTenant();
  const { vendor } = useVendor();
  const [requirements, setRequirements] =
    useState<StripeRequirementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    if (!vendor?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchStripeRequirements(slug, tenantId, vendor.id);
      setRequirements(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les informations Stripe.",
      );
      setRequirements(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, tenantId, vendor?.id]);

  useEffect(() => {
    void loadRequirements();
  }, [loadRequirements]);

  async function handleOpenStripe() {
    if (!vendor?.id || isOpening) return;

    setIsOpening(true);
    setError(null);

    try {
      await openStripeResolvedLink(
        slug,
        tenantId,
        vendor.id,
        requirements ?? undefined,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible d'ouvrir Stripe.";
      setError(message);
      toast.error(message);
    } finally {
      setIsOpening(false);
    }
  }

  const copy = getStripeCopy(requirements);

  if (!vendor) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {showTitle ? (
        <h1 className="text-3xl font-bold text-black">Paiements Stripe</h1>
      ) : null}

      <SettingsPanelCard className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5"
              >
                <CategoryIcon
                  icon="MaterialIcons/euro-symbol"
                  size={20}
                  color={TEXT_COLOR}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-black">
                  {copy.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-black/60">
                  {copy.description}
                </p>
              </div>
            </div>

            {requirements?.resolution === "pending_verification" ? (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Compte en cours de vérification par Stripe.
              </div>
            ) : null}

            {copy.buttonLabel ? (
              <button
                type="button"
                onClick={() => void handleOpenStripe()}
                disabled={isOpening}
                className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                style={{ backgroundColor: "var(--tenant-primary)" }}
              >
                {isOpening ? "Ouverture..." : copy.buttonLabel}
              </button>
            ) : null}

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}
          </>
        )}
      </SettingsPanelCard>
    </div>
  );
}
