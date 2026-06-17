"use client";

import { useTenant } from "@/contexts/TenantContext";

export type SettingsSectionId = "profile" | "password";

interface SettingsSidebarProps {
  activeSection: SettingsSectionId;
  onSectionChange: (section: SettingsSectionId) => void;
  onLogout: () => void;
}

function navButtonClass(isActive: boolean): string {
  return `flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
    isActive ? "" : "text-black hover:bg-black/[0.03]"
  }`;
}

export default function SettingsSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SettingsSidebarProps) {
  const { privacyPolicyUrl, cgvUrl } = useTenant();

  return (
    <aside className="flex w-60 shrink-0 self-stretch lg:w-64">
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => onSectionChange("profile")}
          className={navButtonClass(activeSection === "profile")}
          style={
            activeSection === "profile"
              ? {
                  backgroundColor:
                    "color-mix(in srgb, var(--tenant-primary) 12%, white)",
                  color: "var(--tenant-primary)",
                }
              : undefined
          }
        >
          Mon profil
        </button>

        <button
          type="button"
          onClick={() => onSectionChange("password")}
          className={navButtonClass(activeSection === "password")}
          style={
            activeSection === "password"
              ? {
                  backgroundColor:
                    "color-mix(in srgb, var(--tenant-primary) 12%, white)",
                  color: "var(--tenant-primary)",
                }
              : undefined
          }
        >
          <span>Mot de passe et sécurité</span>
          {activeSection !== "password" ? (
            <span className="text-xs text-black/40">Bientôt</span>
          ) : null}
        </button>

        {privacyPolicyUrl ? (
          <a
            href={privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={navButtonClass(false)}
          >
            Politique de confidentialité
          </a>
        ) : null}

        {cgvUrl ? (
          <a
            href={cgvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={navButtonClass(false)}
          >
            Conditions générales d&apos;utilisation
          </a>
        ) : null}
        </nav>

        <div className="mt-auto shrink-0 border-t border-black/5 bg-white p-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition-opacity hover:bg-black/[0.02] hover:opacity-80"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
