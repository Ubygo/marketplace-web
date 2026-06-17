"use client";

import SettingsInfoField, {
  SettingsEditButton,
  SettingsPanelCard,
} from "@/components/settings/SettingsPanelParts";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFullName } from "@/lib/user-display";
import Image from "next/image";

export default function SettingsPersonalInfoCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const fullName = getUserFullName(user);

  return (
    <SettingsPanelCard>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-black">Informations personnelles</h2>
        <SettingsEditButton />
      </div>

      <div className="mb-8 flex justify-center sm:justify-start">
        {user.photoUrl ? (
          <Image
            src={user.photoUrl}
            alt={fullName}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black/5 text-3xl font-bold text-black/40">
            {fullName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SettingsInfoField label="Prénom" value={user.firstName ?? ""} />
        <SettingsInfoField label="Nom" value={user.lastName ?? ""} />
        <SettingsInfoField label="Adresse e-mail" value={user.email} />
        <SettingsInfoField label="Téléphone" value={user.phone ?? ""} />
      </div>
    </SettingsPanelCard>
  );
}
