"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useVendor } from "@/contexts/VendorContext";
import { useTenantVendorMode } from "@/hooks/useTenantVendorMode";
import { buildLoginUrl } from "@/lib/auth-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface VendorProPageShellProps {
  children: ReactNode;
}

export default function VendorProPageShell({ children }: VendorProPageShellProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();
  const { isPublicVendorSignup } = useTenantVendorMode();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace(
        isPublicVendorSignup ? "/devenir-prestataire" : "/",
      );
    }
  }, [
    hasVendor,
    isAuthenticated,
    isAuthLoading,
    isPublicVendorSignup,
    isVendorLoading,
    router,
  ]);

  if (isAuthLoading || isVendorLoading || !isAuthenticated || !hasVendor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl py-4">
      <Link
        href="/pro"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
      >
        <CategoryIcon icon="Ionicons/arrow-back" size={18} color={TEXT_COLOR} />
        Retour à l&apos;espace pro
      </Link>
      {children}
    </main>
  );
}
