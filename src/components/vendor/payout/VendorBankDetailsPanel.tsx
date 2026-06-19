"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import { TEXT_COLOR } from "@/constants/theme";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import {
  formatIbanForDisplay,
  toElectronicIban,
  validateIban,
} from "@/lib/iban";
import { getPayoutFrequencyLabel } from "@/lib/payout-frequency";
import { updateMyVendor } from "@/lib/vendors-me-client";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface VendorBankDetailsPanelProps {
  showTitle?: boolean;
}

export default function VendorBankDetailsPanel({
  showTitle = true,
}: VendorBankDetailsPanelProps) {
  const { slug, tenantId, payoutFrequency } = useTenant();
  const { vendor, refreshVendor } = useVendor();

  const [accountHolder, setAccountHolder] = useState("");
  const [iban, setIban] = useState("");
  const [ibanError, setIbanError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!vendor) return;
    setAccountHolder(vendor.bankAccountHolderName ?? "");
    setIban(vendor.iban ? formatIbanForDisplay(vendor.iban) : "");
  }, [vendor]);

  const payoutFrequencyLabel = useMemo(
    () => getPayoutFrequencyLabel(payoutFrequency),
    [payoutFrequency],
  );

  function handleIbanChange(value: string) {
    setIban(formatIbanForDisplay(value));
    if (ibanError) {
      setIbanError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!vendor?.id || isSaving) return;

    const trimmedHolder = accountHolder.trim();
    if (!trimmedHolder) {
      toast.error("Veuillez saisir le nom du titulaire du compte.");
      return;
    }

    if (!validateIban(iban)) {
      setIbanError("Veuillez saisir un IBAN valide.");
      return;
    }

    setIsSaving(true);

    try {
      await updateMyVendor(slug, tenantId, vendor.id, {
        iban: toElectronicIban(iban),
        bankAccountHolderName: trimmedHolder,
      });
      await refreshVendor();
      toast.success("Vos informations bancaires ont été enregistrées.");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer vos informations bancaires.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!vendor) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      {showTitle ? (
        <h1 className="text-3xl font-bold text-black">Informations bancaires</h1>
      ) : null}

      <SettingsPanelCard className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: "color-mix(in srgb, var(--tenant-primary) 8%, white)",
            }}
          >
            <CategoryIcon
              icon="Ionicons/information-circle-outline"
              size={20}
              color={TEXT_COLOR}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-black">
              Comment fonctionnent vos virements ?
            </p>
            <p className="text-sm leading-relaxed text-black/60">
              Les paiements de vos clients sont encaissés par le service de
              paiement de l&apos;application. Vos gains vous sont ensuite virés
              directement sur l&apos;IBAN renseigné ci-dessous.
            </p>
            <p className="text-sm leading-relaxed text-black/60">
              Les virements sont effectués{" "}
              <span className="font-semibold text-black">
                {payoutFrequencyLabel}
              </span>
              .
            </p>
          </div>
        </div>
      </SettingsPanelCard>

      <SettingsPanelCard className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="bank-account-holder"
            className="text-sm font-medium text-black"
          >
            Titulaire du compte
          </label>
          <input
            id="bank-account-holder"
            type="text"
            value={accountHolder}
            disabled={isSaving}
            onChange={(event) => setAccountHolder(event.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
            placeholder="ex. Jean Dupont"
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bank-iban" className="text-sm font-medium text-black">
            IBAN
          </label>
          <input
            id="bank-iban"
            type="text"
            value={iban}
            disabled={isSaving}
            onChange={(event) => handleIbanChange(event.target.value)}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition-colors focus:border-black/25 disabled:opacity-60"
            placeholder="FR76 3000 6000 0112 3456 7890 189"
            autoCapitalize="characters"
            autoComplete="off"
          />
          {ibanError ? (
            <p className="text-sm text-red-600">{ibanError}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </SettingsPanelCard>
    </form>
  );
}
