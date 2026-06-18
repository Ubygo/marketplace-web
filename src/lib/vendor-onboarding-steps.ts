import type { OnboardingStep } from "@/types/vendor";

export interface VendorOnboardingStepView {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  href?: string;
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
    href: "/pro/adresse",
  },
  setAvailabilities: {
    title: "Définir vos disponibilités",
    description: "Configurez vos créneaux de réservation",
    href: "/pro/disponibilites",
  },
  provideBankDetails: {
    title: "Coordonnées bancaires",
    description: "Renseignez vos informations de paiement",
    href: "/pro/coordonnees-bancaires",
  },
  completeStripeOnboarding: {
    title: "Configurer Stripe",
    description: "Finalisez votre compte de paiement Stripe",
    href: "/pro/stripe",
  },
};

export function buildOnboardingSteps(
  steps: OnboardingStep[],
  payoutMode: string | null,
): VendorOnboardingStepView[] {
  return steps
    .map((step, index) => {
      if (
        step.action === "completeStripeOnboarding" &&
        payoutMode !== "STRIPE_CONNECT"
      ) {
        return null;
      }

      if (
        step.action === "provideBankDetails" &&
        payoutMode === "STRIPE_CONNECT"
      ) {
        return null;
      }

      const config = STEP_CONFIG[step.action];

      if (!config) {
        return {
          id: index + 1,
          title: step.action,
          description: step.action,
          completed: step.done,
        };
      }

      return {
        id: index + 1,
        title: config.title,
        description: config.description,
        completed: step.done,
        href: step.done ? undefined : config.href,
      };
    })
    .filter((step): step is VendorOnboardingStepView => step !== null);
}
