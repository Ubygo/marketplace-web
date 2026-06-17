import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
      <h2 className="border-b border-black/5 px-4 py-3 text-sm font-bold text-black">
        {title}
      </h2>
      <div className="divide-y divide-black/5">{children}</div>
    </section>
  );
}
