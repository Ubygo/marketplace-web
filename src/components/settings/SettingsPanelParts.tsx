import type { ReactNode } from "react";

interface SettingsInfoFieldProps {
  label: string;
  value: string;
  className?: string;
}

export default function SettingsInfoField({
  label,
  value,
  className,
}: SettingsInfoFieldProps) {
  return (
    <div className={className}>
      <p className="text-sm text-black/50">{label}</p>
      <p className="mt-1 text-base font-semibold text-black">{value || "—"}</p>
    </div>
  );
}

interface SettingsEditButtonProps {
  label?: string;
  disabled?: boolean;
}

export function SettingsEditButton({
  label = "Modifier",
  disabled = true,
}: SettingsEditButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        backgroundColor: "color-mix(in srgb, var(--tenant-primary) 12%, white)",
        color: "var(--tenant-primary)",
      }}
    >
      <span aria-hidden className="text-base leading-none">
        ✎
      </span>
      {label}
    </button>
  );
}

interface SettingsPanelCardProps {
  children: ReactNode;
  className?: string;
}

export function SettingsPanelCard({
  children,
  className = "",
}: SettingsPanelCardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-6 ring-1 ring-black/5 ${className}`}
    >
      {children}
    </div>
  );
}
