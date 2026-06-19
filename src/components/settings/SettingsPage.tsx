"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import SettingsMobileView from "@/components/settings/SettingsMobileView";
import { SettingsPlaceholderPanel } from "@/components/settings/SettingsPlaceholderPanel";
import SettingsProfilePanel from "@/components/settings/SettingsProfilePanel";
import SettingsSidebar, {
  type SettingsSectionId,
} from "@/components/settings/SettingsSidebar";
import VendorAddressPanel from "@/components/vendor/address/VendorAddressPanel";
import VendorProfileForm from "@/components/vendor/profile/VendorProfileForm";
import SettingsVendorLinkPanel from "@/components/settings/vendor/SettingsVendorLinkPanel";
import SettingsVendorPayoutPanel from "@/components/settings/vendor/SettingsVendorPayoutPanel";
import SettingsVendorVisibilityPanel from "@/components/settings/vendor/SettingsVendorVisibilityPanel";
import { useAuth } from "@/contexts/AuthContext";
import { buildLoginUrl } from "@/lib/auth-url";
import { isSettingsSectionId } from "@/lib/settings-url";
import { useIsProMode } from "@/hooks/useIsProMode";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const isProMode = useIsProMode();
  const [activeSection, setActiveSection] =
    useState<SettingsSectionId>("profile");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section && isSettingsSectionId(section)) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(buildLoginUrl(pathname));
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (!isProMode && activeSection.startsWith("vendor-")) {
      setActiveSection("profile");
    }
  }, [activeSection, isProMode]);

  function handleLogoutRequest() {
    setShowLogoutConfirm(true);
  }

  function handleLogoutConfirm() {
    setShowLogoutConfirm(false);
    logout();
    router.push("/");
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  function renderDesktopPanel() {
    switch (activeSection) {
      case "password":
        return <SettingsPlaceholderPanel title="Mot de passe et sécurité" />;
      case "vendor-profile":
        return <VendorProfileForm showTitle />;
      case "vendor-availabilities":
        return (
          <SettingsVendorLinkPanel
            title="Disponibilités"
            description="Configurez vos créneaux de réservation."
            href="/pro/disponibilites"
          />
        );
      case "vendor-address":
        return <VendorAddressPanel showTitle />;
      case "vendor-payout":
        return <SettingsVendorPayoutPanel />;
      case "vendor-reviews":
        return (
          <SettingsVendorLinkPanel
            title="Avis clients"
            description="Consultez et gérez les avis laissés par vos clients."
            href="/pro"
            linkLabel="Voir le tableau de bord"
          />
        );
      case "vendor-visibility":
        return <SettingsVendorVisibilityPanel />;
      default:
        return <SettingsProfilePanel />;
    }
  }

  return (
    <>
      <SettingsMobileView
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogoutRequest}
        renderPanel={renderDesktopPanel}
      />

      <main className="hidden w-full md:block">
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
