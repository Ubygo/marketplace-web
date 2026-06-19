"use client";

import HeaderAuthButton from "@/components/header/HeaderAuthButton";
import HeaderUserMenu from "@/components/header/HeaderUserMenu";
import HeaderVendorButton from "@/components/header/HeaderVendorButton";
import {
  HeaderSearchDesktop,
  HeaderSearchMobileButton,
  HeaderSearchMobilePanel,
  MobileSearchProvider,
} from "@/components/header/HeaderSearch";
import ContentContainer from "@/components/layout/ContentContainer";
import { useAuth } from "@/contexts/AuthContext";
import type { TenantBranding } from "@/lib/app-config";
import { useIsProMode } from "@/hooks/useIsProMode";
import Image from "next/image";
import Link from "next/link";

interface AppHeaderProps {
  branding: TenantBranding;
  name: string;
}

export default function AppHeader({ branding, name }: AppHeaderProps) {
  const { isAuthenticated } = useAuth();
  const isProMode = useIsProMode();
  const displayName = branding.displayName || name;
  const { logoUrl, primaryColor } = branding;

  return (
    <MobileSearchProvider>
      <header className="py-3 md:py-4">
        <ContentContainer className="flex items-center justify-between gap-3">
          <Link
            href={isProMode ? "/pro" : "/"}
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
            {!isProMode ? (
              <>
                <HeaderSearchDesktop />
                <HeaderSearchMobileButton />
              </>
            ) : null}

            {isAuthenticated ? (
              <>
                <HeaderVendorButton primaryColor={primaryColor} />
                <HeaderUserMenu primaryColor={primaryColor} />
              </>
            ) : (
              <>
                <HeaderAuthButton primaryColor={primaryColor} />
                <HeaderUserMenu primaryColor={primaryColor} />
              </>
            )}
          </div>
        </ContentContainer>

        {!isProMode ? <HeaderSearchMobilePanel /> : null}
      </header>
    </MobileSearchProvider>
  );
}
