"use client";

import AppFooter from "@/components/layout/AppFooter";
import AppHeader from "@/components/header/AppHeader";
import ContentContainer from "@/components/layout/ContentContainer";
import SearchResults from "@/components/search/SearchResults";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { TenantProvider } from "@/contexts/TenantContext";
import type { TenantBranding } from "@/lib/app-config";
import type { ReactNode } from "react";

interface TenantShellProps {
  tenantId: string;
  slug: string;
  branding: TenantBranding;
  name: string;
  privacyPolicyUrl?: string | null;
  cgvUrl?: string | null;
  supportEmail?: string | null;
  children: ReactNode;
}

function SearchAwareContent({ children }: { children: ReactNode }) {
  const { hasActiveSearch } = useSearch();

  if (hasActiveSearch) {
    return <SearchResults />;
  }

  return children;
}

export default function TenantShell({
  tenantId,
  slug,
  branding,
  name,
  privacyPolicyUrl,
  cgvUrl,
  supportEmail,
  children,
}: TenantShellProps) {
  return (
    <TenantProvider
      tenantId={tenantId}
      slug={slug}
      privacyPolicyUrl={privacyPolicyUrl}
      cgvUrl={cgvUrl}
      supportEmail={supportEmail}
    >
      <AuthProvider tenantId={tenantId} slug={slug}>
        <SearchProvider tenantId={tenantId}>
          <AppHeader branding={branding} name={name} />
          <ContentContainer className="flex min-h-full flex-1 flex-col">
            <SearchAwareContent>{children}</SearchAwareContent>
          </ContentContainer>
          <AppFooter branding={branding} name={name} />
        </SearchProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
