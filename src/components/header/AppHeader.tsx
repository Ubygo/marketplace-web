"use client";

import HeaderDrawer, { type HeaderNavItem } from "@/components/header/HeaderDrawer";
import HeaderAuthButton from "@/components/header/HeaderAuthButton";
import {
  HeaderSearchDesktop,
  HeaderSearchMobileButton,
  HeaderSearchMobilePanel,
  MobileSearchProvider,
} from "@/components/header/HeaderSearch";
import CategoryIcon from "@/components/categories/CategoryIcon";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import { TEXT_COLOR } from "@/constants/theme";
import type { TenantBranding } from "@/lib/app-config";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface AppHeaderProps {
  branding: TenantBranding;
  name: string;
}

export default function AppHeader({ branding, name }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const displayName = branding.displayName || name;
  const { logoUrl, primaryColor } = branding;

  const drawerItems = useMemo<HeaderNavItem[]>(() => {
    if (isLoading) {
      return [];
    }

    if (isAuthenticated) {
      return [{ href: "/parametres", label: "Paramètres", mobileOnly: true }];
    }

    return [{ href: "/login", label: "Connexion", mobileOnly: true }];
  }, [isAuthenticated, isLoading]);

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
    <MobileSearchProvider>
      <header className="py-3 md:py-4">
        <ContentContainer className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-80 md:gap-3"
          >
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
          </Link>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:gap-3">
            <HeaderSearchDesktop />

            <HeaderAuthButton primaryColor={primaryColor} />
            <HeaderSearchMobileButton />

            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white md:hidden"
            >
              <CategoryIcon icon="Ionicons/menu" size={22} color={TEXT_COLOR} />
            </button>
          </div>
        </ContentContainer>

        <HeaderSearchMobilePanel />

        <HeaderDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          primaryColor={primaryColor}
          items={drawerItems}
        />
      </header>
    </MobileSearchProvider>
  );
}
