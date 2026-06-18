"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import SettingsItem from "@/components/settings/SettingsItem";
import SettingsPersonalInfoCard from "@/components/settings/SettingsPersonalInfoCard";
import SettingsSection from "@/components/settings/SettingsSection";
import type { SettingsSectionId } from "@/components/settings/SettingsSidebar";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useIsProMode } from "@/hooks/useIsProMode";
import type { ReactNode } from "react";

interface SettingsMobileViewProps {
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId) => void;
  onLogout: () => void;
  renderPanel: () => ReactNode;
}

const VENDOR_SECTION_ITEMS: {
  id: SettingsSectionId;
  icon: string;
  title: string;
  description: string;
}[] = [
  {
    id: "vendor-profile",
    icon: "Ionicons/briefcase-outline",
    title: "Profil entreprise",
    description: "Informations de votre activité",
  },
  {
    id: "vendor-availabilities",
    icon: "Ionicons/time-outline",
    title: "Disponibilités",
    description: "Créneaux de réservation",
  },
  {
    id: "vendor-address",
    icon: "Ionicons/location-outline",
    title: "Adresse",
    description: "Lieu d'exercice de votre activité",
  },
  {
    id: "vendor-payout",
    icon: "Ionicons/card-outline",
    title: "Paiements",
    description: "Stripe ou coordonnées bancaires",
  },
  {
    id: "vendor-reviews",
    icon: "Ionicons/star-outline",
    title: "Avis clients",
    description: "Avis reçus sur vos prestations",
  },
  {
    id: "vendor-visibility",
    icon: "Ionicons/eye-outline",
    title: "Visibilité",
    description: "Afficher ou masquer votre profil",
  },
];

export default function SettingsMobileView({
  activeSection,
  onSectionChange,
  onLogout,
  renderPanel,
}: SettingsMobileViewProps) {
  const { privacyPolicyUrl, cgvUrl, payoutMode } = useTenant();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const isProMode = useIsProMode();
  const showVendorSection = isProMode && hasVendor && !isVendorLoading;

  const isVendorPanel = activeSection.startsWith("vendor-");

  if (isVendorPanel) {
    return (
      <main className="flex w-full flex-col gap-4 md:hidden">
        <button
          type="button"
          onClick={() => onSectionChange("profile")}
          className="inline-flex items-center gap-2 text-sm font-medium text-black/70"
        >
          <CategoryIcon icon="Ionicons/arrow-back" size={18} color={TEXT_COLOR} />
          Retour aux paramètres
        </button>
        {renderPanel()}
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-4 md:hidden">
      <h1 className="text-2xl font-bold text-black">Paramètres</h1>

      <SettingsPersonalInfoCard />

      <SettingsSection title="Compte">
        <SettingsItem
          icon="Ionicons/lock-closed-outline"
          title="Mot de passe et sécurité"
          description="Modifier votre mot de passe"
          badge="Bientôt"
          disabled
        />
      </SettingsSection>

      {showVendorSection ? (
        <SettingsSection title="Espace pro">
          {VENDOR_SECTION_ITEMS.map((item) => (
            <SettingsItem
              key={item.id}
              icon={item.icon}
              title={
                item.id === "vendor-payout"
                  ? payoutMode === "STRIPE_CONNECT"
                    ? "Paiements Stripe"
                    : "Coordonnées bancaires"
                  : item.title
              }
              description={item.description}
              onClick={() => onSectionChange(item.id)}
            />
          ))}
        </SettingsSection>
      ) : null}

      {privacyPolicyUrl || cgvUrl ? (
        <SettingsSection title="Légal">
          {privacyPolicyUrl ? (
            <SettingsItem
              icon="Ionicons/shield-checkmark-outline"
              title="Politique de confidentialité"
              description="Consulter notre politique de confidentialité"
              href={privacyPolicyUrl}
            />
          ) : null}
          {cgvUrl ? (
            <SettingsItem
              icon="Ionicons/document-text-outline"
              title="Conditions générales d'utilisation"
              description="Consulter les CGU"
              href={cgvUrl}
            />
          ) : null}
        </SettingsSection>
      ) : null}

      <button
        type="button"
        onClick={onLogout}
        className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-base font-semibold text-red-600 ring-1 ring-black/5 transition-opacity hover:opacity-80"
      >
        Déconnexion
      </button>
    </main>
  );
}
