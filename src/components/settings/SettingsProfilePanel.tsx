"use client";

import SettingsPersonalInfoCard from "@/components/settings/SettingsPersonalInfoCard";

export default function SettingsProfilePanel() {
  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="text-3xl font-bold text-black">Mon profil</h1>
      <SettingsPersonalInfoCard />
    </div>
  );
}
