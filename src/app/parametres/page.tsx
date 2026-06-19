import SettingsPage from "@/components/settings/SettingsPage";
import { Suspense } from "react";

export default function ParametresPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPage />
    </Suspense>
  );
}
