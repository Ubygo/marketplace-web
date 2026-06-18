import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <AuthCard title="Connexion">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </main>
  );
}
