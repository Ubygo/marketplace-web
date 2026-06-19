import { PRO_SETTINGS_ADDRESS_URL } from "@/lib/settings-url";
import { redirect } from "next/navigation";

export default function ProAddressPage() {
  redirect(PRO_SETTINGS_ADDRESS_URL);
}
