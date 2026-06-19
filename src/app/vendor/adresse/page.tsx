import { PRO_SETTINGS_ADDRESS_URL } from "@/lib/settings-url";
import { redirect } from "next/navigation";

export default function VendorAddressRedirectPage() {
  redirect(PRO_SETTINGS_ADDRESS_URL);
}
