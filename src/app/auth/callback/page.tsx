import AuthCallbackClient from "@/components/auth/AuthCallbackClient";
import { Suspense } from "react";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
          <p className="text-sm text-black/70">Connexion en cours...</p>
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
