import type { OnboardingStep, StripeRequirementsResolution } from "@/types/vendor";
import { PRO_SETTINGS_ADDRESS_URL, PRO_SETTINGS_AVAILABILITIES_URL, PRO_SETTINGS_PAYOUT_URL } from "@/lib/settings-url";

export type VendorOnboardingStepAction = "link" | "stripe";

export interface VendorOnboardingStepView {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  href?: string;
  action?: VendorOnboardingStepAction;
  stripeResolution?: StripeRequirementsResolution;
}

const STEP_CONFIG: Record<
  string,
  { title: string; description: string; href: string }
> = {
  completeVendorInfo: {
    title: "Compléter votre profil",
    description: "Nom, description et photo de votre activité",
    href: "/pro/profil",
  },
  addAddress: {
    title: "Ajouter une adresse",
    description: "Indiquez où vous exercez votre activité",
    href: PRO_SETTINGS_ADDRESS_URL,
  },
  setAvailabilities: {
    title: "Définir vos disponibilités",
    description: "Configurez vos créneaux de réservation",
    href: PRO_SETTINGS_AVAILABILITIES_URL,
  },
  provideBankDetails: {
    title: "Informations bancaires",
    description: "Ajoutez votre IBAN pour recevoir vos virements",
    href: PRO_SETTINGS_PAYOUT_URL,
  },
  completeStripeOnboarding: {
    title: "Connecter Stripe",
    description: "Ajoutez un compte Stripe pour recevoir des paiements",
    href: PRO_SETTINGS_PAYOUT_URL,
  },
};

function getStripeStepCopy(resolution?: StripeRequirementsResolution): {
  title: string;
  description: string;
} {
  if (resolution === "pending_verification") {
    return {
      title: "Vérification Stripe en cours",
      description: "Compte en cours de vérification",
    };
  }

  if (resolution === "account_update") {
    return {
      title: "Action requise sur Stripe",
      description: "Une action est requise sur votre compte Stripe",
    };
  }

  return {
    title: "Connecter Stripe",
    description: "Ajoutez un compte Stripe pour recevoir des paiements",
  };
}

export function buildOnboardingSteps(
  steps: OnboardingStep[],
  payoutMode: string | null,
  stripeResolution?: StripeRequirementsResolution,
): VendorOnboardingStepView[] {
  const result: VendorOnboardingStepView[] = [];

  steps.forEach((step, index) => {
    if (
      step.action === "completeStripeOnboarding" &&
      payoutMode !== "STRIPE_CONNECT"
    ) {
      return;
    }

    if (
      step.action === "provideBankDetails" &&
      payoutMode === "STRIPE_CONNECT"
    ) {
      return;
    }

    const config = STEP_CONFIG[step.action];

    if (!config) {
      result.push({
        id: index + 1,
        title: step.action,
        description: step.action,
        completed: step.done,
      });
      return;
    }

    const isStripeStep = step.action === "completeStripeOnboarding";
    const stripeCopy = isStripeStep
      ? getStripeStepCopy(stripeResolution)
      : null;
    const useStripeAction =
      isStripeStep &&
      !step.done &&
      stripeResolution !== "pending_verification";

    result.push({
      id: index + 1,
      title: stripeCopy?.title ?? config.title,
      description: stripeCopy?.description ?? config.description,
      completed: step.done,
      href: step.done || useStripeAction ? undefined : config.href,
      action: useStripeAction ? "stripe" : "link",
      stripeResolution: isStripeStep ? stripeResolution : undefined,
    });
  });

  return result;
}
