"use client";

import CategoryIcon from "@/components/categories/CategoryIcon";
import { TEXT_COLOR } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useVendor } from "@/contexts/VendorContext";
import { buildLoginUrl } from "@/lib/auth-url";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface VendorPlaceholderPageProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function VendorPlaceholderPage({
  title,
  description,
  children,
}: VendorPlaceholderPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasVendor, isLoading: isVendorLoading } = useVendor();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(buildLoginUrl("/pro"));
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isVendorLoading && !hasVendor) {
      router.replace("/");
    }
  }, [hasVendor, isAuthenticated, isAuthLoading, isVendorLoading, router]);

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

      <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-8">
        <h1 className="text-2xl font-bold text-black">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-black/60">
          {description}
        </p>
        <div className="mt-6 rounded-xl border border-dashed border-black/15 bg-neutral-50 p-5 text-sm text-black/70">
          Cette section sera bientôt disponible sur le web. En attendant, vous
          pouvez la compléter depuis l&apos;application mobile.
        </div>
        {children}
      </div>
    </main>
  );
}
