import { PRO_SETTINGS_AVAILABILITIES_URL } from "@/lib/settings-url";
import { redirect } from "next/navigation";

export default function ProDisponibilitesRedirectPage() {
  redirect(PRO_SETTINGS_AVAILABILITIES_URL);
}
