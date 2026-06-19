import SettingsPage from "@/components/settings/SettingsPage";
import { Suspense } from "react";

export default function ProParametresPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
