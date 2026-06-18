"use client";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { updateMyVendor } from "@/lib/vendors-me-client";
import { useState } from "react";

export default function SettingsVendorVisibilityPanel() {
  const { slug, tenantId } = useTenant();
  const { vendor, refreshVendor } = useVendor();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVisible, setPendingVisible] = useState<boolean | null>(null);

  if (!vendor) {
    return null;
  }

  const isVisible = vendor.visible;

  async function applyVisibility(nextVisible: boolean) {
    if (!vendor) return;

    const vendorId = vendor.id;
    setIsUpdating(true);
    setError(null);

    try {
      await updateMyVendor(slug, tenantId, vendorId, { visible: nextVisible });
      await refreshVendor();
    } catch {
      setError("Impossible de mettre à jour la visibilité.");
    } finally {
      setIsUpdating(false);
      setPendingVisible(null);
    }
  }

  function handleToggle() {
    setPendingVisible(!isVisible);
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold text-black">Visibilité</h1>

      <SettingsPanelCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-black">Profil visible</p>
            <p className="mt-1 text-sm leading-relaxed text-black/60">
              Lorsque votre profil est visible, les clients peuvent vous
              découvrir et réserver vos prestations sur la marketplace.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isVisible}
            disabled={isUpdating}
            onClick={handleToggle}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              isVisible ? "bg-[var(--tenant-primary)]" : "bg-black/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                isVisible ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </SettingsPanelCard>

      {pendingVisible !== null ? (
        <ConfirmDialog
          open
          title={pendingVisible ? "Activer la visibilité ?" : "Masquer le profil ?"}
          description={
            pendingVisible
              ? "Votre profil sera visible par les clients sur la marketplace."
              : "Votre profil ne sera plus visible par les clients."
          }
          confirmLabel="Confirmer"
          cancelLabel="Annuler"
          onConfirm={() => void applyVisibility(pendingVisible)}
          onCancel={() => setPendingVisible(null)}
        />
      ) : null}
    </div>
  );
}
