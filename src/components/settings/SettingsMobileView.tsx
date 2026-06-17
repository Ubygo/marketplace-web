"use client";

import SettingsItem from "@/components/settings/SettingsItem";
import SettingsPersonalInfoCard from "@/components/settings/SettingsPersonalInfoCard";
import SettingsSection from "@/components/settings/SettingsSection";
import { useTenant } from "@/contexts/TenantContext";

interface SettingsMobileViewProps {
  onLogout: () => void;
}

export default function SettingsMobileView({ onLogout }: SettingsMobileViewProps) {
  const { privacyPolicyUrl, cgvUrl } = useTenant();

  return (
    <main className="flex w-full flex-col gap-4 py-8 md:hidden">
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
