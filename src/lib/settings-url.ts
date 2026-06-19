import type { SettingsSectionId } from "@/components/settings/SettingsSidebar";

const VALID_SETTINGS_SECTIONS = new Set<SettingsSectionId>([
  "profile",
  "password",
  "vendor-profile",
  "vendor-availabilities",
  "vendor-address",
  "vendor-payout",
  "vendor-reviews",
  "vendor-visibility",
]);

export function isSettingsSectionId(value: string): value is SettingsSectionId {
  return VALID_SETTINGS_SECTIONS.has(value as SettingsSectionId);
}

export function getProSettingsUrl(section?: SettingsSectionId): string {
  if (!section || section === "profile") {
    return "/pro/parametres";
  }

  return `/pro/parametres?section=${section}`;
}

export const PRO_SETTINGS_PAYOUT_URL = getProSettingsUrl("vendor-payout");
export const PRO_SETTINGS_ADDRESS_URL = getProSettingsUrl("vendor-address");
export const PRO_SETTINGS_AVAILABILITIES_URL = getProSettingsUrl(
  "vendor-availabilities",
);
