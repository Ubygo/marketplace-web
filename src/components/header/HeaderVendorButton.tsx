"use client";

import { useVendor } from "@/contexts/VendorContext";
import { useIsProMode } from "@/hooks/useIsProMode";
import Link from "next/link";

interface HeaderVendorButtonProps {
  primaryColor: string;
}

export default function HeaderVendorButton({
  primaryColor,
}: HeaderVendorButtonProps) {
  const { hasVendor, isLoading } = useVendor();
  const isProMode = useIsProMode();

  if (isLoading || !hasVendor) {
    return null;
  }

  if (isProMode) {
    return (
      <Link
        href="/"
        className="hidden shrink-0 items-center rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-neutral-50 md:inline-flex"
      >
        Quitter l&apos;espace pro
      </Link>
    );
  }

  return (
    <Link
      href="/pro"
      className="hidden shrink-0 items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
      style={{ backgroundColor: primaryColor }}
    >
      Espace pro
    </Link>
  );
}
