"use client";

import HeaderDrawer from "@/components/header/HeaderDrawer";
import CategoryIcon from "@/components/categories/CategoryIcon";
import ContentContainer from "@/components/layout/ContentContainer";
import { TEXT_COLOR } from "@/constants/theme";
import type { TenantBranding } from "@/lib/app-config";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  branding: TenantBranding;
  name: string;
}

export default function AppHeader({ branding, name }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = branding.displayName || name;
  const { logoUrl, primaryColor } = branding;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function handleChange() {
      if (mediaQuery.matches) {
        setMenuOpen(false);
      }
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <header className="py-3 md:py-4">
      <ContentContainer className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={displayName}
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 rounded-xl object-cover md:h-12 md:w-12"
            />
          ) : null}
          <span className="truncate text-base font-bold text-black md:text-lg">
            {displayName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:inline-flex"
            style={{ backgroundColor: primaryColor }}
          >
            Connexion
          </Link>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white md:hidden"
          >
            <CategoryIcon icon="Ionicons/menu" size={22} color={TEXT_COLOR} />
          </button>
        </div>
      </ContentContainer>

      <HeaderDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        primaryColor={primaryColor}
      />
    </header>
  );
}
