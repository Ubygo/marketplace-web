import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";
import Link from "next/link";

interface SettingsVendorLinkPanelProps {
  title: string;
  description: string;
  href: string;
  linkLabel?: string;
}

export default function SettingsVendorLinkPanel({
  title,
  description,
  href,
  linkLabel = "Configurer",
}: SettingsVendorLinkPanelProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold text-black">{title}</h1>

      <SettingsPanelCard>
        <p className="text-sm leading-relaxed text-black/60">{description}</p>
        <p className="mt-4 text-sm text-black/60">
          Cette section sera bientôt disponible directement ici. En attendant,
          vous pouvez la compléter depuis la page dédiée ou l&apos;application
          mobile.
        </p>
        <Link
          href={href}
          className="mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          {linkLabel}
        </Link>
      </SettingsPanelCard>
    </div>
  );
}
