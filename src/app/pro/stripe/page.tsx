import { PRO_SETTINGS_PAYOUT_URL } from "@/lib/settings-url";
import { redirect } from "next/navigation";

export default function ProStripePage() {
  redirect(PRO_SETTINGS_PAYOUT_URL);
}
