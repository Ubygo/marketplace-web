"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import ContentContainer from "@/components/layout/ContentContainer";
import VendorProfileForm from "@/components/vendor/profile/VendorProfileForm";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useVendor } from "@/contexts/VendorContext";
import { buildLoginUrl } from "@/lib/auth-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface ProVendorProfilePageProps {
  backHref?: string;
  backLabel?: string;
}

export default function ProVendorProfilePage({
  backHref = "/pro",
  backLabel = "Retour au tableau de bord",
}: ProVendorProfilePageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro/profil"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace("/");
    }
  }, [hasVendor, isAuthenticated, isAuthLoading, isVendorLoading, router]);

  if (isAuthLoading || isVendorLoading || !isAuthenticated || !hasVendor) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black/60" />
      </main>
    );
  }

  return (
    <main>
      <ContentContainer className="flex flex-col gap-6 py-4 md:py-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
        >
          <CategoryIcon icon="Ionicons/arrow-back" size={18} color={TEXT_COLOR} />
          {backLabel}
        </Link>
        <VendorProfileForm />
      </ContentContainer>
    </main>
  );
}
