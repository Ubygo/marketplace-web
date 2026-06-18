"use client";

import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useIsProMode } from "@/hooks/useIsProMode";
import type { CSSProperties } from "react";

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

function activeStyle(isActive: boolean): CSSProperties | undefined {
  if (!isActive) return undefined;

  return {
    backgroundColor: "color-mix(in srgb, var(--tenant-primary) 12%, white)",
    color: "var(--tenant-primary)",
  };
}

const VENDOR_SECTIONS: {
  id: SettingsSectionId;
  label: string;
  indented?: boolean;
}[] = [
  { id: "vendor-profile", label: "Profil entreprise", indented: true },
  { id: "vendor-availabilities", label: "Disponibilités", indented: true },
  { id: "vendor-address", label: "Adresse", indented: true },
  { id: "vendor-payout", label: "Paiements", indented: true },
  { id: "vendor-reviews", label: "Avis clients", indented: true },
  { id: "vendor-visibility", label: "Visibilité", indented: true },
];

export type SettingsSectionId =
  | "profile"
  | "password"
  | "vendor-profile"
  | "vendor-availabilities"
  | "vendor-address"
  | "vendor-payout"
  | "vendor-reviews"
  | "vendor-visibility";

export default function SettingsSidebar({
  activeSection,
  onSectionChange,
  onLogout,
}: SettingsSidebarProps) {
  const { privacyPolicyUrl, cgvUrl, payoutMode } = useTenant();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const isProMode = useIsProMode();
  const showVendorSection = isProMode && hasVendor && !isVendorLoading;

  const payoutLabel =
    payoutMode === "STRIPE_CONNECT" ? "Paiements Stripe" : "Coordonnées bancaires";

  return (
    <aside className="flex w-60 shrink-0 self-stretch lg:w-64">
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          <button
            type="button"
            onClick={() => onSectionChange("profile")}
            className={navButtonClass(activeSection === "profile")}
            style={activeStyle(activeSection === "profile")}
          >
            Mon profil
          </button>

          <button
            type="button"
            onClick={() => onSectionChange("password")}
            className={navButtonClass(activeSection === "password")}
            style={activeStyle(activeSection === "password")}
          >
            <span>Mot de passe et sécurité</span>
            {activeSection !== "password" ? (
              <span className="text-xs text-black/40">Bientôt</span>
            ) : null}
          </button>

          {showVendorSection ? (
            <>
              <div className="my-2 border-t border-black/5" />
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-black/40">
                Espace pro
              </p>
              {VENDOR_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => onSectionChange(section.id)}
                  className={`${navButtonClass(activeSection === section.id)} ${
                    section.indented ? "pl-6" : ""
                  }`}
                  style={activeStyle(activeSection === section.id)}
                >
                  {section.id === "vendor-payout" ? payoutLabel : section.label}
                </button>
              ))}
            </>
          ) : null}

          <div className="my-2 border-t border-black/5" />

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
