import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";
import { getTenantAppConfig } from "@/lib/get-tenant-app-config";
import { privatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getTenantAppConfig();
  return privatePageMetadata("Inscription", config);
}

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
