import { SettingsPanelCard } from "@/components/settings/SettingsPanelParts";

interface SettingsPlaceholderPanelProps {
  title: string;
  description?: string;
}

export function SettingsPlaceholderPanel({
  title,
  description = "Cette section sera bientôt disponible.",
}: SettingsPlaceholderPanelProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold text-black">{title}</h1>

      <SettingsPanelCard>
        <p className="text-sm text-black/60">{description}</p>
        <span className="mt-4 inline-flex rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/50">
          Bientôt
        </span>
      </SettingsPanelCard>
    </div>
  );
}
