"use client";

import { useAuth } from "@/contexts/AuthContext";
import { getUserInitials } from "@/lib/user-display";
import Link from "next/link";

interface HeaderAuthButtonProps {
  primaryColor: string;
}

export default function HeaderAuthButton({ primaryColor }: HeaderAuthButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && user) {
    return (
      <Link
        href="/parametres"
        aria-label="Paramètres du compte"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        {getUserInitials(user)}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
      style={{ backgroundColor: primaryColor }}
    >
      Connexion
    </Link>
  );
}
