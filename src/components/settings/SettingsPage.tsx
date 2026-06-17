"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import SettingsMobileView from "@/components/settings/SettingsMobileView";
import { SettingsPlaceholderPanel } from "@/components/settings/SettingsPlaceholderPanel";
import SettingsProfilePanel from "@/components/settings/SettingsProfilePanel";
import SettingsSidebar, {
  type SettingsSectionId,
} from "@/components/settings/SettingsSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { buildLoginUrl } from "@/lib/auth-url";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("profile");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/parametres"));
    }
  }, [isAuthenticated, isLoading, router]);

  function handleLogoutRequest() {
    setShowLogoutConfirm(true);
  }

  function handleLogoutConfirm() {
    setShowLogoutConfirm(false);
    logout();
    router.push("/");
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
        <p className="text-sm text-black/70">Chargement...</p>
      </main>
    );
  }

  function renderDesktopPanel() {
    if (activeSection === "password") {
      return <SettingsPlaceholderPanel title="Mot de passe et sécurité" />;
    }

    return <SettingsProfilePanel />;
  }

  return (
    <>
      <SettingsMobileView onLogout={handleLogoutRequest} />

      <main className="hidden w-full py-8 lg:py-10 md:block">
        <div className="flex w-full items-stretch gap-8 lg:gap-8">
          <SettingsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={handleLogoutRequest}
          />
          <div className="min-w-0 flex-1">{renderDesktopPanel()}</div>
        </div>
      </main>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Se déconnecter ?"
        description="Voulez-vous vraiment vous déconnecter de votre compte ?"
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        destructive
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
