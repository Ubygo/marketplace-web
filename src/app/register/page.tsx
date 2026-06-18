import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-10">
      <AuthCard title="Inscription">
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </AuthCard>
    </main>
  );
}
