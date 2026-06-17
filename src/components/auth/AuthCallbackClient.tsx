"use client";

import { useAuth } from "@/contexts/AuthContext";
import { parseAuthRedirectUrl, sanitizeRedirect } from "@/lib/auth-url";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const redirect = sanitizeRedirect(searchParams.get("redirect"));
    const token = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (!token) {
      const parsed = parseAuthRedirectUrl(window.location.href);
      if (parsed.error) {
        setError(parsed.error);
        return;
      }

      if (!parsed.token) {
        setError("Connexion Google impossible.");
        return;
      }

      loginWithToken(parsed.token)
        .then(() => router.replace(redirect ?? "/"))
        .catch(() => setError("Connexion Google impossible."));
      return;
    }

    loginWithToken(token)
      .then(() => router.replace(redirect ?? "/"))
      .catch(() => setError("Connexion Google impossible."));
  }, [loginWithToken, router, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5">
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <p className="text-sm text-black/70">Connexion en cours...</p>
    </main>
  );
}
