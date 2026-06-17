"use client";

import AuthField from "@/components/auth/AuthField";
import AuthPasswordField from "@/components/auth/AuthPasswordField";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useAuth } from "@/contexts/AuthContext";
import { buildRegisterUrl, sanitizeRedirect } from "@/lib/auth-url";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const redirect = sanitizeRedirect(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      router.push(redirect ?? "/");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "La connexion a échoué.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthPasswordField
          label="Mot de passe"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-black/10" />
        <span className="text-sm text-black/60">ou</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <GoogleSignInButton redirect={redirect} />

      <p className="text-center text-sm text-black/70">
        Pas encore de compte ?{" "}
        <Link
          href={buildRegisterUrl(redirect)}
          className="font-semibold text-black underline-offset-2 hover:underline"
        >
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}
